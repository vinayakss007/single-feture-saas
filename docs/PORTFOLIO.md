# Portfolio

Positioning, moat and revenue model for each of the twenty products.

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

## 11. AIActNotice

**The EU AI Act notice your product legally needs, in one minute**

| | |
|---|---|
| Folder | [`apps/11-aiactnotice`](../apps/11-aiactnotice) |
| Category | AI governance |
| The one job | AI system description in, risk tier and Article 50 notice out. |
| Buyer | Anyone shipping AI into the EU — founders, product leads, DPOs, compliance owners |
| Pricing | Free · ₹2,499/mo · Enterprise custom |
| MCP tool | `aiactnotice_classify_system` |
| Suggested domain | `aiactnotice.abetworks.in` |

**Why it wins.** Every compliance platform in this category is priced for a programme, and every AI-written classification is unreproducible. This applies the published criteria deterministically and cites the article that produced each conclusion — which is what an auditor asks for.

**How it works.** A decision table over the Act's own criteria: Article 5 prohibitions, Annex III sector plus output-type tests, Article 50 transparency triggers, and per-role obligation sets. Emits an FNV-1a content hash so two assessments can be compared.

**Launch kit.** [`apps/11-aiactnotice/LAUNCH.md`](../apps/11-aiactnotice/LAUNCH.md)

---

## 12. A11yGate

**Paste your HTML, get every WCAG failure and the EAA statement**

| | |
|---|---|
| Folder | [`apps/12-a11ygate`](../apps/12-a11ygate) |
| Category | Accessibility compliance |
| The one job | HTML in, WCAG failures with fixes and a publishable accessibility statement out. |
| Buyer | EU e-commerce, banking, transport and SaaS teams, plus the agencies that build for them |
| Pricing | Free · ₹1,999/mo · Agency custom |
| MCP tool | `a11ygate_audit_html` |
| Suggested domain | `a11ygate.abetworks.in` |

**Why it wins.** Browser extensions test a rendered page, so they cannot run in CI or on a component that is not deployed. This runs on source with no browser, maps findings to EN 301 549 as well as WCAG, and generates the accessibility statement — which is a legal deliverable, not a report.

**How it works.** 34 deterministic checks over raw markup: image alternatives, form labelling, heading structure, landmarks, link and button naming, language, duplicate ids, tables, iframes, focus order, autoplay, ARIA misuse, and contrast computed from inline styles.

**Launch kit.** [`apps/12-a11ygate/LAUNCH.md`](../apps/12-a11ygate/LAUNCH.md)

---

## 13. GSTMatch

**See the input tax credit you are about to lose, in rupees**

| | |
|---|---|
| Folder | [`apps/13-gstmatch`](../apps/13-gstmatch) |
| Category | Tax compliance |
| The one job | Two CSVs in, input tax credit at risk in rupees out. |
| Buyer | Indian businesses filing GST, chartered accountants, finance teams |
| Pricing | Free · ₹1,499/mo · Enterprise custom |
| MCP tool | `gstmatch_reconcile_2b` |
| Suggested domain | `gstmatch.abetworks.in` |

**Why it wins.** Every GST reconciliation product on the market is an ERP integration for mid-market. This wants two CSVs and gives you a rupee figure for the credit you are about to lose, which makes the ROI a single sentence.

**How it works.** Segment-wise invoice number normalisation so INV/2026/0412 matches inv-2026-412, GSTIN base-36 check-digit validation, four-way bucketing with a rounding tolerance, and per-supplier ranking by credit at risk.

**Launch kit.** [`apps/13-gstmatch/LAUNCH.md`](../apps/13-gstmatch/LAUNCH.md)

---

## 14. eInvoiceGuard

**Catch the e-invoice error before the portal rejects it**

| | |
|---|---|
| Folder | [`apps/14-einvoiceguard`](../apps/14-einvoiceguard) |
| Category | Finance automation |
| The one job | Invoice payload in, portal error codes and a corrected payload out. |
| Buyer | Indian businesses on e-invoicing, SaaS exporters, ERP and billing engineers |
| Pricing | Free · ₹1,999/mo · Platform custom |
| MCP tool | `einvoiceguard_validate_payload` |
| Suggested domain | `einvoiceguard.abetworks.in` |

**Why it wins.** A rejected e-invoice blocks a payment, and you find out after submitting. This is wrong in the same way the portal is wrong — real error codes, offline — and returns a corrected payload for everything fixable deterministically.

**How it works.** 40+ checks against IRP schema 1.1 and Peppol BIS 3.0: mandatory fields with real portal error codes, GSTIN check digits, HSN length by turnover, unit and state code lists, and recomputed line, header and tax totals including the CGST/SGST versus IGST split against place of supply.

**Launch kit.** [`apps/14-einvoiceguard/LAUNCH.md`](../apps/14-einvoiceguard/LAUNCH.md)

---

## 15. SubAudit

**Upload a card statement, find the subscriptions you forgot**

| | |
|---|---|
| Folder | [`apps/15-subaudit`](../apps/15-subaudit) |
| Category | Finance operations |
| The one job | Statement CSV in, subscription map with duplicates and renewals out. |
| Buyer | Founders, finance leads, office managers and anyone who owns a company card |
| Pricing | Free · ₹1,499/mo · Enterprise custom |
| MCP tool | `subaudit_find_subscriptions` |
| Suggested domain | `subaudit.abetworks.in` |

**Why it wins.** Spend management platforms want to become your card, which is a procurement project. This wants a CSV you already have — no bank connection, no OAuth — and usually finds money on the first run.

**How it works.** 180+ vendor patterns with payment-processor prefix stripping, billing cadence inferred from the median gap between charges, duplicate detection by category, price-rise detection across cycles, and staleness against each subscription's own cycle.

**Launch kit.** [`apps/15-subaudit/LAUNCH.md`](../apps/15-subaudit/LAUNCH.md)

