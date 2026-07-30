# AnswerReady — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`answerready.abetworks.in`)
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

**Name** — AnswerReady

**Tagline** (60 char limit)

> Can ChatGPT and Perplexity actually read your site?

**Description**

> Find out whether AI search can actually read your site. URL in, AI answer-engine readiness score and the two missing files out. Ranking tools measure backlinks. None of them tell you that you are blocking OAI-SearchBot, or that your content does not exist without JavaScript — which is what decides whether you get cited in an answer.

**Topics** — AI search optimisation, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> A lot of sites added GPTBot to robots.txt in 2023 to protect their content. The result in 2026 is being invisible in the answers where buyers now start their research. Most of those teams do not know it is still there.
> 
> AnswerReady shows you your site the way an answer engine sees it. It parses your robots.txt properly — real user-agent groups, longest-match-wins precedence — and reports per crawler whether GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot and Bytespider can reach the page, and which rule decided it.
> 
> Then the check almost nothing else does: how much content exists without JavaScript. Most AI crawlers do not execute it, so if your page is a client-rendered shell they see an empty div and your competitor gets cited instead. It measures the real text in the server response and tells you.
> 
> Plus structured data types present and missing, quotability signals, and it generates the two files you are probably missing — an llms.txt built from your actual content and a valid JSON-LD block populated from your real page.
> 
> On llms.txt: adoption is still growing, so treat it as cheap insurance rather than a guarantee. It costs you one file.
> 
> Whether to allow AI crawlers is a business decision and the report does not make it for you. But you should know which choice you have currently made.

## Gallery — five images

1. Enter any page you want cited in AI answers.
2. Readiness score, with critical crawler blocks called out first.
3. Per-crawler access, and the exact robots.txt rule that decided it.
4. Content measured without JavaScript — what a non-rendering crawler actually receives.
5. A generated llms.txt and JSON-LD block, built from your real content.

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: AnswerReady – can chatgpt and perplexity actually read your site?

**Comment** — lead with the technical decision, not the benefit

> A real robots.txt group parser with longest-match precedence checked against seven AI crawlers, no-JavaScript content measurement, JSON-LD extraction and type inventory, and quotability signals. Generates llms.txt and a JSON-LD block from your real content.
>
> Ranking tools measure backlinks. None of them tell you that you are blocking OAI-SearchBot, or that your content does not exist without JavaScript — which is what decides whether you get cited in an answer.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> Can ChatGPT and Perplexity actually read your site?

**Body** — no links in the body, offer the link in a comment

> URL in, AI answer-engine readiness score and the two missing files out.
>
> Ranking tools measure backlinks. None of them tell you that you are blocking OAI-SearchBot, or that your content does not exist without JavaScript — which is what decides whether you get cited in an answer.
>
> Built it because find out whether AI search can actually read your site is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> Can ChatGPT and Perplexity actually read your site?.
>
> URL in, AI answer-engine readiness score and the two missing files out.
>
> Ranking tools measure backlinks. None of them tell you that you are blocking OAI-SearchBot, or that your content does not exist without JavaScript — which is what decides whether you get cited in an answer.
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · $39/mo · Agency custom

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
