import type { ResultItem, RunInput, RunResult, Severity } from "./types.ts";

/**
 * Rental fairness evaluator for Indian metro tenants.
 *
 * Computes a fair-rent range from locality-based benchmarks, flags if the quoted
 * rent is above or below range, computes rent-to-income ratio, generates
 * negotiation points based on property specifics, and lists protective clauses
 * for the rental agreement.
 */

// ---------------------------------------------------------------------------
// Bundled rental benchmark data (Rs/month base rates for 2 BHK semi-furnished)
// ---------------------------------------------------------------------------

type CityData = {
  baseRate2bhk: number; // median 2BHK semi-furnished rent
  premiumLocalities: string[];
  midLocalities: string[];
  spread: number; // percentile spread factor (0.25 = +/-25% for p25-p75)
};

const CITY_DATA: Record<string, CityData> = {
  "Mumbai": {
    baseRate2bhk: 45000,
    premiumLocalities: ["bandra", "juhu", "worli", "powai", "andheri west", "lower parel", "bkc", "colaba", "malabar hill"],
    midLocalities: ["andheri east", "goregaon", "malad", "borivali", "kandivali", "thane", "ghatkopar", "chembur", "vikhroli"],
    spread: 0.25,
  },
  "Bengaluru": {
    baseRate2bhk: 28000,
    premiumLocalities: ["koramangala", "indiranagar", "hsr layout", "whitefield", "jayanagar", "jp nagar", "mg road", "lavelle road", "richmond town"],
    midLocalities: ["marathahalli", "bellandur", "sarjapur", "electronic city", "btm layout", "hebbal", "yelahanka", "kr puram", "banashankari"],
    spread: 0.22,
  },
  "Delhi NCR": {
    baseRate2bhk: 32000,
    premiumLocalities: ["gurgaon dlf", "golf course road", "south delhi", "defence colony", "hauz khas", "vasant kunj", "greater kailash", "noida sector 62"],
    midLocalities: ["noida", "gurgaon sector 49", "dwarka", "rohini", "pitampura", "janakpuri", "indirapuram", "vaishali", "crossing republic"],
    spread: 0.28,
  },
  "Chennai": {
    baseRate2bhk: 22000,
    premiumLocalities: ["adyar", "anna nagar", "t nagar", "besant nagar", "ra puram", "alwarpet", "nungambakkam", "mylapore", "omr ecr"],
    midLocalities: ["velachery", "thoraipakkam", "perungudi", "tambaram", "chrompet", "porur", "mogappair", "ambattur", "medavakkam"],
    spread: 0.20,
  },
  "Hyderabad": {
    baseRate2bhk: 24000,
    premiumLocalities: ["hitech city", "gachibowli", "jubilee hills", "banjara hills", "kondapur", "madhapur", "financial district", "kukatpally"],
    midLocalities: ["miyapur", "manikonda", "chandanagar", "lb nagar", "dilsukhnagar", "secunderabad", "ameerpet", "begumpet", "bachupally"],
    spread: 0.22,
  },
  "Pune": {
    baseRate2bhk: 24000,
    premiumLocalities: ["koregaon park", "kalyani nagar", "viman nagar", "baner", "aundh", "hinjewadi", "boat club road", "kothrud"],
    midLocalities: ["wakad", "pimple saudagar", "hadapsar", "kharadi", "magarpatta", "undri", "wagholi", "bavdhan", "warje"],
    spread: 0.22,
  },
  "Kolkata": {
    baseRate2bhk: 18000,
    premiumLocalities: ["salt lake", "new town", "park street", "ballygunge", "alipore", "bhawanipur", "gariahat", "tollygunge"],
    midLocalities: ["rajarhat", "dum dum", "behala", "howrah", "baranagar", "garia", "jadavpur", "lake town", "kankurgachi"],
    spread: 0.20,
  },
  "Ahmedabad": {
    baseRate2bhk: 18000,
    premiumLocalities: ["sg highway", "prahlad nagar", "bodakdev", "satellite", "vastrapur", "thaltej", "ambli", "navrangpura"],
    midLocalities: ["bopal", "gota", "chandkheda", "maninagar", "naranpura", "gurukul", "science city", "memnagar", "vastral"],
    spread: 0.20,
  },
};

// BHK multipliers relative to 2 BHK
const BHK_MULTIPLIER: Record<string, number> = {
  "1 BHK": 0.60,
  "2 BHK": 1.00,
  "3 BHK": 1.55,
  "4 BHK": 2.20,
};

// Furnishing adjustment
const FURNISHING_FACTOR: Record<string, number> = {
  "Unfurnished": 0.80,
  "Semi-furnished": 1.00,
  "Fully furnished": 1.25,
};

