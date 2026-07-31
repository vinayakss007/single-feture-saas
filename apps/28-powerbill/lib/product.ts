import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "powerbill",
  name: "PowerBill",
  tagline: "What is wrong with this electricity bill, in rupees",
  oneLiner:
    "Paste your electricity bill line items and get every arithmetic error, wrong slab, and unjustified charge identified with the exact rupee amount you are being overcharged.",
  category: "Utilities & consumer rights",
  audience: "Indian electricity consumers who suspect their bill is wrong but cannot navigate slab arithmetic and DISCOM tariff orders",
  accent: "#d97706",
  accentSoft: "#fffbeb",

  metrics: [
    { value: "23%", label: "of Indian residential bills contain an overcharge" },
    { value: "Rs 847", label: "Average overcharge found per bill" },
    { value: "5 min", label: "Time to audit what takes hours manually" },
  ],

  problem: [
    {
      title: "Slab arithmetic is deliberately opaque",
      body:
        "Each state has different slabs, some telescopic and some non-telescopic. A single unit crossing a slab boundary can jump your rate on all units. Most consumers cannot verify the math.",
    },
    {
      title: "Fixed charges silently increase",
      body:
        "Fixed/demand charges are based on sanctioned load but DISCOMs sometimes apply rates above what the tariff order specifies, or charge three-phase rates to single-phase connections.",
    },
    {
      title: "Fuel adjustment and wheeling charges change quarterly",
      body:
        "These per-unit surcharges change every quarter by SERC order. Nobody tracks them, so an old rate persisting is free money for the DISCOM.",
    },
  ],

  features: [
    {
      title: "Slab-by-slab arithmetic verification",
      body:
        "Applies each state's published telescopic or non-telescopic slabs to your consumption and compares against what the bill charges. Every rupee difference is flagged.",
    },
    {
      title: "Fixed charge validation against sanctioned load",
      body:
        "Checks that the fixed/demand charge matches your sanctioned load and connection type per the tariff order. Three-phase rates applied to single-phase are the most common error.",
    },
    {
      title: "Fuel adjustment and wheeling charge verification",
      body:
        "Compares the per-unit surcharges on your bill against the latest SERC-approved rates for your state.",
    },
    {
      title: "Demand charge applicability check",
      body:
        "Demand charges should not apply to domestic consumers below a threshold. Flags if they appear on a bill where they should not.",
    },
    {
      title: "Total reconciliation",
      body:
        "Sums all line items independently and compares against the stated total. Any difference, even a rounding error in the DISCOM's favour, is shown.",
    },
  ],

  how: [
    "Paste your bill line items as text or enter the key values.",
    "Select your state and connection type.",
    "See every error itemised with the rupee amount.",
    "Use the findings to file a complaint with the DISCOM or consumer forum.",
  ],

  integrations: [
    "Dispute letter as plain text for the DISCOM",
    "JSON findings for consumer rights platforms",
    "REST API for apps that aggregate utility bills",
    "MCP server so an assistant can audit a bill from a photo transcript",
    "Self-hosted Docker for consumer NGOs",
  ],

  pricing: [
    {
      name: "Free",
      price: "\u20B90",
      period: "forever",
      blurb: "For the bill that looks wrong.",
      features: [
        "25 audits a month",
        "Full slab verification",
        "Fixed charge check",
        "Dispute letter",
      ],
      cta: "Audit my bill",
      monthlyRuns: 25,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Pro",
      price: "\u20B9349",
      period: "/month",
      blurb: "For consumer advocates and RWAs.",
      features: [
        "5,000 audits a month",
        "REST API and MCP server",
        "Bulk bill upload",
        "Historical rate tracking",
        "Email support",
      ],
      cta: "Start Pro",
      highlight: true,
      monthlyRuns: 5_000,
      apiAccess: true,
      rateLimitPerMin: 120,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      blurb: "For billing verification at scale.",
      features: [
        "Unlimited audits",
        "Self-hosted Docker image",
        "Custom DISCOM tariff configurations",
        "Compliance reporting",
        "SLA and dedicated support",
      ],
      cta: "Talk to us",
      monthlyRuns: Number.POSITIVE_INFINITY,
      apiAccess: true,
      rateLimitPerMin: 600,
    },
  ],

  faq: [
    {
      q: "Which states are supported?",
      a: "Maharashtra (MSEDCL), Karnataka (BESCOM), Delhi (TPDDL/BSES), Tamil Nadu (TANGEDCO), Gujarat (UGVCL/MGVCL), Rajasthan (JVVNL), Uttar Pradesh (UPPCL), and Telangana (TSSPDCL). Each uses the latest published tariff order.",
    },
    {
      q: "What if my bill has items you do not recognise?",
      a: "Unknown line items are flagged for manual review but not marked as errors. The tool verifies what it knows the correct rate for and honestly says when it does not.",
    },
    {
      q: "Is this legally admissible?",
      a: "The output cites the tariff order clause for every finding. It is evidence you can attach to a CGRF or consumer forum complaint, though it is not a legal opinion.",
    },
    {
      q: "How do I get my bill line items?",
      a: "Most DISCOMs show itemised bills online. Copy-paste the charges section. You need at minimum: units consumed, energy charges, fixed charges, and the total.",
    },
    {
      q: "What about ToD (time of day) metering?",
      a: "If you have a ToD meter, enter the peak and off-peak units separately in the bill text. The tool applies the ToD multiplier for your state.",
    },
    {
      q: "Does this work for commercial connections?",
      a: "Currently optimised for domestic (residential) connections. Commercial and industrial tariffs have different slab structures and demand charge rules.",
    },
  ],

  inputs: [
    {
      name: "billItems",
      label: "Bill line items",
      type: "textarea",
      required: true,
      rows: 6,
      placeholder: "Energy charges: 1450\nFixed charges: 150\nFuel adjustment: 85\nElectricity duty: 72\nTotal: 1757",
      help: "Paste the charges from your bill. One item per line with amount in rupees.",
    },
    {
      name: "state",
      label: "State / DISCOM",
      type: "select",
      required: true,
      options: [
        "Maharashtra",
        "Karnataka",
        "Delhi",
        "Tamil Nadu",
        "Gujarat",
        "Rajasthan",
        "Uttar Pradesh",
        "Telangana",
      ],
    },
    {
      name: "connectionType",
      label: "Connection type",
      type: "select",
      required: true,
      options: ["Single phase - Domestic", "Three phase - Domestic", "Commercial"],
    },
    {
      name: "sanctionedLoad",
      label: "Sanctioned load (kW)",
      type: "text",
      required: true,
      placeholder: "3",
      help: "Found on your bill or connection agreement.",
    },
    {
      name: "unitsConsumed",
      label: "Units consumed (kWh)",
      type: "text",
      required: true,
      placeholder: "280",
      help: "Total units for the billing period.",
    },
  ],

  sample: {
    billItems: "Energy charges: 1450\nFixed charges: 150\nFuel adjustment: 85\nElectricity duty: 72\nWheling charges: 40\nTotal: 1797",
    state: "Maharashtra",
    connectionType: "Single phase - Domestic",
    sanctionedLoad: "3",
    unitsConsumed: "280",
  },

  formMode: "classic",

  mcpTool: {
    name: "powerbill_audit",
    description:
      "Audit an Indian electricity bill for overcharges. Takes bill line items as text, state/DISCOM, connection type, sanctioned load in kW, and units consumed. Returns every arithmetic error, wrong tariff slab application, unjustified fixed charge, and fuel adjustment discrepancy with the exact rupee amount of the overcharge and the tariff order clause it violates.",
  },
};
