# Repurpose10 — launch kit

Everything needed to ship this on Product Hunt, Hacker News and Reddit. Copy is written to be used as-is.

## Pre-flight

- [ ] Deployed and reachable on a real domain (`repurpose10.abetworks.in`)
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

**Name** — Repurpose10

**Tagline** (60 char limit)

> Turn one post into ten, each written for its platform

**Description**

> One thing you wrote becomes ten platform-native posts. One long-form piece in, eleven platform-native outputs out. It selects and restructures your sentences rather than rewriting them. Your voice survives and no fact gets invented.

**Topics** — Content marketing, Artificial Intelligence, SaaS, Developer Tools, API

**First comment** — post this immediately after the launch goes live

> Cross-posting identical text is why most repurposing gets no reach. A LinkedIn post dropped into X gets truncated. An X thread dropped into LinkedIn looks like a ransom note. And doing it properly is forty minutes of counting characters and moving links around — real work with zero creative value.
> 
> Repurpose10 does that forty minutes. Eleven outputs: X thread, X single, LinkedIn, Instagram, YouTube title and description, newsletter intro, Reddit, Quora, Threads and a WhatsApp broadcast. Each generated inside the platform's actual limit, with the character count shown against it, so nothing gets silently truncated at publish time.
> 
> The part I care about most: it does not rewrite your words with a model. It selects, ranks and restructures the sentences you already wrote. A model rewriting your copy is how a distinctive voice turns into the same beige paragraph everyone else is publishing, and how facts quietly get invented.
> 
> It also ranks your candidate hooks. Every long piece has one sentence that would work as an opener, it is almost never the first sentence, and it almost never gets promoted. You get the top five scored, with the reason each scored well.
> 
> Plus platform conventions respected — link in the first comment for LinkedIn, no hashtags at all for Reddit, question framing for Quora — and a posting schedule so ten posts do not all land on the same morning.

## Gallery — five images

1. Paste a blog post, newsletter, transcript or documentation page.
2. Eleven outputs, each inside its platform's real character limit.
3. Hook candidates ranked, with the reason each one scores.
4. Character usage per format, so nothing gets truncated at publish time.
5. A posting schedule across the week, because ten posts on one morning is spam.

Shoot each one as a real screenshot of the live product with the example loaded. Do not mock these up — the whole promise is that it works right now, and a mockup reads as one.

## Hacker News

Show HN posts do better with a plain title and an honest comment.

**Title**

> Show HN: Repurpose10 – turn one post into ten, each written for its platform

**Comment** — lead with the technical decision, not the benefit

> Hook scoring across seven signals, key-point extraction per paragraph, then generation inside each platform's real character limit — including counting links as 23 characters on X.
>
> It selects and restructures your sentences rather than rewriting them. Your voice survives and no fact gets invented.
>
> It is deterministic on purpose — no model in the request path, so the same input always gives the same output, there is no per-call cost, and the logic can be read and argued with. There is a REST endpoint that publishes its own schema and an MCP server for agent use.
>
> Free tier needs no signup. Happy to answer anything about the approach, including where it falls short.

## Reddit

Pick one subreddit and read its self-promotion rules first. Most ban it outright, and a ban costs more than the traffic is worth.

**Title**

> Turn one post into ten, each written for its platform

**Body** — no links in the body, offer the link in a comment

> One long-form piece in, eleven platform-native outputs out.
>
> It selects and restructures your sentences rather than rewriting them. Your voice survives and no fact gets invented.
>
> Built it because one thing you wrote becomes ten platform-native posts is something I kept doing by hand. Free tier, no signup, nothing stored. Genuinely interested in whether the approach holds up on your data — happy to be told it does not.

## Launch-day post for X and LinkedIn

> Turn one post into ten, each written for its platform.
>
> One long-form piece in, eleven platform-native outputs out.
>
> It selects and restructures your sentences rather than rewriting them. Your voice survives and no fact gets invented.
>
> Free, no signup: https://abetworks.in

## Pricing at launch

Free · $29/mo · Agency custom

Keep the free tier genuinely useful on launch day. Conversion comes from the API and the automation tiers, not from crippling the demo — and a demo that does not work is the fastest way to waste a launch.

## After launch

- [ ] Reply to every comment in the first six hours, including the critical ones
- [ ] Log what people actually pasted in — it tells you which input format to support next
- [ ] Watch `/api/health` and the rate limiter for abuse
- [ ] Publish the numbers a week later. A launch retro post reliably outperforms the launch

---

Part of the [Abet Works — Single-Feature SaaS Suite](../../README.md) by [Abet Works](https://abetworks.in).
