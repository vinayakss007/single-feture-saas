#!/usr/bin/env node
/**
 * Exercises every product's MCP server over real stdio JSON-RPC.
 *
 * This exists because the MCP surface is the one contract nothing else tested.
 * `smoke.mjs` covers HTTP and `test-integration.mjs` covers auth and billing, but
 * an agent talks to `mcp/server.mjs`, and that path had only ever been checked by
 * hand — on ten of the twenty products, before the other ten existed.
 *
 * The server derives its tool schema from the product's own `GET /api/v1/run`, so
 * this also proves the agent-facing contract cannot drift from the REST contract:
 * if a product's inputs change and the schema does not follow, tools/call fails
 * here.
 *
 * Every product runs in demo mode with no environment, exactly as in smoke.mjs,
 * so the result cannot depend on a database or on the developer's shell.
 *
 *   node scripts/test-mcp.mjs                    # all products
 *   node scripts/test-mcp.mjs --app 11-aiactnotice
 */

import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const APPS_DIR = join(ROOT, "apps");
const PROTOCOL_VERSION = "2024-11-05";

const argApp = process.argv.indexOf("--app");
const only = argApp > -1 ? process.argv[argApp + 1] : null;

/** Same reasoning as smoke.mjs: the check must control the environment, not inherit it. */
const DEMO_MODE_OVERRIDES = [
  "DATABASE_URL",
  "API_KEYS",
  "RATE_LIMIT_PER_MIN",
  "ANON_DAILY_LIMIT",
  "RAZORPAY_KEY_ID",
  "STRIPE_SECRET_KEY",
  "RESEND_API_KEY",
  "CRON_SECRET",
  "METRICS_TOKEN",
  "ALERT_WEBHOOK_URL",
  "NEXT_PUBLIC_SITE_URL",
];

function demoEnv(extra) {
  const env = { ...process.env, ...extra };
  for (const key of DEMO_MODE_OVERRIDES) delete env[key];
  return env;
}

function apps() {
  return readdirSync(APPS_DIR)
    .filter((d) => /^\d\d-/.test(d))
    .filter((d) => (only ? d === only : true))
    .sort();
}

function serverEntry(appDir, app) {
  // pnpm workspaces nest the standalone output; a single-app context does not.
  const candidates = [
    join(appDir, ".next", "standalone", "apps", app, "server.js"),
    join(appDir, ".next", "standalone", "server.js"),
  ];
  return candidates.find((p) => existsSync(p)) ?? null;
}

async function waitForHttp(base, timeoutMs = 45_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${base}/api/health`);
      if (res.ok || res.status === 503) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`product server did not start on ${base}`);
}

/**
 * A minimal MCP client: writes newline-delimited JSON-RPC to the server's stdin
 * and resolves each request by id. Deliberately not using an SDK — the point is to
 * prove the wire format is correct, and a client library would paper over exactly
 * the mistakes worth catching.
 */
function mcpClient(entryPath, cwd, env) {
  const child = spawn(process.execPath, [entryPath], { cwd, env, stdio: ["pipe", "pipe", "pipe"] });
  const pending = new Map();
  const stderr = [];
  let buffer = "";
  const notifications = [];

  child.stdout.on("data", (chunk) => {
    buffer += String(chunk);
    let index;
    while ((index = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, index).trim();
      buffer = buffer.slice(index + 1);
      if (!line) continue;
      let msg;
      try {
        msg = JSON.parse(line);
      } catch {
        stderr.push(`NON-JSON LINE ON STDOUT: ${line.slice(0, 200)}`);
        continue;
      }
      if (msg.id !== undefined && pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
      } else {
        notifications.push(msg);
      }
    }
  });
  child.stderr.on("data", (chunk) => stderr.push(String(chunk)));

  let nextId = 1;

  function request(method, params, timeoutMs = 30_000) {
    const id = nextId++;
    const message = { jsonrpc: "2.0", id, method, ...(params ? { params } : {}) };
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`${method} timed out after ${timeoutMs}ms. stderr: ${stderr.join("").slice(-300)}`));
      }, timeoutMs);
      pending.set(id, (msg) => {
        clearTimeout(timer);
        resolve(msg);
      });
      child.stdin.write(`${JSON.stringify(message)}\n`);
    });
  }

  function notify(method, params) {
    child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method, ...(params ? { params } : {}) })}\n`);
  }

  return { request, notify, stderr, notifications, close: () => child.kill("SIGTERM") };
}

// ---------------------------------------------------------------------------

let checks = 0;
const failures = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

