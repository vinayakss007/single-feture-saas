import { products, suite, type HubProduct } from "./catalog.generated.ts";

/**
 * Where each product actually lives.
 *
 * Every product is a separate deployment on its own subdomain of abetworks.in, so
 * the hub has to build outbound URLs rather than route internally.
 *
 * `PRODUCT_DOMAIN_BASE` exists so the whole set can be repointed at once — at a
 * staging apex, or at Vercel preview URLs — without editing ten links. A single
 * product can be overridden with `PRODUCT_URL_<SLUG>`, which is what you need
 * during a launch when nine are live on the real domain and the tenth is not.
 */

const DOMAIN_BASE = (process.env.NEXT_PUBLIC_PRODUCT_DOMAIN_BASE ?? "abetworks.in").replace(/^\.|\/$/g, "");

export type LinkedProduct = HubProduct & {
  /** absolute URL of the product's own site */
  url: string;
  /** its live demo, deep-linked */
  demoUrl: string;
  /** its public API docs endpoint */
  apiUrl: string;
  /** 1-based position, from the folder prefix */
  index: number;
};

function overrideFor(slug: string): string | null {
  const key = `NEXT_PUBLIC_PRODUCT_URL_${slug.toUpperCase().replace(/-/g, "_")}`;
  const value = process.env[key]?.trim();
  return value ? value.replace(/\/$/, "") : null;
}

export function productUrl(slug: string): string {
  return overrideFor(slug) ?? `https://${slug}.${DOMAIN_BASE}`;
}

export const linkedProducts: LinkedProduct[] = products.map((p) => {
  const url = productUrl(p.slug);
  return {
    ...p,
    url,
    demoUrl: `${url}/app`,
    apiUrl: `${url}/api/v1/run`,
    index: Number(p.dir.slice(0, 2)),
  };
});

export const company = {
  name: suite.company,
  site: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? suite.site,
  repo: suite.repo,
  repoUrl: `https://github.com/${suite.repo}`,
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@abetworks.in",
  github: "https://github.com/vinayakss007",
} as const;

/**
 * The larger platform products. Deliberately hand-written rather than generated:
 * they are not in this repository, and stating their real status is the point.
 * A banner site that lists in-progress work as shipped is a banner site nobody
 * trusts the rest of.
 */
export const platform = [
  {
    name: "NuCRM",
    blurb: "A CRM that does not need a six-week implementation before it is useful.",
    detail:
      "The full product the revenue tools point at. Contacts, pipeline, activity and forecasting, built so a five-person team can run it without an admin.",
    status: "In active build",
    repo: "https://github.com/vinayakss007/nucrm-bigplan-by-vm-enterprise-v2",
    accent: "#4f46e5",
  },
  {
    name: "FlowForge",
    blurb: "Automation for the work between the tools.",
    detail:
      "Visual workflows over the same primitives as the single-feature products, so anything in the suite becomes a step in a larger process.",
    status: "In active build",
    repo: null,
    accent: "#ea580c",
  },
  {
    name: "Agent Fleet",
    blurb: "Agents that use these products as tools.",
    detail:
      "Every product here ships an MCP server for exactly this reason. Agent Fleet is the orchestration layer that runs them together.",
    status: "In active build",
    repo: "https://github.com/vinayakss007/aw-agent-fleet",
    accent: "#0891b2",
  },
] as const;
