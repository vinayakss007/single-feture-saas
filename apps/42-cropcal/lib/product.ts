import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "cropcal",
  name: "CropCal",
  tagline: "What to sow this week, for this soil, in this climate",
  oneLiner:
    "Enter your state, soil type, month, land area, and irrigation status to get crop recommendations with expected yield, water needs, seed quantity, sowing window, and mandi price range.",
  category: "Agriculture tools",
  audience: "Farmers, agricultural officers, agri-entrepreneurs, FPOs, rural advisors",
  accent: "#365314",
  accentSoft: "#ecfdf5",

  metrics: [
    { value: "28", label: "States covered" },
    { value: "60+", label: "Crops in database" },
    { value: "3", label: "Seasons (Kharif/Rabi/Zaid)" },
  ],

  problem: [
    {
      title: "Farmers sow what their neighbours sow, not what their soil needs",
      body:
        "Black cotton soil in Vidarbha retains moisture differently from alluvial soil in Punjab. Laterite soil in Kerala has different nutrient profiles. Matching crop to soil type can improve yield by 20-40%.",
    },
    {
      title: "Sowing windows are narrow and non-negotiable",
      body:
        "Paddy must be transplanted within the monsoon window. Wheat sown after November 15 in North India loses 30-40 kg/acre per week of delay. Missing the window means an entire season lost.",
    },
    {
      title: "Seed quantity and water requirement calculations are done by guesswork",
      body:
        "A farmer with 5 acres of land needs to know exactly how many kg of seed to buy and whether their borewell can support the crop's water requirement. Over-buying seed is money wasted; under-watering is crop lost.",
    },
  ],

  features: [
    {
      title: "Zone-specific crop recommendations",
      body:
        "Matches crops to your agro-climatic zone, soil type, and available irrigation. Not generic advice but specific varieties proven for your region.",
    },
    {
      title: "Sowing window with urgency indicator",
      body:
        "Shows the optimal sowing window for each recommended crop and flags if the window is closing. A red flag means 'sow this week or wait till next season'.",
    },
    {
      title: "Seed quantity for your exact area",
      body:
        "Calculates seed rate per acre multiplied by your land area. No more buying 50kg when you need 30kg, or running short mid-sowing.",
    },
    {
      title: "Water requirement vs irrigation capacity",
      body:
        "Shows total water need in mm and flags crops that need more water than rainfed conditions or drip irrigation can provide.",
    },
    {
      title: "Mandi price range for harvest planning",
      body:
        "Estimated mandi prices at harvest time based on recent trends. Helps choose between two viable crops based on expected return per acre.",
    },
    {
      title: "Companion planting suggestions",
      body:
        "Which crops grow well together for intercropping, improving soil nitrogen, pest management, and maximising per-acre returns.",
    },
  ],

  how: [
    "Select your state, soil type, current month, land area in acres, and whether you have irrigation (none/canal/drip/borewell).",
    "CropCal matches your zone and conditions against its crop database and recommends the best options for this season.",
    "Get seed quantity, water needs, sowing window urgency, companion crops, and expected returns at mandi prices.",
  ],

  integrations: ["FlowForge", "Print/PDF", "Krishi Vigyan Kendras"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "For any farmer planning the next sowing season.",
      features: ["Full crop recommendations", "Seed quantity calculator", "Water requirement check", "Sowing window alerts", "Mandi price estimates"],
      cta: "Get recommendations",
      monthlyRuns: 50,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Pro",
      price: "$9",
      period: "/mo",
      blurb: "For FPOs and agricultural advisory services.",
      features: [
        "REST API + MCP server access",
        "Multi-farm planning",
        "Custom crop database",
        "Season-over-season tracking",
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
      blurb: "For state agriculture departments and agri-tech platforms.",
      features: [
        "Volume pricing",
        "Self-hosted Docker image",
        "District-level data integration",
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
      q: "How accurate are the yield estimates?",
      a: "Yields shown are district-average yields from government agricultural statistics for irrigated and rainfed conditions. Actual yield depends on seed quality, fertiliser application, pest management, and weather. Use as a baseline for planning, not a guarantee.",
    },
    {
      q: "Are the mandi prices current?",
      a: "Prices shown are typical ranges based on recent seasons for the crop in major mandis of the region. Actual prices at harvest time may vary based on supply, demand, government MSP announcements, and market conditions.",
    },
    {
      q: "Does it cover all states?",
      a: "The database covers major agro-climatic zones across India grouped by state. Some northeastern states and union territories may have limited crop-specific data but general recommendations still apply based on similar zones.",
    },
    {
      q: "What if I have mixed soil types on my farm?",
      a: "Run the tool twice with each soil type and the respective area. Some farmers have alluvial near the river and laterite on higher ground. Different parts of the farm may suit different crops.",
    },
    {
      q: "Does it account for organic farming?",
      a: "Seed rates and water requirements are similar for organic and conventional farming. Yield estimates assume conventional practices. Organic farming may yield 20-30% less initially but often matches conventional yields after 3-4 years of soil building.",
    },
  ],

  inputs: [
    {
      name: "state",
      label: "State",
      type: "select",
      required: true,
      options: [
        "Punjab", "Haryana", "Uttar Pradesh", "Bihar", "West Bengal",
        "Madhya Pradesh", "Maharashtra", "Gujarat", "Rajasthan",
        "Karnataka", "Tamil Nadu", "Andhra Pradesh", "Telangana",
        "Kerala", "Odisha", "Assam", "Jharkhand", "Chhattisgarh",
      ],
      help: "Determines agro-climatic zone and suitable crop varieties.",
    },
    {
      name: "soilType",
      label: "Soil type",
      type: "select",
      required: true,
      options: ["Alluvial", "Black cotton (Vertisol)", "Red soil", "Laterite"],
      help: "Major soil classification. Alluvial is Indo-Gangetic plains, Black cotton is Deccan, Red is peninsula, Laterite is Western Ghats.",
    },
    {
      name: "month",
      label: "Current month",
      type: "select",
      required: true,
      options: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      help: "Determines which season (Kharif Jun-Oct, Rabi Nov-Mar, Zaid Mar-Jun) and sowing window urgency.",
    },
    {
      name: "landArea",
      label: "Land area (acres)",
      type: "text",
      required: true,
      placeholder: "5",
      help: "Total area available for sowing. Used to calculate seed quantity needed.",
    },
    {
      name: "irrigation",
      label: "Irrigation available",
      type: "select",
      required: true,
      options: ["Rainfed only", "Canal irrigation", "Borewell/tubewell", "Drip irrigation"],
      help: "Determines which crops are viable. Many crops need assured irrigation; some are drought-tolerant.",
    },
  ],

  sample: {
    state: "Maharashtra",
    soilType: "Black cotton (Vertisol)",
    month: "June",
    landArea: "5",
    irrigation: "Rainfed only",
  },

  mcpTool: {
    name: "crop_calendar",
    description:
      "Get crop recommendations for Indian agriculture based on state, soil type, month, land area and irrigation availability. Returns suitable crops with seed quantity, water requirement, sowing window, yield estimates and mandi price ranges.",
  },
};
