import type { RunInput, RunResult, Severity } from "./types.ts";

/**
 * CarCost engine - Computes true 5-year ownership cost of a car in India
 * including on-road price, running costs, loan interest, and depreciation.
 */

// Road tax rates by state (% of ex-showroom for petrol cars < 20L)
const ROAD_TAX_RATES: Record<string, { petrol: number; diesel: number; ev: number }> = {
  "Maharashtra": { petrol: 0.11, diesel: 0.13, ev: 0.05 },
  "Delhi": { petrol: 0.07, diesel: 0.085, ev: 0.0 },
  "Karnataka": { petrol: 0.13, diesel: 0.14, ev: 0.04 },
  "Tamil Nadu": { petrol: 0.10, diesel: 0.10, ev: 0.0 },
  "Telangana": { petrol: 0.13, diesel: 0.14, ev: 0.05 },
  "Gujarat": { petrol: 0.07, diesel: 0.07, ev: 0.02 },
  "Uttar Pradesh": { petrol: 0.08, diesel: 0.09, ev: 0.0 },
  "Rajasthan": { petrol: 0.08, diesel: 0.10, ev: 0.03 },
  "Kerala": { petrol: 0.17, diesel: 0.20, ev: 0.05 },
  "Haryana": { petrol: 0.06, diesel: 0.07, ev: 0.0 },
  "West Bengal": { petrol: 0.10, diesel: 0.12, ev: 0.04 },
  "Madhya Pradesh": { petrol: 0.08, diesel: 0.10, ev: 0.0 },
  "Punjab": { petrol: 0.09, diesel: 0.10, ev: 0.02 },
  "Andhra Pradesh": { petrol: 0.12, diesel: 0.14, ev: 0.04 },
  "Bihar": { petrol: 0.09, diesel: 0.10, ev: 0.03 },
};

// Fuel prices per litre/kg/kWh by state (approximate average)
const FUEL_PRICES: Record<string, { petrol: number; diesel: number; cng: number; electric: number }> = {
  "Maharashtra": { petrol: 106, diesel: 92, cng: 80, electric: 8 },
  "Delhi": { petrol: 96, diesel: 89, cng: 75, electric: 7.5 },
  "Karnataka": { petrol: 102, diesel: 88, cng: 78, electric: 7 },
  "Tamil Nadu": { petrol: 102, diesel: 94, cng: 82, electric: 6.5 },
  "Telangana": { petrol: 109, diesel: 96, cng: 80, electric: 7 },
  "Gujarat": { petrol: 96, diesel: 92, cng: 72, electric: 6 },
  "Uttar Pradesh": { petrol: 96, diesel: 89, cng: 76, electric: 7 },
  "Rajasthan": { petrol: 105, diesel: 93, cng: 80, electric: 7.5 },
  "Kerala": { petrol: 107, diesel: 96, cng: 85, electric: 7 },
  "Haryana": { petrol: 97, diesel: 90, cng: 76, electric: 6.5 },
  "West Bengal": { petrol: 105, diesel: 92, cng: 78, electric: 7.5 },
  "Madhya Pradesh": { petrol: 108, diesel: 95, cng: 80, electric: 7 },
  "Punjab": { petrol: 96, diesel: 89, cng: 75, electric: 6.5 },
  "Andhra Pradesh": { petrol: 109, diesel: 95, cng: 80, electric: 7 },
  "Bihar": { petrol: 107, diesel: 94, cng: 78, electric: 7.5 },
};

// Default mileage by fuel type and price segment
function estimateMileage(fuelType: string, exShowroom: number): number {
  const segment = exShowroom <= 800000 ? "budget" : exShowroom <= 1500000 ? "mid" : "premium";
  const map: Record<string, Record<string, number>> = {
    "Petrol": { budget: 18, mid: 14, premium: 10 },
    "Diesel": { budget: 22, mid: 18, premium: 14 },
    "CNG": { budget: 24, mid: 20, premium: 16 },
    "Electric": { budget: 8, mid: 6.5, premium: 5 }, // km per kWh
  };
  return map[fuelType]?.[segment] ?? 14;
}

