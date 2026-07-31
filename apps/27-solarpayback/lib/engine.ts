import type { ResultItem, RunInput, RunResult, Severity } from "./types.ts";

/**
 * Rooftop solar payback calculator for Indian homeowners.
 *
 * Computes system size from electricity bill, estimates generation from
 * state irradiance and orientation, applies PM Surya Ghar subsidy slabs,
 * and produces a month-by-month breakeven timeline compared against FD returns.
 */

// ---------------------------------------------------------------------------
// State-level data: average irradiance (kWh/m2/day) and tariff (Rs/kWh)
// ---------------------------------------------------------------------------

const STATE_DATA: Record<string, { irradiance: number; tariff: number }> = {
  "Maharashtra": { irradiance: 5.1, tariff: 8.5 },
  "Karnataka": { irradiance: 5.5, tariff: 7.8 },
  "Tamil Nadu": { irradiance: 5.4, tariff: 6.5 },
  "Delhi": { irradiance: 5.0, tariff: 8.0 },
  "Rajasthan": { irradiance: 6.0, tariff: 7.5 },
  "Gujarat": { irradiance: 5.8, tariff: 7.2 },
  "Uttar Pradesh": { irradiance: 5.0, tariff: 7.0 },
  "Madhya Pradesh": { irradiance: 5.3, tariff: 7.0 },
  "Telangana": { irradiance: 5.4, tariff: 7.5 },
  "Andhra Pradesh": { irradiance: 5.5, tariff: 7.2 },
  "Kerala": { irradiance: 4.5, tariff: 6.8 },
  "West Bengal": { irradiance: 4.4, tariff: 7.5 },
  "Punjab": { irradiance: 5.2, tariff: 7.8 },
  "Haryana": { irradiance: 5.1, tariff: 7.5 },
};

// Orientation factor (fraction of optimal south-facing output)
const ORIENTATION_FACTOR: Record<string, number> = {
  "South facing": 1.0,
  "East facing": 0.82,
  "West facing": 0.82,
  "North facing": 0.65,
  "Flat roof": 0.92, // tilt-mounted panels on flat roof
};

// System constants
const WATTS_PER_SQFT = 10; // ~10W per sq ft (modern panels)
const BENCHMARK_COST_PER_KW = 50000; // Rs per kW (MNRE benchmark)
const PANEL_DEGRADATION = 0.005; // 0.5% per year
const TARIFF_INFLATION = 0.05; // 5% annual tariff increase
const FD_RATE = 0.07; // 7% post-tax FD return
const SYSTEM_LIFE_YEARS = 25;
const INVERTER_EFFICIENCY = 0.85;