---

## 16. PolicyPack

**The SOC 2 policy set an auditor expects, from ten answers**

| | |
|---|---|
| Folder | [`apps/16-policypack`](../apps/16-policypack) |
| Category | Security compliance |
| The one job | Company profile in, policy set with control mapping and gap list out. |
| Buyer | Startups facing their first security review, CTOs, and whoever got handed the questionnaire |
| Pricing | Free · ₹2,499/mo · Enterprise custom |
| MCP tool | `policypack_generate_policies` |
| Suggested domain | `policypack.abetworks.in` |

**Why it wins.** Downloaded templates describe a company with a security team and a SIEM, which an auditor reads before asking for evidence you do not have. This describes your actual company, and states plainly which controls your headcount cannot satisfy.

**How it works.** Deterministic template composition producing 12 to 16 policies depending on region and data types, each mapped to SOC 2 Trust Services Criteria and ISO 27001:2022 Annex A controls with the evidence it will be tested against, plus a gap list ordered by what auditors test first.

**Launch kit.** [`apps/16-policypack/LAUNCH.md`](../apps/16-policypack/LAUNCH.md)

---

## 17. VendorTrace

**Your vendor list becomes the subprocessor register buyers ask for**

| | |
|---|---|
| Folder | [`apps/17-vendortrace`](../apps/17-vendortrace) |
| Category | Privacy compliance |
| The one job | Vendor list in, Article 30 register and subprocessor page out. |
| Buyer | DPOs, founders answering security questionnaires, SaaS companies under DPDP or GDPR |
| Pricing | Free · ₹1,999/mo · Enterprise custom |
| MCP tool | `vendortrace_build_register` |
| Suggested domain | `vendortrace.abetworks.in` |

**Why it wins.** Subprocessor disclosure is now a standard questionnaire item, and answering 'we use AWS and a few tools' ends the conversation with procurement. This produces the register in the format buyers accept, and flags unknown vendors rather than dropping them.

**How it works.** 150+ vendor dataset with hosting jurisdiction and DPA availability, transfer mechanism derived from origin and destination under GDPR Chapter V and India DPDP, sensitive-category detection from the data description, and Article 30 register generation.

**Launch kit.** [`apps/17-vendortrace/LAUNCH.md`](../apps/17-vendortrace/LAUNCH.md)

---

## 18. PaySlipIN

**One CTC figure becomes a compliant Indian payslip**

| | |
|---|---|
| Folder | [`apps/18-payslipin`](../apps/18-payslipin) |
| Category | Payroll compliance |
| The one job | Annual CTC in, full payslip with PF, ESI, PT and TDS out. |
| Buyer | Small employers, HR consultants, chartered accountants and anyone doing payroll in a spreadsheet |
| Pricing | Free · ₹999/mo · Practice custom |
| MCP tool | `payslipin_compute_payslip` |
| Suggested domain | `payslipin.abetworks.in` |

**Why it wins.** A full HRMS is the wrong shape and price for four employees. This computes one correct payslip and shows every threshold it used, so you can check it against the current Finance Act rather than trusting a black box.

**How it works.** Statutory arithmetic: salary structure from CTC with employer PF and gratuity taken out rather than added, PF with the ₹15,000 ceiling and the 8.33% EPS split, ESI eligibility, professional tax slabs for twelve states, and TDS under both regimes with slab-by-slab working, 87A rebate and surcharge.

**Launch kit.** [`apps/18-payslipin/LAUNCH.md`](../apps/18-payslipin/LAUNCH.md)

---

## 19. DMARCFix

**Paste your SPF, DKIM and DMARC — get the corrected records**

| | |
|---|---|
| Folder | [`apps/19-dmarcfix`](../apps/19-dmarcfix) |
| Category | Email deliverability |
| The one job | Email auth records in, lookup count, failures and corrected records out. |
| Buyer | Founders whose email lands in spam, ops and platform engineers, agencies running client domains |
| Pricing | Free · ₹1,499/mo · Agency custom |
| MCP tool | `dmarcfix_audit_records` |
| Suggested domain | `dmarcfix.abetworks.in` |

**Why it wins.** SPF breaks silently at ten DNS lookups — permerror, no error anywhere an operator would look. This counts them from pasted records, so you can test a change before publishing it and run the check in CI.

**How it works.** SPF mechanism parsing with nested include costs for 30 known providers counted against the hard limit of ten, multiple-record and unsafe-all detection, DMARC tag parsing with alignment analysis, sender coverage checks, and the Gmail and Yahoo bulk-sender requirements.

**Launch kit.** [`apps/19-dmarcfix/LAUNCH.md`](../apps/19-dmarcfix/LAUNCH.md)

---

## 20. ContractClock

**Paste a contract, find the auto-renewal you were about to miss**

| | |
|---|---|
| Folder | [`apps/20-contractclock`](../apps/20-contractclock) |
| Category | Contract operations |
| The one job | Contract text in, deadlines and a calendar file out. |
| Buyer | Ops and finance leads, procurement, founders signing their own contracts, agencies managing client vendors |
| Pricing | Free · ₹1,999/mo · Enterprise custom |
| MCP tool | `contractclock_extract_deadlines` |
| Suggested domain | `contractclock.abetworks.in` |

**Why it wins.** Contract management platforms want your whole repository migrated. This answers one question about one contract — and uses no model, because a hallucinated cancellation deadline is a liability rather than a bug.

**How it works.** Date extraction across four written formats, duration parsing including written numbers, auto-renewal and notice clause matching at sentence level, renewal roll-forward for contracts that have already renewed, last-safe-cancellation arithmetic, and iCalendar output with alarms.

**Launch kit.** [`apps/20-contractclock/LAUNCH.md`](../apps/20-contractclock/LAUNCH.md)

---

