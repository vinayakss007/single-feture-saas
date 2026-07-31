import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "rtidraft",
  name: "RTIDraft",
  tagline: "The RTI application that gets answered, not ignored",
  oneLiner:
    "Enter which authority, what information you want, and your address to generate a properly formatted RTI application under the Right to Information Act 2005 with correct legal citations, fee structure, and appeal process.",
  category: "Legal tools",
  audience: "Indian citizens filing RTI applications, RTI activists, journalists, NGOs, legal aid organizations",
  accent: "#854d0e",
  accentSoft: "#fefce8",

  metrics: [
    { value: "30", label: "Days mandatory response time" },
    { value: "Rs 10", label: "Central govt RTI fee" },
    { value: "3", label: "Common rejection mistakes caught" },
  ],

  problem: [
    {
      title: "Most RTI applications get rejected on technicalities",
      body:
        "Wrong PIO address, asking for opinions instead of information, not specifying the time period, or addressing the wrong department. These procedural errors mean your valid question never gets answered.",
    },
    {
      title: "Fee structure varies by state and nobody knows it",
      body:
        "Central government is Rs 10 by DD/IPO. But Maharashtra is Rs 10, Rajasthan is Rs 10, Karnataka charges Rs 10 but accepts stamps. State PSUs have different rules. Getting the fee wrong means rejection.",
    },
    {
      title: "People do not know their appeal rights",
      body:
        "If you do not get a reply in 30 days, you can file a first appeal. If that fails, go to CIC/SIC. Most citizens do not know this, and authorities count on that ignorance.",
    },
  ],

  features: [
    {
      title: "Properly formatted application",
      body:
        "Generates a ready-to-send RTI application with correct addressing (To the PIO of the relevant authority), your details, the legal citation (Section 6(1) of RTI Act 2005), and proper closing.",
    },
    {
      title: "Authority-specific fee structure",
      body:
        "Correct fee amount and payment mode for central government, state governments, PSUs, and municipalities. Includes DD/IPO payee details.",
    },
    {
      title: "Common mistake warnings",
      body:
        "Flags if you are asking for opinions instead of documents, addressing the wrong level of PIO, or missing the time period specification. These are the top reasons for rejection.",
    },
    {
      title: "Appeal timeline and process",
      body:
        "Includes the 30-day response deadline, first appeal authority and timeline, and second appeal to CIC (central) or SIC (state) with relevant sections.",
    },
    {
      title: "BPL fee waiver guidance",
      body:
        "If the applicant is below poverty line, notes that no fee is required under Section 7(5) and what proof to attach.",
    },
    {
      title: "Multiple question formatting",
      body:
        "Structures your information request as numbered, specific questions that cannot be deflected with vague replies. Each question asks for a document or record, not an opinion.",
    },
  ],

  how: [
    "Select the authority type (central/state/PSU/municipality), specify the department, describe what information you want, and enter your address.",
    "RTIDraft generates a formatted application with correct PIO addressing, legal citations, fee details, and properly structured questions.",
    "Get the complete application ready to print and send, with fee payment instructions and appeal process if the 30-day deadline passes.",
  ],

  integrations: ["FlowForge", "PDF export", "Email draft"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "For citizens exercising their right to information.",
      features: ["Full RTI draft generation", "Fee calculation", "Appeal guidance", "Rejection flag warnings", "Print-ready format"],
      cta: "Draft my RTI",
      monthlyRuns: 50,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Activist",
      price: "$9",
      period: "/mo",
      blurb: "For RTI activists and journalists filing regularly.",
      features: [
        "REST API + MCP server access",
        "Bulk draft generation",
        "Follow-up and appeal drafts",
        "State-specific templates",
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
      blurb: "For NGOs and legal aid organizations.",
      features: [
        "Volume pricing",
        "Self-hosted Docker image",
        "Custom authority database",
        "SSO and audit log",
        "Tracking and follow-up automation",
      ],
      cta: "Talk to us",
      monthlyRuns: Number.POSITIVE_INFINITY,
      apiAccess: true,
      rateLimitPerMin: 600,
    },
  ],

  faq: [
    {
      q: "Is this legally valid?",
      a: "Yes. An RTI application has no prescribed format under the Act. It only needs to be in writing, addressed to the PIO, with the fee paid. This tool generates a properly structured application that satisfies all legal requirements under Section 6(1).",
    },
    {
      q: "Can I file RTI online instead of by post?",
      a: "For central government departments, you can file at rtionline.gov.in. For state governments, availability varies. This tool generates the text for either online submission or postal filing.",
    },
    {
      q: "What if I address it to the wrong PIO?",
      a: "Under Section 6(3), if an RTI is sent to the wrong office, they must transfer it to the correct PIO within 5 days. However, this adds delay and some offices simply reject it. Getting the right PIO upfront saves 30+ days.",
    },
    {
      q: "What happens after 30 days with no reply?",
      a: "Under Section 7(1), the PIO must respond within 30 days (48 hours for life/liberty matters). If they do not, it is a deemed refusal. You can then file a First Appeal under Section 19(1) within 30 days of the deadline expiry.",
    },
    {
      q: "Can I ask for opinions or reasons?",
      a: "No. The RTI Act covers 'information' as defined in Section 2(f): records, documents, memos, emails, opinions held in the form of records, press releases, circulars, contracts, reports, and data in electronic form. You cannot ask WHY a decision was made unless that reasoning exists as a recorded document.",
    },
  ],

  inputs: [
    {
      name: "authorityType",
      label: "Type of authority",
      type: "select",
      required: true,
      options: ["Central Government", "State Government", "PSU", "Municipality/Local Body"],
      help: "Determines the fee structure and PIO addressing format.",
    },
    {
      name: "state",
      label: "State (if state government or local body)",
      type: "select",
      required: false,
      options: [
        "Not applicable (Central)",
        "Andhra Pradesh", "Bihar", "Delhi", "Gujarat", "Haryana",
        "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
        "Punjab", "Rajasthan", "Tamil Nadu", "Telangana",
        "Uttar Pradesh", "West Bengal", "Other",
      ],
      help: "Required for state-level authorities. Fee amounts vary by state.",
    },
    {
      name: "department",
      label: "Department or authority name",
      type: "text",
      required: true,
      placeholder: "Ministry of Railways / BMC Water Department / BSNL",
      help: "The specific department or organization you want information from.",
    },
    {
      name: "information",
      label: "What information do you want?",
      type: "textarea",
      required: true,
      placeholder: "I want copies of all file notings and correspondence regarding the road construction project on MG Road, Pune, sanctioned in financial year 2023-24, including the contractor selection process and payments made.",
      help: "Be specific. Ask for documents, records, copies, data - not opinions or explanations. Mention the time period.",
      rows: 6,
    },
    {
      name: "applicantName",
      label: "Your full name",
      type: "text",
      required: true,
      placeholder: "Priya Sharma",
      help: "As it appears on your ID.",
    },
    {
      name: "applicantAddress",
      label: "Your full address",
      type: "textarea",
      required: true,
      placeholder: "Flat 402, Sunrise Apartments, Sector 15, Gurugram, Haryana - 122001",
      help: "Where the reply should be sent. Include PIN code.",
      rows: 3,
    },
    {
      name: "isBPL",
      label: "Are you below poverty line (BPL)?",
      type: "select",
      required: false,
      options: ["No", "Yes"],
      help: "BPL applicants are exempt from fees under Section 7(5). Attach BPL certificate copy.",
    },
  ],

  sample: {
    authorityType: "Central Government",
    state: "Not applicable (Central)",
    department: "Ministry of Railways, Railway Board",
    information: "I want certified copies of all file notings, correspondence, and minutes of meetings regarding the decision to increase platform ticket prices from Rs 10 to Rs 50 at all stations in the Mumbai suburban railway network, taken during the period January 2023 to December 2023. Also provide copies of any public consultation conducted before this decision and the revenue impact assessment report if one exists.",
    applicantName: "Vikram Mehta",
    applicantAddress: "B-204, Sai Krupa Society, Andheri East, Mumbai, Maharashtra - 400069",
    isBPL: "No",
  },

  mcpTool: {
    name: "rti_draft",
    description:
      "Generate a properly formatted RTI (Right to Information) application under India's RTI Act 2005 with correct PIO addressing, legal citations, fee structure, payment mode, and appeal process guidance. Flags common rejection reasons.",
  },
};
