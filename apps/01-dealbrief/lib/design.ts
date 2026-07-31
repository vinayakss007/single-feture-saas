/**
 * Design families.
 *
 * Fifty products that all look like the same landing page with a different accent
 * colour read as fifty pages from one content farm, and that costs trust on the
 * exact products where trust is the whole sale — a payroll compliance tool and a
 * child vaccination reminder should not feel like the same object.
 *
 * So the framework ships eight complete design families. A family is not a colour
 * swap: it changes the typeface, the surface, the radius, the border weight, the
 * density, and — importantly — the *composition* of the landing page and the shape
 * of the demo shell. `components/design/` holds one file per family.
 *
 * A product picks a family with `design` in its config. Left unset, it is derived
 * from `category`, so a new product is never accidentally undesigned. The mapping
 * is intentional rather than round-robin: finance products get the ledger family
 * because an accountant trusts a ruled table, security products get the terminal
 * family because that is the surface their buyer already lives in.
 */

import { luminance, mix, onColor, readableOn } from "./contrast.ts";

export const DESIGN_FAMILIES = [
  "standard",
  "editorial",
  "terminal",
  "bento",
  "split",
  "brutalist",
  "ledger",
  "clinical",
] as const;

export type DesignFamily = (typeof DESIGN_FAMILIES)[number];

export type DesignTokens = {
  family: DesignFamily;
  /** shown in the group switcher and in docs */
  label: string;
  /** one line on why this family suits its products */
  rationale: string;

  /** page background */
  bg: string;
  /** raised panel / card background */
  panel: string;
  /** alternating band background */
  band: string;
  ink: string;
  muted: string;
  line: string;
  /** border colour for a strong, deliberate edge (brutalist, terminal) */
  lineStrong: string;

  fontBody: string;
  fontHead: string;
  /** monospace, used for code and for numerals in the ledger family */
  fontMono: string;

  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  borderWidth: string;
  shadow: string;
  shadowLg: string;

  /** heading letter-spacing and weight, which carry most of a family's voice */
  headTracking: string;
  headWeight: string;
  headCase: "none" | "uppercase";
  /** small eyebrow / label treatment */
  labelCase: "none" | "uppercase";
  labelTracking: string;

  /** vertical rhythm of a section */
  sectionY: string;
  /** page max width — editorial and clinical read better narrow */
  measure: string;

  /** true when the surface is dark, so nav, inputs and code blocks invert */
  dark: boolean;
};

const SYSTEM_SANS =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Inter, "Helvetica Neue", sans-serif';
const SYSTEM_SERIF =
  'ui-serif, Georgia, Cambria, "Iowan Old Style", "Times New Roman", Times, serif';
const SYSTEM_MONO =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';
const SYSTEM_DISPLAY =
  '"Helvetica Neue", Helvetica, Arial, "Arial Black", ui-sans-serif, system-ui, sans-serif';

