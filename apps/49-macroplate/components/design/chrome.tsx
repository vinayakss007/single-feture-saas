/**
 * Navigation and footer, per design family.
 *
 * Chrome is the first thing a visitor sees and the thing they see on every page,
 * so it carries more of a product's identity than any single section. A shell
 * titlebar and a serif masthead are not the same product even with identical
 * content beneath them, which is the whole point of shipping families rather than
 * accent colours.
 *
 * The auth, demo and dashboard screens import `Nav` and `Footer` from
 * `components/site`, which delegates here — so choosing a family styles the
 * entire product, not just the landing page.
 */

import Link from "next/link";
import type { ProductConfig } from "@/lib/types";
import { designFor } from "@/lib/design";
import { GROUP } from "@/lib/group";
import { GroupBar, Shell } from "./kit";

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how", label: "How it works" },
  { href: "/#api", label: "API & MCP" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

function Actions({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="hidden px-3 py-2 text-sm font-medium transition hover:opacity-80 sm:block"
        style={{ color: "var(--muted)" }}
      >
        Sign in
      </Link>
      <Link
        href="/app"
        className="px-4 py-2 text-sm font-semibold transition hover:opacity-90"
        style={{
          background: "var(--accent)",
          color: "var(--on-accent)",
          borderRadius: "var(--r-md)",
          borderWidth: "var(--bw)",
          borderStyle: "solid",
          borderColor: "var(--accent)",
          boxShadow: compact ? undefined : "var(--shadow)",
        }}
      >
        Try it free
      </Link>
    </div>
  );
}

/** Conventional sticky bar. standard, split, bento, clinical. */
function BarNav({ p }: { p: ProductConfig }) {
  return (
    <header
      className="sticky top-0 z-40 backdrop-blur"
      style={{
        background: "color-mix(in srgb, var(--bg) 88%, transparent)",
        borderBottom: "var(--bw) solid var(--line)",
      }}
    >
      <Shell className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="grid size-8 place-items-center text-sm font-bold"
            style={{ background: "var(--accent)", color: "var(--on-accent)", borderRadius: "var(--r-md)" }}
            aria-hidden
          >
            {p.name.slice(0, 1)}
          </span>
          <span className="text-[15px] font-semibold" style={{ letterSpacing: "var(--head-tracking)" }}>
            {p.name}
          </span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-7 text-sm md:flex" style={{ color: "var(--muted)" }}>
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition hover:opacity-70">
              {l.label}
            </a>
          ))}
        </nav>
        <Actions />
      </Shell>
    </header>
  );
}

/** Shell window titlebar. terminal. */
function TerminalNav({ p }: { p: ProductConfig }) {
  return (
    <header className="sticky top-0 z-40" style={{ background: "var(--panel)", borderBottom: "var(--bw) solid var(--line)" }}>
      <Shell className="flex h-11 items-center gap-4">
        <span className="flex shrink-0 items-center gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full" style={{ background: "#ff5f57" }} />
          <span className="size-2.5 rounded-full" style={{ background: "#febc2e" }} />
          <span className="size-2.5 rounded-full" style={{ background: "#28c840" }} />
        </span>
        <Link href="/" className="shrink-0 text-[13px] font-semibold" style={{ fontFamily: "var(--font-code)" }}>
          <span style={{ color: "var(--accent-text)" }}>~/</span>
          {p.slug}
        </Link>
        <nav
          aria-label="Main"
          className="hidden flex-1 items-center gap-5 text-[12.5px] md:flex"
          style={{ color: "var(--muted)", fontFamily: "var(--font-code)" }}
        >
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition hover:opacity-70">
              --{l.label.toLowerCase().replace(/[^a-z]+/g, "-")}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/login" className="hidden px-2 py-1 text-[12.5px] transition hover:opacity-80 sm:block" style={{ color: "var(--muted)", fontFamily: "var(--font-code)" }}>
            sign in
          </Link>
          <Link
            href="/app"
            className="px-3 py-1.5 text-[12.5px] font-semibold"
            style={{ background: "var(--accent)", color: "var(--on-accent)", fontFamily: "var(--font-code)", borderRadius: "var(--r-sm)" }}
          >
            run --free
          </Link>
        </div>
      </Shell>
    </header>
  );
}

