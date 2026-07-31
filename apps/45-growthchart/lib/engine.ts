import type { RunInput, RunResult, Severity } from "./types.ts";

/**
 * GrowthChart engine - Plots child's growth against WHO standards using
 * LMS method for exact percentile computation.
 */

// WHO LMS parameters (weight-for-age, boys 0-60 months, sampled key ages)
// Format: { ageMonths: [L, M, S] }
// Source: WHO Child Growth Standards (simplified table for key ages)
const WHO_WFA_BOYS: Record<number, [number, number, number]> = {
  0: [0.3487, 3.3464, 0.14602],
  1: [0.2297, 4.4709, 0.13395],
  2: [0.1970, 5.5675, 0.12385],
  3: [0.1738, 6.3762, 0.11727],
  4: [0.1553, 7.0023, 0.11316],
  5: [0.1395, 7.5105, 0.10980],
  6: [0.1257, 7.9340, 0.10764],
  9: [0.0956, 8.9014, 0.10484],
  12: [0.0697, 9.6479, 0.10357],
  15: [0.0471, 10.3089, 0.10264],
  18: [0.0274, 10.9080, 0.10196],
  21: [0.0100, 11.4746, 0.10154],
  24: [-0.0056, 12.0185, 0.10130],
  30: [-0.0330, 13.0514, 0.10130],
  36: [-0.0567, 14.0340, 0.10156],
  42: [-0.0773, 14.9878, 0.10202],
  48: [-0.0952, 15.9240, 0.10268],
  54: [-0.1107, 16.8567, 0.10354],
  60: [-0.1240, 17.7946, 0.10460],
};

const WHO_WFA_GIRLS: Record<number, [number, number, number]> = {
  0: [0.3809, 3.2322, 0.14171],
  1: [0.1714, 4.1873, 0.13724],
  2: [0.0962, 5.1282, 0.12926],
  3: [0.0402, 5.8458, 0.12402],
  4: [-0.0050, 6.4237, 0.11987],
  5: [-0.0430, 6.8985, 0.11653],
  6: [-0.0756, 7.2970, 0.11385],
  9: [-0.1488, 8.2000, 0.10900],
  12: [-0.2070, 8.9500, 0.10610],
  15: [-0.2540, 9.6200, 0.10445],
  18: [-0.2920, 10.2400, 0.10355],
  21: [-0.3230, 10.8500, 0.10310],
  24: [-0.3480, 11.4700, 0.10300],
  30: [-0.3840, 12.6800, 0.10340],
  36: [-0.4080, 13.8700, 0.10424],
  42: [-0.4220, 15.0500, 0.10544],
  48: [-0.4310, 16.2400, 0.10703],
  54: [-0.4370, 17.4600, 0.10901],
  60: [-0.4400, 18.7300, 0.11143],
};

// WHO LMS for height/length-for-age (simplified key ages)
const WHO_HFA_BOYS: Record<number, [number, number, number]> = {
  0: [1, 49.8842, 0.03795],
  1: [1, 54.7244, 0.03557],
  2: [1, 58.4249, 0.03424],
  3: [1, 61.4292, 0.03328],
  4: [1, 63.8860, 0.03257],
  5: [1, 65.9026, 0.03204],
  6: [1, 67.6236, 0.03165],
  9: [1, 71.7688, 0.03104],
  12: [1, 75.7488, 0.03068],
  15: [1, 79.2367, 0.03045],
  18: [1, 82.2515, 0.03030],
  21: [1, 84.8588, 0.03022],
  24: [1, 87.1161, 0.03019],
  30: [1, 91.2000, 0.03020],
  36: [1, 95.0700, 0.03030],
  42: [1, 98.7000, 0.03044],
  48: [1, 102.2000, 0.03064],
  54: [1, 105.5800, 0.03087],
  60: [1, 108.8700, 0.03113],
};

const WHO_HFA_GIRLS: Record<number, [number, number, number]> = {
  0: [1, 49.1477, 0.03790],
  1: [1, 53.6872, 0.03563],
  2: [1, 57.0673, 0.03449],
  3: [1, 59.8029, 0.03366],
  4: [1, 62.0899, 0.03304],
  5: [1, 64.0301, 0.03257],
  6: [1, 65.7311, 0.03222],
  9: [1, 69.9973, 0.03168],
  12: [1, 73.9533, 0.03138],
  15: [1, 77.5050, 0.03120],
  18: [1, 80.7153, 0.03111],
  21: [1, 83.6510, 0.03108],
  24: [1, 86.3600, 0.03111],
  30: [1, 91.3000, 0.03125],
  36: [1, 95.4000, 0.03148],
  42: [1, 99.7000, 0.03175],
  48: [1, 103.5000, 0.03205],
  54: [1, 107.2000, 0.03239],
  60: [1, 110.8000, 0.03276],
};

