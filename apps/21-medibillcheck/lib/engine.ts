import type { ResultItem, RunInput, RunResult, Severity } from "./types.ts";

/**
 * Hospital bill audit.
 *
 * Finds arithmetic errors, duplicate lines, items insurers routinely refuse, and
 * charges that breach the caps in a typical Indian health policy. It does not
 * comment on whether a treatment was necessary — that is a clinical judgement and
 * nobody should take it from a bill parser.
 *
 * Every rupee figure is traceable to a line in the input, because the output's job
 * is to be taken to a billing desk and argued from.
 */

type Line = { description: string; qty: number; rate: number; amount: number; raw: string; lineNo: number };

type Finding = {
  kind: "arithmetic" | "duplicate" | "non-payable" | "cap" | "tax" | "policy";
  title: string;
  detail: string;
  amount: number;
  severity: Severity;
};

/**
 * Items insurers in India routinely decline as "consumables" or "not payable".
 * The list matters commercially: these are the lines a hospital adds and a policy
 * holder pays out of pocket without realising they could have queried them.
 */
const NON_PAYABLE: [RegExp, string][] = [
  [/\b(gloves?|hand\s*glove)\b/i, "Gloves are treated as a consumable by most insurers"],
  [/\b(syringe|needle)\b/i, "Syringes and needles are usually non-payable consumables"],
  [/\b(cotton|gauze|bandage|dressing\s*material)\b/i, "Dressing material is a standard non-payable consumable"],
  [/\b(mask|face\s*mask|n95|ppe\s*kit|apron|cap\b|shoe\s*cover)\b/i, "PPE and masks are commonly declined"],
  [/\b(sanitiz|sanitis|disinfect|spirit|betadine)\b/i, "Sanitisers and disinfectants are consumables"],
  [/\b(admission\s*(charge|fee)|registration\s*(charge|fee)|record\s*charge|file\s*charge)\b/i, "Administrative and record charges are excluded under most policies"],
  [/\b(attendant|companion)\s*(charge|food|meal|bed)?/i, "Attendant charges and food are not covered"],
  [/\b(telephone|television|tv\s*charge|internet|newspaper|laundry|toiletries)\b/i, "Amenity charges are explicitly excluded"],
  [/\b(service\s*charge|surcharge|misc(ellaneous)?\s*charge)\b/i, "Unspecified service or miscellaneous charges should be itemised before you pay them"],
  [/\b(document(ation)?\s*charge|discharge\s*(summary|charge))\b/i, "Documentation charges are excluded"],
  [/\b(thermometer|bp\s*(monitor|apparatus)|oximeter|nebuliz)\b/i, "Reusable equipment charged as a consumable is usually declined"],
  [/\b(diaper|underpad|sheet|pillow\s*cover)\b/i, "Linen and disposables are consumables"],
];

/** Sub-limits a typical indemnity policy applies once room rent is capped. */
const PROPORTIONATE_TRIGGERS = /\b(room\s*rent|bed\s*charge|ward\s*charge|icu\s*charge|nursing\s*charge)\b/i;

function splitLine(line: string): string[] {
  return line.split(/\t|\s{2,}|\s*\|\s*|,(?=\s*[\d₹])/).map((c) => c.trim()).filter(Boolean);
}

function toNumber(value: string | undefined): number {
  if (!value) return Number.NaN;
  const cleaned = value.replace(/[₹$,\s]/g, "");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : Number.NaN;
}

