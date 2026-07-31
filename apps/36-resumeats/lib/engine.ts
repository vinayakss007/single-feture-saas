import type { RunInput, RunResult, Severity } from "./types.ts";

/**
 * ResumeATS engine - Parses a resume the way an ATS would, scores it against
 * job description keywords, and flags issues that cause silent rejection.
 */

// Strong action verbs that ATS/recruiters value
const STRONG_VERBS = new Set([
  "led", "built", "designed", "developed", "implemented", "launched", "created",
  "increased", "decreased", "reduced", "improved", "optimized", "managed",
  "delivered", "architected", "scaled", "automated", "migrated", "established",
  "negotiated", "achieved", "generated", "drove", "spearheaded", "transformed",
  "streamlined", "pioneered", "orchestrated", "resolved", "accelerated",
]);

// Weak verbs/phrases that signal passive language
const WEAK_PHRASES = [
  "responsible for", "helped with", "assisted in", "was part of",
  "involved in", "participated in", "contributed to", "worked on",
  "handled", "attended", "familiar with", "exposure to",
];

// Buzzwords without substance
const BUZZWORDS = [
  "results-driven", "team player", "hard worker", "self-starter",
  "detail-oriented", "passionate", "synergy", "leverage", "proactive",
  "dynamic", "go-getter", "think outside the box", "guru", "ninja",
  "rockstar", "visionary", "strategic thinker",
];

// Standard ATS sections in expected order
const EXPECTED_SECTIONS = [
  "contact", "summary", "experience", "education", "skills", "certifications",
];

const SECTION_PATTERNS: Record<string, RegExp> = {
  contact: /^(contact|personal)\s*(info|information|details)?$/i,
  summary: /^(professional\s+)?(summary|profile|objective|about(\s+me)?|overview)$/i,
  experience: /^(professional\s+|work\s+)?(experience|employment|work\s+history|career)$/i,
  education: /^(education|academic|qualifications?|degrees?)$/i,
  skills: /^(technical\s+|core\s+|key\s+)?(skills|competencies|technologies|tech\s+stack|proficiency)$/i,
  certifications: /^(certifications?|licenses?|credentials?|professional\s+development)$/i,
};

function extractKeywords(text: string): string[] {
  // Extract meaningful words (3+ chars), lowercased, deduplicated
  const words = text.toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3)
    .filter((w) => !STOP_WORDS.has(w));
  return [...new Set(words)];
}

function extractPhrases(text: string): string[] {
  // Extract 2-3 word phrases that matter for matching
  const words = text.toLowerCase().replace(/[^a-z0-9+#./\s-]/g, " ").split(/\s+/).filter((w) => w.length >= 2);
  const phrases: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    if (!STOP_WORDS.has(words[i]) || !STOP_WORDS.has(words[i + 1])) {
      phrases.push(`${words[i]} ${words[i + 1]}`);
    }
    if (i < words.length - 2) {
      phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }
  }
  return [...new Set(phrases)];
}

const STOP_WORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "had",
  "her", "was", "one", "our", "out", "has", "have", "been", "will",
  "with", "this", "that", "from", "they", "would", "make", "like",
  "just", "over", "such", "take", "than", "them", "very", "some",
  "into", "most", "other", "which", "their", "about", "also", "back",
  "after", "should", "could", "where", "those", "these", "being",
  "through", "more", "what", "when", "your", "each", "does", "how",
]);

