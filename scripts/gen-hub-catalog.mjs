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
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "site", "lib", "catalog.generated.ts");
const CHECK_ONLY = process.argv.includes("--check");

const catalog = JSON.parse(readFileSync(join(ROOT, "scripts", "catalog.json"), "utf8"));

/** Only the fields the hub actually renders. */
const FIELDS = ["dir", "slug", "name", "tagline", "job", "category", "audience", "accent", "mcpTool", "differentiator"];

/**
 * The design family is resolved here rather than stored in catalog.json.
 *
 * It is derived from the product's category by `designFor`, so storing it would be
 * storing a second copy of something already computable — exactly the kind of
 * duplication that put four wrong MCP tool names in this file. Importing the
 * resolver means the hub cannot label a product with a family it does not render.
 */
const { designFor, DESIGNS } = await import(pathToFileURL(join(ROOT, "_template/lib/design.ts")).href);

const products = [];
for (const p of catalog.products) {
  const picked = {};
  for (const f of FIELDS) {
    if (p[f] === undefined) throw new Error(`catalog.json: ${p.slug ?? p.dir} is missing "${f}"`);
    picked[f] = p[f];
  }
  const { product } = await import(pathToFileURL(join(ROOT, "apps", p.dir, "lib/product.ts")).href);
  const tokens = designFor(product);
  picked.design = tokens.family;
  picked.designLabel = tokens.label;
  products.push(picked);
}

/** The families, so the hub can explain why fifty products do not look alike. */
const families = Object.values(DESIGNS).map((d) => ({
  family: d.family,
  label: d.label,
  rationale: d.rationale,
  count: products.filter((p) => p.design === d.family).length,
}));

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
  /** which of the eight design families renders this product */
  design: string;
  designLabel: string;
};

export type DesignFamilySummary = {
  family: string;
  label: string;
  rationale: string;
  count: number;
};

export const suite = ${JSON.stringify(catalog.suite, null, 2)} as const;

export const products: HubProduct[] = ${JSON.stringify(products, null, 2)};

export const designFamilies: DesignFamilySummary[] = ${JSON.stringify(families, null, 2)};
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
