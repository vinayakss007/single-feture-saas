import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "churnsignal",
  name: "ChurnSignal",
  tagline: "Paste a CSV, find out which customers are about to leave",
  oneLiner:
    "Drop in your account export — logins, seats, tickets, renewal dates — and get a ranked churn risk list with the reason codes behind each score and a save play for every at-risk account.",
  category: "Customer success",
  audience: "SaaS founders and CS teams without a data team",
  accent: "#e11d48",
  accentSoft: "#fff1f2",

  metrics: [
    { value: "6", label: "Independent churn signals scored per account" },
    { value: "0", label: "Warehouse or data pipeline needed" },
    { value: "45 days", label: "Typical warning window before renewal" },
  ],

  problem: [
    {
      title: "Churn is obvious only in hindsight",
      body:
        "The logins dropped in month two, the seats were never filled, and three tickets went unanswered. Everyone sees it clearly the week after the cancellation email.",
    },
    {
      title: "Health scores need a data team",
      body:
        "Proper customer health scoring means a warehouse, a modelling layer and someone to own it. Most teams under 50 people will never get there.",
    },
    {
      title: "A number without a reason is useless",
      body:
        "'Account is 74% likely to churn' does not tell a CSM what to do on Monday morning. Reason codes and a play do.",
    },
  ],

  features: [
    {
      title: "Six signals, weighted",
      body:
        "Usage trend, dormancy, seat utilisation, support pressure, satisfaction and renewal proximity — each contributes to the score independently.",
    },
    {
      title: "Reason codes, not black boxes",
      body:
        "Every score shows exactly which signals fired and how many points each added, so a CSM can defend the call in a pipeline review.",
    },
    {
      title: "Revenue at risk, quantified",
      body:
        "Rolls the per-account scores into ARR at risk by band, which is the only version of this a CFO wants to see.",
    },
    {
      title: "A save play per risk pattern",
      body:
        "Dormant accounts need a different intervention to accounts with pricing friction. You get the specific play, not generic advice.",
    },
    {
      title: "Flexible column matching",
      body:
        "Your export does not have to match a schema. Common header names for each signal are recognised automatically and missing columns are simply skipped.",
    },
    {
      title: "Scored CSV back out",
      body:
        "Get the same rows back with risk score, band and reason codes appended, ready to re-import into your CRM or share in a review.",
    },
  ],

  how: [
    "Export accounts from your CRM, billing system or product analytics as CSV. Any column order, any subset of the signals.",
    "ChurnSignal matches your headers, scores every account, and ranks them by revenue-weighted risk.",
    "Work the high-risk list top down using the save plays, or POST the CSV nightly from FlowForge and alert Slack automatically.",
  ],

  integrations: ["NuCRM", "FlowForge", "Agent Fleet", "Stripe export", "HubSpot", "Intercom export", "Slack"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "Score your book once a month by hand.",
      features: ["Up to 50 accounts per run", "All six signals", "Reason codes and save plays", "Scored CSV export"],
      cta: "Score my accounts",
    },
    {
      name: "Growth",
      price: "$49",
      period: "/mo",
      blurb: "For a CS team that reviews risk every week.",
      features: [
        "Unlimited accounts per run",
        "REST API + MCP server access",
        "Nightly scoring via FlowForge",
        "Custom signal weights",
        "Slack digest of new high-risk accounts",
      ],
      cta: "Start 14-day trial",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      blurb: "For platforms scoring their own customers' customers.",
      features: [
        "Self-hosted Docker image",
        "Your own signal model",
        "Multi-tenant scoring",
        "SSO and audit log",
        "SLA and shared Slack channel",
      ],
      cta: "Talk to us",
    },
  ],

  faq: [
    {
      q: "What columns do I need?",
      a: "None are mandatory. Include what you have — account name, MRR, logins this period and last, days since last login, seats used and paid, open tickets, NPS, days to renewal. Every signal you provide is scored; the rest are skipped and the score is normalised.",
    },
    {
      q: "Is this a machine learning model?",
      a: "No, and that is deliberate. It is a transparent weighted rules engine, so you can read exactly why an account scored 78 and argue with it. An ML model on 40 accounts would be a random number generator with better marketing.",
    },
    {
      q: "Do you store my customer data?",
      a: "No. The CSV is parsed in the request and never persisted. If you would rather it never leave your network, run the Docker image yourself.",
    },
    {
      q: "Can I change the weights?",
      a: "Yes on paid plans. Usage collapse matters more in product-led businesses; renewal proximity matters more in enterprise. The weights are one config object.",
    },
    {
      q: "How large a CSV can I paste?",
      a: "The free tier caps at 50 rows per run to keep the demo snappy. The API handles thousands of rows per request.",
    },
    {
      q: "Can my agents run this?",
      a: "Yes. The MCP server exposes scoring as a tool, so an Agent Fleet worker can pull the export, score it and open tasks for at-risk accounts without a human in the loop.",
    },
  ],

  inputs: [
    {
      name: "csv",
      label: "Account CSV",
      type: "textarea",
      rows: 12,
      required: true,
      placeholder: "account,mrr,logins_30d,logins_prev_30d,days_since_login,seats_used,seats_paid,open_tickets,nps,days_to_renewal",
      help: "First row must be headers. Comma or tab separated. Any subset of the supported signals.",
    },
    {
      name: "profile",
      label: "Business model",
      type: "select",
      options: ["Product-led SaaS", "Sales-led SaaS", "Enterprise / annual contracts"],
      help: "Shifts the signal weights — usage matters more in PLG, renewal timing more in enterprise.",
    },
  ],

  sample: {
    profile: "Sales-led SaaS",
    csv: `account,mrr,logins_30d,logins_prev_30d,days_since_login,seats_used,seats_paid,open_tickets,nps,days_to_renewal
Northwind Logistics,4200,18,96,3,9,25,4,6,38
Kestrel Retail,1800,64,58,1,22,25,0,9,210
Bluefin Analytics,3100,4,71,27,3,20,2,5,25
Harbour Foods,950,31,29,2,8,10,1,8,150
Vertex Manufacturing,6400,0,44,41,2,40,6,3,19
Cobalt Health,2200,52,49,4,17,20,1,7,95
Dunes Media,780,11,34,15,4,12,3,6,62`,
  },

  mcpTool: {
    name: "churnsignal_score_accounts",
    description:
      "Score a CSV of customer accounts for churn risk. Returns a ranked list with a 0-100 risk score per account, the reason codes that fired, revenue at risk by band, a recommended save play per at-risk account, and the original rows with scores appended as CSV.",
  },
};