## 21. MediBillCheck

**Find the errors in a hospital bill before you pay it**

| | |
|---|---|
| Folder | [`apps/21-medibillcheck`](../apps/21-medibillcheck) |
| Category | Health finance |
| The one job | Itemised hospital bill in, questionable charges and a query letter out. |
| Buyer | Anyone paying a hospital bill in India, plus the family members who end up handling it |
| Pricing | Free · ₹999/mo · Claims custom |
| MCP tool | `medibillcheck_audit_bill` |
| Suggested domain | `medibillcheck.abetworks.in` |

**Why it wins.** Bill audit services take a percentage and a fortnight. This runs on the bill you are holding at the discharge counter, and every finding is a rupee figure with a line number you can point at. It makes no clinical judgement, which is exactly why it can be trusted on the parts it does judge.

**How it works.** Line parsing with quantity-times-rate reconciliation and a lines-versus-stated-total check, twelve categories of commonly declined consumable, identical-amount duplicate detection, proportionate-deduction arithmetic from room cap and sum insured, and GST-on-exempt-services detection.

**Launch kit.** [`apps/21-medibillcheck/LAUNCH.md`](../apps/21-medibillcheck/LAUNCH.md)

---

## 22. LabTrack

**See which lab values are outside range, and which are moving**

| | |
|---|---|
| Folder | [`apps/22-labtrack`](../apps/22-labtrack) |
| Category | Health records |
| The one job | Lab report values in, range flags and trends across reports out. |
| Buyer | Anyone managing their own or a parent's test results across multiple reports and labs |
| Pricing | Free · ₹499/mo · Clinic custom |
| MCP tool | `labtrack_check_values` |
| Suggested domain | `labtrack.abetworks.in` |

**Why it wins.** Every other tool in this space interprets. This deliberately does not: it checks thirty values against thirty ranges without missing one, and lines up four reports to show what is moving. Both are mechanical, both are where the signal is, and neither requires a diagnosis nobody should take from a text box.

**How it works.** 31 tests across seven panels with sex-specific reference ranges, the report's own stated range taking priority over the bundled one, percentage deviation outside range, separate handling of values far enough out that laboratories flag them, and per-test trend computation across multiple dated reports.

**Launch kit.** [`apps/22-labtrack/LAUNCH.md`](../apps/22-labtrack/LAUNCH.md)

---

## 23. VaxDue

**Which childhood vaccines are overdue, due now and next**

| | |
|---|---|
| Folder | [`apps/23-vaxdue`](../apps/23-vaxdue) |
| Category | Child health |
| The one job | Date of birth and doses given in, overdue and upcoming schedule out. |
| Buyer | Parents and grandparents tracking a child's immunisations, and the relative who ends up holding the card |
| Pricing | Free · ₹299/mo · Clinic custom |
| MCP tool | `vaxdue_check_schedule` |
| Suggested domain | `vaxdue.abetworks.in` |

**Why it wins.** A paper card and a chart in weeks and months, versus actual calendar dates you can diary. It also marks every dose free or paid, which is the thing nobody explains at the counter, and is honest that being late almost never means starting again.

**How it works.** 35 doses across the full childhood schedule with due ages, minimum ages and minimum inter-dose gaps, calendar dates computed from date of birth against an explicit as-at date, conservative matching of already-given doses, and the one upper age limit that genuinely forecloses catch-up.

**Launch kit.** [`apps/23-vaxdue/LAUNCH.md`](../apps/23-vaxdue/LAUNCH.md)

---

## 24. LoanTruth

**The real interest rate on your loan, not the one you were quoted**

| | |
|---|---|
| Folder | [`apps/24-loantruth`](../apps/24-loantruth) |
| Category | Personal finance |
| The one job | Sanction letter terms in, true APR and amortisation out. |
| Buyer | Anyone taking a home, car, personal or business loan, and anyone already paying one off |
| Pricing | Free · ₹499/mo · Broker custom |
| MCP tool | `loantruth_analyse_loan` |
| Suggested domain | `loantruth.abetworks.in` |

**Why it wins.** Every EMI calculator computes the payment. None tells you that fees deducted from disbursal mean you pay interest on money you never received — on the sample loan that is 0.36 points of hidden APR, and no sanction letter states it.

**How it works.** Reducing-balance EMI and full amortisation, effective APR solved by bisection against the amount actually disbursed after fees, GST on the processing fee, prepayment re-amortisation, one-point rate-shock pricing, and the month the outstanding balance finally halves.

**Launch kit.** [`apps/24-loantruth/LAUNCH.md`](../apps/24-loantruth/LAUNCH.md)

---

## 25. TripSplit

**Settle a group trip in three transfers instead of eleven**

| | |
|---|---|
| Folder | [`apps/25-tripsplit`](../apps/25-tripsplit) |
| Category | Travel money |
| The one job | Shared expenses in, minimal set of transfers out. |
| Buyer | Anyone who has organised a group trip, a shared house, or a weekend away and ended up as the accountant |
| Pricing | Free · ₹299/mo · Teams custom |
| MCP tool | `tripsplit_settle_expenses` |
| Suggested domain | `tripsplit.abetworks.in` |

**Why it wins.** Splitting is bookkeeping; minimising the payments is the actual problem. Four transfers instead of six on the sample trip, and a message ready for the group chat — with no account to create and nothing stored afterwards.

**How it works.** Multi-currency normalisation, per-expense participant subsets with blank meaning everyone, net balance computation, and greedy largest-creditor-to-largest-debtor pairing that settles in at most n-1 transfers.

**Launch kit.** [`apps/25-tripsplit/LAUNCH.md`](../apps/25-tripsplit/LAUNCH.md)

---

## 26. FlightRight

**What the airline actually owes you, and the letter to claim it**

