import type { RunInput, RunResult, Severity } from "./types.ts";

/**
 * SchoolFee engine - Compares up to 3 schools by true total cost, projects through
 * graduation with inflation, computes monthly outflow, flags hidden costs, and shows
 * investment value of fee differences.
 */

type SchoolData = {
  name: string;
  tuition: number;
  devFee: number;
  activityFee: number;
  transport: number;
  uniform: number;
  books: number;
  admissionFee: number;
  trueAnnualCost: number;
  admissionAmortised: number;
  effectiveAnnual: number;
  monthlyOutflow: number;
  projectedTotal: number;
  yearlyProjection: number[];
};

function parseFees(raw: string): number[] | null {
  if (!raw || raw.trim() === "") return null;
  const parts = raw.split(/[,;]/).map((s) => {
    const cleaned = s.trim().replace(/[₹Rs.\s]/gi, "").replace(/,/g, "");
    return Number(cleaned);
  });
  if (parts.some((n) => !Number.isFinite(n) || n < 0)) return null;
  if (parts.length < 6) return null;
  return parts;
}

function formatInr(amount: number): string {
  if (amount >= 10_000_000) return `Rs ${(amount / 10_000_000).toFixed(2)} Cr`;
  if (amount >= 100_000) return `Rs ${(amount / 100_000).toFixed(2)} L`;
  return `Rs ${Math.round(amount).toLocaleString("en-IN")}`;
}

