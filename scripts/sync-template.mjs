#!/usr/bin/env node
/**
 * Propagates the framework layer from _template/ into every app.
 *
 * This is what makes _template/ the source of truth rather than a snapshot that
 * rots. Fix a bug in the auth or billing code once, run this, and all ten
 * products have the fix.
 *
 * SHARED files are overwritten from the template. OWNED files are never touched —
 * they are what makes each product a different product. Anything in the template
 * that is not in either list is reported so a new file cannot be silently
 * forgotten.
 *
 * Usage:
 *   node scripts/sync-template.mjs            # write changes
 *   node scripts/sync-template.mjs --check    # fail if anything is out of date (CI)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATE = join(ROOT, "_template");
const APPS_DIR = join(ROOT, "apps");

const CHECK_ONLY = process.argv.includes("--check");

/** Files each product owns. Never overwritten. */
const OWNED = new Set([
  "lib/product.ts", // what the product is
  "lib/engine.ts", // what it does
  "README.md",
  "LAUNCH.md",
  "package.json", // name and description differ; deps are merged separately
]);

/** Files in the template that are scaffolding for the template itself. */
const TEMPLATE_ONLY = new Set([]);

/**
 * Dependencies every app must have, kept here rather than in each package.json so
 * adding one is a single edit.
 */
const REQUIRED_DEPS = {
  dependencies: {
    next: "^15",
    pg: "^8.13.1",
    react: "^19",
    "react-dom": "^19",
  },
  devDependencies: {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^22",
    "@types/pg": "^8.11.10",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    tailwindcss: "^4",
    typescript: "^5",
  },
};

/** Scripts every app must expose, so root-level `pnpm -r` commands work. */
const REQUIRED_SCRIPTS = {
  dev: "next dev",
  build: "next build",
  start: "next start",
  typecheck: "tsc --noEmit",
  test: 'node --experimental-strip-types --test "tests/**/*.test.ts"',
  mcp: "node mcp/server.mjs",
};

function walk(dir, base = dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      out.push(...walk(full, base));
    } else {
      out.push(relative(base, full));
    }
  }
  return out;
}

function apps() {
  return readdirSync(APPS_DIR)
    .filter((name) => statSync(join(APPS_DIR, name)).isDirectory())
    .sort();
}

function write(target, contents) {
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, contents);
}

/**
 * Substitutes the template placeholders. Only package.json uses them, and that
 * file is owned, so this is a safety net rather than a hot path.
 */
function render(contents, slug, description) {
  return contents.replaceAll("PRODUCT_SLUG", slug).replaceAll("PRODUCT_DESCRIPTION", description);
}

/** Merges required deps and scripts into an owned package.json, preserving identity. */
function reconcilePackageJson(appDir, changes) {
  const path = join(appDir, "package.json");
  if (!existsSync(path)) return;

  const original = readFileSync(path, "utf8");
  const pkg = JSON.parse(original);

  pkg.dependencies ??= {};
  pkg.devDependencies ??= {};
  pkg.scripts ??= {};

  for (const [name, version] of Object.entries(REQUIRED_DEPS.dependencies)) {
    if (pkg.dependencies[name] !== version) pkg.dependencies[name] = version;
  }
  for (const [name, version] of Object.entries(REQUIRED_DEPS.devDependencies)) {
    if (pkg.devDependencies[name] !== version) pkg.devDependencies[name] = version;
  }
  for (const [name, cmd] of Object.entries(REQUIRED_SCRIPTS)) {
    if (pkg.scripts[name] !== cmd) pkg.scripts[name] = cmd;
  }

  // Sort so a dependency bump is a one-line diff rather than a reordering.
  const sort = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
  pkg.dependencies = sort(pkg.dependencies);
  pkg.devDependencies = sort(pkg.devDependencies);

  const next = `${JSON.stringify(pkg, null, 2)}\n`;
  if (next !== original) {
    changes.push(`${relative(ROOT, path)} (deps/scripts reconciled)`);
    if (!CHECK_ONLY) writeFileSync(path, next);
  }
}

/**
 * Compiles db/schema.sql into lib/schema.ts.
 *
 * The SQL file stays the thing you edit — it is readable, and psql can run it.
 * But it has to reach production inside the JavaScript bundle, because a Vercel
 * route handler cannot rely on the file being on disk next to it. Generating a
 * module keeps one source of truth and lets the bundler carry the schema.
 */
function generateSchemaModule(changes) {
  const sqlPath = join(TEMPLATE, "db", "schema.sql");
  const outPath = join(TEMPLATE, "lib", "schema.ts");
  const sql = readFileSync(sqlPath, "utf8");

  // Only backticks and ${ can break out of a template literal. Postgres uses
  // neither, but escaping them means a future schema edit cannot silently produce
  // invalid TypeScript.
  const escaped = sql.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

  const contents = `// GENERATED FILE — DO NOT EDIT.
// Source: db/schema.sql   Regenerate: pnpm sync
//
// The schema is compiled into a module so it ships inside the bundle. See the
// comment on migrate() in lib/db.ts for why it is not read from disk.

export const SCHEMA_SQL = \`${escaped}\`;
`;

  const current = existsSync(outPath) ? readFileSync(outPath, "utf8") : null;
  if (current !== contents) {
    changes.push("_template/lib/schema.ts (generated from db/schema.sql)");
    if (!CHECK_ONLY) writeFileSync(outPath, contents);
  }
}

function main() {
  const changes = [];

  // Must run before the file list is read, so the generated module propagates.
  generateSchemaModule(changes);

  const templateFiles = walk(TEMPLATE).filter((f) => !TEMPLATE_ONLY.has(f)).sort();
  const shared = templateFiles.filter((f) => !OWNED.has(f));

  const missingOwned = [];

  for (const app of apps()) {
    const appDir = join(APPS_DIR, app);

    // Read identity from the app's own package.json so placeholders resolve.
    let slug = app.replace(/^\d+-/, "");
    let description = "";
    const pkgPath = join(appDir, "package.json");
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      slug = String(pkg.name ?? slug).split("/").pop();
      description = String(pkg.description ?? "");
    }

    for (const file of shared) {
      const source = render(readFileSync(join(TEMPLATE, file), "utf8"), slug, description);
      const target = join(appDir, file);
      const current = existsSync(target) ? readFileSync(target, "utf8") : null;
      if (current !== source) {
        changes.push(`${app}/${file}`);
        if (!CHECK_ONLY) write(target, source);
      }
    }

    for (const file of OWNED) {
      if (file === "package.json") continue;
      if (!existsSync(join(appDir, file))) missingOwned.push(`${app}/${file}`);
    }

    reconcilePackageJson(appDir, changes);
  }

  console.log(`Template files: ${templateFiles.length} (${shared.length} shared, ${OWNED.size} owned per app)`);
  console.log(`Apps: ${apps().length}`);

  if (missingOwned.length > 0) {
    console.error(`\nMissing product-owned files (each app must provide these):`);
    for (const f of missingOwned) console.error(`  - ${f}`);
    process.exit(1);
  }

  if (changes.length === 0) {
    console.log("\nEverything is already in sync.");
    return;
  }

  console.log(`\n${CHECK_ONLY ? "Out of date" : "Updated"} (${changes.length}):`);
  for (const c of changes.slice(0, 60)) console.log(`  ${CHECK_ONLY ? "!" : "+"} ${c}`);
  if (changes.length > 60) console.log(`  … and ${changes.length - 60} more`);

  if (CHECK_ONLY) {
    console.error("\nRun `pnpm sync` and commit the result.");
    process.exit(1);
  }
}

main();
