import type { ResultItem, RunInput, RunResult, Severity } from "./types.ts";

/**
 * Extracts dates, durations and auto-renewal traps from contract text.
 *
 * Pattern matching, deliberately, with no model in the path. A hallucinated
 * cancellation deadline is a liability, not a bug: someone diarises it, misses the
 * real one, and is locked into another year. So this reports only what it can point
 * at in the text, and anything it could not parse goes into an explicit list of
 * clauses for a human to read.
 *
 * "I found nothing here" is a valid and useful answer. "Cancel by 14 March" when
 * the contract says no such thing is not.
 */

type FoundDate = { iso: string; raw: string; context: string; label: string };
type Duration = { days: number; raw: string; context: string; unit: string; count: number };

type Deadline = {
  what: string;
  date: string;
  daysAway: number;
  why: string;
  severity: Severity;
};

const MONTHS: Record<string, number> = {
  jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3,
  may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7,
  sep: 8, sept: 8, september: 8, oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
};

function isoOf(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * 86_400_000);
}

function addMonths(d: Date, n: number): Date {
  const out = new Date(d.getTime());
  const targetMonth = out.getUTCMonth() + n;
  const day = out.getUTCDate();
  out.setUTCDate(1);
  out.setUTCMonth(targetMonth);
  // Clamp: 31 January plus one month is 28 or 29 February, not 3 March.
  const lastDay = new Date(Date.UTC(out.getUTCFullYear(), out.getUTCMonth() + 1, 0)).getUTCDate();
  out.setUTCDate(Math.min(day, lastDay));
  return out;
}

function parseIso(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (Number.isNaN(d.getTime()) || d.getUTCMonth() !== Number(m[2]) - 1) return null;
  return d;
}

