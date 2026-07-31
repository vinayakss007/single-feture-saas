import type { RunInput, RunResult, Severity } from "./types.ts";

/**
 * NutriLabel engine - Analyses food nutrition labels against ICMR/FSSAI
 * daily values and WHO limits. Produces traffic-light ratings, per-100g
 * normalisation, serving size honesty checks, and an overall label rating.
 */

// ICMR/FSSAI daily reference values (2000 kcal diet)
const DAILY_VALUES = {
  calories: 2000,    // kcal
  protein: 50,       // g
  totalFat: 67,      // g
  saturatedFat: 22,  // g
  transFat: 2.2,     // g (WHO: <1% of energy = ~2.2g)
  carbs: 300,        // g
  sugar: 50,         // g (FSSAI added sugar limit)
  fibre: 25,         // g
  sodium: 2000,      // mg
};

// FSA/FSSAI traffic light thresholds per 100g for solid foods
const THRESHOLDS_PER_100G = {
  totalFat:     { green: 3,   amber: 17.5, unit: "g" },
  saturatedFat: { green: 1.5, amber: 5,    unit: "g" },
  sugar:        { green: 5,   amber: 22.5, unit: "g" },
  sodium:       { green: 120, amber: 600,  unit: "mg" },
  fibre:        { green: 6,   amber: 3,    unit: "g", inverted: true },
  protein:      { green: 12,  amber: 6,    unit: "g", inverted: true },
};

type Light = "green" | "amber" | "red";

function trafficLight(per100g: number, thresholds: { green: number; amber: number; inverted?: boolean }): Light {
  if (thresholds.inverted) {
    // Higher is better (fibre, protein)
    if (per100g >= thresholds.green) return "green";
    if (per100g >= thresholds.amber) return "amber";
    return "red";
  }
  // Lower is better (fat, sugar, sodium)
  if (per100g <= thresholds.green) return "green";
  if (per100g <= thresholds.amber) return "amber";
  return "red";
}

