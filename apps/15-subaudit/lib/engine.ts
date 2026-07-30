import type { ResultItem, RunInput, RunResult, Severity } from "./types.ts";

/**
 * Finds recurring software spend in a statement.
 *
 * Two decisions shape everything here.
 *
 * First, cadence is inferred from the intervals between charges, never assumed.
 * A monthly and an annual subscription at the same amount are entirely different
 * problems — one is ₪12x a year, the other has a cancellation window you can miss
 * by a day — and guessing would make the renewal dates fiction.
 *
 * Second, an unrecognised recurring charge is reported, never dropped. A
 * subscription nobody recognises is the single most interesting line in the output,
 * so filtering to a known-vendor list would remove the best finding.
 */

type Txn = { date: Date; iso: string; description: string; amount: number; line: number };

type Sub = {
  vendor: string;
  category: string;
  recognised: boolean;
  charges: Txn[];
  cadence: "monthly" | "quarterly" | "annual" | "irregular";
  cadenceDays: number;
  latest: number;
  annualised: number;
  nextRenewal: string;
  priceRise: { from: number; to: number; percent: number } | null;
  staleDays: number | null;
};

// ---------------------------------------------------------------------------
// Vendor dictionary
// ---------------------------------------------------------------------------

/**
 * Patterns run in order, so a specific rule can precede a general one. Categories
 * exist to make overlap visible: two entries in "Project tracking" is the finding,
 * not the individual charges.
 */
