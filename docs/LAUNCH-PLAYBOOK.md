# Launch playbook

Twenty products, one audience.

## Do not launch twenty products

That is the whole first section, because it is the mistake the repository makes easy.

Twenty Product Hunt launches at a sensible cadence is ten months of work, and it teaches your audience exactly one thing: that you ship a lot of small things. None of them learns that any single thing is worth paying for. The suite existing is not a reason to launch it.

**Launch five. Publish twenty.**

Five products get a real launch — a Product Hunt day, a Show HN post, comments answered for six hours, a retro. The other fifteen live on [abetworks.in](https://abetworks.in), get found through search and through each other, and are there when the launched five earn you an audience that wants more.

The hub site exists for exactly this. A visitor who came for one product sees the other nineteen in one click, which is distribution that costs nothing and does not burn goodwill.

## Which five

Two criteria: **urgency you did not manufacture**, and **a demo that produces a number the visitor did not know**.

| Order | Week | Product | Why this one |
|---|---|---|---|
| 1 | 0 | **AIActNotice** | The only launch in the suite with a legal deadline attached. EU AI Act Article 50 applies from 2 August 2026 and most teams shipping AI features cannot say which tier they are in. Urgency does the selling, and the technical audience on Hacker News will engage with the "no LLM in a compliance tool" argument rather than dismissing it. |
| 2 | 2 | **SubAudit** | Finds money on the first run, which is the easiest possible demo. Paste a statement, see recoverable spend in rupees. Highly shareable because the output is a number people quote. |
| 3 | 4 | **PromptShield** | Strongest technical story and the audience AIActNotice just earned. Rewards a Show HN post about the design decision rather than the benefit. |
| 4 | 6 | **GSTMatch** | First India-specific launch. "Here is the input tax credit you are about to lose" is a rupee figure, and the alternative is an ERP project. Different audience from the first three, so it does not fatigue them. |
| 5 | 8 | **ContractClock** | Produces a deadline you have already missed, which is a visceral demo. Broad buyer, and the `.ics` output is an artefact people pass on. |

Everything else ships quietly and is found through the hub, search, and the MCP tool directory.

## If you only have appetite for one

Launch **AIActNotice**, this week. It is the only product in the suite whose window closes. Three launched properly beats twenty launched at once; one launched properly beats three launched badly.

## Per-launch schedule

Every product has its own `LAUNCH.md` with the copy already written. This is the timing around it.

**T-7 days** — deploy to the real domain. Set `NEXT_PUBLIC_SITE_URL` and `DATABASE_URL`. Leave the payment keys unset so the free tier is the only tier. Run `pnpm smoke`. Test the demo on a phone.

**T-3 days** — shoot the gallery images as real screenshots of the live product with the example loaded. Never mock these up; a mockup reads as one and undermines the entire "it works right now" promise.

**T-1 day** — line up five people who will genuinely try it. Not vote-begging — you want early comments with real questions, because an empty comment thread reads as an empty product.

**Launch day, 00:01 PT** — Product Hunt goes live. Post the first comment immediately.

**Launch day, +2 hours** — Show HN. Different audience, different framing: lead with the technical decision, not the benefit.

**Launch day, first 6 hours** — answer every comment, especially the critical ones. A well-handled objection converts better than a compliment.

**T+1 day** — one relevant subreddit, having read its self-promotion rules. Most ban it, and a ban costs more than the traffic is worth.

**T+7 days** — publish the retro with real numbers. This reliably outperforms the launch itself and costs an hour.

## What to say about the deterministic engines

This will come up on Hacker News every single time. Do not be defensive, because the position is genuinely strong:

> There is no LLM in the request path. Same input, same output, single-digit millisecond latency, no per-call cost, and nothing invented. Where a model would genuinely help it sits on top as optional polish, never underneath as the logic. For a compliance scanner or an injection detector, a non-deterministic core would be a bug.

For the compliance products the argument is sharper still, and it is worth leading with:

> An auditor's first question about a compliance artifact is whether you can reproduce it. Ask a model twice and you may get two answers, which is the opposite of what an audit trail is for. Every conclusion here cites the article that produced it, and the evidence record carries a content hash.

For ContractClock, get ahead of the obvious "why not an LLM" yourself:

> Because the output goes into someone's calendar. A model that invents "cancel by 14 March" creates the exact liability this exists to prevent — a false sense of having diarised the deadline. Every date can be pointed at in the source text, and where it finds nothing it says so.

For PromptShield, name the limitation before a commenter does:

> Nothing stops all prompt injection, and anyone claiming otherwise is selling you something. Rules catch the known classes reliably, at zero latency, and cannot themselves be argued out of their verdict the way a model-based detector can. It is the first layer. Keep your tool permissions minimal too.

Naming the limitation before a commenter does is what makes the rest of the claim credible.

## Pricing during the launch window

Keep the free tier genuinely useful. Every wall between a visitor and a working result costs conversions, and with twenty products a working no-signup demo is the cheapest distribution you have.

The anonymous allowance is 15 runs a day per IP, and a free account raises it to 25 a month with no card. Do not tighten either during a launch week. Add the payment keys when you are ready to charge; the paywall was already enforcing quotas, so nothing else changes.

## What to measure

Per launch:

- Product Hunt rank at 24 hours
- Unique visitors, and the ratio who reached `/app`
- The ratio who reached `/app` **and ran it** — this is the number that matters. If people land on the demo and do not run it, the input is too much work, not the pitch
- Signups, and the ratio of signups to runs. A high run rate with no signups means the free anonymous allowance is generous enough that nobody needs an account, which is fine — it is the paid conversion that matters, not the account
- API schema requests to `GET /api/v1/run` — a direct signal of developer interest
- Comments containing a real use case

Ignore upvotes beyond the rank they buy you. A launch that produces twenty engaged comments and no badge is worth more than the reverse.

Across the suite, the number to watch is different: **which products get a second run from the same person.** One run is curiosity. Two is a product.

## After the five

You will have a mailing list, five launches of credibility, and usage data across twenty products. The correct move is not a twenty-first product.

It is to look at which two or three people came back to, make those properly good, and quietly stop maintaining the ones nobody ran twice. `pnpm sync` makes keeping twenty alive cheap, but cheap is not free — every shared change still has to pass twenty builds.

The `_template/` directory exists so a twenty-first costs two files if you do want one. That is a property of the architecture, not an instruction.

---

By [Abet Works](https://abetworks.in).