/** Ruled masthead with the name centred over a rule. editorial, ledger. */
function MastheadNav({ p }: { p: ProductConfig }) {
  const d = designFor(p);
  return (
    <header style={{ background: "var(--bg)", borderBottom: "2px solid var(--line-strong)" }}>
      <Shell>
        <div className="flex h-14 items-center justify-between">
          <Link
            href="/"
            className="text-xl"
            style={{
              fontFamily: "var(--font-head)",
              fontWeight: "var(--head-weight)" as React.CSSProperties["fontWeight"],
              letterSpacing: d.family === "ledger" ? "0.02em" : "-0.01em",
            }}
          >
            {p.name}
          </Link>
          <span
            className="hidden text-[11px] sm:block"
            style={{
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "var(--label-tracking)",
            }}
          >
            {p.category}
          </span>
          <Actions compact />
        </div>
        <nav
          aria-label="Main"
          className="flex flex-wrap items-center gap-6 py-2.5 text-[13px]"
          style={{ borderTop: "var(--bw) solid var(--line)", color: "var(--muted)" }}
        >
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition hover:opacity-70">
              {l.label}
            </a>
          ))}
          <a href={GROUP.site} className="ml-auto transition hover:opacity-70">
            {GROUP.name} →
          </a>
        </nav>
      </Shell>
    </header>
  );
}

/** Hard-bordered block nav. brutalist. */
function BlockNav({ p }: { p: ProductConfig }) {
  return (
    <header style={{ background: "var(--accent)", borderBottom: "3px solid var(--ink)" }}>
      <Shell className="flex flex-wrap items-center justify-between gap-3 py-3">
        <Link
          href="/"
          className="bg-white px-3 py-1.5 text-lg"
          style={{
            color: "var(--ink)",
            border: "2px solid var(--ink)",
            boxShadow: "3px 3px 0 var(--ink)",
            fontFamily: "var(--font-head)",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "-0.03em",
          }}
        >
          {p.name}
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-4 text-[13px] font-bold md:flex" style={{ color: "var(--on-accent)" }}>
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="underline decoration-2 underline-offset-4 hover:opacity-80">
              {l.label.toUpperCase()}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden text-[13px] font-bold underline underline-offset-4 sm:block" style={{ color: "var(--on-accent)" }}>
            SIGN IN
          </Link>
          <Link
            href="/app"
            className="bg-white px-4 py-2 text-[13px] font-bold"
            style={{ color: "var(--ink)", border: "2px solid var(--ink)", boxShadow: "3px 3px 0 var(--ink)" }}
          >
            TRY IT FREE
          </Link>
        </div>
      </Shell>
    </header>
  );
}

export function Nav({ p }: { p: ProductConfig }) {
  const d = designFor(p);
  const bar =
    d.family === "terminal" ? (
      <TerminalNav p={p} />
    ) : d.family === "editorial" || d.family === "ledger" ? (
      <MastheadNav p={p} />
    ) : d.family === "brutalist" ? (
      <BlockNav p={p} />
    ) : (
      <BarNav p={p} />
    );

  return (
    <>
      <GroupBar />
      {bar}
    </>
  );
}

export function Footer({ p }: { p: ProductConfig }) {
  const d = designFor(p);
  return (
    <footer style={{ background: d.family === "terminal" ? "var(--panel)" : "var(--bg)", borderTop: "var(--bw) solid var(--line)" }}>
      <Shell className="py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="text-sm font-semibold">{p.name}</p>
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
              A single-feature SaaS by{" "}
              <a href={GROUP.site} className="underline hover:opacity-80">
                {GROUP.name}
              </a>
              . One of {GROUP.productCount} tools built on one shared framework, so your account, billing and API keys
              work across every one of them.
            </p>
            <p className="mt-3 text-[11px]" style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "var(--label-tracking)" }}>
              {d.label} design family
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm sm:grid-cols-3" style={{ color: "var(--muted)" }}>
            <Link href="/app" className="hover:opacity-70">Live demo</Link>
            <a href="/#pricing" className="hover:opacity-70">Pricing</a>
            <a href="/#faq" className="hover:opacity-70">FAQ</a>
            <a href="/api/v1/openapi" className="hover:opacity-70">OpenAPI</a>
            <a href="/api/v1/agents" className="hover:opacity-70">Agent tools</a>
            <a href="/api/health" className="hover:opacity-70">Status</a>
            <a href="/sitemap.xml" className="hover:opacity-70">Sitemap</a>
            <a href={GROUP.site} className="hover:opacity-70">{GROUP.name}</a>
          </div>
        </div>
      </Shell>
    </footer>
  );
}
