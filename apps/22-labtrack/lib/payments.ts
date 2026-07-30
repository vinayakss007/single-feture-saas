import { createHmac, timingSafeEqual } from "node:crypto";
import { product } from "./product.ts";
import { query, queryOne } from "./db.ts";
import { PLANS, planByCode, razorpayPlanId, stripePriceId, type PlanCode } from "./plans.ts";

/**
 * Payments for Razorpay and Stripe, over their REST APIs.
 *
 * No SDKs. Both providers are a handful of form-encoded or JSON POSTs plus an
 * HMAC signature check, and an SDK in this path buys nothing while adding a
 * dependency that must be kept current in ten deployments.
 *
 * Razorpay is the default because the suite is priced for India and Razorpay
 * carries UPI. Stripe is used when configured, for international cards.
 */

export type Provider = "razorpay" | "stripe";

export type Subscription = {
  id: string;
  user_id: string;
  product: string;
  plan_code: string;
  status: string;
  provider: string | null;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
  current_period_end: Date | null;
  cancel_at_period_end: boolean;
};

// ---------------------------------------------------------------------------
// Provider availability
// ---------------------------------------------------------------------------

export function razorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function paymentsConfigured(): boolean {
  return razorpayConfigured() || stripeConfigured();
}

export function defaultProvider(): Provider | null {
  const forced = process.env.PAYMENT_PROVIDER?.trim().toLowerCase();
  if (forced === "razorpay" && razorpayConfigured()) return "razorpay";
  if (forced === "stripe" && stripeConfigured()) return "stripe";
  if (razorpayConfigured()) return "razorpay";
  if (stripeConfigured()) return "stripe";
  return null;
}

// ---------------------------------------------------------------------------
// Subscription state
// ---------------------------------------------------------------------------

export async function getSubscription(userId: string): Promise<Subscription | null> {
  return queryOne<Subscription>(
    `SELECT id, user_id, product, plan_code, status, provider, provider_customer_id,
            provider_subscription_id, current_period_end, cancel_at_period_end
       FROM subscriptions WHERE user_id = $1 AND product = $2`,
    [userId, product.slug],
  );
}

export async function upsertSubscription(input: {
  userId: string;
  planCode: string;
  status: string;
  provider?: Provider | null;
  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
}): Promise<void> {
  await query(
    `INSERT INTO subscriptions
       (user_id, product, plan_code, status, provider, provider_customer_id,
        provider_subscription_id, current_period_end, cancel_at_period_end)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (user_id, product) DO UPDATE SET
       plan_code                = EXCLUDED.plan_code,
       status                   = EXCLUDED.status,
       provider                 = COALESCE(EXCLUDED.provider, subscriptions.provider),
       provider_customer_id     = COALESCE(EXCLUDED.provider_customer_id, subscriptions.provider_customer_id),
       provider_subscription_id = COALESCE(EXCLUDED.provider_subscription_id, subscriptions.provider_subscription_id),
       current_period_end       = COALESCE(EXCLUDED.current_period_end, subscriptions.current_period_end),
       cancel_at_period_end     = EXCLUDED.cancel_at_period_end`,
    [
      input.userId,
      product.slug,
      input.planCode,
      input.status,
      input.provider ?? null,
      input.providerCustomerId ?? null,
      input.providerSubscriptionId ?? null,
      input.currentPeriodEnd ?? null,
      input.cancelAtPeriodEnd ?? false,
    ],
  );
}

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------

export type CheckoutResult = { ok: true; url: string; provider: Provider } | { ok: false; error: string; status: number };

export async function createCheckout(args: {
  userId: string;
  email: string;
  planCode: PlanCode;
  provider?: Provider;
  origin: string;
}): Promise<CheckoutResult> {
  const provider = args.provider ?? defaultProvider();
  if (!provider) {
    return {
      ok: false,
      status: 503,
      error:
        "Payments are not configured on this deployment. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET, or STRIPE_SECRET_KEY, plus the plan or price id for this product.",
    };
  }
  if (args.planCode === "free") return { ok: false, status: 400, error: "The free plan does not require checkout." };

  return provider === "razorpay" ? razorpayCheckout(args) : stripeCheckout(args);
}

// ---------------------------------------------------------------------------
// Razorpay
// ---------------------------------------------------------------------------

function razorpayAuth(): string {
  return Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
}

