import type { ProductConfig } from "@/lib/types";
import {
  ApiSection,
  Card,
  Eyebrow,
  FaqSection,
  FinalCta,
  GhostLink,
  GroupStrip,
  H1,
  MetricStrip,
  PricingCards,
  PrimaryLink,
  Section,
  SectionHead,
  Shell,
} from "./kit";

/**
 * Standard family.
 *
 * The neutral, conventional product page: centred-left hero over a faint grid,
 * three-column card sections. It exists so that the other seven families are a
 * deliberate choice rather than the only option, and so a product whose buyer has
 * no aesthetic expectation gets the clearest possible read.
 */
export function StandardLanding({ p }: { p: ProductConfig }) {
  return (
    <main id="main-content">
      <div className="relative overflow-hidden" style={{ borderBottom: "var(--bw) solid var(--line)" }}>
        <div className="absolute inset-0 grid-bg" aria-hidden />
        <div className="absolute inset-0 accent-fade" aria-hidden />
        <Shell className="relative py-24 sm:py-28">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium"
            style={{
              background: "var(--panel)",
              color: "var(--muted)",
              borderRadius: "9999px",
              borderWidth: "var(--bw)",
              borderStyle: "solid",
              borderColor: "var(--line)",
            }}
          >
            <span className="size-1.5 rounded-full" style={{ background: "var(--accent)" }} aria-hidden />
            {p.category} · one job, done properly
          </div>
          <H1 className="mt-6 max-w-3xl">{p.tagline}</H1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed" style={{ color: "var(--muted)" }}>
            {p.oneLiner}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <PrimaryLink href="/app">Run it on your data — free</PrimaryLink>
            <GhostLink href="#api">View API &amp; MCP docs</GhostLink>
          </div>
          <p className="mt-4 text-sm" style={{ color: "var(--muted)" }}>
            No signup, no credit card. Built for {p.audience}.
          </p>
          <MetricStrip p={p} className="mt-16 pt-10" />
        </Shell>
      </div>

      <Section id="problem" band>
        <SectionHead
          eyebrow="The problem"
          title="This is the work nobody wants to do by hand"
          subtitle="Every team does this manually, inconsistently, and late. That is exactly the kind of gap a single-feature tool should close."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {p.problem.map((item) => (
            <Card key={item.title}>
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                {item.body}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="features">
        <SectionHead
          eyebrow="What you get"
          title={`${p.name} does one thing, and covers the whole job`}
          subtitle="No dashboard sprawl, no onboarding call, no 40-field setup wizard. Paste input, get an answer you can act on."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {p.features.map((f, i) => (
            <Card key={f.title}>
              <div
                className="grid size-9 place-items-center text-sm font-semibold"
                style={{ background: "var(--accent-soft)", color: "var(--accent-text)", borderRadius: "var(--r-md)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                {f.body}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="how" band>
        <SectionHead eyebrow="How it works" title="Three steps, under a minute" />
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {p.how.map((step, i) => (
            <Card key={step} as="li">
              <Eyebrow>Step {i + 1}</Eyebrow>
              <p className="mt-3 text-[15px] leading-relaxed">{step}</p>
            </Card>
          ))}
        </ol>
      </Section>

      <ApiSection p={p} />
      <PricingCards p={p} band />
      <FaqSection p={p} />
      <GroupStrip band />
      <FinalCta p={p} />
    </main>
  );
}
