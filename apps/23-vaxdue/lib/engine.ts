import type { ResultItem, RunInput, RunResult, Severity } from "./types.ts";

/**
 * Childhood immunisation schedule.
 *
 * Works out what is due, what is overdue and what catch-up applies, from a date of
 * birth and a list of doses already given. It schedules; it does not advise. Whether
 * a particular child should receive a particular vaccine is a clinical decision, and
 * the output says so where it matters — for example it will not tell you a dose can
 * be skipped, only that the schedule places it at a given age.
 *
 * Dates are computed from an explicit "as at" input, never a server clock, so the
 * same inputs always produce the same schedule.
 */

type Dose = {
  vaccine: string;
  /** which dose in the series, 1-indexed */
  number: number;
  /** weeks after birth the dose is due */
  dueWeeks: number;
  /** earliest it may be given, in weeks */
  minWeeks: number;
  /** minimum gap from the previous dose in the same series, in weeks */
  minGapWeeks: number;
  protects: string;
  /** national programme or additionally recommended */
  programme: "UIP" | "IAP";
  notes?: string;
};

/**
 * Based on the Universal Immunisation Programme with the additional vaccines the
 * Indian Academy of Paediatrics recommends. The programme column matters
 * commercially and practically: UIP doses are free at a government facility, IAP
 * additions are usually paid, and parents are rarely told which is which.
 */
