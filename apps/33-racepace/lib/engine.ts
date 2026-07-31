import type { RunInput, RunResult, Severity } from "./types.ts";

/**
 * RacePace engine - Generates per-km pace plans with three strategies,
 * feasibility checks, fueling schedules, and HR zone predictions.
 */

const DISTANCES: Record<string, number> = {
  "5K": 5,
  "10K": 10,
  "Half Marathon": 21.1,
  "Marathon": 42.195,
};

function parseTimeToSeconds(time: string): number | null {
  const parts = time.trim().split(":");
  if (parts.length === 3) {
    const [h, m, s] = parts.map(Number);
    if ([h, m, s].some((v) => !Number.isFinite(v) || v < 0)) return null;
    return h * 3600 + m * 60 + s;
  }
  if (parts.length === 2) {
    const [m, s] = parts.map(Number);
    if ([m, s].some((v) => !Number.isFinite(v) || v < 0)) return null;
    return m * 60 + s;
  }
  return null;
}

function parsePaceToSecondsPerKm(pace: string): number | null {
  const parts = pace.trim().split(":");
  if (parts.length === 2) {
    const [m, s] = parts.map(Number);
    if ([m, s].some((v) => !Number.isFinite(v) || v < 0)) return null;
    return m * 60 + s;
  }
  return null;
}