function parseNum(val: string | undefined): number {
  if (!val || val.trim() === "") return 0;
  const n = Number(val.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function run(input: RunInput): RunResult {
  const servingSize = parseNum(input.servingSize);
  const packSize = parseNum(input.packSize);
  const calories = parseNum(input.calories);
  const protein = parseNum(input.protein);
  const totalFat = parseNum(input.totalFat);
  const saturatedFat = parseNum(input.saturatedFat);
  const transFat = parseNum(input.transFat);
  const carbs = parseNum(input.carbs);
  const sugar = parseNum(input.sugar);
  const fibre = parseNum(input.fibre);
  const sodium = parseNum(input.sodium);
  const frontClaim = (input.frontClaim ?? "").trim().toLowerCase();

  if (servingSize <= 0) throw new Error("Serving size must be a positive number in grams.");
  if (calories <= 0 && protein <= 0 && totalFat <= 0 && carbs <= 0) {
    throw new Error("Enter at least calories and one macronutrient (protein, fat, or carbs) per serving.");
  }

  // --- Per-100g normalisation ---
  const factor = 100 / servingSize;
  const per100g = {
    calories: calories * factor,
    protein: protein * factor,
    totalFat: totalFat * factor,
    saturatedFat: saturatedFat * factor,
    transFat: transFat * factor,
    carbs: carbs * factor,
    sugar: sugar * factor,
    fibre: fibre * factor,
    sodium: sodium * factor,
  };

  // --- Daily value percentages (based on per-serving) ---
  const dvPct = {
    calories: (calories / DAILY_VALUES.calories) * 100,
    protein: (protein / DAILY_VALUES.protein) * 100,
    totalFat: (totalFat / DAILY_VALUES.totalFat) * 100,
    saturatedFat: (saturatedFat / DAILY_VALUES.saturatedFat) * 100,
    transFat: (transFat / DAILY_VALUES.transFat) * 100,
    carbs: (carbs / DAILY_VALUES.carbs) * 100,
    sugar: (sugar / DAILY_VALUES.sugar) * 100,
    fibre: (fibre / DAILY_VALUES.fibre) * 100,
    sodium: (sodium / DAILY_VALUES.sodium) * 100,
  };

  // --- Traffic lights ---
  const lights: Record<string, Light> = {
    totalFat: trafficLight(per100g.totalFat, THRESHOLDS_PER_100G.totalFat),
    saturatedFat: trafficLight(per100g.saturatedFat, THRESHOLDS_PER_100G.saturatedFat),
    sugar: trafficLight(per100g.sugar, THRESHOLDS_PER_100G.sugar),
    sodium: trafficLight(per100g.sodium, THRESHOLDS_PER_100G.sodium),
    fibre: trafficLight(per100g.fibre, THRESHOLDS_PER_100G.fibre),
    protein: trafficLight(per100g.protein, THRESHOLDS_PER_100G.protein),
  };

  // --- WHO limit checks ---
  const whoFlags: { nutrient: string; detail: string; severity: Severity }[] = [];

  // WHO: free sugars < 10% of total energy (1g sugar = 4 kcal)
  const sugarEnergyPct = calories > 0 ? ((sugar * 4) / (calories)) * 100 : 0;
  if (sugarEnergyPct > 10) {
    whoFlags.push({
      nutrient: "Sugar",
      detail: `Sugar provides ${sugarEnergyPct.toFixed(1)}% of energy per serving. WHO recommends below 10%, ideally below 5%.`,
      severity: sugarEnergyPct > 20 ? "high" : "medium",
    });
  }

  // WHO: sodium < 2000mg/day. Flag if single serving exceeds 20% of daily limit
  const sodiumDvPct = (sodium / DAILY_VALUES.sodium) * 100;
  if (sodiumDvPct > 20) {
    whoFlags.push({
      nutrient: "Sodium",
      detail: `Single serving provides ${sodiumDvPct.toFixed(1)}% of the WHO daily sodium limit (2000mg). ${sodium}mg per serving is excessive.`,
      severity: sodiumDvPct > 40 ? "high" : "medium",
    });
  }

  // WHO: trans fat < 1% of total energy (1g trans fat = 9 kcal)
  const transEnergyPct = calories > 0 ? ((transFat * 9) / (calories)) * 100 : 0;
  if (transFat > 0 && transEnergyPct >= 1) {
    whoFlags.push({
      nutrient: "Trans fat",
      detail: `Trans fat provides ${transEnergyPct.toFixed(1)}% of energy. WHO limit is 1% of total energy intake. Any trans fat above zero is a health concern.`,
      severity: "high",
    });
  } else if (transFat > 0) {
    whoFlags.push({
      nutrient: "Trans fat",
      detail: `Contains ${transFat}g trans fat per serving (${transEnergyPct.toFixed(1)}% of energy). WHO recommends eliminating industrially produced trans fat entirely.`,
      severity: "medium",
    });
  }

  // --- Serving size honesty check ---
  const servingIssues: { title: string; detail: string; severity: Severity }[] = [];
  const servingsPerPack = packSize > 0 ? packSize / servingSize : 0;

  if (packSize > 0 && servingsPerPack > 1) {
    // Flag if pack is clearly single-consumption but claims multiple servings
    if (packSize <= 100 && servingsPerPack >= 2) {
      servingIssues.push({
        title: "Small pack claims multiple servings",
        detail: `A ${packSize}g pack claiming ${servingsPerPack.toFixed(1)} servings of ${servingSize}g each. Most people eat the whole pack in one sitting. Real calories for the pack: ${Math.round(calories * servingsPerPack)} kcal.`,
        severity: "high",
      });
    } else if (packSize <= 200 && servingsPerPack >= 3) {
      servingIssues.push({
        title: "Unrealistically many servings for pack size",
        detail: `A ${packSize}g pack split into ${servingsPerPack.toFixed(1)} servings of ${servingSize}g. The actual intake if you eat the pack: ${Math.round(calories * servingsPerPack)} kcal, ${Math.round(sugar * servingsPerPack)}g sugar, ${Math.round(sodium * servingsPerPack)}mg sodium.`,
        severity: "high",
      });
    } else if (servingsPerPack >= 2 && servingSize <= 25) {
      servingIssues.push({
        title: "Unusually small serving size",
        detail: `${servingSize}g is a very small serving. At ${servingsPerPack.toFixed(1)} servings per pack, the whole-pack values are ${Math.round(calories * servingsPerPack)} kcal and ${Math.round(sugar * servingsPerPack)}g sugar.`,
        severity: "medium",
      });
    }
  }

  // --- Front-of-pack claim validation ---
  const claimIssues: { title: string; detail: string; severity: Severity }[] = [];

  if (frontClaim) {
    // "High protein" - FSSAI: at least 12g per 100g or 20% of energy from protein
    if (/high.*protein|protein.*rich/i.test(frontClaim)) {
      const proteinEnergyPct = calories > 0 ? ((protein * 4) / calories) * 100 : 0;
      if (per100g.protein < 12 && proteinEnergyPct < 20) {
        claimIssues.push({
          title: "\"High protein\" claim is not substantiated",
          detail: `Only ${per100g.protein.toFixed(1)}g protein per 100g (needs 12g) and ${proteinEnergyPct.toFixed(1)}% energy from protein (needs 20%). This claim does not meet FSSAI criteria.`,
          severity: "high",
        });
      }
    }

    // "Low fat" - FSSAI: not more than 3g per 100g
    if (/low.*fat/i.test(frontClaim)) {
      if (per100g.totalFat > 3) {
        claimIssues.push({
          title: "\"Low fat\" claim is not substantiated",
          detail: `Contains ${per100g.totalFat.toFixed(1)}g fat per 100g. FSSAI 'low fat' requires not more than 3g per 100g.`,
          severity: "high",
        });
      }
    }

    // "Sugar free" - FSSAI: not more than 0.5g per 100g
    if (/sugar.*free|no.*sugar/i.test(frontClaim)) {
      if (per100g.sugar > 0.5) {
        claimIssues.push({
          title: "\"Sugar free\" claim is invalid",
          detail: `Contains ${per100g.sugar.toFixed(1)}g sugar per 100g. 'Sugar free' requires not more than 0.5g per 100g.`,
          severity: "high",
        });
      }
    }

    // "Light" / "Lite" - must be at least 30% less fat or calories vs reference
    if (/\b(light|lite)\b/i.test(frontClaim)) {
      if (per100g.totalFat > 17.5 || per100g.calories > 400) {
        claimIssues.push({
          title: "\"Light\" claim is questionable",
          detail: `With ${per100g.totalFat.toFixed(1)}g fat and ${Math.round(per100g.calories)} kcal per 100g, this product is not light by any standard measure.`,
          severity: "medium",
        });
      }
    }
  }

  // --- Overall label rating ---
  let labelRating: "honest" | "misleading" | "deceptive";
  let labelReason: string;

  const redCount = Object.values(lights).filter((l) => l === "red").length;
  const hasClaimIssues = claimIssues.length > 0;
  const hasServingIssues = servingIssues.filter((i) => i.severity === "high").length > 0;

  if (hasClaimIssues && hasServingIssues) {
    labelRating = "deceptive";
    labelReason = "Front-of-pack claims do not match actual nutrition AND serving size is designed to obscure true intake. Both deception vectors are active.";
  } else if (hasClaimIssues && redCount >= 2) {
    labelRating = "deceptive";
    labelReason = `Front-of-pack claims contradict the nutrition facts. ${redCount} nutrients are in the red zone while the label suggests a healthy product.`;
  } else if (hasServingIssues || hasClaimIssues) {
    labelRating = "misleading";
    labelReason = hasServingIssues
      ? "Serving size appears designed to make the numbers look better than real-world consumption."
      : "Front-of-pack claims do not fully align with actual nutrition values.";
  } else if (redCount >= 3) {
    labelRating = "misleading";
    labelReason = `${redCount} nutrients in the red zone. While no explicit claims are made, the overall nutrient profile is poor and the label does not draw attention to it.`;
  } else {
    labelRating = "honest";
    labelReason = "Nutrition facts are presented straightforwardly with no misleading claims or serving size manipulation detected.";
  }

  // --- Score ---
  let penalty = 0;
  penalty += redCount * 8;
  penalty += whoFlags.filter((f) => f.severity === "high").length * 12;
  penalty += whoFlags.filter((f) => f.severity === "medium").length * 6;
  penalty += claimIssues.length * 15;
  penalty += servingIssues.filter((i) => i.severity === "high").length * 12;
  penalty += servingIssues.filter((i) => i.severity === "medium").length * 5;

  const score = Math.max(0, Math.min(100, 100 - penalty));
  const band = score >= 70 ? "good" : score >= 40 ? "warn" : "bad";

  // --- Build result ---
  const lightLabels: Record<string, string> = {
    totalFat: "Total Fat",
    saturatedFat: "Saturated Fat",
    sugar: "Sugar",
    sodium: "Sodium",
    fibre: "Fibre",
    protein: "Protein",
  };

  const trafficLightItems = Object.entries(lights).map(([key, light]) => {
    const per100 = per100g[key as keyof typeof per100g];
    const unit = THRESHOLDS_PER_100G[key as keyof typeof THRESHOLDS_PER_100G].unit;
    const emoji = light === "green" ? "GREEN" : light === "amber" ? "AMBER" : "RED";
    return {
      title: `${lightLabels[key]}: ${emoji}`,
      body: `${per100.toFixed(1)}${unit} per 100g. ${dvPct[key as keyof typeof dvPct].toFixed(0)}% of daily value per serving.`,
      severity: (light === "red" ? "high" : light === "amber" ? "medium" : "low") as Severity,
    };
  });

  const headline =
    labelRating === "deceptive"
      ? `This label is deceptive. ${claimIssues.length > 0 ? claimIssues[0].title + "." : ""} ${servingIssues.length > 0 ? servingIssues[0].title + "." : ""}`
      : labelRating === "misleading"
        ? `This label is misleading. ${redCount} nutrients in the red zone${servingIssues.length > 0 ? " and the serving size obscures true intake" : ""}.`
        : `Label is honest. ${redCount === 0 ? "All nutrients within acceptable ranges." : `${redCount} nutrient${redCount === 1 ? "" : "s"} in the red zone but no deceptive practices.`}`;

  return {
    headline,
    score: { label: "Label honesty score", value: score, max: 100, band },
    metrics: [
      { label: "Rating", value: labelRating.toUpperCase(), hint: labelReason.slice(0, 60) },
      { label: "Red lights", value: String(redCount), hint: `of ${Object.keys(lights).length} nutrients` },
      { label: "WHO flags", value: String(whoFlags.length), hint: "sugar/sodium/trans fat" },
      { label: "Calories per 100g", value: String(Math.round(per100g.calories)), hint: "kcal" },
    ],
    table: {
      columns: ["Nutrient", "Per Serving", "Per 100g", "% Daily Value", "Traffic Light"],
      rows: [
        ["Calories", `${calories} kcal`, `${Math.round(per100g.calories)} kcal`, `${dvPct.calories.toFixed(1)}%`, "-"],
        ["Protein", `${protein}g`, `${per100g.protein.toFixed(1)}g`, `${dvPct.protein.toFixed(1)}%`, lights.protein.toUpperCase()],
        ["Total Fat", `${totalFat}g`, `${per100g.totalFat.toFixed(1)}g`, `${dvPct.totalFat.toFixed(1)}%`, lights.totalFat.toUpperCase()],
        ["Saturated Fat", `${saturatedFat}g`, `${per100g.saturatedFat.toFixed(1)}g`, `${dvPct.saturatedFat.toFixed(1)}%`, lights.saturatedFat.toUpperCase()],
        ["Trans Fat", `${transFat}g`, `${per100g.transFat.toFixed(1)}g`, `${dvPct.transFat.toFixed(1)}%`, "-"],
        ["Carbohydrates", `${carbs}g`, `${per100g.carbs.toFixed(1)}g`, `${dvPct.carbs.toFixed(1)}%`, "-"],
        ["Sugar", `${sugar}g`, `${per100g.sugar.toFixed(1)}g`, `${dvPct.sugar.toFixed(1)}%`, lights.sugar.toUpperCase()],
        ["Fibre", `${fibre}g`, `${per100g.fibre.toFixed(1)}g`, `${dvPct.fibre.toFixed(1)}%`, lights.fibre.toUpperCase()],
        ["Sodium", `${sodium}mg`, `${per100g.sodium.toFixed(1)}mg`, `${dvPct.sodium.toFixed(1)}%`, lights.sodium.toUpperCase()],
      ],
    },
    sections: [
      {
        title: "Traffic Light Summary",
        items: trafficLightItems,
      },
      {
        title: `WHO Limit Flags (${whoFlags.length})`,
        items: whoFlags.map((f) => ({
          title: f.nutrient,
          body: f.detail,
          severity: f.severity,
        })),
      },
      {
        title: "Serving Size Analysis",
        items: servingIssues.length > 0
          ? servingIssues.map((i) => ({ title: i.title, body: i.detail, severity: i.severity }))
          : [{ title: "Serving size", body: packSize > 0 ? `${servingSize}g serving, ${servingsPerPack.toFixed(1)} servings per ${packSize}g pack. No manipulation detected.` : `${servingSize}g serving. Provide pack size for a full honesty check.`, severity: "low" as Severity }],
      },
      {
        title: "Front-of-Pack Claim Check",
        items: frontClaim
          ? claimIssues.length > 0
            ? claimIssues.map((i) => ({ title: i.title, body: i.detail, severity: i.severity }))
            : [{ title: `"${input.frontClaim}" claim`, body: "Claim appears substantiated by the nutrition facts.", severity: "low" as Severity }]
          : [{ title: "No claim", body: "No front-of-pack nutrition or health claim provided for validation.", severity: "low" as Severity }],
      },
      {
        title: "Label Rating",
        items: [{ title: labelRating.toUpperCase(), body: labelReason, severity: labelRating === "deceptive" ? "high" : labelRating === "misleading" ? "medium" : "low" }],
      },
    ],
    json: {
      labelRating,
      labelReason,
      score,
      band,
      per100g,
      dvPct,
      trafficLights: lights,
      whoFlags,
      servingIssues,
      claimIssues,
      servingSize,
      packSize: packSize || null,
      servingsPerPack: packSize > 0 ? Number(servingsPerPack.toFixed(1)) : null,
      wholePackValues: packSize > 0 && servingsPerPack > 1 ? {
        calories: Math.round(calories * servingsPerPack),
        protein: Number((protein * servingsPerPack).toFixed(1)),
        totalFat: Number((totalFat * servingsPerPack).toFixed(1)),
        sugar: Number((sugar * servingsPerPack).toFixed(1)),
        sodium: Math.round(sodium * servingsPerPack),
      } : null,
    },
  };
}
