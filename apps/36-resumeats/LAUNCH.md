# ResumeATS — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`resumeats.abetworks.in`)
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

**Name** — ResumeATS

**Tagline** (60 char limit)

> What an ATS actually sees in your resume

**Description**

> What an ATS actually sees in your resume. Resume text and job description in, ATS parse score with keyword match rate and rejection flags out. Not a resume builder — an ATS simulator that shows exactly what gets extracted, what gets lost, and why 70% of resumes are rejected before a human reads them.

**Topics** — Career tools, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> 

## Gallery — five images



Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: ResumeATS – what an ats actually sees in your resume

**Comment** — lead with the technical decision, not the benefit

> Section parsing (contact, summary, experience, education, skills, certifications), keyword match rate against job description, quantified achievement count, action verb scoring, employment gap detection, format friendliness scoring, and ATS-parsed view generation.
>
> Not a resume builder — an ATS simulator that shows exactly what gets extracted, what gets lost, and why 70% of resumes are rejected before a human reads them.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> What an ATS actually sees in your resume

**Body** — no links in the body, offer the link in a comment

> Resume text and job description in, ATS parse score with keyword match rate and rejection flags out.
>
> Not a resume builder — an ATS simulator that shows exactly what gets extracted, what gets lost, and why 70% of resumes are rejected before a human reads them.
>
> Built it because what an ATS actually sees in your resume is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> What an ATS actually sees in your resume.
>
> Resume text and job description in, ATS parse score with keyword match rate and rejection flags out.
>
> Not a resume builder — an ATS simulator that shows exactly what gets extracted, what gets lost, and why 70% of resumes are rejected before a human reads them.
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · $19/mo · Enterprise custom

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
