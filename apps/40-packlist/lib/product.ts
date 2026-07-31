import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "packlist",
  name: "PackList",
  tagline: "The packing list for this trip, this weather, this many days",
  oneLiner:
    "Enter destination type, duration, weather, planned activities, and bag constraints to generate a complete categorised packing list with exact quantities, bag space estimation, and essentials vs nice-to-have marking.",
  category: "Travel tools",
  audience: "Travellers, business travellers, backpackers, digital nomads, travel planners",
  accent: "#3f6212",
  accentSoft: "#f7fee7",

  metrics: [
    { value: "8", label: "Categories covered" },
    { value: "7kg", label: "Carry-on limit enforced" },
    { value: "50+", label: "Items intelligently selected" },
  ],

  problem: [
    {
      title: "Every trip starts with the same question: what do I pack?",
      body:
        "A 3-day beach trip and a 10-day mountain trek need completely different gear. But most people use the same mental checklist and either overpack (checked bag fees) or forget essentials (buying toothpaste at 2am in an airport).",
    },
    {
      title: "Carry-on only requires real math",
      body:
        "7kg cabin bag limit means you cannot pack everything. How many tops for 5 days if you can do laundry on day 3? Do hiking boots fit in a cabin bag? These are answerable questions that nobody answers before zipping up.",
    },
    {
      title: "Activity-specific gear gets forgotten",
      body:
        "Formal dinner means dress shoes and a blazer. Snorkeling means a rash guard and waterproof phone case. Hiking means layers and a headlamp. These items only appear in your mental list when it is too late.",
    },
  ],

  features: [
    {
      title: "Weather-appropriate clothing with exact quantities",
      body:
        "Not just 'bring warm clothes' but exactly how many base layers, mid layers, and outer layers for the temperature range and duration. Quantities adjust for laundry availability.",
    },
    {
      title: "Activity-specific gear lists",
      body:
        "Swimming adds a swimsuit and goggles. Hiking adds layers, boots, and a headlamp. Formal events add specific items by gender. Only what you actually need shows up.",
    },
    {
      title: "Bag space estimation",
      body:
        "Estimates total volume and weight against your bag type (carry-on 7kg/40L vs checked 23kg/80L). Warns if you are overpacking and suggests what to cut.",
    },
    {
      title: "Laundry rules reduce clothes",
      body:
        "If laundry is available every N days, clothing quantities drop accordingly. A 10-day trip with mid-trip laundry needs the same clothes as a 5-day trip.",
    },
    {
      title: "Essentials vs nice-to-have marking",
      body:
        "Every item is tagged as essential (you will be stuck without it) or optional (nice but not critical). When space is tight, cut from the optional list first.",
    },
    {
      title: "Printable checklist format",
      body:
        "Produces a clean categorised checklist you can print, check off items as you pack, and carry as a reference for the return trip to make sure nothing is left behind.",
    },
  ],

  how: [
    "Select destination type (beach/mountain/city/business), duration in days, weather, planned activities, gender, and whether you are packing carry-on only or checked bag.",
    "PackList generates a complete categorised list with exact quantities, adjusted for weather, activities, and laundry availability.",
    "Get a printable checklist with essentials marked, bag space estimate, and suggestions for what to cut if overpacking.",
  ],

  integrations: ["FlowForge", "Print/PDF", "Travel planning apps"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "For anyone who hates forgetting their charger.",
      features: ["Full packing list generation", "Activity-specific gear", "Quantity calculations", "Carry-on optimization", "Printable checklist"],
      cta: "Generate my list",
      monthlyRuns: 50,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Pro",
      price: "$9",
      period: "/mo",
      blurb: "For travel planners and frequent flyers.",
      features: [
        "REST API + MCP server access",
        "Custom item databases",
        "Multi-trip planning",
        "Gear weight tracking",
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
      blurb: "For travel agencies and corporate travel platforms.",
      features: [
        "Volume pricing",
        "Self-hosted Docker image",
        "Destination database integration",
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
      q: "How does it decide clothing quantities?",
      a: "Base formula: underwear = days + 1 spare, tops = days (max 5 without laundry), bottoms = days/2 (max 3). If laundry is available, the effective days drop to the laundry interval + 1. Socks match underwear count. Sleepwear is 1-2 regardless of duration.",
    },
    {
      q: "What is the carry-on weight limit?",
      a: "Most airlines allow 7kg for cabin baggage. Some (like IndiGo and SpiceJet in India) strictly enforce this. The tool uses 7kg/40L as the standard carry-on constraint and flags items that push you over.",
    },
    {
      q: "Does it account for shopping at the destination?",
      a: "No. The list assumes you bring everything you need. If you plan to buy toiletries or basic items at the destination, you can mentally skip those. The essentials marking helps: skip optional items, never skip essentials.",
    },
    {
      q: "What about destination-specific items like adapters?",
      a: "The list includes a universal adapter in electronics for any international destination type. For India-specific travel, Indian-plug adapters are noted. Destination-specific medications (altitude sickness pills for mountains, anti-malarials for certain regions) are included based on destination type.",
    },
    {
      q: "Can I use this for family packing?",
      a: "Currently generates a list for one person. For family trips, run it once per person (adjusting gender and activities) and combine the lists. Shared items (first aid kit, adapter, guidebook) only need one set.",
    },
  ],

  inputs: [
    {
      name: "destinationType",
      label: "Destination type",
      type: "select",
      required: true,
      options: ["Beach", "Mountain", "City", "Business", "Adventure"],
      help: "Determines base clothing style and activity-specific gear.",
    },
    {
      name: "duration",
      label: "Duration (days)",
      type: "text",
      required: true,
      placeholder: "7",
      help: "Number of days including travel days. Determines clothing quantities.",
    },
    {
      name: "weather",
      label: "Expected weather",
      type: "select",
      required: true,
      options: ["Hot (30C+)", "Warm (20-30C)", "Cool (10-20C)", "Cold (0-10C)", "Rainy"],
      help: "Determines layers and weather-specific gear.",
    },
    {
      name: "activities",
      label: "Planned activities (comma-separated)",
      type: "text",
      required: true,
      placeholder: "hiking, swimming, formal dinner, sightseeing",
      help: "Activities determine additional gear. Options: hiking, swimming, snorkeling, formal dinner, business meetings, photography, camping, cycling, yoga, running.",
    },
    {
      name: "gender",
      label: "Gender (for clothing suggestions)",
      type: "select",
      required: true,
      options: ["Male", "Female", "Neutral"],
      help: "Affects clothing item names and formal wear suggestions.",
    },
    {
      name: "bagType",
      label: "Bag type",
      type: "select",
      required: true,
      options: ["Carry-on only (7kg/40L)", "Checked bag (23kg/80L)", "Backpack (15kg/50L)"],
      help: "Determines weight and space limits. Carry-on requires aggressive prioritization.",
    },
    {
      name: "laundryAvailable",
      label: "Laundry available during trip?",
      type: "select",
      required: false,
      options: ["No", "Yes, mid-trip", "Yes, every 3 days"],
      help: "Reduces clothing quantities significantly. Hotel laundry or handwash in sink counts.",
    },
  ],

  sample: {
    destinationType: "Mountain",
    duration: "7",
    weather: "Cool (10-20C)",
    activities: "hiking, photography, sightseeing",
    gender: "Male",
    bagType: "Checked bag (23kg/80L)",
    laundryAvailable: "No",
  },

  mcpTool: {
    name: "packing_list",
    description:
      "Generate a complete categorised packing list with exact quantities based on destination type, duration, weather, planned activities, gender, and bag constraints. Includes bag space estimation, essentials marking, and carry-on optimization.",
  },
};
