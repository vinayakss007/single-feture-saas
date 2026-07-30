# InvoiceParse — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`invoiceparse.abetworks.in`)
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

**Name** — InvoiceParse

**Tagline** (60 char limit)

> Invoice data extraction that actually validates the GST

**Description**

> Turn any invoice into clean data — and catch the GST errors. Invoice text in, validated structured data and ledger CSV out. Most parsers regex-match a 15-character string and call the GSTIN valid. This runs the actual check-digit algorithm, so a typo that would cost you input tax credit six months later gets caught now.

**Topics** — Finance automation, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> Two things happen with invoices at almost every Indian company. Someone types numbers from a PDF into a ledger, and nobody re-adds the invoice.
> 
> So invalid GSTINs pass straight through — and a GSTIN that looks right but fails its check digit means your input tax credit gets rejected months later, long after you paid the vendor. And arithmetic errors sail past: CGST that does not equal SGST, a subtotal that does not match the line items, IGST charged on an intra-state supply.
> 
> InvoiceParse does both jobs. It extracts the header fields and line items from pasted text — no per-vendor templates, because it looks for the labels every tax invoice carries rather than for positions on a page. Then it validates: the real GSTIN mod-36 check digit, the state code, the embedded PAN structure, inter-state versus intra-state tax logic from the two state codes, and every total re-derived from its parts with the exact discrepancy reported.
> 
> The demo invoice looks correct at a glance. It is not — the seller is in Maharashtra and the buyer in Karnataka, so charging CGST plus SGST instead of IGST is wrong. That is the kind of thing this catches.
> 
> Output is JSON plus a ledger CSV for Tally or Zoho Books. Free, nothing stored, REST API and MCP server included.

## Gallery — five images

1. Paste invoice text from a PDF, OCR output or an email body.
2. Validation score with blocking issues separated from warnings.
3. GSTIN verified properly — state code, embedded PAN and the real mod-36 check digit.
4. Line items extracted with HSN codes, and every total re-computed from the parts.
5. Ledger-ready CSV with the tax split already separated, one row per line item.

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: InvoiceParse – invoice data extraction that actually validates the gst

**Comment** — lead with the technical decision, not the benefit

> Label-driven extraction rather than layout templates, plus 15 validation rules including the real GSTIN mod-36 check digit, state code and embedded PAN structure, inter-state versus intra-state tax logic, and every total re-derived from its parts.
>
> Most parsers regex-match a 15-character string and call the GSTIN valid. This runs the actual check-digit algorithm, so a typo that would cost you input tax credit six months later gets caught now.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> Invoice data extraction that actually validates the GST

**Body** — no links in the body, offer the link in a comment

> Invoice text in, validated structured data and ledger CSV out.
>
> Most parsers regex-match a 15-character string and call the GSTIN valid. This runs the actual check-digit algorithm, so a typo that would cost you input tax credit six months later gets caught now.
>
> Built it because turn any invoice into clean data — and catch the GST errors is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> Invoice data extraction that actually validates the GST.
>
> Invoice text in, validated structured data and ledger CSV out.
>
> Most parsers regex-match a 15-character string and call the GSTIN valid. This runs the actual check-digit algorithm, so a typo that would cost you input tax credit six months later gets caught now.
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · $39/mo · $0.01/invoice at volume

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
