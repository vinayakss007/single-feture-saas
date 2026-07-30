import type { ResultItem, RunInput, RunResult, Severity } from "./types.ts";

/**
 * Builds a subprocessor register from a vendor list.
 *
 * The dataset below records each vendor's *default* hosting jurisdiction, and every
 * output labels it that way. This matters more than it sounds: most vendors let you
 * pick a region, and your choice overrides the default. A register that presented
 * our dataset as a fact about your account would be evidence you could not defend
 * in an audit, so where it matters commercially the output asks you to confirm.
 *
 * The second rule is that an unknown vendor is a finding, never an omission. A
 * register that silently drops the one tool nobody could identify is exactly the
 * register that fails a review.
 */

type VendorInfo = {
  region: string;
  /** ISO-ish jurisdiction group used for transfer analysis */
  jurisdiction: "EU" | "US" | "UK" | "IN" | "MULTI" | "OTHER";
  /** whether the vendor publishes a DPA you can simply accept */
  dpa: "self-serve" | "on-request" | "in-terms" | "unknown";
  sccs: boolean;
  category: string;
};

const VENDORS: Record<string, VendorInfo> = {
  // Cloud — MULTI because the customer chooses the region
  aws: { region: "Customer-selected region; US default", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "Infrastructure" },
  "amazon web services": { region: "Customer-selected region; US default", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "Infrastructure" },
  "google cloud": { region: "Customer-selected region; US default", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "Infrastructure" },
  gcp: { region: "Customer-selected region; US default", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "Infrastructure" },
  azure: { region: "Customer-selected region; US default", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "Infrastructure" },
  "microsoft azure": { region: "Customer-selected region; US default", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "Infrastructure" },
  digitalocean: { region: "Customer-selected region; US default", jurisdiction: "MULTI", dpa: "self-serve", sccs: true, category: "Infrastructure" },
  vercel: { region: "US (global edge)", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "Hosting" },
  netlify: { region: "US", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "Hosting" },
  cloudflare: { region: "Global edge; US entity", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "CDN and DNS" },
  heroku: { region: "US / EU selectable", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "Hosting" },
  railway: { region: "US", jurisdiction: "US", dpa: "on-request", sccs: true, category: "Hosting" },
  "fly.io": { region: "Customer-selected region", jurisdiction: "MULTI", dpa: "on-request", sccs: true, category: "Hosting" },

  // Databases
  neon: { region: "Customer-selected region (AWS)", jurisdiction: "MULTI", dpa: "self-serve", sccs: true, category: "Database" },
  supabase: { region: "Customer-selected region (AWS)", jurisdiction: "MULTI", dpa: "self-serve", sccs: true, category: "Database" },
  mongodb: { region: "Customer-selected region", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "Database" },
  planetscale: { region: "Customer-selected region", jurisdiction: "MULTI", dpa: "self-serve", sccs: true, category: "Database" },
  upstash: { region: "Customer-selected region", jurisdiction: "MULTI", dpa: "self-serve", sccs: true, category: "Database" },
  snowflake: { region: "Customer-selected region", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "Data warehouse" },

  // Payments
  stripe: { region: "US (Ireland entity for EU)", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "Payments" },
  razorpay: { region: "India", jurisdiction: "IN", dpa: "in-terms", sccs: false, category: "Payments" },
  paddle: { region: "UK / EU", jurisdiction: "UK", dpa: "in-terms", sccs: true, category: "Payments" },
  paypal: { region: "US (Luxembourg entity for EU)", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "Payments" },
  payu: { region: "India", jurisdiction: "IN", dpa: "in-terms", sccs: false, category: "Payments" },
  cashfree: { region: "India", jurisdiction: "IN", dpa: "in-terms", sccs: false, category: "Payments" },

  // Communication
  slack: { region: "US (Salesforce)", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "Team communication" },
  zoom: { region: "US; EU data residency on paid plans", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "Video calls" },
  "microsoft teams": { region: "Customer-selected region", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "Team communication" },
  "google workspace": { region: "US default; EU data regions available", jurisdiction: "US", dpa: "in-terms", sccs: true, category: "Email and docs" },
  discord: { region: "US", jurisdiction: "US", dpa: "on-request", sccs: true, category: "Team communication" },
  loom: { region: "US (Atlassian)", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "Video messaging" },
  calendly: { region: "US", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "Scheduling" },

  // Docs and project
  notion: { region: "US", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "Documentation" },
  atlassian: { region: "US / EU / AU selectable", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "Project tracking" },
  jira: { region: "US / EU / AU selectable", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "Project tracking" },
  confluence: { region: "US / EU / AU selectable", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "Documentation" },
  asana: { region: "US; EU data centre available", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "Project tracking" },
  linear: { region: "US", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "Project tracking" },
  clickup: { region: "US", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "Project tracking" },
  monday: { region: "US / EU selectable", jurisdiction: "MULTI", dpa: "self-serve", sccs: true, category: "Project tracking" },
  airtable: { region: "US", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "Documentation" },
  miro: { region: "US / EU selectable", jurisdiction: "MULTI", dpa: "self-serve", sccs: true, category: "Whiteboard" },
  figma: { region: "US", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "Design" },

  // CRM and marketing
  hubspot: { region: "US; EU hosting available", jurisdiction: "US", dpa: "in-terms", sccs: true, category: "CRM" },
  salesforce: { region: "Customer-selected region", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "CRM" },
  pipedrive: { region: "EU (Estonia)", jurisdiction: "EU", dpa: "self-serve", sccs: false, category: "CRM" },
  zoho: { region: "India / US / EU selectable", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "CRM" },
  freshworks: { region: "India / US / EU selectable", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "CRM" },
  mailchimp: { region: "US (Intuit)", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "Email marketing" },
  klaviyo: { region: "US", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "Email marketing" },
  resend: { region: "US", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "Transactional email" },
  sendgrid: { region: "US (Twilio)", jurisdiction: "US", dpa: "in-terms", sccs: true, category: "Transactional email" },
  postmark: { region: "US", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "Transactional email" },
  brevo: { region: "EU (France)", jurisdiction: "EU", dpa: "self-serve", sccs: false, category: "Email marketing" },
  twilio: { region: "US", jurisdiction: "US", dpa: "in-terms", sccs: true, category: "Messaging" },

  // Support
  intercom: { region: "US; EU hosting available", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "Customer support" },
  zendesk: { region: "US / EU selectable", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "Customer support" },
  freshdesk: { region: "India / US / EU selectable", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "Customer support" },
  "help scout": { region: "US", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "Customer support" },
  crisp: { region: "EU (France)", jurisdiction: "EU", dpa: "self-serve", sccs: false, category: "Customer support" },

  // Analytics and monitoring
  mixpanel: { region: "US; EU data residency available", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "Product analytics" },
  amplitude: { region: "US; EU available", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "Product analytics" },
  posthog: { region: "US / EU selectable", jurisdiction: "MULTI", dpa: "self-serve", sccs: true, category: "Product analytics" },
  hotjar: { region: "EU (Ireland)", jurisdiction: "EU", dpa: "self-serve", sccs: false, category: "Session replay" },
  fullstory: { region: "US", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "Session replay" },
  plausible: { region: "EU (Germany)", jurisdiction: "EU", dpa: "self-serve", sccs: false, category: "Web analytics" },
  umami: { region: "EU / self-hosted", jurisdiction: "EU", dpa: "self-serve", sccs: false, category: "Web analytics" },
  "google analytics": { region: "US", jurisdiction: "US", dpa: "in-terms", sccs: true, category: "Web analytics" },
  sentry: { region: "US / EU selectable", jurisdiction: "MULTI", dpa: "self-serve", sccs: true, category: "Error monitoring" },
  datadog: { region: "US / EU selectable", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "Observability" },
  "new relic": { region: "US / EU selectable", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "Observability" },
  grafana: { region: "US / EU selectable", jurisdiction: "MULTI", dpa: "self-serve", sccs: true, category: "Observability" },
  pagerduty: { region: "US / EU selectable", jurisdiction: "MULTI", dpa: "self-serve", sccs: true, category: "On-call" },

  // Engineering
  github: { region: "US (Microsoft)", jurisdiction: "US", dpa: "in-terms", sccs: true, category: "Source control" },
  gitlab: { region: "US; self-managed option", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "Source control" },
  bitbucket: { region: "US / EU selectable", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "Source control" },
  circleci: { region: "US", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "CI/CD" },
  snyk: { region: "US / EU selectable", jurisdiction: "MULTI", dpa: "self-serve", sccs: true, category: "Security scanning" },
  openai: { region: "US", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "AI models" },
  anthropic: { region: "US", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "AI models" },

  // Storage, identity, HR
  dropbox: { region: "US; EU available", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "File storage" },
  "1password": { region: "Canada / US", jurisdiction: "OTHER", dpa: "self-serve", sccs: true, category: "Password manager" },
  okta: { region: "US / EU selectable", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "Identity" },
  auth0: { region: "US / EU / AU selectable", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "Identity" },
  docusign: { region: "US / EU selectable", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "E-signature" },
  deel: { region: "US", jurisdiction: "US", dpa: "in-terms", sccs: true, category: "Payroll" },
  gusto: { region: "US", jurisdiction: "US", dpa: "in-terms", sccs: true, category: "Payroll" },
  rippling: { region: "US", jurisdiction: "US", dpa: "in-terms", sccs: true, category: "HR" },
  darwinbox: { region: "India", jurisdiction: "IN", dpa: "on-request", sccs: false, category: "HR" },
  keka: { region: "India", jurisdiction: "IN", dpa: "on-request", sccs: false, category: "HR" },
  vanta: { region: "US", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "Compliance" },
  drata: { region: "US", jurisdiction: "US", dpa: "self-serve", sccs: true, category: "Compliance" },
  cleartax: { region: "India", jurisdiction: "IN", dpa: "on-request", sccs: false, category: "Tax compliance" },
  tally: { region: "India / on-premise", jurisdiction: "IN", dpa: "on-request", sccs: false, category: "Accounting" },
  quickbooks: { region: "US", jurisdiction: "US", dpa: "in-terms", sccs: true, category: "Accounting" },
  xero: { region: "US / AU / EU", jurisdiction: "MULTI", dpa: "in-terms", sccs: true, category: "Accounting" },
};

