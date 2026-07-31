import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { product } from "../lib/product.ts";
import { run } from "../lib/engine.ts";
import type { RunResult } from "../lib/types.ts";

/**
 * Engine stress tests.
 *
 * These go far beyond "does the sample work" — they exercise every product's
 * engine against adversarial, boundary and partial inputs. A production engine must
 * handle all of these gracefully, either by throwing with an actionable message or
 * by producing a result that acknowledges the limitation.
 *
 * Every test here runs identically across all 50 products, which is the point:
 * the contract says "throw or handle", and these prove it actually does.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isValidResult(r: RunResult): void {
  assert.equal(typeof r.headline, "string", "headline must be a string");
  assert.ok(r.headline.length > 0, "headline must not be empty");
  assert.ok(r.headline.length < 500, `headline is ${r.headline.length} chars — too long for a UI`);

  if (r.score) {
    assert.equal(typeof r.score.value, "number", "score.value must be a number");
    assert.equal(typeof r.score.max, "number", "score.max must be a number");
    assert.ok(r.score.value >= 0, `score.value ${r.score.value} is negative`);
    assert.ok(r.score.value <= r.score.max, `score.value ${r.score.value} exceeds max ${r.score.max}`);
    assert.ok(["good", "warn", "bad"].includes(r.score.band), `score.band "${r.score.band}" is not valid`);
    assert.ok(r.score.label.length > 0, "score must have a label");
  }

  if (r.metrics) {
    assert.ok(Array.isArray(r.metrics), "metrics must be an array");
    for (const m of r.metrics) {
      assert.ok(typeof m.label === "string" && m.label.length > 0, "each metric needs a label");
      assert.ok(typeof m.value === "string" && m.value.length > 0, "each metric needs a value");
    }
  }

  if (r.sections) {
    assert.ok(Array.isArray(r.sections), "sections must be an array");
    for (const section of r.sections) {
      assert.ok(typeof section.title === "string" && section.title.length > 0, "each section needs a title");
      assert.ok(Array.isArray(section.items), "section.items must be an array");
      for (const item of section.items) {
        assert.ok(typeof item.body === "string" && item.body.length > 0, "each item needs a body");
        assert.ok(
          ["high", "medium", "low"].includes(String(item.severity)),
          `item severity "${item.severity}" is not valid`,
        );
      }
    }
  }

  if (r.table) {
    assert.ok(Array.isArray(r.table.columns), "table needs columns");
    assert.ok(r.table.columns.length > 0, "table needs at least one column");
    assert.ok(Array.isArray(r.table.rows), "table needs rows array");
    for (let i = 0; i < r.table.rows.length; i += 1) {
      assert.equal(
        r.table.rows[i]!.length,
        r.table.columns.length,
        `table row ${i} has ${r.table.rows[i]!.length} cells but ${r.table.columns.length} columns`,
      );
    }
  }

  if (r.copyBlocks) {
    assert.ok(Array.isArray(r.copyBlocks), "copyBlocks must be an array");
    for (const block of r.copyBlocks) {
      assert.ok(typeof block.title === "string" && block.title.length > 0, "copy block needs a title");
      assert.ok(typeof block.text === "string" && block.text.length > 0, "copy block needs text");
      assert.ok(typeof block.language === "string", "copy block needs a language");
    }
  }
}

async function expectThrowOrValid(input: Record<string, string>): Promise<void> {
  try {
    const result = await run(input);
    isValidResult(result);
  } catch (err) {
    assert.ok(err instanceof Error, "must throw Error, not a string or undefined");
    assert.ok(err.message.length > 10, `"${err.message}" is too short to be actionable`);
    // Must not contain stack traces or internal paths in the message
    assert.ok(!err.message.includes("node_modules"), "error message leaks internal paths");
    assert.ok(!err.message.includes("at Object."), "error message contains a stack trace");
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("engine stress — structural integrity", () => {
  test("the sample result has no undefined or NaN values in JSON output", async () => {
    const result = await run(product.sample);
    const json = JSON.stringify(result);
    assert.ok(!json.includes("undefined"), "undefined leaked into the result");
    assert.ok(!json.includes(":NaN"), "NaN leaked into the result — a number computation went wrong");
    // Infinity is checked as a string representation that would appear in JSON.stringify
    // (which converts Infinity to null, so check for the string "Infinity" in values instead)
    const hasInfinity = JSON.stringify(result, (_k, v) => (v === Infinity || v === -Infinity ? "___INF___" : v));
    assert.ok(!hasInfinity.includes("___INF___"), "Infinity leaked — use null or a string representation");
  });

  test("the sample result serialises to valid JSON under 500KB", async () => {
    const result = await run(product.sample);
    const json = JSON.stringify(result);
    assert.ok(json.length > 100, "result is suspiciously small — probably not computing anything");
    assert.ok(json.length < 512_000, `result is ${(json.length / 1024).toFixed(0)}KB — too large for an API response`);
    // Prove it round-trips
    const parsed = JSON.parse(json);
    assert.equal(parsed.headline, result.headline, "JSON round-trip changed the headline");
  });

  test("metrics values do not contain raw objects or arrays", async () => {
    const result = await run(product.sample);
    for (const m of result.metrics ?? []) {
      assert.ok(typeof m.value === "string", `metric "${m.label}" value is ${typeof m.value}, not string`);
      assert.ok(!m.value.startsWith("["), `metric "${m.label}" value looks like a serialised array`);
      assert.ok(!m.value.startsWith("{"), `metric "${m.label}" value looks like a serialised object`);
    }
  });

  test("table cells are all strings", async () => {
    const result = await run(product.sample);
    if (!result.table) return;
    for (let i = 0; i < result.table.rows.length; i += 1) {
      for (let j = 0; j < result.table.rows[i]!.length; j += 1) {
        const cell: unknown = result.table.rows[i]![j];
        assert.equal(typeof cell, "string", `table[${i}][${j}] is ${typeof cell}, not string`);
      }
    }
  });

  test("no section has zero items", async () => {
    const result = await run(product.sample);
    for (const section of result.sections ?? []) {
      assert.ok(section.items.length > 0, `section "${section.title}" has no items — remove it or populate it`);
    }
  });

  test("copy blocks are not empty strings", async () => {
    const result = await run(product.sample);
    for (const block of result.copyBlocks ?? []) {
      assert.ok(block.text.trim().length > 0, `copy block "${block.title}" is blank`);
    }
  });
});

describe("engine stress — adversarial inputs", () => {
  test("handles all fields filled with whitespace only", async () => {
    const input = Object.fromEntries(product.inputs.map((f) => [f.name, "   \n\t  "]));
    await expectThrowOrValid(input);
  });

  test("handles all fields filled with a very long string", async () => {
    const long = "A".repeat(19_999);
    const input = Object.fromEntries(product.inputs.map((f) => [f.name, long]));
    await expectThrowOrValid(input);
  });

  test("handles unicode input (emoji, RTL, zero-width chars)", async () => {
    const unicode = "Hello 🌍 مرحبا \u200B\u200B test ñ ü 你好";
    const input = Object.fromEntries(product.inputs.map((f) => [f.name, unicode]));
    await expectThrowOrValid(input);
  });

  test("handles HTML/script injection in input", async () => {
    const xss = '<script>alert("xss")</script><img onerror=alert(1) src=x>';
    const input = Object.fromEntries(product.inputs.map((f) => [f.name, xss]));
    try {
      const result = await run(input);
      // If it produced a result, the XSS must not be in a way that executes
      const json = JSON.stringify(result);
      // It's OK for the input to appear quoted in the output, but the test proves
      // the engine didn't crash on hostile input
      assert.ok(typeof result.headline === "string");
    } catch (err) {
      assert.ok(err instanceof Error);
      assert.ok(err.message.length > 10);
    }
  });

  test("handles SQL injection patterns in input", async () => {
    const sqli = "'; DROP TABLE users; --";
    const input = Object.fromEntries(product.inputs.map((f) => [f.name, sqli]));
    await expectThrowOrValid(input);
  });

  test("handles null bytes in input", async () => {
    const nullByte = "hello\x00world\x00";
    const input = Object.fromEntries(product.inputs.map((f) => [f.name, nullByte]));
    await expectThrowOrValid(input);
  });

  test("handles numeric strings where text is expected", async () => {
    const input = Object.fromEntries(product.inputs.map((f) => [f.name, "99999999"]));
    await expectThrowOrValid(input);
  });

  test("handles negative numbers in text fields", async () => {
    const input = Object.fromEntries(product.inputs.map((f) => [f.name, "-1"]));
    await expectThrowOrValid(input);
  });
});

describe("engine stress — partial inputs", () => {
  test("handles only required fields filled, optional fields empty", async () => {
    const input: Record<string, string> = {};
    for (const field of product.inputs) {
      if (field.required) {
        input[field.name] = product.sample[field.name] ?? "";
      } else {
        input[field.name] = "";
      }
    }
    // Must either produce a result or throw with an actionable message
    await expectThrowOrValid(input);
  });

  test("handles select fields with an invalid option", async () => {
    const input = { ...product.sample };
    const selectField = product.inputs.find((f) => f.type === "select");
    if (selectField) {
      input[selectField.name] = "DEFINITELY_NOT_A_VALID_OPTION_xyz";
    }
    await expectThrowOrValid(input);
  });

  test("handles one required field missing while others are filled", async () => {
    const required = product.inputs.filter((f) => f.required);
    if (required.length === 0) return;
    // Remove only the first required field
    const input = { ...product.sample };
    input[required[0]!.name] = "";
    await expectThrowOrValid(input);
  });

  test("sample with trailing and leading whitespace still works", async () => {
    const input: Record<string, string> = {};
    for (const [key, value] of Object.entries(product.sample)) {
      input[key] = `  ${value}  `;
    }
    // Most engines should trim and produce results; some may reject
    await expectThrowOrValid(input);
  });
});

describe("engine stress — performance and consistency", () => {
  test("the engine completes within 5 seconds on the sample", async () => {
    const start = Date.now();
    await run(product.sample);
    const elapsed = Date.now() - start;
    assert.ok(elapsed < 5000, `engine took ${elapsed}ms — too slow for a synchronous API call`);
  });

  test("running twice produces the same headline (determinism check)", {
    skip: product.probesNetwork ? "engine probes live URLs — non-deterministic by design" : false,
  }, async () => {
    const r1 = await run(product.sample);
    const r2 = await run(product.sample);
    assert.equal(r1.headline, r2.headline, "headline changed between identical runs — engine is not deterministic");
  });

  test("running twice produces the same score (determinism check)", {
    skip: product.probesNetwork ? "engine probes live URLs" : false,
  }, async () => {
    const r1 = await run(product.sample);
    const r2 = await run(product.sample);
    if (r1.score && r2.score) {
      assert.equal(r1.score.value, r2.score.value, "score changed between identical runs");
      assert.equal(r1.score.band, r2.score.band, "band changed between identical runs");
    }
  });

  test("running twice produces the same number of sections and items", {
    skip: product.probesNetwork ? "engine probes live URLs" : false,
  }, async () => {
    const r1 = await run(product.sample);
    const r2 = await run(product.sample);
    const count = (r: RunResult) => (r.sections ?? []).reduce((n, s) => n + s.items.length, 0);
    assert.equal(count(r1), count(r2), "section item count changed between identical runs");
  });

  test("running twice produces the same table row count", {
    skip: product.probesNetwork ? "engine probes live URLs" : false,
  }, async () => {
    const r1 = await run(product.sample);
    const r2 = await run(product.sample);
    assert.equal(
      r1.table?.rows?.length ?? 0,
      r2.table?.rows?.length ?? 0,
      "table row count changed between identical runs",
    );
  });
});