export const DESIGNS: Record<DesignFamily, DesignTokens> = {
  standard: {
    family: "standard",
    label: "Standard",
    rationale:
      "Neutral product-marketing surface. Used where the buyer has no strong aesthetic expectation and clarity wins.",
    bg: "#ffffff",
    panel: "#ffffff",
    band: "#fafbfd",
    ink: "#0b1020",
    muted: "#5b6478",
    line: "#e6e8f0",
    lineStrong: "#c9cede",
    fontBody: SYSTEM_SANS,
    fontHead: SYSTEM_SANS,
    fontMono: SYSTEM_MONO,
    radiusSm: "0.5rem",
    radiusMd: "0.75rem",
    radiusLg: "1rem",
    borderWidth: "1px",
    shadow: "0 1px 2px rgba(11,16,32,.04)",
    shadowLg: "0 8px 30px rgba(11,16,32,.07)",
    headTracking: "-0.02em",
    headWeight: "600",
    headCase: "none",
    labelCase: "uppercase",
    labelTracking: "0.14em",
    sectionY: "5rem",
    measure: "72rem",
    dark: false,
  },

  editorial: {
    family: "editorial",
    label: "Editorial",
    rationale:
      "Serif, ruled, article-shaped. Used for legal, policy and compliance products, where the buyer is reading to be persuaded and expects prose, not tiles.",
    bg: "#fcfbf7",
    panel: "#ffffff",
    band: "#f6f4ed",
    ink: "#1a1814",
    muted: "#6b6558",
    line: "#ddd8ca",
    lineStrong: "#1a1814",
    fontBody: SYSTEM_SERIF,
    fontHead: SYSTEM_SERIF,
    fontMono: SYSTEM_MONO,
    radiusSm: "0.125rem",
    radiusMd: "0.1875rem",
    radiusLg: "0.25rem",
    borderWidth: "1px",
    shadow: "none",
    shadowLg: "none",
    headTracking: "-0.015em",
    headWeight: "500",
    headCase: "none",
    labelCase: "uppercase",
    labelTracking: "0.18em",
    sectionY: "5.5rem",
    measure: "64rem",
    dark: false,
  },

  terminal: {
    family: "terminal",
    label: "Terminal",
    rationale:
      "Dark, monospace, shell-framed. Used for monitoring, deliverability and security products, whose buyer already works in this surface and reads it as competence.",
    bg: "#0a0e14",
    panel: "#111721",
    band: "#0d121a",
    ink: "#dfe6f0",
    muted: "#8b98ab",
    line: "#1f2733",
    lineStrong: "#2b3646",
    fontBody: SYSTEM_MONO,
    fontHead: SYSTEM_MONO,
    fontMono: SYSTEM_MONO,
    radiusSm: "0",
    radiusMd: "0.125rem",
    radiusLg: "0.25rem",
    borderWidth: "1px",
    shadow: "none",
    shadowLg: "0 0 0 1px rgba(255,255,255,.03)",
    headTracking: "-0.01em",
    headWeight: "600",
    headCase: "none",
    labelCase: "uppercase",
    labelTracking: "0.16em",
    sectionY: "4.5rem",
    measure: "72rem",
    dark: true,
  },

  bento: {
    family: "bento",
    label: "Bento",
    rationale:
      "Borderless tiles on a cool ground, asymmetric grid. Used for analytics and research products, where the value is many facets shown at once.",
    bg: "#f1f4fa",
    panel: "#ffffff",
    band: "#e8edf6",
    ink: "#0d1526",
    muted: "#5a6580",
    line: "#dfe5f0",
    lineStrong: "#c4ccdd",
    fontBody: SYSTEM_SANS,
    fontHead: SYSTEM_SANS,
    fontMono: SYSTEM_MONO,
    radiusSm: "0.75rem",
    radiusMd: "1.25rem",
    radiusLg: "1.75rem",
    borderWidth: "0px",
    shadow: "0 1px 3px rgba(13,21,38,.06)",
    shadowLg: "0 12px 40px rgba(13,21,38,.10)",
    headTracking: "-0.03em",
    headWeight: "650",
    headCase: "none",
    labelCase: "uppercase",
    labelTracking: "0.12em",
    sectionY: "3.5rem",
    measure: "76rem",
    dark: false,
  },

  split: {
    family: "split",
    label: "Split",
    rationale:
      "Two-column hero with the demo visible above the fold. Used where the product explains itself faster by being tried than by being described.",
    bg: "#ffffff",
    panel: "#ffffff",
    band: "#f7f9fc",
    ink: "#0a1424",
    muted: "#54607a",
    line: "#e3e8f2",
    lineStrong: "#c6cfe0",
    fontBody: SYSTEM_SANS,
    fontHead: SYSTEM_SANS,
    fontMono: SYSTEM_MONO,
    radiusSm: "0.5rem",
    radiusMd: "0.875rem",
    radiusLg: "1.25rem",
    borderWidth: "1px",
    shadow: "0 1px 2px rgba(10,20,36,.05)",
    shadowLg: "0 10px 34px rgba(10,20,36,.08)",
    headTracking: "-0.025em",
    headWeight: "640",
    headCase: "none",
    labelCase: "uppercase",
    labelTracking: "0.13em",
    sectionY: "4.5rem",
    measure: "74rem",
    dark: false,
  },

  brutalist: {
    family: "brutalist",
    label: "Brutalist",
    rationale:
      "Hard borders, offset shadows, oversized type. Used for consumer products fighting for attention, where a polite SaaS page is ignored.",
    bg: "#fffdf4",
    panel: "#ffffff",
    band: "#fff8dc",
    ink: "#111111",
    muted: "#4a4a44",
    line: "#111111",
    lineStrong: "#111111",
    fontBody: SYSTEM_SANS,
    fontHead: SYSTEM_DISPLAY,
    fontMono: SYSTEM_MONO,
    radiusSm: "0",
    radiusMd: "0",
    radiusLg: "0",
    borderWidth: "2px",
    shadow: "4px 4px 0 #111111",
    shadowLg: "8px 8px 0 #111111",
    headTracking: "-0.04em",
    headWeight: "800",
    headCase: "uppercase",
    labelCase: "uppercase",
    labelTracking: "0.08em",
    sectionY: "4rem",
    measure: "72rem",
    dark: false,
  },

  ledger: {
    family: "ledger",
    label: "Ledger",
    rationale:
      "Ruled rows, tabular numerals, high density. Used for tax, payroll, invoicing and lending products, where the buyer trusts a statement and distrusts a marketing tile.",
    bg: "#fbfaf7",
    panel: "#ffffff",
    band: "#f4f2ec",
    ink: "#14161a",
    muted: "#5f6570",
    line: "#dcdad2",
    lineStrong: "#b4b1a5",
    fontBody: SYSTEM_SANS,
    fontHead: SYSTEM_SANS,
    fontMono: SYSTEM_MONO,
    radiusSm: "0.125rem",
    radiusMd: "0.1875rem",
    radiusLg: "0.25rem",
    borderWidth: "1px",
    shadow: "none",
    shadowLg: "none",
    headTracking: "-0.02em",
    headWeight: "600",
    headCase: "none",
    labelCase: "uppercase",
    labelTracking: "0.1em",
    sectionY: "4rem",
    measure: "70rem",
    dark: false,
  },

  clinical: {
    family: "clinical",
    label: "Clinical",
    rationale:
      "Restrained, airy, thin rules, no persuasion theatre. Used for health products, where overselling is the fastest way to lose a reader who is worried about a real result.",
    bg: "#ffffff",
    panel: "#ffffff",
    band: "#f6fafb",
    ink: "#101a1e",
    muted: "#5a6a72",
    line: "#e2ebee",
    lineStrong: "#c3d3d9",
    fontBody: SYSTEM_SANS,
    fontHead: SYSTEM_SANS,
    fontMono: SYSTEM_MONO,
    radiusSm: "0.25rem",
    radiusMd: "0.375rem",
    radiusLg: "0.5rem",
    borderWidth: "1px",
    shadow: "none",
    shadowLg: "0 4px 20px rgba(16,26,30,.05)",
    headTracking: "-0.01em",
    headWeight: "500",
    headCase: "none",
    labelCase: "uppercase",
    labelTracking: "0.2em",
    sectionY: "6rem",
    measure: "66rem",
    dark: false,
  },
};

