import { test } from "node:test";
import assert from "node:assert/strict";

import { product } from "../lib/product.ts";
import {
  CATEGORY_DESIGN,
  DESIGNS,
  DESIGN_FAMILIES,
  designFor,
  designVars,
  type DesignFamily,
} from "../lib/design.ts";
import { contrastRatio, luminance, mix, onColor, parseHex, readableOn } from "../lib/contrast.ts";

/**
 * Design and contrast contract.
 *
 * The contrast assertions here are the reason this file exists. We sell an
 * accessibility auditing product; shipping fifty landing pages with 2.9:1 button
 * text would be the single most embarrassing defect in the repository, and it is
 * exactly the kind that no one notices by looking because mid-tone accents look fine
 * to most eyes on a good screen.
 *
 * Everything is asserted against the *rendered* variables from `designVars`, not
 * against the raw config, because the raw accent is deliberately allowed to fail —
 * it is used for fills — and it is the derived text variants that must pass.
 */

const AA_NORMAL = 4.5;
const vars = designVars(designFor(product), product.accent, product.accentSoft);

function ratio(a: string, b: string) {
  return Number(contrastRatio(a, b).toFixed(2));
}

/* --------------------------------------------------------------- colour maths */

test("contrast: known reference values", () => {
  assert.equal(ratio("#000000", "#ffffff"), 21);
  assert.equal(ratio("#ffffff", "#ffffff"), 1);
  // Mid grey against white, a value that is easy to verify by hand.
  assert.ok(Math.abs(contrastRatio("#767676", "#ffffff") - 4.54) < 0.02);
});

test("contrast: ratio is symmetric", () => {
  assert.equal(ratio("#0891b2", "#ffffff"), ratio("#ffffff", "#0891b2"));
});

test("contrast: luminance is ordered and bounded", () => {
  assert.equal(luminance("#000000"), 0);
  assert.equal(luminance("#ffffff"), 1);
  assert.ok(luminance("#808080") > luminance("#404040"));
});

test("parseHex: accepts 3 and 6 digit forms, with or without hash", () => {
  assert.deepEqual(parseHex("#fff"), [255, 255, 255]);
  assert.deepEqual(parseHex("fff"), [255, 255, 255]);
  assert.deepEqual(parseHex("#0891b2"), [8, 145, 178]);
});

test("parseHex: rejects anything that is not a hex colour", () => {
  for (const bad of ["", "#", "#ff", "#12345", "rgb(0,0,0)", "#gggggg", "#1234567"]) {
    assert.throws(() => parseHex(bad), /Not a hex colour/, `should reject ${JSON.stringify(bad)}`);
  }
});

test("onColor: picks whichever of white or near-black contrasts better", () => {
  assert.equal(onColor("#000000"), "#ffffff");
  assert.equal(onColor("#ffffff"), "#111111");
  // A mid-tone amber: white on it is 2.94:1, near-black is 6.43:1.
  assert.equal(onColor("#ca8a04"), "#111111");
});

test("onColor: the chosen foreground always clears AA on this product's accent", () => {
  assert.ok(
    contrastRatio(product.accent, onColor(product.accent)) >= AA_NORMAL,
    `${product.accent} with ${onColor(product.accent)} is ${ratio(product.accent, onColor(product.accent))}:1`,
  );
});

test("readableOn: returns the colour untouched when it already passes", () => {
  assert.equal(readableOn("#111111", "#ffffff"), "#111111");
});

test("readableOn: darkens against a light background and lightens against a dark one", () => {
  const onLight = readableOn("#ca8a04", "#ffffff");
  assert.ok(luminance(onLight) < luminance("#ca8a04"), "should have darkened");
  const onDark = readableOn("#1e3a5f", "#0a0e14");
  assert.ok(luminance(onDark) > luminance("#1e3a5f"), "should have lightened");
});

