# A11yGate

**Paste your HTML, get every WCAG 2.2 failure and the EAA statement**

HTML in, WCAG failures with fixes and a publishable accessibility statement out. One job, four surfaces: a marketing site, a working app, a REST endpoint and an MCP server.

- **Category** — Accessibility compliance
- **Built for** — EU e-commerce, banking, transport and SaaS teams, plus the agencies that build for them
- **Pricing** — Free · ₹1,999/mo · Agency custom
- **Accent** — `#b45309`

## Why it exists

Browser extensions test a rendered page, so they cannot run in CI or on a component that is not deployed. This runs on source with no browser, maps findings to EN 301 549 as well as WCAG, and generates the accessibility statement — which is a legal deliverable, not a report.

## How the engine works

34 deterministic checks over raw markup: image alternatives, form labelling, heading structure, landmarks, link and button naming, language, duplicate ids, tables, iframes, focus order, autoplay, ARIA misuse, and contrast computed from inline styles.

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
curl https://a11ygate.abetworks.in/api/v1/run
```

That returns the input schema and a complete working example. To run it:

```bash
curl -X POST https://a11ygate.abetworks.in/api/v1/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $A11YGATE_KEY" \
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
    "a11ygate": {
      "command": "node",
      "args": ["./mcp/server.mjs"],
      "env": {
        "SFS_API_URL": "https://a11ygate.abetworks.in",
        "SFS_API_KEY": "your_key"
      }
    }
  }
}
```

Exposes one tool, `a11ygate_audit_html`. The tool schema is fetched from `GET /api/v1/run` at startup, so the agent-facing contract can never drift from the REST contract.

## Deploy

**Vercel** — set the root directory to `apps/12-a11ygate`, framework Next.js. Nothing else to configure.

**Docker**

```bash
docker build -t a11ygate .
docker run -p 3000:3000 -e API_KEYS=your_key a11ygate
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