async function razorpayCheckout(args: {
  userId: string;
  email: string;
  planCode: PlanCode;
  origin: string;
}): Promise<CheckoutResult> {
  const planId = razorpayPlanId(args.planCode);
  if (!planId) {
    return {
      ok: false,
      status: 503,
      error: `Razorpay plan id missing. Create a plan in the Razorpay dashboard and set ${PLANS[args.planCode].razorpayPlanEnv}.`,
    };
  }

  try {
    const res = await fetch("https://api.razorpay.com/v1/subscriptions", {
      method: "POST",
      headers: { Authorization: `Basic ${razorpayAuth()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        plan_id: planId,
        // 12 monthly cycles, then Razorpay asks the customer to renew. Long
        // enough to be invisible, short enough to avoid indefinite mandates.
        total_count: 12,
        quantity: 1,
        customer_notify: 1,
        notes: { user_id: args.userId, product: product.slug, plan_code: args.planCode, email: args.email },
      }),
    });

    const body = (await res.json()) as { id?: string; short_url?: string; error?: { description?: string } };
    if (!res.ok || !body.short_url) {
      return {
        ok: false,
        status: 502,
        error: body.error?.description ?? `Razorpay rejected the subscription request (HTTP ${res.status}).`,
      };
    }

    // Recorded as incomplete now; the webhook promotes it once payment lands.
    await upsertSubscription({
      userId: args.userId,
      planCode: "free",
      status: "trialing",
      provider: "razorpay",
      providerSubscriptionId: body.id ?? null,
    });

    return { ok: true, url: body.short_url, provider: "razorpay" };
  } catch (err) {
    return { ok: false, status: 502, error: err instanceof Error ? err.message : "Razorpay request failed." };
  }
}

// ---------------------------------------------------------------------------
// Stripe
// ---------------------------------------------------------------------------

async function stripeCheckout(args: {
  userId: string;
  email: string;
  planCode: PlanCode;
  origin: string;
}): Promise<CheckoutResult> {
  const priceId = stripePriceId(args.planCode);
  if (!priceId) {
    return {
      ok: false,
      status: 503,
      error: `Stripe price id missing. Create a recurring price in Stripe and set ${PLANS[args.planCode].stripePriceEnv}.`,
    };
  }

  const form = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    customer_email: args.email,
    client_reference_id: args.userId,
    success_url: `${args.origin}/dashboard?checkout=success`,
    cancel_url: `${args.origin}/dashboard?checkout=cancelled`,
    "metadata[user_id]": args.userId,
    "metadata[product]": product.slug,
    "metadata[plan_code]": args.planCode,
    "subscription_data[metadata][user_id]": args.userId,
    "subscription_data[metadata][product]": product.slug,
    "subscription_data[metadata][plan_code]": args.planCode,
  });

  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });
    const body = (await res.json()) as { url?: string; id?: string; error?: { message?: string } };
    if (!res.ok || !body.url) {
      return { ok: false, status: 502, error: body.error?.message ?? `Stripe rejected the request (HTTP ${res.status}).` };
    }
    return { ok: true, url: body.url, provider: "stripe" };
  } catch (err) {
    return { ok: false, status: 502, error: err instanceof Error ? err.message : "Stripe request failed." };
  }
}

/** Stripe's hosted billing portal — cancellations and card updates, for free. */
export async function stripePortalUrl(customerId: string, origin: string): Promise<string | null> {
  if (!stripeConfigured()) return null;
  try {
    const res = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ customer: customerId, return_url: `${origin}/dashboard` }).toString(),
    });
    const body = (await res.json()) as { url?: string };
    return body.url ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Webhook signature verification
// ---------------------------------------------------------------------------

function safeEqualHex(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** Razorpay: HMAC-SHA256 of the raw body, hex, in X-Razorpay-Signature. */
export function verifyRazorpaySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}

/**
 * Stripe: Stripe-Signature carries t=<timestamp>,v1=<hmac>. The HMAC covers
 * "<timestamp>.<rawBody>". The timestamp is checked to stop replay of a captured
 * webhook.
 */
export function verifyStripeSignature(rawBody: string, header: string | null, toleranceSeconds = 300): boolean {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !header) return false;

  const parts = Object.fromEntries(
    header.split(",").map((kv) => {
      const [k, ...rest] = kv.split("=");
      return [k.trim(), rest.join("=").trim()];
    }),
  ) as Record<string, string>;

  const timestamp = Number(parts.t);
  const presented = parts.v1;
  if (!Number.isFinite(timestamp) || !presented) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  return safeEqualHex(expected, presented);
}

// ---------------------------------------------------------------------------
// Webhook handling
// ---------------------------------------------------------------------------

/**
 * Providers retry webhooks, and a retry that re-applies a plan change or
 * re-counts a payment is a real bug. Every event is inserted first; a duplicate
 * event_id conflicts and is skipped.
 */
export async function recordWebhookOnce(
  provider: Provider,
  eventId: string,
  eventType: string,
  payload: unknown,
): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `INSERT INTO webhook_events (provider, event_id, event_type, payload)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (provider, event_id) DO NOTHING
     RETURNING id`,
    [provider, eventId, eventType, JSON.stringify(payload)],
  );
  return rows.length > 0;
}

export async function markWebhookProcessed(provider: Provider, eventId: string, error?: string): Promise<void> {
  await query(
    `UPDATE webhook_events SET processed_at = now(), error = $3 WHERE provider = $1 AND event_id = $2`,
    [provider, eventId, error ?? null],
  );
}

function statusFromRazorpay(status: string): string {
  switch (status) {
    case "active":
    case "authenticated":
      return "active";
    case "pending":
    case "halted":
      return "past_due";
    case "paused":
      return "paused";
    case "cancelled":
    case "completed":
    case "expired":
      return "cancelled";
    default:
      return "active";
  }
}

function statusFromStripe(status: string): string {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
    case "unpaid":
    case "incomplete":
      return "past_due";
    case "paused":
      return "paused";
    case "canceled":
    case "incomplete_expired":
      return "cancelled";
    default:
      return "active";
  }
}

export type WebhookOutcome = { handled: boolean; detail: string };

export async function handleRazorpayEvent(event: {
  event?: string;
  payload?: { subscription?: { entity?: Record<string, unknown> } };
}): Promise<WebhookOutcome> {
  const entity = event.payload?.subscription?.entity;
  if (!entity) return { handled: false, detail: `No subscription entity on ${event.event}` };

  const notes = (entity.notes ?? {}) as Record<string, string>;
  const userId = notes.user_id;
  const planCode = notes.plan_code ?? "pro";
  if (!userId) return { handled: false, detail: "Subscription has no user_id in notes" };
  if (notes.product && notes.product !== product.slug) {
    return { handled: false, detail: `Event belongs to ${notes.product}, not ${product.slug}` };
  }

  const rawStatus = String(entity.status ?? "active");
  const status = statusFromRazorpay(rawStatus);
  const endUnix = Number(entity.current_end ?? entity.charge_at ?? 0);

  await upsertSubscription({
    userId,
    planCode: status === "cancelled" ? "free" : planCode,
    status,
    provider: "razorpay",
    providerSubscriptionId: String(entity.id ?? ""),
    providerCustomerId: entity.customer_id ? String(entity.customer_id) : null,
    currentPeriodEnd: endUnix > 0 ? new Date(endUnix * 1000) : null,
    cancelAtPeriodEnd: rawStatus === "cancelled",
  });

  return { handled: true, detail: `${event.event} → ${planCode}/${status} for ${userId}` };
}

export async function handleStripeEvent(event: {
  id?: string;
  type?: string;
  data?: { object?: Record<string, unknown> };
}): Promise<WebhookOutcome> {
  const obj = event.data?.object ?? {};
  const type = event.type ?? "";

  // Checkout completion carries client_reference_id; subscription lifecycle
  // events carry metadata copied via subscription_data.
  const metadata = (obj.metadata ?? {}) as Record<string, string>;
  const userId = metadata.user_id ?? (typeof obj.client_reference_id === "string" ? obj.client_reference_id : undefined);
  const planCode = metadata.plan_code ?? "pro";

  if (!userId) return { handled: false, detail: `No user_id resolvable from ${type}` };
  if (metadata.product && metadata.product !== product.slug) {
    return { handled: false, detail: `Event belongs to ${metadata.product}, not ${product.slug}` };
  }

  if (type === "checkout.session.completed") {
    await upsertSubscription({
      userId,
      planCode,
      status: "active",
      provider: "stripe",
      providerCustomerId: typeof obj.customer === "string" ? obj.customer : null,
      providerSubscriptionId: typeof obj.subscription === "string" ? obj.subscription : null,
    });
    return { handled: true, detail: `checkout complete → ${planCode} for ${userId}` };
  }

  if (type.startsWith("customer.subscription.")) {
    const rawStatus = String(obj.status ?? "active");
    const status = type === "customer.subscription.deleted" ? "cancelled" : statusFromStripe(rawStatus);
    const periodEnd = Number(obj.current_period_end ?? 0);

    await upsertSubscription({
      userId,
      planCode: status === "cancelled" ? "free" : planCode,
      status,
      provider: "stripe",
      providerCustomerId: typeof obj.customer === "string" ? obj.customer : null,
      providerSubscriptionId: typeof obj.id === "string" ? obj.id : null,
      currentPeriodEnd: periodEnd > 0 ? new Date(periodEnd * 1000) : null,
      cancelAtPeriodEnd: Boolean(obj.cancel_at_period_end),
    });
    return { handled: true, detail: `${type} → ${status} for ${userId}` };
  }

  if (type === "invoice.payment_failed") {
    await upsertSubscription({ userId, planCode, status: "past_due", provider: "stripe" });
    return { handled: true, detail: `payment failed → past_due for ${userId}` };
  }

  return { handled: false, detail: `Unhandled event type ${type}` };
}

/** Human-readable plan label for the dashboard. */
export function planLabel(sub: Subscription | null): string {
  const plan = planByCode(sub?.plan_code);
  if (!sub || sub.plan_code === "free") return `${plan.name} plan`;
  const suffix = sub.status === "active" ? "" : ` (${sub.status})`;
  return `${plan.name} plan${suffix}`;
}
