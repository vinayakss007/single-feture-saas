# PaySlipIN — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`payslipin.abetworks.in`)
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

**Name** — PaySlipIN

**Tagline** (60 char limit)

> One CTC figure becomes a compliant Indian payslip

**Description**

> One CTC figure becomes a compliant Indian payslip. Annual CTC in, full payslip with PF, ESI, PT and TDS out. A full HRMS is the wrong shape and price for four employees. This computes one correct payslip and shows every threshold it used, so you can check it against the current Finance Act rather than trusting a black box.

**Topics** — Payroll compliance, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> Basic, HRA, PF ceilings, ESI thresholds, professional tax slabs that differ by state. Rebuilt in a spreadsheet every year, and one wrong cell makes every payslip that month wrong.
> 
> The part employers cannot usually show an employee is the regime comparison. Old regime with HRA exemption and 80C, against new regime with lower rates and a bigger standard deduction. Employees are entitled to choose, and the choice gets made on a guess.
> 
> So both are computed, with the slab-by-slab working shown and the annual difference in rupees.
> 
> Two details I was careful about. Employer PF and gratuity come out of CTC, not on top — that is the single most common CTC misunderstanding and it makes spreadsheets overstate take-home. And EPF already counts inside the ₹1.5 lakh 80C cap, so the output tells you when declared investments are wasted, which is worth knowing before the employee invests more.
> 
> Every threshold used is listed in the output, because tax law changes annually and a payroll number you cannot check is one you cannot defend.

## Gallery — five images

1. Salary structure with employer costs correctly inside CTC
2. PF with the statutory ceiling and the EPS pension split shown
3. Both tax regimes compared with the annual saving in rupees
4. A printable payslip and a payroll register CSV row

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: PaySlipIN – one ctc figure becomes a compliant indian payslip

**Comment** — lead with the technical decision, not the benefit

> Statutory arithmetic: salary structure from CTC with employer PF and gratuity taken out rather than added, PF with the ₹15,000 ceiling and the 8.33% EPS split, ESI eligibility, professional tax slabs for twelve states, and TDS under both regimes with slab-by-slab working, 87A rebate and surcharge.
>
> A full HRMS is the wrong shape and price for four employees. This computes one correct payslip and shows every threshold it used, so you can check it against the current Finance Act rather than trusting a black box.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> One CTC figure becomes a compliant Indian payslip

**Body** — no links in the body, offer the link in a comment

> Annual CTC in, full payslip with PF, ESI, PT and TDS out.
>
> A full HRMS is the wrong shape and price for four employees. This computes one correct payslip and shows every threshold it used, so you can check it against the current Finance Act rather than trusting a black box.
>
> Built it because one CTC figure becomes a compliant Indian payslip is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> One CTC figure becomes a compliant Indian payslip.
>
> Annual CTC in, full payslip with PF, ESI, PT and TDS out.
>
> A full HRMS is the wrong shape and price for four employees. This computes one correct payslip and shows every threshold it used, so you can check it against the current Finance Act rather than trusting a black box.
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · ₹999/mo · Practice custom

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
