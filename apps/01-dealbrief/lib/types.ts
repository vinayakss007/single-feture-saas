/**
 * Shared contracts for every product in the Abet Works single-feature SaaS suite.
 *
 * Every product implements exactly one `run()` function that takes a plain object
 * of string inputs and returns a `RunResult`. That single contract is what lets
 * one UI, one REST endpoint and one MCP server serve all ten products.
 */

export type InputField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "url";
  placeholder?: string;
  required?: boolean;
  options?: string[];
  help?: string;
  rows?: number;
};

export type PricingTier = {
  name: string;
  price: string;
  period: string;
  blurb: string;
  features: string[];
  cta: string;
  highlight?: boolean;
};

export type ProductConfig = {
  /** url-safe id, matches the folder name suffix */
  slug: string;
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
