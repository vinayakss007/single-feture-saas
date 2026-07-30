import type { ResultItem, RunInput, RunResult, Severity } from "./types.ts";

/**
 * Lab report organiser.
 *
 * This flags values against published reference ranges and shows how they have
 * moved across dates. It does not interpret them, does not suggest causes, and does
 * not name conditions — those are acts of clinical judgement, and a tool that
 * performed them from a text box would be both wrong and harmful.
 *
 * The distinction is not a disclaimer bolted on the end; it is the design. Every
 * output is either an arithmetic fact ("this is 18% above the upper limit") or a
 * comparison across the user's own history. Nothing in here explains *why*.
 */

type Range = {
  /** canonical test name */
  name: string;
  unit: string;
  low: number;
  high: number;
  /** patterns that identify the test in a pasted report */
  match: RegExp;
  /** sex-specific override, since several ranges genuinely differ */
  female?: { low: number; high: number };
  /** how far outside the range is worth marking as urgent rather than merely out */
  criticalLow?: number;
  criticalHigh?: number;
  group: string;
};

/**
 * Reference ranges as commonly published by Indian laboratories. Ranges vary
 * between labs and by assay, which is why the report the value came from always
 * wins — the output says so per finding rather than once in small print.
 */
const RANGES: Range[] = [
  // Haematology
  { name: "Haemoglobin", unit: "g/dL", low: 13, high: 17, female: { low: 12, high: 15 }, criticalLow: 7, match: /\b(h[ae]emoglobin|hb|hgb)\b/i, group: "Haematology" },
  { name: "Total WBC count", unit: "cells/µL", low: 4000, high: 11000, criticalLow: 2000, criticalHigh: 30000, match: /\b(wbc|total\s*leu[ck]ocyte|tlc|white\s*blood\s*cell)\b/i, group: "Haematology" },
  { name: "Platelet count", unit: "cells/µL", low: 150000, high: 410000, criticalLow: 50000, match: /\b(platelet|plt)\b/i, group: "Haematology" },
  { name: "Haematocrit", unit: "%", low: 40, high: 50, female: { low: 36, high: 46 }, match: /\b(h[ae]ematocrit|hct|pcv)\b/i, group: "Haematology" },
  { name: "MCV", unit: "fL", low: 83, high: 101, match: /\bmcv\b/i, group: "Haematology" },
  { name: "ESR", unit: "mm/hr", low: 0, high: 15, female: { low: 0, high: 20 }, match: /\b(esr|erythrocyte\s*sed)\b/i, group: "Haematology" },

  // Metabolic
  { name: "Fasting glucose", unit: "mg/dL", low: 70, high: 99, criticalLow: 55, criticalHigh: 250, match: /\b(fasting\s*(blood\s*)?(glucose|sugar)|fbs|glucose\s*fasting)\b/i, group: "Metabolic" },
  { name: "HbA1c", unit: "%", low: 4, high: 5.6, criticalHigh: 9, match: /\b(hba1c|glycated\s*h[ae]moglobin|a1c)\b/i, group: "Metabolic" },
  { name: "Post-prandial glucose", unit: "mg/dL", low: 70, high: 139, criticalHigh: 250, match: /\b(post\s*prandial|ppbs|pp\s*glucose)\b/i, group: "Metabolic" },

  // Lipids
  { name: "Total cholesterol", unit: "mg/dL", low: 0, high: 200, match: /\b(total\s*cholesterol|cholesterol\s*total)\b/i, group: "Lipids" },
  { name: "LDL cholesterol", unit: "mg/dL", low: 0, high: 100, criticalHigh: 190, match: /\bldl\b/i, group: "Lipids" },
  { name: "HDL cholesterol", unit: "mg/dL", low: 40, high: 60, match: /\bhdl\b/i, group: "Lipids" },
  { name: "Triglycerides", unit: "mg/dL", low: 0, high: 150, criticalHigh: 500, match: /\b(triglyceride|tg)\b/i, group: "Lipids" },

  // Liver
  { name: "SGPT / ALT", unit: "U/L", low: 0, high: 50, criticalHigh: 200, match: /\b(sgpt|alt|alanine)\b/i, group: "Liver" },
  { name: "SGOT / AST", unit: "U/L", low: 0, high: 50, criticalHigh: 200, match: /\b(sgot|ast|aspartate)\b/i, group: "Liver" },
  { name: "Total bilirubin", unit: "mg/dL", low: 0.2, high: 1.2, criticalHigh: 5, match: /\btotal\s*bilirubin\b/i, group: "Liver" },
  { name: "Alkaline phosphatase", unit: "U/L", low: 30, high: 120, match: /\b(alkaline\s*phosphatase|alp)\b/i, group: "Liver" },
  { name: "Serum albumin", unit: "g/dL", low: 3.5, high: 5.2, match: /\b(albumin)\b/i, group: "Liver" },

  // Kidney
  { name: "Serum creatinine", unit: "mg/dL", low: 0.7, high: 1.3, female: { low: 0.6, high: 1.1 }, criticalHigh: 3, match: /\b(creatinine)\b/i, group: "Kidney" },
  { name: "Blood urea", unit: "mg/dL", low: 17, high: 43, match: /\b(urea)\b/i, group: "Kidney" },
  { name: "Uric acid", unit: "mg/dL", low: 3.5, high: 7.2, female: { low: 2.6, high: 6 }, match: /\b(uric\s*acid)\b/i, group: "Kidney" },
  { name: "Sodium", unit: "mmol/L", low: 136, high: 145, criticalLow: 125, criticalHigh: 155, match: /\b(sodium|na\+?)\b/i, group: "Kidney" },
  { name: "Potassium", unit: "mmol/L", low: 3.5, high: 5.1, criticalLow: 2.8, criticalHigh: 6, match: /\b(potassium|k\+?)\b/i, group: "Kidney" },

  // Thyroid
  { name: "TSH", unit: "µIU/mL", low: 0.4, high: 4.0, criticalHigh: 10, match: /\btsh\b/i, group: "Thyroid" },
  { name: "Free T4", unit: "ng/dL", low: 0.8, high: 1.8, match: /\b(free\s*t4|ft4)\b/i, group: "Thyroid" },
  { name: "Free T3", unit: "pg/mL", low: 2.3, high: 4.2, match: /\b(free\s*t3|ft3)\b/i, group: "Thyroid" },

  // Vitamins and iron
  { name: "Vitamin D (25-OH)", unit: "ng/mL", low: 30, high: 100, criticalLow: 10, match: /\b(vitamin\s*d|25\s*-?\s*oh)\b/i, group: "Vitamins" },
  { name: "Vitamin B12", unit: "pg/mL", low: 200, high: 900, criticalLow: 100, match: /\b(b\s*-?12|cobalamin)\b/i, group: "Vitamins" },
  { name: "Serum ferritin", unit: "ng/mL", low: 30, high: 400, female: { low: 13, high: 150 }, match: /\b(ferritin)\b/i, group: "Vitamins" },
  { name: "Serum iron", unit: "µg/dL", low: 65, high: 175, female: { low: 50, high: 170 }, match: /\b(serum\s*iron|iron\b)/i, group: "Vitamins" },
];

