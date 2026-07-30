import { Nav } from "@/components/nav.tsx";
import { ForAgents, Footer, Framework, Hero, Platform, ProductGrid, Section } from "@/components/sections.tsx";
import { company, linkedProducts, platform } from "@/lib/links.ts";

export default function Home() {
  return (
    <>
      <Nav products={linkedProducts} company={company} />

      <main>
        <Hero products={linkedProducts} repoUrl={company.repoUrl} />

        <Section
          id="products"
          eyebrow="The suite"
          title="Ten products. Ten problems. No overlap."
          subtitle="Each one is a separate product on its own domain, with its own free plan. Click any of them to go straight there — nothing here asks you to sign up first."
        >
          <ProductGrid products={linkedProducts} />
        </Section>

        <Section
          id="platform"
          eyebrow="Platform"
          title="The bigger products these feed into"
          subtitle="The suite is not the end of it. Three larger products are in build, and the single-feature tools are deliberately the pieces they are made of."
          tint
        >
          <Platform items={platform} />
        </Section>

        <Section
          id="framework"
          eyebrow="How we build"
          title="Four rules, applied to all ten without exception"
          subtitle="Shipping ten products with a small team only works if they are built the same way. These are the constraints that make that possible — and each one is enforced by a test rather than by good intentions."
        >
          <Framework repoUrl={company.repoUrl} />
        </Section>

        <Section
          id="agents"
          eyebrow="For agents"
          title="Built to be called by software, not just clicked"
          subtitle="Everything a person can do on these sites, a program can do over HTTP — and an agent can discover how without reading docs."
          tint
        >
          <ForAgents products={linkedProducts} />
        </Section>

        {/* Closing call to action */}
        <section className="border-t">
          <div className="mx-auto max-w-6xl px-5 py-24 text-center">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
              Pick the one that matches your problem.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-muted">
              They all work in the browser right now, with no account. If one of them saves you an afternoon, that is
              when it is worth paying for.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#products"
                className="rounded-xl bg-brand px-6 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-brand/20 transition hover:opacity-90"
              >
                Browse all {linkedProducts.length}
              </a>
              <a
                href={`mailto:${company.email}?subject=${encodeURIComponent("Abet Works enquiry")}`}
                className="rounded-xl border bg-white px-6 py-3.5 text-[15px] font-semibold transition hover:bg-brand-soft"
              >
                Need something custom?
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer products={linkedProducts} company={company} />
    </>
  );
}
