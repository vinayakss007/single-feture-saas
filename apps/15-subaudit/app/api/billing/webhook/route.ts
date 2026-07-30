import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { dbAvailable, migrate, queryOne } from "@/lib/db";
import {
  handleRazorpayEvent,
  handleStripeEvent,
  markWebhookProcessed,
  recordWebhookOnce,
  verifyRazorpaySignature,
  verifyStripeSignature,
  type Provider,
} from "@/lib/payments";
import { sendPaymentFailed } from "@/lib/email";
import { originOf } from "@/lib/http";
import { alert, log } from "@/lib/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The single webhook endpoint for both providers.
 *
 * Rules this endpoint follows, in order, because getting them wrong is how people
 * end up giving away paid plans:
 *
 *  1. Read the *raw* body. Both providers sign the exact bytes, so parsing before
 *     verifying makes the signature unverifiable.
 *  2. Verify the signature before looking at the contents at all.
 *  3. Insert the event id first and stop if it already exists. Providers retry,
 *     and a retry that re-applies a plan change is a real bug.
 *  4. Always answer 200 once the signature is valid, even for events we ignore.
 *     A 500 on an event we do not care about makes the provider retry forever and
 *     eventually disable the endpoint.
 *
 * Note there is no `instrument()` wrapper here: that helper converts a thrown
 * error into a 500, and a 500 is precisely the wrong answer to give a provider.
 */
function detectProvider(req: Request): { provider: Provider; signature: string | null } | null {
  const razorpay = req.headers.get("x-razorpay-signature");
  if (razorpay) return { provider: "razorpay", signature: razorpay };
  const stripe = req.headers.get("stripe-signature");
  if (stripe) return { provider: "stripe", signature: stripe };
  return null;
}

/** Razorpay does not always send an event id, so derive a stable one. */
function razorpayEventId(req: Request, rawBody: string): string {
  const header = req.headers.get("x-razorpay-event-id");
  if (header) return header;
  return `body:${createHash("sha256").update(rawBody).digest("hex").slice(0, 32)}`;
}

export async function POST(req: Request) {
  const detected = detectProvider(req);
  if (!detected) {
    return NextResponse.json(
      { ok: false, error: "Missing X-Razorpay-Signature or Stripe-Signature header." },
      { status: 400 },
    );
  }
  const { provider, signature } = detected;

  const rawBody = await req.text();

  const valid =
    provider === "razorpay"
      ? verifyRazorpaySignature(rawBody, signature)
      : verifyStripeSignature(rawBody, signature);

  if (!valid) {
    log("warn", "webhook", "signature rejected", { provider });
    // 400, not 401: the provider should not retry a body it signed wrongly, and a
    // 401 invites a caller to go looking for credentials.
    return NextResponse.json({ ok: false, error: "Invalid signature." }, { status: 400 });
  }

  if (!dbAvailable()) {
    // Signature was good, so acknowledge — but this is a misconfiguration worth
    // shouting about, because payments are succeeding and not being recorded.
    await alert(
      "webhook:no-db",
      "Billing webhook received with no DATABASE_URL",
      `A verified ${provider} webhook arrived but this deployment has no database, so the subscription was not recorded.`,
    );
    return NextResponse.json({ ok: true, data: { stored: false, reason: "no database configured" } });
  }

  await migrate();

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Body is not valid JSON." }, { status: 400 });
  }

  const eventId = provider === "stripe" ? String(event.id ?? "") : razorpayEventId(req, rawBody);
  const eventType = String((provider === "stripe" ? event.type : event.event) ?? "unknown");

  if (!eventId) {
    return NextResponse.json({ ok: false, error: "Event has no id." }, { status: 400 });
  }

  const first = await recordWebhookOnce(provider, eventId, eventType, event);
  if (!first) {
    log("info", "webhook", "duplicate ignored", { provider, eventId, eventType });
    return NextResponse.json({ ok: true, data: { duplicate: true, eventId } });
  }

  try {
    const outcome =
      provider === "razorpay"
        ? await handleRazorpayEvent(event as Parameters<typeof handleRazorpayEvent>[0])
        : await handleStripeEvent(event as Parameters<typeof handleStripeEvent>[0]);

    await markWebhookProcessed(provider, eventId, outcome.handled ? undefined : outcome.detail);
    log(outcome.handled ? "info" : "warn", "webhook", outcome.detail, { provider, eventId, eventType });

    if (outcome.handled && /payment_failed|halted|past_due/i.test(`${eventType} ${outcome.detail}`)) {
      await notifyPaymentFailure(outcome.detail, originOf(req));
    }

    return NextResponse.json({ ok: true, data: { eventId, handled: outcome.handled, detail: outcome.detail } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    await markWebhookProcessed(provider, eventId, message);
    await alert(`webhook:${provider}`, `Failed to process ${provider} webhook`, `${eventType}: ${message}`);
    // Still 200. The event is stored with its error, so it can be replayed from
    // the webhook_events table rather than depending on provider retries.
    return NextResponse.json({ ok: true, data: { eventId, handled: false, error: message } });
  }
}

/** Best-effort dunning email. Never allowed to affect the webhook response. */
async function notifyPaymentFailure(detail: string, origin: string): Promise<void> {
  const userId = detail.match(/for ([0-9a-f-]{36})/i)?.[1];
  if (!userId) return;
  try {
    const row = await queryOne<{ email: string }>(`SELECT email FROM users WHERE id = $1`, [userId]);
    if (row) await sendPaymentFailed(row.email, origin);
  } catch {
    /* dunning mail is not worth failing a webhook over */
  }
}
