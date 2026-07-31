import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "waterleak",
  name: "WaterLeak",
  tagline: "Find the leak from your water meter readings",
  oneLiner:
    "Enter meter readings over several days with household size to detect leaks, quantify litres lost per day, estimate monthly cost, and identify the likely leak type from the consumption pattern.",
  category: "Utility tools",
  audience: "Homeowners, apartment residents, facility managers, plumbers, water utility engineers",
  accent: "#164e63",
  accentSoft: "#fef2f2",

  metrics: [
    { value: "135", label: "LPCD Indian benchmark" },
    { value: "5", label: "Leak types identified" },
    { value: "500+", label: "Litres/day typical pipe leak" },
  ],

  problem: [
    {
      title: "A water bill doubles and you have no idea why",
      body:
        "Underground pipe leaks, running toilets, and dripping taps waste 200-1000 litres per day. That is Rs 500-2000 extra per month in Mumbai. Most people only notice when the bill arrives, weeks after the leak started.",
    },
    {
      title: "You cannot see most leaks",
      body:
        "A running toilet cistern wastes 400 litres/day silently. An underground pipe leak shows no visible water. The only reliable indicator is the meter reading pattern: steady overnight consumption means a leak.",
    },
    {
      title: "Plumbers guess instead of diagnosing",
      body:
        "Without data, a plumber checks visible taps first (rarely the problem). With meter readings showing 200 L/day overnight consumption, they can go straight to the toilet cistern. Data saves diagnostic time and money.",
    },
  ],

  features: [
    {
      title: "Daily consumption vs benchmark comparison",
      body:
        "Computes litres per capita per day and compares against the Indian standard of 135 LPCD. Consumption above 150% of benchmark triggers a leak investigation.",
    },
    {
      title: "Anomaly detection from reading pattern",
      body:
        "Identifies sudden jumps (new leak started), steady overnight consumption (running toilet/pipe), and gradual increases (worsening leak) from the reading sequence.",
    },
    {
      title: "Leak type identification",
      body:
        "Matches the excess consumption pattern to known leak profiles: dripping tap (30-50 L/day), running toilet (200-400 L/day), underground pipe (500+ L/day), irrigation leak, or overflow.",
    },
    {
      title: "Monthly cost estimation",
      body:
        "Calculates the rupee cost of the leak per month at local water rates. Makes invisible waste tangible: a running toilet costs Rs 300-600/month in most Indian cities.",
    },
    {
      title: "What to check first",
      body:
        "Prioritised diagnostic steps based on the leak profile: toilet cistern test (food colouring), visible tap inspection, meter overnight test, and when to call a plumber for underground leak detection.",
    },
  ],

  how: [
    "Enter meter readings for several consecutive days (date and reading in kilolitres or litres), household size, and basic usage info.",
    "WaterLeak computes daily consumption, compares to benchmarks, detects anomalies, and identifies the likely leak type.",
    "Get estimated litres lost, monthly cost, and prioritised steps to find and fix the leak.",
  ],

  integrations: ["FlowForge", "Print/PDF", "Water utilities"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "For any household suspicious of a water leak.",
      features: ["Leak detection analysis", "Daily consumption tracking", "Leak type identification", "Cost estimation", "Fix priority list"],
      cta: "Analyse my readings",
      monthlyRuns: 50,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Pro",
      price: "$9",
      period: "/mo",
      blurb: "For facility managers and housing societies.",
      features: [
        "REST API + MCP server access",
        "Multi-unit monitoring",
        "Historical trend analysis",
        "Alert thresholds",
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
      blurb: "For water utilities and smart meter providers.",
      features: [
        "Volume pricing",
        "Self-hosted Docker image",
        "SCADA/IoT integration",
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
      q: "What readings should I enter?",
      a: "Take your water meter reading at the same time each day (morning is best) for at least 5-7 days. Record the date and the meter number. If your meter shows kilolitres (kL), enter as-is. If it shows litres, enter that. More days = better detection.",
    },
    {
      q: "How much is 135 LPCD?",
      a: "135 litres per capita per day is the Indian government benchmark for domestic water supply. It covers drinking, cooking, bathing, washing, and flushing. A family of 4 should use about 540 litres/day or 16.2 kL/month. Anything significantly above this suggests waste or leaks.",
    },
    {
      q: "Can a running toilet really waste 400 litres per day?",
      a: "Yes. A toilet cistern that continuously trickles into the bowl (often silent) runs at about 0.5-1 litre per minute. That is 720-1440 litres per day. Even a slow trickle at 0.2 L/min wastes 288 litres daily. The food-colouring test confirms this in 15 minutes.",
    },
    {
      q: "What is the overnight meter test?",
      a: "Note your meter reading before bed. Do not use any water overnight (no flushing, no washing machine timer). Check the meter first thing in the morning. Any movement means a leak somewhere between the meter and your taps. This is the simplest leak confirmation test.",
    },
    {
      q: "How accurate are the cost estimates?",
      a: "Costs are based on typical municipal water tariffs for Indian cities (Rs 5-25 per kilolitre depending on slab). Actual rates vary by city, slab, and whether you have a borewell supplement. The estimate shows the ballpark monthly cost of the leak.",
    },
  ],

  inputs: [
    {
      name: "readings",
      label: "Meter readings (date:reading per line)",
      type: "textarea",
      required: true,
      placeholder: "2024-01-01:1245.3\n2024-01-02:1246.1\n2024-01-03:1247.2\n2024-01-04:1248.8\n2024-01-05:1249.5\n2024-01-06:1251.2\n2024-01-07:1252.0",
      help: "One reading per line as date:reading (in kilolitres). At least 3 readings needed. Take readings at the same time daily.",
      rows: 6,
    },
    {
      name: "householdSize",
      label: "Household size (persons)",
      type: "text",
      required: true,
      placeholder: "4",
      help: "Number of people living in the household. Used to calculate per-capita consumption.",
    },
    {
      name: "usagePattern",
      label: "Usage pattern",
      type: "select",
      required: true,
      options: [
        "Normal (no washing machine daily)",
        "Heavy (daily washing machine, garden)",
        "Minimal (working couple, away daytime)",
      ],
      help: "Helps adjust baseline expectation. Heavy use households legitimately consume more.",
    },
  ],

  sample: {
    readings: "2024-01-01:1245.3\n2024-01-02:1246.1\n2024-01-03:1247.2\n2024-01-04:1248.8\n2024-01-05:1249.5\n2024-01-06:1251.2\n2024-01-07:1252.0",
    householdSize: "4",
    usagePattern: "Normal (no washing machine daily)",
  },

  mcpTool: {
    name: "water_leak_detector",
    description:
      "Analyse water meter readings to detect leaks, compute daily consumption against per-capita benchmarks, identify leak type (dripping tap, running toilet, underground pipe), estimate litres lost and monthly cost in rupees.",
  },
};
