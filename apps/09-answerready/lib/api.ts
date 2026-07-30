import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { InputField, RunInput } from "./types.ts";
import { parseInput as parseInputPure } from "./validate.ts";
import { dbAvailable } from "./db.ts";
import { resolveApiKey } from "./api-keys.ts";
import { SESSION_COOKIE, resolveSession } from "./auth.ts";
import { planByCode, PLANS } from "./plans.ts";
import type { Caller } from "./usage.ts";

/**
 * The request-handling layer shared by all ten products.
 *
 * Precedence for identifying a caller is API key, then session cookie, then
 * anonymous. Machines send keys and browsers send cookies, so a request that
 * carries both is a browser calling its own API and the key is the more specific
 * signal.
 *
 * Everything degrades to "anonymous, in-memory rate limit" when DATABASE_URL is
 * unset. That is what makes the same build serve as a zero-config public demo
 * and as the paid product.
 */

const WINDOW_MS = 60_000;

/**
 * Legacy static keys, kept because they are the fastest possible way to lock an
 * endpoint before you have a database. If DATABASE_URL is set, database-backed
 * keys are used and this is ignored.
 */
function staticKeys(): string[] {
  return (process.env.API_KEYS ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

export type ApiFailure = { ok: false; error: string; status: number; details?: unknown };

// ---------------------------------------------------------------------------
// Caller resolution
// ---------------------------------------------------------------------------

export function presentedKey(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim() || null;
  const header = req.headers.get("x-api-key")?.trim();
  return header || null;
}

export function callerIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip")?.trim() || "0.0.0.0";
}

export type Resolution = { ok: true; caller: Caller } | { ok: false; failure: ApiFailure };

/** Identifies who is calling, or explains why the request cannot be attributed. */
export async function resolveCaller(req: Request): Promise<Resolution> {
  const key = presentedKey(req);
  const ip = callerIp(req);

  if (!dbAvailable()) {
    // Demo mode. Honour static keys if the operator set them, otherwise open.
    const configured = staticKeys();
    if (configured.length > 0) {
      if (!key) {
        return {
          ok: false,
          failure: { ok: false, status: 401, error: "Missing API key. Send Authorization: Bearer <key> or x-api-key." },
        };
      }
      if (!configured.includes(key)) {
        return { ok: false, failure: { ok: false, status: 401, error: "Invalid API key." } };
      }
    }
    return { ok: true, caller: { kind: "anonymous", ip } };
  }

  if (key) {
    const resolved = await resolveApiKey(key);
    if (!resolved) {
      return {
        ok: false,
        failure: {
          ok: false,
          status: 401,
          error: "That API key is not valid or has been revoked. Create a new one from your dashboard.",
        },
      };
    }
    return {
      ok: true,
      caller: {
        kind: "api-key",
        userId: resolved.userId,
        apiKeyId: resolved.apiKeyId,
        plan: planByCode(resolved.planCode),
        subscriptionStatus: resolved.subscriptionStatus,
      },
    };
  }

  // Browser calling its own API from the demo page.
  try {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (token) {
      const session = await resolveSession(token);
      if (session) {
        return {
          ok: true,
          caller: {
            kind: "session",
            userId: session.id,
            plan: planByCode(session.planCode),
            subscriptionStatus: session.subscriptionStatus,
          },
        };
      }
    }
  } catch {
    // `cookies()` throws outside a request scope, e.g. under a plain fetch in a
    // test harness. An unattributable request is simply anonymous.
  }

  return { ok: true, caller: { kind: "anonymous", ip } };
}

/** The per-minute allowance that applies to a resolved caller. */
export function rateLimitFor(caller: Caller): number {
  const override = Number(process.env.RATE_LIMIT_PER_MIN ?? Number.NaN);
  if (Number.isFinite(override)) return override;
  if (caller.kind === "anonymous") return PLANS.free.rateLimitPerMin;
  return caller.plan.rateLimitPerMin;
}

/**
 * Buckets are keyed by scope AND caller.
 *
 * The scope matters: without it, every route sharing one IP bucket means a burst
 * of login attempts uses up the budget for password resets, and a user who hits
 * the signup limit finds the whole site refusing them. Each route gets its own
 * allowance so one endpoint's abuse protection cannot deny a different endpoint.
 */
function bucketId(scope: string, caller: Caller): string {
  if (caller.kind === "api-key") return `${scope}|key:${caller.apiKeyId}`;
  if (caller.kind === "session") return `${scope}|user:${caller.userId}`;
  return `${scope}|ip:${caller.ip}`;
}

// ---------------------------------------------------------------------------
// Burst limiting
// ---------------------------------------------------------------------------

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/**
 * Per-process fixed window. This protects one instance from a burst; it is not a
 * global limit and does not pretend to be. The durable, billable limit is the
 * monthly quota in `usage.ts`, which is in the database and therefore correct
 * across instances. Add Upstash Redis if you need a strict distributed limit —
 * see the free-services table in FRAMEWORK.md.
 */
export function rateLimit(
  caller: Caller,
  limit = rateLimitFor(caller),
  scope = "run",
): ApiFailure | null {
  if (limit <= 0) return null;
  if (buckets.size > 10_000) buckets.clear(); // bound memory on a long-lived instance

  const id = bucketId(scope, caller);
  const now = Date.now();
  const bucket = buckets.get(id);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    const retryIn = Math.ceil((bucket.resetAt - now) / 1000);
    return {
      ok: false,
      status: 429,
      error: `Rate limit of ${limit} requests/minute exceeded. Retry in ${retryIn}s.`,
    };
  }
  return null;
}

/** Test-only escape hatch so burst limits do not leak between test cases. */
export function resetRateLimits(): void {
  buckets.clear();
}

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

/**
 * Re-exported from ./validate, which has no Next or database import so it can be
 * unit tested directly. Wrapped rather than re-exported raw so the returned
 * failure carries the `ApiFailure` shape the rest of this module speaks.
 */
export function parseInput(
  body: unknown,
  fields: InputField[],
): { ok: true; value: RunInput } | { ok: false; failure: ApiFailure } {
  const result = parseInputPure(body, fields);
  if (result.ok) return result;
  const { status, error, details } = result.failure;
  return { ok: false, failure: { ok: false, status, error, details } };
}

export { MAX_FIELD_CHARS } from "./validate.ts";

// ---------------------------------------------------------------------------
// Responses
// ---------------------------------------------------------------------------

export function fail(failure: ApiFailure, headers?: Record<string, string>) {
  return NextResponse.json(
    { ok: false, error: failure.error, ...(failure.details ? { details: failure.details } : {}) },
    { status: failure.status, headers },
  );
}

export function ok<T>(data: T, meta?: Record<string, unknown>, headers?: Record<string, string>) {
  return NextResponse.json({ ok: true, ...(meta ?? {}), data }, { headers });
}

/** Standard quota headers so a client can back off before it is refused. */
export function quotaHeaders(used: number, limit: number): Record<string, string> {
  const finite = Number.isFinite(limit);
  return {
    "X-Quota-Used": String(used),
    "X-Quota-Limit": finite ? String(limit) : "unlimited",
    "X-Quota-Remaining": finite ? String(Math.max(0, limit - used)) : "unlimited",
  };
}

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,x-api-key",
} as const;
