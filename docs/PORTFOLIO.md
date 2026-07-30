# Portfolio

Positioning, moat and revenue model for each of the ten products.

## 01. DealBrief

**Turn any sales call transcript into a CRM-ready deal brief**

| | |
|---|---|
| Folder | [`apps/01-dealbrief`](../apps/01-dealbrief) |
| Category | Revenue operations |
| The one job | Sales call transcript in, qualified deal brief out. |
| Buyer | B2B sales teams, RevOps, sales managers running pipeline reviews |
| Pricing | Free · $29/user/mo · usage from $0.04/brief |
| MCP tool | `dealbrief_analyze_call` |
| Suggested domain | `dealbrief.abetworks.in` |

**Why it wins.** A meeting recorder summarises what was said. DealBrief judges the deal — what is missing, what is at risk, and who owes what by when.

**How it works.** MEDDICC coverage scoring, commitment extraction with owner and date attribution, nine risk rules, speaker aliasing and talk-ratio analysis.

**Launch kit.** [`apps/01-dealbrief/LAUNCH.md`](../apps/01-dealbrief/LAUNCH.md)

---

## 02. ChurnSignal

**Paste a CSV, find out which customers are about to leave**

| | |
|---|---|
| Folder | [`apps/02-churnsignal`](../apps/02-churnsignal) |
| Category | Customer success |
| The one job | Account CSV in, ranked churn risk with reason codes out. |
| Buyer | SaaS founders, customer success teams, account managers |
| Pricing | Free · $49/mo · Enterprise custom |
| MCP tool | `churnsignal_score_accounts` |
| Suggested domain | `churnsignal.abetworks.in` |

**Why it wins.** A health score without reason codes tells a CSM nothing. Every score here shows which signals fired, how many points each added, and the specific save play for the dominant one.

**How it works.** Six weighted signals — usage trend, dormancy, seat adoption, support pressure, satisfaction, renewal proximity — normalised against the signals your export actually contains.

**Launch kit.** [`apps/02-churnsignal/LAUNCH.md`](../apps/02-churnsignal/LAUNCH.md)

---

## 03. PricePulse

**Know the moment a competitor changes their pricing page**

| | |
|---|---|
| Folder | [`apps/03-pricepulse`](../apps/03-pricepulse) |
| Category | Competitive intelligence |
| The one job | Two pricing page snapshots in, classified commercial diff out. |
| Buyer | Product marketing, pricing owners, competitive intelligence, founders |
| Pricing | Free · $39/mo · Enterprise custom |
| MCP tool | `pricepulse_diff_pricing` |
| Suggested domain | `pricepulse.abetworks.in` |

**Why it wins.** Visual diff tools fire on a rotated testimonial and a changed copyright year. This one parses the plans first, so only changes that affect what a buyer pays or gets ever surface.

**How it works.** Parses both snapshots into a structured plan model — price, period, seats, quotas, trial length, feature placement — then classifies differences into thirteen change types weighted by commercial impact.

**Launch kit.** [`apps/03-pricepulse/LAUNCH.md`](../apps/03-pricepulse/LAUNCH.md)

---

## 04. ConsentScan

**Scan any website for India DPDP and GDPR consent compliance**

| | |
|---|---|
| Folder | [`apps/04-consentscan`](../apps/04-consentscan) |
| Category | Privacy compliance |
| The one job | URL in, prioritised DPDP and GDPR finding list out. |
| Buyer | Indian SMBs, web agencies, anyone with EU users, compliance owners |
| Pricing | Free · $59/mo · Enterprise custom |
| MCP tool | `consentscan_audit_site` |
| Suggested domain | `consentscan.abetworks.in` |

**Why it wins.** Every finding names the specific DPDP section or GDPR article it touches, and is ordered by penalty exposure. Most scanners just say "cookie banner missing".

**How it works.** Fetches the page and its privacy policy, then runs 24 checks: 16 tracker signatures, cookie classification from Set-Cookie headers, 11 consent platform signatures, nine privacy-notice disclosure checks and five security headers.

**Launch kit.** [`apps/04-consentscan/LAUNCH.md`](../apps/04-consentscan/LAUNCH.md)

---

## 05. InvoiceParse

**Turn any invoice into clean data — and catch the GST errors**

| | |
|---|---|
| Folder | [`apps/05-invoiceparse`](../apps/05-invoiceparse) |
| Category | Finance automation |
| The one job | Invoice text in, validated structured data and ledger CSV out. |
| Buyer | Indian accountants, finance teams, B2B marketplaces, AP automation |
| Pricing | Free · $39/mo · $0.01/invoice at volume |
| MCP tool | `invoiceparse_extract_and_validate` |
| Suggested domain | `invoiceparse.abetworks.in` |

**Why it wins.** Most parsers regex-match a 15-character string and call the GSTIN valid. This runs the actual check-digit algorithm, so a typo that would cost you input tax credit six months later gets caught now.

**How it works.** Label-driven extraction rather than layout templates, plus 15 validation rules including the real GSTIN mod-36 check digit, state code and embedded PAN structure, inter-state versus intra-state tax logic, and every total re-derived from its parts.

**Launch kit.** [`apps/05-invoiceparse/LAUNCH.md`](../apps/05-invoiceparse/LAUNCH.md)

---

## 06. ColdAngle

**Cold email openers that prove you actually did the research**