| | |
|---|---|
| Folder | [`apps/26-flightright`](../apps/26-flightright) |
| Category | Travel rights |
| The one job | Flight disruption details in, entitlements and a claim letter out. |
| Buyer | Anyone whose flight was delayed, cancelled or overbooked, and who was offered a voucher |
| Pricing | Free · ₹399/mo · Travel desk custom |
| MCP tool | `flightright_assess_claim` |
| Suggested domain | `flightright.abetworks.in` |

**Why it wins.** Claim companies take 25-35% for sending a letter and decline the marginal cases. This separates the three entitlements airlines conflate, pre-answers the four standard refusals, and hands you the letter.

**How it works.** Regime selection by route rather than carrier nationality, EU261 distance bands including the long-haul halving rule, DGCA cancellation and denied-boarding bands capped against fare, and separation of compensation from refund and duty of care so an extraordinary-circumstance defence only removes what it actually removes.

**Launch kit.** [`apps/26-flightright/LAUNCH.md`](../apps/26-flightright/LAUNCH.md)

---

## 27. SolarPayback

**Will rooftop solar actually pay for itself, and when**

| | |
|---|---|
| Folder | [`apps/27-solarpayback`](../apps/27-solarpayback) |
| Category | Energy & sustainability |
| The one job | Monthly bill and rooftop area in, payback period and savings out. |
| Buyer | Homeowners considering rooftop solar, and anyone who was just quoted a system |
| Pricing | Free · ₹499/mo · Enterprise custom |
| MCP tool | `solar_payback_calculate` |
| Suggested domain | `solarpayback.abetworks.in` |

**Why it wins.** Solar salespeople quote savings. This shows the payback month, the IRR, and what happens to both when you change the assumptions — because the assumptions are where they lie.

**How it works.** System sizing from monthly bill and state tariff, generation estimation from area/orientation/state-specific irradiance, PM Surya Ghar subsidy slabs, month-level breakeven with panel degradation and tariff inflation, IRR versus FD returns.

**Launch kit.** [`apps/27-solarpayback/LAUNCH.md`](../apps/27-solarpayback/LAUNCH.md)

---

## 28. PowerBill

**What is wrong with this electricity bill, in rupees**

| | |
|---|---|
| Folder | [`apps/28-powerbill`](../apps/28-powerbill) |
| Category | Utilities & consumer rights |
| The one job | Bill line items in, slab errors and overcharges in rupees out. |
| Buyer | Anyone who suspects their electricity bill is wrong and wants the arithmetic before they complain |
| Pricing | Free · ₹499/mo · Enterprise custom |
| MCP tool | `powerbill_audit` |
| Suggested domain | `powerbill.abetworks.in` |

**Why it wins.** Every finding is a rupee number with a slab table cited. Not 'your bill seems high' — the exact arithmetic the discom used and where it departs from the tariff order.

**How it works.** State-specific slab arithmetic for 8 states with telescopic and non-telescopic structures, fixed charge validation against sanctioned load, fuel adjustment tracking, demand charge applicability, and total reconciliation.

**Launch kit.** [`apps/28-powerbill/LAUNCH.md`](../apps/28-powerbill/LAUNCH.md)

---

## 29. RentCheck

**Is this rent fair for this area, and what to negotiate**

| | |
|---|---|
| Folder | [`apps/29-rentcheck`](../apps/29-rentcheck) |
| Category | Real estate & housing |
| The one job | Property details and quoted rent in, fair range and negotiation points out. |
| Buyer | Anyone looking at a rental in an Indian metro and wondering whether the number is real |
| Pricing | Free · ₹299/mo · Enterprise custom |
| MCP tool | `rent_check_evaluate` |
| Suggested domain | `rentcheck.abetworks.in` |

**Why it wins.** Not a listing site — a second opinion on the number someone quoted you, with the specific points to negotiate on and the clauses to add to the agreement.

**How it works.** Locality-tier benchmarks for 8 Indian metros, fair-rent computation from BHK, furnishing, floor and age multipliers, rent-to-income ratio, negotiation points with rupee discounts, and agreement clauses.

**Launch kit.** [`apps/29-rentcheck/LAUNCH.md`](../apps/29-rentcheck/LAUNCH.md)

---

## 30. PropertyTax

**Calculate your property tax before the notice arrives**

| | |
|---|---|
| Folder | [`apps/30-propertytax`](../apps/30-propertytax) |
| Category | Real estate & compliance |
| The one job | Property details and city in, tax computation with rates cited out. |
| Buyer | Property owners in Indian metros who get a notice they cannot verify |
| Pricing | Free · ₹499/mo · Enterprise custom |
| MCP tool | `property_tax_calculate` |
| Suggested domain | `propertytax.abetworks.in` |

**Why it wins.** Seven cities, three different methods, and the step-by-step working so you can check the notice when it arrives rather than accepting it.

**How it works.** Capital value method (Mumbai, Pune, Hyderabad), unit area value method (Bengaluru, Delhi, Kolkata), annual rental value method (Chennai), with step-by-step computation, rebates for self-occupied and early payment, and education/library cess.

**Launch kit.** [`apps/30-propertytax/LAUNCH.md`](../apps/30-propertytax/LAUNCH.md)

---

## 31. NutriLabel

**Read a food label and know what it actually means**

| | |
|---|---|
| Folder | [`apps/31-nutrilabel`](../apps/31-nutrilabel) |
| Category | Health & nutrition |
| The one job | Nutrition facts in, traffic-light breakdown and label honesty rating out. |
| Buyer | Health-conscious Indian consumers, dietitians, fitness coaches, parents reading labels for their kids |
| Pricing | Free · $19/mo · Enterprise custom |
| MCP tool | `nutrilabel_analyze_label` |
| Suggested domain | `nutrilabel.abetworks.in` |

**Why it wins.** Not a calorie counter — a label auditor that normalises to per-100g, catches misleading serving sizes, and rates the label honest/misleading/deceptive based on what the front says vs what the back shows.

