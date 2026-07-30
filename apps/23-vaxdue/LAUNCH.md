# VaxDue — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`vaxdue.abetworks.in`)
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

**Name** — VaxDue

**Tagline** (60 char limit)

> Which childhood vaccines are overdue, due now and next

**Description**

> Which childhood vaccines are overdue, due now and next. Date of birth and doses given in, overdue and upcoming schedule out. A paper card and a chart in weeks and months, versus actual calendar dates you can diary. It also marks every dose free or paid, which is the thing nobody explains at the counter, and is honest that being late almost never means starting again.

**Topics** — Child health, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> A paper card that gets lost, a chart written in weeks and months, and doses spread over eighteen years. Working out what is due today means counting weeks from a birthday by hand.
> 
> This gives calendar dates instead, computed from the date of birth, so they go straight into a diary. It marks every dose free-at-a-government-facility or usually-paid, because that is the distinction nobody explains when you are quoted a total.
> 
> Two things I was careful about. Being late almost never means restarting a series — catch-up continues from where it stopped — so every overdue row says that, rather than leaving a parent to panic. The exception is rotavirus, which has a genuine upper age limit, and there it says plainly that this is not something to catch up.
> 
> And matching is deliberately conservative. If a dose you listed as given could not be matched, it appears in an explicit unmatched list rather than being silently accepted — wrongly marking a dose as given is the more dangerous error of the two.
> 
> It schedules. It does not advise. Vaccine decisions belong to a paediatrician.

## Gallery — five images

1. Overdue, due now and upcoming as calendar dates
2. Every dose marked free or usually paid
3. Catch-up handled honestly, including the one hard age limit
4. A printable card for the clinic

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: VaxDue – which childhood vaccines are overdue, due now and next

**Comment** — lead with the technical decision, not the benefit

> 35 doses across the full childhood schedule with due ages, minimum ages and minimum inter-dose gaps, calendar dates computed from date of birth against an explicit as-at date, conservative matching of already-given doses, and the one upper age limit that genuinely forecloses catch-up.
>
> A paper card and a chart in weeks and months, versus actual calendar dates you can diary. It also marks every dose free or paid, which is the thing nobody explains at the counter, and is honest that being late almost never means starting again.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> Which childhood vaccines are overdue, due now and next

**Body** — no links in the body, offer the link in a comment

> Date of birth and doses given in, overdue and upcoming schedule out.
>
> A paper card and a chart in weeks and months, versus actual calendar dates you can diary. It also marks every dose free or paid, which is the thing nobody explains at the counter, and is honest that being late almost never means starting again.
>
> Built it because which childhood vaccines are overdue, due now and next is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> Which childhood vaccines are overdue, due now and next.
>
> Date of birth and doses given in, overdue and upcoming schedule out.
>
> A paper card and a chart in weeks and months, versus actual calendar dates you can diary. It also marks every dose free or paid, which is the thing nobody explains at the counter, and is honest that being late almost never means starting again.
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · ₹299/mo · Clinic custom

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
