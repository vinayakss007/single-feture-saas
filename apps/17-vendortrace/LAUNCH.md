# VendorTrace — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`vendortrace.abetworks.in`)
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

**Name** — VendorTrace

**Tagline** (60 char limit)

> Your vendor list becomes the subprocessor register buyers ask for

**Description**

> Turn a vendor list into a subprocessor register with residency flags. Vendor list in, Article 30 register and subprocessor page out. Subprocessor disclosure is now a standard questionnaire item, and answering 'we use AWS and a few tools' ends the conversation with procurement. This produces the register in the format buyers accept, and flags unknown vendors rather than dropping them.

**Topics** — Privacy compliance, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> Every enterprise deal now asks who you share data with, where they host it, and whether you have a DPA. The answer usually lives in a spreadsheet that was accurate the week before an audit.
> 
> So this takes a vendor list and returns the Article 30 register plus a publishable subprocessor page, with the transfer mechanism worked out per vendor from where your data starts and where it lands.
> 
> The design decision I want to flag: the dataset records each vendor's default hosting region, and every output labels it that way. Most vendors let you pick a region, and your choice overrides the default — so presenting our data as a fact about your account would be evidence you could not defend. Where it matters, the output asks you to confirm.
> 
> An unidentified vendor is listed first, never dropped. And it caps the completeness score while any vendor is unknown, because a proportional score reads 93% with one gap and invites someone to publish it — but one entry reading 'region unknown' is exactly what a reviewer asks about.

## Gallery — five images

1. Hosting jurisdiction and DPA availability per vendor
2. Transfer mechanism derived under GDPR Chapter V and DPDP
3. Sensitive data categories flagged with the extra obligations
4. Article 30 register and a publishable subprocessor page

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: VendorTrace – your vendor list becomes the subprocessor register buyers ask for

**Comment** — lead with the technical decision, not the benefit

> 150+ vendor dataset with hosting jurisdiction and DPA availability, transfer mechanism derived from origin and destination under GDPR Chapter V and India DPDP, sensitive-category detection from the data description, and Article 30 register generation.
>
> Subprocessor disclosure is now a standard questionnaire item, and answering 'we use AWS and a few tools' ends the conversation with procurement. This produces the register in the format buyers accept, and flags unknown vendors rather than dropping them.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> Your vendor list becomes the subprocessor register buyers ask for

**Body** — no links in the body, offer the link in a comment

> Vendor list in, Article 30 register and subprocessor page out.
>
> Subprocessor disclosure is now a standard questionnaire item, and answering 'we use AWS and a few tools' ends the conversation with procurement. This produces the register in the format buyers accept, and flags unknown vendors rather than dropping them.
>
> Built it because turn a vendor list into a subprocessor register with residency flags is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> Your vendor list becomes the subprocessor register buyers ask for.
>
> Vendor list in, Article 30 register and subprocessor page out.
>
> Subprocessor disclosure is now a standard questionnaire item, and answering 'we use AWS and a few tools' ends the conversation with procurement. This produces the register in the format buyers accept, and flags unknown vendors rather than dropping them.
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · ₹1,999/mo · Enterprise custom

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
