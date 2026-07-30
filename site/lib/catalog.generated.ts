// GENERATED FILE — DO NOT EDIT.
// Source: scripts/catalog.json   Regenerate: pnpm run gen:hub
//
// The hub links to ten separately deployed products. This file is generated so
// the banner site cannot drift from what those products actually call themselves.

export type HubProduct = {
  /** folder name, e.g. "01-dealbrief" — also gives the display order */
  dir: string;
  slug: string;
  name: string;
  tagline: string;
  job: string;
  category: string;
  audience: string;
  accent: string;
  mcpTool: string;
  differentiator: string;
};

export const suite = {
  "name": "Abet Works — Single-Feature SaaS Suite",
  "company": "Abet Works",
  "site": "https://abetworks.in",
  "repo": "vinayakss007/single-feture-saas"
} as const;

export const products: HubProduct[] = [
  {
    "dir": "01-dealbrief",
    "slug": "dealbrief",
    "name": "DealBrief",
    "tagline": "Turn any sales call transcript into a CRM-ready deal brief",
    "job": "Sales call transcript in, qualified deal brief out.",
    "category": "Revenue operations",
    "audience": "B2B sales teams, RevOps, sales managers running pipeline reviews",
    "accent": "#4f46e5",
    "mcpTool": "dealbrief_analyze_call",
    "differentiator": "A meeting recorder summarises what was said. DealBrief judges the deal — what is missing, what is at risk, and who owes what by when."
  },
  {
    "dir": "02-churnsignal",
    "slug": "churnsignal",
    "name": "ChurnSignal",
    "tagline": "Paste a CSV, find out which customers are about to leave",
    "job": "Account CSV in, ranked churn risk with reason codes out.",
    "category": "Customer success",
    "audience": "SaaS founders, customer success teams, account managers",
    "accent": "#e11d48",
    "mcpTool": "churnsignal_score_accounts",
    "differentiator": "A health score without reason codes tells a CSM nothing. Every score here shows which signals fired, how many points each added, and the specific save play for the dominant one."
  },
  {
    "dir": "03-pricepulse",
    "slug": "pricepulse",
    "name": "PricePulse",
    "tagline": "Know the moment a competitor changes their pricing page",
    "job": "Two pricing page snapshots in, classified commercial diff out.",
    "category": "Competitive intelligence",
    "audience": "Product marketing, pricing owners, competitive intelligence, founders",
    "accent": "#0891b2",
    "mcpTool": "pricepulse_diff_pricing",
    "differentiator": "Visual diff tools fire on a rotated testimonial and a changed copyright year. This one parses the plans first, so only changes that affect what a buyer pays or gets ever surface."
  },
  {
    "dir": "04-consentscan",
    "slug": "consentscan",
    "name": "ConsentScan",
    "tagline": "Scan any website for India DPDP and GDPR consent compliance",
    "job": "URL in, prioritised DPDP and GDPR finding list out.",
    "category": "Privacy compliance",
    "audience": "Indian SMBs, web agencies, anyone with EU users, compliance owners",
    "accent": "#059669",
    "mcpTool": "consentscan_audit_site",
    "differentiator": "Every finding names the specific DPDP section or GDPR article it touches, and is ordered by penalty exposure. Most scanners just say \"cookie banner missing\"."
  },
  {
    "dir": "05-invoiceparse",
    "slug": "invoiceparse",
    "name": "InvoiceParse",
    "tagline": "Turn any invoice into clean data — and catch the GST errors",
    "job": "Invoice text in, validated structured data and ledger CSV out.",
    "category": "Finance automation",
    "audience": "Indian accountants, finance teams, B2B marketplaces, AP automation",
    "accent": "#7c3aed",
    "mcpTool": "invoiceparse_extract_and_validate",
    "differentiator": "Most parsers regex-match a 15-character string and call the GSTIN valid. This runs the actual check-digit algorithm, so a typo that would cost you input tax credit six months later gets caught now."
  },
  {
    "dir": "06-coldangle",
    "slug": "coldangle",
    "name": "ColdAngle",
    "tagline": "Cold email openers that prove you actually did the research",
    "job": "Public research text in, grounded openers and a deliverability audit out.",
    "category": "Outbound sales",
    "audience": "Founders doing their own outbound, SDRs, agencies running sequences",
    "accent": "#ea580c",
    "mcpTool": "coldangle_write_opener",
    "differentiator": "Every clause traces back to a line in the text you pasted. If the fact is not there, the opener does not assert it — which is why it never produces \"I loved your recent post about digital transformation\"."
  },
  {
    "dir": "07-repurpose10",
    "slug": "repurpose10",
    "name": "Repurpose10",
    "tagline": "One thing you wrote becomes ten platform-native posts",
    "job": "One long-form piece in, eleven platform-native outputs out.",
    "category": "Content marketing",
    "audience": "Solo creators, content teams, agencies managing client calendars",
    "accent": "#db2777",
    "mcpTool": "repurpose10_fan_out",
    "differentiator": "It selects and restructures your sentences rather than rewriting them. Your voice survives and no fact gets invented."
  },
  {
    "dir": "08-pingdeck",
    "slug": "pingdeck",
    "name": "PingDeck",
    "tagline": "The three outages nobody monitors, checked in one place",
    "job": "URLs in, availability plus certificate and domain expiry out.",
    "category": "Monitoring",
    "audience": "Small teams, agencies managing client sites, solo operators",
    "accent": "#2563eb",
    "mcpTool": "pingdeck_check_endpoints",
    "differentiator": "Uptime tools are a commodity. Expiring certificates and expiring domains cause a large share of small-site outages and almost nothing checks both — here they are free."
  },
  {
    "dir": "09-answerready",
    "slug": "answerready",
    "name": "AnswerReady",
    "tagline": "Find out whether AI search can actually read your site",
    "job": "URL in, AI answer-engine readiness score and the two missing files out.",
    "category": "AI search optimisation",
    "audience": "SEO owners, content marketers, founders losing traffic to AI answers",
    "accent": "#0d9488",
    "mcpTool": "answerready_audit_page",
    "differentiator": "Ranking tools measure backlinks. None of them tell you that you are blocking OAI-SearchBot, or that your content does not exist without JavaScript — which is what decides whether you get cited in an answer."
  },
  {
    "dir": "10-promptshield",
    "slug": "promptshield",
    "name": "PromptShield",
    "tagline": "One API call between untrusted text and your agent",
    "job": "Untrusted text in, verdict plus redacted text out.",
    "category": "AI security",
    "audience": "Teams shipping AI agents to production, platform and security engineers",
    "accent": "#4338ca",
    "mcpTool": "promptshield_scan_text",
    "differentiator": "A model asked to judge untrusted text is itself reading untrusted text and can be talked out of its judgement. Deterministic rules cannot be persuaded, run in single-digit milliseconds and cost nothing per call."
  },
  {
    "dir": "11-aiactnotice",
    "slug": "aiactnotice",
    "name": "AIActNotice",
    "tagline": "Generate the EU AI Act transparency notice your product needs",
    "job": "AI system description in, risk tier and Article 50 notice out.",
    "category": "AI governance",
    "audience": "Anyone shipping AI into the EU — founders, product leads, DPOs, compliance owners",
    "accent": "#6d28d9",
    "mcpTool": "aiactnotice_classify_system",
    "differentiator": "Every compliance platform in this category is priced for a programme, and every AI-written classification is unreproducible. This applies the published criteria deterministically and cites the article that produced each conclusion — which is what an auditor asks for."
  },
  {
    "dir": "12-a11ygate",
    "slug": "a11ygate",
    "name": "A11yGate",
    "tagline": "Paste your HTML, get every WCAG 2.2 failure and the EAA statement",
    "job": "HTML in, WCAG failures with fixes and a publishable accessibility statement out.",
    "category": "Accessibility compliance",
    "audience": "EU e-commerce, banking, transport and SaaS teams, plus the agencies that build for them",
    "accent": "#b45309",
    "mcpTool": "a11ygate_audit_html",
    "differentiator": "Browser extensions test a rendered page, so they cannot run in CI or on a component that is not deployed. This runs on source with no browser, maps findings to EN 301 549 as well as WCAG, and generates the accessibility statement — which is a legal deliverable, not a report."
  },
  {
    "dir": "13-gstmatch",
    "slug": "gstmatch",
    "name": "GSTMatch",
    "tagline": "Reconcile GSTR-2B against your purchase register and see the ITC at risk",
    "job": "Two CSVs in, input tax credit at risk in rupees out.",
    "category": "Tax compliance",
    "audience": "Indian businesses filing GST, chartered accountants, finance teams",
    "accent": "#15803d",
    "mcpTool": "gstmatch_reconcile_2b",
    "differentiator": "Every GST reconciliation product on the market is an ERP integration for mid-market. This wants two CSVs and gives you a rupee figure for the credit you are about to lose, which makes the ROI a single sentence."
  },
  {
    "dir": "14-einvoiceguard",
    "slug": "einvoiceguard",
    "name": "eInvoiceGuard",
    "tagline": "Validate an e-invoice payload before the portal rejects it",
    "job": "Invoice payload in, portal error codes and a corrected payload out.",
    "category": "Finance automation",
    "audience": "Indian businesses on e-invoicing, SaaS exporters, ERP and billing engineers",
    "accent": "#0369a1",
    "mcpTool": "einvoiceguard_validate_payload",
    "differentiator": "A rejected e-invoice blocks a payment, and you find out after submitting. This is wrong in the same way the portal is wrong — real error codes, offline — and returns a corrected payload for everything fixable deterministically."
  },
  {
    "dir": "15-subaudit",
    "slug": "subaudit",
    "name": "SubAudit",
    "tagline": "Upload a card statement, get every subscription and renewal date",
    "job": "Statement CSV in, subscription map with duplicates and renewals out.",
    "category": "Finance operations",
    "audience": "Founders, finance leads, office managers and anyone who owns a company card",
    "accent": "#be123c",
    "mcpTool": "subaudit_find_subscriptions",
    "differentiator": "Spend management platforms want to become your card, which is a procurement project. This wants a CSV you already have — no bank connection, no OAuth — and usually finds money on the first run."
  },
  {
    "dir": "16-policypack",
    "slug": "policypack",
    "name": "PolicyPack",
    "tagline": "Answer ten questions, get the SOC 2 policy set and your gap list",
    "job": "Company profile in, policy set with control mapping and gap list out.",
    "category": "Security compliance",
    "audience": "Startups facing their first security review, CTOs, and whoever got handed the questionnaire",
    "accent": "#1e40af",
    "mcpTool": "policypack_generate_policies",
    "differentiator": "Downloaded templates describe a company with a security team and a SIEM, which an auditor reads before asking for evidence you do not have. This describes your actual company, and states plainly which controls your headcount cannot satisfy."
  },
  {
    "dir": "17-vendortrace",
    "slug": "vendortrace",
    "name": "VendorTrace",
    "tagline": "Turn a vendor list into a subprocessor register with residency flags",
    "job": "Vendor list in, Article 30 register and subprocessor page out.",
    "category": "Privacy compliance",
    "audience": "DPOs, founders answering security questionnaires, SaaS companies under DPDP or GDPR",
    "accent": "#a21caf",
    "mcpTool": "vendortrace_build_register",
    "differentiator": "Subprocessor disclosure is now a standard questionnaire item, and answering 'we use AWS and a few tools' ends the conversation with procurement. This produces the register in the format buyers accept, and flags unknown vendors rather than dropping them."
  },
  {
    "dir": "18-payslipin",
    "slug": "payslipin",
    "name": "PaySlipIN",
    "tagline": "One CTC figure becomes a compliant Indian payslip",
    "job": "Annual CTC in, full payslip with PF, ESI, PT and TDS out.",
    "category": "Payroll compliance",
    "audience": "Small employers, HR consultants, chartered accountants and anyone doing payroll in a spreadsheet",
    "accent": "#047857",
    "mcpTool": "payslipin_compute_payslip",
    "differentiator": "A full HRMS is the wrong shape and price for four employees. This computes one correct payslip and shows every threshold it used, so you can check it against the current Finance Act rather than trusting a black box."
  },
  {
    "dir": "19-dmarcfix",
    "slug": "dmarcfix",
    "name": "DMARCFix",
    "tagline": "Paste your SPF, DKIM and DMARC records and get the corrected ones",
    "job": "Email auth records in, lookup count, failures and corrected records out.",
    "category": "Email deliverability",
    "audience": "Founders whose email lands in spam, ops and platform engineers, agencies running client domains",
    "accent": "#c2410c",
    "mcpTool": "dmarcfix_audit_records",
    "differentiator": "SPF breaks silently at ten DNS lookups — permerror, no error anywhere an operator would look. This counts them from pasted records, so you can test a change before publishing it and run the check in CI."
  },
  {
    "dir": "20-contractclock",
    "slug": "contractclock",
    "name": "ContractClock",
    "tagline": "Paste a contract, get every deadline and auto-renewal trap",
    "job": "Contract text in, deadlines and a calendar file out.",
    "category": "Contract operations",
    "audience": "Ops and finance leads, procurement, founders signing their own contracts, agencies managing client vendors",
    "accent": "#7e22ce",
    "mcpTool": "contractclock_extract_deadlines",
    "differentiator": "Contract management platforms want your whole repository migrated. This answers one question about one contract — and uses no model, because a hallucinated cancellation deadline is a liability rather than a bug."
  },
  {
    "dir": "21-medibillcheck",
    "slug": "medibillcheck",
    "name": "MediBillCheck",
    "tagline": "Find the errors in a hospital bill before you pay it",
    "job": "Itemised hospital bill in, questionable charges and a query letter out.",
    "category": "Health finance",
    "audience": "Anyone paying a hospital bill in India, plus the family members who end up handling it",
    "accent": "#0e7490",
    "mcpTool": "medibillcheck_audit_bill",
    "differentiator": "Bill audit services take a percentage and a fortnight. This runs on the bill you are holding at the discharge counter, and every finding is a rupee figure with a line number you can point at. It makes no clinical judgement, which is exactly why it can be trusted on the parts it does judge."
  },
  {
    "dir": "22-labtrack",
    "slug": "labtrack",
    "name": "LabTrack",
    "tagline": "See which lab values are outside range, and which are moving",
    "job": "Lab report values in, range flags and trends across reports out.",
    "category": "Health records",
    "audience": "Anyone managing their own or a parent's test results across multiple reports and labs",
    "accent": "#0f766e",
    "mcpTool": "labtrack_check_values",
    "differentiator": "Every other tool in this space interprets. This deliberately does not: it checks thirty values against thirty ranges without missing one, and lines up four reports to show what is moving. Both are mechanical, both are where the signal is, and neither requires a diagnosis nobody should take from a text box."
  },
  {
    "dir": "23-vaxdue",
    "slug": "vaxdue",
    "name": "VaxDue",
    "tagline": "Which childhood vaccines are overdue, due now and next",
    "job": "Date of birth and doses given in, overdue and upcoming schedule out.",
    "category": "Child health",
    "audience": "Parents and grandparents tracking a child's immunisations, and the relative who ends up holding the card",
    "accent": "#c026d3",
    "mcpTool": "vaxdue_check_schedule",
    "differentiator": "A paper card and a chart in weeks and months, versus actual calendar dates you can diary. It also marks every dose free or paid, which is the thing nobody explains at the counter, and is honest that being late almost never means starting again."
  }
];
