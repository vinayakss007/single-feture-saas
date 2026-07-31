import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "propertytax",
  name: "PropertyTax",
  tagline: "Calculate your property tax before the notice arrives",
  oneLiner:
    "Enter your property details and city to see the exact property tax computation step by step with the rates cited, so you can verify the municipal bill or prepare before it arrives.",
  category: "Real estate & compliance",
  audience: "Property owners in Indian metros who want to verify their property tax bill or calculate it before assessment",
  accent: "#1e3a5f",
  accentSoft: "#eff6ff",

  metrics: [
    { value: "7", label: "Major cities with full tax computation" },
    { value: "3", label: "Distinct methods: capital value, unit area, ARV" },
    { value: "Rs 0", label: "Cost to verify before paying" },
  ],

  problem: [
    {
      title: "Each city uses a different method and nobody explains which",
      body:
        "Mumbai uses capital value, Bengaluru uses unit area value, Delhi uses unit area with usage factor. The same property assessed under a different method would produce a completely different number.",
    },
    {
      title: "Municipal bills arrive without showing the computation",
      body:
        "You get a demand notice with a final amount. The formula, rates, and factors used are not shown, making it impossible to verify without visiting the ward office.",
    },
    {
      title: "Rebates and exemptions are not applied automatically",
      body:
        "Self-occupied rebates, senior citizen discounts, and early payment concessions exist in most cities but are not applied unless you claim them. You need to know they exist first.",
    },
  ],

  features: [
    {
      title: "City-specific computation method",
      body:
        "Mumbai capital value method, Bengaluru unit area value, Delhi unit area with usage and age factors, Chennai annual rental value, Hyderabad capital value, Pune capital value, Kolkata unit area. Each implemented per the municipal act.",
    },
    {
      title: "Step-by-step rate citation",
      body:
        "Every multiplier, factor, and rate used is shown with its source so you can verify against the published rate card.",
    },
    {
      title: "Rebate and exemption identification",
      body:
        "Identifies applicable rebates: self-occupied discount, senior citizen concession, early payment rebate, and green building incentives where available.",
    },
    {
      title: "Year-over-year comparison",
      body:
        "Shows how the tax changes if you pay early vs late, and what the penalty would be for delayed payment.",
    },
  ],

  how: [
    "Select your city and enter property details: type, area, age, floor, usage.",
    "See the computation method your city uses.",
    "Review the step-by-step calculation with rates cited.",
    "Check applicable rebates and the final amount due.",
  ],

  integrations: [
    "Tax computation summary as plain text",
    "JSON output for property management tools",
    "REST API for real estate platforms",
    "MCP server for property assistant bots",
    "Self-hosted Docker for property management companies",
  ],

  pricing: [
    {
      name: "Free",
      price: "\u20B90",
      period: "forever",
      blurb: "For the property owner who wants to verify.",
      features: [
        "25 calculations a month",
        "Full step-by-step computation",
        "Rebate identification",
        "Rate citation",
      ],
      cta: "Calculate tax",
      monthlyRuns: 25,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Pro",
      price: "\u20B9399",
      period: "/month",
      blurb: "For tax consultants and property managers.",
      features: [
        "5,000 calculations a month",
        "REST API and MCP server",
        "Bulk property computation",
        "Multi-city support",
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
      blurb: "For municipalities and large property portfolios.",
      features: [
        "Unlimited calculations",
        "Self-hosted Docker image",
        "Custom rate card updates",
        "Batch assessment",
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
      q: "Which cities are supported?",
      a: "Mumbai (BMC), Bengaluru (BBMP), Delhi (MCD), Chennai (GCC), Hyderabad (GHMC), Pune (PMC), and Kolkata (KMC). Each uses the published rate card and computation method for that municipality.",
    },
    {
      q: "How accurate is this?",
      a: "It applies the published rates and formulas. Actual assessment may differ if the municipality has updated rates mid-year, or if your property has special characteristics (heritage, irregular plot). Treat it as a verification tool, not a substitute for the official demand.",
    },
    {
      q: "What is the difference between capital value and unit area value?",
      a: "Capital value (Mumbai, Pune, Hyderabad) taxes a percentage of the property's market value. Unit area value (Bengaluru, Delhi, Kolkata) multiplies carpet area by a per-sqft rate adjusted for location, usage, and age. Annual rental value (Chennai) taxes based on estimated rental income.",
    },
    {
      q: "Are rebates applied automatically?",
      a: "The tool identifies which rebates you are eligible for and computes the tax both with and without them. You still need to claim them with the municipality -- most are not auto-applied.",
    },
    {
      q: "What about vacant land?",
      a: "Currently supports built-up properties only. Vacant land tax in most cities is a simple area-based charge with a different rate card.",
    },
    {
      q: "Can I use this if I got a demand notice?",
      a: "Yes. Enter your property details and compare the computed amount against the notice. If there is a significant difference, you have grounds to file an objection during the objection period.",
    },
  ],

  inputs: [
    {
      name: "city",
      label: "City",
      type: "select",
      required: true,
      options: ["Mumbai", "Bengaluru", "Delhi", "Chennai", "Hyderabad", "Pune", "Kolkata"],
    },
    {
      name: "propertyType",
      label: "Property type",
      type: "select",
      required: true,
      options: ["Flat / Apartment", "Independent house", "Row house / Villa"],
    },
    {
      name: "builtUpArea",
      label: "Built-up area (sq ft)",
      type: "text",
      required: true,
      placeholder: "1200",
      help: "Total built-up area including walls. Usually on your sale deed or society records.",
    },
    {
      name: "propertyAge",
      label: "Property age (years)",
      type: "text",
      required: true,
      placeholder: "8",
      help: "Age of the building from completion certificate date.",
    },
    {
      name: "usage",
      label: "Usage",
      type: "select",
      required: true,
      options: ["Residential - Self occupied", "Residential - Rented", "Commercial", "Mixed use"],
    },
    {
      name: "floor",
      label: "Floor",
      type: "select",
      required: true,
      options: ["Ground", "1-4", "5-10", "11-15", "16+"],
    },
    {
      name: "occupancy",
      label: "Occupancy status",
      type: "select",
      required: true,
      options: ["Occupied", "Vacant"],
    },
  ],

  sample: {
    city: "Mumbai",
    propertyType: "Flat / Apartment",
    builtUpArea: "1200",
    propertyAge: "8",
    usage: "Residential - Self occupied",
    floor: "5-10",
    occupancy: "Occupied",
  },

  mcpTool: {
    name: "property_tax_calculate",
    description:
      "Calculate property tax for a property in an Indian metro city. Takes city, property type, built-up area in square feet, property age in years, usage type, floor, and occupancy status. Returns the step-by-step tax computation using the city-specific method (capital value, unit area value, or annual rental value) with all rates cited, applicable rebates, and the final tax payable.",
  },
};
