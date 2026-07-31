import type { RunInput, RunResult, Severity } from "./types.ts";

/**
 * PetDose engine - Computes vaccine schedules, deworming timelines,
 * flea/tick prevention, heartworm prevention, and weight-based dosing.
 */

// Weight bands for common preventatives (in kg)
const IVERMECTIN_DOSE = [ // mcg/kg: 6 mcg/kg for heartworm prevention
  { min: 0, max: 5, dose: "68 mcg tablet (small dog)", product: "Heartgard Plus Small" },
  { min: 5, max: 11, dose: "136 mcg tablet", product: "Heartgard Plus 0-11 kg" },
  { min: 11, max: 22, dose: "136 mcg tablet", product: "Heartgard Plus 12-22 kg" },
  { min: 22, max: 45, dose: "272 mcg tablet", product: "Heartgard Plus 23-45 kg" },
  { min: 45, max: 100, dose: "410 mcg tablet (extra large)", product: "Heartgard Plus >45 kg" },
];

const MILBEMYCIN_DOSE = [ // for heartworm + intestinal worms
  { min: 0, max: 5, dose: "2.5 mg + 25 mg praziquantel", product: "Milbemax Small Dog" },
  { min: 5, max: 25, dose: "12.5 mg + 125 mg praziquantel", product: "Milbemax Large Dog" },
  { min: 25, max: 50, dose: "2 tablets (12.5 mg each)", product: "Milbemax Large Dog x2" },
  { min: 50, max: 75, dose: "3 tablets", product: "Milbemax Large Dog x3" },
];

const FIPRONIL_DOSE = [ // spot-on for flea/tick (mL)
  { min: 0, max: 10, dose: "0.67 mL pipette", product: "Fipronil Small (2-10 kg)" },
  { min: 10, max: 20, dose: "1.34 mL pipette", product: "Fipronil Medium (10-20 kg)" },
  { min: 20, max: 40, dose: "2.68 mL pipette", product: "Fipronil Large (20-40 kg)" },
  { min: 40, max: 60, dose: "4.02 mL pipette", product: "Fipronil XL (40-60 kg)" },
];

const PRAZIQUANTEL_DOSE = [ // dewormer
  { min: 0, max: 5, dose: "50 mg (half tablet)", product: "Praziquantel 100mg - 1/2 tab" },
  { min: 5, max: 10, dose: "100 mg (1 tablet)", product: "Praziquantel 100mg - 1 tab" },
  { min: 10, max: 20, dose: "200 mg (2 tablets)", product: "Praziquantel 100mg - 2 tabs" },
  { min: 20, max: 30, dose: "300 mg (3 tablets)", product: "Praziquantel 100mg - 3 tabs" },
  { min: 30, max: 45, dose: "400 mg (4 tablets)", product: "Praziquantel 100mg - 4 tabs" },
  { min: 45, max: 70, dose: "500 mg (5 tablets)", product: "Praziquantel 100mg - 5 tabs" },
];

const CAT_FIPRONIL_DOSE = [
  { min: 0, max: 8, dose: "0.5 mL pipette", product: "Fipronil Cat (up to 8 kg)" },
  { min: 8, max: 15, dose: "0.5 mL pipette (consult vet for large cats)", product: "Fipronil Cat" },
];

// Breeds with known ivermectin sensitivity (MDR1 gene)
const IVERMECTIN_SENSITIVE_BREEDS = [
  "collie", "border collie", "australian shepherd", "shetland sheepdog",
  "sheltie", "old english sheepdog", "english shepherd", "longhaired whippet",
  "silken windhound", "mcnab", "miniature australian shepherd",
];

function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === "") return null;
  const d = new Date(dateStr.trim());
  if (isNaN(d.getTime())) return null;
  return d;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function getDoseForWeight(weight: number, table: typeof IVERMECTIN_DOSE): { dose: string; product: string } | null {
  for (const entry of table) {
    if (weight >= entry.min && weight < entry.max) {
      return { dose: entry.dose, product: entry.product };
    }
  }
  // If above max, use the last entry
  const last = table[table.length - 1];
  if (weight >= last.min) return { dose: last.dose, product: last.product };
  return null;
}

