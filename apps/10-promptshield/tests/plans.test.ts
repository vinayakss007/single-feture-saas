import { test } from "node:test";
import assert from "node:assert/strict";
import { PLANS, formatQuota, planByCode, purchasablePlans, razorpayPlanId, stripePriceId } from "../lib/plans.ts";
import { product } from "../lib/product.ts";

/**
 * These are the tests that stop a pricing bug shipping. The failure mode they
 * guard against is the expensive one: a plan whose paywall quota does not match
 * what the landing page promised.
 */

test("the marketing page and the paywall agree on price", () => {
  const codes = ["free", "pro", "enterprise"] as const;
  product.pricing.forEach((tier, index) => {
    const plan = PLANS[codes[index]];
    assert.equal(plan.name, tier.name, `tier ${index} name drifted`);
    assert.equal(plan.price, tier.price, `tier ${index} price drifted`);
  });
});

test("there are exactly three tiers, ordered free then paid then enterprise", () => {
  assert.equal(product.pricing.length, 3);
  assert.equal(PLANS.free.code, "free");
  assert.equal(PLANS.pro.code, "pro");
  assert.equal(PLANS.enterprise.code, "enterprise");
});

test("quotas increase with price and free is the smallest", () => {
  assert.ok(PLANS.free.monthlyRuns < PLANS.pro.monthlyRuns);
  assert.ok(PLANS.pro.monthlyRuns <= PLANS.enterprise.monthlyRuns);
  assert.ok(PLANS.free.rateLimitPerMin < PLANS.pro.rateLimitPerMin);
});

test("the free plan does not include API access", () => {
  // If this ever passes, the paid tier has no reason to exist.
  assert.equal(PLANS.free.apiAccess, false);
  assert.equal(PLANS.pro.apiAccess, true);
  assert.equal(PLANS.enterprise.apiAccess, true);
});

test("an unknown or missing plan code falls back to free", () => {
  for (const code of [null, undefined, "", "gold", "PRO ", "enterprise-plus"]) {
    assert.equal(planByCode(code).code, "free", `should fall back for ${JSON.stringify(code)}`);
  }
});

test("plan codes are case-insensitive", () => {
  assert.equal(planByCode("PRO").code, "pro");
  assert.equal(planByCode("Enterprise").code, "enterprise");
});

test("price id env names are namespaced per product", () => {
  const slug = product.slug.toUpperCase().replace(/-/g, "_");
  assert.equal(PLANS.pro.stripePriceEnv, `STRIPE_PRICE_${slug}_PRO`);
  assert.equal(PLANS.pro.razorpayPlanEnv, `RAZORPAY_PLAN_${slug}_PRO`);
});

test("nothing is purchasable until a price id is configured", () => {
  delete process.env[PLANS.pro.stripePriceEnv];
  delete process.env[PLANS.pro.razorpayPlanEnv];
  delete process.env[PLANS.enterprise.stripePriceEnv];
  delete process.env[PLANS.enterprise.razorpayPlanEnv];
  assert.deepEqual(purchasablePlans(), []);

  process.env[PLANS.pro.stripePriceEnv] = "price_test_123";
  assert.equal(stripePriceId("pro"), "price_test_123");
  assert.deepEqual(
    purchasablePlans().map((p) => p.code),
    ["pro"],
  );

  process.env[PLANS.enterprise.razorpayPlanEnv] = "plan_test_456";
  assert.equal(razorpayPlanId("enterprise"), "plan_test_456");
  assert.deepEqual(
    purchasablePlans().map((p) => p.code),
    ["pro", "enterprise"],
  );

  delete process.env[PLANS.pro.stripePriceEnv];
  delete process.env[PLANS.enterprise.razorpayPlanEnv];
});

test("blank env values do not count as configured", () => {
  process.env[PLANS.pro.stripePriceEnv] = "   ";
  assert.equal(stripePriceId("pro"), null);
  delete process.env[PLANS.pro.stripePriceEnv];
});

test("an uncapped quota reads as Unlimited, not Infinity", () => {
  assert.equal(formatQuota(Number.POSITIVE_INFINITY), "Unlimited");
  assert.equal(formatQuota(5000), "5,000");
  assert.equal(formatQuota(25), "25");
});
