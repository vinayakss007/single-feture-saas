import { test } from "node:test";
import assert from "node:assert/strict";
import { normaliseEmail, parseInput, validateEmail, validatePassword } from "../lib/validate.ts";
import type { InputField } from "../lib/types.ts";

test("passwords shorter than ten characters are refused", () => {
  assert.match(validatePassword("short1") ?? "", /at least 10/);
  assert.equal(validatePassword("aaaaaaaaa1"), null);
});

test("passwords need a letter and a number", () => {
  assert.match(validatePassword("aaaaaaaaaaaa") ?? "", /letter and one number/);
  assert.match(validatePassword("123456789012") ?? "", /letter and one number/);
  assert.equal(validatePassword("abcdefghi1"), null);
});

test("breach-list passwords are refused even when long enough", () => {
  for (const bad of ["password123", "Passw0rd12", "qwerty12345", "letmein12345"]) {
    assert.match(validatePassword(bad) ?? "", /breach list/, `should refuse ${bad}`);
  }
});

test("absurdly long passwords are refused", () => {
  assert.match(validatePassword(`${"a".repeat(300)}1`) ?? "", /under 200/);
});

test("emails are normalised by trimming and lowercasing", () => {
  assert.equal(normaliseEmail("  Ada@Example.COM "), "ada@example.com");
});

test("obviously invalid emails are refused", () => {
  for (const bad of ["", "a", "no-at-sign", "no@tld", "two@@at.com", "spa ce@x.com", "@x.com"]) {
    assert.notEqual(validateEmail(bad), null, `should refuse ${JSON.stringify(bad)}`);
  }
});

test("real-shaped emails are accepted", () => {
  for (const good of ["ada@example.com", "a.b+tag@sub.example.co.uk", "UPPER@EXAMPLE.COM"]) {
    assert.equal(validateEmail(good), null, `should accept ${good}`);
  }
});

// ---------------------------------------------------------------------------

const FIELDS: InputField[] = [
  { name: "text", label: "Text", type: "textarea", required: true },
  { name: "mode", label: "Mode", type: "select", options: ["fast", "deep"] },
  { name: "note", label: "Note", type: "text" },
];

test("a valid body parses and every declared field is present", () => {
  const result = parseInput({ text: "hello", mode: "fast" }, FIELDS);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.value, { text: "hello", mode: "fast", note: "" });
});

test("a missing required field is reported by name", () => {
  const result = parseInput({ mode: "fast" }, FIELDS);
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.deepEqual(result.failure.details.missingRequiredFields, ["text"]);
  assert.equal(result.failure.status, 400);
});

test("an empty string counts as missing for a required field", () => {
  const result = parseInput({ text: "" }, FIELDS);
  assert.equal(result.ok, false);
});

test("numbers and booleans are coerced to strings", () => {
  const result = parseInput({ text: 42, note: true }, FIELDS);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.value.text, "42");
  assert.equal(result.value.note, "true");
});

test("objects and arrays in a field are refused", () => {
  const result = parseInput({ text: { nested: 1 } }, FIELDS);
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.deepEqual(result.failure.details.fieldsThatMustBeStrings, ["text"]);
});

test("a non-object body is refused and still describes the schema", () => {
  for (const body of [null, "string", 42, [1, 2, 3]]) {
    const result = parseInput(body, FIELDS);
    assert.equal(result.ok, false, `should refuse ${JSON.stringify(body)}`);
    if (result.ok) continue;
    assert.match(result.failure.error, /JSON object/);
    assert.equal(result.failure.details.expected.length, FIELDS.length);
  }
});

test("unknown keys are ignored rather than rejected", () => {
  const result = parseInput({ text: "hi", surprise: "ignored" }, FIELDS);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal("surprise" in result.value, false);
});

test("over-long values are refused with the limit stated", () => {
  const result = parseInput({ text: "a".repeat(20_001) }, FIELDS);
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.deepEqual(result.failure.details.fieldsOverLengthLimit, ["text"]);
  assert.equal(result.failure.details.maxFieldChars, 20_000);
});