// Floor adjustment
const FLOOR_FACTOR: Record<string, number> = {
  "Ground": 0.90,
  "1-3": 0.95,
  "4-7": 1.00,
  "8-12": 1.05,
  "13+": 1.08,
};

// Age adjustment
const AGE_FACTOR: Record<string, number> = {
  "Under 5 years": 1.10,
  "5-10 years": 1.00,
  "10-20 years": 0.88,
  "Over 20 years": 0.75,
};

function toNumber(value: string | undefined): number {
  if (!value) return 0;
  const n = Number.parseFloat(String(value).replace(/[₹,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function getLocalityTier(city: CityData, locality: string): "premium" | "mid" | "budget" {
  const loc = locality.toLowerCase().trim();
  if (city.premiumLocalities.some((p) => loc.includes(p) || p.includes(loc))) return "premium";
  if (city.midLocalities.some((m) => loc.includes(m) || m.includes(loc))) return "mid";
  return "budget";
}

function localityMultiplier(tier: "premium" | "mid" | "budget"): number {
  if (tier === "premium") return 1.35;
  if (tier === "mid") return 1.00;
  return 0.72;
}

export async function run(input: RunInput): Promise<RunResult> {
  const city = input.city ?? "";
  const locality = input.locality ?? "";
  const bhk = input.bhk ?? "2 BHK";
  const furnished = input.furnished ?? "Semi-furnished";
  const floor = input.floor ?? "4-7";
  const propertyAge = input.propertyAge ?? "5-10 years";
  const rentQuoted = toNumber(input.rentQuoted);
  const maintenance = toNumber(input.maintenance);

  if (!city || !CITY_DATA[city]) {
    throw new Error(`Select a valid city. Supported: ${Object.keys(CITY_DATA).join(", ")}.`);
  }
  if (!locality.trim()) {
    throw new Error("Enter the locality or area name. This is used to determine the rental tier for your neighbourhood.");
  }
  if (rentQuoted <= 0) {
    throw new Error("Enter the monthly rent quoted by the landlord in rupees.");
  }

  const cityData = CITY_DATA[city];
  const tier = getLocalityTier(cityData, locality);
  const locMultiplier = localityMultiplier(tier);

  // Compute fair rent
  const bhkMult = BHK_MULTIPLIER[bhk] ?? 1.0;
  const furnMult = FURNISHING_FACTOR[furnished] ?? 1.0;
  const floorMult = FLOOR_FACTOR[floor] ?? 1.0;
  const ageMult = AGE_FACTOR[propertyAge] ?? 1.0;

  const fairRentMedian = Math.round(
    cityData.baseRate2bhk * locMultiplier * bhkMult * furnMult * floorMult * ageMult
  );

  const fairRentLow = Math.round(fairRentMedian * (1 - cityData.spread));
  const fairRentHigh = Math.round(fairRentMedian * (1 + cityData.spread));

  const totalCost = rentQuoted + maintenance;
  const deviation = rentQuoted - fairRentMedian;
  const deviationPct = Math.round((deviation / fairRentMedian) * 100);

  // Rent-to-income ratio
  const recommendedIncome = Math.round(totalCost / 0.30);
  const idealIncome40 = Math.round(totalCost / 0.25); // conservative 25% ratio

  // Position in range
  let position: "below" | "within" | "above";
  if (rentQuoted < fairRentLow) position = "below";
  else if (rentQuoted > fairRentHigh) position = "above";
  else position = "within";

  // Negotiation points
  const negotiationPoints: ResultItem[] = [];
  let potentialDiscount = 0;

  if (propertyAge === "Over 20 years") {
    const discount = Math.round(fairRentMedian * 0.10);
    potentialDiscount += discount;
    negotiationPoints.push({
      title: `Building age over 20 years: ask for Rs ${discount.toLocaleString("en-IN")} less`,
      body: "Old buildings have maintenance issues, outdated plumbing/wiring, and lower resale appeal. A 10% discount is standard for properties over 20 years.",
      severity: "high",
    });
  } else if (propertyAge === "10-20 years") {
    const discount = Math.round(fairRentMedian * 0.05);
    potentialDiscount += discount;
    negotiationPoints.push({
      title: `Building age 10-20 years: ask for Rs ${discount.toLocaleString("en-IN")} less`,
      body: "Properties in this age bracket need waterproofing, lift maintenance, and pipe replacements. A 5% discount acknowledges the age premium.",
      severity: "medium",
    });
  }

  if (floor === "Ground") {
    const discount = Math.round(fairRentMedian * 0.08);
    potentialDiscount += discount;
    negotiationPoints.push({
      title: `Ground floor: ask for Rs ${discount.toLocaleString("en-IN")} less`,
      body: "Ground floors have more noise, dust, privacy concerns, and mosquito problems. They typically rent for 8-10% less than mid-floors.",
      severity: "medium",
    });
  }

  if (furnished === "Unfurnished") {
    const discount = Math.round(fairRentMedian * 0.05);
    potentialDiscount += discount;
    negotiationPoints.push({
      title: `Unfurnished: ask for Rs ${discount.toLocaleString("en-IN")} less`,
      body: "You will spend Rs 1-3 lakh furnishing. This should reflect in lower rent, or ask the landlord to provide basic furnishing at their cost.",
      severity: "medium",
    });
  }

  if (maintenance > fairRentMedian * 0.15) {
    negotiationPoints.push({
      title: `High maintenance charges: Rs ${maintenance.toLocaleString("en-IN")} is ${Math.round((maintenance / totalCost) * 100)}% of total cost`,
      body: "Maintenance above 12-15% of rent is high. Ask for it to be included in rent (so rent increases are capped) or get a breakdown of what it covers.",
      severity: "medium",
    });
  }

  if (position === "above") {
    const excess = rentQuoted - fairRentHigh;
    negotiationPoints.push({
      title: `Quote is Rs ${excess.toLocaleString("en-IN")} above fair range`,
      body: `The fair range for this configuration is Rs ${fairRentLow.toLocaleString("en-IN")} to Rs ${fairRentHigh.toLocaleString("en-IN")}. Open with Rs ${fairRentLow.toLocaleString("en-IN")} and settle no higher than Rs ${fairRentHigh.toLocaleString("en-IN")}.`,
      severity: "high",
    });
  }

  if (negotiationPoints.length === 0) {
    negotiationPoints.push({
      title: "Rent is within fair range",
      body: "The quoted rent is reasonable for the locality and configuration. Focus negotiation on agreement terms rather than rent reduction.",
      severity: "low",
    });
  }

  // Agreement clauses
  const clauses: ResultItem[] = [
    {
      title: "Maintenance escalation cap",
      body: "Add: 'Annual maintenance increase shall not exceed 10% of the previous year's maintenance charges.' Without this, societies can double maintenance mid-lease.",
      severity: "high",
    },
    {
      title: "Painting at exit",
      body: "Add: 'Tenant shall not be liable for repainting at exit if tenancy exceeds 24 months, as normal wear and tear is the landlord's responsibility.' Standard agreements make the tenant pay for painting regardless of duration.",
      severity: "high",
    },
    {
      title: "Security deposit return timeline",
      body: "Add: 'Security deposit shall be refunded within 30 days of vacating, with itemised deductions if any.' Without a deadline, deposits are withheld for months.",
      severity: "high",
    },
    {
      title: "Lock-in symmetry",
      body: "Add: 'Lock-in period of [X] months applies equally to both parties. Either party may terminate thereafter with 2 months written notice.' Ensure the landlord cannot evict during lock-in either.",
      severity: "medium",
    },
    {
      title: "Rent escalation cap",
      body: `Add: 'Annual rent increase shall not exceed 5% of the prevailing rent.' In ${city}, 8-10% hikes are common without a cap.`,
      severity: "medium",
    },
    {
      title: "Structural repairs responsibility",
      body: "Add: 'Structural repairs, plumbing leaks originating from common areas, and electrical mains issues are the landlord's responsibility and shall be addressed within 7 days of notice.'",
      severity: "medium",
    },
  ];

  // Score
  const scoreBand = position === "above" ? "bad" as const
    : position === "within" ? "good" as const
    : "good" as const;

  const scoreValue = position === "below" ? 90
    : position === "within" ? 70
    : Math.max(20, 70 - Math.abs(deviationPct));

  const sections: { title: string; items: ResultItem[] }[] = [
    {
      title: "Fair rent analysis",
      items: [
        {
          title: `Fair range: Rs ${fairRentLow.toLocaleString("en-IN")} - Rs ${fairRentHigh.toLocaleString("en-IN")}`,
          body: `Median fair rent for a ${bhk} ${furnished.toLowerCase()} property in ${locality}, ${city} is Rs ${fairRentMedian.toLocaleString("en-IN")}. The 25th-75th percentile range is Rs ${fairRentLow.toLocaleString("en-IN")} to Rs ${fairRentHigh.toLocaleString("en-IN")}. Quoted rent of Rs ${rentQuoted.toLocaleString("en-IN")} is ${position === "above" ? `${deviationPct}% above median` : position === "below" ? `${Math.abs(deviationPct)}% below median (good deal)` : "within the fair range"}.`,
          tag: position === "above" ? `${deviationPct}% over` : position === "below" ? `${Math.abs(deviationPct)}% under` : "fair",
          severity: position === "above" ? "high" : "low",
        },
        {
          title: "Locality tier",
          body: `${locality} is classified as a ${tier} locality in ${city}. ${tier === "premium" ? "Premium localities command 30-40% above city average." : tier === "mid" ? "Mid-tier localities are at city average." : "Budget localities rent 25-30% below city average."}`,
          severity: "low",
        },
        {
          title: "Rent-to-income ratio",
          body: `Total monthly cost (rent + maintenance) is Rs ${totalCost.toLocaleString("en-IN")}. At the recommended 30% of income ratio, you need a monthly income of Rs ${recommendedIncome.toLocaleString("en-IN")} (Rs ${(recommendedIncome * 12).toLocaleString("en-IN")}/year). At a conservative 25%, you need Rs ${idealIncome40.toLocaleString("en-IN")}/month.`,
          severity: totalCost > 50000 ? "medium" : "low",
        },
      ],
    },
    {
      title: "Negotiation points",
      items: negotiationPoints,
    },
    {
      title: "Agreement clauses to add",
      items: clauses,
    },
  ];

  // Factors table
  const tableRows: string[][] = [
    ["City base (2BHK semi)", `Rs ${cityData.baseRate2bhk.toLocaleString("en-IN")}`, "100%"],
    ["Locality tier", tier, `${Math.round(locMultiplier * 100)}%`],
    ["BHK adjustment", bhk, `${Math.round(bhkMult * 100)}%`],
    ["Furnishing", furnished, `${Math.round(furnMult * 100)}%`],
    ["Floor", floor, `${Math.round(floorMult * 100)}%`],
    ["Property age", propertyAge, `${Math.round(ageMult * 100)}%`],
    ["Computed fair rent", `Rs ${fairRentMedian.toLocaleString("en-IN")}`, "-"],
  ];

  return {
    headline: position === "above"
      ? `Quoted rent is ${deviationPct}% above fair market. Negotiate down by Rs ${Math.min(deviation, potentialDiscount + deviation).toLocaleString("en-IN")} or more.`
      : position === "below"
        ? `Good deal. Quoted rent is ${Math.abs(deviationPct)}% below fair market for ${locality}.`
        : `Rent is within the fair range for ${locality}, ${city}. Focus negotiation on agreement terms.`,

    score: {
      label: "Rent fairness",
      value: scoreValue,
      max: 100,
      band: scoreBand,
    },

    metrics: [
      { label: "Quoted rent", value: `Rs ${rentQuoted.toLocaleString("en-IN")}` },
      { label: "Fair median", value: `Rs ${fairRentMedian.toLocaleString("en-IN")}` },
      { label: "Position", value: position === "above" ? `${deviationPct}% over` : position === "below" ? `${Math.abs(deviationPct)}% under` : "Within range" },
      { label: "Min. income needed", value: `Rs ${recommendedIncome.toLocaleString("en-IN")}/mo` },
    ],

    sections,

    table: {
      columns: ["Factor", "Value", "Multiplier"],
      rows: tableRows,
    },

    copyBlocks: [
      {
        title: "Negotiation brief",
        text: [
          `Rental Evaluation: ${bhk} ${furnished} in ${locality}, ${city}`,
          `${"=".repeat(50)}`,
          ``,
          `Quoted rent: Rs ${rentQuoted.toLocaleString("en-IN")}/month`,
          `Maintenance: Rs ${maintenance.toLocaleString("en-IN")}/month`,
          `Total cost: Rs ${totalCost.toLocaleString("en-IN")}/month`,
          ``,
          `Fair range: Rs ${fairRentLow.toLocaleString("en-IN")} - Rs ${fairRentHigh.toLocaleString("en-IN")}`,
          `Median: Rs ${fairRentMedian.toLocaleString("en-IN")}`,
          `Position: ${position === "above" ? `${deviationPct}% above median` : position === "below" ? `${Math.abs(deviationPct)}% below median` : "within fair range"}`,
          ``,
          `Negotiation points:`,
          ...negotiationPoints.map((p, i) => `${i + 1}. ${p.title}`),
          ``,
          `Key clauses to add to agreement:`,
          ...clauses.filter((c) => c.severity === "high").map((c, i) => `${i + 1}. ${c.title}: ${c.body.split("'")[1] ?? c.body.slice(0, 80)}`),
        ].join("\n"),
        language: "text",
      },
    ],

    json: {
      city,
      locality,
      localityTier: tier,
      bhk,
      furnished,
      floor,
      propertyAge,
      rentQuoted,
      maintenance,
      totalMonthlyCost: totalCost,
      fairRentRange: { low: fairRentLow, median: fairRentMedian, high: fairRentHigh },
      position,
      deviationPercent: deviationPct,
      recommendedMinIncome: recommendedIncome,
      potentialDiscount,
      negotiationPoints: negotiationPoints.map((p) => p.title),
    },
  };
}
