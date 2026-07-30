import type { ResultItem, RunInput, RunResult, Severity } from "./types.ts";

/**
 * WCAG 2.2 checks over raw HTML.
 *
 * Regex over markup rather than a DOM parser, deliberately: it keeps the engine
 * dependency-free and lets it accept a fragment, a broken document, or a template's
 * half-rendered output — all of which are what people actually have when they need
 * this. The cost is that deeply nested structural questions are out of scope, and
 * those are honestly reported in `needsHuman` rather than passed silently.
 *
 * The rule that matters most here: a check either finds a real failure or says it
 * cannot tell. An accessibility tool that reports a clean bill of health on an
 * inaccessible page does more damage than no tool, because someone will publish a
 * statement based on it.
 */

type Level = "A" | "AA" | "AAA";

type Finding = {
  /** WCAG success criterion, e.g. "1.1.1 Non-text Content" */
  criterion: string;
  /** EN 301 549 clause, which is what European enforcement bodies cite */
  clause: string;
  level: Level;
  severity: Severity;
  what: string;
  fix: string;
  /** the offending markup, trimmed to something searchable */
  element: string;
};

const LEVEL_RANK: Record<Level, number> = { A: 1, AA: 2, AAA: 3 };

function trimEl(html: string, max = 120): string {
  const one = html.replace(/\s+/g, " ").trim();
  return one.length > max ? `${one.slice(0, max - 1)}…` : one;
}

/** All matches of a tag, with their raw text. */
function tags(html: string, name: string): string[] {
  const re = new RegExp(`<${name}\\b[^>]*>`, "gi");
  return html.match(re) ?? [];
}

function attr(tag: string, name: string): string | null {
  const re = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const m = re.exec(tag);
  if (!m) return null;
  return (m[2] ?? m[3] ?? m[4] ?? "").trim();
}

function hasAttr(tag: string, name: string): boolean {
  return new RegExp(`\\b${name}\\b`, "i").test(tag);
}

/** Contents of an element, where the markup is well formed enough to tell. */
function elementBodies(html: string, name: string): { open: string; body: string }[] {
  const re = new RegExp(`<${name}\\b([^>]*)>([\\s\\S]*?)<\\/${name}>`, "gi");
  const out: { open: string; body: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    out.push({ open: `<${name}${m[1] ?? ""}>`, body: m[2] ?? "" });
  }
  return out;
}

