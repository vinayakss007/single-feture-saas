import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { SCHEMA_SQL } from "./schema.ts";

/**
 * Postgres access for the framework.
 *
 * The single most important behaviour here: when DATABASE_URL is not set the app
 * still runs. It falls back to anonymous demo mode — the product itself works,
 * the landing page works, and only accounts and billing are unavailable. That is
 * what lets the same codebase be a zero-config Product Hunt demo and a paid
 * product, without a build flag.
 */

let pool: Pool | null = null;
let migrated = false;

export function databaseUrl(): string | null {
  return process.env.DATABASE_URL?.trim() || null;
}

export function dbAvailable(): boolean {
  return databaseUrl() !== null;
}

export function getPool(): Pool {
  const url = databaseUrl();
  if (!url) throw new Error("DATABASE_URL is not set. Accounts and billing are disabled in demo mode.");

  if (!pool) {
    pool = new Pool({
      connectionString: url,
      // Serverless functions are short-lived and numerous; a small ceiling per
      // instance avoids exhausting Postgres connection slots.
      max: Number(process.env.DB_POOL_MAX ?? 5),
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8_000,
      ssl: /sslmode=disable/.test(url) || /localhost|127\.0\.0\.1/.test(url) ? undefined : { rejectUnauthorized: false },
    });
    pool.on("error", (err) => {
      console.error(JSON.stringify({ level: "error", scope: "db.pool", message: err.message }));
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await getPool().query<T>(sql, params as never[]);
  return result.rows;
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

/** Runs fn inside a transaction, rolling back on any throw. */
export async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const out = await fn(client);
    await client.query("COMMIT");
    return out;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Applies the schema. Idempotent, so it is safe to call on boot and safe to call
 * concurrently from ten apps pointing at the same database — the advisory lock
 * serialises them, and only the first caller does any work.
 *
 * The SQL is imported as a string from ./schema.ts, which `pnpm sync` generates
 * from db/schema.sql. It is deliberately NOT read from disk: on Vercel a route
 * handler's working directory is not the project root and unreferenced files are
 * not bundled, so `readFileSync("db/schema.sql")` works locally and then fails in
 * production — the worst possible split. Importing it makes the bundler carry it.
 */
export async function migrate(): Promise<void> {
  if (migrated || !dbAvailable()) return;

  await transaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtext('sfs_schema_migration'))");
    await client.query(SCHEMA_SQL);
  });
  migrated = true;
}

/** Cheap liveness probe used by /api/health. */
export async function dbHealth(): Promise<{ ok: boolean; latencyMs: number | null; error: string | null }> {
  if (!dbAvailable()) return { ok: false, latencyMs: null, error: "DATABASE_URL not set (demo mode)" };
  const started = Date.now();
  try {
    await query("SELECT 1");
    return { ok: true, latencyMs: Date.now() - started, error: null };
  } catch (err) {
    return { ok: false, latencyMs: Date.now() - started, error: err instanceof Error ? err.message : "unknown" };
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    migrated = false;
  }
}