function detectSections(lines: string[]): { name: string; startLine: number; content: string }[] {
  const sections: { name: string; startLine: number; content: string }[] = [];
  let currentSection = "contact"; // first lines before any header are contact
  let currentStart = 0;
  const sectionLines: string[][] = [[]];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check if this line is a section header
    const cleanLine = line.replace(/[:\-=_|*#]/g, "").trim();
    let matched = false;
    for (const [sectionName, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(cleanLine)) {
        // Save previous section
        sections.push({
          name: currentSection,
          startLine: currentStart,
          content: sectionLines[sectionLines.length - 1].join("\n"),
        });
        currentSection = sectionName;
        currentStart = i;
        sectionLines.push([]);
        matched = true;
        break;
      }
    }
    if (!matched) {
      // Also detect section headers by ALL CAPS or underlined patterns
      if (line === line.toUpperCase() && line.length > 3 && line.length < 40 && /[A-Z]/.test(line)) {
        const cleanUpper = line.replace(/[:\-=_|*#]/g, "").trim();
        for (const [sectionName, pattern] of Object.entries(SECTION_PATTERNS)) {
          if (pattern.test(cleanUpper)) {
            sections.push({
              name: currentSection,
              startLine: currentStart,
              content: sectionLines[sectionLines.length - 1].join("\n"),
            });
            currentSection = sectionName;
            currentStart = i;
            sectionLines.push([]);
            matched = true;
            break;
          }
        }
      }
    }
    if (!matched) {
      sectionLines[sectionLines.length - 1].push(line);
    }
  }
  // Push final section
  sections.push({
    name: currentSection,
    startLine: currentStart,
    content: sectionLines[sectionLines.length - 1].join("\n"),
  });

  return sections.filter((s) => s.content.trim().length > 0);
}

function detectDates(text: string): { start: string; end: string; line: string }[] {
  const datePattern = /(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4}|((?:19|20)\d{2}))\s*[-–to]+\s*(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4}|((?:19|20)\d{2})|present|current|ongoing|now)/gi;
  const results: { start: string; end: string; line: string }[] = [];
  const lines = text.split("\n");
  for (const line of lines) {
    let match;
    while ((match = datePattern.exec(line)) !== null) {
      const full = match[0];
      const parts = full.split(/[-–]|to/i).map((s) => s.trim());
      results.push({ start: parts[0] || "", end: parts[1] || "present", line: line.trim() });
    }
  }
  return results;
}

function hasEmail(text: string): boolean {
  return /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
}

function hasPhone(text: string): boolean {
  return /(\+?\d{1,3}[-.\s]?)?\(?\d{2,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/.test(text);
}

function countQuantifiedBullets(text: string): { quantified: number; total: number } {
  const lines = text.split("\n").filter((l) => /^[\s]*[-*•]/.test(l) || /^\s*\d+\./.test(l) || /^-/.test(l.trim()));
  // Also count lines that start with action verbs as bullet-like
  const bulletLines = text.split("\n").filter((l) => {
    const t = l.trim();
    return t.startsWith("-") || t.startsWith("*") || t.startsWith("•") || /^\d+\./.test(t);
  });
  const allBullets = bulletLines.length > 0 ? bulletLines : text.split("\n").filter((l) => l.trim().length > 20);
  const quantified = allBullets.filter((l) => /\d+[%$kKmM]|\d+,\d+|\d+\+|(\d+\s*(percent|million|thousand|users|clients|engineers|developers|team))/i.test(l));
  return { quantified: quantified.length, total: allBullets.length };
}

function assessLength(text: string): { wordCount: number; assessment: string; severity: Severity } {
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
  if (wordCount < 150) return { wordCount, assessment: "Too short. Under 150 words suggests missing detail. Most ATS-passing resumes are 400-800 words.", severity: "high" };
  if (wordCount < 300) return { wordCount, assessment: "Somewhat short at " + wordCount + " words. Consider adding quantified achievements.", severity: "medium" };
  if (wordCount > 1200) return { wordCount, assessment: "Very long at " + wordCount + " words. ATS systems process it fine but recruiters spend 6 seconds scanning. Consider trimming to 600-800 words.", severity: "medium" };
  if (wordCount > 800) return { wordCount, assessment: "Slightly long at " + wordCount + " words but within acceptable range.", severity: "low" };
  return { wordCount, assessment: "Good length at " + wordCount + " words. Within the 400-800 word sweet spot.", severity: "low" };
}

export function run(input: RunInput): RunResult {
  const resumeText = (input.resume ?? "").trim();
  const jdText = (input.jobDescription ?? "").trim();
  const targetRole = (input.targetRole ?? "").trim();

  if (!resumeText) throw new Error("Paste your resume text to get an ATS analysis. Plain text works best - copy from your document.");
  if (resumeText.length < 100) throw new Error("Resume text is too short for meaningful analysis. Paste your full resume (at least the experience and skills sections).");
  if (!jdText) throw new Error("Paste the job description or target keywords to compute a match score. Without it, there is nothing to match against.");
  if (jdText.length < 30) throw new Error("Job description is too short. Paste the full JD or at least list 5-10 required skills.");

  const lines = resumeText.split("\n");

  // --- Section Detection ---
  const detectedSections = detectSections(lines);
  const detectedNames = detectedSections.map((s) => s.name);
  const missingSections = EXPECTED_SECTIONS.filter((s) => !detectedNames.includes(s));
  const sectionOrder = EXPECTED_SECTIONS.filter((s) => detectedNames.includes(s));
  const actualOrder = detectedNames.filter((s) => EXPECTED_SECTIONS.includes(s));
  const orderCorrect = JSON.stringify(sectionOrder) === JSON.stringify(actualOrder);

  // --- Contact Info ---
  const contactSection = detectedSections.find((s) => s.name === "contact")?.content || lines.slice(0, 5).join("\n");
  const emailFound = hasEmail(contactSection) || hasEmail(resumeText.slice(0, 500));
  const phoneFound = hasPhone(contactSection) || hasPhone(resumeText.slice(0, 500));

  // --- Keyword Match ---
  const jdKeywords = extractKeywords(jdText);
  const resumeKeywords = extractKeywords(resumeText);
  const resumeKeywordSet = new Set(resumeKeywords);

  const matchedKeywords = jdKeywords.filter((k) => resumeKeywordSet.has(k));
  const missingKeywords = jdKeywords.filter((k) => !resumeKeywordSet.has(k));
  const matchRate = jdKeywords.length > 0 ? Math.round((matchedKeywords.length / jdKeywords.length) * 100) : 0;

  // Phrase matching for multi-word terms
  const jdPhrases = extractPhrases(jdText);
  const resumeLower = resumeText.toLowerCase();
  const matchedPhrases = jdPhrases.filter((p) => resumeLower.includes(p));

  // --- Quantified Achievements ---
  const experienceSection = detectedSections.find((s) => s.name === "experience")?.content || resumeText;
  const { quantified, total } = countQuantifiedBullets(experienceSection);
  const quantifiedRate = total > 0 ? Math.round((quantified / total) * 100) : 0;

  // --- Action Verb Analysis ---
  const resumeWords = resumeText.toLowerCase().split(/\s+/);
  const strongVerbsUsed = resumeWords.filter((w) => STRONG_VERBS.has(w));
  const uniqueStrongVerbs = [...new Set(strongVerbsUsed)];

  const weakPhrasesFound = WEAK_PHRASES.filter((p) => resumeLower.includes(p));
  const buzzwordsFound = BUZZWORDS.filter((b) => resumeLower.includes(b));

  // --- Date/Gap Detection ---
  const dates = detectDates(resumeText);
  const gaps: string[] = [];
  if (dates.length >= 2) {
    for (let i = 0; i < dates.length - 1; i++) {
      // Simple gap detection: if end of one does not overlap start of next
      const endStr = dates[i].end.toLowerCase();
      if (endStr === "present" || endStr === "current" || endStr === "ongoing" || endStr === "now") continue;
    }
  }

  // Check for undated positions
  const expContent = detectedSections.find((s) => s.name === "experience")?.content || "";
  const expLines = expContent.split("\n").filter((l) => l.trim().length > 0);
  const roleLines = expLines.filter((l) => /\|/.test(l) || /at\s+/i.test(l) || /[-–]/.test(l));
  const undatedRoles = roleLines.filter((l) => !/\d{4}/.test(l));

  // --- Length Assessment ---
  const lengthAssess = assessLength(resumeText);

  // --- File Format Score (based on text characteristics) ---
  const hasSpecialChars = /[^\x00-\x7F]/.test(resumeText) && !/[₹€£]/.test(resumeText);
  const hasTablesOrColumns = /\t{2,}|\s{4,}\S+\s{4,}/.test(resumeText);
  let formatScore = 100;
  if (hasSpecialChars) formatScore -= 15;
  if (hasTablesOrColumns) formatScore -= 20;
  if (resumeText.includes("•")) formatScore -= 0; // bullets are fine
  if (/[|╔╗║]/.test(resumeText)) formatScore -= 25; // table characters
  formatScore = Math.max(0, formatScore);

  // --- Overall ATS Score ---
  let atsScore = 0;
  // Keyword match (40 points max)
  atsScore += Math.min(40, Math.round(matchRate * 0.4));
  // Section presence (15 points)
  const sectionPresenceRate = (EXPECTED_SECTIONS.length - missingSections.length) / EXPECTED_SECTIONS.length;
  atsScore += Math.round(sectionPresenceRate * 15);
  // Quantified achievements (15 points)
  atsScore += Math.min(15, Math.round(quantifiedRate * 0.15));
  // Contact info (10 points)
  if (emailFound) atsScore += 5;
  if (phoneFound) atsScore += 5;
  // Action verbs (10 points)
  atsScore += Math.min(10, uniqueStrongVerbs.length);
  // Format friendliness (10 points)
  atsScore += Math.round(formatScore * 0.1);

  const band = atsScore >= 70 ? "good" : atsScore >= 50 ? "warn" : "bad";

  // --- Build ATS-parsed view ---
  const parsedView = detectedSections.map((s) => {
    const sectionLabel = s.name.charAt(0).toUpperCase() + s.name.slice(1);
    return `[${sectionLabel}]\n${s.content}`;
  }).join("\n\n");

  // --- Flags ---
  const flags: { title: string; body: string; severity: Severity }[] = [];

  if (!emailFound) {
    flags.push({ title: "Missing email address", body: "No email detected in the first 5 lines. ATS systems extract contact info from the top of the resume. Without an email, the recruiter cannot reach you.", severity: "high" });
  }
  if (!phoneFound) {
    flags.push({ title: "Missing phone number", body: "No phone number detected. Many Indian recruiters prefer calling directly. Include a number with country code (+91).", severity: "high" });
  }
  if (missingSections.length > 0) {
    flags.push({ title: `Missing sections: ${missingSections.join(", ")}`, body: `ATS systems expect standard sections. Missing: ${missingSections.join(", ")}. Without these, content may be parsed into the wrong category or skipped entirely.`, severity: missingSections.includes("experience") || missingSections.includes("skills") ? "high" : "medium" });
  }
  if (!orderCorrect && detectedNames.length > 2) {
    flags.push({ title: "Non-standard section order", body: `Expected: ${EXPECTED_SECTIONS.join(" > ")}. Your order: ${actualOrder.join(" > ")}. While not fatal, standard order helps ATS parsers assign content correctly.`, severity: "low" });
  }
  if (undatedRoles.length > 0) {
    flags.push({ title: `${undatedRoles.length} role(s) without dates`, body: "Positions without dates are either skipped by ATS or assigned zero tenure. Always include month/year ranges.", severity: "medium" });
  }
  if (weakPhrasesFound.length > 0) {
    flags.push({ title: `Passive language detected (${weakPhrasesFound.length} instances)`, body: `Found: "${weakPhrasesFound.slice(0, 4).join('", "')}". Replace with active verbs: led, built, delivered, reduced. Passive language reduces ATS keyword scoring and makes achievements invisible.`, severity: "medium" });
  }
  if (buzzwordsFound.length > 0) {
    flags.push({ title: `Buzzwords without evidence (${buzzwordsFound.length})`, body: `Found: "${buzzwordsFound.slice(0, 4).join('", "')}". These are ignored by ATS keyword matching and annoy recruiters. Replace with specific achievements.`, severity: "low" });
  }
  if (quantifiedRate < 40 && total > 3) {
    flags.push({ title: `Low quantification rate (${quantifiedRate}%)`, body: `Only ${quantified} of ${total} bullet points contain numbers or metrics. Target 60%+. Numbers (grew revenue 40%, managed 8 engineers, reduced latency by 200ms) are what differentiate your resume.`, severity: "medium" });
  }
  if (matchRate < 50) {
    flags.push({ title: `Low keyword match rate (${matchRate}%)`, body: `Your resume matches only ${matchRate}% of job description keywords. Below 50% typically means automatic rejection. Add missing keywords where they genuinely apply.`, severity: "high" });
  }
  if (resumeLower.includes("objective") && !resumeLower.includes("summary")) {
    flags.push({ title: "Generic objective statement detected", body: "Objective statements are outdated. Replace with a Professional Summary that mirrors the job description language and highlights relevant achievements.", severity: "medium" });
  }

  // Top missing keywords to add
  const topMissing = missingKeywords
    .filter((k) => k.length > 3)
    .slice(0, 15);

  const headline = `ATS Match Score: ${atsScore}/100. Keyword match rate: ${matchRate}% (${matchedKeywords.length}/${jdKeywords.length} terms). ${quantified}/${total} bullets are quantified. ${flags.filter((f) => f.severity === "high").length} critical issues found.`;

  return {
    headline,
    score: {
      label: "ATS Compatibility",
      value: atsScore,
      max: 100,
      band,
    },
    metrics: [
      { label: "Keyword match", value: `${matchRate}%`, hint: `${matchedKeywords.length}/${jdKeywords.length} terms` },
      { label: "Quantified bullets", value: `${quantifiedRate}%`, hint: `${quantified} of ${total}` },
      { label: "Strong verbs", value: String(uniqueStrongVerbs.length), hint: uniqueStrongVerbs.slice(0, 5).join(", ") },
      { label: "Word count", value: String(lengthAssess.wordCount), hint: lengthAssess.assessment.split(".")[0] },
      { label: "Format score", value: `${formatScore}/100`, hint: "ATS text-friendliness" },
      { label: "Sections found", value: `${detectedNames.length}/6`, hint: detectedNames.join(", ") },
    ],
    sections: [
      {
        title: "Critical Flags",
        items: flags.filter((f) => f.severity === "high"),
      },
      {
        title: "Warnings",
        items: flags.filter((f) => f.severity === "medium"),
      },
      ...(flags.filter((f) => f.severity === "low").length > 0
        ? [{
            title: "Suggestions",
            items: flags.filter((f) => f.severity === "low"),
          }]
        : []),
      {
        title: "Missing Keywords (add these where they genuinely apply)",
        items: topMissing.length > 0 ? [{
          title: `${topMissing.length} job description terms not found in your resume`,
          body: topMissing.join(", "),
          severity: "medium" as Severity,
        }] : [{
          title: "Good keyword coverage",
          body: "No critical keywords missing from your resume.",
          severity: "low" as Severity,
        }],
      },
      {
        title: "Matched Keywords",
        items: [{
          title: `${matchedKeywords.length} terms matched`,
          body: matchedKeywords.slice(0, 30).join(", "),
          severity: "low" as Severity,
        }],
      },
      {
        title: "Length Assessment",
        items: [{ title: `${lengthAssess.wordCount} words`, body: lengthAssess.assessment, severity: lengthAssess.severity }],
      },
    ],
    table: {
      columns: ["Criteria", "Score", "Detail"],
      rows: [
        ["Keyword Match Rate", `${matchRate}%`, matchRate >= 75 ? "Strong match" : matchRate >= 50 ? "Moderate - add missing keywords" : "Low - significant keyword gaps"],
        ["Section Presence", `${detectedNames.length}/6`, missingSections.length === 0 ? "All sections found" : `Missing: ${missingSections.join(", ")}`],
        ["Section Order", orderCorrect ? "Correct" : "Non-standard", orderCorrect ? "Standard ATS-friendly order" : `Found: ${actualOrder.join(" > ")}`],
        ["Date Consistency", `${dates.length} ranges found`, undatedRoles.length > 0 ? `${undatedRoles.length} undated role(s)` : "All roles dated"],
        ["Quantified Achievements", `${quantifiedRate}%`, `${quantified} of ${total} bullets have metrics`],
        ["Action Verbs", `${uniqueStrongVerbs.length} used`, uniqueStrongVerbs.slice(0, 6).join(", ") || "None detected"],
        ["Length", `${lengthAssess.wordCount} words`, lengthAssess.assessment.split(".")[0]],
        ["Format Friendliness", `${formatScore}/100`, formatScore >= 80 ? "ATS-friendly text" : "Contains problematic formatting"],
      ],
    },
    copyBlocks: [
      {
        title: "ATS-Parsed View (what the system extracts)",
        text: parsedView,
        language: "text",
      },
    ],
    json: {
      atsScore,
      matchRate,
      matchedKeywords: matchedKeywords.slice(0, 50),
      missingKeywords: topMissing,
      sections: detectedNames,
      missingSections,
      sectionOrderCorrect: orderCorrect,
      quantifiedRate,
      quantifiedBullets: quantified,
      totalBullets: total,
      strongVerbs: uniqueStrongVerbs,
      weakPhrases: weakPhrasesFound,
      buzzwords: buzzwordsFound,
      contactInfo: { email: emailFound, phone: phoneFound },
      lengthAssessment: lengthAssess,
      formatScore,
      flags: flags.map((f) => ({ title: f.title, severity: f.severity })),
      targetRole: targetRole || null,
    },
  };
}
