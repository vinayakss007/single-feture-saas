import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  // Category default is ledger, but the reader is a friend group settling a holiday,
  // not a bookkeeper reconciling one. Attention beats formality here.
  design: "brutalist",

  slug: "tripsplit",
  name: "TripSplit",
  tagline: "Settle a group trip in three transfers instead of eleven",
  oneLiner:
    "Paste who paid for what, across any currencies, and get the smallest set of payments that squares everyone up — plus a message you can drop straight into the group chat.",
  category: "Travel money",
  audience: "Anyone who has organised a group trip, a shared house, or a weekend away and ended up as the accountant",
  accent: "#ca8a04",
  accentSoft: "#fefce8",

  metrics: [
    { value: "n-1", label: "Transfers at worst, however tangled the debts" },
    { value: "Any", label: "Mix of currencies in one trip" },
    { value: "0", label: "Accounts to create" },
  ],

  problem: [
    {
      title: "One person pays for everything, then does maths for a week",
      body:
        "Someone books the hotel, someone else pays for the car, three people cover dinners, and two things were only shared by half the group. Unpicking it takes an evening and a spreadsheet nobody trusts.",
    },
    {
      title: "The naive answer is a dozen awkward transfers",
      body:
        "Everyone paying everyone means up to fifteen payments for six people. Most of them cancel out. Nobody enjoys sending four separate transfers of ₹340.",
    },
    {
      title: "Multiple currencies make it worse",
      body:
        "Baht for food, euros for the flights, rupees for everything at home. Converting each line by hand is where the arithmetic quietly goes wrong.",
    },
  ],

  features: [
    {
      title: "The smallest realistic set of transfers",
      body:
        "Largest creditor paired with largest debtor, repeatedly. Always settles in at most one fewer payment than there are people, and hits the true minimum on the group sizes people actually travel in.",
    },
    {
      title: "Uneven splits handled",
      body:
        "Some expenses are shared by everyone, some by three of you. Name the participants per line, or leave it blank to mean everyone — which is what people actually do.",
    },
    {
      title: "Any currencies, one base",
      body:
        "Give the rates once and every line is converted. A currency with no rate is excluded outright and reported, rather than silently guessed — a wrong rate is worse than a missing line.",
    },
    {
      title: "Balances shown, not just transfers",
      body:
        "What each person paid, what their share was, and where they net out. The transfers make sense once you can see that, and the argument stops.",
    },
    {
      title: "A message for the group chat",
      body:
        "Totals, payments and balances in plain text. Paste and be done — this is the actual deliverable.",
    },
    {
      title: "Honest about optimality",
      body:
        "Finding the provably smallest set is NP-hard, so the output says the result is excellent rather than claiming a minimality it cannot guarantee.",
    },
  ],

  how: [
    "List each expense: who paid, how much, and who it was for.",
    "Leave the participants column blank where everyone shared it.",
    "Set your base currency and give a rate for any others.",
    "Read the transfers and paste the message into the group chat.",
  ],

  integrations: [
    "CSV from a spreadsheet or notes app",
    "Message as plain text for WhatsApp, Telegram or email",
    "JSON balances and transfers for a budgeting tool",
    "MCP server so an assistant can settle a trip from a chat log",
    "Self-hosted Docker for a company offsite",
  ],

  pricing: [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      blurb: "For the trip you just got back from.",
      features: [
        "25 settlements a month",
        "Any number of people and currencies",
        "Uneven splits",
        "Group-chat message export",
      ],
      cta: "Settle a trip",
      monthlyRuns: 25,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Organiser",
      price: "₹299",
      period: "/month",
      blurb: "For whoever always ends up organising.",
      features: [
        "5,000 settlements a month",
        "REST API and MCP server access",
        "Recurring groups and shared houses",
        "Custom rounding rules",
        "Email support",
      ],
      cta: "Start on Organiser",
      highlight: true,
      monthlyRuns: 5_000,
      apiAccess: true,
      rateLimitPerMin: 120,
    },
    {
      name: "Teams",
      price: "Custom",
      period: "",
      blurb: "For company offsites and travel desks.",
      features: [
        "Unlimited settlements",
        "Self-hosted Docker image",
        "Bulk processing across trips",
        "Expense policy checks",
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
      q: "Is this the mathematically minimum number of transfers?",
      a: "It is at most one fewer than the number of people, which is the practical bound, and on real group sizes it reaches the true minimum. Proving the smallest possible set is NP-hard in general, so the output says the result is very good rather than claiming optimality it cannot guarantee. For six friends and a weekend, the distinction is academic.",
    },
    {
      q: "What if I do not know the exchange rate?",
      a: "Then that expense is excluded and listed, rather than converted at a guess. A wrong rate silently applied to a third of the trip is far worse than a line you can see is missing. Any rate you enter is used exactly as given.",
    },
    {
      q: "How do I handle something only some of us shared?",
      a: "Name the participants in that row, separated by semicolons or slashes. Leave the column blank when everyone shared it — that is the common case, so blank means everyone rather than nobody.",
    },
    {
      q: "The transfers are a rupee off my own maths.",
      a: "Amounts are rounded to whole units so the payments are sendable, which can shift the split by a rupee or two across the group. The exact unrounded balances are in the JSON output. Nobody has ever fallen out over two rupees.",
    },
    {
      q: "Do you store my expenses?",
      a: "No. Every settlement is stateless: the expense list is processed in memory and never written to disk or a database. We meter run counts for billing and nothing else. There is no account to create and nothing to delete afterwards.",
    },
    {
      q: "Can it handle a shared flat rather than a trip?",
      a: "Yes, and it is arguably better suited to it. Paste a month of shared expenses and it settles them the same way. The Organiser plan exists for people doing this every month with the same group.",
    },
  ],

  inputs: [
    {
      name: "expenses",
      label: "Expenses",
      type: "textarea",
      rows: 14,
      required: true,
      placeholder: "Description,Paid by,Amount,Currency,For\nHotel,Priya,42000,INR,\nDinner,Arjun,3400,INR,Priya;Arjun;Meera",
      help: "Header row, then one expense per line. Leave 'For' blank when everyone shared it.",
    },
    {
      name: "baseCurrency",
      label: "Settle in",
      type: "select",
      required: true,
      options: ["INR", "USD", "EUR", "GBP", "AED", "SGD", "THB"],
    },
    {
      name: "rates",
      label: "Exchange rates to your base currency",
      type: "textarea",
      rows: 3,
      placeholder: "THB=2.4\nEUR=95\nUSD=88",
      help: "One per line. How many units of the base currency one unit of that currency is worth.",
    },
    { name: "tripName", label: "Trip name", type: "text", placeholder: "Thailand, July", help: "Appears on the group message." },
  ],

  sample: {
    baseCurrency: "INR",
    tripName: "Thailand, July",
    rates: "THB=2.4\nUSD=88",
    expenses: `Description,Paid by,Amount,Currency,For
Flights (all five),Priya,186000,INR,
Hotel Bangkok 3 nights,Arjun,24600,THB,
Airport transfer,Meera,1200,THB,
Dinner night one,Priya,3400,THB,
Island day trip,Rahul,9500,THB,Priya;Arjun;Rahul
Scuba course,Arjun,14000,THB,Arjun;Rahul
Groceries and water,Meera,880,THB,
Dinner night two,Kavya,4200,THB,
Massage,Priya,2400,THB,Priya;Meera;Kavya
Taxi to airport,Rahul,1100,THB,
SIM cards,Kavya,1500,THB,
Travel insurance,Meera,7500,INR,
Duty free,Arjun,120,USD,Arjun;Kavya`,
  },

  mcpTool: {
    name: "tripsplit_settle_expenses",
    description:
      "Settle shared group expenses with the fewest payments. Takes a list of expenses with who paid, the amount, the currency and optionally which subset of people shared each one, plus a base currency and exchange rates. Returns each person's total paid, their fair share and their net position, then the smallest practical set of person-to-person transfers that squares everyone up, the number of payments avoided compared with settling naively, any expenses excluded for want of an exchange rate, and a plain-text summary for a group chat.",
  },
};
