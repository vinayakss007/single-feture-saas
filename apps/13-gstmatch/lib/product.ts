import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "gstmatch",
  name: "GSTMatch",
  tagline: "See the input tax credit you are about to lose, in rupees",
  oneLiner:
    "Paste your GSTR-2B and your purchase register and get a four-way reconciliation with the exact input tax credit at risk, the suppliers responsible, and a follow-up list you can send today.",
  category: "Tax compliance",
  audience: "Indian businesses filing GST, chartered accountants, finance teams",
  accent: "#15803d",
  accentSoft: "#f0fdf4",

  metrics: [
    { value: "2 CSVs", label: "All it needs — no ERP integration" },
    { value: "₹", label: "ITC at risk, as a number not a percentage" },
    { value: "4", label: "Buckets: matched, mismatched, missing either side" },
  ],

  problem: [
    {
      title: "ITC is only claimable if it appears in 2B",
      body:
        "Since the shift to Section 16(2)(aa), credit you cannot find in GSTR-2B is credit you cannot take. An invoice your supplier forgot to upload is money you paid and cannot recover, and you find out at filing.",
    },
    {
      title: "Reconciliation happens in a spreadsheet, monthly, by hand",
      body:
        "VLOOKUP against invoice numbers that one side wrote as INV/2026/0412 and the other as inv-2026-412. The matches that fail silently are the ones that cost you.",
    },
    {
      title: "The tools that solve it want your whole ERP",
      body:
        "Every GST reconciliation product on the market is a mid-market platform with an implementation project attached. If you have two CSVs and a filing deadline on the 20th, none of them help this month.",
    },
  ],

  features: [
    {
      title: "Invoice numbers matched the way humans write them",
      body:
        "Normalises separators, leading zeros, prefixes and case before comparing, so INV/2026/0412 and inv-2026-412 match — which is where hand reconciliation loses most of its time.",
    },
    {
      title: "ITC at risk, in rupees",
      body:
        "Not a match percentage. The actual credit sitting in invoices missing from 2B, and the credit you may have over-claimed, each as a number you can put in an email.",
    },
    {
      title: "Four buckets, no ambiguity",
      body:
        "Matched, matched with a value mismatch, in your register but missing from 2B, and in 2B but missing from your register — each with the rows and the difference.",
    },
    {
      title: "Per-supplier breakdown",
      body:
        "Ranked by credit at risk, so you chase the supplier holding ₹80,000 before the one holding ₹400.",
    },
    {
      title: "GSTIN validated, not just compared",
      body:
        "Check-digit verification on every GSTIN, so a transposed character shows up as an invalid number rather than a phantom mismatch.",
    },
    {
      title: "A follow-up list, ready to send",
      body:
        "Grouped by supplier with invoice numbers, dates and amounts — the email you were going to write by hand.",
    },
  ],

  how: [
    "Export GSTR-2B from the GST portal as CSV, or paste the columns you have.",
    "Paste your purchase register — supplier GSTIN, invoice number, date, taxable value and tax.",
    "Pick a rounding tolerance. ₹1 absorbs paise rounding without hiding real differences.",
    "Read the ITC at risk, work down the per-supplier list, and send the follow-ups.",
  ],

  integrations: [
    "GSTR-2B CSV from the GST portal",
    "Tally, Zoho Books, Marg and Vyapar purchase register exports",
    "REST API for monthly automation",
    "MCP server so an agent can reconcile and draft the follow-ups",
    "Self-hosted Docker, so financial data never leaves your network",
  ],

  pricing: [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      blurb: "For this month's filing.",
      features: [
        "25 reconciliations a month",
        "All four buckets and the full supplier breakdown",
        "GSTIN check-digit validation",
        "Follow-up list and CSV export",
      ],
      cta: "Reconcile a month",
      monthlyRuns: 25,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Practice",
      price: "₹1,499",
      period: "/month",
      blurb: "For a CA or finance team doing this every month.",
      features: [
        "5,000 reconciliations a month",
        "REST API and MCP server access",
        "Multi-GSTIN, multiple entities",
        "Custom column mapping for your ERP export",
        "Email support",
      ],
      cta: "Start on Practice",
      highlight: true,
      monthlyRuns: 5_000,
      apiAccess: true,
      rateLimitPerMin: 120,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      blurb: "For a firm reconciling for many clients.",
      features: [
        "Unlimited reconciliations",
        "Self-hosted Docker image",
        "Bulk client processing",
        "White-labelled client reports",
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
      q: "What columns do the CSVs need?",
      a: "GSTIN, invoice number, invoice date, taxable value and tax amount. Header names are matched loosely, so 'Supplier GSTIN', 'GSTIN of supplier' and 'gstin' all work, and IGST, CGST and SGST columns are summed if they are separate. If a required column is genuinely missing it tells you which one rather than producing a wrong answer.",
    },
    {
      q: "How does the invoice number matching work?",
      a: "It strips separators, case and leading zeros to build a comparison key, so INV/2026/0412 matches inv-2026-412. It never matches on amount alone — that would create false pairs and quietly hide a missing invoice, which is the expensive error here.",
    },
    {
      q: "Is my financial data stored?",
      a: "No. The reconciliation is stateless: your CSVs are processed in memory and are not written to disk or a database. We keep a metered count of runs for billing, nothing more. On Enterprise you can run the Docker image inside your own network so the data never leaves at all.",
    },
    {
      q: "Does it file my return?",
      a: "No, and it will not pretend to. It reconciles and tells you what to fix. Filing goes through the portal or your existing software — this is the step before that, which is where the money actually leaks.",
    },
    {
      q: "What tolerance should I use?",
      a: "₹1 for most books. It absorbs the paise rounding that differs between your ERP and the portal without hiding a genuine difference. Set it to ₹0 if you want to see every last rounding difference.",
    },
    {
      q: "Can it handle a whole quarter?",
      a: "Yes. Paste multiple months into both sides and it reconciles them together. The period column is preserved in the output so you can see which month a discrepancy came from.",
    },
  ],

  inputs: [
    {
      name: "gstr2b",
      label: "GSTR-2B (from the portal)",
      type: "textarea",
      rows: 10,
      required: true,
      placeholder: "GSTIN,Invoice No,Invoice Date,Taxable Value,IGST,CGST,SGST\n27AAPFU0939F1ZV,INV/2026/0412,12-07-2026,98000,0,8820,8820",
      help: "CSV with a header row. Column names are matched loosely.",
    },
    {
      name: "register",
      label: "Your purchase register",
      type: "textarea",
      rows: 10,
      required: true,
      placeholder: "GSTIN,Invoice No,Date,Taxable Value,Tax\n27AAPFU0939F1ZV,inv-2026-412,12/07/2026,98000,17640",
      help: "Export from Tally, Zoho, Marg, Vyapar or a spreadsheet.",
    },
    {
      name: "tolerance",
      label: "Rounding tolerance",
      type: "select",
      required: true,
      options: ["₹0 — exact", "₹1", "₹10", "₹100"],
      help: "Differences within tolerance count as matched.",
    },
  ],

  sample: {
    tolerance: "₹1",
    gstr2b: `GSTIN,Invoice No,Invoice Date,Taxable Value,IGST,CGST,SGST
27AAPFU0939F1ZV,INV/2026/0412,12-07-2026,98000,0,8820,8820
29AAGCN2603R1ZZ,NL-2026-0088,03-07-2026,145000,26100,0,0
27AACCB1234D1Z5,BR/0771,08-07-2026,32000,0,2880,2880
24AABCT3518Q1ZV,TS-9912,15-07-2026,7500,1350,0,0
06AAACH7409R1ZZ,HP/26/0455,19-07-2026,268000,48240,0,0
33AAKCS5566P1Z2,SC-2026-114,22-07-2026,18400,0,1656,1656`,
    register: `GSTIN,Invoice No,Date,Taxable Value,Tax
27AAPFU0939F1ZV,inv-2026-412,12/07/2026,98000,17640
29AAGCN2603R1ZZ,NL-2026-0088,03/07/2026,145000,26100
27AACCB1234D1Z5,BR/0771,08/07/2026,34500,6210
06AAACH7409R1ZZ,HP/26/0455,19/07/2026,268000,48240
19AABCU9603R1ZM,UB-2026-7741,11/07/2026,86000,15480
27AAPFU0939F1ZV,INV/2026/0419,26/07/2026,42000,7560
33AAKCS5566P1Z2,SC-2026-114,22/07/2026,18400,3312`,
  },

  mcpTool: {
    name: "gstmatch_reconcile_2b",
    description:
      "Reconcile a GSTR-2B extract against a purchase register and quantify input tax credit at risk. Takes both as CSV plus a rounding tolerance. Normalises GSTINs and invoice numbers so differently formatted references still match, validates GSTIN check digits, and returns four buckets — matched, value mismatch, missing from 2B, missing from the register — with the rupee credit at risk, a per-supplier ranking, and a supplier follow-up list.",
  },
};
