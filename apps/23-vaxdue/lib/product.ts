import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "vaxdue",
  name: "VaxDue",
  tagline: "Which childhood vaccines are overdue, due now and next",
  oneLiner:
    "Enter a date of birth and the doses already given, and get every vaccine that is overdue, due now or coming up, with the date, the age it belongs to, whether it is free at a government facility, and a card for the clinic.",
  category: "Child health",
  audience: "Parents and grandparents tracking a child's immunisations, and the relative who ends up holding the card",
  accent: "#c026d3",
  accentSoft: "#fdf4ff",

  metrics: [
    { value: "35", label: "Doses across the full childhood schedule" },
    { value: "UIP + IAP", label: "National programme and recommended additions" },
    { value: "0", label: "Medical advice given" },
  ],

  problem: [
    {
      title: "The card gets lost, and the schedule is unreadable anyway",
      body:
        "A paper card, a folded chart in a language of weeks and months, and doses spread over eighteen years. Working out what is actually due today means counting weeks from a birthday by hand.",
    },
    {
      title: "Nobody tells you which vaccines are free",
      body:
        "Some doses are part of the national programme and free at a government facility. Others are recommended additions you pay for. Parents are quoted a total and rarely told which is which.",
    },
    {
      title: "Missing a dose feels like starting over",
      body:
        "It usually is not. Catch-up continues a series from where it stopped. But there is one genuine exception with a hard age limit, and no chart tells you which one that is.",
    },
  ],

  features: [
    {
      title: "Overdue, due now and upcoming, with dates",
      body:
        "Not ages in weeks — actual calendar dates computed from the date of birth, so you can put them in a diary.",
    },
    {
      title: "Doses you have already given are matched",
      body:
        "Paste them however they are written on the card. Anything that could not be matched is listed explicitly rather than silently ignored, because a silent miss would show a dose as due when it is not.",
    },
    {
      title: "Free versus paid, marked per dose",
      body:
        "Every row says whether it is part of the national programme or an additional recommendation, so you know what you are being charged for.",
    },
    {
      title: "The one vaccine with a real age limit",
      body:
        "Rotavirus cannot be started or completed after a certain age. If that has passed it says so plainly rather than listing it as catch-up you can still do.",
    },
    {
      title: "Endemic-only vaccines handled honestly",
      body:
        "Japanese encephalitis is given in specific districts. It is included only if you say the district is endemic, and the output tells you to confirm locally.",
    },
    {
      title: "A card for the clinic",
      body:
        "Overdue, due now and the next twelve doses with dates, printable, to hand to whoever gives the injection.",
    },
  ],

  how: [
    "Enter the child's date of birth and today's date.",
    "List the doses already given — copy them off the card, in whatever form they are written.",
    "Choose whether to include the recommended additions or only the national programme.",
    "Read what is overdue, book the appointment, and take the card with you.",
  ],

  integrations: [
    "Card as plain text for print or a messaging app",
    "JSON schedule for a personal health record",
    "REST API for a clinic reminder system",
    "MCP server so an assistant can answer 'what is due for the baby'",
    "Self-hosted Docker, so a child's health data never leaves your network",
  ],

  pricing: [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      blurb: "For one child's schedule.",
      features: [
        "25 schedules a month",
        "Full UIP and IAP schedule",
        "Overdue and catch-up handling",
        "Printable clinic card",
      ],
      cta: "Check a schedule",
      monthlyRuns: 25,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Family",
      price: "₹299",
      period: "/month",
      blurb: "For several children, or a long history.",
      features: [
        "5,000 schedules a month",
        "REST API and MCP server access",
        "Multiple children",
        "Custom state schedules",
        "Email support",
      ],
      cta: "Start on Family",
      highlight: true,
      monthlyRuns: 5_000,
      apiAccess: true,
      rateLimitPerMin: 120,
    },
    {
      name: "Clinic",
      price: "Custom",
      period: "",
      blurb: "For a paediatric practice or an NGO programme.",
      features: [
        "Unlimited schedules",
        "Self-hosted Docker image",
        "Bulk cohort processing",
        "Your own schedule tables",
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
      q: "Is this medical advice?",
      a: "No. It tells you where the national schedule places each dose for a child of this age, which is arithmetic. Whether a particular child should receive a particular vaccine — and any contraindication, current illness or allergy — is a decision for a paediatrician. The output never suggests skipping a dose, only where the schedule puts it.",
    },
    {
      q: "We are months behind. Do we start again?",
      a: "Almost never. Catch-up continues a series from where it stopped, respecting the minimum gaps between doses, and the output says so on every overdue row. The genuine exception is rotavirus, which has an upper age limit — if that has passed it tells you plainly instead of listing it as catch-up.",
    },
    {
      q: "Which schedule is this based on?",
      a: "India's Universal Immunisation Programme, plus the additional vaccines the Indian Academy of Paediatrics recommends. You choose whether to include the additions. Every row is marked free or usually paid, because that distinction is rarely explained at the counter.",
    },
    {
      q: "Why does it ask for today's date instead of using the clock?",
      a: "So the result is reproducible. Run it again next month with the same inputs and you get the same schedule, which matters if you saved or shared the card. It also lets you check what will be due at a future appointment.",
    },
    {
      q: "It says a dose is due that we already had.",
      a: "Then the entry did not match. Anything unmatched is listed explicitly at the bottom for exactly this reason — check the spelling against the vaccine names in the table. Matching is deliberately conservative, because wrongly marking a dose as given is the more dangerous error.",
    },
    {
      q: "Is the child's data stored?",
      a: "No. Every run is stateless: dates and dose lists are processed in memory and never written to disk or a database. We meter run counts for billing and nothing else.",
    },
  ],

  inputs: [
    { name: "dob", label: "Date of birth", type: "text", required: true, placeholder: "2024-03-15", help: "ISO format. The whole schedule is measured from this." },
    { name: "asOfDate", label: "Today's date", type: "text", required: true, placeholder: "2026-07-30", help: "Taken as input so the schedule is reproducible, and so you can check a future date." },
    {
      name: "given",
      label: "Doses already given",
      type: "textarea",
      rows: 6,
      placeholder: "BCG 2024-03-15\nHepatitis B 1\nPentavalent 1\nPentavalent 2\nOPV 1",
      help: "One per line, however it is written on the card. Add the dose number where there is a series.",
    },
    {
      name: "scope",
      label: "Which schedule",
      type: "select",
      required: true,
      options: ["Both UIP and IAP recommended", "UIP national programme only"],
      help: "UIP doses are free at a government facility. IAP additions are usually paid.",
    },
    {
      name: "jeEndemic",
      label: "Is your district endemic for Japanese encephalitis?",
      type: "select",
      required: true,
      options: ["No", "Yes"],
      help: "Given only in specific districts. Your local facility can confirm.",
    },
    { name: "childName", label: "Child's name", type: "text", placeholder: "Ananya", help: "Appears on the clinic card." },
  ],

  sample: {
    dob: "2024-03-15",
    asOfDate: "2026-07-30",
    scope: "Both UIP and IAP recommended",
    jeEndemic: "No",
    childName: "Ananya",
    given: `BCG 2024-03-15
Hepatitis B 1 2024-03-15
OPV 0 2024-03-15
Pentavalent 1 2024-04-28
OPV 1 2024-04-28
Rotavirus 1 2024-04-28
PCV 1 2024-04-28
IPV 1 2024-04-28
Pentavalent 2 2024-05-26
OPV 2 2024-05-26
Rotavirus 2 2024-05-26
Pentavalent 3 2024-06-24
OPV 3 2024-06-24
PCV 2 2024-06-24
IPV 2 2024-06-24
Measles-Rubella 1 2024-12-18`,
  },

  mcpTool: {
    name: "vaxdue_check_schedule",
    description:
      "Work out which childhood vaccines are overdue, due now and upcoming from a date of birth and the doses already given. Covers India's Universal Immunisation Programme and the additional Indian Academy of Paediatrics recommendations, marking each dose free or usually paid. Returns calendar due dates rather than ages, how many weeks late anything overdue is, catch-up guidance including the one vaccine with a genuine upper age limit, any already-given entries that could not be matched, and a printable clinic card. Provides scheduling arithmetic only, never medical advice.",
  },
};
