import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "sleepdebt",
  name: "SleepDebt",
  tagline: "How much sleep you owe yourself, and when to repay it",
  oneLiner:
    "Enter your sleep log for the past week or two and get your cumulative sleep debt, a severity classification, a realistic recovery plan with diminishing returns factored in, and what time to go to bed tonight.",
  category: "Health & wellness",
  audience: "Professionals with irregular sleep schedules, shift workers, students during exams, anyone tracking sleep debt",
  accent: "#4c1d95",
  accentSoft: "#f5f3ff",

  metrics: [
    { value: "14", label: "Days of sleep log analysed" },
    { value: "3", label: "Severity tiers with distinct recovery strategies" },
    { value: "90%", label: "Diminishing returns modelled in recovery plan" },
  ],

  problem: [
    {
      title: "Sleep debt accumulates invisibly",
      body:
        "Losing 45 minutes a night feels like nothing. After a week that is over 5 hours of debt, and your cognitive performance is measurably degraded without you feeling particularly tired.",
    },
    {
      title: "Weekend lie-ins do not clear the debt",
      body:
        "You cannot fully recover a week of short sleep in two weekend mornings. Recovery has diminishing returns: the first extra hour is worth more than the third, and chronic debt takes weeks to clear.",
    },
    {
      title: "Nobody calculates what tonight should be",
      body:
        "Knowing you are sleep-deprived is not actionable. Knowing you should be in bed by 10:15 PM tonight and can clear your debt in 9 days is.",
    },
  ],

  features: [
    {
      title: "Cumulative sleep debt calculation",
      body:
        "Computes exact hours of debt from your log against your personal target, with rolling averages and trend direction.",
    },
    {
      title: "Severity classification",
      body:
        "Manageable (under 5h), concerning (5-10h), or chronic (over 10h). Each tier has different recovery characteristics and health implications.",
    },
    {
      title: "Recovery plan with diminishing returns",
      body:
        "Models realistic recovery where each extra hour of sleep only repays a fraction of debt (not hour-for-hour), and computes how many days of extra sleep are needed.",
    },
    {
      title: "Consecutive short night detection",
      body:
        "Flags streaks of 3+ nights below 6 hours, which research links to cumulative cognitive impairment equivalent to total sleep deprivation.",
    },
    {
      title: "Tonight's bedtime recommendation",
      body:
        "Based on your target wake time and current debt, tells you exactly when to go to bed tonight to begin recovery without overshooting (which disrupts circadian rhythm).",
    },
    {
      title: "Rolling average vs target visualisation",
      body:
        "Shows your 7-day rolling average against your target so you can see whether the trend is improving or worsening.",
    },
  ],

  how: [
    "Enter your bedtime and wake time for each day over the past 7-14 days. Set your target sleep hours and weekend recovery availability.",
    "SleepDebt computes your cumulative debt, classifies severity, and models a recovery plan with realistic diminishing returns.",
    "Get tonight's optimal bedtime and a day-by-day plan to clear your debt without disrupting your rhythm.",
  ],

  integrations: ["FlowForge", "Apple Health (via CSV)", "Google Sheets"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "For checking in on your sleep debt.",
      features: ["Unlimited calculations", "Recovery plan", "Bedtime recommendation", "Health flags"],
      cta: "Check your debt",
      monthlyRuns: 50,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Pro",
      price: "$9",
      period: "/mo",
      blurb: "For continuous tracking and API access.",
      features: [
        "REST API + MCP server access",
        "Historical trend tracking",
        "Weekly summary reports",
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
      blurb: "For occupational health and shift scheduling teams.",
      features: [
        "Volume pricing",
        "Self-hosted Docker image",
        "Shift pattern analysis",
        "SSO and audit log",
        "Dedicated support",
      ],
      cta: "Talk to us",
      monthlyRuns: Number.POSITIVE_INFINITY,
      apiAccess: true,
      rateLimitPerMin: 600,
    },
  ],

  faq: [
    {
      q: "What target sleep hours should I use?",
      a: "Adults need 7-9 hours. The default of 8 works for most people. If you consistently feel rested on 7 hours without an alarm, use 7. If you need 9, use 9. The right number is the one where you wake without an alarm.",
    },
    {
      q: "How accurate is the recovery plan?",
      a: "It models the well-established finding that recovery is not linear. The first extra hour of sleep repays about 90% of an hour of debt, but each subsequent hour in the same night has diminishing returns (about 70-80% efficiency). Chronic debt over 10h may take 2-4 weeks to fully clear.",
    },
    {
      q: "Why does consecutive short sleep matter specifically?",
      a: "Research from the University of Pennsylvania shows that after 3+ consecutive nights of less than 6 hours, cognitive impairment accumulates to levels equivalent to 1-2 nights of total sleep deprivation, even though the person does not feel proportionally sleepier.",
    },
    {
      q: "Can I oversleep to recover faster?",
      a: "Sleeping more than 2 hours above your target in a single night disrupts circadian rhythm and can make the next night worse. The plan caps recovery at 1.5 extra hours per night for this reason.",
    },
    {
      q: "Does napping count?",
      a: "Short naps (20-30 min) reduce sleepiness but do not significantly reduce sleep debt according to most research. The tool focuses on core nighttime sleep, which is where slow-wave and REM cycles happen.",
    },
  ],

  inputs: [
    {
      name: "sleepLog",
      label: "Sleep log (one day per line)",
      type: "textarea",
      rows: 10,
      required: true,
      placeholder: "Mon: 23:30-06:15\nTue: 00:15-06:00\nWed: 23:00-07:00\n...",
      help: "Enter bedtime and wake time for each day. Format: HH:MM-HH:MM (24h). One entry per line.",
    },
    {
      name: "targetHours",
      label: "Target sleep hours",
      type: "select",
      options: ["7", "7.5", "8", "8.5", "9"],
      help: "Your ideal sleep duration per night.",
    },
    {
      name: "weekendRecoveryHours",
      label: "Weekend recovery hours available",
      type: "select",
      options: ["1", "1.5", "2", "2.5", "3"],
      help: "How many extra hours you can sleep on weekend mornings.",
    },
    {
      name: "wakeTime",
      label: "Target wake time tomorrow",
      type: "text",
      required: false,
      placeholder: "06:30",
      help: "When you need to wake up tomorrow (24h format). Used for tonight's bedtime recommendation.",
    },
  ],

  sample: {
    sleepLog: "Mon: 23:30-06:00\nTue: 00:15-05:45\nWed: 23:45-06:15\nThu: 01:00-06:00\nFri: 00:30-06:00\nSat: 23:00-08:30\nSun: 23:30-08:00\nMon: 23:45-05:50\nTue: 00:00-06:00\nWed: 23:30-05:30",
    targetHours: "8",
    weekendRecoveryHours: "2",
    wakeTime: "06:30",
  },

  mcpTool: {
    name: "sleepdebt_analyze_log",
    description:
      "Analyze a sleep log to compute cumulative sleep debt, classify severity, generate a recovery plan with diminishing returns, flag consecutive short nights, and recommend tonight's optimal bedtime.",
  },
};
