# CarCost — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`carcost.abetworks.in`)
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

**Name** — CarCost

**Tagline** (60 char limit)

> The real cost of owning this car, not just the EMI

**Description**

> The real cost of owning this car, not just the EMI. Car price, state, fuel type, and loan details in, true 5-year ownership cost with cost-per-km out. Not a car listing — a financial calculator that shows what you think it costs (EMI) vs what it actually costs (EMI + fuel + insurance + service + depreciation).

**Topics** — Personal finance, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> 

## Gallery — five images



Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: CarCost – the real cost of owning this car, not just the emi

**Comment** — lead with the technical decision, not the benefit

> On-road price computation (state-specific road tax, registration, TCS, insurance), 5-year running cost projection (fuel at state prices, service schedule, tyre replacement, insurance with depreciating IDV), loan EMI and total interest, depreciation at Indian market rates, cost-per-km, and petrol vs diesel breakeven.
>
> Not a car listing — a financial calculator that shows what you think it costs (EMI) vs what it actually costs (EMI + fuel + insurance + service + depreciation).
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> The real cost of owning this car, not just the EMI

**Body** — no links in the body, offer the link in a comment

> Car price, state, fuel type, and loan details in, true 5-year ownership cost with cost-per-km out.
>
> Not a car listing — a financial calculator that shows what you think it costs (EMI) vs what it actually costs (EMI + fuel + insurance + service + depreciation).
>
> Built it because the real cost of owning this car, not just the EMI is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> The real cost of owning this car, not just the EMI.
>
> Car price, state, fuel type, and loan details in, true 5-year ownership cost with cost-per-km out.
>
> Not a car listing — a financial calculator that shows what you think it costs (EMI) vs what it actually costs (EMI + fuel + insurance + service + depreciation).
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · $19/mo · Enterprise custom

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
