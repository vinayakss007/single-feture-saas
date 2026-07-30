import type { ResultItem, RunInput, RunResult, Severity } from "./types";

/**
 * DealBrief engine — deterministic, no LLM required.
 *
 * The whole product is this file: transcript in, qualified deal brief out.
 * Everything is rule based on purpose, so the same transcript always produces
 * the same brief and a call costs nothing to process.
 */

type Turn = { speaker: string; role: "rep" | "buyer"; text: string; index: number };

const REP_HINTS = /\b(rep|ae|sales|account executive|am|csm|solutions|se|me)\b/i;

const DATE_PATTERNS: RegExp[] = [
  /\bby (?:this |next )?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  /\b(?:this|next) (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  /\b(tomorrow|today|tonight)\b/i,
  /\bnext (week|month|quarter)\b/i,
  /\bin (\w+) (days?|weeks?|months?)\b/i,
  /\bby (?:the )?end of (?:the )?(day|week|month|quarter)\b/i,
  /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i,
  /\b(\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\b/,
];

const COMMIT_SUBJECT = /\b(i'?ll|i will|we'?ll|we will|let me|i'?m going to|we'?re going to|i can|i shall)\b/i;
const COMMIT_VERB =
  /\b(send|share|schedule|book|set ?up|follow up|come back|get (?:you|back)|walk through|check|confirm|draft|prepare|review|introduce|loop in|circulate|put together|price|quote)\b/i;

type Dimension = {
  key: string;
  label: string;
  test: RegExp;
  whyItMatters: string;
  criticalFrom: number; // pipeline stage index at which a gap becomes high severity
};

const STAGES = ["Discovery", "Demo", "Evaluation", "Proposal", "Negotiation", "Closing"];

const DIMENSIONS: Dimension[] = [
  {
    key: "metrics",
    label: "Metrics",
    test: /\b(\d[\d,.]*\s*(?:%|percent|hours?|hrs?|days?|weeks?|fte|seats?|users?)|(?:\$|usd|inr|rs\.?|₹|eur|£)\s?[\d,.]+|[\d,.]+\s*(?:dollars|rupees|lakh|crore|k\b|million))/i,
    whyItMatters: "Without a number the buyer cannot build a business case, and finance has nothing to approve.",
    criticalFrom: 2,
  },
  {
    key: "economicBuyer",
    label: "Economic buyer",
    test: /\b(cfo|ceo|coo|cto|vp of finance|finance (?:team|side|lead)|budget holder|decision sits with|sign ?off|signs the|approves the (?:budget|spend)|procurement lead)\b/i,
    whyItMatters: "If you have not identified who can actually release the money, your close date is a guess.",
    criticalFrom: 2,
  },
  {
    key: "decisionCriteria",
    label: "Decision criteria",
    test: /\b(criteria|requirements?|must[- ]have|evaluating|comparing|shortlist|scorecard|rfp|bake[- ]?off|checklist)\b/i,
    whyItMatters: "You cannot win a comparison you have not seen. Ask what they are scoring vendors on.",
    criticalFrom: 2,
  },
  {
    key: "decisionProcess",
    label: "Decision process",
    test: /\b(procurement|legal|security review|infosec|steps|approval|board|committee|paperwork|contract|msa|po\b|purchase order|sign(?:ing)? process)\b/i,
    whyItMatters: "Deals do not slip because of the buyer's intent, they slip because of unmapped internal steps.",
    criticalFrom: 3,
  },
  {
    key: "pain",
    label: "Identified pain",
    test: /\b(pain|problem|issue|losing|manual|struggl\w*|waste\w*|bottleneck|broken|re[- ]?entry|error|delay|firefight\w*|churn)\b/i,
    whyItMatters: "No named pain means no urgency, and no urgency means no budget in this quarter.",
    criticalFrom: 0,
  },
  {
    key: "champion",
    label: "Champion behaviour",
    test: /\b(i'?ll (?:check|ask|talk|come back|raise|push|get)|let me check|i'?ll take it (?:to|internally)|internally|on my side|i'?ll socialise|i'?ll socialize|my (?:cfo|ceo|boss|team) cares)\b/i,
    whyItMatters: "A champion does work for you between calls. If nobody committed to internal work, you have a contact, not a champion.",
    criticalFrom: 2,
  },
  {
    key: "competition",
    label: "Competition",
    test: /\b(also (?:looking at|evaluating|considering)|competitor|alternative|incumbent|another vendor|versus|vs\.?|compared to|currently using|shortlist)\b/i,
    whyItMatters: "You are always being compared to something, including doing nothing. Naming it lets you position.",
    criticalFrom: 2,
  },
];

type RiskRule = {
  id: string;
  label: string;
  test: RegExp;
  severity: Severity;
  advice: string;
};

const RISK_RULES: RiskRule[] = [
  {
    id: "pricing-pushback",
    label: "Pricing pushback",
    test: /\b(too expensive|pricing (?:felt|seems|is|came in) (?:high|expensive|steep)|price is high|cheaper|lower price|discount|budget is tight|out of budget|per[- ]seat pricing felt)\b/i,
    severity: "high",
    advice: "Re-anchor on the quantified pain before you touch the number, then trade the discount for term or volume.",
  },
  {
    id: "competitor-named",
    label: "Competitor in the deal",
    test: /\b(also (?:looking at|evaluating|considering)|their pricing came in|another vendor|incumbent|currently using)\b/i,
    severity: "high",
    advice: "Get the evaluation criteria in writing and build a differentiation slide against the named alternative.",
  },
  {
    id: "single-threaded",
    label: "Single-threaded deal",
    test: /^$/,
    severity: "high",
    advice: "Multi-thread now. Ask your champion for a working session with finance and the technical owner.",
  },
  {
    id: "security-review",
    label: "Security or legal review ahead",
    test: /\b(security (?:will|needs|review|questionnaire)|infosec|legal (?:will|needs|review)|soc ?2|iso ?27001|dpa\b|vendor assessment|penetration test)\b/i,
    severity: "medium",
    advice: "Start the questionnaire in parallel with the commercial track — this is usually the longest pole.",
  },
  {
    id: "stalling",
    label: "Stalling language",
    test: /\b(circle back|touch base|let'?s revisit|hold off|park (?:it|this)|not right now|next (?:quarter|year)|after the (?:quarter|budget cycle)|keep (?:us|me) posted)\b/i,
    severity: "medium",
    advice: "Ask directly what would need to be true to move now. A soft no is cheaper to find today.",
  },
  {
    id: "no-next-step",
    label: "No confirmed next step",
    test: /^$/,
    severity: "high",
    advice: "Never end a call without a calendar invite. Send one within the hour referencing the agreed date.",
  },
  {
    id: "hard-deadline",
    label: "Hard deadline in play",
    test: /\b(before (?:the )?peak|go[- ]?live|deadline|must be live|need to sign in|end of (?:quarter|fiscal)|renewal (?:date|is)|contract expires)\b/i,
    severity: "low",
    advice: "Good news — work backwards from it and put the signature date on the mutual action plan.",
  },
  {
    id: "procurement",
    label: "Procurement involvement",
    test: /\b(procurement|purchase order|po process|vendor onboarding|supplier registration|finance approval)\b/i,
    severity: "medium",
    advice: "Ask for the procurement lead's name and their typical cycle time before you commit to a close date.",
  },
  {
    id: "champion-unclear",
    label: "No internal commitment from the buyer",
    test: /^$/,
    severity: "medium",
    advice: "Ask your contact to do one small piece of internal work. If they will not, they are not your champion.",
  },
];

/**
 * Transcripts label the same human inconsistently — "Priya (VP Operations)" on
 * the first turn and "Priya" after that. Collapsing them on a canonical key is
 * what keeps the stakeholder map and the single-threading check honest.
 */
function canonicalKey(rawSpeaker: string): string {
  const cleaned = rawSpeaker
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z\s]/g, " ")
    .trim();
  return cleaned.split(/\s+/)[0] || rawSpeaker.toLowerCase().trim();
}

function splitTurns(transcript: string): Turn[] {
  const lines = transcript
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const raw: { speaker: string; text: string }[] = [];

  for (const line of lines) {
    const match = /^([^:]{2,60}?):\s*(.+)$/.exec(line);
    if (match) {
      raw.push({ speaker: match[1].trim(), text: match[2].trim() });
    } else if (raw.length > 0) {
      raw[raw.length - 1].text += ` ${line}`;
    } else {
      raw.push({ speaker: "Unlabelled", text: line });
    }
  }

  // Keep the most descriptive label seen for each person.
  const displayName = new Map<string, string>();
  for (const r of raw) {
    const key = canonicalKey(r.speaker);
    const current = displayName.get(key);
    if (!current || r.speaker.length > current.length) displayName.set(key, r.speaker);
  }

  return raw.map((r, index) => {
    const speaker = displayName.get(canonicalKey(r.speaker)) ?? r.speaker;
    return {
      speaker,
      role: REP_HINTS.test(speaker) ? "rep" : "buyer",
      text: r.text,
      index,
    } satisfies Turn;
  });
}

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);
}

