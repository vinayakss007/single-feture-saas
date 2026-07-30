import { timingSafeEqual } from "node:crypto";
import { product } from "@/lib/product";
import { dbAvailable, queryOne } from "@/lib/db";
import { prometheus } from "@/lib/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Prometheus exposition endpoint. Grafana Cloud's free tier can scrape this
 * directly, which is why the format is text rather than JSON.
 *
 * In-process counters reset on every cold start, so anything that needs to
 * survive a restart is read from the database instead. Both are exported: the
 * counters give you latency and status codes, the database gives you truthful
 * business totals.
 */
function authorised(req: Request): boolean {
  const expected = process.env.METRICS_TOKEN?.trim();
  if (!expected) return true; // Unset means public metrics, which is fine for non-sensitive counters.

  const header = req.headers.get("authorization") ?? "";
  const presented = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  const a = Buffer.from(presented);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  if (!authorised(req)) {
    return new Response("unauthorised\n", { status: 401 });
  }

  const extra: Record<string, number> = {};

  if (dbAvailable()) {
    // Liveness is probed separately from the business query. Rolling them together
    // means a missing table — or one query the app role cannot read — reports the
    // whole database as down, which is the kind of false alarm that gets a
    // dashboard ignored.
    try {
      await queryOne(`SELECT 1 AS ok`);
      extra.database_up = 1;
    } catch {
      extra.database_up = 0;
    }

    try {
      const row = await queryOne<{
        users: string;
        paying: string;
        runs_month: string;
        runs_today: string;
        failed_today: string;
      }>(
        `SELECT
           (SELECT count(*) FROM users)::text AS users,
           (SELECT count(*) FROM subscriptions
             WHERE product = $1 AND status = 'active' AND plan_code <> 'free')::text AS paying,
           (SELECT COALESCE(SUM(units), 0) FROM usage_events
             WHERE product = $1 AND created_at >= date_trunc('month', now()))::text AS runs_month,
           (SELECT COALESCE(SUM(units), 0) FROM usage_events
             WHERE product = $1 AND created_at >= date_trunc('day', now()))::text AS runs_today,
           (SELECT count(*) FROM usage_events
             WHERE product = $1 AND status >= 400 AND created_at >= date_trunc('day', now()))::text AS failed_today`,
        [product.slug],
      );
      if (row) {
        extra.users_total = Number(row.users);
        extra.paying_subscriptions = Number(row.paying);
        extra.runs_month_total = Number(row.runs_month);
        extra.runs_today_total = Number(row.runs_today);
        extra.failed_requests_today = Number(row.failed_today);
      }
      extra.business_metrics_up = 1;
    } catch {
      // The schema is applied lazily on first authenticated use, so on a brand new
      // deployment these tables genuinely do not exist yet. That is not an outage.
      extra.business_metrics_up = 0;
    }
  }

  return new Response(prometheus(extra), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
