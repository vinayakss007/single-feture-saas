import type { RunInput, RunResult, Severity } from "./types.ts";

/**
 * PackList engine - Generates a complete categorised packing list with exact
 * quantities based on destination, duration, weather, activities, and bag type.
 */

type PackItem = { name: string; qty: number; essential: boolean; weightG: number; category: string };

const WEATHER_MAP: Record<string, string> = {
  "Hot (30C+)": "hot", "Warm (20-30C)": "warm", "Cool (10-20C)": "cool", "Cold (0-10C)": "cold", "Rainy": "rainy",
};

const BAG_LIMITS: Record<string, { weightKg: number; volumeL: number; label: string }> = {
  "Carry-on only (7kg/40L)": { weightKg: 7, volumeL: 40, label: "Carry-on (7kg/40L)" },
  "Checked bag (23kg/80L)": { weightKg: 23, volumeL: 80, label: "Checked (23kg/80L)" },
  "Backpack (15kg/50L)": { weightKg: 15, volumeL: 50, label: "Backpack (15kg/50L)" },
};

function getLaundryDivisor(laundry: string, duration: number): number {
  if (laundry === "Yes, every 3 days") return Math.min(duration, 4);
  if (laundry === "Yes, mid-trip") return Math.min(duration, Math.ceil(duration / 2) + 1);
  return duration;
}

function clothingQty(days: number, base: number, max: number): number {
  return Math.min(max, Math.max(base, days));
}

function buildClothingList(effectiveDays: number, weather: string, gender: string, destination: string): PackItem[] {
  const items: PackItem[] = [];
  const w = weather;
  const isHot = w === "hot";
  const isCold = w === "cold";
  const isCool = w === "cool" || w === "cold";
  const isRainy = w === "rainy";

  // Underwear
  items.push({ name: "Underwear", qty: clothingQty(effectiveDays + 1, 3, 8), essential: true, weightG: 40, category: "Clothing" });
  items.push({ name: "Socks (pairs)", qty: clothingQty(effectiveDays + 1, 3, 8), essential: true, weightG: 50, category: "Clothing" });

  // Tops
  if (isHot) {
    items.push({ name: "T-shirts / light tops", qty: clothingQty(effectiveDays, 3, 6), essential: true, weightG: 150, category: "Clothing" });
  } else if (isCool) {
    items.push({ name: "T-shirts / base layers", qty: clothingQty(effectiveDays, 3, 5), essential: true, weightG: 150, category: "Clothing" });
    items.push({ name: "Fleece / mid-layer", qty: Math.min(2, Math.ceil(effectiveDays / 3)), essential: true, weightG: 350, category: "Clothing" });
    if (isCold) {
      items.push({ name: "Thermal inner (top)", qty: 2, essential: true, weightG: 200, category: "Clothing" });
      items.push({ name: "Down jacket / heavy outer layer", qty: 1, essential: true, weightG: 700, category: "Clothing" });
    }
  } else {
    items.push({ name: "T-shirts / casual tops", qty: clothingQty(effectiveDays, 3, 5), essential: true, weightG: 150, category: "Clothing" });
    items.push({ name: "Light jacket / cardigan", qty: 1, essential: false, weightG: 400, category: "Clothing" });
  }

  // Bottoms
  if (isHot) {
    items.push({ name: "Shorts / light pants", qty: Math.min(3, Math.ceil(effectiveDays / 2)), essential: true, weightG: 250, category: "Clothing" });
  } else {
    items.push({ name: "Pants / trousers", qty: Math.min(3, Math.ceil(effectiveDays / 2)), essential: true, weightG: 400, category: "Clothing" });
    if (isCold) {
      items.push({ name: "Thermal inner (bottom)", qty: 2, essential: true, weightG: 180, category: "Clothing" });
    }
  }

  // Sleepwear
  items.push({ name: "Sleepwear set", qty: effectiveDays > 5 ? 2 : 1, essential: false, weightG: 250, category: "Clothing" });

  // Footwear
  items.push({ name: "Walking shoes / sneakers", qty: 1, essential: true, weightG: 600, category: "Footwear" });
  if (isHot || destination === "Beach") {
    items.push({ name: "Sandals / flip-flops", qty: 1, essential: true, weightG: 200, category: "Footwear" });
  }
  if (isRainy) {
    items.push({ name: "Waterproof shoes / boots", qty: 1, essential: true, weightG: 800, category: "Footwear" });
  }

  // Weather-specific
  if (isRainy) {
    items.push({ name: "Rain jacket / poncho", qty: 1, essential: true, weightG: 300, category: "Clothing" });
    items.push({ name: "Compact umbrella", qty: 1, essential: true, weightG: 350, category: "Accessories" });
  }
  if (isCold) {
    items.push({ name: "Beanie / warm hat", qty: 1, essential: true, weightG: 60, category: "Accessories" });
    items.push({ name: "Gloves", qty: 1, essential: true, weightG: 80, category: "Accessories" });
    items.push({ name: "Scarf / neck gaiter", qty: 1, essential: true, weightG: 100, category: "Accessories" });
  }
  if (isHot) {
    items.push({ name: "Sun hat / cap", qty: 1, essential: true, weightG: 80, category: "Accessories" });
    items.push({ name: "Sunglasses", qty: 1, essential: true, weightG: 30, category: "Accessories" });
  }

  return items;
}

