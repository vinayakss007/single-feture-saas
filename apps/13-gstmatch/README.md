# GSTMatch

**See the input tax credit you are about to lose, in rupees**

Two CSVs in, input tax credit at risk in rupees out. One job, four surfaces: a marketing site, a working app, a REST endpoint and an MCP server.

- **Category** — Tax compliance
- **Built for** — Indian businesses filing GST, chartered accountants, finance teams
- **Pricing** — Free · ₹1,499/mo · Enterprise custom
- **Accent** — `#15803d`

## Why it exists

Every GST reconciliation product on the market is an ERP integration for mid-market. This wants two CSVs and gives you a rupee figure for the credit you are about to lose, which makes the ROI a single sentence.

## How the engine works

Segment-wise invoice number normalisation so INV/2026/0412 matches inv-2026-412, GSTIN base-36 check-digit validation, four-way bucketing with a rounding tolerance, and per-supplier ranking by credit at risk.

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
curl https://gstmatch.abetworks.in/api/v1/run
```

That returns the input schema and a complete working example. To run it:

```bash
curl -X POST https://gstmatch.abetworks.in/api/v1/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GSTMATCH_KEY" \
  -d @payload.json
```

Responses are `{ ok: true, data: RunResult }` or `{ ok: false, error: string }`. `data.json` is the machine-readable payload; the other fields drive the UI.

| Route | Method | Purpose |
|---|---|---|
| `/api/v1/run` | GET | Input schema, example payload and MCP tool metadata |
| `/api/v1/run` | POST | Run the engine |
| `/api/v1/openapi` | GET | OpenAPI 3.1 document, generated from the same input config |
| `/api/v1/agents` | GET | Tool schemas for OpenAI, Anthropic, Gemini, LangChain and MCP |
| `/.well-known/ai-plugin.json` | GET | Plugin manifest, so agent runtimes can discover this product |
| `/api/health` | GET | Liveness, version and whether auth is enabled |
| `/sitemap.xml`, `/robots.txt` | GET | Generated, and they list the sibling products |

Auth is off when `API_KEYS` is unset — which is what you want for a launch-day demo. Set it before you charge.

## MCP server

```json
{
  "mcpServers": {
    "gstmatch": {
      "command": "node",
      "args": ["./mcp/server.mjs"],
      "env": {
        "SFS_API_URL": "https://gstmatch.abetworks.in",
        "SFS_API_KEY": "your_key"
      }
    }
  }
}
```

Exposes one tool, `gstmatch_reconcile_2b`. The tool schema is fetched from `GET /api/v1/run` at startup, so the agent-facing contract can never drift from the REST contract.

## Deploy

**Vercel** — set the root directory to `apps/13-gstmatch`, framework Next.js. Nothing else to configure.

**Docker**

```bash
docker build -t gstmatch .
docker run -p 3000:3000 -e API_KEYS=your_key gstmatch
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
