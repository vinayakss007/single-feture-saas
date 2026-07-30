import type { ResultItem, RunInput, RunResult, Severity } from "./types";

/**
 * AnswerReady engine — audits a page the way an answer engine sees it.
 *
 * The central assumption is deliberate and conservative: most AI crawlers do not
 * execute JavaScript, so anything absent from the server response is treated as
 * absent entirely. That is the difference between this and a classic SEO audit.
 */

const TIMEOUT_MS = 9000;
const UA = "AnswerReady/1.0 (+https://answerready.abetworks.in; AI-readiness auditor)";

/** The crawlers that decide whether you appear inside a generated answer. */
const AI_CRAWLERS: { agent: string; operator: string; purpose: string; critical: boolean }[] = [
  { agent: "GPTBot", operator: "OpenAI", purpose: "Training and ChatGPT browsing", critical: true },
  { agent: "OAI-SearchBot", operator: "OpenAI", purpose: "ChatGPT Search index — blocking this removes you from ChatGPT results", critical: true },
  { agent: "ClaudeBot", operator: "Anthropic", purpose: "Claude retrieval and citation", critical: true },
  { agent: "PerplexityBot", operator: "Perplexity", purpose: "Perplexity answer index and citations", critical: true },
  { agent: "Google-Extended", operator: "Google", purpose: "Gemini grounding and AI Overviews eligibility", critical: true },
  { agent: "CCBot", operator: "Common Crawl", purpose: "Feeds most open training corpora", critical: false },
  { agent: "Bytespider", operator: "ByteDance", purpose: "Doubao and TikTok search", critical: false },
];

const EXPECTED_SCHEMA_TYPES = [
  "Organization",
  "WebSite",
  "WebPage",
  "Article",
  "BreadcrumbList",
  "FAQPage",
  "Product",
  "SoftwareApplication",
  "Service",
  "HowTo",
  "Person",
];

type Check = {
  id: string;
  label: string;
  passed: boolean;
  weight: number;
  severity: Severity;
  detail: string;
  fix: string;
};

function normaliseUrl(raw: string): URL {
  const trimmed = raw.trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    throw new Error(`"${raw}" is not a valid URL. Try something like https://example.com/page`);
  }
  if (!/^https?:$/.test(url.protocol)) throw new Error("Only http and https URLs can be audited.");
  if (/^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|169\.254\.)/.test(url.hostname) || url.hostname.endsWith(".local")) {
    throw new Error("Private and loopback addresses cannot be audited.");
  }
  return url;
}

async function get(url: string): Promise<{ status: number; body: string; finalUrl: string } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": UA, Accept: "text/html,text/plain,*/*" },
    });
    return { status: res.status, body: (await res.text()).slice(0, 800_000), finalUrl: res.url || url };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * robots.txt group parser. Rules are matched per user-agent group with the
 * longest-match-wins precedence the standard specifies.
 */
