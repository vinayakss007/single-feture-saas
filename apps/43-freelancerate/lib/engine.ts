import type { RunInput, RunResult, Severity } from "./types.ts";

/**
 * FreelanceRate engine - Computes minimum viable hourly rate for Indian
 * freelancers from target income, expenses, tax, and utilisation.
 */

type MarketRange = { category: string; hourlyMin: number; hourlyMax: number; dayMin: number; dayMax: number };

const MARKET_MEDIANS: MarketRange[] = [
  { category: "Web Developer (Mid)", hourlyMin: 1000, hourlyMax: 2500, dayMin: 6000, dayMax: 15000 },
  { category: "Web Developer (Senior)", hourlyMin: 2500, hourlyMax: 5000, dayMin: 15000, dayMax: 35000 },
  { category: "UI/UX Designer", hourlyMin: 1200, hourlyMax: 3500, dayMin: 8000, dayMax: 25000 },
  { category: "Content Writer", hourlyMin: 500, hourlyMax: 1500, dayMin: 3000, dayMax: 10000 },
  { category: "Digital Marketing", hourlyMin: 800, hourlyMax: 2500, dayMin: 5000, dayMax: 15000 },
  { category: "Management Consultant", hourlyMin: 3000, hourlyMax: 8000, dayMin: 20000, dayMax: 60000 },
  { category: "Data Analyst", hourlyMin: 1200, hourlyMax: 3000, dayMin: 8000, dayMax: 20000 },
  { category: "Video Editor", hourlyMin: 600, hourlyMax: 2000, dayMin: 4000, dayMax: 12000 },
  { category: "CA/Tax Consultant", hourlyMin: 1500, hourlyMax: 4000, dayMin: 10000, dayMax: 30000 },
  { category: "Mobile App Developer", hourlyMin: 1500, hourlyMax: 4000, dayMin: 10000, dayMax: 30000 },
];

function estimateIncomeTax(annualIncome: number): { tax: number; effectiveRate: number; regime: string } {
  // New regime (FY 2024-25) - simplified
  let tax = 0;
  const income = annualIncome;
  if (income <= 300000) {
    tax = 0;
  } else if (income <= 700000) {
    tax = (income - 300000) * 0.05;
    // Rebate under 87A
    if (income <= 700000) tax = 0;
  } else if (income <= 1000000) {
    tax = 20000 + (income - 700000) * 0.1;
  } else if (income <= 1200000) {
    tax = 50000 + (income - 1000000) * 0.15;
  } else if (income <= 1500000) {
    tax = 80000 + (income - 1200000) * 0.2;
  } else {
    tax = 140000 + (income - 1500000) * 0.3;
  }
  // Add 4% cess
  tax = tax * 1.04;
  const effectiveRate = income > 0 ? (tax / income) * 100 : 0;
  return { tax: Math.round(tax), effectiveRate: Math.round(effectiveRate * 10) / 10, regime: "New Regime FY24-25" };
}

