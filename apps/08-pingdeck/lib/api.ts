import { NextResponse } from "next/server";
import type { InputField, RunInput } from "./types";

/**
 * Tiny, dependency-free API layer shared by all ten products.
 *
 * Auth model: if API_KEYS is set (comma separated), every request must send
 * `Authorization: Bearer <key>` or `x-api-key: <key>`. If API_KEYS is not set the
 * API stays open, which is what you want for a Product Hunt launch day demo.
 */

const WINDOW_MS = 60_000;
const DEFAULT_LIMIT = Number(process.env.RATE_LIMIT_PER_MIN ?? 60);

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export type ApiFailure = { ok: false; error: string; status: number; details?: unknown };

function configuredKeys(): string[] {
  return (process.env.API_KEYS ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

function presentedKey(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return req.headers.get("x-api-key");
}

export function authenticate(req: Request): ApiFailure | null {
  const keys = configuredKeys();
  if (keys.length === 0) return null;
  const key = presentedKey(req);
  if (!key) {
    return { ok: false, status: 401, error: "Missing API key. Send Authorization: Bearer <key> or x-api-key." };
  }
  if (!keys.includes(key)) {
    return { ok: false, status: 401, error: "Invalid API key." };
  }
  return null;
}

export function rateLimit(req: Request, limit = DEFAULT_LIMIT): ApiFailure | null {
  if (limit <= 0) return null;
  const id =
    presentedKey(req) ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "anonymous";
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

/** Validates and normalises the request body against the product's input schema. */
export function parseInput(
  body: unknown,
  fields: InputField[],
): { ok: true; value: RunInput } | { ok: false; failure: ApiFailure } {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return {
      ok: false,
      failure: { ok: false, status: 400, error: "Request body must be a JSON object." },
    };
  }
  const raw = body as Record<string, unknown>;
  const value: RunInput = {};
  const missing: string[] = [];
  const badType: string[] = [];

  for (const field of fields) {
    const v = raw[field.name];
    if (v === undefined || v === null || v === "") {
      if (field.required) missing.push(field.name);
      value[field.name] = "";
      continue;
    }
    if (typeof v !== "string" && typeof v !== "number" && typeof v !== "boolean") {
      badType.push(field.name);
      continue;
    }
    value[field.name] = String(v);
  }

  if (missing.length > 0 || badType.length > 0) {
    return {
      ok: false,
      failure: {
        ok: false,
        status: 400,
        error: "Invalid request body.",
        details: {
          missingRequiredFields: missing,
          fieldsThatMustBeStrings: badType,
          expected: fields.map((f) => ({
            name: f.name,
            type: f.type,
            required: Boolean(f.required),
            options: f.options,
          })),
        },
      },
    };
  }
  return { ok: true, value };
}

export function fail(failure: ApiFailure) {
  return NextResponse.json(
    { ok: false, error: failure.error, ...(failure.details ? { details: failure.details } : {}) },
    { status: failure.status },
  );
}

export function ok<T>(data: T, meta?: Record<string, unknown>) {
  return NextResponse.json({ ok: true, ...(meta ?? {}), data });
}

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,x-api-key",
} as const;
