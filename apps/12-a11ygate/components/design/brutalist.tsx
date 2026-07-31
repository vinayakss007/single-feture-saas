import Link from "next/link";
import type { ProductConfig } from "@/lib/types";
import {
  ApiSection,
  FaqSection,
  FinalCta,
  GroupStrip,
  PricingCards,
  Section,
  SectionHead,
  Shell,
} from "./kit";

/**
 * Brutalist family.
 *
 * Hard 2px borders, offset shadows, oversized uppercase type. Used for consumer
 * products competing for attention from someone who did not go looking for a tool:
 * flight compensation, rent fairness, solar payback, race pacing.
 *
 * A polite SaaS page loses that visitor in the first second. This family trades
 * refinement for legibility at a glance — one enormous claim, one number, one
 * button. It is the only family with a horizontal marquee strip, because for these
 * products the list of what gets checked is itself the hook.
 */
function Block({
  children,
  className = "",
  filled,
  as: As = "div",
}: {
  children: React.ReactNode;
  className?: string;
  filled?: boolean;
  as?: "div" | "li";
}) {
  return (
    <As
      className={`p-6 ${className}`}
      style={{
        background: filled ? "var(--accent)" : "var(--panel)",
        color: filled ? "var(--on-accent)" : "var(--ink)",
        border: "2px solid var(--ink)",
        boxShadow: "5px 5px 0 var(--ink)",
      }}
    >
      {children}
    </As>
  );
}

export function BrutalistLanding({ p }: { p: ProductConfig }) {
  return (
    <main id="main-content">
      <div style={{ borderBottom: "3px solid var(--ink)" }}>
        <Shell className="py-14 sm:py-20">
          <span
            className="inline-block px-3 py-1 text-[11px] font-bold"
            style={{ background: "var(--ink)", color: "var(--bg)", letterSpacing: "0.1em" }}
          >
            {p.category.toUpperCase()}
          </span>
          <h1
            className="mt-6 max-w-4xl text-[2.6rem] leading-[0.98] sm:text-[4.5rem]"
            style={{ fontFamily: "var(--font-head)", fontWeight: 800, letterSpacing: "-0.045em", textTransform: "uppercase" }}
          >
            {p.tagline}
          </h1>
          <p className="mt-7 max-w-2xl text-lg font-medium leading-relaxed">{p.oneLiner}</p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/app"
              className="px-8 py-4 text-base font-bold uppercase"
              style={{ background: "var(--accent)", color: "var(--on-accent)", border: "2px solid var(--ink)", boxShadow: "6px 6px 0 var(--ink)" }}
            >
              Do it now — free
            </Link>
            <span className="text-sm font-bold">No signup. No card. 40 seconds.</span>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {p.metrics.map((m, i) => (
              <Block key={m.label} filled={i === 0}>
                <span
                  className="block text-4xl"
                  style={{ fontFamily: "var(--font-head)", fontWeight: 800, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}
                >
                  {m.value}
                </span>
                <span className="mt-2 block text-[13px] font-bold uppercase leading-snug" style={{ letterSpacing: "0.04em" }}>
                  {m.label}
                </span>
              </Block>
            ))}
          </div>
        </Shell>
      </div>

      {/* Marquee strip: for these products the checklist is the hook. */}
      <div
        className="overflow-hidden py-3"
        style={{ background: "var(--ink)", color: "var(--bg)", borderBottom: "3px solid var(--ink)" }}
      >
        <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-1 px-5 text-[12px] font-bold uppercase" style={{ letterSpacing: "0.06em" }}>
          {p.features.map((f) => (
            <li key={f.title} className="flex items-center gap-2">
              <span style={{ color: "var(--accent-text)" }} aria-hidden>
                ★
              </span>
              {f.title}
            </li>
          ))}
        </ul>
      </div>

      <Section id="problem" band>
        <h2
          className="max-w-3xl text-3xl sm:text-4xl"
          style={{ fontFamily: "var(--font-head)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.035em" }}
        >
          Why you are losing money on this
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {p.problem.map((item) => (
            <Block key={item.title}>
              <h3 className="text-lg font-bold uppercase leading-tight" style={{ letterSpacing: "-0.02em" }}>
                {item.title}
              </h3>
              <p className="mt-3 text-sm font-medium leading-relaxed">{item.body}</p>
            </Block>
          ))}
        </div>
      </Section>

      <Section id="features">
        <SectionHead eyebrow="What you get" title="Everything it checks" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {p.features.map((f, i) => (
            <Block key={f.title} className="flex gap-5">
              <span
                className="shrink-0 text-3xl"
                style={{ color: "var(--accent-text)", fontFamily: "var(--font-head)", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-base font-bold uppercase leading-tight">{f.title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed">{f.body}</p>
              </div>
            </Block>
          ))}
        </div>
      </Section>

      <Section id="how" band>
        <SectionHead eyebrow="How it works" title="Three steps" />
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {p.how.map((step, i) => (
            <Block key={step} as="li" filled={i === 2}>
              <span
                className="block text-5xl leading-none"
                style={{ fontFamily: "var(--font-head)", fontWeight: 800, opacity: i === 2 ? 0.5 : 0.2 }}
                aria-hidden
              >
                {i + 1}
              </span>
              <p className="mt-3 text-[15px] font-medium leading-relaxed">{step}</p>
            </Block>
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