**How it works.** ICMR/FSSAI daily value scoring, FSA traffic-light thresholds per 100g, WHO limit checks for sugar/sodium/trans fat, serving size honesty detection, and front-of-pack claim validation against FSSAI criteria.

**Launch kit.** [`apps/31-nutrilabel/LAUNCH.md`](../apps/31-nutrilabel/LAUNCH.md)

---

## 32. SleepDebt

**How much sleep you owe yourself, and when to repay it**

| | |
|---|---|
| Folder | [`apps/32-sleepdebt`](../apps/32-sleepdebt) |
| Category | Health & wellness |
| The one job | Sleep log in, cumulative debt, severity, recovery plan, and tonight's bedtime out. |
| Buyer | Professionals with irregular sleep, shift workers, students, anyone tracking sleep debt |
| Pricing | Free · $9/mo · Enterprise custom |
| MCP tool | `sleepdebt_analyze_log` |
| Suggested domain | `sleepdebt.abetworks.in` |

**Why it wins.** Not a sleep tracker — a debt calculator that tells you exactly how much you owe, how long recovery will take with realistic diminishing returns, and what time to go to bed tonight.

**How it works.** Cumulative debt computation from bedtime/wake pairs against personal target, severity classification (manageable/concerning/chronic), recovery modelling with diminishing returns, consecutive short-night detection, and optimal bedtime recommendation.

**Launch kit.** [`apps/32-sleepdebt/LAUNCH.md`](../apps/32-sleepdebt/LAUNCH.md)

---

## 33. RacePace

**The pace plan that gets you to the finish, not the wall**

| | |
|---|---|
| Folder | [`apps/33-racepace`](../apps/33-racepace) |
| Category | Fitness & endurance |
| The one job | Race distance and training data in, per-km pace plan with three strategies out. |
| Buyer | Recreational runners preparing for 5K to marathon, running coaches building race strategies |
| Pricing | Free · $19/mo · Enterprise custom |
| MCP tool | `racepace_plan_race` |
| Suggested domain | `racepace.abetworks.in` |

**Why it wins.** Not a finish-time calculator — a pace plan that shows you three versions of your race including the one where you hit the wall, so you recognise it happening in time to adjust.

**How it works.** Even-split, negative-split, and positive-split pace plans per km, Riegel formula feasibility check against training data, condition and terrain adjustments, fueling schedule for distances above 10K, and HR zone predictions per segment.

**Launch kit.** [`apps/33-racepace/LAUNCH.md`](../apps/33-racepace/LAUNCH.md)

---

## 34. WeddingBudget

**What an Indian wedding actually costs, by category**

| | |
|---|---|
| Folder | [`apps/34-weddingbudget`](../apps/34-weddingbudget) |
| Category | Personal finance |
| The one job | Wedding parameters in, 12-category budget with city/season multipliers and savings plan out. |
| Buyer | Indian couples and families planning weddings, wedding planners building budgets |
| Pricing | Free · $29/mo · Enterprise custom |
| MCP tool | `weddingbudget_calculate` |
| Suggested domain | `weddingbudget.abetworks.in` |

**Why it wins.** Not a wedding checklist — a budget reality check that shows the 60% nobody quotes (decoration, photography add-ons, transport, miscellaneous) with the multipliers that change everything.

**How it works.** 12-category budget computation with city-tier multipliers (metro/tier2/tier3), peak-season premiums, venue-type pricing, per-guest and per-event breakdowns, underestimate warnings for decoration/photography/misc, and backward savings timeline.

**Launch kit.** [`apps/34-weddingbudget/LAUNCH.md`](../apps/34-weddingbudget/LAUNCH.md)

---

## 35. SchoolFee

**Compare school fees properly - total cost, not just tuition**

| | |
|---|---|
| Folder | [`apps/35-schoolfee`](../apps/35-schoolfee) |
| Category | Personal finance |
| The one job | Fee structures for up to 3 schools in, true total cost comparison with inflation projection out. |
| Buyer | Indian parents choosing between schools, financial planners advising on education costs |
| Pricing | Free · $19/mo · Enterprise custom |
| MCP tool | `schoolfee_compare` |
| Suggested domain | `schoolfee.abetworks.in` |

**Why it wins.** Not a school directory — a financial comparison that adds every hidden fee, projects what you will actually pay by Class 12, and shows what investing the difference could grow to.

**How it works.** True total annual cost computation (all line items, not just tuition), inflation-adjusted projection through graduation at 8-10%, monthly outflow with amortised one-time fees, hidden cost flags, and investment value of fee difference at 12% equity returns.

**Launch kit.** [`apps/35-schoolfee/LAUNCH.md`](../apps/35-schoolfee/LAUNCH.md)

---

## 36. ResumeATS

**What an ATS actually sees in your resume**

| | |
|---|---|
| Folder | [`apps/36-resumeats`](../apps/36-resumeats) |
| Category | Career tools |
| The one job | Resume text and job description in, ATS parse score with keyword match rate and rejection flags out. |
| Buyer | Job seekers in India and globally, career coaches, resume writers, placement consultants |
| Pricing | Free · $19/mo · Enterprise custom |
| MCP tool | `resume_ats_scan` |
| Suggested domain | `resumeats.abetworks.in` |

**Why it wins.** Not a resume builder — an ATS simulator that shows exactly what gets extracted, what gets lost, and why 70% of resumes are rejected before a human reads them.

**How it works.** Section parsing (contact, summary, experience, education, skills, certifications), keyword match rate against job description, quantified achievement count, action verb scoring, employment gap detection, format friendliness scoring, and ATS-parsed view generation.

**Launch kit.** [`apps/36-resumeats/LAUNCH.md`](../apps/36-resumeats/LAUNCH.md)

---

## 37. RTIDraft

