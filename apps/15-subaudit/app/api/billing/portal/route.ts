import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { getSubscription, stripePortalUrl } from "@/lib/payments";
import { originOf } from "@/lib/http";
import { instrument } from "@/lib/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RAZORPAY_PORTAL = "https://dashboard.razorpay.com/app/subscriptions";

/**
 * Where a customer goes to change or cancel their plan.
 *
 * Stripe has a hosted billing portal, so we mint a session for it. Razorpay has
 * no equivalent customer-facing portal, so we return `manageBy: "support"` and a
 * mailto — being explicit that cancellation goes through support is far better
 * than a dead button.
 */
export async function POST(req: Request) {
  return instrument("/api/billing/portal", async () => {
    const user = await currentUser();
    if (!user) return NextResponse.json({ ok: false, error: "Sign in first." }, { status: 401 });

    const sub = await getSubscription(user.id);
    if (!sub || sub.plan_code === "free") {
      return NextResponse.json(
        { ok: false, error: "There is no paid subscription on this account yet." },
        { status: 400 },
      );
    }

    if (sub.provider === "stripe" && sub.provider_customer_id) {
      const url = await stripePortalUrl(sub.provider_customer_id, originOf(req));
      if (url) return NextResponse.json({ ok: true, data: { url, manageBy: "portal" } });
    }

    const supportEmail = process.env.SUPPORT_EMAIL?.trim() || "support@abetworks.in";
    return NextResponse.json({
      ok: true,
      data: {
        manageBy: "support",
        url: sub.provider === "razorpay" ? RAZORPAY_PORTAL : null,
        supportEmail,
        mailto: `mailto:${supportEmail}?subject=${encodeURIComponent(`Subscription change (${user.email})`)}`,
        note: "Reply to the confirmation email or write to support and we will change or cancel the plan the same day.",
      },
    });
  });
}
