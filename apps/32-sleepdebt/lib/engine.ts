import type { RunInput, RunResult, Severity } from "./types.ts";

/**
 * SleepDebt engine - Computes cumulative sleep debt from a sleep log, classifies
 * severity, models recovery with diminishing returns, and recommends tonight's bedtime.
 */

type SleepEntry = {
  day: string;
  bedtime: string;
  wakeTime: string;
  hoursSlept: number;
  deficit: number;
};

function parseTime(t: string): { h: number; m: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return { h, m };
}

function computeHoursSlept(bedtime: string, wakeTime: string): number | null {
  const bed = parseTime(bedtime);
  const wake = parseTime(wakeTime);
  if (!bed || !wake) return null;

  let bedMinutes = bed.h * 60 + bed.m;
  let wakeMinutes = wake.h * 60 + wake.m;

  // If bedtime is in the evening and wake is in the morning, crosses midnight
  if (bedMinutes > wakeMinutes) {
    wakeMinutes += 24 * 60;
  }

  const diff = (wakeMinutes - bedMinutes) / 60;
  // Sanity check: sleep should be between 1 and 16 hours
  if (diff < 1 || diff > 16) return null;
  return diff;
}

function parseSleepLog(raw: string): SleepEntry[] | null {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length === 0) return null;

  const entries: SleepEntry[] = [];

  for (const line of lines) {
    // Flexible parsing: "Mon: 23:30-06:00" or "23:30-06:00" or "23:30 - 06:00"
    const match = /^(?:([A-Za-z]+)[:\s]*)?(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/.exec(line);
    if (!match) continue;

    const day = match[1] || `Day ${entries.length + 1}`;
    const bedtime = match[2];
    const wakeTime = match[3];
    const hoursSlept = computeHoursSlept(bedtime, wakeTime);
    if (hoursSlept === null) continue;

    entries.push({ day, bedtime, wakeTime, hoursSlept, deficit: 0 });
  }

  return entries.length > 0 ? entries : null;
}