const SCHEDULE: Dose[] = [
  { vaccine: "BCG", number: 1, dueWeeks: 0, minWeeks: 0, minGapWeeks: 0, protects: "Tuberculosis", programme: "UIP", notes: "Given at birth. Can be given up to one year of age if missed." },
  { vaccine: "Hepatitis B", number: 1, dueWeeks: 0, minWeeks: 0, minGapWeeks: 0, protects: "Hepatitis B", programme: "UIP", notes: "Birth dose ideally within 24 hours." },
  { vaccine: "OPV", number: 0, dueWeeks: 0, minWeeks: 0, minGapWeeks: 0, protects: "Polio", programme: "UIP", notes: "Zero dose at birth." },

  { vaccine: "Pentavalent (DTP-HepB-Hib)", number: 1, dueWeeks: 6, minWeeks: 6, minGapWeeks: 0, protects: "Diphtheria, tetanus, pertussis, hepatitis B, Hib", programme: "UIP" },
  { vaccine: "OPV", number: 1, dueWeeks: 6, minWeeks: 6, minGapWeeks: 4, protects: "Polio", programme: "UIP" },
  { vaccine: "Rotavirus", number: 1, dueWeeks: 6, minWeeks: 6, minGapWeeks: 0, protects: "Rotavirus diarrhoea", programme: "UIP", notes: "The series must start before 15 weeks and finish before 8 months." },
  { vaccine: "PCV", number: 1, dueWeeks: 6, minWeeks: 6, minGapWeeks: 0, protects: "Pneumococcal disease", programme: "UIP" },
  { vaccine: "IPV", number: 1, dueWeeks: 6, minWeeks: 6, minGapWeeks: 0, protects: "Polio (injectable)", programme: "UIP" },

  { vaccine: "Pentavalent (DTP-HepB-Hib)", number: 2, dueWeeks: 10, minWeeks: 10, minGapWeeks: 4, protects: "Diphtheria, tetanus, pertussis, hepatitis B, Hib", programme: "UIP" },
  { vaccine: "OPV", number: 2, dueWeeks: 10, minWeeks: 10, minGapWeeks: 4, protects: "Polio", programme: "UIP" },
  { vaccine: "Rotavirus", number: 2, dueWeeks: 10, minWeeks: 10, minGapWeeks: 4, protects: "Rotavirus diarrhoea", programme: "UIP" },

  { vaccine: "Pentavalent (DTP-HepB-Hib)", number: 3, dueWeeks: 14, minWeeks: 14, minGapWeeks: 4, protects: "Diphtheria, tetanus, pertussis, hepatitis B, Hib", programme: "UIP" },
  { vaccine: "OPV", number: 3, dueWeeks: 14, minWeeks: 14, minGapWeeks: 4, protects: "Polio", programme: "UIP" },
  { vaccine: "Rotavirus", number: 3, dueWeeks: 14, minWeeks: 14, minGapWeeks: 4, protects: "Rotavirus diarrhoea", programme: "UIP" },
  { vaccine: "PCV", number: 2, dueWeeks: 14, minWeeks: 14, minGapWeeks: 4, protects: "Pneumococcal disease", programme: "UIP" },
  { vaccine: "IPV", number: 2, dueWeeks: 14, minWeeks: 14, minGapWeeks: 4, protects: "Polio (injectable)", programme: "UIP" },

  { vaccine: "Measles-Rubella", number: 1, dueWeeks: 39, minWeeks: 39, minGapWeeks: 0, protects: "Measles, rubella", programme: "UIP", notes: "Due at 9 months." },
  { vaccine: "Typhoid conjugate", number: 1, dueWeeks: 39, minWeeks: 26, minGapWeeks: 0, protects: "Typhoid", programme: "IAP" },
  { vaccine: "Japanese encephalitis", number: 1, dueWeeks: 39, minWeeks: 39, minGapWeeks: 0, protects: "Japanese encephalitis", programme: "UIP", notes: "Endemic districts only — check with your local facility." },
  { vaccine: "Vitamin A", number: 1, dueWeeks: 39, minWeeks: 39, minGapWeeks: 0, protects: "Vitamin A deficiency", programme: "UIP" },

  { vaccine: "PCV booster", number: 1, dueWeeks: 39, minWeeks: 39, minGapWeeks: 8, protects: "Pneumococcal disease", programme: "UIP" },
  { vaccine: "Hepatitis A", number: 1, dueWeeks: 52, minWeeks: 52, minGapWeeks: 0, protects: "Hepatitis A", programme: "IAP" },
  { vaccine: "Varicella", number: 1, dueWeeks: 65, minWeeks: 65, minGapWeeks: 0, protects: "Chickenpox", programme: "IAP" },

  { vaccine: "DTP booster", number: 1, dueWeeks: 70, minWeeks: 70, minGapWeeks: 26, protects: "Diphtheria, tetanus, pertussis", programme: "UIP", notes: "Due at 16–24 months." },
  { vaccine: "OPV booster", number: 1, dueWeeks: 70, minWeeks: 70, minGapWeeks: 26, protects: "Polio", programme: "UIP" },
  { vaccine: "Measles-Rubella", number: 2, dueWeeks: 70, minWeeks: 65, minGapWeeks: 4, protects: "Measles, rubella", programme: "UIP" },
  { vaccine: "Japanese encephalitis", number: 2, dueWeeks: 70, minWeeks: 70, minGapWeeks: 4, protects: "Japanese encephalitis", programme: "UIP", notes: "Endemic districts only." },
  { vaccine: "Hepatitis A", number: 2, dueWeeks: 78, minWeeks: 78, minGapWeeks: 26, protects: "Hepatitis A", programme: "IAP" },
  { vaccine: "Varicella", number: 2, dueWeeks: 78, minWeeks: 78, minGapWeeks: 12, protects: "Chickenpox", programme: "IAP" },
  { vaccine: "Typhoid conjugate", number: 2, dueWeeks: 104, minWeeks: 104, minGapWeeks: 52, protects: "Typhoid", programme: "IAP", notes: "Booster at 2 years." },

  { vaccine: "DTP booster", number: 2, dueWeeks: 260, minWeeks: 260, minGapWeeks: 156, protects: "Diphtheria, tetanus, pertussis", programme: "UIP", notes: "Due at 5 years." },
  { vaccine: "Tdap", number: 1, dueWeeks: 520, minWeeks: 520, minGapWeeks: 0, protects: "Tetanus, diphtheria, pertussis", programme: "UIP", notes: "Due at 10 years." },
  { vaccine: "HPV", number: 1, dueWeeks: 468, minWeeks: 468, minGapWeeks: 0, protects: "Cervical and other HPV-related cancers", programme: "IAP", notes: "From 9 years. Two doses are sufficient if started before 15." },
  { vaccine: "HPV", number: 2, dueWeeks: 494, minWeeks: 494, minGapWeeks: 26, protects: "Cervical and other HPV-related cancers", programme: "IAP" },
  { vaccine: "Td", number: 1, dueWeeks: 832, minWeeks: 832, minGapWeeks: 0, protects: "Tetanus, diphtheria", programme: "UIP", notes: "Due at 16 years." },
];

function parseDate(raw: string): Date | null {
  const t = raw.trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t);
  if (m) {
    const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  m = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(t);
  if (m) return new Date(Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1])));
  return null;
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addWeeks = (d: Date, w: number) => new Date(d.getTime() + w * 7 * 86_400_000);
const weeksBetween = (a: Date, b: Date) => Math.floor((a.getTime() - b.getTime()) / (7 * 86_400_000));

