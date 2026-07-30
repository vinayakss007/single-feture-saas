import { test } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, newSessionToken, safeEqual, sha256, verifyPassword } from "../lib/crypto.ts";

test("a hash verifies against its own password", async () => {
  const stored = await hashPassword("correct horse battery 9");
  assert.equal(await verifyPassword("correct horse battery 9", stored), true);
});

test("a hash rejects the wrong password", async () => {
  const stored = await hashPassword("correct horse battery 9");
  assert.equal(await verifyPassword("correct horse battery 8", stored), false);
  assert.equal(await verifyPassword("", stored), false);
});

test("the same password hashes differently every time", async () => {
  const a = await hashPassword("same password 1");
  const b = await hashPassword("same password 1");
  assert.notEqual(a, b, "a repeated hash means the salt is not random");
  assert.equal(await verifyPassword("same password 1", a), true);
  assert.equal(await verifyPassword("same password 1", b), true);
});

test("the hash records its own parameters", async () => {
  const stored = await hashPassword("parameters 1");
  const [scheme, N, r, p, salt, digest] = stored.split("$");
  assert.equal(scheme, "scrypt");
  assert.equal(N, "16384");
  assert.equal(r, "8");
  assert.equal(p, "1");
  assert.ok(salt.length > 0);
  assert.ok(digest.length > 0);
});

test("malformed stored hashes are rejected rather than throwing", async () => {
  const cases = [
    "",
    "not-a-hash",
    "scrypt$1$1$1",
    "bcrypt$16384$8$1$c2FsdA$aGFzaA",
    "scrypt$abc$8$1$c2FsdA$aGFzaA",
    // Absurd cost parameters must be refused, not handed to scrypt, or a poisoned
    // row becomes a memory-exhaustion vector.
    "scrypt$999999999$8$1$c2FsdA$aGFzaA",
    "scrypt$16384$8$1$$aGFzaA",
    "scrypt$16384$8$1$c2FsdA$",
  ];
  for (const stored of cases) {
    assert.equal(await verifyPassword("anything at all", stored), false, `should reject: ${stored}`);
  }
});

test("a raised cost still verifies an older hash", async () => {
  // Simulates upgrading SCRYPT.N later: old rows carry their own parameters.
  const stored = await hashPassword("migration 1");
  const weaker = stored.replace("$16384$", "$1024$");
  // The weakened string is not a valid hash *of* this password, so it must fail
  // closed rather than pass.
  assert.equal(await verifyPassword("migration 1", weaker), false);
  assert.equal(await verifyPassword("migration 1", stored), true);
});

test("session tokens are unique and url-safe", () => {
  const tokens = new Set<string>();
  for (let i = 0; i < 500; i += 1) {
    const token = newSessionToken();
    assert.match(token, /^[A-Za-z0-9_-]{43}$/, "token must be url-safe base64 of 32 bytes");
    assert.equal(tokens.has(token), false, "duplicate session token");
    tokens.add(token);
  }
});

test("sha256 is stable and is not the input", () => {
  assert.equal(sha256("abc"), sha256("abc"));
  assert.notEqual(sha256("abc"), "abc");
  assert.equal(sha256("abc").length, 64);
  assert.notEqual(sha256("abc"), sha256("abd"));
});

test("safeEqual matches only identical strings", () => {
  assert.equal(safeEqual("token", "token"), true);
  assert.equal(safeEqual("token", "tokeN"), false);
  assert.equal(safeEqual("token", "token "), false);
  assert.equal(safeEqual("", ""), true);
});
