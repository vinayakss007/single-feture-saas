# ChurnSignal — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`churnsignal.abetworks.in`)
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

**Name** — ChurnSignal

**Tagline** (60 char limit)

> Churn risk scoring with reason codes, from a CSV

**Description**

> Paste a CSV, find out which customers are about to leave. Account CSV in, ranked churn risk with reason codes out. A health score without reason codes tells a CSM nothing. Every score here shows which signals fired, how many points each added, and the specific save play for the dominant one.

**Topics** — Customer success, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> Proper customer health scoring means a warehouse, a modelling layer, and someone whose job it is to own them. Most teams under fifty people are never going to get there, so they run on vibes until someone cancels.
> 
> ChurnSignal is the version that fits in an afternoon. Export your accounts from wherever they live, paste the CSV, get a ranked risk list back.
> 
> Two things I was deliberate about. First, it is not machine learning — on a book of forty accounts an ML model is a random number generator with better marketing. It is a transparent weighted rules model, so you can read exactly why an account scored 78 and argue with it in a pipeline review. Second, every score comes with reason codes and a save play, because "this account is 74% likely to churn" does not tell anyone what to do on Monday morning.
> 
> Your column names do not have to match a schema — common header variants are recognised automatically and any signal you did not export is excluded from the score rather than silently counted as healthy.
> 
> Free tier, no signup, nothing stored. There is a REST API and an MCP server if you want it scored nightly.

## Gallery — five images

1. Paste any account export. Column order and naming do not have to match a schema.
2. Revenue-weighted portfolio risk, with critical and watchlist counts and MRR at risk.
3. Per-account reason codes — which signals fired and how many points each contributed.
4. A specific save play per risk pattern. Dormant accounts need a different move to pricing friction.
5. Scored CSV back out, ready to re-import into your CRM.

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: ChurnSignal – churn risk scoring with reason codes, from a csv

**Comment** — lead with the technical decision, not the benefit

> Six weighted signals — usage trend, dormancy, seat adoption, support pressure, satisfaction, renewal proximity — normalised against the signals your export actually contains.
>
> A health score without reason codes tells a CSM nothing. Every score here shows which signals fired, how many points each added, and the specific save play for the dominant one.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> Churn risk scoring with reason codes, from a CSV

**Body** — no links in the body, offer the link in a comment

> Account CSV in, ranked churn risk with reason codes out.
>
> A health score without reason codes tells a CSM nothing. Every score here shows which signals fired, how many points each added, and the specific save play for the dominant one.
>
> Built it because paste a CSV, find out which customers are about to leave is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> Churn risk scoring with reason codes, from a CSV.
>
> Account CSV in, ranked churn risk with reason codes out.
>
> A health score without reason codes tells a CSM nothing. Every score here shows which signals fired, how many points each added, and the specific save play for the dominant one.
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · $49/mo · Enterprise custom

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