export function run(input: RunInput): RunResult {
  const logRaw = (input.sleepLog ?? "").trim();
  if (!logRaw) throw new Error("Enter your sleep log with bedtime and wake time for each day. Format: HH:MM-HH:MM, one entry per line.");

  const entries = parseSleepLog(logRaw);
  if (!entries || entries.length < 3) {
    throw new Error("Could not parse enough sleep entries. Need at least 3 days. Format each line as: Day: HH:MM-HH:MM (e.g., Mon: 23:30-06:00).");
  }

  const targetHours = Number(input.targetHours) || 8;
  const weekendRecoveryHours = Number(input.weekendRecoveryHours) || 2;
  const wakeTimeStr = (input.wakeTime ?? "").trim();

  // Compute per-day deficits
  let cumulativeDebt = 0;
  for (const entry of entries) {
    entry.deficit = targetHours - entry.hoursSlept;
    cumulativeDebt += entry.deficit;
  }
  // Debt cannot be negative (oversleep does not create a "bank")
  cumulativeDebt = Math.max(0, cumulativeDebt);

  // Rolling average
  const totalSlept = entries.reduce((sum, e) => sum + e.hoursSlept, 0);
  const avgSlept = totalSlept / entries.length;

  // 7-day rolling average (or all if less than 7)
  const last7 = entries.slice(-Math.min(7, entries.length));
  const rollingAvg = last7.reduce((sum, e) => sum + e.hoursSlept, 0) / last7.length;

  // Severity classification
  let severity: "manageable" | "concerning" | "chronic";
  let severityDetail: string;
  if (cumulativeDebt < 5) {
    severity = "manageable";
    severityDetail = "Under 5 hours of accumulated debt. Recovery is straightforward with a few early nights.";
  } else if (cumulativeDebt <= 10) {
    severity = "concerning";
    severityDetail = "5-10 hours of debt. Cognitive performance is measurably impaired. Recovery will take 1-2 weeks of consistent extra sleep.";
  } else {
    severity = "chronic";
    severityDetail = "Over 10 hours of debt. This level of sleep deprivation is associated with metabolic, immune, and cardiovascular effects. Full recovery may take 3-4 weeks.";
  }

  // Consecutive short nights (< 6 hours)
  let maxConsecutiveShort = 0;
  let currentStreak = 0;
  let shortNightCount = 0;
  const shortThreshold = 6;

  for (const entry of entries) {
    if (entry.hoursSlept < shortThreshold) {
      currentStreak++;
      shortNightCount++;
      maxConsecutiveShort = Math.max(maxConsecutiveShort, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  const shortNightWarning = maxConsecutiveShort >= 3;

  // Recovery plan with diminishing returns
  // Model: each extra hour of sleep recovers some fraction of debt
  // First hour: 90% efficiency, subsequent hours in same night: 70% efficiency
  // Cap at 1.5 extra hours per night to avoid circadian disruption
  const maxExtraPerNight = 1.5;
  const firstHourEfficiency = 0.9;
  const subsequentEfficiency = 0.7;

  // Effective recovery per night if sleeping maxExtraPerNight extra
  const effectiveRecoveryPerNight =
    Math.min(1, maxExtraPerNight) * firstHourEfficiency +
    Math.max(0, maxExtraPerNight - 1) * subsequentEfficiency;

  // Weekday recovery: can add ~1 extra hour
  const weekdayExtraHours = 1.0;
  const weekdayRecovery = Math.min(1, weekdayExtraHours) * firstHourEfficiency;

  // Weekend recovery: can add more
  const weekendEffective =
    Math.min(1, weekendRecoveryHours) * firstHourEfficiency +
    Math.max(0, Math.min(weekendRecoveryHours, maxExtraPerNight) - 1) * subsequentEfficiency;

  // Weekly recovery potential: 5 weekdays + 2 weekends
  const weeklyRecovery = (weekdayRecovery * 5) + (weekendEffective * 2);
  const daysToRecover = weeklyRecovery > 0 ? Math.ceil((cumulativeDebt / weeklyRecovery) * 7) : 999;

  // Tonight's bedtime recommendation
  let tonightBedtime = "";
  let tonightDetail = "";
  if (wakeTimeStr) {
    const wake = parseTime(wakeTimeStr);
    if (wake) {
      // Recommend target hours + recovery extra (capped at 1.5h extra)
      const extraTonight = Math.min(maxExtraPerNight, cumulativeDebt > 0 ? 1.5 : 0);
      const totalSleepNeeded = targetHours + extraTonight;
      const totalMinutes = Math.round(totalSleepNeeded * 60);

      // Work backward from wake time, add 15 min for falling asleep
      const fallAsleepBuffer = 15;
      let bedMinutes = (wake.h * 60 + wake.m) - totalMinutes - fallAsleepBuffer;
      if (bedMinutes < 0) bedMinutes += 24 * 60;

      const bedH = Math.floor(bedMinutes / 60) % 24;
      const bedM = bedMinutes % 60;
      tonightBedtime = `${String(bedH).padStart(2, "0")}:${String(bedM).padStart(2, "0")}`;
      tonightDetail = `To wake at ${wakeTimeStr} with ${totalSleepNeeded.toFixed(1)}h of sleep (${targetHours}h target + ${extraTonight.toFixed(1)}h recovery), be in bed by ${tonightBedtime} (includes 15 min to fall asleep).`;
    }
  }

  // Trend direction
  const firstHalf = entries.slice(0, Math.floor(entries.length / 2));
  const secondHalf = entries.slice(Math.floor(entries.length / 2));
  const firstHalfAvg = firstHalf.reduce((s, e) => s + e.hoursSlept, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((s, e) => s + e.hoursSlept, 0) / secondHalf.length;
  const trend = secondHalfAvg - firstHalfAvg;
  const trendLabel = trend > 0.25 ? "improving" : trend < -0.25 ? "worsening" : "stable";

  // --- Build result ---
  const headline =
    cumulativeDebt < 2
      ? `You are nearly square. Only ${cumulativeDebt.toFixed(1)}h of sleep debt across ${entries.length} days. Keep it up.`
      : `You owe yourself ${cumulativeDebt.toFixed(1)} hours of sleep. Severity: ${severity}. ${daysToRecover <= 30 ? `Recoverable in ~${daysToRecover} days.` : "This will take weeks of consistent effort."}`;

  return {
    headline,
    score: {
      label: "Sleep health score",
      value: Math.max(0, Math.min(100, Math.round(100 - (cumulativeDebt * 5) - (maxConsecutiveShort >= 3 ? 15 : 0)))),
      max: 100,
      band: severity === "manageable" ? "good" : severity === "concerning" ? "warn" : "bad",
    },
    metrics: [
      { label: "Total debt", value: `${cumulativeDebt.toFixed(1)}h`, hint: `across ${entries.length} days` },
      { label: "Rolling avg", value: `${rollingAvg.toFixed(1)}h`, hint: `target: ${targetHours}h` },
      { label: "Recovery days", value: daysToRecover <= 99 ? String(daysToRecover) : "30+", hint: "to clear debt" },
      { label: "Short nights", value: String(shortNightCount), hint: `max streak: ${maxConsecutiveShort}` },
    ],
    table: {
      columns: ["Day", "Bedtime", "Wake", "Hours", "Deficit", "Cumulative"],
      rows: (() => {
        let running = 0;
        return entries.map((e) => {
          running = Math.max(0, running + e.deficit);
          return [
            e.day,
            e.bedtime,
            e.wakeTime,
            e.hoursSlept.toFixed(1),
            e.deficit > 0 ? `+${e.deficit.toFixed(1)}h` : e.deficit === 0 ? "0" : `${e.deficit.toFixed(1)}h`,
            `${running.toFixed(1)}h`,
          ];
        });
      })(),
    },
    sections: [
      {
        title: "Severity Assessment",
        items: [
          {
            title: `${severity.toUpperCase()}: ${cumulativeDebt.toFixed(1)} hours of debt`,
            body: severityDetail,
            severity: severity === "manageable" ? "low" : severity === "concerning" ? "medium" : "high",
          },
        ],
      },
      {
        title: "Health Flags",
        items: [
          ...(shortNightWarning ? [{
            title: `${maxConsecutiveShort} consecutive nights below 6 hours`,
            body: `You had ${maxConsecutiveShort} nights in a row with less than 6 hours of sleep. Research shows this causes cumulative cognitive impairment equivalent to 1-2 nights of total sleep deprivation, even if you do not feel proportionally sleepier.`,
            severity: "high" as Severity,
          }] : []),
          ...(trendLabel === "worsening" ? [{
            title: "Sleep trend is worsening",
            body: `Your average dropped from ${firstHalfAvg.toFixed(1)}h in the first half of your log to ${secondHalfAvg.toFixed(1)}h in the second half. Address this before the debt compounds further.`,
            severity: "medium" as Severity,
          }] : []),
          ...(avgSlept < 6 ? [{
            title: "Average sleep is critically low",
            body: `Your overall average of ${avgSlept.toFixed(1)}h per night is below the minimum recommended for adults (7h). Sustained sleep below 6h is associated with increased cardiovascular risk and impaired immune function.`,
            severity: "high" as Severity,
          }] : []),
          ...(!shortNightWarning && trendLabel !== "worsening" && avgSlept >= 6 ? [{
            title: "No critical flags",
            body: `No consecutive short-night streaks detected and your trend is ${trendLabel}.`,
            severity: "low" as Severity,
          }] : []),
        ],
      },
      {
        title: "Recovery Plan",
        items: [
          {
            title: `Estimated recovery: ${daysToRecover <= 99 ? daysToRecover + " days" : "4+ weeks"}`,
            body: `Based on ${weekdayExtraHours}h extra on weekdays and ${weekendRecoveryHours}h extra on weekends, with diminishing returns (first extra hour is ${Math.round(firstHourEfficiency * 100)}% efficient, subsequent hours ${Math.round(subsequentEfficiency * 100)}%). Weekly effective recovery: ${weeklyRecovery.toFixed(1)}h.`,
            severity: "low" as Severity,
          },
          {
            title: "Recovery strategy",
            body: severity === "manageable"
              ? "Add 30-60 minutes of sleep per night for the next week. Go to bed earlier rather than sleeping later to maintain circadian rhythm."
              : severity === "concerning"
                ? "Add 1-1.5 hours per night consistently. Avoid sleeping more than 2h extra in a single night as this disrupts your body clock. Prioritise consistent bedtimes over long weekend lie-ins."
                : "Recovery will be slow. Prioritise 1.5h extra per night and maintain strict sleep hygiene. Consider consulting a sleep specialist if this pattern has persisted for more than a month.",
            severity: severity === "chronic" ? "high" : "medium",
          },
        ],
      },
      {
        title: "Tonight's Recommendation",
        items: tonightBedtime
          ? [{
            title: `Be in bed by ${tonightBedtime}`,
            body: tonightDetail,
            severity: "low" as Severity,
          }]
          : [{
            title: "Provide a wake time for a bedtime recommendation",
            body: "Enter your target wake time tomorrow to get a specific bedtime that accounts for your current debt and recovery capacity.",
            severity: "low" as Severity,
          }],
      },
      {
        title: "Trend Analysis",
        items: [{
          title: `Trend: ${trendLabel}`,
          body: `First half average: ${firstHalfAvg.toFixed(1)}h. Second half average: ${secondHalfAvg.toFixed(1)}h. Difference: ${trend > 0 ? "+" : ""}${(trend * 60).toFixed(0)} minutes.`,
          severity: trendLabel === "worsening" ? "medium" : "low",
        }],
      },
    ],
    json: {
      cumulativeDebt: Number(cumulativeDebt.toFixed(1)),
      severity,
      avgSleepHours: Number(avgSlept.toFixed(2)),
      rollingAvg7Day: Number(rollingAvg.toFixed(2)),
      targetHours,
      daysToRecover,
      trend: trendLabel,
      trendDelta: Number(trend.toFixed(2)),
      maxConsecutiveShortNights: maxConsecutiveShort,
      shortNightCount,
      tonightBedtime: tonightBedtime || null,
      entries: entries.map((e) => ({
        day: e.day,
        hoursSlept: Number(e.hoursSlept.toFixed(2)),
        deficit: Number(e.deficit.toFixed(2)),
      })),
      recoveryPlan: {
        weekdayExtraHours,
        weekendExtraHours: weekendRecoveryHours,
        effectiveRecoveryPerWeek: Number(weeklyRecovery.toFixed(1)),
        estimatedDays: daysToRecover,
      },
    },
  };
}
