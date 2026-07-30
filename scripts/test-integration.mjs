#!/usr/bin/env node
/**
 * End-to-end test against a real Postgres and a real Next server.
 *
 * The unit tests cover pure logic; this covers the parts that only break when
 * everything is wired together — cookies, the schema, quota arithmetic across
 * requests, webhook signatures and idempotency. Those are exactly the paths where
 * a bug costs money, so they are tested against the real thing rather than mocks.
 *
 *   DATABASE_URL=postgres://… node scripts/test-integration.mjs
 *   DATABASE_URL=postgres://… node scripts/test-integration.mjs --app 03-pricepulse
 *
 * Requires `pnpm build` to have been run for the app under test.
 */

import { spawn } from "node:child_process";
import { createHmac } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const argApp = process.argv.indexOf("--app");
const APP = argApp > -1 ? process.argv[argApp + 1] : "01-dealbrief";
const APP_DIR = join(ROOT, "apps", APP);
const PORT = Number(process.env.TEST_PORT ?? 3199);
const BASE = `http://127.0.0.1:${PORT}`;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL must be set. This test deliberately uses a real Postgres.");
  process.exit(1);
}

// Test-only secrets. The signature checks are real; only the keys are fake.
const RAZORPAY_WEBHOOK_SECRET = "test_rzp_webhook_secret";
const STRIPE_WEBHOOK_SECRET = "test_stripe_webhook_secret";

const require = createRequire(join(APP_DIR, "package.json"));
const { Client } = require("pg");

// ---------------------------------------------------------------------------
// Tiny test harness
// ---------------------------------------------------------------------------

let passed = 0;
const failures = [];
let currentGroup = "";

function group(name) {
  currentGroup = name;
  console.log(`\n\x1b[1m${name}\x1b[0m`);
}

async function check(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (err) {
    failures.push({ group: currentGroup, name, message: err?.message ?? String(err) });
    console.log(`  \x1b[31m✗\x1b[0m ${name}`);
    console.log(`    \x1b[31m${err?.message ?? err}\x1b[0m`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message ?? "values differ"} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// ---------------------------------------------------------------------------
// HTTP with a cookie jar, so sessions behave like a browser
// ---------------------------------------------------------------------------

const jar = new Map();

function cookieHeader() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

function captureCookies(res) {
  const raw = res.headers.getSetCookie?.() ?? [];
  for (const line of raw) {
    const [pair] = line.split(";");
    const idx = pair.indexOf("=");
    const name = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (value === "" || /Max-Age=0/i.test(line) || /Expires=Thu, 01 Jan 1970/i.test(line)) {
      jar.delete(name);
    } else {
      jar.set(name, value);
    }
  }
}

async function http(method, path, { body, headers = {}, cookies = true, raw = false } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body !== undefined && !raw ? { "Content-Type": "application/json" } : {}),
      ...(cookies && jar.size > 0 ? { Cookie: cookieHeader() } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : raw ? body : JSON.stringify(body),
    redirect: "manual",
  });
  captureCookies(res);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* html or plain text */
  }
  return { status: res.status, headers: res.headers, json, text };
}

const get = (p, o) => http("GET", p, o);
const post = (p, body, o) => http("POST", p, { body, ...o });
const del = (p, o) => http("DELETE", p, o);

// ---------------------------------------------------------------------------
// Server lifecycle
// ---------------------------------------------------------------------------

function serverEntry() {
  // pnpm workspaces nest the standalone output; a single-app Docker context does not.
  const candidates = [
    join(APP_DIR, ".next", "standalone", "apps", APP, "server.js"),
    join(APP_DIR, ".next", "standalone", "server.js"),
  ];
  return candidates.find((p) => existsSync(p)) ?? null;
}