export function run(input: RunInput): RunResult {
  const species = (input.species ?? "").trim();
  const breed = (input.breed ?? "").trim();
  const weight = Number(input.weight ?? "0");
  const ageMonths = Number(input.ageMonths ?? "0");
  const lastVaccineDate = parseDate(input.lastVaccineDate ?? "");
  const lastRabiesDate = parseDate(input.lastRabiesDate ?? "");
  const lastDewormDate = parseDate(input.lastDewormDate ?? "");
  const lastFleaTickDate = parseDate(input.lastFleaTickDate ?? "");

  if (!species) throw new Error("Select species (Dog or Cat). Vaccine schedules differ between them.");
  if (species !== "Dog" && species !== "Cat") throw new Error("Species must be Dog or Cat.");
  if (!weight || weight <= 0) throw new Error("Enter your pet's current weight in kg (e.g., 18 for an 18kg dog). Needed for dose calculations.");
  if (weight > 100) throw new Error("Weight above 100 kg is unusual for a pet. Please enter weight in kg, not grams.");
  if (!ageMonths || ageMonths <= 0) throw new Error("Enter your pet's age in months (e.g., 36 for a 3-year-old). Determines which schedule applies.");
  if (ageMonths > 300) throw new Error("Age above 25 years (300 months) is unusual. Please enter age in months.");
  if (!lastVaccineDate) throw new Error("Enter the date of last core vaccine (DHPP for dogs, FVRCP for cats) in YYYY-MM-DD format. If never vaccinated, enter a past date like 2020-01-01.");
  if (!lastDewormDate) throw new Error("Enter the date of last deworming in YYYY-MM-DD format.");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDog = species === "Dog";
  const isPuppy = isDog ? ageMonths < 12 : ageMonths < 12; // under 1 year
  const isKitten = !isDog && ageMonths < 12;
  const isJuvenile = ageMonths >= 4 && ageMonths < 12;

  // --- Vaccine Schedule ---
  const vaccines: { name: string; lastDate: Date | null; nextDue: Date; intervalDesc: string; overdue: boolean; daysOverdue: number }[] = [];

  // Core vaccine (DHPP for dogs, FVRCP for cats)
  const coreVaccineName = isDog ? "DHPP (Distemper/Hepatitis/Parvo/Parainfluenza)" : "FVRCP (Rhinotracheitis/Calicivirus/Panleukopenia)";
  let coreInterval: number;
  if (isPuppy || isKitten) {
    coreInterval = 21; // 3-4 weeks for puppy/kitten series
  } else if (ageMonths < 24) {
    coreInterval = 365; // annual booster for young adults
  } else {
    coreInterval = 365 * 3; // every 3 years for adults (modern protocol)
  }
  const coreNextDue = addDays(lastVaccineDate, coreInterval);
  const coreOverdue = coreNextDue < today;

  vaccines.push({
    name: coreVaccineName,
    lastDate: lastVaccineDate,
    nextDue: coreNextDue,
    intervalDesc: isPuppy || isKitten ? "Every 3-4 weeks (puppy/kitten series)" : ageMonths < 24 ? "Annually (young adult)" : "Every 3 years (adult protocol)",
    overdue: coreOverdue,
    daysOverdue: coreOverdue ? daysBetween(coreNextDue, today) : 0,
  });

  // Rabies
  const rabiesInterval = 365; // Annual in India (some use triennial)
  if (lastRabiesDate) {
    const rabiesNextDue = addDays(lastRabiesDate, rabiesInterval);
    const rabiesOverdue = rabiesNextDue < today;
    vaccines.push({
      name: "Rabies",
      lastDate: lastRabiesDate,
      nextDue: rabiesNextDue,
      intervalDesc: "Annually (India protocol). First at 12-16 weeks.",
      overdue: rabiesOverdue,
      daysOverdue: rabiesOverdue ? daysBetween(rabiesNextDue, today) : 0,
    });
  } else {
    vaccines.push({
      name: "Rabies",
      lastDate: null,
      nextDue: today, // Due now if never given
      intervalDesc: "NEVER GIVEN - due immediately if pet is 12+ weeks old",
      overdue: ageMonths >= 3,
      daysOverdue: ageMonths >= 3 ? 999 : 0,
    });
  }

  // --- Deworming Schedule ---
  let dewormIntervalDays: number;
  let dewormIntervalDesc: string;
  if (ageMonths < 3) {
    dewormIntervalDays = 14;
    dewormIntervalDesc = "Every 2 weeks (under 3 months)";
  } else if (ageMonths < 6) {
    dewormIntervalDays = 30;
    dewormIntervalDesc = "Monthly (3-6 months old)";
  } else {
    dewormIntervalDays = 90;
    dewormIntervalDesc = "Every 3 months (adult schedule)";
  }
  const dewormNextDue = addDays(lastDewormDate, dewormIntervalDays);
  const dewormOverdue = dewormNextDue < today;

  // --- Flea/Tick Prevention ---
  const fleaTickInterval = 30; // Monthly
  let fleaTickNextDue: Date | null = null;
  let fleaTickOverdue = false;
  let fleaTickDaysOverdue = 0;
  if (lastFleaTickDate) {
    fleaTickNextDue = addDays(lastFleaTickDate, fleaTickInterval);
    fleaTickOverdue = fleaTickNextDue < today;
    fleaTickDaysOverdue = fleaTickOverdue ? daysBetween(fleaTickNextDue, today) : 0;
  }

  // --- Heartworm Prevention ---
  const heartwormInterval = 30; // Monthly
  // Assume same as last flea/tick date if not separately tracked
  const heartwormNextDue = lastFleaTickDate ? addDays(lastFleaTickDate, heartwormInterval) : today;
  const heartwormOverdue = heartwormNextDue < today;

  // --- Weight-Based Dosing ---
  const dosing: { medication: string; dose: string; product: string; frequency: string; warning?: string }[] = [];

  // Check breed sensitivity
  const breedLower = breed.toLowerCase();
  const isIvermectinSensitive = IVERMECTIN_SENSITIVE_BREEDS.some((b) => breedLower.includes(b));

  if (isDog) {
    // Ivermectin (heartworm)
    const ivermectinDose = getDoseForWeight(weight, IVERMECTIN_DOSE);
    if (ivermectinDose) {
      dosing.push({
        medication: "Ivermectin (heartworm prevention)",
        dose: ivermectinDose.dose,
        product: ivermectinDose.product,
        frequency: "Monthly",
        ...(isIvermectinSensitive ? { warning: `${breed} may carry MDR1 gene mutation. Ivermectin sensitivity possible. Use milbemycin instead or test for MDR1 before use.` } : {}),
      });
    }

    // Milbemycin (alternative heartworm + intestinal worms)
    const milbemycinDose = getDoseForWeight(weight, MILBEMYCIN_DOSE);
    if (milbemycinDose) {
      dosing.push({
        medication: "Milbemycin oxime + Praziquantel (broad-spectrum dewormer)",
        dose: milbemycinDose.dose,
        product: milbemycinDose.product,
        frequency: "Monthly (if used for heartworm) or every 3 months (deworming only)",
      });
    }

    // Fipronil (flea/tick)
    const fipronilDose = getDoseForWeight(weight, FIPRONIL_DOSE);
    if (fipronilDose) {
      dosing.push({
        medication: "Fipronil spot-on (flea/tick prevention)",
        dose: fipronilDose.dose,
        product: fipronilDose.product,
        frequency: "Monthly (apply to skin between shoulder blades)",
      });
    }
  } else {
    // Cat dosing
    const catFipronil = getDoseForWeight(weight, CAT_FIPRONIL_DOSE);
    if (catFipronil) {
      dosing.push({
        medication: "Fipronil spot-on (flea/tick prevention)",
        dose: catFipronil.dose,
        product: catFipronil.product,
        frequency: "Monthly (apply to back of neck)",
      });
    }

    // Milbemycin for cats
    if (weight <= 4) {
      dosing.push({ medication: "Milbemycin (heartworm + worms)", dose: "4 mg + 10 mg praziquantel", product: "Milbemax Cat Small (<2 kg)", frequency: "Monthly" });
    } else {
      dosing.push({ medication: "Milbemycin (heartworm + worms)", dose: "16 mg + 40 mg praziquantel", product: "Milbemax Cat Large (2-8 kg)", frequency: "Monthly" });
    }
  }

  // Praziquantel (dewormer - both species)
  const praziDose = getDoseForWeight(weight, PRAZIQUANTEL_DOSE);
  if (praziDose) {
    dosing.push({
      medication: "Praziquantel (tapeworm/roundworm dewormer)",
      dose: praziDose.dose,
      product: praziDose.product,
      frequency: dewormIntervalDesc,
    });
  }

  // --- Overdue Flags ---
  const overdueItems: { title: string; body: string; severity: Severity }[] = [];
  let overdueCount = 0;

  for (const vax of vaccines) {
    if (vax.overdue) {
      overdueCount++;
      overdueItems.push({
        title: `OVERDUE: ${vax.name} (${vax.daysOverdue > 900 ? "never given" : vax.daysOverdue + " days overdue"})`,
        body: vax.daysOverdue > 900
          ? `${vax.name} has never been administered. Schedule with your vet immediately.${vax.name === "Rabies" ? " Rabies vaccination is legally required in most Indian states." : ""}`
          : vax.daysOverdue > 90
            ? `Significantly overdue. The protection has likely lapsed. Your vet may need to restart the series depending on how long ago it was due.`
            : `Due ${vax.daysOverdue} days ago. Book a vet appointment soon. Protection may still be partially effective but waning.`,
        severity: "high",
      });
    }
  }

  if (dewormOverdue) {
    overdueCount++;
    const dewormDaysOverdue = daysBetween(dewormNextDue, today);
    overdueItems.push({
      title: `OVERDUE: Deworming (${dewormDaysOverdue} days overdue)`,
      body: `Last dewormed on ${formatDate(lastDewormDate)}, due every ${dewormIntervalDays} days for this age. Give deworming medication now. No restart needed - just resume the schedule.`,
      severity: "medium",
    });
  }

  if (fleaTickOverdue && fleaTickNextDue) {
    overdueCount++;
    overdueItems.push({
      title: `OVERDUE: Flea/tick prevention (${fleaTickDaysOverdue} days overdue)`,
      body: `Last applied on ${formatDate(lastFleaTickDate!)}. Monthly reapplication needed. Your pet is currently unprotected against fleas and ticks. Apply a new dose today.`,
      severity: "medium",
    });
  }

  // --- Build vet visit card ---
  const dueNow: string[] = [];
  const canWait: string[] = [];

  for (const vax of vaccines) {
    if (vax.overdue || daysBetween(today, vax.nextDue) <= 14) {
      dueNow.push(`${vax.name} - ${vax.overdue ? "OVERDUE" : "due within 2 weeks"}`);
    } else {
      canWait.push(`${vax.name} - next due ${formatDate(vax.nextDue)}`);
    }
  }

  if (dewormOverdue || daysBetween(today, dewormNextDue) <= 7) {
    dueNow.push(`Deworming - ${dewormOverdue ? "OVERDUE" : "due within 1 week"}`);
  } else {
    canWait.push(`Deworming - next due ${formatDate(dewormNextDue)}`);
  }

  if (fleaTickNextDue) {
    if (fleaTickOverdue || daysBetween(today, fleaTickNextDue) <= 7) {
      dueNow.push(`Flea/tick prevention - ${fleaTickOverdue ? "OVERDUE" : "due within 1 week"}`);
    } else {
      canWait.push(`Flea/tick prevention - next due ${formatDate(fleaTickNextDue)}`);
    }
  } else {
    dueNow.push("Flea/tick prevention - NOT STARTED (discuss with vet)");
  }

  const vetCard = `VET VISIT CARD
==================
Pet: ${breed || species} | ${species} | ${weight} kg | ${Math.floor(ageMonths / 12)}y ${ageMonths % 12}m old
Date: ${formatDate(today)}

DUE NOW:
${dueNow.length > 0 ? dueNow.map((d) => `  * ${d}`).join("\n") : "  Nothing due immediately"}

CAN WAIT:
${canWait.length > 0 ? canWait.map((d) => `  * ${d}`).join("\n") : "  All preventatives are due now"}

WEIGHT-BASED DOSING:
${dosing.map((d) => `  * ${d.medication}: ${d.dose} (${d.frequency})${d.warning ? " [!] " + d.warning : ""}`).join("\n")}
==================`;

  const headline = `${breed || species}: ${overdueCount === 0 ? "All preventatives current" : `${overdueCount} item(s) OVERDUE`}. Weight: ${weight} kg. Next due: ${dueNow.length > 0 ? dueNow[0] : canWait[0] || "all current"}.`;

  const band = overdueCount === 0 ? "good" : overdueCount <= 1 ? "warn" : "bad";
  const score = Math.max(0, 100 - overdueCount * 25);

  return {
    headline,
    score: {
      label: "Protection Status",
      value: score,
      max: 100,
      band,
    },
    metrics: [
      { label: "Items overdue", value: String(overdueCount), hint: overdueCount === 0 ? "All current" : "Needs attention" },
      { label: "Weight", value: `${weight} kg`, hint: isDog ? (weight < 10 ? "Small" : weight < 25 ? "Medium" : "Large") : (weight < 4 ? "Small" : "Standard") },
      { label: "Age", value: `${Math.floor(ageMonths / 12)}y ${ageMonths % 12}m`, hint: isPuppy || isKitten ? "Puppy/kitten protocol" : "Adult protocol" },
      { label: "Next action", value: dueNow.length > 0 ? "Due now" : formatDate(dewormNextDue < (fleaTickNextDue || dewormNextDue) ? dewormNextDue : (fleaTickNextDue || dewormNextDue)), hint: dueNow.length > 0 ? dueNow[0].split(" -")[0] : "Earliest upcoming" },
    ],
    sections: [
      ...(overdueItems.length > 0 ? [{
        title: "OVERDUE - Action Required",
        items: overdueItems,
      }] : []),
      {
        title: "Vaccine Schedule",
        items: vaccines.map((v) => ({
          title: `${v.name}: ${v.overdue ? "OVERDUE" : `Due ${formatDate(v.nextDue)}`}`,
          body: `Last given: ${v.lastDate ? formatDate(v.lastDate) : "Never"}. Interval: ${v.intervalDesc}.${v.overdue ? ` Overdue by ${v.daysOverdue > 900 ? "N/A (never given)" : v.daysOverdue + " days"}.` : ` Next due in ${daysBetween(today, v.nextDue)} days.`}`,
          severity: (v.overdue ? "high" : "low") as Severity,
        })),
      },
      {
        title: "Deworming",
        items: [{
          title: `${dewormOverdue ? "OVERDUE" : "Next due " + formatDate(dewormNextDue)}`,
          body: `Schedule: ${dewormIntervalDesc}. Last dewormed: ${formatDate(lastDewormDate)}.${dewormOverdue ? ` Overdue by ${daysBetween(dewormNextDue, today)} days. Give deworming medication now.` : ` Due in ${daysBetween(today, dewormNextDue)} days.`}`,
          severity: (dewormOverdue ? "medium" : "low") as Severity,
        }],
      },
      {
        title: "Flea/Tick Prevention",
        items: [fleaTickNextDue ? {
          title: `${fleaTickOverdue ? "OVERDUE" : "Next due " + formatDate(fleaTickNextDue)}`,
          body: `Monthly spot-on or oral treatment. Last applied: ${formatDate(lastFleaTickDate!)}.${fleaTickOverdue ? ` Overdue by ${fleaTickDaysOverdue} days. Pet is unprotected.` : ` Due in ${daysBetween(today, fleaTickNextDue)} days.`}`,
          severity: (fleaTickOverdue ? "medium" : "low") as Severity,
        } : {
          title: "Not currently on flea/tick prevention",
          body: "Monthly prevention recommended for all dogs and outdoor cats. Discuss starting a monthly fipronil or afoxolaner regimen with your vet.",
          severity: "medium" as Severity,
        }],
      },
      {
        title: "Heartworm Prevention",
        items: [{
          title: isDog ? `Monthly prevention recommended (next: ${formatDate(heartwormNextDue)})` : "Lower risk for indoor cats",
          body: isDog
            ? `Heartworm (Dirofilaria immitis) is transmitted by mosquitoes and is present in India. Monthly ivermectin or milbemycin prevents infection. A heartworm test is recommended before starting prevention.`
            : `Indoor cats have lower heartworm risk but outdoor cats in mosquito-prone areas should be on prevention. Discuss with your vet.`,
          severity: (isDog && heartwormOverdue ? "medium" : "low") as Severity,
        }],
      },
      {
        title: "Weight-Based Dosing",
        items: dosing.map((d) => ({
          title: `${d.medication}`,
          body: `Dose: ${d.dose}\nProduct: ${d.product}\nFrequency: ${d.frequency}${d.warning ? "\nWARNING: " + d.warning : ""}`,
          severity: (d.warning ? "medium" : "low") as Severity,
        })),
      },
      ...(isIvermectinSensitive ? [{
        title: "Breed Warning",
        items: [{
          title: `${breed}: Potential ivermectin sensitivity (MDR1 gene)`,
          body: `${breed} and related herding breeds may carry the MDR1 gene mutation that makes ivermectin toxic at certain doses. The heartworm prevention dose is generally considered safe, but higher doses (for mange treatment) can be fatal. Recommend: MDR1 genetic test before using ivermectin, or use milbemycin as an alternative.`,
          severity: "high" as Severity,
        }],
      }] : []),
    ],
    copyBlocks: [
      {
        title: "Vet Visit Card (print or show to your vet)",
        text: vetCard,
        language: "text",
      },
    ],
    json: {
      pet: { species, breed: breed || null, weight, ageMonths, ageYears: Number((ageMonths / 12).toFixed(1)), lifeStage: isPuppy || isKitten ? "puppy/kitten" : "adult" },
      vaccines: vaccines.map((v) => ({ name: v.name, lastDate: v.lastDate ? formatDate(v.lastDate) : null, nextDue: formatDate(v.nextDue), overdue: v.overdue, daysOverdue: v.daysOverdue, interval: v.intervalDesc })),
      deworming: { lastDate: formatDate(lastDewormDate), nextDue: formatDate(dewormNextDue), overdue: dewormOverdue, intervalDays: dewormIntervalDays, schedule: dewormIntervalDesc },
      fleaTick: lastFleaTickDate ? { lastDate: formatDate(lastFleaTickDate), nextDue: formatDate(fleaTickNextDue!), overdue: fleaTickOverdue, intervalDays: 30 } : { status: "not_started" },
      heartworm: { nextDue: formatDate(heartwormNextDue), overdue: heartwormOverdue, intervalDays: 30 },
      dosing: dosing.map((d) => ({ medication: d.medication, dose: d.dose, product: d.product, frequency: d.frequency, warning: d.warning || null })),
      overdueCount,
      dueNow,
      canWait,
      breedWarnings: isIvermectinSensitive ? ["MDR1 gene sensitivity - avoid high-dose ivermectin"] : [],
    },
  };
}
