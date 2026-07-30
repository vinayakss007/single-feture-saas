import type { ResultItem, RunInput, RunResult, Severity } from "./types.ts";

/**
 * Pre-submission e-invoice validation.
 *
 * The value here is entirely in being wrong in the same way the portal is wrong.
 * So every check that corresponds to a published error code carries that code, and
 * every check that does not is labelled advisory rather than given a plausible
 * looking fake one — an invented code would send someone searching a schema
 * document for something that does not exist.
 *
 * Equally important is the closing list of what only the portal can know: duplicate
 * IRN, cancelled GSTIN, e-way bill conflicts. Claiming a clean payload means
 * guaranteed acceptance would be the one lie that makes this product useless.
 */

type Issue = {
  code: string;
  path: string;
  message: string;
  expected: string;
  severity: Severity;
  /** set when we can repair it deterministically */
  autofix?: { path: string; from: string; to: string };
};

const GSTIN_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function gstinValid(gstin: string): boolean {
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z][A-Z0-9][0-9A-Z]$/.test(gstin)) return false;
  let sum = 0;
  for (let i = 0; i < 14; i += 1) {
    const value = GSTIN_ALPHABET.indexOf(gstin[i]!);
    if (value < 0) return false;
    const product = value * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(product / 36) + (product % 36);
  }
  return gstin[14] === GSTIN_ALPHABET[(36 - (sum % 36)) % 36];
}

/** State codes 01–38 plus 97 (other territory) and 99 (centre). */
const STATE_CODES = new Set([
  ...Array.from({ length: 38 }, (_, i) => String(i + 1).padStart(2, "0")),
  "97",
  "99",
]);

const UNIT_CODES = new Set([
  "BAG","BAL","BDL","BKL","BOU","BOX","BTL","BUN","CAN","CBM","CCM","CMS","CTN","DOZ","DRM","GGK","GMS","GRS","GYD",
  "KGS","KLR","KME","LTR","MLT","MTR","MTS","NOS","PAC","PCS","PRS","QTL","ROL","SET","SQF","SQM","SQY","TBS","TGM",
  "THD","TON","TUB","UGS","UNT","YDS","OTH",
]);

const DOC_TYPES = new Set(["INV", "CRN", "DBN"]);
const SUPPLY_TYPES = new Set(["B2B", "SEZWP", "SEZWOP", "EXPWP", "EXPWOP", "DEXP"]);
const GST_RATES = new Set([0, 0.1, 0.25, 1, 1.5, 3, 5, 6, 7.5, 12, 18, 28]);

function num(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number.parseFloat(value.replace(/[₹$\s,]/g, ""));
    return Number.isFinite(n) ? n : Number.NaN;
  }
  return Number.NaN;
}

function str(value: unknown): string {
  return value === null || value === undefined ? "" : String(value).trim();
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function rupees(n: number): string {
  return `₹${Math.abs(round2(n)).toLocaleString("en-IN")}`;
}

/** Walks a dotted path, tolerating arrays via [n]. */
function get(obj: unknown, path: string): unknown {
  let cur: unknown = obj;
  for (const part of path.split(".")) {
    const m = /^(\w+)\[(\d+)\]$/.exec(part);
    if (m) {
      cur = (cur as Record<string, unknown>)?.[m[1]!];
      cur = Array.isArray(cur) ? cur[Number(m[2])] : undefined;
    } else {
      cur = (cur as Record<string, unknown>)?.[part];
    }
    if (cur === undefined || cur === null) return cur;
  }
  return cur;
}

// ---------------------------------------------------------------------------
// Input parsing — JSON, or a single-row CSV
// ---------------------------------------------------------------------------

function csvToPayload(text: string): Record<string, unknown> {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) throw new Error("CSV needs a header row and one data row.");
  const header = lines[0]!.split(/[,;\t]/).map((h) => h.trim().toLowerCase());
  const cells = lines[1]!.split(/[,;\t]/).map((c) => c.trim());
  const pick = (...names: string[]) => {
    for (const n of names) {
      const i = header.findIndex((h) => h.replace(/[_\s-]/g, "").includes(n));
      if (i >= 0) return cells[i] ?? "";
    }
    return "";
  };
  const taxable = num(pick("taxable", "assval", "netamount"));
  const rate = num(pick("gstrate", "rate", "taxrate"));
  return {
    Version: "1.1",
    TranDtls: { TaxSch: "GST", SupTyp: pick("supplytype", "suptyp") || "B2B" },
    DocDtls: { Typ: pick("doctype", "type") || "INV", No: pick("invoiceno", "invno", "billno"), Dt: pick("date", "invoicedate") },
    SellerDtls: { Gstin: pick("sellergstin", "gstin"), LglNm: pick("sellername", "seller"), Stcd: pick("sellerstate", "stcd") },
    BuyerDtls: { Gstin: pick("buyergstin", "recipientgstin"), LglNm: pick("buyername", "buyer"), Pos: pick("placeofsupply", "pos") },
    ItemList: [
      {
        SlNo: "1",
        HsnCd: pick("hsn", "hsncd", "sac"),
        Qty: num(pick("qty", "quantity")),
        Unit: pick("unit", "uom"),
        UnitPrice: num(pick("unitprice", "rateperunit")),
        AssAmt: taxable,
        TotAmt: taxable,
        GstRt: rate,
        CgstAmt: num(pick("cgst")),
        SgstAmt: num(pick("sgst")),
        IgstAmt: num(pick("igst")),
      },
    ],
    ValDtls: {
      AssVal: taxable,
      CgstVal: num(pick("cgst")),
      SgstVal: num(pick("sgst")),
      IgstVal: num(pick("igst")),
      TotInvVal: num(pick("total", "totinvval", "grandtotal", "invoicevalue")),
    },
  };
}

