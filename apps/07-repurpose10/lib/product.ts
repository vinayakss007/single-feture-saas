import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "repurpose10",
  name: "Repurpose10",
  tagline: "One thing you wrote becomes ten platform-native posts",
  oneLiner:
    "Paste a blog post, a newsletter or a transcript and get ten posts written for how each platform actually behaves — X thread, LinkedIn, Instagram, YouTube, Reddit, Quora and more, each inside its real character limit.",
  category: "Content marketing",
  audience: "Solo creators, content teams and agencies",
  accent: "#db2777",
  accentSoft: "#fdf2f8",

  metrics: [
    { value: "10", label: "Platform-native formats per input" },
    { value: "0", label: "Posts that exceed a platform limit" },
    { value: "~40 min", label: "Manual reformatting avoided per piece" },
  ],

  problem: [
    {
      title: "The same text pasted everywhere",
      body:
        "A LinkedIn post dropped into X gets truncated. An X thread dropped into LinkedIn looks like a ransom note. Cross-posting the identical text is why most repurposing gets no reach.",
    },
    {
      title: "Reformatting is 40 minutes of nothing",
      body:
        "Counting characters, restructuring hooks, moving the link out of the body, adding line breaks. Real work with zero creative value.",
    },
    {
      title: "The best line stays buried",
      body:
        "Every long piece has one sentence that would work as a hook. It is almost never the first sentence, and it almost never gets promoted.",
    },
  ],

  features: [
    {
      title: "Ten real formats",
      body:
        "X thread and single post, LinkedIn, Instagram caption, YouTube title and description, newsletter intro, Reddit, Quora, Threads and a WhatsApp broadcast.",
    },
    {
      title: "Hooks ranked, not guessed",
      body:
        "Every sentence is scored for hook strength — numbers, contrast, tension, brevity — and the winner leads the posts that need one.",
    },
    {
      title: "Limits enforced, not suggested",
      body:
        "Each output is generated inside the platform's actual limit and the character count is shown against it. Nothing gets silently truncated at publish time.",
    },
    {
      title: "Platform conventions respected",
      body:
        "Links go in the first comment for LinkedIn, hashtags at the end for Instagram, no hashtags at all for Reddit, a question framing for Quora.",
    },
    {
      title: "Your words, restructured",
      body:
        "Sentences come from your input rather than being paraphrased by a model, so the voice stays yours and nothing factual gets invented.",
    },
    {
      title: "A posting order that makes sense",
      body:
        "Suggested sequence and spacing across the week, so ten posts from one piece do not all land on the same morning.",
    },
  ],

  how: [
    "Paste the long piece — blog post, newsletter, webinar transcript, documentation page or a voice-note transcript.",
    "Repurpose10 extracts the key points, ranks the candidate hooks, and writes each format inside its platform's real constraints.",
    "Copy each post, or POST from FlowForge so every new blog publish fans out into a filled content calendar automatically.",
  ],

  integrations: ["FlowForge", "TechAbet CMS", "Agent Fleet", "Buffer", "Notion", "Google Sheets", "Zapier / n8n"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "For the creator publishing once a week.",
      features: ["Unlimited repurposing", "All 10 formats", "Hook ranking", "Character-limit enforcement"],
      cta: "Repurpose something",
    },
    {
      name: "Creator",
      price: "$29",
      period: "/mo",
      blurb: "For a content team shipping weekly.",
      features: [
        "REST API + MCP server access",
        "Auto-fan-out on CMS publish",
        "Brand voice presets",
        "Custom format library",
        "Scheduling handoff to Buffer",
      ],
      cta: "Start 14-day trial",
      highlight: true,
    },
    {
      name: "Agency",
      price: "Custom",
      period: "",
      blurb: "For agencies running many client calendars.",
      features: [
        "Self-hosted Docker image",
        "Per-client voice and format profiles",
        "White-label API",
        "SSO and audit log",
        "SLA and shared Slack channel",
      ],
      cta: "Talk to us",
    },
  ],

  faq: [
    {
      q: "Does it rewrite my words with AI?",
      a: "No. It selects, ranks and restructures the sentences you wrote. That is deliberate — a model rewriting your copy is how a distinctive voice turns into the same beige paragraph everyone else is publishing, and how facts get quietly invented.",
    },
    {
      q: "Which ten formats?",
      a: "X thread, X single post, LinkedIn post, Instagram caption, YouTube title and description, newsletter intro, Reddit post, Quora answer, Threads post, and a WhatsApp or Telegram broadcast.",
    },
    {
      q: "How long should my input be?",
      a: "At least 150 words. Around 800 to 2,000 words gives the best results, because there are enough distinct points to fill ten formats without repeating.",
    },
    {
      q: "Are the character counts accurate?",
      a: "Yes, and each output shows its count against the platform limit. X counts links as 23 characters, which is accounted for.",
    },
    {
      q: "Can it handle a transcript?",
      a: "Yes. Filler words and speaker labels are stripped before the key points are extracted.",
    },
    {
      q: "Can this run automatically on publish?",
      a: "Yes. Point a webhook from your CMS at the REST endpoint, or let an Agent Fleet worker call it via MCP and drop the results into your scheduling tool.",
    },
  ],

  inputs: [
    {
      name: "content",
      label: "Your long-form content",
      type: "textarea",
      rows: 16,
      required: true,
      placeholder: "Paste your blog post, newsletter or transcript…",
      help: "At least 150 words. 800 to 2,000 words works best.",
    },
    {
      name: "link",
      label: "Link to the original",
      type: "text",
      placeholder: "https://abetworks.in/blog/dispatch-data-entry",
      help: "Placed where each platform actually rewards it.",
    },
    {
      name: "audience",
      label: "Who it is for",
      type: "text",
      placeholder: "operations leaders at mid-size logistics companies",
      help: "Used in the Quora and Reddit framing.",
    },
  ],

  sample: {
    link: "https://abetworks.in/blog/dispatch-data-entry",
    audience: "operations leaders at mid-size logistics companies",
    content: `The hidden cost of manual data entry in logistics

Most logistics companies think their biggest operational cost is fuel or drivers. It is not. For mid-size firms, the largest recoverable cost is the time coordinators spend moving data between systems that do not talk to each other.

We measured this across 40 dispatch operations last year. The average coordinator spends 6 hours a week re-entering information that already exists somewhere else. At 14 coordinators, that is 84 hours a week, or roughly 320,000 dollars a year in loaded time.

Nobody budgets for this because it never appears as a line item. It is spread across every person's day in 20-minute slices.

The second problem is error rate. Manual re-entry introduces mistakes in about 3 percent of records. In dispatch, a wrong address or a wrong weight does not stay a data problem for long. It becomes a failed delivery, a customer call, and a credit note.

Three things change this. First, stop treating integration as an IT project. The systems do not need to merge, they need to hand off cleanly at four or five specific points. Second, measure the re-entry time before you buy anything, because the number is always worse than people guess. Third, automate the highest-volume handoff first rather than attempting everything at once.

The companies that fixed this did not buy a bigger ERP. They removed five specific handoffs and gave their coordinators back most of a day each week.

What surprised us most was the retention effect. Coordinators do not quit because the work is hard. They quit because the work is stupid. Removing the stupid work reduced turnover in that role by nearly half.`,
  },

  mcpTool: {
    name: "repurpose10_fan_out",
    description:
      "Turn one long-form piece of content into ten platform-native posts. Returns an X thread, X single post, LinkedIn post, Instagram caption, YouTube title and description, newsletter intro, Reddit post, Quora answer, Threads post and a WhatsApp broadcast — each within the platform character limit, plus ranked hook candidates, extracted key points and a suggested posting schedule.",
  },
};
