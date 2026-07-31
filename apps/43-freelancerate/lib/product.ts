import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "freelancerate",
  name: "FreelanceRate",
  tagline: "What to charge per hour, based on what you actually need to earn",
  oneLiner:
    "Enter your target take-home, working days, billable hours, expenses, and buffer to compute your minimum viable hourly rate with utilisation scenarios and Indian freelancer market comparisons.",
  category: "Finance tools",
  audience: "Freelancers, consultants, independent contractors, solopreneurs, agencies",
  accent: "#581c87",
  accentSoft: "#f5f3ff",

  metrics: [
    { value: "30%", label: "Typical tax bracket modelled" },
    { value: "70%", label: "Realistic utilisation rate" },
    { value: "5", label: "Rate scenarios computed" },
  ],

  problem: [
    {
      title: "Freelancers price by what feels right, not what the math requires",
      body:
        "If you need Rs 1 lakh take-home but only bill 15 days a month at 6 hours, that is 90 billable hours. Add 30% tax, 20% expenses, 10% bad debt, and your hourly rate needs to be Rs 2000+, not Rs 800.",
    },
    {
      title: "Nobody accounts for vacations, sick days, and dry spells",
      body:
        "22 working days is a myth. After public holidays, sick days, and annual leave, most freelancers have 200-210 billable days per year. Pricing for 260 days means you are subsidising your clients.",
    },
    {
      title: "Indian freelancers undercharge because they compare with salaried pay",
      body:
        "A salaried job at Rs 15 LPA includes PF, gratuity, insurance, office, equipment, and job security. A freelancer earning the same Rs 15 LPA actually earns less than a Rs 10 LPA salaried employee after expenses.",
    },
  ],

  features: [
    {
      title: "Minimum viable hourly rate calculation",
      body:
        "Takes your actual needs (take-home + expenses + tax + buffer) and divides by actual billable hours to give the floor rate below which you lose money.",
    },
    {
      title: "Day rate and monthly rate derived",
      body:
        "Converts hourly to day rate (for project pricing) and monthly rate (for retainers). Shows how each format changes the effective hourly.",
    },
    {
      title: "Utilisation drop scenarios",
      body:
        "Shows what happens to your rate if utilisation drops 10%, 20%, 30%. Most freelancers are at 60-70% utilisation, not 100%. The rate must survive dry months.",
    },
    {
      title: "Indian tax estimate built in",
      body:
        "Models GST (18% on services), income tax (old/new regime slab), and professional tax. Shows effective tax rate so you price above it.",
    },
    {
      title: "Market comparison for Indian freelancers",
      body:
        "Compares your computed rate against typical ranges for web developers, designers, writers, consultants, and other categories in the Indian market.",
    },
    {
      title: "Annual revenue target",
      body:
        "Works backwards from your rate to show total annual revenue needed. Makes it concrete: you need X clients paying Y per month to hit the target.",
    },
  ],

  how: [
    "Enter target monthly take-home, working days, billable hours per day, annual expenses, vacation days, and bad-debt buffer.",
    "FreelanceRate computes your minimum hourly rate, day rate, monthly retainer rate, and annual revenue target.",
    "See utilisation scenarios and compare against Indian market medians to position your pricing.",
  ],

  integrations: ["FlowForge", "Print/PDF", "Freelance platforms"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "For any freelancer figuring out their rate.",
      features: ["Rate calculation", "Utilisation scenarios", "Tax estimation", "Market comparison", "Annual target"],
      cta: "Calculate my rate",
      monthlyRuns: 50,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Pro",
      price: "$9",
      period: "/mo",
      blurb: "For agencies and freelance teams.",
      features: [
        "REST API + MCP server access",
        "Multi-role pricing",
        "Client proposal generator",
        "Rate revision tracking",
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
      blurb: "For freelance marketplaces and staffing platforms.",
      features: [
        "Volume pricing",
        "Self-hosted Docker image",
        "Market rate database access",
        "SSO and audit log",
        "White-label embedding",
      ],
      cta: "Talk to us",
      monthlyRuns: Number.POSITIVE_INFINITY,
      apiAccess: true,
      rateLimitPerMin: 600,
    },
  ],

  faq: [
    {
      q: "Does this include GST?",
      a: "Yes. If your annual revenue exceeds Rs 20 lakh (Rs 10 lakh for some states), you must register for GST and charge 18% on services. The calculator models this and shows your rate both inclusive and exclusive of GST.",
    },
    {
      q: "What is a realistic utilisation rate?",
      a: "60-75% for solo freelancers. That means if you have 20 working days in a month, only 12-15 are billable. The rest goes to marketing, admin, proposals, learning, and unbilled revisions. Agencies target 70-80%.",
    },
    {
      q: "Should I charge hourly or project-based?",
      a: "Know your hourly rate even if you bill by project. It lets you estimate project quotes accurately. Hourly works for ongoing/maintenance work. Fixed project pricing works when scope is clear and you can be efficient.",
    },
    {
      q: "What expenses should I include?",
      a: "Everything your employer would pay if you were salaried: laptop (amortised over 3 years), internet, phone, software subscriptions, coworking space, health insurance, professional development. Most freelancers undercount by 30-40%.",
    },
    {
      q: "How does the market comparison work?",
      a: "Based on published rate surveys and platform data for Indian freelancers across categories (tech, design, writing, consulting, marketing). Shown as ranges because rates vary wildly by experience, niche, and client type.",
    },
  ],

  inputs: [
    {
      name: "targetTakeHome",
      label: "Target monthly take-home (Rs)",
      type: "text",
      required: true,
      placeholder: "100000",
      help: "Net amount you want in hand after all deductions. This is your salary equivalent.",
    },
    {
      name: "workingDays",
      label: "Working days per month",
      type: "text",
      required: true,
      placeholder: "22",
      help: "Total days you are available to work (not necessarily billable).",
    },
    {
      name: "billableHours",
      label: "Billable hours per day",
      type: "text",
      required: true,
      placeholder: "6",
      help: "Hours you can actually bill clients. 6-7 is realistic; 8 is unsustainable.",
    },
    {
      name: "annualExpenses",
      label: "Annual business expenses (Rs)",
      type: "text",
      required: true,
      placeholder: "300000",
      help: "Software, internet, insurance, equipment amortised, coworking, phone, travel. Total per year.",
    },
    {
      name: "vacationDays",
      label: "Vacation/leave days per year",
      type: "text",
      required: true,
      placeholder: "30",
      help: "Include public holidays, sick days, personal leave. 25-35 is typical for India.",
    },
    {
      name: "badDebtBuffer",
      label: "Bad-debt buffer (%)",
      type: "text",
      required: false,
      placeholder: "10",
      help: "Percentage to add for late/non-payment. 5-15% is realistic for Indian clients.",
    },
  ],

  sample: {
    targetTakeHome: "100000",
    workingDays: "22",
    billableHours: "6",
    annualExpenses: "300000",
    vacationDays: "30",
    badDebtBuffer: "10",
  },

  mcpTool: {
    name: "freelance_rate_calculator",
    description:
      "Calculate minimum viable hourly rate for Indian freelancers based on target take-home, expenses, tax, utilisation, and buffer. Returns hourly/day/monthly rates, annual revenue target, utilisation scenarios, and market comparison.",
  },
};