const VENDORS: [RegExp, string, string][] = [
  // Cloud and infrastructure
  [/\baws\b|amazon web services/i, "Amazon Web Services", "Cloud infrastructure"],
  [/google\s*\*?\s*cloud|gcp/i, "Google Cloud", "Cloud infrastructure"],
  [/\bazure\b|microsoft.*azure/i, "Microsoft Azure", "Cloud infrastructure"],
  [/digitalocean/i, "DigitalOcean", "Cloud infrastructure"],
  [/\bvercel\b/i, "Vercel", "Hosting"],
  [/netlify/i, "Netlify", "Hosting"],
  [/heroku/i, "Heroku", "Hosting"],
  [/cloudflare/i, "Cloudflare", "CDN and DNS"],
  [/\bfly\.io\b/i, "Fly.io", "Hosting"],
  [/railway\.app/i, "Railway", "Hosting"],
  [/\bneon\b.*(tech|db)|neon\.tech/i, "Neon", "Database"],
  [/supabase/i, "Supabase", "Database"],
  [/mongodb|atlas.*mongo/i, "MongoDB Atlas", "Database"],
  [/planetscale/i, "PlanetScale", "Database"],
  [/\bredis\b|upstash/i, "Redis / Upstash", "Database"],
  [/snowflake/i, "Snowflake", "Data warehouse"],
  [/databricks/i, "Databricks", "Data warehouse"],

  // Project and docs
  [/atlassian|\bjira\b|confluence/i, "Atlassian", "Project tracking"],
  [/\basana\b/i, "Asana", "Project tracking"],
  [/monday\.com/i, "Monday.com", "Project tracking"],
  [/clickup/i, "ClickUp", "Project tracking"],
  [/\btrello\b/i, "Trello", "Project tracking"],
  [/linear\.app|\blinear\b/i, "Linear", "Project tracking"],
  [/basecamp/i, "Basecamp", "Project tracking"],
  [/\bnotion\b/i, "Notion", "Docs and wiki"],
  [/coda\.io/i, "Coda", "Docs and wiki"],
  [/airtable/i, "Airtable", "Docs and wiki"],
  [/\bmiro\b/i, "Miro", "Whiteboard"],
  [/\bfigjam\b/i, "FigJam", "Whiteboard"],
  [/\bmural\b/i, "Mural", "Whiteboard"],

  // Design
  [/\bfigma\b/i, "Figma", "Design"],
  [/\bsketch\b/i, "Sketch", "Design"],
  [/canva/i, "Canva", "Design"],
  [/adobe.*(acrobat\s*sign|echosign)/i, "Adobe Acrobat Sign", "E-signature"],
  [/adobe/i, "Adobe Creative Cloud", "Design"],

  // Communication
  [/\bslack\b/i, "Slack", "Team chat"],
  [/\bzoom\b/i, "Zoom", "Video calls"],
  [/microsoft\s*teams/i, "Microsoft Teams", "Team chat"],
  [/google\s*workspace|g\s*suite/i, "Google Workspace", "Email and docs"],
  [/microsoft\s*365|office\s*365/i, "Microsoft 365", "Email and docs"],
  [/\bdiscord\b/i, "Discord", "Team chat"],
  [/loom\.com|\bloom\b/i, "Loom", "Video messaging"],
  [/calendly/i, "Calendly", "Scheduling"],

  // Sales and marketing
  [/salesforce/i, "Salesforce", "CRM"],
  [/hubspot/i, "HubSpot", "CRM"],
  [/pipedrive/i, "Pipedrive", "CRM"],
  [/\bzoho\b/i, "Zoho", "CRM"],
  [/\battio\b/i, "Attio", "CRM"],
  [/\bfreshworks\b|freshsales/i, "Freshworks", "CRM"],
  [/mailchimp|intuit.*mailchimp/i, "Mailchimp", "Email marketing"],
  [/\bresend\b/i, "Resend", "Email delivery"],
  [/sendgrid|twilio.*sendgrid/i, "SendGrid", "Email delivery"],
  [/postmark/i, "Postmark", "Email delivery"],
  [/\btwilio\b/i, "Twilio", "Messaging"],
  [/klaviyo/i, "Klaviyo", "Email marketing"],
  [/\bahrefs\b/i, "Ahrefs", "SEO"],
  [/\bsemrush\b/i, "Semrush", "SEO"],
  [/\bapollo\.io\b/i, "Apollo", "Sales prospecting"],
  [/\bzoominfo\b/i, "ZoomInfo", "Sales prospecting"],
  [/lusha/i, "Lusha", "Sales prospecting"],

  // Support
  [/zendesk/i, "Zendesk", "Customer support"],
  [/\bintercom\b/i, "Intercom", "Customer support"],
  [/freshdesk/i, "Freshdesk", "Customer support"],
  [/help\s*scout/i, "Help Scout", "Customer support"],
  [/crisp\.chat/i, "Crisp", "Customer support"],

  // Analytics and monitoring
  [/\bmixpanel\b/i, "Mixpanel", "Product analytics"],
  [/\bamplitude\b/i, "Amplitude", "Product analytics"],
  [/\bposthog\b/i, "PostHog", "Product analytics"],
  [/\bheap\b.*analytics/i, "Heap", "Product analytics"],
  [/\bhotjar\b/i, "Hotjar", "Session replay"],
  [/fullstory/i, "FullStory", "Session replay"],
  [/\bsentry\b/i, "Sentry", "Error monitoring"],
  [/datadog/i, "Datadog", "Observability"],
  [/new\s*relic/i, "New Relic", "Observability"],
  [/grafana/i, "Grafana", "Observability"],
  [/\bpagerduty\b/i, "PagerDuty", "On-call"],
  [/\bopsgenie\b/i, "Opsgenie", "On-call"],
  [/pingdom|uptimerobot|betterstack|better\s*stack/i, "Uptime monitoring", "Uptime monitoring"],
  [/\bplausible\b|\bumami\b/i, "Privacy analytics", "Web analytics"],

  // Engineering
  [/github/i, "GitHub", "Source control"],
  [/gitlab/i, "GitLab", "Source control"],
  [/bitbucket/i, "Bitbucket", "Source control"],
  [/circleci/i, "CircleCI", "CI/CD"],
  [/\bharness\b/i, "Harness", "CI/CD"],
  [/jfrog|artifactory/i, "JFrog", "Artifact registry"],
  [/\bpostman\b/i, "Postman", "API tooling"],
  [/\bsonar(cloud|qube)\b/i, "SonarSource", "Code quality"],
  [/\bsnyk\b/i, "Snyk", "Security scanning"],
  [/\bcursor\b.*(ai|sh)|cursor\.(sh|com)/i, "Cursor", "AI coding"],
  [/\bcopilot\b/i, "GitHub Copilot", "AI coding"],
  [/openai|chatgpt/i, "OpenAI", "AI models"],
  [/anthropic|\bclaude\b/i, "Anthropic", "AI models"],

  // E-signature and legal
  [/docusign/i, "DocuSign", "E-signature"],
  [/\bhellosign\b|dropbox\s*sign/i, "Dropbox Sign", "E-signature"],
  [/pandadoc/i, "PandaDoc", "E-signature"],
  [/\bironclad\b/i, "Ironclad", "Contract management"],

  // Finance and HR
  [/\bstripe\b/i, "Stripe", "Payments"],
  [/razorpay/i, "Razorpay", "Payments"],
  [/\bpaddle\b/i, "Paddle", "Payments"],
  [/quickbooks|intuit/i, "QuickBooks", "Accounting"],
  [/\bxero\b/i, "Xero", "Accounting"],
  [/tally\s*(solutions|prime)/i, "TallyPrime", "Accounting"],
  [/cleartax/i, "ClearTax", "Tax compliance"],
  [/\bgusto\b/i, "Gusto", "Payroll"],
  [/\bdeel\b/i, "Deel", "Payroll"],
  [/\brippling\b/i, "Rippling", "HR"],
  [/darwinbox/i, "Darwinbox", "HR"],
  [/keka\s*hr|\bkeka\b/i, "Keka", "HR"],
  [/\bgreenhouse\b/i, "Greenhouse", "Recruiting"],
  [/\blever\b.*co/i, "Lever", "Recruiting"],

  // Storage and security
  [/dropbox/i, "Dropbox", "File storage"],
  [/\bbox\.com\b/i, "Box", "File storage"],
  [/1password|\bonepassword\b/i, "1Password", "Password manager"],
  [/lastpass/i, "LastPass", "Password manager"],
  [/\bbitwarden\b/i, "Bitwarden", "Password manager"],
  [/\bokta\b|auth0/i, "Okta / Auth0", "Identity"],
  [/\bvanta\b/i, "Vanta", "Compliance"],
  [/\bdrata\b/i, "Drata", "Compliance"],
];

