# ColdAngle — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`coldangle.abetworks.in`)
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

**Name** — ColdAngle

**Tagline** (60 char limit)

> Cold email openers grounded in a fact you actually found

**Description**

> Cold email openers that prove you actually did the research. Public research text in, grounded openers and a deliverability audit out. Every clause traces back to a line in the text you pasted. If the fact is not there, the opener does not assert it — which is why it never produces "I loved your recent post about digital transformation".

**Topics** — Outbound sales, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> AI personalisation is obvious personalisation. "I loved your recent post about digital transformation" fools nobody, reads worse than honest brevity, and burns your domain doing it.
> 
> The reason is structural: if you let a model invent the specificity, it will. So ColdAngle does not. You paste what you actually found — their about page, a job ad, a funding announcement, a founder's post — and it extracts the usable angles, ranks them by how likely each is to earn a reply, and shows you the exact sentence each one came from. Every clause in the output traces back to your input. No LLM in the path.
> 
> Nine angle types. The strongest by far is "they described the problem themselves", because then you are not pitching a problem, you are quoting theirs back to them. A funding round is next, because budget objections are weakest in the ninety days after a round closes. A mission statement is worth nothing and it says so.
> 
> You also get three complete emails, all under 120 words, and a fourteen-point deliverability audit that catches trigger words, shouting, link stuffing and "just checking in" before you send.
> 
> If your research text has nothing usable in it, it tells you that instead of making something up. That is a signal to find a better source.

## Gallery — five images

1. Paste what you found — about page, job ad, press release or a founder's post.
2. Angles ranked by reply likelihood, each quoting the sentence it came from.
3. Three complete emails, all under 120 words.
4. A fourteen-point deliverability audit before you send.
5. Specificity score — if it is low, it is a template and it will be treated like one.

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: ColdAngle – cold email openers grounded in a fact you actually found

**Comment** — lead with the technical decision, not the benefit

> Nine research angle types ranked by reply likelihood, each quoting the sentence it was found in, plus 14 content-side deliverability checks and a specificity score.
>
> Every clause traces back to a line in the text you pasted. If the fact is not there, the opener does not assert it — which is why it never produces "I loved your recent post about digital transformation".
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> Cold email openers grounded in a fact you actually found

**Body** — no links in the body, offer the link in a comment

> Public research text in, grounded openers and a deliverability audit out.
>
> Every clause traces back to a line in the text you pasted. If the fact is not there, the opener does not assert it — which is why it never produces "I loved your recent post about digital transformation".
>
> Built it because cold email openers that prove you actually did the research is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> Cold email openers grounded in a fact you actually found.
>
> Public research text in, grounded openers and a deliverability audit out.
>
> Every clause traces back to a line in the text you pasted. If the fact is not there, the opener does not assert it — which is why it never produces "I loved your recent post about digital transformation".
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · $29/mo · Agency custom

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
