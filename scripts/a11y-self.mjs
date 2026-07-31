#!/usr/bin/env node
/**
 * Audits our own pages with our own accessibility engine.
 *
 * A11yGate (apps/12-a11ygate) sells WCAG 2.2 auditing. If its own suite's landing
 * pages fail the checks it charges for, nothing else in the repository is worth
 * trusting — so this runs the real engine against the real rendered HTML of one
 * product per design family and fails the build on anything it finds.
 *
 * It caught two things on its first run that no amount of reading would have:
 * every table rendered without a <caption>, and — via the contrast work it
 * prompted — eight products shipping white button text at as low as 2.94:1.
 *
 * One product per family rather than all fifty, because the markup is generated from
 * shared components: a finding on one ledger product is a finding on all fourteen,
 * and a per-family sample keeps this at eight boots instead of fifty. The families
 * are discovered from the products themselves, so adding a family or re-theming a
 * product changes the sample automatically.
 *
 * Advisory items are expected and not failures. The engine deliberately returns a
 * fixed list of "a machine cannot judge this" items on every run — that honesty is
 * the product's main design decision — so they are counted and reported but do not
 * fail. Anything with a WCAG success criterion attached does fail.
 *
 *   node --experimental-strip-types scripts/a11y-self.mjs
 *   node --experimental-strip-types scripts/a11y-self.mjs --all   # every product
 */

import { spawn } from "node:child_process";
import { readdirSync, existsSync, cpSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const APPS_DIR = join(ROOT, "apps");
const ALL = process.argv.includes("--all");

/** Pages every product has, and that a visitor actually lands on. */
const PATHS = ["/", "/app", "/login", "/signup"];

const BOOT_TIMEOUT_MS = 40_000;

/**
 * The engine's standing "only a human can check this" list. These are informational
 * by design and must not fail the build — but they are matched on the exact strings
 * so that a genuine finding can never hide by resembling one.
 *
 * The titles sit on the *section*, not on the items inside it: the engine groups its
 * advisory items under one heading and leaves the items untitled. Checking only
 * `item.title` therefore matched nothing and reported all sixty-four advisories as
 * failures on the first run, which is a good illustration of why a check that reports
 * everything is as useless as one that reports nothing.
 */
const ADVISORY_TITLES = new Set(["Still requires a human — do not skip this", "No automated failures"]);

function isAdvisory(section, item) {
  return ADVISORY_TITLES.has(item.title ?? "") || ADVISORY_TITLES.has(section.title ?? "");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function findStandaloneServer(appPath, app) {
  const candidates = [
    join(appPath, ".next/standalone/server.js"),
    join(appPath, ".next/standalone/apps", app, "server.js"),
  ];
  for (const candidate of candidates) if (existsSync(candidate)) return candidate;
  throw new Error(`${app}: standalone server not found — run \`pnpm run build\` first`);
}

async function waitForHealth(port) {
  const deadline = Date.now() + BOOT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/health`);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await sleep(400);
  }
  throw new Error(`server did not become healthy within ${BOOT_TIMEOUT_MS / 1000}s`);
}

/** One product per design family, so every distinct set of markup is covered. */
async function sample() {
  const { designFor } = await import(pathToFileURL(join(ROOT, "_template/lib/design.ts")).href);
  const dirs = readdirSync(APPS_DIR).filter((d) => /^\d\d-/.test(d)).sort();

  const chosen = [];
  const seen = new Set();
  for (const dir of dirs) {
    const { product } = await import(pathToFileURL(join(APPS_DIR, dir, "lib/product.ts")).href);
    const family = designFor(product).family;
    if (ALL || !seen.has(family)) {
      seen.add(family);
      chosen.push({ dir, family, name: product.name });
    }
  }
  return chosen;
}

async function auditApp(engine, { dir, family, name }, port) {
  const appPath = join(APPS_DIR, dir);
  const serverPath = findStandaloneServer(appPath, dir);
  const serverRoot = dirname(serverPath);

  cpSync(join(appPath, ".next/static"), join(serverRoot, ".next/static"), { recursive: true, force: true });

  const child = spawn("node", [serverPath], {
    cwd: serverRoot,
    env: { ...process.env, PORT: String(port), HOSTNAME: "127.0.0.1", NODE_ENV: "production" },
    stdio: ["ignore", "ignore", "pipe"],
  });

  const failures = [];
  let advisory = 0;
  let lowestScore = 100;

  try {
    await waitForHealth(port);

    for (const path of PATHS) {
      const res = await fetch(`http://127.0.0.1:${port}${path}`);
      if (!res.ok) {
        failures.push(`${dir}${path}: HTTP ${res.status}`);
        continue;
      }
      const html = await res.text();

      const result = await engine.run({
        html,
        level: "AA",
        pageName: `${name} ${path}`,
        organisation: "Abet Works",
      });

      if (result.score) lowestScore = Math.min(lowestScore, result.score.value);

      for (const section of result.sections ?? []) {
        for (const item of section.items ?? []) {
          if (isAdvisory(section, item)) {
            advisory += 1;
            continue;
          }
          // Anything the engine attached a severity to, that is not on the standing
          // advisory list, is a real finding against our own markup.
          if (item.severity) {
            const firstLine = String(item.body).split("\n")[0];
            failures.push(`${dir}${path} [${item.severity}] ${item.title ?? section.title}: ${firstLine}`);
          }
        }
      }
    }
  } finally {
    child.kill("SIGTERM");
    await sleep(150);
    if (!child.killed) child.kill("SIGKILL");
  }

  return { dir, family, failures, advisory, lowestScore };
}

async function main() {
  const chosen = await sample();
  const enginePath = pathToFileURL(join(APPS_DIR, "12-a11ygate", "lib/engine.ts")).href;
  const engine = await import(enginePath);

  console.log(
    `Auditing ${chosen.length} product${chosen.length === 1 ? "" : "s"} (${PATHS.length} pages each) with A11yGate at level AA.\n`,
  );

  const results = [];
  let port = 3900;
  for (const entry of chosen) {
    const result = await auditApp(engine, entry, port);
    port += 1;
    results.push(result);
    const verdict = result.failures.length === 0 ? "clean" : `${result.failures.length} finding(s)`;
    console.log(
      `  ${result.failures.length === 0 ? "✔" : "✗"} ${entry.dir.padEnd(18)} ${entry.family.padEnd(10)} score ${String(result.lowestScore).padStart(3)}/100  ${verdict}`,
    );
  }

  const allFailures = results.flatMap((r) => r.failures);
  const advisory = results.reduce((sum, r) => sum + r.advisory, 0);

  console.log(
    `\n${advisory} advisory item(s) — these are the checks the engine refuses to automate, and are expected.`,
  );

  if (allFailures.length > 0) {
    console.error(`\n${allFailures.length} accessibility finding(s) in our own pages:\n`);
    for (const failure of allFailures) console.error(`  ✗ ${failure}`);
    console.error(
      "\nWe sell this check. Fix the shared components in _template/components/design/, run `pnpm sync`, and re-run.",
    );
    process.exit(1);
  }

  console.log("\nNo WCAG findings in our own markup. The suite passes the audit it sells.");
}

await main();
