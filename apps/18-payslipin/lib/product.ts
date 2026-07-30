import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "payslipin",
  name: "PaySlipIN",
  tagline: "One CTC figure becomes a compliant Indian payslip",
  oneLiner:
    "Enter a CTC and get the full salary structure with employee and employer PF, ESI, professional tax by state, TDS under both regimes compared, net take-home, and a printable payslip.",
  category: "Payroll compliance",
  audience: "Small employers, HR consultants, chartered accountants and anyone doing payroll in a spreadsheet",
  accent: "#047857",
  accentSoft: "#ecfdf5",

  metrics: [
    { value: "Both regimes", label: "Old and new TDS, compared" },
    { value: "Every month", label: "Which is why it sticks" },
    { value: "0", label: "Spreadsheet formulas to maintain" },
  ],

  problem: [
    {
      title: "The structure is rebuilt in a spreadsheet every year",
      body:
        "Basic, HRA, special allowance, PF ceilings, ESI thresholds, professional tax slabs that differ by state. One wrong cell and every payslip that month is wrong, and nobody notices until an employee checks.",
    },
    {
      title: "Two tax regimes, and employees must choose",
      body:
        "Employees are entitled to compare the old regime with deductions against the new regime with lower rates. Most employers cannot show them the comparison, so the choice gets made on a guess.",
    },
    {
      title: "Payroll software starts at a per-employee monthly fee",
      body:
        "For four employees, a full HRMS is the wrong shape and the wrong price. You wanted a correct payslip, not an attendance module.",
    },
  ],

  features: [
    {
      title: "Structure derived from CTC, correctly",
      body:
        "Basic at a defensible percentage, HRA at the metro or non-metro rate, employer PF and gratuity separated out of CTC rather than added on top — which is where most spreadsheets go wrong.",
    },
    {
      title: "PF with the ceiling handled properly",
      body:
        "The ₹15,000 statutory wage ceiling, the option to contribute on actual basic, the employer's split between EPF and EPS, and EDLI and admin charges. All of it shown, not rolled into one number.",
    },
    {
      title: "ESI eligibility, not assumed",
      body:
        "Applies only where gross is at or below the threshold, and the contribution period rule means eligibility persists to the end of the period. Both handled.",
    },
    {
      title: "Professional tax by state",
      body:
        "Karnataka, Maharashtra, West Bengal, Tamil Nadu, Telangana, Gujarat and more, each with its own slabs — and the states that levy none.",
    },
    {
      title: "Both TDS regimes, side by side",
      body:
        "Old regime with standard deduction, HRA exemption, 80C and 80D; new regime with its slabs and rebate. The annual difference in rupees, so the employee can actually decide.",
    },
    {
      title: "A payslip you can hand over",
      body:
        "Earnings, deductions, employer contributions and net pay, laid out the way an employee expects and an auditor accepts.",
    },
  ],

  how: [
    "Enter the employee's name, annual CTC, state and whether the city is a metro.",
    "Set PF and the declared investments if the employee has shared them.",
    "Read the structure, the statutory deductions and the regime comparison.",
    "Copy the payslip. Re-run it whenever CTC or state changes.",
  ],

  integrations: [
    "Payslip as text or Markdown for email or print",
    "JSON breakdown for a payroll register or accounting import",
    "REST API to generate a whole team's payslips monthly",
    "MCP server so an agent can answer take-home questions",
    "Self-hosted Docker — salary data never leaves your network",
  ],

  pricing: [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      blurb: "For a small team's monthly payroll.",
      features: [
        "25 payslips a month",
        "Full structure, PF, ESI and professional tax",
        "Both TDS regimes compared",
        "Printable payslip",
      ],
      cta: "Generate a payslip",
      monthlyRuns: 25,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Payroll",
      price: "₹999",
      period: "/month",
      blurb: "For an HR consultant or a growing team.",
      features: [
        "5,000 payslips a month",
        "REST API and MCP server access",
        "Bulk generation for a whole team",
        "Custom allowance heads",
        "Email support",
      ],
      cta: "Start on Payroll",
      highlight: true,
      monthlyRuns: 5_000,
      apiAccess: true,
      rateLimitPerMin: 120,
    },
    {
      name: "Practice",
      price: "Custom",
      period: "",
      blurb: "For a CA firm running payroll for many clients.",
      features: [
        "Unlimited payslips",
        "Self-hosted Docker image",
        "Multi-client, white-labelled output",
        "Custom structures per client",
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
      q: "Does it file returns or make payments?",
      a: "No. It computes and produces the payslip. PF, ESI and TDS filings go through EPFO, ESIC and TRACES, and the actual payment through your bank. This is the arithmetic layer, which is where the errors are.",
    },
    {
      q: "How is basic salary decided?",
      a: "It defaults to 50% of CTC, which is the common and defensible position given that PF is computed on basic and courts have looked unkindly at artificially low basic. You can override it. The output states the percentage used, because an auditor will ask.",
    },
    {
      q: "Which financial year are the tax slabs from?",
      a: "FY 2026-27 slabs under both the old and new regimes, with the new regime as default per current law. Every slab and threshold used is listed in the output so you can check it against the current Finance Act rather than trusting a black box.",
    },
    {
      q: "Is TDS the exact amount I should deduct?",
      a: "It is the annual liability divided across the remaining months, which is the standard method — but real TDS depends on the employee's other income, prior employment in the same year, and actual proof of investments. Treat it as the correct starting number and adjust for declarations, which the output says explicitly.",
    },
    {
      q: "Do you store salary data?",
      a: "No. Every calculation is stateless: inputs are processed in memory and never written to disk or a database. We meter run counts for billing, nothing else. On Practice you run the Docker image inside your own network.",
    },
    {
      q: "What about gratuity and leave encashment?",
      a: "Gratuity is shown as a separate employer cost within CTC at the standard 4.81% of basic, because including it in monthly take-home is the most common CTC misunderstanding there is. Leave encashment is a settlement item, not a monthly one, so it is out of scope.",
    },
  ],

  inputs: [
    { name: "employeeName", label: "Employee name", type: "text", required: true, placeholder: "Priya Raman" },
    { name: "designation", label: "Designation", type: "text", placeholder: "Senior Engineer" },
    {
      name: "ctc",
      label: "Annual CTC (₹)",
      type: "text",
      required: true,
      placeholder: "1800000",
      help: "Total cost to company per year, including employer PF and gratuity.",
    },
    {
      name: "state",
      label: "State of employment",
      type: "select",
      required: true,
      options: [
        "Karnataka",
        "Maharashtra",
        "Tamil Nadu",
        "Telangana",
        "West Bengal",
        "Gujarat",
        "Andhra Pradesh",
        "Kerala",
        "Madhya Pradesh",
        "Delhi (no professional tax)",
        "Uttar Pradesh (no professional tax)",
        "Haryana (no professional tax)",
      ],
      help: "Professional tax slabs differ by state, and some states levy none.",
    },
    {
      name: "metro",
      label: "City type",
      type: "select",
      required: true,
      options: ["Metro (Mumbai, Delhi, Kolkata, Chennai)", "Non-metro"],
      help: "Decides the HRA exemption rate — 50% versus 40% of basic.",
    },
    {
      name: "pfOption",
      label: "PF contribution basis",
      type: "select",
      required: true,
      options: ["On ₹15,000 statutory ceiling", "On actual basic salary", "Not applicable (exempt)"],
    },
    {
      name: "basicPercent",
      label: "Basic as % of CTC",
      type: "select",
      required: true,
      options: ["50% (recommended)", "40%", "60%"],
      help: "PF is computed on basic, so this materially changes take-home.",
    },
    {
      name: "rentPaid",
      label: "Monthly rent paid (₹)",
      type: "text",
      placeholder: "35000",
      help: "For the HRA exemption in the old regime. Leave blank if the employee does not rent.",
    },
    {
      name: "deduction80c",
      label: "80C investments declared (₹/year)",
      type: "text",
      placeholder: "150000",
      help: "EPF counts towards the ₹1.5 lakh cap automatically. Old regime only.",
    },
    {
      name: "deduction80d",
      label: "80D health insurance premium (₹/year)",
      type: "text",
      placeholder: "25000",
      help: "Old regime only.",
    },
    { name: "month", label: "Payslip month", type: "text", required: true, placeholder: "July 2026", help: "Appears on the payslip." },
  ],

  sample: {
    employeeName: "Priya Raman",
    designation: "Senior Engineer",
    ctc: "1800000",
    state: "Karnataka",
    metro: "Non-metro",
    pfOption: "On ₹15,000 statutory ceiling",
    basicPercent: "50% (recommended)",
    rentPaid: "35000",
    deduction80c: "150000",
    deduction80d: "25000",
    month: "July 2026",
  },

  mcpTool: {
    name: "payslipin_compute_payslip",
    description:
      "Compute a compliant Indian payslip from an annual CTC. Takes CTC, state, metro status, PF basis, basic percentage and declared investments. Returns the full salary structure, employee and employer provident fund with the statutory ceiling and EPS split, ESI eligibility and contribution, professional tax for the specific state, TDS computed under both the old and new regimes with the annual difference so the employee can choose, monthly net take-home, and a printable payslip.",
  },
};
