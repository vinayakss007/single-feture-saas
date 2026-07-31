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
 * Bento family.
 *
 * Borderless tiles of unequal span on a cool ground. Used for products whose value
 * is breadth shown at once — a competitive scan, a content repurposing pass, an
 * answer-engine audit — where a uniform three-column grid flattens the fact that
 * some outputs matter more than others.
 *
 * Spans are derived from position rather than hand-assigned, so a product with
 * four features and one with seven both get a grid that looks composed instead of
 * a ragged last row.
 */
function span(index: number, total: number): string {
  // First tile is always the widest; then alternate 2/1 so rows stay full on lg.
  if (index === 0) return "lg:col-span-2 lg:row-span-2";
  const remaining = total - 1;
  const positionInRest = index - 1;
  if (remaining % 3 === 1 && positionInRest === remaining - 1) return "lg:col-span-2";
  return "lg:col-span-1";
}

function Tile({
  children,
  className = "",
  accent,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`p-6 ${className}`}
      style={{
        background: accent ? "var(--accent)" : "var(--panel)",
        color: accent ? "var(--on-accent)" : "var(--ink)",
        borderRadius: "var(--r-lg)",
        boxShadow: "var(--shadow)",
      }}
    >
      {children}
    </div>
  );
}

export function BentoLanding({ p }: { p: ProductConfig }) {
  return (
    <main id="main-content">
      <Shell className="pt-10 pb-4">
        {/* Hero is itself a bento: pitch tile, metric tiles, category tile. */}
        <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-[auto_auto]">
          <Tile className="lg:col-span-2 lg:row-span-2 flex flex-col justify-between !p-9">
            <div>
              <Eyebrow>{p.category}</Eyebrow>
              <H1 className="mt-4">{p.tagline}</H1>
              <p className="mt-5 max-w-xl text-[17px] leading-relaxed" style={{ color: "var(--muted)" }}>
                {p.oneLiner}
              </p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <PrimaryLink href="/app">Run it free</PrimaryLink>
              <a
                href="#features"
                className="px-5 py-3 text-sm font-semibold transition hover:opacity-80"
                style={{ background: "var(--band)", borderRadius: "var(--r-md)" }}
              >
                See what it returns
              </a>
            </div>
          </Tile>

          {p.metrics.slice(0, 2).map((m, i) => (
            <Tile key={m.label} accent={i === 0} className="flex flex-col justify-center">
              <span
                className="text-4xl"
                style={{
                  fontFamily: "var(--font-head)",
                  fontWeight: "var(--head-weight)" as React.CSSProperties["fontWeight"],
                  letterSpacing: "var(--head-tracking)",
                  fontVariantNumeric: "tabular-nums",
                  color: i === 0 ? "var(--on-accent)" : "var(--accent-text)",
                }}
              >
                {m.value}
              </span>
              <span className="mt-2 text-sm leading-snug" style={{ color: i === 0 ? "color-mix(in srgb, var(--on-accent) 85%, transparent)" : "var(--muted)" }}>
                {m.label}
              </span>
            </Tile>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {p.metrics.slice(2).map((m) => (
            <Tile key={m.label}>
              <span
                className="text-3xl"
                style={{ color: "var(--accent-text)", fontFamily: "var(--font-head)", fontWeight: "var(--head-weight)" as React.CSSProperties["fontWeight"], fontVariantNumeric: "tabular-nums" }}
              >
                {m.value}
              </span>
              <span className="mt-1 block text-sm" style={{ color: "var(--muted)" }}>
                {m.label}
              </span>
            </Tile>
          ))}
          <Tile className={p.metrics.length > 2 ? "lg:col-span-2" : "lg:col-span-3"}>
            <span className="text-sm font-semibold">Built for {p.audience}</span>
            <span className="mt-1 block text-sm" style={{ color: "var(--muted)" }}>
              No signup for the free tier. Deterministic engine — same input, same output, every time.
            </span>
          </Tile>
        </div>
      </Shell>

      <Section id="problem">
        <SectionHead
          eyebrow="The problem"
          title="Done by hand, this is slow and inconsistent"
          subtitle="Three things go wrong every time, and they are the three things this closes."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {p.problem.map((item) => (
            <Tile key={item.title}>
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                {item.body}
              </p>
            </Tile>
          ))}
        </div>
      </Section>

      <Section id="features" band>
        <SectionHead
          eyebrow="What you get"
          title={`${p.name} covers the whole job`}
          subtitle="Not a dashboard. One pass over your input, everything it found, laid out so the important parts are the big ones."
        />
        <div className="mt-10 grid auto-rows-[minmax(0,auto)] gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {p.features.map((f, i) => (
            <Tile key={f.title} className={`${span(i, p.features.length)} flex flex-col`}>
              <span
                className="grid size-9 place-items-center text-sm font-bold"
                style={{ background: "var(--accent-soft)", color: "var(--accent-text)", borderRadius: "var(--r-md)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className={`mt-4 font-semibold ${i === 0 ? "text-xl" : "text-base"}`}>{f.title}</h3>
              <p className={`mt-2 leading-relaxed ${i === 0 ? "text-[15px]" : "text-sm"}`} style={{ color: "var(--muted)" }}>
                {f.body}
              </p>
            </Tile>
          ))}
        </div>
      </Section>

      <Section id="how">
        <SectionHead eyebrow="How it works" title="Three steps, under a minute" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {p.how.map((step, i) => (
            <Tile key={step} accent={i === 1}>
              <span
                className="text-xs font-semibold"
                style={{
                  color: i === 1 ? "color-mix(in srgb, var(--on-accent) 80%, transparent)" : "var(--accent)",
                  textTransform: "uppercase",
                  letterSpacing: "var(--label-tracking)",
                }}
              >
                Step {i + 1}
              </span>
              <p className="mt-3 text-[15px] leading-relaxed" style={{ color: i === 1 ? "var(--on-accent)" : "var(--ink)" }}>
                {step}
              </p>
            </Tile>
          ))}
        </div>
      </Section>

      <ApiSection p={p} band />
      <PricingCards p={p} />
      <FaqSection p={p} band />
      <GroupStrip />
      <FinalCta p={p} />
    </main>
  );
}
