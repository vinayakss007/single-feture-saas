# ContractClock — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`contractclock.abetworks.in`)
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

**Name** — ContractClock

**Tagline** (60 char limit)

> Paste a contract, find the auto-renewal you were about to miss

**Description**

> Paste a contract, find the auto-renewal you were about to miss. Contract text in, deadlines and a calendar file out. Contract management platforms want your whole repository migrated. This answers one question about one contract — and uses no model, because a hallucinated cancellation deadline is a liability rather than a bug.

**Topics** — Contract operations, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> A contract renews for another year unless you give sixty days' notice. Nobody reads clause 14.3 at signature, the reminder never gets set, and you find out from the invoice a month after the window closed.
> 
> So this finds every date and duration, quotes the auto-renewal clauses verbatim, computes the last safe day to cancel, and gives you an .ics with a two-week alarm. The calendar file is the actual product — being reminded is what stops you missing the window, not having read a report once.
> 
> No model, deliberately. The output goes into a calendar and someone relies on it. A model that invents 'cancel by 14 March' creates precisely the liability this exists to prevent: a false sense of having diarised the deadline. Every date here can be pointed at in the source text.
> 
> So 'I found nothing' is a valid answer, and it says that instead of guessing. It also flags 01/02/2026 as ambiguous with both readings rather than silently picking one, and rolls the renewal date forward when a contract has already renewed — because the next window is the one that matters.

## Gallery — five images

1. The last safe day to cancel, as an actual date
2. Auto-renewal clauses quoted verbatim, not summarised
3. Ambiguous dates flagged with both readings
4. An .ics calendar file with two-week reminders

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: ContractClock – paste a contract, find the auto-renewal you were about to miss

**Comment** — lead with the technical decision, not the benefit

> Date extraction across four written formats, duration parsing including written numbers, auto-renewal and notice clause matching at sentence level, renewal roll-forward for contracts that have already renewed, last-safe-cancellation arithmetic, and iCalendar output with alarms.
>
> Contract management platforms want your whole repository migrated. This answers one question about one contract — and uses no model, because a hallucinated cancellation deadline is a liability rather than a bug.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> Paste a contract, find the auto-renewal you were about to miss

**Body** — no links in the body, offer the link in a comment

> Contract text in, deadlines and a calendar file out.
>
> Contract management platforms want your whole repository migrated. This answers one question about one contract — and uses no model, because a hallucinated cancellation deadline is a liability rather than a bug.
>
> Built it because paste a contract, find the auto-renewal you were about to miss is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> Paste a contract, find the auto-renewal you were about to miss.
>
> Contract text in, deadlines and a calendar file out.
>
> Contract management platforms want your whole repository migrated. This answers one question about one contract — and uses no model, because a hallucinated cancellation deadline is a liability rather than a bug.
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · ₹1,999/mo · Enterprise custom

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
