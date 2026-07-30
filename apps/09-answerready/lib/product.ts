import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "answerready",
  name: "AnswerReady",
  tagline: "Find out whether AI search can actually read your site",
  oneLiner:
    "Enter a URL and see your site the way ChatGPT, Perplexity and Google AI Mode see it: which AI crawlers you block, whether your content survives without JavaScript, what structured data you expose, and the llms.txt you are missing.",
  category: "AI search optimisation",
  audience: "SEO owners, marketers and founders losing traffic to AI answers",
  accent: "#0d9488",
  accentSoft: "#f0fdfa",

  metrics: [
    { value: "18", label: "Answer-engine readiness checks" },
    { value: "7", label: "AI crawlers checked against your robots.txt" },
    { value: "2 files", label: "Generated for you — llms.txt and JSON-LD" },
  ],

  problem: [
    {
      title: "You are blocking the crawlers that matter now",
      body:
        "Plenty of sites added GPTBot to robots.txt in 2023 to protect their content. The result in 2026 is being invisible in the answers where buyers now start their research.",
    },
    {
      title: "Your content does not exist without JavaScript",
      body:
        "Most AI crawlers do not execute JavaScript. If your page is a client-rendered shell, the crawler sees an empty div and your competitor gets cited instead.",
    },
    {
      title: "Classic SEO audits do not check any of this",
      body:
        "Ranking tools measure backlinks and keywords. None of them tell you whether an answer engine can extract a quotable, attributable fact from your page.",
    },
  ],

  features: [
    {
      title: "AI crawler access audit",
      body:
        "Parses your robots.txt and reports, per crawler, whether GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot and Bytespider can reach the page.",
    },
    {
      title: "No-JavaScript content check",
      body:
        "Measures how much real text exists in the raw HTML. A low ratio means AI crawlers see a shell, and it tells you how much is actually missing.",
    },
    {
      title: "Structured data extraction",
      body:
        "Finds and validates your JSON-LD, lists the schema types you expose, and names the ones an answer engine would have expected to find.",
    },
    {
      title: "Quotability scoring",
      body:
        "Checks whether the page answers a question in the first hundred words, uses question-shaped headings, and offers lists or tables an engine can lift a fact from.",
    },
    {
      title: "llms.txt generated for you",
      body:
        "Produces a ready-to-deploy llms.txt based on what is actually on your site, so you are not guessing at the emerging convention.",
    },
    {
      title: "JSON-LD block generated for you",
      body:
        "Outputs a valid Organization and FAQPage block populated from your real page content. Paste it in and re-scan.",
    },
  ],

  how: [
    "Paste the URL of a page you want to be cited in AI answers — a product page, a guide or a comparison page.",
    "AnswerReady fetches the page, your robots.txt and your llms.txt, then runs eighteen readiness checks against what a non-JavaScript crawler would actually receive.",
    "Deploy the generated llms.txt and JSON-LD, fix the blockers, re-scan. Or wire it into CI so a regression never ships.",
  ],

  integrations: ["FlowForge", "TechAbet CMS", "Agent Fleet", "GitHub Actions", "Slack", "Google Search Console", "Zapier / n8n"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "Audit one page and see where you stand.",
      features: ["Unlimited single-page scans", "All 18 checks", "Generated llms.txt and JSON-LD", "No signup"],
      cta: "Scan a page",
    },
    {
      name: "Growth",
      price: "$39",
      period: "/mo",
      blurb: "For a marketing team that publishes regularly.",
      features: [
        "REST API + MCP server access",
        "Whole-sitemap crawl and scoring",
        "Weekly re-scan with change alerts",
        "Competitor comparison on the same checks",
        "CI gate on score regression",
      ],
      cta: "Start 14-day trial",
      highlight: true,
    },
    {
      name: "Agency",
      price: "Custom",
      period: "",
      blurb: "For agencies reporting on client visibility.",
      features: [
        "Self-hosted Docker image",
        "White-label client reports",
        "Bulk domain scanning",
        "SSO and audit log",
        "SLA and shared Slack channel",
      ],
      cta: "Talk to us",
    },
  ],

  faq: [
    {
      q: "What is llms.txt and does it actually do anything?",
      a: "It is a markdown file at your domain root that points AI systems at your most useful, canonical content — the same idea as robots.txt but for meaning rather than permission. Adoption is still growing, so treat it as cheap insurance rather than a guarantee. It costs you one file.",
    },
    {
      q: "Should I allow GPTBot and the other AI crawlers?",
      a: "That is a business decision and the report does not make it for you. If you sell something and want to be recommended, blocking them removes you from the recommendation. If your content is the product you sell, blocking may be correct. Either way you should know which choice you have currently made — most sites do not.",
    },
    {
      q: "Do AI crawlers really not run JavaScript?",
      a: "Most do not, and the ones that partially do are inconsistent about it. The safe assumption is that anything not present in the server response does not exist. That is why the check is on the raw HTML.",
    },
    {
      q: "Is this the same as SEO?",
      a: "It overlaps but the goal differs. Search optimisation aims for a ranked link. Answer-engine optimisation aims to be the quoted, attributed source inside a generated answer, which rewards extractable facts and structured data far more heavily.",
    },
    {
      q: "Can I check a whole site?",
      a: "The free tier is one page per scan. Sitemap-wide crawling is on the Growth plan, or you can loop the REST endpoint yourself.",
    },
    {
      q: "Can I run it in CI?",
      a: "Yes. Call the REST endpoint in a GitHub Action and fail the build if the readiness score drops. The MCP server also lets an agent scan, generate the files and open the pull request itself.",
    },
  ],

  inputs: [
    {
      name: "url",
      label: "Page URL",
      type: "url",
      required: true,
      placeholder: "https://example.com/guide",
      help: "Use a page you actually want cited in AI answers.",
    },
    {
      name: "intent",
      label: "What should this page be cited for",
      type: "text",
      placeholder: "best dispatch automation software for logistics",
      help: "Used to check whether the page answers that intent early enough.",
    },
  ],

  sample: {
    url: "https://vercel.com",
    intent: "best hosting platform for Next.js apps",
  },

  mcpTool: {
    name: "answerready_audit_page",
    description:
      "Audit a live page for AI search and answer-engine readiness. Fetches the page, robots.txt and llms.txt, then returns a 0-100 readiness score covering AI crawler access per bot, whether content is visible without JavaScript, JSON-LD structured data types present and missing, quotability signals, plus a generated llms.txt file and a generated JSON-LD block populated from the real page content.",
  },
};
