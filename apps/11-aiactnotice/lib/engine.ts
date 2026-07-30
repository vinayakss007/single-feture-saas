import type { ResultItem, RunInput, RunResult, Severity } from "./types.ts";

/**
 * EU AI Act classification, as a decision table.
 *
 * Every conclusion below is traceable to a published article, and the same input
 * always produces the same output. That is not a stylistic preference: an
 * auditor's first question about a compliance artifact is whether it can be
 * reproduced, and a language model that answers differently on Tuesday cannot be
 * evidence of anything.
 *
 * What this deliberately does NOT do is guess. Anything the questionnaire cannot
 * establish goes into `notAssessed` and is reported, rather than being quietly
 * assumed benign — which is the failure mode that makes compliance tooling
 * dangerous rather than merely useless.
 */

type Tier = "prohibited" | "high" | "limited" | "minimal";

const TIER_LABEL: Record<Tier, string> = {
  prohibited: "Prohibited practice",
  high: "High-risk system",
  limited: "Limited-risk (transparency only)",
  minimal: "Minimal risk",
};

/** Higher is worse. Used to pick the most severe conclusion that fired. */
const TIER_RANK: Record<Tier, number> = { minimal: 0, limited: 1, high: 2, prohibited: 3 };

const BAND: Record<Tier, "good" | "warn" | "bad"> = {
  minimal: "good",
  limited: "warn",
  high: "bad",
  prohibited: "bad",
};

type Finding = { tier: Tier; article: string; reason: string };

/**
 * FNV-1a. A content hash, not a security primitive — its job is to let someone
 * confirm two evidence records describe the same assessment, and for that a short
 * stable digest with no dependencies is the right tool.
 */
