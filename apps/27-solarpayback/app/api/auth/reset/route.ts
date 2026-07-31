import { NextResponse } from "next/server";
import { consumePasswordReset, createPasswordReset } from "@/lib/auth";
import { dbAvailable } from "@/lib/db";
import { emailConfigured, sendPasswordReset } from "@/lib/email";
import { callerIp, rateLimit } from "@/lib/api";
import { originOf } from "@/lib/http";
import { instrument, log } from "@/lib/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One route, two steps.
 *
 * POST { email }            -> request a link
 * POST { token, password }  -> set the new password
 *
 * Requesting a link always answers the same way whether or not the address is
 * registered. Anything else turns this endpoint into a way to test which of your
 * customers' emails exist.
 */
export async function POST(req: Request) {
  return instrument("/api/auth/reset", async () => {
    if (!dbAvailable()) {
      return NextResponse.json(
        { ok: false, error: "Accounts are disabled — DATABASE_URL is not configured on this deployment." },
        { status: 503 },
      );
    }

    const ip = callerIp(req);
    const burst = rateLimit({ kind: "anonymous", ip }, 10, "reset");
    if (burst) return NextResponse.json({ ok: false, error: burst.error }, { status: 429 });

    let body: { email?: string; token?: string; password?: string };
    try {
      body = (await req.json()) as typeof body;
    } catch {
      return NextResponse.json({ ok: false, error: "Request body must be valid JSON." }, { status: 400 });
    }

    // Step two: consume a token.
    if (body.token) {
      const result = await consumePasswordReset(body.token, body.password ?? "");
      if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
      return NextResponse.json({
        ok: true,
        data: { passwordChanged: true, note: "All other sessions have been signed out." },
      });
    }

    // Step one: issue a token.
    if (!body.email) {
      return NextResponse.json({ ok: false, error: "Provide an email address." }, { status: 400 });
    }

    const issued = await createPasswordReset(body.email);
    if (issued) {
      const sent = await sendPasswordReset(body.email, issued.token, originOf(req));
      if (!sent.delivered) {
        log("warn", "reset", "reset link not delivered by email", {
          userId: issued.userId,
          emailConfigured: emailConfigured(),
        });
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        sent: true,
        note: "If that address has an account, a reset link is on its way. The link is valid for one hour.",
      },
    });
  });
}
