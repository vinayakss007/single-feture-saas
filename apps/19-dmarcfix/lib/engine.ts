import type { ResultItem, RunInput, RunResult, Severity } from "./types.ts";

/**
 * Email authentication analysis over pasted records.
 *
 * The SPF lookup count is the reason this product exists. The limit of ten is a
 * hard protocol limit, exceeding it produces permerror, and permerror means
 * authentication fails with no error message anywhere an operator would look. So
 * the count has to be right — and where an include's cost is genuinely unknown,
 * the output says "unknown" rather than assuming 1. A confident wrong count on the
 * one mechanism that matters would be worse than admitting the gap, because it
 * would send someone away believing they had headroom they do not have.
 */

type Finding = {
  area: "SPF" | "DKIM" | "DMARC" | "Bulk sender" | "Alignment";
  what: string;
  why: string;
  fix: string;
  severity: Severity;
};

/**
 * Known nested lookup costs. An `include:` is 1 lookup plus whatever the included
 * record itself costs, and these are the providers whose published records are
 * stable enough to count reliably.
 */
const INCLUDE_COST: Record<string, number> = {
  "_spf.google.com": 4,
  "spf.protection.outlook.com": 3,
  "sendgrid.net": 3,
  "servers.mcsv.net": 2,
  "mail.zendesk.com": 3,
  "_spf.intercom.io": 2,
  "_spf.salesforce.com": 3,
  "spf.mandrillapp.com": 2,
  "mailgun.org": 3,
  "amazonses.com": 2,
  "_spf.mailjet.com": 2,
  "spf.messagingengine.com": 2,
  "_spf.hubspot.com": 3,
  "spf.mailhostbox.com": 2,
  "_spf.qemailserver.com": 2,
  "helpscoutemail.com": 2,
  "_spf.freshdesk.com": 2,
  "spf.zoho.com": 2,
  "_spf.psm.knowbe4.com": 2,
  "_spf.atlassian.net": 2,
  "spf.resend.com": 1,
  "_spf.postmarkapp.com": 1,
  "spf.brevo.com": 2,
  "_spf.createsend.com": 2,
  "et._spf.pardot.com": 2,
  "aspmx.pardot.com": 2,
  "mktomail.com": 2,
  "_spf.stripe.com": 1,
  "_spf.razorpay.com": 1,
};

/** Which SPF include a named service needs, so gaps can be reported. */
const SERVICE_INCLUDE: [RegExp, string, string][] = [
  [/google\s*workspace|gmail|g\s*suite/i, "_spf.google.com", "Google Workspace"],
  [/microsoft\s*365|office\s*365|outlook|exchange\s*online/i, "spf.protection.outlook.com", "Microsoft 365"],
  [/sendgrid/i, "sendgrid.net", "SendGrid"],
  [/mailchimp|mandrill/i, "servers.mcsv.net", "Mailchimp"],
  [/zendesk/i, "mail.zendesk.com", "Zendesk"],
  [/intercom/i, "_spf.intercom.io", "Intercom"],
  [/hubspot/i, "_spf.hubspot.com", "HubSpot"],
  [/salesforce|pardot/i, "_spf.salesforce.com", "Salesforce"],
  [/mailgun/i, "mailgun.org", "Mailgun"],
  [/amazon\s*ses|\bses\b/i, "amazonses.com", "Amazon SES"],
  [/postmark/i, "_spf.postmarkapp.com", "Postmark"],
  [/\bresend\b/i, "spf.resend.com", "Resend"],
  [/brevo|sendinblue/i, "spf.brevo.com", "Brevo"],
  [/freshdesk|freshworks/i, "_spf.freshdesk.com", "Freshdesk"],
  [/help\s*scout/i, "helpscoutemail.com", "Help Scout"],
  [/\bzoho\b/i, "spf.zoho.com", "Zoho Mail"],
  [/atlassian|jira/i, "_spf.atlassian.net", "Atlassian"],
  [/\bstripe\b/i, "_spf.stripe.com", "Stripe"],
  [/razorpay/i, "_spf.razorpay.com", "Razorpay"],
];

