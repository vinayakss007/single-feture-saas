import type { ResultItem, RunInput, RunResult, Severity } from "./types.ts";

/**
 * Electricity bill auditor for Indian domestic consumers.
 *
 * Verifies slab arithmetic, fixed charges, fuel adjustment charges, and total
 * reconciliation against published DISCOM tariff orders. Every finding is
 * expressed as a rupee amount — the consumer's language.
 */

// ---------------------------------------------------------------------------
// State tariff data (domestic residential, latest published orders)
// ---------------------------------------------------------------------------

type SlabRate = { upTo: number; rate: number };

type StateTariff = {
  slabs: SlabRate[];
  telescopic: boolean; // true = each slab applies only to units in that range
  fixedChargePerKw: number;
  fixedChargeThreePhasePerKw: number;
  fuelAdjustment: number; // Rs per unit
  wheelingCharge: number; // Rs per unit
  electricityDuty: number; // percentage of energy charges
  demandChargeApplies: boolean; // for domestic
  demandThresholdKw: number; // above this, demand charge kicks in
};

const STATE_TARIFFS: Record<string, StateTariff> = {
  "Maharashtra": {
    slabs: [
      { upTo: 100, rate: 4.71 },
      { upTo: 300, rate: 7.88 },
      { upTo: 500, rate: 10.29 },
      { upTo: Infinity, rate: 12.54 },
    ],
    telescopic: true,
    fixedChargePerKw: 45,
    fixedChargeThreePhasePerKw: 90,
    fuelAdjustment: 0.31,
    wheelingCharge: 0.15,
    electricityDuty: 0.16,
    demandChargeApplies: false,
    demandThresholdKw: 10,
  },
  "Karnataka": {
    slabs: [
      { upTo: 50, rate: 4.10 },
      { upTo: 100, rate: 5.55 },
      { upTo: 200, rate: 7.10 },
      { upTo: 500, rate: 8.15 },
      { upTo: Infinity, rate: 9.50 },
    ],
    telescopic: true,
    fixedChargePerKw: 40,
    fixedChargeThreePhasePerKw: 80,
    fuelAdjustment: 0.25,
    wheelingCharge: 0.10,
    electricityDuty: 0.09,
    demandChargeApplies: false,
    demandThresholdKw: 10,
  },
  "Delhi": {
    slabs: [
      { upTo: 200, rate: 3.00 },
      { upTo: 400, rate: 4.50 },
      { upTo: 800, rate: 6.50 },
      { upTo: 1200, rate: 7.75 },
      { upTo: Infinity, rate: 8.00 },
    ],
    telescopic: false, // non-telescopic: entire consumption at highest applicable slab
    fixedChargePerKw: 25,
    fixedChargeThreePhasePerKw: 50,
    fuelAdjustment: 0.20,
    wheelingCharge: 0.08,
    electricityDuty: 0.05,
    demandChargeApplies: false,
    demandThresholdKw: 10,
  },
  "Tamil Nadu": {
    slabs: [
      { upTo: 100, rate: 0.00 },
      { upTo: 200, rate: 2.25 },
      { upTo: 500, rate: 4.50 },
      { upTo: Infinity, rate: 6.60 },
    ],
    telescopic: true,
    fixedChargePerKw: 30,
    fixedChargeThreePhasePerKw: 60,
    fuelAdjustment: 0.15,
    wheelingCharge: 0.05,
    electricityDuty: 0.05,
    demandChargeApplies: false,
    demandThresholdKw: 10,
  },
  "Gujarat": {
    slabs: [
      { upTo: 50, rate: 3.20 },
      { upTo: 100, rate: 3.70 },
      { upTo: 200, rate: 4.55 },
      { upTo: 300, rate: 5.20 },
      { upTo: Infinity, rate: 5.80 },
    ],
    telescopic: true,
    fixedChargePerKw: 35,
    fixedChargeThreePhasePerKw: 70,
    fuelAdjustment: 0.28,
    wheelingCharge: 0.12,
    electricityDuty: 0.15,
    demandChargeApplies: false,
    demandThresholdKw: 10,
  },
  "Rajasthan": {
    slabs: [
      { upTo: 50, rate: 4.75 },
      { upTo: 150, rate: 6.50 },
      { upTo: 300, rate: 7.25 },
      { upTo: Infinity, rate: 7.95 },
    ],
    telescopic: true,
    fixedChargePerKw: 50,
    fixedChargeThreePhasePerKw: 100,
    fuelAdjustment: 0.35,
    wheelingCharge: 0.18,
    electricityDuty: 0.10,
    demandChargeApplies: false,
    demandThresholdKw: 10,
  },
  "Uttar Pradesh": {
    slabs: [
      { upTo: 100, rate: 3.55 },
      { upTo: 150, rate: 4.25 },
      { upTo: 300, rate: 5.45 },
      { upTo: Infinity, rate: 6.50 },
    ],
    telescopic: true,
    fixedChargePerKw: 40,
    fixedChargeThreePhasePerKw: 85,
    fuelAdjustment: 0.22,
    wheelingCharge: 0.10,
    electricityDuty: 0.08,
    demandChargeApplies: false,
    demandThresholdKw: 10,
  },
  "Telangana": {
    slabs: [
      { upTo: 50, rate: 1.95 },
      { upTo: 100, rate: 3.25 },
      { upTo: 200, rate: 5.20 },
      { upTo: 300, rate: 7.10 },
      { upTo: Infinity, rate: 8.50 },
    ],
    telescopic: true,
    fixedChargePerKw: 35,
    fixedChargeThreePhasePerKw: 75,
    fuelAdjustment: 0.20,
    wheelingCharge: 0.08,
    electricityDuty: 0.06,
    demandChargeApplies: false,
    demandThresholdKw: 10,
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toNumber(value: string | undefined): number {
  if (!value) return 0;
  const n = Number.parseFloat(String(value).replace(/[₹,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function computeEnergyCharge(units: number, tariff: StateTariff): { total: number; breakdown: string[] } {
  const breakdown: string[] = [];
  let total = 0;

  if (tariff.telescopic) {
    let remaining = units;
    let prevLimit = 0;
    for (const slab of tariff.slabs) {
      const slabUnits = Math.min(remaining, slab.upTo - prevLimit);
      if (slabUnits <= 0) break;
      const charge = slabUnits * slab.rate;
      total += charge;
      breakdown.push(`${slabUnits} units x Rs ${slab.rate} (${prevLimit + 1}-${Math.min(slab.upTo, prevLimit + slabUnits)} slab) = Rs ${charge.toFixed(2)}`);
      remaining -= slabUnits;
      prevLimit = slab.upTo;
    }
  } else {
    // Non-telescopic: find applicable slab and charge all units at that rate
    let applicableRate = tariff.slabs[0].rate;
    for (const slab of tariff.slabs) {
      if (units <= slab.upTo) {
        applicableRate = slab.rate;
        break;
      }
      applicableRate = slab.rate;
    }
    total = units * applicableRate;
    breakdown.push(`${units} units x Rs ${applicableRate} (non-telescopic, full consumption at applicable slab rate) = Rs ${total.toFixed(2)}`);
  }

  return { total: Math.round(total * 100) / 100, breakdown };
}

type BillLineItem = { label: string; amount: number };

function parseBillItems(text: string): BillLineItem[] {
  const items: BillLineItem[] = [];
  const lines = text.split("\n").filter((l) => l.trim());

  for (const line of lines) {
    // Match patterns like "Energy charges: 1450" or "Fixed charges 150" or "Total = 1757"
    const match = line.match(/^(.+?)[\s:=]+(\d+(?:\.\d+)?)\s*$/);
    if (match) {
      items.push({ label: match[1].trim(), amount: Number.parseFloat(match[2]) });
    }
  }

  return items;
}

function categoriseItem(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("energy") || l.includes("unit charge") || l.includes("consumption")) return "energy";
  if (l.includes("fixed") || l.includes("demand") || l.includes("meter rent")) return "fixed";
  if (l.includes("fuel") || l.includes("fppca") || l.includes("fac") || l.includes("ppac")) return "fuel";
  if (l.includes("wheel")) return "wheeling";
  if (l.includes("duty") || l.includes("tax") || l.includes("cess")) return "duty";
  if (l.includes("total") || l.includes("net") || l.includes("amount")) return "total";
  return "other";
}

export async function run(input: RunInput): Promise<RunResult> {
  const state = input.state ?? "";
  const connectionType = input.connectionType ?? "Single phase - Domestic";
  const sanctionedLoad = toNumber(input.sanctionedLoad);
  const units = toNumber(input.unitsConsumed);
  const billText = input.billItems ?? "";

  if (!billText.trim()) {
    throw new Error("Paste your bill line items. Enter at minimum the energy charges, fixed charges, and total amount with one item per line.");
  }
  if (!STATE_TARIFFS[state]) {
    throw new Error(`Select a valid state. Supported: ${Object.keys(STATE_TARIFFS).join(", ")}.`);
  }
  if (sanctionedLoad <= 0) {
    throw new Error("Enter your sanctioned load in kW. It is shown on your bill or connection agreement, typically 2-5 kW for domestic.");
  }
  if (units <= 0) {
    throw new Error("Enter the units consumed (kWh) for the billing period. This is the reading difference shown on your bill.");
  }

  const tariff = STATE_TARIFFS[state];
  const billItems = parseBillItems(billText);

  if (billItems.length === 0) {
    throw new Error("Could not parse any line items. Enter them as 'Label: Amount' with one per line, e.g. 'Energy charges: 1450'.");
  }

  const findings: ResultItem[] = [];
  let totalOvercharge = 0;

  // Categorise bill items
  const categorised: Record<string, BillLineItem[]> = {};
  for (const item of billItems) {
    const cat = categoriseItem(item.label);
    if (!categorised[cat]) categorised[cat] = [];
    categorised[cat].push(item);
  }

  // 1. Verify energy charges (slab arithmetic)
  const computed = computeEnergyCharge(units, tariff);
  const billedEnergy = categorised["energy"]?.reduce((s, i) => s + i.amount, 0) ?? 0;

  if (billedEnergy > 0) {
    const diff = billedEnergy - computed.total;
    if (Math.abs(diff) > 1) {
      findings.push({
        title: `Energy charge discrepancy: Rs ${Math.abs(diff).toFixed(0)}`,
        body: `Billed Rs ${billedEnergy.toFixed(0)} but correct slab calculation for ${units} units is Rs ${computed.total.toFixed(0)}. ${diff > 0 ? `Overcharged by Rs ${diff.toFixed(0)}.` : `Undercharged by Rs ${Math.abs(diff).toFixed(0)} (unusual, verify meter reading).`} Computation: ${computed.breakdown.join(" + ")}`,
        tag: diff > 0 ? `+Rs ${diff.toFixed(0)}` : `-Rs ${Math.abs(diff).toFixed(0)}`,
        severity: Math.abs(diff) > 100 ? "high" : "medium",
      });
      if (diff > 0) totalOvercharge += diff;
    } else {
      findings.push({
        title: "Energy charges: correct",
        body: `Billed Rs ${billedEnergy.toFixed(0)} matches slab calculation of Rs ${computed.total.toFixed(0)} for ${units} units.`,
        severity: "low",
      });
    }
  }

  // 2. Verify fixed charges
  const isThreePhase = connectionType.includes("Three phase");
  const expectedFixed = sanctionedLoad * (isThreePhase ? tariff.fixedChargeThreePhasePerKw : tariff.fixedChargePerKw);
  const billedFixed = categorised["fixed"]?.reduce((s, i) => s + i.amount, 0) ?? 0;

  if (billedFixed > 0) {
    const diff = billedFixed - expectedFixed;
    if (Math.abs(diff) > 1) {
      const wrongPhaseRate = !isThreePhase && billedFixed >= sanctionedLoad * tariff.fixedChargeThreePhasePerKw * 0.9;
      findings.push({
        title: `Fixed charge discrepancy: Rs ${Math.abs(diff).toFixed(0)}`,
        body: `Billed Rs ${billedFixed.toFixed(0)} but expected Rs ${expectedFixed.toFixed(0)} (${sanctionedLoad} kW x Rs ${isThreePhase ? tariff.fixedChargeThreePhasePerKw : tariff.fixedChargePerKw}/kW for ${connectionType.toLowerCase()}).${wrongPhaseRate ? " It appears three-phase rates are being applied to a single-phase connection." : ""} ${diff > 0 ? `Overcharged by Rs ${diff.toFixed(0)}.` : ""}`,
        tag: diff > 0 ? `+Rs ${diff.toFixed(0)}` : `Rs ${Math.abs(diff).toFixed(0)} less`,
        severity: diff > 0 ? "high" : "low",
      });
      if (diff > 0) totalOvercharge += diff;
    } else {
      findings.push({
        title: "Fixed charges: correct",
        body: `Billed Rs ${billedFixed.toFixed(0)} matches expected Rs ${expectedFixed.toFixed(0)} for ${sanctionedLoad} kW ${connectionType.toLowerCase()}.`,
        severity: "low",
      });
    }
  }

  // 3. Verify fuel adjustment charge
  const expectedFuel = units * tariff.fuelAdjustment;
  const billedFuel = categorised["fuel"]?.reduce((s, i) => s + i.amount, 0) ?? 0;

  if (billedFuel > 0) {
    const diff = billedFuel - expectedFuel;
    if (Math.abs(diff) > 1) {
      const impliedRate = billedFuel / units;
      findings.push({
        title: `Fuel adjustment discrepancy: Rs ${Math.abs(diff).toFixed(0)}`,
        body: `Billed Rs ${billedFuel.toFixed(0)} (Rs ${impliedRate.toFixed(2)}/unit) but current approved rate is Rs ${tariff.fuelAdjustment}/unit for ${units} units = Rs ${expectedFuel.toFixed(0)}. ${diff > 0 ? `Possible old or wrong rate. Overcharged by Rs ${diff.toFixed(0)}.` : "Rate is below current approved, which is unusual."}`,
        tag: diff > 0 ? `+Rs ${diff.toFixed(0)}` : `check`,
        severity: diff > 0 ? "medium" : "low",
      });
      if (diff > 0) totalOvercharge += diff;
    } else {
      findings.push({
        title: "Fuel adjustment: correct",
        body: `Billed Rs ${billedFuel.toFixed(0)} matches Rs ${tariff.fuelAdjustment}/unit x ${units} units = Rs ${expectedFuel.toFixed(0)}.`,
        severity: "low",
      });
    }
  }

  // 4. Verify wheeling charges
  const expectedWheeling = units * tariff.wheelingCharge;
  const billedWheeling = categorised["wheeling"]?.reduce((s, i) => s + i.amount, 0) ?? 0;

  if (billedWheeling > 0) {
    const diff = billedWheeling - expectedWheeling;
    if (Math.abs(diff) > 1) {
      findings.push({
        title: `Wheeling charge discrepancy: Rs ${Math.abs(diff).toFixed(0)}`,
        body: `Billed Rs ${billedWheeling.toFixed(0)} but expected Rs ${expectedWheeling.toFixed(0)} (Rs ${tariff.wheelingCharge}/unit x ${units} units). ${diff > 0 ? `Overcharged by Rs ${diff.toFixed(0)}.` : ""}`,
        tag: diff > 0 ? `+Rs ${diff.toFixed(0)}` : `check`,
        severity: diff > 0 ? "medium" : "low",
      });
      if (diff > 0) totalOvercharge += diff;
    } else {
      findings.push({
        title: "Wheeling charges: correct",
        body: `Billed Rs ${billedWheeling.toFixed(0)} matches expected Rs ${expectedWheeling.toFixed(0)}.`,
        severity: "low",
      });
    }
  }

  // 5. Verify electricity duty
  const baseForDuty = computed.total;
  const expectedDuty = Math.round(baseForDuty * tariff.electricityDuty * 100) / 100;
  const billedDuty = categorised["duty"]?.reduce((s, i) => s + i.amount, 0) ?? 0;

  if (billedDuty > 0) {
    const diff = billedDuty - expectedDuty;
    if (Math.abs(diff) > 2) {
      findings.push({
        title: `Electricity duty discrepancy: Rs ${Math.abs(diff).toFixed(0)}`,
        body: `Billed Rs ${billedDuty.toFixed(0)} but expected Rs ${expectedDuty.toFixed(0)} (${(tariff.electricityDuty * 100).toFixed(0)}% of energy charges Rs ${baseForDuty.toFixed(0)}). ${diff > 0 ? `Overcharged by Rs ${diff.toFixed(0)}.` : ""}`,
        tag: diff > 0 ? `+Rs ${diff.toFixed(0)}` : `check`,
        severity: diff > 0 ? "medium" : "low",
      });
      if (diff > 0) totalOvercharge += diff;
    } else {
      findings.push({
        title: "Electricity duty: correct",
        body: `Billed Rs ${billedDuty.toFixed(0)} is within expected range of Rs ${expectedDuty.toFixed(0)}.`,
        severity: "low",
      });
    }
  }

  // 6. Check demand charges on domestic
  if (!tariff.demandChargeApplies && sanctionedLoad < tariff.demandThresholdKw) {
    const hasDemandCharge = billItems.some((i) => i.label.toLowerCase().includes("demand") && !i.label.toLowerCase().includes("fixed"));
    if (hasDemandCharge) {
      const demandAmount = billItems.find((i) => i.label.toLowerCase().includes("demand") && !i.label.toLowerCase().includes("fixed"))?.amount ?? 0;
      findings.push({
        title: `Demand charge wrongly applied: Rs ${demandAmount.toFixed(0)}`,
        body: `Demand charges do not apply to domestic connections below ${tariff.demandThresholdKw} kW in ${state}. Your sanctioned load is ${sanctionedLoad} kW. This Rs ${demandAmount.toFixed(0)} should not be on your bill.`,
        tag: `+Rs ${demandAmount.toFixed(0)}`,
        severity: "high",
      });
      totalOvercharge += demandAmount;
    }
  }

  // 7. Total reconciliation
  const billedTotal = categorised["total"]?.reduce((s, i) => s + i.amount, 0) ?? 0;
  const sumOfComponents = billItems.filter((i) => categoriseItem(i.label) !== "total").reduce((s, i) => s + i.amount, 0);

  if (billedTotal > 0 && sumOfComponents > 0) {
    const diff = billedTotal - sumOfComponents;
    if (Math.abs(diff) > 1) {
      findings.push({
        title: `Total does not match sum of components: Rs ${Math.abs(diff).toFixed(0)}`,
        body: `Stated total Rs ${billedTotal.toFixed(0)} but sum of line items is Rs ${sumOfComponents.toFixed(0)}. Difference: Rs ${diff.toFixed(0)} ${diff > 0 ? "(you are paying more than the sum of charges)" : "(bill shows less than charged, unusual)"}.`,
        tag: diff > 0 ? `+Rs ${diff.toFixed(0)}` : `check`,
        severity: Math.abs(diff) > 50 ? "high" : "medium",
      });
      if (diff > 0) totalOvercharge += diff;
    } else {
      findings.push({
        title: "Total reconciliation: correct",
        body: `Stated total Rs ${billedTotal.toFixed(0)} matches sum of components Rs ${sumOfComponents.toFixed(0)}.`,
        severity: "low",
      });
    }
  }

  // Compute what the bill should be
  const correctTotal = computed.total + expectedFixed + expectedFuel + expectedWheeling + expectedDuty;

  const highFindings = findings.filter((f) => f.severity === "high").length;
  const mediumFindings = findings.filter((f) => f.severity === "medium").length;

  const scoreBand = totalOvercharge > 200 ? "bad" as const
    : totalOvercharge > 50 ? "warn" as const
    : "good" as const;

  const scoreValue = Math.max(0, Math.min(100, 100 - Math.round(totalOvercharge / 10)));

  const sections: { title: string; items: ResultItem[] }[] = [
    { title: "Findings", items: findings },
    {
      title: "Correct bill computation",
      items: [
        {
          title: "Energy charges (slab-wise)",
          body: computed.breakdown.join("\n"),
          severity: "low" as Severity,
        },
        {
          title: "Other components",
          body: `Fixed charges: Rs ${expectedFixed.toFixed(0)} | Fuel adjustment: Rs ${expectedFuel.toFixed(0)} | Wheeling: Rs ${expectedWheeling.toFixed(0)} | Duty: Rs ${expectedDuty.toFixed(0)}`,
          severity: "low" as Severity,
        },
        {
          title: "Correct total",
          body: `Rs ${correctTotal.toFixed(0)} (before any arrears, subsidies, or adjustments not itemised above)`,
          severity: "low" as Severity,
        },
      ],
    },
  ];

  if (totalOvercharge > 0) {
    sections.push({
      title: "What to do",
      items: [
        {
          title: "File a complaint with CGRF",
          body: `Consumer Grievance Redressal Forum is the first step. Cite the tariff order and the specific overcharge amount of Rs ${Math.round(totalOvercharge).toLocaleString("en-IN")}. The DISCOM must respond within 30 days.`,
          severity: "medium" as Severity,
        },
        {
          title: "Escalate to the Ombudsman if unresolved",
          body: "If CGRF does not resolve within 45 days, the Electricity Ombudsman is the next step. Keep copies of all correspondence.",
          severity: "low" as Severity,
        },
      ],
    });
  }

  // Table showing billed vs correct for each component
  const tableRows: string[][] = [];
  if (billedEnergy > 0) tableRows.push(["Energy charges", `Rs ${billedEnergy.toFixed(0)}`, `Rs ${computed.total.toFixed(0)}`, `Rs ${(billedEnergy - computed.total).toFixed(0)}`]);
  if (billedFixed > 0) tableRows.push(["Fixed charges", `Rs ${billedFixed.toFixed(0)}`, `Rs ${expectedFixed.toFixed(0)}`, `Rs ${(billedFixed - expectedFixed).toFixed(0)}`]);
  if (billedFuel > 0) tableRows.push(["Fuel adjustment", `Rs ${billedFuel.toFixed(0)}`, `Rs ${expectedFuel.toFixed(0)}`, `Rs ${(billedFuel - expectedFuel).toFixed(0)}`]);
  if (billedWheeling > 0) tableRows.push(["Wheeling", `Rs ${billedWheeling.toFixed(0)}`, `Rs ${expectedWheeling.toFixed(0)}`, `Rs ${(billedWheeling - expectedWheeling).toFixed(0)}`]);
  if (billedDuty > 0) tableRows.push(["Electricity duty", `Rs ${billedDuty.toFixed(0)}`, `Rs ${expectedDuty.toFixed(0)}`, `Rs ${(billedDuty - expectedDuty).toFixed(0)}`]);

  return {
    headline: totalOvercharge > 0
      ? `Found Rs ${Math.round(totalOvercharge).toLocaleString("en-IN")} in overcharges across ${highFindings + mediumFindings} issue${highFindings + mediumFindings === 1 ? "" : "s"}.`
      : "Bill arithmetic checks out. No overcharges detected.",

    score: {
      label: "Bill accuracy",
      value: scoreValue,
      max: 100,
      band: scoreBand,
    },

    metrics: [
      { label: "Total overcharge", value: `Rs ${Math.round(totalOvercharge).toLocaleString("en-IN")}` },
      { label: "Issues found", value: String(highFindings + mediumFindings) },
      { label: "Correct bill", value: `Rs ${correctTotal.toFixed(0)}` },
      { label: "Units consumed", value: `${units} kWh` },
    ],

    sections,

    table: tableRows.length > 0 ? {
      columns: ["Component", "Billed", "Correct", "Difference"],
      rows: tableRows,
    } : undefined,

    copyBlocks: totalOvercharge > 0 ? [
      {
        title: "Dispute letter",
        text: [
          `To: ${state} DISCOM - Consumer Grievance Redressal Forum`,
          `Subject: Overcharge of Rs ${Math.round(totalOvercharge)} on electricity bill`,
          ``,
          `I am a domestic consumer with sanctioned load ${sanctionedLoad} kW (${connectionType.toLowerCase()}).`,
          ``,
          `On reviewing my latest bill for ${units} units consumed, I have identified the following discrepancies:`,
          ``,
          ...findings
            .filter((f) => f.severity === "high" || f.severity === "medium")
            .map((f, i) => `${i + 1}. ${f.title}: ${f.body.split(".")[0]}.`),
          ``,
          `Total overcharge: Rs ${Math.round(totalOvercharge)}`,
          ``,
          `I request correction of the bill and refund/adjustment of the overcharged amount as per the applicable tariff order.`,
          ``,
          `[Your name]`,
          `[Consumer number]`,
          `[Date]`,
        ].join("\n"),
        language: "text",
      },
    ] : undefined,

    json: {
      state,
      units,
      sanctionedLoad,
      connectionType,
      totalOvercharge: Math.round(totalOvercharge),
      correctTotal: Math.round(correctTotal),
      findings: findings.filter((f) => f.severity !== "low").map((f) => ({
        title: f.title,
        amount: f.tag,
        severity: f.severity,
      })),
      slabBreakdown: computed.breakdown,
    },
  };
}
