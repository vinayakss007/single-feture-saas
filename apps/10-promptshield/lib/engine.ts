import type { ResultItem, RunInput, RunResult, Severity } from "./types.ts";

/**
 * PromptShield engine — deterministic rules, deliberately not a model.
 *
 * A model asked to judge untrusted text is itself reading untrusted text and can
 * be talked out of its judgement. Rules cannot be persuaded, add no latency and
 * cost nothing per call. This is the first layer, not the only layer: it belongs
 * alongside least-privilege tool design, never instead of it.
 */

type Policy = "Strict" | "Balanced" | "Permissive";
type Verdict = "allow" | "review" | "block";

type Detection = {
  class: string;
  rule: string;
  severity: Severity;
  weight: number;
  span: string;
  why: string;
};

type Rule = {
  id: string;
  class: string;
  severity: Severity;
  weight: number;
  pattern: RegExp;
  why: string;
};

const RULES: Rule[] = [
  // 1. instruction override
  {
    id: "override-ignore-previous",
    class: "Instruction override",
    severity: "high",
    weight: 30,
    pattern:
      /\b(ignore|disregard|forget|discard|override)\s+(all\s+|any\s+|the\s+)?(previous|prior|above|earlier|preceding|foregoing|system)\s+(instructions?|prompts?|rules?|directions?|context|messages?)\b/gi,
    why: "The canonical injection. Text that instructs the model to abandon its own instructions has no legitimate reason to appear in user content.",
  },
  {
    id: "override-new-instructions",
    class: "Instruction override",
    severity: "high",
    weight: 26,
    pattern: /\b(new|updated|revised|actual|real)\s+(instructions?|system\s+prompt|directive)s?\s*[:\-]/gi,
    why: "Attempts to present attacker text as an authoritative replacement for the system prompt.",
  },
  // 2. persona hijack
  {
    id: "persona-hijack",
    class: "Persona hijack",
    severity: "high",
    weight: 24,
    pattern:
      /\b(you\s+are\s+now|from\s+now\s+on\s+you|act\s+as\s+(?:if\s+you\s+are\s+)?(?:a\s+|an\s+)?(?:unrestricted|unfiltered|jailbroken|dan\b)|pretend\s+(?:you\s+are|to\s+be)|enter\s+(?:developer|debug|god)\s+mode|developer\s+mode\s+(?:enabled|on)|jailbreak|do\s+anything\s+now)\b/gi,
    why: "Tries to replace the model's role so that its constraints no longer appear to apply to it.",
  },
  // 3. system prompt exfiltration
  {
    id: "exfil-system-prompt",
    class: "System prompt exfiltration",
    severity: "high",
    weight: 26,
    pattern:
      /\b((?:print|reveal|show|output|repeat|display|dump|disclose|tell\s+me)\s+(?:me\s+)?(?:your|the)\s+(?:full\s+|complete\s+|entire\s+|initial\s+|original\s+)?(?:system\s+prompt|instructions?|rules?|configuration|guidelines|prompt)|repeat\s+(?:the\s+)?(?:text|everything)\s+above|what\s+(?:are|were)\s+your\s+(?:original\s+)?instructions)\b/gi,
    why: "Extracting the system prompt is reconnaissance — it tells an attacker exactly which constraints to target next.",
  },
  // 4. tool abuse
  {
    id: "tool-abuse-destructive",
    class: "Tool abuse",
    severity: "high",
    weight: 32,
    pattern:
      /\b(rm\s+-rf\s+\S+|drop\s+(?:table|database)\b|truncate\s+table\b|delete\s+from\s+\w+(?:\s+where\s+1\s*=\s*1)?|sudo\s+\w+|chmod\s+777|shutdown\s+-|mkfs\b|:\(\)\{.*\};:)/gi,
    why: "A destructive command in untrusted text is an attempt to have your agent execute it through a shell or database tool.",
  },
  {
    id: "tool-abuse-exfil-action",
    class: "Tool abuse",
    severity: "high",
    weight: 28,
    pattern:
      /\b(use\s+the\s+\w+\s+tool\s+to|send\s+(?:an?\s+)?(?:email|message)\s+to\s+\S+@|forward\s+(?:the\s+)?(?:customer|user|client)?\s*(?:database|data|records?|list)\s+to|POST\s+(?:the\s+)?\w+\s+to\s+https?:\/\/|exfiltrate|curl\s+-X?\s*POST\s+https?:\/\/)/gi,
    why: "Directs your agent to take an action that moves data outward. This is where injection turns into a breach.",
  },
  // 5. delimiter injection
  {
    id: "delimiter-injection",
    class: "Delimiter injection",
    severity: "high",
    weight: 22,
    pattern: /(<\|im_(?:start|end)\|>|<\|(?:endoftext|system|user|assistant)\|>|\[\/?INST\]|<\/?(?:system|assistant|user)>|###\s*(?:system|instruction)s?\s*:)/gi,
    why: "Chat-template control tokens inside content let an attacker forge a message boundary and impersonate the system or assistant role.",
  },
  {
    id: "role-label-spoof",
    class: "Delimiter injection",
    severity: "medium",
    weight: 14,
    pattern: /^\s*(system|assistant|developer)\s*:\s*\S/gim,
    why: "A line beginning with a role label can be read as a genuine turn boundary once concatenated into a prompt.",
  },
  // 6. encoding evasion
  {
    id: "zero-width",
    class: "Encoding evasion",
    severity: "medium",
    weight: 18,
    pattern: /[\u200b-\u200f\u202a-\u202e\u2060-\u2064\ufeff]/g,
    why: "Zero-width and bidirectional control characters hide instructions from human reviewers while the model still reads them.",
  },
  {
    id: "base64-blob",
    class: "Encoding evasion",
    severity: "medium",
    weight: 12,
    pattern: /\b[A-Za-z0-9+/]{60,}={0,2}\b/g,
    why: "A long base64 blob in prose is often an encoded instruction intended to bypass literal pattern matching.",
  },
  {
    id: "decode-and-follow",
    class: "Encoding evasion",
    severity: "high",
    weight: 22,
    pattern: /\b(decode\s+(?:the\s+)?(?:following|this|below)|base64\s*(?:decode|:)|rot13|from\s+hex)\b[\s\S]{0,40}\b(and|then)\s+(follow|execute|do|run|obey)\b/gi,
    why: "Explicitly asks the model to decode content and then act on it, which defeats any check that only reads the literal text.",
  },
  // 7. markdown exfiltration channel
  {
    id: "markdown-image-exfil",
    class: "Markdown exfiltration",
    severity: "high",
    weight: 24,
    pattern: /!\[[^\]]*\]\(\s*https?:\/\/[^)\s]*[?&][^)\s]*=[^)\s]*\)/gi,
    why: "A markdown image with a query string is a data exfiltration channel: rendering the image sends whatever the model interpolated into the URL to the attacker's server.",
  },
  // 8. non-English override
  {
    id: "override-non-english",
    class: "Non-English override",
    severity: "high",
    weight: 22,
    pattern:
      /\b(ignora\s+(?:todas\s+)?las\s+instrucciones|ignorez\s+(?:toutes\s+)?les\s+instructions|ignoriere\s+(?:alle\s+)?(?:vorherigen\s+)?anweisungen|ignore\s+todas\s+as\s+instruções|पिछले\s+निर्देश|निर्देशों\s+को\s+अनदेखा)/gi,
    why: "The same override attack in another language. Filters written only in English miss these entirely.",
  },
  // 9. authority spoofing
  {
    id: "authority-spoof",
    class: "Authority spoofing",
    severity: "medium",
    weight: 16,
    pattern:
      /\b(as\s+(?:the\s+)?(?:developer|admin|administrator|owner|openai|anthropic)\s*,?\s*i\s+(?:authori[sz]e|permit|allow|instruct)|this\s+is\s+(?:an?\s+)?(?:authori[sz]ed|approved|official)\s+(?:request|override)|security\s+override\s+code)\b/gi,
    why: "Claims of authority the channel cannot verify. Untrusted input has no way to prove it comes from an operator.",
  },
];

