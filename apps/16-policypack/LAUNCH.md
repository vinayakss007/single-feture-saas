# PolicyPack — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`policypack.abetworks.in`)
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

**Name** — PolicyPack

**Tagline** (60 char limit)

> The SOC 2 policy set an auditor expects, from ten answers

**Description**

> The SOC 2 policy set an auditor expects, from ten answers. Company profile in, policy set with control mapping and gap list out. Downloaded templates describe a company with a security team and a SIEM, which an auditor reads before asking for evidence you do not have. This describes your actual company, and states plainly which controls your headcount cannot satisfy.

**Topics** — Security compliance, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> An enterprise buyer wants your access control policy, your incident response plan and your vendor management process. You have none written down, the deal is at legal, and it is due this week.
> 
> Vanta and Drata are the right answer eventually — continuous monitoring genuinely matters and this does not replace it. But they are annual contracts scoped for a company already committed to an audit.
> 
> So this generates the twelve documents auditors ask for, each mapped to both SOC 2 TSC and ISO 27001 Annex A, with the evidence each one will be tested against.
> 
> The part I care most about is the honesty. It refuses to assert controls you do not operate — at under six people, separation of duties is flagged as a documented compensating-control decision rather than claimed, because a policy asserting a control you lack is strictly worse than no policy. It converts an omission into a documented failure. And it says clearly that a Type II is an opinion on a window you cannot backdate, only start.

## Gallery — five images

1. 12 to 16 policies, composed for your actual company
2. Every policy mapped to SOC 2 TSC and ISO 27001 Annex A
3. Gap list in the order an auditor tests
4. Controls your headcount cannot satisfy, stated rather than asserted

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: PolicyPack – the soc 2 policy set an auditor expects, from ten answers

**Comment** — lead with the technical decision, not the benefit

> Deterministic template composition producing 12 to 16 policies depending on region and data types, each mapped to SOC 2 Trust Services Criteria and ISO 27001:2022 Annex A controls with the evidence it will be tested against, plus a gap list ordered by what auditors test first.
>
> Downloaded templates describe a company with a security team and a SIEM, which an auditor reads before asking for evidence you do not have. This describes your actual company, and states plainly which controls your headcount cannot satisfy.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> The SOC 2 policy set an auditor expects, from ten answers

**Body** — no links in the body, offer the link in a comment

> Company profile in, policy set with control mapping and gap list out.
>
> Downloaded templates describe a company with a security team and a SIEM, which an auditor reads before asking for evidence you do not have. This describes your actual company, and states plainly which controls your headcount cannot satisfy.
>
> Built it because the SOC 2 policy set an auditor expects, from ten answers is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> The SOC 2 policy set an auditor expects, from ten answers.
>
> Company profile in, policy set with control mapping and gap list out.
>
> Downloaded templates describe a company with a security team and a SIEM, which an auditor reads before asking for evidence you do not have. This describes your actual company, and states plainly which controls your headcount cannot satisfy.
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · ₹2,499/mo · Enterprise custom

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
