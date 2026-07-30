# abetworks.in — the banner site

One page that puts every Abet Works product one click away. Deployed at the **apex**
(`abetworks.in`); each product lives on its own subdomain.

```
abetworks.in                 ← this site
  ├── dealbrief.abetworks.in
  ├── churnsignal.abetworks.in
  └── … eighteen more
```

## Why it is not under `apps/`

`apps/*` are products. Every one of them must satisfy the contract in
[`_template/`](../FRAMEWORK.md) — an engine, accounts, billing, metered quotas, a REST API, an MCP
server, 42 tests. This site is a shop window: no engine, nothing to meter, nothing to sell directly.
Forcing it through the product contract would mean stubbing half of it, so it sits in `site/` as its
own workspace package instead.

## It cannot drift from the products

`lib/catalog.generated.ts` is generated from `scripts/catalog.json`, the same file the products'
READMEs and launch copy come from:

```bash
pnpm run gen:hub          # regenerate
pnpm run gen:hub:check    # fail if stale (runs in CI and in pnpm verify)
```

Retyping twenty taglines into a hub page is how a shop window ends up advertising a product that
renamed itself two months ago.

## Links

`lib/links.ts` builds every outbound URL from the slug, so nothing is hardcoded:

| Variable | Effect |
|---|---|
| `NEXT_PUBLIC_PRODUCT_DOMAIN_BASE` | Repoints **all twenty** at once — a staging apex, or local hosts |
| `NEXT_PUBLIC_PRODUCT_URL_<SLUG>` | Overrides one product. Needed mid-launch when nine are on the real domain and the tenth is still on a preview URL |
| `NEXT_PUBLIC_SITE_URL` | This site's own origin, for canonical tags and Open Graph |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Footer and enterprise CTA |

## Develop

```bash
pnpm install        # from the repo root
pnpm dev            # from this folder → http://localhost:3000
```

## Verify

```bash
pnpm --filter @abetworks/site typecheck
pnpm --filter @abetworks/site test     # 10 tests, all about link correctness
pnpm --filter @abetworks/site build
```

The tests exist because the hub's only real failure mode is a wrong or broken link: they assert every
URL is absolute HTTPS on the expected subdomain, that overrides win and strip trailing slashes, that
accents and slugs are unique, that taglines fit a card, and that nothing in `platform` claims to be
shipped when it is still in build.

## Deploy

Vercel project with **Root Directory** `site`, domain `abetworks.in` plus `www` redirecting to it.
Static — it prerenders to a single HTML page, so it costs nothing to serve.
