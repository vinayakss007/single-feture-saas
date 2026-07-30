# DealBrief — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`dealbrief.abetworks.in`)
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

**Name** — DealBrief

**Tagline** (60 char limit)

> CRM-ready deal briefs from any sales call transcript

**Description**

> Turn any sales call transcript into a CRM-ready deal brief. Sales call transcript in, qualified deal brief out. A meeting recorder summarises what was said. DealBrief judges the deal — what is missing, what is at risk, and who owes what by when.

**Topics** — Revenue operations, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> I built this because I have never once met a sales rep who enjoyed writing CRM notes, and I have never once seen a forecast review that did not stall on "what is the actual next step here".
> 
> Every meeting recorder now gives you an AI summary. A summary tells you what was said. It does not tell you that the economic buyer was never named, that nobody committed to a date, or that a competitor got mentioned twelve minutes in. Those are the things that decide whether the deal closes.
> 
> So DealBrief does the judging instead of the summarising. Paste a transcript and you get next actions attributed to whoever actually said them, MEDDICC gaps flagged against your current pipeline stage, risk flags with severity, a stakeholder map with talk ratios, and a CRM note you can paste without editing.
> 
> It is deterministic — no LLM in the path. Same transcript, same brief, zero cost per call, and nothing invented. There is a REST API and an MCP server too, so your agents can write the CRM update themselves.
> 
> Free tier needs no signup. Curious what it says about your last call.

## Gallery — five images

1. Paste a transcript — Zoom, Meet, Fireflies, Gong or your own notes. Speaker labels are optional.
2. Deal health scored out of 100, with MEDDICC coverage and every risk flag that fired.
3. Next actions extracted with the owner who committed and the date they gave.
4. A CRM activity note formatted to paste straight into the opportunity.
5. Same engine over REST and MCP, so your agents can update the CRM without you.

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: DealBrief – crm-ready deal briefs from any sales call transcript

**Comment** — lead with the technical decision, not the benefit

> MEDDICC coverage scoring, commitment extraction with owner and date attribution, nine risk rules, speaker aliasing and talk-ratio analysis.
>
> A meeting recorder summarises what was said. DealBrief judges the deal — what is missing, what is at risk, and who owes what by when.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> CRM-ready deal briefs from any sales call transcript

**Body** — no links in the body, offer the link in a comment

> Sales call transcript in, qualified deal brief out.
>
> A meeting recorder summarises what was said. DealBrief judges the deal — what is missing, what is at risk, and who owes what by when.
>
> Built it because turn any sales call transcript into a CRM-ready deal brief is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> CRM-ready deal briefs from any sales call transcript.
>
> Sales call transcript in, qualified deal brief out.
>
> A meeting recorder summarises what was said. DealBrief judges the deal — what is missing, what is at risk, and who owes what by when.
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · $29/user/mo · usage from $0.04/brief

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
