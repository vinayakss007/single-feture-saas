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
 * Ledger family.
 *
 * Ruled rows, tabular numerals, high density, no shadows. Used for tax, payroll,
 * invoicing, lending and household-money products.
 *
 * The buyer for these is someone who reconciles things. They read a ruled table
 * faster than a card, they expect numbers to line up in a column, and a page with
 * soft gradients reads as a consumer app rather than a working tool. So the hero is
 * shaped like a statement header, features are a ruled schedule, and pricing is a
 * real comparison table.
 */
export function LedgerLanding({ p }: { p: ProductConfig }) {
  return (
    <main id="main-content">
      <div style={{ borderBottom: "var(--bw) solid var(--line)" }}>
        <Shell className="py-14 sm:py-16">
          <H1 className="max-w-3xl !text-3xl sm:!text-5xl">{p.tagline}</H1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed" style={{ color: "var(--muted)" }}>
            {p.oneLiner}
          </p>

          {/* Statement header: label/value pairs on ruled rows. */}
          <dl
            className="mt-10 max-w-2xl"
            style={{ borderTop: "2px solid var(--line-strong)", borderBottom: "2px solid var(--line-strong)" }}
          >
            {[
              { k: "Prepared for", v: p.audience },
              { k: "Category", v: p.category },
              ...p.metrics.map((m) => ({ k: m.label, v: m.value })),
              { k: "Method", v: "Deterministic — identical input returns identical output" },
              { k: "Free tier", v: "No signup, no card" },
            ].map((row, i) => (
              <div
                key={row.k}
                className="flex items-baseline justify-between gap-6 py-2.5"
                style={i > 0 ? { borderTop: "var(--bw) solid var(--line)" } : undefined}
              >
                <dt
                  className="shrink-0 text-[11px]"
                  style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "var(--label-tracking)" }}
                >
                  {row.k}
                </dt>
                <dd
                  className="text-right text-[14px] font-medium"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {row.v}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <PrimaryLink href="/app">Run it on your numbers</PrimaryLink>
            <a
              href="#how"
              className="px-5 py-3 text-sm font-semibold underline underline-offset-4"
              style={{ color: "var(--accent-text)" }}
            >
              See the method
            </a>
          </div>
        </Shell>
      </div>

      <Section id="problem" band>
        <SectionHead
          eyebrow="The problem"
          title="Where this goes wrong when it is done by hand"
          subtitle="Three errors, all of which cost money and none of which announce themselves."
        />
        <div className="mt-10" style={{ borderTop: "2px solid var(--line-strong)" }}>
          {p.problem.map((item, i) => (
            <div
              key={item.title}
              className="grid gap-x-8 gap-y-1.5 py-5 md:grid-cols-[3rem_18rem_1fr]"
              style={i > 0 ? { borderTop: "var(--bw) solid var(--line)" } : undefined}
            >
              <span className="text-[13px]" style={{ color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[15px] font-semibold">{item.title}</h3>
              <p className="text-[14px] leading-relaxed" style={{ color: "var(--muted)" }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Features as a schedule. */}
      <Section id="features">
        <SectionHead
          eyebrow="Schedule of checks"
          title={`What every ${p.name} run produces`}
          subtitle="Fixed scope. Nothing to configure, nothing skipped, same order every time."
        />
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left">
            <caption className="sr-only">
              Schedule of checks {p.name} performs on every run, with what each one means
              for you.
            </caption>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--line-strong)" }}>
                <th className="w-12 py-2.5 pr-4 text-[11px] font-semibold" style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "var(--label-tracking)" }}>
                  #
                </th>
                <th className="w-1/3 py-2.5 pr-4 text-[11px] font-semibold" style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "var(--label-tracking)" }}>
                  Item
                </th>
                <th className="py-2.5 text-[11px] font-semibold" style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "var(--label-tracking)" }}>
                  What it means for you
                </th>
              </tr>
            </thead>
            <tbody>
              {p.features.map((f, i) => (
                <tr key={f.title} style={{ borderBottom: "var(--bw) solid var(--line)" }}>
                  <td className="py-3.5 pr-4 align-top text-[13px]" style={{ color: "var(--accent-text)", fontVariantNumeric: "tabular-nums" }}>
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td className="py-3.5 pr-4 align-top text-[14px] font-semibold">{f.title}</td>
                  <td className="py-3.5 align-top text-[14px] leading-relaxed" style={{ color: "var(--muted)" }}>
                    {f.body}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="how" band>
        <SectionHead eyebrow="Method" title="Three steps, under a minute" />
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {p.how.map((step, i) => (
            <li key={step} style={{ borderTop: "2px solid var(--accent)", paddingTop: "1rem" }}>
              <Eyebrow>Step {i + 1}</Eyebrow>
              <p className="mt-2.5 text-[15px] leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </Section>

      <ApiSection p={p} />
      <PricingTable p={p} band />
      <FaqSection p={p} />
      <GroupStrip band />
      <FinalCta p={p} />
    </main>
  );
}
