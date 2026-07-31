import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "legalnotice",
  name: "LegalNotice",
  tagline: "The legal notice that gets a reply, not a dustbin",
  oneLiner:
    "Enter dispute type, sender/recipient details, facts and relief sought to generate a properly structured legal notice under Indian law with correct sections cited and consequences stated.",
  category: "Legal tools",
  audience: "Individuals, advocates, small businesses, HR teams, landlords, tenants, consumers",
  accent: "#831843",
  accentSoft: "#f5f3ff",

  metrics: [
    { value: "8", label: "Dispute types covered" },
    { value: "15+", label: "Statutes referenced" },
    { value: "90%", label: "Response rate with proper notice" },
  ],

  problem: [
    {
      title: "Most legal notices land in the dustbin because they read like angry letters",
      body:
        "Without the right legal sections cited, proper format, and clear consequences, the recipient has no reason to respond. A notice under Section 138 NI Act triggers criminal liability; a vague demand letter does not.",
    },
    {
      title: "Advocates charge 2000-10000 for what is mostly a template with facts filled in",
      body:
        "The structure of a legal notice is standard: addressing, facts, legal basis, demand, timeline, consequence. What changes per case is which sections apply and what relief is appropriate for the dispute type.",
    },
    {
      title: "Wrong section or wrong timeline invalidates the entire notice",
      body:
        "A cheque bounce notice must be sent within 30 days of return memo. A notice to government under Section 80 CPC requires 2 months before filing. Getting the timeline wrong means starting over.",
    },
  ],

  features: [
    {
      title: "Correct legal sections cited per dispute type",
      body:
        "Section 138 NI Act for cheque bounce, Section 80 CPC for government bodies, Consumer Protection Act 2019 for consumer complaints, Transfer of Property Act for landlord-tenant disputes, and more.",
    },
    {
      title: "Proper notice format with addressing and dispatch",
      body:
        "Registered post AD (acknowledgement due) addressing, 'without prejudice' marking where appropriate, and structured paragraphs that courts recognise as valid legal notice format.",
    },
    {
      title: "Timeline enforcement per dispute type",
      body:
        "15 days for cheque bounce (mandatory), 30 days for general civil, 60 days for government (Section 80 CPC). The notice states the correct deadline and flags if you are running out of time.",
    },
    {
      title: "Consequences stated in legally meaningful language",
      body:
        "Not vague threats but specific next steps: filing under Section 138 NI Act (criminal), filing consumer complaint (NCDRC/State/District), civil suit for damages, specific performance, injunction.",
    },
    {
      title: "Common mistakes flagged",
      body:
        "Identifies errors that invalidate notices: wrong limitation period, missing mandatory pre-suit notice period, threatening criminal proceedings in civil matters, addressing to wrong entity.",
    },
    {
      title: "Dispatch guidance",
      body:
        "Specifies registered post AD to the registered office (companies) or last known address (individuals), with email copy where permissible, and record-keeping requirements.",
    },
  ],

  how: [
    "Select dispute type, enter sender and recipient details, describe the facts briefly and state what relief you want.",
    "LegalNotice generates a properly structured notice with correct sections, timeline, and consequences for your dispute type.",
    "Get the notice text ready to print and send via registered post AD, with dispatch instructions and common mistakes to avoid.",
  ],

  integrations: ["FlowForge", "Print/PDF", "Advocate offices"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "For individuals sending their first notice.",
      features: ["Full notice generation", "Correct sections cited", "Timeline guidance", "Dispatch instructions", "Mistake flagging"],
      cta: "Generate notice",
      monthlyRuns: 50,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Pro",
      price: "$9",
      period: "/mo",
      blurb: "For advocates and businesses sending multiple notices.",
      features: [
        "REST API + MCP server access",
        "Batch notice generation",
        "Custom templates",
        "Tracking and follow-up reminders",
        "Priority support",
      ],
      cta: "Start 14-day trial",
      highlight: true,
      monthlyRuns: 5_000,
      apiAccess: true,
      rateLimitPerMin: 120,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "/mo",
      blurb: "For law firms and corporate legal departments.",
      features: [
        "Volume pricing",
        "Self-hosted Docker image",
        "Multi-jurisdiction support",
        "SSO and audit log",
        "White-label embedding",
      ],
      cta: "Talk to us",
      monthlyRuns: Number.POSITIVE_INFINITY,
      apiAccess: true,
      rateLimitPerMin: 600,
    },
  ],

  faq: [
    {
      q: "Is this a substitute for legal advice?",
      a: "No. This generates a properly formatted notice with correct sections and timeline. For complex matters (property disputes, criminal defamation), consult an advocate who can assess the merits of your claim before sending.",
    },
    {
      q: "Which sections does it cite for cheque bounce?",
      a: "Section 138 of the Negotiable Instruments Act 1881 (dishonour of cheque), Section 141 (liability of directors for company cheques), and references the mandatory 30-day window from date of return memo for sending notice and 15-day compliance period.",
    },
    {
      q: "Can I send this notice myself or does an advocate need to sign it?",
      a: "Under Indian law, anyone can send a legal notice themselves. However, a notice sent through an advocate carries more weight as it signals serious intent to litigate. The tool generates both formats.",
    },
    {
      q: "What happens if the recipient ignores the notice?",
      a: "The notice creates a legal record that you made a demand and gave reasonable time. For cheque bounce, it is a mandatory prerequisite before filing criminal complaint. For civil matters, courts view it favourably that you attempted resolution before litigation.",
    },
    {
      q: "How should I dispatch the notice?",
      a: "Always via Registered Post with Acknowledgement Due (RPAD) from India Post. Keep the receipt and the AD card when returned. Additionally send a copy via email/courier for immediate attention, but the RPAD is the legally recognised dispatch.",
    },
  ],

  inputs: [
    {
      name: "disputeType",
      label: "Nature of dispute",
      type: "select",
      required: true,
      options: [
        "Cheque bounce",
        "Landlord-tenant",
        "Employment dispute",
        "Property dispute",
        "Consumer complaint",
        "Defamation",
        "Recovery of money",
        "Notice to government (Section 80 CPC)",
      ],
      help: "Determines which legal sections and timeline apply.",
    },
    {
      name: "senderName",
      label: "Sender name",
      type: "text",
      required: true,
      placeholder: "Rajesh Kumar",
      help: "Full legal name of the person/entity sending the notice.",
    },
    {
      name: "senderAddress",
      label: "Sender address",
      type: "text",
      required: true,
      placeholder: "42, MG Road, Bengaluru 560001",
      help: "Complete address for the notice header.",
    },
    {
      name: "recipientName",
      label: "Recipient name",
      type: "text",
      required: true,
      placeholder: "Suresh Enterprises Pvt Ltd",
      help: "Full legal name of person/company the notice is addressed to.",
    },
    {
      name: "recipientAddress",
      label: "Recipient address",
      type: "text",
      required: true,
      placeholder: "15, Industrial Area Phase 2, Gurgaon 122002",
      help: "Registered office or last known address. Notice will be sent here via RPAD.",
    },
    {
      name: "facts",
      label: "Brief facts of the dispute",
      type: "textarea",
      required: true,
      placeholder: "Cheque no. 456789 dated 15-Jan-2024 for Rs 5,00,000 issued by recipient towards payment of goods supplied, returned unpaid with reason 'insufficient funds' on 20-Jan-2024.",
      help: "Key facts in chronological order. Include dates, amounts, cheque numbers, agreement details as applicable.",
      rows: 4,
    },
    {
      name: "reliefSought",
      label: "Relief sought",
      type: "text",
      required: true,
      placeholder: "Payment of Rs 5,00,000 along with interest at 18% per annum",
      help: "What you want the recipient to do: pay money, vacate property, return goods, stop action, etc.",
    },
    {
      name: "deadlineDays",
      label: "Response deadline (days)",
      type: "select",
      required: false,
      options: ["15", "30", "60"],
      help: "15 days is standard for cheque bounce (mandatory). 30 days for general civil. 60 days for government bodies.",
    },
  ],

  sample: {
    disputeType: "Cheque bounce",
    senderName: "Rajesh Kumar",
    senderAddress: "42, MG Road, Bengaluru 560001",
    recipientName: "Suresh Enterprises Pvt Ltd",
    recipientAddress: "15, Industrial Area Phase 2, Gurgaon 122002",
    facts: "Cheque no. 456789 dated 15-Jan-2024 for Rs 5,00,000 drawn on HDFC Bank, issued by recipient towards payment of goods supplied under Invoice INV-2023-089, was presented for encashment on 18-Jan-2024 and returned unpaid with reason 'insufficient funds' on 20-Jan-2024.",
    reliefSought: "Payment of Rs 5,00,000 along with interest at 18% per annum from the date of cheque dishonour",
    deadlineDays: "15",
  },

  mcpTool: {
    name: "legal_notice_generator",
    description:
      "Generate a properly structured legal notice under Indian law with correct sections cited per dispute type (cheque bounce, landlord-tenant, employment, property, consumer, defamation, recovery, government), proper format, timeline, consequences, and dispatch guidance.",
  },
};
