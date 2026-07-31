/**
 * Design kit.
 *
 * The pieces every design family shares, expressed against the CSS custom
 * properties that `lib/design.ts` sets on `<body>`. A family file composes these
 * and adds its own hero and navigation, which is where the visual identity
 * actually lives — a card is a card, but a shell-prompt hero and a serif
 * article hero are different products to the reader.
 *
 * Nothing here reads `product.design` directly. That is deliberate: these must
 * render correctly in all eight families, so a family can never be broken by a
 * change to a shared piece.
 */

import Link from "next/link";
import type { ProductConfig } from "@/lib/types";
import { siblings, GROUP } from "@/lib/group";
import { onColor } from "@/lib/contrast";

/* ---------------------------------------------------------------- primitives */

export function Shell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full px-5 ${className}`} style={{ maxWidth: "var(--measure)" }}>
      {children}
    </div>
  );
}

export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={`text-xs font-semibold ${className}`}
      style={{
        color: "var(--accent-text)",
        textTransform: "var(--label-case)" as React.CSSProperties["textTransform"],
        letterSpacing: "var(--label-tracking)",
      }}
    >
      {children}
    </p>
  );
}

export function H2({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={`text-3xl sm:text-4xl ${className}`}
      style={{
        fontFamily: "var(--font-head)",
        fontWeight: "var(--head-weight)" as React.CSSProperties["fontWeight"],
        letterSpacing: "var(--head-tracking)",
        textTransform: "var(--head-case)" as React.CSSProperties["textTransform"],
      }}
    >
      {children}
    </h2>
  );
}

export function H1({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h1
      className={`text-4xl leading-[1.06] sm:text-6xl ${className}`}
      style={{
        fontFamily: "var(--font-head)",
        fontWeight: "var(--head-weight)" as React.CSSProperties["fontWeight"],
        letterSpacing: "var(--head-tracking)",
        textTransform: "var(--head-case)" as React.CSSProperties["textTransform"],
      }}
    >
      {children}
    </h1>
  );
}

export function Card({
  children,
  className = "",
  raised,
  as: As = "div",
}: {
  children: React.ReactNode;
  className?: string;
  raised?: boolean;
  as?: "div" | "li";
}) {
  return (
    <As
      className={`p-6 ${className}`}
      style={{
        background: "var(--panel)",
        borderRadius: "var(--r-lg)",
        borderWidth: "var(--bw)",
        borderStyle: "solid",
        borderColor: "var(--line)",
        boxShadow: raised ? "var(--shadow-lg)" : "var(--shadow)",
      }}
    >
      {children}
    </As>
  );
}

export function PrimaryLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-block px-6 py-3 text-sm font-semibold transition hover:opacity-90 ${className}`}
      style={{
        background: "var(--accent)",
        color: "var(--on-accent)",
        borderRadius: "var(--r-md)",
        borderWidth: "var(--bw)",
        borderStyle: "solid",
        borderColor: "var(--accent)",
        boxShadow: "var(--shadow)",
      }}
    >
      {children}
    </Link>
  );
}

export function GhostLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`inline-block px-6 py-3 text-sm font-semibold transition hover:opacity-80 ${className}`}
      style={{
        background: "var(--panel)",
        color: "var(--ink)",
        borderRadius: "var(--r-md)",
        borderWidth: "var(--bw)",
        borderStyle: "solid",
        borderColor: "var(--line-strong)",
      }}
    >
      {children}
    </a>
  );
}

