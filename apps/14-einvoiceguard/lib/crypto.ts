import { randomBytes, scrypt as scryptCb, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";

/**
 * Password and token primitives.
 *
 * Kept in its own module, importing nothing but `node:crypto`, for two reasons:
 * this is the code most worth having direct unit tests for, and those tests should
 * not need Next, a database or a request context to run. `lib/auth.ts` re-exports
 * everything here, so callers never need to know it was split out.
 */

const scryptRaw = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number },
) => Promise<Buffer>;

/**
 * scrypt rather than bcrypt because it is in the standard library — no native
 * module to compile, nothing to keep patched.
 *
 * N=16384 is roughly 60–100ms on the small instances these deploy to. That is the
 * honest trade: enough to make offline cracking expensive, not enough for a login
 * to feel slow. The parameters are stored inside each hash, so raising them later
 * does not invalidate existing passwords.
 */
export const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 } as const;

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Format: scrypt$N$r$p$salt$hash — self-describing, so parameters can change. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scryptRaw(password, salt, SCRYPT.keylen, SCRYPT);
  return ["scrypt", SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString("base64url"), derived.toString("base64url")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, saltB64, hashB64] = parts;

  const N = Number(n);
  const rr = Number(r);
  const pp = Number(p);
  // A malformed hash must not be able to make scrypt allocate unbounded memory.
  if (!Number.isInteger(N) || !Number.isInteger(rr) || !Number.isInteger(pp)) return false;
  if (N < 2 || N > 1 << 20 || rr < 1 || rr > 32 || pp < 1 || pp > 16) return false;

  const salt = Buffer.from(saltB64, "base64url");
  const expected = Buffer.from(hashB64, "base64url");
  if (salt.length === 0 || expected.length === 0) return false;

  try {
    const derived = await scryptRaw(password, salt, expected.length, { N, r: rr, p: pp });
    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/**
 * Burns roughly the same CPU as a real verification. Called when the email does
 * not exist, so response time does not disclose which addresses are registered.
 */
const DUMMY_HASH_PROMISE = hashPassword(randomBytes(16).toString("hex"));
export async function fakeVerify(password: string): Promise<void> {
  await verifyPassword(password, await DUMMY_HASH_PROMISE);
}

/** 256 bits of entropy, url-safe. Only its SHA-256 is ever stored. */
export function newSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Constant-time comparison of two secrets presented as strings. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}