/** EU adequacy decisions in force. India is not among them, which is the point. */
const ADEQUATE = new Set(["UK", "OTHER"]); // OTHER here covers Canada, Japan, Switzerland etc.

type Vendor = {
  name: string;
  purpose: string;
  data: string;
  info: VendorInfo | null;
  crossBorder: boolean;
  mechanism: string;
  dpaStatus: string;
  sensitive: string[];
  severity: Severity;
};

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

function lookup(name: string): VendorInfo | null {
  const key = name.toLowerCase().trim();
  if (VENDORS[key]) return VENDORS[key]!;
  // Longest match first, so "google cloud" beats "google".
  const keys = Object.keys(VENDORS).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (key.includes(k)) return VENDORS[k]!;
  }
  return null;
}

/** Categories of personal data that carry extra obligations. */
function sensitiveCategories(data: string): string[] {
  const d = data.toLowerCase();
  const hits: string[] = [];
  if (/health|medical|patient|diagnos/.test(d)) hits.push("health data (GDPR Art. 9 / DPDP sensitive)");
  if (/\bcard\b|payment|bank|upi|iban|account number/.test(d)) hits.push("financial data");
  if (/biometric|fingerprint|face|voice\s*print/.test(d)) hits.push("biometric data (GDPR Art. 9)");
  if (/child|minor|under\s*18|student/.test(d)) hits.push("children's data (DPDP §9 verifiable consent)");
  if (/religio|caste|political|union|sexual/.test(d)) hits.push("special category data (GDPR Art. 9)");
  if (/passport|aadhaar|pan\b|ssn|national\s*id|government\s*id/.test(d)) hits.push("government identifiers");
  if (/record|transcript|call\s*recording/.test(d)) hits.push("recordings — check consent basis");
  return hits;
}

