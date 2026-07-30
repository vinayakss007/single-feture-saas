"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { LinkedProduct } from "@/lib/links.ts";

/**
 * The banner nav.
 *
 * The Products menu lists all ten by name, and clicking one leaves for that
 * product's own site — the whole job of this page is to get people to the right
 * product in one click, so the menu links out rather than scrolling to a section.
 *
 * The links are real anchors, so they work with middle-click, cmd-click and with
 * JavaScript disabled. The menu is progressive enhancement over a list that
 * already functions.
 */
export function Nav({
  products,
  company,
}: {
  products: LinkedProduct[];
  company: { name: string; repoUrl: string; email: string };
}) {
  const [menu, setMenu] = useState<"products" | "mobile" | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenu(null);
    }
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setMenu(null);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [menu]);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/85 backdrop-blur-md">
      <div ref={wrapRef} className="mx-auto max-w-6xl px-5">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5" aria-label={`${company.name} home`}>
            <Logo />
            <span className="text-[15px] font-semibold tracking-tight">{company.name}</span>
          </Link>

          <nav className="hidden items-center gap-1 text-sm md:flex">
            <button
              type="button"
              onClick={() => setMenu(menu === "products" ? null : "products")}
              aria-expanded={menu === "products"}
              aria-haspopup="true"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-medium text-muted transition hover:bg-brand-soft hover:text-ink"
            >
              Products
              <span className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[11px] font-semibold text-brand">
                {products.length}
              </span>
              <Chevron open={menu === "products"} />
            </button>

            <a href="#platform" className="rounded-lg px-3 py-2 font-medium text-muted transition hover:text-ink">
              Platform
            </a>
            <a href="#framework" className="rounded-lg px-3 py-2 font-medium text-muted transition hover:text-ink">
              How we build
            </a>
            <a href="#agents" className="rounded-lg px-3 py-2 font-medium text-muted transition hover:text-ink">
              For agents
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={company.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-lg border px-3.5 py-2 text-sm font-medium transition hover:bg-brand-soft sm:block"
            >
              GitHub
            </a>
            <a
              href={`mailto:${company.email}`}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Talk to us
            </a>
            <button
              type="button"
              onClick={() => setMenu(menu === "mobile" ? null : "mobile")}
              aria-expanded={menu === "mobile"}
              aria-label="Menu"
              className="rounded-lg border p-2 md:hidden"
            >
              <Burger open={menu === "mobile"} />
            </button>
          </div>
        </div>

        {/* Desktop mega menu: every product, one click away. */}
        {menu === "products" ? (
          <div className="absolute inset-x-0 top-16 hidden border-b bg-white shadow-xl md:block">
            <div className="mx-auto max-w-6xl px-5 py-7">
              <div className="mb-5 flex items-baseline justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                  Ten products · each does one thing
                </p>
                <span className="text-xs text-muted">Opens on its own site</span>
              </div>
              <ul className="grid grid-cols-2 gap-x-8 gap-y-1 lg:grid-cols-2">
                {products.map((p) => (
                  <li key={p.slug}>
                    <a
                      href={p.url}
                      className="group flex items-start gap-3 rounded-xl p-3 transition hover:bg-brand-soft/60"
                      onClick={() => setMenu(null)}
                    >
                      <span
                        aria-hidden
                        className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg text-[13px] font-bold text-white"
                        style={{ background: p.accent }}
                      >
                        {p.name.slice(0, 1)}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold">{p.name}</span>
                          <span className="text-xs text-muted opacity-0 transition group-hover:opacity-100">→</span>
                        </span>
                        <span className="mt-0.5 block text-[13px] leading-snug text-muted">{p.tagline}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex items-center justify-between border-t pt-4 text-sm">
                <a href="#products" onClick={() => setMenu(null)} className="font-semibold text-brand">
                  Compare all ten →
                </a>
                <span className="text-xs text-muted">
                  Every one has a free plan, a public API and an MCP server
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Mobile menu: the same links, stacked. */}
        {menu === "mobile" ? (
          <div className="border-t py-4 md:hidden">
            <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-widest text-muted">Products</p>
            <ul className="space-y-0.5">
              {products.map((p) => (
                <li key={p.slug}>
                  <a href={p.url} className="flex items-center gap-3 rounded-lg px-1 py-2.5" onClick={() => setMenu(null)}>
                    <span
                      aria-hidden
                      className="grid size-7 shrink-0 place-items-center rounded-md text-xs font-bold text-white"
                      style={{ background: p.accent }}
                    >
                      {p.name.slice(0, 1)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{p.name}</span>
                      <span className="block truncate text-xs text-muted">{p.tagline}</span>
                    </span>
                    <span aria-hidden className="text-muted">
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 border-t pt-3 text-sm font-medium">
              {[
                ["#platform", "Platform"],
                ["#framework", "How we build"],
                ["#agents", "For agents"],
              ].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMenu(null)} className="block px-1 py-2 text-muted">
                  {label}
                </a>
              ))}
              <a href={company.repoUrl} target="_blank" rel="noreferrer" className="block px-1 py-2 text-muted">
                GitHub
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function Logo() {
  return (
    <span
      aria-hidden
      className="grid size-8 place-items-center rounded-lg text-[13px] font-bold text-white"
      style={{ background: "linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)" }}
    >
      AW
    </span>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      width="10"
      height="10"
      viewBox="0 0 10 10"
      className="transition-transform"
      style={{ transform: open ? "rotate(180deg)" : undefined }}
    >
      <path d="M1 3.5 5 7.5 9 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Burger({ open }: { open: boolean }) {
  return (
    <svg aria-hidden width="18" height="18" viewBox="0 0 18 18">
      {open ? (
        <path d="M4 4l10 10M14 4L4 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      ) : (
        <path d="M2 5h14M2 9h14M2 13h14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      )}
    </svg>
  );
}
