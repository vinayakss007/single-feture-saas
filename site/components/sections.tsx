import type { DesignFamilySummary } from "@/lib/catalog.generated.ts";
import type { LinkedProduct } from "@/lib/links.ts";

/** Shared section shell, so every band on the page has the same rhythm. */
export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  tint,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  tint?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={tint ? "border-y bg-[#fafbfd]" : ""}>
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">{eyebrow}</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
        {subtitle ? <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-muted">{subtitle}</p> : null}
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

export function Hero({ products, repoUrl }: { products: LinkedProduct[]; repoUrl: string }) {
  return (
    <section className="relative overflow-hidden border-b">
      <div aria-hidden className="grid-bg absolute inset-0" />
      <div aria-hidden className="hero-glow absolute inset-0" />

      <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-20 md:pb-20 md:pt-28">
        <span className="inline-flex items-center gap-2 rounded-full border bg-white/80 px-3 py-1.5 text-xs font-medium text-muted backdrop-blur">
          <span aria-hidden className="size-1.5 rounded-full bg-brand" />
          {products.length} products live · built in Bengaluru, India
        </span>

        <h1 className="mt-7 max-w-4xl text-[2.6rem] font-semibold leading-[1.08] tracking-tight md:text-6xl">
          Software that does
          <br />
          <span className="bg-gradient-to-r from-brand via-[#7c3aed] to-[#0891b2] bg-clip-text text-transparent">
            one thing, properly.
          </span>
        </h1>

        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted">
          Most tools solve your problem plus nine you do not have, and charge for all ten. We build the opposite:
          one job per product, done completely, priced like a tool.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <a
            href="#products"
            className="rounded-xl bg-brand px-6 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-brand/20 transition hover:opacity-90"
          >
            See all {products.length} products
          </a>
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border bg-white px-6 py-3.5 text-[15px] font-semibold transition hover:bg-brand-soft"
          >
            Read the source
          </a>
        </div>

        <dl className="mt-14 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-4">
          {[
            ["No signup", "to try any of them"],
            ["Free plan", "on every product"],
            ["REST + MCP", "on every product"],
            ["Open source", "the whole suite"],
          ].map(([value, label]) => (
            <div key={value}>
              <dt className="text-lg font-semibold tracking-tight">{value}</dt>
              <dd className="mt-1 text-sm text-muted">{label}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Names scroll past so the breadth reads before you scroll. Decorative. */}
      <div aria-hidden className="marquee-mask relative border-t bg-white/60 py-4">
        <div className="marquee-track gap-10">
          {[...products, ...products].map((p, i) => (
            <span key={`${p.slug}-${i}`} className="flex shrink-0 items-center gap-2.5 text-sm font-medium text-muted">
              <span className="size-2 rounded-full" style={{ background: p.accent }} />
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

/** The grid of ten. Each card is a link out to that product's own site. */
export function ProductGrid({ products }: { products: LinkedProduct[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <article
          key={p.slug}
          className="product-card flex flex-col rounded-2xl border bg-white p-6"
          style={{ ["--card-accent" as string]: p.accent }}
        >
          <div className="flex items-start justify-between gap-3">
            <span
              aria-hidden
              className="grid size-10 place-items-center rounded-xl text-[15px] font-bold text-white"
              style={{ background: p.accent }}
            >
              {p.name.slice(0, 1)}
            </span>
            <span className="rounded-full border px-2.5 py-1 text-[11px] font-medium text-muted">{p.category}</span>
          </div>

          <h3 className="mt-5 text-lg font-semibold tracking-tight">
            {/*
              The whole card is clickable via this stretched link, which keeps one
              anchor per card — better for screen readers and for keyboard users
              than wrapping the article and nesting the demo link inside it.
            */}
            <a href={p.url} className="after:absolute after:inset-0 after:content-['']">
              {p.name}
            </a>
          </h3>

          <p className="mt-2.5 text-sm leading-relaxed text-muted">{p.tagline}</p>
          <p className="mt-4 flex-1 text-[13px] leading-relaxed text-muted/80">{p.job}</p>

          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <span className="text-sm font-semibold" style={{ color: p.accent }}>
              Open {p.name} <span className="go-arrow inline-block">→</span>
            </span>
            {/* Sits above the stretched link so the demo is separately reachable. */}
            <a
              href={p.demoUrl}
              className="relative z-10 text-xs font-medium text-muted underline decoration-dotted underline-offset-4 hover:text-ink"
            >
              Live demo
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------

export function Platform({
  items,
}: {
  items: readonly { name: string; blurb: string; detail: string; status: string; repo: string | null; accent: string }[];
}) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {items.map((item) => (
        <div key={item.name} className="flex flex-col rounded-2xl border bg-white p-7">
          <div className="flex items-center justify-between gap-3">
            <span className="size-2.5 rounded-full" style={{ background: item.accent }} />
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
              {item.status}
            </span>
          </div>
          <h3 className="mt-5 text-lg font-semibold tracking-tight">{item.name}</h3>
          <p className="mt-2 text-sm font-medium text-muted">{item.blurb}</p>
          <p className="mt-4 flex-1 text-[13px] leading-relaxed text-muted/85">{item.detail}</p>
          {item.repo ? (
            <a
              href={item.repo}
              target="_blank"
              rel="noreferrer"
              className="mt-5 text-sm font-semibold"
              style={{ color: item.accent }}
            >
              Follow the build →
            </a>
          ) : (
            <span className="mt-5 text-sm text-muted">Not public yet</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------

export function Framework({ repoUrl }: { repoUrl: string }) {
  const rules = [
    {
      title: "One feature, or it is two products",
      body: "If it cannot be described in one sentence without an \"and\", it gets split. That is why there is no roadmap debt.",
    },
    {
      title: "Deterministic, not generative",
      body: "The same input always gives the same output. No model in the request path, so a run costs us nothing, cannot be prompt-injected, and holds up in an audit.",
    },
    {
      title: "Try it before you tell us anything",
      body: "Every product works with no account and no key. If the demo does not convince you, a signup form was never going to.",
    },
    {
      title: "Priced like a tool",
      body: "Free tier that is genuinely useful, one paid tier that is obvious, and no per-seat tax on your teammates.",
    },
  ];

  const verified = [
    ["420", "unit tests"],
    ["55", "integration checks"],
    ["10/10", "build clean"],
    ["1", "shared framework"],
  ];

  return (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
      <div className="grid gap-5 sm:grid-cols-2">
        {rules.map((r, i) => (
          <div key={r.title} className="rounded-2xl border bg-white p-6">
            <span className="grid size-7 place-items-center rounded-lg bg-brand-soft text-xs font-bold text-brand">
              {i + 1}
            </span>
            <h3 className="mt-4 text-[15px] font-semibold">{r.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{r.body}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-ink p-8 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/45">Same rails, every product</p>
        <h3 className="mt-4 text-2xl font-semibold tracking-tight">
          One framework, ten products, no forked copies.
        </h3>
        <p className="mt-4 text-sm leading-relaxed text-white/70">
          Accounts, billing, quotas, API keys, monitoring and the test suite are shared and enforced. A fix lands in
          one place and every product has it. That is why the eleventh takes days rather than months — and why the
          tenth is as well tested as the first.
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-white/10 pt-7">
          {verified.map(([value, label]) => (
            <div key={label}>
              <dt className="text-2xl font-semibold tracking-tight">{value}</dt>
              <dd className="mt-1 text-xs text-white/55">{label}</dd>
            </div>
          ))}
        </dl>

        <a
          href={`${repoUrl}/blob/main/FRAMEWORK.md`}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-block rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white/90"
        >
          Read the framework →
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function ForAgents({ products }: { products: LinkedProduct[] }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
      <div>
        <p className="text-[17px] leading-relaxed text-muted">
          Every product ships an MCP server, so Claude, Cursor or your own agent can call it as a tool — and a plain
          REST endpoint that publishes its own input schema on <code className="font-mono text-[13px]">GET</code>, so
          an agent can work out how to call it without documentation.
        </p>

        <div className="mt-7 overflow-x-auto rounded-2xl border bg-ink p-5">
          <pre className="font-mono text-[12.5px] leading-relaxed text-white/85">
            <code>{`# Any product, same shape
curl -s ${products[0]?.apiUrl ?? ""} \\
  -H 'Authorization: Bearer sk_…' \\
  -H 'Content-Type: application/json' \\
  -d '{ "…": "…" }'

# What can it do? Ask it.
curl -s ${products[0]?.apiUrl ?? ""}`}</code>
          </pre>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-[#fafbfd] text-[11px] uppercase tracking-wider text-muted">
              <th className="px-5 py-3 font-semibold">Product</th>
              <th className="px-5 py-3 font-semibold">MCP tool</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.slug} className="border-b last:border-0">
                <td className="px-5 py-3">
                  <a href={p.url} className="flex items-center gap-2.5 font-medium hover:text-brand">
                    <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: p.accent }} />
                    {p.name}
                  </a>
                </td>
                <td className="px-5 py-3 font-mono text-[12px] text-muted">{p.mcpTool}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function Footer({
  products,
  company,
}: {
  products: LinkedProduct[];
  company: { name: string; email: string; repoUrl: string; github: string; site: string };
}) {
  const half = Math.ceil(products.length / 2);

  return (
    <footer className="border-t bg-[#fafbfd]">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="grid size-8 place-items-center rounded-lg text-[13px] font-bold text-white"
                style={{ background: "linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)" }}
              >
                AW
              </span>
              <span className="text-[15px] font-semibold tracking-tight">{company.name}</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Single-feature software, built in India, sold to whoever has the problem. No demos to sit through.
            </p>
            <a href={`mailto:${company.email}`} className="mt-5 inline-block text-sm font-semibold text-brand">
              {company.email}
            </a>
          </div>

          {[products.slice(0, half), products.slice(half)].map((column, i) => (
            <div key={i}>
              {i === 0 ? (
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">Products</p>
              ) : (
                <p className="text-xs font-semibold uppercase tracking-widest text-transparent" aria-hidden>
                  .
                </p>
              )}
              <ul className="mt-4 space-y-2.5 text-sm">
                {column.map((p) => (
                  <li key={p.slug}>
                    <a href={p.url} className="text-muted transition hover:text-ink">
                      {p.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Company</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href="#platform" className="text-muted transition hover:text-ink">
                  Platform
                </a>
              </li>
              <li>
                <a href="#framework" className="text-muted transition hover:text-ink">
                  How we build
                </a>
              </li>
              <li>
                <a href={company.repoUrl} target="_blank" rel="noreferrer" className="text-muted transition hover:text-ink">
                  Source
                </a>
              </li>
              <li>
                <a href={company.github} target="_blank" rel="noreferrer" className="text-muted transition hover:text-ink">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t pt-7 text-xs text-muted">
          <p>
            © {new Date().getFullYear()} {company.name}. Every product on this page is independently deployed.
          </p>
          <p>Made in Bengaluru 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}


/**
 * The eight design families.
 *
 * This section exists because the most common objection to a suite this size is that
 * it must be fifty copies of one template with the colour changed. It nearly was —
 * and saying so plainly, with the reason each family exists and which products use
 * it, is more convincing than claiming variety.
 *
 * The data is generated from the framework's own resolver, so the counts and labels
 * here cannot disagree with what the products actually render.
 */
export function DesignFamilies({
  families,
  products,
}: {
  families: DesignFamilySummary[];
  products: LinkedProduct[];
}) {
  return (
    <div className="space-y-4">
      {families.map((family) => {
        const members = products.filter((p) => p.design === family.family);
        return (
          <div key={family.family} className="rounded-2xl border bg-white p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="text-base font-semibold">
                {family.label}
                <span className="ml-2 text-sm font-normal text-muted">
                  {family.count} product{family.count === 1 ? "" : "s"}
                </span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {members.map((member) => (
                  <a
                    key={member.slug}
                    href={member.url}
                    className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition hover:bg-brand-soft"
                    style={{ borderColor: `${member.accent}44`, color: member.accent }}
                  >
                    {member.name}
                  </a>
                ))}
              </div>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{family.rationale}</p>
          </div>
        );
      })}
    </div>
  );
}