function buildToiletries(duration: number, gender: string): PackItem[] {
  const items: PackItem[] = [
    { name: "Toothbrush + toothpaste", qty: 1, essential: true, weightG: 80, category: "Toiletries" },
    { name: "Deodorant", qty: 1, essential: true, weightG: 100, category: "Toiletries" },
    { name: "Shampoo (travel size)", qty: 1, essential: true, weightG: 100, category: "Toiletries" },
    { name: "Body wash / soap", qty: 1, essential: true, weightG: 100, category: "Toiletries" },
    { name: "Moisturizer", qty: 1, essential: false, weightG: 80, category: "Toiletries" },
    { name: "Sunscreen SPF 50", qty: 1, essential: true, weightG: 120, category: "Toiletries" },
    { name: "Lip balm with SPF", qty: 1, essential: false, weightG: 15, category: "Toiletries" },
    { name: "Comb / hairbrush", qty: 1, essential: true, weightG: 50, category: "Toiletries" },
  ];
  if (gender === "Male") {
    items.push({ name: "Razor + shaving cream", qty: 1, essential: false, weightG: 120, category: "Toiletries" });
  }
  if (gender === "Female") {
    items.push({ name: "Hair ties + clips", qty: 4, essential: true, weightG: 20, category: "Toiletries" });
    items.push({ name: "Menstrual products", qty: duration > 5 ? 2 : 1, essential: true, weightG: 50, category: "Toiletries" });
    items.push({ name: "Makeup essentials (minimal)", qty: 1, essential: false, weightG: 200, category: "Toiletries" });
  }
  if (duration > 7) {
    items.push({ name: "Nail clipper", qty: 1, essential: false, weightG: 30, category: "Toiletries" });
  }
  return items;
}

function buildElectronics(): PackItem[] {
  return [
    { name: "Phone charger + cable", qty: 1, essential: true, weightG: 80, category: "Electronics" },
    { name: "Power bank (10000mAh)", qty: 1, essential: true, weightG: 250, category: "Electronics" },
    { name: "Universal adapter", qty: 1, essential: true, weightG: 100, category: "Electronics" },
    { name: "Earphones / headphones", qty: 1, essential: false, weightG: 50, category: "Electronics" },
  ];
}

function buildDocuments(): PackItem[] {
  return [
    { name: "Passport / ID (original + photocopy)", qty: 1, essential: true, weightG: 50, category: "Documents" },
    { name: "Tickets / booking confirmations (printed)", qty: 1, essential: true, weightG: 20, category: "Documents" },
    { name: "Travel insurance document", qty: 1, essential: true, weightG: 10, category: "Documents" },
    { name: "Credit/debit cards + some cash", qty: 1, essential: true, weightG: 30, category: "Documents" },
    { name: "Emergency contacts list", qty: 1, essential: true, weightG: 5, category: "Documents" },
  ];
}

