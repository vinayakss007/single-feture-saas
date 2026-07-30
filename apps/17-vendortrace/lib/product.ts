import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "vendortrace",
  name: "VendorTrace",
  tagline: "Your vendor list becomes the subprocessor register buyers ask for",
  oneLiner:
    "Paste your vendor list and get the subprocessor register enterprise buyers now demand, with each vendor's hosting region, the transfer mechanism you need, what is missing from your DPAs, and a public subprocessor page.",
  category: "Privacy compliance",
  audience: "DPOs, founders answering security questionnaires, SaaS companies under DPDP or GDPR",
  accent: "#a21caf",
  accentSoft: "#fdf4ff",

  metrics: [
    { value: "150+", label: "Vendors with known hosting regions" },
    { value: "2", label: "Regimes: GDPR and India DPDP" },
    { value: "Article 30", label: "Format buyers actually accept" },
  ],

  problem: [
    {
      title: "Subprocessor disclosure is now a standard questionnaire item",
      body:
        "Every enterprise deal asks for the list: who you share data with, where they host it, and whether you have a DPA. Answering 'we use AWS and a few tools' ends the conversation with procurement.",
    },
    {
      title: "Nobody knows where their vendors actually store data",
      body:
        "Your analytics tool might be in Frankfurt or Virginia. That single fact decides whether you need standard contractual clauses, and it is buried in a subprocessor page on the vendor's own site.",
    },
    {
      title: "The register is maintained in a spreadsheet, or not at all",
      body:
        "GDPR Article 30 requires records of processing. DPDP requires you to know your processors. Both get done the week before an audit and go stale immediately afterwards.",
    },
  ],

  features: [
    {
      title: "Hosting region per vendor, from a bundled dataset",
      body:
        "150+ common SaaS vendors with their primary hosting jurisdiction and DPA location, so you are not reading subprocessor pages one at a time.",
    },
    {
      title: "The transfer mechanism you actually need",
      body:
        "EU to US needs standard contractual clauses and a transfer impact assessment. India to anywhere needs a lawful basis under DPDP. Worked out per vendor from where your data starts and where it lands.",
    },
    {
      title: "DPA gap list",
      body:
        "Which vendors need a data processing agreement you probably have not signed, and which offer one you only need to accept — often a checkbox in their dashboard.",
    },
    {
      title: "Article 30 register, in the accepted format",
      body:
        "Purpose, categories of data, recipients, transfers and retention per processing activity — the structure a regulator and a buyer both expect.",
    },
    {
      title: "A public subprocessor page",
      body:
        "Markdown you can publish. Buyers increasingly require notice of subprocessor changes, and a page is how you give it.",
    },
    {
      title: "Honest about what it cannot know",
      body:
        "Your own configuration can override a vendor's default region, and only you know your contract. Anything uncertain is flagged for confirmation rather than asserted.",
    },
  ],

  how: [
    "List your vendors: name, what you use them for, and what data they receive.",
    "Say where your data starts and which regime applies.",
    "Get the register with region flags, transfer mechanisms and the DPA gap list.",
    "Publish the subprocessor page and attach the register to your next questionnaire.",
  ],

  integrations: [
    "CSV from a spend export or SubAudit",
    "Markdown for a trust centre or subprocessor page",
    "JSON register for a GRC tool",
    "REST API to regenerate whenever the vendor list changes",
    "MCP server so an agent can answer questionnaire items from the register",
  ],

  pricing: [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      blurb: "For the questionnaire in front of you.",
      features: [
        "25 registers a month",
        "Full vendor dataset and region flags",
        "Transfer mechanism analysis",
        "Article 30 register and subprocessor page",
      ],
      cta: "Build a register",
      monthlyRuns: 25,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Privacy",
      price: "₹1,999",
      period: "/month",
      blurb: "For keeping the register true, not just producing one.",
      features: [
        "5,000 registers a month",
        "REST API and MCP server access",
        "Regenerate on every vendor change",
        "Custom vendor entries for internal systems",
        "Email support",
      ],
      cta: "Start on Privacy",
      highlight: true,
      monthlyRuns: 5_000,
      apiAccess: true,
      rateLimitPerMin: 120,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      blurb: "For a DPO across several entities or clients.",
      features: [
        "Unlimited registers",
        "Self-hosted Docker image",
        "Multi-entity and multi-client",
        "Custom regimes — LGPD, PIPEDA, PDPA",
        "SLA and a shared Slack channel",
      ],
      cta: "Talk to us",
      monthlyRuns: Number.POSITIVE_INFINITY,
      apiAccess: true,
      rateLimitPerMin: 600,
    },
  ],

  faq: [
    {
      q: "How current is the hosting region data?",
      a: "It reflects each vendor's published default at the time of the release, and every entry is labelled as a default rather than a fact about your account. Most vendors let you choose a region, and your choice overrides the default — so where it matters commercially, the output tells you to confirm rather than letting you cite our dataset as evidence.",
    },
    {
      q: "Is this legal advice?",
      a: "No. It applies published transfer rules to the vendor list you give it and shows the reasoning. For the common cases — an EU controller using US processors — the analysis is mechanical. For anything unusual, it tells you what to take to counsel instead of guessing.",
    },
    {
      q: "What if my vendor is not in your dataset?",
      a: "It appears in the register as region unknown, with a prompt to check that vendor's own subprocessor page. It is never silently dropped and never assumed to be domestic — an unknown vendor is a real gap in your register, and hiding it would be the one failure that makes this useless.",
    },
    {
      q: "Does a DPA cover me for international transfers?",
      a: "Not on its own. A DPA governs how a processor handles data; standard contractual clauses or an adequacy decision govern moving it across a border. You often need both, which is why they are reported as separate columns rather than one status.",
    },
    {
      q: "What about sub-subprocessors?",
      a: "Your vendors' own subprocessors are their disclosure obligation to you, and the register includes a prompt to collect them for critical vendors. We do not invent that chain, because a register listing subprocessors we guessed at would be worse than one that admits the boundary.",
    },
    {
      q: "Does DPDP require this?",
      a: "The DPDP Act makes you accountable for processors acting on your behalf and requires reasonable security safeguards throughout the chain. A register is how you demonstrate you know who they are. It is also, in practice, what Indian enterprise buyers ask for.",
    },
  ],

  inputs: [
    {
      name: "vendors",
      label: "Vendor list",
      type: "textarea",
      rows: 12,
      required: true,
      placeholder: "Name,Purpose,Data shared\nAWS,Hosting,All customer data\nSlack,Internal comms,Support conversations",
      help: "CSV with name, purpose and data shared. One vendor per line.",
    },
    {
      name: "dataOrigin",
      label: "Where your data originates",
      type: "select",
      required: true,
      options: ["India", "EU / EEA", "United Kingdom", "United States", "India + EU"],
      help: "Decides which transfer rules apply.",
    },
    {
      name: "regime",
      label: "Regime you are subject to",
      type: "select",
      required: true,
      options: ["India DPDP", "GDPR", "Both", "Not sure"],
    },
    {
      name: "controller",
      label: "Your legal entity name",
      type: "text",
      required: true,
      placeholder: "Northwind Technologies Pvt Ltd",
      help: "Appears on the register and the subprocessor page.",
    },
  ],

  sample: {
    controller: "Northwind Technologies Pvt Ltd",
    dataOrigin: "India + EU",
    regime: "Both",
    vendors: `Name,Purpose,Data shared
AWS,Application hosting and database,All customer data including names emails and uploaded documents
Google Cloud,Document processing pipeline,Uploaded shipment documents
Stripe,Payment processing,Name email and card last four
Razorpay,Payment processing for India,Name email phone and UPI reference
Slack,Internal team communication,Support conversation excerpts
Notion,Internal documentation,Customer names in account notes
HubSpot,CRM and marketing,Name work email company and activity history
Intercom,Customer support chat,Name email and full conversation history
Mixpanel,Product analytics,Pseudonymised user id and event data
Sentry,Error monitoring,Stack traces occasionally containing user ids
Resend,Transactional email,Name and email address
Zoom,Customer calls,Name email and recorded calls
Deel,Contractor payroll,Contractor name address and bank details
Vanta,Compliance monitoring,Employee names and system metadata
Acme Internal Tool,Custom reporting,Aggregated usage data`,
  },

  mcpTool: {
    name: "vendortrace_build_register",
    description:
      "Turn a vendor list into a GDPR Article 30 and India DPDP subprocessor register. Takes vendors with purpose and data shared, the origin of the data, and the applicable regime. Returns each vendor's hosting jurisdiction, whether the transfer crosses a border, the transfer mechanism required such as standard contractual clauses or an adequacy decision, whether a data processing agreement is needed and whether the vendor offers one, a gap list of missing DPAs and unknown vendors, and a publishable subprocessor page.",
  },
};
