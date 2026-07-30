import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "medibillcheck",
  name: "MediBillCheck",
  tagline: "Find the errors in a hospital bill before you pay it",
  oneLiner:
    "Paste an itemised hospital bill and get the arithmetic errors, duplicate charges, consumables your insurer will refuse, the proportionate deduction your room category triggers, and a query letter for the billing desk.",
  category: "Health finance",
  audience: "Anyone paying a hospital bill in India, plus the family members who end up handling it",
  accent: "#0e7490",
  accentSoft: "#ecfeff",

  metrics: [
    { value: "12", label: "Categories of commonly declined consumable" },
    { value: "₹", label: "Every finding as a rupee figure you can argue" },
    { value: "0", label: "Clinical judgements offered" },
  ],

  problem: [
    {
      title: "Nobody checks a hospital bill at discharge",
      body:
        "You are exhausted, someone is unwell, and there is a queue behind you. The bill is eleven pages of line items and the only number anyone reads is the total. Errors found after payment are far harder to reverse.",
    },
    {
      title: "The proportionate deduction nobody sees coming",
      body:
        "Exceed your policy's room rent cap and most indemnity policies scale down the surgeon, anaesthetist and nursing charges by the same ratio. People discover this from the settlement letter, weeks later, when the room is long since vacated.",
    },
    {
      title: "Consumables are billed knowing they will be refused",
      body:
        "Gloves, syringes, dressing material, PPE, admission and record charges. Insurers routinely decline all of it, so it lands on you — and almost nobody queries it before signing.",
    },
  ],

  features: [
    {
      title: "Arithmetic checked line by line",
      body:
        "Quantity times rate against the line amount, and the sum of all lines against the stated total. A total that does not match its own line items is the most common billing error there is.",
    },
    {
      title: "Non-payable consumables identified",
      body:
        "Twelve categories insurers routinely decline, each with the reason, so you can query them at the desk instead of absorbing them after settlement.",
    },
    {
      title: "Proportionate deduction estimated",
      body:
        "Give your sum insured and room cap and it works out the day rate you were entitled to, the excess, and the knock-on deduction across associated charges. Usually the largest single number on the page.",
    },
    {
      title: "Duplicate charges flagged carefully",
      body:
        "Only identical amounts repeated on one bill, because medication legitimately repeats across days. Flagging every repeat would bury the real finding.",
    },
    {
      title: "GST on treatment questioned",
      body:
        "Healthcare from a clinical establishment is GST-exempt in India. Tax on a room above the threshold or a retail pharmacy sale can be legitimate; tax sitting on consultation or treatment is worth asking about.",
    },
    {
      title: "A query letter, ready to hand over",
      body:
        "Every finding with its amount and reasoning, ending with an offer to settle the undisputed balance immediately. That last sentence is what gets it read.",
    },
  ],

  how: [
    "Get the itemised bill, not the summary. Ask for it — you are entitled to it.",
    "Paste the line items. Copying from a PDF usually preserves the column spacing it needs.",
    "Add your sum insured and room rent cap if you are insured, so the proportionate deduction can be estimated.",
    "Work down the findings, hand over the query letter, and settle the rest.",
  ],

  integrations: [
    "Any itemised bill pasted as text",
    "Query letter as plain text for email or print",
    "CSV of findings for an insurance claim file",
    "REST API for a TPA or claims team processing bills at volume",
    "Self-hosted Docker, so patient billing data never leaves your network",
  ],

  pricing: [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      blurb: "For the bill in your hand right now.",
      features: [
        "25 bills a month",
        "All arithmetic, duplicate and consumable checks",
        "Proportionate deduction estimate",
        "Query letter and CSV export",
      ],
      cta: "Check a bill",
      monthlyRuns: 25,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Advocate",
      price: "₹999",
      period: "/month",
      blurb: "For someone who checks bills for other people.",
      features: [
        "5,000 bills a month",
        "REST API and MCP server access",
        "Multiple policies saved",
        "Custom non-payable lists per insurer",
        "Email support",
      ],
      cta: "Start on Advocate",
      highlight: true,
      monthlyRuns: 5_000,
      apiAccess: true,
      rateLimitPerMin: 120,
    },
    {
      name: "Claims",
      price: "Custom",
      period: "",
      blurb: "For a TPA, insurer or corporate benefits team.",
      features: [
        "Unlimited bills",
        "Self-hosted Docker image",
        "Bulk processing and custom rules",
        "Insurer-specific deduction logic",
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
      q: "Does this tell me whether a treatment was necessary?",
      a: "No, and it never will. Whether a test or procedure was warranted is a clinical judgement, and taking one from a bill parser would be actively dangerous. What it checks is whether the arithmetic holds, whether items are duplicated, and whether charges are payable under a typical policy. That is a genuinely different question and it is the one where money is routinely lost.",
    },
    {
      q: "Is a high rate an error?",
      a: "No. Hospitals price freely outside government schemes, so an expensive line is not wrong by itself, and the output says so rather than implying otherwise. Arithmetic errors, duplicates and non-payable items are objectively checkable; pricing is not.",
    },
    {
      q: "How accurate is the proportionate deduction figure?",
      a: "It uses the common indemnity structure — room cap as a percentage of sum insured, associated charges scaled by the same ratio. Your own policy wording governs, and it is stated as an estimate for exactly that reason. It is accurate enough to tell you to ask for a different room category, which is the decision that actually matters and has to be made on admission.",
    },
    {
      q: "Is my medical billing data stored?",
      a: "No. The audit is stateless: the bill is processed in memory and never written to disk or a database. We meter run counts for billing and nothing else. On the Claims plan you run the Docker image inside your own network.",
    },
    {
      q: "What if some lines cannot be read?",
      a: "They are listed explicitly and excluded from the totals, so you can see the audit was partial. A clean result computed from half a bill would be worse than no result — you would stop looking.",
    },
    {
      q: "Will the hospital actually revise the bill?",
      a: "Often, for arithmetic errors and duplicates, because those are simply wrong. Consumables are a negotiation and vary by hospital. The letter is written to make agreement easy: it itemises the query, shows the working, and offers to settle everything undisputed straight away.",
    },
  ],

  inputs: [
    {
      name: "bill",
      label: "Itemised bill",
      type: "textarea",
      rows: 16,
      required: true,
      placeholder: "Room Rent (Private)\t5\t9000\t45000\nSurgeon Charges\t1\t65000\t65000\nGloves\t40\t25\t1000",
      help: "One line per item: description, quantity, rate, amount. Tabs, multiple spaces or pipes all work.",
    },
    {
      name: "insurance",
      label: "Are you claiming on insurance?",
      type: "select",
      required: true,
      options: ["Yes — cashless or reimbursement", "No — paying myself"],
    },
    {
      name: "sumInsured",
      label: "Sum insured (₹)",
      type: "text",
      placeholder: "500000",
      help: "Needed to estimate the room cap and the proportionate deduction.",
    },
    {
      name: "roomCap",
      label: "Room rent cap in your policy",
      type: "select",
      required: true,
      options: ["1% of sum insured per day", "2% of sum insured per day", "No room rent cap", "Not sure"],
      help: "Usually stated on the policy schedule as a percentage of sum insured.",
    },
    { name: "patient", label: "Patient name", type: "text", placeholder: "R. Iyer", help: "Appears on the query letter." },
    { name: "billNo", label: "Bill number", type: "text", placeholder: "IPD/2026/04412" },
  ],

  sample: {
    insurance: "Yes — cashless or reimbursement",
    sumInsured: "500000",
    roomCap: "1% of sum insured per day",
    patient: "R. Iyer",
    billNo: "IPD/2026/04412",
    bill: `S.No  Particulars                          Qty   Rate      Amount
1     Room Rent (Private AC)                 5    9000.00   45000.00
2     Nursing Charges                        5    1800.00    9000.00
3     Surgeon Charges                        1   65000.00   65000.00
4     Anaesthetist Charges                   1   18000.00   18000.00
5     Operation Theatre Charges              1   32000.00   32000.00
6     Consultant Visit                       7    1200.00    8400.00
7     Inj. Monocef 1g                       10     165.00    1650.00
8     Inj. Monocef 1g                       10     165.00    1650.00
9     Surgical Gloves                       40      25.00    1000.00
10    Disposable Syringes 5ml               60      12.00     720.00
11    Cotton and Gauze Dressing              1    2400.00    2400.00
12    PPE Kit                                6     450.00    2700.00
13    Hand Sanitizer 500ml                   3     280.00     840.00
14    Admission Charges                      1    1500.00    1500.00
15    Medical Records Charge                 1     750.00     750.00
16    Attendant Food                         5     350.00    1750.00
17    Television Charges                     5     150.00     750.00
18    Pathology - CBC                        3     450.00    1350.00
19    Pathology - LFT                        2     900.00    1800.00
20    Physiotherapy Session                  4    1250.00    4800.00
21    Miscellaneous Charges                  1    3200.00    3200.00
22    CGST on Services                       1    2850.00    2850.00

Grand Total: 210260.00`,
  },

  mcpTool: {
    name: "medibillcheck_audit_bill",
    description:
      "Audit an itemised hospital bill for billing errors without making any clinical judgement. Takes the line items plus optional sum insured and room rent cap. Returns arithmetic failures where quantity times rate does not match the line or the lines do not match the stated total, identical amounts charged more than once, consumables and administrative charges insurers routinely decline with the reason for each, the proportionate deduction triggered by exceeding a room rent cap, GST charged on exempt healthcare services, and a ready-to-send query letter itemising every finding with its rupee amount.",
  },
};