function rupees(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}₹${Math.abs(Math.round(n)).toLocaleString("en-IN")}`;
}

/** Normalises a description so "Inj. Monocef 1g" and "INJ MONOCEF 1G" collide. */
function descKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(inj|tab|cap|syp|iv|mg|ml|gm?|nos?|no|qty)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseBill(text: string): { lines: Line[]; unparsed: string[] } {
  const lines: Line[] = [];
  const unparsed: string[] = [];

  text.split(/\r?\n/).forEach((raw, index) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    // Skip obvious headers and totals; totals are read separately.
    if (/^(s\.?\s*no|sr|particular|description|item|date|total|grand\s*total|sub\s*total|amount\s*in\s*words|patient|hospital|bill\s*no|uhid|ip\s*no)/i.test(trimmed)) return;

    const cells = splitLine(trimmed);
    if (cells.length < 2) {
      if (/\d/.test(trimmed)) unparsed.push(`Line ${index + 1}: ${trimmed.slice(0, 70)}`);
      return;
    }

    // The last numeric cell is the amount; a preceding pair may be qty and rate.
    const numeric = cells.map(toNumber);
    let amountIdx = -1;
    for (let i = cells.length - 1; i >= 0; i -= 1) {
      if (Number.isFinite(numeric[i]!)) {
        amountIdx = i;
        break;
      }
    }
    if (amountIdx <= 0) {
      unparsed.push(`Line ${index + 1}: ${trimmed.slice(0, 70)}`);
      return;
    }

    const amount = numeric[amountIdx]!;
    const before = numeric.slice(0, amountIdx).filter((n) => Number.isFinite(n)) as number[];
    let qty = 1;
    let rate = amount;
    if (before.length >= 2) {
      qty = before[before.length - 2]!;
      rate = before[before.length - 1]!;
    } else if (before.length === 1) {
      // Ambiguous: could be qty or rate. Treat as qty only if it divides cleanly.
      const candidate = before[0]!;
      if (candidate > 0 && candidate < 500 && Math.abs(amount / candidate - Math.round(amount / candidate)) < 0.01) {
        qty = candidate;
        rate = amount / candidate;
      }
    }

    const description = cells
      .slice(0, amountIdx)
      .filter((c) => !Number.isFinite(toNumber(c)) || /[a-z]{3}/i.test(c))
      .join(" ")
      .replace(/^\d+[.)]\s*/, "")
      .trim();

    if (!description || amount <= 0) {
      unparsed.push(`Line ${index + 1}: ${trimmed.slice(0, 70)}`);
      return;
    }

    lines.push({ description, qty: qty || 1, rate, amount, raw: trimmed, lineNo: index + 1 });
  });

  return { lines, unparsed };
}

function statedTotal(text: string): number | null {
  const m = /(?:grand\s*total|net\s*payable|total\s*amount|bill\s*total)\s*[:\-]?\s*₹?\s*([\d,]+(?:\.\d+)?)/i.exec(text);
  return m ? toNumber(m[1]) : null;
}

export async function run(input: RunInput): Promise<RunResult> {
  const text = (input.bill ?? "").trim();
  if (text.length < 40) {
    throw new Error("Paste the itemised bill. A total on its own cannot be audited — the errors are always in the line items.");
  }

  const { lines, unparsed } = parseBill(text);
  if (lines.length === 0) {
    throw new Error(
      "No billable lines could be read. Each line needs a description and an amount, separated by tabs, multiple spaces or a pipe. Copying from a PDF usually preserves that.",
    );
  }

  const insured = (input.insurance ?? "Yes — cashless or reimbursement").startsWith("Yes");
  const sumInsured = toNumber(input.sumInsured ?? "") || 0;
  const roomCapPercent = Number.parseFloat((input.roomCap ?? "1").replace(/[^\d.]/g, "")) || 0;

  const findings: Finding[] = [];
  const billedTotal = lines.reduce((s, l) => s + l.amount, 0);

  // --- arithmetic: qty × rate must equal the line amount
  for (const line of lines) {
    if (line.qty > 1 && Number.isFinite(line.rate)) {
      const expected = Math.round(line.qty * line.rate * 100) / 100;
      if (Math.abs(expected - line.amount) > 1) {
        findings.push({
          kind: "arithmetic",
          title: line.description,
          detail: `Line ${line.lineNo}: ${line.qty} × ${rupees(line.rate)} = ${rupees(expected)}, but the bill shows ${rupees(line.amount)}. Difference ${rupees(line.amount - expected)}.`,
          amount: Math.max(0, line.amount - expected),
          severity: "high",
        });
      }
    }
  }

  // --- stated total vs sum of lines
  const stated = statedTotal(text);
  if (stated !== null && Math.abs(stated - billedTotal) > 2) {
    findings.push({
      kind: "arithmetic",
      title: "Bill total does not match the line items",
      detail: `The lines add to ${rupees(billedTotal)} but the bill states ${rupees(stated)}. Difference ${rupees(stated - billedTotal)}. Ask for the reconciliation before paying — this is the single most common billing error.`,
      amount: Math.max(0, stated - billedTotal),
      severity: "high",
    });
  }

  // --- duplicates: same normalised description charged more than once
  const groups = new Map<string, Line[]>();
  for (const line of lines) {
    const key = descKey(line.description);
    if (key.length < 4) continue;
    const list = groups.get(key) ?? [];
    list.push(line);
    groups.set(key, list);
  }
  for (const [, group] of groups) {
    if (group.length < 2) continue;
    // Repeated medication across days is normal; an identical amount repeated is
    // the suspicious case, so only flag exact-amount repeats.
    const sameAmount = group.filter((l) => Math.abs(l.amount - group[0]!.amount) < 1);
    if (sameAmount.length < 2) continue;
    const extra = sameAmount.slice(1).reduce((s, l) => s + l.amount, 0);
    findings.push({
      kind: "duplicate",
      title: `"${group[0]!.description}" charged ${sameAmount.length} times at the same amount`,
      detail: `Lines ${sameAmount.map((l) => l.lineNo).join(", ")}, each ${rupees(group[0]!.amount)}. Repeat charges across days are normal for medication; identical amounts repeated on one bill are worth asking about. If it was genuinely administered more than once, the dates should differ. Potential overcharge ${rupees(extra)}.`,
      amount: extra,
      severity: "medium",
    });
  }

  // --- non-payable items
  let nonPayableTotal = 0;
  for (const line of lines) {
    for (const [pattern, why] of NON_PAYABLE) {
      if (!pattern.test(line.description)) continue;
      nonPayableTotal += line.amount;
      findings.push({
        kind: "non-payable",
        title: line.description,
        detail: `${rupees(line.amount)} on line ${line.lineNo}. ${why}. ${insured ? "Your insurer will almost certainly deduct this, so it lands on you — query it with the hospital before discharge rather than after." : "Worth questioning even without insurance: several of these are charges regulators have told hospitals not to levy separately."}`,
        amount: line.amount,
        severity: "medium",
      });
      break;
    }
  }

  // --- room rent cap and proportionate deduction
  const roomLines = lines.filter((l) => /\b(room\s*rent|bed\s*charge|ward|icu|hdu)\b/i.test(l.description));
  const roomTotal = roomLines.reduce((s, l) => s + l.amount, 0);
  const roomDays = roomLines.reduce((s, l) => s + (l.qty > 1 ? l.qty : 1), 0) || 1;
  const roomPerDay = roomTotal / roomDays;

  if (insured && sumInsured > 0 && roomCapPercent > 0 && roomPerDay > 0) {
    const allowedPerDay = (sumInsured * roomCapPercent) / 100;
    if (roomPerDay > allowedPerDay) {
      // This is the deduction almost nobody sees coming: exceeding the room cap
      // scales down every associated charge, not just the room.
      const ratio = allowedPerDay / roomPerDay;
      const associated = lines
        .filter((l) => PROPORTIONATE_TRIGGERS.test(l.description) || /\b(surgeon|anaesth|consultant|visit|procedure|ot\s*charge|operation\s*theatre)\b/i.test(l.description))
        .reduce((s, l) => s + l.amount, 0);
      const deduction = associated * (1 - ratio);
      findings.push({
        kind: "cap",
        title: "Room rent exceeds your policy cap — proportionate deduction applies",
        detail: `Room is ${rupees(roomPerDay)} a day. Your policy allows ${roomCapPercent}% of ${rupees(sumInsured)} = ${rupees(allowedPerDay)} a day. Because you exceeded it, most indemnity policies scale down the *associated* charges too — surgeon, anaesthetist, nursing, OT — by the same ratio. On ${rupees(associated)} of associated charges that is roughly ${rupees(deduction)} deducted, on top of the room difference itself. Ask to be moved to an eligible room category, ideally on admission.`,
        amount: deduction + (roomPerDay - allowedPerDay) * roomDays,
        severity: "high",
      });
    }
  }

  // --- GST: healthcare services are exempt; a GST line on treatment is wrong
  const gstLines = lines.filter((l) => /\b(gst|cgst|sgst|igst|tax)\b/i.test(l.description));
  for (const line of gstLines) {
    findings.push({
      kind: "tax",
      title: `Tax charged: ${line.description}`,
      detail: `${rupees(line.amount)} on line ${line.lineNo}. Healthcare services provided by a clinical establishment are exempt from GST in India. Tax is legitimate on some non-clinical items — a room above the notified threshold, or retail pharmacy sales — but a GST line sitting on treatment or consultation charges should be questioned. Ask which specific items it applies to.`,
      amount: line.amount,
      severity: "medium",
    });
  }

  // --- sum insured exhaustion
  if (insured && sumInsured > 0 && billedTotal > sumInsured) {
    findings.push({
      kind: "policy",
      title: "Bill exceeds your sum insured",
      detail: `Billed ${rupees(billedTotal)} against a sum insured of ${rupees(sumInsured)}. ${rupees(billedTotal - sumInsured)} falls to you before any other deduction. If you hold a top-up or super top-up policy, this is the point to invoke it — the deductible is usually measured per hospitalisation.`,
      amount: billedTotal - sumInsured,
      severity: "high",
    });
  }

  const questionable = findings.reduce((s, f) => s + f.amount, 0);
  const highSeverity = findings.filter((f) => f.severity === "high");

  const byKind = (kind: Finding["kind"]) => findings.filter((f) => f.kind === kind);

  const sections: { title: string; items: ResultItem[] }[] = [];
  const group = (label: string, kind: Finding["kind"]) => {
    const list = byKind(kind);
    if (list.length === 0) return;
    sections.push({
      title: `${label} — ${list.length}, ${rupees(list.reduce((s, f) => s + f.amount, 0))}`,
      items: list.map((f) => ({ title: f.title, body: f.detail, tag: rupees(f.amount), severity: f.severity })),
    });
  };

  group("Arithmetic errors", "arithmetic");
  group("Policy caps", "cap");
  group("Non-payable items", "non-payable");
  group("Possible duplicates", "duplicate");
  group("Tax", "tax");
  group("Sum insured", "policy");

  if (findings.length === 0) {
    sections.push({
      title: "No mechanical errors found",
      items: [
        {
          body: `All ${lines.length} lines add up, no duplicate amounts, no commonly declined consumables, and no tax on treatment. That covers the errors a bill audit can find from the bill alone.`,
          severity: "low",
        },
      ],
    });
  }

  sections.push({
    title: "What this cannot check — and will not pretend to",
    items: [
      { body: "Whether a treatment, test or procedure was medically necessary. That is a clinical judgement and no bill parser should offer one.", severity: "medium" as Severity },
      { body: "Whether a rate is fair. Hospitals price freely outside government schemes, so a high rate is not by itself an error. What is checkable is whether the arithmetic holds and whether the item is payable.", severity: "medium" as Severity },
      { body: "Your specific policy wording. The caps applied here are the common indemnity structure; your own document governs. Sub-limits on named procedures are especially variable.", severity: "medium" as Severity },
      ...(unparsed.length > 0
        ? [{ body: `${unparsed.length} line${unparsed.length === 1 ? "" : "s"} could not be read and were excluded, so the totals below are for what was parsed: ${unparsed.slice(0, 4).join(" · ")}${unparsed.length > 4 ? " …" : ""}`, severity: "high" as Severity }]
        : []),
    ],
  });

  const query = [
    `To: Billing department`,
    `Re: Query on bill${input.billNo ? ` ${input.billNo}` : ""}${input.patient ? ` — ${input.patient}` : ""}`,
    "",
    `Before settling, I would like clarification on the following ${findings.length} item${findings.length === 1 ? "" : "s"}, totalling ${rupees(questionable)}.`,
    "",
    ...findings.map((f, i) => `${i + 1}. ${f.title} — ${rupees(f.amount)}\n   ${f.detail.replace(/\s+/g, " ")}`),
    "",
    "Please provide a revised bill or a written explanation for each. I am happy to settle the undisputed balance immediately.",
  ].join("\n");

  return {
    headline:
      questionable > 0
        ? `${rupees(questionable)} across ${findings.length} item${findings.length === 1 ? "" : "s"} worth querying on a ${rupees(billedTotal)} bill${highSeverity.length > 0 ? ` — ${highSeverity.length} of them serious` : ""}.`
        : `${rupees(billedTotal)} across ${lines.length} lines, no mechanical errors found.`,

    score: {
      label: "Questionable share of bill",
      value: billedTotal > 0 ? Math.min(100, Math.round((questionable / billedTotal) * 100)) : 0,
      max: 100,
      band: questionable / Math.max(1, billedTotal) > 0.1 ? "bad" : questionable > 0 ? "warn" : "good",
    },

    metrics: [
      { label: "Billed", value: rupees(billedTotal), hint: `${lines.length} lines` },
      { label: "Worth querying", value: rupees(questionable) },
      { label: "Non-payable", value: rupees(nonPayableTotal), hint: "insurer will likely deduct" },
      { label: "Findings", value: String(findings.length), hint: `${highSeverity.length} high` },
    ],

    sections,

    table: {
      columns: ["Line", "Item", "Qty", "Rate", "Amount"],
      rows: lines.map((l) => [String(l.lineNo), l.description.slice(0, 48), String(l.qty), rupees(l.rate), rupees(l.amount)]),
    },

    copyBlocks: [
      { title: "Query letter for the billing desk", text: query, language: "text" },
      {
        title: "Findings as CSV",
        text: [
          "kind,item,amount,severity",
          ...findings.map((f) => `${f.kind},"${f.title.replace(/"/g, "''")}",${Math.round(f.amount)},${f.severity}`),
        ].join("\n"),
        language: "csv",
      },
    ],

    json: {
      billedTotal,
      statedTotal: stated,
      questionable,
      nonPayableTotal,
      lineCount: lines.length,
      unparsedLines: unparsed,
      findings,
    },
  };
}
