import type { RunInput, RunResult, Severity } from "./types.ts";

/**
 * WaterLeak engine - Detects water leaks from meter readings,
 * quantifies waste, and identifies likely leak type.
 */

const LPCD_BENCHMARK = 135; // Indian standard litres per capita per day

const USAGE_MULTIPLIER: Record<string, number> = {
  "Normal (no washing machine daily)": 1.0,
  "Heavy (daily washing machine, garden)": 1.4,
  "Minimal (working couple, away daytime)": 0.7,
};

type LeakProfile = {
  type: string;
  minLpd: number;
  maxLpd: number;
  description: string;
  diagnostic: string;
  fixCost: string;
};

const LEAK_PROFILES: LeakProfile[] = [
  { type: "Dripping tap", minLpd: 20, maxLpd: 60, description: "Slow drip from one or more taps/shower. Often visible but ignored.", diagnostic: "Check all taps when fully closed. Look for drops or wet marks under basin.", fixCost: "Rs 50-200 (washer replacement)" },
  { type: "Running toilet cistern", minLpd: 150, maxLpd: 500, description: "Flush valve or fill valve not seating properly. Water continuously trickles into bowl, often silently.", diagnostic: "Put food colouring in cistern tank. Wait 15 mins without flushing. If colour appears in bowl, the flapper valve is leaking.", fixCost: "Rs 200-800 (flapper/fill valve)" },
  { type: "Underground pipe leak", minLpd: 400, maxLpd: 2000, description: "Pipe between meter and house has cracked or joint has failed. No visible signs unless very severe (wet patch in garden).", diagnostic: "Overnight meter test: close all taps, note meter before bed, check in morning. Any movement confirms a leak between meter and house.", fixCost: "Rs 2000-15000 (excavation + pipe repair)" },
  { type: "Irrigation/garden system leak", minLpd: 100, maxLpd: 600, description: "Broken sprinkler head, leaking drip line, or soaker hose left running. Seasonal and intermittent.", diagnostic: "Run irrigation system and walk the line. Look for spurting, pooling, or unusually wet spots.", fixCost: "Rs 200-2000 (replace sprinkler/line)" },
  { type: "Water tank overflow", minLpd: 200, maxLpd: 1000, description: "Overhead or underground tank float valve stuck or failed. Tank fills and overflows continuously.", diagnostic: "Check overflow pipe of overhead/underground tank. If water is flowing out when pump runs, float valve needs replacement.", fixCost: "Rs 300-1000 (float valve replacement)" },
];

// Municipal water rates (approximate slab-based, Rs per kL)
const WATER_RATE_PER_KL = 15; // average across Indian cities for domestic use

type Reading = { date: string; value: number };

function parseReadings(raw: string): Reading[] {
  const lines = raw.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const readings: Reading[] = [];
  for (const line of lines) {
    const parts = line.split(":");
    if (parts.length < 2) continue;
    // Handle format "date:reading" where date might have colons (unlikely but safe)
    const date = parts[0].trim();
    const valueStr = parts.slice(1).join(":").trim();
    const value = Number(valueStr);
    if (date && !isNaN(value)) {
      readings.push({ date, value });
    }
  }
  return readings;
}