function originJurisdictions(origin: string): ("EU" | "IN" | "UK" | "US")[] {
  if (origin === "India") return ["IN"];
  if (origin === "EU / EEA") return ["EU"];
  if (origin === "United Kingdom") return ["UK"];
  if (origin === "United States") return ["US"];
  return ["IN", "EU"];
}

function analyse(vendor: Vendor, origins: ("EU" | "IN" | "UK" | "US")[], regime: string): Vendor {
  const info = vendor.info;

  if (!info) {
    return {
      ...vendor,
      crossBorder: true,
      mechanism:
        "Unknown — check this vendor's own subprocessor or trust page for its hosting region, then add it manually. An unidentified vendor is a real gap in your register, not a rounding error.",
      dpaStatus: "Unknown — confirm whether a DPA exists and is signed",
      severity: "high",
    };
  }

  const dest = info.jurisdiction;
  const crossBorder = !origins.includes(dest as "EU" | "IN" | "UK" | "US") || dest === "MULTI";

  const parts: string[] = [];
  const wantsGdpr = regime === "GDPR" || regime === "Both" || regime === "Not sure";
  const wantsDpdp = regime === "India DPDP" || regime === "Both" || regime === "Not sure";

  if (origins.includes("EU") && wantsGdpr) {
    if (dest === "EU") parts.push("No transfer — data stays in the EEA, so Chapter V does not apply.");
    else if (ADEQUATE.has(dest)) parts.push(`Adequacy decision covers transfers to ${dest}. No SCCs needed, but record the reliance.`);
    else if (dest === "US") parts.push("EU→US: rely on the EU-US Data Privacy Framework if the vendor is certified, otherwise SCCs plus a transfer impact assessment.");
    else if (dest === "MULTI") parts.push("Region is yours to choose. Selecting an EEA region removes the transfer question entirely — do that before writing SCCs.");
    else parts.push(`EU→${dest}: standard contractual clauses plus a transfer impact assessment.`);
  }

  if (origins.includes("IN") && wantsDpdp) {
    if (dest === "IN") parts.push("Processing stays in India.");
    else parts.push("India→abroad: DPDP permits transfer except to countries the government restricts by notification. Keep the vendor list current so a future notification is actionable.");
  }

  const dpaStatus =
    info.dpa === "self-serve"
      ? "Self-serve DPA — accept it in the vendor dashboard, then keep the countersigned copy"
      : info.dpa === "in-terms"
        ? "DPA incorporated in their standard terms — download and file the current version"
        : info.dpa === "on-request"
          ? "DPA on request — email them; this is the one people forget"
          : "Unknown — ask the vendor";

  const sensitive = vendor.sensitive;
  const severity: Severity =
    sensitive.length > 0 && crossBorder && dest === "US"
      ? "high"
      : info.dpa === "on-request" || (crossBorder && dest !== "MULTI")
        ? "medium"
        : "low";

  return {
    ...vendor,
    crossBorder,
    mechanism: parts.length > 0 ? parts.join(" ") : "No cross-border transfer identified for your origin and regime.",
    dpaStatus,
    severity,
  };
}

