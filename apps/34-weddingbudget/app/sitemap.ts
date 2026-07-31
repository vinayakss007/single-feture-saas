import type { MetadataRoute } from "next";
import { product } from "@/lib/product";
import { siblings } from "@/lib/group";

/**
 * Sitemap for this product.
 *
 * Only the pages worth indexing: the landing page, the live demo, and signup. The
 * dashboard and the password screens are deliberately excluded — they are gated or
 * transient, and listing them wastes crawl budget on pages that will never rank.
 *
 * The `alternates` block is not used for languages here; instead the sibling
 * products are exposed as a separate low-priority group so a crawler that lands on
 * one product discovers the rest of the group without needing the hub to be crawled
 * first. Cross-domain entries in a sitemap are only honoured for verified domains,
 * which they are — every product is a subdomain of abetworks.in.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? `https://${product.slug}.abetworks.in`).replace(/\/$/, "");
  const now = new Date();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/app`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/api/v1/openapi`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    ...siblings.map((s) => ({
      url: s.url,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.2,
    })),
  ];
}