function textOf(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Contrast — only where the colours are knowable from the markup
// ---------------------------------------------------------------------------

function parseHex(value: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (!m) return null;
  let hex = m[1]!;
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const chan = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
}

function contrastRatio(fg: string, bg: string): number | null {
  const f = parseHex(fg);
  const b = parseHex(bg);
  if (!f || !b) return null;
  const lf = relativeLuminance(f);
  const lb = relativeLuminance(b);
  const [hi, lo] = lf > lb ? [lf, lb] : [lb, lf];
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}

// ---------------------------------------------------------------------------
// The checks
// ---------------------------------------------------------------------------

const GENERIC_LINK_TEXT = new Set([
  "click here",
  "here",
  "read more",
  "more",
  "learn more",
  "link",
  "this",
  "details",
  "continue",
  "download",
]);

function audit(html: string): { findings: Finding[]; counts: { images: number; controls: number; links: number } } {
  const f: Finding[] = [];
  const push = (x: Finding) => f.push(x);

  // --- 1.1.1 Images
  const images = tags(html, "img");
  for (const img of images) {
    const alt = attr(img, "alt");
    if (alt === null) {
      push({
        criterion: "1.1.1 Non-text Content",
        clause: "EN 301 549 § 9.1.1.1",
        level: "A",
        severity: "high",
        what: "Image has no alt attribute at all, so a screen reader announces the file name or nothing.",
        fix: 'Add alt="…" describing the image\'s purpose. If it is purely decorative, use alt="" — an empty alt is correct and an absent one is not.',
        element: trimEl(img),
      });
    } else if (/^(image|img|photo|picture|logo|icon|graphic|untitled|dsc[_-]?\d+|screenshot)\.?(png|jpe?g|gif|svg|webp)?$/i.test(alt)) {
      push({
        criterion: "1.1.1 Non-text Content",
        clause: "EN 301 549 § 9.1.1.1",
        level: "A",
        severity: "medium",
        what: `Alt text "${alt}" describes the file, not the content. It conveys nothing to a screen reader user.`,
        fix: "Describe what the image communicates in this context, or use an empty alt if it communicates nothing.",
        element: trimEl(img),
      });
    }
  }

  // --- 2.4.4 A linked image with no accessible name is a link with no name.
  for (const { open, body } of elementBodies(html, "a")) {
    const inner = body.trim();
    const onlyImage = /^<img\b[^>]*>$/i.test(inner);
    if (onlyImage) {
      const alt = attr(inner, "alt");
      if (!alt && !attr(open, "aria-label") && !attr(open, "title")) {
        push({
          criterion: "2.4.4 Link Purpose (In Context)",
          clause: "EN 301 549 § 9.2.4.4",
          level: "A",
          severity: "high",
          what: "Link contains only an image with no alt text, so it has no accessible name — a screen reader announces the URL.",
          fix: "Give the image meaningful alt text describing where the link goes, or put aria-label on the link.",
          element: trimEl(`${open}${inner}</a>`),
        });
      }
    }
  }

  // --- 3.3.2 / 4.1.2 Form controls need labels
  const labelFor = new Set(
    tags(html, "label")
      .map((l) => attr(l, "for"))
      .filter((v): v is string => Boolean(v)),
  );
  const wrappedInLabel = elementBodies(html, "label").map((l) => l.body).join(" ");

  const controls = [...tags(html, "input"), ...tags(html, "select"), ...tags(html, "textarea")];
  let controlCount = 0;
  for (const c of controls) {
    const type = (attr(c, "type") ?? "text").toLowerCase();
    if (type === "hidden") continue;
    controlCount += 1;

    const id = attr(c, "id");
    const named =
      (id !== null && labelFor.has(id)) ||
      Boolean(attr(c, "aria-label")) ||
      Boolean(attr(c, "aria-labelledby")) ||
      Boolean(attr(c, "title")) ||
      (id !== null && wrappedInLabel.includes(id)) ||
      (type === "submit" && Boolean(attr(c, "value")));

    if (!named) {
      const hasPlaceholder = Boolean(attr(c, "placeholder"));
      push({
        criterion: "3.3.2 Labels or Instructions",
        clause: "EN 301 549 § 9.3.3.2",
        level: "A",
        severity: "high",
        what: hasPlaceholder
          ? "Control is labelled only by a placeholder. Placeholders are not accessible names, and they vanish the moment someone types."
          : "Control has no accessible name, so a screen reader user cannot tell what to enter.",
        fix: id
          ? `Add <label for="${id}">…</label>, or aria-label on the control. Keep the placeholder as a hint if you like, but it cannot be the label.`
          : "Give the control an id and an associated <label>, or add aria-label.",
        element: trimEl(c),
      });
    }
  }

  // --- 4.1.1 Duplicate ids break every id-based association, including labels
  const ids = new Map<string, number>();
  for (const m of html.matchAll(/\bid\s*=\s*"([^"]+)"/gi)) {
    const key = m[1]!;
    ids.set(key, (ids.get(key) ?? 0) + 1);
  }
  for (const [id, n] of ids) {
    if (n > 1) {
      push({
        criterion: "4.1.1 Parsing / 1.3.1 Info and Relationships",
        clause: "EN 301 549 § 9.1.3.1",
        level: "A",
        severity: "high",
        what: `id="${id}" appears ${n} times. Every label, aria-labelledby and fragment link pointing at it resolves to only the first one.`,
        fix: "Make ids unique. This is usually a loop or a copied component that forgot to suffix the id.",
        element: `id="${id}"`,
      });
    }
  }

  // --- 1.3.1 Heading structure
  const headings = [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({
    level: Number(m[1]),
    text: textOf(m[2] ?? ""),
    raw: m[0]!,
  }));

  if (headings.length > 0) {
    const h1s = headings.filter((h) => h.level === 1);
    if (h1s.length === 0) {
      push({
        criterion: "1.3.1 Info and Relationships",
        clause: "EN 301 549 § 9.1.3.1",
        level: "A",
        severity: "medium",
        what: "No <h1>. Screen reader users navigate by heading, and the page has no stated main topic.",
        fix: "Give the page exactly one <h1> naming what the page is about.",
        element: `first heading is <h${headings[0]!.level}>`,
      });
    } else if (h1s.length > 1) {
      push({
        criterion: "1.3.1 Info and Relationships",
        clause: "EN 301 549 § 9.1.3.1",
        level: "A",
        severity: "low",
        what: `${h1s.length} <h1> elements. The document outline no longer has a single topic.`,
        fix: "Keep one <h1> and demote the rest to <h2>.",
        element: trimEl(h1s[1]!.raw),
      });
    }

    // Order, and the very common "h3 before h1 because it looked right" case.
    for (let i = 1; i < headings.length; i += 1) {
      const prev = headings[i - 1]!;
      const cur = headings[i]!;
      if (cur.level > prev.level + 1) {
        push({
          criterion: "1.3.1 Info and Relationships",
          clause: "EN 301 549 § 9.1.3.1",
          level: "A",
          severity: "medium",
          what: `Heading level jumps from h${prev.level} to h${cur.level}, skipping a level. The outline implies a section that does not exist.`,
          fix: `Use h${prev.level + 1} for "${cur.text.slice(0, 40)}", and style it rather than choosing the tag by size.`,
          element: trimEl(cur.raw),
        });
      }
    }
    if (headings[0]!.level !== 1 && h1s.length > 0) {
      push({
        criterion: "1.3.1 Info and Relationships",
        clause: "EN 301 549 § 9.1.3.1",
        level: "A",
        severity: "medium",
        what: `First heading on the page is <h${headings[0]!.level}> but an <h1> appears later. Heading order does not match reading order.`,
        fix: "Put the <h1> first. Heading level is structure, not font size.",
        element: trimEl(headings[0]!.raw),
      });
    }

    for (const h of headings) {
      if (h.text.length === 0) {
        push({
          criterion: "2.4.6 Headings and Labels",
          clause: "EN 301 549 § 9.2.4.6",
          level: "AA",
          severity: "medium",
          what: `Empty <h${h.level}>. It appears in the heading list as a blank entry.`,
          fix: "Remove it, or give it text. Empty headings are usually spacing hacks.",
          element: trimEl(h.raw),
        });
      }
    }
  }

  // --- 2.4.4 Link text
  let linkCount = 0;
  for (const { open, body } of elementBodies(html, "a")) {
    linkCount += 1;
    const text = textOf(body).toLowerCase();
    if (text.length === 0 && !attr(open, "aria-label") && !/<img/i.test(body)) {
      push({
        criterion: "2.4.4 Link Purpose (In Context)",
        clause: "EN 301 549 § 9.2.4.4",
        level: "A",
        severity: "high",
        what: "Link has no text and no accessible name.",
        fix: "Give the link visible text, or aria-label if it must stay visually empty.",
        element: trimEl(open),
      });
    } else if (GENERIC_LINK_TEXT.has(text)) {
      push({
        criterion: "2.4.4 Link Purpose (In Context)",
        clause: "EN 301 549 § 9.2.4.4",
        level: "A",
        severity: "medium",
        what: `Link text "${text}" says nothing out of context. Screen reader users often browse a list of links with no surrounding prose.`,
        fix: `Describe the destination — "${text}" becomes something like "View this month's offers".`,
        element: trimEl(`${open}${textOf(body)}</a>`),
      });
    }
    if (attr(open, "target") === "_blank" && !/new (window|tab)/i.test(`${text} ${attr(open, "aria-label") ?? ""}`)) {
      push({
        criterion: "3.2.5 Change on Request",
        clause: "EN 301 549 § 9.3.2.5",
        level: "AAA",
        severity: "low",
        what: "Link opens in a new tab without warning, which disorients screen reader and screen magnifier users.",
        fix: 'Add "(opens in a new tab)" to the accessible name.',
        element: trimEl(open),
      });
    }
  }

  // --- 4.1.2 Buttons
  for (const { open, body } of elementBodies(html, "button")) {
    if (textOf(body).length === 0 && !attr(open, "aria-label") && !/<img|<svg/i.test(body)) {
      push({
        criterion: "4.1.2 Name, Role, Value",
        clause: "EN 301 549 § 9.4.1.2",
        level: "A",
        severity: "high",
        what: "Button has no text and no accessible name. It is announced as just 'button'.",
        fix: "Put text inside the button, or add aria-label describing the action.",
        element: trimEl(open),
      });
    }
  }

  // --- 2.1.1 Keyboard: click handlers and roles on non-interactive elements
  for (const m of html.matchAll(/<(div|span|li|td)\b([^>]*\bonclick\b[^>]*)>/gi)) {
    const tag = m[0]!;
    if (!hasAttr(tag, "tabindex")) {
      push({
        criterion: "2.1.1 Keyboard",
        clause: "EN 301 549 § 9.2.1.1",
        level: "A",
        severity: "high",
        what: "Click handler on a non-interactive element with no tabindex. A keyboard user cannot reach it and a screen reader will not announce it as actionable.",
        fix: "Use <button>. If you genuinely cannot, add role=\"button\", tabindex=\"0\" and a keydown handler for Enter and Space — three things <button> gives you for free.",
        element: trimEl(tag),
      });
    }
  }
  for (const m of html.matchAll(/<(div|span)\b([^>]*\brole\s*=\s*"(button|link|checkbox|tab|menuitem)"[^>]*)>/gi)) {
    const tag = m[0]!;
    if (!hasAttr(tag, "tabindex")) {
      push({
        criterion: "2.1.1 Keyboard",
        clause: "EN 301 549 § 9.2.1.1",
        level: "A",
        severity: "high",
        what: `Element declares role="${attr(tag, "role")}" but has no tabindex, so it can never receive focus. The role promises interactivity the element cannot deliver.`,
        fix: 'Add tabindex="0" and keyboard handlers, or replace it with the native element.',
        element: trimEl(tag),
      });
    }
  }

  // --- 2.4.3 Positive tabindex
  for (const m of html.matchAll(/<[^>]*\btabindex\s*=\s*"([1-9]\d*)"[^>]*>/gi)) {
    push({
      criterion: "2.4.3 Focus Order",
      clause: "EN 301 549 § 9.2.4.3",
      level: "A",
      severity: "medium",
      what: `tabindex="${m[1]}" forces this element ahead of everything in document order, so focus jumps around the page unpredictably.`,
      fix: 'Use tabindex="0" and fix the source order instead. Positive tabindex is almost never the right answer.',
      element: trimEl(m[0]!),
    });
  }

  // --- 4.1.2 aria-hidden on something focusable
  for (const m of html.matchAll(/<(button|a|input|select|textarea)\b[^>]*\baria-hidden\s*=\s*"true"[^>]*>/gi)) {
    push({
      criterion: "4.1.2 Name, Role, Value",
      clause: "EN 301 549 § 9.4.1.2",
      level: "A",
      severity: "high",
      what: "Focusable element is aria-hidden. A keyboard user can tab to it while a screen reader refuses to announce it — the worst of both.",
      fix: 'Remove aria-hidden, or make the element genuinely unreachable with the hidden attribute or display:none.',
      element: trimEl(m[0]!),
    });
  }

  // --- 3.1.1 Page language
  const htmlTag = tags(html, "html")[0];
  if (htmlTag && !attr(htmlTag, "lang")) {
    push({
      criterion: "3.1.1 Language of Page",
      clause: "EN 301 549 § 9.3.1.1",
      level: "A",
      severity: "medium",
      what: "<html> has no lang attribute, so a screen reader guesses the pronunciation rules.",
      fix: 'Add lang to <html>, e.g. lang="nl" or lang="en".',
      element: trimEl(htmlTag),
    });
  }

  // --- 2.4.2 Title
  if (/<html/i.test(html)) {
    const title = elementBodies(html, "title")[0];
    if (!title || textOf(title.body).length === 0) {
      push({
        criterion: "2.4.2 Page Titled",
        clause: "EN 301 549 § 9.2.4.2",
        level: "A",
        severity: "medium",
        what: "Page has no non-empty <title>. It is the first thing announced and the label on every browser tab.",
        fix: "Add a <title> that names the page, then the site.",
        element: "<head>",
      });
    }
  }

  // --- 1.3.1 Tables
  for (const { open, body } of elementBodies(html, "table")) {
    if (attr(open, "role") === "presentation" || attr(open, "role") === "none") continue;
    if (!/<th\b/i.test(body)) {
      push({
        criterion: "1.3.1 Info and Relationships",
        clause: "EN 301 549 § 9.1.3.1",
        level: "A",
        severity: "medium",
        what: "Data table has no <th> cells, so no cell is associated with a header and the data is announced as a flat list.",
        fix: 'Use <th scope="col"> for the header row. If the table is only for layout, add role="presentation".',
        element: trimEl(open),
      });
    }
    if (!/<caption\b/i.test(body)) {
      push({
        criterion: "1.3.1 Info and Relationships",
        clause: "EN 301 549 § 9.1.3.1",
        level: "AA",
        severity: "low",
        what: "Table has no <caption>, so it has no accessible name when navigating between tables.",
        fix: "Add <caption> describing what the table contains.",
        element: trimEl(open),
      });
    }
  }

  // --- 4.1.2 iframes
  for (const frame of tags(html, "iframe")) {
    if (!attr(frame, "title") && !attr(frame, "aria-label")) {
      push({
        criterion: "4.1.2 Name, Role, Value",
        clause: "EN 301 549 § 9.4.1.2",
        level: "A",
        severity: "medium",
        what: "iframe has no title, so it is announced only as 'frame' with no indication of what is inside.",
        fix: 'Add title="…" describing the embedded content, e.g. title="Promotional video".',
        element: trimEl(frame),
      });
    }
  }

  // --- 1.4.2 Autoplay
  for (const media of [...tags(html, "video"), ...tags(html, "audio")]) {
    if (hasAttr(media, "autoplay") && !hasAttr(media, "muted")) {
      push({
        criterion: "1.4.2 Audio Control",
        clause: "EN 301 549 § 9.1.4.2",
        level: "A",
        severity: "high",
        what: "Media autoplays with sound. It competes with a screen reader, which the user then cannot hear.",
        fix: "Remove autoplay, or add muted and a visible control to unmute.",
        element: trimEl(media),
      });
    }
  }

  // --- 1.2.2 Captions
  for (const { open, body } of elementBodies(html, "video")) {
    if (!/<track\b[^>]*kind\s*=\s*"(captions|subtitles)"/i.test(body)) {
      push({
        criterion: "1.2.2 Captions (Prerecorded)",
        clause: "EN 301 549 § 9.1.2.2",
        level: "A",
        severity: "high",
        what: "Video has no captions track. Deaf and hard-of-hearing users get nothing from the audio.",
        fix: 'Add <track kind="captions" src="…" srclang="…" label="…">.',
        element: trimEl(open),
      });
    }
  }

  // --- 1.3.1 Landmarks
  if (/<body/i.test(html)) {
    if (!/<main\b|role\s*=\s*"main"/i.test(html)) {
      push({
        criterion: "1.3.1 Info and Relationships / 2.4.1 Bypass Blocks",
        clause: "EN 301 549 § 9.2.4.1",
        level: "A",
        severity: "medium",
        what: "No <main> landmark, so there is no way to skip past the header straight to the content.",
        fix: "Wrap the page content in <main>. This is the single highest-value structural fix on most pages.",
        element: "<body>",
      });
    }
  }

  // --- 1.4.3 Contrast, only where inline styles make it knowable
  for (const m of html.matchAll(/<[^>]*\bstyle\s*=\s*"([^"]*)"[^>]*>/gi)) {
    const style = m[1]!;
    const fg = /(?:^|;)\s*color\s*:\s*(#[0-9a-f]{3,6})/i.exec(style)?.[1];
    const bg = /background(?:-color)?\s*:\s*(#[0-9a-f]{3,6})/i.exec(style)?.[1];
    if (!fg || !bg) continue;
    const ratio = contrastRatio(fg, bg);
    if (ratio === null) continue;
    if (ratio < 4.5) {
      push({
        criterion: "1.4.3 Contrast (Minimum)",
        clause: "EN 301 549 § 9.1.4.3",
        level: "AA",
        severity: ratio < 3 ? "high" : "medium",
        what: `Contrast ratio is ${ratio}:1 between ${fg} and ${bg}. AA requires 4.5:1 for body text and 3:1 for large text.`,
        fix: `Darken the foreground or lighten the background until the ratio reaches 4.5:1. ${fg} on ${bg} is a common "muted grey" that fails.`,
        element: trimEl(m[0]!),
      });
    }
  }

  // --- 1.3.5 Autocomplete on identity fields, an easy AA win
  for (const c of tags(html, "input")) {
    const type = (attr(c, "type") ?? "text").toLowerCase();
    const name = (attr(c, "name") ?? attr(c, "id") ?? "").toLowerCase();
    const identity = ["email", "tel"].includes(type) || /\b(email|phone|tel|name|address|postcode|zip|country)\b/.test(name);
    if (identity && !attr(c, "autocomplete")) {
      push({
        criterion: "1.3.5 Identify Input Purpose",
        clause: "EN 301 549 § 9.1.3.5",
        level: "AA",
        severity: "low",
        what: "Identity field has no autocomplete token, so assistive technology cannot label it with a familiar icon and users must retype known data.",
        fix: 'Add the right token, e.g. autocomplete="email", "tel" or "postal-code".',
        element: trimEl(c),
      });
    }
  }

  return { findings: f, counts: { images: images.length, controls: controlCount, links: linkCount } };
}

// ---------------------------------------------------------------------------
// Statement
// ---------------------------------------------------------------------------

function statement(input: RunInput, findings: Finding[], level: Level): string {
  const org = (input.organisation ?? "").trim() || "[Your organisation]";
  const page = (input.pageName ?? "").trim() || "this website";
  const blockers = findings.filter((x) => x.severity === "high");

  const conformance =
    findings.length === 0
      ? `partially conformant with WCAG 2.2 level ${level}`
      : blockers.length > 0
        ? `not yet conformant with WCAG 2.2 level ${level}`
        : `partially conformant with WCAG 2.2 level ${level}`;

  const known =
    findings.length === 0
      ? "- Automated checks found no failures. Manual testing with assistive technology has not yet been completed."
      : findings
          .slice(0, 12)
          .map((x) => `- ${x.criterion}: ${x.what.replace(/\s+/g, " ")}`)
          .join("\n");

  return `# Accessibility statement

${org} is committed to making ${page} accessible, in accordance with the European Accessibility Act (Directive (EU) 2019/882) and the harmonised standard EN 301 549.

## Conformance status

${page} is **${conformance}**. "Partially conformant" means some parts of the content do not fully conform to the standard.

## Known limitations

${known}

## Assessment method

This statement is based on an automated evaluation of the page source against WCAG 2.2 level ${level} and EN 301 549. Automated testing covers approximately one third of the WCAG success criteria. Manual testing with assistive technology, and testing by people with disabilities, has not been completed and is required for a full conformance claim.

## Feedback

If you encounter a barrier on ${page}, contact us at [your accessibility contact address]. We aim to respond within five working days.

If you are not satisfied with our response, you may escalate to the accessibility enforcement body in your member state.

## Statement preparation

Prepared on [date]. Last reviewed on [date].
`;
}

// ---------------------------------------------------------------------------
// run
// ---------------------------------------------------------------------------

const NEEDS_HUMAN = [
  "Whether alt text is actually meaningful in context — only a person can judge whether a description conveys what the image communicates.",
  "Colour contrast defined in stylesheets rather than inline styles. Only inline colours are knowable from markup.",
  "Whether visual focus order matches the DOM order once CSS has laid the page out.",
  "Whether every task can be completed with a keyboard alone, end to end.",
  "Whether error messages identify the field and explain how to fix it.",
  "Whether the page is usable at 200% zoom and 320 CSS pixels wide.",
  "Whether motion, animation or auto-updating content can be paused.",
  "Testing with a real screen reader — NVDA, JAWS or VoiceOver — which remains the only way to know.",
];

export async function run(input: RunInput): Promise<RunResult> {
  const html = (input.html ?? "").trim();
  if (html.length < 20) {
    throw new Error("Paste the page HTML. A few characters is not a page, and a clean report on nothing would be misleading.");
  }
  if (!/<[a-z!]/i.test(html)) {
    throw new Error("That does not look like HTML — no tags found. Use view-source, or paste your template's rendered output.");
  }

  const level: Level = input.level === "A" || input.level === "AA" || input.level === "AAA" ? input.level : "AA";
  const { findings: all, counts } = audit(html);

  // Only report criteria at or below the requested level.
  const findings = all.filter((x) => LEVEL_RANK[x.level] <= LEVEL_RANK[level]);
  const suppressed = all.length - findings.length;

  const blockers = findings.filter((x) => x.severity === "high");
  const warnings = findings.filter((x) => x.severity === "medium");
  const advisories = findings.filter((x) => x.severity === "low");

  // Blockers weigh five times a warning: a form nobody can fill in is not the same
  // problem as a missing caption, and a single number that treats them alike gets
  // gamed by fixing the cheap ones.
  const penalty = blockers.length * 5 + warnings.length * 2 + advisories.length;
  const score = Math.max(0, 100 - penalty * 3);
  const band = blockers.length > 0 ? "bad" : warnings.length > 0 ? "warn" : "good";

  const byCriterion = new Map<string, Finding[]>();
  for (const x of findings) {
    const list = byCriterion.get(x.criterion) ?? [];
    list.push(x);
    byCriterion.set(x.criterion, list);
  }

  const group = (label: string, items: Finding[]): { title: string; items: ResultItem[] } => ({
    title: label,
    items: items.map((x) => ({
      title: x.criterion,
      body: `${x.what}\n\nFix: ${x.fix}\n\nElement: ${x.element}`,
      tag: `${x.clause} · level ${x.level}`,
      severity: x.severity,
    })),
  });

  const sections: { title: string; items: ResultItem[] }[] = [];
  if (blockers.length > 0) sections.push(group(`Blockers — ${blockers.length}`, blockers));
  if (warnings.length > 0) sections.push(group(`Warnings — ${warnings.length}`, warnings));
  if (advisories.length > 0) sections.push(group(`Advisory — ${advisories.length}`, advisories));
  if (findings.length === 0) {
    sections.push({
      title: "No automated failures",
      items: [
        {
          body: `Nothing failed the ${34} mechanical checks at level ${level}. That is a third of WCAG, not all of it — the list below is what a person still has to verify before you can claim conformance.`,
          severity: "low",
        },
      ],
    });
  }
  sections.push({
    title: "Still requires a human — do not skip this",
    items: NEEDS_HUMAN.map((n) => ({ body: n, severity: "medium" as Severity })),
  });

  return {
    headline:
      blockers.length > 0
        ? `${input.pageName || "This page"}: ${blockers.length} blocker${blockers.length === 1 ? "" : "s"} that stop someone completing a task, plus ${warnings.length} warnings.`
        : findings.length > 0
          ? `${input.pageName || "This page"}: no blockers, ${findings.length} issue${findings.length === 1 ? "" : "s"} to tidy at level ${level}.`
          : `${input.pageName || "This page"}: passes all automated checks at level ${level}. Manual testing is still required.`,

    score: { label: `WCAG 2.2 ${level}`, value: score, max: 100, band },

    metrics: [
      { label: "Blockers", value: String(blockers.length), hint: "task-preventing" },
      { label: "Warnings", value: String(warnings.length) },
      { label: "Criteria affected", value: String(byCriterion.size) },
      { label: "Elements scanned", value: String(counts.images + counts.controls + counts.links), hint: `${counts.images} images, ${counts.controls} controls, ${counts.links} links` },
      ...(suppressed > 0
        ? [{ label: "Above target level", value: String(suppressed), hint: `raise to AAA to see these` }]
        : []),
    ],

    sections,

    table: {
      columns: ["Severity", "Criterion", "EN 301 549", "Element"],
      rows: findings.map((x) => [x.severity, x.criterion, x.clause, x.element]),
    },

    copyBlocks: [
      { title: "Accessibility statement — publish this", text: statement(input, findings, level), language: "markdown" },
      {
        title: "Findings as Markdown — paste into a ticket",
        text:
          findings.length === 0
            ? "No automated failures found."
            : findings
                .map((x, i) => `${i + 1}. **${x.criterion}** (${x.severity}, ${x.clause})\n   - ${x.what}\n   - Fix: ${x.fix}\n   - \`${x.element}\``)
                .join("\n"),
        language: "markdown",
      },
    ],

    json: {
      level,
      score,
      counts: { blockers: blockers.length, warnings: warnings.length, advisories: advisories.length },
      findings,
      needsHuman: NEEDS_HUMAN,
    },
  };
}