export function Section({
  id,
  children,
  band,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  band?: boolean;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={className}
      style={
        band
          ? {
              background: "var(--band)",
              borderTop: "var(--bw) solid var(--line)",
              borderBottom: "var(--bw) solid var(--line)",
            }
          : undefined
      }
    >
      <Shell className="py-[var(--section-y)]">{children}</Shell>
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  subtitle,
  center,
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-3xl"}>
      {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
      {title ? <H2>{title}</H2> : null}
      {subtitle ? (
        <p className="mt-4 text-[17px] leading-relaxed" style={{ color: "var(--muted)" }}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------ shared sections */

export function MetricStrip({ p, className = "" }: { p: ProductConfig; className?: string }) {
  return (
    <dl className={`grid gap-6 sm:grid-cols-3 ${className}`}>
      {p.metrics.map((m) => (
        <div key={m.label}>
          <dt
            className="text-3xl"
            style={{
              color: "var(--accent-text)",
              fontFamily: "var(--font-head)",
              fontWeight: "var(--head-weight)" as React.CSSProperties["fontWeight"],
              letterSpacing: "var(--head-tracking)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {m.value}
          </dt>
          <dd className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            {m.label}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function CodePanel({
  label,
  hint,
  code,
}: {
  label: string;
  hint?: string;
  code: string;
}) {
  return (
    <div
      className="overflow-hidden"
      style={{
        borderRadius: "var(--r-lg)",
        borderWidth: "var(--bw)",
        borderStyle: "solid",
        borderColor: "var(--line)",
        background: "var(--panel)",
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ background: "var(--band)", borderBottom: "var(--bw) solid var(--line)" }}
      >
        <span className="text-sm font-semibold">{label}</span>
        {hint ? (
          <code className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-code)" }}>
            {hint}
          </code>
        ) : null}
      </div>
      <pre className="overflow-x-auto p-5 text-[12.5px] leading-relaxed">
        <code style={{ fontFamily: "var(--font-code)" }}>{code}</code>
      </pre>
    </div>
  );
}

export function restSnippet(p: ProductConfig) {
  const body = JSON.stringify(p.sample, null, 2)
    .split("\n")
    .map((l, i) => (i === 0 ? l : `  ${l}`))
    .join("\n");
  return `curl -X POST https://${p.slug}.abetworks.in/api/v1/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $${p.slug.toUpperCase().replace(/-/g, "_")}_KEY" \\
  -d '${body}'`;
}

export function mcpSnippet(p: ProductConfig) {
  return `{
  "mcpServers": {
    "${p.slug}": {
      "command": "npx",
      "args": ["-y", "@abetworks/${p.slug}-mcp"],
      "env": {
        "SFS_API_URL": "https://${p.slug}.abetworks.in",
        "SFS_API_KEY": "your_key"
      }
    }
  }
}`;
}

export function ApiSection({ p, band }: { p: ProductConfig; band?: boolean }) {
  return (
    <Section id="api" band={band}>
      <SectionHead
        eyebrow="API, MCP & agents"
        title="Usable by a person, by your backend, and by your agents"
        subtitle="One engine, four surfaces: this web app, a REST endpoint, an OpenAPI 3.1 document, and an MCP server so Claude, Cursor or your own fleet can call it as a tool."
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <CodePanel label="REST" hint="POST /api/v1/run" code={restSnippet(p)} />
        <CodePanel label="MCP" hint={`tool: ${p.mcpTool.name}`} code={mcpSnippet(p)} />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { href: "/api/v1/openapi", label: "OpenAPI 3.1", hint: "Machine-readable REST contract" },
          { href: "/api/v1/agents", label: "Agent tool schemas", hint: "OpenAI, Anthropic, Gemini, LangChain" },
          { href: "/.well-known/ai-plugin.json", label: "Plugin manifest", hint: "Discovery for agent runtimes" },
        ].map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="block p-4 transition hover:opacity-80"
            style={{
              borderRadius: "var(--r-md)",
              borderWidth: "var(--bw)",
              borderStyle: "solid",
              borderColor: "var(--line)",
              background: "var(--panel)",
            }}
          >
            <span className="text-sm font-semibold" style={{ color: "var(--accent-text)" }}>
              {l.label}
            </span>
            <span className="mt-1 block text-xs" style={{ color: "var(--muted)" }}>
              {l.hint}
            </span>
          </a>
        ))}
      </div>

      <div
        className="mt-8 p-6"
        style={{ background: "var(--accent-soft)", borderRadius: "var(--r-lg)", borderWidth: "var(--bw)", borderStyle: "solid", borderColor: "var(--line)" }}
      >
        <h3 className="text-base font-semibold">Plugs into the Abet Works stack</h3>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          Ships standalone, but designed to feed NuCRM, FlowForge and Agent Fleet without glue code.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {p.integrations.map((i) => (
            <li
              key={i}
              className="px-3 py-1 text-xs font-medium"
              style={{ background: "var(--panel)", borderRadius: "var(--r-sm)", borderWidth: "var(--bw)", borderStyle: "solid", borderColor: "var(--line)" }}
            >
              {i}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function tierHref(p: ProductConfig, index: number) {
  if (index === 2)
    return `mailto:${p.slug}@abetworks.in?subject=${encodeURIComponent(`${p.name} enterprise enquiry`)}`;
  return index === 1 ? "/signup?plan=pro" : "/signup";
}

/** Card pricing — used by the families where a card reads as normal. */
export function PricingCards({ p, band }: { p: ProductConfig; band?: boolean }) {
  return (
    <Section id="pricing" band={band}>
      <SectionHead
        eyebrow="Pricing"
        title="Priced like a tool, not like a platform"
        subtitle="Start free. Upgrade only when the volume is real."
      />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {p.pricing.map((tier, index) => (
          <div
            key={tier.name}
            className="flex flex-col p-7"
            style={{
              background: "var(--panel)",
              borderRadius: "var(--r-lg)",
              borderStyle: "solid",
              borderWidth: tier.highlight ? "2px" : "var(--bw)",
              borderColor: tier.highlight ? "var(--accent)" : "var(--line)",
              boxShadow: tier.highlight ? "var(--shadow-lg)" : "var(--shadow)",
            }}
          >
            {tier.highlight ? (
              <span
                className="mb-4 self-start px-2.5 py-1 text-[11px] font-semibold"
                style={{ background: "var(--accent)", color: "var(--on-accent)", borderRadius: "var(--r-sm)" }}
              >
                Most popular
              </span>
            ) : null}
            <h3 className="text-lg font-semibold">{tier.name}</h3>
            <p className="mt-3 flex items-baseline gap-1">
              <span
                className="text-4xl"
                style={{
                  fontFamily: "var(--font-head)",
                  fontWeight: "var(--head-weight)" as React.CSSProperties["fontWeight"],
                  letterSpacing: "var(--head-tracking)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {tier.price}
              </span>
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                {tier.period}
              </span>
            </p>
            <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
              {tier.blurb}
            </p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm">
              {tier.features.map((f) => (
                <li key={f} className="flex gap-2.5">
                  <span aria-hidden style={{ color: "var(--accent-text)" }}>
                    ✓
                  </span>
                  <span style={{ color: "var(--muted)" }}>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href={tierHref(p, index)}
              className="mt-7 px-4 py-2.5 text-center text-sm font-semibold transition hover:opacity-90"
              style={{
                borderRadius: "var(--r-md)",
                borderWidth: "var(--bw)",
                borderStyle: "solid",
                borderColor: tier.highlight ? "var(--accent)" : "var(--line-strong)",
                background: tier.highlight ? "var(--accent)" : "transparent",
                color: tier.highlight ? "var(--on-accent)" : "var(--ink)",
              }}
            >
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>
    </Section>
  );
}

/**
 * Table pricing — used by the ledger, editorial and terminal families.
 *
 * Three cards side by side is a marketing convention. A buyer comparing tiers on
 * entitlements reads a table faster, and for the products that use this the table
 * is also the surface they already trust.
 */
export function PricingTable({ p, band }: { p: ProductConfig; band?: boolean }) {
  const rows = Array.from(new Set(p.pricing.flatMap((t) => t.features)));
  return (
    <Section id="pricing" band={band}>
      <SectionHead
        eyebrow="Pricing"
        title="Priced like a tool, not like a platform"
        subtitle="Start free. Upgrade only when the volume is real."
      />
      <div className="mt-12 overflow-x-auto">
        <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
          {/*
            Visually hidden because the section heading above already says "Pricing",
            but present because a screen reader user navigating table-by-table gets no
            accessible name from the surrounding heading. Our own A11yGate engine
            flagged this on the four families that render a table — the fix is here
            rather than in the families so all four get it.
          */}
          <caption className="sr-only">
            {p.name} plan comparison: price, who each tier is for, and which features are
            included in each.
          </caption>
          <thead>
            <tr>
              <th className="w-1/3 py-4 pr-4 align-bottom" />
              {p.pricing.map((t) => (
                <th
                  key={t.name}
                  className="py-4 pr-4 align-bottom"
                  style={{ borderBottom: "2px solid var(--line-strong)" }}
                >
                  <span className="block text-base font-semibold">{t.name}</span>
                  <span
                    className="mt-1 block text-2xl"
                    style={{
                      fontFamily: "var(--font-head)",
                      fontWeight: "var(--head-weight)" as React.CSSProperties["fontWeight"],
                      fontVariantNumeric: "tabular-nums",
                      color: t.highlight ? "var(--accent)" : "var(--ink)",
                    }}
                  >
                    {t.price}
                    <span className="text-xs font-normal" style={{ color: "var(--muted)" }}>
                      {" "}
                      {t.period}
                    </span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-3 pr-4 align-top text-xs" style={{ color: "var(--muted)", borderBottom: "var(--bw) solid var(--line)" }}>
                Who it is for
              </td>
              {p.pricing.map((t) => (
                <td
                  key={t.name}
                  className="py-3 pr-4 align-top text-xs"
                  style={{ color: "var(--muted)", borderBottom: "var(--bw) solid var(--line)" }}
                >
                  {t.blurb}
                </td>
              ))}
            </tr>
            {rows.map((feature) => (
              <tr key={feature}>
                <td className="py-2.5 pr-4 align-top" style={{ borderBottom: "var(--bw) solid var(--line)" }}>
                  {feature}
                </td>
                {p.pricing.map((t) => (
                  <td
                    key={t.name}
                    className="py-2.5 pr-4 align-top"
                    style={{ borderBottom: "var(--bw) solid var(--line)" }}
                  >
                    {t.features.includes(feature) ? (
                      <span style={{ color: "var(--accent-text)" }} aria-label="included">
                        ✓
                      </span>
                    ) : (
                      <span style={{ color: "var(--muted)" }} aria-label="not included">
                        —
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="py-5 pr-4" />
              {p.pricing.map((t, index) => (
                <td key={t.name} className="py-5 pr-4">
                  <Link
                    href={tierHref(p, index)}
                    className="inline-block px-4 py-2 text-sm font-semibold transition hover:opacity-90"
                    style={{
                      borderRadius: "var(--r-md)",
                      borderWidth: "var(--bw)",
                      borderStyle: "solid",
                      borderColor: t.highlight ? "var(--accent)" : "var(--line-strong)",
                      background: t.highlight ? "var(--accent)" : "transparent",
                      color: t.highlight ? "var(--on-accent)" : "var(--ink)",
                    }}
                  >
                    {t.cta}
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </Section>
  );
}

export function FaqSection({ p, band }: { p: ProductConfig; band?: boolean }) {
  return (
    <Section id="faq" band={band}>
      <SectionHead eyebrow="FAQ" title="Straight answers" />
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {p.faq.map((item) => (
          <details
            key={item.q}
            className="group p-5"
            style={{
              borderRadius: "var(--r-lg)",
              borderWidth: "var(--bw)",
              borderStyle: "solid",
              borderColor: "var(--line)",
              background: "var(--panel)",
            }}
          >
            <summary className="cursor-pointer list-none text-[15px] font-semibold marker:hidden">
              <span className="flex items-start justify-between gap-4">
                {item.q}
                <span
                  className="mt-0.5 shrink-0 transition group-open:rotate-45"
                  style={{ color: "var(--muted)" }}
                  aria-hidden
                >
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}

export function FinalCta({ p }: { p: ProductConfig }) {
  return (
    <div
      style={{
        background: "var(--accent)",
        color: "var(--on-accent)",
        borderTop: "var(--bw) solid var(--line)",
      }}
    >
      <Shell className="py-20 text-center">
        <H2>{p.name} takes 40 seconds to try</H2>
        <p
          className="mx-auto mt-4 max-w-xl"
          style={{ color: "color-mix(in srgb, var(--on-accent) 85%, transparent)" }}
        >
          {p.oneLiner}
        </p>
        <Link
          href="/app"
          className="mt-9 inline-block bg-white px-7 py-3.5 text-sm font-semibold transition hover:opacity-90"
          style={{ color: "var(--accent-on-white)", borderRadius: "var(--r-md)", boxShadow: "var(--shadow)" }}
        >
          Open the live demo
        </Link>
      </Shell>
    </div>
  );
}

/* ----------------------------------------------------------------- the group */

/**
 * Cross-sell strip.
 *
 * Fifty single-feature products are individually small; the reason to run them as
 * one group is that a visitor who needed one of them is a plausible buyer for its
 * neighbours, and they already have an account that works everywhere. `siblings`
 * is generated per app from the catalogue, nearest-category first, so this stays
 * relevant without anyone maintaining a list by hand.
 */
export function GroupStrip({ band }: { band?: boolean }) {
  const near = siblings.slice(0, 3);
  if (near.length === 0) return null;
  return (
    <Section band={band}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHead eyebrow={`The ${GROUP.name} group`} title="Built by the same framework" />
        <a
          href={GROUP.site}
          className="text-sm font-semibold underline"
          style={{ color: "var(--accent-text)" }}
        >
          All {GROUP.productCount} products →
        </a>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {near.map((s) => (
          <a
            key={s.slug}
            href={s.url}
            className="group block p-6 transition hover:opacity-90"
            style={{
              background: "var(--panel)",
              borderRadius: "var(--r-lg)",
              borderWidth: "var(--bw)",
              borderStyle: "solid",
              borderColor: "var(--line)",
              boxShadow: "var(--shadow)",
            }}
          >
            <span className="flex items-center gap-2.5">
              <span
                className="grid size-7 shrink-0 place-items-center text-xs font-bold"
                style={{ background: s.accent, color: onColor(s.accent), borderRadius: "var(--r-sm)" }}
                aria-hidden
              >
                {s.name.slice(0, 1)}
              </span>
              <span className="text-[15px] font-semibold">{s.name}</span>
            </span>
            <span className="mt-3 block text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              {s.tagline}
            </span>
            <span className="mt-3 block text-xs" style={{ color: "var(--muted)" }}>
              {s.category}
            </span>
          </a>
        ))}
      </div>
    </Section>
  );
}

/** Thin group bar above the product nav. Present on every page of every product. */
export function GroupBar() {
  return (
    <div
      className="text-xs"
      style={{ background: "var(--band)", borderBottom: "var(--bw) solid var(--line)", color: "var(--muted)" }}
    >
      <Shell className="flex h-9 items-center justify-between gap-4">
        <span className="flex items-center gap-2 truncate">
          <span
            className="inline-block size-1.5 shrink-0 rounded-full"
            style={{ background: "var(--accent)" }}
            aria-hidden
          />
          <span className="truncate">
            One of {GROUP.productCount} single-feature tools by{" "}
            <a href={GROUP.site} className="font-semibold underline hover:opacity-80">
              {GROUP.name}
            </a>
          </span>
        </span>
        <a href={GROUP.site} className="hidden shrink-0 font-semibold underline hover:opacity-80 sm:block">
          Browse the group →
        </a>
      </Shell>
    </div>
  );
}
