import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "nutrilabel",
  name: "NutriLabel",
  tagline: "Read a food label and know what it actually means",
  oneLiner:
    "Paste the nutrition facts from any packaged food and get a traffic-light breakdown per nutrient, WHO limit flags, per-100g comparisons, serving size honesty check, and an overall label rating.",
  category: "Health & nutrition",
  audience: "Health-conscious Indian consumers, dietitians, fitness coaches, parents reading labels for their kids",
  accent: "#065f46",
  accentSoft: "#ecfdf5",

  metrics: [
    { value: "10", label: "Nutrients scored against ICMR/FSSAI daily values" },
    { value: "3", label: "WHO limits checked (sugar, sodium, trans fat)" },
    { value: "100g", label: "Normalised for fair cross-product comparison" },
  ],

  problem: [
    {
      title: "Per-serving numbers hide the truth",
      body:
        "A pack of chips claims 130 calories per serving, but the serving is 28g and the pack is 150g. Everyone eats the whole pack. The label is technically correct and practically deceptive.",
    },
    {
      title: "Front-of-pack claims contradict back-of-pack facts",
      body:
        "A cereal says 'high protein' on the front but delivers 4g per serving against 25g sugar. The health halo works because nobody flips the packet and does the maths.",
    },
    {
      title: "Nobody knows what the daily value percentages actually mean",
      body:
        "FSSAI bases %DV on a 2000 kcal diet with Indian RDA values. The numbers mean nothing if you do not know the reference, and the reference itself is generous on sugar and sodium.",
    },
  ],

  features: [
    {
      title: "Traffic-light per nutrient",
      body:
        "Red, amber, or green for every nutrient based on per-100g thresholds from FSA/FSSAI guidelines. One glance tells you what matters.",
    },
    {
      title: "WHO limit flags",
      body:
        "Sugar flagged if above 10% of energy, sodium if above 2000mg/day equivalent, trans fat if above 1% of energy. These are the limits that matter for chronic disease.",
    },
    {
      title: "Per-100g normalisation",
      body:
        "Serving sizes make comparison impossible. Per-100g numbers let you compare a biscuit to a biscuit regardless of how small the manufacturer decided a serving is.",
    },
    {
      title: "Serving size honesty check",
      body:
        "Flags when a single-consumption pack claims multiple servings, or when the serving is unrealistically small for the product category.",
    },
    {
      title: "Label rating: honest, misleading, or deceptive",
      body:
        "Combines front-of-pack claims against actual nutrient density to rate whether the label helps or hinders an informed choice.",
    },
    {
      title: "ICMR/FSSAI daily value scoring",
      body:
        "Each nutrient scored against Indian RDA values so you know what percentage of your daily budget this product actually consumes.",
    },
  ],

  how: [
    "Copy the nutrition facts panel from any packaged food. Include serving size, calories, and all listed nutrients.",
    "NutriLabel normalises to per-100g, scores against daily values, checks WHO limits, and rates the label honesty.",
    "Read the traffic-light summary to make a decision in seconds, or dive into the detailed breakdown.",
  ],

  integrations: ["FlowForge", "Google Sheets", "Zapier / n8n"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "For checking labels while you shop.",
      features: ["Unlimited manual scans", "Traffic-light breakdown", "WHO limit flags", "Per-100g comparison"],
      cta: "Scan a label",
      monthlyRuns: 50,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Pro",
      price: "$19",
      period: "/mo",
      blurb: "For dietitians and fitness coaches managing client nutrition.",
      features: [
        "REST API + MCP server access",
        "Bulk label scanning",
        "Client report exports",
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
      blurb: "For food companies auditing their own product lines.",
      features: [
        "Volume pricing",
        "Self-hosted Docker image",
        "Custom threshold configuration",
        "SSO and audit log",
        "Dedicated support",
      ],
      cta: "Talk to us",
      monthlyRuns: Number.POSITIVE_INFINITY,
      apiAccess: true,
      rateLimitPerMin: 600,
    },
  ],

  faq: [
    {
      q: "Which daily values does it use?",
      a: "ICMR 2020 RDA values as adopted by FSSAI for labelling: 2000 kcal energy, 67g total fat, 22g saturated fat, 300g carbohydrate, 50g protein, 2000mg sodium, 25g fibre, 50g added sugar.",
    },
    {
      q: "Why per-100g instead of per-serving?",
      a: "Serving sizes are set by manufacturers and vary wildly. Per-100g is the only way to compare two products fairly. The UK, Australia, and the EU mandate it for this reason.",
    },
    {
      q: "What makes a label 'deceptive' vs 'misleading'?",
      a: "Misleading means the serving size is unrealistically small or front-of-pack emphasis does not match reality. Deceptive means both are true simultaneously, or trans fat is declared as 0 but the ingredients list partially hydrogenated oil.",
    },
    {
      q: "Does it handle Indian nutrition labels specifically?",
      a: "Yes. FSSAI mandates energy, protein, carbohydrate, total sugar, added sugar, total fat, saturated fat, trans fat, cholesterol, sodium and fibre. The tool recognises all FSSAI-format labels and scores against Indian RDA values.",
    },
    {
      q: "Can I scan a photo of the label?",
      a: "This version takes text. Use your phone camera's text recognition to copy the nutrition facts, then paste. Paid plans include an image endpoint.",
    },
  ],

  inputs: [
    {
      name: "servingSize",
      label: "Serving size (g)",
      type: "text",
      required: true,
      placeholder: "30",
      help: "The serving size in grams as stated on the pack.",
    },
    {
      name: "packSize",
      label: "Pack size (g)",
      type: "text",
      required: false,
      placeholder: "150",
      help: "Total pack weight in grams. Used to detect misleading serving claims.",
    },
    {
      name: "calories",
      label: "Calories per serving (kcal)",
      type: "text",
      required: true,
      placeholder: "150",
      help: "Energy in kcal per serving.",
    },
    {
      name: "protein",
      label: "Protein (g)",
      type: "text",
      required: true,
      placeholder: "3",
      help: "Protein in grams per serving.",
    },
    {
      name: "totalFat",
      label: "Total fat (g)",
      type: "text",
      required: true,
      placeholder: "8",
      help: "Total fat in grams per serving.",
    },
    {
      name: "saturatedFat",
      label: "Saturated fat (g)",
      type: "text",
      required: true,
      placeholder: "3.5",
      help: "Saturated fat in grams per serving.",
    },
    {
      name: "transFat",
      label: "Trans fat (g)",
      type: "text",
      required: true,
      placeholder: "0",
      help: "Trans fat in grams per serving.",
    },
    {
      name: "carbs",
      label: "Carbohydrates (g)",
      type: "text",
      required: true,
      placeholder: "18",
      help: "Total carbohydrates in grams per serving.",
    },
    {
      name: "sugar",
      label: "Sugar (g)",
      type: "text",
      required: true,
      placeholder: "12",
      help: "Total sugar in grams per serving.",
    },
    {
      name: "fibre",
      label: "Fibre (g)",
      type: "text",
      required: false,
      placeholder: "1",
      help: "Dietary fibre in grams per serving.",
    },
    {
      name: "sodium",
      label: "Sodium (mg)",
      type: "text",
      required: true,
      placeholder: "280",
      help: "Sodium in milligrams per serving.",
    },
    {
      name: "frontClaim",
      label: "Front-of-pack claim (if any)",
      type: "text",
      required: false,
      placeholder: "High protein, low fat, sugar free...",
      help: "Any health or nutrition claim on the front of the pack.",
    },
  ],

  sample: {
    servingSize: "30",
    packSize: "150",
    calories: "155",
    protein: "2.5",
    totalFat: "8",
    saturatedFat: "3.5",
    transFat: "0.2",
    carbs: "18",
    sugar: "12",
    fibre: "0.8",
    sodium: "280",
    frontClaim: "High in protein",
  },

  mcpTool: {
    name: "nutrilabel_analyze_label",
    description:
      "Analyze a food nutrition label against ICMR/FSSAI daily values and WHO limits. Returns traffic-light ratings per nutrient, per-100g normalised values, serving size honesty assessment, and an overall label rating.",
  },
};
