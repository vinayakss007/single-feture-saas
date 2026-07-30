import type { Band, ResultItem, RunInput, RunResult } from "./types.ts";

/**
 * ChurnSignal engine — a transparent weighted rules model.
 *
 * Deliberately not machine learning. On a book of 40 accounts an ML model is a
 * random number generator with better marketing; a weighted rules model can be
 * read, argued with and defended in a pipeline review.
 */

const MAX_FREE_ROWS = 500;

type SignalKey = "usageDrop" | "dormant" | "seatUnderuse" | "supportPressure" | "satisfaction" | "renewalWindow";

type Profile = "Product-led SaaS" | "Sales-led SaaS" | "Enterprise / annual contracts";

const WEIGHTS: Record<Profile, Record<SignalKey, number>> = {
  "Product-led SaaS": { usageDrop: 30, dormant: 22, seatUnderuse: 18, supportPressure: 10, satisfaction: 10, renewalWindow: 10 },
  "Sales-led SaaS": { usageDrop: 26, dormant: 20, seatUnderuse: 16, supportPressure: 12, satisfaction: 12, renewalWindow: 14 },
  "Enterprise / annual contracts": { usageDrop: 20, dormant: 16, seatUnderuse: 14, supportPressure: 14, satisfaction: 14, renewalWindow: 22 },
};

const SIGNAL_LABEL: Record<SignalKey, string> = {
  usageDrop: "Usage collapsed",
  dormant: "Account dormant",
  seatUnderuse: "Seats never adopted",
  supportPressure: "Support pressure",
  satisfaction: "Low satisfaction",
  renewalWindow: "Renewal window open",
};

const SAVE_PLAY: Record<SignalKey, string> = {
  usageDrop:
    "Find out what changed. Nine times out of ten a champion left or a workflow moved. Ask for a 20-minute call framed as 'what stopped working', not 'how are you finding it'.",
  dormant:
    "Do not send another nudge email. Get on a call with the original buyer and re-run onboarding for whoever actually does the work now.",
  seatUnderuse:
    "Unadopted seats are a renewal downgrade waiting to happen. Run a short enablement session for the unused team, or pre-empt the conversation with a right-sized plan.",
  supportPressure:
    "Escalate the open tickets to a named owner today and tell the customer you have done it. Unresolved tickets at renewal time cost more than the fix.",
  satisfaction:
    "Low scores are an invitation. Have a senior person call, listen without pitching, and come back within a week with one concrete change.",
  renewalWindow:
    "Open the renewal conversation before procurement does. Bring the value delivered so far in their numbers, not yours.",
};

/** Header aliases — your export does not have to match a schema. */
const FIELD_ALIASES: Record<string, string[]> = {
  account: ["account", "account_name", "name", "customer", "customer_name", "company", "company_name", "org", "organisation", "organization"],
  mrr: ["mrr", "arr", "revenue", "mrr_usd", "monthly_revenue", "amount", "contract_value", "acv"],
  logins30: ["logins_30d", "logins_last_30", "logins_last_30d", "logins", "sessions_30d", "usage_30d", "active_days_30d", "events_30d"],
  loginsPrev: ["logins_prev_30d", "logins_previous_30", "logins_prev_30", "logins_prev", "sessions_prev_30d", "usage_prev_30d", "events_prev_30d"],
  daysSinceLogin: ["days_since_login", "last_login_days", "days_inactive", "last_seen_days", "days_since_last_login", "inactive_days"],
  seatsUsed: ["seats_used", "active_seats", "active_users", "used_seats", "mau"],
  seatsPaid: ["seats_paid", "seats", "licenses", "licences", "purchased_seats", "total_seats", "seat_count"],
  tickets: ["open_tickets", "tickets_open", "tickets", "support_tickets", "escalations"],
  nps: ["nps", "nps_score", "csat", "satisfaction", "health_score_manual"],
  renewalDays: ["days_to_renewal", "renewal_days", "days_until_renewal", "contract_days_left", "renewal_in_days"],
};

type Row = Record<string, string>;

function detectDelimiter(headerLine: string): string {
  const counts: Record<string, number> = {
    "\t": (headerLine.match(/\t/g) ?? []).length,
    ";": (headerLine.match(/;/g) ?? []).length,
    ",": (headerLine.match(/,/g) ?? []).length,
  };
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][1] > 0
    ? Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
    : ",";
}

/** Minimal RFC-4180-ish splitter: handles quoted fields containing the delimiter. */
function splitLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim());
  return out;
}

