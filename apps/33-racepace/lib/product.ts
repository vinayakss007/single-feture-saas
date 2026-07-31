import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "racepace",
  name: "RacePace",
  tagline: "The pace plan that gets you to the finish, not the wall",
  oneLiner:
    "Enter your race distance, target finish time, and recent training data to get even-split, negative-split, and realistic positive-split pace plans per kilometre, with fueling schedule, heart rate zones, and a feasibility check against your training.",
  category: "Fitness & endurance",
  audience: "Recreational runners preparing for 5K to marathon distances, running coaches building race strategies",
  accent: "#b91c1c",
  accentSoft: "#fef2f2",

  metrics: [
    { value: "3", label: "Pace strategies computed per race" },
    { value: "42", label: "Per-km splits for a full marathon" },
    { value: "Riegel", label: "Formula used for feasibility prediction" },
  ],

  problem: [
    {
      title: "Most runners go out too fast",
      body:
        "The most common race mistake is a first-half pace that the body cannot sustain. By km 30, glycogen is depleted and the pace collapses. This is 'the wall' and it is entirely avoidable with a plan.",
    },
    {
      title: "Target times are often unrealistic",
      body:
        "A runner whose longest training run was 15km at 6:00/km cannot race a marathon at 5:00/km. But nobody does the maths until they are in pain at km 32.",
    },
    {
      title: "Fueling and conditions are not factored into pace",
      body:
        "Heat adds 10-20 seconds per km. Hills demand energy management. Gel timing matters for anything above 10K. A pace plan without these is just arithmetic.",
    },
  ],

  features: [
    {
      title: "Three pace strategies",
      body:
        "Even splits (steady state), negative splits (faster second half), and realistic positive splits (the pattern most runners actually run with the wall modelled).",
    },
    {
      title: "Per-km pace table",
      body:
        "Every kilometre has a target pace for each strategy, accounting for terrain and conditions adjustments.",
    },
    {
      title: "Riegel feasibility check",
      body:
        "Uses the Riegel formula (time2 = time1 * (dist2/dist1)^1.06) to predict your realistic finish time from training data. Flags if your target requires running faster than any recent training.",
    },
    {
      title: "Fueling schedule",
      body:
        "For races above 10K: gel and water intake timing per km based on effort and duration. The difference between bonking and finishing is often just gel timing.",
    },
    {
      title: "Heart rate zone prediction",
      body:
        "Estimated HR zone per segment based on the pace profile, so you know when zone 4 creep starts and can respond before it is too late.",
    },
    {
      title: "Condition adjustments",
      body:
        "Hot conditions, hilly terrain, and altitude each add a computed time penalty. The plan shows the adjusted target, not the fantasy flat-and-cool time.",
    },
  ],

  how: [
    "Enter your race distance, target finish time, recent training pace, longest recent run, terrain type, and expected conditions.",
    "RacePace computes three pace strategies, checks feasibility against your training, and builds a fueling schedule.",
    "Run with the per-km pace table. The negative-split strategy is optimal but the positive-split column tells you what will actually happen if you lose discipline.",
  ],

  integrations: ["FlowForge", "Strava (via export)", "Google Sheets"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "For your next race.",
      features: ["Unlimited pace plans", "All three strategies", "Fueling schedule", "Feasibility check"],
      cta: "Plan your race",
      monthlyRuns: 50,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Coach",
      price: "$19",
      period: "/mo",
      blurb: "For running coaches managing multiple athletes.",
      features: [
        "REST API + MCP server access",
        "Batch plan generation",
        "Custom pace profiles",
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
      blurb: "For race organisers and event apps.",
      features: [
        "Volume pricing",
        "Self-hosted Docker image",
        "Custom distance support",
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
      q: "What is the Riegel formula?",
      a: "Peter Riegel's formula predicts race performance: T2 = T1 * (D2/D1)^1.06. It uses a known performance (your training pace over a known distance) to estimate what is achievable at race distance. It is well-validated for distances from 5K to marathon.",
    },
    {
      q: "Why three strategies instead of just one?",
      a: "Even splits are physiologically optimal for flat courses. Negative splits are psychologically rewarding and protect against the wall. But most runners actually run positive splits, so showing what that looks like (and when the wall hits) helps you recognise the pattern early enough to adjust.",
    },
    {
      q: "How much does heat actually affect pace?",
      a: "Research from the 2023 Marathon Performance study shows: cool (below 12C) has no penalty, warm (12-20C) adds 3-5% to race time, and hot (above 20C) adds 7-12%. These are population averages; heat-acclimatised runners fare better.",
    },
    {
      q: "When should I take gels?",
      a: "For half marathons and above: first gel at 45-60 minutes, then every 30-45 minutes. The plan spaces them by km based on your expected pace. Taking a gel after the wall hits is too late as digestion slows when blood leaves the gut.",
    },
    {
      q: "What if my target time is unrealistic?",
      a: "The plan still generates pace tables for all three strategies, but flags it clearly with your predicted realistic time based on training. Running a race at an unrealistic pace is a recipe for a DNF, not just a slow finish.",
    },
  ],

  inputs: [
    {
      name: "distance",
      label: "Race distance",
      type: "select",
      required: true,
      options: ["5K", "10K", "Half Marathon", "Marathon", "Custom"],
      help: "Select your race distance.",
    },
    {
      name: "customDistanceKm",
      label: "Custom distance (km)",
      type: "text",
      required: false,
      placeholder: "15",
      help: "If you selected Custom above, enter the distance in km.",
    },
    {
      name: "targetTime",
      label: "Target finish time",
      type: "text",
      required: true,
      placeholder: "1:45:00",
      help: "Your goal finish time in H:MM:SS or MM:SS format.",
    },
    {
      name: "trainingPace",
      label: "Recent easy/long run pace (min/km)",
      type: "text",
      required: true,
      placeholder: "5:30",
      help: "Your comfortable training pace in M:SS per km.",
    },
    {
      name: "longestRun",
      label: "Longest recent run (km)",
      type: "text",
      required: true,
      placeholder: "18",
      help: "Your longest run in the past 4 weeks, in km.",
    },
    {
      name: "terrain",
      label: "Course terrain",
      type: "select",
      options: ["Flat", "Hilly", "Mixed"],
      help: "Overall terrain of the race course.",
    },
    {
      name: "conditions",
      label: "Expected conditions",
      type: "select",
      options: ["Cool", "Warm", "Hot"],
      help: "Expected race day temperature conditions.",
    },
  ],

  sample: {
    distance: "Half Marathon",
    customDistanceKm: "",
    targetTime: "1:45:00",
    trainingPace: "5:30",
    longestRun: "18",
    terrain: "Mixed",
    conditions: "Warm",
  },

  mcpTool: {
    name: "racepace_plan_race",
    description:
      "Generate a per-km race pace plan with three strategies (even, negative, positive splits), feasibility check against training data using the Riegel formula, fueling schedule, and heart rate zone predictions adjusted for terrain and weather conditions.",
  },
};
