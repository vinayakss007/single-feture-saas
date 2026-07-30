import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "policypack",
  name: "PolicyPack",
  tagline: "The SOC 2 policy set an auditor expects, from ten answers",
  oneLiner:
    "Answer ten questions about your company and get the full policy set an auditor asks for, each mapped to SOC 2 Trust Services Criteria and ISO 27001 controls, plus an honest list of the evidence you still have to collect.",
  category: "Security compliance",
  audience: "Startups facing their first security review, CTOs, and whoever got handed the questionnaire",
  accent: "#1e40af",
  accentSoft: "#eff6ff",

  metrics: [
    { value: "12", label: "Policies auditors actually ask for" },
    { value: "TSC + A.5–A.8", label: "Mapped to both frameworks" },
    { value: "10 min", label: "Instead of a ₹4 lakh readiness project" },
  ],

  problem: [
    {
      title: "A deal is blocked on a security questionnaire",
      body:
        "An enterprise buyer wants your access control policy, your incident response plan and your vendor management process. You have none of them written down, the deal is at legal, and the answer is due this week.",
    },
    {
      title: "The compliance platforms are annual contracts",
      body:
        "Vanta and Drata are the right answer eventually — continuous monitoring genuinely matters. But they are priced and scoped for a company already committed to an audit, not one that needs twelve documents by Friday.",
    },
    {
      title: "Templates from the internet describe someone else's company",
      body:
        "A downloaded policy that says you have a dedicated security team, a SIEM and quarterly penetration tests is worse than nothing. An auditor reads it, asks for the evidence, and now you have a documented control failure.",
    },
  ],

  features: [
    {
      title: "Policies that describe your actual company",
      body:
        "Composed from your answers — headcount, cloud provider, data types, region. A five-person team on AWS gets a policy set a five-person team on AWS can actually satisfy.",
    },
    {
      title: "Mapped to TSC and ISO 27001 together",
      body:
        "Every policy carries the SOC 2 Trust Services Criteria it addresses and the ISO 27001:2022 Annex A controls, so one document set answers both frameworks and both questionnaires.",
    },
    {
      title: "The gap list, stated plainly",
      body:
        "What you must actually do, not just write down — MFA everywhere, offboarding checklists, log retention, a real backup restore test. Ranked by what an auditor checks first.",
    },
    {
      title: "One complete policy, written out",
      body:
        "The access control policy in full, so you can see the standard the whole set is written to before you commit to anything.",
    },
    {
      title: "Deterministic, so diffs are meaningful",
      body:
        "Same answers, same documents, byte for byte. When you regenerate next year, the diff is your actual changes — not a model rewording paragraphs you never touched.",
    },
    {
      title: "Honest about what documents cannot do",
      body:
        "A SOC 2 Type II is an opinion on whether controls operated over a window you cannot backdate. This tells you when to start that clock instead of implying paperwork is the finish line.",
    },
  ],

  how: [
    "Answer ten questions: size, cloud, data, region, framework, and what you already have in place.",
    "Get the policy set with its TSC and ISO mapping, and the access control policy written out in full.",
    "Work the gap list. That is the part that takes real time, and it is the part auditors test.",
    "Start your observation window. Regenerate whenever the company materially changes.",
  ],

  integrations: [
    "Markdown for Notion, Confluence, GitBook or a docs repo",
    "JSON control mapping for a GRC tool or a trust centre page",
    "REST API to regenerate on every material change",
    "MCP server so an agent can answer questionnaire items from the mapping",
    "Self-hosted Docker — company details never leave your network",
  ],

  pricing: [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      blurb: "For the questionnaire that is blocking a deal today.",
      features: [
        "25 policy packs a month",
        "All 12 policies with TSC and ISO mapping",
        "Full gap list",
        "Markdown and JSON export",
      ],
      cta: "Generate a pack",
      monthlyRuns: 25,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Readiness",
      price: "₹2,499",
      period: "/month",
      blurb: "For a company walking into a real audit.",
      features: [
        "5,000 policy packs a month",
        "REST API and MCP server access",
        "Regenerate on every material change",
        "Custom control additions",
        "Email support",
      ],
      cta: "Start on Readiness",
      highlight: true,
      monthlyRuns: 5_000,
      apiAccess: true,
      rateLimitPerMin: 120,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      blurb: "For consultants running readiness for many clients.",
      features: [
        "Unlimited packs",
        "Self-hosted Docker image",
        "White-labelled client output",
        "Custom frameworks — HIPAA, DPDP, NIS2",
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
      q: "Will these policies pass an audit?",
      a: "Policies are never what passes an audit. An auditor reads the policy, then asks for evidence that it operated — screenshots, logs, tickets, a restore test. This produces documents written to the standard an auditor expects and tells you exactly which evidence each one will be tested against. The gap list is the honest part, and it is the part that takes months.",
    },
    {
      q: "How is this different from Vanta or Drata?",
      a: "They do continuous monitoring: connect your cloud and identity provider, and they collect evidence automatically. That is genuinely valuable and this does not replace it. This is the step before — the written policy set and a clear-eyed gap list — for a company that needs both this week and is not ready for an annual platform contract.",
    },
    {
      q: "Do I need SOC 2 or ISO 27001?",
      a: "SOC 2 if your buyers are mostly American, ISO 27001 if they are European or Asian, both if you sell to enterprises in several regions. The controls overlap heavily, which is why the output maps to both from one set of answers — the framework question is mostly about which report you order, not which policies you write.",
    },
    {
      q: "Why can I not just backdate the observation window?",
      a: "Because a Type II is an auditor's opinion that your controls operated effectively over a period they observed, usually three to twelve months. That period cannot be created retroactively — only started. It is the single most common surprise in a first audit, so the output says when to start the clock.",
    },
    {
      q: "Is my company information stored?",
      a: "No. Generation is stateless: your answers are processed in memory and never written to disk or a database. We meter run counts for billing, nothing else. On Enterprise you run the Docker image inside your own network.",
    },
    {
      q: "What if we are a two-person company?",
      a: "Then you get a policy set for a two-person company. Separation of duties, for example, is a control a two-person team genuinely cannot fully satisfy, so it is flagged as a documented compensating-control decision rather than asserted as met. Claiming otherwise is exactly the trap downloaded templates set.",
    },
  ],

  inputs: [
    { name: "company", label: "Company legal name", type: "text", required: true, placeholder: "Northwind Technologies Pvt Ltd" },
    {
      name: "headcount",
      label: "Headcount",
      type: "select",
      required: true,
      options: ["1–5", "6–20", "21–100", "101–500", "500+"],
      help: "Small teams cannot satisfy every control. The output says so rather than pretending.",
    },
    {
      name: "cloud",
      label: "Primary cloud",
      type: "select",
      required: true,
      options: ["AWS", "Google Cloud", "Microsoft Azure", "Multiple clouds", "Own data centre", "Fully serverless (Vercel, Cloudflare)"],
    },
    {
      name: "dataTypes",
      label: "Data you hold",
      type: "textarea",
      rows: 3,
      required: true,
      placeholder: "Customer names and emails, payment card last 4 via Stripe, uploaded documents, support conversations",
      help: "Be specific. Health, payment and children's data each pull in extra obligations.",
    },
    {
      name: "region",
      label: "Where your customers are",
      type: "select",
      required: true,
      options: ["India only", "EU / UK", "United States", "India + EU", "Global"],
    },
    {
      name: "framework",
      label: "Target framework",
      type: "select",
      required: true,
      options: ["SOC 2 Type II", "ISO 27001:2022", "Both"],
    },
    {
      name: "hasMfa",
      label: "Is MFA enforced on every production system?",
      type: "select",
      required: true,
      options: ["Yes, everywhere", "Some systems", "No"],
    },
    {
      name: "hasOnboarding",
      label: "Do you have a written onboarding and offboarding checklist?",
      type: "select",
      required: true,
      options: ["Yes, and it is followed", "It exists but is informal", "No"],
    },
    {
      name: "hasBackups",
      label: "Have you tested restoring from backup in the last year?",
      type: "select",
      required: true,
      options: ["Yes, and documented it", "Backups exist but were never restored", "No backups"],
    },
    {
      name: "hasPentest",
      label: "Penetration test in the last twelve months?",
      type: "select",
      required: true,
      options: ["Yes, by a third party", "Internal testing only", "No"],
    },
  ],

  sample: {
    company: "Northwind Technologies Pvt Ltd",
    headcount: "6–20",
    cloud: "AWS",
    dataTypes:
      "Customer names, work emails and company details. Payment card last four digits via Stripe — we never see full card numbers. Uploaded shipment documents including some containing consignee addresses. Support conversation transcripts.",
    region: "India + EU",
    framework: "Both",
    hasMfa: "Some systems",
    hasOnboarding: "It exists but is informal",
    hasBackups: "Backups exist but were never restored",
    hasPentest: "No",
  },

  mcpTool: {
    name: "policypack_generate_policies",
    description:
      "Generate a SOC 2 and ISO 27001 policy set from a short company profile. Takes headcount, cloud provider, data types, customer region, target framework and what controls are already in place. Returns the twelve policies auditors ask for, each mapped to SOC 2 Trust Services Criteria and ISO 27001:2022 Annex A controls with the evidence it will be tested against, a prioritised gap list of what must actually be implemented rather than merely documented, controls a company of that size cannot fully satisfy, and one complete policy written out in full.",
  },
};