function findDate(text: string): string | null {
  for (const pattern of DATE_PATTERNS) {
    const m = pattern.exec(text);
    if (m) return m[0].replace(/^by\s+/i, "").trim();
  }
  return null;
}

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "a", "a and b", "a, b and c" */
function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function extractActions(turns: Turn[]): { owner: string; task: string; due: string | null }[] {
  const actions: { owner: string; task: string; due: string | null }[] = [];
  const seen = new Set<string>();

  for (const turn of turns) {
    for (const sentence of sentences(turn.text)) {
      if (!COMMIT_SUBJECT.test(sentence) || !COMMIT_VERB.test(sentence)) continue;
      const task = titleCase(sentence.replace(/\s+/g, " ").replace(/[.]+$/, ""));
      const key = task.toLowerCase().slice(0, 70);
      if (seen.has(key)) continue;
      seen.add(key);
      actions.push({ owner: turn.speaker, task, due: findDate(sentence) });
    }
  }
  return actions;
}

function extractFacts(transcript: string): ResultItem[] {
  const facts: ResultItem[] = [];
  const push = (tag: string, body: string) => {
    if (!facts.some((f) => f.body === body)) facts.push({ tag, body });
  };

  // Every money pattern must contain an actual digit, otherwise "dispatchers."
  // matches the "rs." currency alternative.
  const money =
    transcript.match(
      /(?:\$|usd|inr|rs\.?|₹|eur|£)\s?\d[\d,.]*(?:\s?(?:k|m|million|lakh|crore))?|\d[\d,.]*\s?(?:dollars|rupees|lakh|crore)(?:\s+(?:a|per)\s+year|\s+annually)?/gi,
    ) ?? [];
  for (const m of money.slice(0, 4)) push("Money", m.trim());

  const effort =
    transcript.match(/\b\d[\d,.]*\s*(?:hours?|hrs?|days?|weeks?)(?:\s+(?:a|per)\s+[a-z]+){0,2}/gi) ?? [];
  for (const m of effort.slice(0, 4)) push("Effort", m.trim());

  const counts = transcript.match(/\b\d[\d,.]*\s*(?:seats?|users?|dispatchers?|agents?|employees?|people|licen[cs]es?)\b/gi) ?? [];
  for (const m of counts.slice(0, 3)) push("Volume", m.trim());

  const timeline =
    transcript.match(
      /\b(?:in|within|before|by)\s+(?:the\s+)?(?:next\s+)?(?:\w+\s+)?(?:weeks?|months?|quarters?|days?|october|november|december|january|february|march|april|may|june|july|august|september|peak season)\b/gi,
    ) ?? [];
  for (const m of timeline.slice(0, 3)) push("Timeline", m.trim());

  return facts;
}

