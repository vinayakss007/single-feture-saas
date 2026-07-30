# LabTrack — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`labtrack.abetworks.in`)
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

**Name** — LabTrack

**Tagline** (60 char limit)

> Which lab values are outside range, and which ones are moving

**Description**

> See which lab values are outside range, and which are moving. Lab report values in, range flags and trends across reports out. Every other tool in this space interprets. This deliberately does not: it checks thirty values against thirty ranges without missing one, and lines up four reports to show what is moving. Both are mechanical, both are where the signal is, and neither requires a diagnosis nobody should take from a text box.

**Topics** — Health records, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> Reports arrive as PDFs, get read once, and are filed. Nobody lines up March against September — which is exactly where the useful information is, because the direction of travel matters more than a single number.
> 
> The refusal is the design here, not a disclaimer. It never suggests what a result might mean, never proposes a cause, never names a condition. Interpreting a value needs your history, your examination and your medications, and a text box has none of them.
> 
> What it does instead is the two things a person genuinely cannot do quickly: check thirty values against thirty ranges without missing one, and compute what changed since last time.
> 
> One detail I care about: where your report states its own reference range, that is the range used, and each finding says so. Assays differ between labs, so the paper the value came from is the only range that actually applies to it. Using a bundled range over a stated one would generate false flags, and a false flag about your own blood work is worse than silence.

## Gallery — five images

1. Every value with the percentage it sits outside its range
2. Your report's own stated range takes priority, and it says so
3. Trends per test across every report you paste
4. A summary written for a fifteen-minute appointment

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: LabTrack – which lab values are outside range, and which ones are moving

**Comment** — lead with the technical decision, not the benefit

> 31 tests across seven panels with sex-specific reference ranges, the report's own stated range taking priority over the bundled one, percentage deviation outside range, separate handling of values far enough out that laboratories flag them, and per-test trend computation across multiple dated reports.
>
> Every other tool in this space interprets. This deliberately does not: it checks thirty values against thirty ranges without missing one, and lines up four reports to show what is moving. Both are mechanical, both are where the signal is, and neither requires a diagnosis nobody should take from a text box.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> Which lab values are outside range, and which ones are moving

**Body** — no links in the body, offer the link in a comment

> Lab report values in, range flags and trends across reports out.
>
> Every other tool in this space interprets. This deliberately does not: it checks thirty values against thirty ranges without missing one, and lines up four reports to show what is moving. Both are mechanical, both are where the signal is, and neither requires a diagnosis nobody should take from a text box.
>
> Built it because see which lab values are outside range, and which are moving is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> Which lab values are outside range, and which ones are moving.
>
> Lab report values in, range flags and trends across reports out.
>
> Every other tool in this space interprets. This deliberately does not: it checks thirty values against thirty ranges without missing one, and lines up four reports to show what is moving. Both are mechanical, both are where the signal is, and neither requires a diagnosis nobody should take from a text box.
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · ₹499/mo · Clinic custom

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
