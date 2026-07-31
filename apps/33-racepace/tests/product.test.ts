import { test } from "node:test";
import assert from "node:assert/strict";
import { product } from "../lib/product.ts";
import { run } from "../lib/engine.ts";
import { parseInput } from "../lib/validate.ts";

/**
 * The contract every product must satisfy.
 *
 * These run identically in all ten apps, which is the point: a new product is
 * finished when this file passes. Nothing here knows what the product does.
 */

test("the product config is complete enough to render a landing page", () => {
  assert.match(product.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, "slug must be url-safe");
  assert.ok(product.name.length > 0);
  assert.ok(product.tagline.length > 0 && product.tagline.length <= 70, "tagline should fit a Product Hunt line");
  assert.ok(product.oneLiner.length > 20);
  assert.match(product.accent, /^#[0-9a-fA-F]{6}$/);
  assert.match(product.accentSoft, /^#[0-9a-fA-F]{6}$/);

  assert.ok(product.problem.length >= 2, "needs at least two problem statements");
  assert.ok(product.features.length >= 3, "needs at least three features");
  assert.ok(product.how.length >= 3, "needs at least three steps");
  assert.ok(product.faq.length >= 4, "needs at least four FAQs");
  assert.ok(product.metrics.length >= 3);
  assert.equal(product.pricing.length, 3);
});

test("every input field is well formed", () => {
  assert.ok(product.inputs.length > 0, "a product with no inputs has no demo");
  const names = new Set<string>();
  for (const field of product.inputs) {
    assert.match(field.name, /^[a-z][a-zA-Z0-9]*$/, `field name ${field.name} should be camelCase`);
    assert.equal(names.has(field.name), false, `duplicate field ${field.name}`);
    names.add(field.name);
    assert.ok(field.label.length > 0, `${field.name} needs a label`);
    if (field.type === "select") {
      assert.ok((field.options?.length ?? 0) > 1, `${field.name} is a select with fewer than two options`);
    }
  }
  assert.ok(
    product.inputs.some((f) => f.required),
    "at least one field must be required, or the demo can be run empty",
  );
});

test("the sample input satisfies the schema", () => {
  const parsed = parseInput(product.sample, product.inputs);
  assert.equal(parsed.ok, true, `sample does not satisfy the schema: ${JSON.stringify(parsed)}`);
});

test("the sample select values are legal", () => {
  for (const field of product.inputs) {
    if (field.type !== "select" || !field.options) continue;
    const value = product.sample[field.name];
    if (!value) continue;
    assert.ok(field.options.includes(value), `sample ${field.name}="${value}" is not one of ${field.options.join("|")}`);
  }
});

test("the engine runs the sample and returns a usable result", async () => {
  const result = await run(product.sample);
  assert.ok(result.headline.length > 0, "every result needs a headline");
  assert.ok(
    result.sections || result.table || result.copyBlocks || result.metrics,
    "a result with no sections, table, copy blocks or metrics is an empty page",
  );

  if (result.score) {
    assert.ok(result.score.value >= 0 && result.score.value <= result.score.max, "score out of range");
    assert.ok(["good", "warn", "bad"].includes(result.score.band));
  }
  if (result.table) {
    for (const row of result.table.rows) {
      assert.equal(row.length, result.table.columns.length, "table row width does not match its columns");
    }
  }
});

test("the engine is deterministic", { skip: product.probesNetwork ? "engine probes live URLs" : false }, async () => {
  // No LLM and no clock in the request path. Two identical calls must agree, or
  // caching, testing and customer trust all break.
  //
  // The only sanctioned exception is a product whose job is to measure the live
  // internet, which must declare `probesNetwork: true` to opt out.
  const a = await run(product.sample);
  const b = await run(product.sample);
  assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
});

test("a network-probing engine still returns the same SHAPE twice", {
  skip: product.probesNetwork ? false : "engine is deterministic, covered above",
}, async () => {
  // Values may differ, but the structure must not — that is what the UI and any
  // API client depend on.
  const a = await run(product.sample);
  const b = await run(product.sample);
  const shape = (r: typeof a) => ({
    keys: Object.keys(r).sort(),
    sections: r.sections?.length ?? 0,
    columns: r.table?.columns ?? null,
    copyBlocks: r.copyBlocks?.map((c) => c.language) ?? null,
  });
  assert.deepEqual(shape(a), shape(b));
});

test("the engine handles empty input without crashing the route", async () => {
  // Two acceptable behaviours: throw a message the API turns into a 422, or
  // return a result. What must not happen is an unhandled crash, and the thrown
  // message must be something a user can act on.
  const empty = Object.fromEntries(product.inputs.map((f) => [f.name, ""]));
  try {
    const result = await run(empty);
    assert.equal(typeof result.headline, "string");
  } catch (err) {
    assert.ok(err instanceof Error, "engines must throw Error, not strings");
    assert.ok(err.message.length > 10, `"${err.message}" is not an actionable message`);
  }
});

test("the MCP tool is described well enough for an agent to choose it", () => {
  assert.match(product.mcpTool.name, /^[a-z0-9_]+$/, "MCP tool names must be snake_case");
  assert.ok(product.mcpTool.description.length > 30, "an agent picks tools by description; make it specific");
});
