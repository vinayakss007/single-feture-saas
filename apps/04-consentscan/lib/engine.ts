import type { ResultItem, RunInput, RunResult, Severity } from "./types";

/**
 * ConsentScan engine — fetches a live page and maps technical facts to
 * DPDP Act 2023 and GDPR obligations.
 *
 * It reports what is verifiably true from the first HTTP response: which
 * trackers are in the initial HTML, which cookies arrive before any consent
 * decision could have been made, and what the privacy policy actually says.
 */

const TIMEOUT_MS = 9000;

/**
 * A compliance scan has to see what an ordinary visitor sees. Many sites sit
 * behind a WAF that returns 403 to anything self-identifying as a bot, and the
 * whole point of this scan is which trackers and cookies a real visitor gets.
 * So we present as a browser and send the headers a browser sends.
 */
const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-GB,en;q=0.9",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Upgrade-Insecure-Requests": "1",
} as const;

type Regime = "India DPDP Act" | "EU GDPR" | "Both";

type Finding = {
  id: string;
  title: string;
  detail: string;
  obligation: string;
  regime: "DPDP" | "GDPR" | "Both" | "Security";
  severity: Severity;
  weight: number;
  fix: string;
};

type TrackerDef = { id: string; name: string; category: "Analytics" | "Advertising" | "Session recording" | "Marketing"; test: RegExp };