export function run(input: RunInput): RunResult {
  const readingsRaw = (input.readings ?? "").trim();
  const householdSizeStr = (input.householdSize ?? "").trim();
  const usagePattern = (input.usagePattern ?? "").trim();

  if (!readingsRaw) throw new Error("Enter meter readings with one date:reading pair per line (at least 3 readings needed).");
  if (!householdSizeStr) throw new Error("Enter household size (number of persons) to calculate per-capita consumption.");
  if (!usagePattern) throw new Error("Select your typical usage pattern to adjust the baseline expectation.");

  const householdSize = Number(householdSizeStr);
  if (isNaN(householdSize) || householdSize < 1) throw new Error("Household size must be at least 1 person.");
  if (householdSize > 20) throw new Error("For households above 20, use facility management mode.");

  const readings = parseReadings(readingsRaw);
  if (readings.length < 3) throw new Error("Need at least 3 meter readings on different days to detect patterns. Enter more readings.");

  // Sort by value (assuming chronological correlation)
  readings.sort((a, b) => a.value - b.value);

  // Calculate daily consumption
  const dailyConsumptions: { date: string; litres: number }[] = [];
  for (let i = 1; i < readings.length; i++) {
    const diff = readings[i].value - readings[i - 1].value;
    const litres = diff * 1000; // kL to L
    dailyConsumptions.push({ date: readings[i].date, litres });
  }

  const totalLitres = dailyConsumptions.reduce((s, d) => s + d.litres, 0);
  const avgDailyLitres = totalLitres / dailyConsumptions.length;
  const lpcd = avgDailyLitres / householdSize;

  // Adjusted benchmark based on usage pattern
  const multiplier = USAGE_MULTIPLIER[usagePattern] || 1.0;
  const adjustedBenchmark = LPCD_BENCHMARK * multiplier;
  const expectedDaily = adjustedBenchmark * householdSize;

  // Excess consumption
  const excessDaily = Math.max(0, avgDailyLitres - expectedDaily);
  const excessMonthly = excessDaily * 30;
  const monthlyCostOfLeak = (excessMonthly / 1000) * WATER_RATE_PER_KL;

  // Anomaly detection
  const maxDaily = Math.max(...dailyConsumptions.map((d) => d.litres));
  const minDaily = Math.min(...dailyConsumptions.map((d) => d.litres));
  const variance = maxDaily - minDaily;
  const avgVariance = variance / avgDailyLitres;

  // Pattern analysis
  const hasJump = dailyConsumptions.some((d, i) => {
    if (i === 0) return false;
    return d.litres > dailyConsumptions[i - 1].litres * 1.5;
  });
  const isConsistentlyHigh = dailyConsumptions.every((d) => d.litres > expectedDaily * 1.2);
  const isIncreasing = dailyConsumptions.length >= 3 &&
    dailyConsumptions[dailyConsumptions.length - 1].litres > dailyConsumptions[0].litres * 1.2;

  // Identify likely leak type
  let likelyLeaks: LeakProfile[] = [];
  if (excessDaily > 0) {
    likelyLeaks = LEAK_PROFILES.filter((p) => excessDaily >= p.minLpd * 0.7 && excessDaily <= p.maxLpd * 1.5);
    if (likelyLeaks.length === 0) {
      // Default to closest match
      likelyLeaks = LEAK_PROFILES.filter((p) => excessDaily >= p.minLpd * 0.5);
      if (likelyLeaks.length === 0) likelyLeaks = [LEAK_PROFILES[0]]; // dripping tap as fallback
    }
  }

  // Determine overall assessment
  const leakDetected = excessDaily > 30; // More than 30 L/day above expected
  const leakSeverity = excessDaily > 500 ? "high" : excessDaily > 150 ? "medium" : excessDaily > 30 ? "low" : "low";
  const band = leakDetected ? (excessDaily > 300 ? "bad" : "warn") : "good";

  const headline = leakDetected
    ? `LEAK DETECTED: ~${Math.round(excessDaily)} litres/day excess consumption. Estimated cost: Rs ${Math.round(monthlyCostOfLeak)}/month. Likely: ${likelyLeaks[0]?.type || "unknown source"}. Your LPCD: ${Math.round(lpcd)} vs benchmark: ${Math.round(adjustedBenchmark)}.`
    : `No significant leak detected. Daily consumption: ${Math.round(avgDailyLitres)} L (${Math.round(lpcd)} LPCD). Benchmark: ${Math.round(adjustedBenchmark)} LPCD. Household of ${householdSize} is within normal range.`;

  return {
    headline,
    score: {
      label: "Leak Risk",
      value: leakDetected ? Math.min(100, Math.round((excessDaily / 500) * 100)) : Math.max(0, Math.round((1 - excessDaily / 100) * 100)),
      max: 100,
      band,
    },
    metrics: [
      { label: "Avg daily use", value: `${Math.round(avgDailyLitres)} L`, hint: `Expected: ${Math.round(expectedDaily)} L` },
      { label: "Per capita (LPCD)", value: `${Math.round(lpcd)}`, hint: `Benchmark: ${Math.round(adjustedBenchmark)}` },
      { label: "Excess per day", value: `${Math.round(excessDaily)} L`, hint: leakDetected ? "LEAK LIKELY" : "Normal" },
      { label: "Monthly leak cost", value: `Rs ${Math.round(monthlyCostOfLeak)}`, hint: `At Rs ${WATER_RATE_PER_KL}/kL` },
    ],
    sections: [
      {
        title: "Consumption Analysis",
        items: [
          {
            title: `Average: ${Math.round(avgDailyLitres)} litres/day for ${householdSize} persons`,
            body: `Per capita: ${Math.round(lpcd)} LPCD. Indian standard: 135 LPCD. Your adjusted benchmark (${usagePattern}): ${Math.round(adjustedBenchmark)} LPCD.`,
            severity: (lpcd > adjustedBenchmark * 1.5 ? "high" : lpcd > adjustedBenchmark * 1.2 ? "medium" : "low") as Severity,
          },
          {
            title: `Daily range: ${Math.round(minDaily)}-${Math.round(maxDaily)} litres`,
            body: `Variance: ${Math.round(variance)} L (${Math.round(avgVariance * 100)}% of average). ${avgVariance > 0.5 ? "HIGH VARIANCE suggests intermittent leak or inconsistent usage." : "Relatively consistent daily usage."}`,
            severity: (avgVariance > 0.5 ? "medium" : "low") as Severity,
          },
          ...(hasJump ? [{
            title: "SUDDEN JUMP detected in readings",
            body: "One or more days show >50% increase from previous day. This suggests a new leak started or a one-time event (tank filling, guests). Check readings around the jump date.",
            severity: "high" as Severity,
          }] : []),
          ...(isIncreasing ? [{
            title: "INCREASING trend in daily consumption",
            body: "Consumption is rising over the reading period. This suggests a worsening leak (crack expanding) or seasonal change (summer, garden watering).",
            severity: "medium" as Severity,
          }] : []),
        ],
      },
      ...(leakDetected ? [{
        title: "Likely Leak Type",
        items: likelyLeaks.map((l) => ({
          title: `${l.type} (${l.minLpd}-${l.maxLpd} L/day)`,
          body: `${l.description}\n\nDiagnostic: ${l.diagnostic}\nTypical fix cost: ${l.fixCost}`,
          severity: leakSeverity as Severity,
        })),
      }] : []),
      {
        title: leakDetected ? "What To Check (Priority Order)" : "Maintenance Tips",
        items: leakDetected ? [
          { title: "1. Overnight meter test", body: "Close all taps, note meter before bed, check at 6am. Any movement = confirmed leak. This tells you the leak is continuous, not usage.", severity: "medium" as Severity },
          { title: "2. Toilet cistern test (all toilets)", body: "Put food colouring in each cistern. Wait 15 mins without flushing. Colour in bowl = leaking flush valve. This is the #1 cause of unexplained water bills.", severity: "medium" as Severity },
          { title: "3. Check all taps and shower heads", body: "Close each tap firmly and check for drips after 30 seconds. Check under sinks for wet spots. Check outdoor taps.", severity: "low" as Severity },
          { title: "4. Check overhead/underground tank", body: "Look at overflow pipe. If water flowing when pump runs and tank is full, float valve has failed. Common in Indian houses with automated pumps.", severity: "low" as Severity },
          { title: "5. Call plumber for underground leak detection", body: "If overnight meter moves but all visible fixtures are fine, the leak is between meter and house (underground). Needs professional acoustic leak detection.", severity: "low" as Severity },
        ] : [
          { title: "Continue monitoring weekly", body: "Take meter readings weekly to catch leaks early. A sudden jump of 200+ L/day is the first sign.", severity: "low" as Severity },
          { title: "Annual fixture check", body: "Replace tap washers every 2 years, check toilet flush valves annually. Prevention costs Rs 200; a leak costs Rs 500+/month.", severity: "low" as Severity },
        ],
      },
    ],
    table: {
      columns: ["Date", "Reading (kL)", "Daily Use (L)", "Per Capita", "Status"],
      rows: readings.map((r, i) => {
        if (i === 0) return [r.date, r.value.toFixed(1), "-", "-", "Baseline"];
        const daily = dailyConsumptions[i - 1];
        const pcDaily = daily.litres / householdSize;
        const status = pcDaily > adjustedBenchmark * 1.5 ? "HIGH" : pcDaily > adjustedBenchmark * 1.2 ? "Elevated" : "Normal";
        return [r.date, r.value.toFixed(1), Math.round(daily.litres).toString(), Math.round(pcDaily).toString(), status];
      }),
    },
    json: {
      householdSize,
      usagePattern,
      readings: readings.map((r) => ({ date: r.date, valueKL: r.value })),
      dailyConsumptions: dailyConsumptions.map((d) => ({ date: d.date, litres: Math.round(d.litres) })),
      avgDailyLitres: Math.round(avgDailyLitres),
      lpcd: Math.round(lpcd),
      benchmark: Math.round(adjustedBenchmark),
      excessDailyLitres: Math.round(excessDaily),
      excessMonthlyLitres: Math.round(excessMonthly),
      monthlyCostRs: Math.round(monthlyCostOfLeak),
      leakDetected,
      likelyLeakTypes: likelyLeaks.map((l) => l.type),
      patterns: { suddenJump: hasJump, consistentlyHigh: isConsistentlyHigh, increasing: isIncreasing },
    },
  };
}
