# MediBillCheck — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`medibillcheck.abetworks.in`)
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

**Name** — MediBillCheck

**Tagline** (60 char limit)

> Find the errors in a hospital bill before you pay it

**Description**

> Find the errors in a hospital bill before you pay it. Itemised hospital bill in, questionable charges and a query letter out. Bill audit services take a percentage and a fortnight. This runs on the bill you are holding at the discharge counter, and every finding is a rupee figure with a line number you can point at. It makes no clinical judgement, which is exactly why it can be trusted on the parts it does judge.

**Topics** — Health finance, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> You are exhausted, someone is unwell, there is a queue behind you, and the bill is eleven pages. The only number anyone reads is the total. Errors found after payment are far harder to reverse.
> 
> So this checks the parts that are objectively checkable: does quantity times rate equal the line, do the lines equal the stated total, is the same amount charged twice, and are there consumables your insurer will decline.
> 
> The finding people are most surprised by is the proportionate deduction. Exceed your policy's room rent cap and most indemnity policies scale down the surgeon, anaesthetist and nursing charges by the same ratio. On the sample bill that is ₹86,000 — far more than the room difference itself. People discover it from the settlement letter weeks later, when the room is long since vacated.
> 
> What it will not do is tell you whether a treatment was necessary, or whether a rate is fair. Those are a clinical judgement and a pricing opinion respectively, and a bill parser has no business offering either. Saying so is what makes the rest credible.

## Gallery — five images

1. Every finding as a rupee figure with its line number
2. The proportionate deduction your room category triggers
3. Twelve categories of consumable insurers routinely decline
4. A query letter that offers to settle the undisputed balance

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: MediBillCheck – find the errors in a hospital bill before you pay it

**Comment** — lead with the technical decision, not the benefit

> Line parsing with quantity-times-rate reconciliation and a lines-versus-stated-total check, twelve categories of commonly declined consumable, identical-amount duplicate detection, proportionate-deduction arithmetic from room cap and sum insured, and GST-on-exempt-services detection.
>
> Bill audit services take a percentage and a fortnight. This runs on the bill you are holding at the discharge counter, and every finding is a rupee figure with a line number you can point at. It makes no clinical judgement, which is exactly why it can be trusted on the parts it does judge.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> Find the errors in a hospital bill before you pay it

**Body** — no links in the body, offer the link in a comment

> Itemised hospital bill in, questionable charges and a query letter out.
>
> Bill audit services take a percentage and a fortnight. This runs on the bill you are holding at the discharge counter, and every finding is a rupee figure with a line number you can point at. It makes no clinical judgement, which is exactly why it can be trusted on the parts it does judge.
>
> Built it because find the errors in a hospital bill before you pay it is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> Find the errors in a hospital bill before you pay it.
>
> Itemised hospital bill in, questionable charges and a query letter out.
>
> Bill audit services take a percentage and a fortnight. This runs on the bill you are holding at the discharge counter, and every finding is a rupee figure with a line number you can point at. It makes no clinical judgement, which is exactly why it can be trusted on the parts it does judge.
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · ₹999/mo · Claims custom

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
