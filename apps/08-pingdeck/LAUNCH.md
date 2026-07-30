# PingDeck — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`pingdeck.abetworks.in`)
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

**Name** — PingDeck

**Tagline** (60 char limit)

> Uptime plus the SSL and domain expiry nobody monitors

**Description**

> The three outages nobody monitors, checked in one place. URLs in, availability plus certificate and domain expiry out. Uptime tools are a commodity. Expiring certificates and expiring domains cause a large share of small-site outages and almost nothing checks both — here they are free.

**Topics** — Monitoring, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> Certificates expire on a Saturday. Auto-renewal works right up until the day it silently does not, and then every browser shows an interstitial and your traffic goes to zero until someone notices.
> 
> Domains are worse. The renewal notice went to an inbox nobody reads, on a card that expired. That kills the site and the email on the domain at the same time, which is exactly why nobody finds out quickly.
> 
> PingDeck checks all three failure classes in one call. The TLS check is a real handshake — it reads the peer certificate for issuer, subject alternative names and the not-after date, and tells you whether the hostname actually matches. The domain check queries the registry directly over RDAP, so a lapsing domain shows up weeks out. And the HTTP check follows redirects manually so you see every hop, because chained redirects are the most common quiet performance bug.
> 
> You also get a self-contained HTML status page with no external dependencies. Host it on a different provider to your app — a status page that goes down with the thing it monitors is not a status page.
> 
> Free tier checks ten URLs on demand. Continuous checking and alerting is the paid tier, but the certificate and domain checks are free, because those are the ones that actually catch people out.

## Gallery — five images

1. Paste up to ten URLs. The scheme is optional.
2. Overall health with per-endpoint status, response time and redirect count.
3. Real certificate detail — issuer, subject, days remaining and hostname match.
4. Domain registration expiry straight from the registry over RDAP.
5. A self-contained status page. One file, no dependencies, host it anywhere.

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: PingDeck – uptime plus the ssl and domain expiry nobody monitors

**Comment** — lead with the technical decision, not the benefit

> Manual redirect-chain following for real timing, a genuine TLS handshake reading the peer certificate with SAN hostname matching, and registry RDAP lookup for domain expiry.
>
> Uptime tools are a commodity. Expiring certificates and expiring domains cause a large share of small-site outages and almost nothing checks both — here they are free.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> Uptime plus the SSL and domain expiry nobody monitors

**Body** — no links in the body, offer the link in a comment

> URLs in, availability plus certificate and domain expiry out.
>
> Uptime tools are a commodity. Expiring certificates and expiring domains cause a large share of small-site outages and almost nothing checks both — here they are free.
>
> Built it because the three outages nobody monitors, checked in one place is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> Uptime plus the SSL and domain expiry nobody monitors.
>
> URLs in, availability plus certificate and domain expiry out.
>
> Uptime tools are a commodity. Expiring certificates and expiring domains cause a large share of small-site outages and almost nothing checks both — here they are free.
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · $19/mo · $79/mo agency

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
