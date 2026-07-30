# Deploy

Eleven deployments: the **abetworks.in banner site** at the apex, and ten products on subdomains.
Each is independent — nothing is shared at runtime, so one can go down or get rewritten without
touching the others.

```
abetworks.in                    site/              the banner site
  ├── dealbrief.abetworks.in    apps/01-dealbrief
  ├── churnsignal.abetworks.in  apps/02-churnsignal
  └── … eight more
```

## The banner site first

Deploy this before the products so there is always one URL to point people at.

1. **New Project** → import `vinayakss007/single-feture-saas`
2. **Root Directory** → `site`
3. Domain → `abetworks.in`, with `www.abetworks.in` redirecting to it
4. Environment → `NEXT_PUBLIC_SITE_URL=https://abetworks.in`

It prerenders to a single static page, so it costs nothing to serve.

**Launching products one at a time?** The hub links to `https://<slug>.abetworks.in` by default. Until
a product has its real domain, override just that one:

```bash
NEXT_PUBLIC_PRODUCT_URL_DEALBRIEF=https://dealbrief-abc123.vercel.app
```

Remove the override once DNS is live. `NEXT_PUBLIC_PRODUCT_DOMAIN_BASE` repoints all ten at once,
which is what you want for a staging apex.

## Vercel — the products

Each app needs its own Vercel project pointing at the same repository, with a different root directory.

1. **New Project** → import `vinayakss007/single-feture-saas`
2. **Root Directory** → `apps/01-dealbrief`
3. **Framework** → Next.js (auto-detected)
4. Leave build and install commands alone — `apps/*/vercel.json` sets them
5. Add environment variables (below)
6. Deploy

Repeat for the other nine. Each takes about two minutes.

### Suggested domains

| App | Domain |
|---|---|
| 01-dealbrief | `dealbrief.abetworks.in` |
| 02-churnsignal | `churnsignal.abetworks.in` |
| 03-pricepulse | `pricepulse.abetworks.in` |
| 04-consentscan | `consentscan.abetworks.in` |
| 05-invoiceparse | `invoiceparse.abetworks.in` |
| 06-coldangle | `coldangle.abetworks.in` |
| 07-repurpose10 | `repurpose10.abetworks.in` |
| 08-pingdeck | `pingdeck.abetworks.in` |
| 09-answerready | `answerready.abetworks.in` |
| 10-promptshield | `promptshield.abetworks.in` |

Subdomains of one apex keep DNS simple and give every product the domain authority of the parent. Move a winner to its own apex later, once it earns it.

The `vercel.json` in each app pins the region to `bom1` (Mumbai). Change it if your users are not primarily in India. For ConsentScan, PingDeck and AnswerReady the region also determines where outbound scans originate, which affects measured latency.

## Docker

Every app has a self-contained multi-stage Dockerfile. Build from inside the app directory — the build context is the app, not the monorepo.

```bash
cd apps/01-dealbrief
docker build -t abetworks/dealbrief:1.0.0 .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SITE_URL=https://dealbrief.abetworks.in \
  -e API_KEYS=key_one,key_two \
  -e RATE_LIMIT_PER_MIN=120 \
  abetworks/dealbrief:1.0.0
```

The image runs as a non-root user, uses Next.js standalone output, sets `HOSTNAME=0.0.0.0` so it binds inside a container, and has a `HEALTHCHECK` against `/api/health`.

Build all ten:

```bash
for d in apps/*/; do
  name=$(basename "$d")
  (cd "$d" && docker build -t "abetworks/${name#*-}:1.0.0" .)
done
```

### Self-hosting is a feature, not a fallback

For four of the ten it is the answer to a real objection:

- **ConsentScan** — sites behind Cloudflare-style bot protection return 403 to any external scanner because the block is on the TLS fingerprint, not the User-Agent. Running inside the network gets past it.
- **PingDeck** — lets you monitor internal hosts that are not reachable from the public internet.
- **PromptShield** — the whole selling point for regulated buyers is that the untrusted text never leaves their infrastructure.
- **InvoiceParse** — auditors ask where invoice data goes. "Nowhere" is a much better answer than "a third party, statelessly".

## Environment variables

**Every variable is documented in `_template/.env.example`, grouped by what it unlocks.** The short
version is that nothing is required — with an empty `.env` every product boots and its demo works,
metered by IP. You add variables to unlock capability.

| Add this | And you get |
|---|---|
| _(nothing)_ | Landing page, live demo, REST API, MCP server. Metered per IP. **Demo mode.** |
| `DATABASE_URL` | Accounts, login, password reset, dashboard, API keys, metered monthly quotas |
| `RAZORPAY_*` or `STRIPE_*` | Checkout, subscriptions, webhooks, plan enforcement |
| `RESEND_API_KEY` | Welcome, password-reset and dunning emails actually sent |
| `ALERT_WEBHOOK_URL` | Slack/Discord alerts on 5xx bursts and webhook failures |
| `CRON_SECRET` | The daily retention job runs |

### The four that matter most

