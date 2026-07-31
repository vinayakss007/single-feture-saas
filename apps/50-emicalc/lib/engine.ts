import type { RunInput, RunResult, Severity } from "./types.ts";

type LoanOffer = { label: string; principal: number; rate: number; tenureYears: number; processingFee: number; insurance: number };
type LoanResult = LoanOffer & { emi: number; totalInterest: number; totalOutflow: number; effectiveAPR: number; prepaymentSavings: number; tenureReductionMonths: number };

function computeEMI(principal: number, annualRate: number, tenureMonths: number): number {
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / tenureMonths;
  return principal * r * Math.pow(1 + r, tenureMonths) / (Math.pow(1 + r, tenureMonths) - 1);
}

function computeTotalInterest(emi: number, tenureMonths: number, principal: number): number {
  return emi * tenureMonths - principal;
}

function computeEffectiveAPR(principal: number, emi: number, tenureMonths: number, fees: number): number {
  // Newton's method to find rate where PV of EMI payments = principal - fees
  const netDisbursement = principal - fees;
  let rate = 0.007; // initial guess ~8.4% annual
  for (let i = 0; i < 50; i++) {
    let pv = 0;
    let pvDeriv = 0;
    for (let m = 1; m <= tenureMonths; m++) {
      const discount = Math.pow(1 + rate, -m);
      pv += emi * discount;
      pvDeriv += -m * emi * Math.pow(1 + rate, -(m + 1));
    }
    const f = pv - netDisbursement;
    const fPrime = pvDeriv;
    if (Math.abs(fPrime) < 1e-10) break;
    rate = rate - f / fPrime;
    if (Math.abs(f) < 1) break;
  }
  return Math.round(rate * 12 * 10000) / 100; // annual rate as percentage with 2 decimals
}

function computePrepaymentSavings(principal: number, annualRate: number, tenureMonths: number, emi: number, prepayAmount: number, prepayMonth: number): { saved: number; monthsReduced: number } {
  // Simulate amortization with prepayment
  const r = annualRate / 12 / 100;
  let balance = principal;
  let totalPaidWithout = emi * tenureMonths;

  // With prepayment: simulate month by month
  let totalPaidWith = 0;
  let monthsWith = 0;
  let balanceWith = principal;
  for (let m = 1; m <= tenureMonths * 2; m++) {
    if (balanceWith <= 0) break;
    const interest = balanceWith * r;
    const principalPaid = Math.min(balanceWith, emi - interest);
    balanceWith -= principalPaid;
    totalPaidWith += emi;
    monthsWith = m;
    // Apply prepayment at the specified month
    if (m === prepayMonth) {
      balanceWith -= Math.min(prepayAmount, balanceWith);
    }
    if (balanceWith <= 0) break;
  }

  const saved = totalPaidWithout - totalPaidWith;
  const monthsReduced = tenureMonths - monthsWith;
  return { saved: Math.max(0, Math.round(saved)), monthsReduced: Math.max(0, monthsReduced) };
}

function parseOffers(raw: string): LoanOffer[] {
  const lines = raw.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const offers: LoanOffer[] = [];
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const parts = lines[i].split(",").map((p) => p.trim());
    if (parts.length < 3) continue;
    offers.push({
      label: `Offer ${String.fromCharCode(65 + i)}`,
      principal: Number(parts[0]) || 0,
      rate: Number(parts[1]) || 0,
      tenureYears: Number(parts[2]) || 0,
      processingFee: Number(parts[3]) || 0,
      insurance: Number(parts[4]) || 0,
    });
  }
  return offers;
}