// ---------------------------------------------------------------------------
// run
// ---------------------------------------------------------------------------

export async function run(input: RunInput): Promise<RunResult> {
  const controller = (input.controller ?? "").trim();
  if (!controller) throw new Error("Give your legal entity name — it appears on the register and the subprocessor page.");

  const lines = (input.vendors ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) throw new Error("Paste a vendor list with a header row and at least one vendor.");

  const header = splitCsvLine(lines[0]!).map((h) => h.toLowerCase());
  const nameCol = header.findIndex((h) => /name|vendor|supplier|tool/.test(h));
  const purposeCol = header.findIndex((h) => /purpose|use|why|service/.test(h));
  const dataCol = header.findIndex((h) => /data|shared|personal|categor/.test(h));

  if (nameCol < 0) {
    throw new Error(`No vendor name column found. Expected a header containing "name" or "vendor"; found: ${header.join(", ")}.`);
  }

  const origins = originJurisdictions(input.dataOrigin ?? "India");
  const regime = input.regime ?? "Both";

  const vendors: Vendor[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const cells = splitCsvLine(lines[i]!);
    const name = (cells[nameCol] ?? "").trim();
    if (!name) continue;
    const purpose = (purposeCol >= 0 ? cells[purposeCol] : "") ?? "";
    const data = (dataCol >= 0 ? cells[dataCol] : "") ?? "";
    const base: Vendor = {
      name,
      purpose: purpose.trim() || "Not stated",
      data: data.trim() || "Not stated",
      info: lookup(name),
      crossBorder: false,
      mechanism: "",
      dpaStatus: "",
      sensitive: sensitiveCategories(data),
      severity: "low",
    };
    vendors.push(analyse(base, origins, regime));
  }

  if (vendors.length === 0) throw new Error("No vendors could be read from that list.");

  const unknown = vendors.filter((v) => !v.info);
  const crossBorder = vendors.filter((v) => v.crossBorder && v.info);
  const dpaOnRequest = vendors.filter((v) => v.info?.dpa === "on-request");
  const withSensitive = vendors.filter((v) => v.sensitive.length > 0);
  const usTransfers = vendors.filter((v) => v.info?.jurisdiction === "US");
  const configurable = vendors.filter((v) => v.info?.jurisdiction === "MULTI");
  const noPurpose = vendors.filter((v) => v.purpose === "Not stated" || v.data === "Not stated");

  const sections: { title: string; items: ResultItem[] }[] = [];

  if (unknown.length > 0) {
    sections.push({
      title: `Unidentified vendors — ${unknown.length}`,
      items: unknown.map((v) => ({
        title: v.name,
        body: `Not in our dataset, so its hosting region is unknown. Check ${v.name}'s own subprocessor or trust page and add the region manually. This is listed first rather than dropped because a register with an unexplained gap is the register that fails a review.`,
        tag: "action required",
        severity: "high" as Severity,
      })),
    });
  }

  if (withSensitive.length > 0) {
    sections.push({
      title: `Sensitive data categories — ${withSensitive.length} vendors`,
      items: withSensitive.map((v) => ({
        title: `${v.name} — ${v.sensitive.join(", ")}`,
        body: `${v.data}\n\nThese categories carry extra obligations: an explicit lawful basis under GDPR Article 9 or DPDP, tighter access control, and in most cases a shorter retention period. ${v.crossBorder ? "Because this also crosses a border, both questions have to be answered together." : ""}`,
        tag: v.info?.region ?? "region unknown",
        severity: "high" as Severity,
      })),
    });
  }

  if (configurable.length > 0) {
    sections.push({
      title: `Region is your choice — ${configurable.length} vendors`,
      items: configurable.map((v) => ({
        title: v.name,
        body: `${v.info!.region}. Because you select the region, our dataset cannot tell you where your data actually sits — only you can. Confirm the configured region and record it. Where you have EU data, choosing an EEA region removes the transfer analysis entirely, which is cheaper than maintaining SCCs and a transfer impact assessment.`,
        tag: "confirm your setting",
        severity: "medium" as Severity,
      })),
    });
  }

  if (usTransfers.length > 0 && origins.includes("EU")) {
    sections.push({
      title: `EU to US transfers — ${usTransfers.length}`,
      items: usTransfers.map((v) => ({
        title: v.name,
        body: `${v.info!.region}. Rely on the EU-US Data Privacy Framework if this vendor is certified — check the official DPF list, do not assume — otherwise standard contractual clauses plus a transfer impact assessment. ${v.info!.sccs ? "This vendor does publish SCCs." : "This vendor does not publish SCCs, so you will need to negotiate them."}`,
        tag: v.info!.sccs ? "SCCs available" : "SCCs not published",
        severity: "medium" as Severity,
      })),
    });
  }

  if (dpaOnRequest.length > 0) {
    sections.push({
      title: `DPA must be requested — ${dpaOnRequest.length}`,
      items: dpaOnRequest.map((v) => ({
        title: v.name,
        body: "This vendor does not offer a self-serve DPA, so someone has to email them. These are the ones that never get done, and they are the ones a reviewer asks about, because an unsigned DPA with a processor handling personal data is a straightforward Article 28 failure.",
        tag: "email them",
        severity: "medium" as Severity,
      })),
    });
  }

  if (noPurpose.length > 0) {
    sections.push({
      title: `Incomplete entries — ${noPurpose.length}`,
      items: [
        {
          body: `${noPurpose.map((v) => v.name).join(", ")} ${noPurpose.length === 1 ? "is" : "are"} missing a purpose or a data description. Article 30 requires the purpose of processing and the categories of data per activity, so the register is incomplete until these are filled in.`,
          severity: "medium",
        },
      ],
    });
  }

  sections.push({
    title: "Boundaries of this analysis",
    items: [
      { body: "Hosting regions are each vendor's published default at the time of release, not a fact about your account. Where you have chosen a region, your choice governs — confirm it before citing anything here as evidence.", severity: "medium" },
      { body: "Your vendors' own subprocessors are not included. That chain is their disclosure obligation to you; collect it for critical vendors and attach it. A register that guessed at sub-subprocessors would be worse than one that states the boundary.", severity: "medium" },
      { body: "This is not legal advice. For the common cases the transfer analysis is mechanical; anything unusual should go to counsel with this register attached.", severity: "low" },
    ],
  });

  /**
   * Completeness is capped, not merely reduced, while any vendor is unidentified.
   *
   * A proportional score reads 93% with one unknown vendor out of fifteen, which
   * invites someone to publish it. But a register is a document you hand to a
   * reviewer, and one entry reading "region unknown" is the entry they will ask
   * about — so it is not 93% done, it is not ready. The score has to say the same
   * thing the headline says.
   */
  const proportional = Math.round(((vendors.length - unknown.length - noPurpose.length * 0.5) / vendors.length) * 100);
  const completeness = unknown.length > 0 ? Math.min(proportional, 55) : proportional;

  const subprocessorPage = [
    `# Subprocessors`,
    "",
    `${controller} uses the third parties below to provide our service. We update this page before any new subprocessor begins processing personal data.`,
    "",
    `Last updated: [date]`,
    "",
    "| Subprocessor | Purpose | Data processed | Location |",
    "|---|---|---|---|",
    ...vendors.map((v) => `| ${v.name} | ${v.purpose} | ${v.data} | ${v.info?.region ?? "To be confirmed"} |`),
    "",
    "## Notice of changes",
    "",
    `To be notified when this list changes, contact [your privacy address]. We give reasonable notice before a new subprocessor begins processing, and customers may object on legitimate grounds.`,
  ].join("\n");

  const article30 = [
    `# Records of processing activities — Article 30 GDPR`,
    "",
    `Controller: ${controller}`,
    `Data origin: ${input.dataOrigin} · Regime: ${regime}`,
    `Prepared: [date] · Review: annually or on any material change`,
    "",
    ...vendors.map((v, i) =>
      [
        `## ${i + 1}. ${v.name}`,
        "",
        `- **Purpose of processing:** ${v.purpose}`,
        `- **Categories of personal data:** ${v.data}`,
        `- **Special categories:** ${v.sensitive.length > 0 ? v.sensitive.join(", ") : "None identified"}`,
        `- **Recipient:** ${v.name} (${v.info?.category ?? "category not identified"})`,
        `- **Location of processing:** ${v.info?.region ?? "TO BE CONFIRMED"}`,
        `- **Transfer mechanism:** ${v.mechanism}`,
        `- **DPA:** ${v.dpaStatus}`,
        `- **Retention:** [state your retention period for this activity]`,
        `- **Security measures:** [reference your Data Classification and Handling Policy]`,
        "",
      ].join("\n"),
    ),
  ].join("\n");

  return {
    headline:
      unknown.length > 0
        ? `${vendors.length} vendors mapped, but ${unknown.length} could not be identified — resolve those before you send this to anyone. ${crossBorder.length} involve a cross-border transfer.`
        : `${vendors.length} vendors mapped. ${crossBorder.length} cross a border, ${dpaOnRequest.length} need a DPA requested, ${withSensitive.length} handle sensitive categories.`,

    score: {
      label: "Register completeness",
      value: Math.max(0, Math.min(100, completeness)),
      max: 100,
      band: unknown.length > 0 ? "bad" : noPurpose.length > 0 ? "warn" : "good",
    },

    metrics: [
      { label: "Vendors", value: String(vendors.length) },
      { label: "Unidentified", value: String(unknown.length), hint: "resolve these first" },
      { label: "Cross-border", value: String(crossBorder.length) },
      { label: "DPAs to request", value: String(dpaOnRequest.length) },
      { label: "Sensitive data", value: String(withSensitive.length), hint: "vendors receiving it" },
    ],

    sections,

    table: {
      columns: ["Vendor", "Category", "Location", "Cross-border", "DPA", "Risk"],
      rows: vendors.map((v) => [
        v.name,
        v.info?.category ?? "unknown",
        v.info?.region ?? "unknown",
        v.crossBorder ? "yes" : "no",
        v.info?.dpa ?? "unknown",
        v.severity,
      ]),
    },

    copyBlocks: [
      { title: "Public subprocessor page — publish this", text: subprocessorPage, language: "markdown" },
      { title: "Article 30 register — keep this", text: article30, language: "markdown" },
    ],

    json: {
      controller,
      dataOrigin: input.dataOrigin,
      regime,
      completeness,
      counts: {
        vendors: vendors.length,
        unidentified: unknown.length,
        crossBorder: crossBorder.length,
        dpaOnRequest: dpaOnRequest.length,
        sensitiveData: withSensitive.length,
        regionConfigurable: configurable.length,
      },
      vendors: vendors.map((v) => ({
        name: v.name,
        purpose: v.purpose,
        data: v.data,
        category: v.info?.category ?? null,
        region: v.info?.region ?? null,
        jurisdiction: v.info?.jurisdiction ?? null,
        crossBorder: v.crossBorder,
        transferMechanism: v.mechanism,
        dpa: v.dpaStatus,
        sensitiveCategories: v.sensitive,
        risk: v.severity,
      })),
    },
  };
}
