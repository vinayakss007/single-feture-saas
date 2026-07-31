# AIActNotice — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`aiactnotice.abetworks.in`)
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

**Name** — AIActNotice

**Tagline** (60 char limit)

> The EU AI Act notice your product legally needs, in one minute

**Description**

> The EU AI Act notice your product legally needs, in one minute. AI system description in, risk tier and Article 50 notice out. Every compliance platform in this category is priced for a programme, and every AI-written classification is unreproducible. This applies the published criteria deterministically and cites the article that produced each conclusion — which is what an auditor asks for.

**Topics** — AI governance, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> Article 50 transparency obligations apply from 2 August 2026, and most teams shipping an AI feature still cannot say whether they are a provider or a deployer, or whether they are limited-risk or high-risk.
> 
> The Act answers this with criteria, not opinion. But finding them means reading 113 articles, and the tools that do it for you start at €5,000 a year because they are built for companies running a whole governance programme.
> 
> So this does one thing: you describe what your system does, answer six questions, and get the risk tier with the article that produced it, the Article 50 notice text to publish, the obligations you have not met, and an evidence record with a content hash.
> 
> That last part is the reason it is not an LLM. An auditor's first question about a compliance artifact is whether you can reproduce it. Ask a model twice and you may get two answers — which is the opposite of what an audit trail is for. Same answers here always produce the same classification and the same hash.
> 
> It is also explicit about what it could not determine, rather than assuming anything unstated is benign.

## Gallery — five images

1. Risk tier with the article and annex cited for each conclusion
2. The Article 50 transparency notice, ready to publish
3. Obligation gap list split by provider and deployer role
4. Reproducible evidence record with a content hash

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: AIActNotice – the eu ai act notice your product legally needs, in one minute

**Comment** — lead with the technical decision, not the benefit

> A decision table over the Act's own criteria: Article 5 prohibitions, Annex III sector plus output-type tests, Article 50 transparency triggers, and per-role obligation sets. Emits an FNV-1a content hash so two assessments can be compared.
>
> Every compliance platform in this category is priced for a programme, and every AI-written classification is unreproducible. This applies the published criteria deterministically and cites the article that produced each conclusion — which is what an auditor asks for.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> The EU AI Act notice your product legally needs, in one minute

**Body** — no links in the body, offer the link in a comment

> AI system description in, risk tier and Article 50 notice out.
>
> Every compliance platform in this category is priced for a programme, and every AI-written classification is unreproducible. This applies the published criteria deterministically and cites the article that produced each conclusion — which is what an auditor asks for.
>
> Built it because the EU AI Act notice your product legally needs, in one minute is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> The EU AI Act notice your product legally needs, in one minute.
>
> AI system description in, risk tier and Article 50 notice out.
>
> Every compliance platform in this category is priced for a programme, and every AI-written classification is unreproducible. This applies the published criteria deterministically and cites the article that produced each conclusion — which is what an auditor asks for.
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
