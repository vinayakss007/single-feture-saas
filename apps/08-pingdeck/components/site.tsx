import Link from "next/link";
import type { ProductConfig } from "@/lib/types";

export function Nav({ p }: { p: ProductConfig }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="grid size-8 place-items-center rounded-lg text-sm font-bold text-white"
            style={{ background: "var(--accent)" }}
          >
            {p.name.slice(0, 1)}
          </span>
          <span className="text-[15px] font-semibold tracking-tight">{p.name}</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
          <a href="/#features" className="hover:text-ink">Features</a>
          <a href="/#how" className="hover:text-ink">How it works</a>
          <a href="/#api" className="hover:text-ink">API &amp; MCP</a>
          <a href="/#pricing" className="hover:text-ink">Pricing</a>
          <a href="/#faq" className="hover:text-ink">FAQ</a>
        </nav>
        <Link
          href="/app"
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: "var(--accent)" }}
        >
          Try it free
        </Link>
      </div>
    </header>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  tint,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  tint?: boolean;
}) {
  return (
    <section id={id} className={tint ? "border-y bg-[#fafbfd]" : ""}>
      <div className="mx-auto max-w-6xl px-5 py-20">
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--accent)" }}>
            {eyebrow}
          </p>
        ) : null}
        {title ? (
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        ) : null}
        {subtitle ? <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-muted">{subtitle}</p> : null}
        {children ? <div className={title || subtitle ? "mt-12" : ""}>{children}</div> : null}
      </div>
    </section>
  );
}

