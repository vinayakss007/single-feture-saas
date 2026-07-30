import { randomBytes, createHash } from "node:crypto";
import { product } from "./product.ts";
import { query, queryOne } from "./db.ts";

/**
 * API keys.
 *
 * The plaintext key is returned exactly once, at creation, and never stored —
 * only its SHA-256. That means we genuinely cannot recover a lost key, which is
 * the correct trade and needs saying clearly in the UI.
 *
 * The prefix is stored separately so the dashboard can show "sk_dealbrief_a1b2…"
 * to identify a key without holding the secret.
 */

export type ApiKeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  created_at: Date;
  last_used_at: Date | null;
  revoked_at: Date | null;
};

const PREFIX = `sk_${product.slug.replace(/-/g, "_")}_`;

function hash(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function generateKey(): { key: string; keyHash: string; keyPrefix: string } {
  const key = `${PREFIX}${randomBytes(24).toString("hex")}`;
  return { key, keyHash: hash(key), keyPrefix: key.slice(0, PREFIX.length + 6) };
}

export async function createApiKey(userId: string, name: string): Promise<{ id: string; key: string; keyPrefix: string }> {
  const { key, keyHash, keyPrefix } = generateKey();
  const row = await queryOne<{ id: string }>(
    `INSERT INTO api_keys (user_id, product, name, key_hash, key_prefix)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [userId, product.slug, name.trim().slice(0, 60) || "default", keyHash, keyPrefix],
  );
  if (!row) throw new Error("Could not create the API key.");
  return { id: row.id, key, keyPrefix };
}

export async function listApiKeys(userId: string): Promise<ApiKeyRow[]> {
  return query<ApiKeyRow>(
    `SELECT id, name, key_prefix, created_at, last_used_at, revoked_at
       FROM api_keys
      WHERE user_id = $1 AND product = $2
      ORDER BY created_at DESC`,
    [userId, product.slug],
  );
}

export async function revokeApiKey(userId: string, id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `UPDATE api_keys SET revoked_at = now()
      WHERE id = $1 AND user_id = $2 AND product = $3 AND revoked_at IS NULL
      RETURNING id`,
    [id, userId, product.slug],
  );
  return rows.length > 0;
}

export type ResolvedKey = {
  apiKeyId: string;
  userId: string;
  planCode: string;
  subscriptionStatus: string;
};

/**
 * Resolves a presented key to its owner and plan in one query, and touches
 * last_used_at so the dashboard can show which keys are actually in use.
 */
export async function resolveApiKey(key: string): Promise<ResolvedKey | null> {
  if (!key.startsWith("sk_")) return null;

  const row = await queryOne<{
    id: string;
    user_id: string;
    plan_code: string | null;
    status: string | null;
  }>(
    `SELECT k.id, k.user_id, s.plan_code, s.status
       FROM api_keys k
       LEFT JOIN subscriptions s ON s.user_id = k.user_id AND s.product = k.product
      WHERE k.key_hash = $1 AND k.product = $2 AND k.revoked_at IS NULL`,
    [hash(key), product.slug],
  );
  if (!row) return null;

  query(`UPDATE api_keys SET last_used_at = now() WHERE id = $1`, [row.id]).catch(() => undefined);

  return {
    apiKeyId: row.id,
    userId: row.user_id,
    // No subscription row at all means the user is on free.
    planCode: row.plan_code ?? "free",
    subscriptionStatus: row.status ?? "active",
  };
}
