import type { ProductConfig } from "./types";

export const product: ProductConfig = {
  slug: "invoiceparse",
  name: "InvoiceParse",
  tagline: "Turn any invoice into clean data — and catch the GST errors",
  oneLiner:
    "Paste invoice text and get structured JSON, a line-item table and a ledger-ready CSV, with every GSTIN checksum verified and every tax total re-computed so a wrong invoice never reaches your books.",
  category: "Finance automation",
  audience: "Indian accountants, finance teams and B2B marketplaces",
  accent: "#7c3aed",
  accentSoft: "#f5f3ff",

  metrics: [
    { value: "15", label: "Validation rules run on every invoice" },
    { value: "100%", label: "GSTIN check digits verified, not pattern-matched" },
    { value: "0", label: "Templates to configure per vendor" },
  ],

  problem: [
    {
      title: "Data entry is still a person",
      body:
        "Someone reads a PDF and types numbers into a ledger. It costs a few minutes per invoice, and the errors it introduces cost far more at filing time.",
    },
    {
      title: "Invalid GSTINs pass straight through",
      body:
        "A GSTIN that looks right but fails its check digit means your input tax credit gets rejected months later, long after you paid the vendor.",
    },
    {
      title: "Nobody re-adds the invoice",
      body:
        "CGST and SGST that do not match, a subtotal that does not equal the line items, IGST charged on an intra-state supply. These arrive constantly and are caught by nobody.",
    },
  ],

  features: [
    {
      title: "Real GSTIN validation",
      body:
        "Runs the actual mod-36 check-digit algorithm plus state code and embedded PAN structure — not a regex that accepts any 15 characters.",
    },
    {
      title: "Arithmetic re-computed",
      body:
        "Line items are re-added, tax is recalculated from the stated rates, and the grand total is re-derived. Any mismatch is reported with the exact difference.",
    },
    {
      title: "Inter-state vs intra-state logic",
      body:
        "Compares the seller and buyer state codes and flags CGST/SGST charged on an inter-state supply, or IGST charged on an intra-state one.",
    },
    {
      title: "Line items as a table",
      body:
        "Description, HSN or SAC code, quantity, rate, taxable value and tax rate extracted per row, with missing HSN codes flagged.",
    },
    {
      title: "Ledger-ready CSV",
      body:
        "Output shaped for import into Tally, Zoho Books or a spreadsheet, with one row per line item and the tax split already separated.",
    },
    {
      title: "Works on messy OCR text",
      body:
        "Built for the real input: copy-pasted PDF text with broken spacing and stray characters. No per-vendor template setup.",
    },
  ],

  how: [
    "Paste the invoice text. Copy out of a PDF, an OCR tool, or an email body — layout does not need to be preserved.",
    "InvoiceParse extracts the header fields and line items, verifies both GSTINs, and re-computes every total from the parts.",
    "Copy the ledger CSV or the JSON. Or POST invoices from FlowForge as they arrive and only route the failures to a human.",
  ],

  integrations: ["FlowForge", "NuCRM", "Agent Fleet", "Tally", "Zoho Books", "Google Sheets", "Zapier / n8n"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "For the invoices you already do by hand.",
      features: ["Unlimited manual parses", "All 15 validation rules", "GSTIN check-digit verification", "Ledger CSV export"],
      cta: "Parse an invoice",
    },
    {
      name: "Books",
      price: "$39",
      period: "/mo",
      blurb: "For a finance team processing invoices daily.",
      features: [
        "REST API + MCP server access",
        "Bulk parse from email or folder via FlowForge",
        "Vendor GSTIN watchlist",
        "Custom ledger column mapping",
        "Email support",
      ],
      cta: "Start 14-day trial",
      highlight: true,
    },
    {
      name: "Platform",
      price: "$0.01",
      period: "/invoice",
      blurb: "For marketplaces validating supplier invoices at scale.",
      features: [
        "Volume pricing from 100k invoices",
        "Self-hosted Docker image",
        "Custom validation rules",
        "SSO and audit log",
        "SLA and shared Slack channel",
      ],
      cta: "Talk to us",
    },
  ],

  faq: [
    {
      q: "Does it read PDFs directly?",
      a: "This endpoint takes text. Extract it with any PDF text layer or OCR tool and paste it in — that separation keeps the parser honest and lets you use whichever OCR you already trust. Paid plans include a PDF and image endpoint.",
    },
    {
      q: "How does GSTIN validation actually work?",
      a: "A GSTIN is a 2-digit state code, a 10-character PAN, an entity number, the literal Z, and a check digit computed with a weighted mod-36 algorithm. All four parts are verified. A typo will fail the check digit, which a regex would happily accept.",
    },
    {
      q: "What if my invoice format is unusual?",
      a: "The parser is label-driven rather than layout-driven — it looks for the terms that appear on every tax invoice regardless of position. Anything it cannot find is reported as unextracted rather than guessed at.",
    },
    {
      q: "Does it call the GSTN portal to check registration status?",
      a: "No. Check-digit validation is offline and instant. Live registration lookup requires a GSP licence and is available on the Platform plan.",
    },
    {
      q: "Do you store invoices?",
      a: "No. Parsing is stateless and nothing is written to disk. Run the Docker image yourself if your auditors need that documented.",
    },
    {
      q: "Can an agent do this end to end?",
      a: "Yes. The MCP server exposes parsing as a tool, so an Agent Fleet worker can read the mailbox, parse, validate, and only escalate invoices that fail a rule.",
    },
  ],

  inputs: [
    {
      name: "invoice",
      label: "Invoice text",
      type: "textarea",
      rows: 16,
      required: true,
      placeholder: "TAX INVOICE\nInvoice No: INV-2026-0412\nGSTIN: 27AAPFU0939F1ZV\n...",
      help: "Paste raw text from a PDF, OCR output or an email body.",
    },
    {
      name: "currency",
      label: "Currency",
      type: "select",
      options: ["INR", "USD", "EUR", "GBP", "AED"],
      help: "Used for formatting and for deciding whether GST rules apply.",
    },
  ],

  sample: {
    currency: "INR",
    invoice: `TAX INVOICE

Seller: Umbrella Components Pvt Ltd
Address: Plot 14, MIDC Andheri, Mumbai, Maharashtra 400093
GSTIN: 27AAPFU0939F1ZV

Buyer: Northwind Logistics Pvt Ltd
Address: 4th Floor, Whitefield, Bengaluru, Karnataka 560066
GSTIN: 29AAGCN2603R1ZZ

Invoice No: INV-2026-0412
Invoice Date: 12/07/2026
Due Date: 11/08/2026
Place of Supply: Karnataka (29)
Reverse Charge: No

S.No  Description                  HSN     Qty   Rate      Amount
1     Conveyor roller assembly     84314990  12   4,500.00  54,000.00
2     Mounting bracket set         73269099  40     650.00  26,000.00
3     Installation service         998719     1  18,000.00  18,000.00

Taxable Value: 98,000.00
CGST @ 9%: 8,820.00
SGST @ 9%: 8,820.00
Round Off: 0.00
Grand Total: 1,15,640.00

Amount in words: One Lakh Fifteen Thousand Six Hundred Forty Rupees Only`,
  },

  mcpTool: {
    name: "invoiceparse_extract_and_validate",
    description:
      "Extract structured data from invoice text and validate it. Returns invoice header fields, seller and buyer details with GSTIN check-digit verification, line items with HSN codes, a recomputed tax and total breakdown, a list of validation failures with the exact numeric discrepancy, and a ledger-ready CSV.",
  },
};
