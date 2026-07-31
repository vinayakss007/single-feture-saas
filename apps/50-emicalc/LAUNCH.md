# EMICalc — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`emicalc.abetworks.in`)
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

**Name** — EMICalc

**Tagline** (60 char limit)

> Compare loan offers properly - total cost, not just EMI

**Description**

> Compare loan offers properly - total cost, not just EMI. Up to 3 loan offers with principal, rate, tenure, fees, and insurance in, EMI, total interest, effective APR, total outflow ranking, rupee difference, and prepayment savings out. Not just EMI comparison — total lifetime cost including fees, effective APR, and prepayment savings that reveal which offer actually costs less over the full tenure.

**Topics** — Finance tools, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> 

## Gallery — five images



Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: EMICalc – compare loan offers properly - total cost, not just emi

**Comment** — lead with the technical decision, not the benefit

> EMI computation (reducing balance), total interest calculation, effective APR via Newton method (incorporating fees and insurance), total outflow ranking, prepayment scenario modeling (5% in year 2 with amortization simulation), tenure reduction calculation, and fee-vs-rate flip detection.
>
> Not just EMI comparison — total lifetime cost including fees, effective APR, and prepayment savings that reveal which offer actually costs less over the full tenure.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> Compare loan offers properly - total cost, not just EMI

**Body** — no links in the body, offer the link in a comment

> Up to 3 loan offers with principal, rate, tenure, fees, and insurance in, EMI, total interest, effective APR, total outflow ranking, rupee difference, and prepayment savings out.
>
> Not just EMI comparison — total lifetime cost including fees, effective APR, and prepayment savings that reveal which offer actually costs less over the full tenure.
>
> Built it because compare loan offers properly - total cost, not just EMI is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> Compare loan offers properly - total cost, not just EMI.
>
> Up to 3 loan offers with principal, rate, tenure, fees, and insurance in, EMI, total interest, effective APR, total outflow ranking, rupee difference, and prepayment savings out.
>
> Not just EMI comparison — total lifetime cost including fees, effective APR, and prepayment savings that reveal which offer actually costs less over the full tenure.
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · $9/mo · Enterprise custom

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
