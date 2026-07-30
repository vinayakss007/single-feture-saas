# Abet Works — Single-Feature SaaS Suite

Ten enterprise-ready SaaS products. Each does **exactly one job**, and each ships with four surfaces so it can be sold to humans, to backends and to agents:

1. a **marketing site** — hero, problem, features, pricing, FAQ
2. a **working product** at `/app` — no signup, no API key, no empty state
3. a **REST API** at `POST /api/v1/run` that publishes its own schema
4. an **MCP server** so Claude, Cursor or [Agent Fleet](https://github.com/vinayakss007/aw-agent-fleet) can use it as a tool

Every product is independently deployable. Nothing is shared at runtime.

## The ten

| Folder | Product | The one job it does | Category | Pricing |
|---|---|---|---|---|
| [`01-dealbrief`](apps/01-dealbrief) | **DealBrief** | Sales call transcript in, qualified deal brief out. | Revenue operations | Free · $29/user/mo · usage from $0.04/brief |
| [`02-churnsignal`](apps/02-churnsignal) | **ChurnSignal** | Account CSV in, ranked churn risk with reason codes out. | Customer success | Free · $49/mo · Enterprise custom |
| [`03-pricepulse`](apps/03-pricepulse) | **PricePulse** | Two pricing page snapshots in, classified commercial diff out. | Competitive intelligence | Free · $39/mo · Enterprise custom |
| [`04-consentscan`](apps/04-consentscan) | **ConsentScan** | URL in, prioritised DPDP and GDPR finding list out. | Privacy compliance | Free · $59/mo · Enterprise custom |
| [`05-invoiceparse`](apps/05-invoiceparse) | **InvoiceParse** | Invoice text in, validated structured data and ledger CSV out. | Finance automation | Free · $39/mo · $0.01/invoice at volume |
| [`06-coldangle`](apps/06-coldangle) | **ColdAngle** | Public research text in, grounded openers and a deliverability audit out. | Outbound sales | Free · $29/mo · Agency custom |
| [`07-repurpose10`](apps/07-repurpose10) | **Repurpose10** | One long-form piece in, eleven platform-native outputs out. | Content marketing | Free · $29/mo · Agency custom |
| [`08-pingdeck`](apps/08-pingdeck) | **PingDeck** | URLs in, availability plus certificate and domain expiry out. | Monitoring | Free · $19/mo · $79/mo agency |
| [`09-answerready`](apps/09-answerready) | **AnswerReady** | URL in, AI answer-engine readiness score and the two missing files out. | AI search optimisation | Free · $39/mo · Agency custom |
| [`10-promptshield`](apps/10-promptshield) | **PromptShield** | Untrusted text in, verdict plus redacted text out. | AI security | Free 1k/mo · $0.20/1k calls · self-hosted custom |

## Why these ten

Three groups, chosen deliberately.

**Defensible by correctness** — ConsentScan, InvoiceParse and PromptShield encode regulation and checksums. The India DPDP Act, the GSTIN mod-36 check digit, Luhn and Verhoeff validation, GDPR articles. This is knowledge work that does not get cloned by a prompt.

**Proven willingness to pay** — DealBrief, ChurnSignal, PricePulse and Repurpose10 sit in the four categories that already sustain $19–99/month products: meeting intelligence, churn, competitor tracking and content repurposing.

**Cheap to run and fast to launch** — ColdAngle, PingDeck and AnswerReady have near-zero marginal cost and an obvious launch narrative.

All ten feed the existing Abet Works stack: DealBrief and ColdAngle write into NuCRM, every product can be scheduled by FlowForge, and all ten are MCP tools for Agent Fleet.

## The one design decision that matters

**No LLM in the request path.** Every engine is deterministic.

That is not a limitation, it is the product. It means:

- the same input always produces the same output, so a result can be defended in a pipeline review or an audit
- a call costs nothing to serve, so it can run on every record rather than on a sample
- latency is single-digit milliseconds
- nothing is ever invented — ColdAngle cannot praise a post that does not exist, and PromptShield cannot be talked out of its own verdict

Where a model genuinely helps, it belongs on top as optional polish, never underneath as the logic.

## Quick start

```bash
pnpm install                        # installs all ten
pnpm --filter @abetworks/dealbrief dev
```

Or work in one app directly:

```bash
cd apps/01-dealbrief && pnpm dev
```

Verify everything:

```bash
pnpm typecheck        # tsc --noEmit across all ten
pnpm build            # production build across all ten
node scripts/smoke.mjs # boots each app, runs its own example, asserts real output
```

`scripts/smoke.mjs` is worth understanding: it reads each product's example payload from that product's own `GET /api/v1/run` schema endpoint and POSTs it back. So it verifies the documented contract and the real one agree, not just that the server starts.

## Repository layout

```
apps/                 ten independently deployable Next.js apps
  01-dealbrief/
    lib/product.ts    all copy, pricing, FAQ, input schema, example payload
    lib/engine.ts     the entire product: run(input) => RunResult
    lib/api.ts        auth, rate limiting, validation
    lib/types.ts      shared contracts
    app/page.tsx      landing page, driven entirely by product.ts
    app/app/page.tsx  the working demo
    app/api/          REST endpoints
    components/       landing sections, input runner, result renderer
    mcp/server.mjs    MCP stdio bridge, zero dependencies
    Dockerfile        multi-stage, standalone output, healthcheck
    LAUNCH.md         Product Hunt / HN / Reddit kit
  02-churnsignal/ … 10-promptshield/
_template/            canonical shared kit — copy this to add an eleventh
docs/                 deploy guide, portfolio, launch playbook
scripts/              catalog, doc generator, smoke tests
```

## Adding an eleventh product

The architecture exists to make this cheap. Two files:

```bash
cp -r _template apps/11-yourproduct
cd apps/11-yourproduct
sed -i 's|@abetworks/PRODUCT_SLUG|@abetworks/yourproduct|; s|PRODUCT_DESCRIPTION|Your tagline|' package.json
```

Then write `lib/product.ts` (copy, pricing, inputs, example) and `lib/engine.ts` (one function: `run(input) => RunResult`). The landing page, demo UI, REST API, MCP server, Docker build and result renderer all work without modification.

## MCP tools

| Product | Tool name | Server |
|---|---|---|
| DealBrief | `dealbrief_analyze_call` | `apps/01-dealbrief/mcp/server.mjs` |
| ChurnSignal | `churnsignal_score_accounts` | `apps/02-churnsignal/mcp/server.mjs` |
| PricePulse | `pricepulse_diff_pricing` | `apps/03-pricepulse/mcp/server.mjs` |
| ConsentScan | `consentscan_audit_site` | `apps/04-consentscan/mcp/server.mjs` |
| InvoiceParse | `invoiceparse_extract_and_validate` | `apps/05-invoiceparse/mcp/server.mjs` |
| ColdAngle | `coldangle_write_opener` | `apps/06-coldangle/mcp/server.mjs` |
| Repurpose10 | `repurpose10_fan_out` | `apps/07-repurpose10/mcp/server.mjs` |
| PingDeck | `pingdeck_check_endpoints` | `apps/08-pingdeck/mcp/server.mjs` |
| AnswerReady | `answerready_audit_page` | `apps/09-answerready/mcp/server.mjs` |
| PromptShield | `promptshield_scan_text` | `apps/10-promptshield/mcp/server.mjs` |

Every server takes `SFS_API_URL` and optional `SFS_API_KEY`, and derives its tool schema from the live API.

## Docs

- [docs/DEPLOY.md](docs/DEPLOY.md) — Vercel, Docker, domains, env vars, going from free to paid
- [docs/PORTFOLIO.md](docs/PORTFOLIO.md) — the full portfolio with positioning and revenue model per product
- [docs/LAUNCH-PLAYBOOK.md](docs/LAUNCH-PLAYBOOK.md) — sequencing all ten launches without burning the audience

## Status

All ten: `tsc --noEmit` clean, `next build` clean, and passing `scripts/smoke.mjs` end to end — server boots, landing page and demo render, engine returns real output.

Every engine has been run against real input. PingDeck and AnswerReady were verified against live third-party sites, including real TLS certificates and real RDAP registry responses.

---

By [Abet Works](https://abetworks.in).
