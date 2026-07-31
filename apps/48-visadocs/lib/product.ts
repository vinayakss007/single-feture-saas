import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "visadocs",
  name: "VisaDocs",
  tagline: "Every document this visa needs, with what is missing",
  oneLiner:
    "Enter passport country, destination, visa type, and documents you already have to get the complete checklist with what is missing, processing times, financial requirements, and photo specifications.",
  category: "Travel tools",
  audience: "Visa applicants, travel agents, immigration consultants, corporate travel managers, students",
  accent: "#422006",
  accentSoft: "#fefce8",

  metrics: [
    { value: "15", label: "Countries covered" },
    { value: "4", label: "Visa types per country" },
    { value: "100%", label: "Document completeness" },
  ],

  problem: [
    {
      title: "Visa applications get rejected for missing one document",
      body:
        "A Schengen visa needs 3 months of bank statements (not 2), a cover letter (not a travel plan), and specific photo dimensions (35x45mm, not passport size). One missing item means rejection and lost visa fee.",
    },
    {
      title: "Every country has different requirements that change frequently",
      body:
        "UK needs TB test for Indians. US needs DS-160 and specific interview prep. Canada needs biometrics at a VAC. Australia is entirely online. Schengen needs insurance covering EUR 30,000. Nobody tracks all this.",
    },
    {
      title: "Financial proof requirements are specific and unintuitive",
      body:
        "Schengen wants bank statements showing a steady balance, not a recent bulk deposit. UK student visa needs 28 consecutive days above the threshold. Canada PR needs settlement funds shown for specific periods. Getting this wrong is the #1 rejection reason.",
    },
  ],

  features: [
    {
      title: "Complete document checklist per country and visa type",
      body:
        "Every required and recommended document for the specific visa category. Not a generic list but the exact requirements for Indian passport holders applying for that visa type.",
    },
    {
      title: "Have/missing/needs-update status",
      body:
        "Mark what you already have. Tool flags what is missing and what needs updating (e.g., passport expiring within 6 months, bank statements not recent enough).",
    },
    {
      title: "Financial proof requirements specified",
      body:
        "Exact bank balance needed, for how many days, what format (statement not passbook), what counts (FD yes, stocks maybe, property no). Country-specific financial thresholds.",
    },
    {
      title: "Processing time and appointment timeline",
      body:
        "How far in advance to book the appointment, processing time from submission, peak season delays, and the maximum advance you can apply.",
    },
    {
      title: "Photo specifications per country",
      body:
        "Dimensions, background color, glasses rules, and other specifics that differ by country. US: 51x51mm. Schengen: 35x45mm. UK: 35x45mm with specific expression rules.",
    },
  ],

  how: [
    "Select passport country, destination, visa type, and check off documents you already have.",
    "VisaDocs shows the complete requirements, flags what is missing, and warns about validity issues.",
    "Get a prioritised action list with timeline, financial requirements, and appointment booking guidance.",
  ],

  integrations: ["FlowForge", "Print/PDF", "Travel agencies"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "For anyone applying for a visa.",
      features: ["Full document checklist", "Missing document flags", "Financial requirements", "Processing times", "Photo specs"],
      cta: "Check my documents",
      monthlyRuns: 50,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Pro",
      price: "$9",
      period: "/mo",
      blurb: "For travel agents and consultants.",
      features: [
        "REST API + MCP server access",
        "Multi-applicant tracking",
        "Client checklists",
        "Custom country additions",
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
      blurb: "For corporate travel and edtech platforms.",
      features: [
        "Volume pricing",
        "Self-hosted Docker image",
        "Custom country database",
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
      q: "How current are the requirements?",
      a: "The database reflects standard requirements as published by embassies and VFS/iVisa centers. Visa rules can change without notice. Always verify the specific embassy website before your appointment. This tool ensures you do not miss any standard document.",
    },
    {
      q: "Does it cover dependent/family applications?",
      a: "The checklist covers individual applicants. For dependent applications, the same base documents apply plus: relationship proof (marriage certificate, birth certificate), sponsor's invitation letter, and sponsor's financial documents. Run separately for each applicant.",
    },
    {
      q: "What counts as financial proof?",
      a: "Generally: bank statements (not passbook) for last 3-6 months showing consistent balance. Fixed deposits count. Salary slips support the bank statement. Property documents and mutual funds are supplementary but not primary proof. Each country has specific requirements listed in the output.",
    },
    {
      q: "What is the passport validity rule?",
      a: "Most countries require 6 months validity beyond your planned return date. Some (like Schengen) need 3 months beyond exit. The tool checks this based on your passport expiry and flags if renewal is needed before applying.",
    },
    {
      q: "Should I apply through VFS or directly at embassy?",
      a: "Most countries now use VFS Global or similar outsourced centers for document collection and biometrics. You submit at VFS, they forward to the embassy. Direct embassy appointments are only for specific visa types (US interview, some work permits). The tool indicates where to submit.",
    },
  ],

  inputs: [
    {
      name: "passportCountry",
      label: "Passport country",
      type: "select",
      required: true,
      options: ["India", "Other"],
      help: "Currently optimized for Indian passport holders.",
    },
    {
      name: "destination",
      label: "Destination country",
      type: "select",
      required: true,
      options: ["USA", "UK", "Canada", "Australia", "Schengen (Germany/France/Italy)", "UAE", "Singapore", "Japan", "South Korea", "Thailand", "Malaysia", "New Zealand", "Ireland"],
      help: "Select destination. Schengen covers all EU Schengen zone countries.",
    },
    {
      name: "visaType",
      label: "Visa type",
      type: "select",
      required: true,
      options: ["Tourist", "Business", "Student", "Work"],
      help: "Each type has significantly different document requirements and processing.",
    },
    {
      name: "documentsHave",
      label: "Documents you already have (comma-separated)",
      type: "textarea",
      required: false,
      placeholder: "passport, photos, bank statements, flight booking, hotel booking",
      help: "List what you have. Tool will mark these as complete and highlight what is missing.",
      rows: 3,
    },
  ],

  sample: {
    passportCountry: "India",
    destination: "Schengen (Germany/France/Italy)",
    visaType: "Tourist",
    documentsHave: "passport, photos, bank statements, flight booking",
  },

  mcpTool: {
    name: "visa_document_checker",
    description:
      "Generate complete visa document checklist for Indian passport holders by destination country and visa type. Shows required documents, marks what is missing, specifies financial proof requirements, processing times, photo specs, and appointment timelines.",
  },
};
