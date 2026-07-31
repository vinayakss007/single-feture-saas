/**
 * Shared contracts for every product in the Abet Works single-feature SaaS suite.
 *
 * Every product implements exactly one `run()` function that takes a plain object
 * of string inputs and returns a `RunResult`. That single contract is what lets
 * one UI, one REST endpoint and one MCP server serve all ten products.
 */

import type { DesignFamily } from "./design.ts";

export type { DesignFamily };

export type InputField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "url";
  placeholder?: string;
  required?: boolean;
  options?: string[];
  help?: string;
  rows?: number;
  /**
   * HTML autofill token, e.g. "name", "email", "organization", "postal-code".
   *
   * Required by WCAG 1.3.5 for any field that collects information *about the user* —
   * our own A11yGate engine flags a missing one, and it found exactly this gap in
   * LabTrack's name field.
   *
   * Deliberately explicit rather than inferred from the field name, because inference
   * gets it actively wrong. ColdAngle asks for a "Prospect company" and PackList asks
   * for the traveller's gender; auto-filling the user's own employer or profile into
   * those is worse than leaving the token off. VaxDue's date of birth belongs to a
   * child, so `bday` would offer the parent's. A token is only correct when the answer
   * really is the person filling the form in, and only a person can decide that.
   */
  autocomplete?: string;
};

export type PricingTier = {
  name: string;
  price: string;
  period: string;
  blurb: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  /**
   * Entitlements. Optional so a product can ship marketing copy first, but once
   * you charge money these should be set explicitly rather than inherited from
   * the defaults in `lib/plans.ts` — see FRAMEWORK.md step 4.
   */
  /** Metered runs included per calendar month. Use `Infinity` for uncapped. */
  monthlyRuns?: number;
  /** Whether this tier may create API keys and use the MCP server. */
  apiAccess?: boolean;
  /** Requests per minute allowed against /api/v1/run. */
  rateLimitPerMin?: number;
};

export type ProductConfig = {
  /** url-safe id, matches the folder name suffix */
  slug: string;
  /**
   * Which of the eight design families in `lib/design.ts` renders this product.
   *
   * Left unset it is derived from `category`, which is the normal case — the
   * mapping in `CATEGORY_DESIGN` already encodes a deliberate choice per category.
   * Set it explicitly only to disagree with that default for one product, e.g. a
   * money product whose buyer is a consumer rather than a bookkeeper.
   */
  design?: DesignFamily;
  name: string;
  /** short Product Hunt style tagline, <= 60 chars */
  tagline: string;
  /** one sentence that explains the single job this product does */
  oneLiner: string;
  category: string;
  audience: string;
  /** hex colour used as the accent across the whole site */
  accent: string;
  /** very light tint of the accent, used for backgrounds */
  accentSoft: string;
  problem: { title: string; body: string }[];
  features: { title: string; body: string }[];
  how: string[];
  integrations: string[];
  metrics: { value: string; label: string }[];
  pricing: PricingTier[];
  faq: { q: string; a: string }[];
  /** fields rendered on the live demo page and accepted by the REST API */
  inputs: InputField[];
  /** pre-filled example so the demo is never a blank page */
  sample: Record<string, string>;
  mcpTool: { name: string; description: string };
  /**
   * Set true only when `run()` reaches the network, so identical inputs can
   * legitimately produce different output.
   *
   * The default is false and the shared test suite enforces determinism, because
   * a deterministic engine is cacheable, testable and free to run. Opting out is
   * a real cost — it means egress, timeouts, and a product that can fail because
   * someone else's server is down — so it must be a deliberate declaration rather
   * than something that creeps in.
   */
  probesNetwork?: boolean;
  /**
   * Overrides which demo form is shown first.
   *
   * Left unset, `components/runner.tsx` derives it from the shape of the inputs:
   * several short questions get the guided one-at-a-time form, a single large paste
   * gets the classic all-fields form. Set this only where that heuristic reads a
   * product wrongly — the visitor can switch either way.
   */
  formMode?: "guided" | "classic";
};

export type Severity = "high" | "medium" | "low";
export type Band = "good" | "warn" | "bad";

export type ResultItem = {
  title?: string;
  body: string;
  tag?: string;
  severity?: Severity;
};

export type RunResult = {
  /** one line summary shown at the top of the result panel */
  headline: string;
  /** optional headline score, rendered as a dial */
  score?: { label: string; value: number; max: number; band: Band };
  /** small stat tiles */
  metrics?: { label: string; value: string; hint?: string }[];
  /** grouped findings / suggestions / extracted facts */
  sections?: { title: string; items: ResultItem[] }[];
  /** tabular output, e.g. line items or per-account scores */
  table?: { columns: string[]; rows: string[][] };
  /** blocks the user is meant to copy out, e.g. generated copy or CSV */
  copyBlocks?: { title: string; text: string; language?: string }[];
  /** machine payload, always returned by the REST API */
  json?: unknown;
};

export type RunInput = Record<string, string>;

export type Engine = {
  run: (input: RunInput) => RunResult | Promise<RunResult>;
};
