import Link from "next/link";
import type { ProductConfig } from "@/lib/types";
import {
  ApiSection,
  Eyebrow,
  FaqSection,
  FinalCta,
  GroupStrip,
  H1,
  PricingCards,
  PrimaryLink,
  Section,
  SectionHead,
  Shell,
} from "./kit";

/**
 * Split family.
 *
 * Two-column hero with a preview of the actual form beside the pitch, so the
 * shape of the ask is visible before anyone clicks. Used where the product is
 * faster to understand by seeing what it wants than by reading what it does —
 * "paste a transcript" lands better as a labelled field than as a sentence.
 *
 * The preview is intentionally inert: it mirrors the real fields from
 * `product.inputs` but does not accept input, because a form that looks live and
 * silently discards a paste is worse than an obvious preview. Clicking anywhere on
 * it goes to the real thing.
 */
export function SplitLanding({ p }: { p: ProductConfig }) {
  const preview = p.inputs.slice(0, 4);

  return (
    <main id="main-content">
      <div style={{ borderBottom: "var(--bw) solid var(--line)" }}>
        <Shell className="grid gap-12 py-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:py-24">
          <div>
            <Eyebrow>{p.category}</Eyebrow>
            <H1 className="mt-4">{p.tagline}</H1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed" style={{ color: "var(--muted)" }}>
              {p.oneLiner}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <PrimaryLink href="/app">Try it on your data</PrimaryLink>
              <Link href="/signup" className="text-sm font-semibold underline underline-offset-4" style={{ color: "var(--accent-text)" }}>
                or create a free account
              </Link>
            </div>
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              {p.metrics.map((m) => (
                <div key={m.label}>
                  <dt
                    className="text-2xl"
                    style={{
                      color: "var(--accent-text)",
                      fontFamily: "var(--font-head)",
                      fontWeight: "var(--head-weight)" as React.CSSProperties["fontWeight"],
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {m.value}
                  </dt>
                  <dd className="mt-0.5 max-w-[16ch] text-xs leading-snug" style={{ color: "var(--muted)" }}>
                    {m.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <Link
            href="/app"
            aria-label={`Open the ${p.name} live demo`}
            className="group block transition hover:-translate-y-0.5"
            style={{
              background: "var(--panel)",
              borderRadius: "var(--r-lg)",
              borderWidth: "var(--bw)",
              borderStyle: "solid",
              borderColor: "var(--line)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ background: "var(--band)", borderBottom: "var(--bw) solid var(--line)", borderTopLeftRadius: "var(--r-lg)", borderTopRightRadius: "var(--r-lg)" }}
            >
              <span className="text-[13px] font-semibold">{p.name} — live demo</span>
              <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                free, no signup
              </span>
            </div>
            <div className="space-y-4 p-5" aria-hidden>
              {preview.map((field) => (
                <div key={field.name}>
                  <span className="block text-[13px] font-medium">{field.label}</span>
                  <span
                    className="mt-1.5 block w-full px-3 py-2 text-[13px]"
                    style={{
                      color: "var(--muted)",
                      background: "var(--bg)",
                      borderRadius: "var(--r-sm)",
                      borderWidth: "var(--bw)",
                      borderStyle: "solid",
                      borderColor: "var(--line)",
                      minHeight: field.type === "textarea" ? "4.5rem" : undefined,
                    }}
                  >
                    {field.placeholder ?? p.sample[field.name]?.slice(0, 70) ?? "…"}
                  </span>
                </div>
              ))}
              {p.inputs.length > preview.length ? (
                <p className="text-[11px]" style={{ color: "var(--muted)" }}>
                  + {p.inputs.length - preview.length} more field
                  {p.inputs.length - preview.length === 1 ? "" : "s"}
                </p>
              ) : null}
              <span
                className="mt-2 block w-full py-2.5 text-center text-[13px] font-semibold"
                style={{ background: "var(--accent)", color: "var(--on-accent)", borderRadius: "var(--r-md)" }}
              >
                Run {p.name}
              </span>
              <span className="block text-center text-[11px]" style={{ color: "var(--muted)" }}>
                Preview — click to open the real form, pre-filled with a sample
              </span>
            </div>
          </Link>
        </Shell>
      </div>

      <Section id="problem" band>
        <SectionHead
          eyebrow="Why this exists"
          title="This is the work nobody wants to do by hand"
          subtitle="Done manually it is slow, inconsistent and always late. That is the gap a single-feature tool should close."
        />
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {p.problem.map((item, i) => (
            <div key={item.title} style={{ borderTop: "2px solid var(--accent)", paddingTop: "1.25rem" }}>
              <span className="text-xs font-semibold" style={{ color: "var(--accent-text)", fontVariantNumeric: "tabular-nums" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Alternating rows rather than a card grid: each feature gets room to be a claim. */}
      <Section id="features">
        <SectionHead
          eyebrow="What you get"
          title={`Everything ${p.name} does, and nothing it does not`}
        />
        <div className="mt-14 space-y-14">
          {p.features.map((f, i) => (
            <div
              key={f.title}
              className={`grid items-center gap-8 md:grid-cols-2 md:gap-14 ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}
            >
              <div>
                <Eyebrow>Feature {String(i + 1).padStart(2, "0")}</Eyebrow>
                <h3 className="mt-3 text-2xl" style={{ fontFamily: "var(--font-head)", fontWeight: "var(--head-weight)" as React.CSSProperties["fontWeight"], letterSpacing: "var(--head-tracking)" }}>
                  {f.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--muted)" }}>
                  {f.body}
                </p>
              </div>
              <div
                className="p-8"
                style={{
                  background: "var(--accent-soft)",
                  borderRadius: "var(--r-lg)",
                  borderWidth: "var(--bw)",
                  borderStyle: "solid",
                  borderColor: "var(--line)",
                }}
              >
                <span
                  className="block text-6xl"
                  style={{ color: "var(--accent-text)", fontFamily: "var(--font-head)", fontWeight: 700, opacity: 0.28, fontVariantNumeric: "tabular-nums" }}
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 text-sm font-medium">{f.title}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="how" band>
        <SectionHead eyebrow="How it works" title="Three steps, under a minute" />
        <ol className="mt-12 grid gap-px md:grid-cols-3" style={{ background: "var(--line)" }}>
          {p.how.map((step, i) => (
            <li key={step} className="p-7" style={{ background: "var(--panel)" }}>
              <span
                className="grid size-10 place-items-center text-sm font-bold"
                style={{ background: "var(--accent)", color: "var(--on-accent)", borderRadius: "9999px" }}
              >
                {i + 1}
              </span>
              <p className="mt-4 text-[15px] leading-relaxed">{step}</p>
            </li>
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
