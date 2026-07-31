import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "labtrack",
  name: "LabTrack",
  tagline: "See which lab values are outside range, and which are moving",
  oneLiner:
    "Paste the values from one or more lab reports and get each one checked against its reference range, the percentage it sits outside, how it has moved since your last report, and a summary to take to your appointment.",
  category: "Health records",
  audience: "Anyone managing their own or a parent's test results across multiple reports and labs",
  accent: "#0f766e",
  accentSoft: "#f0fdfa",

  metrics: [
    { value: "31", label: "Tests recognised across 7 panels" },
    { value: "0", label: "Interpretations offered — by design" },
    { value: "Trends", label: "Across every report you paste" },
  ],

  problem: [
    {
      title: "Results arrive as PDFs and are never compared",
      body:
        "Each report is read once, on the day, then filed in a folder or an inbox. Nobody lines up March against September, which is exactly where the useful information is — the direction of travel, not the single number.",
    },
    {
      title: "Reference ranges differ between labs",
      body:
        "Switch laboratory and the same value can be flagged in one report and clear in the next, because assays and analysers differ. Without holding both ranges side by side you cannot tell a real change from a change of lab.",
    },
    {
      title: "The appointment is fifteen minutes long",
      body:
        "You have four reports on your phone and no idea which two lines matter. The time goes on finding the numbers rather than discussing them.",
    },
  ],

  features: [
    {
      title: "Every value checked against its range",
      body:
        "31 tests across haematology, glucose, lipids, liver, kidney, thyroid and vitamins, each with the percentage it sits outside — because 'high' is a very different fact at 2% and at 60%.",
    },
    {
      title: "Your report's own range takes priority",
      body:
        "Where the report stated a range, that is what gets used, and each finding says which range was applied. The paper the value came from is the only range that genuinely applies to it.",
    },
    {
      title: "Trends across reports",
      body:
        "Paste several reports with their dates and it lines up each test, showing the previous value, the current one and the percentage change. Anything that moved 10% or more is called out separately.",
    },
    {
      title: "Sex-specific ranges where they differ",
      body:
        "Haemoglobin, haematocrit, creatinine, ferritin, uric acid and ESR all have genuinely different ranges. Using one set for everyone produces false flags.",
    },
    {
      title: "Values far outside range are separated out",
      body:
        "There is a real difference between marginally outside and far enough out that laboratories flag it for prompt attention. Those are listed first, with a plain instruction to contact your doctor rather than wait.",
    },
    {
      title: "A summary written for the appointment",
      body:
        "Out-of-range values with their ranges and history, then in-range values, then the questions worth asking. Fifteen minutes spent discussing rather than searching.",
    },
  ],

  how: [
    "Open your report and paste the test names with their values, one per line.",
    "To see trends, paste several reports and put the date on its own line above each one.",
    "Set sex, so the ranges that genuinely differ are applied correctly.",
    "Read what is outside range and what has moved, then take the summary to your appointment.",
  ],

  integrations: [
    "Any lab report pasted as text — most PDFs copy cleanly",
    "Summary as plain text for email or print",
    "JSON output for a personal health record",
    "MCP server so an assistant can organise results across a family",
    "Self-hosted Docker, so health data never leaves your machine",
  ],

  pricing: [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      blurb: "For the report that just arrived.",
      features: [
        "25 reports a month",
        "All 31 tests and 7 panels",
        "Trends across every report you paste",
        "Appointment summary export",
      ],
      cta: "Check a report",
      monthlyRuns: 25,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Family",
      price: "₹499",
      period: "/month",
      blurb: "For someone tracking results for several people.",
      features: [
        "5,000 reports a month",
        "REST API and MCP server access",
        "Longer histories per person",
        "Custom reference ranges for your lab",
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
      blurb: "For a practice or diagnostic lab.",
      features: [
        "Unlimited reports",
        "Self-hosted Docker image",
        "Your own reference range tables",
        "Bulk processing",
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
      q: "Will it tell me what my results mean?",
      a: "No, and that refusal is the design rather than a disclaimer. Interpreting a result needs your history, your examination and your medications — none of which a text box has. Every output here is either arithmetic ('18% above the upper limit') or a comparison with your own earlier numbers. It never suggests a cause and never names a condition.",
    },
    {
      q: "Then what is it actually for?",
      a: "Two things a person genuinely cannot do quickly by hand: checking thirty values against thirty ranges without missing one, and lining up four reports to see which numbers are moving. Both are mechanical, and both are where the useful signal is. It makes a fifteen-minute appointment better spent.",
    },
    {
      q: "Whose reference ranges do you use?",
      a: "Your report's own, whenever it states one — and each finding says which range was applied. Where the report gives none, a range commonly published by Indian laboratories is used, and the output tells you it may not match your lab. Getting this wrong in either direction produces false alarms, which is worse than silence.",
    },
    {
      q: "Is my health data stored?",
      a: "No. Every run is stateless: values are processed in memory and never written to disk or a database. We meter run counts for billing and nothing else. On the Clinic plan you run the Docker image inside your own network, so nothing leaves it at all.",
    },
    {
      q: "What if a test is not recognised?",
      a: "It is listed as unrecognised and excluded, rather than guessed at. Thirty-one common tests are covered; a specialist panel will contain things this does not know, and silently dropping them would let you believe the check was complete when it was not.",
    },
    {
      q: "A value is flagged. Should I worry?",
      a: "A value outside range is not proof that something is wrong, just as one inside range is not proof that nothing is. Single readings drift, which is why doctors repeat tests. The one case where the output is directive is a value far enough outside range that laboratories flag it for prompt attention — there it says to contact your doctor rather than wait for a scheduled appointment.",
    },
  ],

  inputs: [
    {
      name: "report",
      label: "Test names and values",
      type: "textarea",
      rows: 16,
      required: true,
      placeholder: "2026-07-20\nHaemoglobin  11.2  g/dL  13.0 - 17.0\nTSH  6.8  µIU/mL  0.4 - 4.0",
      help: "One test per line. Put a date on its own line above a report to compare several.",
    },
    {
      name: "sex",
      label: "Sex",
      type: "select",
      required: true,
      options: ["Male", "Female", "Prefer not to say"],
      help: "Haemoglobin, creatinine, ferritin and several others have genuinely different ranges.",
    },
    {
      name: "name",
      label: "Whose report is this?",
      type: "text",
      placeholder: "Amma",
      help: "Appears on the summary. Useful when tracking for several people.",
      // The subject is usually the person filling this in, or a family member whose
      // name their browser already knows. WCAG 1.3.5.
      autocomplete: "name",
    },
  ],

  sample: {
    sex: "Female",
    name: "Amma",
    report: `2026-01-14
Haemoglobin            10.4    g/dL      12.0 - 15.0
Total WBC count        7200    cells/uL  4000 - 11000
Platelet count       232000    cells/uL  150000 - 410000
Serum ferritin           11    ng/mL     13 - 150
Fasting glucose         104    mg/dL     70 - 99
HbA1c                   6.1    %         4.0 - 5.6
Total cholesterol       218    mg/dL     0 - 200
LDL                     142    mg/dL     0 - 100
HDL                      44    mg/dL     40 - 60
Triglycerides           186    mg/dL     0 - 150
SGPT                     38    U/L       0 - 50
Serum creatinine       0.82    mg/dL     0.6 - 1.1
TSH                     5.90   uIU/mL    0.4 - 4.0
Vitamin D               14.2   ng/mL     30 - 100
Vitamin B12             186    pg/mL     200 - 900

2026-07-20
Haemoglobin            11.9    g/dL      12.0 - 15.0
Total WBC count        6800    cells/uL  4000 - 11000
Platelet count       248000    cells/uL  150000 - 410000
Serum ferritin           26    ng/mL     13 - 150
Fasting glucose          98    mg/dL     70 - 99
HbA1c                   5.8    %         4.0 - 5.6
Total cholesterol       196    mg/dL     0 - 200
LDL                     118    mg/dL     0 - 100
HDL                      49    mg/dL     40 - 60
Triglycerides           142    mg/dL     0 - 150
SGPT                     34    U/L       0 - 50
Serum creatinine       0.79    mg/dL     0.6 - 1.1
TSH                     4.20   uIU/mL    0.4 - 4.0
Vitamin D               29.6   ng/mL     30 - 100
Vitamin B12             404    pg/mL     200 - 900`,
  },

  mcpTool: {
    name: "labtrack_check_values",
    description:
      "Organise lab report values against reference ranges and show how they have changed across reports, without interpreting them. Takes pasted test names and values, optionally across several dated reports, plus sex for the ranges that genuinely differ. Returns each value classified as inside range, outside range, or far enough outside that laboratories flag it for prompt attention, with the percentage deviation and which reference range was applied; the change since the previous report per test; anything that moved 10% or more; and an appointment summary. Deliberately offers no diagnosis, no cause and no medical advice.",
  },
};
