import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "solarpayback",
  name: "SolarPayback",
  tagline: "Will rooftop solar actually pay for itself, and when",
  oneLiner:
    "Enter your electricity bill and rooftop details to compute the payback period, annual savings, IRR, and the exact month your system breaks even after PM Surya Ghar subsidy.",
  category: "Energy & sustainability",
  audience: "Indian homeowners considering rooftop solar who want a realistic financial picture before signing a vendor quote",
  accent: "#16a34a",
  accentSoft: "#f0fdf4",

  metrics: [
    { value: "4-6 yrs", label: "Typical payback period with subsidy" },
    { value: "40%", label: "PM Surya Ghar subsidy up to 3 kW" },
    { value: "25 yrs", label: "Panel lifespan generating returns" },
  ],

  problem: [
    {
      title: "Vendor quotes show best-case numbers that never include degradation",
      body:
        "Solar vendors project savings at year-one generation for 25 years, ignoring the 0.5-0.7% annual panel degradation. The real payback is longer than their glossy PDF suggests.",
    },
    {
      title: "Subsidy eligibility is confusing and often overstated",
      body:
        "PM Surya Ghar gives 40% up to 3 kW and 20% for 3-10 kW, but installers quote a flat percentage on the full system. You need the slab math to see what you actually get.",
    },
    {
      title: "Nobody compares against the boring alternative",
      body:
        "Money not spent on panels could sit in a 7% FD. Unless solar beats that after-tax return, it is not the obvious choice the industry claims.",
    },
  ],

  features: [
    {
      title: "System size computed from your actual bill",
      body:
        "Your monthly bill translates to kWh consumption using your state tariff. That consumption, divided by your location's peak sun hours, gives the system size you actually need.",
    },
    {
      title: "Generation estimated from area, orientation and state irradiance",
      body:
        "India's solar irradiance varies from 3.5 to 6.5 kWh/m2/day across states. Combined with your rooftop area and orientation, this gives a realistic kWh figure rather than the vendor's ideal.",
    },
    {
      title: "Subsidy computed slab by slab",
      body:
        "PM Surya Ghar 40% for the first 3 kW, 20% for 3-10 kW. The exact rupee figure depends on system size and the per-kW benchmark cost.",
    },
    {
      title: "Month-by-month breakeven timeline",
      body:
        "Not just a payback year but the actual month your cumulative savings overtake total cost, accounting for degradation and tariff inflation.",
    },
    {
      title: "IRR compared against a fixed deposit",
      body:
        "The internal rate of return on solar versus what a 7% post-tax FD would have done with the same capital over the same period.",
    },
  ],

  how: [
    "Enter your monthly electricity bill amount and state.",
    "Add your rooftop area, orientation, and connection type.",
    "See the system size, subsidy, payback month, and IRR instantly.",
    "Compare against a fixed deposit to decide whether to go ahead.",
  ],

  integrations: [
    "PDF report for sharing with family or vendor",
    "JSON output for financial planning tools",
    "REST API for solar marketplace platforms",
    "MCP server so an assistant can answer solar questions with real numbers",
    "Self-hosted Docker for installer companies",
  ],

  pricing: [
    {
      name: "Free",
      price: "\u20B90",
      period: "forever",
      blurb: "For the homeowner exploring solar.",
      features: [
        "25 calculations a month",
        "Full payback timeline",
        "Subsidy computation",
        "FD comparison",
      ],
      cta: "Calculate payback",
      monthlyRuns: 25,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Pro",
      price: "\u20B9499",
      period: "/month",
      blurb: "For solar consultants running numbers for clients.",
      features: [
        "5,000 calculations a month",
        "REST API and MCP server",
        "Bulk CSV upload",
        "Custom tariff rates",
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
      blurb: "For solar installation companies and marketplaces.",
      features: [
        "Unlimited calculations",
        "Self-hosted Docker image",
        "White-label reports",
        "Custom state tariff data",
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
      q: "How accurate is the generation estimate?",
      a: "It uses MNRE-published irradiance data for each state and adjusts for orientation. Real output depends on shading, dust and inverter efficiency, so treat it as a planning figure within 10-15% of reality.",
    },
    {
      q: "Does this include the PM Surya Ghar subsidy?",
      a: "Yes. It applies the slab structure: 40% of benchmark cost for the first 3 kW, 20% for capacity between 3 and 10 kW. The benchmark cost per kW is taken from the latest MNRE notification.",
    },
    {
      q: "What about net metering?",
      a: "If you indicate net metering is available, excess generation is credited at your state's feed-in rate. Without it, only self-consumed units are valued, which lengthens payback.",
    },
    {
      q: "Why compare against a fixed deposit?",
      a: "Because the alternative to spending money on panels is not spending it. A 7% FD is the default risk-free option. If solar does not beat it, you need a non-financial reason to go ahead.",
    },
    {
      q: "Does panel degradation matter?",
      a: "Yes. Panels degrade 0.5-0.7% per year. Over 25 years that is 12-17% less output than year one. Vendors quoting year-one generation over 25 years overstate lifetime savings by lakhs.",
    },
    {
      q: "What if my rooftop is partially shaded?",
      a: "Enter only the unshaded usable area. Shade on even one panel in a string reduces the entire string output, so the effective area is smaller than the total roof area.",
    },
  ],

  inputs: [
    {
      name: "monthlyBill",
      label: "Monthly electricity bill (Rs)",
      type: "text",
      required: true,
      placeholder: "3500",
      help: "Your average monthly electricity bill in rupees.",
    },
    {
      name: "state",
      label: "State",
      type: "select",
      required: true,
      options: [
        "Maharashtra",
        "Karnataka",
        "Tamil Nadu",
        "Delhi",
        "Rajasthan",
        "Gujarat",
        "Uttar Pradesh",
        "Madhya Pradesh",
        "Telangana",
        "Andhra Pradesh",
        "Kerala",
        "West Bengal",
        "Punjab",
        "Haryana",
      ],
    },
    {
      name: "rooftopArea",
      label: "Available rooftop area (sq ft)",
      type: "text",
      required: true,
      placeholder: "300",
      help: "Unshaded usable area for panel installation.",
    },
    {
      name: "orientation",
      label: "Roof orientation",
      type: "select",
      required: true,
      options: ["South facing", "East facing", "West facing", "North facing", "Flat roof"],
      help: "South-facing is ideal in India. Flat roofs allow tilt mounting.",
    },
    {
      name: "connectionType",
      label: "Connection type",
      type: "select",
      required: true,
      options: ["Single phase", "Three phase"],
    },
    {
      name: "netMetering",
      label: "Net metering available?",
      type: "select",
      required: true,
      options: ["Yes", "No"],
      help: "Whether your DISCOM supports net metering for rooftop solar.",
    },
  ],

  sample: {
    monthlyBill: "3500",
    state: "Maharashtra",
    rooftopArea: "300",
    orientation: "South facing",
    connectionType: "Single phase",
    netMetering: "Yes",
  },

  mcpTool: {
    name: "solar_payback_calculate",
    description:
      "Calculate rooftop solar payback period for an Indian homeowner. Takes monthly electricity bill, state, rooftop area, orientation, connection type, and net metering availability. Returns system size, generation estimate, PM Surya Ghar subsidy amount, payback month, annual savings, IRR, and comparison against fixed deposit returns.",
  },
};
