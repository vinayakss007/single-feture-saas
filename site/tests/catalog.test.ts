import { test } from "node:test";
import assert from "node:assert/strict";
import { company, linkedProducts, platform, productUrl } from "../lib/links.ts";
import { products } from "../lib/catalog.generated.ts";

/**
 * The hub's only real failure mode is a broken or wrong link. Everything here
 * guards that: the shop window must not advertise a product that has been renamed,
 * and must not send anyone to a URL that cannot exist.
 */

test("every product in the catalog is linked", () => {
  assert.equal(linkedProducts.length, products.length);
  assert.ok(linkedProducts.length >= 10, `expected at least 10 products, found ${linkedProducts.length}`);
});

test("every product URL is a valid absolute https URL", () => {
  for (const p of linkedProducts) {
    for (const [label, href] of [
      ["url", p.url],
      ["demoUrl", p.demoUrl],
      ["apiUrl", p.apiUrl],
    ] as const) {
      const parsed = new URL(href);
      assert.equal(parsed.protocol, "https:", `${p.slug} ${label} must be https, got ${href}`);
      assert.ok(parsed.hostname.includes("."), `${p.slug} ${label} has no domain: ${href}`);
    }
    assert.ok(p.demoUrl.endsWith("/app"), `${p.slug} demo should deep-link to /app`);
    assert.ok(p.apiUrl.endsWith("/api/v1/run"), `${p.slug} api link should point at the run endpoint`);
  }
});

test("products live on their own subdomain of the configured apex", () => {
  for (const p of linkedProducts) {
    assert.equal(new URL(p.url).hostname, `${p.slug}.abetworks.in`, `${p.slug} is not on the expected subdomain`);
  }
});

test("a per-product override wins over the default apex", () => {
  const key = "NEXT_PUBLIC_PRODUCT_URL_DEALBRIEF";
  const before = process.env[key];
  try {
    process.env[key] = "https://dealbrief-preview.vercel.app/";
    // Trailing slash must be stripped, or every link becomes a double slash.
    assert.equal(productUrl("dealbrief"), "https://dealbrief-preview.vercel.app");
    assert.equal(productUrl("churnsignal"), "https://churnsignal.abetworks.in", "other products unaffected");
  } finally {
    if (before === undefined) delete process.env[key];
    else process.env[key] = before;
  }
});

test("slugs are unique and url-safe", () => {
  const seen = new Set<string>();
  for (const p of linkedProducts) {
    assert.match(p.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, `slug "${p.slug}" is not url-safe`);
    assert.equal(seen.has(p.slug), false, `duplicate slug ${p.slug}`);
    seen.add(p.slug);
  }
});

test("products are ordered by their folder prefix", () => {
  const indexes = linkedProducts.map((p) => p.index);
  assert.deepEqual([...indexes].sort((a, b) => a - b), indexes, "grid order should follow the folder numbering");
  assert.equal(new Set(indexes).size, indexes.length, "duplicate position");
});

test("every card has the copy it needs to render", () => {
  for (const p of linkedProducts) {
    assert.ok(p.name.length > 0, `${p.slug} has no name`);
    assert.ok(p.tagline.length > 10, `${p.slug} tagline is too short to be useful`);
    assert.ok(p.tagline.length <= 90, `${p.slug} tagline will wrap badly on a card: ${p.tagline.length} chars`);
    assert.ok(p.job.length > 10, `${p.slug} has no job description`);
    assert.ok(p.category.length > 0, `${p.slug} has no category`);
    assert.match(p.accent, /^#[0-9a-fA-F]{6}$/, `${p.slug} accent is not a hex colour`);
    assert.match(p.mcpTool, /^[a-z0-9_]+$/, `${p.slug} MCP tool name should be snake_case`);
  }
});

test("accent colours are distinct enough to tell products apart", () => {
  const accents = linkedProducts.map((p) => p.accent.toLowerCase());
  assert.equal(new Set(accents).size, accents.length, "two products share an accent colour");
});

test("company links are absolute and the contact is an email", () => {
  for (const href of [company.site, company.repoUrl, company.github]) {
    assert.equal(new URL(href).protocol, "https:", `${href} should be https`);
  }
  assert.match(company.email, /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i);
  assert.equal(company.site.endsWith("/"), false, "site URL must not have a trailing slash");
});

test("platform entries are honest about status", () => {
  assert.ok(platform.length >= 3);
  for (const item of platform) {
    assert.ok(item.status.length > 0, `${item.name} has no status`);
    // Nothing in build may claim to be available. A hub that overstates one thing
    // makes a visitor discount everything else on the page.
    assert.doesNotMatch(item.status, /^(live|available|shipped)$/i, `${item.name} claims to be shipped`);
    if (item.repo) assert.equal(new URL(item.repo).protocol, "https:");
  }
});