| | |
|---|---|
| Folder | [`apps/06-coldangle`](../apps/06-coldangle) |
| Category | Outbound sales |
| The one job | Public research text in, grounded openers and a deliverability audit out. |
| Buyer | Founders doing their own outbound, SDRs, agencies running sequences |
| Pricing | Free · $29/mo · Agency custom |
| MCP tool | `coldangle_write_opener` |
| Suggested domain | `coldangle.abetworks.in` |

**Why it wins.** Every clause traces back to a line in the text you pasted. If the fact is not there, the opener does not assert it — which is why it never produces "I loved your recent post about digital transformation".

**How it works.** Nine research angle types ranked by reply likelihood, each quoting the sentence it was found in, plus 14 content-side deliverability checks and a specificity score.

**Launch kit.** [`apps/06-coldangle/LAUNCH.md`](../apps/06-coldangle/LAUNCH.md)

---

## 07. Repurpose10

**One thing you wrote becomes ten platform-native posts**

| | |
|---|---|
| Folder | [`apps/07-repurpose10`](../apps/07-repurpose10) |
| Category | Content marketing |
| The one job | One long-form piece in, eleven platform-native outputs out. |
| Buyer | Solo creators, content teams, agencies managing client calendars |
| Pricing | Free · $29/mo · Agency custom |
| MCP tool | `repurpose10_fan_out` |
| Suggested domain | `repurpose10.abetworks.in` |

**Why it wins.** It selects and restructures your sentences rather than rewriting them. Your voice survives and no fact gets invented.

**How it works.** Hook scoring across seven signals, key-point extraction per paragraph, then generation inside each platform's real character limit — including counting links as 23 characters on X.

**Launch kit.** [`apps/07-repurpose10/LAUNCH.md`](../apps/07-repurpose10/LAUNCH.md)

---

## 08. PingDeck

**The three outages nobody monitors, checked in one place**

| | |
|---|---|
| Folder | [`apps/08-pingdeck`](../apps/08-pingdeck) |
| Category | Monitoring |
| The one job | URLs in, availability plus certificate and domain expiry out. |
| Buyer | Small teams, agencies managing client sites, solo operators |
| Pricing | Free · $19/mo · $79/mo agency |
| MCP tool | `pingdeck_check_endpoints` |
| Suggested domain | `pingdeck.abetworks.in` |

**Why it wins.** Uptime tools are a commodity. Expiring certificates and expiring domains cause a large share of small-site outages and almost nothing checks both — here they are free.

**How it works.** Manual redirect-chain following for real timing, a genuine TLS handshake reading the peer certificate with SAN hostname matching, and registry RDAP lookup for domain expiry.

**Launch kit.** [`apps/08-pingdeck/LAUNCH.md`](../apps/08-pingdeck/LAUNCH.md)

---

## 09. AnswerReady

**Find out whether AI search can actually read your site**

| | |
|---|---|
| Folder | [`apps/09-answerready`](../apps/09-answerready) |
| Category | AI search optimisation |
| The one job | URL in, AI answer-engine readiness score and the two missing files out. |
| Buyer | SEO owners, content marketers, founders losing traffic to AI answers |
| Pricing | Free · $39/mo · Agency custom |
| MCP tool | `answerready_audit_page` |
| Suggested domain | `answerready.abetworks.in` |

**Why it wins.** Ranking tools measure backlinks. None of them tell you that you are blocking OAI-SearchBot, or that your content does not exist without JavaScript — which is what decides whether you get cited in an answer.

**How it works.** A real robots.txt group parser with longest-match precedence checked against seven AI crawlers, no-JavaScript content measurement, JSON-LD extraction and type inventory, and quotability signals. Generates llms.txt and a JSON-LD block from your real content.

**Launch kit.** [`apps/09-answerready/LAUNCH.md`](../apps/09-answerready/LAUNCH.md)

---

## 10. PromptShield

**One API call between untrusted text and your agent**

| | |
|---|---|
| Folder | [`apps/10-promptshield`](../apps/10-promptshield) |
| Category | AI security |
| The one job | Untrusted text in, verdict plus redacted text out. |
| Buyer | Teams shipping AI agents to production, platform and security engineers |
| Pricing | Free 1k/mo · $0.20/1k calls · self-hosted custom |
| MCP tool | `promptshield_scan_text` |
| Suggested domain | `promptshield.abetworks.in` |

**Why it wins.** A model asked to judge untrusted text is itself reading untrusted text and can be talked out of its judgement. Deterministic rules cannot be persuaded, run in single-digit milliseconds and cost nothing per call.

**How it works.** 14 injection rules across nine attack classes, plus 12 PII and secret types with Luhn validation for card numbers and Verhoeff validation for Aadhaar, so a 12-digit order reference is never reported as a national ID.

**Launch kit.** [`apps/10-promptshield/LAUNCH.md`](../apps/10-promptshield/LAUNCH.md)


---

## Revenue model summary

Three pricing shapes across the suite, matched to how each product actually gets used.

**Per-seat** (DealBrief) — used by named individuals every day, so seats align with value.

**Flat monthly** (ChurnSignal, PricePulse, ConsentScan, InvoiceParse, ColdAngle, Repurpose10, PingDeck, AnswerReady) — used by a team a few times a week. Flat pricing removes the friction of counting.

**Usage-based** (PromptShield, and InvoiceParse at volume) — sits in a request path where volume is the only sensible unit.

Every product has a genuinely useful free tier. That is deliberate: with ten products the cheapest possible distribution is a working demo that needs no signup, and a crippled demo wastes the launch it took to earn the traffic.

---

By [Abet Works](https://abetworks.in).