function contextAround(text: string, index: number, span = 130): string {
  const start = Math.max(0, index - span);
  const end = Math.min(text.length, index + span);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).replace(/\s+/g, " ").trim()}${end < text.length ? "…" : ""}`;
}

/** Labels a date from the words immediately around it. */
function labelFor(context: string): string {
  const c = context.toLowerCase();
  if (/effective\s+(date|as of|from)/.test(c)) return "Effective date";
  if (/commence|start\s+date|begins?\s+on/.test(c)) return "Start date";
  if (/expir|terminat|end\s+date|ends?\s+on|until/.test(c)) return "Expiry or termination date";
  if (/renew/.test(c)) return "Renewal date";
  if (/execut|signed|dated\s+this/.test(c)) return "Execution date";
  if (/invoice|payment\s+due|due\s+by|due\s+on/.test(c)) return "Payment date";
  if (/notice/.test(c)) return "Notice-related date";
  return "Date";
}

// ---------------------------------------------------------------------------
// Extraction
// ---------------------------------------------------------------------------

function extractDates(text: string): FoundDate[] {
  const out: FoundDate[] = [];
  const seen = new Set<string>();

  const push = (d: Date | null, raw: string, index: number) => {
    if (!d || Number.isNaN(d.getTime())) return;
    const iso = isoOf(d);
    const key = `${iso}|${raw}`;
    if (seen.has(key)) return;
    seen.add(key);
    const context = contextAround(text, index);
    out.push({ iso, raw, context, label: labelFor(context) });
  };

  // 1 January 2026 / 1st Jan 2026
  for (const m of text.matchAll(/\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,9})\.?,?\s+(\d{4})\b/g)) {
    const month = MONTHS[m[2]!.toLowerCase()];
    if (month === undefined) continue;
    push(new Date(Date.UTC(Number(m[3]), month, Number(m[1]))), m[0]!, m.index ?? 0);
  }
  // January 1, 2026
  for (const m of text.matchAll(/\b([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\b/g)) {
    const month = MONTHS[m[1]!.toLowerCase()];
    if (month === undefined) continue;
    push(new Date(Date.UTC(Number(m[3]), month, Number(m[2]))), m[0]!, m.index ?? 0);
  }
  // 2026-01-01
  for (const m of text.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g)) {
    push(new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))), m[0]!, m.index ?? 0);
  }
  // 01/02/2026 — ambiguous, so reported with a warning elsewhere.
  for (const m of text.matchAll(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g)) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    // Day-first unless the first number cannot be a day.
    const [day, month] = a > 12 ? [a, b] : [a, b];
    push(new Date(Date.UTC(Number(m[3]), month - 1, day)), m[0]!, m.index ?? 0);
  }

  return out.sort((a, b) => a.iso.localeCompare(b.iso));
}

const WORD_NUMBERS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, fifteen: 15, twenty: 20, thirty: 30, sixty: 60, ninety: 90,
};

function extractDurations(text: string): Duration[] {
  const out: Duration[] = [];
  const re = /\b(\d{1,4}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|sixty|ninety)[\s-]+(day|week|month|year)s?\b/gi;
  for (const m of text.matchAll(re)) {
    const token = m[1]!.toLowerCase();
    const count = /^\d+$/.test(token) ? Number(token) : (WORD_NUMBERS[token] ?? 0);
    if (count <= 0) continue;
    const unit = m[2]!.toLowerCase();
    const days = unit === "day" ? count : unit === "week" ? count * 7 : unit === "month" ? count * 30 : count * 365;
    out.push({ days, raw: m[0]!, context: contextAround(text, m.index ?? 0), unit, count });
  }
  return out;
}

/** Sentences that carry a clause we care about, so nothing is judged out of context. */
function clausesMatching(text: string, pattern: RegExp): string[] {
  return text
    .split(/(?<=[.;])\s+|\n{2,}/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length > 20 && pattern.test(s));
}

// ---------------------------------------------------------------------------
// run
// ---------------------------------------------------------------------------

export async function run(input: RunInput): Promise<RunResult> {
  const text = (input.contract ?? "").trim();
  if (text.length < 100) {
    throw new Error(
      "Paste the contract text — at least a few paragraphs. Extracting deadlines from a fragment would produce a calendar you should not trust.",
    );
  }

  const asOf = parseIso(input.asOfDate ?? "");
  if (!asOf) {
    throw new Error("Today's date must be an ISO date such as 2026-07-30. Every deadline is measured from it, so it cannot be guessed.");
  }

  const counterparty = (input.counterparty ?? "the counterparty").trim() || "the counterparty";

  const dates = extractDates(text);
  const durations = extractDurations(text);

  // --- Auto-renewal
  const AUTO_RENEW = /automatic(ally)?\s+renew|auto[- ]?renew|shall\s+renew|will\s+renew|renew(s|ed)?\s+(automatically|for\s+(a\s+)?(further|successive|additional))|successive\s+(renewal\s+)?terms|evergreen/i;
  const renewalClauses = clausesMatching(text, AUTO_RENEW);

  /**
   * Notice window.
   *
   * Matched by adjacency to the word "notice", not by appearing in the same
   * sentence as it. That distinction is load-bearing: clause 3.2 of a typical
   * agreement reads "shall automatically renew for successive periods of 12 months
   * unless either party gives written notice of non-renewal", which contains both a
   * duration and the word notice — but the 12 months is the term, not the notice
   * period. Taking it would compute a cancellation date a year wrong in the one
   * output someone puts in their calendar.
   *
   * A cap is applied too. Notice periods are days or a small number of months;
   * anything beyond six months is a term length that slipped through.
   */
  const NOTICE_ADJACENT = [
    // "not less than 60 days written notice", "60 days' prior notice"
    /(\d{1,4}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|sixty|ninety)[\s-]+(day|week|month)s?['’]?\s+(?:prior\s+|advance\s+|written\s+|clear\s+)*notice/gi,
    // "notice of not less than 60 days", "notice period of 30 days"
    /notice(?:\s+period)?\s+(?:of\s+)?(?:not\s+less\s+than\s+|at\s+least\s+)?(\d{1,4}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|sixty|ninety)[\s-]+(day|week|month)s?/gi,
    // "on 30 days notice", "upon 90 days' notice"
    /(?:on|upon|giving|give|by\s+giving)\s+(?:not\s+less\s+than\s+|at\s+least\s+)?(\d{1,4}|thirty|sixty|ninety)[\s-]+(day|week|month)s?/gi,
  ];

  const MAX_NOTICE_DAYS = 185;
  const noticeSeen = new Set<string>();
  const noticeDurations: Duration[] = [];

  for (const re of NOTICE_ADJACENT) {
    for (const m of text.matchAll(re)) {
      const token = (m[1] ?? "").toLowerCase();
      const count = /^\d+$/.test(token) ? Number(token) : (WORD_NUMBERS[token] ?? 0);
      const unit = (m[2] ?? "day").toLowerCase();
      if (count <= 0) continue;
      const days = unit === "day" ? count : unit === "week" ? count * 7 : count * 30;
      if (days > MAX_NOTICE_DAYS) continue;
      const raw = `${count} ${unit}${count === 1 ? "" : "s"}`;
      const context = contextAround(text, m.index ?? 0);
      // Deduplicate on the value plus where it was found, so the three patterns
      // matching the same clause do not report it three times.
      const key = `${days}|${(m.index ?? 0) - ((m.index ?? 0) % 200)}`;
      if (noticeSeen.has(key)) continue;
      noticeSeen.add(key);
      noticeDurations.push({ days, raw, context, unit, count });
    }
  }
  /**
   * Rank by relevance, then by length.
   *
   * A contract contains several notice periods belonging to different rights — a
   * supplier's 90 days to raise fees, a customer's 60 days to not renew, 30 days to
   * request an audit. Simply taking the longest picks whichever clause happens to
   * have the biggest number, which here would be the fee-increase notice: a
   * cancellation date computed from it is wrong by a month in the direction that
   * costs you the renewal.
   *
   * So a notice period is only used for the cancellation date if its own clause is
   * about terminating or not renewing. Among those, the longest is taken, which is
   * the conservative reading.
   */
  const TERMINATION_CONTEXT = /terminat|non[- ]?renew|not\s+to\s+renew|notice\s+of\s+non|end\s+of\s+the\s+(then[- ]current\s+)?term|cancel/i;
  const relevanceOf = (d: Duration) => (TERMINATION_CONTEXT.test(d.context) ? 1 : 0);
  noticeDurations.sort((a, b) => relevanceOf(b) - relevanceOf(a) || b.days - a.days);
  const terminationNotices = noticeDurations.filter((d) => relevanceOf(d) === 1);

  // --- Term length
  const TERM = /\bterm\b|initial\s+period|duration|for\s+a\s+period\s+of/i;
  const termDurations = durations.filter((d) => TERM.test(d.context) && d.days >= 30).sort((a, b) => b.days - a.days);

  // --- Anchor: the renewal or expiry date to count back from.
  const expiryCandidate =
    dates.find((d) => /expir|terminat|end\s+date/i.test(d.context)) ??
    dates.find((d) => /renew/i.test(d.context)) ??
    null;

  const effective =
    dates.find((d) => d.label === "Effective date") ??
    dates.find((d) => d.label === "Start date") ??
    dates.find((d) => d.label === "Execution date") ??
    null;

  const term = termDurations[0] ?? null;
  const termDays = term?.days ?? null;

  /**
   * Advances a date by one contract term.
   *
   * Calendar months, not 30-day blocks. A 12-month term starting 1 September 2024
   * renews on 1 September 2025 — treating it as 360 days lands on 27 August, five
   * days early, and the notice window is then computed from the wrong anchor. On a
   * deadline someone diarises, five days is the whole margin.
   */
  const advanceOneTerm = (from: Date): Date => {
    if (!term) return from;
    if (term.unit === "year") return addMonths(from, term.count * 12);
    if (term.unit === "month") return addMonths(from, term.count);
    if (term.unit === "week") return addDays(from, term.count * 7);
    return addDays(from, term.count);
  };

  // Derive the renewal date if it is not stated but is computable.
  let renewalDate: Date | null = expiryCandidate ? parseIso(expiryCandidate.iso) : null;
  let renewalDerived = false;
  if (!renewalDate && effective && termDays) {
    const start = parseIso(effective.iso);
    if (start) {
      renewalDate = advanceOneTerm(start);
      renewalDerived = true;
    }
  }
  // Roll a past renewal forward, because an auto-renewing contract has already
  // renewed and the next window is the one that matters.
  let renewalsElapsed = 0;
  if (renewalDate && renewalClauses.length > 0 && termDays) {
    while (renewalDate < asOf && renewalsElapsed < 20) {
      renewalDate = advanceOneTerm(renewalDate);
      renewalsElapsed += 1;
    }
  }

  // Only a termination or non-renewal notice can define the cancellation deadline.
  const noticeSource = terminationNotices[0] ?? null;
  const noticeDays = noticeSource?.days ?? null;

  // --- Deadlines
  const deadlines: Deadline[] = [];
  const daysBetween = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / 86_400_000);

  if (renewalDate) {
    const away = daysBetween(renewalDate, asOf);
    deadlines.push({
      what: renewalClauses.length > 0 ? "Contract auto-renews" : "Contract expires",
      date: isoOf(renewalDate),
      daysAway: away,
      why:
        renewalClauses.length > 0
          ? `Unless notice is given, this renews for another ${termDurations[0]?.raw ?? "term"}.${renewalsElapsed > 0 ? ` It has already renewed ${renewalsElapsed} time${renewalsElapsed === 1 ? "" : "s"} since the stated date — this is the next one.` : ""}${renewalDerived ? " Derived from the effective date plus the term, because no renewal date is stated explicitly." : ""}`
          : "The term ends on this date with no automatic renewal identified.",
      severity: away <= 90 ? "high" : "medium",
    });

    if (noticeDays) {
      const lastSafe = addDays(renewalDate, -noticeDays);
      const away2 = daysBetween(lastSafe, asOf);
      deadlines.push({
        what: "LAST SAFE DAY TO CANCEL",
        date: isoOf(lastSafe),
        daysAway: away2,
        why:
          away2 < 0
            ? `This passed ${Math.abs(away2)} days ago, based on ${noticeSource!.raw} notice from the termination clause. If the auto-renewal clause is as written, you are committed to the next term. Read the exact clause below before accepting that — some contracts allow termination for convenience mid-term with a longer notice period.`
            : `${noticeSource!.raw} notice before the renewal date, taken from the termination clause. Miss this by one day and you owe another full term. Put it in a calendar now, not later.`,
        severity: away2 < 0 ? "high" : away2 <= 30 ? "high" : "medium",
      });
    }
  }

  // Payment terms
  const PAYMENT = /net\s*\d{1,3}|payment\s+(is\s+)?due|within\s+\d{1,3}\s+days\s+of\s+(the\s+)?invoice/i;
  const paymentClauses = clausesMatching(text, PAYMENT);
  const netMatch = /net\s*(\d{1,3})/i.exec(text);

  const sections: { title: string; items: ResultItem[] }[] = [];

  if (deadlines.length > 0) {
    sections.push({
      title: "Deadlines",
      items: deadlines
        .sort((a, b) => a.daysAway - b.daysAway)
        .map((d) => ({
          title: `${d.what} — ${d.date}`,
          body: `${d.daysAway < 0 ? `${Math.abs(d.daysAway)} days ago` : `in ${d.daysAway} days`}. ${d.why}`,
          tag: d.daysAway < 0 ? "PASSED" : `${d.daysAway}d`,
          severity: d.severity,
        })),
    });
  } else {
    sections.push({
      title: "No deadline could be computed",
      items: [
        {
          body:
            "No renewal or expiry date was found, and no term length that could be combined with an effective date. That is a genuine result, not a failure to try — some contracts genuinely state neither. Read the clauses listed below and enter the dates manually. This is reported plainly rather than producing a guessed date, because a wrong deadline in a calendar is worse than an empty one.",
          severity: "high",
        },
      ],
    });
  }

  if (renewalClauses.length > 0) {
    sections.push({
      title: `Auto-renewal clauses — ${renewalClauses.length}`,
      items: renewalClauses.map((c) => ({
        body: c,
        tag: "read this exactly",
        severity: "high" as Severity,
      })),
    });
  } else {
    sections.push({
      title: "No auto-renewal clause found",
      items: [
        {
          body: "No automatic renewal language was matched. Check for wording such as 'shall continue thereafter' or 'unless either party gives notice', which some drafters use to the same effect without the word 'renew'. If the contract genuinely has no auto-renewal, it simply expires — which is the safer position for you.",
          severity: "medium",
        },
      ],
    });
  }

  if (noticeDurations.length > 0) {
    sections.push({
      title: `Notice periods — ${noticeDurations.length}`,
      items: noticeDurations.map((d) => {
        const relevant = TERMINATION_CONTEXT.test(d.context);
        const used = d === noticeSource;
        return {
          title: `${d.raw} (${d.days} days)${used ? " — used for the cancellation date" : ""}`,
          body: `${d.context}\n\n${
            used
              ? "This clause is about terminating or not renewing, and it is the longest such period, so it defines the last safe cancellation date."
              : relevant
                ? "Also a termination-related notice, but shorter, so the longer one above is used as the conservative reading."
                : "This notice period belongs to a different right — a fee change, an audit request or similar — so it is NOT used for the cancellation date. Contracts routinely contain several notice periods, and using the wrong one is how a cancellation date ends up a month out."
          }`,
          severity: (used ? "high" : "low") as Severity,
        };
      }),
    });
  }

  if (paymentClauses.length > 0 || netMatch) {
    sections.push({
      title: "Payment terms",
      items: [
        {
          title: netMatch ? `Net ${netMatch[1]}` : "Payment terms found",
          body:
            paymentClauses.slice(0, 3).join("\n\n") ||
            `Payment appears to be due ${netMatch![1]} days from invoice. Check whether that runs from invoice date or receipt — the difference is often a week of working capital.`,
          severity: "low",
        },
      ],
    });
  }

  if (dates.length > 0) {
    sections.push({
      title: `Every date found — ${dates.length}`,
      items: dates.map((d) => ({
        title: `${d.iso} — ${d.label}`,
        body: `Written as "${d.raw}".\n${d.context}`,
        tag: d.label,
        severity: "low" as Severity,
      })),
    });
  }

  // Ambiguity and limits, always shown.
  const ambiguous = dates.filter((d) => /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(d.raw) && Number(d.raw.split("/")[0]) <= 12);
  const limits: ResultItem[] = [];
  if (ambiguous.length > 0) {
    limits.push({
      title: `${ambiguous.length} ambiguous date${ambiguous.length === 1 ? "" : "s"}`,
      body: `${ambiguous.map((d) => d.raw).join(", ")} — read as day/month, the Indian and European convention. If this contract is American, these are month/day and every date above shifts. Confirm before diarising anything.`,
      severity: "high",
    });
  }
  limits.push(
    {
      body: "Only dates and durations written in the text are found. A deadline defined by an event — 'within 30 days of go-live' — cannot be resolved without knowing when that event happened.",
      severity: "medium",
    },
    {
      body: "Where several notice periods appear, the longest is used for the cancellation date. That is deliberately conservative; it may not be the one that applies to your termination right.",
      severity: "medium",
    },
    {
      body: "This is not legal advice and does not interpret obligations. It finds dates, durations and renewal language so a person reads the right three clauses instead of forty pages.",
      severity: "low",
    },
  );
  sections.push({ title: "Limits of this extraction — read before diarising", items: limits });

  // --- ICS
  const icsEvents = deadlines
    .filter((d) => d.daysAway >= 0)
    .map((d, i) => {
      const stamp = d.date.replace(/-/g, "");
      const alarm = isoOf(addDays(parseIso(d.date)!, -14)).replace(/-/g, "");
      return [
        "BEGIN:VEVENT",
        `UID:contractclock-${stamp}-${i}@abetworks.in`,
        `DTSTAMP:${isoOf(asOf).replace(/-/g, "")}T000000Z`,
        `DTSTART;VALUE=DATE:${stamp}`,
        `DTEND;VALUE=DATE:${isoOf(addDays(parseIso(d.date)!, 1)).replace(/-/g, "")}`,
        `SUMMARY:${d.what} — ${counterparty}`,
        `DESCRIPTION:${d.why.replace(/\n/g, "\\n").slice(0, 400)}`,
        "BEGIN:VALARM",
        `TRIGGER;VALUE=DATE-TIME:${alarm}T090000Z`,
        "ACTION:DISPLAY",
        `DESCRIPTION:Two weeks until: ${d.what} — ${counterparty}`,
        "END:VALARM",
        "END:VEVENT",
      ].join("\r\n");
    });

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Abet Works//ContractClock//EN",
    "CALSCALE:GREGORIAN",
    ...icsEvents,
    "END:VCALENDAR",
  ].join("\r\n");

  const urgent = deadlines.filter((d) => d.daysAway >= 0 && d.daysAway <= 60).length;
  const passed = deadlines.filter((d) => d.daysAway < 0).length;
  const nextDeadline = deadlines.filter((d) => d.daysAway >= 0).sort((a, b) => a.daysAway - b.daysAway)[0];

  const risk =
    passed > 0 ? 90 : urgent > 0 ? 70 : renewalClauses.length > 0 && !noticeDays ? 55 : deadlines.length === 0 ? 45 : 20;

  return {
    headline:
      passed > 0
        ? `A cancellation window has already passed. ${counterparty}: ${deadlines.find((d) => d.daysAway < 0)!.what.toLowerCase()} deadline was ${deadlines.find((d) => d.daysAway < 0)!.date}.`
        : nextDeadline
          ? `Next deadline in ${nextDeadline.daysAway} days: ${nextDeadline.what.toLowerCase()} on ${nextDeadline.date}.${renewalClauses.length > 0 ? " This contract auto-renews." : ""}`
          : `${dates.length} dates and ${durations.length} durations found, but no renewal deadline could be computed. Read the clauses below.`,

    score: {
      label: "Renewal risk",
      value: risk,
      max: 100,
      band: risk >= 70 ? "bad" : risk >= 45 ? "warn" : "good",
    },

    metrics: [
      { label: "Auto-renews", value: renewalClauses.length > 0 ? "yes" : "not found" },
      { label: "Notice to cancel", value: noticeSource?.raw ?? "not found", hint: noticeSource ? "from the termination clause" : undefined },
      { label: "Next deadline", value: nextDeadline ? `${nextDeadline.daysAway}d` : "—" },
      { label: "Dates found", value: String(dates.length) },
      { label: "Term", value: termDurations[0]?.raw ?? "not found" },
    ],

    sections,

    table: {
      columns: ["Date", "Days away", "What", "Severity"],
      rows: deadlines
        .sort((a, b) => a.daysAway - b.daysAway)
        .map((d) => [d.date, d.daysAway < 0 ? `${d.daysAway}` : `+${d.daysAway}`, d.what, d.severity]),
    },

    copyBlocks: [
      { title: `Calendar file — ${icsEvents.length} event${icsEvents.length === 1 ? "" : "s"} with a two-week reminder`, text: ics, language: "text" },
      {
        title: "Summary for the file",
        text: [
          `# Contract summary — ${counterparty}`,
          "",
          `Reviewed as at: ${isoOf(asOf)}`,
          "",
          `- **Auto-renews:** ${renewalClauses.length > 0 ? "Yes" : "No clause found"}`,
          `- **Term:** ${termDurations[0]?.raw ?? "Not stated in a form we could extract"}`,
          `- **Notice to cancel:** ${noticeSource?.raw ?? "Not stated in a form we could extract"}${noticeSource ? " (from the termination clause)" : ""}`,
          `- **Renewal date:** ${renewalDate ? isoOf(renewalDate) : "Could not be computed"}${renewalDerived ? " (derived from effective date plus term)" : ""}`,
          `- **Last safe day to cancel:** ${
            renewalDate && noticeDays ? isoOf(addDays(renewalDate, -noticeDays)) : "Could not be computed"
          }`,
          `- **Payment terms:** ${netMatch ? `Net ${netMatch[1]}` : "Not stated in a form we could extract"}`,
          "",
          "## Clauses to read in full",
          "",
          ...(renewalClauses.length > 0 ? renewalClauses.map((c) => `> ${c}`) : ["> No auto-renewal clause matched."]),
          "",
          "## Deadlines",
          "",
          ...deadlines.map((d) => `- **${d.date}** (${d.daysAway < 0 ? `${Math.abs(d.daysAway)} days ago` : `in ${d.daysAway} days`}) — ${d.what}`),
        ].join("\n"),
        language: "markdown",
      },
    ],

    json: {
      counterparty,
      asOf: isoOf(asOf),
      autoRenews: renewalClauses.length > 0,
      renewalClauses,
      termDays,
      noticeDays,
      noticeSource: noticeSource ? { raw: noticeSource.raw, days: noticeSource.days, context: noticeSource.context } : null,
      allNoticePeriods: noticeDurations.map((d) => ({ raw: d.raw, days: d.days, terminationRelated: TERMINATION_CONTEXT.test(d.context) })),
      renewalDate: renewalDate ? isoOf(renewalDate) : null,
      renewalDerived,
      renewalsElapsed,
      lastSafeCancelDate: renewalDate && noticeDays ? isoOf(addDays(renewalDate, -noticeDays)) : null,
      deadlines,
      dates,
      durations: durations.map((d) => ({ raw: d.raw, days: d.days })),
      paymentTerms: netMatch ? `Net ${netMatch[1]}` : null,
      ambiguousDates: ambiguous.map((d) => d.raw),
    },
  };
}
