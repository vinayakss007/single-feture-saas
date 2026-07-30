# The Abet Works Single-Feature SaaS Framework

**This is the standard.** Every single-feature SaaS we build goes on these rails. It exists so that
launching product number eleven is a two-day job instead of a two-month one, and so that all eleven
have the same login, the same billing, the same metering and the same alerting.

The framework is not a document describing an intention. It is `_template/`, and it is enforced:
`pnpm sync:check` fails CI if any product has drifted from it.

- **What you write for a new product:** two files, about 300 lines total.
- **What you get for free:** landing page, live demo, accounts, billing in INR and USD, metered
  quotas, API keys, a REST API, an MCP server, Prometheus metrics, alerting, a retention job,
  Docker, and 42 tests that must pass before it ships.
- **What it costs to run:** ₹0/month until you have paying customers. See
  [Free services](#8-free-services-the-whole-stack-at-0month).

---

## Table of contents

1. [The rules](#1-the-rules)
2. [Architecture](#2-architecture)
3. [What is in the framework](#3-what-is-in-the-framework)
4. [Build a new product in six steps](#4-build-a-new-product-in-six-steps)
5. [The money path](#5-the-money-path)
6. [Testing standard](#6-testing-standard)
7. [Monitoring standard](#7-monitoring-standard)
8. [Free services: the whole stack at ₹0/month](#8-free-services-the-whole-stack-at-0month)
9. [Launch checklist](#9-launch-checklist)
10. [Operations runbook](#10-operations-runbook)
11. [Security checklist](#11-security-checklist)
12. [Adding a capability to the framework](#12-adding-a-capability-to-the-framework)

---

## 1. The rules

Nine rules. Each one is enforced by a test, a script, or the type system — not by good intentions.

| # | Rule | Why | Enforced by |
|---|------|-----|-------------|
| 1 | **One feature.** If you cannot describe it in one sentence with no "and", it is two products. | Single-feature products are explainable in a tweet, buildable in days, and have no roadmap debt. | `product.test.ts` requires a `tagline` under 70 chars |
| 2 | **The engine is deterministic.** Same input, same output. No LLM and no clock in the request path. | Reproducible, cacheable, zero marginal cost, and cannot be prompt-injected. A customer who gets a different answer on a re-run stops trusting the product. | `product.test.ts` → "the engine is deterministic". Opt out only with `probesNetwork: true` |
| 3 | **It runs with an empty `.env`.** No database, no keys, nothing. | The Product Hunt demo and the paid product are the same build. Nobody has to set up Postgres to try it. | `scripts/smoke.mjs` runs every app with no env |
| 4 | **Money is real from day one.** Checkout, webhooks, quota enforcement and dunning ship with v1. | Bolting billing on later means retrofitting it through auth, metering and the UI at once. | `scripts/test-integration.mjs` → 15 billing and quota checks |
| 5 | **Every request is attributed and metered.** API key, session, or IP. No exceptions. | You cannot price what you cannot count, and you cannot answer a billing dispute from logs you did not keep. | `recordUsage()` in `/api/v1/run`; integration test asserts the row |
| 6 | **Secrets are hashed at rest.** Passwords, session tokens, API keys, reset tokens. | A database dump must not be a set of live credentials. | Integration test asserts the raw value is absent from the row |
| 7 | **Shared code lives in `_template/` only.** Never fix a bug in one app. | Ten copies of an auth bug is ten incidents. | `pnpm sync:check` |
| 8 | **Zero runtime dependencies beyond Next, React and `pg`.** | Payments, auth, email and metrics are all a few HTTPS calls. Every dependency in the auth or payment path is one you must keep patched forever. | `package.json` is reconciled by `scripts/sync-template.mjs` |
| 9 | **An error tells the user what to do next.** | "Internal error" generates a support ticket; "Upgrade from your dashboard, or wait for the reset on 1 August" does not. | Code review, plus tests asserting on error text |

### The one exception, and how exceptions work

`08-pingdeck` measures live URLs, so its output genuinely cannot be deterministic. It declares
`probesNetwork: true` in `lib/product.ts`, which swaps the determinism test for a shape-stability
test. That is the pattern for every exception: **declare it in the config, document the reason, and
substitute a weaker test — never delete one.**

It remains the only exception across all twenty products. Products 11–20 were built after this rule
was written and none of them needed it — which is the evidence that the rule is workable rather than
merely aspirational.

---

## 2. Architecture

```
                              ┌──────────────────────────────────┐
   Browser ──────────────────▶│  Landing page      /             │
   (cookie session)           │  Live demo         /app          │
                              │  Auth              /login /signup│
                              │  Dashboard         /dashboard    │
                              └───────────────┬──────────────────┘
                                              │
   Agent / script ────────────▶┌──────────────▼──────────────────┐
   (Bearer sk_…)               │  POST /api/v1/run               │
                               │                                 │
   MCP client ────────────────▶│  1. resolveCaller()             │
   (stdio, mcp/server.mjs)     │  2. rateLimit()      burst      │
                               │  3. checkQuota()     billable   │
                               │  4. parseInput()     validate   │
                               │  5. run()            ENGINE     │
                               │  6. recordUsage()    meter      │
                               └──────────────┬──────────────────┘
                                              │
   Razorpay / Stripe ─────────▶ /api/billing/webhook              │
   Vercel Cron ──────────────▶ /api/cron/purge                    │
   Grafana Cloud ────────────▶ /api/metrics                       │
   UptimeRobot ─────────────▶ /api/health                         │
                                              │
                              ┌───────────────▼──────────────────┐
                              │  ONE Postgres for ALL products   │
                              │  users, sessions, api_keys,       │
                              │  subscriptions, usage_events,     │
                              │  webhook_events, password_resets  │
                              └──────────────────────────────────┘
```

### Three decisions worth understanding

**One database for all products.** Rows in product-scoped tables carry a `product` column. One
signup works across the whole suite, cross-sell costs nothing, and there is one database to operate
instead of ten. The cost is that a schema change touches every product at once — which is why
`db/schema.sql` is idempotent and applied under an advisory lock.

**Demo mode is a first-class configuration, not a fallback.** `dbAvailable()` is false when
`DATABASE_URL` is unset, and every module has a defined behaviour for that case: the product works,
metered by IP; accounts, keys and billing return a clear 503 explaining why. This is what makes rule
3 possible.

**The schema is compiled into the bundle.** `pnpm sync` generates `lib/schema.ts` from
`db/schema.sql`. It is not read from disk, because a Vercel route handler's working directory is not
the project root and unreferenced files are not bundled — `readFileSync("db/schema.sql")` works
locally and then fails in production, which is the worst possible split. This was a real bug caught
by the integration test.

### Request lifecycle, in order

| Step | Function | Failure |
|------|----------|---------|
| Identify caller | `resolveCaller()` — API key, then cookie, then IP | `401` invalid key |
| Burst limit | `rateLimit(caller, limit, scope)` — per process, per route | `429` + `Retry-After` |
| Quota | `checkQuota(caller)` — calendar month, from the database | `429` anonymous cap · `402` plan limit |
| Validate | `parseInput(body, product.inputs)` | `400` + which fields and why |
| Run | `run(input)` from `lib/engine.ts` | `422` + actionable message |
| Meter | `recordUsage(caller, {...})` | never fails the request |
| Observe | `instrument()` wraps the handler | `500` + alert |

**Status codes mean one thing each.** `429` = retry later, nothing to pay (includes the anonymous
daily cap, which resets tomorrow). `402` = the fix is money. Conflating them either nags free users
for payment they do not owe, or hides a real upgrade prompt.

---

## 3. What is in the framework

### `lib/` — 14 modules

| File | Responsibility | Notes |
|------|---------------|-------|
| `types.ts` | `ProductConfig`, `RunInput`, `RunResult`, `PricingTier` | The contract. Read this first. |
| `product.ts` | **You write this.** All copy, pricing, inputs, FAQ. | Owned per product |
| `engine.ts` | **You write this.** `run(input) → RunResult`. | Owned per product |
| `crypto.ts` | scrypt hashing, session tokens, constant-time compare | `node:crypto` only, so it is directly unit testable |
| `validate.ts` | Password/email rules, `parseInput` | Pure; no Next, no database |
| `auth.ts` | Sessions, signup, signin, password reset | Re-exports `crypto`/`validate` so callers have one import site |
| `db.ts` | Pool, `query`, `transaction`, `migrate`, `dbHealth` | Demo mode when `DATABASE_URL` is unset |
| `schema.ts` | **Generated** from `db/schema.sql` by `pnpm sync` | Do not edit |
| `plans.ts` | `PLANS`, entitlements, price-id env names | Tested against `product.pricing` |
| `api-keys.ts` | `sk_<slug>_<48 hex>`, sha256 at rest | Prefix stored for display |
| `usage.ts` | `checkQuota`, `recordUsage`, `usageSummary` | Calendar-month windows |
| `payments.ts` | Razorpay + Stripe over raw REST | Signature verification, idempotency |
| `email.ts` | Resend over `fetch` | Logs the link when unconfigured, never silently drops it |
| `observability.ts` | Structured logs, counters, Prometheus, alerts | No SDK |
| `http.ts` | `originOf(req)` | Correct absolute URLs for redirects and email links |

### `app/` — routes you get for free

```
/                        landing page
/app                     live demo
/login  /signup          credentials
/forgot-password  /reset-password
/dashboard               usage bar, API keys, plan, upgrade

GET  /api/health         uptime probe; 503 only if a claimed dependency is broken
GET  /api/metrics        Prometheus text
GET  /api/v1/run         self-describing schema, for agents
POST /api/v1/run         the product
POST /api/auth/signup | login | logout | reset
GET  /api/keys           list          POST create      DELETE /api/keys/[id]
POST /api/billing/checkout | webhook | portal
GET  /api/cron/purge     retention, Bearer CRON_SECRET
```

### Everything else

`components/` (landing sections, demo runner, auth form, dashboard) · `mcp/server.mjs` (MCP over
stdio) · `db/schema.sql` · `middleware.ts` · `Dockerfile` · `vercel.json` with the cron ·
`tests/` (4 files, 42 tests) · `.env.example` documenting every variable.

---

## 4. Build a new product in six steps

Budget: **one to two days.** You write two files.

Products 11–20 were each built exactly this way. Nothing in `_template/` changed to accommodate any
of them, which is the only real test of whether this is a framework or just a folder of shared files.

### Step 1 — Scaffold

```bash
cp -r _template apps/11-yourproduct
cd apps/11-yourproduct
# package.json: set name to @abetworks/yourproduct and a one-line description
```

### Step 2 — Write `lib/product.ts`

This is the whole marketing site as data. The tests enforce a minimum: ≥2 problems, ≥3 features,
≥3 steps, ≥4 FAQs, ≥3 metrics, exactly 3 pricing tiers, ≥1 required input, and a sample that
satisfies your own schema.

```ts
export const product: ProductConfig = {
  slug: "yourproduct",
  name: "YourProduct",
  tagline: "One line, under 70 characters, no 'and'",
  oneLiner: "The single job this does, in one sentence.",
  accent: "#2563eb",
  accentSoft: "#eff6ff",

  problem: [...],   // what goes wrong today
  features: [...],  // what it does instead
  how: [...],       // three or four steps
  faq: [...],       // answer the objection, not the softball
  metrics: [...],

  pricing: [
    { name: "Free",       price: "₹0",     period: "forever",  monthlyRuns: 25,       apiAccess: false, rateLimitPerMin: 10,  ... },
    { name: "Pro",        price: "₹1,499", period: "/month",   monthlyRuns: 5000,     apiAccess: true,  rateLimitPerMin: 120, highlight: true, ... },
    { name: "Enterprise", price: "Custom", period: "",         monthlyRuns: Infinity, apiAccess: true,  rateLimitPerMin: 600, ... },
  ],

  inputs: [ { name: "text", label: "…", type: "textarea", required: true } ],
  sample: { text: "a realistic example, never lorem ipsum" },
  mcpTool: { name: "yourproduct_do_thing", description: "Specific enough that an agent picks it correctly." },
};
```

**Pricing must match `lib/plans.ts`.** `plans.test.ts` compares them and fails on drift, because a
paywall that disagrees with the landing page is the most expensive bug in the suite.

### Step 3 — Write `lib/engine.ts`

```ts
export async function run(input: RunInput): Promise<RunResult> { ... }
```

Rules: deterministic, no network, throw `Error` with an actionable message on bad input, and return
at least one of `sections`, `table`, `copyBlocks` or `metrics`.

The engine is where the product actually lives. Real logic — parsers, scorers, rule engines,
generators — not an LLM call. That is what makes the marginal cost of a run zero and the output
trustworthy.

### Step 4 — Wire it up

```bash
pnpm sync          # copies all 55 shared files in, regenerates lib/schema.ts
pnpm install
```

### Step 5 — Verify

```bash
pnpm --filter @abetworks/yourproduct typecheck
pnpm --filter @abetworks/yourproduct test        # 42 tests must pass
pnpm --filter @abetworks/yourproduct build
pnpm smoke                                        # boots with no env
DATABASE_URL=postgres://… node scripts/test-integration.mjs --app 11-yourproduct
```

### Step 6 — Ship

Write `README.md` and `LAUNCH.md` (Product Hunt copy, first-week plan), then work
[the launch checklist](#9-launch-checklist).

---

## 5. The money path

### Providers

**Razorpay is the default** — UPI, INR, Indian business entity, which is what abetworks.in
customers actually pay with. **Stripe covers everyone else.** Both are implemented over raw REST
with `node:crypto` HMAC. No SDKs: each is a couple of POSTs plus a signature check, and an SDK in
the payment path is a permanent patching obligation for no gain.

### Configuring a product for payment

```bash
# Razorpay: create a Subscription Plan per product, per tier
RAZORPAY_KEY_ID=…  RAZORPAY_KEY_SECRET=…  RAZORPAY_WEBHOOK_SECRET=…
RAZORPAY_PLAN_YOURPRODUCT_PRO=plan_xxx

# Stripe: create a recurring Price per product, per tier
STRIPE_SECRET_KEY=…  STRIPE_WEBHOOK_SECRET=…
STRIPE_PRICE_YOURPRODUCT_PRO=price_xxx
```

Env names are derived from the slug, so ten products share one project without collision.
`purchasablePlans()` returns `[]` until a price id exists, and the dashboard then says paid plans
are not configured instead of showing a button that 500s.

### Webhook discipline

`/api/billing/webhook` handles both providers on one URL and follows four rules, in order:

1. **Read the raw body.** Both providers sign exact bytes; parsing first makes the signature
   unverifiable.
2. **Verify before reading.** No decision is made on unverified content.
3. **Insert the event id first, stop if it exists.** Providers retry. A retry that re-applies a plan
   change is a real bug — `webhook_events` has a unique constraint and the integration test asserts
   a replay is a no-op.
4. **Answer 200 once the signature is valid**, even for events you ignore or fail to process.
   Failures are stored with their error for replay from the table. A 500 makes the provider retry
   forever and eventually disable the endpoint.

### Quotas

Calendar-month windows via `date_trunc('month', now())` — matches how invoices and customers think,
and indexes cleanly. Free 25 runs/month, Pro 5,000, Enterprise uncapped; anonymous 15/day per IP.

Refused requests are recorded with `units = 0`. The customer got nothing, so they are not billed,
but the attempt is still visible — which is how you discover someone has been hitting a wall for a
week without complaining.

---

## 6. Testing standard

Three layers. `node:test` and one integration script — no jest, no vitest, no mocking library.

### Layer 1 — Unit, per app: 42 tests, `pnpm test`

| File | Covers |
|------|--------|
| `crypto.test.ts` | Hash round-trip, salt uniqueness, self-describing parameters, **8 malformed-hash cases including absurd scrypt costs** (a poisoned row must not become a memory-exhaustion vector), token uniqueness over 500 draws |
| `validate.test.ts` | Password and email rules, `parseInput` — coercion, unknown keys ignored, over-length refused, non-object bodies |
| `plans.test.ts` | **Landing page price === paywall price**, quotas increase with price, free has no API access, unknown codes fall back to free, nothing is purchasable until a price id is set |
| `product.test.ts` | Config completeness, input schema well-formed, sample satisfies its own schema, engine returns a usable result, **engine is deterministic**, MCP description is specific |

Tests are TypeScript run under `node --experimental-strip-types`, and `tsc` typechecks them too, so
they are held to the same standard as the code.

### Layer 2 — Integration, real Postgres: 55 checks

```bash
DATABASE_URL=postgres://… node scripts/test-integration.mjs [--app 01-dealbrief]
```

Boots the real standalone server against a real database with a real cookie jar. Covers the paths
that only break when wired together:

- Schema self-application and idempotency; `purge_expired` survives re-application
- Signup, weak-password and invalid-email refusal, duplicate and case-insensitive collision
- **Passwords and session tokens are not in the database in plain text**
- Login, logout, **unknown email answers identically to a wrong password**, forged cookie rejected
- Metering: exactly one unit per successful run; **rejected requests are not billed**
- Quota exhaustion → 402; anonymous cap → 429; usage does not leak between products
- Bad webhook signature → 400; signed activation upgrades the plan; **replay is a no-op**
- API keys: created only on a paid plan, hashed at rest, work via both headers, revocation is
  immediate, **one user cannot revoke another user's key**
- Password reset: hashed token, single use, old password dies, **all other sessions are signed out**
- Burst limiting engages; **per-route buckets** (a real bug this caught: one shared IP bucket meant
  a login burst locked out password resets)
- Cron auth; security headers; **CORS open on `/api/v1/*` but not on auth, keys or billing**

### Layer 3 — Suite-wide

```bash
pnpm verify   # sync:check → gen:hub:check → typecheck → test → build → smoke
```

`pnpm smoke` boots every app with **no environment variables at all** and asserts the landing page,
demo, health endpoint and API respond — which is rule 3, enforced.

### The bar

A product ships when: `pnpm verify` is green, its integration run is green, and any new shared
behaviour has a test. **When a bug is found, the test comes first.** Four of the framework's current
tests exist because they caught something real — the pgcrypto dependency, the `readFileSync` schema
path, the shared rate-limit bucket, and metrics falsely reporting the database down.

---

## 7. Monitoring standard

In-process counters, Prometheus text, database-backed totals, webhook alerts. No SDK, no vendor
lock-in, free-tier friendly.

### `GET /api/health`

For UptimeRobot or Better Stack. Returns `503` **only** when a dependency the deployment claims to
have is broken — `DATABASE_URL` set but unreachable. A deployment with no database is *healthy*,
because demo mode is valid. Alerting on an intentionally database-less demo trains you to ignore the
page.

### `GET /api/metrics`

Prometheus text for Grafana Cloud. Optionally guarded by `METRICS_TOKEN`.

```
sfs_requests_total{route,status}    sfs_users_total
sfs_run_duration_ms_bucket{le}      sfs_paying_subscriptions
sfs_runs_total{outcome}             sfs_runs_month_total
sfs_database_up                     sfs_failed_requests_today
sfs_business_metrics_up
```

`database_up` is probed with `SELECT 1`, **separately** from the business query. Rolling them
together meant a table that did not exist yet reported the whole database as down — a false alarm,
and false alarms are how dashboards get ignored.

### Alerts

Set `ALERT_WEBHOOK_URL` to a Slack or Discord incoming webhook. The payload sends both `text` and
`content`, so one URL works for either. Deduplicated for ten minutes per cause. Fires on: a thrown
handler, a 5xx burst, and a webhook that failed to process.

### The four alerts worth having

| Alert | Condition | Why |
|-------|-----------|-----|
| Site down | `/api/health` fails twice in 5 min | Revenue is zero while it is down |
| Database down | `sfs_database_up == 0` for 2 min | Signups and billing are broken |
| Webhook failures | any `webhook:*` alert | **A customer has paid and not been upgraded** |
| Error rate | 5xx > 2% over 10 min | Something shipped broken |

Not worth alerting on: CPU, memory, individual 4xx. They page you without telling you to do
anything.

### Logs

`log(level, scope, message, fields)` emits one JSON line — greppable in `vercel logs`, parseable by
any log service, zero dependencies. `LOG_LEVEL` defaults to `info`. Never log a password, a raw
token, or a full API key.

### Retention

`/api/cron/purge`, daily at 03:00 via `vercel.json`, `Bearer CRON_SECRET`. Deletes expired sessions,
spent reset tokens, and processed webhooks over 30 days old. **Usage events are kept 400 days** —
far longer than everything else, because they are the evidence behind an invoice and a billing
dispute six months later has to be answerable. Without `CRON_SECRET` the route refuses to run rather
than exposing a destructive endpoint.

---

## 8. Free services: the whole stack at ₹0/month

Run all ten products on free tiers until you have paying customers. Every one of these is wired in
already; you add a key.

| Need | Service | Free tier | Notes |
|------|---------|-----------|-------|
| **Hosting** | [Vercel](https://vercel.com) | Hobby: 100 GB bandwidth, cron included | `vercel.json` is committed. Commercial use needs Pro ($20/mo) |
| Hosting (alt) | [Cloudflare Workers](https://workers.cloudflare.com) | 100k req/day | Cheaper at scale |
| Hosting (alt) | [Railway](https://railway.app) / [Fly.io](https://fly.io) | Trial credit | Use the `Dockerfile` |
| **Postgres** | [Neon](https://neon.tech) | 0.5 GB, scale-to-zero | **Recommended.** Use the *pooled* string |
| Postgres (alt) | [Supabase](https://supabase.com) | 500 MB | Auto-pauses after a week idle |
| **Payments (India)** | [Razorpay](https://razorpay.com) | No monthly fee; ~2% per txn | UPI, cards, netbanking. Default |
| **Payments (global)** | [Stripe](https://stripe.com) | No monthly fee; ~2.9% + 30¢ | Includes a hosted billing portal |
| **Email** | [Resend](https://resend.com) | 3,000/month, 100/day | Works without a domain via `onboarding@resend.dev` |
| Email (alt) | [Brevo](https://brevo.com) | 300/day | Higher daily cap |
| **Metrics** | [Grafana Cloud](https://grafana.com/products/cloud/) | 10k series, 14 days | Scrapes `/api/metrics` directly |
| **Uptime** | [UptimeRobot](https://uptimerobot.com) | 50 monitors, 5-min checks | Point at `/api/health` |
| Uptime (alt) | [Better Stack](https://betterstack.com) | 10 monitors, 30-second checks | Faster detection, free status page |
| **Errors** | [Sentry](https://sentry.io) | 5k errors/month | Optional — `ALERT_WEBHOOK_URL` covers the basics with no SDK |
| **Alerts** | Slack or Discord webhook | Free | One `ALERT_WEBHOOK_URL`, both formats |
| **DNS / CDN** | [Cloudflare](https://cloudflare.com) | Free plan | DNS, TLS, DDoS protection |
| **Analytics** | [Umami Cloud](https://umami.is) / [Plausible](https://plausible.io) | Umami: 10k events | Cookie-free, no consent banner needed |
| **CI** | GitHub Actions | 2,000 min/month on public repos | Run `pnpm verify` |
| **Status page** | Better Stack | Free | Or self-host with `08-pingdeck` |

**Realistic cost at launch: ₹0.** First real cost is Vercel Pro at $20/month, and only once you are
commercial. Neon and Resend free tiers comfortably cover the first hundred paying customers.

### Where the free tiers actually bite

- **Neon scale-to-zero** adds ~500 ms to the first request after idle. Fine for a demo; upgrade
  before a launch spike.
- **Resend 100/day** is enough for signups and resets, not for a newsletter.
- **Vercel Hobby forbids commercial use.** Move to Pro before charging.
- **Supabase pauses after 7 days idle** and needs a manual resume. Prefer Neon.

---

## 9. Launch checklist

### Code
- [ ] `pnpm verify` green (sync:check, typecheck, 42 tests/app, build, smoke)
- [ ] `node scripts/test-integration.mjs --app <app>` green against a real Postgres
- [ ] `lib/product.ts` pricing matches `lib/plans.ts` (`plans.test.ts` proves it)
- [ ] `sample` is realistic — a stranger should understand the product from it
- [ ] Engine deterministic, or `probesNetwork: true` with a documented reason
- [ ] `README.md` and `LAUNCH.md` written

### Infrastructure
- [ ] Postgres created; **pooled** connection string in `DATABASE_URL`
- [ ] `node scripts/db-apply.mjs --twice` succeeds (proves idempotency)
- [ ] Deployed; custom domain and TLS live
- [ ] `NEXT_PUBLIC_SITE_URL` set to the real origin, **no trailing slash** — wrong here means
      password-reset links point at localhost
- [ ] `CRON_SECRET` set; cron visible in the Vercel dashboard

### Money
- [ ] Razorpay plan (and/or Stripe price) created for this product, ids in env
- [ ] Webhook pointed at `https://…/api/billing/webhook`, secret set
- [ ] Razorpay events: `subscription.activated`, `.charged`, `.halted`, `.cancelled`, `.completed`
- [ ] Stripe events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`
- [ ] **A real test payment made end to end**, and the dashboard shows the upgraded plan
- [ ] Webhook replayed from the provider dashboard; confirmed it is a no-op

### Email
- [ ] `RESEND_API_KEY` and `EMAIL_FROM` set; domain verified if using your own
- [ ] Signup welcome received; reset link received and works

### Monitoring
- [ ] UptimeRobot on `/api/health`
- [ ] Grafana Cloud scraping `/api/metrics`
- [ ] `ALERT_WEBHOOK_URL` set; **a test alert actually arrived in the channel**
- [ ] The four alerts from [§7](#the-four-alerts-worth-having) configured

### Go-live
- [ ] Signup → run → upgrade → API key → API call, done once by hand in production
- [ ] `/api/health` returns `"mode": "full"`
- [ ] Anonymous demo works in a private window with no account
- [ ] Product Hunt copy from `LAUNCH.md`; launch Tuesday–Thursday, 00:01 PT
- [ ] `SUPPORT_EMAIL` is an address someone reads

---

## 10. Operations runbook

| Symptom | First check | Likely cause |
|---------|-------------|--------------|
| Signup 500s | `/api/health` → `checks.database` | Wrong `DATABASE_URL`, or non-pooled string exhausting connections |
| Customer paid, still on free | `select * from webhook_events order by created_at desc limit 5` | Webhook URL or secret wrong; `error` column will say |
| Reset emails not arriving | `/api/health` → `checks.email.configured` | `RESEND_API_KEY` unset — **the link is in the logs**, grep `reset-password?token=` |
| Everyone gets 429 | `RATE_LIMIT_PER_MIN` in env | Must be **unset** in production so per-plan limits apply |
| Quota wrong | `select sum(units) from usage_events where user_id=… and created_at >= date_trunc('month', now())` | Calendar month, not rolling 30 days |
| Metrics show database down | `sfs_business_metrics_up` | If `database_up` is 1, the schema has not been applied yet — make one authenticated request |
| Cron not running | Vercel → Cron | `CRON_SECRET` unset means the route refuses by design |

### Replaying a failed webhook

```sql
SELECT provider, event_id, event_type, error, payload
  FROM webhook_events WHERE processed_at IS NULL OR error IS NOT NULL
  ORDER BY created_at DESC;
```

The full payload is stored, so it can be re-sent from the provider dashboard or replayed directly
without depending on provider retries.

---

## 11. Security checklist

Implemented and tested:

- [x] scrypt (N=16384, r=8, p=1) with parameters stored in the hash, so cost can be raised later
      without invalidating existing passwords
- [x] Malformed and hostile hashes rejected before reaching scrypt — bounds on N, r, p
- [x] Opaque 256-bit session tokens, **sha256 at rest**, revocable — chosen over JWT for exactly
      that reason
- [x] `httpOnly`, `secure`, `sameSite=lax` cookies
- [x] Constant-time comparison for every secret
- [x] Dummy verification on unknown emails, so login timing does not enumerate accounts
- [x] Identical response for known and unknown emails on login **and** password reset
- [x] API keys sha256 at rest; shown once; prefix-only display; revocation immediate
- [x] Reset tokens hashed, single-use, one-hour expiry, and reset **signs out all other sessions**
- [x] Webhook signatures verified on raw bytes before parsing; replay-proof via unique event id
- [x] Per-route burst limits, so one endpoint's abuse protection cannot deny another
- [x] Parameterised queries everywhere — no string-built SQL
- [x] `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`
- [x] **CORS on `/api/v1/*` only** — never on auth, keys or billing
- [x] Destructive cron route refuses to run without its secret
- [x] Input length caps (`MAX_FIELD_CHARS`)
- [x] Ownership scoping inside the `UPDATE`, so guessing an id gets you nothing

Deliberately not included, and why: **email verification** (blocks the first run for a product
whose value is immediate; the reset flow already proves ownership when it matters), **2FA** (add it
when an enterprise buyer asks — it is not what a ₹1,499/month tool is refused over), **CSRF tokens**
(`sameSite=lax` plus no cross-origin CORS on cookie routes covers the realistic attack).

---

## 12. Adding a capability to the framework

Never patch one app.

1. Change `_template/`.
2. Add a test to `_template/tests/` (or `scripts/test-integration.mjs` if it needs a database).
3. `pnpm sync` — propagates to all products, regenerates `lib/schema.ts`.
4. `pnpm verify` — all ten must still pass.
5. If it needs a new env var, document it in `_template/.env.example`. Undocumented variables are
   the reason deployments fail at 2 a.m.
6. If it needs a new dependency, add it to `REQUIRED_DEPS` in `scripts/sync-template.mjs`, not to
   ten `package.json` files.

`pnpm sync` also reports any product missing an owned file, so a new shared file cannot be silently
forgotten and a new product cannot ship without its own `product.ts` and `engine.ts`.
