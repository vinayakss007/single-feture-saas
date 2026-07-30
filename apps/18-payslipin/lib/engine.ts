import type { ResultItem, RunInput, RunResult, Severity } from "./types.ts";

/**
 * Indian payroll arithmetic.
 *
 * Every threshold, rate and slab used is emitted in the output. That is deliberate:
 * tax law changes annually, and a payroll number you cannot check against the
 * current Finance Act is a number you cannot defend to an employee or an auditor.
 * Showing the working is the feature.
 *
 * The one thing this refuses to do is quietly pick a regime. An employee is
 * entitled to compare, so both are computed and the difference is stated in rupees.
 */

const FY = "2026-27";

// --- Statutory constants, all named so the output can cite them.
const PF_WAGE_CEILING = 15_000; // monthly
const PF_EMPLOYEE_RATE = 0.12;
const PF_EPS_RATE = 0.0833; // employer share diverted to pension
const PF_EDLI_RATE = 0.005;
const PF_ADMIN_RATE = 0.005;
const ESI_GROSS_LIMIT = 21_000; // monthly
const ESI_EMPLOYEE_RATE = 0.0075;
const ESI_EMPLOYER_RATE = 0.0325;
const GRATUITY_RATE = 0.0481; // of basic, the standard 15/26 monthly accrual
const STANDARD_DEDUCTION_OLD = 50_000;
const STANDARD_DEDUCTION_NEW = 75_000;
const CAP_80C = 150_000;
const CAP_80D = 25_000;

/** Professional tax, monthly, by state. Empty array means the state levies none. */
const PT_SLABS: Record<string, { upto: number; tax: number }[]> = {
  Karnataka: [{ upto: 24_999, tax: 0 }, { upto: Number.POSITIVE_INFINITY, tax: 200 }],
  Maharashtra: [
    { upto: 7_500, tax: 0 },
    { upto: 10_000, tax: 175 },
    { upto: Number.POSITIVE_INFINITY, tax: 200 }, // 300 in February
  ],
  "Tamil Nadu": [
    { upto: 21_000, tax: 0 },
    { upto: 30_000, tax: 135 },
    { upto: 45_000, tax: 315 },
    { upto: 60_000, tax: 690 },
    { upto: 75_000, tax: 1_025 },
    { upto: Number.POSITIVE_INFINITY, tax: 1_250 },
  ],
  Telangana: [
    { upto: 15_000, tax: 0 },
    { upto: 20_000, tax: 150 },
    { upto: Number.POSITIVE_INFINITY, tax: 200 },
  ],
  "West Bengal": [
    { upto: 10_000, tax: 0 },
    { upto: 15_000, tax: 110 },
    { upto: 25_000, tax: 130 },
    { upto: 40_000, tax: 150 },
    { upto: Number.POSITIVE_INFINITY, tax: 200 },
  ],
  Gujarat: [
    { upto: 12_000, tax: 0 },
    { upto: Number.POSITIVE_INFINITY, tax: 200 },
  ],
  "Andhra Pradesh": [
    { upto: 15_000, tax: 0 },
    { upto: 20_000, tax: 150 },
    { upto: Number.POSITIVE_INFINITY, tax: 200 },
  ],
  Kerala: [
    { upto: 11_999, tax: 0 },
    { upto: 17_999, tax: 120 },
    { upto: 29_999, tax: 180 },
    { upto: 44_999, tax: 300 },
    { upto: Number.POSITIVE_INFINITY, tax: 500 },
  ],
  "Madhya Pradesh": [
    { upto: 18_750, tax: 0 },
    { upto: 25_000, tax: 125 },
    { upto: Number.POSITIVE_INFINITY, tax: 208 },
  ],
  "Delhi (no professional tax)": [],
  "Uttar Pradesh (no professional tax)": [],
  "Haryana (no professional tax)": [],
};

type Slab = { upto: number; rate: number };

/** Old regime slabs, FY 2026-27. */
const OLD_SLABS: Slab[] = [
  { upto: 250_000, rate: 0 },
  { upto: 500_000, rate: 0.05 },
  { upto: 1_000_000, rate: 0.2 },
  { upto: Number.POSITIVE_INFINITY, rate: 0.3 },
];