function normaliseHeader(h: string): string {
  return h.toLowerCase().trim().replace(/[\s-]+/g, "_").replace(/[^a-z0-9_]/g, "");
}

function parseCsv(csv: string): { rows: Row[]; headerMap: Record<string, string>; rawHeaders: string[] } {
  const lines = csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    throw new Error("Need a header row and at least one account row.");
  }

  const delimiter = detectDelimiter(lines[0]);
  const rawHeaders = splitLine(lines[0], delimiter);
  const normalised = rawHeaders.map(normaliseHeader);

  // field -> actual header index
  const headerMap: Record<string, string> = {};
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    const idx = normalised.findIndex((h) => aliases.includes(h));
    if (idx >= 0) headerMap[field] = rawHeaders[idx];
  }

  const rows: Row[] = [];
  for (const line of lines.slice(1, MAX_FREE_ROWS + 1)) {
    const cells = splitLine(line, delimiter);
    const row: Row = {};
    rawHeaders.forEach((h, i) => {
      row[h] = cells[i] ?? "";
    });
    rows.push(row);
  }
  return { rows, headerMap, rawHeaders };
}

function num(row: Row, headerMap: Record<string, string>, field: string): number | null {
  const header = headerMap[field];
  if (!header) return null;
  const raw = (row[header] ?? "").replace(/[$,₹\s%]/g, "");
  if (raw === "") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

type Scored = {
  account: string;
  mrr: number | null;
  risk: number;
  band: Band;
  fired: { key: SignalKey; label: string; points: number; detail: string }[];
};

function bandOf(risk: number): Band {
  return risk >= 65 ? "bad" : risk >= 40 ? "warn" : "good";
}

export function run(input: RunInput): RunResult {
  const csv = (input.csv ?? "").trim();
  if (csv.length < 20) throw new Error("Paste a CSV with a header row and at least one account.");

  const profile: Profile = (["Product-led SaaS", "Sales-led SaaS", "Enterprise / annual contracts"] as Profile[]).includes(
    input.profile as Profile,
  )
    ? (input.profile as Profile)
    : "Sales-led SaaS";
  const weights = WEIGHTS[profile];

  const { rows, headerMap, rawHeaders } = parseCsv(csv);
  if (!headerMap.account) {
    throw new Error(
      `Could not find an account name column. Rename one column to "account" or "company". Found: ${rawHeaders.join(", ")}`,
    );
  }

  const scored: Scored[] = rows.map((row, i) => {
    const account = (row[headerMap.account] ?? "").trim() || `Row ${i + 2}`;
    const mrr = num(row, headerMap, "mrr");

    const logins30 = num(row, headerMap, "logins30");
    const loginsPrev = num(row, headerMap, "loginsPrev");
    const daysSinceLogin = num(row, headerMap, "daysSinceLogin");
    const seatsUsed = num(row, headerMap, "seatsUsed");
    const seatsPaid = num(row, headerMap, "seatsPaid");
    const tickets = num(row, headerMap, "tickets");
    const nps = num(row, headerMap, "nps");
    const renewalDays = num(row, headerMap, "renewalDays");

    const fired: Scored["fired"] = [];
    let earned = 0;
    let available = 0;

    // 1. usage trend
    if (logins30 !== null && loginsPrev !== null && loginsPrev > 0) {
      available += weights.usageDrop;
      const drop = (loginsPrev - logins30) / loginsPrev;
      if (drop > 0.15) {
        const intensity = clamp01((drop - 0.15) / 0.55);
        const points = Math.round(weights.usageDrop * intensity);
        earned += points;
        if (points > 0) {
          fired.push({
            key: "usageDrop",
            label: SIGNAL_LABEL.usageDrop,
            points,
            detail: `Logins fell ${Math.round(drop * 100)}% (${loginsPrev} → ${logins30}).`,
          });
        }
      }
    }

    // 2. dormancy
    if (daysSinceLogin !== null) {
      available += weights.dormant;
      if (daysSinceLogin >= 7) {
        const intensity = clamp01((daysSinceLogin - 7) / 30);
        const points = Math.round(weights.dormant * intensity);
        earned += points;
        if (points > 0) {
          fired.push({
            key: "dormant",
            label: SIGNAL_LABEL.dormant,
            points,
            detail: `No login for ${daysSinceLogin} days.`,
          });
        }
      }
    }

    // 3. seat adoption
    if (seatsUsed !== null && seatsPaid !== null && seatsPaid > 0) {
      available += weights.seatUnderuse;
      const util = seatsUsed / seatsPaid;
      if (util < 0.75) {
        const intensity = clamp01((0.75 - util) / 0.65);
        const points = Math.round(weights.seatUnderuse * intensity);
        earned += points;
        if (points > 0) {
          fired.push({
            key: "seatUnderuse",
            label: SIGNAL_LABEL.seatUnderuse,
            points,
            detail: `Only ${seatsUsed} of ${seatsPaid} seats active (${Math.round(util * 100)}%).`,
          });
        }
      }
    }

    // 4. support pressure
    if (tickets !== null) {
      available += weights.supportPressure;
      if (tickets >= 2) {
        const intensity = clamp01((tickets - 1) / 5);
        const points = Math.round(weights.supportPressure * intensity);
        earned += points;
        if (points > 0) {
          fired.push({
            key: "supportPressure",
            label: SIGNAL_LABEL.supportPressure,
            points,
            detail: `${tickets} tickets still open.`,
          });
        }
      }
    }

    // 5. satisfaction (0-10 scale)
    if (nps !== null) {
      available += weights.satisfaction;
      if (nps <= 7) {
        const intensity = clamp01((7 - nps) / 7);
        const points = Math.round(weights.satisfaction * intensity);
        earned += points;
        if (points > 0) {
          fired.push({
            key: "satisfaction",
            label: SIGNAL_LABEL.satisfaction,
            points,
            detail: `Last score ${nps}/10 — detractor or passive.`,
          });
        }
      }
    }

    // 6. renewal proximity
    if (renewalDays !== null) {
      available += weights.renewalWindow;
      if (renewalDays <= 90) {
        const intensity = clamp01((90 - renewalDays) / 90);
        const points = Math.round(weights.renewalWindow * intensity);
        earned += points;
        if (points > 0) {
          fired.push({
            key: "renewalWindow",
            label: SIGNAL_LABEL.renewalWindow,
            points,
            detail: `Renews in ${renewalDays} days.`,
          });
        }
      }
    }

    // Normalise against the signals we actually had data for, so a partial
    // export is not silently scored as low risk.
    const risk = available > 0 ? Math.min(100, Math.round((earned / available) * 100)) : 0;
    fired.sort((a, b) => b.points - a.points);

    return { account, mrr, risk, band: bandOf(risk), fired };
  });

  scored.sort((a, b) => b.risk * (b.mrr ?? 1) - a.risk * (a.mrr ?? 1));

  const critical = scored.filter((s) => s.band === "bad");
  const watch = scored.filter((s) => s.band === "warn");
  const healthy = scored.filter((s) => s.band === "good");

  const mrrOf = (list: Scored[]) => list.reduce((sum, s) => sum + (s.mrr ?? 0), 0);
  const totalMrr = mrrOf(scored);
  const atRiskMrr = mrrOf(critical) + mrrOf(watch) * 0.4;

  const portfolioRisk =
    totalMrr > 0
      ? Math.round(scored.reduce((sum, s) => sum + s.risk * (s.mrr ?? 0), 0) / totalMrr)
      : Math.round(scored.reduce((sum, s) => sum + s.risk, 0) / Math.max(1, scored.length));

  const money = (n: number) =>
    `$${Math.round(n).toLocaleString("en-US")}`;

  // ---- coverage report ------------------------------------------------------
  const coverage: ResultItem[] = Object.keys(FIELD_ALIASES).map((field) => ({
    title: field,
    body: headerMap[field]
      ? `Matched to column "${headerMap[field]}".`
      : `Not found — this signal was excluded from scoring. Accepted names: ${FIELD_ALIASES[field].slice(0, 4).join(", ")}.`,
    tag: headerMap[field] ? "in use" : "missing",
    severity: headerMap[field] ? undefined : "low",
  }));

  // ---- scored CSV out ------------------------------------------------------
  const csvOut = [
    [...rawHeaders, "risk_score", "risk_band", "reason_codes"].join(","),
    ...scored.map((s) => {
      const original = rows.find((r) => (r[headerMap.account] ?? "").trim() === s.account);
      const cells = rawHeaders.map((h) => {
        const v = original?.[h] ?? "";
        return v.includes(",") ? `"${v}"` : v;
      });
      const band = s.band === "bad" ? "critical" : s.band === "warn" ? "watch" : "healthy";
      return [...cells, String(s.risk), band, `"${s.fired.map((f) => f.key).join("|")}"`].join(",");
    }),
  ].join("\n");

  // ---- save play email for the top account ---------------------------------
  const top = scored[0];
  const topPlay = top?.fired[0];
  const saveEmail = top
    ? [
        `Subject: ${top.account} — quick check in`,
        "",
        "Hi there,",
        "",
        topPlay
          ? `I was reviewing your account and noticed ${topPlay.detail.toLowerCase().replace(/\.$/, "")}.`
          : "I was reviewing your account ahead of the next cycle.",
        "",
        "Rather than guess at the reason, I would rather ask: what has stopped working for your team?",
        "",
        "I have 20 minutes free this week and I will come with specifics, not a pitch.",
        "",
        "Best,",
      ].join("\n")
    : "";

  const headline =
    critical.length > 0
      ? `${critical.length} of ${scored.length} accounts are critical, putting roughly ${money(atRiskMrr)} MRR at risk. Start with ${critical[0].account}.`
      : watch.length > 0
        ? `No critical accounts, but ${watch.length} of ${scored.length} need watching — about ${money(atRiskMrr)} MRR is soft.`
        : `All ${scored.length} accounts look healthy on the signals provided. Portfolio risk is ${portfolioRisk}/100.`;

  return {
    headline,
    score: { label: "Revenue-weighted portfolio risk", value: portfolioRisk, max: 100, band: bandOf(portfolioRisk) },
    metrics: [
      { label: "Accounts scored", value: String(scored.length), hint: `${Object.keys(headerMap).length - 1} signals available` },
      { label: "Critical", value: String(critical.length), hint: `${money(mrrOf(critical))} MRR` },
      { label: "Watchlist", value: String(watch.length), hint: `${money(mrrOf(watch))} MRR` },
      { label: "MRR at risk", value: money(atRiskMrr), hint: `of ${money(totalMrr)} total` },
    ],
    table: {
      columns: ["Account", "MRR", "Risk", "Band", "Top reason"],
      rows: scored.map((s) => [
        s.account,
        s.mrr !== null ? money(s.mrr) : "—",
        `${s.risk}/100`,
        s.band === "bad" ? "Critical" : s.band === "warn" ? "Watch" : "Healthy",
        s.fired[0]?.label ?? "No signals fired",
      ]),
    },
    sections: [
      {
        title: `Critical accounts (${critical.length}) — work these first`,
        items: critical.map((s) => ({
          title: `${s.account} · ${s.risk}/100${s.mrr !== null ? ` · ${money(s.mrr)} MRR` : ""}`,
          body: `${s.fired.map((f) => `${f.label} (+${f.points}): ${f.detail}`).join(" ")} → ${
            s.fired[0] ? SAVE_PLAY[s.fired[0].key] : ""
          }`,
          severity: "high",
        })),
      },
      {
        title: `Watchlist (${watch.length}) — check in this month`,
        items: watch.map((s) => ({
          title: `${s.account} · ${s.risk}/100`,
          body: `${s.fired.map((f) => f.detail).join(" ")} Recommended: ${
            s.fired[0] ? SAVE_PLAY[s.fired[0].key] : "monitor only."
          }`,
          severity: "medium",
        })),
      },
      {
        title: `Healthy (${healthy.length}) — candidates for expansion`,
        items: healthy.map((s) => ({
          title: `${s.account} · ${s.risk}/100`,
          body:
            s.fired.length === 0
              ? "No risk signals fired. Good expansion or referral candidate."
              : `Minor signals only: ${s.fired.map((f) => f.label).join(", ")}.`,
        })),
      },
      { title: "Data coverage — what was scored", items: coverage },
    ],
    copyBlocks: [
      { title: "Scored CSV (re-import into your CRM)", text: csvOut, language: "csv" },
      ...(saveEmail ? [{ title: `Save-play email for ${top.account}`, text: saveEmail }] : []),
    ],
    json: {
      profile,
      weights,
      portfolioRisk,
      totals: { accounts: scored.length, totalMrr, atRiskMrr, critical: critical.length, watch: watch.length, healthy: healthy.length },
      accounts: scored.map((s) => ({
        account: s.account,
        mrr: s.mrr,
        risk: s.risk,
        band: s.band === "bad" ? "critical" : s.band === "warn" ? "watch" : "healthy",
        reasons: s.fired.map((f) => ({ code: f.key, label: f.label, points: f.points, detail: f.detail })),
        recommendedPlay: s.fired[0] ? SAVE_PLAY[s.fired[0].key] : null,
      })),
      signalCoverage: Object.fromEntries(
        Object.keys(FIELD_ALIASES).map((f) => [f, headerMap[f] ?? null]),
      ),
    },
  };
}