**The RTI application that gets answered, not ignored**

| | |
|---|---|
| Folder | [`apps/37-rtidraft`](../apps/37-rtidraft) |
| Category | Legal tools |
| The one job | Authority type, department, and information request in, formatted RTI application with legal citations and fee details out. |
| Buyer | Indian citizens filing RTI applications, RTI activists, journalists, NGOs, legal aid organizations |
| Pricing | Free · $9/mo · Enterprise custom |
| MCP tool | `rti_draft` |
| Suggested domain | `rtidraft.abetworks.in` |

**Why it wins.** Not a legal advice tool — a properly formatted RTI application generator that gets the technicalities right so your valid question actually gets answered.

**How it works.** RTI Act 2005 compliant application generation with authority-specific PIO addressing, state-wise fee structures (central Rs 10, varying by state), Section 6(1) citation, 30-day timeline, appeal process (Section 19), and common rejection mistake detection.

**Launch kit.** [`apps/37-rtidraft/LAUNCH.md`](../apps/37-rtidraft/LAUNCH.md)

---

## 38. CarCost

**The real cost of owning this car, not just the EMI**

| | |
|---|---|
| Folder | [`apps/38-carcost`](../apps/38-carcost) |
| Category | Personal finance |
| The one job | Car price, state, fuel type, and loan details in, true 5-year ownership cost with cost-per-km out. |
| Buyer | Indian car buyers, auto journalists, financial planners, car comparison researchers |
| Pricing | Free · $19/mo · Enterprise custom |
| MCP tool | `car_cost_compute` |
| Suggested domain | `carcost.abetworks.in` |

**Why it wins.** Not a car listing — a financial calculator that shows what you think it costs (EMI) vs what it actually costs (EMI + fuel + insurance + service + depreciation).

**How it works.** On-road price computation (state-specific road tax, registration, TCS, insurance), 5-year running cost projection (fuel at state prices, service schedule, tyre replacement, insurance with depreciating IDV), loan EMI and total interest, depreciation at Indian market rates, cost-per-km, and petrol vs diesel breakeven.

**Launch kit.** [`apps/38-carcost/LAUNCH.md`](../apps/38-carcost/LAUNCH.md)

---

## 39. PetDose

**What your pet weighs and when each dose is due**

| | |
|---|---|
| Folder | [`apps/39-petdose`](../apps/39-petdose) |
| Category | Pet care |
| The one job | Species, breed, weight, and last treatment dates in, next due dates with weight-based dosing out. |
| Buyer | Pet owners in India, veterinarians, pet boarding facilities, animal shelters |
| Pricing | Free · $19/mo · Enterprise custom |
| MCP tool | `pet_dose_schedule` |
| Suggested domain | `petdose.abetworks.in` |

**Why it wins.** Not a pet health app — a preventative care calculator that tells you exactly what dose, which product, and when it is due based on your pet's actual weight and schedule.

**How it works.** Core vaccine schedule computation (DHPP/rabies for dogs, FVRCP/rabies for cats with correct intervals), age-based deworming frequency (puppy vs adult), monthly flea/tick and heartworm prevention tracking, weight-band dosing for ivermectin/milbemycin/fipronil/praziquantel, overdue detection, and breed-specific drug sensitivity warnings.

**Launch kit.** [`apps/39-petdose/LAUNCH.md`](../apps/39-petdose/LAUNCH.md)

---

## 40. PackList

**The packing list for this trip, this weather, this many days**

| | |
|---|---|
| Folder | [`apps/40-packlist`](../apps/40-packlist) |
| Category | Travel tools |
| The one job | Destination type, duration, weather, and activities in, complete categorised packing list with quantities and bag space estimate out. |
| Buyer | Travellers, business travellers, backpackers, digital nomads, travel planners |
| Pricing | Free · $9/mo · Enterprise custom |
| MCP tool | `packing_list` |
| Suggested domain | `packlist.abetworks.in` |

**Why it wins.** Not a generic travel checklist — a packing calculator that gives exact quantities for this trip, this weather, this many days, with these activities, in this bag.

**How it works.** Clothing quantity calculation (days adjusted for laundry availability), weather-appropriate layering (hot/warm/cool/cold/rainy), activity-specific gear lists (hiking/swimming/formal/photography/camping), carry-on weight optimization (7kg/40L limit enforcement), essential vs optional marking, and bag space estimation.

**Launch kit.** [`apps/40-packlist/LAUNCH.md`](../apps/40-packlist/LAUNCH.md)

---

## 41. LegalNotice

**The legal notice that gets a reply, not a dustbin**

| | |
|---|---|
| Folder | [`apps/41-legalnotice`](../apps/41-legalnotice) |
| Category | Legal tools |
| The one job | Dispute type, sender/recipient details, and facts in, properly structured legal notice with correct Indian law sections, timeline, and consequences out. |
| Buyer | Individuals, advocates, small businesses, HR teams, landlords, tenants, consumers |
| Pricing | Free · $9/mo · Enterprise custom |
| MCP tool | `legal_notice_generator` |
| Suggested domain | `legalnotice.abetworks.in` |

**Why it wins.** Not a generic angry letter — a properly formatted legal notice with correct statutes, mandatory timelines, and the consequences that make recipients respond.

**How it works.** Dispute-type-specific section citation (Section 138 NI Act, Section 80 CPC, Consumer Protection Act 2019, Hindu Succession Act, etc.), mandatory timeline enforcement (15/30/60 days), consequence generation, common mistake flagging, and dispatch guidance via RPAD.

**Launch kit.** [`apps/41-legalnotice/LAUNCH.md`](../apps/41-legalnotice/LAUNCH.md)

---

## 42. CropCal

**What to sow this week, for this soil, in this climate**