function buildMedications(): PackItem[] {
  return [
    { name: "Personal prescription medicines", qty: 1, essential: true, weightG: 50, category: "Medications" },
    { name: "Paracetamol / ibuprofen", qty: 1, essential: true, weightG: 30, category: "Medications" },
    { name: "Band-aids + antiseptic", qty: 1, essential: true, weightG: 40, category: "Medications" },
    { name: "Anti-diarrhea tablets", qty: 1, essential: true, weightG: 20, category: "Medications" },
    { name: "Insect repellent", qty: 1, essential: false, weightG: 80, category: "Medications" },
  ];
}

function buildActivityGear(activities: string[], weather: string, gender: string): PackItem[] {
  const items: PackItem[] = [];
  const acts = activities.map((a) => a.trim().toLowerCase());

  if (acts.includes("hiking")) {
    items.push({ name: "Hiking boots (wear on plane)", qty: 1, essential: true, weightG: 900, category: "Activity gear" });
    items.push({ name: "Daypack (20-30L)", qty: 1, essential: true, weightG: 500, category: "Activity gear" });
    items.push({ name: "Water bottle (1L)", qty: 1, essential: true, weightG: 150, category: "Activity gear" });
    items.push({ name: "Headlamp + spare batteries", qty: 1, essential: true, weightG: 100, category: "Activity gear" });
    items.push({ name: "Trekking poles (collapsible)", qty: 1, essential: false, weightG: 500, category: "Activity gear" });
    if (weather === "cold" || weather === "cool") {
      items.push({ name: "Thermal flask (hot drinks)", qty: 1, essential: false, weightG: 300, category: "Activity gear" });
    }
  }

  if (acts.includes("swimming") || acts.includes("snorkeling")) {
    items.push({ name: gender === "Female" ? "Swimsuit" : "Swim trunks", qty: 1, essential: true, weightG: 150, category: "Activity gear" });
    items.push({ name: "Quick-dry towel", qty: 1, essential: true, weightG: 200, category: "Activity gear" });
    items.push({ name: "Waterproof phone pouch", qty: 1, essential: false, weightG: 30, category: "Activity gear" });
    if (acts.includes("snorkeling")) {
      items.push({ name: "Snorkel mask (or rent at destination)", qty: 1, essential: false, weightG: 400, category: "Activity gear" });
      items.push({ name: "Rash guard / swim shirt", qty: 1, essential: false, weightG: 150, category: "Activity gear" });
    }
  }

  if (acts.includes("formal dinner") || acts.includes("formal event") || acts.includes("business meetings")) {
    if (gender === "Male") {
      items.push({ name: "Dress shirt (wrinkle-resistant)", qty: 1, essential: true, weightG: 200, category: "Activity gear" });
      items.push({ name: "Dress pants", qty: 1, essential: true, weightG: 400, category: "Activity gear" });
      items.push({ name: "Dress shoes", qty: 1, essential: true, weightG: 700, category: "Activity gear" });
      items.push({ name: "Belt", qty: 1, essential: true, weightG: 150, category: "Activity gear" });
      items.push({ name: "Blazer / sport coat", qty: 1, essential: false, weightG: 600, category: "Activity gear" });
    } else if (gender === "Female") {
      items.push({ name: "Formal dress or blouse + skirt", qty: 1, essential: true, weightG: 300, category: "Activity gear" });
      items.push({ name: "Heels or formal flats", qty: 1, essential: true, weightG: 400, category: "Activity gear" });
      items.push({ name: "Evening clutch / small bag", qty: 1, essential: false, weightG: 200, category: "Activity gear" });
      items.push({ name: "Statement jewelry", qty: 1, essential: false, weightG: 50, category: "Activity gear" });
    } else {
      items.push({ name: "Formal outfit (1 set)", qty: 1, essential: true, weightG: 500, category: "Activity gear" });
      items.push({ name: "Formal shoes", qty: 1, essential: true, weightG: 600, category: "Activity gear" });
    }
  }

  if (acts.includes("photography")) {
    items.push({ name: "Camera + lens", qty: 1, essential: true, weightG: 800, category: "Activity gear" });
    items.push({ name: "Camera battery (spare)", qty: 1, essential: true, weightG: 80, category: "Activity gear" });
    items.push({ name: "Memory cards", qty: 2, essential: true, weightG: 5, category: "Activity gear" });
    items.push({ name: "Lens cleaning cloth", qty: 1, essential: false, weightG: 10, category: "Activity gear" });
  }

  if (acts.includes("camping")) {
    items.push({ name: "Sleeping bag", qty: 1, essential: true, weightG: 1200, category: "Activity gear" });
    items.push({ name: "Sleeping mat / pad", qty: 1, essential: true, weightG: 500, category: "Activity gear" });
    items.push({ name: "Headlamp + spare batteries", qty: 1, essential: true, weightG: 100, category: "Activity gear" });
    items.push({ name: "Multi-tool / knife", qty: 1, essential: false, weightG: 150, category: "Activity gear" });
  }

  if (acts.includes("cycling")) {
    items.push({ name: "Padded cycling shorts", qty: 1, essential: true, weightG: 150, category: "Activity gear" });
    items.push({ name: "Cycling gloves", qty: 1, essential: false, weightG: 60, category: "Activity gear" });
    items.push({ name: "Helmet (or rent)", qty: 1, essential: true, weightG: 300, category: "Activity gear" });
  }

  if (acts.includes("yoga") || acts.includes("running")) {
    items.push({ name: "Athletic wear (top + bottom)", qty: 1, essential: true, weightG: 250, category: "Activity gear" });
    items.push({ name: "Sports shoes", qty: 1, essential: true, weightG: 350, category: "Activity gear" });
  }

  if (acts.includes("sightseeing")) {
    items.push({ name: "Comfortable walking shoes (if not already packed)", qty: 0, essential: false, weightG: 0, category: "Activity gear" });
    items.push({ name: "Small crossbody bag / daypack", qty: 1, essential: true, weightG: 200, category: "Activity gear" });
  }

  return items.filter((i) => i.qty > 0);
}

