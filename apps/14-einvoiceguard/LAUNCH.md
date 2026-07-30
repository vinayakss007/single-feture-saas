# eInvoiceGuard — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`einvoiceguard.abetworks.in`)
- [ ] `NEXT_PUBLIC_SITE_URL` set to that domain so Open Graph tags resolve
- [ ] `/app` loads and the **Load example** button produces a result in one click
- [ ] `/api/health` returns `ok: true`
- [ ] `GET /api/v1/run` returns the schema and example
- [ ] Tested on a phone — the demo is the pitch, and most launch traffic is mobile
- [ ] `API_KEYS` left **unset** for launch day, so nobody hits an auth wall
- [ ] `RATE_LIMIT_PER_MIN` raised to at least 120 for the traffic spike
- [ ] Five gallery images exported at 1270×760
- [ ] Someone available to answer comments for the first six hours

## Product Hunt

**Name** — eInvoiceGuard

**Tagline** (60 char limit)

> Catch the e-invoice error before the portal rejects it

**Description**

> Validate an e-invoice payload before the portal rejects it. Invoice payload in, portal error codes and a corrected payload out. A rejected e-invoice blocks a payment, and you find out after submitting. This is wrong in the same way the portal is wrong — real error codes, offline — and returns a corrected payload for everything fixable deterministically.

**Topics** — Finance automation, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> No IRN means no valid tax invoice, which means your customer will not pay and cannot claim credit. The rejection arrives from the portal after you submit, often in a batch, often at month end. And the error code is 2172 with a field name, which explains nothing.
> 
> So this validates locally, against the same rules, with the same codes. 40-odd checks including the one that causes more rejections than anything else: CGST plus SGST charged where the place of supply is another state, or IGST where it is the same state. The rule is mechanical and the mistake is constant.
> 
> Two things I was deliberate about. Where a check has no published error code, it is marked advisory rather than given a plausible fake one — an invented code sends someone searching a schema document for something that does not exist. And there is an explicit list of what only the portal can decide: duplicate IRN, cancelled GSTIN, e-way bill conflicts. Claiming a clean payload guarantees acceptance would be the one lie that makes this useless.

## Gallery — five images

1. Every failure with the real portal error code and field path
2. The intra-state versus inter-state tax head check
3. A corrected payload with the deterministic fixes applied
4. The checks only the portal itself can perform

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: eInvoiceGuard – catch the e-invoice error before the portal rejects it

**Comment** — lead with the technical decision, not the benefit

> 40+ checks against IRP schema 1.1 and Peppol BIS 3.0: mandatory fields with real portal error codes, GSTIN check digits, HSN length by turnover, unit and state code lists, and recomputed line, header and tax totals including the CGST/SGST versus IGST split against place of supply.
>
> A rejected e-invoice blocks a payment, and you find out after submitting. This is wrong in the same way the portal is wrong — real error codes, offline — and returns a corrected payload for everything fixable deterministically.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> Catch the e-invoice error before the portal rejects it

**Body** — no links in the body, offer the link in a comment

> Invoice payload in, portal error codes and a corrected payload out.
>
> A rejected e-invoice blocks a payment, and you find out after submitting. This is wrong in the same way the portal is wrong — real error codes, offline — and returns a corrected payload for everything fixable deterministically.
>
> Built it because validate an e-invoice payload before the portal rejects it is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> Catch the e-invoice error before the portal rejects it.
>
> Invoice payload in, portal error codes and a corrected payload out.
>
> A rejected e-invoice blocks a payment, and you find out after submitting. This is wrong in the same way the portal is wrong — real error codes, offline — and returns a corrected payload for everything fixable deterministically.
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · ₹1,999/mo · Platform custom

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
