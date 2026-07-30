# Abet Works — Single-Feature SaaS Framework + Twenty Products

**A documented standard for building single-feature SaaS, plus twenty products built on it.**

- **[site/](./site)** — **abetworks.in**, the banner site. One page that puts every product one click
  away, with a products menu that links straight out to each one. Generated from the same catalog as
  everything else, so it cannot advertise stale copy.
- **[FRAMEWORK.md](./FRAMEWORK.md)** — the standard. Architecture, the nine rules, how to build a new
  product in six steps, the money path, testing and monitoring standards, the free-service stack, and
  the launch, security and operations checklists. **Read this first.**
- **[ROADMAP.md](./ROADMAP.md)** — the market research behind products 11–20. All ten are now built,
  each by writing only `lib/product.ts` and `lib/engine.ts` with no framework change.

Each product ships six surfaces, so it can be sold to humans, to backends and to agents:

1. a **marketing site** — hero, problem, features, pricing, FAQ
2. a **working product** at `/app` — no signup, no API key, no empty state
3. **accounts and billing** — signup, login, password reset, dashboard, Razorpay and Stripe checkout,
   metered quotas, API keys
4. a **REST API** at `POST /api/v1/run` that publishes its own schema
5. an **MCP server** so Claude, Cursor or [Agent Fleet](https://github.com/vinayakss007/aw-agent-fleet) can use it as a tool
6. **monitoring** — `/api/health`, Prometheus `/api/metrics`, webhook alerts, a retention cron

Every product is independently deployable. Nothing is shared at runtime; everything is shared at
build time via `_template/`, enforced by `pnpm sync:check`.

### It runs with an empty `.env`

With no environment variables at all, every product boots and its demo works, metered by IP. Add
`DATABASE_URL` and it becomes the full product with accounts and billing. Add payment keys and it
takes money. Same build throughout — no flags, no separate demo deployment.

## The twenty

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
| [`11-aiactnotice`](apps/11-aiactnotice) | **AIActNotice** | AI system description in, risk tier and Article 50 notice out. | AI governance | Free · ₹2,499/mo · Enterprise custom |
| [`12-a11ygate`](apps/12-a11ygate) | **A11yGate** | HTML in, WCAG failures with fixes and a publishable accessibility statement out. | Accessibility compliance | Free · ₹1,999/mo · Agency custom |
| [`13-gstmatch`](apps/13-gstmatch) | **GSTMatch** | Two CSVs in, input tax credit at risk in rupees out. | Tax compliance | Free · ₹1,499/mo · Enterprise custom |
| [`14-einvoiceguard`](apps/14-einvoiceguard) | **eInvoiceGuard** | Invoice payload in, portal error codes and a corrected payload out. | Finance automation | Free · ₹1,999/mo · Platform custom |
| [`15-subaudit`](apps/15-subaudit) | **SubAudit** | Statement CSV in, subscription map with duplicates and renewals out. | Finance operations | Free · ₹1,499/mo · Enterprise custom |
| [`16-policypack`](apps/16-policypack) | **PolicyPack** | Company profile in, policy set with control mapping and gap list out. | Security compliance | Free · ₹2,499/mo · Enterprise custom |
| [`17-vendortrace`](apps/17-vendortrace) | **VendorTrace** | Vendor list in, Article 30 register and subprocessor page out. | Privacy compliance | Free · ₹1,999/mo · Enterprise custom |
| [`18-payslipin`](apps/18-payslipin) | **PaySlipIN** | Annual CTC in, full payslip with PF, ESI, PT and TDS out. | Payroll compliance | Free · ₹999/mo · Practice custom |
| [`19-dmarcfix`](apps/19-dmarcfix) | **DMARCFix** | Email auth records in, lookup count, failures and corrected records out. | Email deliverability | Free · ₹1,499/mo · Agency custom |
| [`20-contractclock`](apps/20-contractclock) | **ContractClock** | Contract text in, deadlines and a calendar file out. | Contract operations | Free · ₹1,999/mo · Enterprise custom |
| [`21-medibillcheck`](apps/21-medibillcheck) | **MediBillCheck** | Itemised hospital bill in, questionable charges and a query letter out. | Health finance | Free · ₹999/mo · Claims custom |
| [`22-labtrack`](apps/22-labtrack) | **LabTrack** | Lab report values in, range flags and trends across reports out. | Health records | Free · ₹499/mo · Clinic custom |
| [`23-vaxdue`](apps/23-vaxdue) | **VaxDue** | Date of birth and doses given in, overdue and upcoming schedule out. | Child health | Free · ₹299/mo · Clinic custom |
| [`24-loantruth`](apps/24-loantruth) | **LoanTruth** | Sanction letter terms in, true APR and amortisation out. | Personal finance | Free · ₹499/mo · Broker custom |
| [`25-tripsplit`](apps/25-tripsplit) | **TripSplit** | Shared expenses in, minimal set of transfers out. | Travel money | Free · ₹299/mo · Teams custom |

## Why these twenty

Five groups. The first ten were chosen on category strength; the second ten came from market research in July 2026, written up in [ROADMAP.md](./ROADMAP.md).

**Regulatory deadline** — AIActNotice, A11yGate, PolicyPack and VendorTrace. People pay for deadlines. EU AI Act Article 50 applies from 2 August 2026, the European Accessibility Act has been enforceable since June 2025, and subprocessor disclosure is now a standard questionnaire item. Existing tooling in these categories is priced for companies running a whole governance programme, which leaves a large gap underneath it.

**Indian finance and payroll** — GSTMatch, eInvoiceGuard, PaySlipIN and InvoiceParse. Monthly, unavoidable, and every alternative is an ERP integration. Best retention in the suite because they run every filing or payroll cycle without anyone deciding to.

**Defensible by correctness** — ConsentScan and PromptShield encode regulation and checksums: the DPDP Act, the GSTIN mod-36 check digit, Luhn and Verhoeff validation, GDPR articles. Knowledge work that does not get cloned by a prompt.

**Proven willingness to pay** — DealBrief, ChurnSignal, PricePulse and Repurpose10 sit in four categories that already sustain $19–99/month products: meeting intelligence, churn, competitor tracking and content repurposing.

**Finds money or time on the first run** — SubAudit, ContractClock, DMARCFix, ColdAngle, PingDeck and AnswerReady. Near-zero marginal cost and a demo that produces a number the visitor did not know: recoverable spend, a cancellation deadline already missed, an SPF record silently failing.

All twenty feed the existing Abet Works stack: DealBrief and ColdAngle write into NuCRM, every product can be scheduled by FlowForge, and all twenty are MCP tools for Agent Fleet.

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
pnpm install                        # installs all twenty plus the site
pnpm --filter @abetworks/dealbrief dev
```

Or work in one app directly:

```bash
cd apps/01-dealbrief && pnpm dev
```

Verify everything:

```bash
pnpm verify           # sync:check → gen:hub:check → typecheck → test → build → smoke → mcp
```

Or step by step:

```bash
pnpm sync             # propagate _template/ into all twenty, regenerate lib/schema.ts
pnpm sync:check       # fail if any product has drifted from the framework
pnpm run gen:hub      # regenerate the banner site's product catalog
pnpm typecheck        # tsc --noEmit across all twenty plus the site
pnpm test             # 42 unit tests per product, 10 for the site — 850 total
pnpm build            # production build across all twenty-one
pnpm smoke            # boots each app with NO env vars, asserts real output
pnpm run mcp          # real JSON-RPC over stdio against all 20 MCP servers
pnpm run gen:docs     # regenerate this README and the per-app docs

# Full stack against a real Postgres — 55 checks
DATABASE_URL=postgres://… node scripts/db-apply.mjs --twice
DATABASE_URL=postgres://… node scripts/test-integration.mjs --app 01-dealbrief
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
site/                 abetworks.in — the banner site, deployed at the apex
_template/            THE FRAMEWORK — 55 shared files, the single source of truth
  lib/                16 modules: auth, db, payments, plans, usage, observability, …
  db/schema.sql       one schema shared by all products, idempotent
  tests/              42 tests every product must pass
FRAMEWORK.md          the standard: rules, architecture, checklists, free services
ROADMAP.md            the research behind products 11-20
docs/                 deploy guide, portfolio, launch playbook
scripts/
  sync-template.mjs   propagates _template/ into every app; --check for CI
  test-integration.mjs 55 end-to-end checks against a real Postgres
  db-apply.mjs        apply the schema; --twice proves idempotency
  smoke.mjs           boots every app with no env
  gen-hub-catalog.mjs generates the banner site's catalog; --check for CI
  gen-docs.mjs        regenerates this README and the per-app docs
```

## Adding an eleventh product

The architecture exists to make this cheap. Two files:

```bash
cp -r _template apps/11-yourproduct
cd apps/11-yourproduct
sed -i 's|@abetworks/PRODUCT_SLUG|@abetworks/yourproduct|; s|PRODUCT_DESCRIPTION|Your tagline|' package.json
```

Then write `lib/product.ts` (copy, pricing, inputs, example) and `lib/engine.ts` (one function: `run(input) => RunResult`), and run:

```bash
pnpm sync && pnpm install && pnpm verify
```

Landing page, demo UI, auth, dashboard, billing, quotas, REST API, MCP server, monitoring, Docker
build and 42 tests all work without modification. The banner site picks it up from
`scripts/catalog.json` via `pnpm run gen:hub`.

**Full walkthrough with checklists: [FRAMEWORK.md § 4](./FRAMEWORK.md#4-build-a-new-product-in-six-steps).**

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
| AIActNotice | `aiactnotice_classify_system` | `apps/11-aiactnotice/mcp/server.mjs` |
| A11yGate | `a11ygate_audit_html` | `apps/12-a11ygate/mcp/server.mjs` |
| GSTMatch | `gstmatch_reconcile_2b` | `apps/13-gstmatch/mcp/server.mjs` |
| eInvoiceGuard | `einvoiceguard_validate_payload` | `apps/14-einvoiceguard/mcp/server.mjs` |
| SubAudit | `subaudit_find_subscriptions` | `apps/15-subaudit/mcp/server.mjs` |
| PolicyPack | `policypack_generate_policies` | `apps/16-policypack/mcp/server.mjs` |
| VendorTrace | `vendortrace_build_register` | `apps/17-vendortrace/mcp/server.mjs` |
| PaySlipIN | `payslipin_compute_payslip` | `apps/18-payslipin/mcp/server.mjs` |
| DMARCFix | `dmarcfix_audit_records` | `apps/19-dmarcfix/mcp/server.mjs` |
| ContractClock | `contractclock_extract_deadlines` | `apps/20-contractclock/mcp/server.mjs` |
| MediBillCheck | `medibillcheck_audit_bill` | `apps/21-medibillcheck/mcp/server.mjs` |
| LabTrack | `labtrack_check_values` | `apps/22-labtrack/mcp/server.mjs` |
| VaxDue | `vaxdue_check_schedule` | `apps/23-vaxdue/mcp/server.mjs` |
| LoanTruth | `loantruth_analyse_loan` | `apps/24-loantruth/mcp/server.mjs` |
| TripSplit | `tripsplit_settle_expenses` | `apps/25-tripsplit/mcp/server.mjs` |

Every server takes `SFS_API_URL` and optional `SFS_API_KEY`, and derives its tool schema from the live API.

## Docs

- [docs/DEPLOY.md](docs/DEPLOY.md) — Vercel, Docker, domains, env vars, going from free to paid
- [docs/PORTFOLIO.md](docs/PORTFOLIO.md) — the full portfolio with positioning and revenue model per product
- [docs/LAUNCH-PLAYBOOK.md](docs/LAUNCH-PLAYBOOK.md) — sequencing twenty launches without burning the audience

## What you need to deploy

Nothing, to run the demos. To take money, four things — all free to start:

| | Service | Free tier |
|---|---|---|
| Hosting | Vercel | Hobby (Pro at $20/mo once commercial) |
| Postgres | Neon | 0.5 GB, scale-to-zero |
| Payments | Razorpay (India) or Stripe | No monthly fee |
| Email | Resend | 3,000/month |

Full table including monitoring, uptime and analytics:
[FRAMEWORK.md § 8](./FRAMEWORK.md#8-free-services-the-whole-stack-at-0month).
Every variable is documented in `_template/.env.example`.

## Status

- **850/850** unit tests — 42 per product, 10 for the banner site
- **160/160** MCP protocol checks — real JSON-RPC over stdio, 8 per product
- **55/55** integration checks against a real PostgreSQL 15, verified on three different products
- **21/21** typecheck, **21/21** production build, **20/20** smoke with no environment variables
- Schema verified idempotent by applying it twice

Every engine has been run against real input. PingDeck and AnswerReady were verified against live third-party sites, including real TLS certificates and real RDAP registry responses.

Four framework bugs were found and fixed by these tests, each of which would have broken production:
a `pgcrypto` extension dependency many managed providers do not grant; a schema loaded via
`readFileSync` from a path that does not exist in a Vercel bundle; one shared rate-limit bucket
across all routes, so a login burst locked out password resets; and metrics reporting the database as
down whenever a table had not been created yet.

---

By [Abet Works](https://abetworks.in).