// Depreciation schedule (cumulative % lost by end of year)
const DEPRECIATION_YEARLY = [0.35, 0.50, 0.60, 0.68, 0.75]; // end of year 1-5

// Service cost per year (approximate for mainstream cars)
function annualServiceCost(exShowroom: number, fuelType: string, year: number): number {
  const base = exShowroom <= 800000 ? 8000 : exShowroom <= 1500000 ? 12000 : 18000;
  // Diesel has higher service cost; EV lower
  const fuelMultiplier = fuelType === "Diesel" ? 1.2 : fuelType === "Electric" ? 0.4 : fuelType === "CNG" ? 1.1 : 1.0;
  // Service costs increase with age
  const ageMultiplier = 1 + (year - 1) * 0.15;
  return Math.round(base * fuelMultiplier * ageMultiplier);
}

// Insurance IDV computation (20% annual depreciation on IDV)
function insurancePremium(onRoadPrice: number, year: number, isComprehensive: boolean, fuelType: string): number {
  // IDV depreciates 15-20% per year
  const idvDepreciation = [1.0, 0.80, 0.65, 0.55, 0.45, 0.38];
  const idv = onRoadPrice * (idvDepreciation[year] ?? 0.38);

  // Third party is flat (mandatory)
  const thirdParty = fuelType === "Electric" ? 2500 : onRoadPrice <= 750000 ? 2094 : onRoadPrice <= 1500000 ? 3416 : 7897;

  if (!isComprehensive) return thirdParty;

  // OD premium: ~2.5-3.5% of IDV for year 1, lower for renewals
  const odRate = year === 0 ? 0.03 : 0.028;
  const odPremium = idv * odRate;

  // NCB discount after claim-free years (20%, 25%, 35%, 45%, 50%)
  const ncbRates = [0, 0.20, 0.25, 0.35, 0.45, 0.50];
  const ncbDiscount = ncbRates[Math.min(year, 5)] ?? 0.50;

  const premium = odPremium * (1 - ncbDiscount) + thirdParty;
  return Math.round(premium);
}

function formatInr(amount: number): string {
  if (amount >= 10_000_000) return `Rs ${(amount / 10_000_000).toFixed(2)} Cr`;
  if (amount >= 100_000) return `Rs ${(amount / 100_000).toFixed(2)} L`;
  return `Rs ${Math.round(amount).toLocaleString("en-IN")}`;
}

function computeEMI(principal: number, annualRate: number, tenureYears: number): { emi: number; totalInterest: number; totalPayment: number } {
  if (principal === 0 || annualRate === 0 || tenureYears === 0) {
    return { emi: 0, totalInterest: 0, totalPayment: 0 };
  }
  const monthlyRate = annualRate / 12 / 100;
  const months = tenureYears * 12;
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;
  return { emi: Math.round(emi), totalInterest: Math.round(totalInterest), totalPayment: Math.round(totalPayment) };
}

