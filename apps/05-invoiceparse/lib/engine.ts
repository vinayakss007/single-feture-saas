import type { ResultItem, RunInput, RunResult, Severity } from "./types.ts";

/**
 * InvoiceParse engine — label-driven extraction plus arithmetic verification.
 *
 * The extraction half is deliberately layout-agnostic: it looks for the labels
 * that appear on every tax invoice rather than for positions on a page. The
 * validation half re-derives every total from its parts, which is the only way
 * to catch the errors that actually cost money at filing time.
 */

const GST_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** GST state codes in use (union territories included). */
const STATE_CODES: Record<string, string> = {
  "01": "Jammu and Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
  "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
  "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur",
  "15": "Mizoram", "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal",
  "20": "Jharkhand", "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh",
  "24": "Gujarat", "26": "Dadra and Nagar Haveli and Daman and Diu", "27": "Maharashtra",
  "29": "Karnataka", "30": "Goa", "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu",
  "34": "Puducherry", "35": "Andaman and Nicobar Islands", "36": "Telangana",
  "37": "Andhra Pradesh", "38": "Ladakh", "97": "Other Territory", "99": "Centre Jurisdiction",
};

type GstinCheck = {
  gstin: string;
  valid: boolean;
  stateCode: string;
  stateName: string | null;
  pan: string;
  panWellFormed: boolean;
  expectedCheckDigit: string;
  actualCheckDigit: string;
  problems: string[];
};

/**
 * Official GSTIN check digit: weighted mod-36 over the first 14 characters.
 * A regex accepts a typo; this does not.
 */
function gstinCheckDigit(first14: string): string {
  let sum = 0;
  for (let i = 0; i < 14; i += 1) {
    const value = GST_ALPHABET.indexOf(first14[i]);
    if (value < 0) return "?";
    const factor = i % 2 === 0 ? 1 : 2;
    const product = value * factor;
    sum += Math.floor(product / 36) + (product % 36);
  }
  return GST_ALPHABET[(36 - (sum % 36)) % 36];
}

function validateGstin(raw: string): GstinCheck {
  const gstin = raw.toUpperCase().replace(/[^0-9A-Z]/g, "");
  const problems: string[] = [];

  if (gstin.length !== 15) problems.push(`Length is ${gstin.length}, must be exactly 15 characters.`);

  const stateCode = gstin.slice(0, 2);
  const stateName = STATE_CODES[stateCode] ?? null;
  if (!/^\d{2}$/.test(stateCode)) problems.push("First two characters must be a numeric state code.");
  else if (!stateName) problems.push(`State code ${stateCode} is not an allocated GST state code.`);

  const pan = gstin.slice(2, 12);
  const panWellFormed = /^[A-Z]{5}\d{4}[A-Z]$/.test(pan);
  if (!panWellFormed) problems.push(`Embedded PAN "${pan}" does not match the AAAAA9999A pattern.`);

  if (gstin.length === 15 && gstin[13] !== "Z") {
    problems.push(`14th character is "${gstin[13]}", it must be the literal Z.`);
  }

  const expectedCheckDigit = gstin.length >= 14 ? gstinCheckDigit(gstin.slice(0, 14)) : "?";
  const actualCheckDigit = gstin.length === 15 ? gstin[14] : "";
  if (gstin.length === 15 && expectedCheckDigit !== actualCheckDigit) {
    problems.push(`Check digit is "${actualCheckDigit}" but should be "${expectedCheckDigit}" — this GSTIN contains a typo.`);
  }

  return {
    gstin,
    valid: problems.length === 0,
    stateCode,
    stateName,
    pan,
    panWellFormed,
    expectedCheckDigit,
    actualCheckDigit,
    problems,
  };
}

// ---------------------------------------------------------------------------

