import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  // Category default is ledger. A couple planning a wedding is a consumer arriving from
  // a search, not someone who wants a statement.
  design: "brutalist",

  slug: "weddingbudget",
  name: "WeddingBudget",
  tagline: "What an Indian wedding actually costs, by category",
  oneLiner:
    "Enter your city, guest count, and event details to get a realistic total budget broken into 12 categories with city multipliers, season premiums, per-guest costs, and a savings plan timeline working backward from your date.",
  category: "Personal finance",
  audience: "Indian couples and families planning weddings, wedding planners building budgets for clients",
  accent: "#9d174d",
  accentSoft: "#fdf2f8",

  metrics: [
    { value: "12", label: "Budget categories computed" },
    { value: "3", label: "City tiers with validated multipliers" },
    { value: "2-3x", label: "Typical underestimate on decoration" },
  ],

  problem: [
    {
      title: "Everybody quotes the venue and catering, nobody quotes the rest",
      body:
        "Venue and food are maybe 40% of the total. The other 60% arrives as surprises: decoration add-ons, photographer albums, lehenga alterations, guest transport, and a hundred small things that add up to lakhs.",
    },
    {
      title: "Decoration is always 2-3x the initial quote",
      body:
        "The base quote covers structure. Flowers are per-day and per-event. Lighting is extra. The mandap is extra. By the time you see the final bill, it is 2-3x what was discussed.",
    },
    {
      title: "Season and city change everything",
      body:
        "A November wedding in Mumbai costs 40-60% more than the same wedding in July in Jaipur. Nobody factors this when comparing quotes across families.",
    },
  ],

  features: [
    {
      title: "12-category budget breakdown",
      body:
        "Venue, catering, decoration, photography, clothing, jewellery, invitations, entertainment, makeup, transport, accommodation, and miscellaneous. Each with per-guest and per-event splits.",
    },
    {
      title: "City tier multipliers",
      body:
        "Metro (Mumbai, Delhi, Bangalore), Tier-2 (Jaipur, Lucknow, Pune), and Tier-3 pricing with validated cost differences across every category.",
    },
    {
      title: "Season premium calculation",
      body:
        "Peak season (Nov-Feb) carries a 25-40% premium on venue and catering. Off-peak saves significantly but limits vendor availability.",
    },
    {
      title: "Underestimate warnings",
      body:
        "Flags categories that families consistently underbudget: decoration (2-3x), photography packages (2x with albums/pre-wedding), and miscellaneous (always 10-15% of total).",
    },
    {
      title: "Per-event breakdown",
      body:
        "Mehendi, sangeet, wedding, and reception each have different cost profiles. A 4-event wedding is not 4x a single event.",
    },
    {
      title: "Savings plan timeline",
      body:
        "Works backward from your wedding month to show how much to save per month starting now, with payment milestones for bookings.",
    },
  ],

  how: [
    "Enter your city tier, guest count, number of events, food preference, venue type, and season.",
    "WeddingBudget computes a realistic total across 12 categories with city and season adjustments, plus warnings on what people always underestimate.",
    "Use the savings timeline to plan monthly deposits and know when advance payments are typically due.",
  ],

  integrations: ["FlowForge", "Google Sheets", "Excel export"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "For getting a realistic total before you start planning.",
      features: ["Unlimited budget calculations", "12-category breakdown", "Savings timeline", "Underestimate warnings"],
      cta: "Calculate your budget",
      monthlyRuns: 50,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Planner",
      price: "$29",
      period: "/mo",
      blurb: "For wedding planners managing multiple client budgets.",
      features: [
        "REST API + MCP server access",
        "Custom category rates",
        "Client-branded exports",
        "Vendor cost database",
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
      blurb: "For venue chains and wedding marketplaces.",
      features: [
        "Volume pricing",
        "Self-hosted Docker image",
        "Custom city multipliers",
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
      q: "Where do these cost estimates come from?",
      a: "Aggregated from wedding planner rate cards across cities, WedMeGood/Shaadi vendor pricing, and verified against 2024-2025 actual wedding budgets shared in planning communities. They are median estimates, not minimum or aspirational.",
    },
    {
      q: "Why is decoration always more than the quote?",
      a: "The initial quote typically covers structural setup. Fresh flowers are charged per event per day. Specialty lighting, mandap upgrades, stage extensions, and aisle decor are all add-ons that appear only in the detailed estimate after the first meeting. Budget 2-3x the initial verbal quote.",
    },
    {
      q: "How much does season really affect price?",
      a: "Peak season (November to February) carries 25-40% premium on venue and catering because demand exceeds supply. Muhurat dates within peak season add another 10-15%. Weekday weddings in off-peak can save 30-40% on venue alone.",
    },
    {
      q: "Should I budget for miscellaneous separately?",
      a: "Always. In every wedding budget we have seen, miscellaneous (tips, last-minute additions, forgotten items, pandit fees, emergency purchases) runs 10-15% of the total. Not budgeting for it means overspending elsewhere.",
    },
    {
      q: "Is non-veg really that much more expensive?",
      a: "Yes. Non-veg catering in metros runs 1.4-1.6x vegetarian per plate for a comparable spread. The premium is lower in Tier-2 cities but still significant at scale.",
    },
  ],

  inputs: [
    {
      name: "cityTier",
      label: "City tier",
      type: "select",
      required: true,
      options: ["Metro", "Tier2", "Tier3"],
      help: "Metro = Mumbai/Delhi/Bangalore/Chennai. Tier2 = Jaipur/Lucknow/Pune/Hyderabad. Tier3 = smaller cities.",
    },
    {
      name: "guestCount",
      label: "Guest count",
      type: "text",
      required: true,
      placeholder: "350",
      help: "Total number of guests across your largest event.",
    },
    {
      name: "events",
      label: "Number of events",
      type: "select",
      required: true,
      options: ["1", "2", "3", "4"],
      help: "How many events: mehendi, sangeet, wedding, reception.",
    },
    {
      name: "foodType",
      label: "Food preference",
      type: "select",
      required: true,
      options: ["Vegetarian", "Non-Vegetarian"],
      help: "Main menu preference for catering cost calculation.",
    },
    {
      name: "venueType",
      label: "Venue preference",
      type: "select",
      required: true,
      options: ["Hotel", "Farmhouse", "Banquet"],
      help: "Type of venue for the main wedding event.",
    },
    {
      name: "season",
      label: "Season",
      type: "select",
      required: true,
      options: ["Peak (Nov-Feb)", "Off-Peak"],
      help: "Peak season (November to February) carries a significant premium.",
    },
    {
      name: "monthsAway",
      label: "Months until wedding",
      type: "text",
      required: false,
      placeholder: "12",
      help: "How many months until the wedding date. Used for savings plan.",
    },
  ],

  sample: {
    cityTier: "Metro",
    guestCount: "350",
    events: "4",
    foodType: "Non-Vegetarian",
    venueType: "Hotel",
    season: "Peak (Nov-Feb)",
    monthsAway: "10",
  },

  mcpTool: {
    name: "weddingbudget_calculate",
    description:
      "Calculate a realistic Indian wedding budget broken into 12 categories with city-tier multipliers, season premiums, per-guest and per-event breakdowns, underestimate warnings, and a monthly savings plan timeline.",
  },
};
