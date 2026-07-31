import type { ResultItem, RunInput, RunResult, Severity } from "./types.ts";

/**
 * PricePulse engine — a commercial diff, not a text diff.
 *
 * A generic diff tells you 31 lines changed. This parses both snapshots into a
 * structured plan model first, then reports only differences that change what a
 * buyer pays or gets. Copyright years and rotated testimonials never surface.
 */

type Plan = {
  name: string;
  priceText: string;
  price: number | null;
  period: string;
  seats: number | null;
  apiLimit: number | null;
  storageGb: number | null;
  trialDays: number | null;
  features: Map<string, string>; // normalised key -> original line
};

type ChangeType =
  | "free_tier_launched"
  | "plan_added"
  | "plan_removed"
  | "price_increase"
  | "price_decrease"
  | "feature_moved_down"
  | "feature_moved_up"
  | "feature_added"
  | "feature_removed"
  | "limit_increase"
  | "limit_decrease"
  | "trial_shortened"
  | "trial_extended";

type Change = {
  type: ChangeType;
  plan: string;
  summary: string;
  severity: Severity;
  impact: number;
  response: string;
};

const NOISE = [
  /copyright|all rights reserved|©/i,
  /^["“].*["”]\s*[—–-]/, // testimonial with attribution
  /^\s*(home|pricing|features|docs|blog|login|sign in|sign up|contact|about|careers)\s*$/i,
  /cookie|privacy policy|terms of service/i,
  /\b(19|20)\d{2}\b\s*$/,
];

const NEGATIVE_FEATURE = /\b(not available|not included|unavailable|coming soon)\b|[—–-]\s*$/i;