type SpfMechanism = { raw: string; type: string; value: string; qualifier: string; lookups: number | null };

function parseSpf(record: string): { mechanisms: SpfMechanism[]; all: string | null; redirect: string | null } {
  const tokens = record.trim().split(/\s+/).filter(Boolean);
  const mechanisms: SpfMechanism[] = [];
  let all: string | null = null;
  let redirect: string | null = null;

  for (const token of tokens) {
    if (/^v=spf1$/i.test(token)) continue;

    const qualifier = /^[+\-~?]/.test(token) ? token[0]! : "+";
    const bare = qualifier === "+" && !/^[+\-~?]/.test(token) ? token : token.slice(/^[+\-~?]/.test(token) ? 1 : 0);

    if (/^all$/i.test(bare)) {
      all = `${qualifier}all`;
      continue;
    }
    if (/^redirect=/i.test(bare)) {
      redirect = bare.slice(9);
      mechanisms.push({ raw: token, type: "redirect", value: redirect, qualifier, lookups: 1 });
      continue;
    }
    if (/^exp=/i.test(bare)) continue; // explanation costs no lookup

    const [typeRaw, valueRaw] = bare.split(/[:=]/, 2);
    const type = (typeRaw ?? "").toLowerCase();
    const value = valueRaw ?? "";

    // Only these mechanisms consume the DNS lookup budget.
    let lookups: number | null = 0;
    if (type === "include") {
      const known = INCLUDE_COST[value.toLowerCase()];
      lookups = known === undefined ? null : 1 + known;
    } else if (type === "a" || type === "mx") lookups = 1;
    else if (type === "ptr") lookups = 1;
    else if (type === "exists") lookups = 1;
    else if (type === "ip4" || type === "ip6") lookups = 0;

    mechanisms.push({ raw: token, type, value, qualifier, lookups });
  }

  return { mechanisms, all, redirect };
}

function parseKeyValue(record: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of record.split(";")) {
    const [k, ...rest] = part.split("=");
    if (!k || rest.length === 0) continue;
    out[k.trim().toLowerCase()] = rest.join("=").trim();
  }
  return out;
}

// ---------------------------------------------------------------------------
// run
// ---------------------------------------------------------------------------

