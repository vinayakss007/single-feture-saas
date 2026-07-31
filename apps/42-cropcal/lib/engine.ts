import type { RunInput, RunResult, Severity } from "./types.ts";

/**
 * CropCal engine - Recommends crops based on Indian agro-climatic zone,
 * soil type, season, and irrigation availability.
 */

type CropEntry = {
  name: string;
  season: "kharif" | "rabi" | "zaid";
  soilTypes: string[];
  zones: string[];
  sowingMonths: string[];
  seedRateKgPerAcre: number;
  waterNeedMm: number;
  irrigationRequired: boolean;
  yieldQtlPerAcre: [number, number];
  daysToHarvest: [number, number];
  mandiPricePerQtl: [number, number];
  companions: string[];
};

const CROPS: CropEntry[] = [
  { name: "Soybean", season: "kharif", soilTypes: ["Black cotton (Vertisol)", "Alluvial"], zones: ["Maharashtra", "Madhya Pradesh", "Rajasthan", "Karnataka"], sowingMonths: ["June", "July"], seedRateKgPerAcre: 30, waterNeedMm: 450, irrigationRequired: false, yieldQtlPerAcre: [8, 12], daysToHarvest: [90, 110], mandiPricePerQtl: [4200, 5500], companions: ["Pigeon pea (Tur)", "Maize"] },
  { name: "Cotton", season: "kharif", soilTypes: ["Black cotton (Vertisol)", "Alluvial"], zones: ["Maharashtra", "Gujarat", "Telangana", "Madhya Pradesh", "Haryana", "Punjab", "Rajasthan"], sowingMonths: ["May", "June", "July"], seedRateKgPerAcre: 4, waterNeedMm: 700, irrigationRequired: false, yieldQtlPerAcre: [6, 10], daysToHarvest: [150, 180], mandiPricePerQtl: [6000, 7500], companions: ["Black gram", "Green gram"] },
  { name: "Pigeon pea (Tur/Arhar)", season: "kharif", soilTypes: ["Black cotton (Vertisol)", "Red soil", "Alluvial"], zones: ["Maharashtra", "Karnataka", "Madhya Pradesh", "Uttar Pradesh", "Gujarat", "Telangana", "Andhra Pradesh"], sowingMonths: ["June", "July"], seedRateKgPerAcre: 6, waterNeedMm: 350, irrigationRequired: false, yieldQtlPerAcre: [4, 7], daysToHarvest: [150, 180], mandiPricePerQtl: [6200, 8000], companions: ["Soybean", "Sorghum"] },
  { name: "Paddy (Rice)", season: "kharif", soilTypes: ["Alluvial", "Black cotton (Vertisol)", "Laterite"], zones: ["Punjab", "Haryana", "Uttar Pradesh", "West Bengal", "Bihar", "Odisha", "Andhra Pradesh", "Tamil Nadu", "Assam", "Chhattisgarh", "Jharkhand", "Kerala"], sowingMonths: ["June", "July"], seedRateKgPerAcre: 20, waterNeedMm: 1200, irrigationRequired: true, yieldQtlPerAcre: [20, 30], daysToHarvest: [120, 150], mandiPricePerQtl: [2040, 2500], companions: ["Azolla (green manure)"] },
  { name: "Maize", season: "kharif", soilTypes: ["Alluvial", "Red soil", "Black cotton (Vertisol)"], zones: ["Karnataka", "Bihar", "Madhya Pradesh", "Rajasthan", "Uttar Pradesh", "Andhra Pradesh", "Telangana", "Maharashtra"], sowingMonths: ["June", "July"], seedRateKgPerAcre: 8, waterNeedMm: 500, irrigationRequired: false, yieldQtlPerAcre: [15, 25], daysToHarvest: [90, 110], mandiPricePerQtl: [1850, 2400], companions: ["Black gram", "Cowpea"] },
  { name: "Groundnut", season: "kharif", soilTypes: ["Red soil", "Alluvial", "Black cotton (Vertisol)"], zones: ["Gujarat", "Rajasthan", "Andhra Pradesh", "Tamil Nadu", "Karnataka", "Maharashtra"], sowingMonths: ["June", "July"], seedRateKgPerAcre: 50, waterNeedMm: 500, irrigationRequired: false, yieldQtlPerAcre: [7, 12], daysToHarvest: [100, 130], mandiPricePerQtl: [5000, 6500], companions: ["Pigeon pea", "Bajra"] },
  { name: "Bajra (Pearl millet)", season: "kharif", soilTypes: ["Alluvial", "Red soil"], zones: ["Rajasthan", "Gujarat", "Haryana", "Maharashtra", "Uttar Pradesh", "Karnataka"], sowingMonths: ["June", "July"], seedRateKgPerAcre: 2, waterNeedMm: 300, irrigationRequired: false, yieldQtlPerAcre: [8, 14], daysToHarvest: [75, 90], mandiPricePerQtl: [2350, 3000], companions: ["Cluster bean", "Moth bean"] },
  { name: "Jowar (Sorghum)", season: "kharif", soilTypes: ["Black cotton (Vertisol)", "Red soil"], zones: ["Maharashtra", "Karnataka", "Madhya Pradesh", "Rajasthan", "Telangana", "Andhra Pradesh"], sowingMonths: ["June", "July", "August"], seedRateKgPerAcre: 4, waterNeedMm: 400, irrigationRequired: false, yieldQtlPerAcre: [6, 10], daysToHarvest: [100, 120], mandiPricePerQtl: [2700, 3500], companions: ["Pigeon pea", "Green gram"] },
  { name: "Green gram (Moong)", season: "kharif", soilTypes: ["Alluvial", "Red soil", "Black cotton (Vertisol)"], zones: ["Rajasthan", "Maharashtra", "Madhya Pradesh", "Uttar Pradesh", "Bihar", "Odisha", "Andhra Pradesh"], sowingMonths: ["June", "July"], seedRateKgPerAcre: 8, waterNeedMm: 300, irrigationRequired: false, yieldQtlPerAcre: [3, 5], daysToHarvest: [60, 75], mandiPricePerQtl: [7200, 8500], companions: ["Maize", "Bajra"] },
  { name: "Black gram (Urad)", season: "kharif", soilTypes: ["Alluvial", "Black cotton (Vertisol)", "Red soil"], zones: ["Madhya Pradesh", "Uttar Pradesh", "Maharashtra", "Rajasthan", "Andhra Pradesh", "Tamil Nadu"], sowingMonths: ["June", "July"], seedRateKgPerAcre: 8, waterNeedMm: 300, irrigationRequired: false, yieldQtlPerAcre: [3, 5], daysToHarvest: [70, 90], mandiPricePerQtl: [6500, 8000], companions: ["Sorghum", "Cotton"] },
  { name: "Sugarcane", season: "kharif", soilTypes: ["Alluvial", "Black cotton (Vertisol)"], zones: ["Uttar Pradesh", "Maharashtra", "Karnataka", "Gujarat", "Bihar", "Haryana", "Punjab"], sowingMonths: ["February", "March", "October"], seedRateKgPerAcre: 4000, waterNeedMm: 2000, irrigationRequired: true, yieldQtlPerAcre: [300, 400], daysToHarvest: [300, 365], mandiPricePerQtl: [315, 400], companions: [] },
  // Rabi crops
  { name: "Wheat", season: "rabi", soilTypes: ["Alluvial", "Black cotton (Vertisol)"], zones: ["Punjab", "Haryana", "Uttar Pradesh", "Madhya Pradesh", "Rajasthan", "Bihar", "Gujarat"], sowingMonths: ["October", "November"], seedRateKgPerAcre: 40, waterNeedMm: 450, irrigationRequired: true, yieldQtlPerAcre: [18, 25], daysToHarvest: [120, 140], mandiPricePerQtl: [2125, 2600], companions: ["Mustard (border)", "Gram (intercrop)"] },
  { name: "Chickpea (Gram/Chana)", season: "rabi", soilTypes: ["Black cotton (Vertisol)", "Alluvial", "Red soil"], zones: ["Madhya Pradesh", "Maharashtra", "Rajasthan", "Uttar Pradesh", "Karnataka", "Andhra Pradesh", "Gujarat"], sowingMonths: ["October", "November"], seedRateKgPerAcre: 32, waterNeedMm: 250, irrigationRequired: false, yieldQtlPerAcre: [6, 10], daysToHarvest: [100, 120], mandiPricePerQtl: [5230, 6500], companions: ["Wheat", "Linseed"] },
  { name: "Mustard", season: "rabi", soilTypes: ["Alluvial", "Red soil"], zones: ["Rajasthan", "Uttar Pradesh", "Haryana", "Madhya Pradesh", "Gujarat", "West Bengal", "Bihar"], sowingMonths: ["October", "November"], seedRateKgPerAcre: 2, waterNeedMm: 250, irrigationRequired: false, yieldQtlPerAcre: [5, 8], daysToHarvest: [110, 140], mandiPricePerQtl: [5050, 6200], companions: ["Wheat", "Chickpea"] },
  { name: "Lentil (Masoor)", season: "rabi", soilTypes: ["Alluvial", "Red soil", "Black cotton (Vertisol)"], zones: ["Uttar Pradesh", "Madhya Pradesh", "Bihar", "West Bengal", "Jharkhand", "Chhattisgarh"], sowingMonths: ["October", "November"], seedRateKgPerAcre: 12, waterNeedMm: 250, irrigationRequired: false, yieldQtlPerAcre: [4, 6], daysToHarvest: [100, 120], mandiPricePerQtl: [5500, 6800], companions: ["Linseed", "Wheat (border)"] },
  { name: "Potato", season: "rabi", soilTypes: ["Alluvial", "Red soil"], zones: ["Uttar Pradesh", "West Bengal", "Bihar", "Gujarat", "Punjab", "Madhya Pradesh"], sowingMonths: ["October", "November", "December"], seedRateKgPerAcre: 800, waterNeedMm: 500, irrigationRequired: true, yieldQtlPerAcre: [80, 120], daysToHarvest: [75, 100], mandiPricePerQtl: [800, 1500], companions: ["Maize (succeeding)"] },
  { name: "Onion (Rabi)", season: "rabi", soilTypes: ["Alluvial", "Black cotton (Vertisol)", "Red soil"], zones: ["Maharashtra", "Karnataka", "Madhya Pradesh", "Gujarat", "Rajasthan", "Bihar"], sowingMonths: ["November", "December", "January"], seedRateKgPerAcre: 4, waterNeedMm: 400, irrigationRequired: true, yieldQtlPerAcre: [60, 100], daysToHarvest: [120, 150], mandiPricePerQtl: [1000, 3000], companions: [] },
  { name: "Safflower", season: "rabi", soilTypes: ["Black cotton (Vertisol)"], zones: ["Maharashtra", "Karnataka", "Madhya Pradesh", "Andhra Pradesh"], sowingMonths: ["September", "October", "November"], seedRateKgPerAcre: 6, waterNeedMm: 300, irrigationRequired: false, yieldQtlPerAcre: [4, 7], daysToHarvest: [120, 150], mandiPricePerQtl: [5200, 6000], companions: ["Chickpea"] },
  // Zaid crops
  { name: "Watermelon", season: "zaid", soilTypes: ["Alluvial", "Red soil"], zones: ["Uttar Pradesh", "Rajasthan", "Karnataka", "Andhra Pradesh", "Maharashtra", "Gujarat", "West Bengal"], sowingMonths: ["February", "March", "April"], seedRateKgPerAcre: 1, waterNeedMm: 400, irrigationRequired: true, yieldQtlPerAcre: [80, 120], daysToHarvest: [70, 90], mandiPricePerQtl: [500, 1200], companions: [] },
  { name: "Cucumber", season: "zaid", soilTypes: ["Alluvial", "Red soil", "Black cotton (Vertisol)"], zones: ["Uttar Pradesh", "Bihar", "West Bengal", "Maharashtra", "Karnataka", "Andhra Pradesh", "Madhya Pradesh", "Haryana", "Punjab"], sowingMonths: ["February", "March", "April", "May"], seedRateKgPerAcre: 1, waterNeedMm: 350, irrigationRequired: true, yieldQtlPerAcre: [40, 60], daysToHarvest: [50, 70], mandiPricePerQtl: [800, 1500], companions: [] },
  { name: "Muskmelon", season: "zaid", soilTypes: ["Alluvial", "Red soil"], zones: ["Uttar Pradesh", "Rajasthan", "Punjab", "Haryana", "Gujarat", "Maharashtra"], sowingMonths: ["February", "March"], seedRateKgPerAcre: 1, waterNeedMm: 350, irrigationRequired: true, yieldQtlPerAcre: [50, 80], daysToHarvest: [60, 80], mandiPricePerQtl: [1000, 2000], companions: [] },
  { name: "Moong (Summer)", season: "zaid", soilTypes: ["Alluvial", "Black cotton (Vertisol)", "Red soil"], zones: ["Rajasthan", "Madhya Pradesh", "Maharashtra", "Uttar Pradesh", "Gujarat", "Andhra Pradesh"], sowingMonths: ["March", "April"], seedRateKgPerAcre: 8, waterNeedMm: 250, irrigationRequired: true, yieldQtlPerAcre: [3, 5], daysToHarvest: [60, 70], mandiPricePerQtl: [7200, 8500], companions: [] },
  { name: "Sunflower", season: "zaid", soilTypes: ["Black cotton (Vertisol)", "Alluvial", "Red soil"], zones: ["Karnataka", "Maharashtra", "Andhra Pradesh", "Tamil Nadu", "Uttar Pradesh", "Haryana"], sowingMonths: ["January", "February", "March"], seedRateKgPerAcre: 3, waterNeedMm: 400, irrigationRequired: true, yieldQtlPerAcre: [5, 8], daysToHarvest: [85, 100], mandiPricePerQtl: [5600, 6800], companions: [] },
];