function contentHash(value: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

function normalise(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Dates are an input, never `new Date()`, or the engine stops being reproducible. */
function parseIsoDate(value: string): { ok: true; date: Date } | { ok: false } {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return { ok: false };
  const [, y, mo, d] = m;
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  if (Number.isNaN(date.getTime())) return { ok: false };
  if (date.getUTCMonth() !== Number(mo) - 1) return { ok: false };
  return { ok: true, date };
}

/** The dates that actually matter, from the Act's own application timeline. */
const MILESTONES = [
  { on: "2025-02-02", what: "Prohibited practices (Article 5) became enforceable" },
  { on: "2025-08-02", what: "GPAI model obligations and penalties began to apply" },
  { on: "2026-08-02", what: "Article 50 transparency obligations apply" },
  { on: "2026-08-02", what: "Annex III high-risk obligations apply" },
] as const;

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

const HIGH_RISK_SECTORS: Record<string, string> = {
  "Employment, hiring or worker management": "Annex III(4) — employment and worker management",
  "Education or vocational training": "Annex III(3) — education and vocational training",
  "Credit, insurance or essential private services": "Annex III(5) — access to essential private services",
  "Law enforcement, migration or justice": "Annex III(6)–(8) — law enforcement, migration and justice",
  "Critical infrastructure": "Annex III(2) — critical infrastructure",
};

function classify(input: RunInput): { findings: Finding[]; tier: Tier } {
  const findings: Finding[] = [];
  const purpose = normalise(input.purpose ?? "");
  const inference = input.inference ?? "";
  const sector = input.sector ?? "";
  const output = input.output ?? "";
  const interaction = input.interaction ?? "";
  const humanReview = input.humanReview ?? "";

  // --- Article 5: prohibited practices. Checked first; nothing overrides these.
  if (inference === "Social scoring of people") {
    findings.push({
      tier: "prohibited",
      article: "Article 5(1)(c)",
      reason:
        "Social scoring — evaluating or classifying people based on social behaviour or personal characteristics leading to detrimental treatment — is a prohibited practice, not a high-risk one. This cannot be remediated with documentation.",
    });
  }
  if (inference === "Predictive policing on individuals") {
    findings.push({
      tier: "prohibited",
      article: "Article 5(1)(d)",
      reason:
        "Assessing the risk of an individual committing a criminal offence based solely on profiling or personality traits is prohibited.",
    });
  }
  if (inference === "Emotion recognition") {
    if (sector === "Employment, hiring or worker management" || sector === "Education or vocational training") {
      findings.push({
        tier: "prohibited",
        article: "Article 5(1)(f)",
        reason:
          "Emotion recognition in the workplace or in education is a prohibited practice. Outside those two settings it is permitted but carries Article 50(3) transparency duties.",
      });
    } else {
      findings.push({
        tier: "limited",
        article: "Article 50(3)",
        reason:
          "Emotion recognition systems must inform the people exposed to them that the system is operating, and must process personal data lawfully.",
      });
    }
  }
  if (inference === "Biometric categorisation or identification") {
    findings.push({
      tier: "high",
      article: "Annex III(1) with Article 5(1)(g)–(h)",
      reason:
        "Biometric categorisation and remote identification are high-risk. Categorising people to infer race, political opinions, trade union membership, religion or sexual orientation is prohibited outright, and real-time remote biometric identification in public spaces for law enforcement is prohibited subject to narrow exceptions.",
    });
  }

  // --- Annex III: high-risk by sector, but only where the system actually decides.
  const sectorArticle = HIGH_RISK_SECTORS[sector];
  const decides = output === "An automated decision about a person" || output === "A score, ranking or recommendation";
  if (sectorArticle && decides) {
    findings.push({
      tier: "high",
      article: sectorArticle,
      reason: `The system produces ${
        output === "An automated decision about a person" ? "an automated decision about a person" : "a score or ranking"
      } in a sector listed in Annex III. That combination is what triggers high-risk classification — the sector alone does not.`,
    });
  } else if (sectorArticle) {
    findings.push({
      tier: "limited",
      article: `${sectorArticle}, with Article 6(3)`,
      reason:
        "The sector is listed in Annex III, but on your answers the system does not score or decide about people. Article 6(3) allows a system in an Annex III area to fall outside high-risk where it performs a narrow procedural task — document that assessment and keep it, because the burden is on you.",
    });
  }

  if (sector === "Healthcare or medical devices") {
    findings.push({
      tier: "high",
      article: "Article 6(1) with Annex I",
      reason:
        "Where the system is a safety component of a medical device, it is high-risk through the existing product-safety route rather than Annex III, and the conformity assessment runs through your MDR notified body.",
    });
  }

  // --- Article 50: transparency.
  if (interaction === "Yes, people chat or speak with it") {
    findings.push({
      tier: "limited",
      article: "Article 50(1)",
      reason:
        "A system intended to interact directly with people must be designed so those people are informed they are dealing with an AI system, unless that is obvious to a reasonably well-informed person.",
    });
  }
  if (output === "Synthetic images, audio or video") {
    findings.push({
      tier: "limited",
      article: "Article 50(2) and 50(4)",
      reason:
        "Synthetic audio, image, video or text output must be marked in a machine-readable format as artificially generated. Deep fakes must additionally be disclosed to viewers.",
    });
  }

  // --- Article 14: human oversight, on high-risk systems only.
  if (humanReview === "No, it acts automatically" && findings.some((f) => f.tier === "high")) {
    findings.push({
      tier: "high",
      article: "Article 14",
      reason:
        "A high-risk system acting without human review must still be designed so a person can oversee it, interpret its output, and intervene or stop it. Fully automated action is the hardest version of this obligation to satisfy, not an exemption from it.",
    });
  }

  // --- Heuristics on the free-text description. Reported as prompts, never as
  //     conclusions: the description is the least reliable input we have.
  const CUES: { pattern: RegExp; note: string }[] = [
    { pattern: /\b(cv|resume|candidate|applicant|shortlist)\b/, note: "hiring or candidate screening" },
    { pattern: /\b(credit|loan|underwrit|creditworth)\b/, note: "creditworthiness assessment" },
    { pattern: /\b(exam|grading|admission|student)\b/, note: "education assessment" },
    { pattern: /\b(deepfake|face swap|voice clone|synthetic voice)\b/, note: "synthetic media generation" },
    { pattern: /\b(surveillance|facial recognition|face recognition)\b/, note: "biometric surveillance" },
  ];
  const cues = CUES.filter((c) => c.pattern.test(purpose)).map((c) => c.note);

  if (findings.length === 0) {
    findings.push({
      tier: "minimal",
      article: "Recital 27 with Article 95",
      reason:
        "On your answers no prohibition, no Annex III use case and no Article 50 transparency trigger applies. Minimal-risk systems carry no mandatory obligations; the Act encourages voluntary codes of conduct.",
    });
  }

  const tier = findings.reduce<Tier>((worst, f) => (TIER_RANK[f.tier] > TIER_RANK[worst] ? f.tier : worst), "minimal");

  if (cues.length > 0) {
    findings.push({
      tier: "limited",
      article: "Check required",
      reason: `Your description mentions ${cues.join(", ")}. If that is accurate, re-answer the sector and output questions — those uses can move the system into Annex III, and the description alone is not enough for us to decide it for you.`,
    });
  }

  return { findings, tier };
}

// ---------------------------------------------------------------------------
// Obligations
// ---------------------------------------------------------------------------

type Obligation = { article: string; duty: string; status: "open" | "covered" | "n/a"; note: string };

function obligations(tier: Tier, input: RunInput): Obligation[] {
  const isProvider = (input.role ?? "").startsWith("Provider") || input.role === "Both";
  const isDeployer = (input.role ?? "").startsWith("Deployer") || input.role === "Both";
  const list: Obligation[] = [];

  if (tier === "prohibited") {
    list.push({
      article: "Article 5",
      duty: "Stop the practice",
      status: "open",
      note: "No documentation makes a prohibited practice lawful. The system must be changed so the prohibited element is removed, or withdrawn from the EU market.",
    });
    return list;
  }

  if (tier === "limited" || tier === "high") {
    if (input.interaction === "Yes, people chat or speak with it") {
      list.push({
        article: "Article 50(1)",
        duty: "Tell people they are talking to an AI",
        status: "open",
        note: "Publish the notice below where the interaction starts — not buried in a privacy policy.",
      });
    }
    if (input.output === "Synthetic images, audio or video") {
      list.push({
        article: "Article 50(2)",
        duty: "Mark output as machine-readable synthetic",
        status: "open",
        note: "C2PA content credentials or an equivalent watermark. A visible label alone does not satisfy the machine-readable requirement.",
      });
    }
  }

  if (tier === "high") {
    if (isProvider) {
      for (const [article, duty, note] of [
        ["Article 9", "Risk management system", "Continuous, iterative, documented across the whole lifecycle — not a one-off assessment."],
        ["Article 10", "Data governance", "Training, validation and test sets examined for bias and gaps relevant to the intended purpose."],
        ["Article 11 with Annex IV", "Technical documentation", "Must exist before the system is placed on the market and be kept for 10 years."],
        ["Article 12", "Automatic logging", "Events logged over the system's lifetime, retained at least 6 months."],
        ["Article 13", "Instructions for use", "Deployers must be able to interpret and use the output correctly."],
        ["Article 14", "Human oversight design", "A person must be able to understand, override and stop it."],
        ["Article 15", "Accuracy, robustness, cybersecurity", "Declared accuracy metrics and resilience to adversarial input."],
        ["Article 17", "Quality management system", "Written policies and procedures, including for post-market monitoring."],
        ["Article 43", "Conformity assessment", "Internal control for most Annex III systems; a notified body for biometrics."],
        ["Article 48–49", "CE marking and EU database registration", "Registered before the system is put into service."],
        ["Article 72", "Post-market monitoring", "Actively collect and review performance data after launch."],
      ] as const) {
        list.push({ article, duty, status: "open", note });
      }
    }
    if (isDeployer) {
      for (const [article, duty, note] of [
        ["Article 26(1)", "Use it per the provider's instructions", "Deviating from the stated intended purpose can make you the provider."],
        ["Article 26(2)", "Assign competent human oversight", "Named people, trained, with authority to stop it."],
        ["Article 26(5)", "Monitor operation and report incidents", "To the provider and, for serious incidents, the authority."],
        ["Article 26(7)", "Inform workers before deployment", "Where the system is used in a workplace, workers and their representatives must be told first."],
        ["Article 27", "Fundamental rights impact assessment", "Required for public bodies and for credit and insurance deployers."],
        ["Article 86", "Explain individual decisions on request", "Affected people can ask for a meaningful explanation."],
      ] as const) {
        list.push({ article, duty, status: "open", note });
      }
    }
  }

  if (input.humanReview === "Yes, always" && tier === "high") {
    const idx = list.findIndex((o) => o.duty === "Human oversight design");
    if (idx >= 0) {
      list[idx] = {
        ...list[idx]!,
        status: "covered",
        note: "You stated a human always reviews output before it takes effect. Document who, how, and what authority they have to override.",
      };
    }
  }

  if (list.length === 0) {
    list.push({
      article: "Article 95",
      duty: "No mandatory obligations",
      status: "n/a",
      note: "Voluntary codes of conduct are encouraged. Many enterprise buyers now ask for one regardless of tier.",
    });
  }

  return list;
}

// ---------------------------------------------------------------------------
// Notice text
// ---------------------------------------------------------------------------

function noticeText(input: RunInput, tier: Tier): string {
  const name = (input.systemName ?? "This system").trim();
  const lines: string[] = [`AI system disclosure — ${name}`, ""];

  if (input.interaction === "Yes, people chat or speak with it") {
    lines.push(
      `You are interacting with ${name}, an artificial intelligence system, not a human being.`,
      "",
      "It can be wrong. Check anything important before you rely on it, and ask for a human at any point.",
      "",
    );
  }
  if (input.output === "Synthetic images, audio or video") {
    lines.push(
      "Content produced here is generated by AI. It is marked as artificially generated in machine-readable form, and where it depicts real people, places or events it is labelled as synthetic.",
      "",
    );
  }
  if (input.inference === "Emotion recognition") {
    lines.push(
      "This system performs emotion recognition. It infers emotional state from the data you provide. You are being told this because the EU AI Act requires it, and you can decline to use it.",
      "",
    );
  }
  if (tier === "high") {
    lines.push(
      `${name} is classified as a high-risk AI system under the EU AI Act. It operates under human oversight, its performance is monitored after release, and you can request a meaningful explanation of any decision that affects you.`,
      "",
    );
  }

  lines.push(
    "Provider: [your legal entity name]",
    "Contact for AI-related questions: [your contact address]",
    `Assessment date: ${input.asOfDate ?? "[date]"}`,
  );

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// run
// ---------------------------------------------------------------------------

export async function run(input: RunInput): Promise<RunResult> {
  const name = (input.systemName ?? "").trim();
  const purpose = (input.purpose ?? "").trim();

  if (!name) throw new Error("Give the system a name — it appears on the notice and in the evidence record.");
  if (purpose.length < 20) {
    throw new Error(
      "Describe what the system does in at least a sentence. A classification from three words would be worthless, so we will not produce one.",
    );
  }

  const asOf = parseIsoDate(input.asOfDate ?? "");
  if (!asOf.ok) {
    throw new Error("Assessment date must be an ISO date such as 2026-07-30, so the record is reproducible.");
  }

  const { findings, tier } = classify(input);
  const duties = obligations(tier, input);

  const notAssessed: string[] = [];
  if (input.euOutput === "Not sure") {
    notAssessed.push(
      "Whether output is used in the EU. This decides whether the Act applies at all — the test is where the output lands, not where you are incorporated.",
    );
  }
  if (input.euOutput === "No") {
    notAssessed.push(
      "You stated output is not used in the EU. The classification below is still shown, because buyers increasingly ask for it, but the obligations are not legally engaged.",
    );
  }
  if (!/\b(train|fine-?tun|model|dataset|foundation|gpt|llm)\b/i.test(purpose)) {
    notAssessed.push(
      "Whether a general-purpose AI model is involved. GPAI carries its own Chapter V duties, and the description does not say.",
    );
  }
  notAssessed.push(
    "National implementations. Member States set their own penalties and may add sectoral rules on top of the Act.",
  );

  const openCount = duties.filter((d) => d.status === "open").length;
  const inForce = MILESTONES.filter((m) => parseIsoDate(m.on).ok && new Date(m.on) <= asOf.date);

  const severityFor = (t: Tier): Severity => (t === "prohibited" || t === "high" ? "high" : t === "limited" ? "medium" : "low");

  const sections: { title: string; items: ResultItem[] }[] = [
    {
      title: "Why this classification",
      items: findings.map((f) => ({
        title: f.article,
        body: f.reason,
        tag: TIER_LABEL[f.tier],
        severity: severityFor(f.tier),
      })),
    },
    {
      title: `Obligations — ${openCount} open`,
      items: duties.map((d) => ({
        title: `${d.article} · ${d.duty}`,
        body: d.note,
        tag: d.status === "covered" ? "covered" : d.status === "n/a" ? "not applicable" : "open",
        severity: d.status === "open" ? (tier === "high" ? "high" : "medium") : "low",
      })),
    },
    {
      title: "Not assessed — you must resolve these yourself",
      items: notAssessed.map((n) => ({ body: n, severity: "medium" as Severity })),
    },
    {
      title: `In force as at ${input.asOfDate}`,
      items:
        inForce.length > 0
          ? inForce.map((m) => ({ title: m.on, body: m.what, severity: "low" as Severity }))
          : [{ body: "No AI Act milestone had taken effect by this date.", severity: "low" as Severity }],
    },
  ];

  const evidence = {
    schema: "abetworks.aiactnotice.evidence/1",
    assessedOn: input.asOfDate,
    system: name,
    tier,
    tierLabel: TIER_LABEL[tier],
    role: input.role,
    answers: {
      purpose,
      interaction: input.interaction,
      output: input.output,
      inference: input.inference,
      sector: input.sector,
      humanReview: input.humanReview,
      euOutput: input.euOutput,
    },
    rulesFired: findings.map((f) => ({ article: f.article, tier: f.tier })),
    obligations: duties.map((d) => ({ article: d.article, duty: d.duty, status: d.status })),
    notAssessed,
  };

  // Hashed after the record is built, so it covers exactly what is stored.
  const hash = contentHash(JSON.stringify(evidence));

  const score =
    tier === "prohibited" ? 100 : tier === "high" ? 75 : tier === "limited" ? 40 : 10;

  return {
    headline:
      tier === "prohibited"
        ? `${name}: PROHIBITED PRACTICE. This cannot be documented into compliance — the prohibited element has to be removed.`
        : tier === "high"
          ? `${name}: high-risk under Annex III. ${openCount} obligations open, and they apply from 2 August 2026.`
          : tier === "limited"
            ? `${name}: limited risk. ${openCount} transparency obligations — the notice below is what you publish.`
            : `${name}: minimal risk. No mandatory obligations, but the assessment is worth keeping on file.`,

    score: { label: "Regulatory exposure", value: score, max: 100, band: BAND[tier] },

    metrics: [
      { label: "Risk tier", value: TIER_LABEL[tier] },
      { label: "Obligations open", value: String(openCount), hint: `of ${duties.length} that attach` },
      { label: "Rules fired", value: String(findings.length), hint: "each cited above" },
      { label: "Evidence hash", value: hash, hint: "same answers always give this hash" },
    ],

    sections,

    table: {
      columns: ["Article", "Duty", "Status"],
      rows: duties.map((d) => [d.article, d.duty, d.status]),
    },

    copyBlocks: [
      { title: "Transparency notice — publish this", text: noticeText(input, tier), language: "markdown" },
      { title: "Evidence record — keep this", text: JSON.stringify({ ...evidence, hash }, null, 2), language: "json" },
    ],

    json: { tier, hash, findings, obligations: duties, notAssessed, evidence: { ...evidence, hash } },
  };
}
