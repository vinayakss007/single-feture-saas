import type { ProductConfig } from "@/lib/types";
import {
  ApiSection,
  Eyebrow,
  FaqSection,
  FinalCta,
  GroupStrip,
  H1,
  PricingTable,
  PrimaryLink,
  Section,
  SectionHead,
  Shell,
} from "./kit";

/**
 * Clinical family.
 *
 * Very airy, thin rules, wide-tracked micro-labels, single column. Used for the
 * health products: lab results, vaccination due dates, growth percentiles, medical
 * bills, nutrition labels, pet dosing.
 *
 * These pages are read by someone who is worried. Persuasion theatre — big claims,
 * urgency, colour blocks — makes a health tool feel less safe, not more. So this is
 * the only family with an explicit "what this does not do" panel above the fold,
 * built from the same honesty the engines already enforce: these products refuse to
 * interpret, and saying so first is what makes the rest of the output trustworthy.
 */
export function ClinicalLanding({ p }: { p: ProductConfig }) {
  return (
    <main id="main-content">
      <div style={{ borderBottom: "var(--bw) solid var(--line)" }}>
        <Shell className="max-w-3xl py-20 text-center sm:py-24">
          <Eyebrow>{p.category}</Eyebrow>
          <H1 className="mx-auto mt-5 max-w-2xl !text-3xl sm:!text-5xl">{p.tagline}</H1>
          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-[1.75]" style={{ color: "var(--muted)" }}>
            {p.oneLiner}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <PrimaryLink href="/app">Check yours — free</PrimaryLink>
          </div>
          <p className="mt-4 text-[13px]" style={{ color: "var(--muted)" }}>
            No signup. Nothing you enter is stored on the free tier.
          </p>
        </Shell>
      </div>

      {/* Scope panel. The refusal comes before the pitch, deliberately. */}
      <div style={{ background: "var(--band)", borderBottom: "var(--bw) solid var(--line)" }}>
        <Shell className="max-w-4xl py-12">
          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <p
                className="text-[11px] font-semibold"
                style={{ color: "var(--accent-text)", textTransform: "uppercase", letterSpacing: "var(--label-tracking)" }}
              >
                What this does
              </p>
              <ul className="mt-4 space-y-2.5 text-[14px] leading-relaxed">
                {p.features.slice(0, 3).map((f) => (
                  <li key={f.title} className="flex gap-2.5">
                    <span aria-hidden style={{ color: "var(--accent-text)" }}>
                      ✓
                    </span>
                    <span>{f.title}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p
                className="text-[11px] font-semibold"
                style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "var(--label-tracking)" }}
              >
                What this does not do
              </p>
              <ul className="mt-4 space-y-2.5 text-[14px] leading-relaxed" style={{ color: "var(--muted)" }}>
                <li className="flex gap-2.5">
                  <span aria-hidden>—</span>
                  <span>It does not diagnose, and it does not tell you what to do next.</span>
                </li>
                <li className="flex gap-2.5">
                  <span aria-hidden>—</span>
                  <span>It does not replace the person who is treating you.</span>
                </li>
                <li className="flex gap-2.5">
                  <span aria-hidden>—</span>
                  <span>It does not guess. Where the input is unclear it says so instead.</span>
                </li>
              </ul>
            </div>
          </div>
        </Shell>
      </div>

      <Section id="problem">
        <div className="mx-auto max-w-3xl">
          <SectionHead
            eyebrow="Why this exists"
            title="The information is already in front of you — just not in a readable form"
          />
          <div className="mt-12 space-y-10">
            {p.problem.map((item) => (
              <div key={item.title} style={{ borderTop: "var(--bw) solid var(--line)", paddingTop: "1.5rem" }}>
                <h3 className="text-lg font-medium">{item.title}</h3>
                <p className="mt-2.5 text-[16px] leading-[1.75]" style={{ color: "var(--muted)" }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section id="features" band>
        <div className="mx-auto max-w-3xl">
          <SectionHead eyebrow="What you get" title={`Everything ${p.name} returns`} />
          <dl className="mt-12 space-y-8">
            {p.features.map((f) => (
              <div key={f.title}>
                <dt className="text-[15px] font-semibold">{f.title}</dt>
                <dd className="mt-1.5 text-[15px] leading-[1.75]" style={{ color: "var(--muted)" }}>
                  {f.body}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section id="how">
        <div className="mx-auto max-w-3xl">
          <SectionHead eyebrow="How it works" title="Three steps, under a minute" center />
          <ol className="mt-12 grid gap-8 sm:grid-cols-3">
            {p.how.map((step, i) => (
              <li key={step} className="text-center">
                <span
                  className="mx-auto grid size-9 place-items-center text-sm"
                  style={{ border: "var(--bw) solid var(--line-strong)", borderRadius: "9999px", color: "var(--accent-text)" }}
                >
                  {i + 1}
                </span>
                <p className="mt-4 text-[14px] leading-relaxed" style={{ color: "var(--muted)" }}>
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <div style={{ borderTop: "var(--bw) solid var(--line)", borderBottom: "var(--bw) solid var(--line)" }}>
        <Shell className="max-w-4xl py-14">
          <dl className="grid gap-8 text-center sm:grid-cols-3">
            {p.metrics.map((m) => (
              <div key={m.label}>
                <dt
                  className="text-3xl"
                  style={{ color: "var(--accent-text)", fontWeight: 500, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}
                >
                  {m.value}
                </dt>
                <dd className="mx-auto mt-2 max-w-[22ch] text-[13px] leading-snug" style={{ color: "var(--muted)" }}>
                  {m.label}
                </dd>
              </div>
            ))}
          </dl>
        </Shell>
      </div>

      <ApiSection p={p} band />
      <PricingTable p={p} />
      <FaqSection p={p} band />
      <GroupStrip />
      <FinalCta p={p} />
    </main>
  );
}
