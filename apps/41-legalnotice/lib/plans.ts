import { product } from "./product.ts";
import type { PricingTier } from "./types.ts";

/**
 * Plans and entitlements.
 *
 * The source of truth for what a plan *costs* is `product.ts`, because that is
 * what the landing page renders — pricing that differs between the marketing
 * page and the paywall is the single most common billing bug. This file only
 * adds what the marketing page does not need: a stable code, a monthly quota,
 * and where to find the provider price id.
 *
 * Tier order in product.ts is always [free, paid, enterprise].
 */

export type PlanCode = "free" | "pro" | "enterprise";

export type Plan = {
  code: PlanCode;
  name: string;
  price: string;
  period: string;
  /** Monthly metered runs. Infinity means uncapped. */
  monthlyRuns: number;
  /** Can this plan use API keys and the MCP server at all. */
  apiAccess: boolean;
  /** Requests per minute against /api/v1/run. */
  rateLimitPerMin: number;
  features: string[];
  /** Env var holding the Stripe price id for this plan. */
  stripePriceEnv: string;
  /** Env var holding the Razorpay plan id for this plan. */
  razorpayPlanEnv: string;
};

const DEFAULTS: Record<PlanCode, Omit<Plan, "code" | "name" | "price" | "period" | "features" | "stripePriceEnv" | "razorpayPlanEnv">> = {
  free: { monthlyRuns: 25, apiAccess: false, rateLimitPerMin: 10 },
  pro: { monthlyRuns: 5_000, apiAccess: true, rateLimitPerMin: 120 },
  enterprise: { monthlyRuns: Number.POSITIVE_INFINITY, apiAccess: true, rateLimitPerMin: 600 },
};

const CODES: PlanCode[] = ["free", "pro", "enterprise"];

function envName(base: string, code: PlanCode): string {
  return `${base}_${product.slug.toUpperCase().replace(/-/g, "_")}_${code.toUpperCase()}`;
}

function buildPlan(tier: PricingTier | undefined, code: PlanCode, index: number): Plan {
  const fallbackNames: Record<PlanCode, string> = { free: "Free", pro: "Pro", enterprise: "Enterprise" };
  return {
    code,
    name: tier?.name ?? fallbackNames[code],
    price: tier?.price ?? (code === "free" ? "$0" : "Custom"),
    period: tier?.period ?? "",
    features: tier?.features ?? [],
    monthlyRuns: tier?.monthlyRuns ?? DEFAULTS[code].monthlyRuns,
    apiAccess: tier?.apiAccess ?? DEFAULTS[code].apiAccess,
    rateLimitPerMin: tier?.rateLimitPerMin ?? DEFAULTS[code].rateLimitPerMin,
    stripePriceEnv: envName("STRIPE_PRICE", code),
    razorpayPlanEnv: envName("RAZORPAY_PLAN", code),
  };
}

export const PLANS: Record<PlanCode, Plan> = {
  free: buildPlan(product.pricing[0], "free", 0),
  pro: buildPlan(product.pricing[1], "pro", 1),
  enterprise: buildPlan(product.pricing[2], "enterprise", 2),
};

export function planByCode(code: string | null | undefined): Plan {
  const normalised = (code ?? "free").toLowerCase();
  return CODES.includes(normalised as PlanCode) ? PLANS[normalised as PlanCode] : PLANS.free;
}

/** The paid plan a checkout button should target. */
export const UPGRADE_PLAN: Plan = PLANS.pro;

export function stripePriceId(code: PlanCode): string | null {
  return process.env[PLANS[code].stripePriceEnv]?.trim() || null;
}

export function razorpayPlanId(code: PlanCode): string | null {
  return process.env[PLANS[code].razorpayPlanEnv]?.trim() || null;
}

/** Which plans are actually purchasable given the configured env. */
export function purchasablePlans(): Plan[] {
  return CODES.filter((c) => c !== "free")
    .map((c) => PLANS[c])
    .filter((p) => Boolean(stripePriceId(p.code) || razorpayPlanId(p.code)));
}

export function formatQuota(n: number): string {
  return Number.isFinite(n) ? n.toLocaleString("en-US") : "Unlimited";
}
