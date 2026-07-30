# DealBrief

**Turn any sales call transcript into a CRM-ready deal brief**

Sales call transcript in, qualified deal brief out. One job, four surfaces: a marketing site, a working app, a REST endpoint and an MCP server.

- **Category** — Revenue operations
- **Built for** — B2B sales teams, RevOps, sales managers running pipeline reviews
- **Pricing** — Free · $29/user/mo · usage from $0.04/brief
- **Accent** — `#4f46e5`

## Why it exists

A meeting recorder summarises what was said. DealBrief judges the deal — what is missing, what is at risk, and who owes what by when.

## How the engine works

MEDDICC coverage scoring, commitment extraction with owner and date attribution, nine risk rules, speaker aliasing and talk-ratio analysis.

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
curl https://dealbrief.abetworks.in/api/v1/run
```

That returns the input schema and a complete working example. To run it:

```bash
curl -X POST https://dealbrief.abetworks.in/api/v1/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DEALBRIEF_KEY" \
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
    "dealbrief": {
      "command": "node",
      "args": ["./mcp/server.mjs"],
      "env": {
        "SFS_API_URL": "https://dealbrief.abetworks.in",
        "SFS_API_KEY": "your_key"
      }
    }
  }
}
```

Exposes one tool, `dealbrief_analyze_call`. The tool schema is fetched from `GET /api/v1/run` at startup, so the agent-facing contract can never drift from the REST contract.

## Deploy

**Vercel** — set the root directory to `apps/01-dealbrief`, framework Next.js. Nothing else to configure.

**Docker**

```bash
docker build -t dealbrief .
docker run -p 3000:3000 -e API_KEYS=your_key dealbrief
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
