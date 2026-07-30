#!/usr/bin/env node
/**
 * Generates per-app README.md and LAUNCH.md, plus the root README and the
 * portfolio table, from scripts/catalog.json.
 *
 * The catalog is the single source of launch-facing copy so the twenty products
 * never drift apart in how they describe themselves.
 *
 *   node scripts/gen-docs.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(readFileSync(join(root, "scripts/catalog.json"), "utf8"));
const { suite, products } = catalog;

function appReadme(p) {
  const envKey = `${p.slug.toUpperCase()}_KEY`;
  return `# ${p.name}

**${p.tagline}**

${p.job} One job, four surfaces: a marketing site, a working app, a REST endpoint and an MCP server.

- **Category** — ${p.category}
- **Built for** — ${p.audience}
- **Pricing** — ${p.price}
- **Accent** — \`${p.accent}\`

## Why it exists

${p.differentiator}

## How the engine works

${p.engine}

It is deterministic. The same input always produces the same output, there is no model in the request path, and a call costs nothing to serve. That is a design decision, not a limitation — it is what makes the result defensible in a review and cheap enough to run on every record.

## Run it locally

\`\`\`bash
pnpm install          # from the repo root, once
pnpm dev              # from this folder
\`\`\`

Then open <http://localhost:3000> for the marketing site and <http://localhost:3000/app> for the working product.

## REST API

The endpoint describes itself, so you never have to guess at the schema:

\`\`\`bash
curl https://${p.slug}.abetworks.in/api/v1/run
\`\`\`

That returns the input schema and a complete working example. To run it:

\`\`\`bash
curl -X POST https://${p.slug}.abetworks.in/api/v1/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $${envKey}" \\
  -d @payload.json
\`\`\`

Responses are \`{ ok: true, data: RunResult }\` or \`{ ok: false, error: string }\`. \`data.json\` is the machine-readable payload; the other fields drive the UI.

| Route | Method | Purpose |
|---|---|---|
| \`/api/v1/run\` | GET | Input schema, example payload and MCP tool metadata |
| \`/api/v1/run\` | POST | Run the engine |
| \`/api/health\` | GET | Liveness, version and whether auth is enabled |

Auth is off when \`API_KEYS\` is unset — which is what you want for a launch-day demo. Set it before you charge.

## MCP server

\`\`\`json
{
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
}
\`\`\`

Exposes one tool, \`${p.mcpTool}\`. The tool schema is fetched from \`GET /api/v1/run\` at startup, so the agent-facing contract can never drift from the REST contract.

## Deploy

**Vercel** — set the root directory to \`apps/${p.dir}\`, framework Next.js. Nothing else to configure.

**Docker**

\`\`\`bash
docker build -t ${p.slug} .
docker run -p 3000:3000 -e API_KEYS=your_key ${p.slug}
\`\`\`

## Environment

| Variable | Default | Purpose |
|---|---|---|
| \`NEXT_PUBLIC_SITE_URL\` | \`http://localhost:3000\` | Canonical and Open Graph URLs |
| \`API_KEYS\` | _(empty)_ | Comma-separated keys. Empty means the API is open |
| \`RATE_LIMIT_PER_MIN\` | \`60\` | Per key or per IP. \`0\` disables the limiter |

## Files that matter

\`\`\`
lib/product.ts   all landing copy, pricing, FAQ, input schema and the example payload
lib/engine.ts    the entire product — run(input) => RunResult
lib/api.ts       auth, rate limiting, input validation
mcp/server.mjs   MCP stdio bridge, zero dependencies
\`\`\`

To change what this product says, edit \`lib/product.ts\`. To change what it does, edit \`lib/engine.ts\`. Nothing else needs touching.

---

Part of the [${suite.name}](../../README.md) by [${suite.company}](${suite.site}).
`;
}

function appLaunch(p) {
  return `# ${p.name} — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (\`${p.slug}.abetworks.in\`)
- [ ] \`NEXT_PUBLIC_SITE_URL\` set to that domain so Open Graph tags resolve
- [ ] \`/app\` loads and the **Load example** button produces a result in one click
- [ ] \`/api/health\` returns \`ok: true\`
- [ ] \`GET /api/v1/run\` returns the schema and example
- [ ] Tested on a phone — the demo is the pitch, and most launch traffic is mobile
- [ ] \`API_KEYS\` left **unset** for launch day, so nobody hits an auth wall
- [ ] \`RATE_LIMIT_PER_MIN\` raised to at least 120 for the traffic spike
- [ ] Five gallery images exported at 1270×760
- [ ] Someone available to answer comments for the first six hours

## Product Hunt

**Name** — ${p.name}

**Tagline** (60 char limit)

> ${p.phTagline}

**Description**

> ${p.tagline}. ${p.job} ${p.differentiator}

**Topics** — ${p.category}, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> ${p.phFirstComment.split("\n").join("\n> ")}

## Gallery — five images

${p.phGallery.map((g, i) => `${i + 1}. ${g}`).join("\n")}

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: ${p.name} – ${p.phTagline.toLowerCase()}

**Comment** — lead with the technical decision, not the benefit

> ${p.engine}
>
> ${p.differentiator}
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> ${p.phTagline}

**Body** — no links in the body, offer the link in a comment

> ${p.job}
>
> ${p.differentiator}
>
> Built it because ${p.tagline.charAt(0).toLowerCase()}${p.tagline.slice(1)} is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> ${p.phTagline}.
>
> ${p.job}
>
> ${p.differentiator}
>
> Free, no signup: ${suite.site}

## Pricing at launch

${p.price}

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch \`/api/health\` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [${suite.name}](../../README.md) by [${suite.company}](${suite.site}).
`;
}

function rootReadme() {
  const rows = products
    .map(
      (p) =>
        `| [\`${p.dir}\`](apps/${p.dir}) | **${p.name}** | ${p.job} | ${p.category} | ${p.price} |`,
    )
    .join("\n");

  const toolRows = products
    .map((p) => `| ${p.name} | \`${p.mcpTool}\` | \`apps/${p.dir}/mcp/server.mjs\` |`)
    .join("\n");

  return `# Abet Works — Single-Feature SaaS Framework + Twenty Products

**A documented standard for building single-feature SaaS, plus twenty products built on it.**

- **[site/](./site)** — **abetworks.in**, the banner site. One page that puts every product one click
  away, with a products menu that links straight out to each one. Generated from the same catalog as
  everything else, so it cannot advertise stale copy.
- **[FRAMEWORK.md](./FRAMEWORK.md)** — the standard. Architecture, the nine rules, how to build a new
  product in six steps, the money path, testing and monitoring standards, the free-service stack, and
  the launch, security and operations checklists. **Read this first.**
- **[ROADMAP.md](./ROADMAP.md)** — the market research behind products 11–20. All ten are now built,
  each by writing only \`lib/product.ts\` and \`lib/engine.ts\` with no framework change.

Each product ships six surfaces, so it can be sold to humans, to backends and to agents:

1. a **marketing site** — hero, problem, features, pricing, FAQ
2. a **working product** at \`/app\` — no signup, no API key, no empty state
3. **accounts and billing** — signup, login, password reset, dashboard, Razorpay and Stripe checkout,
   metered quotas, API keys
4. a **REST API** at \`POST /api/v1/run\` that publishes its own schema
5. an **MCP server** so Claude, Cursor or [Agent Fleet](https://github.com/${suite.repo.split("/")[0]}/aw-agent-fleet) can use it as a tool
6. **monitoring** — \`/api/health\`, Prometheus \`/api/metrics\`, webhook alerts, a retention cron

Every product is independently deployable. Nothing is shared at runtime; everything is shared at
build time via \`_template/\`, enforced by \`pnpm sync:check\`.

### It runs with an empty \`.env\`

With no environment variables at all, every product boots and its demo works, metered by IP. Add
\`DATABASE_URL\` and it becomes the full product with accounts and billing. Add payment keys and it
takes money. Same build throughout — no flags, no separate demo deployment.

## The twenty

| Folder | Product | The one job it does | Category | Pricing |
|---|---|---|---|---|
${rows}

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

\`\`\`bash
pnpm install                        # installs all twenty plus the site
pnpm --filter @abetworks/dealbrief dev
\`\`\`

Or work in one app directly:

\`\`\`bash
cd apps/01-dealbrief && pnpm dev
\`\`\`

Verify everything:

\`\`\`bash
pnpm verify           # sync:check → gen:hub:check → typecheck → test → build → smoke
\`\`\`

Or step by step:

\`\`\`bash
pnpm sync             # propagate _template/ into all twenty, regenerate lib/schema.ts
pnpm sync:check       # fail if any product has drifted from the framework
pnpm run gen:hub      # regenerate the banner site's product catalog
pnpm typecheck        # tsc --noEmit across all twenty plus the site
pnpm test             # 42 unit tests per product, 10 for the site — 850 total
pnpm build            # production build across all twenty-one
pnpm smoke            # boots each app with NO env vars, asserts real output
pnpm run gen:docs     # regenerate this README and the per-app docs

# Full stack against a real Postgres — 55 checks
DATABASE_URL=postgres://… node scripts/db-apply.mjs --twice
DATABASE_URL=postgres://… node scripts/test-integration.mjs --app 01-dealbrief
\`\`\`

\`scripts/smoke.mjs\` is worth understanding: it reads each product's example payload from that product's own \`GET /api/v1/run\` schema endpoint and POSTs it back. So it verifies the documented contract and the real one agree, not just that the server starts.

## Repository layout

\`\`\`
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
\`\`\`

## Adding an eleventh product

The architecture exists to make this cheap. Two files:

\`\`\`bash
cp -r _template apps/11-yourproduct
cd apps/11-yourproduct
sed -i 's|@abetworks/PRODUCT_SLUG|@abetworks/yourproduct|; s|PRODUCT_DESCRIPTION|Your tagline|' package.json
\`\`\`

Then write \`lib/product.ts\` (copy, pricing, inputs, example) and \`lib/engine.ts\` (one function: \`run(input) => RunResult\`), and run:

\`\`\`bash
pnpm sync && pnpm install && pnpm verify
\`\`\`

Landing page, demo UI, auth, dashboard, billing, quotas, REST API, MCP server, monitoring, Docker
build and 42 tests all work without modification. The banner site picks it up from
\`scripts/catalog.json\` via \`pnpm run gen:hub\`.

**Full walkthrough with checklists: [FRAMEWORK.md § 4](./FRAMEWORK.md#4-build-a-new-product-in-six-steps).**

## MCP tools

| Product | Tool name | Server |
|---|---|---|
${toolRows}

Every server takes \`SFS_API_URL\` and optional \`SFS_API_KEY\`, and derives its tool schema from the live API.

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
Every variable is documented in \`_template/.env.example\`.

## Status

- **850/850** unit tests — 42 per product, 10 for the banner site
- **55/55** integration checks against a real PostgreSQL 15, verified on two different products
- **21/21** typecheck, **21/21** production build, **20/20** smoke with no environment variables
- Schema verified idempotent by applying it twice

Every engine has been run against real input. PingDeck and AnswerReady were verified against live third-party sites, including real TLS certificates and real RDAP registry responses.

Four framework bugs were found and fixed by these tests, each of which would have broken production:
a \`pgcrypto\` extension dependency many managed providers do not grant; a schema loaded via
\`readFileSync\` from a path that does not exist in a Vercel bundle; one shared rate-limit bucket
across all routes, so a login burst locked out password resets; and metrics reporting the database as
down whenever a table had not been created yet.

---

By [${suite.company}](${suite.site}).
`;
}

function portfolio() {
  return `# Portfolio

Positioning, moat and revenue model for each of the twenty products.

${products
  .map(
    (p, i) => `## ${String(i + 1).padStart(2, "0")}. ${p.name}

**${p.tagline}**

| | |
|---|---|
| Folder | [\`apps/${p.dir}\`](../apps/${p.dir}) |
| Category | ${p.category} |
| The one job | ${p.job} |
| Buyer | ${p.audience} |
| Pricing | ${p.price} |
| MCP tool | \`${p.mcpTool}\` |
| Suggested domain | \`${p.slug}.abetworks.in\` |

**Why it wins.** ${p.differentiator}

**How it works.** ${p.engine}

**Launch kit.** [\`apps/${p.dir}/LAUNCH.md\`](../apps/${p.dir}/LAUNCH.md)
`,
  )
  .join("\n---\n\n")}

---

## Revenue model summary

Three pricing shapes across the suite, matched to how each product actually gets used.

**Per-seat** (DealBrief) — used by named individuals every day, so seats align with value.

**Flat monthly** (everything else) — used by a team a few times a week, or a handful of times a month. Flat pricing removes the friction of counting, and for the compliance products it matches how the buyer thinks: the cost of the tool against the cost of the deadline.

**Usage-based** (PromptShield, and InvoiceParse and eInvoiceGuard at volume) — these sit in a request path, where volume is the only sensible unit.

**Deadline-priced** (AIActNotice, A11yGate, PolicyPack) — priced against what the alternative costs, not against usage. A lawyer reading your AI system description is ₹15,000 an hour; an accessibility audit is a four-figure engagement; a SOC 2 readiness project is several lakh. These are the only three tiers in the suite above ₹2,000, and that is why.

**Monthly-recurring-by-nature** (GSTMatch, PaySlipIN) — run every filing or payroll cycle without anyone deciding to. Cheapest tiers in the suite and the best retention, because the alternative is a spreadsheet somebody has to maintain.

Every product has a genuinely useful free tier. That is deliberate: with twenty products the cheapest possible distribution is a working demo that needs no signup, and a crippled demo wastes the launch it took to earn the traffic.

---

By [${catalog.suite.company}](${catalog.suite.site}).
`;
}

// ---------------------------------------------------------------------------

let written = 0;
for (const p of products) {
  writeFileSync(join(root, "apps", p.dir, "README.md"), appReadme(p));
  writeFileSync(join(root, "apps", p.dir, "LAUNCH.md"), appLaunch(p));
  written += 2;
}
writeFileSync(join(root, "README.md"), rootReadme());
writeFileSync(join(root, "docs/PORTFOLIO.md"), portfolio());
written += 2;

console.log(`Generated ${written} files for ${products.length} products.`);