export function run(input: RunInput): RunResult {
  const targetTakeHomeStr = (input.targetTakeHome ?? "").trim();
  const workingDaysStr = (input.workingDays ?? "").trim();
  const billableHoursStr = (input.billableHours ?? "").trim();
  const annualExpensesStr = (input.annualExpenses ?? "").trim();
  const vacationDaysStr = (input.vacationDays ?? "").trim();
  const badDebtBufferStr = (input.badDebtBuffer ?? "").trim();

  if (!targetTakeHomeStr) throw new Error("Enter your target monthly take-home amount in rupees.");
  if (!workingDaysStr) throw new Error("Enter working days per month (typically 20-22).");
  if (!billableHoursStr) throw new Error("Enter billable hours per day (typically 5-7, not 8).");
  if (!annualExpensesStr) throw new Error("Enter total annual business expenses (software, internet, insurance, equipment, etc.).");
  if (!vacationDaysStr) throw new Error("Enter vacation/leave days per year including public holidays and sick days.");

  const targetTakeHome = Number(targetTakeHomeStr);
  const workingDays = Number(workingDaysStr);
  const billableHours = Number(billableHoursStr);
  const annualExpenses = Number(annualExpensesStr);
  const vacationDays = Number(vacationDaysStr);
  const badDebtBuffer = Number(badDebtBufferStr || "10");

  if (isNaN(targetTakeHome) || targetTakeHome <= 0) throw new Error("Target take-home must be a positive number.");
  if (isNaN(workingDays) || workingDays < 10 || workingDays > 30) throw new Error("Working days should be between 10 and 30 per month.");
  if (isNaN(billableHours) || billableHours < 2 || billableHours > 12) throw new Error("Billable hours should be between 2 and 12 per day.");
  if (isNaN(annualExpenses) || annualExpenses < 0) throw new Error("Annual expenses must be zero or positive.");
  if (isNaN(vacationDays) || vacationDays < 0 || vacationDays > 180) throw new Error("Vacation days should be between 0 and 180 per year.");
  if (isNaN(badDebtBuffer) || badDebtBuffer < 0 || badDebtBuffer > 50) throw new Error("Bad-debt buffer should be between 0% and 50%.");

  // Core calculation
  const annualTakeHome = targetTakeHome * 12;
  const totalWorkingDaysPerYear = workingDays * 12 - vacationDays;
  const billableDaysPerYear = totalWorkingDaysPerYear; // simplified: assume all working days are potentially billable
  const totalBillableHoursPerYear = billableDaysPerYear * billableHours;

  // Gross revenue needed before tax
  // take-home + expenses + tax = gross revenue
  // tax depends on gross, so we iterate
  let grossRevenue = annualTakeHome + annualExpenses;
  for (let i = 0; i < 5; i++) {
    const taxInfo = estimateIncomeTax(grossRevenue - annualExpenses); // taxable = revenue - expenses (simplified)
    grossRevenue = annualTakeHome + annualExpenses + taxInfo.tax;
  }

  // Add bad debt buffer
  const revenueWithBuffer = grossRevenue / (1 - badDebtBuffer / 100);

  // Add GST if applicable (threshold 20L)
  const needsGST = revenueWithBuffer > 2000000;
  const gstNote = needsGST
    ? "GST registration required (revenue > Rs 20 lakh). Charge 18% GST on top of your rate."
    : "Below GST threshold (Rs 20 lakh). Registration optional but recommended for input credit.";

  // Rates
  const hourlyRate = Math.ceil(revenueWithBuffer / totalBillableHoursPerYear);
  const dayRate = Math.ceil(hourlyRate * billableHours);
  const monthlyRate = Math.ceil(revenueWithBuffer / 12);

  // Utilisation scenarios
  const utilisationBase = (billableDaysPerYear / (workingDays * 12)) * 100;
  const scenarios = [
    { label: "Current plan", utilisationPct: Math.round(utilisationBase), hourly: hourlyRate, monthly: monthlyRate },
    { label: "10% drop in utilisation", utilisationPct: Math.round(utilisationBase * 0.9), hourly: Math.ceil(hourlyRate / 0.9), monthly: Math.ceil(monthlyRate / 0.9) },
    { label: "20% drop in utilisation", utilisationPct: Math.round(utilisationBase * 0.8), hourly: Math.ceil(hourlyRate / 0.8), monthly: Math.ceil(monthlyRate / 0.8) },
    { label: "30% drop in utilisation", utilisationPct: Math.round(utilisationBase * 0.7), hourly: Math.ceil(hourlyRate / 0.7), monthly: Math.ceil(monthlyRate / 0.7) },
  ];

  // Tax breakdown
  const taxableIncome = grossRevenue - annualExpenses;
  const taxInfo = estimateIncomeTax(taxableIncome);

  // Market comparison
  const marketComparison = MARKET_MEDIANS.map((m) => ({
    ...m,
    position: hourlyRate < m.hourlyMin ? "below" : hourlyRate > m.hourlyMax ? "above" : "within",
  }));

  // Equivalent salary comparison
  // A salaried person with same CTC gets: PF (12%), gratuity (4.8%), insurance, job security
  const equivalentCTC = Math.round(grossRevenue * 0.7); // freelance premium ~30%
  const equivalentMonthlySalary = Math.round(equivalentCTC / 12);

  const headline = `Minimum hourly rate: Rs ${hourlyRate.toLocaleString("en-IN")} | Day rate: Rs ${dayRate.toLocaleString("en-IN")} | Monthly: Rs ${monthlyRate.toLocaleString("en-IN")}. Annual revenue target: Rs ${Math.round(revenueWithBuffer).toLocaleString("en-IN")}. Effective tax: ${taxInfo.effectiveRate}%.`;

  const band = hourlyRate >= 1500 ? "good" : hourlyRate >= 800 ? "warn" : "bad";

  return {
    headline,
    score: {
      label: "Rate Viability",
      value: Math.min(100, Math.round((hourlyRate / 3000) * 100)),
      max: 100,
      band,
    },
    metrics: [
      { label: "Hourly rate", value: `Rs ${hourlyRate.toLocaleString("en-IN")}`, hint: "Minimum viable" },
      { label: "Day rate", value: `Rs ${dayRate.toLocaleString("en-IN")}`, hint: `${billableHours}h billable day` },
      { label: "Monthly target", value: `Rs ${monthlyRate.toLocaleString("en-IN")}`, hint: "Revenue (not take-home)" },
      { label: "Annual target", value: `Rs ${Math.round(revenueWithBuffer).toLocaleString("en-IN")}`, hint: `${billableDaysPerYear} billable days` },
    ],
    sections: [
      {
        title: "Rate Breakdown",
        items: [
          { title: `Annual take-home needed: Rs ${annualTakeHome.toLocaleString("en-IN")}`, body: `Rs ${targetTakeHome.toLocaleString("en-IN")} x 12 months.`, severity: "low" as Severity },
          { title: `Annual expenses: Rs ${annualExpenses.toLocaleString("en-IN")}`, body: `Rs ${Math.round(annualExpenses / 12).toLocaleString("en-IN")}/month for software, internet, insurance, equipment, etc.`, severity: "low" as Severity },
          { title: `Income tax: Rs ${taxInfo.tax.toLocaleString("en-IN")} (${taxInfo.effectiveRate}% effective)`, body: `${taxInfo.regime}. Taxable income: Rs ${Math.round(taxableIncome).toLocaleString("en-IN")} (revenue minus deductible expenses).`, severity: "low" as Severity },
          { title: `Bad-debt buffer: ${badDebtBuffer}% added`, body: `Accounts for late payments, defaults, and unbilled work. Adds Rs ${Math.round(revenueWithBuffer - grossRevenue).toLocaleString("en-IN")} to annual target.`, severity: "low" as Severity },
          { title: `Billable capacity: ${totalBillableHoursPerYear} hours/year`, body: `${billableDaysPerYear} days x ${billableHours} hours. After ${vacationDays} days leave from ${workingDays * 12} total working days.`, severity: "low" as Severity },
        ],
      },
      {
        title: "Utilisation Scenarios",
        items: scenarios.map((s) => ({
          title: `${s.label}: Rs ${s.hourly.toLocaleString("en-IN")}/hr`,
          body: `At ${s.utilisationPct}% utilisation: hourly Rs ${s.hourly.toLocaleString("en-IN")}, monthly Rs ${s.monthly.toLocaleString("en-IN")}.`,
          severity: (s.utilisationPct < 60 ? "high" : s.utilisationPct < 75 ? "medium" : "low") as Severity,
        })),
      },
      {
        title: "Market Comparison (Indian Freelancers)",
        items: marketComparison.filter((_, i) => i < 6).map((m) => ({
          title: `${m.category}: Rs ${m.hourlyMin}-${m.hourlyMax}/hr`,
          body: `Your rate (Rs ${hourlyRate}) is ${m.position} this range. Day rates: Rs ${m.dayMin.toLocaleString("en-IN")}-${m.dayMax.toLocaleString("en-IN")}.`,
          severity: (m.position === "below" ? "high" : m.position === "within" ? "low" : "low") as Severity,
          tag: m.position,
        })),
      },
      {
        title: "GST and Compliance",
        items: [
          { title: gstNote, body: `Annual revenue target: Rs ${Math.round(revenueWithBuffer).toLocaleString("en-IN")}. GST threshold: Rs 20,00,000. ${needsGST ? "Quote rates + 18% GST to clients." : ""}`, severity: (needsGST ? "medium" : "low") as Severity },
          { title: `Equivalent salaried CTC: ~Rs ${equivalentCTC.toLocaleString("en-IN")} per annum`, body: `Freelancing at this rate is equivalent to a salaried position of ~Rs ${equivalentMonthlySalary.toLocaleString("en-IN")}/month CTC (accounting for benefits, job security, and employer contributions you self-fund).`, severity: "low" as Severity },
        ],
      },
      {
        title: "Key Insights",
        items: [
          { title: "Never price below your floor rate", body: `Rs ${hourlyRate.toLocaleString("en-IN")}/hr is your break-even. Below this, you are paying clients to work for them. Premium for urgent/complex work should be 1.5-2x this floor.`, severity: "medium" as Severity },
          { title: "Track actual utilisation monthly", body: `If you consistently bill fewer than ${Math.round(billableDaysPerYear / 12)} days/month, raise your rate or reduce expenses. Most freelancers discover actual utilisation is 60-65%, not the 75-80% they assumed.`, severity: "low" as Severity },
          { title: "Review every 6 months", body: "Expenses grow (inflation, new tools, insurance premiums). If take-home target stays flat while costs rise, your effective income drops. Recalculate rates at minimum twice a year.", severity: "low" as Severity },
        ],
      },
    ],
    table: {
      columns: ["Scenario", "Utilisation", "Hourly Rate", "Day Rate", "Monthly Revenue"],
      rows: scenarios.map((s) => [
        s.label,
        `${s.utilisationPct}%`,
        `Rs ${s.hourly.toLocaleString("en-IN")}`,
        `Rs ${(s.hourly * billableHours).toLocaleString("en-IN")}`,
        `Rs ${s.monthly.toLocaleString("en-IN")}`,
      ]),
    },
    json: {
      inputs: { targetTakeHome, workingDays, billableHours, annualExpenses, vacationDays, badDebtBuffer },
      rates: { hourly: hourlyRate, day: dayRate, monthly: monthlyRate, annual: Math.round(revenueWithBuffer) },
      breakdown: { annualTakeHome, annualExpenses, incomeTax: taxInfo.tax, effectiveTaxRate: taxInfo.effectiveRate, badDebtAmount: Math.round(revenueWithBuffer - grossRevenue), totalBillableHours: totalBillableHoursPerYear, billableDaysPerYear },
      scenarios,
      gst: { required: needsGST, threshold: 2000000, note: gstNote },
      equivalentSalaryCTC: equivalentCTC,
    },
  };
}