| | |
|---|---|
| Folder | [`apps/42-cropcal`](../apps/42-cropcal) |
| Category | Agriculture tools |
| The one job | State, soil type, month, land area, and irrigation in, crop recommendations with seed quantity, water needs, sowing window, yield estimates, and mandi prices out. |
| Buyer | Farmers, agricultural officers, agri-entrepreneurs, FPOs, rural advisors |
| Pricing | Free · $9/mo · Enterprise custom |
| MCP tool | `crop_calendar` |
| Suggested domain | `cropcal.abetworks.in` |

**Why it wins.** Not generic agriculture advice — specific crops for this soil, this zone, this month, with exact seed quantity for your land area and whether the sowing window is closing.

**How it works.** Indian agro-climatic zone matching, kharif/rabi/zaid season determination, soil-crop compatibility filtering, seed rate calculation per area, water requirement vs irrigation capacity check, sowing window urgency detection, and mandi price range estimation.

**Launch kit.** [`apps/42-cropcal/LAUNCH.md`](../apps/42-cropcal/LAUNCH.md)

---

## 43. FreelanceRate

**What to charge per hour, based on what you actually need to earn**

| | |
|---|---|
| Folder | [`apps/43-freelancerate`](../apps/43-freelancerate) |
| Category | Finance tools |
| The one job | Target take-home, expenses, working days, billable hours, and buffer in, minimum viable hourly/day/monthly rate with utilisation scenarios and Indian market comparison out. |
| Buyer | Freelancers, consultants, independent contractors, solopreneurs, agencies |
| Pricing | Free · $9/mo · Enterprise custom |
| MCP tool | `freelance_rate_calculator` |
| Suggested domain | `freelancerate.abetworks.in` |

**Why it wins.** Not a guess — the actual math of what you must charge per hour given what you need to earn, what you spend, and what you realistically bill.

**How it works.** Reverse calculation from take-home through tax (new regime), expenses, bad-debt buffer to gross revenue target, divided by actual billable hours. Utilisation drop scenarios (10-30%), GST threshold check, equivalent salaried CTC, and market median comparison for Indian freelancer categories.

**Launch kit.** [`apps/43-freelancerate/LAUNCH.md`](../apps/43-freelancerate/LAUNCH.md)

---

## 44. WaterLeak

**Find the leak from your water meter readings**

| | |
|---|---|
| Folder | [`apps/44-waterleak`](../apps/44-waterleak) |
| Category | Utility tools |
| The one job | Meter readings over several days and household size in, daily consumption analysis, leak detection, litres lost per day, monthly cost, and likely leak type out. |
| Buyer | Homeowners, apartment residents, facility managers, plumbers, water utility engineers |
| Pricing | Free · $9/mo · Enterprise custom |
| MCP tool | `water_leak_detector` |
| Suggested domain | `waterleak.abetworks.in` |

**Why it wins.** Not a plumber guessing — data-driven leak detection from your meter readings that identifies the type of leak and what it costs you per month.

**How it works.** Daily consumption computation from sequential readings, per-capita comparison against 135 LPCD Indian benchmark, anomaly detection (sudden jumps, steady overnight consumption), leak type profiling (dripping tap 30-50 L/day, running toilet 200-400 L/day, underground pipe 500+ L/day), and monthly cost at municipal rates.

**Launch kit.** [`apps/44-waterleak/LAUNCH.md`](../apps/44-waterleak/LAUNCH.md)

---

## 45. GrowthChart

**Is your child growing on track - percentiles, not guesses**

| | |
|---|---|
| Folder | [`apps/45-growthchart`](../apps/45-growthchart) |
| Category | Health tools |
| The one job | Child date of birth, sex, and measurements over time in, exact WHO percentiles via LMS method, growth velocity, percentile crossing alerts, and paediatrician discussion prompts out. |
| Buyer | Parents, paediatricians, anganwadi workers, child health clinics, school health programmes |
| Pricing | Free · $9/mo · Enterprise custom |
| MCP tool | `child_growth_chart` |
| Suggested domain | `growthchart.abetworks.in` |

**Why it wins.** Not approximate zones — exact percentile from WHO LMS method with trajectory analysis that catches growth faltering months before it becomes visible.

**How it works.** WHO Child Growth Standards LMS parameters (weight-for-age, height-for-age) with interpolation, z-score computation, percentile calculation via normal CDF approximation, percentile crossing detection across major lines, growth velocity computation, and clinical flag generation.

**Launch kit.** [`apps/45-growthchart/LAUNCH.md`](../apps/45-growthchart/LAUNCH.md)

---

## 46. ExamPlan

**How many hours per subject, and when to start**

| | |
|---|---|
| Folder | [`apps/46-examplan`](../apps/46-examplan) |
| Category | Education tools |
| The one job | Exam date, subjects with syllabus size and difficulty, and study hours per day in, weighted hour allocation, day-by-day calendar, revision blocks, insufficiency warnings, and critical subjects out. |
| Buyer | Students (board exams, competitive exams, university), parents, tutors, coaching centres |
| Pricing | Free · $9/mo · Enterprise custom |
| MCP tool | `exam_study_planner` |
| Suggested domain | `examplan.abetworks.in` |

**Why it wins.** Not motivation — math. Exactly how many hours each subject needs, distributed across days with revision built in, and a clear warning if you started too late.

**How it works.** Weight computation (chapters x difficulty), proportional hour allocation, 30% revision reservation, day-by-day subject rotation for interleaving, insufficiency detection with additional-hours-per-day calculation, and critical subject identification by risk ratio.

**Launch kit.** [`apps/46-examplan/LAUNCH.md`](../apps/46-examplan/LAUNCH.md)

---

## 47. EstateAdmin

**What has to happen after someone dies, in what order**

