import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "consentscan",
  name: "ConsentScan",
  tagline: "Scan any website for India DPDP and GDPR consent compliance",
  oneLiner:
    "Enter a URL and get a real compliance report in seconds: which trackers fire before consent, which cookies are set without permission, and exactly which DPDP Act and GDPR obligations your site is currently failing.",
  category: "Privacy compliance",
  audience: "Indian SMBs, agencies and anyone shipping to EU users",
  accent: "#059669",
  accentSoft: "#ecfdf5",

  metrics: [
    { value: "24", label: "Checks across DPDP, GDPR and security hygiene" },
    { value: "₹250 cr", label: "Maximum DPDP penalty for consent failures" },
    { value: "8s", label: "Typical scan time for a live site" },
  ],

  problem: [
    {
      title: "The DPDP Act applies to almost every Indian website",
      body:
        "If you collect a name, an email or a phone number from someone in India, you are a Data Fiduciary with notice, consent and grievance obligations. Most sites have none of them in place.",
    },
    {
      title: "Analytics fires before anyone clicks accept",
      body:
        "The most common violation is also the most invisible: Google Analytics, Meta Pixel and Hotjar all load on first paint, long before the cookie banner appears. A banner that does not block anything is decoration.",
    },
    {
      title: "Compliance quotes start at a lakh",
      body:
        "A consultant will charge you for a week to tell you what an automated scan can tell you in eight seconds. Get the finding list first, then pay for the hard parts.",
    },
  ],

  features: [
    {
      title: "Pre-consent tracker detection",
      body:
        "Identifies the analytics, advertising and session-recording scripts present in the initial HTML — the ones that run before any consent decision is possible.",
    },
    {
      title: "Cookies set without consent",
      body:
        "Reads the Set-Cookie headers on first request and classifies each cookie as strictly necessary, analytics or advertising, which is the classification regulators actually ask for.",
    },
    {
      title: "DPDP-specific obligations",
      body:
        "Checks for the things the Indian Act requires and GDPR does not phrase the same way: notice of purpose, Data Principal rights, consent withdrawal, and a named Grievance Officer.",
    },
    {
      title: "Consent platform detection",
      body:
        "Recognises the major consent management platforms, and tells you when a banner exists but is cosmetic because trackers load regardless.",
    },
    {
      title: "Privacy policy fetch and read",
      body:
        "Finds your privacy policy, fetches it, and checks whether the required disclosures are actually in the text rather than just assuming the link is enough.",
    },
    {
      title: "A fix list, in order",
      body:
        "Every finding names the obligation it breaches and the specific change to make. Ordered by penalty exposure, so you fix the expensive things first.",
    },
  ],

  how: [
    "Paste the URL of any page that collects data — your homepage, a landing page or a signup flow.",
    "ConsentScan fetches the page and its privacy policy, inspects headers, cookies and scripts, then scores 24 obligations across DPDP, GDPR and security hygiene.",
    "Work the fix list top down, then re-scan. Or POST the URL from FlowForge weekly so a regression never ships unnoticed.",
  ],

  integrations: ["FlowForge", "NuCRM", "Agent Fleet", "Slack", "GitHub Actions", "Jira", "Zapier / n8n"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "Scan your own site and find out where you stand.",
      features: ["Unlimited manual scans", "All 24 checks", "Prioritised fix list", "No signup"],
      cta: "Scan my site",
    },
    {
      name: "Agency",
      price: "$59",
      period: "/mo",
      blurb: "For agencies who answer for their clients' sites.",
      features: [
        "REST API + MCP server access",
        "Weekly automated re-scans",
        "Up to 50 domains",
        "White-label PDF report",
        "Slack alert on new violations",
      ],
      cta: "Start 14-day trial",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      blurb: "For platforms and regulated industries.",
      features: [
        "Self-hosted Docker image",
        "CI gate — fail the build on a new violation",
        "Custom obligation set for your regulator",
        "SSO and audit log",
        "SLA and shared Slack channel",
      ],
      cta: "Talk to us",
    },
  ],

  faq: [
    {
      q: "Is this legal advice?",
      a: "No, and be suspicious of any tool that claims otherwise. ConsentScan reports technical facts about your site and maps them to the obligations those facts usually touch. Use it to brief your counsel, not to replace them.",
    },
    {
      q: "Why only the initial HTML and not a full browser render?",
      a: "Because scripts present in the first response are the ones that provably run before a consent decision, which is the violation regulators act on. Full headless-browser scanning with a consent-click comparison is on the Agency plan.",
    },
    {
      q: "What is the difference between the DPDP checks and the GDPR checks?",
      a: "GDPR is stricter on prior consent and legal basis. DPDP is more prescriptive about notice content, consent withdrawal being as easy as giving it, and naming a Grievance Officer. The report separates the two so you know which regime a finding belongs to.",
    },
    {
      q: "Do you store the scanned URLs?",
      a: "No. Each scan is stateless and nothing is written to disk. Self-host the Docker image if you need that in writing for a vendor assessment.",
    },
    {
      q: "Will it work on a site behind a login or a WAF?",
      a: "Logged-in pages need the self-hosted build, which accepts authentication headers. Sites behind aggressive bot protection such as Cloudflare's may return 403 to any server-side scanner — those WAFs fingerprint the TLS handshake, not the User-Agent, so no scanner gets through. The report tells you that explicitly rather than showing a misleading score. Allowlist the scanner or run it inside your own network.",
    },
    {
      q: "Can I run it in CI?",
      a: "Yes. Call the REST endpoint from a GitHub Action and fail the build when the compliance score drops below your threshold. The MCP server also lets an agent scan and open the fix tickets itself.",
    },
  ],

  inputs: [
    {
      name: "url",
      label: "Website URL",
      type: "url",
      required: true,
      placeholder: "https://example.com",
      help: "Any publicly reachable page. Use the page that actually collects data.",
    },
    {
      name: "regime",
      label: "Which regime matters most",
      type: "select",
      options: ["India DPDP Act", "EU GDPR", "Both"],
      help: "Changes how findings are weighted in the score.",
    },
  ],

  sample: {
    url: "https://vercel.com",
    regime: "Both",
  },

  mcpTool: {
    name: "consentscan_audit_site",
    description:
      "Audit a live website for India DPDP Act and EU GDPR consent compliance. Fetches the page and its privacy policy, then returns a 0-100 compliance score, the trackers and cookies active before consent, missing privacy-notice disclosures, missing security headers, and a prioritised remediation list with the specific obligation each finding breaches.",
  },
};
