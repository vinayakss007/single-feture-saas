import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "emicalc",
  name: "EMICalc",
  tagline: "Compare loan offers properly - total cost, not just EMI",
  oneLiner:
    "Enter up to 3 loan offers with principal, rate, tenure, processing fee, and insurance to compare by total outflow, effective APR, and prepayment savings rather than misleading EMI alone.",
  category: "Finance tools",
  audience: "Home loan borrowers, car loan applicants, personal loan seekers, loan brokers, financial advisors",
  accent: "#1c1917",
  accentSoft: "#fffbeb",

  metrics: [
    { value: "3", label: "Offers compared side-by-side" },
    { value: "APR", label: "True cost metric used" },
    { value: "5%", label: "Prepayment scenario modelled" },
  ],

  problem: [
    {
      title: "Lower EMI does not mean cheaper loan",
      body:
        "A 20-year loan at 8.5% has lower EMI than a 15-year loan at 8.7%, but costs Rs 8-12 lakh more in total interest. Banks sell you on monthly affordability while hiding the lifetime cost difference.",
    },
    {
      title: "Processing fees and insurance flip the ranking",
      body:
        "Bank A offers 8.5% with Rs 10,000 processing fee. Bank B offers 8.6% with zero processing fee and free first-year insurance. On a Rs 50 lakh loan for 20 years, Bank B can be Rs 40,000 cheaper despite the higher rate.",
    },
    {
      title: "Nobody calculates the prepayment benefit properly",
      body:
        "Prepaying 5% of principal in year 2 of a home loan saves Rs 5-15 lakh over the remaining tenure depending on rate and tenure. But some banks charge prepayment penalties (fixed-rate loans). The breakeven calculation is not trivial.",
    },
  ],

  features: [
    {
      title: "Total outflow comparison (not just EMI)",
      body: "For each offer: EMI + total interest + processing fee + insurance = total outflow in rupees. Ranked by who costs you least over the full tenure.",
    },
    {
      title: "Effective APR calculation",
      body: "Includes processing fees and insurance in the effective annual rate. A loan at 8.5% with Rs 30,000 fees on Rs 50 lakh has a real APR of 8.56%. Small difference, but multiplied over 20 years.",
    },
    {
      title: "Prepayment savings model",
      body: "Shows what happens if you prepay 5% in year 2: interest saved, tenure reduction, and which offer benefits most from prepayment.",
    },
    {
      title: "Rupee difference between offers",
      body: "Not percentages but actual rupees. 'Offer A costs Rs 3,47,000 more than Offer B over 20 years' is actionable. Percentages hide the magnitude.",
    },
    {
      title: "Where lower rate loses to lower fees",
      body: "Flags the non-obvious case where a slightly higher rate with zero fees beats a lower rate with high processing charge, especially on shorter tenures.",
    },
  ],

  how: [
    "Enter up to 3 loan offers: principal, interest rate, tenure in years, processing fee, and insurance premium.",
    "EMICalc computes EMI, total interest, effective APR, and total outflow for each, then ranks them.",
    "See the rupee difference, prepayment savings, and which offer has the best breakeven.",
  ],

  integrations: ["FlowForge", "Print/PDF", "Loan comparison platforms"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "For anyone comparing loan offers.",
      features: ["Up to 3 offers", "Total outflow", "Effective APR", "Prepayment model", "Ranking"],
      cta: "Compare offers",
      monthlyRuns: 50,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Pro",
      price: "$9",
      period: "/mo",
      blurb: "For loan brokers and advisors.",
      features: ["REST API + MCP server", "Unlimited comparisons", "Client reports", "Custom scenarios", "Priority support"],
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
      blurb: "For fintech and lending platforms.",
      features: ["Volume pricing", "Self-hosted Docker image", "White-label", "SSO and audit log", "Custom models"],
      cta: "Talk to us",
      monthlyRuns: Number.POSITIVE_INFINITY,
      apiAccess: true,
      rateLimitPerMin: 600,
    },
  ],

  faq: [
    {
      q: "Why not just compare EMI?",
      a: "EMI comparison is misleading. A Rs 50 lakh loan at 8.5% for 20 years has EMI Rs 43,391. The same at 8.5% for 15 years has EMI Rs 49,236. Most people pick the lower EMI. But the 20-year loan costs Rs 54.1 lakh total interest vs Rs 38.6 lakh for 15 years. That Rs 5,800/month EMI difference costs Rs 15.5 lakh extra.",
    },
    {
      q: "What is effective APR?",
      a: "Effective APR includes all upfront costs (processing fee, insurance) as if they were interest. A loan at 8.5% with Rs 30,000 processing fee effectively costs 8.53-8.56% APR depending on tenure. RBI mandates lenders disclose APR but most buyers ignore it.",
    },
    {
      q: "How does prepayment save money?",
      a: "Prepaying reduces principal, which reduces interest for ALL remaining months. Prepaying Rs 2.5 lakh (5% of Rs 50 lakh) in year 2 of a 20-year loan at 8.5% saves approximately Rs 6-8 lakh in interest over remaining tenure and reduces tenure by 14-18 months.",
    },
    {
      q: "Do all loans allow prepayment?",
      a: "Floating rate home loans: RBI mandates zero prepayment penalty. Fixed rate home loans: banks can charge 2-3% of prepaid amount. Personal loans: typically 2-5% foreclosure charge. Car loans: varies by lender. Always check before comparing.",
    },
    {
      q: "Should I always pick the shortest tenure?",
      a: "Not necessarily. Shortest tenure minimizes total interest but maximizes monthly burden. Pick the shortest tenure where EMI is comfortable (under 40% of take-home) with buffer for rate increases. Then prepay voluntarily when you have surplus.",
    },
  ],

  inputs: [
    {
      name: "offers",
      label: "Loan offers (principal,rate%,tenure_years,processing_fee,insurance per line)",
      type: "textarea",
      required: true,
      placeholder: "5000000,8.5,20,10000,15000\n5000000,8.7,20,0,0\n5000000,8.4,15,25000,12000",
      help: "One offer per line: principal(Rs),annual_rate(%),tenure(years),processing_fee(Rs),insurance(Rs). Up to 3 offers.",
      rows: 4,
    },
  ],

  sample: {
    offers: "5000000,8.5,20,10000,15000\n5000000,8.7,20,0,0\n5000000,8.4,15,25000,12000",
  },

  mcpTool: {
    name: "emi_loan_comparator",
    description:
      "Compare up to 3 loan offers by total outflow, effective APR, and prepayment savings. Input principal, rate, tenure, fees, and insurance for each offer. Returns EMI, total interest, ranking by total cost, rupee difference, and prepayment benefit analysis.",
  },
};