/**
 * Category to family. Explicit rather than computed, because the point is that a
 * human decided a lending calculator should look like a statement.
 *
 * A category that is not listed falls back to `standard`, and `designFor` is
 * covered by a test that asserts every shipped category resolves to a family
 * deliberately, so adding a product in a new category surfaces here rather than
 * quietly rendering the neutral design.
 */
export const CATEGORY_DESIGN: Record<string, DesignFamily> = {
  // Revenue and go-to-market: neutral or conversion-led.
  "Revenue operations": "split",
  "Customer success": "standard",
  "Outbound sales": "split",
  "Content marketing": "bento",
  "Competitive intelligence": "bento",
  "AI search optimisation": "bento",
  "Career tools": "split",
  "Education tools": "bento",

  // Reading-to-be-persuaded: legal, policy, contractual.
  "Privacy compliance": "editorial",
  "AI governance": "editorial",
  "Security compliance": "editorial",
  "Contract operations": "editorial",
  "Legal tools": "editorial",

  // Buyer lives in a terminal.
  Monitoring: "terminal",
  "AI security": "terminal",
  "Email deliverability": "terminal",
  "Accessibility compliance": "terminal",

  // Money: ruled and tabular.
  "Finance automation": "ledger",
  "Finance operations": "ledger",
  "Finance tools": "ledger",
  "Tax compliance": "ledger",
  "Payroll compliance": "ledger",
  "Personal finance": "ledger",
  "Real estate & compliance": "ledger",
  "Health finance": "ledger",
  "Travel money": "ledger",

  // Health: restrained.
  "Health records": "clinical",
  "Child health": "clinical",
  "Health & nutrition": "clinical",
  "Health & wellness": "clinical",
  "Health tools": "clinical",
  "Nutrition tools": "clinical",
  "Pet care": "clinical",

  // Consumer, attention-seeking.
  "Travel rights": "brutalist",
  "Travel tools": "brutalist",
  "Energy & sustainability": "brutalist",
  "Utilities & consumer rights": "brutalist",
  "Real estate & housing": "brutalist",
  "Fitness & endurance": "brutalist",
  "Agriculture tools": "standard",
  "Utility tools": "standard",
};