async function waitForServer(timeoutMs = 45_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.ok || res.status === 503) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Server did not come up on ${BASE} within ${timeoutMs}ms`);
}

let child = null;
const serverLog = [];

async function startServer() {
  const entry = serverEntry();
  const env = {
    ...process.env,
    NODE_ENV: "production",
    PORT: String(PORT),
    HOSTNAME: "127.0.0.1",
    DATABASE_URL,
    NEXT_PUBLIC_SITE_URL: BASE,
    RAZORPAY_WEBHOOK_SECRET,
    STRIPE_WEBHOOK_SECRET,
    RAZORPAY_KEY_ID: "rzp_test_integration",
    RAZORPAY_KEY_SECRET: "rzp_test_secret",
    [`RAZORPAY_PLAN_${APP.replace(/^\d+-/, "").toUpperCase().replace(/-/g, "_")}_PRO`]: "plan_test_pro",
    CRON_SECRET: "test_cron_secret",
    ANON_DAILY_LIMIT: "3",
    LOG_LEVEL: "warn",
    // Burst limiting off: this test fires far faster than a human and is not
    // trying to test the burst limiter, which has its own case below.
    RATE_LIMIT_PER_MIN: "0",
  };

  if (entry) {
    child = spawn(process.execPath, [entry], { env, cwd: dirname(entry), stdio: ["ignore", "pipe", "pipe"] });
  } else {
    const next = join(ROOT, "node_modules", ".bin", "next");
    const local = join(APP_DIR, "node_modules", ".bin", "next");
    const bin = existsSync(local) ? local : next;
    if (!existsSync(bin)) throw new Error("No standalone build and no next binary. Run `pnpm build` first.");
    child = spawn(bin, ["start", "-p", String(PORT), "-H", "127.0.0.1"], {
      env,
      cwd: APP_DIR,
      stdio: ["ignore", "pipe", "pipe"],
    });
  }

  child.stdout.on("data", (d) => serverLog.push(String(d)));
  child.stderr.on("data", (d) => serverLog.push(String(d)));
  child.on("exit", (code) => {
    if (code !== 0 && code !== null) serverLog.push(`server exited with code ${code}`);
  });

  await waitForServer();
}

function stopServer() {
  if (child && !child.killed) child.kill("SIGTERM");
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const stamp = Date.now();
const EMAIL = `it-${stamp}@example.com`;
const PASSWORD = "integration test 1";
const SECOND_EMAIL = `it2-${stamp}@example.com`;

const productConfig = readFileSync(join(APP_DIR, "lib", "product.ts"), "utf8");
const PRODUCT_SLUG = productConfig.match(/slug:\s*"([^"]+)"/)?.[1] ?? APP.replace(/^\d+-/, "");

/** The sample input, read from the app so this test works for any product. */
function sampleInput() {
  const block = productConfig.match(/sample:\s*\{([\s\S]*?)\n {2}\}/)?.[1] ?? "";
  const out = {};
  for (const m of block.matchAll(/(\w+):\s*("(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g)) {
    out[m[1]] = m[2].slice(1, -1).replace(/\\n/g, "\n").replace(/\\"/g, '"');
  }
  return out;
}

const SAMPLE = sampleInput();

let db;
let userId = null;
let apiKey = null;
let apiKeyId = null;

async function sql(text, params) {
  const { rows } = await db.query(text, params);
  return rows;
}

// ---------------------------------------------------------------------------
// The tests
// ---------------------------------------------------------------------------

async function testHealthAndSchema() {
  group("Health and schema");

  await check("health reports full mode with a database configured", async () => {
    const res = await get("/api/health");
    assertEqual(res.status, 200, "health status");
    assertEqual(res.json.mode, "full", "mode");
    assertEqual(res.json.checks.database.ok, true, "database check");
    assert(res.json.checks.database.latencyMs !== null, "latency should be measured");
  });

  await check("metrics are exposed in Prometheus format", async () => {
    const res = await get("/api/metrics");
    assertEqual(res.status, 200, "metrics status");
    assert(res.headers.get("content-type")?.includes("text/plain"), "should be text/plain");
    assert(res.text.includes("# TYPE"), "should contain TYPE hints");
    assert(res.text.includes("sfs_database_up 1"), "should report the database as up");
  });
}

async function testSchemaWasApplied() {
  // Deliberately checked after the first authenticated request, not before: the
  // schema is applied lazily on first use, and /api/health must stay a read-only
  // probe rather than a thing that mutates the database.
  await check("the app applied its own schema on first use", async () => {
    const tables = (
      await sql(
        `SELECT table_name FROM information_schema.tables
          WHERE table_schema = 'public'`,
      )
    ).map((r) => r.table_name);
    for (const t of ["users", "sessions", "password_resets", "api_keys", "subscriptions", "webhook_events", "usage_events"]) {
      assert(tables.includes(t), `missing table ${t}`);
    }
  });
}

async function testSignup() {
  group("Signup and sessions");

  await check("a weak password is refused", async () => {
    const res = await post("/api/auth/signup", { email: `weak-${stamp}@example.com`, password: "short" });
    assertEqual(res.status, 400, "status");
    assert(/10 characters/.test(res.json.error), `unexpected error: ${res.json.error}`);
  });

  await check("an invalid email is refused", async () => {
    const res = await post("/api/auth/signup", { email: "not-an-email", password: PASSWORD });
    assertEqual(res.status, 400, "status");
  });

  await check("signup creates an account and sets a session cookie", async () => {
    const res = await post("/api/auth/signup", { email: EMAIL, password: PASSWORD, name: "Integration Test" });
    assertEqual(res.status, 200, `status (body: ${res.text.slice(0, 200)})`);
    assertEqual(res.json.data.email, EMAIL, "email");
    assert(jar.has("sfs_session"), "no session cookie was set");
    userId = res.json.data.id;
  });

  await check("the password is not stored in plain text", async () => {
    const [row] = await sql(`SELECT password_hash FROM users WHERE id = $1`, [userId]);
    assert(!row.password_hash.includes(PASSWORD), "the password appears in the stored hash");
    assert(row.password_hash.startsWith("scrypt$16384$8$1$"), `unexpected hash format: ${row.password_hash.slice(0, 20)}`);
  });

  await check("the session token is stored hashed, not raw", async () => {
    const token = jar.get("sfs_session");
    const [row] = await sql(`SELECT token_hash FROM sessions WHERE user_id = $1`, [userId]);
    assert(row.token_hash !== token, "the raw session token is in the database");
    assertEqual(row.token_hash.length, 64, "token_hash should be a sha256 hex digest");
  });

  await check("signing up twice with the same email is refused", async () => {
    const res = await post("/api/auth/signup", { email: EMAIL, password: PASSWORD }, { cookies: false });
    assertEqual(res.status, 409, "status");
  });

  await check("the email is treated case-insensitively", async () => {
    const res = await post("/api/auth/signup", { email: EMAIL.toUpperCase(), password: PASSWORD }, { cookies: false });
    assertEqual(res.status, 409, "uppercase variant should collide");
  });

  await check("the dashboard is reachable while signed in", async () => {
    const res = await get("/dashboard");
    assertEqual(res.status, 200, "status");
    assert(res.text.includes(EMAIL), "dashboard should show the signed-in email");
  });
}

async function testLoginLogout() {
  group("Login and logout");

  await check("logout clears the cookie", async () => {
    const res = await post("/api/auth/logout");
    assertEqual(res.status, 200, "status");
    assert(!jar.has("sfs_session"), "cookie should be cleared");
  });

  await check("the dashboard redirects once signed out", async () => {
    const res = await get("/dashboard");
    assertEqual(res.status, 307, "should redirect");
    assert(res.headers.get("location")?.includes("/login"), "should redirect to /login");
  });

  await check("the wrong password is refused", async () => {
    const res = await post("/api/auth/login", { email: EMAIL, password: "wrong password 1" });
    assertEqual(res.status, 401, "status");
    assert(!jar.has("sfs_session"), "no session should be issued");
  });

  await check("an unknown email gives the same answer as a wrong password", async () => {
    const a = await post("/api/auth/login", { email: `nobody-${stamp}@example.com`, password: PASSWORD });
    const b = await post("/api/auth/login", { email: EMAIL, password: "wrong password 2" });
    assertEqual(a.status, b.status, "status should not reveal whether the account exists");
    assertEqual(a.json.error, b.json.error, "error text should not reveal whether the account exists");
  });

  await check("the correct password signs in", async () => {
    const res = await post("/api/auth/login", { email: EMAIL, password: PASSWORD });
    assertEqual(res.status, 200, `status (body: ${res.text.slice(0, 200)})`);
    assert(jar.has("sfs_session"), "session cookie should be set");
  });

  await check("a forged session cookie is rejected", async () => {
    const good = jar.get("sfs_session");
    jar.set("sfs_session", "a".repeat(43));
    const res = await get("/dashboard");
    // Middleware lets it through (a cookie is present), the page then rejects it.
    assert(res.status === 307 || !res.text.includes(EMAIL), "a forged cookie must not authenticate");
    jar.set("sfs_session", good);
  });
}

async function testFreePlanAndQuota() {
  group("Free plan, metering and quota");

  await check("a new account is on the free plan with no API access", async () => {
    const res = await post("/api/keys", { name: "should-fail" });
    assertEqual(res.status, 402, `status (body: ${res.text.slice(0, 200)})`);
    assert(/[Uu]pgrade/.test(res.json.error), `error should mention upgrading: ${res.json.error}`);
  });

  await check("a session-authenticated run succeeds and is metered", async () => {
    const before = Number((await sql(`SELECT COALESCE(SUM(units),0) s FROM usage_events WHERE user_id = $1`, [userId]))[0].s);
    const res = await post("/api/v1/run", SAMPLE);
    assertEqual(res.status, 200, `status (body: ${res.text.slice(0, 300)})`);
    assert(res.json.data.headline?.length > 0, "result should have a headline");
    const after = Number((await sql(`SELECT COALESCE(SUM(units),0) s FROM usage_events WHERE user_id = $1`, [userId]))[0].s);
    assertEqual(after, before + 1, "exactly one unit should be metered");
  });

  await check("quota headers are returned", async () => {
    const res = await post("/api/v1/run", SAMPLE);
    assertEqual(res.status, 200, "status");
    assert(res.headers.get("x-quota-limit") === "25", `limit header: ${res.headers.get("x-quota-limit")}`);
    assert(Number(res.headers.get("x-quota-used")) > 0, "used header should be positive");
  });

  await check("an invalid body is refused and not billed", async () => {
    const before = Number((await sql(`SELECT COALESCE(SUM(units),0) s FROM usage_events WHERE user_id = $1`, [userId]))[0].s);
    const res = await post("/api/v1/run", { nothing: "useful" });
    assertEqual(res.status, 400, "status");
    assert(Array.isArray(res.json.details.missingRequiredFields), "should name the missing fields");
    const after = Number((await sql(`SELECT COALESCE(SUM(units),0) s FROM usage_events WHERE user_id = $1`, [userId]))[0].s);
    assertEqual(after, before, "a rejected request must not be billed");
  });

  await check("usage is scoped to this product only", async () => {
    /*
     * Checked behaviourally, via the quota headers, rather than by searching the
     * dashboard HTML for a magic number.
     *
     * The string-search version passed for nineteen products and failed for
     * PaySlipIN, whose pricing page legitimately contains "₹999" — a false
     * positive that looked exactly like a cross-product usage leak. Asserting on
     * the number the quota actually counted tests the thing we care about and
     * cannot be confused by page copy.
     *
     * Deliberately placed before quota exhaustion: once the quota is spent every
     * run returns 402 and the headers no longer move, so this has to run while
     * there is still allowance left.
     */
    const before = Number((await post("/api/v1/run", SAMPLE)).headers.get("x-quota-used"));

    await sql(
      `INSERT INTO usage_events (product, user_id, endpoint, status, units)
       VALUES ('some-other-product', $1, '/api/v1/run', 200, 999)`,
      [userId],
    );

    const after = Number((await post("/api/v1/run", SAMPLE)).headers.get("x-quota-used"));
    assertEqual(after, before + 1, "999 units billed to another product must not count against this one");

    await sql(`DELETE FROM usage_events WHERE product = 'some-other-product'`);
  });

  await check("exhausting the monthly quota returns 402", async () => {
    // Fast-forward by inserting usage directly rather than making 25 real calls.
    await sql(
      `INSERT INTO usage_events (product, user_id, endpoint, status, units)
       SELECT $1, $2, '/api/v1/run', 200, 1 FROM generate_series(1, 30)`,
      [PRODUCT_SLUG, userId],
    );
    const res = await post("/api/v1/run", SAMPLE);
    assertEqual(res.status, 402, `status (body: ${res.text.slice(0, 200)})`);
    assertEqual(res.headers.get("x-quota-remaining"), "0", "remaining header");
    assert(/upgrade|limit/i.test(res.json.error), `error should explain: ${res.json.error}`);
  });

  await check("a refused-for-quota request is recorded with zero units", async () => {
    const [row] = await sql(
      `SELECT units, status FROM usage_events
        WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId],
    );
    assertEqual(Number(row.units), 0, "units");
    assertEqual(row.status, 402, "status");
  });

}