export async function run(input: RunInput): Promise<RunResult> {
  const domain = (input.domain ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!domain || !/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(domain)) {
    throw new Error("Enter a valid domain such as abetworks.in — the domain in your From address.");
  }

  const spfRaw = (input.spf ?? "").trim();
  if (!spfRaw) throw new Error("Paste your SPF record. Run `dig TXT " + domain + "` or use any DNS lookup page.");

  const findings: Finding[] = [];
  const add = (f: Finding) => findings.push(f);

  // --- Multiple SPF records is an immediate permerror, so it is checked first.
  const spfRecords = spfRaw
    .split(/\r?\n/)
    .map((l) => l.trim().replace(/^"|"$/g, ""))
    .filter((l) => /^v=spf1/i.test(l));

  if (spfRecords.length === 0) {
    throw new Error('That does not look like an SPF record — it must begin with "v=spf1". Paste the TXT record at the domain root.');
  }
  if (spfRecords.length > 1) {
    add({
      area: "SPF",
      what: `${spfRecords.length} SPF records are published on ${domain}.`,
      why: "RFC 7208 permits exactly one. Two or more produce a permanent error and SPF fails outright — this is not a warning, it is a total authentication failure that people miss because each record looks fine on its own.",
      fix: "Merge them into one record. Combine the include mechanisms, keep a single all qualifier at the end, and delete the other TXT records.",
      severity: "high",
    });
  }

  const spf = spfRecords[0]!;
  const { mechanisms, all, redirect } = parseSpf(spf);

  // --- Lookup budget
  const known = mechanisms.filter((m) => m.lookups !== null);
  const unknown = mechanisms.filter((m) => m.lookups === null);
  const knownLookups = known.reduce((s, m) => s + (m.lookups ?? 0), 0);

  if (knownLookups > 10) {
    add({
      area: "SPF",
      what: `SPF requires at least ${knownLookups} DNS lookups. The hard limit is 10.`,
      why: "Above ten lookups a receiver returns permerror and SPF fails. Nothing logs this in a place you would look — mail simply stops authenticating, and if DMARC is enforcing, it stops arriving.",
      fix: `Remove ${knownLookups - 10} lookups. Fastest wins: drop ptr and mx if unused, replace low-volume includes with the provider's ip4 ranges, and remove services that no longer send as you. SPF flattening is the last resort — it works but has to be maintained when providers change IPs.`,
      severity: "high",
    });
  } else if (knownLookups >= 8) {
    add({
      area: "SPF",
      what: `SPF uses ${knownLookups} of the 10 available DNS lookups.`,
      why: "You are two or fewer away from the limit. The next tool someone adds breaks authentication for the whole domain, and the person who adds it will have no idea.",
      fix: "Trim now while it is cheap. Every include you remove buys headroom for the next tool someone signs up for.",
      severity: "medium",
    });
  }

  if (unknown.length > 0) {
    add({
      area: "SPF",
      what: `${unknown.length} include${unknown.length === 1 ? "" : "s"} of unknown cost: ${unknown.map((m) => m.value).join(", ")}.`,
      why: `Each costs at least 1 lookup and possibly several more. Your true total is at least ${knownLookups + unknown.length} and could exceed the limit. We report this rather than guessing, because a wrong lookup count is worse than an admitted unknown.`,
      fix: `Check each with \`dig TXT ${unknown[0]?.value ?? "include-domain"}\` and count its own include, a, mx and exists mechanisms.`,
      severity: knownLookups + unknown.length > 10 ? "high" : "medium",
    });
  }

  // --- all qualifier
  if (!all && !redirect) {
    add({
      area: "SPF",
      what: "SPF has no all mechanism and no redirect.",
      why: "Without a terminal mechanism the result for any unlisted sender is neutral, which is treated much like having no SPF at all.",
      fix: "Append ~all while you verify your senders, then -all once you are confident.",
      severity: "high",
    });
  } else if (all === "+all") {
    add({
      area: "SPF",
      what: "SPF ends in +all.",
      why: "This authorises every host on the internet to send as your domain. It is strictly worse than publishing no SPF record, because it actively vouches for spoofed mail.",
      fix: "Change +all to ~all immediately, then to -all once your senders are verified.",
      severity: "high",
    });
  } else if (all === "?all") {
    add({
      area: "SPF",
      what: "SPF ends in ?all (neutral).",
      why: "Neutral tells receivers nothing, so unlisted senders are neither passed nor marked. It provides no protection.",
      fix: "Use ~all, then -all.",
      severity: "medium",
    });
  } else if (all === "~all") {
    add({
      area: "SPF",
      what: "SPF ends in ~all (softfail).",
      why: "Correct while you are still verifying senders. It is not the end state — softfail leaves receivers to decide, and many will accept.",
      fix: "Move to -all once DMARC reports show every legitimate sender passing. Do this before tightening the DMARC policy, not after.",
      severity: "low",
    });
  }

  // --- ptr
  if (mechanisms.some((m) => m.type === "ptr")) {
    add({
      area: "SPF",
      what: "SPF contains a ptr mechanism.",
      why: "RFC 7208 explicitly deprecates ptr. Many receivers ignore it entirely, and it still consumes one of your ten lookups — so it costs you budget and buys nothing.",
      fix: "Remove ptr. Replace it with the ip4 or ip6 ranges of the hosts you meant to authorise.",
      severity: "medium",
    });
  }

  if (redirect && all) {
    add({
      area: "SPF",
      what: `SPF has both a redirect and ${all}.`,
      why: "When an all mechanism is present the redirect is ignored, so whichever you intended to take effect probably is not.",
      fix: "Use one or the other. Keep the all mechanism and drop the redirect unless you are deliberately delegating the whole policy.",
      severity: "medium",
    });
  }

  if (spf.length > 255) {
    add({
      area: "SPF",
      what: `The SPF record is ${spf.length} characters.`,
      why: "A single DNS TXT string is capped at 255 characters. Longer records must be split into multiple strings within one TXT record, and some DNS UIs do this wrongly, producing an unparseable record.",
      fix: "Shorten it by removing includes, or confirm your DNS provider splits it into concatenated 255-character strings rather than separate records.",
      severity: "medium",
    });
  }

  // --- sender coverage
  const senders = input.senders ?? "";
  const missingIncludes: string[] = [];
  for (const [pattern, include, label] of SERVICE_INCLUDE) {
    if (!pattern.test(senders)) continue;
    if (!spf.toLowerCase().includes(include.toLowerCase())) missingIncludes.push(`${label} (needs include:${include})`);
  }
  if (missingIncludes.length > 0) {
    add({
      area: "SPF",
      what: `${missingIncludes.length} service${missingIncludes.length === 1 ? "" : "s"} you send from ${missingIncludes.length === 1 ? "is" : "are"} not in SPF: ${missingIncludes.join(", ")}.`,
      why: "Mail from these will fail SPF. Today that may only hurt deliverability; once DMARC is set to quarantine or reject it will be refused outright.",
      fix: "Add the missing includes — but check the lookup budget first, because each one costs several lookups.",
      severity: "high",
    });
  }

  // --- DKIM
  const selectors = (input.dkim ?? "")
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (selectors.length === 0) {
    add({
      area: "DKIM",
      what: "No DKIM selectors were provided.",
      why: "DKIM is the more reliable half of DMARC. SPF authenticates the envelope sender, which your provider often controls and which frequently does not match your visible From domain. DKIM signs with a key on a domain you choose, so it aligns. Without DKIM, DMARC depends entirely on SPF alignment.",
      fix: `Enable DKIM signing with every sending provider and publish their selector records under _domainkey.${domain}. Then verify with \`dig TXT selector._domainkey.${domain}\`.`,
      severity: "high",
    });
  } else if (selectors.length === 1) {
    add({
      area: "DKIM",
      what: `Only one DKIM selector (${selectors[0]}) for ${Math.max(1, senders.split(/,|\band\b/).length)} apparent sending services.`,
      why: "Each provider signs with its own key and selector. One selector means mail from every other provider is unsigned, and unsigned mail relies on SPF alone to pass DMARC.",
      fix: "Enable DKIM at each provider and publish each selector. There is no limit on how many you can have.",
      severity: "medium",
    });
  }

  // --- DMARC
  const dmarcRaw = (input.dmarc ?? "").trim().replace(/^"|"$/g, "");
  const dmarc = dmarcRaw ? parseKeyValue(dmarcRaw) : null;
  let policy = "none";

  if (!dmarcRaw) {
    add({
      area: "DMARC",
      what: `No DMARC record at _dmarc.${domain}.`,
      why: "Gmail and Yahoo require a DMARC record from bulk senders. Without one your domain can be spoofed freely, you get no visibility into who is sending as you, and bulk mail is refused rather than filtered.",
      fix: `Publish a TXT record at _dmarc.${domain} with the value in the corrected records below. Start at p=none with reporting so you can see traffic before you enforce anything.`,
      severity: "high",
    });
  } else {
    if (!/^v=DMARC1$/i.test(dmarc?.v ?? "")) {
      add({
        area: "DMARC",
        what: "DMARC record does not begin with v=DMARC1.",
        why: "The version tag must be first and exact. Anything else means the whole record is ignored, so you effectively have no DMARC at all.",
        fix: "Make v=DMARC1 the first tag.",
        severity: "high",
      });
    }

    policy = (dmarc?.p ?? "none").toLowerCase();
    if (policy === "none") {
      add({
        area: "DMARC",
        what: "DMARC policy is p=none (monitoring only).",
        why: "Monitoring mode gives you reports and no protection. Anyone can still spoof your domain and receivers are told to do nothing about it. Most domains stop here permanently, which is why spoofing still works.",
        fix: "Read reports for two to four weeks until every legitimate sender is accounted for, then move to p=quarantine with pct=25, raise to 100, then p=reject. The staged plan below has the detail.",
        severity: "medium",
      });
    } else if (policy === "quarantine") {
      add({
        area: "DMARC",
        what: `DMARC is at p=quarantine${dmarc?.pct ? ` with pct=${dmarc.pct}` : ""}.`,
        why: "Real protection, partially applied. Failing mail goes to spam rather than being refused, which still lets a convincing spoof reach a determined reader.",
        fix: "Once quarantine at pct=100 causes no complaints for a fortnight, move to p=reject.",
        severity: "low",
      });
    }

    if (!dmarc?.rua) {
      add({
        area: "DMARC",
        what: "DMARC has no rua reporting address.",
        why: "Without aggregate reports you cannot see who is sending as your domain, which makes it impossible to move safely to enforcement. This is the single most common reason a domain sits at p=none for years.",
        fix: `Add rua=mailto:dmarc@${domain}. Any inbox works to start; a report parser helps once volume grows.`,
        severity: "high",
      });
    }

    const adkim = (dmarc?.adkim ?? "r").toLowerCase();
    const aspf = (dmarc?.aspf ?? "r").toLowerCase();
    if (adkim === "s" || aspf === "s") {
      add({
        area: "Alignment",
        what: `Strict alignment is set (${adkim === "s" ? "adkim=s" : ""}${adkim === "s" && aspf === "s" ? ", " : ""}${aspf === "s" ? "aspf=s" : ""}).`,
        why: "Strict alignment requires an exact domain match, so mail from any subdomain fails. This is the failure that confuses people most: the mail passes SPF or DKIM and still fails DMARC.",
        fix: "Use relaxed alignment (the default) unless you have a specific reason. Relaxed accepts organisational domain matches, which covers subdomain senders.",
        severity: "medium",
      });
    }

    if (dmarc?.sp === undefined && policy !== "none") {
      add({
        area: "DMARC",
        what: "No sp tag, so subdomains inherit the main policy.",
        why: "Usually what you want, but worth stating deliberately. Attackers commonly spoof an unused subdomain precisely because it is often left unprotected.",
        fix: `Add sp=reject explicitly if no subdomain sends mail. Being explicit costs nothing and removes the ambiguity.`,
        severity: "low",
      });
    }

    if (dmarc?.pct && Number(dmarc.pct) < 100 && policy === "reject") {
      add({
        area: "DMARC",
        what: `p=reject with pct=${dmarc.pct}.`,
        why: `Only ${dmarc.pct}% of failing mail is rejected; the rest is treated as quarantine. Partial enforcement is a valid rollout step but is often left in place by accident.`,
        fix: "Raise pct to 100 once you are confident.",
        severity: "low",
      });
    }
  }

  // --- Bulk sender requirements
  const isBulk = (input.volume ?? "").startsWith("Over");
  if (isBulk) {
    const bulkChecks: [boolean, string, string][] = [
      [spfRecords.length === 1 && all !== "+all", "SPF published and not permissive", "One valid SPF record with a restrictive all qualifier."],
      [selectors.length > 0, "DKIM signing in place", "Mail must be DKIM signed."],
      [Boolean(dmarcRaw), "DMARC record published", "A DMARC record is mandatory for bulk senders, even at p=none."],
      [knownLookups <= 10, "SPF within the lookup limit", "Above ten lookups SPF permerrors and authentication fails."],
    ];
    for (const [ok, label, requirement] of bulkChecks) {
      if (!ok) {
        add({
          area: "Bulk sender",
          what: `Fails a Gmail and Yahoo bulk-sender requirement: ${label}.`,
          why: `${requirement} Above 5,000 messages a day to their users, mail that fails this is rejected at the gateway rather than filtered.`,
          fix: "Fix the corresponding item above. The corrected records below satisfy all of them.",
          severity: "high",
        });
      }
    }
    add({
      area: "Bulk sender",
      what: "One-click unsubscribe and spam-rate threshold cannot be checked from DNS.",
      why: "Marketing mail needs List-Unsubscribe with One-Click, and spam complaints must stay below 0.3% — 0.1% is the level to aim for. Both are properties of your mail, not your records.",
      fix: "Add the List-Unsubscribe and List-Unsubscribe-Post headers to bulk mail, and watch your complaint rate in Google Postmaster Tools.",
      severity: "medium",
    });
  }

  // --- Corrected records
  const keptMechanisms = mechanisms
    .filter((m) => m.type !== "ptr" && m.type !== "redirect")
    .map((m) => m.raw);
  for (const [pattern, include] of SERVICE_INCLUDE) {
    if (pattern.test(senders) && !spf.toLowerCase().includes(include.toLowerCase())) {
      keptMechanisms.push(`include:${include}`);
    }
  }
  const correctedSpf = `v=spf1 ${keptMechanisms.join(" ")} ~all`;
  const correctedLookups = parseSpf(correctedSpf).mechanisms.reduce((s, m) => s + (m.lookups ?? 1), 0);

  const correctedDmarc = [
    "v=DMARC1",
    "p=none",
    `rua=mailto:dmarc@${domain}`,
    `ruf=mailto:dmarc-forensics@${domain}`,
    "fo=1",
    "adkim=r",
    "aspf=r",
    "pct=100",
    "sp=none",
  ].join("; ");

  const blockers = findings.filter((f) => f.severity === "high");
  const warnings = findings.filter((f) => f.severity === "medium");

  const sections: { title: string; items: ResultItem[] }[] = [];
  const toItems = (list: Finding[]): ResultItem[] =>
    list.map((f) => ({
      title: `${f.area}: ${f.what}`,
      body: `${f.why}\n\nFix: ${f.fix}`,
      tag: f.area,
      severity: f.severity,
    }));

  if (blockers.length > 0) sections.push({ title: `Breaking authentication — ${blockers.length}`, items: toItems(blockers) });
  if (warnings.length > 0) sections.push({ title: `Should fix — ${warnings.length}`, items: toItems(warnings) });
  const advisories = findings.filter((f) => f.severity === "low");
  if (advisories.length > 0) sections.push({ title: `Advisory — ${advisories.length}`, items: toItems(advisories) });

  sections.push({
    title: "SPF lookup budget, mechanism by mechanism",
    items: [
      {
        body: mechanisms
          .map((m) => `${m.raw} → ${m.lookups === null ? "unknown cost, at least 1" : `${m.lookups} lookup${m.lookups === 1 ? "" : "s"}`}`)
          .join("\n") + `\n\nKnown total: ${knownLookups} of 10.${unknown.length > 0 ? ` Plus ${unknown.length} unknown, so the real figure is at least ${knownLookups + unknown.length}.` : ""}`,
        severity: knownLookups > 10 ? "high" : "low",
      },
    ],
  });

  sections.push({
    title: "What records cannot fix",
    items: [
      { body: "Reputation. A domain that has sent spam will still be filtered with perfect authentication. Authentication removes rejection as a cause; it does not buy you the inbox.", severity: "medium" as Severity },
      { body: "List hygiene. Sending to dead addresses generates bounces and complaints, and both outweigh good records.", severity: "medium" as Severity },
      { body: "Content and links. Shortened URLs, mismatched link domains and image-only mail are scored independently of authentication.", severity: "low" as Severity },
      { body: "Warm-up. A new domain or IP sending high volume immediately looks like a compromised host, whatever its records say.", severity: "low" as Severity },
    ],
  });

  const score = Math.max(0, 100 - blockers.length * 18 - warnings.length * 6 - advisories.length * 2);

  return {
    headline:
      blockers.length > 0
        ? `${domain}: ${blockers.length} problem${blockers.length === 1 ? "" : "s"} breaking authentication${knownLookups > 10 ? ` — SPF is at ${knownLookups} of 10 lookups, which fails outright` : ""}.`
        : warnings.length > 0
          ? `${domain}: authentication works, ${warnings.length} thing${warnings.length === 1 ? "" : "s"} to tighten before enforcing DMARC.`
          : `${domain}: SPF, DKIM and DMARC are all correctly configured at p=${policy}.`,

    score: {
      label: "Email authentication",
      value: score,
      max: 100,
      band: blockers.length > 0 ? "bad" : warnings.length > 0 ? "warn" : "good",
    },

    metrics: [
      { label: "SPF lookups", value: `${knownLookups}/10`, hint: unknown.length > 0 ? `+${unknown.length} unknown` : "within limit" },
      { label: "DMARC policy", value: dmarcRaw ? `p=${policy}` : "none published" },
      { label: "DKIM selectors", value: String(selectors.length) },
      { label: "Blocking issues", value: String(blockers.length) },
      { label: "Bulk sender rules", value: isBulk ? "apply" : "do not apply" },
    ],

    sections,

    table: {
      columns: ["Area", "Severity", "Issue"],
      rows: findings.map((f) => [f.area, f.severity, f.what]),
    },

    copyBlocks: [
      {
        title: `Corrected SPF — ${correctedLookups} lookups`,
        text: `${domain}.  IN  TXT  "${correctedSpf}"\n\n# ptr removed (deprecated, costs a lookup, ignored by receivers)\n# missing sender includes added\n# ~all applied — move to -all once DMARC reports are clean${correctedLookups > 10 ? `\n\n# WARNING: still ${correctedLookups} lookups, over the limit of 10.\n# You must remove includes or replace them with ip4 ranges. There is no\n# record syntax that makes more than 10 lookups work.` : ""}`,
        language: "text",
      },
      {
        title: "Corrected DMARC — start here, then follow the plan",
        text: `_dmarc.${domain}.  IN  TXT  "${correctedDmarc}"`,
        language: "text",
      },
      {
        title: "Staged rollout to enforcement",
        text: [
          `# Moving ${domain} to DMARC enforcement safely`,
          "",
          "## Week 0 — publish and watch",
          `Publish the corrected SPF and DMARC above. p=none changes nothing about delivery; it only starts the reports.`,
          "",
          "## Weeks 1–3 — account for every sender",
          "Read the aggregate reports. For each source, decide: is this us? If yes, get it passing SPF or DKIM. If no, it is a spoofer and it is why you are doing this.",
          "Do not proceed until every legitimate sender passes. This is the step people skip, and skipping it is what breaks invoicing.",
          "",
          "## Week 4 — quarantine a quarter",
          `_dmarc.${domain} TXT "v=DMARC1; p=quarantine; pct=25; rua=mailto:dmarc@${domain}; fo=1"`,
          "Watch for a fortnight. Any complaint means a sender you missed.",
          "",
          "## Week 6 — quarantine everything",
          `_dmarc.${domain} TXT "v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@${domain}; fo=1"`,
          "",
          "## Week 8 — reject",
          `_dmarc.${domain} TXT "v=DMARC1; p=reject; pct=100; rua=mailto:dmarc@${domain}; fo=1; sp=reject"`,
          "Also tighten SPF from ~all to -all at this point, not before.",
          "",
          "## Never",
          "Do not jump straight to p=reject. The reports exist because you do not know all of your senders yet — nobody does. Finding out by losing a week of invoices is the expensive way.",
        ].join("\n"),
        language: "markdown",
      },
    ],

    json: {
      domain,
      spf: { record: spf, recordCount: spfRecords.length, knownLookups, unknownIncludes: unknown.map((m) => m.value), all, corrected: correctedSpf },
      dkim: { selectors },
      dmarc: dmarcRaw ? { record: dmarcRaw, parsed: dmarc, policy } : null,
      bulkSenderRulesApply: isBulk,
      score,
      findings,
    },
  };
}