export function designFor(input: { design?: DesignFamily; category: string }): DesignTokens {
  if (input.design && DESIGNS[input.design]) return DESIGNS[input.design];
  return DESIGNS[CATEGORY_DESIGN[input.category] ?? "standard"];
}

/**
 * The tokens as CSS custom properties, applied once on `<body>`.
 *
 * Everything downstream reads `var(--…)`, which is what lets a single set of
 * components render in eight families without prop-drilling a theme object
 * through every leaf, and lets the auth and dashboard screens inherit the
 * product's design for free.
 */
export function designVars(d: DesignTokens, accent: string, accentSoft: string): Record<string, string> {
  /**
   * The worst surface the accent will be read against.
   *
   * A family has three backgrounds — page, panel and band — and accent text appears
   * on all three. For a light family the hardest case for a darkened accent is the
   * darkest surface; for the dark family it is the lightest. Deriving against that
   * one guarantees the result clears AA on all three, which is cheaper and more
   * honest than emitting three variants and hoping each is used in the right place.
   */
  const surfaces = [d.bg, d.panel, d.band];
  const worstSurface = d.dark
    ? surfaces.reduce((a, b) => (luminance(b) > luminance(a) ? b : a))
    : surfaces.reduce((a, b) => (luminance(b) < luminance(a) ? b : a));

  /**
   * The soft accent tint has to be derived on a dark family rather than taken from
   * the product config.
   *
   * `accentSoft` in a product config is a very light wash — it is used as a panel
   * background behind ink and muted text, which is correct on the seven light
   * families. On the terminal family the text colours are light, so pasting a light
   * wash behind them produced light-on-light: the API section's callout was
   * effectively invisible. Mixing the accent most of the way into the page background
   * gives the same "faint tint of the brand colour" role with the right polarity.
   */
  const soft = d.dark ? mix(accent, d.bg, 0.86) : accentSoft;

  return {
    "--accent": accent,
    "--accent-soft": soft,
    /** Readable foreground for text on a filled accent surface. */
    "--on-accent": onColor(accent),
    /** The accent, adjusted so it is legible as small text on this family's surfaces. */
    "--accent-text": readableOn(accent, worstSurface),
    /** The accent as text on the accent-soft tint, which is a different surface again. */
    "--accent-on-soft": readableOn(accent, soft),
    /**
     * The accent as text on pure white. Needed for the one inverted case: the final
     * call to action is a white button on an accent band, so it cannot use
     * `--accent-text` — in the dark family that variant is *lightened*, which would
     * be invisible here.
     */
    "--accent-on-white": readableOn(accent, "#ffffff"),
    "--bg": d.bg,
    "--panel": d.panel,
    "--band": d.band,
    "--ink": d.ink,
    "--muted": d.muted,
    "--line": d.line,
    "--line-strong": d.lineStrong,
    "--font-body": d.fontBody,
    "--font-head": d.fontHead,
    "--font-code": d.fontMono,
    "--r-sm": d.radiusSm,
    "--r-md": d.radiusMd,
    "--r-lg": d.radiusLg,
    "--bw": d.borderWidth,
    "--shadow": d.shadow,
    "--shadow-lg": d.shadowLg,
    "--head-tracking": d.headTracking,
    "--head-weight": d.headWeight,
    "--head-case": d.headCase === "uppercase" ? "uppercase" : "none",
    "--label-case": d.labelCase === "uppercase" ? "uppercase" : "none",
    "--label-tracking": d.labelTracking,
    "--section-y": d.sectionY,
    "--measure": d.measure,
  };
}