const TRACKERS: TrackerDef[] = [
  { id: "ga4", name: "Google Analytics / GA4", category: "Analytics", test: /googletagmanager\.com\/gtag|google-analytics\.com|gtag\s*\(|_gaq|ga\('create'/i },
  { id: "gtm", name: "Google Tag Manager", category: "Analytics", test: /googletagmanager\.com\/gtm\.js|dataLayer\s*=/i },
  { id: "meta", name: "Meta / Facebook Pixel", category: "Advertising", test: /connect\.facebook\.net|fbq\s*\(|facebook\.com\/tr\?/i },
  { id: "hotjar", name: "Hotjar", category: "Session recording", test: /static\.hotjar\.com|hjSiteSettings|_hjSettings/i },
  { id: "clarity", name: "Microsoft Clarity", category: "Session recording", test: /clarity\.ms/i },
  { id: "linkedin", name: "LinkedIn Insight Tag", category: "Advertising", test: /snap\.licdn\.com|_linkedin_partner_id/i },
  { id: "tiktok", name: "TikTok Pixel", category: "Advertising", test: /analytics\.tiktok\.com/i },
  { id: "doubleclick", name: "Google Ads / DoubleClick", category: "Advertising", test: /doubleclick\.net|googlesyndication\.com|googleadservices\.com/i },
  { id: "segment", name: "Segment", category: "Analytics", test: /cdn\.segment\.(com|io)|analytics\.load\s*\(/i },
  { id: "mixpanel", name: "Mixpanel", category: "Analytics", test: /cdn\.mxpnl\.com|mixpanel\.init/i },
  { id: "amplitude", name: "Amplitude", category: "Analytics", test: /cdn\.amplitude\.com|amplitude\.getInstance/i },
  { id: "intercom", name: "Intercom", category: "Marketing", test: /widget\.intercom\.io|intercomSettings/i },
  { id: "hubspot", name: "HubSpot", category: "Marketing", test: /js\.hs-scripts\.com|js\.hsforms\.net/i },
  { id: "posthog", name: "PostHog", category: "Analytics", test: /posthog\.com\/static\/array\.js|posthog\.init/i },
  { id: "matomo", name: "Matomo", category: "Analytics", test: /matomo\.js|piwik\.js/i },
  { id: "yandex", name: "Yandex Metrica", category: "Analytics", test: /mc\.yandex\.ru/i },
];

const CMPS: { name: string; test: RegExp }[] = [
  { name: "CookieYes", test: /cookieyes|cky-consent/i },
  { name: "Cookiebot", test: /cookiebot|CybotCookiebot/i },
  { name: "OneTrust", test: /onetrust|optanon/i },
  { name: "Termly", test: /termly\.io/i },
  { name: "iubenda", test: /iubenda/i },
  { name: "Osano", test: /osano/i },
  { name: "Complianz", test: /complianz|cmplz/i },
  { name: "Klaro", test: /klaro/i },
  { name: "Usercentrics", test: /usercentrics/i },
  { name: "Borlabs", test: /borlabs-cookie/i },
  { name: "Generic cookie-consent library", test: /cookieconsent|cookie-consent|cc-window/i },
];

/** Cookie name patterns that are definitely not "strictly necessary". */
const NON_ESSENTIAL_COOKIE = [
  { re: /^_ga|^_gid|^_gat|^_gcl|^_utm/i, purpose: "Google Analytics / Ads", category: "Analytics" },
  { re: /^_fbp|^_fbc|^fr$/i, purpose: "Meta advertising", category: "Advertising" },
  { re: /^_hj/i, purpose: "Hotjar session recording", category: "Session recording" },
  { re: /^_clck|^_clsk/i, purpose: "Microsoft Clarity", category: "Session recording" },
  { re: /^li_|^bcookie|^lidc|^UserMatchHistory/i, purpose: "LinkedIn tracking", category: "Advertising" },
  { re: /^ajs_|^mp_/i, purpose: "Product analytics", category: "Analytics" },
  { re: /^IDE$|^test_cookie$|^NID$/i, purpose: "Google advertising", category: "Advertising" },
  { re: /^__hs|^hubspotutk/i, purpose: "HubSpot marketing", category: "Marketing" },
];

/** Disclosures the DPDP Act and GDPR expect to find in a privacy notice. */
const POLICY_CHECKS: { id: string; label: string; test: RegExp; regime: Finding["regime"]; obligation: string; weight: number; severity: Severity; fix: string }[] = [
  {
    id: "purpose",
    label: "Purpose of processing stated",
    test: /\b(purpose|why we (?:collect|process)|we use your (?:data|information) (?:to|for))\b/i,
    regime: "Both",
    obligation: "DPDP s.5(1)(i) — notice must state the purpose for which personal data will be processed",
    weight: 6,
    severity: "high",
    fix: "Add an itemised purpose list. 'To improve our services' is not a purpose; 'to send order confirmations' is.",
  },
  {
    id: "rights",
    label: "Data Principal / data subject rights listed",
    test: /\b(right to (?:access|erasure|correction|deletion|rectification)|data principal rights|your rights|data subject rights)\b/i,
    regime: "Both",
    obligation: "DPDP ss.11-14 — right to access, correction, erasure and grievance redressal",
    weight: 6,
    severity: "high",
    fix: "List the four DPDP rights explicitly: access, correction and completion, erasure, and grievance redressal.",
  },
  {
    id: "withdrawal",
    label: "How to withdraw consent",
    test: /\b(withdraw (?:your )?consent|revoke (?:your )?consent|opt[- ]out at any time)\b/i,
    regime: "DPDP",
    obligation: "DPDP s.6(4)-(6) — withdrawing consent must be as easy as giving it",
    weight: 7,
    severity: "high",
    fix: "State the withdrawal mechanism and make it a link or a button, not an email request that a human has to action.",
  },
  {
    id: "grievance",
    label: "Grievance Officer or DPO contact",
    test: /\b(grievance officer|data protection officer|dpo\b|grievance redressal|privacy officer)\b/i,
    regime: "DPDP",
    obligation: "DPDP s.8(9) — a Data Fiduciary must publish the contact of a person who answers data questions",
    weight: 7,
    severity: "high",
    fix: "Publish a named contact with a working email address. A generic contact form does not satisfy this.",
  },
  {
    id: "retention",
    label: "Data retention period",
    test: /\b(retain|retention (?:period|policy)|how long we keep|stored for)\b/i,
    regime: "Both",
    obligation: "DPDP s.8(7) — erase personal data once the purpose is served",
    weight: 4,
    severity: "medium",
    fix: "State a retention period per data category, and an erasure trigger for when the purpose ends.",
  },
  {
    id: "thirdparty",
    label: "Third parties / processors disclosed",
    test: /\b(third part(?:y|ies)|data processors?|share your (?:data|information) with|service providers)\b/i,
    regime: "Both",
    obligation: "GDPR Art.13(1)(e) — recipients of the personal data must be disclosed",
    weight: 5,
    severity: "medium",
    fix: "Name the categories of processor, and ideally the vendors themselves. Analytics and payment processors count.",
  },
  {
    id: "children",
    label: "Children's data addressed",
    test: /\b(children|minors?|under (?:the age of )?18|parental consent|age verification)\b/i,
    regime: "DPDP",
    obligation: "DPDP s.9 — verifiable parental consent required for anyone under 18",
    weight: 4,
    severity: "medium",
    fix: "State whether you knowingly collect data from under-18s and how parental consent is obtained if you do.",
  },
  {
    id: "transfer",
    label: "Cross-border transfer disclosed",
    test: /\b(transfer(?:red)? (?:outside|abroad|to another country)|cross[- ]border|international transfer|stored (?:in|on servers in))\b/i,
    regime: "Both",
    obligation: "DPDP s.16 / GDPR Ch.V — transfers outside the jurisdiction must be disclosed",
    weight: 4,
    severity: "medium",
    fix: "State where data is hosted. If you use US-based infrastructure, say so.",
  },
  {
    id: "legalbasis",
    label: "Legal basis for processing",
    test: /\b(legal basis|lawful basis|legitimate interest|contractual necessity|article 6)\b/i,
    regime: "GDPR",
    obligation: "GDPR Art.6 — a lawful basis is required for every processing activity",
    weight: 4,
    severity: "medium",
    fix: "Map each processing purpose to one of the six lawful bases. Consent is not the right basis for everything.",
  },
];

const SECURITY_HEADERS: { header: string; label: string; weight: number; fix: string }[] = [
  { header: "strict-transport-security", label: "HSTS", weight: 3, fix: "Add `Strict-Transport-Security: max-age=31536000; includeSubDomains`." },
  { header: "content-security-policy", label: "Content-Security-Policy", weight: 3, fix: "Add a CSP. Start in report-only mode so you can tighten it without breaking the site." },
  { header: "x-content-type-options", label: "X-Content-Type-Options", weight: 2, fix: "Add `X-Content-Type-Options: nosniff`." },
  { header: "referrer-policy", label: "Referrer-Policy", weight: 2, fix: "Add `Referrer-Policy: strict-origin-when-cross-origin` so URLs do not leak to third parties." },
  { header: "permissions-policy", label: "Permissions-Policy", weight: 1, fix: "Add a `Permissions-Policy` header restricting camera, microphone and geolocation." },
];

function normaliseUrl(raw: string): URL {
  const trimmed = raw.trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    throw new Error(`"${raw}" is not a valid URL. Try something like https://example.com`);
  }
  if (!/^https?:$/.test(url.protocol)) throw new Error("Only http and https URLs can be scanned.");
  if (/^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|169\.254\.)/.test(url.hostname) || url.hostname.endsWith(".local")) {
    throw new Error("Private and loopback addresses cannot be scanned.");
  }
  return url;
}

async function fetchPage(url: string): Promise<{ status: number; finalUrl: string; html: string; headers: Headers } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: BROWSER_HEADERS,
    });
    const html = (await res.text()).slice(0, 500_000);
    return { status: res.status, finalUrl: res.url || url, html, headers: res.headers };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");
}

