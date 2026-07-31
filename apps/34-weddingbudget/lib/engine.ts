import type { RunInput, RunResult, Severity } from "./types.ts";

/**
 * WeddingBudget engine - Computes realistic Indian wedding budget across
 * 12 categories with city/season adjustments, per-event breakdowns, and savings plan.
 */

// Base costs per guest in INR for a mid-range Tier-2 wedding
// These are median estimates from wedding planner rate cards (2024-2025)
const BASE_COSTS_PER_GUEST: Record<string, number> = {
  venue: 1200,
  catering: 1800,
  decoration: 600,
  photography: 250,
  clothing: 400,
  jewellery: 350,
  invitations: 120,
  entertainment: 200,
  makeup: 150,
  transport: 180,
  accommodation: 300,
  miscellaneous: 250,
};

// Fixed costs that do not scale linearly with guests (base amounts for 1 event)
const FIXED_COSTS: Record<string, number> = {
  venue: 200_000,
  catering: 50_000,
  decoration: 150_000,
  photography: 120_000,
  clothing: 300_000,
  jewellery: 500_000,
  invitations: 30_000,
  entertainment: 80_000,
  makeup: 100_000,
  transport: 60_000,
  accommodation: 80_000,
  miscellaneous: 50_000,
};

// City tier multipliers
const CITY_MULTIPLIERS: Record<string, number> = {
  Metro: 1.6,
  Tier2: 1.0,
  Tier3: 0.7,
};

// Season multipliers (applied to venue and catering)
const SEASON_MULTIPLIERS: Record<string, number> = {
  "Peak (Nov-Feb)": 1.35,
  "Off-Peak": 1.0,
};

// Venue type multipliers
const VENUE_MULTIPLIERS: Record<string, number> = {
  Hotel: 1.4,
  Farmhouse: 1.0,
  Banquet: 0.85,
};

// Food type multiplier (applied to catering)
const FOOD_MULTIPLIERS: Record<string, number> = {
  Vegetarian: 1.0,
  "Non-Vegetarian": 1.5,
};

// Event multipliers (not linear - each additional event is cheaper per event)
const EVENT_MULTIPLIERS: Record<number, number> = {
  1: 1.0,
  2: 1.6,
  3: 2.1,
  4: 2.5,
};

