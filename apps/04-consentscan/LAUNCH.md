# ConsentScan — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`consentscan.abetworks.in`)
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

**Name** — ConsentScan

**Tagline** (60 char limit)

> Find your DPDP and GDPR violations before a regulator does

**Description**

> Scan any website for India DPDP and GDPR consent compliance. URL in, prioritised DPDP and GDPR finding list out. Every finding names the specific DPDP section or GDPR article it touches, and is ordered by penalty exposure. Most scanners just say "cookie banner missing".

**Topics** — Privacy compliance, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> If you collect a name, an email or a phone number from anyone in India, the DPDP Act makes you a Data Fiduciary with notice, consent and grievance obligations. Most Indian sites have none of them in place, and the maximum penalty for consent failures is ₹250 crore.
> 
> The most common violation is also the most invisible: Google Analytics, Meta Pixel and Hotjar all load on first paint, long before the cookie banner appears. A banner that does not actually block anything is decoration, not compliance. ConsentScan detects exactly that case — it tells you when you have a consent platform installed and trackers firing anyway.
> 
> 24 checks in about eight seconds. It fetches your privacy policy and reads it rather than assuming a link is enough, so it can tell you that you have no consent withdrawal mechanism and no named Grievance Officer, which DPDP specifically requires and GDPR does not phrase the same way.
> 
> Every finding cites the obligation it breaches and the specific fix, ordered by penalty exposure.
> 
> One honest caveat: this is not legal advice and I would be suspicious of any tool that claimed to be. Use it to brief your counsel, not to replace them.
> 
> Free, no signup, nothing stored.

## Gallery — five images

1. Enter any URL. The scan takes about eight seconds.
2. Compliance score with high-severity findings separated, weighted by which regime matters to you.
3. Trackers detected in the initial HTML — the ones that run before consent is possible.
4. Cookies on the first response, classified as necessary, analytics or advertising.
5. A remediation checklist citing the DPDP section or GDPR article behind each finding.

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: ConsentScan – find your dpdp and gdpr violations before a regulator does

**Comment** — lead with the technical decision, not the benefit

> Fetches the page and its privacy policy, then runs 24 checks: 16 tracker signatures, cookie classification from Set-Cookie headers, 11 consent platform signatures, nine privacy-notice disclosure checks and five security headers.
>
> Every finding names the specific DPDP section or GDPR article it touches, and is ordered by penalty exposure. Most scanners just say "cookie banner missing".
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> Find your DPDP and GDPR violations before a regulator does

**Body** — no links in the body, offer the link in a comment

> URL in, prioritised DPDP and GDPR finding list out.
>
> Every finding names the specific DPDP section or GDPR article it touches, and is ordered by penalty exposure. Most scanners just say "cookie banner missing".
>
> Built it because scan any website for India DPDP and GDPR consent compliance is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> Find your DPDP and GDPR violations before a regulator does.
>
> URL in, prioritised DPDP and GDPR finding list out.
>
> Every finding names the specific DPDP section or GDPR article it touches, and is ordered by penalty exposure. Most scanners just say "cookie banner missing".
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · $59/mo · Enterprise custom

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
