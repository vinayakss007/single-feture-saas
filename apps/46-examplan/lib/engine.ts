import type { RunInput, RunResult, Severity } from "./types.ts";

/**
 * ExamPlan engine - Creates weighted study plan with day-by-day calendar,
 * revision blocks, and insufficiency warnings.
 */

type Subject = { name: string; chapters: number; difficulty: number; weight: number; hoursNeeded: number };

const HOURS_PER_CHAPTER_BASE = 3; // base hours per chapter at difficulty 1
const REVISION_FRACTION = 0.30; // 30% of total time for revision

function parseSubjects(raw: string): Subject[] {
  const lines = raw.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const subjects: Subject[] = [];
  for (const line of lines) {
    const parts = line.split(",").map((p) => p.trim());
    if (parts.length < 3) continue;
    const name = parts[0];
    const chapters = Number(parts[1]);
    const difficulty = Number(parts[2]);
    if (!name || isNaN(chapters) || isNaN(difficulty)) continue;
    const weight = chapters * difficulty;
    const hoursNeeded = chapters * HOURS_PER_CHAPTER_BASE * (0.5 + difficulty * 0.3); // scales with difficulty
    subjects.push({ name, chapters, difficulty: Math.min(5, Math.max(1, difficulty)), weight, hoursNeeded });
  }
  return subjects;
}

