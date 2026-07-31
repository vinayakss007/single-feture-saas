import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "a11ygate",
  name: "A11yGate",
  tagline: "Paste your HTML, get every WCAG failure and the EAA statement",
  oneLiner:
    "Paste the HTML of any page and get its WCAG 2.2 failures with the exact element, the success criterion, the EN 301 549 clause, a fix you can apply, and a ready-to-publish EAA accessibility statement.",
  category: "Accessibility compliance",
  audience: "EU e-commerce, banking, transport and SaaS teams, plus the agencies that build for them",
  accent: "#b45309",
  accentSoft: "#fffbeb",

  metrics: [
    { value: "28 Jun 2025", label: "EAA enforceable since" },
    { value: "27", label: "Member states, each with its own penalties" },
    { value: "34", label: "Deterministic checks, no crawling required" },
  ],

  problem: [
    {
      title: "Enforcement started and nothing was ready",
      body:
        "The European Accessibility Act has been enforceable since June 2025. Member states can now investigate complaints, demand remediation and impose sanctions including removal of a product from the EU market. Most teams found out from a procurement questionnaire.",
    },
    {
      title: "Audits cost more than the fix",
      body:
        "A manual accessibility audit is a four-figure engagement and a two-week wait. The majority of what it finds is mechanical — missing alt text, unlabelled inputs, broken heading order — and could have been caught in the pull request that introduced it.",
    },
    {
      title: "Browser extensions test the rendered page, not your source",
      body:
        "Which means they cannot run in CI, cannot check a component in isolation, and cannot tell you which template produced the problem. You get a screenshot and a number, then have to go and find it.",
    },
  ],

  features: [
    {
      title: "34 checks against WCAG 2.2",
      body:
        "Images, form labels, heading order, landmarks, link and button text, language, duplicate ids, tables, iframes, tab order, autoplay, contrast from inline styles, and the ARIA misuse that makes a page worse than no ARIA at all.",
    },
    {
      title: "Mapped to EN 301 549",
      body:
        "Each finding carries both the WCAG success criterion and the EN 301 549 clause, which is the harmonised standard European enforcement bodies actually cite.",
    },
    {
      title: "The offending element, quoted",
      body:
        "Not 'you have 12 image problems'. The actual tag, trimmed, so you can search for it in your codebase and fix it in one pass.",
    },
    {
      title: "A fix per finding",
      body:
        "Every check knows what correct looks like, so it tells you what to change rather than which specification to go and read.",
    },
    {
      title: "The accessibility statement you are required to publish",
      body:
        "Generated from your actual results — conformance level, known limitations, feedback route. A statement that overclaims is worse than none, so this one reports what the scan found.",
    },
    {
      title: "Runs on source, so it runs in CI",
      body:
        "It takes HTML, not a URL. That means no browser, no crawler, no egress, and a check you can put on every pull request.",
    },
  ],

  how: [
    "Paste the HTML of the page or component you care about — view source, or your template's rendered output.",
    "Pick your target conformance level. AA is what the EAA and every procurement form mean.",
    "Get findings grouped by severity, each with the element, the criterion, the EN 301 549 clause and the fix.",
    "Publish the generated accessibility statement, and put the API on your pull requests so it stays fixed.",
  ],

  integrations: [
    "REST API in CI — fail a build on new blocker findings",
    "MCP server so an agent can fix its own markup",
    "Markdown report for a Jira ticket or a PR comment",
    "JSON output for a dashboard",
    "Self-hosted Docker for unreleased pages",
  ],

  pricing: [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      blurb: "For fixing the page that just failed a review.",
      features: [
        "25 scans a month",
        "All 34 checks at every conformance level",
        "EN 301 549 clause mapping",
        "Accessibility statement generator",
        "Markdown and JSON export",
      ],
      cta: "Scan a page",
      monthlyRuns: 25,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Team",
      price: "₹1,999",
      period: "/month",
      blurb: "For keeping a product accessible instead of fixing it once.",
      features: [
        "5,000 scans a month",
        "REST API and MCP server access",
        "CI gate on new findings",
        "Per-component scanning",
        "Email support",
      ],
      cta: "Start on Team",
      highlight: true,
      monthlyRuns: 5_000,
      apiAccess: true,
      rateLimitPerMin: 120,
    },
    {
      name: "Agency",
      price: "Custom",
      period: "",
      blurb: "For agencies answerable for many clients' compliance.",
      features: [
        "Unlimited scans",
        "Self-hosted Docker image",
        "Custom rules and internal design-system checks",
        "White-labelled client reports",
        "SLA and a shared Slack channel",
      ],
      cta: "Talk to us",
      monthlyRuns: Number.POSITIVE_INFINITY,
      apiAccess: true,
      rateLimitPerMin: 600,
    },
  ],

  faq: [
    {
      q: "Does passing this mean I am compliant?",
      a: "No, and any tool that claims otherwise is lying to you. Roughly a third of WCAG can be checked mechanically; the rest — is the alt text actually meaningful, does the focus order match the visual order, can a keyboard user complete the task — needs a person. This clears the mechanical third so a human audit spends its time on the part that needs judgement, and the generated statement says exactly that.",
    },
    {
      q: "Why paste HTML instead of giving you a URL?",
      a: "Three reasons, and they all matter. It keeps the engine deterministic, so the same markup always yields the same findings. It works on pages behind a login, on staging, and on a component that is not deployed yet. And it runs in CI without a headless browser.",
    },
    {
      q: "What about contrast? You cannot compute that from HTML.",
      a: "Correct, and it says so. Contrast is checked where the colours are in inline styles, which is the only place they are knowable from markup alone. Anything in a stylesheet is reported as needing a rendered check rather than silently passed.",
    },
    {
      q: "How is this different from axe or Lighthouse?",
      a: "Same class of checks, three differences: it maps findings to EN 301 549 as well as WCAG, which is what European enforcement cites; it generates the accessibility statement, which is a legal deliverable rather than a report; and it runs on source with no browser, so it fits a pull request.",
    },
    {
      q: "Can I use this for the US ADA or Section 508?",
      a: "Yes. Section 508 incorporates WCAG 2.0 AA, and ADA case law leans on WCAG too. The criteria are the same; only the statement text is Europe-specific.",
    },
    {
      q: "What counts as a blocker versus a warning?",
      a: "A blocker is something that makes a task impossible for someone — an unlabelled form control, an image carrying meaning with no alt text, a keyboard trap. A warning degrades the experience without stopping it. Fix blockers before you argue about warnings.",
    },
  ],

  inputs: [
    {
      name: "html",
      label: "Page HTML",
      type: "textarea",
      rows: 16,
      required: true,
      placeholder: '<!doctype html>\n<html>\n  <body>\n    <img src="hero.png">\n    ...',
      help: "View source and paste, or paste your template's rendered output. A fragment is fine.",
    },
    {
      name: "level",
      label: "Target conformance level",
      type: "select",
      required: true,
      options: ["A", "AA", "AAA"],
      help: "AA is what the EAA, EN 301 549 and every procurement form mean.",
    },
    {
      name: "pageName",
      label: "Page or component name",
      type: "text",
      placeholder: "Checkout — payment step",
      help: "Used in the report and the accessibility statement.",
    },
    {
      name: "organisation",
      // The user's own organisation, named in the accessibility statement this generates.
      autocomplete: "organization",
      label: "Organisation name",
      type: "text",
      placeholder: "Northwind Retail BV",
      help: "Appears on the generated accessibility statement.",
    },
  ],

  sample: {
    level: "AA",
    pageName: "Newsletter signup",
    organisation: "Northwind Retail BV",
    html: `<!doctype html>
<html>
<head>
  <title>Sign up</title>
</head>
<body>
  <div class="header">
    <img src="/logo.png">
    <a href="/cart"><img src="/icons/cart.svg"></a>
  </div>

  <h3>Join our newsletter</h3>
  <h1>Northwind Retail</h1>

  <p style="color:#9ca3af;background:#ffffff">Get 10% off your first order.</p>

  <form action="/subscribe" method="post">
    <input type="email" id="email" placeholder="Email address">
    <input type="text" id="email" placeholder="Postcode">
    <select><option>Choose a country</option><option>Netherlands</option></select>
    <input type="checkbox" id="terms">
    <span>I accept the terms</span>
    <button></button>
  </form>

  <a href="/offers">Click here</a>
  <a href="/terms">read more</a>

  <div onclick="openPanel()" class="btn">Open preferences</div>

  <table>
    <tr><td>Size</td><td>Price</td></tr>
    <tr><td>Small</td><td>€19</td></tr>
  </table>

  <iframe src="https://player.example.com/promo"></iframe>
  <video src="/promo.mp4" autoplay></video>

  <div tabindex="4">Third</div>
  <button aria-hidden="true">Hidden action</button>
  <div role="button">No keyboard access</div>
</body>
</html>`,
  },

  mcpTool: {
    name: "a11ygate_audit_html",
    description:
      "Audit HTML for WCAG 2.2 accessibility failures without fetching anything. Takes raw HTML and a target conformance level of A, AA or AAA. Returns findings grouped by severity, each with the offending element quoted, the WCAG success criterion, the EN 301 549 clause, and a concrete fix; plus a conformance score, a list of checks that require a rendered page or human judgement, and a ready-to-publish European Accessibility Act statement.",
  },
};