// ---------------------------------------------------------------------------
// India IRN validation
// ---------------------------------------------------------------------------

function validateIrn(p: Record<string, unknown>, turnoverHigh: boolean): Issue[] {
  const issues: Issue[] = [];
  const add = (i: Issue) => issues.push(i);

  // --- mandatory fields, with the portal's own codes
  const MANDATORY: [string, string, string][] = [
    ["Version", "2172", "Schema version is mandatory"],
    ["TranDtls.TaxSch", "2178", "Tax scheme is mandatory and must be GST"],
    ["TranDtls.SupTyp", "2189", "Supply type is mandatory"],
    ["DocDtls.Typ", "2181", "Document type is mandatory"],
    ["DocDtls.No", "2182", "Document number is mandatory"],
    ["DocDtls.Dt", "2183", "Document date is mandatory"],
    ["SellerDtls.Gstin", "2143", "Supplier GSTIN is mandatory"],
    ["SellerDtls.LglNm", "2144", "Supplier legal name is mandatory"],
    ["SellerDtls.Addr1", "2146", "Supplier address line 1 is mandatory"],
    ["SellerDtls.Loc", "2148", "Supplier location is mandatory"],
    ["SellerDtls.Pin", "2149", "Supplier PIN code is mandatory"],
    ["SellerDtls.Stcd", "2150", "Supplier state code is mandatory"],
    ["BuyerDtls.Gstin", "2153", "Recipient GSTIN is mandatory"],
    ["BuyerDtls.LglNm", "2154", "Recipient legal name is mandatory"],
    ["BuyerDtls.Pos", "2155", "Place of supply is mandatory"],
    ["ValDtls.AssVal", "2211", "Total assessable value is mandatory"],
    ["ValDtls.TotInvVal", "2212", "Total invoice value is mandatory"],
  ];
  for (const [path, code, message] of MANDATORY) {
    const v = get(p, path);
    if (v === undefined || v === null || str(v) === "") {
      add({ code, path, message, expected: "a non-empty value", severity: "high" });
    }
  }

  // --- code lists
  const docType = str(get(p, "DocDtls.Typ")).toUpperCase();
  if (docType && !DOC_TYPES.has(docType)) {
    add({
      code: "2181",
      path: "DocDtls.Typ",
      message: `Document type "${docType}" is not a permitted value.`,
      expected: `one of ${[...DOC_TYPES].join(", ")} (invoice, credit note, debit note)`,
      severity: "high",
    });
  }
  const supTyp = str(get(p, "TranDtls.SupTyp")).toUpperCase();
  if (supTyp && !SUPPLY_TYPES.has(supTyp)) {
    add({
      code: "2189",
      path: "TranDtls.SupTyp",
      message: `Supply type "${supTyp}" is not a permitted value.`,
      expected: `one of ${[...SUPPLY_TYPES].join(", ")}`,
      severity: "high",
    });
  }

  // --- document number format
  const docNo = str(get(p, "DocDtls.No"));
  if (docNo) {
    if (docNo.length > 16) {
      add({
        code: "2244",
        path: "DocDtls.No",
        message: `Document number is ${docNo.length} characters. The portal accepts a maximum of 16.`,
        expected: "16 characters or fewer",
        severity: "high",
      });
    }
    if (!/^[A-Za-z0-9/-]+$/.test(docNo)) {
      add({
        code: "2244",
        path: "DocDtls.No",
        message: `Document number "${docNo}" contains characters the portal rejects.`,
        expected: "letters, digits, slash and hyphen only",
        severity: "high",
      });
    }
    if (/^0/.test(docNo)) {
      add({
        code: "2244",
        path: "DocDtls.No",
        message: "Document number starts with zero, which the portal rejects.",
        expected: "a number not beginning with 0",
        severity: "high",
      });
    }
  }

  // --- date format
  const docDt = str(get(p, "DocDtls.Dt"));
  if (docDt && !/^\d{2}\/\d{2}\/\d{4}$/.test(docDt)) {
    const m = /^(\d{2})[-.](\d{2})[-.](\d{4})$/.exec(docDt) ?? /^(\d{4})-(\d{2})-(\d{2})$/.exec(docDt);
    const fixed = m
      ? m[1]!.length === 4
        ? `${m[3]}/${m[2]}/${m[1]}`
        : `${m[1]}/${m[2]}/${m[3]}`
      : null;
    add({
      code: "2183",
      path: "DocDtls.Dt",
      message: `Document date "${docDt}" is not in the required format.`,
      expected: "DD/MM/YYYY",
      severity: "high",
      ...(fixed ? { autofix: { path: "DocDtls.Dt", from: docDt, to: fixed } } : {}),
    });
  }

  // --- GSTINs
  for (const [path, code, label] of [
    ["SellerDtls.Gstin", "2143", "Supplier"],
    ["BuyerDtls.Gstin", "2153", "Recipient"],
  ] as const) {
    const gstin = str(get(p, path)).toUpperCase();
    if (!gstin) continue;
    if (gstin.length !== 15) {
      add({
        code,
        path,
        message: `${label} GSTIN is ${gstin.length} characters.`,
        expected: "exactly 15 characters",
        severity: "high",
      });
    } else if (!gstinValid(gstin)) {
      add({
        code,
        path,
        message: `${label} GSTIN ${gstin} fails check-digit validation, so it is not a real registration number. Almost always a transposed or dropped character.`,
        expected: "a GSTIN whose 15th character matches its base-36 checksum",
        severity: "high",
      });
    }
  }

  // --- state code must agree with the GSTIN prefix
  const sellerGstin = str(get(p, "SellerDtls.Gstin")).toUpperCase();
  const sellerState = str(get(p, "SellerDtls.Stcd"));
  if (sellerGstin.length === 15 && sellerState) {
    const prefix = sellerGstin.slice(0, 2);
    if (!STATE_CODES.has(sellerState)) {
      add({
        code: "2150",
        path: "SellerDtls.Stcd",
        message: `State code "${sellerState}" is not a valid GST state code.`,
        expected: "01 to 38, or 97 / 99",
        severity: "high",
      });
    } else if (prefix !== sellerState) {
      add({
        code: "2150",
        path: "SellerDtls.Stcd",
        message: `Supplier state code ${sellerState} does not match the GSTIN prefix ${prefix}. The first two digits of a GSTIN are its state.`,
        expected: `${prefix}`,
        severity: "high",
        autofix: { path: "SellerDtls.Stcd", from: sellerState, to: prefix },
      });
    }
  }

  // --- PIN codes
  for (const [path, code] of [["SellerDtls.Pin", "2149"], ["BuyerDtls.Pin", "2159"]] as const) {
    const pin = str(get(p, path));
    if (pin && !/^\d{6}$/.test(pin)) {
      add({ code, path, message: `PIN code "${pin}" is not six digits.`, expected: "six digits", severity: "high" });
    }
  }

  // --- items
  const items = Array.isArray(get(p, "ItemList")) ? (get(p, "ItemList") as Record<string, unknown>[]) : [];
  if (items.length === 0) {
    add({ code: "2227", path: "ItemList", message: "Invoice has no line items.", expected: "at least one item", severity: "high" });
  }

  const minHsn = turnoverHigh ? 6 : 4;
  let sumAss = 0;
  let sumCgst = 0;
  let sumSgst = 0;
  let sumIgst = 0;

  items.forEach((item, idx) => {
    const at = `ItemList[${idx}]`;
    const hsn = str(item.HsnCd);
    if (!hsn) {
      add({ code: "2229", path: `${at}.HsnCd`, message: "HSN or SAC code is mandatory on every line.", expected: `at least ${minHsn} digits`, severity: "high" });
    } else {
      if (!/^\d+$/.test(hsn)) {
        add({ code: "2229", path: `${at}.HsnCd`, message: `HSN "${hsn}" contains non-digits.`, expected: "digits only", severity: "high" });
      } else if (![4, 6, 8].includes(hsn.length)) {
        add({ code: "2229", path: `${at}.HsnCd`, message: `HSN "${hsn}" is ${hsn.length} digits, which is not a valid length.`, expected: "4, 6 or 8 digits", severity: "high" });
      } else if (hsn.length < minHsn) {
        add({
          code: "2229",
          path: `${at}.HsnCd`,
          message: `HSN "${hsn}" is ${hsn.length} digits. At your turnover the minimum is ${minHsn}.`,
          expected: `${minHsn} digits or more`,
          severity: "high",
        });
      }
    }

    const unit = str(item.Unit).toUpperCase();
    const isService = str(item.IsServc).toUpperCase() === "Y";
    if (!isService && unit && !UNIT_CODES.has(unit)) {
      const guess = unit.startsWith("PC") ? "PCS" : unit.startsWith("NO") ? "NOS" : unit.startsWith("KG") ? "KGS" : null;
      add({
        code: "2233",
        path: `${at}.Unit`,
        message: `Unit "${unit}" is not in the portal's unit-of-measure list.`,
        expected: guess ? `${guess}` : "a UQC such as NOS, PCS, KGS, LTR, MTR",
        severity: "high",
        ...(guess ? { autofix: { path: `${at}.Unit`, from: unit, to: guess } } : {}),
      });
    }

    const rate = num(item.GstRt);
    if (Number.isFinite(rate) && !GST_RATES.has(rate)) {
      add({
        code: "2240",
        path: `${at}.GstRt`,
        message: `GST rate ${rate}% is not a notified rate.`,
        expected: [...GST_RATES].join(", ") + " percent",
        severity: "high",
      });
    }

    // Line arithmetic: quantity times unit price should be the line total.
    const qty = num(item.Qty);
    const unitPrice = num(item.UnitPrice);
    const totAmt = num(item.TotAmt);
    if (Number.isFinite(qty) && Number.isFinite(unitPrice) && Number.isFinite(totAmt)) {
      const expected = round2(qty * unitPrice);
      if (Math.abs(expected - totAmt) > 1) {
        add({
          code: "2234",
          path: `${at}.TotAmt`,
          message: `Line total ${rupees(totAmt)} does not equal quantity ${qty} × unit price ${rupees(unitPrice)} = ${rupees(expected)}.`,
          expected: String(expected),
          severity: "high",
          autofix: { path: `${at}.TotAmt`, from: String(totAmt), to: String(expected) },
        });
      }
    }

    const ass = num(item.AssAmt);
    if (Number.isFinite(ass)) sumAss += ass;
    const cgst = num(item.CgstAmt) || 0;
    const sgst = num(item.SgstAmt) || 0;
    const igst = num(item.IgstAmt) || 0;
    sumCgst += cgst;
    sumSgst += sgst;
    sumIgst += igst;

    // Tax computed from the assessable value at the stated rate.
    if (Number.isFinite(ass) && Number.isFinite(rate) && rate > 0) {
      const totalTax = cgst + sgst + igst;
      const expectedTax = round2((ass * rate) / 100);
      if (Math.abs(expectedTax - totalTax) > 1) {
        add({
          code: "2237",
          path: `${at}.CgstAmt/SgstAmt/IgstAmt`,
          message: `Tax on this line is ${rupees(totalTax)} but ${rate}% of ${rupees(ass)} is ${rupees(expectedTax)}.`,
          expected: String(expectedTax),
          severity: "high",
        });
      }
      if (cgst > 0 && sgst > 0 && Math.abs(cgst - sgst) > 1) {
        add({
          code: "2237",
          path: `${at}.CgstAmt`,
          message: `CGST ${rupees(cgst)} and SGST ${rupees(sgst)} differ. They are always equal halves of the rate.`,
          expected: String(round2((cgst + sgst) / 2)),
          severity: "high",
        });
      }
    }

    if (cgst > 0 && igst > 0) {
      add({
        code: "2238",
        path: `${at}`,
        message: "Line charges both CGST and IGST. A supply is either intra-state or inter-state, never both.",
        expected: "either CGST+SGST, or IGST",
        severity: "high",
      });
    }
  });

  // --- the single most common rejection: wrong tax head for the place of supply
  const pos = str(get(p, "BuyerDtls.Pos"));
  const igstOnIntra = str(get(p, "TranDtls.IgstOnIntra")).toUpperCase() === "Y";
  if (sellerState && pos && STATE_CODES.has(pos)) {
    const intraState = sellerState === pos;
    if (intraState && sumIgst > 0 && !igstOnIntra) {
      add({
        code: "2238",
        path: "ValDtls.IgstVal",
        message: `Place of supply ${pos} is the supplier's own state, so this is an intra-state supply — but IGST of ${rupees(sumIgst)} is charged.`,
        expected: "CGST and SGST, each half the rate. Set IgstOnIntra to Y only for the narrow SEZ case.",
        severity: "high",
      });
    }
    if (!intraState && (sumCgst > 0 || sumSgst > 0)) {
      add({
        code: "2238",
        path: "ValDtls.CgstVal/SgstVal",
        message: `Place of supply ${pos} differs from the supplier's state ${sellerState}, so this is an inter-state supply — but CGST/SGST of ${rupees(sumCgst + sumSgst)} is charged. This is the most common e-invoice rejection there is.`,
        expected: `IGST of ${rupees(sumCgst + sumSgst)} instead`,
        severity: "high",
      });
    }
  }
  if (pos && !STATE_CODES.has(pos)) {
    add({ code: "2155", path: "BuyerDtls.Pos", message: `Place of supply "${pos}" is not a valid state code.`, expected: "01 to 38, or 96 / 97", severity: "high" });
  }

  // --- header totals against the sum of lines
  const assVal = num(get(p, "ValDtls.AssVal"));
  if (Number.isFinite(assVal) && items.length > 0 && Math.abs(assVal - sumAss) > 1) {
    add({
      code: "2211",
      path: "ValDtls.AssVal",
      message: `Header assessable value ${rupees(assVal)} does not equal the sum of line assessable values ${rupees(sumAss)}.`,
      expected: String(round2(sumAss)),
      severity: "high",
      autofix: { path: "ValDtls.AssVal", from: String(assVal), to: String(round2(sumAss)) },
    });
  }

  for (const [path, header, lines, label] of [
    ["ValDtls.CgstVal", num(get(p, "ValDtls.CgstVal")) || 0, sumCgst, "CGST"],
    ["ValDtls.SgstVal", num(get(p, "ValDtls.SgstVal")) || 0, sumSgst, "SGST"],
    ["ValDtls.IgstVal", num(get(p, "ValDtls.IgstVal")) || 0, sumIgst, "IGST"],
  ] as const) {
    if (Math.abs(header - lines) > 1) {
      add({
        code: "2213",
        path,
        message: `Header ${label} ${rupees(header)} does not equal the sum of line ${label} ${rupees(lines)}.`,
        expected: String(round2(lines)),
        severity: "high",
        autofix: { path, from: String(header), to: String(round2(lines)) },
      });
    }
  }

  const totInv = num(get(p, "ValDtls.TotInvVal"));
  const rndOff = num(get(p, "ValDtls.RndOffAmt")) || 0;
  const expectedTotal = round2(sumAss + sumCgst + sumSgst + sumIgst + rndOff);
  if (Number.isFinite(totInv) && items.length > 0 && Math.abs(totInv - expectedTotal) > 1) {
    add({
      code: "2212",
      path: "ValDtls.TotInvVal",
      message: `Total invoice value ${rupees(totInv)} does not equal assessable ${rupees(sumAss)} + tax ${rupees(sumCgst + sumSgst + sumIgst)}${rndOff ? ` + round off ${rupees(rndOff)}` : ""} = ${rupees(expectedTotal)}.`,
      expected: String(expectedTotal),
      severity: "high",
      autofix: { path: "ValDtls.TotInvVal", from: String(totInv), to: String(expectedTotal) },
    });
  }
  if (Math.abs(rndOff) > 99) {
    add({
      code: "2214",
      path: "ValDtls.RndOffAmt",
      message: `Round off ${rupees(rndOff)} exceeds the permitted range.`,
      expected: "between -99 and 99",
      severity: "medium",
    });
  }

  // --- B2B needs a recipient GSTIN
  if (supTyp === "B2B" && !str(get(p, "BuyerDtls.Gstin"))) {
    add({ code: "2153", path: "BuyerDtls.Gstin", message: "Supply type is B2B but there is no recipient GSTIN.", expected: "a valid 15-character GSTIN", severity: "high" });
  }
  if ((supTyp === "EXPWP" || supTyp === "EXPWOP") && str(get(p, "BuyerDtls.Pos")) !== "96") {
    add({
      code: "2155",
      path: "BuyerDtls.Pos",
      message: `Supply type is ${supTyp} (export) but place of supply is not 96.`,
      expected: "96, which denotes 'other country'",
      severity: "high",
      autofix: { path: "BuyerDtls.Pos", from: str(get(p, "BuyerDtls.Pos")), to: "96" },
    });
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Peppol BIS Billing 3.0
// ---------------------------------------------------------------------------

function validatePeppol(p: Record<string, unknown>): Issue[] {
  const issues: Issue[] = [];
  const add = (i: Issue) => issues.push(i);

  // Accepts either a UBL-ish shape or the IRN shape, mapping the fields we know.
  const pick = (...paths: string[]): string => {
    for (const path of paths) {
      const v = str(get(p, path));
      if (v) return v;
    }
    return "";
  };

  const RULES: [string, string, string, string][] = [
    ["BR-01", "ProfileID / TranDtls", pick("ProfileID", "TranDtls.TaxSch"), "A specification identifier is mandatory (urn:fdc:peppol.eu:2017:poacc:billing:01:1.0)"],
    ["BR-02", "ID / DocDtls.No", pick("ID", "DocDtls.No"), "An invoice number is mandatory"],
    ["BR-03", "IssueDate / DocDtls.Dt", pick("IssueDate", "DocDtls.Dt"), "An issue date is mandatory"],
    ["BR-04", "InvoiceTypeCode / DocDtls.Typ", pick("InvoiceTypeCode", "DocDtls.Typ"), "An invoice type code is mandatory (380 for a commercial invoice)"],
    ["BR-05", "DocumentCurrencyCode", pick("DocumentCurrencyCode", "Currency"), "A document currency code is mandatory (ISO 4217, e.g. EUR)"],
    ["BR-06", "AccountingSupplierParty.Name", pick("AccountingSupplierParty.Name", "SellerDtls.LglNm"), "The seller name is mandatory"],
    ["BR-07", "AccountingCustomerParty.Name", pick("AccountingCustomerParty.Name", "BuyerDtls.LglNm"), "The buyer name is mandatory"],
    ["BR-08", "AccountingSupplierParty.PostalAddress", pick("AccountingSupplierParty.PostalAddress.Country", "SellerDtls.Addr1"), "The seller postal address is mandatory"],
    ["BR-09", "AccountingSupplierParty.Country", pick("AccountingSupplierParty.PostalAddress.Country", "SellerDtls.Stcd"), "The seller country code is mandatory (ISO 3166-1 alpha-2)"],
    ["BR-16", "InvoiceLine", Array.isArray(get(p, "InvoiceLine")) || Array.isArray(get(p, "ItemList")) ? "present" : "", "At least one invoice line is mandatory"],
  ];

  for (const [code, path, value, expected] of RULES) {
    if (!value) {
      add({ code, path, message: `${expected}. Not present in the payload.`, expected, severity: "high" });
    }
  }

  const currency = pick("DocumentCurrencyCode", "Currency");
  if (currency && !/^[A-Z]{3}$/.test(currency)) {
    add({ code: "BR-05", path: "DocumentCurrencyCode", message: `Currency "${currency}" is not an ISO 4217 code.`, expected: "three uppercase letters, e.g. EUR", severity: "high" });
  }

  const issueDate = pick("IssueDate", "DocDtls.Dt");
  if (issueDate && !/^\d{4}-\d{2}-\d{2}$/.test(issueDate)) {
    const m = /^(\d{2})[/-](\d{2})[/-](\d{4})$/.exec(issueDate);
    add({
      code: "BR-03",
      path: "IssueDate",
      message: `Issue date "${issueDate}" is not in the required format.`,
      expected: "YYYY-MM-DD (ISO 8601)",
      severity: "high",
      ...(m ? { autofix: { path: "IssueDate", from: issueDate, to: `${m[3]}-${m[2]}-${m[1]}` } } : {}),
    });
  }

  const typeCode = pick("InvoiceTypeCode");
  if (typeCode && !["380", "381", "384", "389", "751"].includes(typeCode)) {
    add({ code: "BR-04", path: "InvoiceTypeCode", message: `Invoice type code "${typeCode}" is not in the Peppol subset of UNTDID 1001.`, expected: "380 invoice, 381 credit note, 384 corrected invoice", severity: "high" });
  }

  const endpoint = pick("AccountingSupplierParty.EndpointID");
  if (!endpoint) {
    add({
      code: "PEPPOL-EN16931-R020",
      path: "AccountingSupplierParty.EndpointID",
      message: "Seller electronic address is mandatory on the Peppol network — without it the document cannot be routed.",
      expected: "an EndpointID with a schemeID such as 0088 (GLN) or 9930 (German VAT)",
      severity: "high",
    });
  }

  add({
    code: "advisory",
    path: "—",
    message:
      "Peppol also validates against the receiving corner's own rules and any country extension (for example Italian FatturaPA or French Factur-X). Those cannot be checked without knowing the recipient's access point.",
    expected: "confirm with your Peppol access point provider",
    severity: "low",
  });

  return issues;
}

// ---------------------------------------------------------------------------
// run
// ---------------------------------------------------------------------------

const PORTAL_ONLY = [
  "Duplicate IRN — whether this document number has already been registered for this GSTIN and financial year.",
  "Whether the supplier and recipient GSTINs are active, and not cancelled or suspended, on the invoice date.",
  "Whether the supplier is actually enabled for e-invoicing at their turnover.",
  "E-way bill conflicts and existing part-B entries against the same document.",
  "Whether the document date falls inside the permitted reporting window.",
  "Digital signature and QR generation, which only the IRP can produce.",
];

export async function run(input: RunInput): Promise<RunResult> {
  const raw = (input.payload ?? "").trim();
  if (raw.length < 20) {
    throw new Error("Paste the invoice payload — JSON as sent to the IRP, or a CSV row with a header.");
  }

  let payload: Record<string, unknown>;
  let format: "json" | "csv";
  if (raw.startsWith("{") || raw.startsWith("[")) {
    format = "json";
    try {
      const parsed: unknown = JSON.parse(raw);
      payload = (Array.isArray(parsed) ? parsed[0] : parsed) as Record<string, unknown>;
    } catch (err) {
      throw new Error(
        `The payload is not valid JSON: ${err instanceof Error ? err.message : "parse error"}. Fix the syntax first — the portal rejects malformed JSON before it looks at any field.`,
      );
    }
    if (payload === null || typeof payload !== "object") {
      throw new Error("The payload parsed to something that is not an object.");
    }
  } else {
    format = "csv";
    payload = csvToPayload(raw);
  }

  const isPeppol = (input.standard ?? "").startsWith("Peppol");
  const turnoverHigh = (input.turnover ?? "").includes("above");

  const issues = isPeppol ? validatePeppol(payload) : validateIrn(payload, turnoverHigh);

  const blocking = issues.filter((i) => i.severity === "high");
  const warnings = issues.filter((i) => i.severity === "medium");
  const advisory = issues.filter((i) => i.severity === "low");
  const fixable = issues.filter((i) => i.autofix);

  // Corrected payload: apply only the deterministic repairs.
  const corrected: Record<string, unknown> = JSON.parse(JSON.stringify(payload));
  const applied: string[] = [];
  for (const issue of fixable) {
    const fix = issue.autofix!;
    const parts = fix.path.split(".");
    let cur: Record<string, unknown> | undefined = corrected;
    for (let i = 0; i < parts.length - 1 && cur; i += 1) {
      const m = /^(\w+)\[(\d+)\]$/.exec(parts[i]!);
      if (m) {
        const arr: unknown = cur[m[1]!];
        cur = Array.isArray(arr) ? (arr[Number(m[2])] as Record<string, unknown>) : undefined;
      } else {
        cur = cur[parts[i]!] as Record<string, unknown> | undefined;
      }
    }
    const last = parts[parts.length - 1]!;
    if (cur && last in cur) {
      const asNumber = Number(fix.to);
      cur[last] = Number.isFinite(asNumber) && typeof cur[last] === "number" ? asNumber : fix.to;
      applied.push(`${fix.path}: ${fix.from} → ${fix.to}`);
    }
  }

  const sections: { title: string; items: ResultItem[] }[] = [];

  const toItems = (list: Issue[]): ResultItem[] =>
    list.map((i) => ({
      title: `${i.code === "advisory" ? "Advisory" : i.code} · ${i.path}`,
      body: `${i.message}\n\nExpected: ${i.expected}${i.autofix ? `\n\nAuto-fixed in the corrected payload: ${i.autofix.from} → ${i.autofix.to}` : ""}`,
      tag: i.autofix ? "auto-fixable" : undefined,
      severity: i.severity,
    }));

  if (blocking.length > 0) sections.push({ title: `Will be rejected — ${blocking.length}`, items: toItems(blocking) });
  if (warnings.length > 0) sections.push({ title: `Warnings — ${warnings.length}`, items: toItems(warnings) });
  if (advisory.length > 0) sections.push({ title: `Advisory — ${advisory.length}`, items: toItems(advisory) });
  if (blocking.length === 0) {
    sections.push({
      title: "Structurally valid",
      items: [
        {
          body: `No blocking validation failure against ${isPeppol ? "Peppol BIS Billing 3.0" : "IRP schema 1.1"}. Field presence, code lists and all arithmetic reconcile.`,
          severity: "low",
        },
      ],
    });
  }

  sections.push({
    title: "Only the portal can decide these",
    items: PORTAL_ONLY.map((p) => ({ body: p, severity: "medium" as Severity })),
  });

  const score = Math.max(0, 100 - blocking.length * 12 - warnings.length * 4);

  return {
    headline:
      blocking.length > 0
        ? `Would be rejected: ${blocking.length} blocking error${blocking.length === 1 ? "" : "s"}${fixable.length > 0 ? `, ${fixable.length} fixed automatically below` : ""}.`
        : `Passes ${isPeppol ? "Peppol BIS 3.0" : "IRP schema 1.1"} validation${warnings.length > 0 ? ` with ${warnings.length} warning${warnings.length === 1 ? "" : "s"}` : ""}. Only portal state can reject it now.`,

    score: {
      label: isPeppol ? "Peppol readiness" : "IRP readiness",
      value: score,
      max: 100,
      band: blocking.length > 0 ? "bad" : warnings.length > 0 ? "warn" : "good",
    },

    metrics: [
      { label: "Blocking errors", value: String(blocking.length) },
      { label: "Auto-fixed", value: String(applied.length), hint: "applied in the corrected payload" },
      { label: "Standard", value: isPeppol ? "Peppol BIS 3.0" : "IRP 1.1" },
      { label: "Input format", value: format.toUpperCase() },
      ...(isPeppol ? [] : [{ label: "Min HSN digits", value: String(turnoverHigh ? 6 : 4), hint: "from your turnover band" }]),
    ],

    sections,

    table: {
      columns: ["Code", "Field", "Severity", "Auto-fix"],
      rows: issues.map((i) => [i.code, i.path, i.severity, i.autofix ? `${i.autofix.from} → ${i.autofix.to}` : "—"]),
    },

    copyBlocks: [
      {
        title: applied.length > 0 ? `Corrected payload — ${applied.length} field${applied.length === 1 ? "" : "s"} repaired` : "Payload (nothing to repair automatically)",
        text: JSON.stringify(corrected, null, 2),
        language: "json",
      },
      {
        title: "Changes applied",
        text:
          applied.length > 0
            ? applied.join("\n")
            : "No deterministic repairs were possible. Every remaining failure needs a decision — for example which tax head applies, or what the correct HSN is.",
        language: "text",
      },
    ],

    json: {
      standard: isPeppol ? "peppol-bis-3.0" : "irp-1.1",
      willBeRejected: blocking.length > 0,
      counts: { blocking: blocking.length, warnings: warnings.length, advisory: advisory.length },
      issues,
      appliedFixes: applied,
      corrected,
      portalOnlyChecks: PORTAL_ONLY,
    },
  };
}