export function run(input: RunInput): RunResult {
  const destinationType = (input.destinationType ?? "").trim();
  const duration = Number(input.duration ?? "0");
  const weatherRaw = (input.weather ?? "").trim();
  const activitiesRaw = (input.activities ?? "").trim();
  const gender = (input.gender ?? "Neutral").trim();
  const bagTypeRaw = (input.bagType ?? "").trim();
  const laundryRaw = (input.laundryAvailable ?? "No").trim();

  if (!destinationType) throw new Error("Select a destination type (Beach, Mountain, City, Business, or Adventure).");
  if (!duration || duration < 1) throw new Error("Enter trip duration in days (minimum 1 day).");
  if (duration > 60) throw new Error("Duration above 60 days is unusual for a single packing list. Consider breaking into segments.");
  if (!weatherRaw) throw new Error("Select expected weather to determine appropriate clothing and layers.");
  if (!activitiesRaw) throw new Error("Enter at least one planned activity (e.g., hiking, swimming, sightseeing, formal dinner).");
  if (!bagTypeRaw) throw new Error("Select your bag type to get space and weight estimates.");

  const weather = WEATHER_MAP[weatherRaw] || "warm";
  const bagLimit = BAG_LIMITS[bagTypeRaw] || BAG_LIMITS["Checked bag (23kg/80L)"];
  const activities = activitiesRaw.split(",").map((a) => a.trim()).filter((a) => a.length > 0);

  // Effective packing days (reduced by laundry)
  const effectiveDays = getLaundryDivisor(laundryRaw, duration);

  // Build all item lists
  const allItems: PackItem[] = [
    ...buildClothingList(effectiveDays, weather, gender, destinationType),
    ...buildToiletries(duration, gender),
    ...buildElectronics(),
    ...buildDocuments(),
    ...buildMedications(),
    ...buildActivityGear(activities, weather, gender),
  ];

  // Add destination-specific items
  if (destinationType === "Mountain" && (weather === "cold" || weather === "cool")) {
    allItems.push({ name: "Altitude sickness tablets (Diamox)", qty: 1, essential: false, weightG: 20, category: "Medications" });
  }
  if (destinationType === "Beach") {
    allItems.push({ name: "Aloe vera gel (for sunburn)", qty: 1, essential: false, weightG: 100, category: "Toiletries" });
    if (!activities.includes("swimming")) {
      allItems.push({ name: gender === "Female" ? "Swimsuit" : "Swim trunks", qty: 1, essential: true, weightG: 150, category: "Activity gear" });
      allItems.push({ name: "Beach towel / sarong", qty: 1, essential: true, weightG: 300, category: "Activity gear" });
    }
  }

  // Misc items
  allItems.push({ name: "Reusable water bottle", qty: 1, essential: true, weightG: 150, category: "Miscellaneous" });
  allItems.push({ name: "Packing cubes / zip bags", qty: 3, essential: false, weightG: 100, category: "Miscellaneous" });
  allItems.push({ name: "Laundry bag (dirty clothes)", qty: 1, essential: false, weightG: 30, category: "Miscellaneous" });
  if (duration > 5 || laundryRaw.includes("Yes")) {
    allItems.push({ name: "Travel laundry soap / strips", qty: 1, essential: false, weightG: 50, category: "Miscellaneous" });
  }
  allItems.push({ name: "Snacks for travel day", qty: 1, essential: false, weightG: 200, category: "Miscellaneous" });

  // Calculate totals
  const totalWeightG = allItems.reduce((s, i) => s + i.weightG * i.qty, 0);
  const totalWeightKg = totalWeightG / 1000;
  const totalItems = allItems.reduce((s, i) => s + i.qty, 0);
  const essentialItems = allItems.filter((i) => i.essential);
  const essentialWeightG = essentialItems.reduce((s, i) => s + i.weightG * i.qty, 0);
  const optionalItems = allItems.filter((i) => !i.essential);

  const overWeight = totalWeightKg > bagLimit.weightKg;
  const weightMargin = bagLimit.weightKg - totalWeightKg;

  // Group by category
  const categories = [...new Set(allItems.map((i) => i.category))];
  const grouped = categories.map((cat) => ({
    category: cat,
    items: allItems.filter((i) => i.category === cat),
  }));

  // Build printable checklist
  const checklistLines = grouped.map((g) => {
    const header = `\n${g.category.toUpperCase()}`;
    const lines = g.items.map((i) => `  [ ] ${i.qty > 1 ? `${i.qty}x ` : ""}${i.name}${i.essential ? " *" : ""}`);
    return `${header}\n${lines.join("\n")}`;
  }).join("\n");

  const checklist = `PACKING LIST: ${destinationType} trip | ${duration} days | ${weatherRaw}
Activities: ${activities.join(", ")}
Bag: ${bagLimit.label} | Laundry: ${laundryRaw}
* = essential item
${checklistLines}

TOTALS: ${totalItems} items | ${totalWeightKg.toFixed(1)} kg estimated
Bag limit: ${bagLimit.weightKg} kg / ${bagLimit.volumeL}L
${overWeight ? "WARNING: Over weight limit by " + Math.abs(weightMargin).toFixed(1) + " kg. Remove optional items." : "Within weight limit (" + weightMargin.toFixed(1) + " kg margin)."}`;

  // Suggestions if overweight
  const cutSuggestions: string[] = [];
  if (overWeight) {
    const sorted = [...optionalItems].sort((a, b) => (b.weightG * b.qty) - (a.weightG * a.qty));
    let remaining = Math.abs(weightMargin) * 1000;
    for (const item of sorted) {
      if (remaining <= 0) break;
      cutSuggestions.push(`${item.name} (saves ${(item.weightG * item.qty / 1000).toFixed(1)} kg)`);
      remaining -= item.weightG * item.qty;
    }
  }

  const headline = `${totalItems} items for your ${duration}-day ${destinationType.toLowerCase()} trip. Estimated weight: ${totalWeightKg.toFixed(1)} kg / ${bagLimit.weightKg} kg limit. ${overWeight ? "OVER LIMIT - cut " + Math.abs(weightMargin).toFixed(1) + " kg." : weightMargin.toFixed(1) + " kg margin remaining."}${laundryRaw.includes("Yes") ? ` Laundry reduces clothes to ${effectiveDays}-day cycle.` : ""}`;

  const band = overWeight ? "bad" : weightMargin < 1 ? "warn" : "good";

  return {
    headline,
    score: {
      label: "Bag Space",
      value: Math.max(0, Math.min(100, Math.round((1 - totalWeightKg / bagLimit.weightKg) * 100))),
      max: 100,
      band,
    },
    metrics: [
      { label: "Total items", value: String(totalItems), hint: `${essentialItems.length} essential` },
      { label: "Estimated weight", value: `${totalWeightKg.toFixed(1)} kg`, hint: `Limit: ${bagLimit.weightKg} kg` },
      { label: "Weight margin", value: `${weightMargin.toFixed(1)} kg`, hint: overWeight ? "OVER LIMIT" : "Under limit" },
      { label: "Effective pack days", value: String(effectiveDays), hint: laundryRaw.includes("Yes") ? "Reduced by laundry" : `Full ${duration} days` },
    ],
    sections: [
      ...(overWeight ? [{
        title: "OVER WEIGHT LIMIT - Items to Cut",
        items: cutSuggestions.map((s) => ({ title: s, body: "Optional item - remove to meet weight limit.", severity: "high" as Severity })),
      }] : []),
      ...grouped.map((g) => ({
        title: g.category,
        items: g.items.map((i) => ({
          title: `${i.qty > 1 ? i.qty + "x " : ""}${i.name}`,
          body: `${i.essential ? "ESSENTIAL" : "Optional"} | ~${(i.weightG * i.qty / 1000).toFixed(1)} kg`,
          severity: (i.essential ? "low" : "low") as Severity,
          tag: i.essential ? "essential" : "optional",
        })),
      })),
      {
        title: "Packing Tips",
        items: [
          { title: "Wear heaviest items on travel day", body: "Boots, jacket, and jeans worn (not packed) save 2-3 kg of bag weight. Airlines weigh bags, not passengers.", severity: "low" as Severity },
          ...(laundryRaw.includes("Yes") ? [{ title: `Laundry every ${laundryRaw.includes("3 days") ? "3 days" : "mid-trip"} means packing for ${effectiveDays} days`, body: "Pack merino wool or quick-dry fabrics that can be handwashed and dried overnight.", severity: "low" as Severity }] : []),
          { title: "Roll clothes, don't fold", body: "Rolling saves 20-30% space and reduces wrinkles. Use packing cubes to compress further.", severity: "low" as Severity },
        ],
      },
    ],
    table: {
      columns: ["Category", "Items", "Essential", "Est. Weight"],
      rows: grouped.map((g) => [
        g.category,
        String(g.items.reduce((s, i) => s + i.qty, 0)),
        String(g.items.filter((i) => i.essential).length),
        `${(g.items.reduce((s, i) => s + i.weightG * i.qty, 0) / 1000).toFixed(1)} kg`,
      ]),
    },
    copyBlocks: [
      {
        title: "Printable Packing Checklist",
        text: checklist,
        language: "text",
      },
    ],
    json: {
      trip: { destinationType, duration, weather: weatherRaw, activities, gender, bagType: bagLimit.label, laundry: laundryRaw, effectiveDays },
      totals: { items: totalItems, essentialCount: essentialItems.length, optionalCount: optionalItems.length, weightKg: Number(totalWeightKg.toFixed(1)), limitKg: bagLimit.weightKg, marginKg: Number(weightMargin.toFixed(1)), overLimit: overWeight },
      categories: grouped.map((g) => ({ name: g.category, items: g.items.map((i) => ({ name: i.name, qty: i.qty, essential: i.essential, weightG: i.weightG * i.qty })) })),
      cutSuggestions: overWeight ? cutSuggestions : [],
    },
  };
}
