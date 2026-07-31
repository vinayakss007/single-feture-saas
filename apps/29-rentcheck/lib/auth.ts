import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { product } from "./product.ts";
import { dbAvailable, query, queryOne, migrate } from "./db.ts";
import { fakeVerify, hashPassword, newSessionToken, sha256, verifyPassword } from "./crypto.ts";
import { normaliseEmail, validateEmail, validatePassword } from "./validate.ts";

/**
 * Authentication, built on Node's own primitives.
 *
 * Deliberately no auth library. The requirements here are narrow — email and
 * password, server-side sessions — and every dependency in an auth path is a
 * dependency you have to keep patched forever. What is here is the boring,
 * correct version:
 *
 *   - scrypt for password hashing, with the parameters stored alongside the hash
 *     so they can be raised later without invalidating existing passwords
 *   - opaque random session tokens; only the SHA-256 is stored, so a database
 *     dump does not hand out live sessions
 *   - constant-time comparison everywhere a secret is checked
 *   - a dummy verification on unknown emails, so login timing does not reveal
 *     which addresses are registered
 *
 * The primitives themselves live in ./crypto and ./validate so they can be unit
 * tested without Next or a database. They are re-exported here, so this module
 * stays the single import site for anything auth-related.
 */

export { fakeVerify, hashPassword, newSessionToken, verifyPassword } from "./crypto.ts";
export { normaliseEmail, validateEmail, validatePassword } from "./validate.ts";
export type { Problem as PasswordProblem } from "./validate.ts";

export const SESSION_COOKIE = "sfs_session";
const SESSION_TTL_DAYS = 30;

export type User = {
  id: string;
  email: string;
  name: string | null;
  created_at: Date;
};

export type SessionUser = User & {
  sessionId: string;
  /** Plan code from the subscriptions row for this product; "free" when absent. */
  planCode: string;
  /** active | past_due | cancelled. "active" when there is no subscription row. */
  subscriptionStatus: string;
};

// ---------------------------------------------------------------------------
// Passwords
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export async function createSession(
  userId: string,
  meta: { ip?: string | null; userAgent?: string | null } = {},
): Promise<{ token: string; expiresAt: Date }> {
  const token = newSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000);
  await query(
    `INSERT INTO sessions (user_id, token_hash, expires_at, ip, user_agent) VALUES ($1, $2, $3, $4, $5)`,
    [userId, sha256(token), expiresAt, meta.ip ?? null, (meta.userAgent ?? "").slice(0, 400) || null],
  );
  return { token, expiresAt };
}