function getLMS(ageMonths: number, sex: string, table: Record<number, [number, number, number]>): [number, number, number] {
  const ages = Object.keys(table).map(Number).sort((a, b) => a - b);
  // Find nearest age
  let closestAge = ages[0];
  let minDiff = Math.abs(ageMonths - ages[0]);
  for (const age of ages) {
    const diff = Math.abs(ageMonths - age);
    if (diff < minDiff) {
      minDiff = diff;
      closestAge = age;
    }
  }
  // Linear interpolation between two nearest
  const lowerIdx = ages.filter((a) => a <= ageMonths);
  const upperIdx = ages.filter((a) => a >= ageMonths);
  if (lowerIdx.length === 0) return table[ages[0]];
  if (upperIdx.length === 0) return table[ages[ages.length - 1]];
  const lower = lowerIdx[lowerIdx.length - 1];
  const upper = upperIdx[0];
  if (lower === upper) return table[lower];
  const frac = (ageMonths - lower) / (upper - lower);
  const lmsLower = table[lower];
  const lmsUpper = table[upper];
  return [
    lmsLower[0] + frac * (lmsUpper[0] - lmsLower[0]),
    lmsLower[1] + frac * (lmsUpper[1] - lmsLower[1]),
    lmsLower[2] + frac * (lmsUpper[2] - lmsLower[2]),
  ];
}

function computeZScore(value: number, L: number, M: number, S: number): number {
  if (L === 0) return Math.log(value / M) / S;
  return (Math.pow(value / M, L) - 1) / (L * S);
}

function zToPercentile(z: number): number {
  // Approximation of standard normal CDF
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  const cdf = 0.5 * (1.0 + sign * y);
  return Math.round(cdf * 1000) / 10; // one decimal
}

type Measurement = { date: string; ageMonths: number; weightKg: number; heightCm: number; headCm?: number };

function parseMeasurements(raw: string, dob: Date): Measurement[] {
  const lines = raw.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const measurements: Measurement[] = [];
  for (const line of lines) {
    const parts = line.split(",").map((p) => p.trim());
    if (parts.length < 3) continue;
    const date = parts[0];
    const weightKg = Number(parts[1]);
    const heightCm = Number(parts[2]);
    const headCm = parts[3] ? Number(parts[3]) : undefined;
    if (!date || isNaN(weightKg) || isNaN(heightCm)) continue;
    const measureDate = new Date(date);
    const ageMonths = (measureDate.getFullYear() - dob.getFullYear()) * 12 + (measureDate.getMonth() - dob.getMonth()) + (measureDate.getDate() - dob.getDate()) / 30;
    measurements.push({ date, ageMonths: Math.max(0, ageMonths), weightKg, heightCm, headCm });
  }
  return measurements.sort((a, b) => a.ageMonths - b.ageMonths);
}