/** Payment processors that prefix the real vendor name. Stripped before matching. */
const PROCESSOR_PREFIX = /^(paddle\.net\*?|pddl\*|stripe\s*\*?|sq\s*\*|razorpay\*?|fs\s*\*|chargebee\*?|paypal\s*\*?)\s*/i;

function identify(description: string): { vendor: string; category: string; recognised: boolean } {
  const cleaned = description.replace(PROCESSOR_PREFIX, "").trim();
  for (const [pattern, vendor, category] of VENDORS) {
    if (pattern.test(cleaned) || pattern.test(description)) return { vendor, category, recognised: true };
  }
  // Fall back to a readable form of the descriptor, with the transaction noise
  // stripped, so an unknown vendor is still legible in the report.
  const label = cleaned
    .replace(/[*#]/g, " ")
    .replace(/\b[A-Z0-9]{6,}\b/g, " ")
    .replace(/\b\d{3,}\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { vendor: label || description.trim(), category: "Unrecognised", recognised: false };
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]!;
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else quoted = false;
      } else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === "," || ch === "\t" || ch === ";") {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function parseDate(raw: string): Date | null {
  const t = raw.trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t);
  if (m) return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  m = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/.exec(t);
  if (m) {
    const year = m[3]!.length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    // Day-first, which is what Indian and European statements use.
    return new Date(Date.UTC(year, Number(m[2]) - 1, Number(m[1])));
  }
  m = /^(\d{1,2})[-\s]([A-Za-z]{3})[-\s](\d{2,4})$/.exec(t);
  if (m) {
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const mi = months.indexOf(m[2]!.toLowerCase());
    if (mi >= 0) {
      const year = m[3]!.length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
      return new Date(Date.UTC(year, mi, Number(m[1])));
    }
  }
  return null;
}

function toAmount(raw: string): number {
  const cleaned = raw.replace(/[₹$€£\s,]/g, "").replace(/\((.*)\)/, "-$1");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? Math.abs(n) : Number.NaN;
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 86_400_000);
}

