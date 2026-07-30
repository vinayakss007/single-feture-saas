import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "subaudit",
  name: "SubAudit",
  tagline: "Upload a card statement, find the subscriptions you forgot",
  oneLiner:
    "Paste a card or bank statement and get every recurring software subscription in it, with duplicates, price rises, the next renewal date, annualised spend, and a shortlist of what to cancel.",
  category: "Finance operations",
  audience: "Founders, finance leads, office managers and anyone who owns a company card",
  accent: "#be123c",
  accentSoft: "#fff1f2",

  metrics: [
    { value: "1 CSV", label: "No bank connection, no OAuth" },
    { value: "180+", label: "SaaS vendors recognised by name" },
    { value: "First run", label: "When it usually pays for itself" },
  ],

  problem: [
    {
      title: "Subscriptions accumulate faster than anyone cancels them",
      body:
        "A trial nobody converted, a seat for someone who left, two tools that do the same thing bought by two teams. Each one is small enough to ignore on a statement and large enough to matter annually.",
    },
    {
      title: "Nobody knows what renews when",
      body:
        "An annual contract renews silently. You find out when the charge lands, which is a month after the cancellation window closed.",
    },
    {
      title: "Spend management tools want to be your card",
      body:
        "The category answer is to change your entire payments stack and route everything through a new platform. That is a procurement project. You wanted a list.",
    },
  ],

  features: [
    {
      title: "Merchant names untangled",
      body:
        "Statement descriptors are hostile — GOOGLE *CLOUD_A1B2C, AMAZON WEB SERVICES AWS, PADDLE.NET* NOTION. These are normalised to the actual vendor so the same tool does not appear three times.",
    },
    {
      title: "Billing cadence detected from the dates",
      body:
        "Monthly, quarterly or annual, worked out from the gaps between charges rather than assumed. That is what makes the next renewal date real.",
    },
    {
      title: "Duplicate tools flagged",
      body:
        "Two project trackers, three e-signature tools, an overlapping analytics stack. Grouped by category so the overlap is visible instead of implied.",
    },
    {
      title: "Price rises caught",
      body:
        "When the same vendor charges more than it did last cycle, you get the old amount, the new amount and the percentage — the increase nobody emailed you about.",
    },
    {
      title: "Annualised spend, and what is stale",
      body:
        "Every subscription's true yearly cost, plus anything that has not charged in longer than its own cycle — usually a cancelled trial still holding a card, or a tool that quietly stopped working.",
    },
    {
      title: "A cancel shortlist with the saving attached",
      body:
        "Ranked by annual amount, so the conversation starts with the ₹80,000 line and not the ₹400 one.",
    },
  ],

  how: [
    "Export your card or bank statement as CSV — every bank and card issuer offers this.",
    "Paste it in. Date, description and amount are all it needs.",
    "Read the subscription list, the duplicates, the price rises and the renewal calendar.",
    "Work down the cancel shortlist. Re-run it next quarter to see what crept back.",
  ],

  integrations: [
    "CSV from any bank or card issuer",
    "Razorpay, Stripe and Paddle payment descriptors decoded",
    "REST API for a quarterly automated review",
    "MCP server so an agent can audit spend and draft cancellations",
    "Self-hosted Docker — financial data never leaves your network",
  ],

  pricing: [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      blurb: "For the audit you have been meaning to do.",
      features: [
        "25 statements a month",
        "Full vendor recognition and cadence detection",
        "Duplicate and price-rise detection",
        "Renewal calendar and cancel shortlist",
      ],
      cta: "Audit a statement",
      monthlyRuns: 25,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Finance",
      price: "₹1,499",
      period: "/month",
      blurb: "For someone who owns the software budget.",
      features: [
        "5,000 statements a month",
        "REST API and MCP server access",
        "Multiple cards and entities",
        "Custom vendor dictionary for your internal tools",
        "Email support",
      ],
      cta: "Start on Finance",
      highlight: true,
      monthlyRuns: 5_000,
      apiAccess: true,
      rateLimitPerMin: 120,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      blurb: "For a finance team across many entities.",
      features: [
        "Unlimited statements",
        "Self-hosted Docker image",
        "Bulk processing across cards",
        "Custom categories and approval mapping",
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
      q: "Do you connect to my bank?",
      a: "No, and that is the point. No open-banking consent, no credentials, no ongoing access to your accounts. You paste a CSV you already have, and the analysis happens in memory. The most common reason people never do this audit is that the tools ask for bank access first.",
    },
    {
      q: "How many months should I paste?",
      a: "Three to six. One month cannot tell monthly from annual, because cadence is inferred from the gaps between charges. With six months you get accurate cadence, real renewal dates and price rises. Paste twelve and you also catch the annual contracts.",
    },
    {
      q: "What if it does not recognise a vendor?",
      a: "It still reports it. Anything that charges on a regular cadence with a stable amount is reported as an unrecognised recurring charge rather than dropped — a subscription you have never heard of is the most interesting thing on the list, so hiding it would defeat the purpose.",
    },
    {
      q: "Is the data stored?",
      a: "No. Statements are processed in memory and never written to disk or a database. We meter run counts for billing, nothing else. On Enterprise you run the Docker image inside your own network.",
    },
    {
      q: "Will it catch things bought through an app store or a reseller?",
      a: "Where the descriptor names the vendor, yes — Paddle, Stripe, Razorpay and app-store descriptors are decoded. Where a reseller genuinely obscures the underlying tool, the charge is reported as unrecognised recurring rather than silently attributed.",
    },
    {
      q: "How is the next renewal date calculated?",
      a: "Last charge date plus the detected cadence. It is an estimate and is labelled as one, because the cycle can shift when a plan changes. It is accurate enough to diarise a cancellation window, which is what it is for.",
    },
  ],

  inputs: [
    {
      name: "statement",
      label: "Statement CSV",
      type: "textarea",
      rows: 16,
      required: true,
      placeholder: "Date,Description,Amount\n2026-07-04,GOOGLE *CLOUD_A1B2C,18400.00",
      help: "Date, description and amount. Three to six months gives the best cadence detection.",
    },
    {
      name: "currency",
      label: "Currency",
      type: "select",
      required: true,
      options: ["INR", "USD", "EUR", "GBP", "AED", "SGD"],
      help: "Used for formatting only. Amounts are not converted.",
    },
    {
      name: "asOfDate",
      label: "Statement as at",
      type: "text",
      required: true,
      placeholder: "2026-07-31",
      help: "The last day covered by the statement. Renewal dates and staleness are measured from here. ISO format.",
    },
  ],

  sample: {
    currency: "INR",
    asOfDate: "2026-07-31",
    statement: `Date,Description,Amount
2026-02-04,GOOGLE *CLOUD_A1B2C,16800.00
2026-02-06,PADDLE.NET* NOTION LABS,1650.00
2026-02-09,SLACK T029AB4,7400.00
2026-02-11,ATLASSIAN JIRA SOFTWARE,5200.00
2026-02-12,ASANA.COM SUBSCRIPTION,4100.00
2026-02-14,FIGMA MONTHLY,3300.00
2026-02-18,DOCUSIGN INC,2400.00
2026-02-19,ADOBE ACROBAT SIGN,1900.00
2026-02-21,ZOOM.US 888-799,1650.00
2026-02-24,AWS EMEA SERVICES,9800.00
2026-03-04,GOOGLE *CLOUD_A1B2C,16800.00
2026-03-06,PADDLE.NET* NOTION LABS,1650.00
2026-03-09,SLACK T029AB4,7400.00
2026-03-11,ATLASSIAN JIRA SOFTWARE,5200.00
2026-03-12,ASANA.COM SUBSCRIPTION,4100.00
2026-03-14,FIGMA MONTHLY,3300.00
2026-03-18,DOCUSIGN INC,2400.00
2026-03-19,ADOBE ACROBAT SIGN,1900.00
2026-03-21,ZOOM.US 888-799,1650.00
2026-03-24,AWS EMEA SERVICES,11200.00
2026-03-28,MIRO SUBSCRIPTION,2800.00
2026-04-04,GOOGLE *CLOUD_A1B2C,16800.00
2026-04-06,PADDLE.NET* NOTION LABS,1650.00
2026-04-09,SLACK T029AB4,7400.00
2026-04-11,ATLASSIAN JIRA SOFTWARE,5200.00
2026-04-12,ASANA.COM SUBSCRIPTION,4100.00
2026-04-14,FIGMA MONTHLY,3300.00
2026-04-19,ADOBE ACROBAT SIGN,1900.00
2026-04-24,AWS EMEA SERVICES,12600.00
2026-04-28,MIRO SUBSCRIPTION,2800.00
2026-05-04,GOOGLE *CLOUD_A1B2C,18400.00
2026-05-06,PADDLE.NET* NOTION LABS,1650.00
2026-05-09,SLACK T029AB4,8880.00
2026-05-11,ATLASSIAN JIRA SOFTWARE,5200.00
2026-05-12,ASANA.COM SUBSCRIPTION,4100.00
2026-05-14,FIGMA MONTHLY,3300.00
2026-05-19,ADOBE ACROBAT SIGN,1900.00
2026-05-24,AWS EMEA SERVICES,12100.00
2026-05-28,MIRO SUBSCRIPTION,2800.00
2026-06-04,GOOGLE *CLOUD_A1B2C,18400.00
2026-06-06,PADDLE.NET* NOTION LABS,1650.00
2026-06-09,SLACK T029AB4,8880.00
2026-06-11,ATLASSIAN JIRA SOFTWARE,5200.00
2026-06-12,ASANA.COM SUBSCRIPTION,4100.00
2026-06-14,FIGMA MONTHLY,3300.00
2026-06-19,ADOBE ACROBAT SIGN,1900.00
2026-06-24,AWS EMEA SERVICES,13400.00
2026-06-28,MIRO SUBSCRIPTION,2800.00
2026-06-30,SALESFORCE ANNUAL SUB,148000.00
2026-07-04,GOOGLE *CLOUD_A1B2C,18400.00
2026-07-06,PADDLE.NET* NOTION LABS,1650.00
2026-07-09,SLACK T029AB4,8880.00
2026-07-11,ATLASSIAN JIRA SOFTWARE,5200.00
2026-07-12,ASANA.COM SUBSCRIPTION,4100.00
2026-07-14,FIGMA MONTHLY,3300.00
2026-07-19,ADOBE ACROBAT SIGN,1900.00
2026-07-24,AWS EMEA SERVICES,14100.00
2026-07-28,MIRO SUBSCRIPTION,2800.00
2026-07-15,ZOMATO ORDER 88213,640.00
2026-07-16,UBER TRIP HELP.UBER,410.00
2026-07-20,INDIGO AIRLINES 6E,14200.00`,
  },

  mcpTool: {
    name: "subaudit_find_subscriptions",
    description:
      "Find every recurring software subscription in a bank or card statement CSV. Normalises hostile statement descriptors to real vendor names, infers billing cadence from the gaps between charges, and returns each subscription with its amount, cadence, annualised cost and estimated next renewal date, plus duplicate tools grouped by category, price rises with the before and after amounts, stale subscriptions that have stopped charging, and a cancel shortlist ranked by annual saving.",
  },
};
