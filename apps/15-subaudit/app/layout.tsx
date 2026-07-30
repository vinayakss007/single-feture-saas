import type { Metadata, Viewport } from "next";
import { product } from "@/lib/product";
import "./globals.css";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `${product.name} — ${product.tagline}`,
    template: `%s — ${product.name}`,
  },
  description: product.oneLiner,
  applicationName: product.name,
  keywords: [product.category, product.audience, "Abet Works", product.name],
  authors: [{ name: "Abet Works", url: "https://abetworks.in" }],
  openGraph: {
    title: `${product.name} — ${product.tagline}`,
    description: product.oneLiner,
    url: baseUrl,
    siteName: product.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${product.name} — ${product.tagline}`,
    description: product.oneLiner,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: product.accent,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={
          {
            "--accent": product.accent,
            "--accent-soft": product.accentSoft,
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
