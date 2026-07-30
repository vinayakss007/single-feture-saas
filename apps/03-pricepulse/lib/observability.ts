/**
 * Logging, metrics and alerting — with no vendor SDK.
 *
 * Structured JSON to stdout is the lowest common denominator that every host
 * already ingests (Vercel, Fly, Railway, CloudWatch, Loki). Metrics are exposed
 * in Prometheus text format, which Grafana Cloud's free tier scrapes directly.
 * Alerts POST to a webhook, which Slack and Discord both accept for free.
 *
 * Nothing here needs a paid plan, and nothing here needs installing.
 */

type Level = "debug" | "info" | "warn" | "error";

const SERVICE = process.env.NEXT_PUBLIC_SITE_URL ?? "local";

export function log(level: Level, scope: string, message: string, fields: Record<string, unknown> = {}): void {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    service: SERVICE,
    scope,
    message,
    ...fields,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

// ---------------------------------------------------------------------------
// Counters
//
// Process-local and reset on cold start. That is a real limitation on
// serverless, and the reason /api/metrics also reports database-backed totals,
// which survive restarts. Scrape both.
// ---------------------------------------------------------------------------

type Counters = {
  requests: Record<string, number>;
  errors: Record<string, number>;
  runs: { total: number; failed: number; quotaBlocked: number; unauthorised: number };
  durations: number[];
  startedAt: number;
};

const g = globalThis as unknown as { __sfsMetrics?: Counters };

function counters(): Counters {
  if (!g.__sfsMetrics) {
    g.__sfsMetrics = {
      requests: {},
      errors: {},
      runs: { total: 0, failed: 0, quotaBlocked: 0, unauthorised: 0 },
      durations: [],
      startedAt: Date.now(),
    };
  }
  return g.__sfsMetrics;
}

export function countRequest(route: string, status: number): void {
  const c = counters();
  const key = `${route}|${status}`;
  c.requests[key] = (c.requests[key] ?? 0) + 1;
  if (status >= 500) c.errors[route] = (c.errors[route] ?? 0) + 1;
}

export function countRun(outcome: "ok" | "failed" | "quota" | "unauthorised", durationMs: number): void {
  const c = counters();
  c.runs.total += 1;
  if (outcome === "failed") c.runs.failed += 1;
  if (outcome === "quota") c.runs.quotaBlocked += 1;
  if (outcome === "unauthorised") c.runs.unauthorised += 1;
  c.durations.push(durationMs);
  // Keep the reservoir bounded; percentiles do not need every sample.
  if (c.durations.length > 1000) c.durations.splice(0, c.durations.length - 1000);
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

export function snapshot() {
  const c = counters();
  const sorted = [...c.durations].sort((a, b) => a - b);
  return {
    uptimeSeconds: Math.round((Date.now() - c.startedAt) / 1000),
    requests: c.requests,
    errors: c.errors,
    runs: c.runs,
    latency: {
      count: sorted.length,
      p50: percentile(sorted, 50),
      p95: percentile(sorted, 95),
      p99: percentile(sorted, 99),
      max: sorted[sorted.length - 1] ?? 0,
    },
  };
}

/** Prometheus text exposition format. */
export function prometheus(extra: Record<string, number> = {}): string {
  const s = snapshot();
  const lines: string[] = [];
  const push = (name: string, help: string, type: string, samples: [string, number][]) => {
    lines.push(`# HELP ${name} ${help}`, `# TYPE ${name} ${type}`);
    for (const [labels, value] of samples) lines.push(`${name}${labels} ${value}`);
  };

  push("sfs_uptime_seconds", "Seconds since this instance started.", "gauge", [["", s.uptimeSeconds]]);
  push(
    "sfs_http_requests_total",
    "HTTP requests handled, by route and status.",
    "counter",
    Object.entries(s.requests).map(([key, value]) => {
      const [route, status] = key.split("|");
      return [`{route="${route}",status="${status}"}`, value] as [string, number];
    }),
  );
  push("sfs_engine_runs_total", "Engine invocations.", "counter", [["", s.runs.total]]);
  push("sfs_engine_failures_total", "Engine invocations that threw.", "counter", [["", s.runs.failed]]);
  push("sfs_quota_blocked_total", "Requests refused for quota or billing.", "counter", [["", s.runs.quotaBlocked]]);
  push("sfs_unauthorised_total", "Requests refused for a bad or missing key.", "counter", [["", s.runs.unauthorised]]);
  push("sfs_engine_duration_ms", "Engine latency percentiles for this instance.", "gauge", [
    ['{quantile="0.5"}', s.latency.p50],
    ['{quantile="0.95"}', s.latency.p95],
    ['{quantile="0.99"}', s.latency.p99],
  ]);

  for (const [name, value] of Object.entries(extra)) {
    push(`sfs_${name}`, `Database-backed total: ${name}.`, "gauge", [["", value]]);
  }

  return `${lines.join("\n")}\n`;
}

// ---------------------------------------------------------------------------
// Alerting
// ---------------------------------------------------------------------------

const alerted = new Map<string, number>();
const ALERT_COOLDOWN_MS = 10 * 60_000;

/**
 * Posts to a Slack or Discord incoming webhook. Deduplicated for ten minutes per
 * key, because the failure mode of alerting is always volume, not absence.
 */
export async function alert(key: string, title: string, detail: string): Promise<void> {
  const url = process.env.ALERT_WEBHOOK_URL?.trim();
  log("error", "alert", title, { detail, key });
  if (!url) return;

  const last = alerted.get(key) ?? 0;
  if (Date.now() - last < ALERT_COOLDOWN_MS) return;
  alerted.set(key, Date.now());

  const text = `:rotating_light: *${title}*\n${detail}\n_service: ${SERVICE}_`;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Slack reads `text`, Discord reads `content`. Sending both means one
      // env var works for either without a provider setting.
      body: JSON.stringify({ text, content: text }),
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    /* alerting must never throw into the request path */
  }
}

/** Wraps a route handler with timing, counting and alerting on 5xx. */
export async function instrument<T extends Response>(
  route: string,
  handler: () => Promise<T>,
): Promise<T | Response> {
  const started = Date.now();
  try {
    const res = await handler();
    countRequest(route, res.status);
    if (res.status >= 500) {
      await alert(`5xx:${route}`, `${route} returned ${res.status}`, `Duration ${Date.now() - started}ms`);
    }
    return res;
  } catch (err) {
    countRequest(route, 500);
    const message = err instanceof Error ? err.message : "unknown error";
    log("error", route, message, { stack: err instanceof Error ? err.stack : undefined });
    await alert(`throw:${route}`, `${route} threw`, message);
    return new Response(JSON.stringify({ ok: false, error: "Internal error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