export function Hero({ p }: { p: ProductConfig }) {
  return (
    <div className="relative overflow-hidden border-b">
      <div className="absolute inset-0 grid-bg" aria-hidden />
      <div className="absolute inset-0 accent-fade" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-5 py-24 sm:py-28">
        <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-medium text-muted">
          <span className="size-1.5 rounded-full" style={{ background: "var(--accent)" }} />
          {p.category} · one job, done properly
        </div>
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
          {p.tagline}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{p.oneLiner}</p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            href="/app"
            className="rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            Run it on your data — free
          </Link>
          <a href="#api" className="rounded-xl border bg-white px-6 py-3 text-sm font-semibold transition hover:bg-[#fafbfd]">
            View API &amp; MCP docs
          </a>
        </div>
        <p className="mt-4 text-sm text-muted">No signup, no credit card. Built for {p.audience}.</p>

        <dl className="mt-16 grid gap-6 border-t pt-10 sm:grid-cols-3">
          {p.metrics.map((m) => (
            <div key={m.label}>
              <dt className="text-3xl font-semibold tracking-tight" style={{ color: "var(--accent)" }}>
                {m.value}
              </dt>
              <dd className="mt-1 text-sm text-muted">{m.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export function ProblemBlock({ p }: { p: ProductConfig }) {
  return (
    <Section
      id="problem"
      eyebrow="The problem"
      title="This is the work nobody wants to do by hand"
      subtitle="Every team does this manually, inconsistently, and late. That is exactly the kind of gap a single-feature tool should close."
      tint
    >
      <div className="grid gap-6 md:grid-cols-3">
        {p.problem.map((item) => (
          <div key={item.title} className="rounded-2xl border bg-white p-6">
            <h3 className="text-base font-semibold">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function Features({ p }: { p: ProductConfig }) {
  return (
    <Section
      id="features"
      eyebrow="What you get"
      title={`${p.name} does one thing, and covers the whole job`}
      subtitle="No dashboard sprawl, no onboarding call, no 40-field setup wizard. Paste input, get an answer you can act on."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {p.features.map((f, i) => (
          <div key={f.title} className="rounded-2xl border p-6 transition hover:shadow-sm">
            <div
              className="grid size-9 place-items-center rounded-lg text-sm font-semibold"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
            <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function How({ p }: { p: ProductConfig }) {
  return (
    <Section id="how" eyebrow="How it works" title="Three steps, under a minute" tint>
      <ol className="grid gap-6 md:grid-cols-3">
        {p.how.map((step, i) => (
          <li key={step} className="rounded-2xl border bg-white p-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted">Step {i + 1}</span>
            <p className="mt-3 text-[15px] leading-relaxed">{step}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function ApiBlock({ p }: { p: ProductConfig }) {
  const sampleBody = JSON.stringify(p.sample, null, 2)
    .split("\n")
    .map((l, i) => (i === 0 ? l : `  ${l}`))
    .join("\n");

  const curl = `curl -X POST https://${p.slug}.abetworks.in/api/v1/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $${p.slug.toUpperCase().replace(/-/g, "_")}_KEY" \\
  -d '${sampleBody}'`;

  const mcpConfig = `{
  "mcpServers": {
    "${p.slug}": {
      "command": "node",
      "args": ["./mcp/server.mjs"],
      "env": {
        "SFS_API_URL": "https://${p.slug}.abetworks.in",
        "SFS_API_KEY": "your_key"
      }
    }
  }
}`;

  return (
    <Section
      id="api"
      eyebrow="API &amp; MCP"
      title="Usable by humans, by your backend, and by your agents"
      subtitle="The same engine is exposed three ways: a web app, a REST endpoint, and an MCP server so Claude, Cursor or your own agent fleet can call it as a tool."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border">
          <div className="flex items-center justify-between border-b bg-[#fafbfd] px-5 py-3">
            <span className="text-sm font-semibold">REST</span>
            <code className="text-xs text-muted">POST /api/v1/run</code>
          </div>
          <pre className="overflow-x-auto p-5 text-[12.5px] leading-relaxed">
            <code className="font-mono">{curl}</code>
          </pre>
        </div>
        <div className="overflow-hidden rounded-2xl border">
          <div className="flex items-center justify-between border-b bg-[#fafbfd] px-5 py-3">
            <span className="text-sm font-semibold">MCP</span>
            <code className="text-xs text-muted">tool: {p.mcpTool.name}</code>
          </div>
          <pre className="overflow-x-auto p-5 text-[12.5px] leading-relaxed">
            <code className="font-mono">{mcpConfig}</code>
          </pre>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border p-6" style={{ background: "var(--accent-soft)" }}>
        <h3 className="text-base font-semibold">Plugs into the Abet Works stack</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Ships standalone, but designed to feed NuCRM, FlowForge and Agent Fleet without glue code.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {p.integrations.map((i) => (
            <li key={i} className="rounded-full border bg-white px-3 py-1 text-xs font-medium">
              {i}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

export function Pricing({ p }: { p: ProductConfig }) {
  return (
    <Section
      id="pricing"
      eyebrow="Pricing"
      title="Priced like a tool, not like a platform"
      subtitle="Start free. Upgrade only when the volume is real."
      tint
    >
      <div className="grid gap-6 md:grid-cols-3">
        {p.pricing.map((tier) => (
          <div
            key={tier.name}
            className="flex flex-col rounded-2xl border bg-white p-7"
            style={tier.highlight ? { borderColor: "var(--accent)", borderWidth: 2 } : undefined}
          >
            {tier.highlight ? (
              <span
                className="mb-4 self-start rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
                style={{ background: "var(--accent)" }}
              >
                Most popular
              </span>
            ) : null}
            <h3 className="text-lg font-semibold">{tier.name}</h3>
            <p className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-semibold tracking-tight">{tier.price}</span>
              <span className="text-sm text-muted">{tier.period}</span>
            </p>
            <p className="mt-3 text-sm text-muted">{tier.blurb}</p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm">
              {tier.features.map((f) => (
                <li key={f} className="flex gap-2.5">
                  <span aria-hidden style={{ color: "var(--accent)" }}>✓</span>
                  <span className="text-muted">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/app"
              className="mt-7 rounded-xl border px-4 py-2.5 text-center text-sm font-semibold transition"
              style={
                tier.highlight
                  ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" }
                  : undefined
              }
            >
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function Faq({ p }: { p: ProductConfig }) {
  return (
    <Section id="faq" eyebrow="FAQ" title="Straight answers">
      <div className="grid gap-4 md:grid-cols-2">
        {p.faq.map((item) => (
          <details key={item.q} className="group rounded-2xl border p-5 open:bg-[#fafbfd]">
            <summary className="cursor-pointer list-none text-[15px] font-semibold marker:hidden">
              <span className="flex items-start justify-between gap-4">
                {item.q}
                <span className="mt-0.5 shrink-0 text-muted transition group-open:rotate-45" aria-hidden>
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

export function FinalCta({ p }: { p: ProductConfig }) {
  return (
    <div className="border-t" style={{ background: "var(--accent)" }}>
      <div className="mx-auto max-w-6xl px-5 py-20 text-center text-white">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{p.name} takes 40 seconds to try</h2>
        <p className="mx-auto mt-4 max-w-xl text-white/85">{p.oneLiner}</p>
        <Link
          href="/app"
          className="mt-9 inline-block rounded-xl bg-white px-7 py-3.5 text-sm font-semibold shadow-sm transition hover:bg-white/90"
          style={{ color: "var(--accent)" }}
        >
          Open the live demo
        </Link>
      </div>
    </div>
  );
}

export function Footer({ p }: { p: ProductConfig }) {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">{p.name}</p>
          <p className="mt-1 text-sm text-muted">
            A single-feature SaaS by{" "}
            <a href="https://abetworks.in" className="underline hover:text-ink">
              Abet Works
            </a>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-5 text-sm text-muted">
          <Link href="/app" className="hover:text-ink">Live demo</Link>
          <a href="/api/health" className="hover:text-ink">API status</a>
          <a href="/#pricing" className="hover:text-ink">Pricing</a>
          <a href="https://abetworks.in" className="hover:text-ink">Abet Works</a>
        </div>
      </div>
    </footer>
  );
}
