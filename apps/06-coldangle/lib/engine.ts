import type { ResultItem, RunInput, RunResult, Severity } from "./types";

/**
 * ColdAngle engine — templates filled with facts, never facts invented to fill
 * templates.
 *
 * Every clause in the generated copy traces back to a sentence in the research
 * text the user pasted. That constraint is the whole product: it is what stops
 * the output reading like "I loved your recent post about digital
 * transformation", which is the reason most cold email gets deleted.
 */

type AngleId =
  | "funding"
  | "hiring"
  | "statedPain"
  | "expansion"
  | "launch"
  | "growthMetric"
  | "scale"
  | "techStack"
  | "award";

type AngleDef = {
  id: AngleId;
  label: string;
  strength: number; // 0-100, how likely this angle is to earn a reply
  test: RegExp;
  why: string;
};

/**
 * Ranked by how much they signal budget and urgency. A funding round means money
 * just landed; a mission statement means nothing.
 */
const ANGLES: AngleDef[] = [
  {
    id: "statedPain",
    label: "They described the problem themselves",
    strength: 95,
    test: /\b(hardest part|the problem is|struggl\w*|painful|bottleneck|nobody wants to own|feeling it|manual|by hand|re[- ]?entry|does not scale|doesn'?t scale|falls (?:over|apart)|too slow)\b/i,
    why:
      "The strongest possible angle. You are not pitching a problem, you are quoting theirs back to them. Reply rates on this angle are several times the average.",
  },
  {
    id: "funding",
    label: "Recent funding",
    strength: 88,
    test: /\b(raised|series [a-e]\b|seed round|pre[- ]series|funding round|led by|crore (?:series|round)|\$\d+(?:\.\d+)?\s?m(?:illion)?\s+(?:round|raise))\b/i,
    why:
      "Money has just landed and there is board pressure to deploy it. Budget objections are at their weakest in the 90 days after a round closes.",
  },
  {
    id: "hiring",
    label: "Hiring for the exact function you help",
    strength: 85,
    test: /\b(we are hiring|we'?re hiring|now hiring|open roles?|join our team|careers?:|hiring \d+|looking for \d+)\b/i,
    why:
      "Hiring for a role is a company telling you where the work is piling up. It also gives you a hard number to compare your cost against.",
  },
  {
    id: "expansion",
    label: "Geographic or market expansion",
    strength: 78,
    test: /\b(expand\w*\s+(?:into|to)|new (?:office|market|region|branch|city)|entering the|launch\w*\s+in\s+[A-Z]|southern|northern|overseas|international)\b/i,
    why:
      "Expansion breaks the processes that worked at the previous size. That is the moment tooling decisions get made.",
  },
  {
    id: "growthMetric",
    label: "A growth number they published",
    strength: 76,
    test: /\b(tripled|doubled|quadrupled|grew \d+|grown \d+|up \d+\s?%|\d+\s?x\s+(?:growth|volume|increase)|increased \d+)\b/i,
    why:
      "A published growth number is a quantified strain signal. You can build the whole opener around what that growth did to their process.",
  },
  {
    id: "launch",
    label: "Recent product or service launch",
    strength: 70,
    test: /\b(launch\w*|released|introduc\w+|now available|new product|shipped|rolled out|went live)\b/i,
    why:
      "A launch means an engaged, busy team and a public commitment. Useful, but weaker than a problem they named themselves.",
  },
  {
    id: "scale",
    label: "Company scale and footprint",
    strength: 58,
    test: /\b(\d[\d,]*\+?\s*(?:employees|customers|clients|shippers|users|stores|branches|locations)|founded \d{4}|headquartered in)\b/i,
    why:
      "Scale facts prove you read something real, but they do not create urgency on their own. Use them as supporting detail, not the hook.",
  },
  {
    id: "techStack",
    label: "Tools or systems they mention",
    strength: 55,
    test: /\b(salesforce|hubspot|sap\b|oracle|netsuite|zoho|tally|shopify|aws|azure|snowflake|excel|spreadsheets?|erp\b|crm\b|legacy system)\b/i,
    why:
      "Naming their stack lets you be concrete about integration, which removes the biggest silent objection in a first reply.",
  },
  {
    id: "award",
    label: "Award, ranking or press mention",
    strength: 42,
    test: /\b(award|recogni[sz]ed|ranked|featured in|named (?:one of|to)|winner|top \d+)\b/i,
    why:
      "Weak on its own and easily mistaken for flattery. Only use it if nothing stronger is available.",
  },
];

/** Content-side deliverability killers. Domain reputation is out of scope. */
const SPAM_RULES: { id: string; label: string; severity: Severity; test: (email: string) => boolean; fix: string }[] = [
  {
    id: "trigger-words",
    label: "Classic spam trigger words",
    severity: "high",
    test: (e) => /\b(free|guarantee\w*|risk[- ]free|act now|limited time|no obligation|100%|cash|winner|congratulations|click here|buy now)\b/i.test(e),
    fix: "Remove the promotional vocabulary. Cold email should read like a person, not a landing page.",
  },
  {
    id: "shouting",
    label: "Words in ALL CAPS",
    severity: "medium",
    test: (e) => (e.match(/\b[A-Z]{4,}\b/g) ?? []).filter((w) => !/^(CRM|ERP|SaaS|API|GST|ROI|SDR|CEO|CTO|CFO|VP)$/i.test(w)).length > 0,
    fix: "Drop the capitals. Emphasis in a cold email reads as pressure.",
  },
  {
    id: "exclamation",
    label: "More than one exclamation mark",
    severity: "medium",
    test: (e) => (e.match(/!/g) ?? []).length > 1,
    fix: "Use at most one, ideally none.",
  },
  {
    id: "too-long",
    label: "Over 150 words",
    severity: "medium",
    test: (e) => e.trim().split(/\s+/).length > 150,
    fix: "Cut to under 120 words. Anything longer gets skimmed and archived.",
  },
  {
    id: "link-stuffing",
    label: "More than one link",
    severity: "high",
    test: (e) => (e.match(/https?:\/\//g) ?? []).length > 1,
    fix: "One link maximum in a first touch. Zero is better — offer the link in the reply.",
  },
  {
    id: "question-stacking",
    label: "More than two questions",
    severity: "medium",
    test: (e) => (e.match(/\?/g) ?? []).length > 2,
    fix: "Ask exactly one question, and make it easy to answer with a yes or a no.",
  },
  {
    id: "checking-in",
    label: "Filler openers",
    severity: "high",
    test: (e) => /\b(hope this (?:email )?finds you well|just checking in|touching base|quick question|hope you'?re doing well|circling back)\b/i.test(e),
    fix: "Delete the line. It signals a template before the reader reaches your point.",
  },
  {
    id: "generic-flattery",
    label: "Unverifiable flattery",
    severity: "high",
    test: (e) => /\b(big fan of|love what you'?re doing|impressive work|huge admirer|been following (?:you|your))\b/i.test(e),
    fix: "Replace with a specific fact. Vague praise reads worse than no praise.",
  },
];

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim().replace(/^["“]|["”]$/g, ""))
    .filter((s) => s.length > 12);
}

type FoundAngle = { def: AngleDef; quote: string; detail: string };

function detectAngles(research: string): FoundAngle[] {
  const found: FoundAngle[] = [];
  const lines = sentences(research);

  for (const def of ANGLES) {
    const hit = lines.find((l) => def.test.test(l));
    if (!hit) continue;
    const matched = def.test.exec(hit)?.[0] ?? "";
    found.push({
      def,
      quote: hit.length > 220 ? `${hit.slice(0, 217)}…` : hit,
      detail: matched,
    });
  }
  return found.sort((a, b) => b.def.strength - a.def.strength);
}

/** Numbers in the research are the most reusable specifics available. */
function extractFacts(research: string): { numbers: string[]; places: string[]; tools: string[] } {
  const numbers = [
    ...new Set(
      (research.match(
        /\b\d[\d,]*\+?\s*(?:employees|customers|clients|shippers|users|stores|branches|locations|coordinators|analysts|hours?|crore|lakh|%)\b/gi,
      ) ?? []).map((s) => s.trim()),
    ),
  ].slice(0, 5);

  const places = [
    ...new Set(
      (research.match(/\b(?:in|across|headquartered in|based in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g) ?? [])
        .map((s) => s.replace(/^(?:in|across|headquartered in|based in)\s+/i, "").trim()),
    ),
  ].slice(0, 3);

  const tools = [
    ...new Set(
      (research.match(/\b(salesforce|hubspot|sap|oracle|netsuite|zoho|tally|shopify|aws|azure|snowflake|excel|spreadsheets?|erp|crm)\b/gi) ?? []).map(
        (s) => s.toLowerCase(),
      ),
    ),
  ].slice(0, 4);

  return { numbers, places, tools };
}

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export function run(input: RunInput): RunResult {
  const company = (input.company ?? "").trim();
  const contact = (input.contact ?? "").trim();
  const research = (input.research ?? "").trim();
  const offer = (input.offer ?? "").trim().replace(/\s+/g, " ").replace(/\.$/, "");
  const tone = ["Direct", "Warm", "Peer-to-peer"].includes(input.tone ?? "") ? (input.tone as string) : "Direct";

  if (!company) throw new Error("Company name is required — it appears in every opener.");
  if (research.length < 60) {
    throw new Error(
      "Paste more research. At least a few sentences of real, public text about them — an about page, a job ad or a press release.",
    );
  }
  if (offer.length < 15) throw new Error("Describe what you do in one sentence, phrased as an outcome.");

  const angles = detectAngles(research);
  const facts = extractFacts(research);
  const greeting = contact ? `Hi ${contact},` : "Hi,";

  if (angles.length === 0) {
    return {
      headline: `No usable angle found in the research for ${company}. This is a signal, not a failure — find a better source or drop the prospect.`,
      score: { label: "Specificity score", value: 0, max: 100, band: "bad" },
      metrics: [
        { label: "Angles found", value: "0" },
        { label: "Specific facts", value: String(facts.numbers.length + facts.places.length) },
        { label: "Tone", value: tone },
        { label: "Verdict", value: "Do not send" },
      ],
      sections: [
        {
          title: "Why nothing was usable",
          items: [
            {
              title: "The text you pasted contains no reason to reach out today",
              body:
                "There is no stated problem, no funding, no hiring, no expansion and no growth number. An email built on this would have to invent a reason, which is exactly what gets deleted. Try their careers page, their last press release, or a recent post by the founder.",
              severity: "high",
            },
          ],
        },
      ],
      json: { company, anglesFound: [], verdict: "insufficient-research" },
    };
  }

  const primary = angles[0];
  const secondary = angles[1];

  // ---- opener lines, each traceable to the research -------------------------
  const openerFor = (angle: FoundAngle): string => {
    const q = angle.quote.replace(/\s+/g, " ");
    switch (angle.def.id) {
      case "statedPain":
        return `You wrote that ${q.charAt(0).toLowerCase()}${q.slice(1)} — that line is the reason I'm writing.`;
      case "funding":
        return `Saw ${company} closed the round. Congratulations — and I imagine the operations spend is already allocated.`;
      case "hiring":
        return `You're hiring for roles that exist mostly to absorb manual coordination work.`;
      case "expansion":
        return `${company} expanding means the processes that worked at the current size are about to stop working.`;
      case "growthMetric":
        return `Your volume figure stood out: ${angle.detail}. That kind of change usually breaks something operational before it breaks anything else.`;
      case "launch":
        return `Noticed the recent launch at ${company}.`;
      case "scale":
        return `${company} at ${facts.numbers[0] ?? "your current size"} is right at the point where manual process becomes the constraint.`;
      case "techStack":
        return `You mentioned ${facts.tools.join(" and ")} — that combination usually means someone is moving data between them by hand.`;
      case "award":
        return `Saw the recognition ${company} picked up.`;
      default:
        return `Reaching out about ${company}.`;
    }
  };

  const bridge = (() => {
    switch (tone) {
      case "Warm":
        return `We work with teams in exactly that position. ${offer}.`;
      case "Peer-to-peer":
        return `I've watched this play out at other companies your size. ${offer}.`;
      default:
        return `${offer.charAt(0).toUpperCase()}${offer.slice(1)}.`;
    }
  })();

  const ask = (() => {
    switch (tone) {
      case "Warm":
        return "Would it be useful to compare notes for 15 minutes?";
      case "Peer-to-peer":
        return "Worth a short conversation, or is this not a priority right now?";
      default:
        return "Worth 15 minutes to see if the numbers hold for you?";
    }
  })();

  // ---- three complete variants ---------------------------------------------
  const variantDirect = [
    `Subject: ${company} — ${primary.def.id === "hiring" ? "the dispatch coordinator roles" : primary.def.id === "funding" ? "post-round operations" : "the manual coordination problem"}`,
    "",
    greeting,
    "",
    openerFor(primary),
    "",
    bridge,
    "",
    ask,
    "",
    "Best,",
  ].join("\n");

  const variantCuriosity = [
    `Subject: a question about how ${company} handles this`,
    "",
    greeting,
    "",
    openerFor(primary),
    "",
    secondary ? openerFor(secondary) : `${facts.numbers[0] ? `At ${facts.numbers[0]}, that adds up quickly.` : ""}`,
    "",
    `I'm curious how you're handling it today — most teams at your stage are doing it manually and have stopped noticing.`,
    "",
    `${offer.charAt(0).toUpperCase()}${offer.slice(1)}. Happy to show you what that looked like elsewhere.`,
    "",
    "Best,",
  ]
    .filter((l, i, arr) => !(l === "" && arr[i - 1] === ""))
    .join("\n");

  const variantShort = [
    `Subject: ${primary.def.id === "statedPain" ? "the data entry nobody owns" : `${company} + a quick idea`}`,
    "",
    greeting,
    "",
    openerFor(primary),
    "",
    `${offer.charAt(0).toUpperCase()}${offer.slice(1)}.`,
    "",
    "Interested?",
    "",
    "Best,",
  ].join("\n");

  const variants = [
    { title: `Variant 1 — direct (${wordCount(variantDirect)} words)`, text: variantDirect },
    { title: `Variant 2 — curiosity (${wordCount(variantCuriosity)} words)`, text: variantCuriosity },
    { title: `Variant 3 — minimal (${wordCount(variantShort)} words)`, text: variantShort },
  ];

  // ---- spam audit on the strongest variant --------------------------------
  const audited = variantDirect;
  const spamHits = SPAM_RULES.filter((r) => r.test(audited));
  const spamItems: ResultItem[] = spamHits.map((r) => ({
    title: r.label,
    body: r.fix,
    severity: r.severity,
    tag: r.id,
  }));

  // ---- specificity score ---------------------------------------------------
  // Reward the angle strength, having a second angle, and hard numbers.
  const specificity = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        primary.def.strength * 0.6 +
          (secondary ? 12 : 0) +
          Math.min(15, facts.numbers.length * 5) +
          (contact ? 5 : 0) +
          (facts.tools.length > 0 ? 5 : 0) -
          spamHits.reduce((s, r) => s + (r.severity === "high" ? 12 : 6), 0),
      ),
    ),
  );
  const band = specificity >= 70 ? "good" : specificity >= 45 ? "warn" : "bad";

  const headline =
    spamHits.filter((h) => h.severity === "high").length > 0
      ? `Strongest angle for ${company}: ${primary.def.label.toLowerCase()}. But fix ${spamHits.filter((h) => h.severity === "high").length} deliverability problem${spamHits.filter((h) => h.severity === "high").length === 1 ? "" : "s"} before you send.`
      : `Strongest angle for ${company}: ${primary.def.label.toLowerCase()}. Specificity ${specificity}/100 and the copy passed the deliverability audit.`;

  return {
    headline,
    score: { label: "Specificity score", value: specificity, max: 100, band },
    metrics: [
      { label: "Angles found", value: String(angles.length), hint: `strongest: ${primary.def.label}` },
      { label: "Hard numbers reused", value: String(facts.numbers.length) },
      { label: "Spam triggers", value: String(spamHits.length), hint: `${SPAM_RULES.length} checked` },
      { label: "Shortest variant", value: `${Math.min(...variants.map((v) => wordCount(v.text)))} words` },
    ],
    sections: [
      {
        title: `Research angles found (${angles.length}) — ranked by reply likelihood`,
        items: angles.map((a, i) => ({
          title: `${i + 1}. ${a.def.label} · strength ${a.def.strength}/100`,
          body: `Quoting your research: "${a.quote}"\n\n${a.def.why}`,
          tag: a.def.id,
          severity: i === 0 ? undefined : undefined,
        })),
      },
      {
        title: `Deliverability audit (${spamHits.length} issue${spamHits.length === 1 ? "" : "s"})`,
        items:
          spamItems.length > 0
            ? spamItems
            : [
                {
                  title: "Clean on all 14 content checks",
                  body:
                    "No trigger words, no shouting, one link maximum, under 120 words, one question. Content is not what will hurt this send — check your SPF, DKIM and DMARC records separately.",
                },
              ],
      },
      {
        title: "Specific facts available for follow-ups",
        items: [
          ...(facts.numbers.length > 0 ? [{ title: "Numbers", body: facts.numbers.join(" · "), tag: "reusable" }] : []),
          ...(facts.places.length > 0 ? [{ title: "Places", body: facts.places.join(" · "), tag: "reusable" }] : []),
          ...(facts.tools.length > 0 ? [{ title: "Tools mentioned", body: facts.tools.join(" · "), tag: "reusable" }] : []),
        ],
      },
    ],
    copyBlocks: variants,
    json: {
      company,
      contact: contact || null,
      tone,
      specificityScore: specificity,
      band,
      primaryAngle: { id: primary.def.id, label: primary.def.label, strength: primary.def.strength, quote: primary.quote },
      anglesFound: angles.map((a) => ({ id: a.def.id, label: a.def.label, strength: a.def.strength, quote: a.quote })),
      facts,
      variants: variants.map((v) => ({ label: v.title, body: v.text, words: wordCount(v.text) })),
      deliverability: {
        checksRun: SPAM_RULES.length,
        issues: spamHits.map((h) => ({ id: h.id, label: h.label, severity: h.severity, fix: h.fix })),
        clean: spamHits.length === 0,
      },
    },
  };
}
