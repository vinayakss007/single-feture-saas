import type { ProductConfig } from "@/lib/types";
import {
  ApiSection,
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
 * Terminal family.
 *
 * Dark, monospace, framed as a shell session. Used for monitoring, email
 * deliverability, prompt-injection and accessibility-audit products.
 *
 * These buyers evaluate a tool by whether it looks like it was built by someone who
 * runs commands. A light marketing page with soft shadows makes the same engine
 * read as less competent to that audience. The hero shows the actual invocation and
 * plausible output rather than describing it, which is also the fastest possible
 * explanation of the input/output contract.
 */
export function TerminalLanding({ p }: { p: ProductConfig }) {
  const firstField = p.inputs[0];
  const sampleValue = firstField ? (p.sample[firstField.name] ?? "") : "";
  const shown = sampleValue.length > 58 ? `${sampleValue.slice(0, 58)}…` : sampleValue;

  return (
    <main id="main-content">
      <div style={{ borderBottom: "var(--bw) solid var(--line)" }}>
        <Shell className="py-14 sm:py-20">
          <p
            className="text-xs"
            style={{ color: "var(--accent-text)", fontFamily: "var(--font-code)", letterSpacing: "var(--label-tracking)", textTransform: "uppercase" }}
          >
            {p.category}
          </p>
          <H1 className="mt-5 max-w-3xl !text-3xl sm:!text-5xl">{p.tagline}</H1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed" style={{ color: "var(--muted)" }}>
            {p.oneLiner}
          </p>

          {/* The invocation, shown rather than described. */}
          <div
            className="mt-9 overflow-hidden"
            style={{ background: "var(--panel)", border: "var(--bw) solid var(--line)", borderRadius: "var(--r-md)" }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2 text-[11px]"
              style={{ borderBottom: "var(--bw) solid var(--line)", color: "var(--muted)", fontFamily: "var(--font-code)" }}
            >
              <span className="size-2 rounded-full" style={{ background: "var(--accent)" }} aria-hidden />
              {p.slug} — sh
            </div>
            <pre className="overflow-x-auto px-4 py-4 text-[12.5px] leading-[1.75]">
              <code style={{ fontFamily: "var(--font-code)" }}>
                <span style={{ color: "var(--accent-text)" }}>$</span> npx @abetworks/{p.slug} run \{"\n"}
                {"    "}--{firstField?.name ?? "input"}={JSON.stringify(shown)}
                {"\n\n"}
                <span style={{ color: "var(--muted)" }}>{"# "}resolving engine … ok (deterministic, 0 network calls)</span>
                {"\n"}
                <span style={{ color: "var(--muted)" }}>{"# "}checks: {p.features.length} groups</span>
                {"\n\n"}
                <span style={{ color: "#4ade80" }}>✔</span> {p.mcpTool.name} → {p.metrics[0]?.value ?? "done"}{" "}
                {p.metrics[0]?.label.toLowerCase() ?? ""}
                {"\n"}
                <span style={{ color: "var(--muted)" }}>
                  {"  "}json written to stdout · exit 0
                </span>
              </code>
            </pre>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <PrimaryLink href="/app">Run it in the browser</PrimaryLink>
            <a
              href="#api"
              className="px-5 py-3 text-sm font-semibold transition hover:opacity-80"
              style={{ border: "var(--bw) solid var(--line-strong)", borderRadius: "var(--r-md)", fontFamily: "var(--font-code)" }}
            >
              curl / MCP →
            </a>
          </div>

          <dl className="mt-12 grid gap-6 pt-8 sm:grid-cols-3" style={{ borderTop: "var(--bw) solid var(--line)" }}>
            {p.metrics.map((m) => (
              <div key={m.label}>
                <dt className="text-2xl" style={{ color: "var(--accent-text)", fontFamily: "var(--font-code)", fontVariantNumeric: "tabular-nums" }}>
                  {m.value}
                </dt>
                <dd className="mt-1 text-[13px]" style={{ color: "var(--muted)" }}>
                  {m.label}
                </dd>
              </div>
            ))}
          </dl>
        </Shell>
      </div>

      {/* Problem rendered as stderr-style annotations. */}
      <Section id="problem" band>
        <SectionHead
          eyebrow="# the problem"
          title="What goes wrong without it"
          subtitle="Three failure modes, all of them silent until they are expensive."
        />
        <ul className="mt-10 space-y-4">
          {p.problem.map((item) => (
            <li
              key={item.title}
              className="p-5"
              style={{ background: "var(--panel)", border: "var(--bw) solid var(--line)", borderLeft: "3px solid var(--accent)", borderRadius: "var(--r-sm)" }}
            >
              <p className="text-[13px] font-semibold" style={{ fontFamily: "var(--font-code)" }}>
                <span style={{ color: "var(--accent-text)" }}>WARN</span> {item.title}
              </p>
              <p className="mt-2 max-w-3xl text-[14px] leading-relaxed" style={{ color: "var(--muted)" }}>
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Features as a man-page style flag list. */}
      <Section id="features">
        <SectionHead
          eyebrow="# checks"
          title={`${p.name} — what each run covers`}
          subtitle="Every run performs all of these. There is no configuration to get wrong."
        />
        <dl className="mt-10">
          {p.features.map((f, i) => (
            <div
              key={f.title}
              className="grid gap-x-8 gap-y-1.5 py-5 md:grid-cols-[16rem_1fr]"
              style={{ borderTop: "var(--bw) solid var(--line)" }}
            >
              <dt className="text-[13px]" style={{ fontFamily: "var(--font-code)", color: "var(--accent-text)" }}>
                [{String(i + 1).padStart(2, "0")}] {f.title}
              </dt>
              <dd className="max-w-2xl text-[14px] leading-relaxed" style={{ color: "var(--muted)" }}>
                {f.body}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="how" band>
        <SectionHead eyebrow="# usage" title="Three steps, under a minute" />
        <ol className="mt-10 space-y-3">
          {p.how.map((step, i) => (
            <li
              key={step}
              className="flex gap-4 p-4"
              style={{ background: "var(--panel)", border: "var(--bw) solid var(--line)", borderRadius: "var(--r-sm)" }}
            >
              <span className="shrink-0 text-[13px]" style={{ color: "var(--accent-text)", fontFamily: "var(--font-code)" }}>
                {String(i + 1)}.
              </span>
              <p className="text-[14px] leading-relaxed">{step}</p>
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