function stakeholderMap(turns: Turn[]): ResultItem[] {
  const totals = new Map<string, number>();
  for (const t of turns) totals.set(t.speaker, (totals.get(t.speaker) ?? 0) + t.text.length);
  const grandTotal = [...totals.values()].reduce((a, b) => a + b, 0) || 1;

  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([speaker, chars]) => {
      const share = Math.round((chars / grandTotal) * 100);
      const turn = turns.find((t) => t.speaker === speaker);
      const spoken = turns.filter((t) => t.speaker === speaker).map((t) => t.text).join(" ");
      let read = "Participant";
      if (turn?.role === "rep") read = "Seller";
      else if (DIMENSIONS[5].test.test(spoken)) read = "Likely champion — committed to internal work";
      else if (DIMENSIONS[1].test.test(spoken)) read = "Close to the money";
      else if (share < 10) read = "Passenger — spoke very little";
      return {
        title: `${speaker} · ${share}% of the call`,
        body: read,
        tag: turn?.role === "rep" ? "Internal" : "Buyer side",
      } satisfies ResultItem;
    });
}

export function run(input: RunInput): RunResult {
  const transcript = (input.transcript ?? "").trim();
  if (transcript.length < 40) {
    throw new Error("Transcript is too short to analyse. Paste at least a few lines of the conversation.");
  }

  const dealName = (input.dealName ?? "").trim() || "Untitled deal";
  const stage = STAGES.includes(input.stage ?? "") ? (input.stage as string) : "Discovery";
  const stageIndex = Math.max(0, STAGES.indexOf(stage));

  const turns = splitTurns(transcript);
  const buyerText = turns.filter((t) => t.role === "buyer").map((t) => t.text).join(" ");
  const buyerSpeakers = new Set(turns.filter((t) => t.role === "buyer").map((t) => t.speaker));

  // ---- qualification coverage -------------------------------------------------
  const covered: string[] = [];
  const gaps: ResultItem[] = [];

  for (const dim of DIMENSIONS) {
    if (dim.test.test(transcript)) {
      covered.push(dim.label);
    } else {
      gaps.push({
        title: `${dim.label} — not covered`,
        body: dim.whyItMatters,
        severity: stageIndex >= dim.criticalFrom ? "high" : "medium",
        tag: `Critical from ${STAGES[dim.criticalFrom]}`,
      });
    }
  }

  // ---- actions ---------------------------------------------------------------
  const actions = extractActions(turns);
  const datedActions = actions.filter((a) => a.due);

  // ---- risks ----------------------------------------------------------------
  const risks: ResultItem[] = [];
  for (const rule of RISK_RULES) {
    let triggered = false;

    if (rule.id === "single-threaded") triggered = buyerSpeakers.size <= 1;
    else if (rule.id === "no-next-step") triggered = datedActions.length === 0;
    else if (rule.id === "champion-unclear") triggered = !DIMENSIONS[5].test.test(buyerText);
    else triggered = rule.test.test(transcript);

    if (!triggered) continue;
    risks.push({ title: rule.label, body: rule.advice, severity: rule.severity, tag: rule.id });
  }

  // ---- score ---------------------------------------------------------------
  const penalty = risks.reduce(
    (sum, r) => sum + (r.severity === "high" ? 12 : r.severity === "medium" ? 6 : 0),
    0,
  );
  const coverageScore = (covered.length / DIMENSIONS.length) * 100;
  const bonus = datedActions.length > 0 ? 6 : 0;
  const value = Math.max(0, Math.min(100, Math.round(coverageScore - penalty + bonus)));
  const band = value >= 70 ? "good" : value >= 45 ? "warn" : "bad";

  const highRisks = risks.filter((r) => r.severity === "high");

  // ---- CRM note ------------------------------------------------------------
  const crmNote = [
    `DEAL: ${dealName}`,
    `STAGE: ${stage}   |   DEAL HEALTH: ${value}/100`,
    "",
    "NEXT STEPS",
    actions.length > 0
      ? actions.map((a) => `- [${a.owner}] ${a.task}${a.due ? ` (due ${a.due})` : " (NO DATE AGREED)"}`).join("\n")
      : "- None captured. Book the next call before end of day.",
    "",
    "QUALIFICATION",
    `- Covered: ${covered.length > 0 ? covered.join(", ") : "nothing yet"}`,
    `- Missing: ${gaps.length > 0 ? gaps.map((g) => g.title?.replace(" — not covered", "")).join(", ") : "nothing"}`,
    "",
    "RISKS",
    risks.length > 0
      ? risks.map((r) => `- ${String(r.severity).toUpperCase()}: ${r.title}`).join("\n")
      : "- None detected",
    "",
    "STAKEHOLDERS",
    [...new Set(turns.map((t) => t.speaker))].join(", "),
  ].join("\n");

  // ---- follow-up email -----------------------------------------------------
  const buyerFirstName = [...buyerSpeakers][0]?.split(/[\s(]/)[0] ?? "there";

  const emailLines: string[] = [
    `Subject: ${dealName} — recap and next step`,
    "",
    `Hi ${buyerFirstName},`,
    "",
    "Thanks for the time today. Capturing what we agreed so nothing sits in anyone's inbox:",
    "",
  ];

  if (actions.length > 0) {
    for (const a of actions) {
      // Do not append "— by Thursday" when the sentence already says Thursday.
      const alreadyDated = a.due ? a.task.toLowerCase().includes(a.due.toLowerCase()) : true;
      emailLines.push(`• ${a.owner}: ${a.task}${a.due && !alreadyDated ? ` — by ${a.due}` : ""}`);
    }
  } else {
    emailLines.push("• (add the agreed next step here — none was confirmed on the call)");
  }

  // Only risks the buyer actually voiced belong in an email to the buyer.
  // Structural risks (single-threading, missing next step) are for the rep only.
  const STRUCTURAL = new Set(["single-threaded", "no-next-step", "champion-unclear"]);
  const voiced = highRisks.filter((r) => !STRUCTURAL.has(String(r.tag)));

  emailLines.push("");
  emailLines.push(
    voiced.length > 0
      ? `You raised ${joinList(voiced.map((r) => String(r.title).toLowerCase()))}. I'll come prepared on that.`
      : "Shout if I have missed anything.",
  );

  if (gaps.length > 0) {
    emailLines.push("");
    emailLines.push(
      `One thing I did not want to assume: ${String(gaps[0].title)
        .replace(" — not covered", "")
        .toLowerCase()}. Could you point me in the right direction?`,
    );
  }

  emailLines.push("", "Best,");
  const followUp = emailLines.join("\n");

  const headline =
    band === "good"
      ? `${dealName} looks healthy at ${value}/100 — ${covered.length}/${DIMENSIONS.length} qualification areas covered, ${risks.length} risk${risks.length === 1 ? "" : "s"} to manage.`
      : band === "warn"
        ? `${dealName} needs work: ${value}/100. ${gaps.length} qualification gap${gaps.length === 1 ? "" : "s"} and ${highRisks.length} high-severity risk${highRisks.length === 1 ? "" : "s"} before this is forecastable.`
        : `${dealName} is not forecastable yet at ${value}/100. Fix the ${highRisks.length} high-severity risk${highRisks.length === 1 ? "" : "s"} and close the ${gaps.length} qualification gap${gaps.length === 1 ? "" : "s"} first.`;

  return {
    headline,
    score: { label: "Deal health", value, max: 100, band },
    metrics: [
      { label: "Next actions", value: String(actions.length), hint: `${datedActions.length} with a date` },
      { label: "Qualification", value: `${covered.length}/${DIMENSIONS.length}`, hint: "MEDDICC coverage" },
      { label: "Risks", value: String(risks.length), hint: `${highRisks.length} high severity` },
      { label: "Buyer-side people", value: String(buyerSpeakers.size), hint: buyerSpeakers.size <= 1 ? "Single-threaded" : "Multi-threaded" },
    ],
    sections: [
      {
        title: `Next actions (${actions.length})`,
        items: actions.map((a) => ({
          title: a.owner,
          body: a.task,
          tag: a.due ? `Due ${a.due}` : "No date agreed",
          severity: a.due ? undefined : "medium",
        })),
      },
      { title: `Risk flags (${risks.length})`, items: risks },
      { title: `Qualification gaps (${gaps.length})`, items: gaps },
      { title: "Stakeholder map", items: stakeholderMap(turns) },
      { title: "Key facts captured", items: extractFacts(transcript) },
    ],
    copyBlocks: [
      { title: "CRM activity note", text: crmNote },
      { title: "Follow-up email draft", text: followUp },
    ],
    json: {
      deal: dealName,
      stage,
      dealHealth: value,
      band,
      qualification: {
        framework: "MEDDICC",
        covered,
        missing: DIMENSIONS.filter((d) => !covered.includes(d.label)).map((d) => d.key),
      },
      actions,
      risks: risks.map((r) => ({ id: r.tag, label: r.title, severity: r.severity, advice: r.body })),
      stakeholders: [...new Set(turns.map((t) => t.speaker))],
      facts: extractFacts(transcript).map((f) => ({ type: f.tag, value: f.body })),
    },
  };
}
