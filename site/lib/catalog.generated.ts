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
  }
];
