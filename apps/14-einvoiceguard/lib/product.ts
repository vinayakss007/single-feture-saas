import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "einvoiceguard",
  name: "eInvoiceGuard",
  tagline: "Catch the e-invoice error before the portal rejects it",
  oneLiner:
    "Paste an e-invoice payload and get every validation failure the IRP or Peppol network would return, with the official error code, the field path, and a corrected payload you can submit.",
  category: "Finance automation",
  audience: "Indian businesses on e-invoicing, SaaS exporters, ERP and billing engineers",
  accent: "#0369a1",
  accentSoft: "#f0f9ff",

  metrics: [
    { value: "40+", label: "Portal validations checked locally" },
    { value: "0", label: "API calls to find out you were wrong" },
    { value: "2", label: "Standards: India IRN and Peppol BIS 3.0" },
  ],

  problem: [
    {
      title: "A rejected e-invoice blocks a payment",
      body:
        "No IRN means no valid tax invoice, which means your customer will not pay and cannot claim credit. The rejection arrives from the portal after you submit, often in a batch, often at month end.",
    },
    {
      title: "The error codes explain nothing",
      body:
        "You get 2172 or 2265 and a field name. Working out which of your 60 fields is actually wrong, and what the portal expected instead, means reading the schema document again.",
    },
    {
      title: "You cannot test against production without submitting",
      body:
        "Every trial submission is a live attempt against a rate-limited portal, and a duplicate IRN is its own error. So teams ship the change and find out from the failures.",
    },
  ],

  features: [
    {
      title: "Every mandatory field, checked with its code",
      body:
        "Presence, type, length, and permitted values across the IRN schema — each failure carrying the error code the portal would have returned, so it matches what your ERP logs.",
    },
    {
      title: "GSTIN check digits, not just patterns",
      body:
        "Base-36 weighted checksum on seller, buyer and dispatch GSTINs. A transposed character fails here rather than at the portal.",
    },
    {
      title: "Tax arithmetic recomputed",
      body:
        "Line values against quantity and rate, taxable value against the line total, and CGST plus SGST versus IGST against the place of supply. The intra-state versus inter-state mix-up is the most common rejection there is.",
    },
    {
      title: "HSN and code lists validated",
      body:
        "HSN length rules by turnover, unit-of-measure codes, state codes against the GSTIN prefix, document types and supply types — checked against the actual code lists rather than assumed.",
    },
    {
      title: "Peppol BIS 3.0 for exports",
      body:
        "Selling to the EU means Peppol. The same payload is checked against BIS Billing 3.0 mandatory fields, scheme identifiers and the EN 16931 rules.",
    },
    {
      title: "A corrected payload out the other end",
      body:
        "Everything that can be fixed deterministically — rounding, recomputed totals, normalised codes, formatting — comes back applied, with a list of what was changed and what still needs a human.",
    },
  ],

  how: [
    "Paste the JSON you would send to the IRP, or a CSV row from your billing export.",
    "Pick the standard: India IRN for domestic, Peppol BIS 3.0 for EU customers.",
    "Read the failures, each with its error code, the exact field path and what was expected.",
    "Take the corrected payload, or put the API in front of your submission step so nothing invalid is ever sent.",
  ],

  integrations: [
    "IRP JSON schema 1.1 payloads",
    "Peppol BIS Billing 3.0 / EN 16931",
    "Tally, Zoho, Marg and custom ERP exports as CSV",
    "REST API in front of your submission step",
    "MCP server so an agent can validate and repair invoices",
    "Self-hosted Docker — invoice data never leaves your network",
  ],

  pricing: [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      blurb: "For debugging the invoice that keeps failing.",
      features: [
        "25 validations a month",
        "All 40+ checks, both standards",
        "GSTIN check-digit verification",
        "Corrected payload output",
      ],
      cta: "Validate an invoice",
      monthlyRuns: 25,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Billing",
      price: "₹1,999",
      period: "/month",
      blurb: "For a team submitting invoices every day.",
      features: [
        "5,000 validations a month",
        "REST API and MCP server access",
        "Pre-submission gate in your pipeline",
        "Custom rules for your own business checks",
        "Email support",
      ],
      cta: "Start on Billing",
      highlight: true,
      monthlyRuns: 5_000,
      apiAccess: true,
      rateLimitPerMin: 120,
    },
    {
      name: "Platform",
      price: "Custom",
      period: "",
      blurb: "For marketplaces validating supplier invoices at scale.",
      features: [
        "Unlimited validations",
        "Self-hosted Docker image",
        "Volume pricing and bulk endpoint",
        "Custom code lists and schema versions",
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
      q: "Does it submit to the IRP for me?",
      a: "No, deliberately. Submission needs your GSP credentials and belongs in your ERP where the IRN and signed QR have to be stored. This is the step before: it tells you the payload will be accepted, so the submission you do make succeeds.",
    },
    {
      q: "Are the error codes the real portal codes?",
      a: "Yes, where a published code exists — so a failure here matches what your ERP logs when the portal rejects the same payload. Checks that have no official code are marked as advisory rather than dressed up with a fake one.",
    },
    {
      q: "Will a clean result guarantee acceptance?",
      a: "It guarantees the payload is structurally and arithmetically valid, which is what the overwhelming majority of rejections are about. What it cannot know is portal state — a duplicate IRN, a cancelled GSTIN, an e-way bill conflict. Those are listed explicitly as things only the portal can decide.",
    },
    {
      q: "Do you store my invoice data?",
      a: "No. Validation is stateless: the payload is processed in memory and never written to disk or a database. We meter run counts for billing and nothing else. On Platform you run the Docker image inside your own network.",
    },
    {
      q: "Which schema version?",
      a: "IRP JSON schema 1.1, which is current, and Peppol BIS Billing 3.0 with the EN 16931 rules. On Platform you can pin a specific version if your GSP is behind.",
    },
    {
      q: "What is the single most common rejection?",
      a: "CGST plus SGST charged where the place of supply is a different state, or IGST charged where it is the same state. The rule is mechanical and the mistake is constant, so it is checked first and reported plainly.",
    },
  ],

  inputs: [
    {
      name: "payload",
      label: "Invoice payload",
      type: "textarea",
      rows: 18,
      required: true,
      placeholder: '{ "Version": "1.1", "TranDtls": { … }, "SellerDtls": { … } }',
      help: "IRP JSON, or a CSV row with a header. JSON gives the most precise field paths.",
    },
    {
      name: "standard",
      label: "Standard",
      type: "select",
      required: true,
      options: ["India IRN (IRP schema 1.1)", "Peppol BIS Billing 3.0"],
      help: "IRN for domestic Indian invoices, Peppol for EU customers.",
    },
    {
      name: "turnover",
      label: "Annual turnover",
      type: "select",
      required: true,
      options: ["Under ₹5 crore", "₹5 crore and above"],
      help: "Decides the minimum HSN digit length you are required to report.",
    },
  ],

  sample: {
    standard: "India IRN (IRP schema 1.1)",
    turnover: "₹5 crore and above",
    payload: `{
  "Version": "1.1",
  "TranDtls": { "TaxSch": "GST", "SupTyp": "B2B", "RegRev": "N", "IgstOnIntra": "N" },
  "DocDtls": { "Typ": "INV", "No": "INV/2026/0412", "Dt": "12-07-2026" },
  "SellerDtls": {
    "Gstin": "27AAPFU0939F1ZV",
    "LglNm": "Umbrella Components Pvt Ltd",
    "Addr1": "Plot 14, MIDC Andheri",
    "Loc": "Mumbai",
    "Pin": 400093,
    "Stcd": "27"
  },
  "BuyerDtls": {
    "Gstin": "29AAGCN2603R1ZX",
    "LglNm": "Northwind Logistics Pvt Ltd",
    "Pos": "27",
    "Addr1": "4th Floor, Whitefield",
    "Loc": "Bengaluru",
    "Pin": 560066,
    "Stcd": "29"
  },
  "ItemList": [
    {
      "SlNo": "1",
      "IsServc": "N",
      "HsnCd": "8431",
      "Qty": 12,
      "Unit": "NOS",
      "UnitPrice": 4500,
      "TotAmt": 54000,
      "AssAmt": 54000,
      "GstRt": 18,
      "CgstAmt": 4860,
      "SgstAmt": 4860,
      "IgstAmt": 0,
      "TotItemVal": 63720
    },
    {
      "SlNo": "2",
      "IsServc": "N",
      "HsnCd": "73269099",
      "Qty": 40,
      "Unit": "PCS",
      "UnitPrice": 650,
      "TotAmt": 26000,
      "AssAmt": 26000,
      "GstRt": 18,
      "CgstAmt": 2340,
      "SgstAmt": 2340,
      "IgstAmt": 0,
      "TotItemVal": 30680
    }
  ],
  "ValDtls": {
    "AssVal": 80000,
    "CgstVal": 7200,
    "SgstVal": 7200,
    "IgstVal": 0,
    "RndOffAmt": 0,
    "TotInvVal": 94500
  }
}`,
  },

  mcpTool: {
    name: "einvoiceguard_validate_payload",
    description:
      "Validate an e-invoice payload against India IRN schema 1.1 or Peppol BIS Billing 3.0 before submission, with no network calls. Checks mandatory fields, GSTIN check digits, HSN digit length against turnover, unit and state code lists, date formats, and recomputes line values, taxable totals and the CGST/SGST versus IGST split against the place of supply. Returns each failure with its official portal error code and field path, a corrected payload where the fix is deterministic, and the checks only the portal itself can perform.",
  },
};
