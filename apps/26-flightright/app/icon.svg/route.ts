import { product } from "@/lib/product";
import { designFor } from "@/lib/design";

/**
 * Favicon and plugin logo, generated as SVG.
 *
 * Deliberately not `next/og`'s ImageResponse: that pulls Satori and a font binary
 * into the serverless bundle of all fifty products to draw one letter in a box. An
 * SVG built from the product's accent and design family costs nothing, scales
 * perfectly, and stays in sync with the site automatically.
 *
 * The mark follows the design family rather than being uniform — a square mark for
 * the hard-edged families, a rounded one for the soft families — so a browser tab
 * looks like it belongs to the site behind it.
 */
export const runtime = "nodejs";
export const dynamic = "force-static";

export function GET() {
  const d = designFor(product);
  const initial = product.name.slice(0, 1).toUpperCase();

  // Radius mirrors the family: 0 for brutalist/terminal, generous for bento.
  const radius =
    d.family === "brutalist" || d.family === "terminal"
      ? 0
      : d.family === "bento"
        ? 14
        : d.family === "editorial" || d.family === "ledger"
          ? 3
          : 8;

  const stroke = d.family === "brutalist" ? `<rect x="1.5" y="1.5" width="61" height="61" rx="${radius}" fill="none" stroke="${d.ink}" stroke-width="3"/>` : "";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="${product.name}">
  <rect width="64" height="64" rx="${radius}" fill="${product.accent}"/>
  ${stroke}
  <text x="32" y="43" text-anchor="middle" font-family="${d.family === "editorial" ? "Georgia, serif" : d.family === "terminal" ? "ui-monospace, monospace" : "system-ui, -apple-system, sans-serif"}" font-size="${d.family === "brutalist" ? 36 : 34}" font-weight="${d.family === "brutalist" ? 800 : 650}" fill="#ffffff">${initial}</text>
</svg>
`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