async function testApp(app, port) {
  const appDir = join(APPS_DIR, app);
  const entry = serverEntry(appDir, app);
  if (!entry) throw new Error(`no standalone build found — run \`pnpm build\` first`);

  const base = `http://127.0.0.1:${port}`;
  const product = spawn(process.execPath, [entry], {
    cwd: dirname(entry),
    env: demoEnv({ PORT: String(port), HOSTNAME: "127.0.0.1", NODE_ENV: "production" }),
    stdio: ["ignore", "pipe", "pipe"],
  });
  const productLog = [];
  product.stdout.on("data", (d) => productLog.push(String(d)));
  product.stderr.on("data", (d) => productLog.push(String(d)));

  let mcp;
  try {
    await waitForHttp(base);

    mcp = mcpClient(join(appDir, "mcp", "server.mjs"), appDir, demoEnv({ SFS_API_URL: base }));

    // --- initialize
    const init = await mcp.request("initialize", {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: "abetworks-mcp-test", version: "1.0.0" },
    });
    assert(!init.error, `initialize returned an error: ${JSON.stringify(init.error)}`);
    assertEqual(init.jsonrpc, "2.0", "initialize jsonrpc version");
    assertEqual(init.result.protocolVersion, PROTOCOL_VERSION, "protocolVersion");
    assert(init.result.capabilities?.tools, "server must advertise tools capability");
    assert(init.result.serverInfo?.name, "serverInfo.name must be set");
    checks += 1;

    // A notification has no id and must produce no reply at all.
    mcp.notify("notifications/initialized");

    // --- ping, which proves the notification did not desynchronise the stream
    const ping = await mcp.request("ping");
    assert(!ping.error, `ping returned an error: ${JSON.stringify(ping.error)}`);
    checks += 1;

    // --- tools/list
    const list = await mcp.request("tools/list");
    assert(!list.error, `tools/list returned an error: ${JSON.stringify(list.error)}`);
    const tools = list.result.tools;
    assert(Array.isArray(tools) && tools.length === 1, `expected exactly one tool, got ${tools?.length}`);
    const tool = tools[0];
    assert(/^[a-z0-9_]+$/.test(tool.name), `tool name "${tool.name}" must be snake_case`);
    assert(tool.description.length > 30, "tool description must be specific enough for an agent to choose it");
    assertEqual(tool.inputSchema.type, "object", "inputSchema.type");
    assert(Object.keys(tool.inputSchema.properties).length > 0, "inputSchema has no properties");
    assert(Array.isArray(tool.inputSchema.required) && tool.inputSchema.required.length > 0, "inputSchema declares no required field");
    // Every required field must exist in properties, or a client cannot satisfy it.
    for (const name of tool.inputSchema.required) {
      assert(name in tool.inputSchema.properties, `required field "${name}" is missing from properties`);
    }
    checks += 1;

    // --- tools/call with the product's own sample, read from the live schema
    const schemaRes = await fetch(`${base}/api/v1/run`);
    const schema = (await schemaRes.json()).data;
    const call = await mcp.request("tools/call", { name: tool.name, arguments: schema.example }, 60_000);
    assert(!call.error, `tools/call returned a protocol error: ${JSON.stringify(call.error)}`);
    assertEqual(call.result.isError, false, `tools/call isError (content: ${JSON.stringify(call.result.content)?.slice(0, 300)})`);
    const text = call.result.content?.[0]?.text ?? "";
    assert(call.result.content[0].type === "text", "content must be a text block");
    const parsed = JSON.parse(text);
    assert(typeof parsed.headline === "string" && parsed.headline.length > 0, "tool result has no headline");
    checks += 1;

    // --- an unknown tool must be refused, not silently run
    const bad = await mcp.request("tools/call", { name: "definitely_not_a_tool", arguments: {} });
    assert(bad.error, "calling an unknown tool must return an error");
    assertEqual(bad.error.code, -32602, "unknown tool error code should be Invalid params");
    checks += 1;

    // --- an unknown method must return Method not found
    const unknown = await mcp.request("resources/list");
    assert(unknown.error, "an unsupported method must return an error");
    assertEqual(unknown.error.code, -32601, "unsupported method error code should be Method not found");
    checks += 1;

    // --- invalid arguments must surface as a tool error, not a crash
    const invalid = await mcp.request("tools/call", { name: tool.name, arguments: {} });
    assert(!invalid.error, "an empty argument object should be a tool error, not a protocol error");
    assertEqual(invalid.result.isError, true, "empty arguments must be reported as a tool error");
    assert(/error/i.test(invalid.result.content[0].text), "the tool error should say what went wrong");
    checks += 1;

    // --- nothing may be written to stdout except JSON-RPC, or the transport breaks
    const junk = mcp.stderr.filter((l) => l.startsWith("NON-JSON LINE ON STDOUT"));
    assert(junk.length === 0, `server wrote non-JSON to stdout: ${junk[0]}`);
    assertEqual(mcp.notifications.length, 0, `server sent ${mcp.notifications.length} unexpected unsolicited messages`);
    checks += 1;

    return { tool: tool.name, headline: parsed.headline };
  } finally {
    mcp?.close();
    product.kill("SIGTERM");
  }
}

// ---------------------------------------------------------------------------

const list = apps();
console.log(`\nMCP protocol test — ${list.length} product${list.length === 1 ? "" : "s"}, 8 checks each\n`);
console.log("─".repeat(72));

let port = 3400;
for (const app of list) {
  process.stdout.write(`→ ${app} … `);
  try {
    const { tool, headline } = await testApp(app, port++);
    console.log("\x1b[32mPASS\x1b[0m");
    console.log(`   ${tool}`);
    console.log(`   ${headline.slice(0, 110)}${headline.length > 110 ? "…" : ""}`);
  } catch (err) {
    console.log("\x1b[31mFAIL\x1b[0m");
    console.log(`   \x1b[31m${err.message}\x1b[0m`);
    failures.push({ app, message: err.message });
  }
}

console.log("─".repeat(72));
if (failures.length === 0) {
  console.log(`\x1b[32m\x1b[1m${list.length}/${list.length} MCP servers passed all ${checks} checks.\x1b[0m\n`);
  process.exit(0);
}
console.log(`\x1b[31m\x1b[1m${failures.length} of ${list.length} MCP servers failed.\x1b[0m`);
for (const f of failures) console.log(`  \x1b[31m✗\x1b[0m ${f.app}: ${f.message}`);
process.exit(1);