test("readableOn: reaches AA for this product's accent on every family surface", () => {
  for (const family of DESIGN_FAMILIES) {
    const d = DESIGNS[family];
    for (const surface of [d.bg, d.panel, d.band]) {
      const derived = readableOn(product.accent, surface);
      assert.ok(
        contrastRatio(derived, surface) >= AA_NORMAL,
        `${family}: ${derived} on ${surface} is only ${ratio(derived, surface)}:1`,
      );
    }
  }
});

test("mix: endpoints and midpoint behave", () => {
  assert.equal(mix("#000000", "#ffffff", 0), "#000000");
  assert.equal(mix("#000000", "#ffffff", 1), "#ffffff");
  assert.equal(mix("#000000", "#ffffff", 0.5), "#808080");
});

/* ------------------------------------------------------------ family integrity */

test("families: all eight are defined and self-consistent", () => {
  assert.equal(DESIGN_FAMILIES.length, 8);
  for (const family of DESIGN_FAMILIES) {
    const d = DESIGNS[family];
    assert.ok(d, `${family} missing from DESIGNS`);
    assert.equal(d.family, family, `${family} key and token disagree`);
  }
});

test("families: labels and rationales are present and unique", () => {
  const labels = new Set<string>();
  const rationales = new Set<string>();
  for (const family of DESIGN_FAMILIES) {
    const d = DESIGNS[family];
    assert.ok(d.label.length > 0, `${family} has no label`);
    assert.ok(d.rationale.length > 40, `${family} rationale is too thin to be a real reason`);
    labels.add(d.label);
    rationales.add(d.rationale);
  }
  assert.equal(labels.size, 8, "two families share a label");
  assert.equal(rationales.size, 8, "two families share a rationale");
});

test("families: every colour token is a valid hex colour", () => {
  for (const family of DESIGN_FAMILIES) {
    const d = DESIGNS[family];
    for (const key of ["bg", "panel", "band", "ink", "muted", "line", "lineStrong"] as const) {
      assert.doesNotThrow(() => parseHex(d[key]), `${family}.${key} = ${d[key]}`);
    }
  }
});

test("families: the dark flag agrees with the actual background luminance", () => {
  for (const family of DESIGN_FAMILIES) {
    const d = DESIGNS[family];
    const isDark = luminance(d.bg) < 0.2;
    assert.equal(d.dark, isDark, `${family}.dark is ${d.dark} but bg ${d.bg} luminance is ${luminance(d.bg).toFixed(3)}`);
  }
});

test("families: length tokens are valid CSS lengths", () => {
  const length = /^(0|[\d.]+(rem|px|em))$/;
  for (const family of DESIGN_FAMILIES) {
    const d = DESIGNS[family];
    for (const key of ["radiusSm", "radiusMd", "radiusLg", "borderWidth", "sectionY", "measure"] as const) {
      assert.match(d[key], length, `${family}.${key} = ${d[key]}`);
    }
  }
});

test("families: the visual identities are actually distinct", () => {
  // A family that differs only in accent would defeat the point. Fingerprint the
  // properties a visitor would notice and assert no two collide.
  const fingerprints = DESIGN_FAMILIES.map((family) => {
    const d = DESIGNS[family];
    return [d.bg, d.fontHead, d.radiusMd, d.borderWidth, d.shadow, d.headWeight, d.headCase].join("|");
  });
  assert.equal(new Set(fingerprints).size, 8, "two families are visually identical");
});

/* ------------------------------------------------------- this product's design */

test("design: the product's category maps to a family deliberately", () => {
  assert.ok(
    Object.hasOwn(CATEGORY_DESIGN, product.category),
    `"${product.category}" is not in CATEGORY_DESIGN, so it silently fell back to standard. Add it.`,
  );
});

test("design: resolves to a real family", () => {
  const resolved = designFor(product);
  assert.ok(DESIGN_FAMILIES.includes(resolved.family), `${resolved.family} is not a known family`);
});