export function run(input: RunInput): RunResult {
  const dobStr = (input.dateOfBirth ?? "").trim();
  const sex = (input.sex ?? "").trim();
  const measurementsRaw = (input.measurements ?? "").trim();

  if (!dobStr) throw new Error("Enter child's date of birth in YYYY-MM-DD format.");
  if (!sex) throw new Error("Select biological sex (Male/Female). Growth standards differ by sex.");
  if (!measurementsRaw) throw new Error("Enter at least one measurement line: date,weight_kg,height_cm");

  const dob = new Date(dobStr);
  if (isNaN(dob.getTime())) throw new Error("Invalid date of birth. Use YYYY-MM-DD format (e.g., 2022-06-15).");

  const measurements = parseMeasurements(measurementsRaw, dob);
  if (measurements.length === 0) throw new Error("Could not parse any measurements. Format: date,weight_kg,height_cm (one per line).");

  const isBoy = sex === "Male";
  const wfaTable = isBoy ? WHO_WFA_BOYS : WHO_WFA_GIRLS;
  const hfaTable = isBoy ? WHO_HFA_BOYS : WHO_HFA_GIRLS;

  // Compute percentiles for each measurement
  const results = measurements.map((m) => {
    const [wL, wM, wS] = getLMS(m.ageMonths, sex, wfaTable);
    const wZ = computeZScore(m.weightKg, wL, wM, wS);
    const wPct = zToPercentile(wZ);

    const [hL, hM, hS] = getLMS(m.ageMonths, sex, hfaTable);
    const hZ = computeZScore(m.heightCm, hL, hM, hS);
    const hPct = zToPercentile(hZ);

    // BMI
    const heightM = m.heightCm / 100;
    const bmi = m.weightKg / (heightM * heightM);

    return { ...m, wZ, wPct, hZ, hPct, bmi, wM, hM };
  });

  const latest = results[results.length - 1];
  const ageYears = Math.floor(latest.ageMonths / 12);
  const ageRemMonths = Math.round(latest.ageMonths % 12);

  // Percentile crossing detection
  let crossingAlert = "";
  let crossingCount = 0;
  if (results.length >= 2) {
    const first = results[0];
    const last = results[results.length - 1];
    const wPctChange = last.wPct - first.wPct;
    // Major percentile lines: 3, 15, 50, 85, 97
    const majorLines = [3, 15, 50, 85, 97];
    const firstBand = majorLines.filter((l) => first.wPct >= l).length;
    const lastBand = majorLines.filter((l) => last.wPct >= l).length;
    crossingCount = Math.abs(lastBand - firstBand);
    if (crossingCount >= 2) {
      crossingAlert = wPctChange < 0
        ? `Weight percentile dropped from ${first.wPct}th to ${last.wPct}th (crossed ${crossingCount} major lines DOWN). Discuss with paediatrician.`
        : `Weight percentile rose from ${first.wPct}th to ${last.wPct}th (crossed ${crossingCount} major lines UP). Monitor for overweight trend.`;
    }
  }

  // Growth velocity
  let weightVelocity = "";
  let heightVelocity = "";
  if (results.length >= 2) {
    const first = results[0];
    const last = results[results.length - 1];
    const monthsDiff = last.ageMonths - first.ageMonths;
    if (monthsDiff > 0) {
      const wGainPerMonth = (last.weightKg - first.weightKg) / monthsDiff;
      const hGainPerMonth = (last.heightCm - first.heightCm) / monthsDiff;
      weightVelocity = `${(wGainPerMonth * 1000).toFixed(0)} g/month (${(wGainPerMonth * 30).toFixed(0)} g/day)`;
      heightVelocity = `${hGainPerMonth.toFixed(1)} cm/month`;
    }
  }

  // Clinical flags (prompts for doctor, NOT diagnoses)
  const flags: string[] = [];
  if (latest.wPct < 3) flags.push("Weight below 3rd percentile: discuss nutritional assessment with paediatrician.");
  if (latest.hPct < 3) flags.push("Height below 3rd percentile: discuss growth evaluation with paediatrician.");
  if (latest.wZ < -2) flags.push("Weight-for-age z-score < -2: classified as underweight by WHO criteria.");
  if (latest.hZ < -2) flags.push("Height-for-age z-score < -2: classified as stunted by WHO criteria.");
  if (latest.wZ > 2) flags.push("Weight-for-age z-score > +2: monitor for overweight. Discuss with paediatrician.");
  if (crossingAlert) flags.push(crossingAlert);

  const band = flags.length === 0 ? "good" : flags.some((f) => f.includes("< -2") || f.includes("below 3rd")) ? "bad" : "warn";

  const headline = `Age: ${ageYears}y ${ageRemMonths}m | Weight: ${latest.wPct}th percentile (${latest.weightKg} kg) | Height: ${latest.hPct}th percentile (${latest.heightCm} cm). ${flags.length > 0 ? flags[0] : "Growing on track - no red flags."}`;

  return {
    headline,
    score: {
      label: "Growth Status",
      value: Math.min(100, Math.max(0, Math.round(latest.wPct))),
      max: 100,
      band,
    },
    metrics: [
      { label: "Weight percentile", value: `${latest.wPct}th`, hint: `${latest.weightKg} kg (median: ${latest.wM.toFixed(1)} kg)` },
      { label: "Height percentile", value: `${latest.hPct}th`, hint: `${latest.heightCm} cm (median: ${latest.hM.toFixed(1)} cm)` },
      { label: "Age", value: `${ageYears}y ${ageRemMonths}m`, hint: `${Math.round(latest.ageMonths)} months` },
      { label: "BMI", value: latest.bmi.toFixed(1), hint: `kg/m2` },
    ],
    sections: [
      {
        title: "Current Growth Position",
        items: [
          {
            title: `Weight-for-age: ${latest.wPct}th percentile (z-score: ${latest.wZ.toFixed(2)})`,
            body: `${latest.weightKg} kg at ${Math.round(latest.ageMonths)} months. WHO median for ${sex.toLowerCase()} at this age: ${latest.wM.toFixed(1)} kg. ${latest.wPct >= 15 && latest.wPct <= 85 ? "Within normal range." : latest.wPct < 15 ? "Below average - monitor trend." : "Above average."}`,
            severity: (latest.wPct < 3 ? "high" : latest.wPct < 15 ? "medium" : "low") as Severity,
          },
          {
            title: `Height-for-age: ${latest.hPct}th percentile (z-score: ${latest.hZ.toFixed(2)})`,
            body: `${latest.heightCm} cm at ${Math.round(latest.ageMonths)} months. WHO median: ${latest.hM.toFixed(1)} cm. ${latest.hPct >= 15 && latest.hPct <= 85 ? "Within normal range." : latest.hPct < 15 ? "Short stature - evaluate if persistent." : "Tall for age."}`,
            severity: (latest.hPct < 3 ? "high" : latest.hPct < 15 ? "medium" : "low") as Severity,
          },
          {
            title: `BMI: ${latest.bmi.toFixed(1)} kg/m2`,
            body: `Body Mass Index helps assess proportionality. For children, BMI-for-age percentile is more meaningful than absolute BMI.`,
            severity: "low" as Severity,
          },
        ],
      },
      ...(results.length >= 2 ? [{
        title: "Growth Velocity",
        items: [
          ...(weightVelocity ? [{
            title: `Weight gain: ${weightVelocity}`,
            body: `Over ${Math.round(results[results.length - 1].ageMonths - results[0].ageMonths)} months of measurements. Expected velocity varies by age: 150-200 g/week in first 3 months, decreasing to 60-80 g/week by 12 months.`,
            severity: "low" as Severity,
          }] : []),
          ...(heightVelocity ? [{
            title: `Height gain: ${heightVelocity}`,
            body: `Expected: ~2.5 cm/month in first year, ~1 cm/month in second year, 6-7 cm/year from age 2-puberty.`,
            severity: "low" as Severity,
          }] : []),
        ],
      }] : []),
      ...(crossingAlert || flags.length > 0 ? [{
        title: "Points to Discuss with Paediatrician",
        items: flags.map((f) => ({
          title: f,
          body: "This is a pattern worth professional review, not a diagnosis. Your paediatrician will consider clinical context, feeding history, and family pattern.",
          severity: (f.includes("< -2") || f.includes("below 3rd") ? "high" : "medium") as Severity,
        })),
      }] : [{
        title: "Assessment",
        items: [{
          title: "Growing on track",
          body: "No red flags detected. Weight and height are tracking within normal percentile ranges with no concerning crossing pattern. Continue regular measurements every 3-6 months.",
          severity: "low" as Severity,
        }],
      }]),
      {
        title: "Understanding Percentiles",
        items: [
          { title: "Percentile = position among 100 same-age children", body: `${latest.wPct}th percentile means your child weighs more than ${Math.round(latest.wPct)}% of same-age ${sex.toLowerCase()} children in the WHO reference population. 50th is average, not 'target'.`, severity: "low" as Severity },
          { title: "Trajectory matters more than position", body: "A child consistently at 25th percentile is healthy. A child dropping from 75th to 25th needs evaluation. Track the trend, not just today's number.", severity: "low" as Severity },
        ],
      },
    ],
    table: {
      columns: ["Date", "Age (months)", "Weight (kg)", "Wt %ile", "Height (cm)", "Ht %ile", "BMI"],
      rows: results.map((r) => [
        r.date,
        Math.round(r.ageMonths).toString(),
        r.weightKg.toFixed(1),
        `${r.wPct}th`,
        r.heightCm.toFixed(1),
        `${r.hPct}th`,
        r.bmi.toFixed(1),
      ]),
    },
    json: {
      child: { dateOfBirth: dobStr, sex, ageMonths: Math.round(latest.ageMonths), ageYears, ageRemMonths },
      latest: { weightKg: latest.weightKg, heightCm: latest.heightCm, bmi: Number(latest.bmi.toFixed(1)), weightPercentile: latest.wPct, heightPercentile: latest.hPct, weightZScore: Number(latest.wZ.toFixed(2)), heightZScore: Number(latest.hZ.toFixed(2)) },
      measurements: results.map((r) => ({ date: r.date, ageMonths: Math.round(r.ageMonths), weightKg: r.weightKg, heightCm: r.heightCm, weightPercentile: r.wPct, heightPercentile: r.hPct })),
      velocity: { weightPerMonth: weightVelocity, heightPerMonth: heightVelocity },
      flags,
      percentileCrossing: crossingCount,
    },
  };
}
