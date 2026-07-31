import type { ResultItem, RunInput, RunResult, Severity } from "./types.ts";

/**
 * Property tax calculator for Indian metro cities.
 *
 * Implements three computation methods:
 * - Capital Value (Mumbai, Pune, Hyderabad): tax on market value
 * - Unit Area Value (Bengaluru, Delhi, Kolkata): rate x area x factors
 * - Annual Rental Value (Chennai): tax on estimated rental income
 */

// ---------------------------------------------------------------------------
// City-specific tax configuration
// ---------------------------------------------------------------------------

type TaxMethod = "capital_value" | "unit_area" | "annual_rental_value";

type CityTaxConfig = {
  method: TaxMethod;
  baseRatePerSqft: number;
  taxPercentage: number;
  locationFactor: number;
  selfOccupiedRebate: number;
  earlyPaymentRebate: number;
  vacantRebate: number;
  ageFactor: (age: number) => number;
  floorFactor: (floor: string) => number;
  usageFactor: (usage: string) => number;
  educationCess: number;
  libraryCess: number;
  description: string;
};

function standardAgeFactor(age: number): number {
  if (age <= 5) return 1.0;
  if (age <= 10) return 0.95;
  if (age <= 15) return 0.90;
  if (age <= 25) return 0.80;
  return 0.70;
}

function standardFloorFactor(floor: string): number {
  if (floor === "Ground") return 1.0;
  if (floor === "1-4") return 1.05;
  if (floor === "5-10") return 1.10;
  if (floor === "11-15") return 1.15;
  return 1.20; // 16+
}

function standardUsageFactor(usage: string): number {
  if (usage.startsWith("Residential")) return 1.0;
  if (usage === "Commercial") return 2.5;
  return 1.5; // Mixed use
}