test("design: an explicit override wins over the category default", () => {
  const categoryDefault = CATEGORY_DESIGN[product.category];
  const other: DesignFamily = categoryDefault === "terminal" ? "clinical" : "terminal";
  assert.equal(designFor({ design: other, category: product.category }).family, other);
});

test("design: an unknown category falls back to standard rather than throwing", () => {
  assert.equal(designFor({ category: "Not A Real Category" }).family, "standard");
});

test("designVars: every variable is present and non-empty", () => {
  const expected = [
    "--accent",
    "--accent-soft",
    "--on-accent",
    "--accent-text",
    "--accent-on-soft",
    "--accent-on-white",
    "--bg",
    "--panel",
    "--band",
    "--ink",
    "--muted",
    "--line",
    "--line-strong",
    "--font-body",
    "--font-head",
    "--font-code",
    "--r-sm",
    "--r-md",
    "--r-lg",
    "--bw",
    "--shadow",
    "--shadow-lg",
    "--head-tracking",
    "--head-weight",
    "--head-case",
    "--label-case",
    "--label-tracking",
    "--section-y",
    "--measure",
  ];
  for (const key of expected) {
    assert.ok(key in vars, `${key} is missing from designVars`);
    assert.ok(String(vars[key]).length > 0, `${key} is empty`);
    assert.ok(!String(vars[key]).includes("undefined"), `${key} contains undefined`);
  }
});

test("designVars: the raw accent is preserved for fills", () => {
  assert.equal(vars["--accent"], product.accent);
});

/* ------------------------------------------------------------- WCAG AA on text */

test("a11y: body and heading text clear AA on every surface of this design", () => {
  for (const surface of [vars["--bg"], vars["--panel"], vars["--band"], vars["--accent-soft"]]) {
    for (const text of [vars["--ink"], vars["--muted"]]) {
      assert.ok(
        contrastRatio(text, surface) >= AA_NORMAL,
        `${text} on ${surface} is only ${ratio(text, surface)}:1`,
      );
    }
  }
});

test("a11y: text on a filled accent surface clears AA", () => {
  assert.ok(
    contrastRatio(vars["--on-accent"], vars["--accent"]) >= AA_NORMAL,
    `--on-accent ${vars["--on-accent"]} on --accent ${vars["--accent"]} is ${ratio(vars["--on-accent"], vars["--accent"])}:1`,
  );
});

test("a11y: the accent used as text clears AA on every surface of this design", () => {
  for (const surface of [vars["--bg"], vars["--panel"], vars["--band"]]) {
    assert.ok(
      contrastRatio(vars["--accent-text"], surface) >= AA_NORMAL,
      `--accent-text ${vars["--accent-text"]} on ${surface} is ${ratio(vars["--accent-text"], surface)}:1`,
    );
  }
});

test("a11y: the accent used as text on the soft tint clears AA", () => {
  assert.ok(
    contrastRatio(vars["--accent-on-soft"], vars["--accent-soft"]) >= AA_NORMAL,
    `${vars["--accent-on-soft"]} on ${vars["--accent-soft"]} is ${ratio(vars["--accent-on-soft"], vars["--accent-soft"])}:1`,
  );
});

test("a11y: the final call to action's white button text clears AA", () => {
  assert.ok(
    contrastRatio(vars["--accent-on-white"], "#ffffff") >= AA_NORMAL,
    `${vars["--accent-on-white"]} on white is ${ratio(vars["--accent-on-white"], "#ffffff")}:1`,
  );
});

