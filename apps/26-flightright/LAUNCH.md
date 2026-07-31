# FlightRight — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`flightright.abetworks.in`)
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

**Name** — FlightRight

**Tagline** (60 char limit)

> What the airline actually owes you, and the letter to claim it

**Description**

> What the airline actually owes you, and the letter to claim it. Flight disruption details in, entitlements and a claim letter out. Claim companies take 25-35% for sending a letter and decline the marginal cases. This separates the three entitlements airlines conflate, pre-answers the four standard refusals, and hands you the letter.

**Topics** — Travel rights, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> Compensation, refund and duty of care are three separate entitlements with three different tests. Airlines routinely offer a voucher against one and let you believe the matter is closed — and accepting a voucher can extinguish the cash claim.
> 
> The most valuable line on the page is about weather. An extraordinary circumstance removes the fixed compensation only; the obligation to refund or reroute and to feed and house you is unaffected. That is where most claimants stop, and they stop too early.
> 
> The second is that a technical fault is not an extraordinary circumstance under EU261 — the aircraft is the airline's responsibility. It remains the most common reason given for refusal, so the letter answers it before they raise it.
> 
> It is honest about being an assessment, not advice: whether a circumstance was genuinely extraordinary has been litigated extensively and can turn on facts only the airline holds. It also flags that limitation periods are real and vary, rather than burying that in a footer.

## Gallery — five images

1. The right regime chosen by route, not by airline nationality
2. Compensation, refund and duty of care separated
3. Which entitlements survive a weather excuse
4. A claim letter that refuses a voucher in advance

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: FlightRight – what the airline actually owes you, and the letter to claim it

**Comment** — lead with the technical decision, not the benefit

> Regime selection by route rather than carrier nationality, EU261 distance bands including the long-haul halving rule, DGCA cancellation and denied-boarding bands capped against fare, and separation of compensation from refund and duty of care so an extraordinary-circumstance defence only removes what it actually removes.
>
> Claim companies take 25-35% for sending a letter and decline the marginal cases. This separates the three entitlements airlines conflate, pre-answers the four standard refusals, and hands you the letter.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> What the airline actually owes you, and the letter to claim it

**Body** — no links in the body, offer the link in a comment

> Flight disruption details in, entitlements and a claim letter out.
>
> Claim companies take 25-35% for sending a letter and decline the marginal cases. This separates the three entitlements airlines conflate, pre-answers the four standard refusals, and hands you the letter.
>
> Built it because what the airline actually owes you, and the letter to claim it is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> What the airline actually owes you, and the letter to claim it.
>
> Flight disruption details in, entitlements and a claim letter out.
>
> Claim companies take 25-35% for sending a letter and decline the marginal cases. This separates the three entitlements airlines conflate, pre-answers the four standard refusals, and hands you the letter.
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · ₹399/mo · Travel desk custom

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
