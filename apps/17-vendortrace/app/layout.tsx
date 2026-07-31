import type { Metadata, Viewport } from "next";
import { product } from "@/lib/product";
import { designFor, designVars } from "@/lib/design";
import { GROUP } from "@/lib/group";
import "./globals.css";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${product.slug}.abetworks.in`;
const design = designFor(product);

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `${product.name} — ${product.tagline}`,
    template: `%s — ${product.name}`,
  },
  description: product.oneLiner,
  applicationName: product.name,
  keywords: [product.category, product.audience, "Abet Works", product.name, product.mcpTool.name],
  authors: [{ name: GROUP.name, url: GROUP.site }],
  creator: GROUP.name,
  publisher: GROUP.name,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${product.name} — ${product.tagline}`,
    description: product.oneLiner,
    url: baseUrl,
    siteName: product.name,
    type: "website",
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title: `${product.name} — ${product.tagline}`,
    description: product.oneLiner,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  category: product.category,
};

export const viewport: Viewport = {
  themeColor: product.accent,
  colorScheme: design.dark ? "dark" : "light",
};

/**
 * Structured data.
 *
 * Emitted server-side as SoftwareApplication with the free tier as an Offer, so the
 * "free" claim in search results comes from the same config that renders the pricing
 * table and cannot drift from it. `isPartOf` ties every product back to the group,
 * which is the point of running fifty of these under one roof.
 */
function structuredData() {
  const free = product.pricing[0];
  const paid = product.pricing[1];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${baseUrl}/#software`,
        name: product.name,
        applicationCategory: "BusinessApplication",
        applicationSubCategory: product.category,
        operatingSystem: "Any (web)",
        url: baseUrl,
        description: product.oneLiner,
        audience: { "@type": "Audience", audienceType: product.audience },
        featureList: product.features.map((f) => f.title),
        offers: [
          {
            "@type": "Offer",
            name: free?.name ?? "Free",
            price: "0",
            priceCurrency: "USD",
            description: free?.blurb,
          },
          ...(paid
            ? [
                {
                  "@type": "Offer",
                  name: paid.name,
                  priceCurrency: "USD",
                  description: `${paid.price} ${paid.period} — ${paid.blurb}`,
                },
              ]
            : []),
        ],
        isPartOf: { "@type": "WebSite", name: GROUP.name, url: GROUP.site },
        provider: { "@type": "Organization", name: GROUP.name, url: GROUP.site },
      },
      {
        "@type": "FAQPage",
        "@id": `${baseUrl}/#faq`,
        mainEntity: product.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-design={design.family}>
      <body style={designVars(design, product.accent, product.accentSoft) as React.CSSProperties}>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          // Server-rendered from local config only. No user input reaches this.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()) }}
        />
      </body>
    </html>
  );
}