const CITY_TAX: Record<string, CityTaxConfig> = {
  "Mumbai": {
    method: "capital_value",
    baseRatePerSqft: 12000,
    taxPercentage: 0.003,
    locationFactor: 1.0,
    selfOccupiedRebate: 0.40,
    earlyPaymentRebate: 0.05,
    vacantRebate: 0.50,
    ageFactor: standardAgeFactor,
    floorFactor: standardFloorFactor,
    usageFactor: standardUsageFactor,
    educationCess: 0.15,
    libraryCess: 0.03,
    description: "BMC uses the Capital Value method. Tax is computed as a percentage of the property's capital (market) value, which is derived from Ready Reckoner rates.",
  },
  "Bengaluru": {
    method: "unit_area",
    baseRatePerSqft: 5,
    taxPercentage: 0.20,
    locationFactor: 1.0,
    selfOccupiedRebate: 0.50,
    earlyPaymentRebate: 0.05,
    vacantRebate: 0.50,
    ageFactor: standardAgeFactor,
    floorFactor: standardFloorFactor,
    usageFactor: standardUsageFactor,
    educationCess: 0.10,
    libraryCess: 0.03,
    description: "BBMP uses the Unit Area Value (UAV) method. Annual tax = per-sqft rate x built-up area x usage factor x age factor x floor factor, then taxed at 20%.",
  },
  "Delhi": {
    method: "unit_area",
    baseRatePerSqft: 6,
    taxPercentage: 0.12,
    locationFactor: 1.0,
    selfOccupiedRebate: 0.30,
    earlyPaymentRebate: 0.10,
    vacantRebate: 0.50,
    ageFactor: standardAgeFactor,
    floorFactor: standardFloorFactor,
    usageFactor: standardUsageFactor,
    educationCess: 0.05,
    libraryCess: 0.00,
    description: "MCD uses the Unit Area Value method with structure, age, use, and occupancy factors applied to a per-sqft base rate.",
  },
  "Chennai": {
    method: "annual_rental_value",
    baseRatePerSqft: 8,
    taxPercentage: 0.12,
    locationFactor: 1.0,
    selfOccupiedRebate: 0.25,
    earlyPaymentRebate: 0.05,
    vacantRebate: 0.50,
    ageFactor: standardAgeFactor,
    floorFactor: standardFloorFactor,
    usageFactor: standardUsageFactor,
    educationCess: 0.10,
    libraryCess: 0.05,
    description: "GCC uses the Annual Rental Value (ARV) method. The annual value is estimated from expected rental income, and property tax is levied as a percentage of ARV.",
  },
  "Hyderabad": {
    method: "capital_value",
    baseRatePerSqft: 8000,
    taxPercentage: 0.002,
    locationFactor: 1.0,
    selfOccupiedRebate: 0.25,
    earlyPaymentRebate: 0.05,
    vacantRebate: 0.50,
    ageFactor: standardAgeFactor,
    floorFactor: standardFloorFactor,
    usageFactor: standardUsageFactor,
    educationCess: 0.10,
    libraryCess: 0.05,
    description: "GHMC uses the Capital Value method. Tax = capital value x tax rate. Capital value is derived from SRO (Sub-Registrar Office) market rates per sqft.",
  },
  "Pune": {
    method: "capital_value",
    baseRatePerSqft: 9000,
    taxPercentage: 0.0025,
    locationFactor: 1.0,
    selfOccupiedRebate: 0.40,
    earlyPaymentRebate: 0.05,
    vacantRebate: 0.50,
    ageFactor: standardAgeFactor,
    floorFactor: standardFloorFactor,
    usageFactor: standardUsageFactor,
    educationCess: 0.15,
    libraryCess: 0.03,
    description: "PMC uses the Capital Value method similar to Mumbai. Tax is a percentage of the property's market value based on Ready Reckoner rates, adjusted for age and usage.",
  },
  "Kolkata": {
    method: "unit_area",
    baseRatePerSqft: 4,
    taxPercentage: 0.15,
    locationFactor: 1.0,
    selfOccupiedRebate: 0.30,
    earlyPaymentRebate: 0.05,
    vacantRebate: 0.50,
    ageFactor: standardAgeFactor,
    floorFactor: standardFloorFactor,
    usageFactor: standardUsageFactor,
    educationCess: 0.10,
    libraryCess: 0.05,
    description: "KMC uses the Unit Area Assessment system. Annual value = base unit area rate x covered area x location, multiplied by factors for usage, age, and structure.",
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

// ---------------------------------------------------------------------------
// Main computation
// ---------------------------------------------------------------------------

export async function run(input: RunInput): Promise<RunResult> {
  const city = input.city ?? "";
  const propertyType = input.propertyType ?? "Flat / Apartment";
  const builtUpArea = toNumber(input.builtUpArea);
  const propertyAge = toNumber(input.propertyAge);
  const usage = input.usage ?? "Residential - Self occupied";
  const floor = input.floor ?? "Ground";
  const occupancy = input.occupancy ?? "Occupied";

  if (!CITY_TAX[city]) {
    throw new Error(`Select a valid city. Supported: ${Object.keys(CITY_TAX).join(", ")}.`);
  }
  if (builtUpArea <= 0) {
    throw new Error("Enter the built-up area in square feet. This is usually on your sale deed or society records.");
  }
  if (propertyAge < 0) {
    throw new Error("Property age cannot be negative. Enter the number of years since the completion certificate was issued.");
  }

  const config = CITY_TAX[city];
  const ageFact = config.ageFactor(propertyAge);
  const floorFact = config.floorFactor(floor);
  const usageFact = config.usageFactor(usage);
  const isSelfOccupied = usage === "Residential - Self occupied";
  const isVacant = occupancy === "Vacant";

  const steps: { label: string; value: string; formula: string }[] = [];
  let baseTax = 0;
  let annualValue = 0;

  if (config.method === "capital_value") {
    // Capital value = base rate per sqft x area x usage x floor x age
    const capitalValue = config.baseRatePerSqft * builtUpArea * usageFact * floorFact * ageFact;
    annualValue = capitalValue;
    baseTax = capitalValue * config.taxPercentage;

    steps.push({
      label: "Base rate per sqft",
      value: `Rs ${config.baseRatePerSqft.toLocaleString("en-IN")}`,
      formula: "From Ready Reckoner / SRO market rate",
    });
    steps.push({
      label: "Built-up area",
      value: `${builtUpArea} sq ft`,
      formula: "As entered",
    });
    steps.push({
      label: "Usage factor",
      value: usageFact.toFixed(2),
      formula: `${usage} = ${usageFact}x`,
    });
    steps.push({
      label: "Floor factor",
      value: floorFact.toFixed(2),
      formula: `Floor ${floor} = ${floorFact}x`,
    });
    steps.push({
      label: "Age depreciation factor",
      value: ageFact.toFixed(2),
      formula: `${propertyAge} years old = ${ageFact}x`,
    });
    steps.push({
      label: "Capital value",
      value: `Rs ${Math.round(capitalValue).toLocaleString("en-IN")}`,
      formula: `${config.baseRatePerSqft} x ${builtUpArea} x ${usageFact} x ${floorFact} x ${ageFact}`,
    });
    steps.push({
      label: "Tax rate",
      value: `${(config.taxPercentage * 100).toFixed(2)}%`,
      formula: `Per ${city} municipal rate card`,
    });
    steps.push({
      label: "Base property tax",
      value: `Rs ${Math.round(baseTax).toLocaleString("en-IN")}`,
      formula: `Capital value x ${(config.taxPercentage * 100).toFixed(2)}%`,
    });
  } else if (config.method === "unit_area") {
    // Unit area value = base rate x area x usage x floor x age
    annualValue = config.baseRatePerSqft * builtUpArea * usageFact * floorFact * ageFact * 12;
    baseTax = annualValue * config.taxPercentage;

    steps.push({
      label: "Base rate per sqft/month",
      value: `Rs ${config.baseRatePerSqft}`,
      formula: `${city} municipal rate schedule`,
    });
    steps.push({
      label: "Built-up area",
      value: `${builtUpArea} sq ft`,
      formula: "As entered",
    });
    steps.push({
      label: "Usage factor",
      value: usageFact.toFixed(2),
      formula: `${usage} = ${usageFact}x`,
    });
    steps.push({
      label: "Floor factor",
      value: floorFact.toFixed(2),
      formula: `Floor ${floor} = ${floorFact}x`,
    });
    steps.push({
      label: "Age depreciation factor",
      value: ageFact.toFixed(2),
      formula: `${propertyAge} years old = ${ageFact}x`,
    });
    steps.push({
      label: "Monthly unit area value",
      value: `Rs ${Math.round(annualValue / 12).toLocaleString("en-IN")}`,
      formula: `${config.baseRatePerSqft} x ${builtUpArea} x ${usageFact} x ${floorFact} x ${ageFact}`,
    });
    steps.push({
      label: "Annual value",
      value: `Rs ${Math.round(annualValue).toLocaleString("en-IN")}`,
      formula: "Monthly value x 12",
    });
    steps.push({
      label: "Tax rate",
      value: `${(config.taxPercentage * 100).toFixed(0)}%`,
      formula: `Per ${city} municipal rate card`,
    });
    steps.push({
      label: "Base property tax",
      value: `Rs ${Math.round(baseTax).toLocaleString("en-IN")}`,
      formula: `Annual value x ${(config.taxPercentage * 100).toFixed(0)}%`,
    });
  } else {
    // Annual rental value
    const monthlyRent = config.baseRatePerSqft * builtUpArea * usageFact * floorFact * ageFact;
    annualValue = monthlyRent * 12;
    baseTax = annualValue * config.taxPercentage;

    steps.push({
      label: "Estimated monthly rental rate/sqft",
      value: `Rs ${config.baseRatePerSqft}`,
      formula: `${city} GCC schedule of expected rent`,
    });
    steps.push({
      label: "Built-up area",
      value: `${builtUpArea} sq ft`,
      formula: "As entered",
    });
    steps.push({
      label: "Usage factor",
      value: usageFact.toFixed(2),
      formula: `${usage} = ${usageFact}x`,
    });
    steps.push({
      label: "Floor factor",
      value: floorFact.toFixed(2),
      formula: `Floor ${floor} = ${floorFact}x`,
    });
    steps.push({
      label: "Age depreciation factor",
      value: ageFact.toFixed(2),
      formula: `${propertyAge} years old = ${ageFact}x`,
    });
    steps.push({
      label: "Estimated monthly rental value",
      value: `Rs ${Math.round(monthlyRent).toLocaleString("en-IN")}`,
      formula: `${config.baseRatePerSqft} x ${builtUpArea} x ${usageFact} x ${floorFact} x ${ageFact}`,
    });
    steps.push({
      label: "Annual rental value (ARV)",
      value: `Rs ${Math.round(annualValue).toLocaleString("en-IN")}`,
      formula: "Monthly rental x 12",
    });
    steps.push({
      label: "Tax rate on ARV",
      value: `${(config.taxPercentage * 100).toFixed(0)}%`,
      formula: `Per ${city} municipal rate card`,
    });
    steps.push({
      label: "Base property tax",
      value: `Rs ${Math.round(baseTax).toLocaleString("en-IN")}`,
      formula: `ARV x ${(config.taxPercentage * 100).toFixed(0)}%`,
    });
  }

  // Cesses
  const educationCess = baseTax * config.educationCess;
  const libraryCess = baseTax * config.libraryCess;
  const totalBeforeRebate = baseTax + educationCess + libraryCess;

  steps.push({
    label: "Education cess",
    value: `Rs ${Math.round(educationCess).toLocaleString("en-IN")}`,
    formula: `${(config.educationCess * 100).toFixed(0)}% of base tax`,
  });
  if (config.libraryCess > 0) {
    steps.push({
      label: "Library cess",
      value: `Rs ${Math.round(libraryCess).toLocaleString("en-IN")}`,
      formula: `${(config.libraryCess * 100).toFixed(0)}% of base tax`,
    });
  }
  steps.push({
    label: "Total before rebates",
    value: `Rs ${Math.round(totalBeforeRebate).toLocaleString("en-IN")}`,
    formula: "Base tax + education cess + library cess",
  });

  // Rebates
  const rebates: { label: string; amount: number; detail: string }[] = [];
  let totalRebate = 0;

  if (isSelfOccupied) {
    const rebateAmt = totalBeforeRebate * config.selfOccupiedRebate;
    rebates.push({
      label: "Self-occupied residential rebate",
      amount: rebateAmt,
      detail: `${(config.selfOccupiedRebate * 100).toFixed(0)}% rebate for self-occupied residential property`,
    });
    totalRebate += rebateAmt;
  }

  if (isVacant) {
    const rebateAmt = totalBeforeRebate * config.vacantRebate;
    rebates.push({
      label: "Vacant property rebate",
      amount: rebateAmt,
      detail: `${(config.vacantRebate * 100).toFixed(0)}% rebate for vacant/unoccupied property`,
    });
    totalRebate += rebateAmt;
  }

  const earlyPaymentAmt = totalBeforeRebate * config.earlyPaymentRebate;
  rebates.push({
    label: "Early payment rebate (if paid before due date)",
    amount: earlyPaymentAmt,
    detail: `${(config.earlyPaymentRebate * 100).toFixed(0)}% rebate for payment before the annual due date`,
  });

  const finalTax = Math.round(totalBeforeRebate - totalRebate);
  const finalTaxWithEarly = Math.round(totalBeforeRebate - totalRebate - earlyPaymentAmt);

  // Build result sections
  const computationItems: ResultItem[] = steps.map((s) => ({
    title: s.label,
    body: `${s.value} (${s.formula})`,
    severity: "low" as Severity,
  }));

  const rebateItems: ResultItem[] = rebates.map((r) => ({
    title: `${r.label}: Rs ${Math.round(r.amount).toLocaleString("en-IN")}`,
    body: r.detail,
    severity: "medium" as Severity,
  }));

  rebateItems.push({
    title: `Final tax payable: Rs ${finalTax.toLocaleString("en-IN")}`,
    body: `After applicable rebates (excluding early payment). With early payment rebate: Rs ${finalTaxWithEarly.toLocaleString("en-IN")}.`,
    severity: "high" as Severity,
  });

  const sections: { title: string; items: ResultItem[] }[] = [
    {
      title: `Method: ${config.method.replace(/_/g, " ")} (${city})`,
      items: [{
        title: config.description,
        body: `Property: ${propertyType}, ${builtUpArea} sq ft, ${propertyAge} years old, floor ${floor}, ${usage.toLowerCase()}, ${occupancy.toLowerCase()}.`,
        severity: "low" as Severity,
      }],
    },
    { title: "Step-by-step computation", items: computationItems },
    { title: "Rebates and final amount", items: rebateItems },
    {
      title: "Important notes",
      items: [
        {
          body: "This computation uses published base rates. Actual rates may vary by sub-zone/ward within the city. Check your ward's specific rate card.",
          severity: "low" as Severity,
        },
        {
          body: `Late payment penalty: Most cities charge 1-2% per month on unpaid tax after the due date. ${city === "Mumbai" ? "BMC charges 2% per month." : city === "Delhi" ? "MCD charges 1% per month." : "Check your municipal website for the exact penalty rate."}`,
          severity: "medium" as Severity,
        },
        {
          body: "Senior citizens (65+) may be eligible for an additional 10-20% rebate in some cities. Contact your municipal ward office.",
          severity: "low" as Severity,
        },
      ],
    },
  ];

  // Table: computation summary
  const tableRows = steps.map((s) => [s.label, s.value, s.formula]);

  const scoreBand = finalTax < 10000 ? "good" as const
    : finalTax < 30000 ? "warn" as const
    : "bad" as const;

  return {
    headline: `Annual property tax for your ${builtUpArea} sq ft ${propertyType.toLowerCase()} in ${city}: Rs ${finalTax.toLocaleString("en-IN")} (Rs ${finalTaxWithEarly.toLocaleString("en-IN")} with early payment).`,

    score: {
      label: "Tax burden",
      value: Math.min(100, Math.round((finalTax / annualValue) * 100 * 10)),
      max: 100,
      band: scoreBand,
    },

    metrics: [
      { label: "Annual tax", value: `Rs ${finalTax.toLocaleString("en-IN")}` },
      { label: "With early payment", value: `Rs ${finalTaxWithEarly.toLocaleString("en-IN")}` },
      { label: "Method", value: config.method.replace(/_/g, " ") },
      { label: "Monthly equivalent", value: `Rs ${Math.round(finalTax / 12).toLocaleString("en-IN")}` },
    ],

    sections,

    table: {
      columns: ["Step", "Value", "Basis"],
      rows: tableRows,
    },

    copyBlocks: [
      {
        title: "Property tax computation summary",
        text: [
          `Property Tax Computation - ${city}`,
          `${"=".repeat(40)}`,
          `Method: ${config.method.replace(/_/g, " ")}`,
          `Property: ${propertyType}, ${builtUpArea} sq ft`,
          `Age: ${propertyAge} years | Floor: ${floor} | Usage: ${usage}`,
          ``,
          `Computation:`,
          ...steps.map((s) => `  ${s.label}: ${s.value}`),
          ``,
          `Rebates:`,
          ...rebates.map((r) => `  ${r.label}: Rs ${Math.round(r.amount).toLocaleString("en-IN")}`),
          ``,
          `Final tax payable: Rs ${finalTax.toLocaleString("en-IN")}`,
          `With early payment rebate: Rs ${finalTaxWithEarly.toLocaleString("en-IN")}`,
          ``,
          `Note: Based on published rates. Verify with your ward office.`,
        ].join("\n"),
        language: "text",
      },
    ],

    json: {
      city,
      method: config.method,
      builtUpArea,
      propertyAge,
      usage,
      floor,
      occupancy,
      annualValue: Math.round(annualValue),
      baseTax: Math.round(baseTax),
      educationCess: Math.round(educationCess),
      libraryCess: Math.round(libraryCess),
      totalBeforeRebate: Math.round(totalBeforeRebate),
      rebates: rebates.map((r) => ({ label: r.label, amount: Math.round(r.amount) })),
      finalTax,
      finalTaxWithEarlyPayment: finalTaxWithEarly,
      steps: steps.map((s) => ({ label: s.label, value: s.value })),
    },
  };
}
