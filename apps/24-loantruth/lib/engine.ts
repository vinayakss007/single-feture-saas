import type { ResultItem, RunInput, RunResult, Severity } from "./types.ts";

/**
 * Loan cost arithmetic.
 *
 * The headline number a lender quotes is the interest rate. The number that
 * actually governs what you pay is the APR, which folds in processing fees,
 * insurance sold alongside the loan, and documentation charges. Those are usually
 * deducted from disbursal, so you borrow less than the sanctioned amount while
 * paying interest on all of it — and no sanction letter states the resulting rate.
 *
 * APR is solved numerically by bisection rather than approximated, because the
 * whole point is to produce a figure you can hold against the quoted one.
 */

type Month = {
  n: number;
  opening: number;
  emi: number;
  interest: number;
  principal: number;
  closing: number;
};

function toNumber(value: string | undefined): number {
  if (!value) return 0;
  const n = Number.parseFloat(String(value).replace(/[₹$,\s%]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function rupees(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}₹${Math.abs(Math.round(n)).toLocaleString("en-IN")}`;
}

/** Standard reducing-balance EMI. */
function emiFor(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / months;
  return (principal * r * (1 + r) ** months) / ((1 + r) ** months - 1);
}

function amortise(principal: number, annualRate: number, months: number, emi: number): Month[] {
  const r = annualRate / 12 / 100;
  const rows: Month[] = [];
  let balance = principal;
  for (let n = 1; n <= months && balance > 0.5; n += 1) {
    const interest = balance * r;
    let principalPart = emi - interest;
    if (principalPart > balance) principalPart = balance;
    const closing = balance - principalPart;
    rows.push({ n, opening: balance, emi: principalPart + interest, interest, principal: principalPart, closing });
    balance = closing;
  }
  return rows;
}

/**
 * Net present value of the payment stream at a given monthly rate, seen from the
 * borrower's side: they receive `disbursed` and pay `emi` for `months`.
 */
function npv(disbursed: number, emi: number, months: number, monthlyRate: number): number {
  let value = -disbursed;
  for (let n = 1; n <= months; n += 1) value += emi / (1 + monthlyRate) ** n;
  return value;
}

/**
 * Effective APR by bisection. Solved rather than estimated, because a
 * closed-form approximation would drift precisely where fees are large — which is
 * the case this product exists to expose.
 */
function solveApr(disbursed: number, emi: number, months: number): number {
  let lo = 0.000001;
  let hi = 1; // 100% a month is far beyond any real loan
  for (let i = 0; i < 200; i += 1) {
    const mid = (lo + hi) / 2;
    if (npv(disbursed, emi, months, mid) > 0) lo = mid;
    else hi = mid;
  }
  return ((lo + hi) / 2) * 12 * 100;
}

export async function run(input: RunInput): Promise<RunResult> {
  const principal = toNumber(input.principal);
  const rate = toNumber(input.rate);
  const years = toNumber(input.tenureYears);
  const months = Math.round(years * 12);

  if (principal < 10_000) throw new Error("Enter the sanctioned loan amount — at least ₹10,000.");
  if (rate <= 0 || rate > 60) throw new Error("Enter the annual interest rate as a percentage, for example 8.6.");
  if (months < 1 || months > 480) throw new Error("Enter the tenure in years, between 1 and 40.");

  const processingFeeInput = (input.processingFee ?? "0").trim();
  // Lenders quote processing fees either as a percentage or a flat amount.
  const feeIsPercent = processingFeeInput.includes("%");
  const processingFee = feeIsPercent
    ? Math.round((principal * toNumber(processingFeeInput)) / 100)
    : toNumber(processingFeeInput);
  const insurance = toNumber(input.insurance);
  const otherCharges = toNumber(input.otherCharges);

  const upfront = processingFee + insurance + otherCharges;
  const gstOnFee = Math.round(processingFee * 0.18);
  const totalUpfront = upfront + gstOnFee;

  // You pay interest on the sanctioned amount but only receive what is left after
  // deductions. That gap is the entire reason APR differs from the quoted rate.
  const disbursed = principal - totalUpfront;

  const emi = emiFor(principal, rate, months);
  const schedule = amortise(principal, rate, months, emi);
  const totalPaid = schedule.reduce((s, m) => s + m.emi, 0);
  const totalInterest = schedule.reduce((s, m) => s + m.interest, 0);

  const apr = solveApr(disbursed, emi, months);
  const aprGap = apr - rate;

  // --- prepayment
  const prepayAmount = toNumber(input.prepayAmount);
  const prepayMonth = Math.round(toNumber(input.prepayMonth));
  let prepaySaving = 0;
  let prepayMonthsSaved = 0;
  let prepayNewTenure = months;

  if (prepayAmount > 0 && prepayMonth >= 1 && prepayMonth <= months) {
    const r = rate / 12 / 100;
    let balance = principal;
    let interestPaid = 0;
    let n = 0;
    while (balance > 0.5 && n < months * 2) {
      n += 1;
      const interest = balance * r;
      interestPaid += interest;
      let principalPart = emi - interest;
      if (n === prepayMonth) principalPart += prepayAmount;
      if (principalPart > balance) principalPart = balance;
      balance -= principalPart;
    }
    prepayNewTenure = n;
    prepaySaving = totalInterest - interestPaid;
    prepayMonthsSaved = months - n;
  }

  // --- rate reset sensitivity, which is the risk a floating loan actually carries
  const floating = (input.rateType ?? "").startsWith("Floating");
  const shockRate = rate + 1;
  const shockEmi = emiFor(principal, shockRate, months);
  const shockSchedule = amortise(principal, shockRate, months, shockEmi);
  const shockInterest = shockSchedule.reduce((s, m) => s + m.interest, 0);

  // --- the halfway point, which surprises people on long tenures
  const halfPrincipalMonth = schedule.findIndex((m) => m.closing <= principal / 2) + 1;

  const interestShare = (totalInterest / principal) * 100;

  const sections: { title: string; items: ResultItem[] }[] = [
    {
      title: "What it actually costs",
      items: [
        {
          title: `EMI ${rupees(emi)} for ${months} months`,
          body: `Total repaid ${rupees(totalPaid)} on a ${rupees(principal)} loan. Interest alone is ${rupees(totalInterest)} — ${Math.round(interestShare)}% of what you borrowed.`,
          tag: rupees(emi),
          severity: "low",
        },
        {
          title: `True APR ${apr.toFixed(2)}% against a quoted ${rate.toFixed(2)}%`,
          body:
            totalUpfront > 0
              ? `You are charged interest on the full ${rupees(principal)} but only receive ${rupees(disbursed)}, because ${rupees(totalUpfront)} is deducted upfront — processing fee ${rupees(processingFee)}, GST on it ${rupees(gstOnFee)}${insurance > 0 ? `, insurance ${rupees(insurance)}` : ""}${otherCharges > 0 ? `, other charges ${rupees(otherCharges)}` : ""}. That gap is worth ${aprGap.toFixed(2)} percentage points, and no sanction letter states it.`
              : `With no fees entered, APR matches the quoted rate. If the sanction letter mentions a processing fee, insurance or documentation charge, add them above — they are what move this number.`,
          tag: `+${aprGap.toFixed(2)} pts`,
          severity: aprGap > 0.5 ? "high" : aprGap > 0.1 ? "medium" : "low",
        },
        {
          title: "Where the money goes early on",
          body: `In month one, ${rupees(schedule[0]!.interest)} of your ${rupees(emi)} EMI is interest and only ${rupees(schedule[0]!.principal)} reduces the loan — ${Math.round((schedule[0]!.interest / emi) * 100)}% interest. You do not halve the outstanding balance until month ${halfPrincipalMonth} of ${months}, which is ${Math.round((halfPrincipalMonth / months) * 100)}% of the way through. This is why prepaying early is worth so much more than prepaying late.`,
          severity: "medium",
        },
      ],
    },
  ];

  if (prepayAmount > 0) {
    sections.push({
      title: "Prepayment",
      items: [
        {
          title: `${rupees(prepayAmount)} in month ${prepayMonth} saves ${rupees(prepaySaving)}`,
          body: `Interest drops from ${rupees(totalInterest)} to ${rupees(totalInterest - prepaySaving)}, and the loan closes ${prepayMonthsSaved} month${prepayMonthsSaved === 1 ? "" : "s"} early — month ${prepayNewTenure} instead of ${months}. Return on that ${rupees(prepayAmount)} is ${((prepaySaving / prepayAmount) * 100).toFixed(0)}% over the life of the loan. Compare it against what the same money would earn invested; for a home loan at this rate the comparison is closer than people assume, but for a personal loan it rarely is.`,
          tag: rupees(prepaySaving),
          severity: "low",
        },
        {
          title: "Ask about the prepayment terms before relying on this",
          body: "Floating-rate home loans to individuals cannot carry a prepayment penalty under RBI rules. Fixed-rate loans, personal loans and business loans often can, and some lenders cap how much you may prepay in a year or require a minimum multiple of the EMI. The saving above assumes no penalty and no cap.",
          severity: "medium",
        },
      ],
    });
  }

  sections.push({
    title: floating ? "Your rate can move — here is what that costs" : "If you are offered a floating rate instead",
    items: [
      {
        title: `One percentage point costs ${rupees(shockInterest - totalInterest)}`,
        body: `At ${shockRate.toFixed(2)}% the EMI becomes ${rupees(shockEmi)} — ${rupees(shockEmi - emi)} more each month — and total interest rises by ${rupees(shockInterest - totalInterest)}. ${
          floating
            ? "On a floating loan this is not hypothetical: your rate resets with the external benchmark. Lenders usually absorb a rise by extending the tenure rather than raising the EMI, which is easier to swallow monthly and considerably more expensive overall. Ask which they will do."
            : "This is the risk you avoid on a fixed rate, and roughly what the fixed-rate premium buys you."
        }`,
        tag: rupees(shockEmi - emi) + "/mo",
        severity: floating ? "medium" : "low",
      },
    ],
  });

  sections.push({
    title: "What this does not know",
    items: [
      { body: "Charges not in the sanction letter. Legal and valuation fees, stamp duty on the mortgage, CERSAI and franking charges are often billed separately and are not in the APR above unless you entered them as other charges.", severity: "medium" as Severity },
      { body: "Whether the insurance sold alongside was optional. It usually is, and it is usually funded by increasing the loan so you pay interest on the premium for the full tenure. Worth asking to be quoted both ways.", severity: "medium" as Severity },
      { body: "Tax relief. Home loan interest and principal carry deductions that materially change the real cost, and they depend on your regime and other claims. Nothing above is adjusted for tax.", severity: "medium" as Severity },
      { body: "This is arithmetic on the numbers you entered, not financial advice, and not an offer.", severity: "low" as Severity },
    ],
  });

  const yearly: string[] = [];
  for (let y = 1; y <= Math.ceil(schedule.length / 12); y += 1) {
    const slice = schedule.slice((y - 1) * 12, y * 12);
    if (slice.length === 0) break;
    yearly.push(
      `Year ${String(y).padStart(2)}  interest ${rupees(slice.reduce((s, m) => s + m.interest, 0)).padStart(12)}  principal ${rupees(slice.reduce((s, m) => s + m.principal, 0)).padStart(12)}  balance ${rupees(slice[slice.length - 1]!.closing).padStart(12)}`,
    );
  }

  return {
    headline:
      aprGap > 0.25
        ? `True cost is ${apr.toFixed(2)}% APR, not the ${rate.toFixed(2)}% quoted — ${rupees(totalUpfront)} deducted upfront adds ${aprGap.toFixed(2)} points. Total interest ${rupees(totalInterest)}.`
        : `EMI ${rupees(emi)}, total interest ${rupees(totalInterest)} — ${Math.round(interestShare)}% of the amount borrowed. APR ${apr.toFixed(2)}%.`,

    score: {
      // The bar caps at 100 but interest routinely exceeds the principal on a long
      // tenure, so the true figure goes in the label. A capped 100/100 with no
      // further context would read as "as bad as possible" when 110% and 300% are
      // very different loans.
      label: `Interest is ${Math.round(interestShare)}% of the amount borrowed`,
      value: Math.min(100, Math.round(interestShare)),
      max: 100,
      band: interestShare > 60 ? "bad" : interestShare > 30 ? "warn" : "good",
    },

    metrics: [
      { label: "EMI", value: rupees(emi) },
      { label: "True APR", value: `${apr.toFixed(2)}%`, hint: `quoted ${rate.toFixed(2)}%` },
      { label: "Total interest", value: rupees(totalInterest) },
      { label: "Actually disbursed", value: rupees(disbursed), hint: `${rupees(totalUpfront)} deducted` },
      ...(prepayAmount > 0 ? [{ label: "Prepayment saves", value: rupees(prepaySaving), hint: `${prepayMonthsSaved} months earlier` }] : []),
    ],

    sections,

    table: {
      columns: ["Month", "EMI", "Interest", "Principal", "Balance"],
      rows: schedule
        .filter((m) => m.n <= 6 || m.n % 12 === 0 || m.n === schedule.length)
        .map((m) => [String(m.n), rupees(m.emi), rupees(m.interest), rupees(m.principal), rupees(m.closing)]),
    },

    copyBlocks: [
      {
        title: "Year-by-year summary",
        text: [
          `Loan ${rupees(principal)} at ${rate.toFixed(2)}% for ${years} years`,
          `EMI ${rupees(emi)}   True APR ${apr.toFixed(2)}%   Disbursed ${rupees(disbursed)}`,
          "",
          ...yearly,
          "",
          `Total repaid ${rupees(totalPaid)}   Total interest ${rupees(totalInterest)}`,
        ].join("\n"),
        language: "text",
      },
      {
        title: "Questions for the loan officer",
        text: [
          `1. The sanction says ${rate.toFixed(2)}%. With ${rupees(totalUpfront)} deducted upfront the effective APR is ${apr.toFixed(2)}%. Can you confirm that figure in writing?`,
          `2. Is the insurance premium of ${rupees(insurance)} optional, and can I have the loan quoted without it?`,
          `3. What is the total of legal, valuation, CERSAI, franking and stamp charges, in addition to the above?`,
          floating
            ? `4. On a rate reset, do you extend the tenure or raise the EMI? I want the EMI raised.`
            : `4. What would the floating rate be today, and what is the premium I am paying for fixed?`,
          `5. Is there any prepayment penalty, annual prepayment cap, or minimum prepayment amount?`,
          `6. Which external benchmark is the rate linked to, and what is the spread over it?`,
        ].join("\n"),
        language: "text",
      },
    ],

    json: {
      principal,
      quotedRate: rate,
      months,
      emi: Math.round(emi),
      totalPaid: Math.round(totalPaid),
      totalInterest: Math.round(totalInterest),
      upfront: { processingFee, gstOnFee, insurance, otherCharges, total: totalUpfront },
      disbursed,
      apr: Number(apr.toFixed(4)),
      aprGap: Number(aprGap.toFixed(4)),
      halfPrincipalMonth,
      prepayment: prepayAmount > 0 ? { amount: prepayAmount, month: prepayMonth, interestSaved: Math.round(prepaySaving), monthsSaved: prepayMonthsSaved, newTenure: prepayNewTenure } : null,
      rateShock: { rate: shockRate, emi: Math.round(shockEmi), extraInterest: Math.round(shockInterest - totalInterest) },
    },
  };
}
