# GSTMatch — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`gstmatch.abetworks.in`)
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

**Name** — GSTMatch

**Tagline** (60 char limit)

> See the input tax credit you are about to lose, in rupees

**Description**

> See the input tax credit you are about to lose, in rupees. Two CSVs in, input tax credit at risk in rupees out. Every GST reconciliation product on the market is an ERP integration for mid-market. This wants two CSVs and gives you a rupee figure for the credit you are about to lose, which makes the ROI a single sentence.

**Topics** — Tax compliance, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> Since Section 16(2)(aa), credit you cannot find in GSTR-2B is credit you cannot take. An invoice your supplier forgot to upload is money you paid and cannot recover — and you find out at filing.
> 
> The reconciliation itself happens in a spreadsheet, monthly, by hand, with VLOOKUP against invoice numbers that one side wrote as INV/2026/0412 and the other as inv-2026-412. The matches that fail silently are the ones that cost you.
> 
> That matching is the whole product, and getting it wrong in a subtle way was the bug I nearly shipped: if you strip separators before normalising leading zeros, those two references stop matching, and the tool reports an invoice as missing from 2B when it is present. You then chase a supplier who did nothing wrong. Segments are normalised first now, and there is a comment in the source explaining why the order matters.
> 
> It never matches on amount alone. That finds a few more pairs and invents others, and a false match hides a missing invoice — the exact thing this exists to find.

## Gallery — five images

1. ITC at risk in rupees, not a match percentage
2. Four buckets: matched, value mismatch, missing either side
3. Per-supplier ranking so you chase the ₹80,000 before the ₹400
4. A follow-up list ready to send to suppliers

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: GSTMatch – see the input tax credit you are about to lose, in rupees

**Comment** — lead with the technical decision, not the benefit

> Segment-wise invoice number normalisation so INV/2026/0412 matches inv-2026-412, GSTIN base-36 check-digit validation, four-way bucketing with a rounding tolerance, and per-supplier ranking by credit at risk.
>
> Every GST reconciliation product on the market is an ERP integration for mid-market. This wants two CSVs and gives you a rupee figure for the credit you are about to lose, which makes the ROI a single sentence.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> See the input tax credit you are about to lose, in rupees

**Body** — no links in the body, offer the link in a comment

> Two CSVs in, input tax credit at risk in rupees out.
>
> Every GST reconciliation product on the market is an ERP integration for mid-market. This wants two CSVs and gives you a rupee figure for the credit you are about to lose, which makes the ROI a single sentence.
>
> Built it because see the input tax credit you are about to lose, in rupees is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> See the input tax credit you are about to lose, in rupees.
>
> Two CSVs in, input tax credit at risk in rupees out.
>
> Every GST reconciliation product on the market is an ERP integration for mid-market. This wants two CSVs and gives you a rupee figure for the credit you are about to lose, which makes the ROI a single sentence.
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · ₹1,499/mo · Enterprise custom

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
