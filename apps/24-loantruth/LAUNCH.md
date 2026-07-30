# LoanTruth — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`loantruth.abetworks.in`)
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

**Name** — LoanTruth

**Tagline** (60 char limit)

> The real interest rate on your loan, not the one you were quoted

**Description**

> The real interest rate on your loan, not the one you were quoted. Sanction letter terms in, true APR and amortisation out. Every EMI calculator computes the payment. None tells you that fees deducted from disbursal mean you pay interest on money you never received — on the sample loan that is 0.36 points of hidden APR, and no sanction letter states it.

**Topics** — Personal finance, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> The rate a lender quotes is not the rate you pay. Processing fee, GST on that fee, and insurance are deducted from disbursal — so you are charged interest on the full sanctioned amount while receiving less than it. No sanction letter states the resulting APR.
> 
> So this solves it, by bisection rather than a closed-form approximation, because approximations drift precisely where fees are large — the case worth exposing.
> 
> The number that changes behaviour, though, is a different one: the month your outstanding balance finally halves. On a twenty-year loan that is around month 160, not month 120. Once you can see that, prepaying early stops being an abstract idea.
> 
> It is explicit about what it does not know — legal, valuation, CERSAI and stamp charges are billed outside the sanction letter and are not in the APR unless you enter them. It also does not apply tax relief, because that depends on your regime and your other claims, and folding in an assumed benefit would make the headline wrong for most people.

## Gallery — five images

1. True APR against the quoted rate, with the gap in points
2. The month your outstanding balance finally halves
3. Prepayment saving and months removed, re-amortised
4. Six questions for the loan officer, written to be answered

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: LoanTruth – the real interest rate on your loan, not the one you were quoted

**Comment** — lead with the technical decision, not the benefit

> Reducing-balance EMI and full amortisation, effective APR solved by bisection against the amount actually disbursed after fees, GST on the processing fee, prepayment re-amortisation, one-point rate-shock pricing, and the month the outstanding balance finally halves.
>
> Every EMI calculator computes the payment. None tells you that fees deducted from disbursal mean you pay interest on money you never received — on the sample loan that is 0.36 points of hidden APR, and no sanction letter states it.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> The real interest rate on your loan, not the one you were quoted

**Body** — no links in the body, offer the link in a comment

> Sanction letter terms in, true APR and amortisation out.
>
> Every EMI calculator computes the payment. None tells you that fees deducted from disbursal mean you pay interest on money you never received — on the sample loan that is 0.36 points of hidden APR, and no sanction letter states it.
>
> Built it because the real interest rate on your loan, not the one you were quoted is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> The real interest rate on your loan, not the one you were quoted.
>
> Sanction letter terms in, true APR and amortisation out.
>
> Every EMI calculator computes the payment. None tells you that fees deducted from disbursal mean you pay interest on money you never received — on the sample loan that is 0.36 points of hidden APR, and no sanction letter states it.
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · ₹499/mo · Broker custom

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