export async function resolveSession(token: string): Promise<SessionUser | null> {
  if (!token || !dbAvailable()) return null;
  // The subscription is joined here rather than fetched separately because every
  // caller that needs the user also needs to know what they are entitled to.
  const row = await queryOne<{
    session_id: string;
    id: string;
    email: string;
    name: string | null;
    created_at: Date;
    plan_code: string | null;
    status: string | null;
  }>(
    `SELECT s.id AS session_id, u.id, u.email, u.name, u.created_at,
            sub.plan_code, sub.status
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN subscriptions sub ON sub.user_id = u.id AND sub.product = $2
      WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [sha256(token), product.slug],
  );
  if (!row) return null;

  // Fire and forget; a failed last_seen update must never fail a request.
  query(`UPDATE sessions SET last_seen_at = now() WHERE id = $1`, [row.session_id]).catch(() => undefined);

  return {
    sessionId: row.session_id,
    id: row.id,
    email: row.email,
    name: row.name,
    created_at: row.created_at,
    planCode: row.plan_code ?? "free",
    subscriptionStatus: row.status ?? "active",
  };
}

export async function destroySession(token: string): Promise<void> {
  if (!token || !dbAvailable()) return;
  await query(`DELETE FROM sessions WHERE token_hash = $1`, [sha256(token)]);
}

export async function destroyAllSessions(userId: string): Promise<void> {
  await query(`DELETE FROM sessions WHERE user_id = $1`, [userId]);
}

// ---------------------------------------------------------------------------
// Cookie helpers (server components and route handlers)
// ---------------------------------------------------------------------------

export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: expiresAt,
  };
}

/** Reads the current user from the session cookie. Returns null when signed out. */
export async function currentUser(): Promise<SessionUser | null> {
  if (!dbAvailable()) return null;
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await resolveSession(token);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Registration and login
// ---------------------------------------------------------------------------

export type AuthResult =
  | { ok: true; user: User; token: string; expiresAt: Date }
  | { ok: false; error: string; status: number };

export async function signUp(
  email: string,
  password: string,
  name: string | null,
  meta: { ip?: string | null; userAgent?: string | null } = {},
): Promise<AuthResult> {
  if (!dbAvailable()) {
    return { ok: false, status: 503, error: "Accounts are disabled — DATABASE_URL is not configured on this deployment." };
  }
  await migrate();

  const emailProblem = validateEmail(email);
  if (emailProblem) return { ok: false, status: 400, error: emailProblem };
  const passwordProblem = validatePassword(password);
  if (passwordProblem) return { ok: false, status: 400, error: passwordProblem };

  const normalised = normaliseEmail(email);
  const existing = await queryOne<{ id: string }>(`SELECT id FROM users WHERE email_lower = $1`, [normalised]);
  if (existing) {
    return { ok: false, status: 409, error: "An account with that email already exists. Try signing in instead." };
  }

  const passwordHash = await hashPassword(password);
  const user = await queryOne<User>(
    `INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3)
     RETURNING id, email, name, created_at`,
    [normalised, name?.trim() || null, passwordHash],
  );
  if (!user) return { ok: false, status: 500, error: "Could not create the account." };

  const { token, expiresAt } = await createSession(user.id, meta);
  return { ok: true, user, token, expiresAt };
}

export async function signIn(
  email: string,
  password: string,
  meta: { ip?: string | null; userAgent?: string | null } = {},
): Promise<AuthResult> {
  if (!dbAvailable()) {
    return { ok: false, status: 503, error: "Accounts are disabled — DATABASE_URL is not configured on this deployment." };
  }
  await migrate();

  const normalised = normaliseEmail(email);
  const row = await queryOne<User & { password_hash: string }>(
    `SELECT id, email, name, created_at, password_hash FROM users WHERE email_lower = $1`,
    [normalised],
  );

  // Same wall-clock cost and the same message whether or not the email exists.
  if (!row) {
    await fakeVerify(password);
    return { ok: false, status: 401, error: "Email or password is incorrect." };
  }
  const valid = await verifyPassword(password, row.password_hash);
  if (!valid) return { ok: false, status: 401, error: "Email or password is incorrect." };

  const { token, expiresAt } = await createSession(row.id, meta);
  return {
    ok: true,
    user: { id: row.id, email: row.email, name: row.name, created_at: row.created_at },
    token,
    expiresAt,
  };
}

export async function changePassword(userId: string, current: string, next: string): Promise<{ ok: boolean; error?: string }> {
  const row = await queryOne<{ password_hash: string }>(`SELECT password_hash FROM users WHERE id = $1`, [userId]);
  if (!row) return { ok: false, error: "Account not found." };
  if (!(await verifyPassword(current, row.password_hash))) return { ok: false, error: "Current password is incorrect." };
  const problem = validatePassword(next);
  if (problem) return { ok: false, error: problem };

  await query(`UPDATE users SET password_hash = $2 WHERE id = $1`, [userId, await hashPassword(next)]);
  // Changing a password signs out every other device. That is the expected
  // behaviour after a suspected compromise.
  await destroyAllSessions(userId);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------

export async function createPasswordReset(email: string): Promise<{ token: string; userId: string } | null> {
  const normalised = normaliseEmail(email);
  const user = await queryOne<{ id: string }>(`SELECT id FROM users WHERE email_lower = $1`, [normalised]);
  if (!user) return null; // Caller must still report success, to avoid enumeration.

  const token = randomBytes(32).toString("base64url");
  await query(
    `INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, now() + interval '1 hour')`,
    [user.id, sha256(token)],
  );
  return { token, userId: user.id };
}

export async function consumePasswordReset(token: string, newPassword: string): Promise<{ ok: boolean; error?: string }> {
  const problem = validatePassword(newPassword);
  if (problem) return { ok: false, error: problem };

  const row = await queryOne<{ id: string; user_id: string }>(
    `SELECT id, user_id FROM password_resets
      WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()`,
    [sha256(token)],
  );
  if (!row) return { ok: false, error: "That reset link is invalid or has expired. Request a new one." };

  await query(`UPDATE users SET password_hash = $2 WHERE id = $1`, [row.user_id, await hashPassword(newPassword)]);
  await query(`UPDATE password_resets SET used_at = now() WHERE id = $1`, [row.id]);
  await destroyAllSessions(row.user_id);
  return { ok: true };
}