/** New regime slabs, FY 2026-27. */
const NEW_SLABS: Slab[] = [
  { upto: 400_000, rate: 0 },
  { upto: 800_000, rate: 0.05 },
  { upto: 1_200_000, rate: 0.1 },
  { upto: 1_600_000, rate: 0.15 },
  { upto: 2_000_000, rate: 0.2 },
  { upto: 2_400_000, rate: 0.25 },
  { upto: Number.POSITIVE_INFINITY, rate: 0.3 },
];

/** 87A rebate: full relief up to this taxable income. */
const REBATE_LIMIT_NEW = 1_200_000;
const REBATE_LIMIT_OLD = 500_000;
const CESS_RATE = 0.04;

function rupees(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function toNumber(value: string | undefined): number {
  if (!value) return 0;
  const n = Number.parseFloat(value.replace(/[₹,\s]/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function slabTax(taxable: number, slabs: Slab[]): { tax: number; working: string[] } {
  let remaining = taxable;
  let previous = 0;
  let tax = 0;
  const working: string[] = [];
  for (const slab of slabs) {
    if (remaining <= 0) break;
    const width = slab.upto - previous;
    const inBand = Math.min(remaining, width);
    const amount = inBand * slab.rate;
    if (inBand > 0 && slab.rate > 0) {
      working.push(
        `${rupees(previous)}–${slab.upto === Number.POSITIVE_INFINITY ? "above" : rupees(slab.upto)} at ${(slab.rate * 100).toFixed(0)}%: ${rupees(inBand)} → ${rupees(amount)}`,
      );
    }
    tax += amount;
    remaining -= inBand;
    previous = slab.upto;
  }
  return { tax, working };
}

/** Surcharge on high incomes. Applies to tax, before cess. */
function surcharge(taxableIncome: number, tax: number, isNewRegime: boolean): { amount: number; note: string | null } {
  let rate = 0;
  if (taxableIncome > 50_000_000) rate = isNewRegime ? 0.25 : 0.37;
  else if (taxableIncome > 20_000_000) rate = 0.25;
  else if (taxableIncome > 10_000_000) rate = 0.15;
  else if (taxableIncome > 5_000_000) rate = 0.1;
  if (rate === 0) return { amount: 0, note: null };
  return {
    amount: tax * rate,
    note: `Surcharge at ${(rate * 100).toFixed(0)}% applies above ${rupees(taxableIncome > 50_000_000 ? 50_000_000 : taxableIncome > 20_000_000 ? 20_000_000 : taxableIncome > 10_000_000 ? 10_000_000 : 5_000_000)} taxable income. Marginal relief is not applied here and may reduce it — check with your CA if you are just over a threshold.`,
  };
}

function professionalTax(state: string, monthlyGross: number): { monthly: number; note: string } {
  const slabs = PT_SLABS[state];
  if (!slabs || slabs.length === 0) {
    return { monthly: 0, note: `${state} does not levy professional tax.` };
  }
  for (const slab of slabs) {
    if (monthlyGross <= slab.upto) {
      return {
        monthly: slab.tax,
        note:
          slab.tax === 0
            ? `Gross of ${rupees(monthlyGross)} is below the ${state} threshold.`
            : `${state} slab for gross up to ${slab.upto === Number.POSITIVE_INFINITY ? "any amount" : rupees(slab.upto)}.${state === "Maharashtra" ? " Maharashtra levies ₹300 in February instead of ₹200, so the annual figure is ₹2,500." : ""}`,
      };
    }
  }
  return { monthly: 0, note: "No slab matched." };
}

// ---------------------------------------------------------------------------
// run
// ---------------------------------------------------------------------------

export async function run(input: RunInput): Promise<RunResult> {
  const name = (input.employeeName ?? "").trim();
  if (!name) throw new Error("Enter the employee's name — it appears on the payslip.");

  const ctc = toNumber(input.ctc);
  if (ctc < 100_000) {
    throw new Error("Enter an annual CTC of at least ₹1,00,000. Anything lower is almost certainly a monthly figure entered by mistake.");
  }
  if (ctc > 500_000_000) {
    throw new Error("That CTC is above ₹50 crore. Check the figure — this is meant for a single employee's annual cost to company.");
  }

  const state = input.state ?? "Karnataka";
  const isMetro = (input.metro ?? "").startsWith("Metro");
  const basicPct = Number.parseFloat((input.basicPercent ?? "50").replace(/[^\d.]/g, "")) / 100 || 0.5;
  const pfOption = input.pfOption ?? "On ₹15,000 statutory ceiling";
  const pfExempt = pfOption.startsWith("Not applicable");

  // --- Structure. Employer PF and gratuity come OUT of CTC, not on top: that is
  //     the misunderstanding that makes most spreadsheets overstate take-home.
  const annualBasic = ctc * basicPct;
  const monthlyBasic = annualBasic / 12;

  const pfWageBase = pfExempt
    ? 0
    : pfOption.startsWith("On actual")
      ? monthlyBasic
      : Math.min(monthlyBasic, PF_WAGE_CEILING);

  const employeePfMonthly = pfWageBase * PF_EMPLOYEE_RATE;
  const employerPfMonthly = pfWageBase * PF_EMPLOYEE_RATE;
  const employerEpsMonthly = pfWageBase * PF_EPS_RATE;
  const employerEpfMonthly = employerPfMonthly - employerEpsMonthly;
  const edliMonthly = pfWageBase * PF_EDLI_RATE;
  const adminMonthly = pfWageBase * PF_ADMIN_RATE;
  const employerPfTotalMonthly = employerPfMonthly + edliMonthly + adminMonthly;

  const gratuityMonthly = monthlyBasic * GRATUITY_RATE;

  // Gross is what remains of CTC after employer-side costs.
  const monthlyCtc = ctc / 12;
  const monthlyGross = monthlyCtc - employerPfTotalMonthly - gratuityMonthly;

  const monthlyHra = monthlyBasic * (isMetro ? 0.5 : 0.4);
  const monthlySpecial = monthlyGross - monthlyBasic - monthlyHra;

  if (monthlySpecial < 0) {
    throw new Error(
      `With basic at ${(basicPct * 100).toFixed(0)}% of CTC and HRA at ${isMetro ? 50 : 40}% of basic, the components exceed gross pay. Lower the basic percentage — at this CTC, 40% works.`,
    );
  }

  // --- ESI
  const esiEligible = monthlyGross <= ESI_GROSS_LIMIT;
  const employeeEsiMonthly = esiEligible ? monthlyGross * ESI_EMPLOYEE_RATE : 0;
  const employerEsiMonthly = esiEligible ? monthlyGross * ESI_EMPLOYER_RATE : 0;

  // --- Professional tax
  const pt = professionalTax(state, monthlyGross);

  // --- Old regime
  const annualGross = monthlyGross * 12;
  const annualHra = monthlyHra * 12;
  const rentAnnual = toNumber(input.rentPaid) * 12;

  // HRA exemption is the least of three amounts. All three are shown.
  const hraExemptionCandidates = [
    { label: "HRA actually received", value: annualHra },
    { label: `${isMetro ? 50 : 40}% of basic (${isMetro ? "metro" : "non-metro"})`, value: annualBasic * (isMetro ? 0.5 : 0.4) },
    { label: "Rent paid less 10% of basic", value: Math.max(0, rentAnnual - annualBasic * 0.1) },
  ];
  const hraExemption = rentAnnual > 0 ? Math.min(...hraExemptionCandidates.map((c) => c.value)) : 0;

  const employeePfAnnual = employeePfMonthly * 12;
  // EPF counts inside the 80C cap, so declared 80C is only useful above it.
  const declared80c = toNumber(input.deduction80c);
  const used80c = Math.min(CAP_80C, employeePfAnnual + declared80c);
  const used80d = Math.min(CAP_80D, toNumber(input.deduction80d));
  const ptAnnual = pt.monthly * 12;

  const taxableOld = Math.max(
    0,
    annualGross - hraExemption - STANDARD_DEDUCTION_OLD - used80c - used80d - ptAnnual,
  );
  const oldSlab = slabTax(taxableOld, OLD_SLABS);
  const oldRebate = taxableOld <= REBATE_LIMIT_OLD ? Math.min(oldSlab.tax, 12_500) : 0;
  const oldSur = surcharge(taxableOld, Math.max(0, oldSlab.tax - oldRebate), false);
  const oldTax = Math.max(0, oldSlab.tax - oldRebate);
  const oldTotal = (oldTax + oldSur.amount) * (1 + CESS_RATE);

  // --- New regime: standard deduction only, no HRA, no 80C or 80D.
  const taxableNew = Math.max(0, annualGross - STANDARD_DEDUCTION_NEW);
  const newSlab = slabTax(taxableNew, NEW_SLABS);
  const newRebate = taxableNew <= REBATE_LIMIT_NEW ? newSlab.tax : 0;
  const newTaxBase = Math.max(0, newSlab.tax - newRebate);
  const newSur = surcharge(taxableNew, newTaxBase, true);
  const newTotal = (newTaxBase + newSur.amount) * (1 + CESS_RATE);

  const betterRegime = newTotal <= oldTotal ? "new" : "old";
  const saving = Math.abs(oldTotal - newTotal);
  const chosenTax = betterRegime === "new" ? newTotal : oldTotal;
  const monthlyTds = chosenTax / 12;

  // --- Net
  const totalDeductions = employeePfMonthly + employeeEsiMonthly + pt.monthly + monthlyTds;
  const netMonthly = monthlyGross - totalDeductions;

  const sections: { title: string; items: ResultItem[] }[] = [
    {
      title: "Monthly earnings",
      items: [
        { title: "Basic salary", body: `${rupees(monthlyBasic)} — ${(basicPct * 100).toFixed(0)}% of CTC. PF and gratuity are both computed on this, so it drives everything below.`, tag: rupees(monthlyBasic), severity: "low" },
        { title: "House rent allowance", body: `${rupees(monthlyHra)} — ${isMetro ? 50 : 40}% of basic for a ${isMetro ? "metro" : "non-metro"} city.`, tag: rupees(monthlyHra), severity: "low" },
        { title: "Special allowance", body: `${rupees(monthlySpecial)} — the balancing figure. Fully taxable, and it absorbs whatever is left after the structured components.`, tag: rupees(monthlySpecial), severity: "low" },
        { title: "Gross monthly", body: `${rupees(monthlyGross)}. This is CTC of ${rupees(monthlyCtc)} less employer PF ${rupees(employerPfTotalMonthly)} and gratuity accrual ${rupees(gratuityMonthly)} — both are employer costs inside CTC, not additions to it. That distinction is the most common CTC misunderstanding there is.`, tag: rupees(monthlyGross), severity: "medium" },
      ],
    },
    {
      title: "Monthly deductions from pay",
      items: [
        {
          title: "Employee provident fund",
          body: pfExempt
            ? "Not applicable — marked exempt."
            : `${rupees(employeePfMonthly)} — 12% of ${rupees(pfWageBase)}. ${pfOption.startsWith("On actual") ? "Computed on actual basic, which is above the statutory ceiling and therefore voluntary." : `Computed on the ₹${PF_WAGE_CEILING.toLocaleString("en-IN")} statutory wage ceiling. Basic of ${rupees(monthlyBasic)} exceeds it, so contribution is capped — legal, and the common choice.`}`,
          tag: rupees(employeePfMonthly),
          severity: "low",
        },
        {
          title: "Employee state insurance",
          body: esiEligible
            ? `${rupees(employeeEsiMonthly)} — 0.75% of gross. Applies because gross of ${rupees(monthlyGross)} is at or below the ₹${ESI_GROSS_LIMIT.toLocaleString("en-IN")} threshold.`
            : `Not applicable. Gross of ${rupees(monthlyGross)} exceeds the ₹${ESI_GROSS_LIMIT.toLocaleString("en-IN")} threshold. Note that if an employee crosses the threshold mid-period, ESI continues to the end of that contribution period.`,
          tag: esiEligible ? rupees(employeeEsiMonthly) : "N/A",
          severity: "low",
        },
        { title: "Professional tax", body: `${rupees(pt.monthly)} — ${pt.note}`, tag: rupees(pt.monthly), severity: "low" },
        {
          title: `TDS (${betterRegime} regime)`,
          body: `${rupees(monthlyTds)} a month, ${rupees(chosenTax)} for the year. This is the annual liability spread evenly, which is the standard method. Real TDS also depends on other income, previous employment this year, and whether declared investments are actually proved — so treat this as the correct starting figure and adjust on declarations.`,
          tag: rupees(monthlyTds),
          severity: "medium",
        },
      ],
    },
    {
      title: `Tax regime comparison — ${betterRegime} regime saves ${rupees(saving)} a year`,
      items: [
        {
          title: `New regime: ${rupees(newTotal)}`,
          body: `Taxable income ${rupees(taxableNew)} after the ₹${STANDARD_DEDUCTION_NEW.toLocaleString("en-IN")} standard deduction. No HRA exemption, no 80C, no 80D.\n${newSlab.working.join("\n") || "Below the first taxable slab."}${newRebate > 0 ? `\nSection 87A rebate: full relief, as taxable income is at or below ${rupees(REBATE_LIMIT_NEW)}.` : ""}${newSur.note ? `\n${newSur.note}` : ""}\nPlus 4% health and education cess.`,
          tag: betterRegime === "new" ? "better" : undefined,
          severity: betterRegime === "new" ? "low" : "medium",
        },
        {
          title: `Old regime: ${rupees(oldTotal)}`,
          body: `Taxable income ${rupees(taxableOld)} after HRA exemption ${rupees(hraExemption)}, standard deduction ₹${STANDARD_DEDUCTION_OLD.toLocaleString("en-IN")}, 80C ${rupees(used80c)}, 80D ${rupees(used80d)} and professional tax ${rupees(ptAnnual)}.\n${oldSlab.working.join("\n") || "Below the first taxable slab."}${oldSur.note ? `\n${oldSur.note}` : ""}\nPlus 4% health and education cess.`,
          tag: betterRegime === "old" ? "better" : undefined,
          severity: betterRegime === "old" ? "low" : "medium",
        },
        {
          title: "How the HRA exemption was computed",
          body:
            rentAnnual > 0
              ? `The least of three figures, which is the statutory rule:\n${hraExemptionCandidates.map((c) => `  • ${c.label}: ${rupees(c.value)}`).join("\n")}\nExemption applied: ${rupees(hraExemption)}. Rent receipts are required, and a landlord PAN above ₹1 lakh of annual rent.`
              : "No rent was entered, so no HRA exemption is claimed in the old regime. If the employee does pay rent, entering it can change which regime wins.",
          severity: "low",
        },
        {
          title: "Why 80C may be worth less than declared",
          body: `Employee PF of ${rupees(employeePfAnnual)} already counts inside the ₹${CAP_80C.toLocaleString("en-IN")} cap. Declared investments of ${rupees(declared80c)} bring the total to ${rupees(employeePfAnnual + declared80c)}, of which ${rupees(used80c)} is usable. ${employeePfAnnual + declared80c > CAP_80C ? `${rupees(employeePfAnnual + declared80c - CAP_80C)} is wasted — worth telling the employee before they invest more.` : "There is headroom remaining."}`,
          severity: employeePfAnnual + declared80c > CAP_80C ? "medium" : "low",
        },
      ],
    },
    {
      title: "Employer cost, on top of pay",
      items: [
        { title: "Employer PF", body: `${rupees(employerPfTotalMonthly)} a month: EPF ${rupees(employerEpfMonthly)}, EPS pension ${rupees(employerEpsMonthly)}, EDLI ${rupees(edliMonthly)}, admin charges ${rupees(adminMonthly)}. The 8.33% EPS diversion is why employer PF is not simply 12%.`, tag: rupees(employerPfTotalMonthly), severity: "low" },
        { title: "Employer ESI", body: esiEligible ? `${rupees(employerEsiMonthly)} — 3.25% of gross.` : "Not applicable at this gross.", tag: esiEligible ? rupees(employerEsiMonthly) : "N/A", severity: "low" },
        { title: "Gratuity accrual", body: `${rupees(gratuityMonthly)} a month at 4.81% of basic. Payable only after five years of continuous service, but accrued monthly as a provision — which is why it sits inside CTC and never in take-home.`, tag: rupees(gratuityMonthly), severity: "low" },
      ],
    },
    {
      title: "What this does not do",
      items: [
        { body: `Slabs and thresholds are FY ${FY}. Every figure used is listed above so you can check it against the current Finance Act rather than trusting it.`, severity: "medium" as Severity },
        { body: "It does not file returns or make payments. PF goes through EPFO, ESI through ESIC, TDS through TRACES.", severity: "low" as Severity },
        { body: "TDS assumes this is the employee's only income and that declared investments will be proved. Adjust for other income, prior employment in the same year, and unproved declarations.", severity: "medium" as Severity },
        { body: "Marginal relief on surcharge is not applied. If taxable income is just over ₹50 lakh, ₹1 crore or ₹2 crore, the real liability may be lower — check with a CA.", severity: "low" as Severity },
      ],
    },
  ];

  const payslip = [
    `PAYSLIP — ${input.month ?? ""}`,
    "".padEnd(56, "="),
    `Employee    : ${name}`,
    ...(input.designation ? [`Designation : ${input.designation}`] : []),
    `State       : ${state}${isMetro ? " (metro)" : ""}`,
    `Annual CTC  : ${rupees(ctc)}`,
    `Tax regime  : ${betterRegime} regime (saves ${rupees(saving)} a year)`,
    "",
    "EARNINGS".padEnd(38) + "AMOUNT".padStart(18),
    "".padEnd(56, "-"),
    "Basic salary".padEnd(38) + rupees(monthlyBasic).padStart(18),
    "House rent allowance".padEnd(38) + rupees(monthlyHra).padStart(18),
    "Special allowance".padEnd(38) + rupees(monthlySpecial).padStart(18),
    "".padEnd(56, "-"),
    "Gross earnings".padEnd(38) + rupees(monthlyGross).padStart(18),
    "",
    "DEDUCTIONS".padEnd(38) + "AMOUNT".padStart(18),
    "".padEnd(56, "-"),
    "Provident fund (employee)".padEnd(38) + rupees(employeePfMonthly).padStart(18),
    ...(esiEligible ? ["ESI (employee)".padEnd(38) + rupees(employeeEsiMonthly).padStart(18)] : []),
    `Professional tax (${state.split(" ")[0]})`.padEnd(38) + rupees(pt.monthly).padStart(18),
    "Income tax (TDS)".padEnd(38) + rupees(monthlyTds).padStart(18),
    "".padEnd(56, "-"),
    "Total deductions".padEnd(38) + rupees(totalDeductions).padStart(18),
    "",
    "".padEnd(56, "="),
    "NET PAY".padEnd(38) + rupees(netMonthly).padStart(18),
    "".padEnd(56, "="),
    "",
    "EMPLOYER CONTRIBUTIONS (not deducted from pay)",
    "".padEnd(56, "-"),
    "Provident fund (employer)".padEnd(38) + rupees(employerPfTotalMonthly).padStart(18),
    ...(esiEligible ? ["ESI (employer)".padEnd(38) + rupees(employerEsiMonthly).padStart(18)] : []),
    "Gratuity accrual".padEnd(38) + rupees(gratuityMonthly).padStart(18),
    "",
    `Computed for FY ${FY}. This is a computed statement, not a tax filing.`,
  ].join("\n");

  const takeHomePct = Math.round((netMonthly / monthlyCtc) * 100);

  return {
    headline: `${name}: ${rupees(netMonthly)} a month net on ${rupees(ctc)} CTC — ${takeHomePct}% of CTC reaches the bank. The ${betterRegime} regime saves ${rupees(saving)} a year.`,

    score: {
      label: "Take-home as % of CTC",
      value: takeHomePct,
      max: 100,
      band: takeHomePct >= 75 ? "good" : takeHomePct >= 65 ? "warn" : "bad",
    },

    metrics: [
      { label: "Net monthly", value: rupees(netMonthly) },
      { label: "Gross monthly", value: rupees(monthlyGross), hint: "after employer costs" },
      { label: "Monthly TDS", value: rupees(monthlyTds), hint: `${betterRegime} regime` },
      { label: "Annual tax saved", value: rupees(saving), hint: `by choosing ${betterRegime}` },
      { label: "Total deductions", value: rupees(totalDeductions) },
    ],

    sections,

    table: {
      columns: ["Component", "Monthly", "Annual", "Type"],
      rows: [
        ["Basic salary", rupees(monthlyBasic), rupees(monthlyBasic * 12), "earning"],
        ["House rent allowance", rupees(monthlyHra), rupees(monthlyHra * 12), "earning"],
        ["Special allowance", rupees(monthlySpecial), rupees(monthlySpecial * 12), "earning"],
        ["Gross", rupees(monthlyGross), rupees(annualGross), "subtotal"],
        ["Provident fund (employee)", rupees(employeePfMonthly), rupees(employeePfAnnual), "deduction"],
        ["ESI (employee)", esiEligible ? rupees(employeeEsiMonthly) : "—", esiEligible ? rupees(employeeEsiMonthly * 12) : "—", "deduction"],
        ["Professional tax", rupees(pt.monthly), rupees(ptAnnual), "deduction"],
        ["Income tax (TDS)", rupees(monthlyTds), rupees(chosenTax), "deduction"],
        ["Net pay", rupees(netMonthly), rupees(netMonthly * 12), "net"],
        ["Provident fund (employer)", rupees(employerPfTotalMonthly), rupees(employerPfTotalMonthly * 12), "employer cost"],
        ["ESI (employer)", esiEligible ? rupees(employerEsiMonthly) : "—", esiEligible ? rupees(employerEsiMonthly * 12) : "—", "employer cost"],
        ["Gratuity accrual", rupees(gratuityMonthly), rupees(gratuityMonthly * 12), "employer cost"],
      ],
    },

    copyBlocks: [
      { title: "Payslip", text: payslip, language: "text" },
      {
        title: "Payroll register row (CSV)",
        text: [
          "employee,designation,state,ctc_annual,basic,hra,special,gross,pf_employee,esi_employee,professional_tax,tds,net,pf_employer,esi_employer,gratuity,regime",
          [
            name,
            input.designation ?? "",
            state,
            Math.round(ctc),
            Math.round(monthlyBasic),
            Math.round(monthlyHra),
            Math.round(monthlySpecial),
            Math.round(monthlyGross),
            Math.round(employeePfMonthly),
            Math.round(employeeEsiMonthly),
            pt.monthly,
            Math.round(monthlyTds),
            Math.round(netMonthly),
            Math.round(employerPfTotalMonthly),
            Math.round(employerEsiMonthly),
            Math.round(gratuityMonthly),
            betterRegime,
          ].join(","),
        ].join("\n"),
        language: "csv",
      },
    ],

    json: {
      financialYear: FY,
      employee: { name, designation: input.designation ?? null, state, metro: isMetro },
      ctc: { annual: ctc, monthly: monthlyCtc, basicPercent: basicPct },
      earnings: { basic: monthlyBasic, hra: monthlyHra, special: monthlySpecial, gross: monthlyGross },
      deductions: { pf: employeePfMonthly, esi: employeeEsiMonthly, professionalTax: pt.monthly, tds: monthlyTds, total: totalDeductions },
      employerCost: {
        pfTotal: employerPfTotalMonthly,
        pfBreakdown: { epf: employerEpfMonthly, eps: employerEpsMonthly, edli: edliMonthly, admin: adminMonthly },
        esi: employerEsiMonthly,
        gratuity: gratuityMonthly,
      },
      net: { monthly: netMonthly, annual: netMonthly * 12, percentOfCtc: takeHomePct },
      tax: {
        chosenRegime: betterRegime,
        annualSaving: saving,
        old: { taxableIncome: taxableOld, tax: oldTotal, hraExemption, used80c, used80d },
        new: { taxableIncome: taxableNew, tax: newTotal },
      },
      constantsUsed: {
        pfWageCeiling: PF_WAGE_CEILING,
        esiGrossLimit: ESI_GROSS_LIMIT,
        standardDeductionOld: STANDARD_DEDUCTION_OLD,
        standardDeductionNew: STANDARD_DEDUCTION_NEW,
        cap80c: CAP_80C,
        cap80d: CAP_80D,
        cessRate: CESS_RATE,
        gratuityRate: GRATUITY_RATE,
      },
    },
  };
}
