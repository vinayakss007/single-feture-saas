import type { ProductConfig } from "./types";

export const product: ProductConfig = {
  slug: "dealbrief",
  name: "DealBrief",
  tagline: "Turn any sales call transcript into a CRM-ready deal brief",
  oneLiner:
    "Paste a call transcript and get the deal brief your rep should have written: next actions with owners, MEDDICC gaps, risk flags, and a CRM note you can drop straight into the opportunity.",
  category: "Revenue operations",
  audience: "B2B sales teams and RevOps",
  accent: "#4f46e5",
  accentSoft: "#eef2ff",

  metrics: [
    { value: "12 min", label: "Average admin time saved per call" },
    { value: "7", label: "Qualification gaps checked every time" },
    { value: "0", label: "Reps who enjoy writing CRM notes" },
  ],

  problem: [
    {
      title: "Notes get written from memory, hours later",
      body:
        "By the time the rep opens the CRM the specifics are gone. What lands is 'good call, will follow up' — which is worth nothing at forecast review.",
    },
    {
      title: "Qualification gaps stay invisible",
      body:
        "Nobody notices the economic buyer was never named, or that no decision process was discussed, until the deal slips a quarter.",
    },
    {
      title: "Recording tools summarise, they don't qualify",
      body:
        "A generic summary tells you what was said. It does not tell you what is missing, who owes what, or which risk just appeared.",
    },
  ],

  features: [
    {
      title: "Next actions with owners",
      body:
        "Every commitment in the call is extracted as a task, attributed to whoever said it, with the date if one was mentioned.",
    },
    {
      title: "MEDDICC gap analysis",
      body:
        "Scores the call against seven qualification dimensions and tells you exactly which ones were never covered.",
    },
    {
      title: "Risk flags that matter",
      body:
        "Single-threading, pricing pushback, competitor mentions, security review, procurement, stalling language — each flagged with severity.",
    },
    {
      title: "Stakeholder map",
      body:
        "Lists every speaker, how much of the call they held, and whether they sounded like a champion, a blocker or a passenger.",
    },
    {
      title: "Paste-ready CRM note",
      body:
        "A formatted activity note that fits the character limits and structure of a real CRM field. Copy, paste, done.",
    },
    {
      title: "Follow-up email draft",
      body:
        "A recap email that restates the agreed next step, because the fastest way to lose a deal is to leave that ambiguous.",
    },
  ],

  how: [
    "Paste the transcript from Zoom, Meet, Fireflies, Gong or your notes app. Speaker labels help but are not required.",
    "DealBrief parses commitments, stakeholders, qualification coverage and risk language in one pass.",
    "Copy the CRM note and the follow-up email, or POST the same input from your backend and write it to the CRM automatically.",
  ],

  integrations: ["NuCRM", "FlowForge", "Agent Fleet", "HubSpot", "Salesforce", "Slack", "Zapier / n8n"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "For the rep who wants their evenings back.",
      features: ["10 briefs per month", "Full risk + MEDDICC analysis", "CRM note and email draft", "No signup"],
      cta: "Start free",
    },
    {
      name: "Team",
      price: "$29",
      period: "/user/mo",
      blurb: "For a sales team that reviews pipeline weekly.",
      features: [
        "Unlimited briefs",
        "REST API + MCP server access",
        "Push straight into NuCRM or HubSpot",
        "Shared risk taxonomy",
        "Email support",
      ],
      cta: "Start 14-day trial",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "$0.04",
      period: "/brief",
      blurb: "For platforms embedding this on every call.",
      features: [
        "Volume pricing from 50k briefs",
        "Self-hosted Docker image",
        "Custom risk + qualification framework",
        "SSO and audit log",
        "SLA and shared Slack channel",
      ],
      cta: "Talk to us",
    },
  ],

  faq: [
    {
      q: "Do you store my transcripts?",
      a: "No. The API is stateless — the transcript is processed in the request and never written to disk or a database. Self-host the Docker image if you need that guarantee in writing.",
    },
    {
      q: "Does it need an LLM API key?",
      a: "No. The core engine is deterministic, which is why it returns the same brief for the same transcript and costs nothing per call. You can layer an LLM on top for prose polish, but the qualification and risk logic does not depend on one.",
    },
    {
      q: "What transcript formats work?",
      a: "Anything text. 'Speaker: line' format gives you the stakeholder map and talk-ratio analysis. Unlabelled text still gets actions, risks and qualification scoring.",
    },
    {
      q: "How is this different from my meeting recorder's AI summary?",
      a: "A summary describes the call. DealBrief judges the deal — it tells you what is missing, what is at risk, and who owes what by when. Those are different jobs.",
    },
    {
      q: "Can my agents call it?",
      a: "Yes. There is an MCP server in the repo, so Claude, Cursor or your own Agent Fleet worker can use DealBrief as a tool and update the CRM itself.",
    },
    {
      q: "Can I change the qualification framework?",
      a: "MEDDICC is the default. Enterprise plans can swap in BANT, SPICED or your internal framework by editing one config object.",
    },
  ],

  inputs: [
    {
      name: "dealName",
      label: "Deal / account name",
      type: "text",
      placeholder: "Northwind Logistics — Platform rollout",
      help: "Used in the CRM note header.",
    },
    {
      name: "stage",
      label: "Current pipeline stage",
      type: "select",
      options: ["Discovery", "Demo", "Evaluation", "Proposal", "Negotiation", "Closing"],
      help: "Changes which qualification gaps count as critical.",
    },
    {
      name: "transcript",
      label: "Call transcript",
      type: "textarea",
      rows: 14,
      required: true,
      placeholder: "Rep: Thanks for making time...\nPriya (VP Ops): We're evaluating two options...",
      help: "Paste raw text. 'Speaker: line' format unlocks the stakeholder map.",
    },
  ],

  sample: {
    dealName: "Northwind Logistics — Platform rollout",
    stage: "Evaluation",
    transcript: `Rep: Thanks for making time today. Last time we spoke you mentioned dispatch handoffs were the big pain — has that changed?
Priya (VP Operations): It's worse actually. We're losing about 6 hours a week per dispatcher on manual re-entry, and we have 14 dispatchers. That's the number my CFO cares about.
Rep: Understood. So roughly 84 hours a week. What does that cost you?
Priya: We costed it at around 320,000 dollars a year in loaded time. That's why this got budget.
Rep: Great. Who else needs to be comfortable before this moves forward?
Priya: Security will need to review it, they always do. And honestly the decision sits with me and Rajesh on the finance side.
Rep: Makes sense. Should we get Rajesh into the next conversation?
Priya: Let me check with him first. I'll come back to you by Thursday on that.
Rep: Perfect. I'll send over the security questionnaire and the ROI model tomorrow.
Priya: Good. I should mention we are also looking at Freightwise. Their pricing came in lower.
Rep: Noted — happy to walk through where we differ. What does your rollout timeline look like?
Priya: We want to be live before the peak season in October, so we'd need to sign in the next six weeks.
Rep: That's doable. I'll get you a draft proposal with implementation dates by Monday.
Priya: One thing, the per-seat pricing felt high for 14 dispatchers. We'd need to look at that.
Rep: I hear you. Let me see what I can do on volume.`,
  },

  mcpTool: {
    name: "dealbrief_analyze_call",
    description:
      "Analyse a B2B sales call transcript and return a CRM-ready deal brief: next actions with owners and dates, MEDDICC qualification coverage and gaps, risk flags with severity, a stakeholder map, a paste-ready CRM activity note and a follow-up email draft.",
  },
};