async function testAnonymousLimit() {
  group("Anonymous allowance");

  await check("anonymous callers get a small daily allowance, then 429", async () => {
    const anonHeaders = { "x-forwarded-for": `203.0.113.${stamp % 250}` };
    let sawSuccess = 0;
    let sawRefusal = false;
    for (let i = 0; i < 5; i += 1) {
      const res = await post("/api/v1/run", SAMPLE, { cookies: false, headers: anonHeaders });
      if (res.status === 200) sawSuccess += 1;
      if (res.status === 429) {
        sawRefusal = true;
        break;
      }
    }
    assertEqual(sawSuccess, 3, "ANON_DAILY_LIMIT=3 should allow exactly three");
    assert(sawRefusal, "the fourth anonymous call should be refused");
  });

  await check("the anonymous refusal invites a signup rather than a payment", async () => {
    const res = await post("/api/v1/run", SAMPLE, {
      cookies: false,
      headers: { "x-forwarded-for": `203.0.113.${stamp % 250}` },
    });
    // 429, not 402. The allowance resets tomorrow and nothing needs to be paid,
    // so "retry later / sign up" is the honest answer. 402 is reserved for a real
    // plan limit where the fix is money.
    assertEqual(res.status, 429, "status");
    assert(/free account/i.test(res.json.error), `should invite a signup: ${res.json.error}`);
  });

  await check("a different IP has its own allowance", async () => {
    const res = await post("/api/v1/run", SAMPLE, {
      cookies: false,
      headers: { "x-forwarded-for": `198.51.100.${(stamp + 7) % 250}` },
    });
    assertEqual(res.status, 200, "a fresh IP should be allowed");
  });

  await check("GET on the run endpoint documents itself without authentication", async () => {
    const res = await get("/api/v1/run", { cookies: false });
    assertEqual(res.status, 200, "status");
    assert(Array.isArray(res.json.data.inputSchema), "should publish an input schema");
    assert(res.json.data.limits.plans.length === 3, "should publish all three plans");
  });
}

