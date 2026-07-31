import type { Metadata } from "next";
import { product } from "@/lib/product";
import { Footer, Nav } from "@/components/site";
import { Runner } from "@/components/runner";

export const metadata: Metadata = {
  title: "Live demo",
  description: `Run ${product.name} on your own data. ${product.oneLiner}`,
};

export default function AppPage() {
  return (
    <>
      <Nav p={product} />
      <main className="mx-auto max-w-6xl px-5 py-14">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--accent)" }}>
            Live demo
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{product.name}</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-muted">{product.oneLiner}</p>
        </div>
        <div className="mt-12">
          <Runner p={product} />
        </div>
      </main>
      <Footer p={product} />
    </>
  );
}