| | |
|---|---|
| Folder | [`apps/47-estateadmin`](../apps/47-estateadmin) |
| Category | Legal tools |
| The one job | State, religion, assets, will status, and heir details in, chronological checklist with timelines, documents, religion-specific succession law, and NRI complications out. |
| Buyer | Families dealing with bereavement, estate planners, advocates, CA firms, NRIs managing Indian estates |
| Pricing | Free · $9/mo · Enterprise custom |
| MCP tool | `estate_administration_checklist` |
| Suggested domain | `estateadmin.abetworks.in` |

**Why it wins.** Not a generic grief resource — a precise legal and administrative checklist for this religion, these assets, this state, with documents needed at each step.

**How it works.** Religion-specific succession law application (Hindu Succession Act 1956, Muslim Personal Law, Indian Succession Act 1925), asset-type-specific procedures (property mutation, bank claims, share transmission, insurance, PF), NRI POA/FEMA requirements, and phased timeline generation (immediate/short/medium/long-term).

**Launch kit.** [`apps/47-estateadmin/LAUNCH.md`](../apps/47-estateadmin/LAUNCH.md)

---

## 48. VisaDocs

**Every document this visa needs, with what is missing**

| | |
|---|---|
| Folder | [`apps/48-visadocs`](../apps/48-visadocs) |
| Category | Travel tools |
| The one job | Passport country, destination, visa type, and documents already held in, complete checklist with missing items flagged, financial requirements, photo specs, and processing timeline out. |
| Buyer | Visa applicants, travel agents, immigration consultants, corporate travel managers, students |
| Pricing | Free · $9/mo · Enterprise custom |
| MCP tool | `visa_document_checker` |
| Suggested domain | `visadocs.abetworks.in` |

**Why it wins.** Not a generic checklist — the exact documents this visa type for this country needs from an Indian passport holder, with what you have and what is missing.

**How it works.** Country-specific document database (15 destinations), visa-type-specific requirements (tourist/business/student/work), have/missing status matching, financial proof thresholds, photo specification differences, processing time and appointment timelines, and passport validity checking.

**Launch kit.** [`apps/48-visadocs/LAUNCH.md`](../apps/48-visadocs/LAUNCH.md)

---

## 49. MacroPlate

**Hit your protein target from Indian food you actually eat**

| | |
|---|---|
| Folder | [`apps/49-macroplate`](../apps/49-macroplate) |
| Category | Nutrition tools |
| The one job | Protein target, diet type, meals per day, and budget in, Indian food meal plan hitting protein goal within budget with per-meal breakdown and common myths corrected out. |
| Buyer | Fitness enthusiasts, bodybuilders, vegetarians seeking protein, dietitians, gym trainers |
| Pricing | Free · $9/mo · Enterprise custom |
| MCP tool | `protein_meal_planner` |
| Suggested domain | `macroplate.abetworks.in` |

**Why it wins.** Not Western bodybuilding foods — Indian foods you actually eat (dal, paneer, soya, curd, eggs, chicken) planned to hit protein targets within a rupee budget.

**How it works.** Indian food protein database (40+ items with protein per serving, cost per serving, serving sizes in Indian measures), budget-constrained greedy optimization, diet-type filtering (veg/egg/non-veg), meal distribution across day, protein-per-rupee ranking, and myth correction (dal = 7g not 20g, peanut butter is a fat source).

**Launch kit.** [`apps/49-macroplate/LAUNCH.md`](../apps/49-macroplate/LAUNCH.md)

---

## 50. EMICalc

**Compare loan offers properly - total cost, not just EMI**

| | |
|---|---|
| Folder | [`apps/50-emicalc`](../apps/50-emicalc) |
| Category | Finance tools |
| The one job | Up to 3 loan offers with principal, rate, tenure, fees, and insurance in, EMI, total interest, effective APR, total outflow ranking, rupee difference, and prepayment savings out. |
| Buyer | Home loan borrowers, car loan applicants, personal loan seekers, loan brokers, financial advisors |
| Pricing | Free · $9/mo · Enterprise custom |
| MCP tool | `emi_loan_comparator` |
| Suggested domain | `emicalc.abetworks.in` |

**Why it wins.** Not just EMI comparison — total lifetime cost including fees, effective APR, and prepayment savings that reveal which offer actually costs less over the full tenure.

**How it works.** EMI computation (reducing balance), total interest calculation, effective APR via Newton method (incorporating fees and insurance), total outflow ranking, prepayment scenario modeling (5% in year 2 with amortization simulation), tenure reduction calculation, and fee-vs-rate flip detection.

**Launch kit.** [`apps/50-emicalc/LAUNCH.md`](../apps/50-emicalc/LAUNCH.md)


---

## Revenue model summary

Three pricing shapes across the suite, matched to how each product actually gets used.

**Per-seat** (DealBrief) — used by named individuals every day, so seats align with value.

**Flat monthly** (everything else) — used by a team a few times a week, or a handful of times a month. Flat pricing removes the friction of counting, and for the compliance products it matches how the buyer thinks: the cost of the tool against the cost of the deadline.

**Usage-based** (PromptShield, and InvoiceParse and eInvoiceGuard at volume) — these sit in a request path, where volume is the only sensible unit.

**Deadline-priced** (AIActNotice, A11yGate, PolicyPack) — priced against what the alternative costs, not against usage. A lawyer reading your AI system description is ₹15,000 an hour; an accessibility audit is a four-figure engagement; a SOC 2 readiness project is several lakh. These are the only three tiers in the suite above ₹2,000, and that is why.

**Monthly-recurring-by-nature** (GSTMatch, PaySlipIN) — run every filing or payroll cycle without anyone deciding to. Cheapest tiers in the suite and the best retention, because the alternative is a spreadsheet somebody has to maintain.

Every product has a genuinely useful free tier. That is deliberate: with twenty products the cheapest possible distribution is a working demo that needs no signup, and a crippled demo wastes the launch it took to earn the traffic.

---

By [Abet Works](https://abetworks.in).