async function testUpgradeAndApiKeys() {
  group("Upgrade, API keys and paid access");

  await check("a webhook with a bad signature is rejected", async () => {
    const body = JSON.stringify({ event: "subscription.activated", payload: {} });
    const res = await post("/api/billing/webhook", undefined, {
      raw: true,
      body,
      headers: { "Content-Type": "application/json", "x-razorpay-signature": "deadbeef" },
      cookies: false,
    });
    assertEqual(res.status, 400, "status");
    assert(/signature/i.test(res.json.error), "should mention the signature");
  });

  await check("a signed Razorpay activation upgrades the account", async () => {
    const event = {
      event: "subscription.activated",
      payload: {
        subscription: {
          entity: {
            id: `sub_test_${stamp}`,
            plan_id: "plan_test_pro",
            status: "active",
            customer_id: `cust_test_${stamp}`,
            current_end: Math.floor(Date.now() / 1000) + 30 * 86_400,
            notes: { user_id: userId, product: PRODUCT_SLUG, plan_code: "pro" },
          },
        },
      },
    };
    const body = JSON.stringify(event);
    const signature = createHmac("sha256", RAZORPAY_WEBHOOK_SECRET).update(body).digest("hex");
    const res = await post("/api/billing/webhook", undefined, {
      raw: true,
      body,
      headers: {
        "Content-Type": "application/json",
        "x-razorpay-signature": signature,
        "x-razorpay-event-id": `evt_test_${stamp}`,
      },
      cookies: false,
    });
    assertEqual(res.status, 200, `status (body: ${res.text.slice(0, 300)})`);
    assertEqual(res.json.data.handled, true, `handled (detail: ${res.json.data.detail})`);

    const [sub] = await sql(`SELECT plan_code, status FROM subscriptions WHERE user_id = $1 AND product = $2`, [
      userId,
      PRODUCT_SLUG,
    ]);
    assert(sub, "no subscription row was created");
    assertEqual(sub.plan_code, "pro", "plan_code");
    assertEqual(sub.status, "active", "status");
  });

  await check("replaying the same webhook changes nothing", async () => {
    const event = {
      event: "subscription.activated",
      payload: { subscription: { entity: { id: `sub_test_${stamp}`, plan_id: "plan_test_pro", status: "active", notes: { user_id: userId, product: PRODUCT_SLUG, plan_code: "pro" } } } },
    };
    const body = JSON.stringify(event);
    const signature = createHmac("sha256", RAZORPAY_WEBHOOK_SECRET).update(body).digest("hex");
    const res = await post("/api/billing/webhook", undefined, {
      raw: true,
      body,
      headers: {
        "Content-Type": "application/json",
        "x-razorpay-signature": signature,
        "x-razorpay-event-id": `evt_test_${stamp}`,
      },
      cookies: false,
    });
    assertEqual(res.status, 200, "status");
    assertEqual(res.json.data.duplicate, true, "should be recognised as a duplicate");

    const rows = await sql(`SELECT count(*)::int c FROM webhook_events WHERE event_id = $1`, [`evt_test_${stamp}`]);
    assertEqual(rows[0].c, 1, "the event should be stored exactly once");
  });

  await check("the paid plan raises the quota, so runs work again", async () => {
    const res = await post("/api/v1/run", SAMPLE);
    assertEqual(res.status, 200, `status (body: ${res.text.slice(0, 200)})`);
    assertEqual(res.headers.get("x-quota-limit"), "5000", "the pro limit should now apply");
  });

  await check("a paid account can create an API key", async () => {
    const res = await post("/api/keys", { name: "integration" });
    assertEqual(res.status, 201, `status (body: ${res.text.slice(0, 200)})`);
    assert(res.json.data.key.startsWith(`sk_${PRODUCT_SLUG}_`), `unexpected key shape: ${res.json.data.key}`);
    apiKey = res.json.data.key;
    apiKeyId = res.json.data.id;
  });

  await check("the API key is stored hashed, not raw", async () => {
    const [row] = await sql(`SELECT key_hash, key_prefix FROM api_keys WHERE id = $1`, [apiKeyId]);
    assert(row.key_hash !== apiKey, "the raw key is in the database");
    assert(!apiKey.includes(row.key_hash), "the hash should not be a substring of the key");
    assert(apiKey.startsWith(row.key_prefix), "prefix should match the start of the key");
  });

  await check("the key authenticates a run with no cookie", async () => {
    const res = await post("/api/v1/run", SAMPLE, {
      cookies: false,
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    assertEqual(res.status, 200, `status (body: ${res.text.slice(0, 200)})`);
    assertEqual(res.json.usage.plan, "pro", "should be billed on the pro plan");
  });

  await check("the x-api-key header works too", async () => {
    const res = await post("/api/v1/run", SAMPLE, { cookies: false, headers: { "x-api-key": apiKey } });
    assertEqual(res.status, 200, "status");
  });

  await check("using the key records last_used_at", async () => {
    const [row] = await sql(`SELECT last_used_at FROM api_keys WHERE id = $1`, [apiKeyId]);
    assert(row.last_used_at !== null, "last_used_at should be set");
  });

  await check("an invented key is refused", async () => {
    const res = await post("/api/v1/run", SAMPLE, {
      cookies: false,
      headers: { Authorization: `Bearer sk_${PRODUCT_SLUG}_${"f".repeat(48)}` },
    });
    assertEqual(res.status, 401, "status");
  });

  await check("a revoked key stops working immediately", async () => {
    const revoked = await del(`/api/keys/${apiKeyId}`);
    assertEqual(revoked.status, 200, "revoke status");
    const res = await post("/api/v1/run", SAMPLE, {
      cookies: false,
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    assertEqual(res.status, 401, "a revoked key must be refused");
  });

  await check("one user cannot revoke another user's key", async () => {
    const fresh = await post("/api/keys", { name: "victim" });
    assertEqual(fresh.status, 201, "setup: create a key");
    const victimKeyId = fresh.json.data.id;

    const otherJar = new Map(jar);
    jar.clear();
    await post("/api/auth/signup", { email: SECOND_EMAIL, password: PASSWORD });
    const attempt = await del(`/api/keys/${victimKeyId}`);
    assertEqual(attempt.status, 404, "should not find another user's key");

    jar.clear();
    for (const [k, v] of otherJar) jar.set(k, v);

    const [row] = await sql(`SELECT revoked_at FROM api_keys WHERE id = $1`, [victimKeyId]);
    assertEqual(row.revoked_at, null, "the key must not have been revoked");
  });
}

async function testPasswordReset() {
  group("Password reset");

  let token = null;

  await check("requesting a reset for an unknown email looks identical", async () => {
    const a = await post("/api/auth/reset", { email: `ghost-${stamp}@example.com` }, { cookies: false });
    const b = await post("/api/auth/reset", { email: EMAIL }, { cookies: false });
    assertEqual(a.status, b.status, "status must not disclose existence");
    assertEqual(a.json.data.note, b.json.data.note, "message must not disclose existence");
  });

  await check("a reset token was created and stored hashed", async () => {
    const rows = await sql(
      `SELECT token_hash, expires_at, used_at FROM password_resets
        WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId],
    );
    assert(rows.length === 1, "no reset row was created");
    assertEqual(rows[0].token_hash.length, 64, "should be a sha256 digest");
    assertEqual(rows[0].used_at, null, "should be unused");
    assert(rows[0].expires_at > new Date(), "should not be expired");
  });

  await check("a fabricated token is refused", async () => {
    const res = await post("/api/auth/reset", { token: "b".repeat(43), password: "brand new pass 1" }, { cookies: false });
    assertEqual(res.status, 400, "status");
  });

  await check("the real token sets a new password", async () => {
    // The email is not sent in tests, so read the token the way the mailer would
    // have received it: by re-issuing and capturing it from the log line.
    const logBefore = serverLog.length;
    await post("/api/auth/reset", { email: EMAIL }, { cookies: false });
    await new Promise((r) => setTimeout(r, 300));
    const logs = serverLog.slice(logBefore).join("");
    token = logs.match(/reset-password\?token=([A-Za-z0-9_%-]+)/)?.[1];
    assert(token, `could not recover the reset token from the logs: ${logs.slice(0, 400)}`);
    token = decodeURIComponent(token);

    const res = await post("/api/auth/reset", { token, password: "brand new pass 1" }, { cookies: false });
    assertEqual(res.status, 200, `status (body: ${res.text.slice(0, 200)})`);
  });

  await check("the token cannot be used twice", async () => {
    const res = await post("/api/auth/reset", { token, password: "another new pass 1" }, { cookies: false });
    assertEqual(res.status, 400, "a consumed token must be refused");
  });

  await check("the old password no longer works", async () => {
    jar.clear();
    const res = await post("/api/auth/login", { email: EMAIL, password: PASSWORD });
    assertEqual(res.status, 401, "status");
  });

  await check("the new password works", async () => {
    const res = await post("/api/auth/login", { email: EMAIL, password: "brand new pass 1" });
    assertEqual(res.status, 200, `status (body: ${res.text.slice(0, 200)})`);
  });

  await check("resetting signs out every other session", async () => {
    const [row] = await sql(`SELECT count(*)::int c FROM sessions WHERE user_id = $1`, [userId]);
    assertEqual(row.c, 1, "only the session created by the fresh login should remain");
  });
}

async function testBurstLimit() {
  group("Burst limiting");

  await check("a burst above the per-minute limit is refused with 429", async () => {
    // The server runs with RATE_LIMIT_PER_MIN=0 (off), so this exercises the
    // limiter directly on the signup route, which sets its own limit of 10.
    let saw429 = false;
    for (let i = 0; i < 14; i += 1) {
      const res = await post(
        "/api/auth/signup",
        { email: `burst-${stamp}-${i}@example.com`, password: PASSWORD },
        { cookies: false, headers: { "x-forwarded-for": "192.0.2.77" } },
      );
      if (res.status === 429) {
        saw429 = true;
        assert(res.json.error.includes("Rate limit"), `unexpected error: ${res.json.error}`);
        break;
      }
    }
    assert(saw429, "the limiter never engaged");
  });
}

async function testCronAndRetention() {
  group("Retention job");

  await check("the purge route refuses an unauthenticated call", async () => {
    const res = await get("/api/cron/purge", { cookies: false });
    assertEqual(res.status, 401, "status");
  });

  await check("the purge route deletes expired sessions and used resets", async () => {
    await sql(
      `INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, now() - interval '1 day')`,
      [userId, "e".repeat(64)],
    );
    const res = await get("/api/cron/purge", {
      cookies: false,
      headers: { Authorization: "Bearer test_cron_secret" },
    });
    assertEqual(res.status, 200, `status (body: ${res.text.slice(0, 200)})`);
    assert(Number(res.json.data.sessions) >= 1, `expected at least one session purged, got ${res.json.data.sessions}`);

    const [row] = await sql(`SELECT count(*)::int c FROM sessions WHERE token_hash = $1`, ["e".repeat(64)]);
    assertEqual(row.c, 0, "the expired session should be gone");
  });

  await check("the schema is idempotent — purge_expired survives re-application", async () => {
    const schema = readFileSync(join(APP_DIR, "db", "schema.sql"), "utf8");
    await db.query(schema);
    const [row] = await sql(`SELECT * FROM purge_expired(400)`);
    assert("sessions" in row && "usage" in row, "purge_expired should still return its four counts");
  });
}

async function testDemoModeIsolation() {
  group("Cross-cutting");

  await check("security headers are present on the landing page", async () => {
    const res = await get("/", { cookies: false });
    assertEqual(res.status, 200, "status");
    assertEqual(res.headers.get("x-frame-options"), "DENY", "X-Frame-Options");
    assertEqual(res.headers.get("x-content-type-options"), "nosniff", "X-Content-Type-Options");
  });

  await check("CORS is open on the public API", async () => {
    const res = await get("/api/v1/run", { cookies: false });
    assertEqual(res.headers.get("access-control-allow-origin"), "*", "public API should allow cross-origin");
  });

  await check("CORS is NOT open on the auth or billing endpoints", async () => {
    for (const path of ["/api/auth/login", "/api/keys", "/api/billing/checkout"]) {
      const res = await post(path, {}, { cookies: false });
      assertEqual(res.headers.get("access-control-allow-origin"), null, `${path} must not advertise CORS`);
    }
  });
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\x1b[1mIntegration test\x1b[0m  app=${APP}  slug=${PRODUCT_SLUG}  port=${PORT}`);
  console.log(`Database: ${DATABASE_URL.replace(/:[^:@/]*@/, ":***@")}`);

  db = new Client({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
  });
  await db.connect();

  try {
    await startServer();

    await testHealthAndSchema();
    await testSignup();
    await testSchemaWasApplied();
    await testLoginLogout();
    await testFreePlanAndQuota();
    await testAnonymousLimit();
    await testUpgradeAndApiKeys();
    await testPasswordReset();
    await testBurstLimit();
    await testCronAndRetention();
    await testDemoModeIsolation();
  } catch (err) {
    failures.push({ group: "harness", name: "setup", message: err?.message ?? String(err) });
    console.error(`\n\x1b[31mHarness error: ${err?.message ?? err}\x1b[0m`);
    if (serverLog.length > 0) console.error(serverLog.join("").slice(-3000));
  } finally {
    stopServer();
    // Leave no test rows behind.
    try {
      await db.query(`DELETE FROM users WHERE email LIKE $1`, [`%-${stamp}@example.com`]);
      await db.query(`DELETE FROM users WHERE email LIKE 'burst-%@example.com'`);
      await db.query(`DELETE FROM webhook_events WHERE event_id LIKE $1`, [`evt_test_${stamp}%`]);
      await db.query(`DELETE FROM usage_events WHERE ip LIKE '203.0.113.%' OR ip LIKE '198.51.100.%' OR ip = '0.0.0.0'`);
    } catch (err) {
      console.error(`Cleanup warning: ${err.message}`);
    }
    await db.end();
  }

  console.log(`\n${"─".repeat(60)}`);
  if (failures.length === 0) {
    console.log(`\x1b[32m\x1b[1mAll ${passed} checks passed.\x1b[0m`);
    process.exit(0);
  }
  console.log(`\x1b[31m\x1b[1m${failures.length} failed\x1b[0m, ${passed} passed\n`);
  for (const f of failures) console.log(`  \x1b[31m✗\x1b[0m ${f.group} → ${f.name}\n    ${f.message}`);
  process.exit(1);
}

await main();