const MONTH_INDEX: Record<string, number> = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
};

function getSeasonForMonth(month: string): string[] {
  const idx = MONTH_INDEX[month] ?? 0;
  // Kharif: Jun-Oct, Rabi: Nov-Mar, Zaid: Mar-Jun (overlaps)
  const seasons: string[] = [];
  if (idx >= 5 && idx <= 9) seasons.push("kharif");
  if (idx >= 10 || idx <= 2) seasons.push("rabi");
  if (idx >= 2 && idx <= 5) seasons.push("zaid");
  return seasons.length > 0 ? seasons : ["kharif"];
}

function sowingWindowRemaining(crop: CropEntry, currentMonth: string): { daysLeft: number; status: string } {
  const currentIdx = MONTH_INDEX[currentMonth] ?? 0;
  const sowMonthIndices = crop.sowingMonths.map((m) => MONTH_INDEX[m] ?? 0);
  const lastSowIdx = Math.max(...sowMonthIndices);
  
  if (sowMonthIndices.includes(currentIdx)) {
    const remaining = (lastSowIdx - currentIdx) * 30 + 15; // approx days in current window
    if (currentIdx === lastSowIdx) {
      return { daysLeft: 15, status: "CLOSING - sow this week" };
    }
    return { daysLeft: remaining, status: remaining <= 30 ? "Closing soon" : "Open" };
  }
  
  if (currentIdx > lastSowIdx && currentIdx - lastSowIdx <= 1) {
    return { daysLeft: 0, status: "CLOSED - window passed" };
  }
  
  const firstSowIdx = Math.min(...sowMonthIndices);
  if (currentIdx < firstSowIdx) {
    const daysUntil = (firstSowIdx - currentIdx) * 30;
    return { daysLeft: daysUntil, status: `Opens in ${crop.sowingMonths[0]}` };
  }
  
  return { daysLeft: 0, status: "CLOSED - wait for next season" };
}

