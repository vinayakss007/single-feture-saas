import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "macroplate",
  name: "MacroPlate",
  tagline: "Hit your protein target from Indian food you actually eat",
  oneLiner:
    "Enter your daily protein target, diet type, meals per day, and budget to get a meal plan from Indian foods hitting the protein goal while respecting preferences and cost constraints.",
  category: "Nutrition tools",
  audience: "Fitness enthusiasts, bodybuilders, vegetarians seeking protein, dietitians, gym trainers",
  accent: "#052e16",
  accentSoft: "#f7fee7",

  metrics: [
    { value: "40+", label: "Indian foods in database" },
    { value: "7g", label: "Dal protein per bowl (not 20g)" },
    { value: "100%", label: "Protein target achievable" },
  ],

  problem: [
    {
      title: "Indians overestimate protein in dal and underestimate the gap",
      body:
        "One bowl of dal (150ml cooked) has only 7g protein, not 20g as commonly believed. To hit 100g/day vegetarian, you need strategic combinations of paneer, curd, eggs, soya, and sprouts. Most Indians get 40-50g when they think they get 80g.",
    },
    {
      title: "High-protein Indian food exists but nobody plans around it",
      body:
        "Paneer tikka (25g per 100g), chicken breast (31g/100g), eggs (6g each), Greek yogurt (10g/100g), soya chunks (52g/100g dry) are all accessible. The problem is planning meals that hit the target without being boring or expensive.",
    },
    {
      title: "Budget kills most protein plans",
      body:
        "Chicken breast costs Rs 250-350/kg. Paneer costs Rs 350-400/kg. Whey protein costs Rs 50-70 per serving. A 100g protein day for a vegetarian on Rs 200 budget needs different choices than someone with Rs 500.",
    },
  ],

  features: [
    {
      title: "Indian food protein database",
      body: "40+ Indian foods with protein per serving, cost per serving, and common serving sizes. Not American foods with grams per cup, but dal measured in bowls, paneer in cubes, eggs in numbers.",
    },
    {
      title: "Budget-constrained meal planning",
      body: "Builds the plan within your daily budget. Shows cost per meal and flags if the protein target is not achievable within budget (with alternatives).",
    },
    {
      title: "Diet-type aware",
      body: "Separate plans for vegetarian, egg-included, and non-vegetarian. Vegetarian plans rely on paneer, soya, curd, sprouts, and legume combinations.",
    },
    {
      title: "Common myths flagged",
      body: "Flags the protein overestimation problem: dal is NOT 20g per bowl, peanut butter is mostly fat, milk is 3.3g per 100ml. Shows real numbers to recalibrate expectations.",
    },
    {
      title: "Meal distribution across the day",
      body: "Distributes protein across meals (not all in one sitting) for optimal absorption. Shows breakfast, lunch, snack, dinner splits.",
    },
    {
      title: "Variety alternatives",
      body: "Multiple options per meal slot so you can rotate daily. Not the same paneer-egg-chicken every single day.",
    },
  ],

  how: [
    "Enter daily protein target, diet type (veg/non-veg/egg), meals per day, and daily food budget.",
    "MacroPlate builds a full day meal plan hitting your protein from foods available in India.",
    "Get protein per meal, cost per meal, alternatives for variety, and myths corrected.",
  ],

  integrations: ["FlowForge", "Print/PDF", "Gym apps"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "For anyone trying to hit protein targets.",
      features: ["Full meal plan", "Budget optimization", "Protein per meal", "Myth corrections", "Alternatives"],
      cta: "Plan my meals",
      monthlyRuns: 50,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Pro",
      price: "$9",
      period: "/mo",
      blurb: "For trainers and dietitians.",
      features: ["REST API + MCP server", "Multi-client plans", "Custom food database", "Weekly planning", "Priority support"],
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
      blurb: "For fitness apps and meal delivery services.",
      features: ["Volume pricing", "Self-hosted Docker image", "Custom database", "SSO and audit log", "White-label"],
      cta: "Talk to us",
      monthlyRuns: Number.POSITIVE_INFINITY,
      apiAccess: true,
      rateLimitPerMin: 600,
    },
  ],

  faq: [
    {
      q: "Is dal really only 7g protein per bowl?",
      a: "Yes. One standard bowl (150ml cooked dal, about 30g dry lentils) gives 6-8g protein depending on dal type. Moong dal is slightly higher at 8g. The confusion comes from nutrition labels showing per 100g DRY weight (24g), but nobody eats 100g dry dal in one sitting.",
    },
    {
      q: "Can vegetarians hit 100g protein daily?",
      a: "Yes, but it requires planning. Key sources: paneer (25g/100g), soya chunks (52g/100g dry, rehydrates to 25g/100g cooked), Greek yogurt (10g/100g), cottage cheese, sprouted moong (7g/100g), and protein supplements. Relying on dal alone would need 14 bowls.",
    },
    {
      q: "How accurate are the costs?",
      a: "Costs reflect average Indian metro city prices (2024). Actual prices vary by city, season, and where you buy. The relative ranking (soya cheapest, paneer mid, chicken mid-high, whey highest per gram protein) holds across regions.",
    },
    {
      q: "Why does it flag peanut butter?",
      a: "Peanut butter is marketed as high-protein, but 2 tablespoons (32g) has only 7g protein with 16g fat and 190 calories. To get 30g protein from peanut butter alone, you would eat 800+ calories. It is a fat source that happens to have some protein, not a protein source.",
    },
    {
      q: "What about protein absorption limits?",
      a: "Recent research shows the body can absorb more than 30g per meal (the old limit was a myth). However, distributing 25-40g per meal across 3-4 meals optimizes muscle protein synthesis signaling. The plan distributes accordingly.",
    },
  ],

  inputs: [
    {
      name: "proteinTarget",
      label: "Daily protein target (grams)",
      type: "text",
      required: true,
      placeholder: "100",
      help: "Common targets: 1.6-2.2g per kg bodyweight for muscle building, 1.2g/kg for general health.",
    },
    {
      name: "dietType",
      label: "Diet type",
      type: "select",
      required: true,
      options: ["Vegetarian", "Egg-included", "Non-vegetarian"],
      help: "Determines food sources available for the plan.",
    },
    {
      name: "mealsPerDay",
      label: "Meals per day",
      type: "select",
      required: true,
      options: ["2", "3", "4"],
      help: "Including snacks. 3-4 meals distributes protein better for absorption.",
    },
    {
      name: "budget",
      label: "Daily food budget (Rs)",
      type: "text",
      required: true,
      placeholder: "300",
      help: "Total daily budget for protein sources. Rs 150-500 covers most Indian plans.",
    },
    {
      name: "preferences",
      label: "Restrictions/preferences (optional)",
      type: "text",
      required: false,
      placeholder: "no soya, lactose intolerant",
      help: "Foods to avoid. Common: no soya, no dairy, no gluten, no nuts.",
    },
  ],

  sample: {
    proteinTarget: "100",
    dietType: "Vegetarian",
    mealsPerDay: "3",
    budget: "300",
    preferences: "",
  },

  mcpTool: {
    name: "protein_meal_planner",
    description:
      "Build a daily Indian meal plan hitting a protein target within a budget. Uses Indian food database with protein per serving and cost. Supports vegetarian, egg, and non-vegetarian diets. Flags common protein myths.",
  },
};
