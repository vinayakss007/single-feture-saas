import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "loantruth",
  name: "LoanTruth",
  tagline: "The real interest rate on your loan, not the one you were quoted",
  oneLiner:
    "Enter your sanction letter terms and get the true APR once fees and insurance are counted, the full amortisation, what prepaying actually saves, what a one-point rate rise costs, and the questions to put to the loan officer.",
  category: "Personal finance",
  audience: "Anyone taking a home, car, personal or business loan, and anyone already paying one off",
  accent: "#1d4ed8",
  accentSoft: "#eff6ff",

  metrics: [
    { value: "APR", label: "Solved numerically, not approximated" },
    { value: "₹", label: "Every figure in rupees, not percentages" },
    { value: "6", label: "Questions your lender should answer in writing" },
  ],

  problem: [
    {
      title: "The quoted rate is not the rate you pay",
      body:
        "Processing fee, GST on that fee, and insurance are deducted from disbursal. You are charged interest on the full sanctioned amount but receive less than it. No sanction letter states the resulting APR, and on a large fee it is a materially different number.",
    },
    {
      title: "Nobody shows you the first month",
      body:
        "On a twenty-year loan the early EMIs are almost entirely interest. Most borrowers have no idea they will not halve the outstanding balance until roughly two-thirds of the way through the term — which is exactly why prepaying early matters and prepaying late barely does.",
    },
    {
      title: "A floating rate reset is handled quietly",
      body:
        "When rates rise most lenders extend your tenure rather than raise the EMI. It is easier to accept monthly and considerably more expensive overall, and it usually happens without a conversation.",
    },
  ],

  features: [
    {
      title: "True APR, solved by bisection",
      body:
        "Not a closed-form approximation, which drifts precisely where fees are large — the case this exists to expose. It solves the payment stream against what you actually received.",
    },
    {
      title: "Full amortisation, with the halfway point named",
      body:
        "Month-by-month interest and principal, and the specific month your outstanding balance finally halves. That single number changes how people think about prepayment.",
    },
    {
      title: "Prepayment modelled properly",
      body:
        "A lump sum in a given month, re-amortised, showing interest saved, months removed, and the return on that money — plus a warning about penalties and annual caps that vary by loan type.",
    },
    {
      title: "One-point rate shock priced",
      body:
        "What a single percentage point does to your EMI and your total interest. On a floating loan that is not hypothetical, and the output says which lender behaviour to insist on.",
    },
    {
      title: "Honest about what is missing",
      body:
        "Legal, valuation, CERSAI, franking and stamp charges are often billed separately and are not in the APR unless you enter them. It says so rather than presenting a complete-looking number.",
    },
    {
      title: "Six questions, written for the branch",
      body:
        "Including asking for the effective APR in writing, whether the insurance is optional, and whether a reset will move the EMI or the tenure. Specific enough to be answered.",
    },
  ],

  how: [
    "Take the sanction letter and enter the amount, rate and tenure.",
    "Add the processing fee, insurance and any other upfront charges — these are what move the APR.",
    "Optionally model a prepayment: an amount and the month you would make it.",
    "Read the true APR against the quoted rate, then take the questions to the branch.",
  ],

  integrations: [
    "Amortisation summary as text for a spreadsheet or email",
    "JSON output for a personal finance tracker",
    "REST API for a broker or comparison site",
    "MCP server so an assistant can answer 'what does prepaying ₹2 lakh save'",
    "Self-hosted Docker, so loan details never leave your machine",
  ],

  pricing: [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      blurb: "For the loan you are about to sign.",
      features: [
        "25 calculations a month",
        "True APR and full amortisation",
        "Prepayment and rate-shock modelling",
        "Year summary and lender questions",
      ],
      cta: "Check a loan",
      monthlyRuns: 25,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Compare",
      price: "₹499",
      period: "/month",
      blurb: "For someone comparing several offers, or advising others.",
      features: [
        "5,000 calculations a month",
        "REST API and MCP server access",
        "Batch comparison of offers",
        "Custom fee structures",
        "Email support",
      ],
      cta: "Start on Compare",
      highlight: true,
      monthlyRuns: 5_000,
      apiAccess: true,
      rateLimitPerMin: 120,
    },
    {
      name: "Broker",
      price: "Custom",
      period: "",
      blurb: "For a broker, comparison site or lender.",
      features: [
        "Unlimited calculations",
        "Self-hosted Docker image",
        "White-labelled output",
        "Custom products and fee rules",
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
      q: "Why is the APR higher than my sanctioned rate?",
      a: "Because fees are deducted from disbursal. If ₹60,000 of fees comes off a ₹50 lakh sanction, you receive ₹49.4 lakh but pay interest on ₹50 lakh for the whole term. The APR is the rate that actually equates what you received to what you will pay, and it is the only number that lets you compare two offers with different fee structures.",
    },
    {
      q: "Is this financial advice?",
      a: "No. It is arithmetic on the numbers you enter. It does not tell you whether to take the loan, whether to prepay instead of investing, or which lender to use. Where a judgement is involved — prepaying versus investing, for instance — it names the comparison and leaves it to you.",
    },
    {
      q: "Should I prepay?",
      a: "The output gives you the return on that money over the life of the loan, which is the figure to compare against what it would earn invested. For a home loan at a low rate that comparison is closer than people assume; for a personal loan it rarely is. It also flags that penalties and annual caps vary by loan type — floating-rate home loans to individuals cannot carry a prepayment penalty, but fixed-rate and personal loans often can.",
    },
    {
      q: "Does it include stamp duty and legal charges?",
      a: "Only if you enter them as other charges, and the output says so explicitly rather than presenting a complete-looking APR. Legal, valuation, CERSAI, franking and mortgage stamp duty are usually billed separately from the sanction letter, which is exactly why they get left out of comparisons.",
    },
    {
      q: "What about tax deductions?",
      a: "Not applied, and stated as a limitation. Home loan interest and principal deductions materially change the real cost, but they depend on your tax regime and your other claims — folding an assumed benefit into the headline number would make it wrong for most people.",
    },
    {
      q: "Are my loan details stored?",
      a: "No. Every calculation is stateless: figures are processed in memory and never written to disk or a database. We meter run counts for billing and nothing else.",
    },
  ],

  inputs: [
    { name: "principal", label: "Sanctioned amount (₹)", type: "text", required: true, placeholder: "5000000" },
    { name: "rate", label: "Annual interest rate (%)", type: "text", required: true, placeholder: "8.6" },
    { name: "tenureYears", label: "Tenure (years)", type: "text", required: true, placeholder: "20" },
    {
      name: "rateType",
      label: "Rate type",
      type: "select",
      required: true,
      options: ["Floating", "Fixed"],
      help: "Decides whether the rate-reset section is framed as a live risk or as a comparison.",
    },
    {
      name: "processingFee",
      label: "Processing fee",
      type: "text",
      placeholder: "0.5%",
      help: "A percentage like 0.5% or a flat amount like 25000. GST of 18% is added automatically.",
    },
    { name: "insurance", label: "Insurance premium funded by the loan (₹)", type: "text", placeholder: "85000", help: "Usually optional, and usually added to the loan so you pay interest on it." },
    { name: "otherCharges", label: "Other upfront charges (₹)", type: "text", placeholder: "12000", help: "Legal, valuation, CERSAI, franking, documentation." },
    { name: "prepayAmount", label: "Prepayment amount (₹)", type: "text", placeholder: "500000", help: "Leave blank to skip prepayment modelling." },
    { name: "prepayMonth", label: "Prepay in month number", type: "text", placeholder: "36", help: "Month 36 is three years in." },
  ],

  sample: {
    principal: "5000000",
    rate: "8.6",
    tenureYears: "20",
    rateType: "Floating",
    processingFee: "0.5%",
    insurance: "85000",
    otherCharges: "12000",
    prepayAmount: "500000",
    prepayMonth: "36",
  },

  mcpTool: {
    name: "loantruth_analyse_loan",
    description:
      "Compute the true cost of a loan from its sanction letter terms. Takes principal, rate, tenure, processing fee as a percentage or flat amount, insurance funded by the loan and other upfront charges. Returns the EMI, full amortisation, total interest, the effective APR solved numerically against the amount actually disbursed after deductions, the gap against the quoted rate, the month the outstanding balance finally halves, the interest saved and months removed by a given prepayment, the EMI and interest impact of a one percentage point rate rise, and the specific questions to put to the lender in writing.",
  },
};
