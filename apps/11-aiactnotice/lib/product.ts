import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "aiactnotice",
  name: "AIActNotice",
  tagline: "The EU AI Act notice your product legally needs, in one minute",
  oneLiner:
    "Describe what your AI system does and get its risk tier with the article cited, the Article 50 transparency notice to publish, the obligations you have not met yet, and a reproducible evidence record for the file.",
  category: "AI governance",
  audience: "Anyone shipping AI into the EU — founders, product leads, DPOs, compliance owners",
  accent: "#6d28d9",
  accentSoft: "#f5f3ff",

  metrics: [
    { value: "2 Aug 2026", label: "Article 50 transparency applies from" },
    { value: "€15M", label: "Or 3% of turnover, whichever is higher" },
    { value: "4", label: "Risk tiers, decided by rules not opinion" },
  ],

  problem: [
    {
      title: "The deadline is here and nobody knows which tier they are in",
      body:
        "Article 50 transparency obligations apply from 2 August 2026. Most teams shipping AI features have never worked out whether they are a provider or a deployer, or whether their system is limited-risk or high-risk. The Act answers this with criteria, not vibes — but you have to read 113 articles to find them.",
    },
    {
      title: "Compliance quotes start at €5,000",
      body:
        "The governance platforms are priced for enterprises with a programme to run. A lawyer will read your product description and tell you the same thing they told the last twelve clients. Neither is proportionate when what you need is a classification and a notice to paste on a page.",
    },
    {
      title: "An AI-written compliance document is worth nothing",
      body:
        "Auditors want evidence, not intentions. A classification produced by a language model cannot be reproduced, so it cannot be defended — ask it twice and you may get two answers. That is the opposite of what an audit trail is for.",
    },
  ],

  features: [
    {
      title: "Risk tier with the article cited",
      body:
        "Prohibited, high-risk, limited-risk or minimal — each conclusion carries the specific article and annex that produced it, so you can check the reasoning rather than trust it.",
    },
    {
      title: "The actual notice text",
      body:
        "Article 50 requires you to tell people they are interacting with an AI system, and to mark synthetic content. You get the wording for both, ready to paste into a page, a chat header or a footer.",
    },
    {
      title: "Obligation gap list",
      body:
        "Every duty that attaches to your tier and role, marked as covered or missing based on what you told us. Technical documentation, logging, human oversight, conformity assessment, registration.",
    },
    {
      title: "Reproducible evidence record",
      body:
        "A JSON record with your inputs, the rules that fired, and a content hash. Run it again in eighteen months with the same answers and you get a byte-identical result — which is what makes it evidence.",
    },
    {
      title: "Provider and deployer split",
      body:
        "The Act puts different duties on whoever builds a system and whoever uses it. If you are both, you get both sets, separated, so you are not guessing which applies.",
    },
    {
      title: "Deterministic, so it is auditable",
      body:
        "No model in the request path. The same description always produces the same classification, which is the only way a compliance output can be relied on twice.",
    },
  ],

  how: [
    "Describe what your AI system does in plain language, the way you would explain it to a new colleague.",
    "Answer six questions: your role, whether it interacts with people, whether it generates content, what kind of inference it makes, the sector, and whether a human reviews its output.",
    "Get the risk tier with citations, the transparency notice, and the obligations still open.",
    "Save the evidence record. Re-run it after any material change to the system and keep both.",
  ],

  integrations: [
    "Paste into any privacy or trust centre page",
    "Markdown output for Notion, Confluence or a docs site",
    "JSON evidence record for a GRC tool or an S3 audit bucket",
    "MCP server so an agent can classify systems in bulk",
    "REST API for a CI check on every model change",
  ],

  pricing: [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      blurb: "Classify one system and publish its notice.",
      features: [
        "25 classifications a month",
        "All four risk tiers with article citations",
        "Article 50 notice text",
        "Obligation gap list",
        "Evidence record download",
      ],
      cta: "Classify a system",
      monthlyRuns: 25,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Compliance",
      price: "₹2,499",
      period: "/month",
      blurb: "For a company with several AI features to keep straight.",
      features: [
        "5,000 classifications a month",
        "REST API and MCP server access",
        "Re-classify on every model change from CI",
        "Provider and deployer obligations side by side",
        "Email support",
      ],
      cta: "Start on Compliance",
      highlight: true,
      monthlyRuns: 5_000,
      apiAccess: true,
      rateLimitPerMin: 120,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      blurb: "For a portfolio of systems and an auditor to satisfy.",
      features: [
        "Unlimited classifications",
        "Self-hosted Docker image, nothing leaves your network",
        "Custom rules for national implementations",
        "Signed evidence records",
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
      q: "Is this legal advice?",
      a: "No, and it does not pretend to be. It applies the Act's own published criteria to what you tell us and shows you which article produced each conclusion. That is a starting position you can take to a lawyer in ten minutes rather than two hours — and for a limited-risk chatbot it is often the whole job.",
    },
    {
      q: "What if my description is wrong or incomplete?",
      a: "Then the classification is wrong, and it will say so: anything it could not determine appears in an explicit 'not assessed' list rather than being silently assumed benign. Garbage in is visible here, not hidden.",
    },
    {
      q: "Why not use an LLM for this?",
      a: "Because an auditor's first question is whether you can reproduce it. A model that gives a different answer on Tuesday is not evidence of anything. Every rule here is a published criterion applied deterministically, which is why the evidence record carries a hash.",
    },
    {
      q: "Does it cover the August 2026 high-risk obligations?",
      a: "Yes. It flags Annex III high-risk classification and lists the obligations that attach — risk management, data governance, technical documentation, logging, human oversight, accuracy and conformity assessment — with the article for each.",
    },
    {
      q: "We are outside the EU. Does the Act apply to us?",
      a: "If the output of your system is used in the EU, generally yes. The questionnaire asks where output lands, not where you are incorporated, because that is the test the Act actually uses.",
    },
    {
      q: "Can I run it on our own infrastructure?",
      a: "Yes, on Enterprise. There is a Docker image and the engine needs no network access, so a system description never leaves your network. For anyone assessing an unreleased product, that tends to be the deciding factor.",
    },
  ],

  inputs: [
    {
      name: "systemName",
      label: "System name",
      type: "text",
      required: true,
      placeholder: "Support Copilot",
      help: "Appears on the notice and in the evidence record.",
    },
    {
      name: "purpose",
      label: "What does it do?",
      type: "textarea",
      rows: 6,
      required: true,
      placeholder:
        "A chat assistant on our support page that answers product questions from our documentation and can open a ticket.",
      help: "Plain language. Mention who uses it, what it decides, and what it produces.",
    },
    {
      name: "role",
      label: "Your role",
      type: "select",
      required: true,
      options: ["Provider (we build it)", "Deployer (we use someone else's)", "Both"],
      help: "The Act puts different obligations on each.",
    },
    {
      name: "interaction",
      label: "Does it interact with people directly?",
      type: "select",
      required: true,
      options: ["Yes, people chat or speak with it", "No, it runs behind the scenes"],
    },
    {
      name: "output",
      label: "What does it output?",
      type: "select",
      required: true,
      options: [
        "Text answers only",
        "Synthetic images, audio or video",
        "A score, ranking or recommendation",
        "An automated decision about a person",
      ],
    },
    {
      name: "inference",
      label: "Special inference",
      type: "select",
      required: true,
      options: [
        "None of the below",
        "Emotion recognition",
        "Biometric categorisation or identification",
        "Social scoring of people",
        "Predictive policing on individuals",
      ],
      help: "Some of these are prohibited outright, not merely high-risk.",
    },
    {
      name: "sector",
      label: "Where is it used?",
      type: "select",
      required: true,
      options: [
        "General business or consumer software",
        "Employment, hiring or worker management",
        "Education or vocational training",
        "Credit, insurance or essential private services",
        "Healthcare or medical devices",
        "Law enforcement, migration or justice",
        "Critical infrastructure",
      ],
      help: "Annex III attaches high-risk status to specific sectors.",
    },
    {
      name: "humanReview",
      label: "Does a human review the output before it takes effect?",
      type: "select",
      required: true,
      options: ["Yes, always", "Sometimes, by exception", "No, it acts automatically"],
    },
    {
      name: "euOutput",
      label: "Is the output used in the EU?",
      type: "select",
      required: true,
      options: ["Yes", "No", "Not sure"],
    },
    {
      name: "asOfDate",
      label: "Assessment date",
      type: "text",
      required: true,
      placeholder: "2026-07-30",
      help: "Recorded in the evidence record and used to work out which obligations are already in force. ISO format.",
    },
  ],

  sample: {
    systemName: "Support Copilot",
    purpose:
      "A chat assistant embedded on our support page. It answers customer questions about our product using our own documentation, summarises the conversation for the agent, and can open a support ticket on the customer's behalf. It does not make decisions about pricing, eligibility or accounts.",
    role: "Provider (we build it)",
    interaction: "Yes, people chat or speak with it",
    output: "Text answers only",
    inference: "None of the below",
    sector: "General business or consumer software",
    humanReview: "Sometimes, by exception",
    euOutput: "Yes",
    asOfDate: "2026-07-30",
  },

  mcpTool: {
    name: "aiactnotice_classify_system",
    description:
      "Classify an AI system under the EU AI Act and generate its transparency notice. Takes a plain-language description plus the provider or deployer role, interaction mode, output type, inference type, sector and human oversight level. Returns the risk tier with the article and annex that produced it, the Article 50 transparency notice text, the full obligation list marked covered or open, anything that could not be assessed, and a reproducible evidence record with a content hash.",
  },
};
