# SubAudit — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`subaudit.abetworks.in`)
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

**Name** — SubAudit

**Tagline** (60 char limit)

> Upload a card statement, find the subscriptions you forgot

**Description**

> Upload a card statement, find the subscriptions you forgot. Statement CSV in, subscription map with duplicates and renewals out. Spend management platforms want to become your card, which is a procurement project. This wants a CSV you already have — no bank connection, no OAuth — and usually finds money on the first run.

**Topics** — Finance operations, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> A trial nobody converted, a seat for someone who left, two tools doing the same job bought by two teams. Each is small enough to ignore on a statement and large enough to matter annually.
> 
> The reason people never do this audit is that the tools ask for bank access first. So this takes a CSV. No open-banking consent, no credentials, nothing stored — the statement is processed in memory.
> 
> Two things I fixed before shipping, both about not overstating the saving. It was double-counting anything that was both a duplicate and stale, which inflates the one number a CFO will check. And it was flagging AWS plus Google Cloud as waste — running more than one cloud is normal architecture, and recommending consolidation would be a guess about someone's system rather than a finding about their spend. Those categories are now reported as informational and excluded from the recoverable figure.
> 
> Cadence is inferred from the gaps between charges, never assumed, because a monthly and an annual subscription at the same amount are entirely different problems.

## Gallery — five images

1. Hostile statement descriptors resolved to real vendor names
2. Duplicate tools grouped by category with the saving attached
3. Price rises with the before and after amounts
4. A renewal calendar and a cancel shortlist ranked by annual saving

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: SubAudit – upload a card statement, find the subscriptions you forgot

**Comment** — lead with the technical decision, not the benefit

> 180+ vendor patterns with payment-processor prefix stripping, billing cadence inferred from the median gap between charges, duplicate detection by category, price-rise detection across cycles, and staleness against each subscription's own cycle.
>
> Spend management platforms want to become your card, which is a procurement project. This wants a CSV you already have — no bank connection, no OAuth — and usually finds money on the first run.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> Upload a card statement, find the subscriptions you forgot

**Body** — no links in the body, offer the link in a comment

> Statement CSV in, subscription map with duplicates and renewals out.
>
> Spend management platforms want to become your card, which is a procurement project. This wants a CSV you already have — no bank connection, no OAuth — and usually finds money on the first run.
>
> Built it because upload a card statement, find the subscriptions you forgot is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> Upload a card statement, find the subscriptions you forgot.
>
> Statement CSV in, subscription map with duplicates and renewals out.
>
> Spend management platforms want to become your card, which is a procurement project. This wants a CSV you already have — no bank connection, no OAuth — and usually finds money on the first run.
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
