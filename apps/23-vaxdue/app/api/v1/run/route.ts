import {
  CORS_HEADERS,
  fail,
  ok,
  parseInput,
  quotaHeaders,
  rateLimit,
  rateLimitFor,
  resolveCaller,
} from "@/lib/api";
import { product } from "@/lib/product";
import { run } from "@/lib/engine";
import { ANON_DAILY_LIMIT, checkQuota, recordUsage } from "@/lib/usage";
import { PLANS, formatQuota } from "@/lib/plans";
import { countRun, instrument } from "@/lib/observability";
import { dbAvailable } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROUTE = "/api/v1/run";

/** Self-describing schema so agents and humans can discover how to call this. */
export async function GET() {
  return ok({
    product: product.name,
    slug: product.slug,
    description: product.oneLiner,
    method: "POST",
    path: ROUTE,
    auth: dbAvailable()
      ? "Authorization: Bearer sk_… (create keys in your dashboard). Without a key you get the anonymous allowance."
      : "Open — this deployment has no database, so it runs in demo mode.",
    limits: {
      anonymousPerDay: ANON_DAILY_LIMIT,
      plans: Object.values(PLANS).map((p) => ({
        plan: p.code,
        monthlyRuns: formatQuota(p.monthlyRuns),
        apiAccess: p.apiAccess,
        requestsPerMinute: p.rateLimitPerMin,
      })),
    },
    inputSchema: product.inputs.map((f) => ({
      name: f.name,
      type: f.type,
      required: Boolean(f.required),
      description: f.help ?? f.label,
      ...(f.options ? { options: f.options } : {}),
    })),
    example: product.sample,
    mcpTool: product.mcpTool,
  });
}

export async function POST(req: Request) {
  return instrument(ROUTE, async () => {
    const started = Date.now();

    const resolution = await resolveCaller(req);
    if (!resolution.ok) {
      countRun("unauthorised", Date.now() - started);
      return fail(resolution.failure);
    }
    const caller = resolution.caller;

    const burst = rateLimit(caller);
    if (burst) {
      countRun("quota", Date.now() - started);
      return fail(burst, { "Retry-After": "60", "X-RateLimit-Limit": String(rateLimitFor(caller)) });
    }

    // Quota is checked before the engine runs, so a refused request costs nothing.
    const quota = await checkQuota(caller);
    if (!quota.allowed) {
      countRun("quota", Date.now() - started);
      await recordUsage(caller, { endpoint: ROUTE, status: quota.status, durationMs: 0, units: 0 });
      return fail(
        { ok: false, status: quota.status, error: quota.error },
        quotaHeaders(quota.used, quota.limit),
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return fail({ ok: false, status: 400, error: "Request body must be valid JSON." });
    }

    const parsed = parseInput(body, product.inputs);
    if (!parsed.ok) return fail(parsed.failure);

    try {
      const result = await run(parsed.value);
      const durationMs = Date.now() - started;
      countRun("ok", durationMs);
      await recordUsage(caller, { endpoint: ROUTE, status: 200, durationMs });
      return ok(
        result,
        {
          product: product.slug,
          tookMs: durationMs,
          usage: {
            used: quota.used + 1,
            limit: Number.isFinite(quota.limit) ? quota.limit : null,
            plan: caller.kind === "anonymous" ? "anonymous" : caller.plan.code,
          },
        },
        quotaHeaders(quota.used + 1, quota.limit),
      );
    } catch (err) {
      const durationMs = Date.now() - started;
      countRun("failed", durationMs);
      // A bad input is billed as zero: the customer got nothing.
      await recordUsage(caller, { endpoint: ROUTE, status: 422, durationMs, units: 0 });
      return fail({
        ok: false,
        status: 422,
        error: err instanceof Error ? err.message : "Could not process this input.",
      });
    }
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