function findPolicyUrl(html: string, base: URL): string | null {
  const anchors = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]{0,120}?)<\/a>/gi)];
  for (const [, href, label] of anchors) {
    const text = stripTags(label).toLowerCase();
    if (/privacy|data protection|gopyneeyata/.test(text) || /privacy/i.test(href)) {
      try {
        return new URL(href, base).toString();
      } catch {
        continue;
      }
    }
  }
  return null;
}

export async function run(input: RunInput): Promise<RunResult> {
  const url = normaliseUrl(input.url ?? "");
  const regime: Regime = (["India DPDP Act", "EU GDPR", "Both"] as Regime[]).includes(input.regime as Regime)
    ? (input.regime as Regime)
    : "Both";

  const page = await fetchPage(url.toString());
  if (!page) {
    throw new Error(`Could not reach ${url.hostname} within ${TIMEOUT_MS / 1000}s. Check the URL is public and the site is up.`);
  }

  // Bot-protection WAFs (Cloudflare, Akamai, Imperva) fingerprint the TLS
  // handshake, not just the User-Agent, so no header set gets a server-side
  // scanner through. Say so plainly instead of reporting a misleading score.
  if (page.status === 403 || page.status === 503 || page.status === 429) {
    const edge = page.headers.get("server") ?? "a WAF";
    throw new Error(
      `${url.hostname} returned HTTP ${page.status} — it is behind bot protection (${edge}). ` +
        `This blocks every server-side scanner, not just this one, because the block is on the TLS fingerprint rather than the User-Agent. ` +
        `Three ways forward: scan a page or subdomain that is not behind the WAF, allowlist the scanner in your firewall rules, ` +
        `or run the self-hosted Docker image from inside your own network. ` +
        `Worth knowing either way: the same protection stops uptime monitors and some search crawlers.`,
    );
  }
  if (page.status >= 400) {
    throw new Error(`${url.hostname} returned HTTP ${page.status}. Scan a page that loads for anonymous visitors.`);
  }

  const html = page.html;
  const findings: Finding[] = [];
  const passed: ResultItem[] = [];

  // ---- 1. transport ---------------------------------------------------------
  const finalUrl = new URL(page.finalUrl);
  if (finalUrl.protocol !== "https:") {
    findings.push({
      id: "no-https",
      title: "Site does not serve over HTTPS",
      detail: `Final URL after redirects was ${finalUrl.protocol}//${finalUrl.host}. Personal data submitted here travels in plaintext.`,
      obligation: "DPDP s.8(5) — reasonable security safeguards are mandatory",
      regime: "Both",
      severity: "high",
      weight: 10,
      fix: "Enable TLS and redirect all http traffic to https. This is a one-line change on every modern host.",
    });
  } else {
    passed.push({ title: "HTTPS enforced", body: "The page serves over TLS after redirects.", tag: "Security" });
  }

  // ---- 2. consent platform --------------------------------------------------
  const cmp = CMPS.find((c) => c.test.test(html));
  const bannerText = /\b(accept (?:all )?cookies?|cookie (?:policy|settings|preferences)|we use cookies|manage (?:cookies|preferences))\b/i.test(
    stripTags(html),
  );

  // ---- 3. trackers in initial HTML -----------------------------------------
  const foundTrackers = TRACKERS.filter((t) => t.test.test(html));
  const nonEssentialTrackers = foundTrackers.filter((t) => t.category !== "Marketing");

  if (nonEssentialTrackers.length > 0) {
    findings.push({
      id: "trackers-preconsent",
      title: `${nonEssentialTrackers.length} tracking script${nonEssentialTrackers.length === 1 ? "" : "s"} load before any consent decision`,
      detail: `Present in the initial HTML: ${nonEssentialTrackers.map((t) => t.name).join(", ")}. These execute on page load, which is before a visitor can accept or reject anything.`,
      obligation: "DPDP s.6(1) — consent must be free, specific, informed and unconditional, given before processing",
      regime: "Both",
      severity: "high",
      weight: 18,
      fix: "Gate every non-essential script behind the consent decision. With Google Tag Manager use consent mode v2 and set analytics_storage and ad_storage to denied by default.",
    });
  } else {
    passed.push({
      title: "No non-essential trackers in the initial HTML",
      body: "Nothing that requires consent was found loading on first paint.",
      tag: "Consent",
    });
  }

  if (!cmp && !bannerText) {
    findings.push({
      id: "no-cmp",
      title: "No consent mechanism found",
      detail: "Neither a known consent management platform nor any cookie-notice text was detected on the page.",
      obligation: "DPDP s.6 and s.5 — notice and consent are required before processing personal data",
      regime: "Both",
      severity: nonEssentialTrackers.length > 0 ? "high" : "medium",
      weight: 12,
      fix: "Install a consent platform that actually blocks scripts before acceptance. A banner that only sets a cookie is not compliance.",
    });
  } else if (cmp && nonEssentialTrackers.length > 0) {
    findings.push({
      id: "cosmetic-banner",
      title: `${cmp.name} is installed but trackers still load anyway`,
      detail: `A consent platform was detected, yet ${nonEssentialTrackers.map((t) => t.name).join(", ")} are still present in the initial HTML. The banner is cosmetic.`,
      obligation: "DPDP s.6(1) / GDPR Art.7 — consent must be obtained prior to processing",
      regime: "Both",
      severity: "high",
      weight: 14,
      fix: `Switch the ${cmp.name} integration from "notice only" to blocking mode, and move tag firing into the post-consent callback.`,
    });
  } else if (cmp) {
    passed.push({ title: `Consent platform detected: ${cmp.name}`, body: "A recognised consent management platform is installed.", tag: "Consent" });
  }

  // ---- 4. cookies set on first response ------------------------------------
  const setCookies = page.headers.getSetCookie ? page.headers.getSetCookie() : [];
  const cookieRows: string[][] = [];
  const offending: string[] = [];

  for (const raw of setCookies) {
    const name = raw.split("=")[0]?.trim() ?? "";
    const match = NON_ESSENTIAL_COOKIE.find((c) => c.re.test(name));
    const secure = /;\s*secure/i.test(raw);
    const httpOnly = /;\s*httponly/i.test(raw);
    const sameSite = /;\s*samesite=(\w+)/i.exec(raw)?.[1] ?? "not set";
    cookieRows.push([
      name || "(unnamed)",
      match ? match.category : "Strictly necessary (assumed)",
      match ? match.purpose : "First-party / functional",
      secure ? "yes" : "no",
      httpOnly ? "yes" : "no",
      sameSite,
    ]);
    if (match) offending.push(`${name} (${match.purpose})`);
  }

  if (offending.length > 0) {
    findings.push({
      id: "cookies-preconsent",
      title: `${offending.length} non-essential cookie${offending.length === 1 ? "" : "s"} set before consent`,
      detail: `Set on the very first response: ${offending.join(", ")}.`,
      obligation: "GDPR Art.5(3) ePrivacy / DPDP s.6 — non-essential cookies require prior consent",
      regime: "Both",
      severity: "high",
      weight: 14,
      fix: "Do not set analytics or advertising cookies until consent is recorded. Only session and CSRF cookies belong on the first response.",
    });
  } else if (setCookies.length > 0) {
    passed.push({
      title: "No non-essential cookies on first response",
      body: `${setCookies.length} cookie${setCookies.length === 1 ? "" : "s"} set, all appear functional.`,
      tag: "Cookies",
    });
  }

  // ---- 5. privacy policy ----------------------------------------------------
  const policyUrl = findPolicyUrl(html, finalUrl);
  let policyText = "";

  if (!policyUrl) {
    findings.push({
      id: "no-policy-link",
      title: "No privacy policy link found",
      detail: "No anchor on the page links to a privacy or data protection page.",
      obligation: "DPDP s.5 — notice must be given to the Data Principal; GDPR Art.13 — information must be provided",
      regime: "Both",
      severity: "high",
      weight: 12,
      fix: "Publish a privacy notice and link it from the footer of every page, including landing pages and checkout.",
    });
  } else {
    const policyPage = await fetchPage(policyUrl);
    if (!policyPage || policyPage.status >= 400) {
      findings.push({
        id: "policy-unreachable",
        title: "Privacy policy link is broken",
        detail: `The policy link resolves to ${policyUrl} which did not load.`,
        obligation: "DPDP s.5 — notice must be accessible",
        regime: "Both",
        severity: "high",
        weight: 10,
        fix: "Fix the link. A broken privacy notice is treated the same as no privacy notice.",
      });
    } else {
      policyText = stripTags(policyPage.html);
      passed.push({ title: "Privacy policy found and reachable", body: policyUrl, tag: "Notice" });

      for (const check of POLICY_CHECKS) {
        if (check.test.test(policyText)) {
          passed.push({ title: check.label, body: "Present in the privacy notice.", tag: check.regime });
        } else {
          findings.push({
            id: `policy-${check.id}`,
            title: `Privacy notice does not cover: ${check.label.toLowerCase()}`,
            detail: "No matching language was found anywhere in the fetched policy text.",
            obligation: check.obligation,
            regime: check.regime,
            severity: check.severity,
            weight: check.weight,
            fix: check.fix,
          });
        }
      }
    }
  }

  // ---- 6. security headers --------------------------------------------------
  for (const h of SECURITY_HEADERS) {
    if (page.headers.get(h.header)) {
      passed.push({ title: `${h.label} header set`, body: "Present on the response.", tag: "Security" });
    } else {
      findings.push({
        id: `header-${h.header}`,
        title: `Missing ${h.label} header`,
        detail: `The response did not include ${h.header}.`,
        obligation: "DPDP s.8(5) — reasonable security safeguards to prevent a personal data breach",
        regime: "Security",
        severity: "low",
        weight: h.weight,
        fix: h.fix,
      });
    }
  }

  // ---- 7. contact for grievances on the page itself -------------------------
  const pageText = stripTags(html);
  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(pageText) || /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(html);
  if (!hasEmail && !policyText) {
    findings.push({
      id: "no-contact",
      title: "No contact address published",
      detail: "No email address was found on the page or in a reachable policy.",
      obligation: "DPDP s.8(9) — the contact of the person answering data questions must be published",
      regime: "DPDP",
      severity: "medium",
      weight: 5,
      fix: "Publish a monitored email address for privacy requests, separate from sales.",
    });
  }

  // ---- scoring --------------------------------------------------------------
  const regimeWeight = (f: Finding): number => {
    if (regime === "Both") return f.weight;
    if (f.regime === "Security") return f.weight;
    if (regime === "India DPDP Act") return f.regime === "GDPR" ? f.weight * 0.4 : f.weight;
    return f.regime === "DPDP" ? f.weight * 0.4 : f.weight;
  };

  const penalty = findings.reduce((sum, f) => sum + regimeWeight(f), 0);
  const value = Math.max(0, Math.min(100, Math.round(100 - penalty)));
  const band = value >= 75 ? "good" : value >= 45 ? "warn" : "bad";

  const high = findings.filter((f) => f.severity === "high");
  const medium = findings.filter((f) => f.severity === "medium");
  const low = findings.filter((f) => f.severity === "low");

  const toItems = (list: Finding[]): ResultItem[] =>
    list.map((f) => ({
      title: f.title,
      body: `${f.detail}\n\nObligation: ${f.obligation}\n\nFix: ${f.fix}`,
      tag: f.regime,
      severity: f.severity,
    }));

  const fixList = [
    `# ${finalUrl.hostname} — compliance fix list`,
    "",
    `Compliance score: ${value}/100 (${regime})`,
    `Findings: ${high.length} high, ${medium.length} medium, ${low.length} low`,
    "",
    ...(high.length > 0 ? ["## Fix first — highest penalty exposure", ...high.map((f, i) => `${i + 1}. **${f.title}**\n   - Obligation: ${f.obligation}\n   - Fix: ${f.fix}`), ""] : []),
    ...(medium.length > 0 ? ["## Fix next", ...medium.map((f, i) => `${i + 1}. **${f.title}**\n   - Fix: ${f.fix}`), ""] : []),
    ...(low.length > 0 ? ["## Hygiene", ...low.map((f) => `- ${f.title} — ${f.fix}`), ""] : []),
    "## Verified as present",
    ...passed.slice(0, 20).map((p) => `- ${p.title}`),
  ].join("\n");

  const headline =
    high.length > 0
      ? `${finalUrl.hostname} scores ${value}/100 with ${high.length} high-severity finding${high.length === 1 ? "" : "s"}. Start with: ${high[0].title.toLowerCase()}.`
      : findings.length > 0
        ? `${finalUrl.hostname} scores ${value}/100. No high-severity violations, but ${findings.length} item${findings.length === 1 ? "" : "s"} still need attention.`
        : `${finalUrl.hostname} scores ${value}/100 and passed every check in this scan. Re-scan after your next deploy.`;

  return {
    headline,
    score: { label: `Compliance score (${regime})`, value, max: 100, band },
    metrics: [
      { label: "High severity", value: String(high.length), hint: "regulator-actionable" },
      { label: "Trackers pre-consent", value: String(nonEssentialTrackers.length), hint: cmp ? `despite ${cmp.name}` : "no CMP found" },
      { label: "Cookies on first load", value: String(setCookies.length), hint: `${offending.length} non-essential` },
      { label: "Privacy notice", value: policyUrl ? (policyText ? "Read" : "Broken") : "Missing" },
    ],
    sections: [
      { title: `High severity (${high.length})`, items: toItems(high) },
      { title: `Medium severity (${medium.length})`, items: toItems(medium) },
      { title: `Low severity — security hygiene (${low.length})`, items: toItems(low) },
      {
        title: `Trackers detected in initial HTML (${foundTrackers.length})`,
        items: foundTrackers.map((t) => ({
          title: t.name,
          body: `Category: ${t.category}. ${t.category === "Marketing" ? "May be functional depending on configuration." : "Requires prior consent under both DPDP and GDPR."}`,
          tag: t.category,
          severity: t.category === "Marketing" ? "low" : "high",
        })),
      },
      { title: `Passed checks (${passed.length})`, items: passed },
    ],
    ...(cookieRows.length > 0
      ? {
          table: {
            columns: ["Cookie", "Category", "Purpose", "Secure", "HttpOnly", "SameSite"],
            rows: cookieRows,
          },
        }
      : {}),
    copyBlocks: [{ title: "Remediation checklist (Markdown)", text: fixList }],
    json: {
      url: finalUrl.toString(),
      hostname: finalUrl.hostname,
      regime,
      score: value,
      band,
      httpStatus: page.status,
      https: finalUrl.protocol === "https:",
      consentPlatform: cmp?.name ?? null,
      cookieNoticeTextPresent: bannerText,
      privacyPolicyUrl: policyUrl,
      privacyPolicyReadable: Boolean(policyText),
      trackers: foundTrackers.map((t) => ({ id: t.id, name: t.name, category: t.category })),
      cookiesOnFirstResponse: cookieRows.map(([name, category, purpose, secure, httpOnly, sameSite]) => ({
        name,
        category,
        purpose,
        secure: secure === "yes",
        httpOnly: httpOnly === "yes",
        sameSite,
      })),
      findings: findings.map((f) => ({
        id: f.id,
        title: f.title,
        severity: f.severity,
        regime: f.regime,
        obligation: f.obligation,
        fix: f.fix,
      })),
      passedChecks: passed.map((p) => p.title),
    },
  };
}