function parseStatement(csv: string): { txns: Txn[]; skipped: number } {
  const lines = csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) throw new Error("Paste a statement with a header row and at least one transaction.");

  const header = splitCsvLine(lines[0]!).map((h) => h.toLowerCase());
  const findCol = (patterns: RegExp[]) => header.findIndex((h) => patterns.some((p) => p.test(h)));

  const dateCol = findCol([/date|posted|txn.*date/]);
  const descCol = findCol([/desc|narration|particular|details|merchant|payee|remark/]);
  // Debit-only statements are common; a generic amount column is the fallback.
  const debitCol = findCol([/debit|withdraw/]);
  const amountCol = findCol([/amount|value/]);

  if (dateCol < 0 || descCol < 0 || (debitCol < 0 && amountCol < 0)) {
    throw new Error(
      `Could not find the columns needed. Expected a date, a description and an amount; found: ${header.join(", ")}. Rename the header row and try again.`,
    );
  }

  const txns: Txn[] = [];
  let skipped = 0;
  for (let i = 1; i < lines.length; i += 1) {
    const cells = splitCsvLine(lines[i]!);
    const date = parseDate(cells[dateCol] ?? "");
    const description = (cells[descCol] ?? "").trim();
    const amountRaw = debitCol >= 0 && (cells[debitCol] ?? "").trim() ? cells[debitCol]! : (cells[amountCol] ?? "");
    const amount = toAmount(amountRaw);

    if (!date || !description || !Number.isFinite(amount) || amount <= 0) {
      skipped += 1;
      continue;
    }
    txns.push({ date, iso: iso(date), description, amount, line: i + 1 });
  }
  return { txns, skipped };
}

// ---------------------------------------------------------------------------
// Cadence
// ---------------------------------------------------------------------------

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1]! + s[mid]!) / 2 : s[mid]!;
}

function detectCadence(charges: Txn[]): { cadence: Sub["cadence"]; days: number } {
  if (charges.length < 2) {
    // One charge cannot establish a rhythm. Saying so is more useful than guessing
    // monthly, which would invent a renewal date and an annualised figure.
    return { cadence: "irregular", days: 0 };
  }
  const gaps: number[] = [];
  for (let i = 1; i < charges.length; i += 1) {
    gaps.push(Math.round((charges[i]!.date.getTime() - charges[i - 1]!.date.getTime()) / 86_400_000));
  }
  const m = median(gaps);
  if (m >= 25 && m <= 35) return { cadence: "monthly", days: 30 };
  if (m >= 84 && m <= 96) return { cadence: "quarterly", days: 91 };
  if (m >= 350 && m <= 380) return { cadence: "annual", days: 365 };
  if (m >= 6 && m <= 8) return { cadence: "monthly", days: 7 }; // weekly, annualised the same way
  return { cadence: "irregular", days: Math.round(m) };
}

function money(n: number, currency: string): string {
  const symbol: Record<string, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£", AED: "AED ", SGD: "S$" };
  const locale = currency === "INR" ? "en-IN" : "en-US";
  return `${symbol[currency] ?? `${currency} `}${Math.round(n).toLocaleString(locale)}`;
}

// ---------------------------------------------------------------------------
// run
// ---------------------------------------------------------------------------