/**
 * Formats an age in weeks as the milestone a parent would recognise.
 *
 * Rounded, not floored. The schedule places boosters at exact anniversaries — the
 * 5-year DTP booster is 260 weeks, which floors to 4 years and reads as a
 * contradiction next to a note saying "due at 5 years". Rounding lands on the
 * milestone the schedule actually means.
 */
function ageLabel(weeks: number): string {
  if (weeks < 8) return `${weeks} week${weeks === 1 ? "" : "s"}`;
  const months = Math.round((weeks * 7) / 30.44);
  if (months < 24) return `${months} month${months === 1 ? "" : "s"}`;
  const years = Math.round(months / 12);
  return `${years} year${years === 1 ? "" : "s"}`;
}

/** Matches a "given" entry against a schedule row. */
function normaliseVaccine(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function run(input: RunInput): Promise<RunResult> {
  const dob = parseDate(input.dob ?? "");
  if (!dob) throw new Error("Enter the date of birth as an ISO date, for example 2024-03-15. The whole schedule is measured from it.");

  const asOf = parseDate(input.asOfDate ?? "");
  if (!asOf) throw new Error("Enter today's date as an ISO date, for example 2026-07-30, so the result is reproducible.");
  if (asOf < dob) throw new Error("Today's date is before the date of birth. Check both.");

  const ageWeeks = weeksBetween(asOf, dob);
  if (ageWeeks > 940) {
    throw new Error("This covers the childhood schedule up to about 18 years. Adult vaccination follows different rules.");
  }

  const includeIap = (input.scope ?? "").startsWith("Both");
  const endemic = (input.jeEndemic ?? "No") === "Yes";

  // --- what has already been given
  const givenRaw = (input.given ?? "")
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  type Given = { key: string; number: number | null; date: Date | null; raw: string };
  const given: Given[] = givenRaw.map((entry) => {
    const dateMatch = /(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[/-]\d{1,2}[/-]\d{4})/.exec(entry);
    const numberMatch = /\b(?:dose\s*)?([1-3])\b(?!\d)/.exec(entry.replace(/\d{4}-\d{1,2}-\d{1,2}/, "").replace(/\d{1,2}[/-]\d{1,2}[/-]\d{4}/, ""));
    return {
      key: normaliseVaccine(entry.replace(/(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[/-]\d{1,2}[/-]\d{4})/, "").replace(/\bdose\b/gi, "")),
      number: numberMatch ? Number(numberMatch[1]) : null,
      date: dateMatch ? parseDate(dateMatch[1]!) : null,
      raw: entry,
    };
  });

  const matched = new Set<Given>();
  function wasGiven(dose: Dose): Given | null {
    const target = normaliseVaccine(dose.vaccine);
    for (const g of given) {
      if (matched.has(g)) continue;
      // Match on a shared stem so "Penta 2" finds "Pentavalent (DTP-HepB-Hib)".
      const stem = target.slice(0, Math.min(6, target.length));
      if (!g.key.includes(stem) && !target.includes(g.key.slice(0, Math.min(6, g.key.length)))) continue;
      if (g.number !== null && g.number !== dose.number) continue;
      matched.add(g);
      return g;
    }
    return null;
  }

  const applicable = SCHEDULE.filter((d) => (d.programme === "UIP" || includeIap) && (!/japanese/i.test(d.vaccine) || endemic));

  type Row = {
    dose: Dose;
    dueDate: Date;
    status: "given" | "overdue" | "due now" | "upcoming";
    givenOn: Date | null;
    weeksLate: number;
  };

  const rows: Row[] = applicable.map((dose) => {
    const dueDate = addWeeks(dob, dose.dueWeeks);
    const g = wasGiven(dose);
    if (g) {
      return { dose, dueDate, status: "given", givenOn: g.date, weeksLate: 0 };
    }
    const weeksLate = weeksBetween(asOf, dueDate);
    if (weeksLate >= 2) return { dose, dueDate, status: "overdue", givenOn: null, weeksLate };
    if (weeksLate >= 0) return { dose, dueDate, status: "due now", givenOn: null, weeksLate };
    return { dose, dueDate, status: "upcoming", givenOn: null, weeksLate };
  });

  const overdue = rows.filter((r) => r.status === "overdue").sort((a, b) => b.weeksLate - a.weeksLate);
  const dueNow = rows.filter((r) => r.status === "due now");
  const upcoming = rows.filter((r) => r.status === "upcoming").sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  const done = rows.filter((r) => r.status === "given");

  // Rotavirus has a hard upper age limit, which is the one place "too late" is real.
  const rotaMissed = overdue.filter((r) => /rotavirus/i.test(r.dose.vaccine) && ageWeeks > 34);

  const sections: { title: string; items: ResultItem[] }[] = [];

  if (overdue.length > 0) {
    sections.push({
      title: `Overdue — ${overdue.length}`,
      items: overdue.map((r) => ({
        title: `${r.dose.vaccine}${r.dose.number > 1 ? ` dose ${r.dose.number}` : ""}`,
        body: `Was due ${iso(r.dueDate)} at ${ageLabel(r.dose.dueWeeks)} — ${r.weeksLate} week${r.weeksLate === 1 ? "" : "s"} ago. Protects against ${r.dose.protects}. ${
          /rotavirus/i.test(r.dose.vaccine) && ageWeeks > 34
            ? "The rotavirus series has an upper age limit and can no longer be started or completed. Ask your paediatrician to confirm and to note it in the record — this is not something to catch up."
            : "Being late does not mean starting the series again. Catch-up doses continue from where the series stopped, respecting the minimum gaps."
        }${r.dose.notes ? ` ${r.dose.notes}` : ""}`,
        tag: r.dose.programme === "UIP" ? "free at a government facility" : "usually paid",
        severity: r.weeksLate > 12 ? "high" : "medium",
      })),
    });
  }

  if (dueNow.length > 0) {
    sections.push({
      title: `Due now — ${dueNow.length}`,
      items: dueNow.map((r) => ({
        title: `${r.dose.vaccine}${r.dose.number > 1 ? ` dose ${r.dose.number}` : ""}`,
        body: `Due ${iso(r.dueDate)} at ${ageLabel(r.dose.dueWeeks)}. Protects against ${r.dose.protects}.${r.dose.notes ? ` ${r.dose.notes}` : ""}`,
        tag: r.dose.programme === "UIP" ? "free at a government facility" : "usually paid",
        severity: "medium",
      })),
    });
  }

  if (upcoming.length > 0) {
    const next = upcoming.slice(0, 8);
    sections.push({
      title: `Next up — ${next.length} of ${upcoming.length} remaining`,
      items: next.map((r) => ({
        title: `${r.dose.vaccine}${r.dose.number > 1 ? ` dose ${r.dose.number}` : ""}`,
        body: `Due ${iso(r.dueDate)}, at ${ageLabel(r.dose.dueWeeks)} — in ${Math.abs(r.weeksLate)} week${Math.abs(r.weeksLate) === 1 ? "" : "s"}. Protects against ${r.dose.protects}.${r.dose.notes ? ` ${r.dose.notes}` : ""}`,
        tag: r.dose.programme === "UIP" ? "free" : "usually paid",
        severity: "low",
      })),
    });
  }

  if (done.length > 0) {
    sections.push({
      title: `Recorded as given — ${done.length}`,
      items: [
        {
          body: done
            .map((r) => `${r.dose.vaccine}${r.dose.number > 1 ? ` dose ${r.dose.number}` : ""}${r.givenOn ? ` (${iso(r.givenOn)})` : ""}`)
            .join(" · "),
          severity: "low",
        },
      ],
    });
  }

  const unmatchedGiven = given.filter((g) => !matched.has(g));
  sections.push({
    title: "Read this before acting on the list",
    items: [
      {
        body: "This is a schedule, not medical advice. It says where the national schedule places each dose for a child of this age. Whether a specific child should receive a specific vaccine — and any contraindication, illness or allergy — is a decision for your paediatrician.",
        severity: "high",
      },
      {
        body: "Being late is common and usually fixable. Catch-up continues a series from where it stopped rather than restarting it, subject to minimum gaps. Rotavirus is the notable exception, because it has a genuine upper age limit.",
        severity: "medium",
      },
      {
        body: `Japanese encephalitis is given only in endemic districts, and is ${endemic ? "included because you said the district is endemic" : "excluded because you did not indicate an endemic district"}. Your local facility can confirm.`,
        severity: "medium",
      },
      ...(unmatchedGiven.length > 0
        ? [{ body: `${unmatchedGiven.length} entr${unmatchedGiven.length === 1 ? "y" : "ies"} in your "already given" list could not be matched to the schedule and were ignored, so they may still appear as due: ${unmatchedGiven.map((g) => g.raw).join(" · ")}. Check the spelling against the vaccine names in the table.`, severity: "high" as Severity }]
        : []),
    ],
  });

  const card = [
    `Immunisation status${input.childName ? ` — ${input.childName}` : ""}`,
    `Date of birth: ${iso(dob)}    Age: ${ageLabel(ageWeeks)}    As at: ${iso(asOf)}`,
    `Schedule: ${includeIap ? "UIP + IAP recommended" : "UIP (national programme) only"}`,
    "",
    `OVERDUE (${overdue.length})`,
    ...(overdue.length === 0 ? ["  none"] : overdue.map((r) => `  ${iso(r.dueDate)}  ${r.dose.vaccine}${r.dose.number > 1 ? ` dose ${r.dose.number}` : ""}  — ${r.weeksLate} weeks late`)),
    "",
    `DUE NOW (${dueNow.length})`,
    ...(dueNow.length === 0 ? ["  none"] : dueNow.map((r) => `  ${iso(r.dueDate)}  ${r.dose.vaccine}${r.dose.number > 1 ? ` dose ${r.dose.number}` : ""}`)),
    "",
    `UPCOMING`,
    ...upcoming.slice(0, 12).map((r) => `  ${iso(r.dueDate)}  ${r.dose.vaccine}${r.dose.number > 1 ? ` dose ${r.dose.number}` : ""}  (${ageLabel(r.dose.dueWeeks)})`),
    "",
    "Take this to your paediatrician. It is a schedule, not advice.",
  ].join("\n");

  const totalDue = overdue.length + dueNow.length;
  const coverage = rows.length > 0 ? Math.round((done.length / (done.length + overdue.length + dueNow.length || 1)) * 100) : 0;

  return {
    headline:
      overdue.length > 0
        ? `${overdue.length} dose${overdue.length === 1 ? "" : "s"} overdue${rotaMissed.length > 0 ? `, including rotavirus which is now past its age limit` : ""}. ${dueNow.length > 0 ? `${dueNow.length} due now.` : ""} Next appointment worth booking this week.`
        : dueNow.length > 0
          ? `${dueNow.length} dose${dueNow.length === 1 ? "" : "s"} due now, nothing overdue. Next after that: ${upcoming[0] ? `${upcoming[0].dose.vaccine} on ${iso(upcoming[0].dueDate)}` : "none remaining"}.`
          : `Up to date at ${ageLabel(ageWeeks)}. Next due: ${upcoming[0] ? `${upcoming[0].dose.vaccine} on ${iso(upcoming[0].dueDate)}` : "nothing remaining in the childhood schedule"}.`,

    score: {
      label: "Doses given of those due by now",
      value: coverage,
      max: 100,
      band: overdue.length > 0 ? "bad" : dueNow.length > 0 ? "warn" : "good",
    },

    metrics: [
      { label: "Age", value: ageLabel(ageWeeks), hint: `${ageWeeks} weeks` },
      { label: "Overdue", value: String(overdue.length) },
      { label: "Due now", value: String(dueNow.length) },
      { label: "Given", value: String(done.length) },
      { label: "Remaining", value: String(upcoming.length) },
    ],

    sections,

    table: {
      columns: ["Due date", "Age", "Vaccine", "Dose", "Status", "Programme"],
      rows: rows
        .slice()
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
        .map((r) => [iso(r.dueDate), ageLabel(r.dose.dueWeeks), r.dose.vaccine, String(r.dose.number || 0), r.status, r.dose.programme]),
    },

    copyBlocks: [{ title: "Immunisation card for the clinic", text: card, language: "text" }],

    json: {
      dob: iso(dob),
      asOf: iso(asOf),
      ageWeeks,
      scope: includeIap ? "UIP+IAP" : "UIP",
      counts: { overdue: overdue.length, dueNow: dueNow.length, given: done.length, upcoming: upcoming.length, totalDue },
      overdue: overdue.map((r) => ({ vaccine: r.dose.vaccine, dose: r.dose.number, dueDate: iso(r.dueDate), weeksLate: r.weeksLate })),
      dueNow: dueNow.map((r) => ({ vaccine: r.dose.vaccine, dose: r.dose.number, dueDate: iso(r.dueDate) })),
      upcoming: upcoming.map((r) => ({ vaccine: r.dose.vaccine, dose: r.dose.number, dueDate: iso(r.dueDate) })),
      unmatchedGivenEntries: unmatchedGiven.map((g) => g.raw),
      disclaimer: "A schedule, not medical advice. Vaccine decisions belong to a paediatrician.",
    },
  };
}
