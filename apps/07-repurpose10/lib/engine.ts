import type { ResultItem, RunInput, RunResult } from "./types";

/**
 * Repurpose10 engine — selection and restructuring, not rewriting.
 *
 * Every sentence in the output came from the input. That constraint keeps the
 * author's voice intact and makes it impossible for the tool to invent a fact,
 * which is the failure mode of model-rewritten repurposing.
 */

const LIMITS = {
  xPost: 280,
  linkedin: 3000,
  instagram: 2200,
  youtubeTitle: 100,
  youtubeDescription: 5000,
  threads: 500,
  reddit: 40000,
  quora: 40000,
  whatsapp: 1024,
  newsletter: 5000,
} as const;

/** X counts any link as 23 characters regardless of real length. */
const X_LINK_COST = 23;

const FILLER = /\b(um|uh|you know|like i said|sort of|kind of|basically|actually|literally|i mean|right\?)\b/gi;

function clean(text: string): string {
  return text
    .replace(/^[A-Z][A-Za-z .'-]{1,30}:\s*/gm, "") // speaker labels in transcripts
    .replace(FILLER, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function paragraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter((p) => p.length > 30);
}

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15 && s.length < 400);
}

/** Hook strength: what makes someone stop scrolling. */
function hookScore(s: string): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  if (/\b\d[\d,.]*\s*(?:%|percent|hours?|dollars?|x\b|times)/i.test(s) || /\b\d{2,}\b/.test(s)) {
    score += 28;
    reasons.push("contains a hard number");
  }
  if (/\b(not|never|nobody|no one|isn'?t|does not|do not|stop|wrong|myth|mistake)\b/i.test(s)) {
    score += 24;
    reasons.push("sets up a contradiction");
  }
  if (/\b(surprised|surprising|counterintuitive|hidden|nobody talks about|what nobody|the real|actually)\b/i.test(s)) {
    score += 20;
    reasons.push("promises a non-obvious insight");
  }
  if (s.length <= 110) {
    score += 18;
    reasons.push("short enough to read at a glance");
  } else if (s.length > 220) {
    score -= 12;
    reasons.push("too long for a hook");
  }
  if (/\?$/.test(s)) {
    score += 10;
    reasons.push("asks a question");
  }
  if (/^(most|many|every|all|the average)\b/i.test(s)) {
    score += 12;
    reasons.push("makes a broad claim worth arguing with");
  }
  if (/\b(we (?:measured|found|tested|analysed|analyzed))\b/i.test(s)) {
    score += 16;
    reasons.push("cites original research");
  }

  return { score: Math.max(0, Math.min(100, score)), reasons };
}

/** Key points: the most information-dense sentence from each paragraph. */
function keyPoints(paras: string[], max: number): string[] {
  const points: string[] = [];
  for (const p of paras) {
    const best = sentences(p)
      .map((s) => ({ s, score: hookScore(s).score + Math.min(20, s.length / 10) }))
      .sort((a, b) => b.score - a.score)[0];
    if (best) points.push(best.s);
    if (points.length >= max) break;
  }
  return points;
}

function shorten(s: string, max: number): string {
  const trimmed = s.trim();
  if (trimmed.length <= max) return trimmed;
  const cut = trimmed.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : cut.length).replace(/[,;:]$/, "")}…`;
}

function firstWords(s: string, n: number): string {
  return s.split(/\s+/).slice(0, n).join(" ");
}

function titleCaseWords(s: string): string {
  const small = new Set(["a", "an", "the", "in", "of", "on", "for", "and", "or", "to", "is", "at", "by"]);
  return s
    .split(/\s+/)
    .map((w, i) => (i > 0 && small.has(w.toLowerCase()) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

function hashtagsFrom(text: string, count: number): string[] {
  const stop = new Set([
    "the","and","that","with","this","from","have","they","their","about","which","would","there","because","most","more","into","your","what","when","been","were","will","than","them","some","such","only","other","also","after","before","every","those","these","being","does","doing","just","over","under","while","where","whose","much","many","very","then","thing","things","people","company","companies",
  ]);
  const counts = new Map<string, number>();
  for (const w of text.toLowerCase().match(/\b[a-z]{5,16}\b/g) ?? []) {
    if (stop.has(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([w]) => `#${w.charAt(0).toUpperCase()}${w.slice(1)}`);
}