export function run(input: RunInput): RunResult {
  const exShowroom = Number((input.exShowroom ?? "").replace(/[,\s]/g, ""));
  const state = (input.state ?? "").trim();
  const fuelType = (input.fuelType ?? "").trim();
  const monthlyKm = Number(input.monthlyKm ?? "0");
  const userMileage = input.mileage ? Number(input.mileage) : 0;
  const loanPct = Number(input.loanAmount ?? "0") / 100;
  const loanTenure = Number(input.loanTenure ?? "5");
  const loanRate = Number(input.loanRate ?? "9");
  const isComprehensive = (input.insuranceType ?? "").includes("Comprehensive");

  if (!exShowroom || exShowroom < 100000) throw new Error("Enter the ex-showroom price in rupees (e.g., 1200000 for Rs 12 lakh). Minimum Rs 1 lakh.");
  if (exShowroom > 100000000) throw new Error("Ex-showroom price seems too high. Enter in rupees without commas (e.g., 1200000 for Rs 12 lakh).");
  if (!state) throw new Error("Select your registration state. Road tax varies from 4% to 20% depending on state.");
  if (!fuelType) throw new Error("Select fuel type: Petrol, Diesel, CNG, or Electric.");
  if (!monthlyKm || monthlyKm < 100) throw new Error("Enter expected monthly driving in km (e.g., 1500 for typical urban+highway mix).");
  if (monthlyKm > 10000) throw new Error("Monthly km above 10,000 is unusual for personal vehicles. Please verify.");

  const taxes = ROAD_TAX_RATES[state] || ROAD_TAX_RATES["Maharashtra"];
  const fuelPrices = FUEL_PRICES[state] || FUEL_PRICES["Maharashtra"];

  // --- On-road price computation ---
  const roadTaxRate = fuelType === "Electric" ? taxes.ev : fuelType === "Diesel" ? taxes.diesel : taxes.petrol;
  const roadTax = Math.round(exShowroom * roadTaxRate);
  const registration = exShowroom <= 1000000 ? 3000 : exShowroom <= 2000000 ? 5000 : 10000;
  const tcs = exShowroom > 1000000 ? Math.round(exShowroom * 0.01) : 0; // 1% TCS above 10L
  const logistics = 5000;
  const accessories = Math.round(exShowroom * 0.02); // ~2% standard accessories

  // First year insurance
  const firstYearInsurance = insurancePremium(exShowroom, 0, isComprehensive, fuelType);

  const onRoadPrice = exShowroom + roadTax + registration + tcs + logistics + accessories + firstYearInsurance;

  // --- Loan computation ---
  const loanPrincipal = Math.round(onRoadPrice * loanPct);
  const downPayment = onRoadPrice - loanPrincipal;
  const loan = computeEMI(loanPrincipal, loanRate, loanTenure);

  // --- Running costs (5 years) ---
  const mileage = userMileage > 0 ? userMileage : estimateMileage(fuelType, exShowroom);
  const fuelPrice = fuelType === "Petrol" ? fuelPrices.petrol
    : fuelType === "Diesel" ? fuelPrices.diesel
    : fuelType === "CNG" ? fuelPrices.cng
    : fuelPrices.electric;

  // Monthly fuel cost
  const monthlyFuel = Math.round((monthlyKm / mileage) * fuelPrice);
  const annualFuel = monthlyFuel * 12;

  // 5-year running breakdown
  let totalRunning = 0;
  let totalInsurance = 0;
  let totalService = 0;
  const yearlyBreakdown: { year: number; fuel: number; insurance: number; service: number; tyres: number; total: number }[] = [];

  for (let year = 1; year <= 5; year++) {
    const fuel = Math.round(annualFuel * (1 + (year - 1) * 0.05)); // 5% fuel price increase/year
    const insurance = insurancePremium(onRoadPrice, year, isComprehensive, fuelType);
    const service = annualServiceCost(exShowroom, fuelType, year);
    const tyres = (year === 3 || year === 5) ? (exShowroom <= 1000000 ? 16000 : exShowroom <= 2000000 ? 24000 : 40000) : 0;
    const yearTotal = fuel + insurance + service + tyres;

    yearlyBreakdown.push({ year, fuel, insurance, service, tyres, total: yearTotal });
    totalRunning += yearTotal;
    totalInsurance += insurance;
    totalService += service;
  }

  const totalFuel5yr = yearlyBreakdown.reduce((s, y) => s + y.fuel, 0);
  const totalTyres5yr = yearlyBreakdown.reduce((s, y) => s + y.tyres, 0);

  // --- Depreciation ---
  const resaleValue = Math.round(exShowroom * (1 - DEPRECIATION_YEARLY[4]));
  const depreciationLoss = exShowroom - resaleValue;

  // --- Total 5-year cost ---
  const totalOwnershipCost = onRoadPrice + totalRunning + loan.totalInterest - resaleValue;
  const totalKm = monthlyKm * 12 * 5;
  const costPerKm = totalOwnershipCost / totalKm;

  // --- What you think vs what it actually costs ---
  const perceivedMonthlyCost = loan.emi || Math.round(onRoadPrice / 60); // EMI or equivalent if cash
  const actualMonthlyCost = Math.round((totalOwnershipCost) / 60);

  // --- Petrol vs Diesel breakeven (if applicable) ---
  let breakeven: { monthlyKm: number; note: string } | null = null;
  if (fuelType === "Petrol" || fuelType === "Diesel") {
    const dieselPremium = exShowroom * 0.12; // ~1.2-1.5L more for diesel variant
    const petrolCostPerKm = fuelPrices.petrol / estimateMileage("Petrol", exShowroom);
    const dieselCostPerKm = fuelPrices.diesel / estimateMileage("Diesel", exShowroom);
    const savingPerKm = petrolCostPerKm - dieselCostPerKm;
    if (savingPerKm > 0) {
      const breakevenKm = dieselPremium / savingPerKm;
      const breakevenMonthlyKm = Math.round(breakevenKm / 60); // over 5 years
      breakeven = {
        monthlyKm: breakevenMonthlyKm,
        note: `Diesel variant costs ~${formatInr(dieselPremium)} more upfront. At current fuel prices, diesel saves Rs ${(savingPerKm).toFixed(1)}/km. You need ${breakevenMonthlyKm} km/month to break even in 5 years.${monthlyKm >= breakevenMonthlyKm ? " Your usage justifies diesel." : " At your usage, petrol is cheaper overall."}`,
      };
    }
  }

  const headline = `True 5-year cost: ${formatInr(totalOwnershipCost)}. On-road: ${formatInr(onRoadPrice)} (${formatInr(onRoadPrice - exShowroom)} above ex-showroom). Monthly real cost: ${formatInr(actualMonthlyCost)} (not just ${formatInr(perceivedMonthlyCost)} EMI). Cost per km: Rs ${costPerKm.toFixed(1)}.`;

  const band = costPerKm < 8 ? "good" : costPerKm < 15 ? "warn" : "bad";

  return {
    headline,
    score: {
      label: "Cost Efficiency (Rs/km)",
      value: Math.round(Math.max(0, 100 - costPerKm * 4)),
      max: 100,
      band,
    },
    metrics: [
      { label: "On-road price", value: formatInr(onRoadPrice), hint: `+${formatInr(onRoadPrice - exShowroom)} over ex-showroom` },
      { label: "5-year total cost", value: formatInr(totalOwnershipCost), hint: "Purchase + running - resale" },
      { label: "Cost per km", value: `Rs ${costPerKm.toFixed(1)}`, hint: `Over ${(totalKm / 1000).toFixed(0)}K km` },
      { label: "Monthly real cost", value: formatInr(actualMonthlyCost), hint: `vs ${formatInr(perceivedMonthlyCost)} EMI` },
      { label: "Depreciation loss", value: formatInr(depreciationLoss), hint: `Resale at year 5: ${formatInr(resaleValue)}` },
      { label: "Loan interest total", value: formatInr(loan.totalInterest), hint: loan.emi > 0 ? `EMI: ${formatInr(loan.emi)}` : "Cash purchase" },
    ],
    sections: [
      {
        title: "What you THINK it costs vs what it ACTUALLY costs",
        items: [
          {
            title: `Perceived: ${formatInr(perceivedMonthlyCost)}/month (just the EMI)`,
            body: `Most buyers budget only for the EMI of ${formatInr(loan.emi)}${loan.emi > 0 ? ` on a ${loanTenure}-year loan` : ""}. This ignores fuel, insurance, service, parking, and the invisible cost of depreciation.`,
            severity: "medium" as Severity,
          },
          {
            title: `Actual: ${formatInr(actualMonthlyCost)}/month (everything included)`,
            body: `EMI (${formatInr(loan.emi)}) + Fuel (${formatInr(monthlyFuel)}) + Insurance (${formatInr(Math.round(totalInsurance / 60))}) + Service (${formatInr(Math.round(totalService / 60))}) + Depreciation (${formatInr(Math.round(depreciationLoss / 60))}). The real cost is ${(actualMonthlyCost / (perceivedMonthlyCost || 1) * 100).toFixed(0)}% of what you budgeted.`,
            severity: "high" as Severity,
          },
        ],
      },
      {
        title: "On-Road Price Breakdown",
        items: [
          { title: `Ex-showroom: ${formatInr(exShowroom)}`, body: "Manufacturer price before taxes and charges.", severity: "low" as Severity },
          { title: `Road tax (${state}): ${formatInr(roadTax)} (${(roadTaxRate * 100).toFixed(1)}%)`, body: `${state} charges ${(roadTaxRate * 100).toFixed(1)}% road tax for ${fuelType.toLowerCase()} vehicles in this price range. This is a lifetime tax paid at registration.`, severity: "low" as Severity },
          { title: `Registration: ${formatInr(registration)}`, body: "RTO registration and number plate charges.", severity: "low" as Severity },
          ...(tcs > 0 ? [{ title: `TCS (1%): ${formatInr(tcs)}`, body: "Tax Collected at Source on vehicles above Rs 10 lakh. Adjustable against your income tax.", severity: "low" as Severity }] : []),
          { title: `Insurance (Year 1): ${formatInr(firstYearInsurance)}`, body: `${isComprehensive ? "Comprehensive" : "Third party only"} insurance. IDV-based premium.`, severity: "low" as Severity },
          { title: `Accessories + Logistics: ${formatInr(accessories + logistics)}`, body: "Standard accessories (mats, covers, mud flaps) and dealer logistics charges.", severity: "low" as Severity },
          { title: `TOTAL ON-ROAD: ${formatInr(onRoadPrice)}`, body: `${formatInr(onRoadPrice - exShowroom)} above ex-showroom (${((onRoadPrice - exShowroom) / exShowroom * 100).toFixed(1)}% premium).`, severity: "medium" as Severity },
        ],
      },
      {
        title: "5-Year Running Cost Breakdown",
        items: [
          { title: `Total fuel (5 years): ${formatInr(totalFuel5yr)}`, body: `At ${monthlyKm} km/month, ${mileage} km/${fuelType === "Electric" ? "kWh" : "L"}, Rs ${fuelPrice}/${fuelType === "Electric" ? "kWh" : "L"}. Monthly fuel: ${formatInr(monthlyFuel)}.`, severity: "low" as Severity },
          { title: `Insurance (5 years): ${formatInr(totalInsurance)}`, body: `${isComprehensive ? "Comprehensive" : "Third party"} with IDV depreciating ~20%/year. NCB discount applied for claim-free years.`, severity: "low" as Severity },
          { title: `Service & maintenance: ${formatInr(totalService)}`, body: `Scheduled service, oil changes, brake pads, filters. Increases with vehicle age.`, severity: "low" as Severity },
          { title: `Tyres: ${formatInr(totalTyres5yr)}`, body: "Tyre replacement typically at year 3 and year 5 (40,000-50,000 km intervals).", severity: "low" as Severity },
          { title: `TOTAL RUNNING (5 years): ${formatInr(totalRunning)}`, body: `Average ${formatInr(Math.round(totalRunning / 60))}/month running cost on top of your EMI.`, severity: "medium" as Severity },
        ],
      },
      {
        title: "Loan & Financing",
        items: loan.emi > 0 ? [
          { title: `Loan: ${formatInr(loanPrincipal)} at ${loanRate}% for ${loanTenure} years`, body: `Down payment: ${formatInr(downPayment)}. EMI: ${formatInr(loan.emi)}/month for ${loanTenure * 12} months.`, severity: "low" as Severity },
          { title: `Total interest paid: ${formatInr(loan.totalInterest)}`, body: `You pay ${formatInr(loan.totalPayment)} for a ${formatInr(loanPrincipal)} loan. Interest is ${((loan.totalInterest / loanPrincipal) * 100).toFixed(1)}% of principal. Cost per lakh borrowed: Rs ${Math.round(loan.totalInterest / (loanPrincipal / 100000))}/lakh.`, severity: "medium" as Severity },
        ] : [
          { title: "Cash purchase (no loan)", body: `Full payment of ${formatInr(onRoadPrice)} upfront. No interest cost. Opportunity cost: this money could earn 8-12% annually if invested.`, severity: "low" as Severity },
        ],
      },
      {
        title: "Depreciation (the cost nobody budgets for)",
        items: [
          { title: `Depreciation loss: ${formatInr(depreciationLoss)} over 5 years`, body: `Car worth ${formatInr(resaleValue)} at year 5 (${(100 - DEPRECIATION_YEARLY[4] * 100)}% of ex-showroom). That is ${formatInr(Math.round(depreciationLoss / 60))}/month you are losing silently - more than fuel for most owners.`, severity: "high" as Severity },
          { title: "Year-by-year value", body: DEPRECIATION_YEARLY.map((d, i) => `Year ${i + 1}: ${formatInr(Math.round(exShowroom * (1 - d)))}`).join(" | "), severity: "low" as Severity },
        ],
      },
      ...(breakeven ? [{
        title: "Petrol vs Diesel Breakeven",
        items: [{ title: `Breakeven: ${breakeven.monthlyKm} km/month`, body: breakeven.note, severity: "low" as Severity }],
      }] : []),
    ],
    table: {
      columns: ["Year", "Fuel", "Insurance", "Service", "Tyres", "Total Running"],
      rows: yearlyBreakdown.map((y) => [
        `Year ${y.year}`,
        formatInr(y.fuel),
        formatInr(y.insurance),
        formatInr(y.service),
        y.tyres > 0 ? formatInr(y.tyres) : "-",
        formatInr(y.total),
      ]),
    },
    json: {
      onRoad: {
        exShowroom,
        roadTax,
        roadTaxRate: roadTaxRate * 100,
        registration,
        tcs,
        insurance: firstYearInsurance,
        accessories,
        logistics,
        total: onRoadPrice,
        premiumOverExShowroom: onRoadPrice - exShowroom,
        premiumPct: Number(((onRoadPrice - exShowroom) / exShowroom * 100).toFixed(1)),
      },
      loan: {
        principal: loanPrincipal,
        downPayment,
        rate: loanRate,
        tenure: loanTenure,
        emi: loan.emi,
        totalInterest: loan.totalInterest,
        totalPayment: loan.totalPayment,
      },
      running: {
        totalFuel: totalFuel5yr,
        totalInsurance,
        totalService,
        totalTyres: totalTyres5yr,
        totalRunning,
        monthlyFuel,
        mileageUsed: mileage,
        fuelPrice,
      },
      depreciation: {
        resaleValueYear5: resaleValue,
        depreciationLoss,
        yearlyValues: DEPRECIATION_YEARLY.map((d, i) => ({ year: i + 1, value: Math.round(exShowroom * (1 - d)), lostPct: Math.round(d * 100) })),
      },
      totals: {
        totalOwnershipCost,
        costPerKm: Number(costPerKm.toFixed(1)),
        totalKm,
        perceivedMonthlyCost,
        actualMonthlyCost,
        costMultiplier: Number((actualMonthlyCost / (perceivedMonthlyCost || 1)).toFixed(1)),
      },
      breakeven: breakeven || null,
      parameters: { state, fuelType, monthlyKm, insuranceType: isComprehensive ? "Comprehensive" : "Third Party" },
    },
  };
}
