# PromptShield — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`promptshield.abetworks.in`)
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

**Name** — PromptShield

**Tagline** (60 char limit)

> Prompt injection and PII firewall for AI agents, in one call

**Description**

> One API call between untrusted text and your agent. Untrusted text in, verdict plus redacted text out. A model asked to judge untrusted text is itself reading untrusted text and can be talked out of its judgement. Deterministic rules cannot be persuaded, run in single-digit milliseconds and cost nothing per call.

**Topics** — AI security, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> The moment your agent reads a support ticket, a scraped page or an uploaded document, an attacker controls part of your prompt. That is the whole attack surface, and most teams ship without addressing it.
> 
> It only becomes an incident because of tools. A model that can only talk produces a bad answer. A model with email, database or shell access produces a breach. Injection risk scales exactly with the permissions you handed it.
> 
> PromptShield goes in front. One POST with the text your agent is about to read, and you get a verdict — allow, review or block — every detection with its class and the matched span, and a redacted copy with PII replaced by stable typed tokens like [CARD_1] so the model never sees the value but your application still can.
> 
> Nine attack classes: instruction override, persona hijack, system-prompt exfiltration, tool abuse, delimiter injection, encoding evasion, markdown exfiltration channels, non-English override and authority spoofing.
> 
> Deliberately not a model. A model asked to judge untrusted text is reading untrusted text and can be argued out of its judgement — and it adds latency and cost to every request. Rules cannot be persuaded. Under five milliseconds, no inference cost.
> 
> Card numbers are Luhn-checked and Aadhaar numbers Verhoeff-checked, so your 12-digit order reference does not get reported as a national ID.
> 
> And the honest part: nothing stops all prompt injection. Anyone telling you otherwise is selling something. This is the first layer. Keep your tool permissions minimal too.

## Gallery — five images

1. POST the text your agent is about to read. One call, no configuration.
2. Allow, review or block — with the threshold set by the policy you chose.
3. Every detection with its attack class and the exact matched span.
4. PII and secrets replaced with stable typed tokens you can reverse on your side.
5. Three policy levels, so an agent with shell access can be stricter than a summariser.

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: PromptShield – prompt injection and pii firewall for ai agents, in one call

**Comment** — lead with the technical decision, not the benefit

> 14 injection rules across nine attack classes, plus 12 PII and secret types with Luhn validation for card numbers and Verhoeff validation for Aadhaar, so a 12-digit order reference is never reported as a national ID.
>
> A model asked to judge untrusted text is itself reading untrusted text and can be talked out of its judgement. Deterministic rules cannot be persuaded, run in single-digit milliseconds and cost nothing per call.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> Prompt injection and PII firewall for AI agents, in one call

**Body** — no links in the body, offer the link in a comment

> Untrusted text in, verdict plus redacted text out.
>
> A model asked to judge untrusted text is itself reading untrusted text and can be talked out of its judgement. Deterministic rules cannot be persuaded, run in single-digit milliseconds and cost nothing per call.
>
> Built it because one API call between untrusted text and your agent is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> Prompt injection and PII firewall for AI agents, in one call.
>
> Untrusted text in, verdict plus redacted text out.
>
> A model asked to judge untrusted text is itself reading untrusted text and can be talked out of its judgement. Deterministic rules cannot be persuaded, run in single-digit milliseconds and cost nothing per call.
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free 1k/mo · $0.20/1k calls · self-hosted custom

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