export function run(input: RunInput): RunResult {
  const state = (input.state ?? "").trim();
  const soilType = (input.soilType ?? "").trim();
  const month = (input.month ?? "").trim();
  const landAreaStr = (input.landArea ?? "").trim();
  const irrigation = (input.irrigation ?? "").trim();

  if (!state) throw new Error("Select your state to determine the agro-climatic zone and suitable crops.");
  if (!soilType) throw new Error("Select your soil type (alluvial, black cotton, red, or laterite).");
  if (!month) throw new Error("Select the current month to determine season and sowing window.");
  if (!landAreaStr || Number(landAreaStr) <= 0) throw new Error("Enter land area in acres (must be greater than 0).");
  if (!irrigation) throw new Error("Select irrigation availability to filter crops by water requirement.");

  const landArea = Number(landAreaStr);
  if (isNaN(landArea) || landArea <= 0) throw new Error("Land area must be a positive number in acres.");
  if (landArea > 1000) throw new Error("Land area above 1000 acres is unusual for single-crop planning. Consider breaking into blocks.");

  const seasons = getSeasonForMonth(month);
  const hasIrrigation = irrigation !== "Rainfed only";
  const hasDrip = irrigation === "Drip irrigation";

  // Filter crops suitable for this state, soil, season, and irrigation
  const suitable = CROPS.filter((crop) => {
    if (!crop.zones.includes(state)) return false;
    if (!crop.soilTypes.includes(soilType)) return false;
    if (!seasons.includes(crop.season)) return false;
    if (crop.irrigationRequired && !hasIrrigation) return false;
    return true;
  });

  if (suitable.length === 0) {
    return {
      headline: `No specific crops found in the database for ${state} + ${soilType} + ${month} (${seasons.join("/")}) + ${irrigation}. Consider consulting your local Krishi Vigyan Kendra for region-specific varieties.`,
      metrics: [
        { label: "Season", value: seasons.join(", "), hint: `Based on ${month}` },
        { label: "Crops matched", value: "0", hint: "Try different parameters" },
      ],
      sections: [{
        title: "Suggestions",
        items: [
          { title: "Expand search", body: "Try a neighbouring state or different soil type. Some crops grow across multiple soil types with amendments.", severity: "medium" as Severity },
          { title: "Contact KVK", body: "Your local Krishi Vigyan Kendra can recommend varieties specific to your micro-climate.", severity: "low" as Severity },
        ],
      }],
      json: { state, soilType, month, seasons, irrigation, suitable: [] },
    };
  }

  // Rank by sowing urgency and profitability
  const ranked = suitable.map((crop) => {
    const window = sowingWindowRemaining(crop, month);
    const avgYield = (crop.yieldQtlPerAcre[0] + crop.yieldQtlPerAcre[1]) / 2;
    const avgPrice = (crop.mandiPricePerQtl[0] + crop.mandiPricePerQtl[1]) / 2;
    const revenuePerAcre = avgYield * avgPrice;
    const seedCostPerAcre = crop.seedRateKgPerAcre * 80; // approx Rs 80/kg average seed cost
    const waterEfficiency = hasDrip ? crop.waterNeedMm * 0.6 : crop.waterNeedMm;
    return { crop, window, revenuePerAcre, seedCostPerAcre, waterEfficiency };
  }).sort((a, b) => {
    // Prioritize crops with open sowing windows
    if (a.window.status.includes("CLOSED") && !b.window.status.includes("CLOSED")) return 1;
    if (!a.window.status.includes("CLOSED") && b.window.status.includes("CLOSED")) return -1;
    // Then by revenue potential
    return b.revenuePerAcre - a.revenuePerAcre;
  });

  const topCrops = ranked.slice(0, 6);
  const seasonLabel = seasons.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("/");
  const urgentCrops = topCrops.filter((r) => r.window.status.includes("CLOSING") || r.window.status.includes("Closing"));

  const headline = `${topCrops.length} crops recommended for ${state} | ${soilType} | ${seasonLabel} season | ${landArea} acres | ${irrigation}. ${urgentCrops.length > 0 ? `URGENT: ${urgentCrops.map((c) => c.crop.name).join(", ")} sowing window closing.` : "Sowing windows open."}`;

  return {
    headline,
    score: {
      label: "Options Available",
      value: Math.min(100, topCrops.filter((r) => !r.window.status.includes("CLOSED")).length * 20),
      max: 100,
      band: topCrops.filter((r) => !r.window.status.includes("CLOSED")).length >= 3 ? "good" : topCrops.filter((r) => !r.window.status.includes("CLOSED")).length >= 1 ? "warn" : "bad",
    },
    metrics: [
      { label: "Season", value: seasonLabel, hint: `${month} sowing` },
      { label: "Crops matched", value: String(topCrops.length), hint: `${irrigation}` },
      { label: "Land area", value: `${landArea} acres`, hint: soilType },
      { label: "Zone", value: state, hint: `${soilType}` },
    ],
    sections: topCrops.map((r) => ({
      title: `${r.crop.name} (${r.crop.season.toUpperCase()})`,
      items: [
        {
          title: `Sowing window: ${r.crop.sowingMonths.join(", ")}`,
          body: `Status: ${r.window.status}. ${r.window.daysLeft > 0 && !r.window.status.includes("CLOSED") ? `~${r.window.daysLeft} days remaining.` : ""}`,
          severity: (r.window.status.includes("CLOSING") ? "high" : r.window.status.includes("Closing") ? "medium" : "low") as Severity,
          tag: r.window.status.includes("CLOS") ? "urgent" : "open",
        },
        {
          title: `Seed requirement: ${Math.ceil(r.crop.seedRateKgPerAcre * landArea)} kg for ${landArea} acres`,
          body: `Seed rate: ${r.crop.seedRateKgPerAcre} kg/acre. Estimated seed cost: Rs ${Math.ceil(r.seedCostPerAcre * landArea).toLocaleString("en-IN")}.`,
          severity: "low" as Severity,
        },
        {
          title: `Water need: ${Math.round(r.waterEfficiency)} mm${hasDrip ? " (drip-adjusted)" : ""}`,
          body: `${r.crop.irrigationRequired ? "Irrigation REQUIRED" : "Can grow rainfed"}. ${hasDrip ? "Drip saves 40% water." : ""} Total water for ${landArea} acres: ~${Math.round(r.waterEfficiency * landArea * 4000 / 1000)} kilolitres.`,
          severity: (r.crop.irrigationRequired && !hasIrrigation ? "high" : "low") as Severity,
        },
        {
          title: `Expected yield: ${r.crop.yieldQtlPerAcre[0]}-${r.crop.yieldQtlPerAcre[1]} qtl/acre`,
          body: `Total from ${landArea} acres: ${Math.round(r.crop.yieldQtlPerAcre[0] * landArea)}-${Math.round(r.crop.yieldQtlPerAcre[1] * landArea)} quintals. Harvest in ${r.crop.daysToHarvest[0]}-${r.crop.daysToHarvest[1]} days.`,
          severity: "low" as Severity,
        },
        {
          title: `Mandi price: Rs ${r.crop.mandiPricePerQtl[0].toLocaleString("en-IN")}-${r.crop.mandiPricePerQtl[1].toLocaleString("en-IN")}/qtl`,
          body: `Estimated revenue: Rs ${Math.round(r.revenuePerAcre * landArea).toLocaleString("en-IN")} from ${landArea} acres (at average price).`,
          severity: "low" as Severity,
        },
        ...(r.crop.companions.length > 0 ? [{
          title: `Companion crops: ${r.crop.companions.join(", ")}`,
          body: "Intercropping improves soil health, pest management, and total returns per acre.",
          severity: "low" as Severity,
        }] : []),
      ],
    })),
    table: {
      columns: ["Crop", "Seed (kg)", "Water (mm)", "Yield (qtl/acre)", "Price (Rs/qtl)", "Revenue/acre", "Window"],
      rows: topCrops.map((r) => [
        r.crop.name,
        String(Math.ceil(r.crop.seedRateKgPerAcre * landArea)),
        String(Math.round(r.waterEfficiency)),
        `${r.crop.yieldQtlPerAcre[0]}-${r.crop.yieldQtlPerAcre[1]}`,
        `${r.crop.mandiPricePerQtl[0]}-${r.crop.mandiPricePerQtl[1]}`,
        `Rs ${Math.round(r.revenuePerAcre).toLocaleString("en-IN")}`,
        r.window.status,
      ]),
    },
    json: {
      state,
      soilType,
      month,
      seasons,
      landArea,
      irrigation,
      recommendations: topCrops.map((r) => ({
        crop: r.crop.name,
        season: r.crop.season,
        sowingMonths: r.crop.sowingMonths,
        windowStatus: r.window.status,
        daysLeft: r.window.daysLeft,
        seedKgNeeded: Math.ceil(r.crop.seedRateKgPerAcre * landArea),
        seedRatePerAcre: r.crop.seedRateKgPerAcre,
        waterNeedMm: Math.round(r.waterEfficiency),
        irrigationRequired: r.crop.irrigationRequired,
        yieldRange: r.crop.yieldQtlPerAcre,
        mandiPriceRange: r.crop.mandiPricePerQtl,
        estimatedRevenuePerAcre: Math.round(r.revenuePerAcre),
        totalRevenue: Math.round(r.revenuePerAcre * landArea),
        daysToHarvest: r.crop.daysToHarvest,
        companions: r.crop.companions,
      })),
    },
  };
}
