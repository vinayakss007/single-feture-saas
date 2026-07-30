# TripSplit — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`tripsplit.abetworks.in`)
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

**Name** — TripSplit

**Tagline** (60 char limit)

> Settle a group trip in three transfers instead of eleven

**Description**

> Settle a group trip in three transfers instead of eleven. Shared expenses in, minimal set of transfers out. Splitting is bookkeeping; minimising the payments is the actual problem. Four transfers instead of six on the sample trip, and a message ready for the group chat — with no account to create and nothing stored afterwards.

**Topics** — Travel money, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> Someone books the hotel, someone else pays for the car, three people cover dinners, and two things were only shared by half the group. Unpicking it takes an evening and a spreadsheet nobody trusts.
> 
> Working out each person's share is bookkeeping. Turning a web of debts into the fewest payments is the interesting part, and it is the difference between everyone sending four awkward transfers and three people sending one each.
> 
> Two deliberate choices. A blank participants column means everyone, because that is what people actually leave blank. And an expense in a currency you gave no rate for is excluded and reported rather than converted at a guess — a wrong rate quietly applied to a third of the trip is much worse than a line you can see is missing.
> 
> It also does not overclaim: finding the provably smallest set of transfers is NP-hard, so the output says the result is very good rather than optimal. On six friends and a weekend that distinction is academic, but saying it is what makes the rest trustworthy.

## Gallery — five images

1. The smallest practical set of transfers, with amounts
2. Every person's paid, share and net position
3. Uneven splits where only some of you shared
4. A message ready to paste into the group chat

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: TripSplit – settle a group trip in three transfers instead of eleven

**Comment** — lead with the technical decision, not the benefit

> Multi-currency normalisation, per-expense participant subsets with blank meaning everyone, net balance computation, and greedy largest-creditor-to-largest-debtor pairing that settles in at most n-1 transfers.
>
> Splitting is bookkeeping; minimising the payments is the actual problem. Four transfers instead of six on the sample trip, and a message ready for the group chat — with no account to create and nothing stored afterwards.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> Settle a group trip in three transfers instead of eleven

**Body** — no links in the body, offer the link in a comment

> Shared expenses in, minimal set of transfers out.
>
> Splitting is bookkeeping; minimising the payments is the actual problem. Four transfers instead of six on the sample trip, and a message ready for the group chat — with no account to create and nothing stored afterwards.
>
> Built it because settle a group trip in three transfers instead of eleven is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> Settle a group trip in three transfers instead of eleven.
>
> Shared expenses in, minimal set of transfers out.
>
> Splitting is bookkeeping; minimising the payments is the actual problem. Four transfers instead of six on the sample trip, and a message ready for the group chat — with no account to create and nothing stored afterwards.
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · ₹299/mo · Teams custom

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
