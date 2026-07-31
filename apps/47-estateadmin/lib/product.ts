import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "estateadmin",
  name: "EstateAdmin",
  tagline: "What has to happen after someone dies, in what order",
  oneLiner:
    "Enter state, religion, asset types, will status, and heir details to get a chronological checklist of legal, financial, and administrative steps required after a death in India with timelines and documents needed.",
  category: "Legal tools",
  audience: "Families dealing with bereavement, estate planners, advocates, CA firms, NRIs managing Indian estates",
  accent: "#450a0a",
  accentSoft: "#fef2f2",

  metrics: [
    { value: "4", label: "Succession laws covered" },
    { value: "50+", label: "Action items generated" },
    { value: "3", label: "Priority phases" },
  ],

  problem: [
    {
      title: "Nobody knows what to do after a death, and nobody wants to ask",
      body:
        "Within 48 hours you need a death certificate. Within 30 days you should inform banks. Succession certificate takes 6-12 months in court. Missing any step creates compounding problems: frozen accounts, property stuck in mutation limbo, insurance claims time-barring.",
    },
    {
      title: "Different religions have different succession laws",
      body:
        "Hindu Succession Act 1956 (with 2005 amendment for daughters), Muslim Personal Law (Sharia), Indian Succession Act 1925 (Christians and Parsis). Who inherits, what share, and what process differs completely by religion.",
    },
    {
      title: "NRI heirs face additional complexity that nobody warns them about",
      body:
        "Power of Attorney requirements, FEMA regulations for property transfer, tax residency complications, and the need for apostilled documents. An NRI heir often discovers these requirements after flying back and forth multiple times.",
    },
  ],

  features: [
    {
      title: "Chronological checklist by priority",
      body:
        "Immediate (0-7 days), short-term (7-30 days), medium-term (1-6 months), and long-term (6-18 months) tasks. Each with timeline, documents needed, and where to go.",
    },
    {
      title: "Religion-specific succession law",
      body:
        "Applies Hindu Succession Act 1956, Muslim Personal Law, Indian Succession Act 1925, or Parsi Succession provisions as applicable. Shows inheritance shares and legal process differences.",
    },
    {
      title: "Asset-specific procedures",
      body:
        "Different procedures for property (mutation), bank accounts (nominee vs succession certificate), shares (transmission), insurance (claim process), PF/pension (nomination forms). Each asset type has its own checklist.",
    },
    {
      title: "NRI complications flagged",
      body:
        "Power of Attorney requirements, FEMA compliance for property transfer, NRO/NRE account conversion rules, and tax implications flagged separately for NRI heirs.",
    },
    {
      title: "Document requirements listed per step",
      body:
        "Every task lists exactly which documents you need: death certificate copies (get 10), will (if any), succession certificate, legal heir certificate, Aadhaar, PAN, and step-specific forms.",
    },
    {
      title: "Will vs intestate process",
      body:
        "If there is a registered will, process is probate. Without a will, it is succession certificate (Hindu/Muslim) or letter of administration (Christian/Parsi). Shows which path applies and timelines.",
    },
  ],

  how: [
    "Enter state, religion of deceased, types of assets, whether there is a will, number of legal heirs, and whether any heir is NRI.",
    "EstateAdmin generates a complete chronological checklist with documents, timelines, and religion-specific legal procedures.",
    "Get phase-by-phase action items, applicable succession law, and NRI-specific complications if relevant.",
  ],

  integrations: ["FlowForge", "Print/PDF", "Law firms"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "For families navigating estate administration.",
      features: ["Full chronological checklist", "Religion-specific law", "Asset procedures", "Document lists", "NRI flags"],
      cta: "Get checklist",
      monthlyRuns: 50,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Pro",
      price: "$9",
      period: "/mo",
      blurb: "For advocates and CA firms handling estates.",
      features: [
        "REST API + MCP server access",
        "Multi-estate tracking",
        "Client portal",
        "Timeline management",
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
      blurb: "For banks and insurance companies guiding customers.",
      features: [
        "Volume pricing",
        "Self-hosted Docker image",
        "Customer journey integration",
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
      q: "Is this legal advice?",
      a: "No. This generates an informational checklist of common steps required after a death in India. Every estate has unique circumstances. Consult an advocate for specific legal questions, especially for contested estates or complex property situations.",
    },
    {
      q: "How long does succession certificate take?",
      a: "Typically 6-12 months from District Court. Process: file petition, court issues notice in newspaper, 45-day waiting period for objections, hearing, and grant. If no objections, faster. If contested, much longer. Some states allow online application now.",
    },
    {
      q: "Do all bank accounts need succession certificate?",
      a: "No. If there is a valid nomination, the bank can release funds to the nominee (up to Rs 5 lakh without any documentation at most banks, higher with indemnity bond). Joint accounts with 'Either or Survivor' mode pass automatically. Only accounts without nomination need succession certificate.",
    },
    {
      q: "What if the deceased had no will?",
      a: "Intestate succession applies. For Hindus: Hindu Succession Act 1956 divides among Class I heirs (spouse, children, mother). For Muslims: Sharia law determines fixed shares. For Christians/Parsis: Indian Succession Act 1925 applies. Legal heir certificate from tehsil or succession certificate from court needed.",
    },
    {
      q: "What are the NRI complications?",
      a: "NRI heirs need: registered Power of Attorney (executed at Indian consulate or apostilled), PAN card, NRO account for receiving sale proceeds, FEMA compliance for repatriation (up to USD 1M per year), and capital gains tax implications on property sale. Cannot hold agricultural land.",
    },
  ],

  inputs: [
    {
      name: "state",
      label: "State where deceased resided",
      type: "select",
      required: true,
      options: ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Uttar Pradesh", "West Bengal", "Gujarat", "Rajasthan", "Telangana", "Kerala", "Other"],
      help: "Determines court jurisdiction, mutation process, and state-specific rules.",
    },
    {
      name: "religion",
      label: "Religion (determines succession law)",
      type: "select",
      required: true,
      options: ["Hindu", "Muslim", "Christian", "Parsi"],
      help: "Hindu Succession Act 1956, Muslim Personal Law, or Indian Succession Act 1925 applies based on religion.",
    },
    {
      name: "assets",
      label: "Asset types (comma-separated)",
      type: "text",
      required: true,
      placeholder: "property, bank accounts, insurance, shares, PF/pension",
      help: "Types of assets: property, bank accounts, FDs, insurance, shares/mutual funds, PF, pension, gold, vehicle.",
    },
    {
      name: "hasWill",
      label: "Is there a will?",
      type: "select",
      required: true,
      options: ["Yes, registered will", "Yes, unregistered will", "No will (intestate)"],
      help: "Registered will goes through probate. Unregistered will is valid but harder to enforce. No will means intestate succession.",
    },
    {
      name: "numHeirs",
      label: "Number of legal heirs",
      type: "text",
      required: true,
      placeholder: "4",
      help: "Class I heirs (Hindu): spouse, sons, daughters, mother. Include all.",
    },
    {
      name: "hasNriHeir",
      label: "Any NRI heir?",
      type: "select",
      required: true,
      options: ["No", "Yes"],
      help: "NRI heirs face FEMA regulations, POA requirements, and tax complications.",
    },
  ],

  sample: {
    state: "Maharashtra",
    religion: "Hindu",
    assets: "property, bank accounts, insurance, shares, PF/pension",
    hasWill: "No will (intestate)",
    numHeirs: "4",
    hasNriHeir: "Yes",
  },

  mcpTool: {
    name: "estate_administration_checklist",
    description:
      "Generate a chronological checklist of legal, financial, and administrative steps required after a death in India. Covers succession law by religion (Hindu/Muslim/Christian/Parsi), asset-specific procedures, document requirements, NRI complications, and court timelines.",
  },
};
