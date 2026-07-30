import type { Metadata } from "next";
import "./globals.css";
import { company, linkedProducts } from "@/lib/links.ts";

const TITLE = "Abet Works — software that does one thing, properly";
const DESCRIPTION =
  "Ten single-feature SaaS products, each solving one problem completely. Every one has a free plan, a working demo with no signup, a public REST API and an MCP server.";

export const metadata: Metadata = {
  metadataBase: new URL(company.site),
  title: { default: TITLE, template: "%s · Abet Works" },
  description: DESCRIPTION,
  applicationName: company.name,
  keywords: [
    "Abet Works",
    "single-feature SaaS",
    "micro SaaS",
    "MCP server",
    "REST API",
    ...linkedProducts.map((p) => p.name),
  ],
  authors: [{ name: company.name, url: company.site }],
  openGraph: {
    type: "website",
    url: company.site,
    siteName: company.name,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  alternates: { canonical: company.site },
  robots: { index: true, follow: true },
};

/**
 * Organisation and product structured data.
 *
 * Worth the bytes: this is a hub page whose entire purpose is to be the thing a
 * search engine or an answer engine returns when someone looks up the company, and
 * an ItemList of the ten products is what makes them individually discoverable
 * from here.
 */
function structuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${company.site}/#organization`,
        name: company.name,
        url: company.site,
        email: company.email,
        sameAs: [company.github, company.repoUrl],
        description: DESCRIPTION,
      },
      {
        "@type": "ItemList",
        name: "Abet Works products",
        numberOfItems: linkedProducts.length,
        itemListElement: linkedProducts.map((p) => ({
          "@type": "ListItem",
          position: p.index,
          item: {
            "@type": "SoftwareApplication",
            name: p.name,
            url: p.url,
            applicationCategory: "BusinessApplication",
            description: p.tagline,
            offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
          },
        })),
      },
    ],
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <script
          type="application/ld+json"
          // Generated from our own catalog, never from user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()) }}
        />
      </body>
    </html>
  );
}
