# EMICalc

**Compare loan offers properly - total cost, not just EMI**

Up to 3 loan offers with principal, rate, tenure, fees, and insurance in, EMI, total interest, effective APR, total outflow ranking, rupee difference, and prepayment savings out. One job, four surfaces: a marketing site, a working app, a REST endpoint and an MCP server.

- **Category** — Finance tools
- **Built for** — Home loan borrowers, car loan applicants, personal loan seekers, loan brokers, financial advisors
- **Pricing** — Free · $9/mo · Enterprise custom
- **Accent** — `#92400e`

## Why it exists

Not just EMI comparison — total lifetime cost including fees, effective APR, and prepayment savings that reveal which offer actually costs less over the full tenure.

## How the engine works

EMI computation (reducing balance), total interest calculation, effective APR via Newton method (incorporating fees and insurance), total outflow ranking, prepayment scenario modeling (5% in year 2 with amortization simulation), tenure reduction calculation, and fee-vs-rate flip detection.

It is deterministic. The same input always produces the same output, there is no model in the request path, and a call costs nothing to serve. That is a design decision, not a limitation — it is what makes the result defensible in a review and cheap enough to run on every record.

## Run it locally

```bash
pnpm install          # from the repo root, once
pnpm dev              # from this folder
```

Then open <http://localhost:3000> for the marketing site and <http://localhost:3000/app> for the working product.

## REST API

The endpoint describes itself, so you never have to guess at the schema:

```bash
curl https://emicalc.abetworks.in/api/v1/run
```

That returns the input schema and a complete working example. To run it:

```bash
curl -X POST https://emicalc.abetworks.in/api/v1/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMICALC_KEY" \
  -d @payload.json
```

Responses are `{ ok: true, data: RunResult }` or `{ ok: false, error: string }`. `data.json` is the machine-readable payload; the other fields drive the UI.

| Route | Method | Purpose |
|---|---|---|
| `/api/v1/run` | GET | Input schema, example payload and MCP tool metadata |
| `/api/v1/run` | POST | Run the engine |
| `/api/health` | GET | Liveness, version and whether auth is enabled |

Auth is off when `API_KEYS` is unset — which is what you want for a launch-day demo. Set it before you charge.

## MCP server

```json
{
  "mcpServers": {
    "emicalc": {
      "command": "node",
      "args": ["./mcp/server.mjs"],
      "env": {
        "SFS_API_URL": "https://emicalc.abetworks.in",
        "SFS_API_KEY": "your_key"
      }
    }
  }
}
```

Exposes one tool, `emi_loan_comparator`. The tool schema is fetched from `GET /api/v1/run` at startup, so the agent-facing contract can never drift from the REST contract.

## Deploy

**Vercel** — set the root directory to `apps/50-emicalc`, framework Next.js. Nothing else to configure.

**Docker**

```bash
docker build -t emicalc .
docker run -p 3000:3000 -e API_KEYS=your_key emicalc
```

## Environment

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Canonical and Open Graph URLs |
| `API_KEYS` | _(empty)_ | Comma-separated keys. Empty means the API is open |
| `RATE_LIMIT_PER_MIN` | `60` | Per key or per IP. `0` disables the limiter |

## Files that matter

```
lib/product.ts   all landing copy, pricing, FAQ, input schema and the example payload
lib/engine.ts    the entire product — run(input) => RunResult
lib/api.ts       auth, rate limiting, input validation
mcp/server.mjs   MCP stdio bridge, zero dependencies
```

To change what this product says, edit `lib/product.ts`. To change what it does, edit `lib/engine.ts`. Nothing else needs touching.

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