// ---------------------------------------------------------------------------
// PII and secret redaction. Validated where a checksum exists, so a 12-digit
// order reference is not reported as a national ID.
// ---------------------------------------------------------------------------

function luhnValid(digits: string): boolean {
  const d = digits.replace(/\D/g, "");
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = d.length - 1; i >= 0; i -= 1) {
    let n = Number(d[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
}

/** Verhoeff checksum — the algorithm Aadhaar numbers actually use. */
function verhoeffValid(digits: string): boolean {
  const d = digits.replace(/\D/g, "");
  if (d.length !== 12) return false;

  const dTable = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
  ];
  const pTable = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
  ];
  const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

  let c = 0;
  const reversed = d.split("").reverse().map(Number);
  for (let i = 0; i < reversed.length; i += 1) {
    c = dTable[c][pTable[i % 8][reversed[i]]];
  }
  return inv[c] === 0 ? c === 0 : c === 0;
}

type PiiRule = {
  type: string;
  severity: Severity;
  weight: number;
  pattern: RegExp;
  validate?: (match: string) => boolean;
  note: string;
};

const PII_RULES: PiiRule[] = [
  {
    type: "PRIVATE_KEY",
    severity: "high",
    weight: 30,
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
    note: "A private key in text forwarded to a model provider must be treated as compromised.",
  },
  {
    type: "API_KEY",
    severity: "high",
    weight: 28,
    pattern: /\b(sk-[A-Za-z0-9]{20,}|sk-ant-[A-Za-z0-9-]{20,}|ghp_[A-Za-z0-9]{30,}|gho_[A-Za-z0-9]{30,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{30,})\b/g,
    note: "A live provider credential. Rotate it, do not just redact it.",
  },
  {
    type: "JWT",
    severity: "high",
    weight: 20,
    pattern: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g,
    note: "A bearer token. Anyone who reads it can impersonate the subject until it expires.",
  },
  {
    type: "CARD",
    severity: "high",
    weight: 24,
    pattern: /\b(?:\d[ -]?){13,19}\b/g,
    validate: (m) => luhnValid(m),
    note: "Luhn-valid card number. Forwarding this to a third-party model is very likely a PCI-DSS problem.",
  },
  {
    type: "AADHAAR",
    severity: "high",
    weight: 24,
    pattern: /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
    validate: (m) => verhoeffValid(m),
    note: "Verhoeff-valid Aadhaar number. Under the DPDP Act this is personal data requiring a lawful basis and safeguards.",
  },
  {
    type: "PAN",
    severity: "medium",
    weight: 14,
    pattern: /\b[A-Z]{5}\d{4}[A-Z]\b/g,
    note: "Indian PAN. Personal or entity tax identifier.",
  },
  {
    type: "IBAN",
    severity: "medium",
    weight: 14,
    pattern: /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g,
    note: "Bank account identifier.",
  },
  {
    type: "EMAIL",
    severity: "low",
    weight: 6,
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    note: "Email address — usually the identifier that links every other record together.",
  },
  {
    type: "PHONE_IN",
    severity: "low",
    weight: 6,
    pattern: /(?:\+91[\s-]?)?\b[6-9]\d{4}[\s-]?\d{5}\b/g,
    note: "Indian mobile number.",
  },
  {
    type: "PHONE_INTL",
    severity: "low",
    weight: 5,
    pattern: /\+\d{1,3}[\s-]?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}\b/g,
    note: "International phone number.",
  },
  {
    type: "IP",
    severity: "low",
    weight: 4,
    pattern: /\b(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\b/g,
    note: "IP address — personal data in the EU when linkable to an individual.",
  },
  {
    type: "IFSC",
    severity: "low",
    weight: 5,
    pattern: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
    note: "Indian bank branch code, usually adjacent to an account number.",
  },
];

function excerpt(s: string, max = 90): string {
  const flat = s.replace(/\s+/g, " ").trim();
  return flat.length <= max ? flat : `${flat.slice(0, max - 1)}…`;
}

export function run(input: RunInput): RunResult {
  const original = input.text ?? "";
  if (original.trim().length < 5) throw new Error("Paste the text your agent is about to read.");

  const policy: Policy = (["Strict", "Balanced", "Permissive"] as Policy[]).includes(input.policy as Policy)
    ? (input.policy as Policy)
    : "Balanced";

  // ---- injection detection --------------------------------------------------
  const detections: Detection[] = [];
  for (const rule of RULES) {
    const matches = [...original.matchAll(rule.pattern)];
    if (matches.length === 0) continue;
    // One detection per rule; the count goes in the span summary so a repeated
    // attack does not inflate the score linearly.
    const first = matches[0][0];
    detections.push({
      class: rule.class,
      rule: rule.id,
      severity: rule.severity,
      weight: rule.weight + Math.min(10, (matches.length - 1) * 3),
      span:
        rule.id === "zero-width"
          ? `${matches.length} hidden control character${matches.length === 1 ? "" : "s"}`
          : `${excerpt(first)}${matches.length > 1 ? `  (+${matches.length - 1} more)` : ""}`,
      why: rule.why,
    });
  }

  // ---- PII / secret detection and redaction --------------------------------
  let redacted = original;
  const piiFound: { type: string; count: number; severity: Severity; note: string; samples: string[] }[] = [];
  let piiWeight = 0;

  for (const rule of PII_RULES) {
    const raw = [...original.matchAll(rule.pattern)].map((m) => m[0]);
    const valid = rule.validate ? raw.filter((m) => rule.validate!(m)) : raw;
    const unique = [...new Set(valid)];
    if (unique.length === 0) continue;

    piiWeight += rule.weight + Math.min(12, (unique.length - 1) * 3);
    piiFound.push({
      type: rule.type,
      count: unique.length,
      severity: rule.severity,
      note: rule.note,
      samples: unique.slice(0, 3).map((v) => `${v.slice(0, 4)}${"•".repeat(Math.max(0, Math.min(8, v.length - 6)))}${v.slice(-2)}`),
    });

    unique.forEach((value, i) => {
      const token = `[${rule.type}_${i + 1}]`;
      redacted = redacted.split(value).join(token);
    });
  }

  // ---- sanitised copy -------------------------------------------------------
  const sanitised = redacted
    .replace(/[\u200b-\u200f\u202a-\u202e\u2060-\u2064\ufeff]/g, "")
    .replace(/<\|/g, "&lt;|")
    .replace(/\|>/g, "|&gt;")
    .replace(/\[\/?INST\]/gi, (m) => m.replace("[", "&#91;"))
    .replace(/^(\s*)(system|assistant|developer)(\s*:)/gim, "$1[untrusted-$2]$3")
    .replace(/<\/?(system|assistant|user)>/gi, (m) => m.replace("<", "&lt;"));

  // ---- scoring and verdict --------------------------------------------------
  const injectionWeight = detections.reduce((s, d) => s + d.weight, 0);
  const risk = Math.min(100, Math.round(injectionWeight + piiWeight * 0.6));

  const highInjections = detections.filter((d) => d.severity === "high");
  const mediumInjections = detections.filter((d) => d.severity === "medium");
  const highPii = piiFound.filter((p) => p.severity === "high");

  const thresholds: Record<Policy, { block: number; review: number }> = {
    Strict: { block: 20, review: 8 },
    Balanced: { block: 40, review: 18 },
    Permissive: { block: 101, review: 40 },
  };
  const t = thresholds[policy];
  const verdict: Verdict =
    policy === "Permissive"
      ? risk >= t.review
        ? "review"
        : "allow"
      : risk >= t.block
        ? "block"
        : risk >= t.review
          ? "review"
          : "allow";

  const band = verdict === "block" ? "bad" : verdict === "review" ? "warn" : "good";

  const classes = [...new Set(detections.map((d) => d.class))];

  const headline =
    verdict === "block"
      ? `BLOCK — risk ${risk}/100 under the ${policy} policy. ${detections.length} injection detection${detections.length === 1 ? "" : "s"} across ${classes.length} class${classes.length === 1 ? "" : "es"}${highPii.length > 0 ? ` and ${highPii.length} high-sensitivity data type${highPii.length === 1 ? "" : "s"}` : ""}. Do not pass this to the model.`
      : verdict === "review"
        ? `REVIEW — risk ${risk}/100 under the ${policy} policy. ${detections.length} detection${detections.length === 1 ? "" : "s"} found. Safe to proceed with the redacted text if the agent has no write access.`
        : `ALLOW — risk ${risk}/100 under the ${policy} policy. No injection patterns matched${piiFound.length > 0 ? `, though ${piiFound.length} data type${piiFound.length === 1 ? "" : "s"} were redacted` : ""}.`;

  const toItems = (list: Detection[]): ResultItem[] =>
    list.map((d) => ({
      title: `${d.class} — ${d.rule}`,
      body: `Matched: "${d.span}"\n\n${d.why}`,
      severity: d.severity,
      tag: `weight ${d.weight}`,
    }));

  return {
    headline,
    score: { label: `Risk score (${policy} policy)`, value: risk, max: 100, band },
    metrics: [
      { label: "Verdict", value: verdict.toUpperCase(), hint: `${policy} policy` },
      { label: "Injection detections", value: String(detections.length), hint: `${highInjections.length} high severity` },
      { label: "Data types redacted", value: String(piiFound.length), hint: `${piiFound.reduce((s, p) => s + p.count, 0)} values` },
      { label: "Attack classes", value: String(classes.length), hint: `${RULES.length} rules run` },
    ],
    sections: [
      { title: `High severity injections (${highInjections.length})`, items: toItems(highInjections) },
      { title: `Medium severity injections (${mediumInjections.length})`, items: toItems(mediumInjections) },
      {
        title: `Sensitive data found (${piiFound.length} type${piiFound.length === 1 ? "" : "s"})`,
        items: piiFound.map((p) => ({
          title: `${p.type} × ${p.count}`,
          body: `${p.note}\n\nMasked sample: ${p.samples.join(", ")}. Replaced with [${p.type}_n] tokens in the redacted output.`,
          severity: p.severity,
          tag: p.severity === "high" ? "rotate / do not forward" : "redacted",
        })),
      },
      {
        title: "What to do next",
        items: [
          {
            title: verdict === "block" ? "Drop the request" : verdict === "review" ? "Proceed with the redacted text only" : "Safe to proceed",
            body:
              verdict === "block"
                ? "Return an error to the caller and log the detections. Do not pass any part of this text to the model, including as 'context to ignore' — that does not work."
                : verdict === "review"
                  ? "Use the redacted output, and confirm the agent handling it has no write or send capability. If it does, treat this as a block."
                  : "Use the redacted output so the model never sees raw identifiers, and keep the token mapping on your side.",
            severity: verdict === "block" ? "high" : verdict === "review" ? "medium" : undefined,
          },
          {
            title: "This is one layer, not the whole defence",
            body:
              "Rules catch the known classes and cannot themselves be injected, but no detector catches everything. Keep tool permissions minimal, require confirmation for irreversible actions, and never let untrusted text reach a tool that can send or delete.",
          },
        ],
      },
    ],
    copyBlocks: [
      { title: "Redacted text — safe to send to the model", text: redacted },
      { title: "Sanitised text — delimiters neutralised, hidden characters stripped", text: sanitised },
    ],
    json: {
      policy,
      verdict,
      riskScore: risk,
      thresholds: t,
      summary: {
        injectionDetections: detections.length,
        highSeverityInjections: highInjections.length,
        attackClasses: classes,
        rulesRun: RULES.length,
        piiTypesFound: piiFound.length,
        piiValuesRedacted: piiFound.reduce((s, p) => s + p.count, 0),
      },
      detections: detections.map((d) => ({ class: d.class, rule: d.rule, severity: d.severity, weight: d.weight, span: d.span })),
      sensitiveData: piiFound.map((p) => ({ type: p.type, count: p.count, severity: p.severity })),
      redactedText: redacted,
      sanitisedText: sanitised,
      originalLength: original.length,
    },
  };
}
