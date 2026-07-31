import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "schoolfee",
  name: "SchoolFee",
  tagline: "Compare school fees properly - total cost, not just tuition",
  oneLiner:
    "Enter fee structures for up to 3 schools and see the TRUE total annual cost, projected cost through graduation with inflation, monthly outflow, hidden cost flags, and what investing the fee difference would grow to.",
  category: "Personal finance",
  audience: "Indian parents choosing between schools, financial planners advising on education costs",
  accent: "#155e75",
  accentSoft: "#ecfeff",

  metrics: [
    { value: "3", label: "Schools compared side by side" },
    { value: "8-10%", label: "Annual fee inflation modelled" },
    { value: "12%", label: "Investment growth on fee savings" },
  ],

  problem: [
    {
      title: "Schools quote tuition, parents pay everything else",
      body:
        "The fee brochure says Rs 1.2L tuition. But with development fee, activity fee, transport, uniform, books, and annual charges, the real cost is Rs 2.1L. Nobody adds it up until the first year's shock.",
    },
    {
      title: "One-time fees are forgotten in yearly comparisons",
      body:
        "Admission fees of Rs 50K-2L are paid once but should be amortised across years when comparing schools. A school with a high admission fee but lower annual fees may still be cheaper overall.",
    },
    {
      title: "Nobody projects what fees will be in Class 12",
      body:
        "Indian school fees increase 8-10% annually. A Rs 2L fee in Class 1 becomes Rs 4.3L by Class 10 at 8% inflation. Parents budget for today's fee, not tomorrow's.",
    },
  ],

  features: [
    {
      title: "TRUE total annual cost",
      body:
        "Adds every line item: tuition, development, activity, transport, uniform, books, admission fee amortised, exam fees, and any other charges. The number you actually pay, not the number on the brochure.",
    },
    {
      title: "Projected cost through graduation",
      body:
        "Models 8-10% annual inflation on fees to show total expenditure from current class through Class 12. The number that matters for financial planning.",
    },
    {
      title: "Monthly outflow calculation",
      body:
        "Converts annual cost including one-time fees into a monthly number so you can budget against your salary. Includes term-wise payment schedules.",
    },
    {
      title: "Side-by-side ranking",
      body:
        "Ranks schools by total projected cost and shows the difference in absolute terms and as a percentage.",
    },
    {
      title: "Hidden cost flags",
      body:
        "Identifies refundable vs non-refundable deposits, sibling discount eligibility, late payment penalties, and mid-year fee revision clauses.",
    },
    {
      title: "Investment value of fee difference",
      body:
        "Shows what investing the annual fee difference between the cheapest and most expensive option would grow to at 12% returns over the remaining school years.",
    },
  ],

  how: [
    "Enter fee details for up to 3 schools: tuition, development fee, activity fee, transport, uniform, books, and admission fee. Specify current class and years remaining.",
    "SchoolFee computes true annual cost, projects through graduation with inflation, calculates monthly outflow, and ranks schools by total lifetime cost.",
    "See hidden costs flagged, and understand what the fee difference could grow to if invested instead.",
  ],

  integrations: ["FlowForge", "Google Sheets", "Excel export"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "For choosing the right school with eyes open.",
      features: ["Compare up to 3 schools", "Inflation projection", "Monthly outflow", "Investment comparison"],
      cta: "Compare schools",
      monthlyRuns: 50,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Advisor",
      price: "$19",
      period: "/mo",
      blurb: "For financial planners advising families on education costs.",
      features: [
        "REST API + MCP server access",
        "Client-branded reports",
        "Custom inflation rates",
        "Multiple children planning",
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
      blurb: "For school aggregator platforms and education consultants.",
      features: [
        "Volume pricing",
        "Self-hosted Docker image",
        "School database integration",
        "SSO and audit log",
        "White-label reports",
      ],
      cta: "Talk to us",
      monthlyRuns: Number.POSITIVE_INFINITY,
      apiAccess: true,
      rateLimitPerMin: 600,
    },
  ],

  faq: [
    {
      q: "What inflation rate should I use?",
      a: "Indian school fees have historically increased 8-12% annually, well above general inflation. 8% is conservative, 10% is realistic for most private schools. International schools may see 12-15% increases. The tool defaults to 9% which is a median estimate.",
    },
    {
      q: "How is the admission fee handled?",
      a: "One-time admission fees are amortised across the remaining school years. A Rs 1L admission fee with 10 years remaining adds Rs 10K effectively per year to the total cost. This is the only fair way to compare a high-admission-fee school against a low one.",
    },
    {
      q: "What about refundable deposits?",
      a: "Refundable security deposits are flagged but not added to cost, since you get them back. However, the opportunity cost of that locked capital is noted - Rs 1L locked for 10 years at 12% returns is Rs 3.1L you gave up.",
    },
    {
      q: "Why 12% for the investment comparison?",
      a: "12% is the long-term average return of Indian equity index funds (Nifty 50) over 15+ year periods. For a conservative estimate, the tool also notes the 8% fixed-income alternative. The point is to quantify what the fee difference could do if invested.",
    },
    {
      q: "Does this include coaching and extra tuition?",
      a: "No. This compares school fees as quoted by the schools themselves. Coaching costs vary too much to generalise. But the monthly outflow number helps you see how much room is left for coaching in your budget.",
    },
  ],

  inputs: [
    {
      name: "school1",
      label: "School 1 fees (comma-separated: tuition, dev fee, activity, transport, uniform, books, admission)",
      type: "text",
      required: true,
      placeholder: "120000, 25000, 15000, 36000, 8000, 12000, 75000",
      help: "All amounts in Rs per year, except admission fee which is one-time. Separate with commas.",
    },
    {
      name: "school1Name",
      label: "School 1 name",
      type: "text",
      required: false,
      placeholder: "DPS Whitefield",
      help: "Optional name for identification.",
    },
    {
      name: "school2",
      label: "School 2 fees (same format)",
      type: "text",
      required: true,
      placeholder: "95000, 20000, 18000, 30000, 6000, 10000, 50000",
      help: "All amounts in Rs per year, except admission fee which is one-time.",
    },
    {
      name: "school2Name",
      label: "School 2 name",
      type: "text",
      required: false,
      placeholder: "Kendriya Vidyalaya",
      help: "Optional name for identification.",
    },
    {
      name: "school3",
      label: "School 3 fees (same format, optional)",
      type: "text",
      required: false,
      placeholder: "180000, 40000, 25000, 45000, 12000, 15000, 150000",
      help: "Leave blank if comparing only 2 schools.",
    },
    {
      name: "school3Name",
      label: "School 3 name",
      type: "text",
      required: false,
      placeholder: "International School",
      help: "Optional name for identification.",
    },
    {
      name: "currentClass",
      label: "Current class",
      type: "text",
      required: true,
      placeholder: "3",
      help: "The class your child is currently in (or will enter). Used to compute years remaining.",
    },
    {
      name: "yearsRemaining",
      label: "Years remaining until Class 12",
      type: "text",
      required: true,
      placeholder: "9",
      help: "Number of school years remaining for fee projection.",
    },
    {
      name: "inflationRate",
      label: "Annual fee inflation (%)",
      type: "select",
      options: ["8", "9", "10", "12"],
      help: "Expected annual fee increase. Indian private schools typically increase 8-12% per year.",
    },
  ],

  sample: {
    school1: "120000, 25000, 15000, 36000, 8000, 12000, 75000",
    school1Name: "DPS Whitefield",
    school2: "95000, 20000, 18000, 30000, 6000, 10000, 50000",
    school2Name: "National Public School",
    school3: "180000, 40000, 25000, 45000, 12000, 15000, 150000",
    school3Name: "International Academy",
    currentClass: "3",
    yearsRemaining: "9",
    inflationRate: "9",
  },

  mcpTool: {
    name: "schoolfee_compare",
    description:
      "Compare up to 3 schools by true total annual cost (not just tuition), project fees through graduation with inflation, compute monthly outflow, flag hidden costs, rank by total lifetime cost, and show what investing the fee difference would grow to.",
  },
};