function robotsAllows(robotsTxt: string, agent: string, path: string): { allowed: boolean; matchedBy: string } {
  const lines = robotsTxt.split(/\r?\n/).map((l) => l.replace(/#.*$/, "").trim());
  const groups: { agents: string[]; rules: { allow: boolean; pattern: string }[] }[] = [];
  let current: (typeof groups)[number] | null = null;
  let lastWasAgent = false;

  for (const line of lines) {
    const ua = /^user-agent\s*:\s*(.+)$/i.exec(line);
    if (ua) {
      if (!lastWasAgent || !current) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(ua[1].trim().toLowerCase());
      lastWasAgent = true;
      continue;
    }
    const rule = /^(allow|disallow)\s*:\s*(.*)$/i.exec(line);
    if (rule && current) {
      current.rules.push({ allow: rule[1].toLowerCase() === "allow", pattern: rule[2].trim() });
      lastWasAgent = false;
    }
  }

  const lower = agent.toLowerCase();
  const specific = groups.find((g) => g.agents.includes(lower));
  const wildcard = groups.find((g) => g.agents.includes("*"));
  const group = specific ?? wildcard;
  if (!group) return { allowed: true, matchedBy: "no matching group — allowed by default" };

  let best: { allow: boolean; pattern: string } | null = null;
  for (const r of group.rules) {
    if (r.pattern === "") {
      // "Disallow:" with an empty value means allow everything.
      if (!r.allow && (best === null || best.pattern.length === 0)) best = { allow: true, pattern: "" };
      continue;
    }
    const regex = new RegExp(
      `^${r.pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\$$/, "$")}`,
    );
    if (regex.test(path) && (best === null || r.pattern.length > best.pattern.length)) best = r;
  }

  if (!best) return { allowed: true, matchedBy: `${specific ? agent : "*"} group, no matching rule` };
  return {
    allowed: best.allow,
    matchedBy: `${specific ? `User-agent: ${agent}` : "User-agent: *"} → ${best.allow ? "Allow" : "Disallow"}: ${best.pattern || "(empty)"}`,
  };
}

function stripToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tagContent(html: string, tag: string): string[] {
  return [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi"))].map((m) => stripToText(m[1]));
}

function metaContent(html: string, nameOrProperty: string): string | null {
  const re = new RegExp(
    `<meta\\b[^>]*(?:name|property)=["']${nameOrProperty}["'][^>]*content=["']([^"']*)["']`,
    "i",
  );
  const alt = new RegExp(
    `<meta\\b[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${nameOrProperty}["']`,
    "i",
  );
  return re.exec(html)?.[1] ?? alt.exec(html)?.[1] ?? null;
}

function jsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  for (const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      blocks.push(JSON.parse(m[1].trim()));
    } catch {
      blocks.push({ __parseError: true });
    }
  }
  return blocks;
}

function collectTypes(node: unknown, out: Set<string>): void {
  if (Array.isArray(node)) {
    for (const n of node) collectTypes(n, out);
    return;
  }
  if (node && typeof node === "object") {
    const obj = node as Record<string, unknown>;
    const t = obj["@type"];
    if (typeof t === "string") out.add(t);
    else if (Array.isArray(t)) for (const x of t) if (typeof x === "string") out.add(x);
    for (const v of Object.values(obj)) collectTypes(v, out);
  }
}

export async function run(input: RunInput): Promise<RunResult> {
  const url = normaliseUrl(input.url ?? "");
  const intent = (input.intent ?? "").trim();

  const page = await get(url.toString());
  if (!page) throw new Error(`Could not reach ${url.hostname} within ${TIMEOUT_MS / 1000}s.`);
  if (page.status >= 400) throw new Error(`${url.toString()} returned HTTP ${page.status}. Audit a page that loads for anonymous visitors.`);

  const finalUrl = new URL(page.finalUrl);
  const html = page.body;
  const text = stripToText(html);
  const words = text.split(/\s+/).filter(Boolean);

  const [robots, llms] = await Promise.all([
    get(`${finalUrl.origin}/robots.txt`),
    get(`${finalUrl.origin}/llms.txt`),
  ]);

  const robotsTxt = robots && robots.status < 400 ? robots.body : "";
  const hasLlmsTxt = Boolean(llms && llms.status < 400 && /\S/.test(llms.body) && !/<html/i.test(llms.body));

  const checks: Check[] = [];
  const push = (c: Check) => checks.push(c);

  // ---- 1-7. AI crawler access ----------------------------------------------
  const crawlerRows: string[][] = [];
  let blockedCritical = 0;

  for (const bot of AI_CRAWLERS) {
    const verdict = robotsTxt
      ? robotsAllows(robotsTxt, bot.agent, finalUrl.pathname)
      : { allowed: true, matchedBy: "no robots.txt found — allowed by default" };
    if (!verdict.allowed && bot.critical) blockedCritical += 1;
    crawlerRows.push([bot.agent, bot.operator, verdict.allowed ? "Allowed" : "BLOCKED", verdict.matchedBy]);

    push({
      id: `crawler-${bot.agent}`,
      label: `${bot.agent} can reach this page`,
      passed: verdict.allowed,
      weight: bot.critical ? 8 : 3,
      severity: bot.critical ? "high" : "low",
      detail: `${verdict.matchedBy}. ${bot.purpose}.`,
      fix: `Remove the Disallow rule for ${bot.agent} in robots.txt, or accept that you will not appear in ${bot.operator} answers.`,
    });
  }

  // ---- 8. content without JavaScript ---------------------------------------
  const htmlBytes = html.length;
  const textRatio = htmlBytes > 0 ? text.length / htmlBytes : 0;
  const enoughText = words.length >= 250;
  push({
    id: "no-js-content",
    label: "Content is present without JavaScript",
    passed: enoughText,
    weight: 14,
    severity: "high",
    detail: `The server response contains ${words.length} words of text (${Math.round(textRatio * 100)}% of the HTML payload). Most AI crawlers do not execute JavaScript, so this is all they see.`,
    fix: "Server-render or statically generate the main content. If you are on Next.js, move the content out of a client component.",
  });

  // ---- 9. title -------------------------------------------------------------
  const title = tagContent(html, "title")[0] ?? "";
  push({
    id: "title",
    label: "Descriptive title tag",
    passed: title.length >= 15 && title.length <= 70,
    weight: 5,
    severity: "medium",
    detail: title ? `"${title}" (${title.length} characters)` : "No title tag found.",
    fix: "Write a 15 to 70 character title that states what the page answers, not just the brand name.",
  });

  // ---- 10. meta description ------------------------------------------------
  const description = metaContent(html, "description") ?? "";
  push({
    id: "description",
    label: "Meta description present",
    passed: description.length >= 50,
    weight: 4,
    severity: "medium",
    detail: description ? `${description.length} characters.` : "No meta description found.",
    fix: "Add a 50 to 160 character description that reads as a direct answer. Answer engines frequently lift this verbatim.",
  });

  // ---- 11. single H1 -------------------------------------------------------
  const h1s = tagContent(html, "h1");
  push({
    id: "h1",
    label: "Exactly one H1",
    passed: h1s.length === 1,
    weight: 4,
    severity: "medium",
    detail: h1s.length === 0 ? "No H1 found." : `${h1s.length} H1 elements: ${h1s.slice(0, 3).map((h) => `"${h.slice(0, 60)}"`).join(", ")}`,
    fix: "Use one H1 that states the page's subject. Multiple H1s make the primary topic ambiguous to an extractor.",
  });

  // ---- 12. JSON-LD present -------------------------------------------------
  const blocks = jsonLdBlocks(html);
  const types = new Set<string>();
  collectTypes(blocks, types);
  const parseErrors = blocks.filter((b) => (b as Record<string, unknown>)?.__parseError).length;

  push({
    id: "jsonld",
    label: "JSON-LD structured data present",
    passed: types.size > 0,
    weight: 12,
    severity: "high",
    detail:
      types.size > 0
        ? `${blocks.length} block${blocks.length === 1 ? "" : "s"} exposing: ${[...types].join(", ")}.`
        : "No JSON-LD found. Answer engines rely on it to attribute a claim to an entity.",
    fix: "Add at minimum an Organization block sitewide and a page-appropriate type. Use the block generated below as a starting point.",
  });

  push({
    id: "jsonld-valid",
    label: "All JSON-LD parses cleanly",
    passed: parseErrors === 0,
    weight: 6,
    severity: "high",
    detail: parseErrors === 0 ? "No parse errors." : `${parseErrors} JSON-LD block${parseErrors === 1 ? "" : "s"} contain invalid JSON and are silently ignored by every consumer.`,
    fix: "Fix the JSON syntax. A malformed block is worse than no block because it looks correct in code review.",
  });

  // ---- 13. FAQ / question headings ----------------------------------------
  const headings = [...tagContent(html, "h2"), ...tagContent(html, "h3")];
  const questionHeadings = headings.filter((h) => /\?$/.test(h.trim()) || /^(how|what|why|when|which|can|should|does|is|are)\b/i.test(h.trim()));
  push({
    id: "question-headings",
    label: "Question-shaped headings",
    passed: questionHeadings.length >= 2,
    weight: 7,
    severity: "medium",
    detail:
      questionHeadings.length > 0
        ? `${questionHeadings.length} of ${headings.length} headings are question-shaped: ${questionHeadings.slice(0, 3).map((h) => `"${h.slice(0, 50)}"`).join(", ")}`
        : `None of the ${headings.length} subheadings are phrased as a question.`,
    fix: "Rewrite subheadings as the questions your buyers actually type. Answer engines match a query to a heading before they read the body.",
  });

  push({
    id: "faqpage",
    label: "FAQPage schema",
    passed: types.has("FAQPage"),
    weight: 5,
    severity: "low",
    detail: types.has("FAQPage") ? "FAQPage schema present." : "No FAQPage schema. This is the highest-leverage single schema type for answer engines.",
    fix: "Wrap your existing question and answer pairs in FAQPage JSON-LD.",
  });

  // ---- 14. direct answer early --------------------------------------------
  const firstHundred = words.slice(0, 100).join(" ").toLowerCase();
  const intentWords = intent
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);
  const intentHits = intentWords.filter((w) => firstHundred.includes(w)).length;
  const answersEarly = intent ? intentHits >= Math.ceil(intentWords.length / 2) : words.length > 0;

  push({
    id: "answer-early",
    label: intent ? "Answers the stated intent in the first 100 words" : "Has substantive opening content",
    passed: answersEarly,
    weight: 8,
    severity: "medium",
    detail: intent
      ? `${intentHits} of ${intentWords.length} intent terms appear in the first 100 words.`
      : `First 100 words contain ${firstHundred.length} characters of content.`,
    fix: "Lead with the answer. Put the conclusion in the first paragraph and the reasoning underneath — the inverse of how most marketing pages are written.",
  });

  // ---- 15. extractable structures ------------------------------------------
  const listCount = (html.match(/<\/(?:ul|ol)>/gi) ?? []).length;
  const tableCount = (html.match(/<\/table>/gi) ?? []).length;
  push({
    id: "extractable",
    label: "Lists or tables an engine can lift facts from",
    passed: listCount + tableCount >= 2,
    weight: 5,
    severity: "low",
    detail: `${listCount} list${listCount === 1 ? "" : "s"} and ${tableCount} table${tableCount === 1 ? "" : "s"} found.`,
    fix: "Convert dense comparison paragraphs into a table and feature prose into a list. Structured facts get quoted; paragraphs get skipped.",
  });

  // ---- 16. canonical -------------------------------------------------------
  const canonical = /<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i.exec(html)?.[1] ?? null;
  push({
    id: "canonical",
    label: "Canonical URL declared",
    passed: Boolean(canonical),
    weight: 3,
    severity: "low",
    detail: canonical ? canonical : "No canonical link element.",
    fix: "Declare a canonical URL so citations consolidate on one address instead of splitting across parameter variants.",
  });

  // ---- 17. author and date -------------------------------------------------
  const hasAuthor = types.has("Person") || /rel=["']author["']/i.test(html) || Boolean(metaContent(html, "author")) || /\bby\s+[A-Z][a-z]+\s+[A-Z][a-z]+/.test(text.slice(0, 3000));
  const hasDate = Boolean(metaContent(html, "article:published_time")) || /<time\b[^>]*datetime=/i.test(html) || /\b(20\d{2}-\d{2}-\d{2})\b/.test(html);
  push({
    id: "eeat",
    label: "Author and date signals",
    passed: hasAuthor && hasDate,
    weight: 5,
    severity: "low",
    detail: `Author signal: ${hasAuthor ? "found" : "missing"}. Date signal: ${hasDate ? "found" : "missing"}.`,
    fix: "Publish a named author and a machine-readable date. Answer engines weight attributable, dated content more heavily.",
  });

  // ---- 18. llms.txt --------------------------------------------------------
  push({
    id: "llmstxt",
    label: "llms.txt published",
    passed: hasLlmsTxt,
    weight: 6,
    severity: "medium",
    detail: hasLlmsTxt ? `Found at ${finalUrl.origin}/llms.txt` : `No llms.txt at ${finalUrl.origin}/llms.txt`,
    fix: "Deploy the llms.txt generated below at your domain root. It is one file and it is the cheapest thing on this list.",
  });

  // ---- 19. sitemap ---------------------------------------------------------
  const sitemapDeclared = /sitemap\s*:/i.test(robotsTxt);
  push({
    id: "sitemap",
    label: "Sitemap declared in robots.txt",
    passed: sitemapDeclared,
    weight: 3,
    severity: "low",
    detail: sitemapDeclared ? "Sitemap directive present." : robotsTxt ? "robots.txt exists but declares no sitemap." : "No robots.txt found.",
    fix: "Add a `Sitemap:` line to robots.txt. It is how a crawler discovers pages that are not linked from the homepage.",
  });

  // ---- 20. Open Graph -----------------------------------------------------
  const ogTitle = metaContent(html, "og:title");
  push({
    id: "opengraph",
    label: "Open Graph metadata",
    passed: Boolean(ogTitle),
    weight: 2,
    severity: "low",
    detail: ogTitle ? `og:title = "${ogTitle}"` : "No og:title found.",
    fix: "Add Open Graph tags. Several retrieval pipelines read them as a fallback title and summary.",
  });

  // ---- scoring ------------------------------------------------------------
  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  const earned = checks.filter((c) => c.passed).reduce((s, c) => s + c.weight, 0);
  const value = Math.round((earned / totalWeight) * 100);
  const band = value >= 75 ? "good" : value >= 45 ? "warn" : "bad";

  const failed = checks.filter((c) => !c.passed);
  const high = failed.filter((c) => c.severity === "high");
  const medium = failed.filter((c) => c.severity === "medium");
  const low = failed.filter((c) => c.severity === "low");

  const toItems = (list: Check[]): ResultItem[] =>
    list.map((c) => ({ title: c.label, body: `${c.detail}\n\nFix: ${c.fix}`, severity: c.severity, tag: c.id }));

  // ---- generated llms.txt -------------------------------------------------
  const siteName = ogTitle?.split(/[|–—-]/)[0].trim() || title.split(/[|–—-]/)[0].trim() || finalUrl.hostname;
  const summary = description || words.slice(0, 40).join(" ");
  const generatedLlmsTxt = [
    `# ${siteName}`,
    "",
    `> ${summary}`,
    "",
    "## Key pages",
    "",
    `- [${title || siteName}](${finalUrl.toString()}): ${summary.slice(0, 140)}`,
    "- [Pricing](/pricing): Plans and what is included in each.",
    "- [Documentation](/docs): Technical reference and integration guides.",
    "",
    ...(questionHeadings.length > 0
      ? ["## Questions this site answers", "", ...questionHeadings.slice(0, 8).map((q) => `- ${q}`), ""]
      : []),
    "## Optional",
    "",
    "- [Blog](/blog): Longer-form writing and case studies.",
    "",
    `<!-- Generated by AnswerReady on ${new Date().toISOString().slice(0, 10)}. Edit the paths to match your real site. -->`,
  ].join("\n");

  // ---- generated JSON-LD --------------------------------------------------
  const faqPairs = questionHeadings.slice(0, 3).map((q) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: "Replace this with the answer text already on the page." },
  }));

  const generatedJsonLd = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${finalUrl.origin}/#organization`,
          name: siteName,
          url: finalUrl.origin,
          description: summary.slice(0, 250),
        },
        {
          "@type": "WebPage",
          "@id": `${finalUrl.toString()}#webpage`,
          url: finalUrl.toString(),
          name: title || siteName,
          description: description || summary.slice(0, 160),
          isPartOf: { "@id": `${finalUrl.origin}/#organization` },
          ...(hasDate ? {} : { datePublished: new Date().toISOString().slice(0, 10) }),
        },
        ...(faqPairs.length > 0
          ? [{ "@type": "FAQPage", "@id": `${finalUrl.toString()}#faq`, mainEntity: faqPairs }]
          : []),
      ],
    },
    null,
    2,
  );

  const headline =
    blockedCritical > 0
      ? `${finalUrl.hostname} scores ${value}/100 and is blocking ${blockedCritical} critical AI crawler${blockedCritical === 1 ? "" : "s"}. You are invisible in those answers regardless of anything else on this list.`
      : high.length > 0
        ? `${finalUrl.hostname} scores ${value}/100 with ${high.length} high-impact gap${high.length === 1 ? "" : "s"}. Start with: ${high[0].label.toLowerCase()}.`
        : value >= 75
          ? `${finalUrl.hostname} scores ${value}/100 — answer engines can read and cite this page. ${failed.length} minor improvement${failed.length === 1 ? "" : "s"} available.`
          : `${finalUrl.hostname} scores ${value}/100. Nothing critical is broken but ${failed.length} checks are unmet.`;

  return {
    headline,
    score: { label: "AI answer readiness", value, max: 100, band },
    metrics: [
      { label: "AI crawlers allowed", value: `${AI_CRAWLERS.length - crawlerRows.filter((r) => r[2] === "BLOCKED").length}/${AI_CRAWLERS.length}`, hint: blockedCritical > 0 ? `${blockedCritical} critical blocked` : "none blocked" },
      { label: "Words without JS", value: String(words.length), hint: enoughText ? "readable" : "too thin for extraction" },
      { label: "Schema types", value: String(types.size), hint: types.size > 0 ? [...types].slice(0, 2).join(", ") : "none" },
      { label: "llms.txt", value: hasLlmsTxt ? "Published" : "Missing" },
    ],
    table: {
      columns: ["AI crawler", "Operator", "Access", "Matched rule"],
      rows: crawlerRows,
    },
    sections: [
      { title: `High impact (${high.length})`, items: toItems(high) },
      { title: `Medium impact (${medium.length})`, items: toItems(medium) },
      { title: `Low impact (${low.length})`, items: toItems(low) },
      {
        title: `Passing (${checks.length - failed.length} of ${checks.length})`,
        items: checks.filter((c) => c.passed).map((c) => ({ title: c.label, body: c.detail, tag: c.id })),
      },
      {
        title: "Schema types found vs expected",
        items: EXPECTED_SCHEMA_TYPES.map((t) => ({
          title: t,
          body: types.has(t) ? "Present on the page." : "Not present. Add it if this page represents that entity type.",
          tag: types.has(t) ? "present" : "missing",
          severity: types.has(t) ? undefined : "low",
        })),
      },
    ],
    copyBlocks: [
      { title: `llms.txt — deploy at ${finalUrl.origin}/llms.txt`, text: generatedLlmsTxt },
      { title: "JSON-LD — paste into <head>", text: `<script type="application/ld+json">\n${generatedJsonLd}\n</script>`, language: "json" },
    ],
    json: {
      url: finalUrl.toString(),
      hostname: finalUrl.hostname,
      intent: intent || null,
      readinessScore: value,
      band,
      crawlers: crawlerRows.map(([agent, operator, access, matchedBy]) => ({ agent, operator, allowed: access === "Allowed", matchedBy })),
      content: { wordsWithoutJs: words.length, textToHtmlRatio: Number(textRatio.toFixed(4)), htmlBytes },
      metadata: { title, description, canonical, ogTitle, h1Count: h1s.length },
      structuredData: { blocks: blocks.length, parseErrors, types: [...types] },
      quotability: { questionHeadings: questionHeadings.length, totalSubheadings: headings.length, lists: listCount, tables: tableCount, answersIntentEarly: answersEarly },
      files: { llmsTxtPublished: hasLlmsTxt, robotsTxtFound: Boolean(robotsTxt), sitemapDeclared },
      checks: checks.map((c) => ({ id: c.id, label: c.label, passed: c.passed, severity: c.severity, weight: c.weight, detail: c.detail, fix: c.fix })),
      generated: { llmsTxt: generatedLlmsTxt, jsonLd: JSON.parse(generatedJsonLd) },
    },
  };
}
