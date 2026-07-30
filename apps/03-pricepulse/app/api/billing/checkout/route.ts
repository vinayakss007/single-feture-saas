import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { createCheckout, type Provider } from "@/lib/payments";
import { PLANS, type PlanCode } from "@/lib/plans";
import { originOf } from "@/lib/http";
import { instrument, log } from "@/lib/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_PLANS: PlanCode[] = ["pro", "enterprise"];
const VALID_PROVIDERS: Provider[] = ["razorpay", "stripe"];

/**
 * Starts a checkout and returns a URL for the browser to visit.
 *
 * Returning a URL rather than a 302 keeps the caller in control: the dashboard
 * can show an error inline instead of navigating away to a broken page, and the
 * same endpoint is usable from a mobile client later.
 */
export async function POST(req: Request) {
  return instrument("/api/billing/checkout", async () => {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Sign in before starting a checkout." },
        { status: 401 },
      );
    }

    let body: { plan?: string; provider?: string } = {};
    try {
      body = (await req.json()) as typeof body;
    } catch {
      /* defaults are fine */
    }

    const planCode = (body.plan ?? "pro").toLowerCase() as PlanCode;
    if (!VALID_PLANS.includes(planCode)) {
      return NextResponse.json(
        { ok: false, error: `Plan must be one of ${VALID_PLANS.join(", ")}.` },
        { status: 400 },
      );
    }

    const provider = body.provider?.toLowerCase() as Provider | undefined;
    if (provider && !VALID_PROVIDERS.includes(provider)) {
      return NextResponse.json(
        { ok: false, error: `Provider must be one of ${VALID_PROVIDERS.join(", ")}.` },
        { status: 400 },
      );
    }

    const result = await createCheckout({
      userId: user.id,
      email: user.email,
      planCode,
      provider,
      origin: originOf(req),
    });

    if (!result.ok) {
      log("warn", "checkout", "could not start checkout", { userId: user.id, planCode, error: result.error });
      return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
    }

    log("info", "checkout", "checkout started", { userId: user.id, planCode, provider: result.provider });
    return NextResponse.json({
      ok: true,
      data: { url: result.url, provider: result.provider, plan: PLANS[planCode].name },
    });
  });
}