// Categories that people underestimate
const UNDERESTIMATES: Record<string, { factor: string; detail: string }> = {
  decoration: {
    factor: "2-3x",
    detail: "Initial quotes cover structure only. Fresh flowers (per event per day), lighting upgrades, mandap, stage, aisle decor, and floral ceiling are all extras. Budget 2.5x the first verbal quote.",
  },
  photography: {
    factor: "2x",
    detail: "Base package covers day-of shooting. Pre-wedding shoot, albums, drone footage, same-day edit, and extra hours add up to 2x. Albums alone can be 30-40% of the photography budget.",
  },
  miscellaneous: {
    factor: "Always 10-15%",
    detail: "Tips, pandit fees, last-minute flowers, emergency shopping, extra chairs, children's activities, valet, and forgotten items. Every wedding has them. Budget 12-15% of total.",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  venue: "Venue",
  catering: "Catering",
  decoration: "Decoration",
  photography: "Photography & Video",
  clothing: "Clothing (Bride + Groom)",
  jewellery: "Jewellery",
  invitations: "Invitations & Stationery",
  entertainment: "Entertainment (DJ/Band/Artists)",
  makeup: "Makeup & Styling",
  transport: "Transport & Logistics",
  accommodation: "Guest Accommodation",
  miscellaneous: "Miscellaneous",
};

function formatInr(amount: number): string {
  if (amount >= 10_000_000) return `Rs ${(amount / 10_000_000).toFixed(2)} Cr`;
  if (amount >= 100_000) return `Rs ${(amount / 100_000).toFixed(1)} L`;
  return `Rs ${Math.round(amount).toLocaleString("en-IN")}`;
}

export function run(input: RunInput): RunResult {
  const cityTier = input.cityTier ?? "";
  const guestCount = Number(input.guestCount) || 0;
  const events = Number(input.events) || 1;
  const foodType = input.foodType ?? "Vegetarian";
  const venueType = input.venueType ?? "Banquet";
  const season = input.season ?? "Off-Peak";
  const monthsAway = Number(input.monthsAway) || 12;

  if (!["Metro", "Tier2", "Tier3"].includes(cityTier)) {
    throw new Error("Select a city tier: Metro, Tier2, or Tier3.");
  }
  if (guestCount < 10) throw new Error("Enter a realistic guest count (minimum 10).");
  if (guestCount > 10000) throw new Error("Guest count seems too high. Enter the number of guests, not the budget.");

  const cityMult = CITY_MULTIPLIERS[cityTier] ?? 1;
  const seasonMult = SEASON_MULTIPLIERS[season] ?? 1;
  const venueMult = VENUE_MULTIPLIERS[venueType] ?? 1;
  const foodMult = FOOD_MULTIPLIERS[foodType] ?? 1;
  const eventMult = EVENT_MULTIPLIERS[Math.min(4, Math.max(1, events))] ?? 1;

  // Compute per-category costs
  const categories: Record<string, number> = {};
  const perGuest: Record<string, number> = {};
  const perEvent: Record<string, number> = {};

  for (const cat of Object.keys(BASE_COSTS_PER_GUEST)) {
    let cost = (BASE_COSTS_PER_GUEST[cat] * guestCount + FIXED_COSTS[cat]) * cityMult;

    // Apply event multiplier
    if (["venue", "catering", "decoration", "entertainment"].includes(cat)) {
      cost *= eventMult;
    } else if (["photography", "makeup", "transport"].includes(cat)) {
      cost *= 1 + (events - 1) * 0.4; // These scale but not as much per event
    }

    // Apply season multiplier to venue and catering
    if (["venue", "catering", "decoration"].includes(cat)) {
      cost *= seasonMult;
    }

    // Apply venue type multiplier
    if (cat === "venue") {
      cost *= venueMult;
    }

    // Apply food multiplier to catering
    if (cat === "catering") {
      cost *= foodMult;
    }

    categories[cat] = Math.round(cost);
    perGuest[cat] = Math.round(cost / guestCount);
    perEvent[cat] = Math.round(cost / events);
  }

  const totalBudget = Object.values(categories).reduce((sum, v) => sum + v, 0);
  const perGuestTotal = Math.round(totalBudget / guestCount);
  const perEventTotal = Math.round(totalBudget / events);

  // Savings plan
  const monthlySaving = monthsAway > 0 ? Math.ceil(totalBudget / monthsAway) : totalBudget;

  // Payment milestones (typical advance schedule)
  const milestones = [
    { monthsBefore: 10, item: "Venue booking advance (30-50%)", amount: Math.round(categories.venue * 0.4) },
    { monthsBefore: 8, item: "Photography booking advance (25%)", amount: Math.round(categories.photography * 0.25) },
    { monthsBefore: 6, item: "Catering tasting + advance (20%)", amount: Math.round(categories.catering * 0.2) },
    { monthsBefore: 4, item: "Clothing orders and jewellery (50%)", amount: Math.round((categories.clothing + categories.jewellery) * 0.5) },
    { monthsBefore: 3, item: "Decoration, entertainment booking", amount: Math.round((categories.decoration + categories.entertainment) * 0.3) },
    { monthsBefore: 2, item: "Invitations, transport, accommodation", amount: Math.round((categories.invitations + categories.transport + categories.accommodation) * 0.5) },
    { monthsBefore: 1, item: "Final payments (balance due)", amount: Math.round(totalBudget * 0.25) },
  ].filter((m) => m.monthsBefore <= monthsAway);

  // Category rankings by cost
  const ranked = Object.entries(categories).sort((a, b) => b[1] - a[1]);

  // Warnings
  const warnings: { title: string; body: string; severity: Severity }[] = [];

  for (const [cat, info] of Object.entries(UNDERESTIMATES)) {
    warnings.push({
      title: `${CATEGORY_LABELS[cat]}: typically ${info.factor} the initial quote`,
      body: info.detail,
      severity: cat === "decoration" ? "high" : "medium",
    });
  }

  if (season === "Peak (Nov-Feb)") {
    warnings.push({
      title: "Peak season premium is applied",
      body: `November-February weddings pay 35% more on venue, catering, and decoration due to demand. This adds approximately ${formatInr(Math.round(totalBudget * 0.35 / (1 + 0.35)))} to your budget vs the same wedding in off-peak.`,
      severity: "medium",
    });
  }

  if (guestCount > 500 && events >= 3) {
    warnings.push({
      title: "Large wedding with multiple events - logistics will surprise you",
      body: "At 500+ guests across 3-4 events, transport, accommodation, and coordination costs scale non-linearly. Dedicated wedding management (5-10% of budget) becomes a necessity, not a luxury.",
      severity: "medium",
    });
  }

  // --- Build result ---
  const headline = `A ${events}-event ${cityTier.toLowerCase() === "metro" ? "metro" : cityTier} wedding for ${guestCount} guests in ${season.includes("Peak") ? "peak season" : "off-peak"}: estimated total ${formatInr(totalBudget)}. That is ${formatInr(perGuestTotal)} per guest.`;

  return {
    headline,
    score: {
      label: "Budget completeness",
      value: 85,
      max: 100,
      band: "good",
    },
    metrics: [
      { label: "Total budget", value: formatInr(totalBudget), hint: `${guestCount} guests, ${events} events` },
      { label: "Per guest", value: formatInr(perGuestTotal), hint: "all-in cost" },
      { label: "Per event", value: formatInr(perEventTotal), hint: `${events} events` },
      { label: "Monthly saving", value: formatInr(monthlySaving), hint: `${monthsAway} months` },
    ],
    table: {
      columns: ["Category", "Estimated Cost", "% of Total", "Per Guest", "Per Event"],
      rows: ranked.map(([cat, amount]) => [
        CATEGORY_LABELS[cat],
        formatInr(amount),
        `${((amount / totalBudget) * 100).toFixed(1)}%`,
        formatInr(perGuest[cat]),
        formatInr(perEvent[cat]),
      ]),
    },
    sections: [
      {
        title: "Budget Breakdown (by share)",
        items: ranked.slice(0, 5).map(([cat, amount]) => ({
          title: `${CATEGORY_LABELS[cat]}: ${formatInr(amount)}`,
          body: `${((amount / totalBudget) * 100).toFixed(1)}% of total budget. ${formatInr(perGuest[cat])} per guest.${cat === "catering" && foodType === "Non-Vegetarian" ? " Non-veg premium (1.5x) applied." : ""}${cat === "venue" ? ` ${venueType} pricing with ${season.includes("Peak") ? "peak" : "off-peak"} season rate.` : ""}`,
          severity: "low" as Severity,
        })),
      },
      {
        title: "What People Always Underestimate",
        items: warnings,
      },
      {
        title: "Savings Plan",
        items: [
          {
            title: `Save ${formatInr(monthlySaving)} per month for ${monthsAway} months`,
            body: `Total target: ${formatInr(totalBudget)}. Start immediately to spread the load. Advance payments for venue and photography are typically due 8-10 months before the date.`,
            severity: "low" as Severity,
          },
          ...milestones.map((m) => ({
            title: `${m.monthsBefore} months before: ${m.item}`,
            body: `Estimated payment: ${formatInr(m.amount)}`,
            severity: "low" as Severity,
          })),
        ],
      },
      {
        title: "Multipliers Applied",
        items: [
          {
            title: `City: ${cityTier} (${cityMult}x)`,
            body: `${cityTier === "Metro" ? "Mumbai/Delhi/Bangalore pricing. Everything from venues to flowers costs 60% more." : cityTier === "Tier2" ? "Jaipur/Lucknow/Pune baseline pricing." : "Smaller city pricing - 30% below Tier 2 baseline."}`,
            severity: "low" as Severity,
          },
          {
            title: `Season: ${season} (${seasonMult}x on venue/catering/decor)`,
            body: season.includes("Peak") ? "November-February premium. Vendor availability is limited and prices reflect this." : "Off-peak rates. Better availability and negotiating power.",
            severity: season.includes("Peak") ? "medium" : "low",
          },
          {
            title: `Venue: ${venueType} (${venueMult}x)`,
            body: venueType === "Hotel" ? "Hotel venues include service charges, minimum spends, and corkage. Convenient but premium." : venueType === "Farmhouse" ? "Farmhouse baseline. You handle logistics but get flexibility." : "Banquet halls are 15% cheaper than farmhouses but less flexible on timing and decor.",
            severity: "low" as Severity,
          },
          {
            title: `Food: ${foodType} (${foodMult}x on catering)`,
            body: foodType === "Non-Vegetarian" ? "Non-veg catering runs 1.5x vegetarian for a comparable spread." : "Vegetarian baseline pricing.",
            severity: "low" as Severity,
          },
        ],
      },
    ],
    json: {
      totalBudget,
      perGuestTotal,
      perEventTotal,
      monthlySaving,
      monthsAway,
      parameters: { cityTier, guestCount, events, foodType, venueType, season },
      multipliers: { city: cityMult, season: seasonMult, venue: venueMult, food: foodMult, events: eventMult },
      categories: Object.fromEntries(ranked.map(([cat, amount]) => [cat, {
        amount,
        pctOfTotal: Number(((amount / totalBudget) * 100).toFixed(1)),
        perGuest: perGuest[cat],
        perEvent: perEvent[cat],
      }])),
      milestones,
      warnings: warnings.map((w) => w.title),
    },
  };
}
