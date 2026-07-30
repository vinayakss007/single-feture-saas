# Launch playbook

Ten products, one audience. The failure mode is obvious and worth naming up front: launching all ten in a month teaches your audience that you ship a lot of small things, and teaches none of them that any single thing is worth paying for.

## The rule

**One launch every two weeks. Five months for all ten.**

Two weeks is long enough to answer every comment, ship the fixes the launch surfaces, and post a retro that earns more traffic than the launch did. It is short enough to keep momentum.

If you only have appetite for three, do three. Three launched properly beats ten launched at once, every time.

## Sequence

Ordered so each launch makes the next one easier.

| Order | Week | Product | Why here |
|---|---|---|---|
| 1 | 0 | **PromptShield** | Hottest category in 2026 and the most technical audience. Hacker News rewards this kind of post, and a strong HN day builds the credibility every later launch borrows. |
| 2 | 2 | **ConsentScan** | Highest urgency of the ten — DPDP penalties are real and the deadline pressure is not manufactured. Strongest India-specific wedge, and press will cover a compliance scanner. |
| 3 | 4 | **AnswerReady** | Rides the AI-search anxiety that PromptShield's audience already has. The generated `llms.txt` is a shareable artefact, which is how it spreads without paid distribution. |
| 4 | 6 | **DealBrief** | First revenue-team product. Highest per-seat price in the suite, so it justifies the sales motion you will start building here. |
| 5 | 8 | **InvoiceParse** | Same buyer geography as ConsentScan, so you can email that list rather than starting cold. GSTIN validation is the demo that sells itself. |
| 6 | 10 | **ChurnSignal** | Sells to the audience DealBrief just earned you. Natural bundle conversation with NuCRM. |
| 7 | 12 | **Repurpose10** | Broadest audience, most competitive category. Launch it once you have a following to launch it to — it will not build one. |
| 8 | 14 | **PricePulse** | Narrow but high-intent. Pairs with the product-marketing readers Repurpose10 brings in. |
| 9 | 16 | **ColdAngle** | Crowded category. It needs the credibility of eight prior launches to stand out from the AI-SDR noise. |
| 10 | 18 | **PingDeck** | Commodity category, deliberately last. Its wedge is the certificate and domain checks, which is a smaller story — best told to an audience that already trusts you. |

## Per-launch schedule

Every product has its own `LAUNCH.md` with the copy already written. This is the timing around it.

**T-7 days** — deploy to the real domain. Set `NEXT_PUBLIC_SITE_URL`. Leave `API_KEYS` unset. Raise `RATE_LIMIT_PER_MIN` to 120. Run `node scripts/smoke.mjs`. Test the demo on a phone.

**T-3 days** — shoot the five gallery images as real screenshots of the live product with the example loaded. Never mock these up; a mockup reads as one and undermines the entire "it works right now" promise.

**T-1 day** — line up five people who will genuinely try it. Not vote-begging — you want early comments with real questions, because an empty comment thread reads as an empty product.

**Launch day, 00:01 PT** — Product Hunt goes live. Post the first comment immediately.

**Launch day, +2 hours** — Show HN. Different audience, different framing: lead with the technical decision, not the benefit.

**Launch day, first 6 hours** — answer every comment, especially the critical ones. A well-handled objection converts better than a compliment.

**T+1 day** — one relevant subreddit, having read its self-promotion rules. Most ban it, and a ban costs more than the traffic is worth.

**T+7 days** — publish the retro with real numbers. This reliably outperforms the launch itself and costs an hour.

## What to say about the deterministic engines

This will come up on Hacker News every single time. Do not be defensive, because the position is genuinely strong:

> There is no LLM in the request path. Same input, same output, single-digit millisecond latency, no per-call cost, and nothing invented. Where a model would genuinely help it sits on top as optional polish, never underneath as the logic. For a compliance scanner or an injection detector, a non-deterministic core would be a bug.

For PromptShield specifically, get ahead of the obvious criticism yourself:

> Nothing stops all prompt injection, and anyone claiming otherwise is selling you something. Rules catch the known classes reliably, at zero latency, and cannot themselves be argued out of their verdict the way a model-based detector can. It is the first layer. Keep your tool permissions minimal too.

Naming the limitation before a commenter does is what makes the rest of the claim credible.

## Pricing during the launch window

Keep the free tier genuinely useful. Every wall between a visitor and a working result costs conversions, and with ten products a working no-signup demo is the cheapest distribution you have.

Set `API_KEYS` after the launch week, not before. The web demo keeps working regardless because it calls the API same-origin.

## What to measure

Per launch:

- Product Hunt rank at 24 hours
- Unique visitors, and the ratio who reached `/app`
- The ratio who reached `/app` **and ran it** — this is the number that matters. If people land on the demo and do not run it, the input is too much work, not the pitch
- API schema requests to `GET /api/v1/run` — a direct signal of developer interest
- Comments containing a real use case

Ignore upvotes beyond the rank they buy you. A launch that produces twenty engaged comments and no badge is worth more than the reverse.

## After all ten

You will have ten products, a mailing list, and data on which two people actually use. The correct move then is not an eleventh product. It is to pick the two with real usage and make them properly good — and to quietly retire the ones nobody ran twice.

The `_template/` directory exists so an eleventh costs two files if you do want one. That is the point of the architecture, not an instruction to use it.

---

By [Abet Works](https://abetworks.in).
