import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "pricepulse",
  name: "PricePulse",
  tagline: "Know the moment a competitor changes their pricing page",
  oneLiner:
    "Diff two snapshots of a competitor's pricing or feature page and get a classified change report: price moves, plans added or killed, features shifted between tiers, limits tightened — plus the sales response for each.",
  category: "Competitive intelligence",
  audience: "Product marketing, pricing owners and founders",
  accent: "#0891b2",
  accentSoft: "#ecfeff",

  metrics: [
    { value: "8", label: "Change types classified automatically" },
    { value: "1 line", label: "Of noise you have to read to spot a price move" },
    { value: "100%", label: "Deterministic — same input, same diff" },
  ],

  problem: [
    {
      title: "You find out from a lost deal",
      body:
        "A competitor drops their entry price or moves SSO down a tier. You hear about it three weeks later, in a deal review, as the reason you lost.",
    },
    {
      title: "Generic page monitors cry wolf",
      body:
        "Visual diff tools fire on a rotated testimonial and a changed copyright year. After a week of that, nobody opens the alerts.",
    },
    {
      title: "Nobody writes the response",
      body:
        "Even when the change is spotted, translating 'they added a $19 tier' into what a rep should say on a call never happens.",
    },
  ],

  features: [
    {
      title: "Price moves, in currency",
      body:
        "Detects every monetary value per plan and reports the direction and percentage of the move, not just that the text differs.",
    },
    {
      title: "Plan added or removed",
      body:
        "New tiers and killed tiers are called out explicitly, because those are strategy changes, not copy tweaks.",
    },
    {
      title: "Feature tier shifts",
      body:
        "When a feature moves between plans — SSO from Enterprise to Pro — you get told, since that is the change that reprices your whole deal.",
    },
    {
      title: "Limit and quota changes",
      body:
        "Seat caps, request limits, storage and trial length are tracked separately from prose, so tightening a quota never hides inside a paragraph.",
    },
    {
      title: "Noise suppressed by design",
      body:
        "Copyright years, testimonials, nav labels and whitespace are ignored. Only commercially meaningful lines are surfaced.",
    },
    {
      title: "A response per change",
      body:
        "Every detected change comes with the positioning move and the one-line answer a rep can use on the next call.",
    },
  ],

  how: [
    "Paste yesterday's snapshot of the competitor's pricing page and today's. Plain text copy-paste is enough — no HTML required.",
    "PricePulse extracts plans, prices, limits and feature placement from each, then classifies every difference by commercial impact.",
    "Read the report, or wire it into FlowForge: cron the page fetch, POST both snapshots nightly, and push high-impact changes to Slack.",
  ],

  integrations: ["FlowForge", "NuCRM", "Agent Fleet", "Slack", "Notion", "Zapier / n8n", "Google Sheets"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "Diff a competitor by hand when you remember to.",
      features: ["Unlimited manual diffs", "All 8 change classes", "Sales response per change", "No signup"],
      cta: "Run a diff",
    },
    {
      name: "Watch",
      price: "$39",
      period: "/mo",
      blurb: "For a product marketer tracking five competitors.",
      features: [
        "REST API + MCP server access",
        "Automated nightly diffs via FlowForge",
        "Slack alert on high-impact changes only",
        "Snapshot history and change timeline",
        "Up to 25 tracked pages",
      ],
      cta: "Start 14-day trial",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      blurb: "For teams where pricing is a board-level topic.",
      features: [
        "Self-hosted Docker image",
        "Custom change taxonomy and impact weights",
        "Battlecard generation per change",
        "SSO and audit log",
        "SLA and shared Slack channel",
      ],
      cta: "Talk to us",
    },
  ],

  faq: [
    {
      q: "Why do I paste snapshots instead of giving you a URL?",
      a: "Because the honest version of URL monitoring is a scheduler, and you probably already have one. The diff engine is the hard part and it is free here. Wire your own cron or FlowForge job to POST the two snapshots — that also means pages behind a login work fine.",
    },
    {
      q: "Does it work on feature comparison pages too?",
      a: "Yes. Feature-tier shifts are one of the eight change classes, and they are usually more commercially significant than a headline price change.",
    },
    {
      q: "How does it avoid false positives?",
      a: "Lines are normalised and filtered before comparison: years, dates, testimonial blocks, nav items, cookie banners and whitespace are dropped. A change only surfaces if it touches a price, a plan, a limit or a feature placement.",
    },
    {
      q: "Does it need an LLM?",
      a: "No. It is a deterministic parser and classifier, so the same pair of snapshots always yields the same report and there is no per-call cost.",
    },
    {
      q: "Can it handle currencies other than USD?",
      a: "Yes — dollar, rupee, euro, pound and generic numeric pricing with a period suffix are all parsed, including lakh and crore notation.",
    },
    {
      q: "Can my agents use it?",
      a: "Yes. The MCP server exposes the diff as a tool so an Agent Fleet worker can fetch, diff and write a battlecard update itself.",
    },
  ],

  inputs: [
    {
      name: "competitor",
      label: "Competitor name",
      type: "text",
      placeholder: "Freightwise",
      help: "Used in the change report and the sales response lines.",
    },
    {
      name: "before",
      label: "Previous snapshot",
      type: "textarea",
      rows: 12,
      required: true,
      placeholder: "Starter — $29/month\n5 seats included\n...",
      help: "The pricing page as it looked last time you checked. Plain text.",
    },
    {
      name: "after",
      label: "Current snapshot",
      type: "textarea",
      rows: 12,
      required: true,
      placeholder: "Starter — $19/month\n10 seats included\n...",
      help: "The pricing page as it looks now.",
    },
  ],

  sample: {
    competitor: "Freightwise",
    before: `Freightwise Pricing
Copyright 2025 Freightwise Inc.

Starter — $29 per month
5 seats included
2,000 API requests per month
Email support
14-day free trial

Professional — $89 per month
25 seats included
50,000 API requests per month
Priority support
Advanced reporting
SSO not available

Enterprise — Contact sales
Unlimited seats
SSO and SAML
Dedicated success manager
99.9% uptime SLA

"Freightwise transformed our dispatch." — Ana R., Operations Lead`,
    after: `Freightwise Pricing
Copyright 2026 Freightwise Inc.

Free — $0 per month
2 seats included
500 API requests per month
Community support

Starter — $19 per month
10 seats included
2,000 API requests per month
Email support
7-day free trial

Professional — $119 per month
25 seats included
50,000 API requests per month
Priority support
Advanced reporting
SSO and SAML

Enterprise — Contact sales
Unlimited seats
Dedicated success manager
99.9% uptime SLA

"Freightwise changed how we dispatch." — Ana R., Head of Operations`,
  },

  mcpTool: {
    name: "pricepulse_diff_pricing",
    description:
      "Compare two snapshots of a competitor pricing or feature page and return a classified change report: price increases and decreases per plan, plans added or removed, features moved between tiers, limit and quota changes, trial length changes, and a recommended sales response for each change, ranked by commercial impact.",
  },
};