function toNumber(raw: string | undefined | null): number | null {
  if (!raw) return null;
  // Indian grouping (1,15,640.00) and western grouping both reduce to the same thing.
  const cleaned = raw.replace(/[₹$€£,\s]/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function labelled(text: string, labels: string[]): string | null {
  for (const label of labels) {
    const re = new RegExp(`${label}\\s*[:\\-–]?\\s*([^\\n]{1,120})`, "i");
    const m = re.exec(text);
    if (m) {
      const value = m[1].trim().replace(/\s{2,}.*$/, "").trim();
      if (value) return value;
    }
  }
  return null;
}

/**
 * Reads the amount on a labelled line.
 *
 * Rate tokens are stripped first, otherwise "CGST @ 9%: 8,820.00" reads the 9
 * as the amount. The amount is then taken as the last number on the line, which
 * is where every invoice layout puts it.
 */
function labelledAmount(text: string, labels: string[]): number | null {
  const lines = text.split(/\r?\n/);
  for (const label of labels) {
    const re = new RegExp(`\\b${label}`, "i");
    for (const line of lines) {
      if (!re.test(line)) continue;
      const withoutRates = line.replace(/\d+(?:\.\d+)?\s*%/g, " ");
      const candidates = [...withoutRates.matchAll(/-?[\d,]+(?:\.\d{1,2})?/g)].map((m) => m[0]);
      for (let i = candidates.length - 1; i >= 0; i -= 1) {
        const n = toNumber(candidates[i]);
        if (n !== null) return n;
      }
    }
  }
  return null;
}

function labelledRate(text: string, labels: string[]): number | null {
  for (const label of labels) {
    const re = new RegExp(`${label}[^\\n%]{0,20}?(\\d{1,2}(?:\\.\\d+)?)\\s*%`, "i");
    const m = re.exec(text);
    if (m) return Number(m[1]);
  }
  return null;
}

type LineItem = {
  sno: string;
  description: string;
  hsn: string | null;
  qty: number | null;
  rate: number | null;
  amount: number;
};

/**
 * Line items are recognised by shape rather than by column position: a row that
 * ends in a money-like amount and contains at least one other number.
 */
function extractLineItems(text: string): LineItem[] {
  const items: LineItem[] = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim());

  const SKIP =
    /^(taxable|total|sub[- ]?total|cgst|sgst|igst|utgst|cess|round|grand|amount in words|discount|shipping|freight|tax invoice|invoice no|invoice date|due date|place of supply|reverse charge|gstin|seller|buyer|address|s\.?\s?no)/i;

  for (const line of lines) {
    if (line.length < 8 || SKIP.test(line)) continue;

    const numbers = [...line.matchAll(/(-?[\d,]+(?:\.\d{1,2})?)/g)].map((m) => m[1]);
    if (numbers.length < 2) continue;

    const amount = toNumber(numbers[numbers.length - 1]);
    if (amount === null || amount === 0) continue;

    // Description = text before the first number that follows a letter.
    const descMatch = /^(\d{1,3}[.)]?\s+)?([A-Za-z][A-Za-z0-9 ,./&()-]{2,60}?)\s{2,}|^(\d{1,3}[.)]?\s+)?([A-Za-z][A-Za-z0-9 ,./&()-]{2,60}?)\s+\d/.exec(
      line,
    );
    const description = (descMatch?.[2] ?? descMatch?.[4] ?? "").trim();
    if (description.length < 3) continue;

    const sno = (descMatch?.[1] ?? descMatch?.[3] ?? "").trim().replace(/[.)]/g, "") || String(items.length + 1);
    const hsn = /\b(\d{4}|\d{6}|\d{8})\b/.exec(line.slice(description.length))?.[1] ?? null;

    const numeric = numbers.map(toNumber).filter((n): n is number => n !== null);
    const withoutHsn = hsn ? numeric.filter((n) => String(n) !== hsn) : numeric;
    const qty = withoutHsn.length >= 3 ? withoutHsn[withoutHsn.length - 3] : null;
    const rate = withoutHsn.length >= 2 ? withoutHsn[withoutHsn.length - 2] : null;

    items.push({ sno, description, hsn, qty, rate, amount });
  }
  return items;
}

type Issue = { title: string; detail: string; severity: Severity; rule: string };

