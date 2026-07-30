import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "coldangle",
  name: "ColdAngle",
  tagline: "Cold email openers that prove you actually did the research",
  oneLiner:
    "Paste anything public about a prospect — their about page, a press release, a job ad — and get openers built on a specific fact you found, three full email variants, and a spam audit before you hit send.",
  category: "Outbound sales",
  audience: "Founders, SDRs and agencies doing manual outbound",
  accent: "#ea580c",
  accentSoft: "#fff7ed",

  metrics: [
    { value: "9", label: "Research angles detected from raw text" },
    { value: "14", label: "Spam triggers checked before you send" },
    { value: "3", label: "Complete email variants per prospect" },
  ],

  problem: [
    {
      title: "'I hope this email finds you well'",
      body:
        "The generic opener is why your reply rate is under two percent. Everyone knows a template when they see one, and they delete it in the preview pane.",
    },
    {
      title: "AI personalisation is obvious personalisation",
      body:
        "'I loved your recent post about digital transformation' fools nobody. Fake specificity reads worse than honest brevity, and it burns the domain.",
    },
    {
      title: "Real research takes fifteen minutes a prospect",
      body:
        "Reading the about page, the careers page and the last press release actually works. It also means eight prospects a day instead of eighty.",
    },
  ],

  features: [
    {
      title: "Angles from real facts",
      body:
        "Detects hiring pushes, funding events, launches, expansion, tech stack mentions, awards and stated problems — then quotes the actual line it found.",
    },
    {
      title: "Ranked by strength",
      body:
        "A funding round is a stronger reason to reach out than a mission statement. Angles are ranked so you lead with the one that earns a reply.",
    },
    {
      title: "Three complete emails",
      body:
        "A direct version, a curiosity version and a referral-style version. All under 120 words, because nobody reads the long one.",
    },
    {
      title: "Spam audit before sending",
      body:
        "Checks fourteen deliverability killers — trigger words, link count, shouting, length, question stacking — and tells you which line to change.",
    },
    {
      title: "Specificity score",
      body:
        "Measures how much of the email could only have been written for this prospect. If it scores low, it is a template and it will be treated like one.",
    },
    {
      title: "No hallucinated flattery",
      body:
        "Every claim in the generated copy traces back to a line in the text you pasted. If the fact is not there, the opener does not assert it.",
    },
  ],

  how: [
    "Paste what you found: the about page, a job ad, a funding announcement, a LinkedIn post. Anything public and specific.",
    "ColdAngle extracts and ranks the usable angles, writes the openers around the strongest one, and audits the result for deliverability.",
    "Copy the variant you like. Or POST from FlowForge so every new lead in NuCRM arrives with its openers already written.",
  ],

  integrations: ["NuCRM", "LeadAbet", "FlowForge", "Agent Fleet", "Instantly", "Lemlist", "Zapier / n8n"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "For founders doing outbound themselves.",
      features: ["Unlimited openers", "All 9 angle types", "Full spam audit", "3 email variants per run"],
      cta: "Write an opener",
    },
    {
      name: "Outbound",
      price: "$29",
      period: "/mo",
      blurb: "For a small team running real sequences.",
      features: [
        "REST API + MCP server access",
        "Bulk generation from a lead list",
        "Auto-enrich new NuCRM leads",
        "Custom angle weights and tone presets",
        "Saved offer library",
      ],
      cta: "Start 14-day trial",
      highlight: true,
    },
    {
      name: "Agency",
      price: "Custom",
      period: "",
      blurb: "For agencies running outbound for clients.",
      features: [
        "Self-hosted Docker image",
        "Per-client angle and tone profiles",
        "White-label API",
        "SSO and audit log",
        "SLA and shared Slack channel",
      ],
      cta: "Talk to us",
    },
  ],

  faq: [
    {
      q: "Why do I paste the research instead of you scraping it?",
      a: "Because scraped enrichment is exactly what produces the fake-specific emails everyone deletes. You choose the fact that matters. The writing and the deliverability audit are the parts worth automating.",
    },
    {
      q: "Does it use an LLM?",
      a: "No. The openers are built from templates that get filled with facts extracted from your text, which is why the output never invents a compliment about a post that does not exist. Optional LLM polish is available on paid plans.",
    },
    {
      q: "Will these get past spam filters?",
      a: "The audit catches the content-side triggers — trigger words, link stuffing, shouting, excessive length. It cannot fix a bad domain reputation or a missing DMARC record, and it tells you so.",
    },
    {
      q: "How long are the emails?",
      a: "Under 120 words, deliberately. Every variant is built to be read in full on a phone without scrolling.",
    },
    {
      q: "What if my research text has nothing useful in it?",
      a: "Then it tells you that, rather than making something up. That is a signal to find a better source or drop the prospect.",
    },
    {
      q: "Can this run inside my sequence tool?",
      a: "Yes. Call the REST endpoint at list-build time and write the opener into a custom field, or let an Agent Fleet worker do it via the MCP server.",
    },
  ],

  inputs: [
    {
      name: "company",
      label: "Prospect company",
      type: "text",
      required: true,
      placeholder: "Northwind Logistics",
    },
    {
      name: "contact",
      label: "Contact first name",
      type: "text",
      placeholder: "Priya",
      help: "Left blank, the emails open without a name.",
    },
    {
      name: "research",
      label: "What you found about them",
      type: "textarea",
      rows: 10,
      required: true,
      placeholder: "Paste their about page, a job ad, a press release or a recent post…",
      help: "The more specific and recent, the stronger the angle.",
    },
    {
      name: "offer",
      label: "What you do, in one sentence",
      type: "textarea",
      rows: 3,
      required: true,
      placeholder: "We cut manual dispatch data entry by 80% for mid-size logistics firms.",
      help: "Write it as an outcome, not a product category.",
    },
    {
      name: "tone",
      label: "Tone",
      type: "select",
      options: ["Direct", "Warm", "Peer-to-peer"],
    },
  ],

  sample: {
    company: "Northwind Logistics",
    contact: "Priya",
    tone: "Direct",
    research: `Northwind Logistics — About
We move freight for 400+ shippers across western India. Founded 2014, headquartered in Pune, now 260 employees across 6 branches.

Careers: We are hiring 4 Dispatch Coordinators and 2 Operations Analysts in Pune. "Our dispatch volume has tripled in two years and our team is feeling it — we need people who can keep up with manual coordination across branches."

Press: Northwind raised a 12 crore Series A led by Kalaari in March 2026 to expand into southern India and invest in operations technology.

From the CEO's post last week: "The hardest part of scaling a logistics business is not trucks. It is the data entry between systems that nobody wants to own."`,
    offer:
      "We remove the manual re-entry between dispatch and billing systems, which typically gives back 6 hours a week per coordinator.",
  },

  mcpTool: {
    name: "coldangle_write_opener",
    description:
      "Generate cold email openers grounded in real research about a prospect. Takes pasted public text about the company plus your one-sentence offer, and returns ranked research angles with the exact quote each is based on, three complete email variants under 120 words, a specificity score, and a deliverability audit listing which spam triggers were found.",
  },
};
