import type { MetadataRoute } from "next";
import { company } from "@/lib/links.ts";

/**
 * Only this site's own pages.
 *
 * The ten products are separate deployments on their own subdomains, and each
 * publishes its own sitemap. Listing another host's URLs here would be ignored by
 * every crawler that follows the spec, and would misrepresent what this origin
 * owns.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: company.site,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