function toNumber(value: string | undefined): number {
  if (!value) return 0;
  const n = Number.parseFloat(String(value).replace(/[₹,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function computeSubsidy(systemKw: number): { amount: number; detail: string } {
  // PM Surya Ghar: 40% for first 3 kW, 20% for 3-10 kW
  const benchmarkCost = systemKw * BENCHMARK_COST_PER_KW;
  let subsidy = 0;
  let detail = "";

  if (systemKw <= 3) {
    subsidy = benchmarkCost * 0.4;
    detail = `40% of Rs ${benchmarkCost.toLocaleString("en-IN")} (${systemKw.toFixed(1)} kW at Rs ${BENCHMARK_COST_PER_KW.toLocaleString("en-IN")}/kW)`;
  } else if (systemKw <= 10) {
    const first3Cost = 3 * BENCHMARK_COST_PER_KW;
    const restCost = (systemKw - 3) * BENCHMARK_COST_PER_KW;
    subsidy = first3Cost * 0.4 + restCost * 0.2;
    detail = `40% on first 3 kW (Rs ${(first3Cost * 0.4).toLocaleString("en-IN")}) + 20% on remaining ${(systemKw - 3).toFixed(1)} kW (Rs ${(restCost * 0.2).toLocaleString("en-IN")})`;
  } else {
    const first3Cost = 3 * BENCHMARK_COST_PER_KW;
    const next7Cost = 7 * BENCHMARK_COST_PER_KW;
    subsidy = first3Cost * 0.4 + next7Cost * 0.2;
    detail = `40% on first 3 kW + 20% on next 7 kW (capped at 10 kW). No subsidy on capacity above 10 kW.`;
  }

  return { amount: Math.round(subsidy), detail };
}

export async function run(input: RunInput): Promise<RunResult> {
  const monthlyBill = toNumber(input.monthlyBill);
  const rooftopArea = toNumber(input.rooftopArea);
  const state = input.state ?? "";
  const orientation = input.orientation ?? "South facing";
  const netMetering = input.netMetering ?? "Yes";

  if (monthlyBill <= 0) {
    throw new Error("Enter your monthly electricity bill amount in rupees. Even an approximate figure works for estimating system size.");
  }
  if (rooftopArea <= 0) {
    throw new Error("Enter the available rooftop area in square feet. Only count unshaded usable space.");
  }
  if (!STATE_DATA[state]) {
    throw new Error(`Select a valid state. Supported states: ${Object.keys(STATE_DATA).join(", ")}.`);
  }

  const stateInfo = STATE_DATA[state];
  const orientFactor = ORIENTATION_FACTOR[orientation] ?? 0.85;

  // Step 1: Compute monthly consumption from bill
  const monthlyKwh = monthlyBill / stateInfo.tariff;

  // Step 2: Compute system size needed
  const dailyKwh = monthlyKwh / 30;
  const peakSunHours = stateInfo.irradiance * orientFactor;
  const systemKwNeeded = dailyKwh / (peakSunHours * INVERTER_EFFICIENCY);

  // Step 3: Compute system size possible from rooftop area
  const maxKwFromArea = (rooftopArea * WATTS_PER_SQFT) / 1000;

  // Step 4: Take minimum of needed and possible
  const systemKw = Math.min(systemKwNeeded, maxKwFromArea);
  const systemKwRounded = Math.round(systemKw * 10) / 10;

  // Single phase limit is typically 10 kW, three phase up to 10 kW for residential
  const phaseLimit = input.connectionType === "Three phase" ? 10 : 5;
  const finalSystemKw = Math.min(systemKwRounded, phaseLimit);

  // Step 5: Compute costs
  const grossCost = Math.round(finalSystemKw * BENCHMARK_COST_PER_KW);
  const subsidy = computeSubsidy(finalSystemKw);
  const netCost = grossCost - subsidy.amount;

  // Step 6: Compute annual generation (year 1)
  const annualGenY1 = finalSystemKw * peakSunHours * 365 * INVERTER_EFFICIENCY;

  // Step 7: Compute self-consumption vs export
  const annualConsumption = monthlyKwh * 12;
  const selfConsumedFraction = netMetering === "Yes" ? 1.0 : Math.min(1.0, annualConsumption / annualGenY1);

  // Step 8: Month-by-month breakeven
  let cumulativeSavings = 0;
  let breakevenMonth = -1;
  const yearlyData: { year: number; generation: number; savings: number; cumulative: number }[] = [];

  for (let year = 1; year <= SYSTEM_LIFE_YEARS; year++) {
    const degradationFactor = Math.pow(1 - PANEL_DEGRADATION, year - 1);
    const yearGen = annualGenY1 * degradationFactor;
    const effectiveGen = yearGen * selfConsumedFraction;
    const currentTariff = stateInfo.tariff * Math.pow(1 + TARIFF_INFLATION, year - 1);
    const yearlySavings = effectiveGen * currentTariff;

    cumulativeSavings += yearlySavings;
    yearlyData.push({
      year,
      generation: Math.round(yearGen),
      savings: Math.round(yearlySavings),
      cumulative: Math.round(cumulativeSavings),
    });

    if (breakevenMonth === -1 && cumulativeSavings >= netCost) {
      // Find the approximate month within this year
      const prevCumulative = year > 1 ? yearlyData[year - 2].cumulative : 0;
      const monthInYear = Math.ceil(((netCost - prevCumulative) / yearlySavings) * 12);
      breakevenMonth = (year - 1) * 12 + Math.min(monthInYear, 12);
    }
  }

  // Step 9: IRR approximation (Newton's method on NPV)
  const cashflows: number[] = [-netCost];
  for (const yd of yearlyData) {
    cashflows.push(yd.savings);
  }
  const irr = computeIRR(cashflows);

  // Step 10: FD comparison
  const fdValue = netCost * Math.pow(1 + FD_RATE, SYSTEM_LIFE_YEARS);
  const totalSolarSavings = yearlyData[yearlyData.length - 1].cumulative;

  // Step 11: Annual savings year 1
  const annualSavingsY1 = yearlyData[0].savings;

  // Build result
  const breakevenYears = breakevenMonth > 0 ? Math.floor(breakevenMonth / 12) : -1;
  const breakevenMonths = breakevenMonth > 0 ? breakevenMonth % 12 : -1;
  const breakevenText = breakevenMonth > 0
    ? `${breakevenYears} years ${breakevenMonths} months`
    : "Does not break even within 25 years";

  const scoreBand = breakevenMonth > 0 && breakevenMonth <= 72 ? "good" as const
    : breakevenMonth > 0 && breakevenMonth <= 120 ? "warn" as const
    : "bad" as const;

  const scoreValue = breakevenMonth > 0 ? Math.max(10, 100 - Math.round(breakevenMonth * 0.8)) : 10;

  const sections: { title: string; items: ResultItem[] }[] = [
    {
      title: "System sizing",
      items: [
        {
          title: "Recommended system size",
          body: `${finalSystemKw} kW based on your monthly consumption of ${Math.round(monthlyKwh)} kWh (bill Rs ${monthlyBill.toLocaleString("en-IN")} at Rs ${stateInfo.tariff}/kWh tariff). ${
            finalSystemKw < systemKwNeeded
              ? `Limited by ${finalSystemKw < maxKwFromArea ? `${input.connectionType?.toLowerCase() ?? "single phase"} connection limit of ${phaseLimit} kW` : `rooftop area (${rooftopArea} sq ft supports max ${maxKwFromArea.toFixed(1)} kW)`}.`
              : "Your rooftop can accommodate the full system needed."
          }`,
          severity: "medium" as Severity,
        },
        {
          title: "Expected generation (year 1)",
          body: `${Math.round(annualGenY1).toLocaleString("en-IN")} kWh/year based on ${state} irradiance of ${stateInfo.irradiance} kWh/m2/day, ${orientation.toLowerCase()} orientation (${Math.round(orientFactor * 100)}% efficiency), and ${Math.round(INVERTER_EFFICIENCY * 100)}% inverter efficiency.`,
          severity: "low" as Severity,
        },
      ],
    },
    {
      title: "Financial analysis",
      items: [
        {
          title: "Total cost after subsidy",
          body: `Gross cost: Rs ${grossCost.toLocaleString("en-IN")} (${finalSystemKw} kW x Rs ${BENCHMARK_COST_PER_KW.toLocaleString("en-IN")}/kW). PM Surya Ghar subsidy: Rs ${subsidy.amount.toLocaleString("en-IN")} (${subsidy.detail}). Net cost: Rs ${netCost.toLocaleString("en-IN")}.`,
          severity: "high" as Severity,
        },
        {
          title: "Payback period",
          body: breakevenMonth > 0
            ? `Your system breaks even in month ${breakevenMonth} (${breakevenText}). After that, every unit generated is pure savings.`
            : "With current parameters, the system does not break even within 25 years. Consider increasing rooftop area or checking if net metering is available.",
          severity: breakevenMonth > 0 && breakevenMonth <= 84 ? "low" as Severity : "high" as Severity,
        },
        {
          title: "Annual savings (year 1)",
          body: `Rs ${annualSavingsY1.toLocaleString("en-IN")} saved in the first year. This grows at ~5% annually due to tariff inflation while generation degrades only 0.5%/year.`,
          severity: "low" as Severity,
        },
        {
          title: `IRR: ${irr >= 0 ? (irr * 100).toFixed(1) : "N/A"}%`,
          body: irr >= FD_RATE
            ? `Internal rate of return of ${(irr * 100).toFixed(1)}% exceeds the 7% post-tax FD rate. Solar is the better financial choice.`
            : irr >= 0
              ? `Internal rate of return of ${(irr * 100).toFixed(1)}% is below the 7% FD rate. Financially, a fixed deposit does better, though solar has non-financial benefits.`
              : "Negative IRR indicates the system does not generate positive returns over its lifetime with current parameters.",
          severity: irr >= FD_RATE ? "low" as Severity : "high" as Severity,
        },
      ],
    },
    {
      title: "FD comparison",
      items: [
        {
          title: `Rs ${netCost.toLocaleString("en-IN")} in a 7% FD for 25 years`,
          body: `Would grow to Rs ${Math.round(fdValue).toLocaleString("en-IN")}. Your solar system saves a total of Rs ${totalSolarSavings.toLocaleString("en-IN")} over 25 years. ${
            totalSolarSavings > fdValue
              ? `Solar wins by Rs ${Math.round(totalSolarSavings - fdValue).toLocaleString("en-IN")}.`
              : `FD wins by Rs ${Math.round(fdValue - totalSolarSavings).toLocaleString("en-IN")}. Consider whether energy independence and hedge against tariff hikes justify the gap.`
          }`,
          severity: totalSolarSavings > fdValue ? "low" as Severity : "medium" as Severity,
        },
      ],
    },
    {
      title: "Assumptions and caveats",
      items: [
        { body: `Panel degradation: ${PANEL_DEGRADATION * 100}% per year. Inverter efficiency: ${INVERTER_EFFICIENCY * 100}%. Tariff inflation: ${TARIFF_INFLATION * 100}% per year.`, severity: "low" as Severity },
        { body: "Does not include maintenance costs (Rs 2,000-5,000/year for cleaning) or inverter replacement (typically needed once around year 12-15).", severity: "medium" as Severity },
        { body: "Actual generation depends on local shading, dust, ambient temperature, and inverter quality. Treat this as a planning estimate within 10-15% of real output.", severity: "low" as Severity },
      ],
    },
  ];

  // Table: first 10 years
  const tableRows = yearlyData.slice(0, 10).map((yd) => [
    String(yd.year),
    yd.generation.toLocaleString("en-IN"),
    `Rs ${yd.savings.toLocaleString("en-IN")}`,
    `Rs ${yd.cumulative.toLocaleString("en-IN")}`,
  ]);

  return {
    headline: breakevenMonth > 0
      ? `Your ${finalSystemKw} kW system pays for itself in ${breakevenText}, with ${(irr * 100).toFixed(0)}% IRR${irr >= FD_RATE ? " — beating a fixed deposit" : ""}.`
      : `A ${finalSystemKw} kW system does not break even within 25 years at current parameters.`,

    score: {
      label: "Payback score",
      value: scoreValue,
      max: 100,
      band: scoreBand,
    },

    metrics: [
      { label: "System size", value: `${finalSystemKw} kW` },
      { label: "Net cost", value: `Rs ${netCost.toLocaleString("en-IN")}` },
      { label: "Breakeven", value: breakevenText },
      { label: "IRR", value: irr >= 0 ? `${(irr * 100).toFixed(1)}%` : "N/A" },
      { label: "Year 1 savings", value: `Rs ${annualSavingsY1.toLocaleString("en-IN")}` },
    ],

    sections,

    table: {
      columns: ["Year", "Generation (kWh)", "Annual savings", "Cumulative savings"],
      rows: tableRows,
    },

    copyBlocks: [
      {
        title: "Solar investment summary",
        text: [
          `Solar Payback Analysis — ${state}`,
          `${"=".repeat(40)}`,
          `System size: ${finalSystemKw} kW`,
          `Gross cost: Rs ${grossCost.toLocaleString("en-IN")}`,
          `PM Surya Ghar subsidy: Rs ${subsidy.amount.toLocaleString("en-IN")}`,
          `Net cost: Rs ${netCost.toLocaleString("en-IN")}`,
          ``,
          `Year 1 generation: ${Math.round(annualGenY1).toLocaleString("en-IN")} kWh`,
          `Year 1 savings: Rs ${annualSavingsY1.toLocaleString("en-IN")}`,
          ``,
          `Payback period: ${breakevenText}`,
          `IRR: ${irr >= 0 ? (irr * 100).toFixed(1) : "N/A"}%`,
          `25-year total savings: Rs ${totalSolarSavings.toLocaleString("en-IN")}`,
          `FD alternative (7%, 25 yrs): Rs ${Math.round(fdValue).toLocaleString("en-IN")}`,
          ``,
          `Verdict: ${totalSolarSavings > fdValue ? "Solar beats the FD." : "FD provides better financial returns."}`,
        ].join("\n"),
        language: "text",
      },
    ],

    json: {
      systemKw: finalSystemKw,
      grossCost,
      subsidyAmount: subsidy.amount,
      netCost,
      annualGenerationY1: Math.round(annualGenY1),
      annualSavingsY1,
      breakevenMonth: breakevenMonth > 0 ? breakevenMonth : null,
      irr: irr >= 0 ? Math.round(irr * 1000) / 1000 : null,
      fdValue25yr: Math.round(fdValue),
      totalSolarSavings25yr: totalSolarSavings,
      solarBeatsFD: totalSolarSavings > fdValue,
    },
  };
}

// ---------------------------------------------------------------------------
// IRR computation using Newton's method
// ---------------------------------------------------------------------------

function computeIRR(cashflows: number[]): number {
  let rate = 0.1; // initial guess 10%
  for (let iter = 0; iter < 100; iter++) {
    let npv = 0;
    let dnpv = 0;
    for (let t = 0; t < cashflows.length; t++) {
      const pv = cashflows[t] / Math.pow(1 + rate, t);
      npv += pv;
      if (t > 0) {
        dnpv -= t * cashflows[t] / Math.pow(1 + rate, t + 1);
      }
    }
    if (Math.abs(dnpv) < 1e-10) break;
    const newRate = rate - npv / dnpv;
    if (Math.abs(newRate - rate) < 1e-7) {
      rate = newRate;
      break;
    }
    rate = newRate;
    // Keep rate in reasonable bounds
    if (rate < -0.5) rate = -0.5;
    if (rate > 2) rate = 2;
  }
  return rate;
}