type Reading = {
  range: Range;
  value: number;
  date: string;
  /** the report's own stated range, when it gave one */
  statedLow: number | null;
  statedHigh: number | null;
  raw: string;
};

type Flag = "critical-low" | "low" | "normal" | "high" | "critical-high";

function parseNumber(value: string): number {
  const cleaned = value.replace(/[,<>≤≥\s]/g, "");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : Number.NaN;
}

function normaliseDate(raw: string): string | null {
  const t = raw.trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t);
  if (m) return `${m[1]}-${m[2]!.padStart(2, "0")}-${m[3]!.padStart(2, "0")}`;
  m = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/.exec(t);
  if (m) {
    const year = m[3]!.length === 2 ? `20${m[3]}` : m[3]!;
    return `${year}-${m[2]!.padStart(2, "0")}-${m[1]!.padStart(2, "0")}`;
  }
  return null;
}

/**
 * Parses a pasted report. Blocks separated by a date line are treated as separate
 * visits, which is what makes trends possible without asking the user to structure
 * anything.
 */
function parseReport(text: string, isFemale: boolean): { readings: Reading[]; dates: string[]; unmatched: string[] } {
  const readings: Reading[] = [];
  const unmatched: string[] = [];
  const dates: string[] = [];
  let currentDate = "undated";

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;

    // A line that is only a date starts a new report block.
    const bare = line.replace(/^(date|report\s*date|collected\s*on|dated)\s*[:\-]?\s*/i, "").trim();
    const asDate = normaliseDate(bare);
    if (asDate && bare.length <= 12) {
      currentDate = asDate;
      if (!dates.includes(asDate)) dates.push(asDate);
      continue;
    }

    const range = RANGES.find((r) => r.match.test(line));
    if (!range) {
      if (/\d/.test(line) && line.length > 4 && !/^\d{1,2}[/-]/.test(line)) unmatched.push(line.slice(0, 60));
      continue;
    }

    // Take the first number that is not part of the test name or a stated range.
    const withoutName = line.replace(range.match, " ");
    const numbers = [...withoutName.matchAll(/-?\d[\d,]*\.?\d*/g)].map((m) => parseNumber(m[0]));
    const usable = numbers.filter((n) => Number.isFinite(n));
    if (usable.length === 0) {
      unmatched.push(line.slice(0, 60));
      continue;
    }

    const value = usable[0]!;

    // A stated range appears as "13.0 - 17.0" or "(13-17)" after the value.
    const statedMatch = /(\d[\d,]*\.?\d*)\s*[-–]\s*(\d[\d,]*\.?\d*)/.exec(withoutName.slice(withoutName.indexOf(String(usable[0]!)) + 1));
    const statedLow = statedMatch ? parseNumber(statedMatch[1]!) : null;
    const statedHigh = statedMatch ? parseNumber(statedMatch[2]!) : null;

    readings.push({ range, value, date: currentDate, statedLow, statedHigh, raw: line });
  }

  if (dates.length === 0) dates.push("undated");
  return { readings, dates, unmatched };
}

