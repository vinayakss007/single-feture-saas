#!/usr/bin/env node
/**
 * Asserts scripts/catalog.json agrees with each product's own lib/product.ts.
 *
 * The catalogue drives the hub site, the sibling cross-sell modules and the launch
 * docs; lib/product.ts drives the product itself. Both carry name, tagline, accent,
 * category and mcpTool, and nothing was stopping them disagreeing — which they did,
 * on four categories, for as long as those products have existed. The hub said
 * "Housing", the product page said "Real estate & housing", and the design family was
 * being chosen from whichever one the reader happened to hit.
 *
 * lib/product.ts wins. It is what renders, it is what the tests assert against, and
 * it is the file a person edits when they change what a product is.
 *
 * The product module is imported rather than parsed, so this cannot be fooled by
 * formatting and cannot rot against a config change.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-catalog.mjs         # report and fail (CI)
 *   node --experimental-strip-types scripts/check-catalog.mjs --fix   # rewrite the catalogue from the products
 *
 * The strip-types flag is required because this imports the product modules directly
 * rather than parsing them, which is what makes it impossible to fool.
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const APPS_DIR = join(ROOT, "apps");

/** Fields present in both files that must match exactly. */
const MIRRORED = ["slug", "name", "tagline", "accent", "category"];

const FIX = process.argv.includes("--fix");

async function loadProduct(dir) {
  const url = pathToFileURL(join(APPS_DIR, dir, "lib", "product.ts")).href;
  const module = await import(url);
  return module.product;
}

async function main() {
  const catalog = JSON.parse(readFileSync(join(ROOT, "scripts", "catalog.json"), "utf8"));
  const dirs = readdirSync(APPS_DIR).filter((name) => statSync(join(APPS_DIR, name)).isDirectory()).sort();

  const problems = [];
  const repairs = [];

  const catalogByDir = new Map(catalog.products.map((entry) => [entry.dir, entry]));

  if (catalog.products.length !== dirs.length) {
    problems.push(`catalog.json lists ${catalog.products.length} products but apps/ has ${dirs.length}`);
  }

  for (const dir of dirs) {
    const entry = catalogByDir.get(dir);
    if (!entry) {
      problems.push(`${dir}: present in apps/ but missing from catalog.json`);
      continue;
    }

    let product;
    try {
      product = await loadProduct(dir);
    } catch (err) {
      problems.push(`${dir}: could not load lib/product.ts — ${err.message}`);
      continue;
    }

    for (const field of MIRRORED) {
      if (entry[field] !== product[field]) {
        if (FIX) {
          repairs.push(`${dir}.${field}: ${JSON.stringify(entry[field])} -> ${JSON.stringify(product[field])}`);
          entry[field] = product[field];
        } else {
          problems.push(
            `${dir}.${field}: catalog.json has ${JSON.stringify(entry[field])}, lib/product.ts has ${JSON.stringify(product[field])}`,
          );
        }
      }
    }

    if (entry.mcpTool !== product.mcpTool.name) {
      if (FIX) {
        repairs.push(`${dir}.mcpTool: ${JSON.stringify(entry.mcpTool)} -> ${JSON.stringify(product.mcpTool.name)}`);
        entry.mcpTool = product.mcpTool.name;
      } else {
        problems.push(
          `${dir}.mcpTool: catalog.json has ${JSON.stringify(entry.mcpTool)}, lib/product.ts has ${JSON.stringify(product.mcpTool.name)}`,
        );
      }
    }

    if (dir.replace(/^\d+-/, "") !== product.slug) {
      problems.push(`${dir}: folder name and product.slug (${product.slug}) disagree`);
    }
  }

  for (const entry of catalog.products) {
    if (!dirs.includes(entry.dir)) {
      problems.push(`${entry.dir}: listed in catalog.json but no such directory in apps/`);
    }
  }

  // Accents are the one thing that must be unique across the suite: they are how a
  // visitor tells two products apart at a glance, and the contrast derivation is
  // per-accent, so a duplicate hides a second product's a11y characteristics.
  const seen = new Map();
  for (const entry of catalog.products) {
    if (seen.has(entry.accent)) {
      problems.push(`accent ${entry.accent} is used by both ${seen.get(entry.accent)} and ${entry.dir}`);
    }
    seen.set(entry.accent, entry.dir);
  }

  if (FIX && repairs.length > 0) {
    writeFileSync(join(ROOT, "scripts", "catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`);
    console.log(`Repaired ${repairs.length} field(s) in catalog.json from the products:\n`);
    for (const repair of repairs) console.log(`  + ${repair}`);
    console.log("\nRun `pnpm sync && pnpm run gen:hub` to propagate.");
  }

  if (problems.length > 0) {
    console.error(`catalog.json disagrees with the products in ${problems.length} place(s):\n`);
    for (const problem of problems) console.error(`  ✗ ${problem}`);
    console.error("\nlib/product.ts is the source of truth. Update scripts/catalog.json to match, then `pnpm sync`.");
    process.exit(1);
  }

  console.log(`catalog.json agrees with all ${dirs.length} products (${MIRRORED.length + 1} fields each, accents unique).`);
}

await main();
