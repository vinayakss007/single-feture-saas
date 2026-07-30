#!/usr/bin/env node
/**
 * Applies db/schema.sql to DATABASE_URL.
 *
 * The app applies its own schema on first use, so this exists for the cases where
 * that is not what you want: seeding a fresh database before the first deploy,
 * running migrations from CI, or checking that the schema is genuinely idempotent.
 *
 *   DATABASE_URL=postgres://… node scripts/db-apply.mjs
 *   DATABASE_URL=postgres://… node scripts/db-apply.mjs --twice   # prove idempotency
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCHEMA = join(ROOT, "_template", "db", "schema.sql");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}
if (!existsSync(SCHEMA)) {
  console.error(`Schema not found at ${SCHEMA}`);
  process.exit(1);
}

// `pg` lives in the app workspaces, not the root, so resolve from one of them.
const require = createRequire(join(ROOT, "apps", "01-dealbrief", "package.json"));
const { Client } = require("pg");

const sql = readFileSync(SCHEMA, "utf8");
const runs = process.argv.includes("--twice") ? 2 : 1;

const client = new Client({
  connectionString: url,
  ssl: url.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
});

await client.connect();
try {
  for (let i = 1; i <= runs; i += 1) {
    const started = Date.now();
    await client.query(sql);
    console.log(`Applied schema (pass ${i}/${runs}) in ${Date.now() - started}ms`);
  }

  const { rows } = await client.query(
    `SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name`,
  );
  console.log(`\nTables: ${rows.map((r) => r.table_name).join(", ")}`);
} finally {
  await client.end();
}