const PLAN_HEADER =
  /^([A-Z][A-Za-z0-9+&' ]{1,28}?)\s*[—–:|-]\s*(\$?\s?[\d,.]+(?:\s*(?:per|\/)\s*\w+)?|free|\$0|contact sales|custom|talk to sales|on request)\s*$/i;

const CURRENCY = /(?:\$|₹|€|£|usd|inr|eur|gbp|rs\.?)\s?(\d[\d,]*(?:\.\d+)?)/i;
const PLAIN_PRICE = /\b(\d[\d,]*(?:\.\d+)?)\s*(?:per|\/)\s*(month|mo|year|yr|user|seat)/i;

function isNoise(line: string): boolean {
  if (line.length < 2) return true;
  return NOISE.some((re) => re.test(line));
}

function normaliseFeature(line: string): string {
  return line
    .toLowerCase()
    .replace(/\b(and|or|with|the|a|an|is|are|for)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parsePrice(text: string): { price: number | null; period: string } {
  const lower = text.toLowerCase();
  if (/contact sales|custom|talk to sales|on request/.test(lower)) return { price: null, period: "custom" };
  if (/^free$|\$?0(\.0+)?$/.test(lower.trim())) return { price: 0, period: "free" };

  const currency = CURRENCY.exec(text);
  const plain = PLAIN_PRICE.exec(text);
  const raw = currency?.[1] ?? plain?.[1] ?? null;
  const periodMatch = /(?:per|\/)\s*(month|mo|year|yr|user|seat)/i.exec(text);
  const period = periodMatch ? periodMatch[1].toLowerCase().replace(/^mo$/, "month").replace(/^yr$/, "year") : "month";
  return { price: raw ? Number(raw.replace(/,/g, "")) : null, period };
}

function intFrom(line: string, re: RegExp): number | null {
  const m = re.exec(line);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function parseSnapshot(text: string): Plan[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !isNoise(l));

  const plans: Plan[] = [];
  let current: Plan | null = null;

  for (const line of lines) {
    const header = PLAN_HEADER.exec(line);
    if (header) {
      const { price, period } = parsePrice(header[2]);
      current = {
        name: header[1].trim(),
        priceText: header[2].trim(),
        price,
        period,
        seats: null,
        apiLimit: null,
        storageGb: null,
        trialDays: null,
        features: new Map(),
      };
      plans.push(current);
      continue;
    }
    if (!current) continue;

    const seats = intFrom(line, /(\d[\d,]*)\s*(?:seats?|users?|licen[cs]es?)/i);
    if (seats !== null && current.seats === null) {
      current.seats = seats;
      continue;
    }
    if (/unlimited\s+(?:seats?|users?)/i.test(line) && current.seats === null) {
      current.seats = null; // null = unlimited, which JSON can actually represent
      continue;
    }

    const api = intFrom(line, /(\d[\d,]*)\s*(?:api\s+)?(?:requests?|calls?|credits?|events?)/i);
    if (api !== null && current.apiLimit === null) {
      current.apiLimit = api;
      continue;
    }

    const storage = /(\d[\d,]*)\s*(gb|tb)/i.exec(line);
    if (storage && current.storageGb === null) {
      current.storageGb = Number(storage[1].replace(/,/g, "")) * (storage[2].toLowerCase() === "tb" ? 1024 : 1);
      continue;
    }

    const trial = intFrom(line, /(\d+)[\s-]*day/i);
    if (trial !== null && /trial/i.test(line) && current.trialDays === null) {
      current.trialDays = trial;
      continue;
    }

    // Anything left is a feature claim. "SSO not available" records absence.
    if (!NEGATIVE_FEATURE.test(line)) {
      const key = normaliseFeature(line);
      if (key.length > 2) current.features.set(key, line);
    }
  }

  return plans;
}

const RESPONSE: Record<ChangeType, string> = {
  free_tier_launched:
    "A free tier is a distribution play, not a pricing one. Expect more inbound comparisons from unqualified buyers — tighten your discovery questions rather than matching the price.",
  plan_added:
    "A new tier means they found a segment they were losing. Work out which one, and check whether your own packaging leaves the same gap.",
  plan_removed:
    "A killed tier usually means it did not convert or did not retain. Ask any prospect on that plan what they are being migrated to, then price against the migration.",
  price_increase:
    "Immediate opening for your reps: quantify the delta over a three-year term for anyone currently evaluating both. Get it into the comparison deck this week.",
  price_decrease:
    "Do not match on price. Re-anchor on the outcome and total cost including implementation, and make sure your reps have the line ready before the next call.",
  feature_moved_down:
    "This is the highest-impact change type. A capability you charge a premium for is now cheaper elsewhere. Decide within the week whether you re-tier or differentiate on depth.",
  feature_moved_up:
    "They moved a feature behind a higher price. That is a gift — reps should lead with the fact that you include it at a lower tier.",
  feature_added:
    "Check whether this closes a gap you were winning on. If it appeared in your last three competitive losses, escalate it to product.",
  feature_removed:
    "Something was pulled, usually because it did not work or did not sell. Worth asking prospects who evaluated them what their experience was.",
  limit_increase:
    "A raised limit is a soft price cut for heavy users. Recheck your own limits against your top ten accounts' actual consumption.",
  limit_decrease:
    "A tightened quota pushes their existing customers into an upgrade. Those customers are now in market — a well-timed outbound sequence works here.",
  trial_shortened:
    "Shorter trials mean they are optimising for sales-assisted conversion. If your trial is longer, say so — it is a real differentiator for cautious buyers.",
  trial_extended:
    "A longer trial signals confidence in activation. Make sure your own onboarding gets to value faster than theirs does.",
};

const IMPACT: Record<ChangeType, { severity: Severity; impact: number }> = {
  free_tier_launched: { severity: "high", impact: 22 },
  plan_added: { severity: "medium", impact: 12 },
  plan_removed: { severity: "medium", impact: 12 },
  price_increase: { severity: "high", impact: 18 },
  price_decrease: { severity: "high", impact: 20 },
  feature_moved_down: { severity: "high", impact: 24 },
  feature_moved_up: { severity: "low", impact: 6 },
  feature_added: { severity: "medium", impact: 10 },
  feature_removed: { severity: "low", impact: 6 },
  limit_increase: { severity: "medium", impact: 10 },
  limit_decrease: { severity: "medium", impact: 11 },
  trial_shortened: { severity: "low", impact: 7 },
  trial_extended: { severity: "low", impact: 7 },
};

function change(type: ChangeType, plan: string, summary: string): Change {
  return { type, plan, summary, ...IMPACT[type], response: RESPONSE[type] };
}

function planIndexByName(plans: Plan[]): Map<string, Plan> {
  return new Map(plans.map((p) => [p.name.toLowerCase(), p]));
}

function fmtPrice(p: Plan): string {
  if (p.price === null) return p.priceText;
  if (p.price === 0) return "$0";
  return `$${p.price.toLocaleString("en-US")}/${p.period}`;
}

function fmtLimit(n: number | null): string {
  if (n === null) return "—";
  if (!Number.isFinite(n)) return "unlimited";
  return n.toLocaleString("en-US");
}

export function run(input: RunInput): RunResult {
  const before = (input.before ?? "").trim();
  const after = (input.after ?? "").trim();
  const competitor = (input.competitor ?? "").trim() || "The competitor";

  if (before.length < 30 || after.length < 30) {
    throw new Error("Both snapshots need real content — paste the pricing page text for each version.");
  }

  const oldPlans = parseSnapshot(before);
  const newPlans = parseSnapshot(after);

  if (oldPlans.length === 0 && newPlans.length === 0) {
    throw new Error(
      'No plans detected. PricePulse expects plan headers like "Starter — $29 per month" or "Pro: $89/month" on their own line.',
    );
  }

  const oldIdx = planIndexByName(oldPlans);
  const newIdx = planIndexByName(newPlans);
  const changes: Change[] = [];

  // ---- plans added / removed -------------------------------------------------
  for (const p of newPlans) {
    if (oldIdx.has(p.name.toLowerCase())) continue;
    if (p.price === 0) {
      changes.push(change("free_tier_launched", p.name, `New free tier "${p.name}" launched (${fmtLimit(p.seats)} seats).`));
    } else {
      changes.push(change("plan_added", p.name, `New plan "${p.name}" at ${fmtPrice(p)}.`));
    }
  }
  for (const p of oldPlans) {
    if (!newIdx.has(p.name.toLowerCase())) {
      changes.push(change("plan_removed", p.name, `Plan "${p.name}" (was ${fmtPrice(p)}) has been removed.`));
    }
  }

  // ---- per-plan comparison --------------------------------------------------
  const featureMoves = new Map<string, { from?: string; to?: string; label: string }>();

  for (const now of newPlans) {
    const was = oldIdx.get(now.name.toLowerCase());
    if (!was) continue;

    // price
    if (was.price !== null && now.price !== null && was.price !== now.price) {
      const pct = was.price > 0 ? Math.round(((now.price - was.price) / was.price) * 100) : 100;
      const type: ChangeType = now.price > was.price ? "price_increase" : "price_decrease";
      changes.push(
        change(
          type,
          now.name,
          `${now.name}: ${fmtPrice(was)} → ${fmtPrice(now)} (${pct > 0 ? "+" : ""}${pct}%).`,
        ),
      );
    }

    // limits
    const limitChecks: { label: string; was: number | null; now: number | null }[] = [
      { label: "seats", was: was.seats, now: now.seats },
      { label: "API requests", was: was.apiLimit, now: now.apiLimit },
      { label: "storage (GB)", was: was.storageGb, now: now.storageGb },
    ];
    for (const c of limitChecks) {
      if (c.was === null || c.now === null || c.was === c.now) continue;
      const type: ChangeType = c.now > c.was ? "limit_increase" : "limit_decrease";
      changes.push(
        change(type, now.name, `${now.name}: ${c.label} ${fmtLimit(c.was)} → ${fmtLimit(c.now)}.`),
      );
    }

    // trial
    if (was.trialDays !== null && now.trialDays !== null && was.trialDays !== now.trialDays) {
      const type: ChangeType = now.trialDays < was.trialDays ? "trial_shortened" : "trial_extended";
      changes.push(change(type, now.name, `${now.name}: trial ${was.trialDays} days → ${now.trialDays} days.`));
    }

    // features on this plan
    for (const [key, line] of now.features) {
      if (!was.features.has(key)) {
        const move = featureMoves.get(key) ?? { label: line };
        move.to = now.name;
        move.label = line;
        featureMoves.set(key, move);
      }
    }
    for (const [key, line] of was.features) {
      if (!now.features.has(key)) {
        const move = featureMoves.get(key) ?? { label: line };
        move.from = now.name;
        move.label = line;
        featureMoves.set(key, move);
      }
    }
  }

  // ---- feature moves vs plain add/remove ------------------------------------
  const planRank = new Map<string, number>();
  newPlans.forEach((p, i) => planRank.set(p.name.toLowerCase(), p.price ?? Number.MAX_SAFE_INTEGER - (newPlans.length - i)));

  for (const [, move] of featureMoves) {
    if (move.from && move.to && move.from !== move.to) {
      const fromRank = planRank.get(move.from.toLowerCase()) ?? 0;
      const toRank = planRank.get(move.to.toLowerCase()) ?? 0;
      const type: ChangeType = toRank < fromRank ? "feature_moved_down" : "feature_moved_up";
      changes.push(
        change(
          type,
          move.to,
          `"${move.label}" moved from ${move.from} to ${move.to}${
            type === "feature_moved_down" ? " — now available for less money" : " — now costs more"
          }.`,
        ),
      );
    } else if (move.to && !move.from) {
      changes.push(change("feature_added", move.to, `${move.to} now lists "${move.label}".`));
    } else if (move.from && !move.to) {
      changes.push(change("feature_removed", move.from, `${move.from} no longer lists "${move.label}".`));
    }
  }

  changes.sort((a, b) => b.impact - a.impact);

  const high = changes.filter((c) => c.severity === "high");
  const medium = changes.filter((c) => c.severity === "medium");
  const low = changes.filter((c) => c.severity === "low");

  const impactIndex = Math.min(100, changes.reduce((sum, c) => sum + c.impact, 0));
  const band = impactIndex >= 45 ? "bad" : impactIndex >= 18 ? "warn" : "good";

  const toItems = (list: Change[]): ResultItem[] =>
    list.map((c) => ({
      title: c.summary,
      body: c.response,
      tag: c.type.replace(/_/g, " "),
      severity: c.severity,
    }));

  // ---- side-by-side plan table ---------------------------------------------
  const allPlanNames = [...new Set([...oldPlans.map((p) => p.name), ...newPlans.map((p) => p.name)])];
  const table = {
    columns: ["Plan", "Was", "Now", "Seats", "Trial", "Status"],
    rows: allPlanNames.map((name) => {
      const was = oldIdx.get(name.toLowerCase());
      const now = newIdx.get(name.toLowerCase());
      const status = !was ? "New" : !now ? "Removed" : was.price !== now.price ? "Repriced" : "Unchanged";
      return [
        name,
        was ? fmtPrice(was) : "—",
        now ? fmtPrice(now) : "—",
        now ? fmtLimit(now.seats) : fmtLimit(was?.seats ?? null),
        now?.trialDays !== null && now?.trialDays !== undefined ? `${now.trialDays}d` : "—",
        status,
      ];
    }),
  };

  // ---- Slack alert + battlecard --------------------------------------------
  const slack =
    changes.length === 0
      ? `No commercial changes detected on ${competitor}'s pricing page.`
      : [
          `:rotating_light: *${competitor} pricing change detected* — impact ${impactIndex}/100`,
          "",
          ...high.map((c) => `• *HIGH* ${c.summary}`),
          ...medium.map((c) => `• MED ${c.summary}`),
          ...(low.length > 0 ? [`• ${low.length} lower-impact change${low.length === 1 ? "" : "s"}`] : []),
          "",
          high[0] ? `*Recommended move:* ${high[0].response}` : "",
        ]
          .filter(Boolean)
          .join("\n");

  const battlecard = [
    `# ${competitor} — battlecard update`,
    "",
    `Change impact score: ${impactIndex}/100 (${high.length} high, ${medium.length} medium, ${low.length} low)`,
    "",
    "## What changed",
    ...changes.map((c) => `- **${c.type.replace(/_/g, " ")}** — ${c.summary}`),
    "",
    "## What our reps should say",
    ...[...high, ...medium].slice(0, 4).map((c) => `- ${c.response}`),
    "",
    "## Current plan lineup",
    ...newPlans.map((p) => `- ${p.name}: ${fmtPrice(p)} · ${fmtLimit(p.seats)} seats`),
  ].join("\n");

  const headline =
    changes.length === 0
      ? `No commercial change on ${competitor}'s page. Prices, plans, limits and feature placement are identical.`
      : high.length > 0
        ? `${changes.length} change${changes.length === 1 ? "" : "s"} on ${competitor}'s page, ${high.length} high impact. Start with: ${high[0].summary}`
        : `${changes.length} change${changes.length === 1 ? "" : "s"} on ${competitor}'s page, nothing high impact. Worth noting, not worth a fire drill.`;

  return {
    headline,
    score: { label: "Commercial change impact", value: impactIndex, max: 100, band },
    metrics: [
      { label: "Changes detected", value: String(changes.length), hint: `${high.length} high impact` },
      { label: "Plans before", value: String(oldPlans.length) },
      { label: "Plans now", value: String(newPlans.length), hint: newPlans.length > oldPlans.length ? "expanded lineup" : newPlans.length < oldPlans.length ? "trimmed lineup" : "same count" },
      {
        label: "Cheapest paid plan",
        value: (() => {
          const paid = newPlans.filter((p) => p.price !== null && p.price > 0).sort((a, b) => (a.price ?? 0) - (b.price ?? 0))[0];
          return paid ? fmtPrice(paid) : "—";
        })(),
      },
    ],
    table,
    sections: [
      { title: `High impact (${high.length}) — act this week`, items: toItems(high) },
      { title: `Medium impact (${medium.length}) — review at the next pricing sync`, items: toItems(medium) },
      { title: `Low impact (${low.length}) — logged for context`, items: toItems(low) },
    ],
    copyBlocks: [
      { title: "Slack alert", text: slack },
      { title: "Battlecard update (Markdown)", text: battlecard },
    ],
    json: {
      competitor,
      impactIndex,
      band,
      counts: { total: changes.length, high: high.length, medium: medium.length, low: low.length },
      changes: changes.map((c) => ({ type: c.type, plan: c.plan, summary: c.summary, severity: c.severity, response: c.response })),
      plans: {
        before: oldPlans.map((p) => ({ name: p.name, price: p.price, period: p.period, seats: p.seats, apiLimit: p.apiLimit, trialDays: p.trialDays })),
        after: newPlans.map((p) => ({ name: p.name, price: p.price, period: p.period, seats: p.seats, apiLimit: p.apiLimit, trialDays: p.trialDays })),
      },
    },
  };
}