export async function run(input: RunInput): Promise<RunResult> {
  const { txns, skipped } = parseStatement(input.statement ?? "");
  if (txns.length === 0) throw new Error("No usable transactions found. Check the date and amount columns.");

  const currency = input.currency ?? "INR";

  const asOfRaw = (input.asOfDate ?? "").trim();
  const asOf = parseDate(asOfRaw);
  if (!asOf) {
    throw new Error("Statement date must be an ISO date such as 2026-07-31. Renewal dates are measured from it, so it cannot be inferred.");
  }

  // Group by vendor. Amount is deliberately not part of the key: a price rise must
  // stay one subscription, not become two.
  const groups = new Map<string, { info: ReturnType<typeof identify>; charges: Txn[] }>();
  for (const t of txns) {
    const info = identify(t.description);
    const existing = groups.get(info.vendor);
    if (existing) existing.charges.push(t);
    else groups.set(info.vendor, { info, charges: [t] });
  }

  const subs: Sub[] = [];
  const oneOff: Txn[] = [];

  for (const { info, charges } of groups.values()) {
    charges.sort((a, b) => a.date.getTime() - b.date.getTime());

    // A single charge from an unrecognised merchant is a purchase, not a
    // subscription. A single charge from a known SaaS vendor is worth surfacing,
    // because that is exactly how an annual contract looks in a 6-month window.
    if (charges.length === 1 && !info.recognised) {
      oneOff.push(charges[0]!);
      continue;
    }

    const { cadence, days } = detectCadence(charges);
    const latest = charges[charges.length - 1]!.amount;
    const annualised =
      cadence === "monthly" ? latest * 12 : cadence === "quarterly" ? latest * 4 : cadence === "annual" ? latest : latest;

    const first = charges[0]!.amount;
    const priceRise =
      latest > first * 1.02
        ? { from: first, to: latest, percent: Math.round(((latest - first) / first) * 100) }
        : null;

    const daysSinceLast = Math.round((asOf.getTime() - charges[charges.length - 1]!.date.getTime()) / 86_400_000);
    // Stale means it has missed its own cycle by more than half a cycle again.
    const cycle = days > 0 ? days : 30;
    const staleDays = daysSinceLast > cycle * 1.5 ? daysSinceLast : null;

    subs.push({
      vendor: info.vendor,
      category: info.category,
      recognised: info.recognised,
      charges,
      cadence,
      cadenceDays: cycle,
      latest,
      annualised,
      nextRenewal: iso(addDays(charges[charges.length - 1]!.date, cycle)),
      priceRise,
      staleDays,
    });
  }

  subs.sort((a, b) => b.annualised - a.annualised);

  const totalAnnual = subs.reduce((s, x) => s + x.annualised, 0);
  const totalMonthly = subs.filter((s) => s.cadence === "monthly").reduce((s, x) => s + x.latest, 0);

  // Duplicates: two or more distinct vendors in the same real category.
  const byCategory = new Map<string, Sub[]>();
  for (const s of subs) {
    if (s.category === "Unrecognised") continue;
    const list = byCategory.get(s.category) ?? [];
    list.push(s);
    byCategory.set(s.category, list);
  }
  const allOverlaps = [...byCategory.entries()].filter(([, list]) => list.length > 1);

  // Some categories are multi-vendor by design. Almost every serious engineering
  // team runs more than one cloud, more than one database and more than one
  // hosting target, and telling them to consolidate would be confidently wrong
  // advice about their architecture. These are reported as informational and kept
  // out of the recoverable figure — a number that includes spend you should not cut
  // is a number nobody trusts twice.
  const EXPECTED_MULTI_VENDOR = new Set([
    "Cloud infrastructure",
    "Hosting",
    "Database",
    "AI models",
    "Payments",
    "Observability",
    "Source control",
  ]);

  const duplicates = allOverlaps.filter(([category]) => !EXPECTED_MULTI_VENDOR.has(category));
  const expectedOverlaps = allOverlaps.filter(([category]) => EXPECTED_MULTI_VENDOR.has(category));

  const rises = subs.filter((s) => s.priceRise);
  const stale = subs.filter((s) => s.staleDays !== null);
  const unrecognised = subs.filter((s) => !s.recognised);

  /**
   * Recoverable spend, counting each vendor at most once.
   *
   * A subscription can be both a duplicate and stale — DocuSign overlapping Adobe
   * Sign *and* having stopped charging is a very normal combination — and adding
   * both figures would inflate the headline saving. Overstating the number in the
   * one place a CFO will check is how this product loses its credibility.
   */
  const recoverableByVendor = new Map<string, { amount: number; reason: string }>();

  for (const [category, list] of duplicates) {
    // Assume the most expensive is the one being kept; it is usually the primary.
    const sorted = [...list].sort((a, b) => b.annualised - a.annualised);
    for (const s of sorted.slice(1)) {
      recoverableByVendor.set(s.vendor, {
        amount: s.annualised,
        reason: `duplicate of ${sorted[0]!.vendor} in ${category}`,
      });
    }
  }
  for (const s of stale) {
    // Stale wins the description: "it already stopped charging" is more actionable
    // than "it overlaps with something".
    recoverableByVendor.set(s.vendor, {
      amount: s.annualised,
      reason: `no charge in ${s.staleDays} days — confirm whether it is already gone`,
    });
  }

  const duplicateWaste = duplicates.reduce((sum, [, list]) => {
    const sorted = [...list].sort((a, b) => b.annualised - a.annualised);
    return sum + sorted.slice(1).reduce((s, x) => s + x.annualised, 0);
  }, 0);
  const staleSaving = stale.reduce((s, x) => s + x.annualised, 0);
  const recoverable = [...recoverableByVendor.values()].reduce((s, x) => s + x.amount, 0);

  // --- sections
  const sections: { title: string; items: ResultItem[] }[] = [];

  sections.push({
    title: `Subscriptions found — ${subs.length}, ${money(totalAnnual, currency)} a year`,
    items: subs.map((s) => ({
      title: `${s.vendor} — ${money(s.latest, currency)} ${s.cadence}`,
      body: `${money(s.annualised, currency)} a year. ${s.charges.length} charge${s.charges.length === 1 ? "" : "s"} in this statement, latest ${s.charges[s.charges.length - 1]!.iso}. Next renewal around ${s.nextRenewal}.${s.cadence === "irregular" ? " Cadence could not be established from these dates, so the annual figure assumes the latest amount recurs — paste more months to firm it up." : ""}${s.recognised ? "" : " Vendor not recognised, so this may not be software at all — check it."}`,
      tag: s.category,
      severity: s.annualised > totalAnnual * 0.2 ? ("medium" as Severity) : ("low" as Severity),
    })),
  });

  if (duplicates.length > 0) {
    sections.push({
      title: `Overlapping tools — ${money(duplicateWaste, currency)} a year in the duplicates`,
      items: duplicates.map(([category, list]) => {
        const sorted = [...list].sort((a, b) => b.annualised - a.annualised);
        return {
          title: `${category}: ${list.length} tools`,
          body: `${sorted.map((s) => `${s.vendor} (${money(s.annualised, currency)}/yr)`).join(", ")}. Keeping only ${sorted[0]!.vendor} would save ${money(sorted.slice(1).reduce((s, x) => s + x.annualised, 0), currency)} a year. Two tools in one category is sometimes deliberate — but it is usually two teams buying separately.`,
          tag: money(sorted.slice(1).reduce((s, x) => s + x.annualised, 0), currency),
          severity: "high" as Severity,
        };
      }),
    });
  }

  if (rises.length > 0) {
    sections.push({
      title: `Price rises — ${rises.length}`,
      items: rises.map((s) => ({
        title: s.vendor,
        body: `Went from ${money(s.priceRise!.from, currency)} to ${money(s.priceRise!.to, currency)}, up ${s.priceRise!.percent}%. That is ${money((s.priceRise!.to - s.priceRise!.from) * (s.cadence === "monthly" ? 12 : s.cadence === "quarterly" ? 4 : 1), currency)} a year more than when you signed up.`,
        tag: `+${s.priceRise!.percent}%`,
        severity: s.priceRise!.percent >= 15 ? ("high" as Severity) : ("medium" as Severity),
      })),
    });
  }

  if (stale.length > 0) {
    sections.push({
      title: `Stopped charging — ${stale.length}, ${money(staleSaving, currency)} a year`,
      items: stale.map((s) => ({
        title: s.vendor,
        body: `Last charged ${s.charges[s.charges.length - 1]!.iso}, ${s.staleDays} days before the statement date, on a ${s.cadence} cycle. Either it was already cancelled — in which case remove it from your budget — or the card was declined and the service is about to be cut off. Both are worth knowing today.`,
        tag: `${s.staleDays}d silent`,
        severity: "medium" as Severity,
      })),
    });
  }

  if (expectedOverlaps.length > 0) {
    sections.push({
      title: `Multiple vendors, probably deliberate — ${expectedOverlaps.length}`,
      items: expectedOverlaps.map(([category, list]) => ({
        title: `${category}: ${list.map((s) => s.vendor).join(" + ")}`,
        body: `${money(list.reduce((s, x) => s + x.annualised, 0), currency)} a year across ${list.length} vendors. This is NOT counted as waste — running more than one cloud, database or model provider is normal architecture, and recommending consolidation would be a guess about your system rather than a finding about your spend. Shown so you can see the split.`,
        tag: "informational",
        severity: "low" as Severity,
      })),
    });
  }

  if (unrecognised.length > 0) {
    sections.push({
      title: `Recurring but unrecognised — ${unrecognised.length}`,
      items: unrecognised.map((s) => ({
        title: s.vendor,
        body: `${money(s.latest, currency)} ${s.cadence}, ${money(s.annualised, currency)} a year. This charges on a regular cycle but is not a vendor we recognise. It is reported rather than filtered out precisely because a subscription nobody recognises is the most interesting line here.`,
        severity: "medium" as Severity,
      })),
    });
  }

  if (oneOff.length > 0) {
    sections.push({
      title: `Ignored as one-off — ${oneOff.length}`,
      items: [
        {
          body: `${oneOff.length} charge${oneOff.length === 1 ? "" : "s"} appeared once from an unrecognised merchant and were treated as purchases, not subscriptions: ${oneOff
            .slice(0, 8)
            .map((t) => `${t.description.slice(0, 30)} (${money(t.amount, currency)})`)
            .join(", ")}${oneOff.length > 8 ? `, and ${oneOff.length - 8} more` : ""}. If any is actually an annual subscription, paste twelve months so its cycle becomes visible.`,
          severity: "low",
        },
      ],
    });
  }

  // --- cancel shortlist, ranked by saving, each vendor once
  const shortlist = [...recoverableByVendor.entries()]
    .sort((a, b) => b[1].amount - a[1].amount)
    .map(([vendor, { amount, reason }]) => `${vendor} — ${money(amount, currency)}/yr — ${reason}`);

  for (const s of unrecognised) {
    if (recoverableByVendor.has(s.vendor)) continue;
    shortlist.push(`${s.vendor} — ${money(s.annualised, currency)}/yr — nobody has identified this yet, worth ten minutes`);
  }

  const renewalCalendar = [...subs]
    .sort((a, b) => a.nextRenewal.localeCompare(b.nextRenewal))
    .map((s) => `${s.nextRenewal}  ${money(s.latest, currency).padStart(12)}  ${s.vendor} (${s.cadence})`)
    .join("\n");

  const wastePercent = totalAnnual > 0 ? Math.round((recoverable / totalAnnual) * 100) : 0;

  return {
    headline:
      recoverable > 0
        ? `${money(recoverable, currency)} a year recoverable — ${duplicates.length} overlapping categor${duplicates.length === 1 ? "y" : "ies"} and ${stale.length} subscription${stale.length === 1 ? "" : "s"} that stopped charging. Total software spend ${money(totalAnnual, currency)} a year.`
        : `${subs.length} subscriptions, ${money(totalAnnual, currency)} a year, no obvious waste. ${rises.length > 0 ? `${rises.length} price rise${rises.length === 1 ? "" : "s"} worth challenging.` : "Nothing overlapping and nothing stale."}`,

    score: {
      label: "Recoverable spend",
      value: Math.min(100, wastePercent),
      max: 100,
      band: wastePercent >= 20 ? "bad" : wastePercent > 0 ? "warn" : "good",
    },

    metrics: [
      { label: "Annual software spend", value: money(totalAnnual, currency) },
      { label: "Monthly run rate", value: money(totalMonthly, currency), hint: "monthly subscriptions only" },
      { label: "Recoverable", value: money(recoverable, currency), hint: "duplicates + stale" },
      { label: "Subscriptions", value: String(subs.length), hint: `${unrecognised.length} unrecognised` },
      { label: "Price rises", value: String(rises.length) },
    ],

    sections,

    table: {
      columns: ["Vendor", "Category", "Amount", "Cadence", "Annual", "Next renewal"],
      rows: subs.map((s) => [
        s.vendor,
        s.category,
        money(s.latest, currency),
        s.cadence,
        money(s.annualised, currency),
        s.nextRenewal,
      ]),
    },

    copyBlocks: [
      {
        title: shortlist.length > 0 ? `Cancel shortlist — ${money(recoverable, currency)} a year` : "Cancel shortlist",
        text:
          shortlist.length > 0
            ? shortlist.join("\n")
            : "Nothing obviously cancellable. No overlapping categories, nothing stale, and every vendor is recognised.",
        language: "text",
      },
      { title: "Renewal calendar", text: renewalCalendar, language: "text" },
    ],

    json: {
      currency,
      asOf: iso(asOf),
      totals: { annual: totalAnnual, monthlyRunRate: totalMonthly, recoverable, wastePercent },
      subscriptions: subs.map((s) => ({
        vendor: s.vendor,
        category: s.category,
        recognised: s.recognised,
        amount: s.latest,
        cadence: s.cadence,
        annualised: s.annualised,
        nextRenewal: s.nextRenewal,
        chargeCount: s.charges.length,
        priceRise: s.priceRise,
        staleDays: s.staleDays,
      })),
      duplicates: duplicates.map(([category, list]) => ({ category, vendors: list.map((s) => s.vendor) })),
      expectedOverlaps: expectedOverlaps.map(([category, list]) => ({ category, vendors: list.map((s) => s.vendor) })),
      cancelShortlist: [...recoverableByVendor.entries()].map(([vendor, v]) => ({ vendor, ...v })),
      skippedRows: skipped,
    },
  };
}
