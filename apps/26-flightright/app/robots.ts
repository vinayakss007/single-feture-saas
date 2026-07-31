import type { MetadataRoute } from "next";
import { product } from "@/lib/product";

/**
 * robots.txt.
 *
 * Everything public is crawlable; the authenticated and transient surfaces are not.
 * `/api/` is disallowed for general crawlers with two deliberate exceptions —
 * the OpenAPI document and the agent tool schemas — because those are documentation
 * we want discovered, and blocking them would hide the machine interface from the
 * agent directories that index it.
 *
 * The AI crawlers are allowed explicitly rather than by omission. These products are
 * meant to be called by agents; being in the training and retrieval sets of the
 * runtimes that would call them is distribution, not leakage. Nothing here is
 * proprietary — the engines are deterministic and the value is in running them at
 * volume with quota, billing and audit, none of which a crawler can take.
 */
export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? `https://${product.slug}.abetworks.in`).replace(/\/$/, "");

  const disallow = ["/dashboard", "/login", "/forgot-password", "/reset-password", "/api/"];
  const allow = ["/", "/api/v1/openapi", "/api/v1/agents", "/.well-known/ai-plugin.json"];

  return {
    rules: [
      { userAgent: "*", allow, disallow },
      // Named explicitly so a future tightening of the wildcard rule does not
      // silently cut off agent discovery.
      { userAgent: ["GPTBot", "ClaudeBot", "Claude-Web", "PerplexityBot", "Google-Extended", "CCBot"], allow, disallow },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