export function run(input: RunInput): RunResult {
  const offersRaw = (input.offers ?? "").trim();
  if (!offersRaw) throw new Error("Enter at least one loan offer: principal,rate%,tenure_years,processing_fee,insurance per line.");

  const offers = parseOffers(offersRaw);
  if (offers.length === 0) throw new Error("Could not parse any offers. Format: principal,rate,tenure_years,processing_fee,insurance per line.");

  for (const o of offers) {
    if (o.principal <= 0) throw new Error(`${o.label}: Principal must be positive.`);
    if (o.rate <= 0 || o.rate > 30) throw new Error(`${o.label}: Interest rate should be 0.1-30%.`);
    if (o.tenureYears <= 0 || o.tenureYears > 30) throw new Error(`${o.label}: Tenure should be 1-30 years.`);
  }

  const results: LoanResult[] = offers.map((o) => {
    const tenureMonths = o.tenureYears * 12;
    const emi = Math.round(computeEMI(o.principal, o.rate, tenureMonths));
    const totalInterest = Math.round(computeTotalInterest(emi, tenureMonths, o.principal));
    const totalOutflow = o.principal + totalInterest + o.processingFee + o.insurance;
    const effectiveAPR = computeEffectiveAPR(o.principal, emi, tenureMonths, o.processingFee + o.insurance);
    // Prepayment: 5% of principal in month 24 (year 2)
    const prepayAmount = Math.round(o.principal * 0.05);
    const { saved, monthsReduced } = computePrepaymentSavings(o.principal, o.rate, tenureMonths, emi, prepayAmount, 24);
    return { ...o, emi, totalInterest, totalOutflow, effectiveAPR, prepaymentSavings: saved, tenureReductionMonths: monthsReduced };
  });

  // Rank by total outflow
  const ranked = [...results].sort((a, b) => a.totalOutflow - b.totalOutflow);
  const cheapest = ranked[0];
  const mostExpensive = ranked[ranked.length - 1];
  const savings = mostExpensive.totalOutflow - cheapest.totalOutflow;

  // Check if lower rate lost due to fees
  const feesFlip = results.length >= 2 && results.some((r, i) => {
    return results.some((other, j) => i !== j && r.rate < other.rate && r.totalOutflow > other.totalOutflow);
  });

  // Best prepayment offer
  const bestPrepay = [...results].sort((a, b) => b.prepaymentSavings - a.prepaymentSavings)[0];

  const headline = `${results.length} offers compared. Cheapest: ${cheapest.label} (total Rs ${cheapest.totalOutflow.toLocaleString("en-IN")}). ${results.length > 1 ? `Saves Rs ${savings.toLocaleString("en-IN")} vs most expensive.` : ""} ${feesFlip ? "NOTE: Lower rate lost to lower fees on another offer." : ""}`;

  return {
    headline,
    score: { label: "Savings", value: Math.min(100, Math.round((savings / Math.max(1, mostExpensive.totalOutflow)) * 100 * 5)), max: 100, band: savings > 100000 ? "good" : savings > 0 ? "warn" : "good" },
    metrics: [
      { label: "Cheapest", value: cheapest.label, hint: `Rs ${cheapest.totalOutflow.toLocaleString("en-IN")} total` },
      { label: "Savings vs worst", value: `Rs ${savings.toLocaleString("en-IN")}`, hint: `${results.length > 1 ? mostExpensive.label + " is most expensive" : "Only one offer"}` },
      { label: "Best for prepayment", value: bestPrepay.label, hint: `Saves Rs ${bestPrepay.prepaymentSavings.toLocaleString("en-IN")} with 5% prepay` },
      { label: "Rate range", value: `${Math.min(...results.map((r) => r.rate))}-${Math.max(...results.map((r) => r.rate))}%`, hint: "Nominal rates" },
    ],
    sections: [
      {
        title: "Offer Comparison (Ranked by Total Cost)",
        items: ranked.map((r, i) => ({
          title: `#${i + 1} ${r.label}: Rs ${r.totalOutflow.toLocaleString("en-IN")} total outflow`,
          body: `EMI: Rs ${r.emi.toLocaleString("en-IN")} | Rate: ${r.rate}% | Tenure: ${r.tenureYears}y | Interest: Rs ${r.totalInterest.toLocaleString("en-IN")} | Fees: Rs ${(r.processingFee + r.insurance).toLocaleString("en-IN")} | Effective APR: ${r.effectiveAPR}%`,
          severity: (i === 0 ? "low" : i === ranked.length - 1 ? "high" : "medium") as Severity,
          tag: i === 0 ? "cheapest" : i === ranked.length - 1 ? "expensive" : "",
        })),
      },
      {
        title: "Prepayment Analysis (5% of Principal in Year 2)",
        items: results.map((r) => ({
          title: `${r.label}: Prepay Rs ${Math.round(r.principal * 0.05).toLocaleString("en-IN")} in year 2`,
          body: `Saves Rs ${r.prepaymentSavings.toLocaleString("en-IN")} in interest. Reduces tenure by ~${r.tenureReductionMonths} months. Effective return: ${r.prepaymentSavings > 0 ? Math.round((r.prepaymentSavings / (r.principal * 0.05)) * 100) : 0}% on the prepaid amount over remaining tenure.`,
          severity: "low" as Severity,
        })),
      },
      ...(feesFlip ? [{
        title: "Fee vs Rate Alert",
        items: [{ title: "Lower rate does NOT always mean cheaper loan", body: "In this comparison, an offer with lower interest rate has higher total cost due to processing fees and insurance. On shorter tenures and smaller amounts, fees matter more than small rate differences.", severity: "high" as Severity }],
      }] : []),
      {
        title: "Key Insight",
        items: [
          { title: `Difference between cheapest and most expensive: Rs ${savings.toLocaleString("en-IN")}`, body: `That is Rs ${Math.round(savings / (cheapest.tenureYears * 12)).toLocaleString("en-IN")} per month averaged over the tenure. The EMI difference is deceptive because tenure and fees distort the comparison.`, severity: "medium" as Severity },
          { title: "Always compare TOTAL OUTFLOW, never just EMI", body: "EMI is what you pay monthly. Total outflow is what the loan actually costs you. A lower EMI often means longer tenure which means more total interest.", severity: "low" as Severity },
        ],
      },
    ],
    table: {
      columns: ["Offer", "Rate %", "Tenure", "EMI", "Total Interest", "Fees", "Total Outflow", "Eff. APR"],
      rows: ranked.map((r) => [
        r.label,
        `${r.rate}%`,
        `${r.tenureYears}y`,
        `Rs ${r.emi.toLocaleString("en-IN")}`,
        `Rs ${r.totalInterest.toLocaleString("en-IN")}`,
        `Rs ${(r.processingFee + r.insurance).toLocaleString("en-IN")}`,
        `Rs ${r.totalOutflow.toLocaleString("en-IN")}`,
        `${r.effectiveAPR}%`,
      ]),
    },
    json: {
      offers: results.map((r) => ({
        label: r.label, principal: r.principal, rate: r.rate, tenureYears: r.tenureYears,
        emi: r.emi, totalInterest: r.totalInterest, totalOutflow: r.totalOutflow,
        effectiveAPR: r.effectiveAPR, processingFee: r.processingFee, insurance: r.insurance,
        prepaymentSavings: r.prepaymentSavings, tenureReductionMonths: r.tenureReductionMonths,
      })),
      ranking: ranked.map((r) => r.label),
      cheapest: cheapest.label,
      savingsVsWorst: savings,
      feesFlippedRanking: feesFlip,
      bestForPrepayment: bestPrepay.label,
    },
  };
}
