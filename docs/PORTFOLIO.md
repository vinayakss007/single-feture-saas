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

**Generate the EU AI Act transparency notice your product needs**

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

**Paste your HTML, get every WCAG 2.2 failure and the EAA statement**

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

**Reconcile GSTR-2B against your purchase register and see the ITC at risk**

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

**Validate an e-invoice payload before the portal rejects it**

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

**Upload a card statement, get every subscription and renewal date**

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

**Answer ten questions, get the SOC 2 policy set and your gap list**

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

**Turn a vendor list into a subprocessor register with residency flags**

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

**Paste your SPF, DKIM and DMARC records and get the corrected ones**

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

**Paste a contract, get every deadline and auto-renewal trap**

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
