import type { ResultItem, RunInput, RunResult, Severity } from "./types.ts";

/**
 * GSTR-2B versus purchase register reconciliation.
 *
 * The design decision that matters: matching is on GSTIN plus a normalised invoice
 * number, never on amount. Amount matching looks clever and finds a few more pairs,
 * but it also invents pairs — and a false match hides a missing invoice, which is
 * exactly the credit this product exists to find. Being unable to match is a
 * reportable outcome here; guessing is not.
 */

type Row = {
  gstin: string;
  invoiceNo: string;
  /** normalised comparison key for the invoice number */
  key: string;
  date: string;
  taxable: number;
  tax: number;
  lineNo: number;
};

type Pair = { left: Row; right: Row; taxableDiff: number; taxDiff: number };

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

/** Handles quoted fields, which every spreadsheet export produces sooner or later. */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]!;
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else quoted = false;
      } else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === "," || ch === "\t" || ch === ";") {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

/**
 * Column names are matched by intent, not by exact string. Real exports say
 * "Supplier GSTIN", "GSTIN of supplier", "gstin_no" and half a dozen others, and
 * refusing all but one spelling would make the product useless in practice.
 */
const COLUMN_PATTERNS: Record<string, RegExp> = {
  gstin: /gstin|gst\s*no|supplier\s*gst|tax\s*payer/i,
  invoiceNo: /invoice\s*(no|num|#)|inv\s*no|bill\s*no|document\s*(no|num)|^inv$/i,
  date: /date/i,
  taxable: /taxable|assessable|net\s*(value|amount)|base\s*(value|amount)/i,
  igst: /^i\s*gst|integrated/i,
  cgst: /^c\s*gst|central/i,
  sgst: /^s\s*gst|state|ut\s*gst/i,
  cess: /cess/i,
  tax: /^(total\s*)?tax(\s*amount)?$|gst\s*amount/i,
};

function mapColumns(header: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  header.forEach((raw, i) => {
    const name = raw.replace(/[_-]+/g, " ").trim();
    for (const [field, pattern] of Object.entries(COLUMN_PATTERNS)) {
      if (map[field] === undefined && pattern.test(name)) map[field] = i;
    }
  });
  return map;
}

function toNumber(value: string | undefined): number {
  if (!value) return 0;
  // Indian exports use lakh grouping (1,15,640.00); stripping all commas is correct.
  const cleaned = value.replace(/[₹$\s,]/g, "").replace(/\((.*)\)/, "-$1");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/**
 * The heart of the matching. Strips everything a human varies — case, separators,
 * and leading zeros within each segment — so INV/2026/0412 and inv-2026-412
 * collapse to the same key.
 *
 * Segments are normalised BEFORE separators are removed, and this order matters:
 * stripping separators first merges 2026 and 0412 into the single run 20260412,
 * whose leading zero is now interior and therefore preserved, so the two spellings
 * no longer match. That produces the exact failure this product exists to prevent —
 * an invoice reported as missing from 2B when it is present under a different
 * format, sending someone to chase a supplier who did nothing wrong.
 */
function invoiceKey(raw: string): string {
  return raw
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter(Boolean)
    .map((segment) =>
      // Normalise leading zeros only where the segment is entirely numeric.
      /^\d+$/.test(segment) ? String(Number(segment)) : segment,
    )
    .join("")
    .trim();
}

function normaliseGstin(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function normaliseDate(raw: string): string {
  const m = /^(\d{1,4})[/-](\d{1,2})[/-](\d{2,4})$/.exec(raw.trim());
  if (!m) return raw.trim();
  const [, a, b, c] = m;
  // A four-digit first field can only be a year.
  if (a!.length === 4) return `${a}-${b!.padStart(2, "0")}-${c!.padStart(2, "0")}`;
  const year = c!.length === 2 ? `20${c}` : c;
  return `${year}-${b!.padStart(2, "0")}-${a!.padStart(2, "0")}`;
}

/** GSTIN check digit, base-36 weighted — catches a transposed character. */
const GSTIN_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function gstinValid(gstin: string): boolean {
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z][A-Z0-9][0-9A-Z]$/.test(gstin)) return false;
  let sum = 0;
  for (let i = 0; i < 14; i += 1) {
    const value = GSTIN_ALPHABET.indexOf(gstin[i]!);
    if (value < 0) return false;
    const factor = i % 2 === 0 ? 1 : 2;
    const product = value * factor;
    sum += Math.floor(product / 36) + (product % 36);
  }
  const expected = GSTIN_ALPHABET[(36 - (sum % 36)) % 36];
  return gstin[14] === expected;
}

type ParseOutcome = { rows: Row[]; skipped: string[]; missingColumns: string[] };

function parse(csv: string, label: string): ParseOutcome {
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^[,;\t\s]*$/.test(l));

  if (lines.length < 2) {
    throw new Error(`${label} needs a header row and at least one data row.`);
  }

  const header = splitCsvLine(lines[0]!);
  const cols = mapColumns(header);

  const missingColumns: string[] = [];
  for (const required of ["gstin", "invoiceNo", "taxable"]) {
    if (cols[required] === undefined) missingColumns.push(required);
  }
  const hasTax = cols.tax !== undefined || cols.igst !== undefined || cols.cgst !== undefined || cols.sgst !== undefined;
  if (!hasTax) missingColumns.push("tax (or IGST/CGST/SGST)");

  if (missingColumns.length > 0) {
    throw new Error(
      `${label} is missing ${missingColumns.join(", ")}. Found columns: ${header.join(", ")}. Rename the header or add the column — guessing would give you a wrong reconciliation.`,
    );
  }

  const rows: Row[] = [];
  const skipped: string[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const cells = splitCsvLine(lines[i]!);
    const gstin = normaliseGstin(cells[cols.gstin!] ?? "");
    const invoiceNo = (cells[cols.invoiceNo!] ?? "").trim();

    if (!gstin && !invoiceNo) continue; // blank filler row
    if (!gstin || !invoiceNo) {
      skipped.push(`${label} line ${i + 1}: ${!gstin ? "no GSTIN" : "no invoice number"} — cannot be matched, so it is excluded.`);
      continue;
    }

    const taxable = toNumber(cells[cols.taxable!]);
    const tax =
      cols.tax !== undefined && toNumber(cells[cols.tax]) > 0
        ? toNumber(cells[cols.tax])
        : toNumber(cells[cols.igst ?? -1]) +
          toNumber(cells[cols.cgst ?? -1]) +
          toNumber(cells[cols.sgst ?? -1]) +
          toNumber(cells[cols.cess ?? -1]);

    rows.push({
      gstin,
      invoiceNo,
      key: `${gstin}|${invoiceKey(invoiceNo)}`,
      date: normaliseDate(cells[cols.date ?? -1] ?? ""),
      taxable,
      tax,
      lineNo: i + 1,
    });
  }

  return { rows, skipped, missingColumns };
}

function rupees(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}₹${Math.abs(Math.round(n)).toLocaleString("en-IN")}`;
}

function toleranceValue(label: string): number {
  const m = /(\d+)/.exec(label ?? "");
  return m ? Number(m[1]) : 1;
}

// ---------------------------------------------------------------------------
// run
// ---------------------------------------------------------------------------

export async function run(input: RunInput): Promise<RunResult> {
  const twoB = parse(input.gstr2b ?? "", "GSTR-2B");
  const reg = parse(input.register ?? "", "Purchase register");

  if (twoB.rows.length === 0 || reg.rows.length === 0) {
    throw new Error("Both sides need at least one usable row with a GSTIN and an invoice number.");
  }

  const tol = toleranceValue(input.tolerance ?? "₹1");

  // Index 2B by key. Duplicates inside 2B are themselves a finding.
  const twoBIndex = new Map<string, Row[]>();
  for (const row of twoB.rows) {
    const list = twoBIndex.get(row.key) ?? [];
    list.push(row);
    twoBIndex.set(row.key, list);
  }

  const matched: Pair[] = [];
  const mismatched: Pair[] = [];
  const missingIn2B: Row[] = [];
  const consumed = new Set<Row>();

  for (const row of reg.rows) {
    const candidates = twoBIndex.get(row.key)?.filter((c) => !consumed.has(c)) ?? [];
    const hit = candidates[0];
    if (!hit) {
      missingIn2B.push(row);
      continue;
    }
    consumed.add(hit);
    const taxableDiff = Math.round((row.taxable - hit.taxable) * 100) / 100;
    const taxDiff = Math.round((row.tax - hit.tax) * 100) / 100;
    const pair: Pair = { left: row, right: hit, taxableDiff, taxDiff };
    if (Math.abs(taxableDiff) <= tol && Math.abs(taxDiff) <= tol) matched.push(pair);
    else mismatched.push(pair);
  }

  const missingInRegister = twoB.rows.filter((r) => !consumed.has(r));

  // ITC at risk: credit claimed in the register with nothing in 2B to support it,
  // plus the excess where the register claims more tax than 2B reports.
  const itcUnsupported = missingIn2B.reduce((s, r) => s + r.tax, 0);
  const itcOverclaimed = mismatched.reduce((s, p) => s + Math.max(0, p.taxDiff), 0);
  const itcAtRisk = itcUnsupported + itcOverclaimed;
  // The opposite direction is not a risk, it is credit you have not taken yet.
  const itcUnclaimed = missingInRegister.reduce((s, r) => s + r.tax, 0);

  // Per-supplier ranking, worst first.
  type Supplier = { gstin: string; atRisk: number; unclaimed: number; issues: number; valid: boolean };
  const suppliers = new Map<string, Supplier>();
  const bump = (gstin: string, patch: Partial<Supplier>) => {
    const cur = suppliers.get(gstin) ?? { gstin, atRisk: 0, unclaimed: 0, issues: 0, valid: gstinValid(gstin) };
    suppliers.set(gstin, {
      ...cur,
      atRisk: cur.atRisk + (patch.atRisk ?? 0),
      unclaimed: cur.unclaimed + (patch.unclaimed ?? 0),
      issues: cur.issues + (patch.issues ?? 0),
    });
  };
  for (const r of missingIn2B) bump(r.gstin, { atRisk: r.tax, issues: 1 });
  for (const p of mismatched) bump(p.left.gstin, { atRisk: Math.max(0, p.taxDiff), issues: 1 });
  for (const r of missingInRegister) bump(r.gstin, { unclaimed: r.tax, issues: 1 });
  for (const p of matched) bump(p.left.gstin, {});

  const ranked = [...suppliers.values()].sort((a, b) => b.atRisk - a.atRisk || b.unclaimed - a.unclaimed);

  const invalidGstins = [...new Set([...twoB.rows, ...reg.rows].map((r) => r.gstin))].filter((g) => !gstinValid(g));
  const duplicatesIn2B = [...twoBIndex.entries()].filter(([, v]) => v.length > 1);

  const totalRows = reg.rows.length;
  const matchRate = totalRows > 0 ? Math.round((matched.length / totalRows) * 100) : 0;

  // ---- sections
  const sections: { title: string; items: ResultItem[] }[] = [];

  if (missingIn2B.length > 0) {
    sections.push({
      title: `Missing from 2B — ${rupees(itcUnsupported)} of credit unsupported`,
      items: missingIn2B.map((r) => ({
        title: `${r.invoiceNo} · ${r.gstin}`,
        body: `Taxable ${rupees(r.taxable)}, tax ${rupees(r.tax)}${r.date ? `, dated ${r.date}` : ""}. Not present in GSTR-2B, so under Section 16(2)(aa) this credit is not claimable until the supplier uploads it. Register line ${r.lineNo}.`,
        tag: rupees(r.tax),
        severity: "high" as Severity,
      })),
    });
  }

  if (mismatched.length > 0) {
    sections.push({
      title: `Value mismatch — ${mismatched.length} invoice${mismatched.length === 1 ? "" : "s"}`,
      items: mismatched.map((p) => ({
        title: `${p.left.invoiceNo} · ${p.left.gstin}`,
        body: `Taxable: register ${rupees(p.left.taxable)} vs 2B ${rupees(p.right.taxable)} (${p.taxableDiff > 0 ? "+" : ""}${rupees(p.taxableDiff)}). Tax: register ${rupees(p.left.tax)} vs 2B ${rupees(p.right.tax)} (${p.taxDiff > 0 ? "+" : ""}${rupees(p.taxDiff)}).${p.taxDiff > tol ? " You are claiming more than 2B supports." : p.taxDiff < -tol ? " 2B reports more than you booked — check for a missed debit note." : ""}`,
        tag: p.taxDiff > 0 ? `over by ${rupees(p.taxDiff)}` : `under by ${rupees(-p.taxDiff)}`,
        severity: Math.abs(p.taxDiff) > tol ? ("high" as Severity) : ("medium" as Severity),
      })),
    });
  }

  if (missingInRegister.length > 0) {
    sections.push({
      title: `In 2B but not in your books — ${rupees(itcUnclaimed)} not yet claimed`,
      items: missingInRegister.map((r) => ({
        title: `${r.invoiceNo} · ${r.gstin}`,
        body: `Taxable ${rupees(r.taxable)}, tax ${rupees(r.tax)}${r.date ? `, dated ${r.date}` : ""}. Your supplier has reported this but it is not in your register — either an unbooked purchase, or an invoice raised against you in error. Worth checking both ways. 2B line ${r.lineNo}.`,
        tag: rupees(r.tax),
        severity: "medium" as Severity,
      })),
    });
  }

  const dataIssues: ResultItem[] = [];
  for (const g of invalidGstins) {
    dataIssues.push({
      title: g,
      body: "Fails GSTIN check-digit validation, so it is not a valid registration number. Usually a transposed or dropped character on data entry — fix it before treating any mismatch on this supplier as real.",
      severity: "high",
    });
  }
  for (const [key, rowsForKey] of duplicatesIn2B) {
    dataIssues.push({
      title: key.split("|")[0] ?? key,
      body: `Invoice ${rowsForKey[0]!.invoiceNo} appears ${rowsForKey.length} times in GSTR-2B. Each occurrence was matched to at most one register row; the surplus is reported as unclaimed. Check for a duplicate upload by the supplier.`,
      severity: "medium",
    });
  }
  for (const s of [...twoB.skipped, ...reg.skipped]) dataIssues.push({ body: s, severity: "medium" });
  if (dataIssues.length > 0) sections.push({ title: `Data quality — ${dataIssues.length}`, items: dataIssues });

  if (matched.length > 0) {
    sections.push({
      title: `Matched cleanly — ${matched.length}`,
      items: [
        {
          body: `${matched.length} of ${totalRows} register rows matched 2B within the ${rupees(tol)} tolerance, covering ${rupees(matched.reduce((s, p) => s + p.left.tax, 0))} of credit. Nothing to do on these.`,
          severity: "low",
        },
      ],
    });
  }

  // ---- follow-up list
  const followUp = ranked
    .filter((s) => s.atRisk > 0)
    .map((s) => {
      const invoices = [
        ...missingIn2B.filter((r) => r.gstin === s.gstin).map((r) => `  - ${r.invoiceNo}${r.date ? ` dated ${r.date}` : ""} — taxable ${rupees(r.taxable)}, tax ${rupees(r.tax)} — NOT FILED in your GSTR-1`),
        ...mismatched
          .filter((p) => p.left.gstin === s.gstin && p.taxDiff > tol)
          .map((p) => `  - ${p.left.invoiceNo} — you reported tax ${rupees(p.right.tax)}, our invoice shows ${rupees(p.left.tax)}`),
      ];
      return `GSTIN ${s.gstin} — ${rupees(s.atRisk)} of our credit is blocked\n${invoices.join("\n")}`;
    })
    .join("\n\n");

  const band = itcAtRisk > 50_000 ? "bad" : itcAtRisk > 0 ? "warn" : "good";

  return {
    headline:
      itcAtRisk > 0
        ? `${rupees(itcAtRisk)} of input tax credit at risk across ${ranked.filter((s) => s.atRisk > 0).length} supplier${ranked.filter((s) => s.atRisk > 0).length === 1 ? "" : "s"}. ${missingIn2B.length} invoice${missingIn2B.length === 1 ? "" : "s"} missing from 2B.`
        : `Clean reconciliation — ${matched.length} of ${totalRows} matched and no credit at risk.${itcUnclaimed > 0 ? ` ${rupees(itcUnclaimed)} in 2B is not yet in your books.` : ""}`,

    score: { label: "Match rate", value: matchRate, max: 100, band },

    metrics: [
      { label: "ITC at risk", value: rupees(itcAtRisk), hint: "unsupported + over-claimed" },
      { label: "Missing from 2B", value: String(missingIn2B.length), hint: rupees(itcUnsupported) },
      { label: "Value mismatches", value: String(mismatched.length), hint: rupees(itcOverclaimed) },
      { label: "Not in your books", value: String(missingInRegister.length), hint: `${rupees(itcUnclaimed)} unclaimed` },
      { label: "Matched", value: `${matched.length}/${totalRows}` },
    ],

    sections,

    table: {
      columns: ["Supplier GSTIN", "Valid", "ITC at risk", "Unclaimed", "Issues"],
      rows: ranked.map((s) => [s.gstin, s.valid ? "yes" : "NO", rupees(s.atRisk), rupees(s.unclaimed), String(s.issues)]),
    },

    copyBlocks: [
      {
        title: "Supplier follow-up — send this",
        text:
          followUp ||
          "No supplier follow-up needed — every invoice in your register is supported by GSTR-2B within tolerance.",
        language: "text",
      },
      {
        title: "Full reconciliation CSV",
        text: [
          "bucket,gstin,invoice_no,date,register_taxable,2b_taxable,taxable_diff,register_tax,2b_tax,tax_diff",
          ...matched.map((p) => `matched,${p.left.gstin},${p.left.invoiceNo},${p.left.date},${p.left.taxable},${p.right.taxable},${p.taxableDiff},${p.left.tax},${p.right.tax},${p.taxDiff}`),
          ...mismatched.map((p) => `mismatch,${p.left.gstin},${p.left.invoiceNo},${p.left.date},${p.left.taxable},${p.right.taxable},${p.taxableDiff},${p.left.tax},${p.right.tax},${p.taxDiff}`),
          ...missingIn2B.map((r) => `missing_in_2b,${r.gstin},${r.invoiceNo},${r.date},${r.taxable},,,${r.tax},,`),
          ...missingInRegister.map((r) => `missing_in_register,${r.gstin},${r.invoiceNo},${r.date},,${r.taxable},,,${r.tax},`),
        ].join("\n"),
        language: "csv",
      },
    ],

    json: {
      tolerance: tol,
      itcAtRisk,
      itcUnsupported,
      itcOverclaimed,
      itcUnclaimed,
      matchRate,
      counts: {
        matched: matched.length,
        mismatched: mismatched.length,
        missingIn2B: missingIn2B.length,
        missingInRegister: missingInRegister.length,
      },
      suppliers: ranked,
      invalidGstins,
    },
  };
}