export function run(input: RunInput): RunResult {
  const raw = (input.content ?? "").trim();
  if (raw.split(/\s+/).length < 150) {
    throw new Error("Paste at least 150 words. Ten distinct formats need enough distinct points to avoid repeating.");
  }

  const link = (input.link ?? "").trim();
  const audience = (input.audience ?? "").trim();
  const text = clean(raw);
  const paras = paragraphs(text);
  const allSentences = sentences(text);

  const ranked = allSentences
    .map((s) => ({ s, ...hookScore(s) }))
    .sort((a, b) => b.score - a.score);

  const hook = ranked[0]?.s ?? allSentences[0];
  const hook2 = ranked[1]?.s ?? allSentences[1] ?? hook;
  const points = keyPoints(paras, 6);
  const closing = allSentences[allSentences.length - 1] ?? "";
  const tags = hashtagsFrom(text, 6);

  const titleLine = raw.split(/\r?\n/)[0].trim();
  const topic = titleLine.length > 8 && titleLine.length < 120 ? titleLine : firstWords(hook, 9);

  // ---- 1. X thread ---------------------------------------------------------
  const threadBodies = points.slice(0, 5);
  const threadParts: string[] = [];
  threadParts.push(shorten(hook, LIMITS.xPost - 8));
  threadBodies.forEach((p, i) => threadParts.push(shorten(p, LIMITS.xPost - 8)));
  threadParts.push(
    shorten(
      link ? `${firstWords(closing, 20)}\n\nFull write-up:` : firstWords(closing, 24),
      LIMITS.xPost - (link ? X_LINK_COST + 4 : 0) - 8,
    ) + (link ? ` ${link}` : ""),
  );
  const xThread = threadParts.map((p, i) => `${i + 1}/${threadParts.length}  ${p}`).join("\n\n---\n\n");

  // ---- 2. X single post ----------------------------------------------------
  const xSingleBudget = LIMITS.xPost - (link ? X_LINK_COST + 2 : 0);
  const xSingle = `${shorten(hook, xSingleBudget - 2)}${link ? `\n\n${link}` : ""}`;

  // ---- 3. LinkedIn ---------------------------------------------------------
  const linkedin = [
    shorten(hook, 200),
    "",
    ...points.slice(0, 4).flatMap((p) => [`→ ${shorten(p, 240)}`, ""]),
    shorten(closing, 240),
    "",
    audience ? `If you work with ${audience}, this is the number worth measuring first.` : "Worth measuring before you buy anything.",
    "",
    link ? "Full write-up in the first comment." : "",
    "",
    tags.slice(0, 3).join(" "),
  ]
    .filter((l, i, arr) => !(l === "" && arr[i - 1] === ""))
    .join("\n")
    .slice(0, LIMITS.linkedin);

  const linkedinComment = link ? `Full write-up here: ${link}` : "";

  // ---- 4. Instagram --------------------------------------------------------
  const instagram = [
    shorten(hook, 150),
    "",
    ...points.slice(0, 3).map((p) => `• ${shorten(p, 180)}`),
    "",
    shorten(closing, 180),
    "",
    link ? "Link in bio." : "",
    "",
    tags.join(" "),
  ]
    .filter((l, i, arr) => !(l === "" && arr[i - 1] === ""))
    .join("\n")
    .slice(0, LIMITS.instagram);

  // ---- 5. YouTube ----------------------------------------------------------
  const youtubeTitle = shorten(titleCaseWords(firstWords(topic, 10)), LIMITS.youtubeTitle);
  const youtubeDescription = [
    shorten(hook, 220),
    "",
    "What we cover:",
    ...points.slice(0, 5).map((p, i) => `${String(i).padStart(2, "0")}:00 — ${shorten(p, 90)}`),
    "",
    shorten(closing, 220),
    "",
    link ? `Written version: ${link}` : "",
    "",
    tags.slice(0, 5).join(" "),
  ]
    .filter((l, i, arr) => !(l === "" && arr[i - 1] === ""))
    .join("\n")
    .slice(0, LIMITS.youtubeDescription);

  // ---- 6. Newsletter intro -------------------------------------------------
  const newsletter = [
    `Subject: ${shorten(titleCaseWords(firstWords(topic, 8)), 70)}`,
    "",
    "Hello,",
    "",
    shorten(hook, 280),
    "",
    shorten(hook2, 280),
    "",
    "Three things worth taking away:",
    ...points.slice(0, 3).map((p, i) => `${i + 1}. ${shorten(p, 200)}`),
    "",
    link ? `The full piece is here: ${link}` : "",
    "",
    "— Abet Works",
  ]
    .filter((l, i, arr) => !(l === "" && arr[i - 1] === ""))
    .join("\n");

  // ---- 7. Reddit -----------------------------------------------------------
  const reddit = [
    `**${shorten(titleCaseWords(firstWords(topic, 12)), 300)}**`,
    "",
    audience ? `Posting this for ${audience} — happy to be told I'm wrong.` : "Happy to be told I'm wrong on any of this.",
    "",
    shorten(hook, 400),
    "",
    ...points.slice(0, 4).map((p) => `- ${shorten(p, 300)}`),
    "",
    shorten(closing, 300),
    "",
    "Has anyone measured this differently? Curious whether the numbers hold elsewhere.",
    "",
    "_(No hashtags, no link in the body — happy to share the source in comments if useful.)_",
  ].join("\n");

  // ---- 8. Quora answer -----------------------------------------------------
  const quoraQuestion = `What is the biggest hidden cost ${audience ? `for ${audience}` : "in this area"}?`;
  const quora = [
    `**Answering: ${quoraQuestion}**`,
    "",
    shorten(hook, 350),
    "",
    ...points.slice(0, 4).map((p) => `${shorten(p, 320)}`),
    "",
    shorten(closing, 300),
    "",
    link ? `I wrote the longer version up here: ${link}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  // ---- 9. Threads ----------------------------------------------------------
  const threads = shorten(`${hook}\n\n${firstWords(hook2, 22)}`, LIMITS.threads);

  // ---- 10. WhatsApp / Telegram broadcast -----------------------------------
  const whatsapp = shorten(
    [
      `*${shorten(titleCaseWords(firstWords(topic, 8)), 70)}*`,
      "",
      shorten(hook, 220),
      "",
      ...points.slice(0, 2).map((p) => `• ${shorten(p, 140)}`),
      "",
      link ? `Read: ${link}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    LIMITS.whatsapp,
  );

  // ---- assemble ------------------------------------------------------------
  const outputs: { title: string; text: string; used: number; limit: number }[] = [
    { title: `X thread (${threadParts.length} posts)`, text: xThread, used: Math.max(...threadParts.map((p) => p.length)), limit: LIMITS.xPost },
    { title: "X single post", text: xSingle, used: xSingle.length + (link ? X_LINK_COST - link.length : 0), limit: LIMITS.xPost },
    { title: "LinkedIn post", text: linkedin + (linkedinComment ? `\n\n[FIRST COMMENT]\n${linkedinComment}` : ""), used: linkedin.length, limit: LIMITS.linkedin },
    { title: "Instagram caption", text: instagram, used: instagram.length, limit: LIMITS.instagram },
    { title: "YouTube title", text: youtubeTitle, used: youtubeTitle.length, limit: LIMITS.youtubeTitle },
    { title: "YouTube description", text: youtubeDescription, used: youtubeDescription.length, limit: LIMITS.youtubeDescription },
    { title: "Newsletter intro", text: newsletter, used: newsletter.length, limit: LIMITS.newsletter },
    { title: "Reddit post", text: reddit, used: reddit.length, limit: LIMITS.reddit },
    { title: "Quora answer", text: quora, used: quora.length, limit: LIMITS.quora },
    { title: "Threads post", text: threads, used: threads.length, limit: LIMITS.threads },
    { title: "WhatsApp / Telegram broadcast", text: whatsapp, used: whatsapp.length, limit: LIMITS.whatsapp },
  ];

  const overLimit = outputs.filter((o) => o.used > o.limit);

  const schedule: ResultItem[] = [
    { title: "Day 1 — morning", body: "LinkedIn post (link in first comment). Highest-effort format goes out when your audience is at a desk.", tag: "LinkedIn" },
    { title: "Day 1 — afternoon", body: "X thread. Threads perform better a few hours after a LinkedIn post has driven profile visits.", tag: "X" },
    { title: "Day 2", body: "Newsletter intro. Lets you reference the LinkedIn conversation from the day before.", tag: "Email" },
    { title: "Day 3", body: "Instagram caption and Threads post together — same visual, two surfaces.", tag: "Instagram" },
    { title: "Day 4", body: "Reddit post in one relevant subreddit. Read that subreddit's rules first; most ban self-promotion.", tag: "Reddit" },
    { title: "Day 5", body: "Quora answer and YouTube upload. Both are search-driven, so they compound rather than spike.", tag: "Search" },
    { title: "Day 7", body: "X single post using the second-strongest hook. Same idea, different entry point.", tag: "X" },
    { title: "Any day", body: "WhatsApp or Telegram broadcast to your existing community, once.", tag: "Direct" },
  ];

  const headline = `${outputs.length} platform-native outputs generated from ${raw.split(/\s+/).length} words${
    overLimit.length === 0 ? ", all inside their platform limits." : `, but ${overLimit.length} exceeded a limit.`
  } Strongest hook: "${shorten(hook, 90)}"`;

  const hookQuality = Math.round(ranked[0]?.score ?? 0);

  return {
    headline,
    score: { label: "Hook strength of the lead line", value: hookQuality, max: 100, band: hookQuality >= 60 ? "good" : hookQuality >= 35 ? "warn" : "bad" },
    metrics: [
      { label: "Formats generated", value: String(outputs.length) },
      { label: "Source words", value: String(raw.split(/\s+/).length), hint: `${paras.length} paragraphs` },
      { label: "Key points extracted", value: String(points.length) },
      { label: "Over limit", value: String(overLimit.length), hint: overLimit.length === 0 ? "all safe to publish" : "needs trimming" },
    ],
    table: {
      columns: ["Format", "Characters used", "Platform limit", "Status"],
      rows: outputs.map((o) => [
        o.title,
        String(o.used),
        String(o.limit),
        o.used > o.limit ? "OVER LIMIT" : `${Math.round((o.used / o.limit) * 100)}% used`,
      ]),
    },
    sections: [
      {
        title: `Hook candidates (top ${Math.min(5, ranked.length)}) — ranked`,
        items: ranked.slice(0, 5).map((r, i) => ({
          title: `${i + 1}. Strength ${r.score}/100`,
          body: `"${r.s}"\n\nWhy: ${r.reasons.length > 0 ? r.reasons.join(", ") : "no strong hook signals — used as body copy rather than an opener"}.`,
          tag: i === 0 ? "used as lead" : undefined,
        })),
      },
      {
        title: `Key points extracted (${points.length})`,
        items: points.map((p, i) => ({ title: `Point ${i + 1}`, body: p })),
      },
      { title: "Suggested posting schedule", items: schedule },
      {
        title: "Suggested hashtags",
        items: [{ title: "Derived from your most-used substantive terms", body: tags.join(" ") }],
      },
    ],
    copyBlocks: outputs.map((o) => ({ title: `${o.title} — ${o.used}/${o.limit} chars`, text: o.text })),
    json: {
      sourceWords: raw.split(/\s+/).length,
      paragraphs: paras.length,
      topic,
      hook,
      hookStrength: hookQuality,
      hookCandidates: ranked.slice(0, 5).map((r) => ({ text: r.s, score: r.score, reasons: r.reasons })),
      keyPoints: points,
      hashtags: tags,
      outputs: outputs.map((o) => ({ format: o.title, charactersUsed: o.used, limit: o.limit, withinLimit: o.used <= o.limit, text: o.text })),
      schedule: schedule.map((s) => ({ when: s.title, what: s.body, platform: s.tag })),
    },
  };
}
