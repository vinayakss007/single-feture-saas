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
  },
  {
    "dir": "24-loantruth",
    "slug": "loantruth",
    "name": "LoanTruth",
    "tagline": "The real interest rate on your loan, not the one you were quoted",
    "job": "Sanction letter terms in, true APR and amortisation out.",
    "category": "Personal finance",
    "audience": "Anyone taking a home, car, personal or business loan, and anyone already paying one off",
    "accent": "#1d4ed8",
    "mcpTool": "loantruth_analyse_loan",
    "differentiator": "Every EMI calculator computes the payment. None tells you that fees deducted from disbursal mean you pay interest on money you never received — on the sample loan that is 0.36 points of hidden APR, and no sanction letter states it."
  },
  {
    "dir": "25-tripsplit",
    "slug": "tripsplit",
    "name": "TripSplit",
    "tagline": "Settle a group trip in three transfers instead of eleven",
    "job": "Shared expenses in, minimal set of transfers out.",
    "category": "Travel money",
    "audience": "Anyone who has organised a group trip, a shared house, or a weekend away and ended up as the accountant",
    "accent": "#ca8a04",
    "mcpTool": "tripsplit_settle_expenses",
    "differentiator": "Splitting is bookkeeping; minimising the payments is the actual problem. Four transfers instead of six on the sample trip, and a message ready for the group chat — with no account to create and nothing stored afterwards."
  },
  {
    "dir": "26-flightright",
    "slug": "flightright",
    "name": "FlightRight",
    "tagline": "What the airline actually owes you, and the letter to claim it",
    "job": "Flight disruption details in, entitlements and a claim letter out.",
    "category": "Travel rights",
    "audience": "Anyone whose flight was delayed, cancelled or overbooked, and who was offered a voucher",
    "accent": "#0284c7",
    "mcpTool": "flightright_assess_claim",
    "differentiator": "Claim companies take 25-35% for sending a letter and decline the marginal cases. This separates the three entitlements airlines conflate, pre-answers the four standard refusals, and hands you the letter."
  },
  {
    "dir": "27-solarpayback",
    "slug": "solarpayback",
    "name": "SolarPayback",
    "tagline": "Will rooftop solar actually pay for itself, and when",
    "job": "Monthly bill and rooftop area in, payback period and savings out.",
    "category": "Home energy",
    "audience": "Homeowners considering rooftop solar, and anyone who was just quoted a system",
    "accent": "#16a34a",
    "mcpTool": "solarpayback_analyse_roi",
    "differentiator": "Solar salespeople quote savings. This shows the payback month, the IRR, and what happens to both when you change the assumptions — because the assumptions are where they lie."
  },
  {
    "dir": "28-powerbill",
    "slug": "powerbill",
    "name": "PowerBill",
    "tagline": "What is wrong with this electricity bill, in rupees",
    "job": "Bill line items in, slab errors and overcharges in rupees out.",
    "category": "Home utilities",
    "audience": "Anyone who suspects their electricity bill is wrong and wants the arithmetic before they complain",
    "accent": "#d97706",
    "mcpTool": "powerbill_audit_bill",
    "differentiator": "Every finding is a rupee number with a slab table cited. Not 'your bill seems high' — the exact arithmetic the discom used and where it departs from the tariff order."
  },
  {
    "dir": "29-rentcheck",
    "slug": "rentcheck",
    "name": "RentCheck",
    "tagline": "Is this rent fair for this area, and what to negotiate",
    "job": "Property details and quoted rent in, fair range and negotiation points out.",
    "category": "Housing",
    "audience": "Anyone looking at a rental in an Indian metro and wondering whether the number is real",
    "accent": "#7c2d12",
    "mcpTool": "rentcheck_evaluate_rent",
    "differentiator": "Not a listing site — a second opinion on the number someone quoted you, with the specific points to negotiate on and the clauses to add to the agreement."
  },
  {
    "dir": "30-propertytax",
    "slug": "propertytax",
    "name": "PropertyTax",
    "tagline": "Calculate your property tax before the notice arrives",
    "job": "Property details and city in, tax computation with rates cited out.",
    "category": "Property",
    "audience": "Property owners in Indian metros who get a notice they cannot verify",
    "accent": "#1e3a5f",
    "mcpTool": "propertytax_compute_tax",
    "differentiator": "Seven cities, three different methods, and the step-by-step working so you can check the notice when it arrives rather than accepting it."
  },
  {
    "dir": "31-nutrilabel",
    "slug": "nutrilabel",
    "name": "NutriLabel",
    "tagline": "Read a food label and know what it actually means",
    "job": "Nutrition facts in, traffic-light breakdown and label honesty rating out.",
    "category": "Health & nutrition",
    "audience": "Health-conscious Indian consumers, dietitians, fitness coaches, parents reading labels for their kids",
    "accent": "#065f46",
    "mcpTool": "nutrilabel_analyze_label",
    "differentiator": "Not a calorie counter — a label auditor that normalises to per-100g, catches misleading serving sizes, and rates the label honest/misleading/deceptive based on what the front says vs what the back shows."
  },
  {
    "dir": "32-sleepdebt",
    "slug": "sleepdebt",
    "name": "SleepDebt",
    "tagline": "How much sleep you owe yourself, and when to repay it",
    "job": "Sleep log in, cumulative debt, severity, recovery plan, and tonight's bedtime out.",
    "category": "Health & wellness",
    "audience": "Professionals with irregular sleep, shift workers, students, anyone tracking sleep debt",
    "accent": "#4c1d95",
    "mcpTool": "sleepdebt_analyze_log",
    "differentiator": "Not a sleep tracker — a debt calculator that tells you exactly how much you owe, how long recovery will take with realistic diminishing returns, and what time to go to bed tonight."
  },
  {
    "dir": "33-racepace",
    "slug": "racepace",
    "name": "RacePace",
    "tagline": "The pace plan that gets you to the finish, not the wall",
    "job": "Race distance and training data in, per-km pace plan with three strategies out.",
    "category": "Fitness & endurance",
    "audience": "Recreational runners preparing for 5K to marathon, running coaches building race strategies",
    "accent": "#b91c1c",
    "mcpTool": "racepace_plan_race",
    "differentiator": "Not a finish-time calculator — a pace plan that shows you three versions of your race including the one where you hit the wall, so you recognise it happening in time to adjust."
  },
  {
    "dir": "34-weddingbudget",
    "slug": "weddingbudget",
    "name": "WeddingBudget",
    "tagline": "What an Indian wedding actually costs, by category",
    "job": "Wedding parameters in, 12-category budget with city/season multipliers and savings plan out.",
    "category": "Personal finance",
    "audience": "Indian couples and families planning weddings, wedding planners building budgets",
    "accent": "#9d174d",
    "mcpTool": "weddingbudget_calculate",
    "differentiator": "Not a wedding checklist — a budget reality check that shows the 60% nobody quotes (decoration, photography add-ons, transport, miscellaneous) with the multipliers that change everything."
  },
  {
    "dir": "35-schoolfee",
    "slug": "schoolfee",
    "name": "SchoolFee",
    "tagline": "Compare school fees properly — total cost, not just tuition",
    "job": "Fee structures for up to 3 schools in, true total cost comparison with inflation projection out.",
    "category": "Personal finance",
    "audience": "Indian parents choosing between schools, financial planners advising on education costs",
    "accent": "#155e75",
    "mcpTool": "schoolfee_compare",
    "differentiator": "Not a school directory — a financial comparison that adds every hidden fee, projects what you will actually pay by Class 12, and shows what investing the difference could grow to."
  },
  {
    "dir": "36-resumeats",
    "slug": "resumeats",
    "name": "ResumeATS",
    "tagline": "What an ATS actually sees in your resume",
    "job": "Resume text and job description in, ATS parse score with keyword match rate and rejection flags out.",
    "category": "Career tools",
    "audience": "Job seekers in India and globally, career coaches, resume writers, placement consultants",
    "accent": "#dc2626",
    "mcpTool": "resume_ats_scan",
    "differentiator": "Not a resume builder — an ATS simulator that shows exactly what gets extracted, what gets lost, and why 70% of resumes are rejected before a human reads them."
  },
  {
    "dir": "37-rtidraft",
    "slug": "rtidraft",
    "name": "RTIDraft",
    "tagline": "The RTI application that gets answered, not ignored",
    "job": "Authority type, department, and information request in, formatted RTI application with legal citations and fee details out.",
    "category": "Legal tools",
    "audience": "Indian citizens filing RTI applications, RTI activists, journalists, NGOs, legal aid organizations",
    "accent": "#854d0e",
    "mcpTool": "rti_draft",
    "differentiator": "Not a legal advice tool — a properly formatted RTI application generator that gets the technicalities right so your valid question actually gets answered."
  },
  {
    "dir": "38-carcost",
    "slug": "carcost",
    "name": "CarCost",
    "tagline": "The real cost of owning this car, not just the EMI",
    "job": "Car price, state, fuel type, and loan details in, true 5-year ownership cost with cost-per-km out.",
    "category": "Personal finance",
    "audience": "Indian car buyers, auto journalists, financial planners, car comparison researchers",
    "accent": "#1a2e05",
    "mcpTool": "car_cost_compute",
    "differentiator": "Not a car listing — a financial calculator that shows what you think it costs (EMI) vs what it actually costs (EMI + fuel + insurance + service + depreciation)."
  },
  {
    "dir": "39-petdose",
    "slug": "petdose",
    "name": "PetDose",
    "tagline": "What your pet weighs and when each dose is due",
    "job": "Species, breed, weight, and last treatment dates in, next due dates with weight-based dosing out.",
    "category": "Pet care",
    "audience": "Pet owners in India, veterinarians, pet boarding facilities, animal shelters",
    "accent": "#92400e",
    "mcpTool": "pet_dose_schedule",
    "differentiator": "Not a pet health app — a preventative care calculator that tells you exactly what dose, which product, and when it is due based on your pet's actual weight and schedule."
  },
  {
    "dir": "40-packlist",
    "slug": "packlist",
    "name": "PackList",
    "tagline": "The packing list for this trip, this weather, this many days",
    "job": "Destination type, duration, weather, and activities in, complete categorised packing list with quantities and bag space estimate out.",
    "category": "Travel tools",
    "audience": "Travellers, business travellers, backpackers, digital nomads, travel planners",
    "accent": "#3f6212",
    "mcpTool": "packing_list",
    "differentiator": "Not a generic travel checklist — a packing calculator that gives exact quantities for this trip, this weather, this many days, with these activities, in this bag."
  },
  {
    "dir": "41-legalnotice",
    "slug": "legalnotice",
    "name": "LegalNotice",
    "tagline": "The legal notice that gets a reply, not a dustbin",
    "job": "Dispute type, sender/recipient details, and facts in, properly structured legal notice with correct Indian law sections, timeline, and consequences out.",
    "category": "Legal tools",
    "audience": "Individuals, advocates, small businesses, HR teams, landlords, tenants, consumers",
    "accent": "#831843",
    "mcpTool": "legal_notice_generator",
    "differentiator": "Not a generic angry letter — a properly formatted legal notice with correct statutes, mandatory timelines, and the consequences that make recipients respond."
  },
  {
    "dir": "42-cropcal",
    "slug": "cropcal",
    "name": "CropCal",
    "tagline": "What to sow this week, for this soil, in this climate",
    "job": "State, soil type, month, land area, and irrigation in, crop recommendations with seed quantity, water needs, sowing window, yield estimates, and mandi prices out.",
    "category": "Agriculture tools",
    "audience": "Farmers, agricultural officers, agri-entrepreneurs, FPOs, rural advisors",
    "accent": "#365314",
    "mcpTool": "crop_calendar",
    "differentiator": "Not generic agriculture advice — specific crops for this soil, this zone, this month, with exact seed quantity for your land area and whether the sowing window is closing."
  },
  {
    "dir": "43-freelancerate",
    "slug": "freelancerate",
    "name": "FreelanceRate",
    "tagline": "What to charge per hour, based on what you actually need to earn",
    "job": "Target take-home, expenses, working days, billable hours, and buffer in, minimum viable hourly/day/monthly rate with utilisation scenarios and Indian market comparison out.",
    "category": "Finance tools",
    "audience": "Freelancers, consultants, independent contractors, solopreneurs, agencies",
    "accent": "#581c87",
    "mcpTool": "freelance_rate_calculator",
    "differentiator": "Not a guess — the actual math of what you must charge per hour given what you need to earn, what you spend, and what you realistically bill."
  },
  {
    "dir": "44-waterleak",
    "slug": "waterleak",
    "name": "WaterLeak",
    "tagline": "Find the leak from your water meter readings",
    "job": "Meter readings over several days and household size in, daily consumption analysis, leak detection, litres lost per day, monthly cost, and likely leak type out.",
    "category": "Utility tools",
    "audience": "Homeowners, apartment residents, facility managers, plumbers, water utility engineers",
    "accent": "#164e63",
    "mcpTool": "water_leak_detector",
    "differentiator": "Not a plumber guessing — data-driven leak detection from your meter readings that identifies the type of leak and what it costs you per month."
  },
  {
    "dir": "45-growthchart",
    "slug": "growthchart",
    "name": "GrowthChart",
    "tagline": "Is your child growing on track - percentiles, not guesses",
    "job": "Child date of birth, sex, and measurements over time in, exact WHO percentiles via LMS method, growth velocity, percentile crossing alerts, and paediatrician discussion prompts out.",
    "category": "Health tools",
    "audience": "Parents, paediatricians, anganwadi workers, child health clinics, school health programmes",
    "accent": "#701a75",
    "mcpTool": "child_growth_chart",
    "differentiator": "Not approximate zones — exact percentile from WHO LMS method with trajectory analysis that catches growth faltering months before it becomes visible."
  },
  {
    "dir": "46-examplan",
    "slug": "examplan",
    "name": "ExamPlan",
    "tagline": "How many hours per subject, and when to start",
    "job": "Exam date, subjects with syllabus size and difficulty, and study hours per day in, weighted hour allocation, day-by-day calendar, revision blocks, insufficiency warnings, and critical subjects out.",
    "category": "Education tools",
    "audience": "Students (board exams, competitive exams, university), parents, tutors, coaching centres",
    "accent": "#134e4a",
    "mcpTool": "exam_study_planner",
    "differentiator": "Not motivation — math. Exactly how many hours each subject needs, distributed across days with revision built in, and a clear warning if you started too late."
  },
  {
    "dir": "47-estateadmin",
    "slug": "estateadmin",
    "name": "EstateAdmin",
    "tagline": "What has to happen after someone dies, in what order",
    "job": "State, religion, assets, will status, and heir details in, chronological checklist with timelines, documents, religion-specific succession law, and NRI complications out.",
    "category": "Legal tools",
    "audience": "Families dealing with bereavement, estate planners, advocates, CA firms, NRIs managing Indian estates",
    "accent": "#450a0a",
    "mcpTool": "estate_administration_checklist",
    "differentiator": "Not a generic grief resource — a precise legal and administrative checklist for this religion, these assets, this state, with documents needed at each step."
  },
  {
    "dir": "48-visadocs",
    "slug": "visadocs",
    "name": "VisaDocs",
    "tagline": "Every document this visa needs, with what is missing",
    "job": "Passport country, destination, visa type, and documents already held in, complete checklist with missing items flagged, financial requirements, photo specs, and processing timeline out.",
    "category": "Travel tools",
    "audience": "Visa applicants, travel agents, immigration consultants, corporate travel managers, students",
    "accent": "#422006",
    "mcpTool": "visa_document_checker",
    "differentiator": "Not a generic checklist — the exact documents this visa type for this country needs from an Indian passport holder, with what you have and what is missing."
  },
  {
    "dir": "49-macroplate",
    "slug": "macroplate",
    "name": "MacroPlate",
    "tagline": "Hit your protein target from Indian food you actually eat",
    "job": "Protein target, diet type, meals per day, and budget in, Indian food meal plan hitting protein goal within budget with per-meal breakdown and common myths corrected out.",
    "category": "Nutrition tools",
    "audience": "Fitness enthusiasts, bodybuilders, vegetarians seeking protein, dietitians, gym trainers",
    "accent": "#052e16",
    "mcpTool": "protein_meal_planner",
    "differentiator": "Not Western bodybuilding foods — Indian foods you actually eat (dal, paneer, soya, curd, eggs, chicken) planned to hit protein targets within a rupee budget."
  },
  {
    "dir": "50-emicalc",
    "slug": "emicalc",
    "name": "EMICalc",
    "tagline": "Compare loan offers properly - total cost, not just EMI",
    "job": "Up to 3 loan offers with principal, rate, tenure, fees, and insurance in, EMI, total interest, effective APR, total outflow ranking, rupee difference, and prepayment savings out.",
    "category": "Finance tools",
    "audience": "Home loan borrowers, car loan applicants, personal loan seekers, loan brokers, financial advisors",
    "accent": "#1c1917",
    "mcpTool": "emi_loan_comparator",
    "differentiator": "Not just EMI comparison — total lifetime cost including fees, effective APR, and prepayment savings that reveal which offer actually costs less over the full tenure."
  }
];