| Variable | Why it matters |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, Open Graph, payment redirects **and password-reset links**. No trailing slash. Get this wrong and reset emails point at localhost |
| `DATABASE_URL` | Use the **pooled** connection string on serverless. The direct one exhausts Postgres connection slots |
| `RATE_LIMIT_PER_MIN` | Leave **unset** in production so each plan gets its own limit. Setting it overrides every plan at once |
| `CRON_SECRET` | Without it the purge route refuses to run, by design — a destructive endpoint should not be open |

### Per-product payment ids

Env names are namespaced by slug, so one project can hold all ten:

```
RAZORPAY_PLAN_DEALBRIEF_PRO=plan_xxx
STRIPE_PRICE_DEALBRIEF_PRO=price_xxx
```

Until one exists, the dashboard says paid plans are not configured rather than showing a button
that fails.

### Webhooks

Point both providers at `https://<domain>/api/billing/webhook` — one URL handles both.

- **Razorpay:** `subscription.activated`, `.charged`, `.halted`, `.cancelled`, `.completed`
- **Stripe:** `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`

Signatures are verified on raw bytes before parsing, and every event id is stored with a unique
constraint, so provider retries cannot double-apply a plan change.

### Launch day vs charging day

**Launch day** — deploy with `DATABASE_URL` set but no payment keys. Visitors get 15 anonymous runs a
day, then a prompt to create a free account worth 25 runs a month. No auth wall in front of the
demo, because the demo is the entire pitch.

**Charging day** — add the payment keys and the plan ids. Nothing else changes; the paywall was
already enforcing quotas.

### Monitoring

| Endpoint | Point it at | Free tier |
|---|---|---|
| `/api/health` | UptimeRobot or Better Stack | 50 monitors / 10 monitors |
| `/api/metrics` | Grafana Cloud (Prometheus scrape) | 10k series |

`/api/health` returns 503 only when a dependency the deployment *claims* to have is broken. A
deployment with no database is healthy, because demo mode is a valid configuration.

The burst limiter is per-instance and in-memory, which is fine — the durable, billable limit is the
monthly quota in Postgres, which is correct across instances. Add Upstash Redis only if you need a
strict distributed burst limit.

**Full deployment, security and operations checklists:
[FRAMEWORK.md](../FRAMEWORK.md#9-launch-checklist).**

## Verify before you announce

```bash
pnpm install
pnpm typecheck          # tsc --noEmit, all ten
pnpm build              # next build, all ten
node scripts/smoke.mjs  # boots each app, runs its own published example
```

`scripts/smoke.mjs` reads each product's example payload from that product's own `GET /api/v1/run` and POSTs it back, so it proves the documented contract and the real one agree. It also asserts the landing page and the demo page render, and that no copy block contains `undefined`, `NaN` or `[object Object]`.

Then check by hand, on a phone:

- [ ] `/` renders with correct pricing and no placeholder text
- [ ] `/app` → **Load example** → **Run** produces a result in one click
- [ ] `/api/health` returns `ok: true` and the right `authRequired` value
- [ ] `GET /api/v1/run` returns the schema
- [ ] Open Graph preview resolves (paste the URL into Slack)

## MCP servers

The MCP server is a client-side process, not a deployment. Users run it locally and point it at your hosted API:

```json
{
  "mcpServers": {
    "dealbrief": {
      "command": "node",
      "args": ["/absolute/path/to/apps/01-dealbrief/mcp/server.mjs"],
      "env": {
        "SFS_API_URL": "https://dealbrief.abetworks.in",
        "SFS_API_KEY": "your_key"
      }
    }
  }
}
```

Zero dependencies, so there is nothing to install and nothing to keep patched. It fetches its tool schema from your live API at startup, which means the agent-facing contract updates automatically when you change `lib/product.ts`.

If you publish these to npm, publish one package per product rather than one with ten servers. Agents work better with a small tool surface.

## Scheduling with FlowForge

Four products are worth running on a schedule rather than on demand. That scheduling layer is also the paid tier for each.

| Product | Schedule | Alert on |
|---|---|---|
| ConsentScan | Weekly, plus post-deploy | Score drop, or any new high-severity finding |
| PingDeck | Every 60s | State change only, never on every check |
| AnswerReady | Weekly | Score drop, or a newly blocked AI crawler |
| PricePulse | Nightly | High-impact changes only |

Alert on **state change**, not on state. A monitor that messages you every sixty seconds to say everything is fine is a monitor you will mute, and then it is not a monitor.

## CI

Two products are worth gating a build on:

```yaml
- name: Compliance gate
  run: |
    SCORE=$(curl -s -X POST https://consentscan.abetworks.in/api/v1/run \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${{ secrets.CONSENTSCAN_KEY }}" \
      -d '{"url":"https://staging.example.com","regime":"Both"}' \
      | jq -r '.data.score.value')
    echo "Compliance score: $SCORE"
    [ "$SCORE" -ge 75 ] || { echo "Compliance regression"; exit 1; }
```

The same shape works for AnswerReady against `.data.score.value`.

## Cost

All ten fit comfortably in Vercel's Hobby tier while you have no traffic, because there is no database, no queue, no model API and no per-request inference cost. The only outbound calls are made by ConsentScan, PingDeck and AnswerReady when a user asks for a scan.

The first thing that will need paying for is bandwidth on whichever product lands on Product Hunt's front page — not compute.

---

By [Abet Works](https://abetworks.in).