export function run(input: RunInput): RunResult {
  const school1Raw = (input.school1 ?? "").trim();
  const school2Raw = (input.school2 ?? "").trim();
  const school3Raw = (input.school3 ?? "").trim();
  const school1Name = (input.school1Name ?? "").trim() || "School A";
  const school2Name = (input.school2Name ?? "").trim() || "School B";
  const school3Name = (input.school3Name ?? "").trim() || "School C";
  const currentClass = Number(input.currentClass) || 1;
  const yearsRemaining = Number(input.yearsRemaining) || 10;
  const inflationRate = (Number(input.inflationRate) || 9) / 100;

  if (!school1Raw) throw new Error("Enter fee details for at least School 1. Format: tuition, dev fee, activity fee, transport, uniform, books, admission fee (all in Rs).");
  if (!school2Raw) throw new Error("Enter fee details for School 2 to compare. Format: tuition, dev fee, activity fee, transport, uniform, books, admission fee.");

  const fees1 = parseFees(school1Raw);
  const fees2 = parseFees(school2Raw);
  const fees3 = school3Raw ? parseFees(school3Raw) : null;

  if (!fees1) throw new Error("School 1 fees could not be parsed. Enter 7 numbers separated by commas: tuition, dev fee, activity, transport, uniform, books, admission fee.");
  if (!fees2) throw new Error("School 2 fees could not be parsed. Enter 7 numbers separated by commas: tuition, dev fee, activity, transport, uniform, books, admission fee.");
  if (school3Raw && !fees3) throw new Error("School 3 fees could not be parsed. Enter 7 numbers separated by commas or leave blank.");

  if (yearsRemaining < 1 || yearsRemaining > 15) throw new Error("Years remaining should be between 1 and 15.");

  function buildSchoolData(name: string, fees: number[]): SchoolData {
    const [tuition, devFee, activityFee, transport, uniform, books, admissionFee] = fees;

    // True annual cost (recurring fees only)
    const trueAnnualCost = tuition + devFee + activityFee + transport + uniform + books;

    // Amortise admission fee across remaining years
    const admissionAmortised = admissionFee / yearsRemaining;

    // Effective annual cost including amortised one-time fees
    const effectiveAnnual = trueAnnualCost + admissionAmortised;

    // Monthly outflow
    const monthlyOutflow = effectiveAnnual / 12;

    // Project costs with inflation
    const yearlyProjection: number[] = [];
    let projectedTotal = admissionFee; // One-time fee paid upfront
    for (let y = 0; y < yearsRemaining; y++) {
      const yearCost = trueAnnualCost * Math.pow(1 + inflationRate, y);
      yearlyProjection.push(Math.round(yearCost));
      projectedTotal += yearCost;
    }

    return {
      name,
      tuition,
      devFee,
      activityFee,
      transport,
      uniform,
      books,
      admissionFee,
      trueAnnualCost,
      admissionAmortised: Math.round(admissionAmortised),
      effectiveAnnual: Math.round(effectiveAnnual),
      monthlyOutflow: Math.round(monthlyOutflow),
      projectedTotal: Math.round(projectedTotal),
      yearlyProjection,
    };
  }

  const schools: SchoolData[] = [
    buildSchoolData(school1Name, fees1),
    buildSchoolData(school2Name, fees2),
  ];
  if (fees3) schools.push(buildSchoolData(school3Name, fees3));

  // Rank by projected total cost
  const ranked = [...schools].sort((a, b) => a.projectedTotal - b.projectedTotal);
  const cheapest = ranked[0];
  const mostExpensive = ranked[ranked.length - 1];

  // Investment value of fee difference
  const annualDifference = mostExpensive.trueAnnualCost - cheapest.trueAnnualCost;
  const investmentReturn = 0.12; // 12% equity returns
  const conservativeReturn = 0.08; // 8% FD returns

  // Future value of annual savings invested at returnRate over yearsRemaining
  function futureValueOfAnnuity(annualAmount: number, rate: number, years: number): number {
    if (rate === 0) return annualAmount * years;
    return annualAmount * ((Math.pow(1 + rate, years) - 1) / rate);
  }

  const investmentGrowthEquity = futureValueOfAnnuity(annualDifference, investmentReturn, yearsRemaining);
  const investmentGrowthFD = futureValueOfAnnuity(annualDifference, conservativeReturn, yearsRemaining);

  // Hidden cost flags
  const hiddenCosts: { title: string; body: string; severity: Severity }[] = [];

  for (const school of schools) {
    // Flag high admission fees
    if (school.admissionFee > school.trueAnnualCost * 0.5) {
      hiddenCosts.push({
        title: `${school.name}: High admission fee (${formatInr(school.admissionFee)})`,
        body: `Admission fee is ${Math.round((school.admissionFee / school.trueAnnualCost) * 100)}% of annual fees. Ask if any portion is refundable as security deposit. Non-refundable admission fees above 50% of annual cost are a red flag.`,
        severity: "medium",
      });
    }

    // Flag when non-tuition fees exceed tuition
    const nonTuition = school.devFee + school.activityFee + school.transport + school.uniform + school.books;
    if (nonTuition > school.tuition) {
      hiddenCosts.push({
        title: `${school.name}: Non-tuition fees exceed tuition`,
        body: `Tuition is ${formatInr(school.tuition)} but other fees total ${formatInr(nonTuition)}. The "fee" quoted to parents is often just tuition. True cost is ${formatInr(school.trueAnnualCost)}.`,
        severity: "high",
      });
    }

    // Flag high transport cost
    if (school.transport > school.trueAnnualCost * 0.2) {
      hiddenCosts.push({
        title: `${school.name}: Transport is ${Math.round((school.transport / school.trueAnnualCost) * 100)}% of total`,
        body: `At ${formatInr(school.transport)}/year, school transport is a significant cost. Consider carpooling or self-drop if feasible. Transport fees often increase faster than tuition.`,
        severity: "low",
      });
    }
  }

  // Late fee warning (generic)
  hiddenCosts.push({
    title: "Late payment penalties (all schools)",
    body: "Most schools charge 1.5-2% per month on overdue fees. On a Rs 2L annual bill, a 3-month delay costs Rs 9,000-12,000 in penalties. Always pay on time or negotiate installment plans upfront.",
    severity: "low",
  });

  // Opportunity cost of refundable deposits
  const maxAdmission = Math.max(...schools.map((s) => s.admissionFee));
  if (maxAdmission > 50000) {
    const opportunityCost = maxAdmission * Math.pow(1 + investmentReturn, yearsRemaining) - maxAdmission;
    hiddenCosts.push({
      title: `Opportunity cost of deposits`,
      body: `If ${formatInr(maxAdmission)} is locked as a refundable deposit for ${yearsRemaining} years, the opportunity cost at 12% returns is ${formatInr(Math.round(opportunityCost))}. Ask schools clearly: what is refundable vs non-refundable.`,
      severity: "low",
    });
  }

  // --- Build result ---
  const pctDiff = cheapest.projectedTotal > 0
    ? Math.round(((mostExpensive.projectedTotal - cheapest.projectedTotal) / cheapest.projectedTotal) * 100)
    : 0;

  const headline = `${cheapest.name} is the most affordable: ${formatInr(cheapest.projectedTotal)} total over ${yearsRemaining} years. ${mostExpensive.name} costs ${formatInr(mostExpensive.projectedTotal)} (${pctDiff}% more). The annual difference of ${formatInr(annualDifference)} invested would grow to ${formatInr(Math.round(investmentGrowthEquity))}.`;

  return {
    headline,
    score: {
      label: "Savings potential",
      value: Math.min(100, Math.round((annualDifference / cheapest.trueAnnualCost) * 50)),
      max: 100,
      band: pctDiff > 40 ? "bad" : pctDiff > 20 ? "warn" : "good",
    },
    metrics: [
      { label: "Cheapest total", value: formatInr(cheapest.projectedTotal), hint: cheapest.name },
      { label: "Most expensive", value: formatInr(mostExpensive.projectedTotal), hint: mostExpensive.name },
      { label: "Annual difference", value: formatInr(annualDifference), hint: "per year gap" },
      { label: "Investment value", value: formatInr(Math.round(investmentGrowthEquity)), hint: `${yearsRemaining}yr @ 12%` },
    ],
    table: {
      columns: ["Item", ...schools.map((s) => s.name)],
      rows: [
        ["Tuition", ...schools.map((s) => formatInr(s.tuition))],
        ["Development Fee", ...schools.map((s) => formatInr(s.devFee))],
        ["Activity Fee", ...schools.map((s) => formatInr(s.activityFee))],
        ["Transport", ...schools.map((s) => formatInr(s.transport))],
        ["Uniform", ...schools.map((s) => formatInr(s.uniform))],
        ["Books", ...schools.map((s) => formatInr(s.books))],
        ["Admission (one-time)", ...schools.map((s) => formatInr(s.admissionFee))],
        ["---", ...schools.map(() => "---")],
        ["TRUE Annual Cost", ...schools.map((s) => formatInr(s.trueAnnualCost))],
        ["Effective Annual (with admission)", ...schools.map((s) => formatInr(s.effectiveAnnual))],
        ["Monthly Outflow", ...schools.map((s) => formatInr(s.monthlyOutflow))],
        [`Total (${yearsRemaining} years with ${Math.round(inflationRate * 100)}% inflation)`, ...schools.map((s) => formatInr(s.projectedTotal))],
      ],
    },
    sections: [
      {
        title: "Ranking (by total projected cost)",
        items: ranked.map((s, i) => ({
          title: `#${i + 1}: ${s.name} - ${formatInr(s.projectedTotal)} over ${yearsRemaining} years`,
          body: `True annual cost today: ${formatInr(s.trueAnnualCost)}. Monthly outflow: ${formatInr(s.monthlyOutflow)}. By Class 12, annual fee will be ~${formatInr(s.yearlyProjection[s.yearlyProjection.length - 1])}.`,
          severity: (i === 0 ? "low" : i === ranked.length - 1 ? "high" : "medium") as Severity,
        })),
      },
      {
        title: "Fee Projection (year by year)",
        items: ranked.map((s) => ({
          title: `${s.name}: Year 1 ${formatInr(s.yearlyProjection[0])} -> Year ${yearsRemaining} ${formatInr(s.yearlyProjection[yearsRemaining - 1])}`,
          body: `At ${Math.round(inflationRate * 100)}% annual increase, fees grow from ${formatInr(s.yearlyProjection[0])} to ${formatInr(s.yearlyProjection[yearsRemaining - 1])} by the final year. Total expenditure: ${formatInr(s.projectedTotal)}.`,
          severity: "low" as Severity,
        })),
      },
      {
        title: "Investment Value of Fee Difference",
        items: [
          {
            title: `${formatInr(annualDifference)}/year saved = ${formatInr(Math.round(investmentGrowthEquity))} in ${yearsRemaining} years`,
            body: `If you choose ${cheapest.name} over ${mostExpensive.name} and invest the ${formatInr(annualDifference)} annual difference in an equity index fund at 12%, it grows to ${formatInr(Math.round(investmentGrowthEquity))}. Conservative (8% FD): ${formatInr(Math.round(investmentGrowthFD))}. This could fund college.`,
            severity: "low" as Severity,
          },
        ],
      },
      {
        title: "Hidden Cost Flags",
        items: hiddenCosts,
      },
      {
        title: "Monthly Budget Impact",
        items: schools.map((s) => ({
          title: `${s.name}: ${formatInr(s.monthlyOutflow)}/month`,
          body: `Annual ${formatInr(s.effectiveAnnual)} divided into 12 months. This is what you need to set aside monthly to cover all school expenses including amortised admission fee.`,
          severity: "low" as Severity,
        })),
      },
    ],
    json: {
      schools: schools.map((s) => ({
        name: s.name,
        trueAnnualCost: s.trueAnnualCost,
        effectiveAnnual: s.effectiveAnnual,
        monthlyOutflow: s.monthlyOutflow,
        projectedTotal: s.projectedTotal,
        admissionFee: s.admissionFee,
        admissionAmortised: s.admissionAmortised,
        yearlyProjection: s.yearlyProjection,
        breakdown: {
          tuition: s.tuition,
          devFee: s.devFee,
          activityFee: s.activityFee,
          transport: s.transport,
          uniform: s.uniform,
          books: s.books,
        },
      })),
      ranking: ranked.map((s) => s.name),
      comparison: {
        annualDifference,
        totalDifference: mostExpensive.projectedTotal - cheapest.projectedTotal,
        pctDifference: pctDiff,
        investmentGrowthEquity: Math.round(investmentGrowthEquity),
        investmentGrowthFD: Math.round(investmentGrowthFD),
      },
      parameters: {
        currentClass,
        yearsRemaining,
        inflationRate: Math.round(inflationRate * 100),
        investmentRate: 12,
      },
    },
  };
}
