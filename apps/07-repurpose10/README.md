# Repurpose10

**One thing you wrote becomes ten platform-native posts**

One long-form piece in, eleven platform-native outputs out. One job, four surfaces: a marketing site, a working app, a REST endpoint and an MCP server.

- **Category** — Content marketing
- **Built for** — Solo creators, content teams, agencies managing client calendars
- **Pricing** — Free · $29/mo · Agency custom
- **Accent** — `#db2777`

## Why it exists

It selects and restructures your sentences rather than rewriting them. Your voice survives and no fact gets invented.

## How the engine works

Hook scoring across seven signals, key-point extraction per paragraph, then generation inside each platform's real character limit — including counting links as 23 characters on X.

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
curl https://repurpose10.abetworks.in/api/v1/run
```

That returns the input schema and a complete working example. To run it:

```bash
curl -X POST https://repurpose10.abetworks.in/api/v1/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REPURPOSE10_KEY" \
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
    "repurpose10": {
      "command": "node",
      "args": ["./mcp/server.mjs"],
      "env": {
        "SFS_API_URL": "https://repurpose10.abetworks.in",
        "SFS_API_KEY": "your_key"
      }
    }
  }
}
```

Exposes one tool, `repurpose10_fan_out`. The tool schema is fetched from `GET /api/v1/run` at startup, so the agent-facing contract can never drift from the REST contract.

## Deploy

**Vercel** — set the root directory to `apps/07-repurpose10`, framework Next.js. Nothing else to configure.

**Docker**

```bash
docker build -t repurpose10 .
docker run -p 3000:3000 -e API_KEYS=your_key repurpose10
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
