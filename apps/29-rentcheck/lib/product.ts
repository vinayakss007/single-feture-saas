import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "rentcheck",
  name: "RentCheck",
  tagline: "Is this rent fair for this area, and what to negotiate",
  oneLiner:
    "Enter a property's details and the quoted rent to see whether it falls within the fair range for that locality, what to negotiate based on floor, age and furnishing, and the clauses to add to your agreement.",
  category: "Real estate & housing",
  audience: "Tenants in Indian metros evaluating a rental property who need data to negotiate, not just a gut feeling",
  accent: "#7c2d12",
  accentSoft: "#fff7ed",

  metrics: [
    { value: "15-20%", label: "Average overpayment above fair market rent" },
    { value: "8", label: "Indian metros with locality-level benchmarks" },
    { value: "5 min", label: "To know your negotiating position" },
  ],

  problem: [
    {
      title: "Landlords quote rent based on what the last tenant paid, plus inflation",
      body:
        "There is no transparent market rate. Each landlord adds 10% to whatever worked before, regardless of whether the property justifies it. Tenants have no counter-data.",
    },
    {
      title: "Floor, age, and furnishing premiums are applied inconsistently",
      body:
        "A ground-floor flat in a 20-year-old building should rent for significantly less than a 7th-floor flat in a new one. But quoted rents often ignore these factors entirely.",
    },
    {
      title: "Agreements are written by the landlord and miss tenant protections",
      body:
        "Standard rent agreements in India omit maintenance escalation caps, painting responsibility clarity, lock-in symmetry, and security deposit return timelines.",
    },
  ],

  features: [
    {
      title: "Fair rent range from locality benchmarks",
      body:
        "Computed from a bundled dataset of Indian metro rental benchmarks by city, locality, BHK, and furnishing status. Shows where the quoted rent falls in the distribution.",
    },
    {
      title: "Rent-to-income ratio check",
      body:
        "Shows what salary would make this rent affordable at the recommended 30% ratio, so you can judge whether you are stretching.",
    },
    {
      title: "Negotiation points based on property specifics",
      body:
        "Every weakness of the property is a rupee discount: high floor without lift, old building, unfurnished, north-facing, ground floor noise. Each is quantified.",
    },
    {
      title: "Agreement clauses to add",
      body:
        "Specific clauses for maintenance escalation cap, painting at exit, security deposit return timeline, lock-in symmetry, and subletting rights that protect the tenant.",
    },
    {
      title: "Comparison against ownership cost",
      body:
        "The implicit yield tells you whether renting is rational for this property or whether ownership economics mean the landlord is desperate.",
    },
  ],

  how: [
    "Enter the city, locality, BHK, and property details.",
    "Add the quoted rent and any maintenance charges.",
    "See the fair range and where the quote falls.",
    "Get negotiation points and agreement clauses to use.",
  ],

  integrations: [
    "Negotiation brief as plain text to share with broker",
    "JSON output for property comparison tools",
    "REST API for rental platforms needing fair-rent context",
    "MCP server so an assistant can evaluate a listing",
    "Self-hosted Docker for tenant advocacy organisations",
  ],

  pricing: [
    {
      name: "Free",
      price: "\u20B90",
      period: "forever",
      blurb: "For the flat you are about to sign for.",
      features: [
        "25 checks a month",
        "Fair rent range",
        "Negotiation points",
        "Agreement clauses",
      ],
      cta: "Check this rent",
      monthlyRuns: 25,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Pro",
      price: "\u20B9449",
      period: "/month",
      blurb: "For brokers and relocation consultants.",
      features: [
        "5,000 checks a month",
        "REST API and MCP server",
        "Bulk listing evaluation",
        "Custom locality data",
        "Email support",
      ],
      cta: "Start Pro",
      highlight: true,
      monthlyRuns: 5_000,
      apiAccess: true,
      rateLimitPerMin: 120,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      blurb: "For rental platforms and corporate relocation.",
      features: [
        "Unlimited checks",
        "Self-hosted Docker image",
        "Custom benchmark data integration",
        "White-label reports",
        "SLA and dedicated support",
      ],
      cta: "Talk to us",
      monthlyRuns: Number.POSITIVE_INFINITY,
      apiAccess: true,
      rateLimitPerMin: 600,
    },
  ],

  faq: [
    {
      q: "How is the fair rent range calculated?",
      a: "From a bundled dataset of rental benchmarks across Indian metros, segmented by city, locality tier, BHK, and furnishing status. The range represents the 25th to 75th percentile of recent transactions in comparable properties.",
    },
    {
      q: "Which cities are covered?",
      a: "Mumbai, Bengaluru, Delhi NCR, Chennai, Hyderabad, Pune, Kolkata, and Ahmedabad. Within each city, localities are grouped into tiers based on average rental rates.",
    },
    {
      q: "Can the landlord refuse to add clauses?",
      a: "Yes, but that tells you something. A landlord who refuses a 30-day security deposit return clause or a maintenance escalation cap is signalling how disputes will go. You can still sign, but with that information.",
    },
    {
      q: "What about broker fees?",
      a: "Broker fees are a separate cost not included in the rent analysis, but the negotiation section notes when the total move-in cost (deposit + brokerage + first month) is unusually high for the area.",
    },
    {
      q: "Is this legally binding?",
      a: "No. It is market intelligence and suggested contract language, not a valuation certificate or legal opinion. The agreement clauses are standard protective language but should be reviewed by a lawyer for high-value leases.",
    },
    {
      q: "How current is the data?",
      a: "The benchmark dataset is updated periodically and represents recent market conditions. Rental markets move slowly enough that the ranges remain relevant for 6-12 months, unlike sale prices.",
    },
  ],

  inputs: [
    {
      name: "city",
      label: "City",
      type: "select",
      required: true,
      options: ["Mumbai", "Bengaluru", "Delhi NCR", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad"],
    },
    {
      name: "locality",
      label: "Locality / area",
      type: "text",
      required: true,
      placeholder: "Koramangala",
      help: "The neighbourhood or area name. Used to determine the locality tier.",
    },
    {
      name: "bhk",
      label: "BHK",
      type: "select",
      required: true,
      options: ["1 BHK", "2 BHK", "3 BHK", "4 BHK"],
    },
    {
      name: "furnished",
      label: "Furnishing",
      type: "select",
      required: true,
      options: ["Unfurnished", "Semi-furnished", "Fully furnished"],
    },
    {
      name: "floor",
      label: "Floor",
      type: "select",
      required: true,
      options: ["Ground", "1-3", "4-7", "8-12", "13+"],
      help: "Higher floors command a premium in lifts buildings, a discount without.",
    },
    {
      name: "propertyAge",
      label: "Property age",
      type: "select",
      required: true,
      options: ["Under 5 years", "5-10 years", "10-20 years", "Over 20 years"],
    },
    {
      name: "rentQuoted",
      label: "Rent quoted (Rs/month)",
      type: "text",
      required: true,
      placeholder: "28000",
    },
    {
      name: "maintenance",
      label: "Maintenance charges (Rs/month)",
      type: "text",
      placeholder: "3500",
      help: "Monthly society maintenance, if separate from rent.",
    },
  ],

  sample: {
    city: "Bengaluru",
    locality: "Koramangala",
    bhk: "2 BHK",
    furnished: "Semi-furnished",
    floor: "4-7",
    propertyAge: "5-10 years",
    rentQuoted: "32000",
    maintenance: "4000",
  },

  mcpTool: {
    name: "rent_check_evaluate",
    description:
      "Evaluate whether a quoted rent is fair for an Indian metro locality. Takes city, locality, BHK, furnishing, floor, property age, quoted rent, and maintenance. Returns fair rent range, where the quote falls, rent-to-income ratio, negotiation points with rupee discounts, and agreement clauses to add for tenant protection.",
  },
};
