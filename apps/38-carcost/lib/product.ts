import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  // Category default is ledger. The value is in seeing what it asks for — two cars and a
  // mileage — so the form belongs above the fold.
  design: "split",

  slug: "carcost",
  name: "CarCost",
  tagline: "The real cost of owning this car, not just the EMI",
  oneLiner:
    "Enter car price, state, fuel type, monthly km, and loan details to compute the TRUE 5-year ownership cost including road tax, insurance, fuel, service, tyres, depreciation, and loan interest - not just the EMI.",
  category: "Personal finance",
  audience: "Indian car buyers, auto journalists, financial planners, car comparison researchers",
  accent: "#1a2e05",
  accentSoft: "#f7fee7",

  metrics: [
    { value: "5yr", label: "Total ownership period analysed" },
    { value: "12+", label: "Cost components computed" },
    { value: "Rs/km", label: "True cost per kilometre revealed" },
  ],

  problem: [
    {
      title: "EMI is not the cost of owning a car",
      body:
        "A Rs 10L car with a 7-year loan at 9% has a Rs 16,000 EMI. But add fuel (Rs 8,000), insurance (Rs 4,000), service (Rs 2,000), parking (Rs 2,000), and the actual monthly cost is Rs 32,000. Nobody computes this before buying.",
    },
    {
      title: "Ex-showroom price hides the on-road reality",
      body:
        "Ex-showroom to on-road adds 12-22% depending on state. Road tax varies from 4% (Himachal) to 20% (Kerala). Insurance, registration, logistics, accessories - the gap between the advertised price and what you pay is lakhs.",
    },
    {
      title: "Depreciation is the biggest cost nobody calculates",
      body:
        "A Rs 12L car is worth Rs 5.5L after 5 years - you lost Rs 6.5L to depreciation alone. That is more than 5 years of fuel. But because you do not write a cheque for depreciation, it feels free until you sell.",
    },
  ],

  features: [
    {
      title: "Ex-showroom to on-road computation",
      body:
        "Computes road tax (state-specific rates), registration, insurance (comprehensive or third-party), TCS, logistics, and standard accessories to show the true on-road price.",
    },
    {
      title: "5-year running cost projection",
      body:
        "Monthly fuel cost (at state-specific prices), annual service schedule, tyre replacement, consumables, insurance renewals with depreciating IDV, and road tax where applicable.",
    },
    {
      title: "Loan interest total",
      body:
        "Computes total interest paid over the loan tenure, effective cost per lakh, EMI, and how much you pay above the car price. Shows total outflow vs ex-showroom.",
    },
    {
      title: "Depreciation and resale value",
      body:
        "Estimates year-by-year depreciation using Indian used-car market data (35% year 1, then 15-20% declining). Shows what the car is worth at year 5 and total wealth lost to depreciation.",
    },
    {
      title: "Cost per kilometre",
      body:
        "Divides total 5-year cost (purchase + running + depreciation) by total km driven. The number that actually tells you whether this car is affordable for your usage.",
    },
    {
      title: "Petrol vs diesel breakeven",
      body:
        "If both fuel types are available, computes how many km/month you need to drive for the diesel premium to pay for itself through lower fuel cost.",
    },
  ],

  how: [
    "Enter ex-showroom price, state, fuel type, expected monthly km, and loan details (tenure, rate, down payment).",
    "CarCost computes on-road price, 5-year running costs, loan interest, depreciation, and total ownership cost with cost-per-km.",
    "See what you think it costs (EMI) vs what it actually costs (EMI + fuel + insurance + service + depreciation).",
  ],

  integrations: ["FlowForge", "Excel export", "Auto comparison tools"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "For anyone buying a car with eyes open.",
      features: ["Full 5-year cost projection", "State-specific taxes", "Loan computation", "Depreciation estimate", "Cost per km"],
      cta: "Calculate real cost",
      monthlyRuns: 50,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Pro",
      price: "$19",
      period: "/mo",
      blurb: "For auto journalists and financial advisors comparing vehicles.",
      features: [
        "REST API + MCP server access",
        "Multi-car comparison",
        "Custom depreciation curves",
        "Client-branded reports",
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
      blurb: "For auto portals and lending platforms.",
      features: [
        "Volume pricing",
        "Self-hosted Docker image",
        "Real-time fuel price API",
        "SSO and audit log",
        "White-label integration",
      ],
      cta: "Talk to us",
      monthlyRuns: Number.POSITIVE_INFINITY,
      apiAccess: true,
      rateLimitPerMin: 600,
    },
  ],

  faq: [
    {
      q: "How accurate are the road tax calculations?",
      a: "Road tax rates are based on published state RTO rates as of 2024. They vary by vehicle type, fuel type, and price slab. The tool uses the most common rate for passenger cars in each state. Actual rates may differ for EVs, hybrids, or vehicles above Rs 20L in some states.",
    },
    {
      q: "What depreciation model do you use?",
      a: "Based on Indian used-car market data: 35% in year 1, 15% in year 2, 12% in year 3, 10% in year 4, 8% in year 5. This matches observed resale values on OLX/Cars24/Spinny for mainstream brands. Luxury and niche vehicles depreciate faster.",
    },
    {
      q: "How is fuel cost calculated?",
      a: "Using average state fuel prices (updated quarterly) and the mileage you specify. Default mileage estimates are conservative (70% of ARAI claimed mileage for real-world driving). You can override with your actual observed mileage.",
    },
    {
      q: "Does this include EV running costs?",
      a: "For EVs, the tool computes electricity cost instead of fuel (assuming Rs 8/kWh home charging), and removes engine service costs while adding battery degradation estimate. Road tax exemptions for EVs in applicable states are factored in.",
    },
    {
      q: "What about resale value - is that considered?",
      a: "Yes. The 5-year cost includes depreciation (purchase price minus estimated resale value). This is the single largest cost for most cars and the one most buyers ignore because no cheque is written for it.",
    },
  ],

  inputs: [
    {
      name: "exShowroom",
      label: "Ex-showroom price (Rs)",
      type: "text",
      required: true,
      placeholder: "1200000",
      help: "The ex-showroom price in rupees (without commas). E.g., 1200000 for Rs 12 lakh.",
    },
    {
      name: "state",
      label: "Registration state",
      type: "select",
      required: true,
      options: [
        "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Telangana",
        "Gujarat", "Uttar Pradesh", "Rajasthan", "Kerala", "Haryana",
        "West Bengal", "Madhya Pradesh", "Punjab", "Andhra Pradesh", "Bihar",
      ],
      help: "Road tax and fuel prices vary significantly by state.",
    },
    {
      name: "fuelType",
      label: "Fuel type",
      type: "select",
      required: true,
      options: ["Petrol", "Diesel", "CNG", "Electric"],
      help: "Determines fuel cost, service schedule, and applicable taxes.",
    },
    {
      name: "monthlyKm",
      label: "Expected monthly driving (km)",
      type: "text",
      required: true,
      placeholder: "1500",
      help: "Average monthly kilometres you expect to drive. Urban commute: 800-1200. Mixed: 1500-2000. Highway heavy: 2500+.",
    },
    {
      name: "mileage",
      label: "Expected real-world mileage (km/l or km/kWh for EV)",
      type: "text",
      required: false,
      placeholder: "14",
      help: "Real-world mileage, not ARAI. Leave blank to auto-estimate based on fuel type and price segment.",
    },
    {
      name: "loanAmount",
      label: "Loan percentage (%)",
      type: "select",
      required: true,
      options: ["0", "70", "80", "85", "90", "100"],
      help: "What percentage of on-road price is financed. 0 = paying cash. 80-85% is typical.",
    },
    {
      name: "loanTenure",
      label: "Loan tenure (years)",
      type: "select",
      required: false,
      options: ["3", "5", "7"],
      help: "Longer tenure means lower EMI but much more interest paid.",
    },
    {
      name: "loanRate",
      label: "Loan interest rate (%)",
      type: "text",
      required: false,
      placeholder: "9",
      help: "Annual interest rate. Current range: 8.5-12% depending on bank and credit score.",
    },
    {
      name: "insuranceType",
      label: "Insurance type",
      type: "select",
      required: true,
      options: ["Comprehensive", "Third Party Only"],
      help: "Comprehensive covers own damage + third party. Third party is mandatory minimum.",
    },
  ],

  sample: {
    exShowroom: "1200000",
    state: "Maharashtra",
    fuelType: "Petrol",
    monthlyKm: "1500",
    mileage: "14",
    loanAmount: "80",
    loanTenure: "5",
    loanRate: "9",
    insuranceType: "Comprehensive",
  },

  mcpTool: {
    name: "car_cost_compute",
    description:
      "Compute the TRUE 5-year ownership cost of a car in India including on-road price (state-specific road tax), fuel, insurance, service, depreciation, loan interest, and cost-per-km. Shows what you think it costs (EMI) vs what it actually costs.",
  },
};
