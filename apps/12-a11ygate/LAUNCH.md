# A11yGate — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`a11ygate.abetworks.in`)
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

**Name** — A11yGate

**Tagline** (60 char limit)

> Every WCAG failure in your HTML, plus the EAA statement to publish

**Description**

> Paste your HTML, get every WCAG 2.2 failure and the EAA statement. HTML in, WCAG failures with fixes and a publishable accessibility statement out. Browser extensions test a rendered page, so they cannot run in CI or on a component that is not deployed. This runs on source with no browser, maps findings to EN 301 549 as well as WCAG, and generates the accessibility statement — which is a legal deliverable, not a report.

**Topics** — Accessibility compliance, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> The European Accessibility Act has been enforceable since June 2025. Member states can investigate complaints, demand remediation and remove products from the EU market. Most teams find out from a procurement questionnaire.
> 
> A manual audit is a four-figure engagement and a two-week wait, and the majority of what it finds is mechanical — missing alt text, unlabelled inputs, broken heading order. Those could have been caught in the pull request that introduced them.
> 
> So this takes HTML rather than a URL. That one decision means it stays deterministic, works on pages behind a login and components that are not deployed, and runs in CI without a headless browser.
> 
> What I am careful about: it says plainly that passing does not mean compliant. Roughly a third of WCAG is mechanically checkable; the rest needs a person. The generated accessibility statement says so too, because a statement that overclaims is worse than none.

## Gallery — five images

1. 34 checks with the offending element quoted and a fix per finding
2. WCAG success criterion and EN 301 549 clause on every finding
3. The accessibility statement, generated from actual results
4. The list of checks that still require a human

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: A11yGate – every wcag failure in your html, plus the eaa statement to publish

**Comment** — lead with the technical decision, not the benefit

> 34 deterministic checks over raw markup: image alternatives, form labelling, heading structure, landmarks, link and button naming, language, duplicate ids, tables, iframes, focus order, autoplay, ARIA misuse, and contrast computed from inline styles.
>
> Browser extensions test a rendered page, so they cannot run in CI or on a component that is not deployed. This runs on source with no browser, maps findings to EN 301 549 as well as WCAG, and generates the accessibility statement — which is a legal deliverable, not a report.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> Every WCAG failure in your HTML, plus the EAA statement to publish

**Body** — no links in the body, offer the link in a comment

> HTML in, WCAG failures with fixes and a publishable accessibility statement out.
>
> Browser extensions test a rendered page, so they cannot run in CI or on a component that is not deployed. This runs on source with no browser, maps findings to EN 301 549 as well as WCAG, and generates the accessibility statement — which is a legal deliverable, not a report.
>
> Built it because paste your HTML, get every WCAG 2.2 failure and the EAA statement is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> Every WCAG failure in your HTML, plus the EAA statement to publish.
>
> HTML in, WCAG failures with fixes and a publishable accessibility statement out.
>
> Browser extensions test a rendered page, so they cannot run in CI or on a component that is not deployed. This runs on source with no browser, maps findings to EN 301 549 as well as WCAG, and generates the accessibility statement — which is a legal deliverable, not a report.
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · ₹1,999/mo · Agency custom

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
