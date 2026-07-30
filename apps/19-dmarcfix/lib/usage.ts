import { product } from "./product.ts";
import { dbAvailable, query, queryOne } from "./db.ts";
import { planByCode, type Plan } from "./plans.ts";

/**
 * Metering and quota enforcement.
 *
 * Quota windows are calendar months (date_trunc('month')) rather than rolling
 * 30-day windows. Calendar months are what customers expect from a monthly plan
 * and what an invoice line matches, and they make the query indexable.
 *
 * Anonymous traffic is metered by IP against a small daily allowance. That is
 * what keeps the no-signup demo genuinely usable on launch day without leaving
 * the endpoint open to being farmed.
 */

export const ANON_DAILY_LIMIT = Number(process.env.ANON_DAILY_LIMIT ?? 15);

export type Caller =
  | { kind: "api-key"; userId: string; apiKeyId: string; plan: Plan; subscriptionStatus: string }
  | { kind: "session"; userId: string; plan: Plan; subscriptionStatus: string }
  | { kind: "anonymous"; ip: string };

export type QuotaVerdict =
  | { allowed: true; used: number; limit: number; remaining: number }
  | { allowed: false; status: number; error: string; used: number; limit: number };

export async function monthlyUsage(userId: string): Promise<number> {
  const row = await queryOne<{ total: string }>(
    `SELECT COALESCE(SUM(units), 0)::text AS total
       FROM usage_events
      WHERE user_id = $1 AND product = $2
        AND created_at >= date_trunc('month', now())`,
    [userId, product.slug],
  );
  return Number(row?.total ?? 0);
}

export async function dailyAnonUsage(ip: string): Promise<number> {
  const row = await queryOne<{ total: string }>(
    `SELECT COALESCE(SUM(units), 0)::text AS total
       FROM usage_events
      WHERE user_id IS NULL AND product = $1 AND ip = $2
        AND created_at >= date_trunc('day', now())`,
    [product.slug, ip],
  );
  return Number(row?.total ?? 0);
}

/**
 * Checked before the engine runs, so a request that will be refused never costs
 * compute. Without a database this always allows — demo mode falls back to the
 * in-memory rate limiter in api.ts.
 */
export async function checkQuota(caller: Caller): Promise<QuotaVerdict> {
  if (!dbAvailable()) {
    return { allowed: true, used: 0, limit: Number.POSITIVE_INFINITY, remaining: Number.POSITIVE_INFINITY };
  }

  if (caller.kind === "anonymous") {
    const used = await dailyAnonUsage(caller.ip);
    if (used >= ANON_DAILY_LIMIT) {
      return {
        allowed: false,
        status: 429,
        used,
        limit: ANON_DAILY_LIMIT,
        error: `The anonymous demo allows ${ANON_DAILY_LIMIT} runs per day. Create a free account to continue — it takes about twenty seconds and raises the limit immediately.`,
      };
    }
    return { allowed: true, used, limit: ANON_DAILY_LIMIT, remaining: ANON_DAILY_LIMIT - used };
  }

  if (caller.subscriptionStatus === "past_due") {
    return {
      allowed: false,
      status: 402,
      used: 0,
      limit: 0,
      error: "The last payment on this subscription failed. Update the payment method from your dashboard to resume access.",
    };
  }

  const plan = caller.plan;
  if (caller.kind === "api-key" && !plan.apiAccess) {
    return {
      allowed: false,
      status: 402,
      used: 0,
      limit: plan.monthlyRuns,
      error: `API access is not included in the ${plan.name} plan. Upgrade to use API keys and the MCP server.`,
    };
  }

  const used = await monthlyUsage(caller.userId);
  if (used >= plan.monthlyRuns) {
    return {
      allowed: false,
      status: 402,
      used,
      limit: plan.monthlyRuns,
      error: `Monthly quota reached — ${used} of ${plan.monthlyRuns} runs used on the ${plan.name} plan. Upgrade from your dashboard, or wait for the quota to reset at the start of next month.`,
    };
  }

  return { allowed: true, used, limit: plan.monthlyRuns, remaining: plan.monthlyRuns - used };
}

/**
 * Recorded after the engine runs. Never allowed to fail the request — losing a
 * usage row is a billing inconvenience, refusing a paid customer's request
 * because the metering insert failed is an outage.
 */
export async function recordUsage(
  caller: Caller,
  detail: { endpoint?: string; status: number; durationMs: number; units?: number },
): Promise<void> {
  if (!dbAvailable()) return;
  try {
    await query(
      `INSERT INTO usage_events (user_id, api_key_id, product, endpoint, units, status, duration_ms, ip)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        caller.kind === "anonymous" ? null : caller.userId,
        caller.kind === "api-key" ? caller.apiKeyId : null,
        product.slug,
        detail.endpoint ?? "/api/v1/run",
        detail.units ?? 1,
        detail.status,
        detail.durationMs,
        caller.kind === "anonymous" ? caller.ip : null,
      ],
    );
  } catch (err) {
    console.error(
      JSON.stringify({ level: "error", scope: "usage.record", message: err instanceof Error ? err.message : "unknown" }),
    );
  }
}

export type UsageSummary = {
  used: number;
  limit: number;
  remaining: number;
  percent: number;
  plan: Plan;
  periodEnd: string;
  byDay: { day: string; units: number }[];
  recent: { endpoint: string; status: number; duration_ms: number | null; created_at: Date }[];
};

/** Everything the dashboard needs, in three queries. */
export async function usageSummary(userId: string, planCode: string): Promise<UsageSummary> {
  const plan = planByCode(planCode);
  const used = await monthlyUsage(userId);

  const byDay = await query<{ day: string; units: string }>(
    `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, SUM(units)::text AS units
       FROM usage_events
      WHERE user_id = $1 AND product = $2 AND created_at >= date_trunc('month', now())
      GROUP BY 1 ORDER BY 1`,
    [userId, product.slug],
  );

  const recent = await query<{ endpoint: string; status: number; duration_ms: number | null; created_at: Date }>(
    `SELECT endpoint, status, duration_ms, created_at
       FROM usage_events
      WHERE user_id = $1 AND product = $2
      ORDER BY created_at DESC LIMIT 10`,
    [userId, product.slug],
  );

  const now = new Date();
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  return {
    used,
    limit: plan.monthlyRuns,
    remaining: Math.max(0, plan.monthlyRuns - used),
    percent: Number.isFinite(plan.monthlyRuns) ? Math.min(100, Math.round((used / plan.monthlyRuns) * 100)) : 0,
    plan,
    periodEnd: periodEnd.toISOString().slice(0, 10),
    byDay: byDay.map((d) => ({ day: d.day, units: Number(d.units) })),
    recent,
  };
}