export function run(input: RunInput): RunResult {
  const examDateStr = (input.examDate ?? "").trim();
  const subjectsRaw = (input.subjects ?? "").trim();
  const hoursPerDayStr = (input.hoursPerDay ?? "").trim();
  const daysAvailableStr = (input.daysAvailable ?? "").trim();

  if (!examDateStr) throw new Error("Enter your exam date in YYYY-MM-DD format to calculate available study days.");
  if (!subjectsRaw) throw new Error("Enter subjects with chapter count and difficulty. Format: name,chapters,difficulty(1-5) per line.");
  if (!hoursPerDayStr) throw new Error("Enter available study hours per day (be realistic: 6-8 is sustainable).");

  const examDate = new Date(examDateStr);
  if (isNaN(examDate.getTime())) throw new Error("Invalid exam date. Use YYYY-MM-DD format.");

  const hoursPerDay = Number(hoursPerDayStr);
  if (isNaN(hoursPerDay) || hoursPerDay < 1 || hoursPerDay > 16) throw new Error("Study hours per day should be between 1 and 16.");

  const subjects = parseSubjects(subjectsRaw);
  if (subjects.length === 0) throw new Error("Could not parse any subjects. Format: name,chapters,difficulty per line (e.g., Physics,15,5).");

  // Calculate days available
  let daysAvailable: number;
  if (daysAvailableStr && Number(daysAvailableStr) > 0) {
    daysAvailable = Number(daysAvailableStr);
  } else {
    const today = new Date("2025-01-01"); // fixed reference for determinism
    const diffMs = examDate.getTime() - today.getTime();
    daysAvailable = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }
  if (daysAvailable > 365) daysAvailable = 365;

  // Total hours available
  const totalHoursAvailable = daysAvailable * hoursPerDay;
  const studyDays = Math.ceil(daysAvailable * (1 - REVISION_FRACTION));
  const revisionDays = daysAvailable - studyDays;
  const studyHours = studyDays * hoursPerDay;
  const revisionHours = revisionDays * hoursPerDay;

  // Total hours needed (first pass)
  const totalHoursNeeded = subjects.reduce((s, sub) => s + sub.hoursNeeded, 0);
  const totalWeight = subjects.reduce((s, sub) => s + sub.weight, 0);

  // Allocate study hours proportionally by weight
  const allocated = subjects.map((sub) => {
    const fraction = sub.weight / totalWeight;
    const allocatedHours = Math.round(studyHours * fraction * 10) / 10;
    const revisionAllocated = Math.round(revisionHours * fraction * 10) / 10;
    const totalAllocated = allocatedHours + revisionAllocated;
    const hoursPerChapter = allocatedHours / sub.chapters;
    return { ...sub, allocatedHours, revisionAllocated, totalAllocated, hoursPerChapter, fraction };
  });

  // Sort by criticality (difficulty * chapters / allocated)
  const critical = [...allocated].sort((a, b) => {
    const aRisk = (a.difficulty * a.chapters) / a.allocatedHours;
    const bRisk = (b.difficulty * b.chapters) / b.allocatedHours;
    return bRisk - aRisk;
  });

  // Insufficiency check
  const isInsufficient = totalHoursNeeded > studyHours;
  const shortfall = Math.max(0, totalHoursNeeded - studyHours);
  const additionalHoursPerDay = shortfall > 0 ? Math.ceil((shortfall / studyDays) * 10) / 10 : 0;

  // Generate day-by-day calendar (first 14 days as sample)
  const calendar: { day: number; subjects: { name: string; hours: number }[] }[] = [];
  const maxCalendarDays = Math.min(studyDays, 14); // show first 14 days
  const subjectsPerDay = Math.min(3, subjects.length); // max 3 subjects per day for variety

  for (let d = 0; d < maxCalendarDays; d++) {
    const daySubjects: { name: string; hours: number }[] = [];
    // Rotate subjects so each day has different ones
    for (let s = 0; s < subjectsPerDay; s++) {
      const idx = (d * subjectsPerDay + s) % allocated.length;
      const sub = allocated[idx];
      const hours = Math.round((hoursPerDay / subjectsPerDay) * 10) / 10;
      daySubjects.push({ name: sub.name, hours });
    }
    calendar.push({ day: d + 1, subjects: daySubjects });
  }

  // Headline
  const headline = `${daysAvailable} days to exam | ${studyDays} study days + ${revisionDays} revision days | ${totalHoursAvailable} total hours at ${hoursPerDay}h/day. ${isInsufficient ? `WARNING: ${Math.round(shortfall)} hours short. Need ${additionalHoursPerDay} more hours/day.` : "Sufficient time if you start now."}`;

  const band = isInsufficient ? "bad" : shortfall === 0 && totalHoursAvailable > totalHoursNeeded * 1.2 ? "good" : "warn";

  return {
    headline,
    score: {
      label: "Time Sufficiency",
      value: Math.min(100, Math.round((studyHours / Math.max(1, totalHoursNeeded)) * 100)),
      max: 100,
      band,
    },
    metrics: [
      { label: "Days to exam", value: String(daysAvailable), hint: `${studyDays} study + ${revisionDays} revision` },
      { label: "Total hours", value: String(totalHoursAvailable), hint: `${hoursPerDay}h/day` },
      { label: "Hours needed", value: String(Math.round(totalHoursNeeded)), hint: "First pass only" },
      { label: "Subjects", value: String(subjects.length), hint: `${subjects.reduce((s, sub) => s + sub.chapters, 0)} chapters total` },
    ],
    sections: [
      {
        title: "Hour Allocation Per Subject",
        items: allocated.map((a) => ({
          title: `${a.name}: ${a.allocatedHours}h study + ${a.revisionAllocated}h revision = ${a.totalAllocated}h total`,
          body: `${a.chapters} chapters, difficulty ${a.difficulty}/5, weight ${a.weight}. Hours per chapter: ${a.hoursPerChapter.toFixed(1)}h. Share: ${(a.fraction * 100).toFixed(0)}% of total.`,
          severity: (a.difficulty >= 4 ? "medium" : "low") as Severity,
          tag: a.difficulty >= 4 ? "hard" : a.difficulty >= 3 ? "medium" : "easy",
        })),
      },
      {
        title: "Critical Subjects (Highest Risk)",
        items: critical.slice(0, 3).map((c, i) => ({
          title: `#${i + 1} ${c.name} (difficulty ${c.difficulty}, ${c.chapters} chapters)`,
          body: `High difficulty-to-time ratio. Any delay in this subject disproportionately affects exam readiness. Prioritise in the first study phase.`,
          severity: (i === 0 ? "high" : "medium") as Severity,
        })),
      },
      ...(isInsufficient ? [{
        title: "INSUFFICIENCY WARNING",
        items: [
          {
            title: `${Math.round(shortfall)} hours short of first-pass coverage`,
            body: `You need ${Math.round(totalHoursNeeded)} study hours but only have ${Math.round(studyHours)} (after reserving ${revisionDays} days for revision). Options: add ${additionalHoursPerDay} hours/day, start ${Math.ceil(shortfall / hoursPerDay)} days earlier, or reduce syllabus scope.`,
            severity: "high" as Severity,
          },
          {
            title: `Required: ${(hoursPerDay + additionalHoursPerDay).toFixed(1)} hours/day to cover everything`,
            body: "If this is not feasible, prioritise high-weight subjects and accept selective study of easier subjects (focus on most-likely exam topics).",
            severity: "high" as Severity,
          },
        ],
      }] : []),
      {
        title: `Study Calendar (First ${maxCalendarDays} Days)`,
        items: calendar.map((day) => ({
          title: `Day ${day.day}: ${day.subjects.map((s) => `${s.name} (${s.hours}h)`).join(" + ")}`,
          body: `Total: ${hoursPerDay}h. Subjects rotated to avoid monotony and improve retention through interleaving.`,
          severity: "low" as Severity,
        })),
      },
      {
        title: "Revision Phase Strategy",
        items: [
          { title: `Days ${studyDays + 1}-${daysAvailable}: Pure revision (${revisionDays} days, ${Math.round(revisionHours)}h)`, body: "No new topics. Only review, practice problems, and past papers. Revision is non-negotiable for retention.", severity: "low" as Severity },
          ...allocated.slice(0, 3).map((a) => ({
            title: `${a.name}: ${a.revisionAllocated}h revision allocated`,
            body: `Focus on: formulas/theorems, solved examples, previous year questions. Active recall (close book and write) is 3x more effective than re-reading.`,
            severity: "low" as Severity,
          })),
        ],
      },
    ],
    table: {
      columns: ["Subject", "Chapters", "Difficulty", "Study Hours", "Revision Hours", "Total", "Per Chapter"],
      rows: allocated.map((a) => [
        a.name,
        String(a.chapters),
        `${a.difficulty}/5`,
        String(a.allocatedHours),
        String(a.revisionAllocated),
        String(a.totalAllocated),
        `${a.hoursPerChapter.toFixed(1)}h`,
      ]),
    },
    json: {
      examDate: examDateStr,
      daysAvailable,
      studyDays,
      revisionDays,
      hoursPerDay,
      totalHoursAvailable,
      totalHoursNeeded: Math.round(totalHoursNeeded),
      isInsufficient,
      shortfallHours: Math.round(shortfall),
      additionalHoursNeeded: additionalHoursPerDay,
      subjects: allocated.map((a) => ({
        name: a.name,
        chapters: a.chapters,
        difficulty: a.difficulty,
        weight: a.weight,
        studyHours: a.allocatedHours,
        revisionHours: a.revisionAllocated,
        totalHours: a.totalAllocated,
        sharePercent: Math.round(a.fraction * 100),
      })),
      criticalSubjects: critical.slice(0, 3).map((c) => c.name),
      calendarSample: calendar,
    },
  };
}
