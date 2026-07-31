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
 * Editorial family.
 *
 * Serif, ruled, shaped like an article. Used for legal, policy, contract and
 * compliance products.
 *
 * The reasoning is about the buying motion, not taste. Someone evaluating an AI Act
 * notice generator or a DPA-clause checker is reading to decide whether the vendor
 * understands the regulation. Tiles and gradients signal marketing; a standfirst,
 * a ruled column and prose signal that someone read the statute. The content is
 * identical to every other family — the framing is what earns the read.
 */
export function EditorialLanding({ p }: { p: ProductConfig }) {
  return (
    <main id="main-content">
      <article>
        <div style={{ borderBottom: "2px solid var(--line-strong)" }}>
          <Shell className="py-16 sm:py-20">
            <Eyebrow>{p.category}</Eyebrow>
            <H1 className="mt-5 max-w-4xl">{p.tagline}</H1>
            {/* Standfirst: larger than body, still serif, sets up the whole page. */}
            <p
              className="mt-7 max-w-3xl text-xl leading-[1.6] sm:text-[1.4rem]"
              style={{ color: "var(--ink)", fontFamily: "var(--font-head)" }}
            >
              {p.oneLiner}
            </p>
            <div
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 text-sm"
              style={{ borderTop: "var(--bw) solid var(--line)", color: "var(--muted)" }}
            >
              <span>
                For <strong style={{ color: "var(--ink)", fontWeight: 600 }}>{p.audience}</strong>
              </span>
              <span aria-hidden>·</span>
              <span>Deterministic — no model in the path</span>
              <span aria-hidden>·</span>
              <span>Free tier needs no signup</span>
            </div>
            <div className="mt-8">
              <PrimaryLink href="/app">Run it on your own document</PrimaryLink>
            </div>
          </Shell>
        </div>

        {/* The problem, set as a two-column essay with a rule between. */}
        <Section id="problem">
          <div className="grid gap-x-14 gap-y-10 md:grid-cols-[14rem_1fr]">
            <div>
              <Eyebrow>The problem</Eyebrow>
              <h2
                className="mt-3 text-2xl leading-tight"
                style={{ fontFamily: "var(--font-head)", fontWeight: "var(--head-weight)" as React.CSSProperties["fontWeight"] }}
              >
                Why this is normally done badly
              </h2>
            </div>
            <div className="space-y-8">
              {p.problem.map((item, i) => (
                <div
                  key={item.title}
                  className={i > 0 ? "pt-8" : undefined}
                  style={i > 0 ? { borderTop: "var(--bw) solid var(--line)" } : undefined}
                >
                  <h3 className="text-lg" style={{ fontFamily: "var(--font-head)", fontWeight: 600 }}>
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-[17px] leading-[1.72]" style={{ color: "var(--muted)" }}>
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Features as a numbered list of claims, not cards. */}
        <Section id="features" band>
          <SectionHead
            eyebrow="What it does"
            title={`${p.name}, clause by clause`}
            subtitle="One pass over your input. Everything below is checked every time, in the same order, with the same rules."
          />
          <ol className="mt-12 space-y-0">
            {p.features.map((f, i) => (
              <li
                key={f.title}
                className="grid gap-x-8 gap-y-2 py-7 md:grid-cols-[4rem_1fr]"
                style={{ borderTop: "var(--bw) solid var(--line)" }}
              >
                <span
                  className="text-3xl leading-none"
                  style={{
                    color: "var(--accent-text)",
                    fontFamily: "var(--font-head)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-lg" style={{ fontFamily: "var(--font-head)", fontWeight: 600 }}>
                    {f.title}
                  </h3>
                  <p className="mt-1.5 max-w-2xl text-[17px] leading-[1.7]" style={{ color: "var(--muted)" }}>
                    {f.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {/* Metrics as a pull-quote style band — the one place numbers get to shout. */}
        <div style={{ background: "var(--accent-soft)", borderTop: "var(--bw) solid var(--line)", borderBottom: "var(--bw) solid var(--line)" }}>
          <Shell className="py-14">
            <dl className="grid gap-10 sm:grid-cols-3">
              {p.metrics.map((m) => (
                <div key={m.label}>
                  <dt
                    className="text-4xl"
                    style={{
                      color: "var(--accent-text)",
                      fontFamily: "var(--font-head)",
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {m.value}
                  </dt>
                  <dd className="mt-2 text-[15px] leading-snug" style={{ color: "var(--muted)" }}>
                    {m.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Shell>
        </div>

        <Section id="how">
          <div className="grid gap-x-14 gap-y-10 md:grid-cols-[14rem_1fr]">
            <div>
              <Eyebrow>How it works</Eyebrow>
              <h2 className="mt-3 text-2xl leading-tight" style={{ fontFamily: "var(--font-head)", fontWeight: 500 }}>
                Three steps, under a minute
              </h2>
            </div>
            <ol className="space-y-6">
              {p.how.map((step, i) => (
                <li key={step} className="flex gap-5">
                  <span
                    className="mt-1 grid size-8 shrink-0 place-items-center text-sm"
                    style={{
                      border: "var(--bw) solid var(--line-strong)",
                      borderRadius: "9999px",
                      fontFamily: "var(--font-head)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {i + 1}
                  </span>
                  <p className="max-w-2xl text-[17px] leading-[1.72]">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </Section>

        <ApiSection p={p} band />
        <PricingTable p={p} />
        <FaqSection p={p} band />
        <GroupStrip />
        <FinalCta p={p} />
      </article>
    </main>
  );
}