export function run(input: RunInput): RunResult {
  const text = (input.invoice ?? "").trim();
  if (text.length < 40) throw new Error("Paste the invoice text — at least the header lines and the totals.");

  const currency = ["INR", "USD", "EUR", "GBP", "AED"].includes(input.currency ?? "") ? (input.currency as string) : "INR";
  const isGst = currency === "INR";

  // ---- header fields --------------------------------------------------------
  const invoiceNo = labelled(text, ["invoice\\s*(?:no|number|#)", "bill\\s*no", "document\\s*no"]);
  const invoiceDate = labelled(text, ["invoice\\s*date", "date of issue", "bill date", "dated"]);
  const dueDate = labelled(text, ["due\\s*date", "payment due"]);
  const placeOfSupply = labelled(text, ["place of supply", "pos\\b"]);
  const reverseCharge = labelled(text, ["reverse charge"]);

  const gstins = [...new Set([...text.matchAll(/\b(\d{2}[A-Z]{5}\d{4}[A-Z0-9]{4})\b/gi)].map((m) => m[1].toUpperCase()))];
  const sellerGstinRaw = gstins[0] ?? null;
  const buyerGstinRaw = gstins[1] ?? null;
  const sellerGstin = sellerGstinRaw ? validateGstin(sellerGstinRaw) : null;
  const buyerGstin = buyerGstinRaw ? validateGstin(buyerGstinRaw) : null;

  const seller = labelled(text, ["seller", "sold by", "from", "supplier", "vendor"]);
  const buyer = labelled(text, ["buyer", "bill to", "billed to", "customer", "consignee"]);

  // ---- amounts --------------------------------------------------------------
  const items = extractLineItems(text);
  const itemsTotal = items.reduce((sum, i) => sum + i.amount, 0);

  const taxableValue = labelledAmount(text, ["taxable\\s*(?:value|amount)", "sub[- ]?total", "net amount"]);
  const cgst = labelledAmount(text, ["cgst"]);
  const sgst = labelledAmount(text, ["sgst", "utgst"]);
  const igst = labelledAmount(text, ["igst"]);
  const cess = labelledAmount(text, ["cess"]);
  const discount = labelledAmount(text, ["discount"]);
  const roundOff = labelledAmount(text, ["round\\s*off", "rounding"]);
  const grandTotal = labelledAmount(text, ["grand\\s*total", "invoice\\s*total", "total\\s*amount\\s*(?:payable|due)", "amount\\s*payable", "total\\b"]);

  const cgstRate = labelledRate(text, ["cgst"]);
  const sgstRate = labelledRate(text, ["sgst", "utgst"]);
  const igstRate = labelledRate(text, ["igst"]);

  const taxTotal = (cgst ?? 0) + (sgst ?? 0) + (igst ?? 0) + (cess ?? 0);

  // ---- validation -----------------------------------------------------------
  const issues: Issue[] = [];
  const passed: ResultItem[] = [];
  const near = (a: number, b: number, tolerance = 1) => Math.abs(a - b) <= tolerance;
  const fmt = (n: number) =>
    `${currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : ""}${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // 1-2. GSTIN validity
  for (const [label, check] of [
    ["Seller", sellerGstin],
    ["Buyer", buyerGstin],
  ] as const) {
    if (!check) {
      if (isGst) {
        issues.push({
          title: `${label} GSTIN not found`,
          detail: `No 15-character GSTIN could be located for the ${label.toLowerCase()}.`,
          severity: label === "Seller" ? "high" : "medium",
          rule: "A tax invoice must carry the supplier GSTIN, and the recipient GSTIN for a B2B supply.",
        });
      }
      continue;
    }
    if (check.valid) {
      passed.push({
        title: `${label} GSTIN valid — ${check.gstin}`,
        body: `State ${check.stateCode} (${check.stateName}), PAN ${check.pan}, check digit ${check.actualCheckDigit} verified.`,
        tag: "GSTIN",
      });
    } else {
      issues.push({
        title: `${label} GSTIN is invalid — ${check.gstin}`,
        detail: check.problems.join(" "),
        severity: "high",
        rule: "An invalid supplier GSTIN puts the input tax credit on this invoice at risk.",
      });
    }
  }

  // 3. inter vs intra state
  if (isGst && sellerGstin?.stateName && buyerGstin?.stateName) {
    const interState = sellerGstin.stateCode !== buyerGstin.stateCode;
    const hasCgstSgst = (cgst ?? 0) > 0 || (sgst ?? 0) > 0;
    const hasIgst = (igst ?? 0) > 0;

    if (interState && hasCgstSgst) {
      issues.push({
        title: "CGST/SGST charged on an inter-state supply",
        detail: `Seller is in ${sellerGstin.stateName} (${sellerGstin.stateCode}) and buyer is in ${buyerGstin.stateName} (${buyerGstin.stateCode}). This is an inter-state supply and must attract IGST.`,
        severity: "high",
        rule: "Section 7 IGST Act — inter-state supplies attract IGST, not CGST plus SGST.",
      });
    } else if (!interState && hasIgst) {
      issues.push({
        title: "IGST charged on an intra-state supply",
        detail: `Both parties are in ${sellerGstin.stateName} (${sellerGstin.stateCode}). This supply must attract CGST plus SGST.`,
        severity: "high",
        rule: "Section 8 CGST Act — intra-state supplies attract CGST plus SGST.",
      });
    } else {
      passed.push({
        title: interState ? "Inter-state supply, IGST applied correctly" : "Intra-state supply, CGST/SGST applied correctly",
        body: `${sellerGstin.stateName} → ${buyerGstin.stateName}.`,
        tag: "Tax logic",
      });
    }
  }

  // 4. CGST must equal SGST
  if (cgst !== null && sgst !== null) {
    if (near(cgst, sgst, 0.5)) {
      passed.push({ title: "CGST equals SGST", body: `${fmt(cgst)} each.`, tag: "Tax logic" });
    } else {
      issues.push({
        title: "CGST and SGST are not equal",
        detail: `CGST is ${fmt(cgst)} but SGST is ${fmt(sgst)}, a difference of ${fmt(Math.abs(cgst - sgst))}.`,
        severity: "high",
        rule: "CGST and SGST are always levied at the same rate on the same taxable value.",
      });
    }
  }

  // 5. line items add up to the taxable value
  if (taxableValue !== null && items.length > 0) {
    const expected = taxableValue + (discount ?? 0);
    if (near(itemsTotal, expected, Math.max(1, expected * 0.001))) {
      passed.push({
        title: "Line items reconcile to the taxable value",
        body: `${items.length} items sum to ${fmt(itemsTotal)}.`,
        tag: "Arithmetic",
      });
    } else {
      issues.push({
        title: "Line items do not sum to the taxable value",
        detail: `Extracted items total ${fmt(itemsTotal)} but the stated taxable value is ${fmt(taxableValue)} — a gap of ${fmt(Math.abs(itemsTotal - taxableValue))}. Either a line was missed on extraction or the invoice is wrong.`,
        severity: "medium",
        rule: "The taxable value must equal the sum of line item values less any discount.",
      });
    }
  }

  // 6. tax recomputed from the stated rates
  if (taxableValue !== null) {
    const totalRate = (cgstRate ?? 0) + (sgstRate ?? 0) + (igstRate ?? 0);
    if (totalRate > 0) {
      const expectedTax = (taxableValue * totalRate) / 100;
      if (near(expectedTax, taxTotal, Math.max(1, expectedTax * 0.005))) {
        passed.push({
          title: `Tax matches the stated ${totalRate}% rate`,
          body: `${fmt(taxableValue)} × ${totalRate}% = ${fmt(expectedTax)}.`,
          tag: "Arithmetic",
        });
      } else {
        issues.push({
          title: `Tax charged does not match the stated ${totalRate}% rate`,
          detail: `${fmt(taxableValue)} at ${totalRate}% should be ${fmt(expectedTax)}, but the invoice charges ${fmt(taxTotal)} — a difference of ${fmt(Math.abs(expectedTax - taxTotal))}.`,
          severity: "high",
          rule: "Tax charged must equal taxable value multiplied by the applicable rate.",
        });
      }
    } else if (isGst && taxTotal === 0) {
      issues.push({
        title: "No GST found on the invoice",
        detail: "Neither CGST, SGST nor IGST amounts were located. If this is a zero-rated, exempt or composition supply the invoice must say so explicitly.",
        severity: "medium",
        rule: "A tax invoice must show the tax charged, or state the exemption relied upon.",
      });
    }
  }

  // 7. grand total re-derived
  if (grandTotal !== null && taxableValue !== null) {
    const expectedTotal = taxableValue + taxTotal + (roundOff ?? 0);
    if (near(expectedTotal, grandTotal, 1.5)) {
      passed.push({
        title: "Grand total reconciles",
        body: `${fmt(taxableValue)} + ${fmt(taxTotal)} tax${roundOff ? ` + ${fmt(roundOff)} round off` : ""} = ${fmt(grandTotal)}.`,
        tag: "Arithmetic",
      });
    } else {
      issues.push({
        title: "Grand total does not reconcile",
        detail: `Taxable value plus tax comes to ${fmt(expectedTotal)}, but the invoice states ${fmt(grandTotal)} — a discrepancy of ${fmt(Math.abs(expectedTotal - grandTotal))}. Do not pay this until it is explained.`,
        severity: "high",
        rule: "Grand total must equal taxable value plus tax plus rounding, less discount.",
      });
    }
  }

  // 8. required header fields
  const required: { label: string; value: string | null; severity: Severity }[] = [
    { label: "Invoice number", value: invoiceNo, severity: "high" },
    { label: "Invoice date", value: invoiceDate, severity: "high" },
    { label: "Place of supply", value: placeOfSupply, severity: isGst ? "medium" : "low" },
  ];
  for (const field of required) {
    if (field.value) passed.push({ title: `${field.label} present`, body: field.value, tag: "Header" });
    else
      issues.push({
        title: `${field.label} missing`,
        detail: `No ${field.label.toLowerCase()} could be extracted from the text.`,
        severity: field.severity,
        rule: "Rule 46 CGST Rules lists the particulars every tax invoice must contain.",
      });
  }

  // 9. invoice number format
  if (invoiceNo) {
    if (invoiceNo.length > 16) {
      issues.push({
        title: "Invoice number exceeds 16 characters",
        detail: `"${invoiceNo}" is ${invoiceNo.length} characters.`,
        severity: "low",
        rule: "Rule 46(b) CGST Rules — the invoice number may not exceed 16 characters.",
      });
    } else if (!/^[A-Za-z0-9/-]+$/.test(invoiceNo)) {
      issues.push({
        title: "Invoice number contains disallowed characters",
        detail: `"${invoiceNo}" — only letters, digits, hyphen and slash are permitted.`,
        severity: "low",
        rule: "Rule 46(b) CGST Rules — alphanumerics with hyphen and slash only.",
      });
    }
  }

  // 10. HSN codes on line items
  if (isGst && items.length > 0) {
    const missingHsn = items.filter((i) => !i.hsn);
    if (missingHsn.length === 0) {
      passed.push({ title: "All line items carry an HSN or SAC code", body: `${items.length} of ${items.length}.`, tag: "Line items" });
    } else {
      issues.push({
        title: `${missingHsn.length} line item${missingHsn.length === 1 ? "" : "s"} without an HSN or SAC code`,
        detail: `Missing on: ${missingHsn.map((i) => i.description).join(", ")}.`,
        severity: "medium",
        rule: "HSN reporting is mandatory on B2B invoices; the required digit count depends on turnover.",
      });
    }
  }

  // ---- score ---------------------------------------------------------------
  const penalty = issues.reduce((sum, i) => sum + (i.severity === "high" ? 20 : i.severity === "medium" ? 8 : 3), 0);
  const value = Math.max(0, Math.min(100, 100 - penalty));
  const band = value >= 80 ? "good" : value >= 50 ? "warn" : "bad";
  const high = issues.filter((i) => i.severity === "high");

  // ---- ledger CSV ----------------------------------------------------------
  const csvEscape = (s: string) => (s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s);
  const perItemTaxRate = (cgstRate ?? 0) + (sgstRate ?? 0) + (igstRate ?? 0);
  const ledgerCsv = [
    "invoice_no,invoice_date,seller,seller_gstin,buyer,buyer_gstin,sno,description,hsn,qty,rate,taxable_amount,tax_rate_pct,tax_amount,currency",
    ...(items.length > 0 ? items : [{ sno: "1", description: "Invoice total", hsn: null, qty: null, rate: null, amount: taxableValue ?? grandTotal ?? 0 }]).map((i) =>
      [
        csvEscape(invoiceNo ?? ""),
        csvEscape(invoiceDate ?? ""),
        csvEscape(seller ?? ""),
        sellerGstin?.gstin ?? "",
        csvEscape(buyer ?? ""),
        buyerGstin?.gstin ?? "",
        i.sno,
        csvEscape(i.description),
        i.hsn ?? "",
        i.qty ?? "",
        i.rate ?? "",
        i.amount.toFixed(2),
        perItemTaxRate ? perItemTaxRate.toFixed(2) : "",
        perItemTaxRate ? ((i.amount * perItemTaxRate) / 100).toFixed(2) : "",
        currency,
      ].join(","),
    ),
  ].join("\n");

  const headline =
    high.length > 0
      ? `${high.length} blocking problem${high.length === 1 ? "" : "s"} found on ${invoiceNo ?? "this invoice"} — do not post it to the ledger yet. Starting with: ${high[0].title.toLowerCase()}.`
      : issues.length > 0
        ? `${invoiceNo ?? "Invoice"} extracted and reconciles, with ${issues.length} minor issue${issues.length === 1 ? "" : "s"} worth fixing at source.`
        : `${invoiceNo ?? "Invoice"} extracted cleanly and every validation rule passed. Safe to post.`;

  return {
    headline,
    score: { label: "Invoice validation score", value, max: 100, band },
    metrics: [
      { label: "Grand total", value: grandTotal !== null ? fmt(grandTotal) : "not found" },
      { label: "Tax", value: taxTotal > 0 ? fmt(taxTotal) : "none found", hint: perItemTaxRate ? `${perItemTaxRate}% total rate` : undefined },
      { label: "Line items", value: String(items.length), hint: items.filter((i) => i.hsn).length + " with HSN" },
      { label: "Blocking issues", value: String(high.length), hint: `${issues.length} total` },
    ],
    ...(items.length > 0
      ? {
          table: {
            columns: ["#", "Description", "HSN/SAC", "Qty", "Rate", "Amount"],
            rows: items.map((i) => [
              i.sno,
              i.description,
              i.hsn ?? "— missing —",
              i.qty !== null ? String(i.qty) : "—",
              i.rate !== null ? fmt(i.rate) : "—",
              fmt(i.amount),
            ]),
          },
        }
      : {}),
    sections: [
      {
        title: `Blocking issues (${high.length})`,
        items: high.map((i) => ({ title: i.title, body: `${i.detail}\n\nRule: ${i.rule}`, severity: "high" as Severity })),
      },
      {
        title: `Warnings (${issues.length - high.length})`,
        items: issues
          .filter((i) => i.severity !== "high")
          .map((i) => ({ title: i.title, body: `${i.detail}\n\nRule: ${i.rule}`, severity: i.severity })),
      },
      {
        title: "Extracted header fields",
        items: [
          { title: "Invoice number", body: invoiceNo ?? "not found", tag: "header" },
          { title: "Invoice date", body: invoiceDate ?? "not found", tag: "header" },
          { title: "Due date", body: dueDate ?? "not found", tag: "header" },
          { title: "Seller", body: seller ?? "not found", tag: "party" },
          { title: "Seller GSTIN", body: sellerGstin ? `${sellerGstin.gstin} (${sellerGstin.stateName ?? "unknown state"})` : "not found", tag: "party" },
          { title: "Buyer", body: buyer ?? "not found", tag: "party" },
          { title: "Buyer GSTIN", body: buyerGstin ? `${buyerGstin.gstin} (${buyerGstin.stateName ?? "unknown state"})` : "not found", tag: "party" },
          { title: "Place of supply", body: placeOfSupply ?? "not found", tag: "tax" },
          { title: "Reverse charge", body: reverseCharge ?? "not stated", tag: "tax" },
        ],
      },
      { title: `Checks passed (${passed.length})`, items: passed },
    ],
    copyBlocks: [{ title: "Ledger CSV (one row per line item)", text: ledgerCsv, language: "csv" }],
    json: {
      validationScore: value,
      band,
      currency,
      header: { invoiceNo, invoiceDate, dueDate, placeOfSupply, reverseCharge },
      seller: { name: seller, gstin: sellerGstin },
      buyer: { name: buyer, gstin: buyerGstin },
      lineItems: items,
      amounts: {
        lineItemsTotal: Number(itemsTotal.toFixed(2)),
        taxableValue,
        discount,
        cgst,
        sgst,
        igst,
        cess,
        taxTotal: Number(taxTotal.toFixed(2)),
        roundOff,
        grandTotal,
      },
      rates: { cgstRate, sgstRate, igstRate },
      issues,
      passedChecks: passed.map((p) => p.title),
    },
  };
}