function limitsFor(reading: Reading, isFemale: boolean): { low: number; high: number; source: string } {
  // The report's own range wins: assays and analysers differ between labs, and the
  // paper the value came from is the only range that applies to that value.
  if (reading.statedLow !== null && reading.statedHigh !== null && reading.statedHigh > reading.statedLow) {
    return { low: reading.statedLow, high: reading.statedHigh, source: "your report's own stated range" };
  }
  const r = reading.range;
  if (isFemale && r.female) return { low: r.female.low, high: r.female.high, source: "common female reference range" };
  return { low: r.low, high: r.high, source: "common reference range" };
}

function classify(reading: Reading, low: number, high: number): Flag {
  const r = reading.range;
  if (r.criticalLow !== undefined && reading.value <= r.criticalLow) return "critical-low";
  if (r.criticalHigh !== undefined && reading.value >= r.criticalHigh) return "critical-high";
  if (reading.value < low) return "low";
  if (reading.value > high) return "high";
  return "normal";
}

function fmt(n: number): string {
  if (Math.abs(n) >= 10000) return n.toLocaleString("en-IN");
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export async function run(input: RunInput): Promise<RunResult> {
  const text = (input.report ?? "").trim();
  if (text.length < 20) {
    throw new Error("Paste the test names and values from your report — one per line, for example 'Haemoglobin 11.2 g/dL'.");
  }

  const isFemale = (input.sex ?? "") === "Female";
  const { readings, dates, unmatched } = parseReport(text, isFemale);

  if (readings.length === 0) {
    throw new Error(
      `No recognised tests found. This reads ${RANGES.length} common panels — CBC, glucose, HbA1c, lipids, liver, kidney, thyroid, vitamin D and B12. Paste lines in the form 'test name  value  unit'.`,
    );
  }

  // Latest reading per test drives the flags; earlier ones drive the trend.
  const byTest = new Map<string, Reading[]>();
  for (const r of readings) {
    const list = byTest.get(r.range.name) ?? [];
    list.push(r);
    byTest.set(r.range.name, list);
  }
  const orderedDates = [...dates].sort();
  for (const list of byTest.values()) {
    list.sort((a, b) => orderedDates.indexOf(a.date) - orderedDates.indexOf(b.date));
  }

  type Result = {
    reading: Reading;
    flag: Flag;
    low: number;
    high: number;
    source: string;
    deviationPercent: number;
    trend: { from: number; to: number; changePercent: number; fromDate: string; toDate: string } | null;
  };

  const results: Result[] = [];
  for (const [, list] of byTest) {
    const latest = list[list.length - 1]!;
    const { low, high, source } = limitsFor(latest, isFemale);
    const flag = classify(latest, low, high);
    const deviation =
      flag === "high" || flag === "critical-high"
        ? ((latest.value - high) / high) * 100
        : flag === "low" || flag === "critical-low"
          ? ((low - latest.value) / Math.max(low, 0.0001)) * 100
          : 0;

    const previous = list.length > 1 ? list[list.length - 2]! : null;
    const trend =
      previous && previous.date !== latest.date
        ? {
            from: previous.value,
            to: latest.value,
            changePercent: previous.value === 0 ? 0 : ((latest.value - previous.value) / Math.abs(previous.value)) * 100,
            fromDate: previous.date,
            toDate: latest.date,
          }
        : null;

    results.push({ reading: latest, flag, low, high, source, deviationPercent: Math.round(deviation), trend });
  }

  const order: Flag[] = ["critical-low", "critical-high", "low", "high", "normal"];
  results.sort((a, b) => order.indexOf(a.flag) - order.indexOf(b.flag) || b.deviationPercent - a.deviationPercent);

  const critical = results.filter((r) => r.flag === "critical-low" || r.flag === "critical-high");
  const outOfRange = results.filter((r) => r.flag === "low" || r.flag === "high");
  const normal = results.filter((r) => r.flag === "normal");

  const describe = (r: Result): ResultItem => {
    const v = `${fmt(r.reading.value)} ${r.reading.range.unit}`;
    const band = `${fmt(r.low)}–${fmt(r.high)}`;
    const direction = r.flag.includes("low") ? "below" : "above";
    const body =
      r.flag === "normal"
        ? `${v}, inside the ${band} range (${r.source}).`
        : `${v} — ${r.deviationPercent}% ${direction} the ${band} range (${r.source}).${
            r.flag.startsWith("critical")
              ? " This is far enough outside the range that it is commonly treated as needing prompt attention. Contact your doctor rather than waiting for a scheduled appointment."
              : ""
          }${
            r.trend
              ? ` Was ${fmt(r.trend.from)} on ${r.trend.fromDate}, now ${fmt(r.trend.to)} on ${r.trend.toDate} — a change of ${r.trend.changePercent > 0 ? "+" : ""}${Math.round(r.trend.changePercent)}%.`
              : ""
          }`;
    return {
      title: `${r.reading.range.name}`,
      body,
      tag: r.flag === "normal" ? r.reading.range.group : r.flag.replace("-", " "),
      severity: r.flag.startsWith("critical") ? "high" : r.flag === "normal" ? "low" : "medium",
    };
  };

  const sections: { title: string; items: ResultItem[] }[] = [];

  if (critical.length > 0) {
    sections.push({ title: `Well outside range — ${critical.length}`, items: critical.map(describe) });
  }
  if (outOfRange.length > 0) {
    sections.push({ title: `Outside range — ${outOfRange.length}`, items: outOfRange.map(describe) });
  }
  if (normal.length > 0) {
    sections.push({ title: `Inside range — ${normal.length}`, items: normal.map(describe) });
  }

  const moved = results.filter((r) => r.trend && Math.abs(r.trend.changePercent) >= 10);
  if (moved.length > 0) {
    sections.push({
      title: `Moved by 10% or more since the previous report — ${moved.length}`,
      items: moved.map((r) => ({
        title: r.reading.range.name,
        body: `${fmt(r.trend!.from)} → ${fmt(r.trend!.to)} ${r.reading.range.unit} between ${r.trend!.fromDate} and ${r.trend!.toDate}, ${r.trend!.changePercent > 0 ? "up" : "down"} ${Math.abs(Math.round(r.trend!.changePercent))}%. Direction and size only — whether that matters depends on why the test was ordered, which is a question for the person who ordered it.`,
        tag: `${r.trend!.changePercent > 0 ? "+" : ""}${Math.round(r.trend!.changePercent)}%`,
        severity: "medium" as Severity,
      })),
    });
  }

  sections.push({
    title: "What this is not",
    items: [
      {
        body: "This is not a diagnosis and not medical advice. It compares your numbers to published ranges and to your own previous numbers. It deliberately does not suggest what any result might mean, because that requires your history, your examination and your medications — none of which a text box has.",
        severity: "high",
      },
      {
        body: "Reference ranges differ between laboratories and assays. Where your report stated its own range, that is what was used and each finding says so. Where it did not, a common Indian range was used and it may not match your lab's.",
        severity: "medium",
      },
      {
        body: "A value inside range is not proof that nothing is wrong, and one outside range is not proof that something is. Single readings drift; that is why the trend view exists and why a doctor repeats tests.",
        severity: "medium",
      },
      ...(unmatched.length > 0
        ? [{ body: `${unmatched.length} line${unmatched.length === 1 ? "" : "s"} were not recognised and are not included: ${unmatched.slice(0, 5).join(" · ")}${unmatched.length > 5 ? " …" : ""}`, severity: "medium" as Severity }]
        : []),
    ],
  });

  const summary = [
    `Lab summary${input.name ? ` — ${input.name}` : ""}`,
    `Prepared from ${readings.length} values across ${orderedDates.length} report${orderedDates.length === 1 ? "" : "s"}: ${orderedDates.join(", ")}`,
    "",
    "OUTSIDE RANGE",
    ...(critical.length + outOfRange.length === 0
      ? ["  (none)"]
      : [...critical, ...outOfRange].map(
          (r) => `  ${r.reading.range.name}: ${fmt(r.reading.value)} ${r.reading.range.unit} (range ${fmt(r.low)}–${fmt(r.high)})${r.trend ? `, was ${fmt(r.trend.from)} on ${r.trend.fromDate}` : ""}`,
        )),
    "",
    "INSIDE RANGE",
    ...(normal.length === 0 ? ["  (none)"] : normal.map((r) => `  ${r.reading.range.name}: ${fmt(r.reading.value)} ${r.reading.range.unit}`)),
    "",
    "Questions for the appointment:",
    ...[...critical, ...outOfRange].slice(0, 6).map((r) => `  - ${r.reading.range.name} is ${r.flag.includes("low") ? "below" : "above"} range. Does it need repeating, and does it change anything?`),
    "",
    "Not a diagnosis. Prepared to make an appointment more efficient, not to replace it.",
  ].join("\n");

  return {
    headline:
      critical.length > 0
        ? `${critical.length} value${critical.length === 1 ? "" : "s"} well outside range — worth contacting your doctor rather than waiting. ${outOfRange.length} others outside range.`
        : outOfRange.length > 0
          ? `${outOfRange.length} of ${results.length} values outside their reference range. ${moved.length > 0 ? `${moved.length} moved 10% or more since your last report.` : ""}`
          : `All ${results.length} values inside their reference ranges.`,

    score: {
      label: "Values inside range",
      value: Math.round((normal.length / results.length) * 100),
      max: 100,
      band: critical.length > 0 ? "bad" : outOfRange.length > 0 ? "warn" : "good",
    },

    metrics: [
      { label: "Tests read", value: String(results.length) },
      { label: "Outside range", value: String(critical.length + outOfRange.length) },
      { label: "Well outside", value: String(critical.length) },
      { label: "Reports", value: String(orderedDates.length), hint: orderedDates.join(", ").slice(0, 40) },
    ],

    sections,

    table: {
      columns: ["Test", "Value", "Unit", "Range", "Status", "Change"],
      rows: results.map((r) => [
        r.reading.range.name,
        fmt(r.reading.value),
        r.reading.range.unit,
        `${fmt(r.low)}–${fmt(r.high)}`,
        r.flag,
        r.trend ? `${r.trend.changePercent > 0 ? "+" : ""}${Math.round(r.trend.changePercent)}%` : "—",
      ]),
    },

    copyBlocks: [{ title: "Summary to take to your appointment", text: summary, language: "text" }],

    json: {
      reports: orderedDates,
      counts: { total: results.length, normal: normal.length, outOfRange: outOfRange.length, critical: critical.length },
      results: results.map((r) => ({
        test: r.reading.range.name,
        group: r.reading.range.group,
        value: r.reading.value,
        unit: r.reading.range.unit,
        low: r.low,
        high: r.high,
        rangeSource: r.source,
        flag: r.flag,
        deviationPercent: r.deviationPercent,
        trend: r.trend,
      })),
      unrecognisedLines: unmatched,
      disclaimer: "Not a diagnosis and not medical advice. Reference ranges vary by laboratory and assay.",
    },
  };
}
