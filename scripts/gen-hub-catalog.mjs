#!/usr/bin/env node
/**
 * Generates site/lib/catalog.generated.ts from scripts/catalog.json.
 *
 * The abetworks.in banner site must never disagree with the products it links to.
 * Retyping ten taglines into a hub page is how you end up with a shop window
 * advertising a product that renamed itself two months ago, so the hub reads
 * generated data instead.
 *
 *   node scripts/gen-hub-catalog.mjs
 *   node scripts/gen-hub-catalog.mjs --check   # fail if stale (CI)
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "site", "lib", "catalog.generated.ts");
const CHECK_ONLY = process.argv.includes("--check");

const catalog = JSON.parse(readFileSync(join(ROOT, "scripts", "catalog.json"), "utf8"));

/** Only the fields the hub actually renders. */
const FIELDS = ["dir", "slug", "name", "tagline", "job", "category", "audience", "accent", "mcpTool", "differentiator"];

const products = catalog.products.map((p) => {
  const picked = {};
  for (const f of FIELDS) {
    if (p[f] === undefined) throw new Error(`catalog.json: ${p.slug ?? p.dir} is missing "${f}"`);
    picked[f] = p[f];
  }
  return picked;
});

const contents = `// GENERATED FILE — DO NOT EDIT.
// Source: scripts/catalog.json   Regenerate: pnpm run gen:hub
//
// The hub links to ten separately deployed products. This file is generated so
// the banner site cannot drift from what those products actually call themselves.

export type HubProduct = {
  /** folder name, e.g. "01-dealbrief" — also gives the display order */
  dir: string;
  slug: string;
  name: string;
  tagline: string;
  job: string;
  category: string;
  audience: string;
  accent: string;
  mcpTool: string;
  differentiator: string;
};

export const suite = ${JSON.stringify(catalog.suite, null, 2)} as const;

export const products: HubProduct[] = ${JSON.stringify(products, null, 2)};
`;

const current = existsSync(OUT) ? readFileSync(OUT, "utf8") : null;

if (current === contents) {
  console.log(`site/lib/catalog.generated.ts is up to date (${products.length} products).`);
  process.exit(0);
}

if (CHECK_ONLY) {
  console.error("site/lib/catalog.generated.ts is stale. Run `pnpm run gen:hub` and commit the result.");
  process.exit(1);
}

writeFileSync(OUT, contents);
console.log(`Generated site/lib/catalog.generated.ts for ${products.length} products.`);
