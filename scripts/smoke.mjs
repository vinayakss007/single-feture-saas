#!/usr/bin/env node
/**
 * End-to-end smoke test for all ten products.
 *
 * For each app it starts the production server, reads the example payload from
 * the product's own self-describing schema endpoint, POSTs it, and asserts the
 * engine returns a usable result. Because the example comes from the API itself,
 * this also verifies that the documented contract and the real one agree.
 *
 *   node scripts/smoke.mjs
 */

import { spawn } from "node:child_process";
import { readdirSync, existsSync, cpSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const appsDir = join(root, "apps");
const apps = readdirSync(appsDir).filter((d) => /^\d\d-/.test(d)).sort();

const BOOT_TIMEOUT_MS = 40_000;
const RUN_TIMEOUT_MS = 45_000;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForHealth(port) {
  const deadline = Date.now() + BOOT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/health`);
      if (res.ok) return await res.json();
    } catch {
      /* not up yet */
    }
    await sleep(500);
  }
  throw new Error(`server did not become healthy within ${BOOT_TIMEOUT_MS / 1000}s`);
}

/**
 * In a pnpm workspace, `output: "standalone"` nests the server under
 * .next/standalone/<workspace-relative-path>/server.js. In a single-app Docker
 * build context it lands at the root instead. Resolve it either way.
 */
function findStandaloneServer(appPath) {
  const candidates = [
    join(appPath, ".next/standalone/server.js"),
    join(appPath, ".next/standalone/apps", app0(appPath), "server.js"),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  // Fall back to a shallow search.
  const base = join(appPath, ".next/standalone");
  const stack = [base];
  while (stack.length > 0) {
    const dir = stack.pop();
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isFile() && entry.name === "server.js") return full;
      if (entry.isDirectory() && entry.name !== "node_modules") stack.push(full);
    }
  }
  throw new Error("standalone server.js not found — run `pnpm -r run build` first");
}

function app0(appPath) {
  const parts = appPath.split("/");
  return parts[parts.length - 1];
}

async function testApp(app, port) {
  const appPath = join(appsDir, app);
  const serverPath = findStandaloneServer(appPath);
  const serverRoot = dirname(serverPath);

  // Standalone output excludes static assets by design; wire them up.
  cpSync(join(appPath, ".next/static"), join(serverRoot, ".next/static"), { recursive: true, force: true });
  if (existsSync(join(appPath, "public"))) {
    cpSync(join(appPath, "public"), join(serverRoot, "public"), { recursive: true, force: true });
  }

  const child = spawn("node", [serverPath], {
    cwd: serverRoot,
    // Next's standalone server binds to process.env.HOSTNAME, which defaults to
    // the machine hostname rather than loopback. Same reason the Dockerfile sets it.
    env: { ...process.env, PORT: String(port), HOSTNAME: "0.0.0.0", NODE_ENV: "production" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stderr = "";
  child.stderr.on("data", (c) => {
    stderr += c.toString();
  });

  try {
    const health = await waitForHealth(port);

    // The example payload is published by the product itself.
    const schemaRes = await fetch(`http://127.0.0.1:${port}/api/v1/run`);
    const schema = await schemaRes.json();
    if (!schema.ok) throw new Error("schema endpoint did not return ok");
    const example = schema.data.example;
    if (!example || Object.keys(example).length === 0) throw new Error("product publishes no example payload");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), RUN_TIMEOUT_MS);
    const runRes = await fetch(`http://127.0.0.1:${port}/api/v1/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(example),
      signal: controller.signal,
    });
    clearTimeout(timer);

    const payload = await runRes.json();
    if (!payload.ok) throw new Error(`run failed: ${payload.error}`);

    const d = payload.data;
    const problems = [];
    if (!d.headline || d.headline.length < 20) problems.push("headline missing or too short");
    if (!d.json) problems.push("no machine payload");
    const sectionItems = (d.sections ?? []).reduce((s, x) => s + x.items.length, 0);
    const copyBlocks = (d.copyBlocks ?? []).length;
    if (sectionItems === 0 && copyBlocks === 0 && !d.table) problems.push("result has no content at all");
    for (const b of d.copyBlocks ?? []) {
      if (!b.text || b.text.trim().length === 0) problems.push(`empty copy block: ${b.title}`);
      if (/undefined|NaN|\[object Object\]/.test(b.text)) problems.push(`copy block contains a rendering bug: ${b.title}`);
    }
    if (/undefined|NaN|\[object Object\]/.test(d.headline)) problems.push("headline contains a rendering bug");

    // Landing page and demo page must render.
    for (const path of ["/", "/app"]) {
      const res = await fetch(`http://127.0.0.1:${port}${path}`);
      if (!res.ok) problems.push(`${path} returned HTTP ${res.status}`);
      else {
        const html = await res.text();
        if (!html.includes(schema.data.product)) problems.push(`${path} does not render the product name`);
      }
    }

    return {
      app,
      product: schema.data.product,
      ok: problems.length === 0,
      problems,
      tookMs: payload.tookMs,
      headline: d.headline,
      score: d.score ? `${d.score.value}/${d.score.max} ${d.score.band}` : "—",
      metrics: (d.metrics ?? []).map((m) => `${m.label}=${m.value}`).join(", "),
      sections: (d.sections ?? []).length,
      sectionItems,
      copyBlocks,
      hasTable: Boolean(d.table),
      authRequired: health.authRequired,
    };
  } catch (err) {
    return { app, ok: false, problems: [err.message], stderr: stderr.slice(-600) };
  } finally {
    child.kill("SIGTERM");
    await sleep(250);
    if (!child.killed) child.kill("SIGKILL");
  }
}

const results = [];
let port = 3400;
for (const app of apps) {
  process.stdout.write(`→ ${app} … `);
  const r = await testApp(app, port++);
  results.push(r);
  console.log(r.ok ? `PASS (${r.tookMs}ms)` : `FAIL — ${r.problems.join("; ")}`);
  if (r.ok) {
    console.log(`   ${r.product}: ${r.headline}`);
    console.log(`   score ${r.score} · ${r.sections} sections / ${r.sectionItems} items · ${r.copyBlocks} copy blocks · table: ${r.hasTable}`);
    console.log(`   ${r.metrics}`);
  } else if (r.stderr) {
    console.log(`   stderr: ${r.stderr}`);
  }
  console.log("");
}

const failed = results.filter((r) => !r.ok);
console.log("─".repeat(72));
console.log(`${results.length - failed.length}/${results.length} products passed`);
if (failed.length > 0) {
  for (const f of failed) console.log(`  FAIL ${f.app}: ${f.problems.join("; ")}`);
  process.exit(1);
}
