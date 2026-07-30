import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "contractclock",
  name: "ContractClock",
  tagline: "Paste a contract, find the auto-renewal you were about to miss",
  oneLiner:
    "Paste any contract and get every date and duration in it, the auto-renewal clauses quoted in full, the notice window, the last safe day to cancel, and a calendar file with reminders.",
  category: "Contract operations",
  audience: "Ops and finance leads, procurement, founders signing their own contracts, agencies managing client vendors",
  accent: "#7e22ce",
  accentSoft: "#faf5ff",

  metrics: [
    { value: "1 day", label: "How narrowly people miss notice windows" },
    { value: ".ics", label: "Deadlines straight into your calendar" },
    { value: "0", label: "Dates invented — only what is in the text" },
  ],

  problem: [
    {
      title: "Auto-renewal is the most expensive clause nobody diarises",
      body:
        "A contract renews for another year unless you give sixty days' notice. Nobody reads clause 14.3 at signature, the reminder is never set, and you find out from the invoice — a month after the window closed.",
    },
    {
      title: "The dates are scattered across forty pages",
      body:
        "Effective date in the preamble, term in clause 3, notice in clause 14, payment terms in a schedule. Each is a different format, and one is written as '01/02/2026' with no clue which convention.",
    },
    {
      title: "Contract management platforms want your whole repository",
      body:
        "The category answer is to migrate every agreement into a new system with a workflow engine. That is a quarter's project. You have one contract and a question about it.",
    },
  ],

  features: [
    {
      title: "The last safe day to cancel, computed",
      body:
        "Renewal date minus the notice period, as an actual date. Not 'sixty days before renewal' — the day itself, so it goes in a calendar.",
    },
    {
      title: "Auto-renewal clauses quoted, not summarised",
      body:
        "The exact sentences, so you read what the contract says rather than what a tool thought it meant. That distinction matters when money depends on it.",
    },
    {
      title: "Every date, labelled and in context",
      body:
        "Effective, expiry, renewal, execution, payment — each with the surrounding text, so you can see why it was labelled that way and correct it if wrong.",
    },
    {
      title: "Ambiguous dates flagged, not guessed",
      body:
        "'01/02/2026' is either 1 February or 2 January depending on which side of the Atlantic drafted it. Both readings are shown rather than one being picked silently.",
    },
    {
      title: "Calendar file with reminders",
      body:
        "An .ics you import into Google Calendar or Outlook, with a two-week alarm before each deadline. The point is to be reminded, not to have read a report once.",
    },
    {
      title: "No model, so no invented dates",
      body:
        "Pattern matching over the text. A hallucinated cancellation deadline would be a liability — someone diarises it, misses the real one, and owes another year. Nothing is reported that cannot be pointed at in the text.",
    },
  ],

  how: [
    "Paste the contract text. A PDF's text layer, a Word export or an email body all work.",
    "Enter today's date, so deadlines are measured from a date you control rather than a server clock.",
    "Read the deadlines, the quoted renewal clauses, and anything flagged as ambiguous.",
    "Import the calendar file. That is the part that actually stops you missing the window.",
  ],

  integrations: [
    ".ics for Google Calendar, Outlook and Apple Calendar",
    "Markdown summary for Notion or a contract register",
    "JSON output for a spreadsheet or a CLM tool",
    "REST API to process a batch of agreements",
    "MCP server so an agent can answer questions about a contract",
    "Self-hosted Docker — contract text never leaves your network",
  ],

  pricing: [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      blurb: "For the contract on your desk right now.",
      features: [
        "25 contracts a month",
        "Full date and duration extraction",
        "Auto-renewal and notice analysis",
        "Calendar file and Markdown summary",
      ],
      cta: "Check a contract",
      monthlyRuns: 25,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Operations",
      price: "₹1,999",
      period: "/month",
      blurb: "For someone who owns a stack of vendor agreements.",
      features: [
        "5,000 contracts a month",
        "REST API and MCP server access",
        "Batch processing for a whole folder",
        "Custom clause patterns for your paper",
        "Email support",
      ],
      cta: "Start on Operations",
      highlight: true,
      monthlyRuns: 5_000,
      apiAccess: true,
      rateLimitPerMin: 120,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      blurb: "For procurement or legal ops across many entities.",
      features: [
        "Unlimited contracts",
        "Self-hosted Docker image",
        "Custom clause libraries",
        "Multi-entity contract register",
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
      q: "Why not use an LLM to read the contract?",
      a: "Because the output goes into a calendar and someone relies on it. A model that invents 'cancel by 14 March' when the contract says nothing of the sort creates exactly the liability this product exists to prevent — a false sense of having diarised the deadline. Every date here can be pointed at in the source text, and where nothing could be extracted it says so instead of filling the gap.",
    },
    {
      q: "What if it misses a clause?",
      a: "Then it tells you it found nothing rather than reporting a clean bill of health. 'No auto-renewal clause matched — check for wording like shall continue thereafter' is a useful answer. A confident silence would not be.",
    },
    {
      q: "Can it read a PDF?",
      a: "Paste the text layer — select all in your PDF viewer and copy. A scanned image has no text layer and needs OCR first; any free OCR tool will do, and the output pastes in fine.",
    },
    {
      q: "How does it handle 01/02/2026?",
      a: "It reads day-first, the Indian and European convention, and flags it explicitly as ambiguous with both readings shown. If the contract is American, every such date shifts, and the output tells you to confirm before diarising anything.",
    },
    {
      q: "Is the contract text stored?",
      a: "No. Extraction is stateless: the text is processed in memory and never written to disk or a database. We meter run counts for billing, nothing else. On Enterprise you run the Docker image inside your own network, which is usually the deciding factor for anything under NDA.",
    },
    {
      q: "Is this legal advice?",
      a: "No. It does not interpret obligations, assess enforceability or tell you whether a clause is reasonable. It finds the dates, durations and renewal language so that a person reads the three clauses that matter instead of all forty pages.",
    },
  ],

  inputs: [
    {
      name: "contract",
      label: "Contract text",
      type: "textarea",
      rows: 18,
      required: true,
      placeholder: "MASTER SERVICES AGREEMENT\n\nThis Agreement is effective as of 1 September 2024...",
      help: "Paste the text. Copy from a PDF viewer, a Word document or an email.",
    },
    {
      name: "counterparty",
      label: "Counterparty",
      type: "text",
      placeholder: "Umbrella Software Ltd",
      help: "Appears on the calendar events and the summary.",
    },
    {
      name: "asOfDate",
      label: "Today's date",
      type: "text",
      required: true,
      placeholder: "2026-07-30",
      help: "Deadlines are measured from this date. ISO format, so the result is reproducible.",
    },
  ],

  sample: {
    counterparty: "Umbrella Software Ltd",
    asOfDate: "2026-07-30",
    contract: `MASTER SERVICES AGREEMENT

This Master Services Agreement ("Agreement") is entered into and effective as of 1 September 2024 ("Effective Date") between Umbrella Software Ltd, a company registered in England ("Supplier"), and Northwind Logistics Pvt Ltd ("Customer").

1. SERVICES
Supplier shall provide the Customer with access to the Umbrella platform and associated support services as described in Schedule A.

2. FEES
2.1 The annual subscription fee is £48,000, invoiced annually in advance.
2.2 Payment is due Net 30 from the date of invoice. Late payments accrue interest at 4% above base rate.
2.3 Supplier may increase fees on renewal by giving not less than 90 days written notice prior to the renewal date, provided any increase shall not exceed 7% per annum.

3. TERM
3.1 This Agreement shall commence on the Effective Date and continue for an initial period of 12 months ("Initial Term").
3.2 Upon expiry of the Initial Term, this Agreement shall automatically renew for successive periods of 12 months (each a "Renewal Term") unless either party gives written notice of non-renewal in accordance with clause 14.

4. SERVICE LEVELS
4.1 Supplier shall maintain 99.5% monthly uptime. Service credits are set out in Schedule B.
4.2 Support requests shall receive an initial response within 4 hours during business hours.

10. DATA PROTECTION
10.1 Each party shall comply with applicable data protection legislation. The Data Processing Addendum at Schedule C forms part of this Agreement.
10.2 Supplier shall notify Customer of any personal data breach within 24 hours of becoming aware of it.

13. AUDIT
13.1 Customer may audit Supplier's compliance once in any 12 month period, on 30 days notice.

14. TERMINATION
14.1 Either party may terminate this Agreement at the end of the Initial Term or any Renewal Term by giving not less than 60 days written notice prior to the end of the then-current term.
14.2 Either party may terminate immediately on written notice if the other commits a material breach which remains unremedied for 30 days after notice.
14.3 On termination Customer shall pay all fees accrued to the date of termination. Fees paid in advance are non-refundable.
14.4 Supplier shall make Customer data available for export for a period of 30 days following termination, after which it shall be deleted within 60 days.

18. GENERAL
18.1 This Agreement is governed by the laws of England and Wales.
18.2 Neither party may assign this Agreement without the prior written consent of the other.
18.3 This Agreement was executed on 28 August 2024.`,
  },

  mcpTool: {
    name: "contractclock_extract_deadlines",
    description:
      "Extract every date, duration and deadline from contract text without using a language model. Takes the contract text and a reference date. Returns auto-renewal clauses quoted verbatim, the notice period required, the renewal date including rolling it forward if past renewals have already occurred, the computed last safe day to cancel, payment terms, every date labelled and shown in context, dates whose day-month order is ambiguous, and an iCalendar file with reminders. States explicitly when a deadline could not be computed rather than guessing one.",
  },
};
