# PricePulse — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`pricepulse.abetworks.in`)
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

**Name** — PricePulse

**Tagline** (60 char limit)

> A commercial diff for competitor pricing pages, not a text diff

**Description**

> Know the moment a competitor changes their pricing page. Two pricing page snapshots in, classified commercial diff out. Visual diff tools fire on a rotated testimonial and a changed copyright year. This one parses the plans first, so only changes that affect what a buyer pays or gets ever surface.

**Topics** — Competitive intelligence, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> Every page-monitoring tool I tried had the same problem: it alerted on the copyright year rolling over and on a rotated testimonial. After a week of that, nobody opens the alerts, and then you find out about the real change from a lost deal.
> 
> PricePulse parses both snapshots into a plan model first — plans, prices, seat counts, API quotas, trial lengths and which features sit in which tier — and only then compares. So it can tell you "SSO moved from Enterprise to Professional", which is the change that reprices your entire deal, rather than "31 lines differ".
> 
> Thirteen change types, ranked by commercial impact, each with the positioning response a rep can use on the next call. Plus a Slack alert and a battlecard update in markdown, ready to paste.
> 
> On why you paste snapshots instead of giving me a URL: the honest version of URL monitoring is a scheduler, and you probably already have one. The diff engine is the hard part and it is free here. It also means pages behind a login work fine.
> 
> Deterministic, no LLM, no per-call cost. REST API and MCP server included.

## Gallery — five images

1. Paste yesterday's pricing page and today's. Plain text is enough.
2. Commercial impact score, with high-impact changes separated from noise.
3. Feature tier shifts called out explicitly — the change that quietly reprices your deals.
4. Plan-by-plan comparison table showing what was repriced, added or killed.
5. A Slack alert and a battlecard update, generated and ready to paste.

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: PricePulse – a commercial diff for competitor pricing pages, not a text diff

**Comment** — lead with the technical decision, not the benefit

> Parses both snapshots into a structured plan model — price, period, seats, quotas, trial length, feature placement — then classifies differences into thirteen change types weighted by commercial impact.
>
> Visual diff tools fire on a rotated testimonial and a changed copyright year. This one parses the plans first, so only changes that affect what a buyer pays or gets ever surface.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> A commercial diff for competitor pricing pages, not a text diff

**Body** — no links in the body, offer the link in a comment

> Two pricing page snapshots in, classified commercial diff out.
>
> Visual diff tools fire on a rotated testimonial and a changed copyright year. This one parses the plans first, so only changes that affect what a buyer pays or gets ever surface.
>
> Built it because know the moment a competitor changes their pricing page is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> A commercial diff for competitor pricing pages, not a text diff.
>
> Two pricing page snapshots in, classified commercial diff out.
>
> Visual diff tools fire on a rotated testimonial and a changed copyright year. This one parses the plans first, so only changes that affect what a buyer pays or gets ever surface.
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · $39/mo · Enterprise custom

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
