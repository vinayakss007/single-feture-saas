# WaterLeak

**Find the leak from your water meter readings**

Meter readings over several days and household size in, daily consumption analysis, leak detection, litres lost per day, monthly cost, and likely leak type out. One job, four surfaces: a marketing site, a working app, a REST endpoint and an MCP server.

- **Category** — Utility tools
- **Built for** — Homeowners, apartment residents, facility managers, plumbers, water utility engineers
- **Pricing** — Free · $9/mo · Enterprise custom
- **Accent** — `#b91c1c`

## Why it exists

Not a plumber guessing — data-driven leak detection from your meter readings that identifies the type of leak and what it costs you per month.

## How the engine works

Daily consumption computation from sequential readings, per-capita comparison against 135 LPCD Indian benchmark, anomaly detection (sudden jumps, steady overnight consumption), leak type profiling (dripping tap 30-50 L/day, running toilet 200-400 L/day, underground pipe 500+ L/day), and monthly cost at municipal rates.

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
curl https://waterleak.abetworks.in/api/v1/run
```

That returns the input schema and a complete working example. To run it:

```bash
curl -X POST https://waterleak.abetworks.in/api/v1/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $WATERLEAK_KEY" \
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
    "waterleak": {
      "command": "node",
      "args": ["./mcp/server.mjs"],
      "env": {
        "SFS_API_URL": "https://waterleak.abetworks.in",
        "SFS_API_KEY": "your_key"
      }
    }
  }
}
```

Exposes one tool, `water_leak_detector`. The tool schema is fetched from `GET /api/v1/run` at startup, so the agent-facing contract can never drift from the REST contract.

## Deploy

**Vercel** — set the root directory to `apps/44-waterleak`, framework Next.js. Nothing else to configure.

**Docker**

```bash
docker build -t waterleak .
docker run -p 3000:3000 -e API_KEYS=your_key waterleak
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