test("a11y: this product's design would pass in all eight families", () => {
  // The accent is per-product and the surfaces are per-family. Asserting the whole
  // matrix means a future re-theming of any product cannot introduce a failure.
  for (const family of DESIGN_FAMILIES) {
    const v = designVars(DESIGNS[family], product.accent, product.accentSoft);
    assert.ok(
      contrastRatio(v["--on-accent"], v["--accent"]) >= AA_NORMAL,
      `${family}: on-accent fails`,
    );
    for (const surface of [v["--bg"], v["--panel"], v["--band"]]) {
      assert.ok(
        contrastRatio(v["--accent-text"], surface) >= AA_NORMAL,
        `${family}: accent-text ${v["--accent-text"]} on ${surface} is ${ratio(v["--accent-text"], surface)}:1`,
      );
      assert.ok(
        contrastRatio(v["--muted"], surface) >= AA_NORMAL,
        `${family}: muted ${v["--muted"]} on ${surface} is ${ratio(v["--muted"], surface)}:1`,
      );
    }
    assert.ok(
      contrastRatio(v["--ink"], v["--accent-soft"]) >= AA_NORMAL,
      `${family}: ink on accent-soft is ${ratio(v["--ink"], v["--accent-soft"])}:1`,
    );
    assert.ok(
      contrastRatio(v["--muted"], v["--accent-soft"]) >= AA_NORMAL,
      `${family}: muted on accent-soft is ${ratio(v["--muted"], v["--accent-soft"])}:1`,
    );
  }
});


/* ------------------------------------------------- WCAG 1.3.5 on the demo form */

/**
 * Mirrors the rule in A11yGate's own engine (apps/12-a11ygate/lib/engine.ts, the
 * "1.3.5 Autocomplete on identity fields" block).
 *
 * Duplicated deliberately rather than imported: an app must not depend on a sibling
 * app, and this is the one place where a copy is safer than a coupling. If the engine's
 * rule widens, `pnpm run a11y` catches the drift by auditing the real HTML — this test
 * is the fast guard that stops a new product shipping the gap in the first place.
 *
 * `select` and `textarea` are excluded because the engine only inspects `input`, and
 * because a select already constrains the answer to a known list.
 */
const IDENTITY_NAME = /\b(email|phone|tel|name|address|postcode|zip|country)\b/;

test("a11y 1.3.5: every identity-implying text input declares an autofill token", () => {
  const offenders = product.inputs
    .filter((field) => field.type === "text" || field.type === "url")
    .filter((field) => IDENTITY_NAME.test(field.name.toLowerCase()))
    .filter((field) => !field.autocomplete);

  assert.deepEqual(
    offenders.map((f) => f.name),
    [],
    `These fields render as <input> and their names imply user identity, so WCAG 1.3.5 requires an autocomplete token. ` +
      `Add \`autocomplete\` to the field in lib/product.ts — or rename it, if the value is not actually about the user.`,
  );
});

test("a11y 1.3.5: declared autofill tokens are real HTML autofill values", () => {
  // The subset that can plausibly appear on a single-feature tool's form. A typo like
  // "organisation" (the British spelling, which is not a token) would otherwise be
  // silently ignored by every browser.
  const VALID = new Set([
    "name",
    "given-name",
    "family-name",
    "honorific-prefix",
    "nickname",
    "email",
    "username",
    "tel",
    "tel-national",
    "organization",
    "organization-title",
    "street-address",
    "address-line1",
    "address-line2",
    "address-level1",
    "address-level2",
    "country",
    "country-name",
    "postal-code",
    "bday",
    "sex",
    "url",
    "off",
    "on",
  ]);

  for (const field of product.inputs) {
    if (!field.autocomplete) continue;
    assert.ok(
      VALID.has(field.autocomplete),
      `${field.name}: "${field.autocomplete}" is not an HTML autofill token. Note the token is "organization", not "organisation".`,
    );
  }
});

test("a11y: every input has a label and a stable id to attach it to", () => {
  for (const field of product.inputs) {
    assert.ok(field.label.trim().length > 0, `${field.name} has no label`);
    // The form uses the field name as the element id, so it has to be a valid one.
    assert.match(field.name, /^[a-zA-Z][a-zA-Z0-9_-]*$/, `${field.name} is not usable as an HTML id`);
  }
  const ids = product.inputs.map((f) => f.name);
  assert.equal(new Set(ids).size, ids.length, "two inputs share a name, so one label points at the wrong control");
});
