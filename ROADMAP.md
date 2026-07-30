# Products 11–20: the research, and what got built

> **Status: all ten are built and shipping.** Every one was produced by writing exactly two files —
> `lib/product.ts` and `lib/engine.ts` — with **no change to `_template/`**. They inherit accounts,
> billing, quotas, the REST API, the MCP server, monitoring and 42 tests from the framework.
>
> None needed `probesNetwork: true`, so all ten are deterministic. Three real bugs were found and
> fixed while building them, each in the product's own headline feature: GSTMatch failing to match
> `INV/2026/0412` against `inv-2026-412`, SubAudit double-counting a subscription that was both a
> duplicate and stale, and ContractClock reading a 12-month term as 360 days and picking the wrong
> notice period. Notes on each are in the detail below.

Ten single-feature SaaS products, chosen from market research in July 2026.

## What the research actually said

Four signals, consistent across sources:

1. **Vertical beats horizontal.** Median SaaS growth compressed to ~12% as horizontal categories
   saturated, while hyper-specialised products serving one industry's workflow keep finding
   customers with high willingness to pay and almost no competition —
   [BoilerplateHub, Jan 2026](https://boilerplatehub.com/blog/vertical-micro-saas-ideas-2026).
2. **Compliance is the most defensible niche.** The opportunity is a narrow workflow where a
   specific customer repeatedly loses time, money, or *compliance confidence* — not another
   general-purpose chatbot — [Quasa, 2026](https://quasa.io/media/24-niche-micro-saas-and-ai-startup-ideas-for-beginners-in-2026).
   Products grounded in regulatory compliance and physical-world integration stay defensible while
   thin AI wrappers get cloned —
   [Medium, 2026](https://medium.com/@nishilbhave/10-micro-saas-ideas-that-ai-cant-replicate-in-2026-55b0379a4ba1).
3. **Auditors want evidence, not intentions.** EU AI Act Article 50 transparency obligations land
   **2 August 2026**, and enterprise buyers' questionnaires now ask about model risk rather than
   just encryption —
   [Kosmoy](https://kosmoy.com/resources/blog/best-eu-ai-act-compliance-software-2026/) ·
   [Dupple](https://dupple.com/learn/best-ai-compliance-tools).
   Existing DORA tooling runs **€5,000–250,000/year** —
   [Legiscope](https://www.legiscope.com/blog/dora-compliance-software-buyers-guide.html) — which
   leaves an enormous gap under it.
4. **Indian SME compliance is underserved at the low end.** Invoice compliance, supplier gaps and
   credit access still hit **5 in 10 MSMEs** —
   [Economic Times, June 2026](https://m.economictimes.indiatimes.com/small-biz/sme-sector/world-msme-day-2026-supplier-gaps-invoice-compliance-credit-access-continue-to-hit-5-in-10-msmes/articleshow/132013668.cms).
   Every existing GST reconciliation tool is an ERP integration for mid-market —
   [Mysa](https://www.mysa.io/blogs/gst-reconciliation-software) — so nothing serves the business
   that just wants one report.

*Content from these sources was rephrased for compliance with licensing restrictions.*

**The strategy that follows:** four regulatory-deadline products (people pay for deadlines), two
India-specific finance products (abetworks.in's home market, where we have distribution), two
finance-ops products, two technical products. All deterministic. None is an LLM wrapper.

---

## The ten

| # | Product | One line | Who pays | Why now | Pro price |
|---|---------|----------|----------|---------|-----------|
| 11 | **AIActNotice** | Generate the EU AI Act Article 50 transparency notice your product legally needs | Anyone shipping AI into the EU | **Article 50 applies 2 Aug 2026** | ₹2,499/mo |
| 12 | **A11yGate** | Paste your HTML, get every WCAG 2.2 AA failure and the EAA statement to publish | EU e-commerce, banking, transport, SaaS | EAA enforceable since 28 Jun 2025; sanctions and market removal | ₹1,999/mo |
| 13 | **GSTMatch** | Reconcile GSTR-2B against your purchase register and see the ITC you are about to lose | Indian businesses, CAs | Every alternative is an ERP project | ₹1,499/mo |
| 14 | **eInvoiceGuard** | Validate an e-invoice payload against IRN and Peppol rules *before* the portal rejects it | Indian exporters, SaaS billing teams | Global e-invoicing now affects revenue recognition and collections | ₹1,999/mo |
| 15 | **SubAudit** | Upload a card statement, get every SaaS subscription, duplicate and renewal date | Finance leads, ops, founders | Subscription sprawl outruns procurement | ₹1,499/mo |
| 16 | **PolicyPack** | Answer 20 questions, get the SOC 2 / ISO 27001 policy set and your gap list | Startups facing their first security review | SOC 2 Type II needs an observation window you cannot backdate | ₹2,499/mo |
| 17 | **VendorTrace** | Turn your vendor list into a subprocessor register with data-residency flags | DPOs, SaaS companies under DPDP or GDPR | Subprocessor disclosure is now a standard questionnaire item | ₹1,999/mo |
| 18 | **PaySlipIN** | One CTC figure becomes a compliant Indian payslip with PF, ESI, PT and TDS | Small employers, HR consultants, CAs | Payroll compliance is monthly, unavoidable and error-prone | ₹999/mo |
| 19 | **DMARCFix** | Paste your SPF, DKIM and DMARC records and get the corrected ones | Anyone whose email lands in spam | Gmail and Yahoo bulk-sender rules now reject on alignment failures | ₹1,499/mo |
| 20 | **ContractClock** | Paste a contract, get every deadline, auto-renewal trap and notice window as a calendar | Ops, legal, procurement | Auto-renewals are the most expensive clause nobody diarises | ₹1,999/mo |

---

## Detail

Each block is what you need to write `lib/product.ts` and `lib/engine.ts`. Everything else is
inherited.

### 11. AIActNotice — `aiactnotice`

**Input** → what your AI system does, deployment context, whether it interacts with people,
generates content, or does emotion/biometric inference.
**Output** → risk tier (prohibited / high-risk / limited-risk / minimal) with the article cited for
each conclusion; the Article 50 transparency notice text to publish; a machine-readable evidence
record with a timestamp and input hash; the disclosure obligations you have missed.

**Engine:** a decision table over the Act's own criteria. Deterministic and *auditable*, which is
the whole point — a compliance artifact produced by an LLM is worth nothing to an auditor because it
cannot be reproduced. Ours can: same input, same output, same hash.

**Why it sells:** the deadline is real and imminent, the market is priced at platform rates, and the
buyer's alternative is a lawyer at ₹15,000/hour. **Highest-urgency product in this list.**

### 12. A11yGate — `a11ygate`

**Input** → pasted HTML (or an uploaded page).
**Output** → WCAG 2.2 AA failures with the specific success criterion, EN 301 549 clause mapping,
the offending element and line, a suggested fix, and a ready-to-publish EAA accessibility statement.

**Engine:** an HTML parser plus deterministic rule checks — missing `alt`, unlabelled controls,
heading order, contrast from inline styles, `lang`, landmark structure, tab order, `aria-*` misuse.

**Design note:** takes pasted HTML rather than crawling a URL, so it stays deterministic and needs
no egress (rule 2 of the framework). A URL fetcher is a Pro feature that would require
`probesNetwork: true` — a deliberate, documented trade, not an accident.

### 13. GSTMatch — `gstmatch`

**Input** → GSTR-2B CSV and your purchase register CSV.
**Output** → four buckets (matched, mismatched on value, missing in 2B, missing in register), total
input tax credit at risk in rupees, per-supplier breakdown, and a follow-up list.

**Engine:** GSTIN and invoice-number normalisation, fuzzy invoice matching with tolerance, tax
arithmetic. Pure CSV in, report out.

**Why it sells:** ITC at risk is a rupee number, which makes ROI a single sentence. Existing tools
want an ERP integration; this wants two CSVs.

### 14. eInvoiceGuard — `einvoiceguard`

**Input** → invoice JSON or CSV.
**Output** → pass/fail per mandatory field for India IRN schema and EU Peppol BIS 3.0, the exact
error codes the portal would return, HSN/tax-rate sanity checks, and a corrected payload.

**Engine:** schema validation plus checksum and code-list rules. Entirely deterministic.

**Why it sells:** a rejected e-invoice blocks a payment. Catching it before submission is worth more
than the subscription, every time it happens.

### 15. SubAudit — `subaudit`

**Input** → card or bank statement CSV.
**Output** → identified SaaS vendors, monthly versus annual cadence, duplicates and near-duplicates,
next renewal date per vendor, annualised total, and a "cancel these" shortlist with the amount saved.

**Engine:** merchant-string normalisation against a bundled vendor dictionary, cadence detection
from date intervals, duplicate detection across name variants.

**Why it sells:** it finds money on the first run. That is the easiest possible sale.

### 16. PolicyPack — `policypack`

**Input** → about 20 questions on company size, cloud provider, data types, region, subprocessors.
**Output** → the policy set an auditor expects (access control, change management, incident
response, vendor management, BCDR, SDLC), each mapped to SOC 2 Trust Services Criteria and ISO 27001
Annex A controls, plus a gap list of what you must actually *do*, not just document.

**Engine:** deterministic template composition. Same answers, same documents — which matters,
because an auditor comparing this year's policy to last year's should see intended diffs only.

**Honest framing:** this produces the paperwork and tells you plainly what evidence you still have
to collect. Pretending documents alone pass an audit would be the fastest way to lose the customer.

### 17. VendorTrace — `vendortrace`

**Input** → vendor list (name, purpose, data shared).
**Output** → a subprocessor register in the format buyers ask for, data-residency flag per vendor
(EU / US / India / other), transfer-mechanism requirement (SCCs, DPDP consent), DPA checklist with
what is missing, and a public subprocessor page.

**Engine:** lookup against a bundled dataset of common vendors' hosting regions and DPA URLs, plus
deterministic rules for which transfer mechanism a given route needs.

### 18. PaySlipIN — `payslipin`

**Input** → CTC, state, PF opt-in, metro/non-metro.
**Output** → full salary structure (basic, HRA, special allowance), employee and employer PF, ESI
eligibility and amounts, professional tax by state, TDS under both regimes with a comparison, net
take-home, and a printable payslip.

**Engine:** statutory arithmetic. The most deterministic product in the suite.

**Why it sells:** lowest price, highest frequency, and it runs every single month. Best retention
profile of the ten.

### 19. DMARCFix — `dmarcfix`

**Input** → pasted SPF, DKIM and DMARC TXT records plus the sending domain.
**Output** → syntax errors, the SPF 10-lookup limit with the current count, alignment analysis,
whether you meet Gmail and Yahoo bulk-sender requirements, a deliverability verdict, and the exact
corrected records to paste into DNS.

**Engine:** DNS record string parsing and rule checks. Deterministic because the records are pasted
in rather than resolved.

### 20. ContractClock — `contractclock`

**Input** → pasted contract text.
**Output** → every date and duration found, auto-renewal clauses with the notice window and the
**last safe date to cancel**, payment terms, termination rights, and a downloadable `.ics` calendar.

**Engine:** date and duration extraction with clause-pattern matching, then date arithmetic. No LLM
— a missed renewal deadline caused by a hallucinated date would be a liability, and a rule that
found nothing is honest in a way that a confident wrong answer is not.

---

## What was built, and what changed

| Product | Engine approach | Bug found while building |
|---|---|---|
| AIActNotice | Decision table over the Act's articles, FNV-1a evidence hash | — |
| A11yGate | 34 regex checks over markup, contrast from inline styles | — |
| GSTMatch | Segment-wise invoice normalisation, GSTIN checksum | **Separator stripping before zero-normalisation broke matching** |
| eInvoiceGuard | 40+ schema checks with real portal error codes | — |
| SubAudit | 180+ vendor patterns, cadence from median gap | **Double-counted duplicate-and-stale; flagged AWS+GCP as waste** |
| PolicyPack | Deterministic template composition | — |
| VendorTrace | 150+ vendor dataset, transfer-rule derivation | Completeness score read 93% with an unknown vendor |
| PaySlipIN | Statutory arithmetic, both tax regimes | — |
| DMARCFix | SPF mechanism parsing with known nested costs | — |
| ContractClock | Date and duration extraction, clause matching | **12-month term as 360 days; picked fee-notice over termination notice** |

## Build order

| Wave | Products | Rationale |
|------|----------|-----------|
| **1 — now** | AIActNotice, A11yGate | Regulatory deadlines are live. Urgency does the selling. |
| **2** | GSTMatch, PaySlipIN | India, monthly recurrence, abetworks.in has the distribution. |
| **3** | SubAudit, ContractClock | Both find money on the first run. Easiest demos to make viral. |
| **4** | PolicyPack, VendorTrace | Bundle as a "first security review" pair. |
| **5** | eInvoiceGuard, DMARCFix | Technical buyers, API-led, best MCP fit. |

Two products per wave, roughly one week per wave at framework speed.

## Why all ten fit the framework unchanged

| Requirement | How each product satisfies it |
|-------------|------------------------------|
| Single feature | Each is one verb: classify, audit, reconcile, validate, detect, generate, register, calculate, diagnose, extract |
| Deterministic engine | All ten are parsers, rule tables and arithmetic. **Zero need for `probesNetwork: true`** |
| Paste-in demo | Every one takes text or CSV — the demo works with no signup, which is rule 3 |
| Metered runs | One run = one document, one reconciliation, one audit. Natural billing unit |
| Free / Pro / Enterprise | Free proves it on one file; Pro is volume plus API; Enterprise is bulk plus support |
| MCP tool | All ten are things an agent should be able to call: `aiactnotice_classify_system`, `gstmatch_reconcile`, `contractclock_extract_deadlines` |

**No framework change is required to build any of these.** That is the test of whether
`_template/` is actually a framework rather than a folder of shared files — and it passes.
