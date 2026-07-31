# DMARCFix — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`dmarcfix.abetworks.in`)
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

**Name** — DMARCFix

**Tagline** (60 char limit)

> Paste your SPF, DKIM and DMARC — get the corrected records

**Description**

> Paste your SPF, DKIM and DMARC — get the corrected records. Email auth records in, lookup count, failures and corrected records out. SPF breaks silently at ten DNS lookups — permerror, no error anywhere an operator would look. This counts them from pasted records, so you can test a change before publishing it and run the check in CI.

**Topics** — Email deliverability, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> Gmail and Yahoo now reject bulk mail that fails authentication rather than filtering it. And SPF fails in the least helpful way possible: past ten DNS lookups it returns permerror, and nothing logs that anywhere you would look. Mail just stops authenticating.
> 
> Every SaaS tool you send through adds includes, and every include costs lookups. So the lookup count is the whole product, and it has to be right.
> 
> Which is why, where an include's nested cost is genuinely unknown, it says unknown rather than assuming 1. A confident wrong count on the one mechanism that matters would send someone away believing they had headroom they do not have — worse than admitting the gap.
> 
> It also refuses to just say 'set p=reject'. There is a staged plan from none to quarantine with a percentage to reject, because jumping straight to reject is how a company discovers its invoicing system was sending unauthenticated mail — by losing a week of invoices.
> 
> Records are pasted, not looked up, so you can test a change before publishing it.

## Gallery — five images

1. SPF lookups counted mechanism by mechanism against the limit of ten
2. Multiple records, +all and deprecated ptr caught
3. Gmail and Yahoo bulk-sender requirements checked one by one
4. Corrected records plus a staged rollout to enforcement

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: DMARCFix – paste your spf, dkim and dmarc — get the corrected records

**Comment** — lead with the technical decision, not the benefit

> SPF mechanism parsing with nested include costs for 30 known providers counted against the hard limit of ten, multiple-record and unsafe-all detection, DMARC tag parsing with alignment analysis, sender coverage checks, and the Gmail and Yahoo bulk-sender requirements.
>
> SPF breaks silently at ten DNS lookups — permerror, no error anywhere an operator would look. This counts them from pasted records, so you can test a change before publishing it and run the check in CI.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> Paste your SPF, DKIM and DMARC — get the corrected records

**Body** — no links in the body, offer the link in a comment

> Email auth records in, lookup count, failures and corrected records out.
>
> SPF breaks silently at ten DNS lookups — permerror, no error anywhere an operator would look. This counts them from pasted records, so you can test a change before publishing it and run the check in CI.
>
> Built it because paste your SPF, DKIM and DMARC — get the corrected records is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> Paste your SPF, DKIM and DMARC — get the corrected records.
>
> Email auth records in, lookup count, failures and corrected records out.
>
> SPF breaks silently at ten DNS lookups — permerror, no error anywhere an operator would look. This counts them from pasted records, so you can test a change before publishing it and run the check in CI.
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · ₹1,499/mo · Agency custom

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