function formatPace(secondsPerKm: number): string {
  const m = Math.floor(secondsPerKm / 60);
  const s = Math.round(secondsPerKm % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function hrZone(intensity: number): string {
  // intensity: 0-1 scale where 0 = rest, 1 = max effort
  if (intensity < 0.6) return "Z1";
  if (intensity < 0.7) return "Z2";
  if (intensity < 0.8) return "Z3";
  if (intensity < 0.9) return "Z4";
  return "Z5";
}

export function run(input: RunInput): RunResult {
  const distanceKey = input.distance ?? "";
  const customKm = Number(input.customDistanceKm) || 0;
  const targetTimeStr = (input.targetTime ?? "").trim();
  const trainingPaceStr = (input.trainingPace ?? "").trim();
  const longestRunKm = Number(input.longestRun) || 0;
  const terrain = input.terrain || "Flat";
  const conditions = input.conditions || "Cool";

  // Validate inputs
  let distanceKm = DISTANCES[distanceKey] ?? 0;
  if (distanceKey === "Custom") distanceKm = customKm;
  if (distanceKm <= 0) throw new Error("Select a race distance or enter a custom distance in km.");

  const targetSeconds = parseTimeToSeconds(targetTimeStr);
  if (!targetSeconds || targetSeconds <= 0) throw new Error("Enter a valid target finish time in H:MM:SS or MM:SS format (e.g., 1:45:00).");

  const trainingPaceSec = parsePaceToSecondsPerKm(trainingPaceStr);
  if (!trainingPaceSec || trainingPaceSec <= 0) throw new Error("Enter your training pace in M:SS format (e.g., 5:30).");

  if (longestRunKm <= 0) throw new Error("Enter your longest recent run distance in km.");

  // Condition adjustments
  const conditionPenalty = conditions === "Hot" ? 0.08 : conditions === "Warm" ? 0.04 : 0;
  const terrainPenalty = terrain === "Hilly" ? 0.05 : terrain === "Mixed" ? 0.025 : 0;
  const totalPenalty = conditionPenalty + terrainPenalty;

  // Adjust target for conditions (what you need to run to hit the clock time)
  const adjustedTargetSeconds = targetSeconds; // Target is what the clock says
  const basePacePerKm = adjustedTargetSeconds / distanceKm;

  // Riegel prediction: predict race time from training data
  // Use longest run at training pace as the reference performance
  const riegelExponent = 1.06;
  const trainingTimeForLongest = trainingPaceSec * longestRunKm;
  const predictedRaceSeconds = trainingTimeForLongest * Math.pow(distanceKm / longestRunKm, riegelExponent);
  const predictedPacePerKm = predictedRaceSeconds / distanceKm;

  // Feasibility check
  const targetPacePerKm = targetSeconds / distanceKm;
  const isFeasible = targetPacePerKm >= predictedPacePerKm * 0.95; // 5% margin
  const paceGap = predictedPacePerKm - targetPacePerKm; // positive = target is faster than predicted

  // Generate per-km splits for 3 strategies
  const totalKm = Math.ceil(distanceKm);
  const lastKmFraction = distanceKm - Math.floor(distanceKm);

  type Split = { km: number; even: number; negative: number; positive: number };
  const splits: Split[] = [];

  for (let km = 1; km <= totalKm; km++) {
    const progress = km / totalKm; // 0 to 1
    const isLastPartial = km === totalKm && lastKmFraction > 0;

    // Even splits: constant pace with slight condition adjustment in later kms
    const evenPace = basePacePerKm * (1 + totalPenalty * Math.min(1, progress * 1.5));

    // Negative splits: start 5% slower, finish 5% faster
    const negFactor = 1.05 - (0.10 * progress);
    const negativePace = basePacePerKm * negFactor * (1 + totalPenalty * Math.min(1, progress * 1.2));

    // Positive splits: the wall pattern - start fast, fade after 60-70%
    let posFactor: number;
    if (progress < 0.3) {
      posFactor = 0.95; // Going out too fast
    } else if (progress < 0.6) {
      posFactor = 0.98; // Slightly fast
    } else if (progress < 0.75) {
      posFactor = 1.02; // Starting to fade
    } else if (progress < 0.85) {
      posFactor = 1.08 + (progress - 0.75) * 0.5; // The wall
    } else {
      posFactor = 1.15 + (progress - 0.85) * 0.8; // Deep fade
    }
    const positivePace = basePacePerKm * posFactor * (1 + totalPenalty * Math.min(1, progress * 2));

    splits.push({
      km,
      even: isLastPartial ? evenPace : evenPace,
      negative: isLastPartial ? negativePace : negativePace,
      positive: isLastPartial ? positivePace : positivePace,
    });
  }

  // Compute finish times for each strategy
  const evenTotal = splits.reduce((s, sp) => s + sp.even, 0) * (lastKmFraction > 0 ? (distanceKm / totalKm) : 1);
  const negTotal = splits.reduce((s, sp) => s + sp.negative, 0) * (lastKmFraction > 0 ? (distanceKm / totalKm) : 1);
  const posTotal = splits.reduce((s, sp) => s + sp.positive, 0) * (lastKmFraction > 0 ? (distanceKm / totalKm) : 1);

  // Fueling schedule (for races > 10K)
  const fuelingItems: { km: number; action: string }[] = [];
  if (distanceKm > 10) {
    // First gel at ~45 minutes, then every 30-45 min
    const paceMinPerKm = basePacePerKm / 60;
    const firstGelKm = Math.round(45 / paceMinPerKm);
    const gelInterval = Math.round(35 / paceMinPerKm);
    const waterInterval = Math.round(20 / paceMinPerKm);

    for (let km = Math.max(3, Math.round(waterInterval)); km <= totalKm; km += Math.max(2, Math.round(waterInterval))) {
      if (km <= totalKm) fuelingItems.push({ km, action: "Water (2-3 sips)" });
    }
    for (let km = firstGelKm; km <= totalKm - 2; km += gelInterval) {
      fuelingItems.push({ km, action: "Energy gel + water" });
    }
    fuelingItems.sort((a, b) => a.km - b.km);
  }

  // HR zone predictions per segment
  const segments = [
    { label: "Start (km 1-3)", intensity: 0.70 },
    { label: `Early (km 4-${Math.round(totalKm * 0.3)})`, intensity: 0.75 },
    { label: `Middle (km ${Math.round(totalKm * 0.3) + 1}-${Math.round(totalKm * 0.6)})`, intensity: 0.80 },
    { label: `Late (km ${Math.round(totalKm * 0.6) + 1}-${Math.round(totalKm * 0.85)})`, intensity: 0.85 },
    { label: `Finish (km ${Math.round(totalKm * 0.85) + 1}-${totalKm})`, intensity: 0.90 },
  ];

  // Wall prediction for positive splits
  const wallKm = Math.round(distanceKm * 0.72);

  // --- Build result ---
  const feasibilityItems = [];
  if (!isFeasible) {
    feasibilityItems.push({
      title: "Target pace may be unrealistic",
      body: `Your training (${formatPace(trainingPaceSec)}/km over ${longestRunKm}km) predicts a race time of ${formatTime(Math.round(predictedRaceSeconds))} using the Riegel formula. Your target of ${formatTime(targetSeconds)} requires running ${formatPace(targetPacePerKm)}/km, which is ${Math.abs(Math.round(paceGap))} sec/km faster than predicted. Risk of hitting the wall is very high.`,
      severity: "high" as Severity,
    });
  } else {
    feasibilityItems.push({
      title: "Target appears achievable",
      body: `Riegel prediction: ${formatTime(Math.round(predictedRaceSeconds))}. Your target of ${formatTime(targetSeconds)} is within reach based on ${longestRunKm}km at ${formatPace(trainingPaceSec)}/km.`,
      severity: "low" as Severity,
    });
  }

  // Longest run check
  if (longestRunKm < distanceKm * 0.6) {
    feasibilityItems.push({
      title: "Longest run is short for this distance",
      body: `Your longest run (${longestRunKm}km) is only ${Math.round((longestRunKm / distanceKm) * 100)}% of race distance. For a ${distanceKey === "Custom" ? distanceKm + "km" : distanceKey}, you should have run at least ${Math.round(distanceKm * 0.7)}km in training.`,
      severity: "medium" as Severity,
    });
  }

  const conditionItems = [];
  if (conditionPenalty > 0) {
    conditionItems.push({
      title: `${conditions} conditions: +${Math.round(conditionPenalty * 100)}% time penalty`,
      body: `Expected to add ~${formatTime(Math.round(targetSeconds * conditionPenalty))} to your finish time. Hydration becomes critical. Start slower than you think.`,
      severity: conditionPenalty > 0.05 ? "medium" as Severity : "low" as Severity,
    });
  }
  if (terrainPenalty > 0) {
    conditionItems.push({
      title: `${terrain} terrain: +${Math.round(terrainPenalty * 100)}% time penalty`,
      body: `Hills add ~${formatTime(Math.round(targetSeconds * terrainPenalty))} overall. Ease off on uphills (save 10-15 sec/km) and recover on downhills.`,
      severity: "low" as Severity,
    });
  }

  const headline = isFeasible
    ? `${distanceKey === "Custom" ? distanceKm + "km" : distanceKey} in ${formatTime(targetSeconds)} is achievable. Even pace: ${formatPace(Math.round(basePacePerKm))}/km. ${totalPenalty > 0 ? `Adjusted for ${conditions.toLowerCase()} and ${terrain.toLowerCase()} conditions.` : ""}`
    : `Warning: ${formatTime(targetSeconds)} for ${distanceKey === "Custom" ? distanceKm + "km" : distanceKey} is faster than your training predicts (${formatTime(Math.round(predictedRaceSeconds))}). High risk of hitting the wall at km ${wallKm}.`;

  return {
    headline,
    score: {
      label: "Race readiness",
      value: Math.max(0, Math.min(100, isFeasible ? (longestRunKm >= distanceKm * 0.7 ? 85 : 65) - Math.round(totalPenalty * 100) : 35)),
      max: 100,
      band: isFeasible ? (longestRunKm >= distanceKm * 0.7 ? "good" : "warn") : "bad",
    },
    metrics: [
      { label: "Target pace", value: formatPace(Math.round(targetPacePerKm)) + "/km", hint: formatTime(targetSeconds) },
      { label: "Predicted", value: formatTime(Math.round(predictedRaceSeconds)), hint: "Riegel formula" },
      { label: "Condition penalty", value: totalPenalty > 0 ? `+${Math.round(totalPenalty * 100)}%` : "None", hint: `${conditions}, ${terrain}` },
      { label: "Wall risk km", value: String(wallKm), hint: "positive split fade point" },
    ],
    table: {
      columns: ["Km", "Even Split", "Negative Split", "Positive Split", "HR Zone"],
      rows: splits.map((s, i) => {
        const progress = (i + 1) / totalKm;
        const zone = hrZone(0.65 + progress * 0.25);
        return [
          String(s.km),
          formatPace(Math.round(s.even)) + "/km",
          formatPace(Math.round(s.negative)) + "/km",
          formatPace(Math.round(s.positive)) + "/km",
          zone,
        ];
      }),
    },
    sections: [
      {
        title: "Feasibility Assessment",
        items: feasibilityItems,
      },
      ...(conditionItems.length > 0 ? [{
        title: "Condition Adjustments",
        items: conditionItems,
      }] : []),
      {
        title: "Strategy Comparison",
        items: [
          {
            title: "Even splits (recommended for flat courses)",
            body: `Constant ${formatPace(Math.round(basePacePerKm))}/km throughout. Estimated finish: ${formatTime(Math.round(evenTotal))}. Physiologically efficient but requires discipline to hold back early.`,
            severity: "low" as Severity,
          },
          {
            title: "Negative splits (recommended for hilly/experienced)",
            body: `Start at ${formatPace(Math.round(splits[0].negative))}/km, finish at ${formatPace(Math.round(splits[splits.length - 1].negative))}/km. Estimated finish: ${formatTime(Math.round(negTotal))}. Protects against the wall. Psychologically rewarding to pass people in the second half.`,
            severity: "low" as Severity,
          },
          {
            title: "Positive splits (what happens without discipline)",
            body: `Start at ${formatPace(Math.round(splits[0].positive))}/km, wall hits around km ${wallKm}, finish struggling at ${formatPace(Math.round(splits[splits.length - 1].positive))}/km. Estimated finish: ${formatTime(Math.round(posTotal))}. This is what happens when you ignore the plan.`,
            severity: "medium" as Severity,
          },
        ],
      },
      {
        title: "Heart Rate Zones by Segment",
        items: segments.map((seg) => ({
          title: `${seg.label}: ${hrZone(seg.intensity)}`,
          body: `Target intensity: ${Math.round(seg.intensity * 100)}% of max HR. ${seg.intensity >= 0.85 ? "This is where it hurts. If you are here before the final 20%, you went out too fast." : "Controlled aerobic effort. Conversation should be just possible."}`,
          severity: seg.intensity >= 0.85 ? "medium" as Severity : "low" as Severity,
        })),
      },
      ...(fuelingItems.length > 0 ? [{
        title: "Fueling Schedule",
        items: fuelingItems.map((f) => ({
          title: `Km ${f.km}: ${f.action}`,
          body: f.action.includes("gel") ? "Take with water, not on its own. If your stomach is already upset, switch to water only." : "Small sips. Do not skip hydration stations even if you feel fine.",
          severity: "low" as Severity,
        })),
      }] : []),
      {
        title: "The Hard Patch",
        items: [{
          title: `Expect difficulty around km ${wallKm}-${Math.min(totalKm, wallKm + 4)}`,
          body: `This is where glycogen depletion begins for most runners at this distance. If you are on the even or negative split plan, this is where it pays off. Mantras, cadence focus, and the next gel station are your tools here. The last 3km will feel better again as the finish line effect kicks in.`,
          severity: "medium" as Severity,
        }],
      },
    ],
    json: {
      distanceKm,
      targetTimeSeconds: targetSeconds,
      targetPacePerKm: formatPace(Math.round(targetPacePerKm)),
      predictedTimeSeconds: Math.round(predictedRaceSeconds),
      predictedPace: formatPace(Math.round(predictedPacePerKm)),
      isFeasible,
      conditionPenaltyPct: Math.round(totalPenalty * 100),
      wallKm,
      strategies: {
        even: { estimatedFinish: formatTime(Math.round(evenTotal)), avgPace: formatPace(Math.round(basePacePerKm)) },
        negative: { estimatedFinish: formatTime(Math.round(negTotal)), startPace: formatPace(Math.round(splits[0].negative)), endPace: formatPace(Math.round(splits[splits.length - 1].negative)) },
        positive: { estimatedFinish: formatTime(Math.round(posTotal)), startPace: formatPace(Math.round(splits[0].positive)), fadePace: formatPace(Math.round(splits[splits.length - 1].positive)) },
      },
      splits: splits.map((s) => ({
        km: s.km,
        even: formatPace(Math.round(s.even)),
        negative: formatPace(Math.round(s.negative)),
        positive: formatPace(Math.round(s.positive)),
      })),
      fueling: fuelingItems,
    },
  };
}
