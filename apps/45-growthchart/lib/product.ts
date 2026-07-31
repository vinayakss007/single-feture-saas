import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "growthchart",
  name: "GrowthChart",
  tagline: "Is your child growing on track - percentiles, not guesses",
  oneLiner:
    "Enter your child's date of birth, sex, and measurements over time to plot against WHO growth standards with exact percentile using LMS method, growth velocity, and percentile crossing alerts.",
  category: "Health tools",
  audience: "Parents, paediatricians, anganwadi workers, child health clinics, school health programmes",
  accent: "#701a75",
  accentSoft: "#fdf2f8",

  metrics: [
    { value: "WHO", label: "Growth standards used" },
    { value: "LMS", label: "Percentile method" },
    { value: "0-18", label: "Years covered" },
  ],

  problem: [
    {
      title: "Parents compare their child to the neighbour's child, not to growth standards",
      body:
        "A child at the 25th percentile is perfectly healthy if they have always been there. A child dropping from 75th to 25th percentile in 6 months needs investigation. Position matters less than trajectory.",
    },
    {
      title: "Paediatricians mark dots on paper charts with no computation",
      body:
        "The WHO growth chart is a PDF. Parents get told 'normal' or 'low weight' with no exact percentile, no velocity calculation, and no trend analysis. A 3rd percentile child growing steadily is different from a 50th percentile child dropping.",
    },
    {
      title: "Growth faltering is caught months too late",
      body:
        "By the time a child visibly looks underweight, they have been faltering for 3-6 months. Monthly measurements with percentile tracking catches the trend when intervention (nutrition, investigating causes) still has maximum impact.",
    },
  ],

  features: [
    {
      title: "Exact percentile using LMS method",
      body:
        "Not approximate zones (between 25th and 50th) but exact percentile (e.g., 37th) computed using the WHO LMS parameters for the child's exact age and sex.",
    },
    {
      title: "Percentile crossing detection",
      body:
        "Flags when a child crosses percentile lines (upward or downward). Crossing two major lines warrants paediatric evaluation. This is more clinically significant than absolute position.",
    },
    {
      title: "Growth velocity computation",
      body:
        "Weight gain in grams per day/week and height gain in cm per month compared to expected velocity for age. Velocity faltering precedes percentile crossing.",
    },
    {
      title: "Multiple growth parameters",
      body:
        "Weight-for-age, height-for-age, weight-for-height (wasting indicator), and BMI-for-age. Each tells a different story: acute malnutrition vs chronic stunting vs overweight.",
    },
    {
      title: "Clinician prompts, not diagnoses",
      body:
        "Output is phrased as 'worth discussing with your paediatrician' not 'your child has X'. Identifies patterns that warrant professional assessment without causing alarm.",
    },
  ],

  how: [
    "Enter child's date of birth, sex, and one or more measurements (date, weight, height, head circumference for infants).",
    "GrowthChart computes exact percentiles using WHO LMS parameters and analyses the growth trajectory over time.",
    "Get percentile position, velocity, crossing alerts, and suggestions for what to discuss with the paediatrician.",
  ],

  integrations: ["FlowForge", "Print/PDF", "Paediatric clinics"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "For any parent tracking their child's growth.",
      features: ["WHO percentile calculation", "Growth velocity", "Percentile crossing alerts", "Multiple parameters", "Paediatrician prompts"],
      cta: "Check growth",
      monthlyRuns: 50,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Pro",
      price: "$9",
      period: "/mo",
      blurb: "For paediatricians and clinics.",
      features: [
        "REST API + MCP server access",
        "Multi-patient tracking",
        "Printable growth charts",
        "EMR integration",
        "Priority support",
      ],
      cta: "Start 14-day trial",
      highlight: true,
      monthlyRuns: 5_000,
      apiAccess: true,
      rateLimitPerMin: 120,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "/mo",
      blurb: "For government health programmes and NGOs.",
      features: [
        "Volume pricing",
        "Self-hosted Docker image",
        "Population-level analytics",
        "SSO and audit log",
        "White-label embedding",
      ],
      cta: "Talk to us",
      monthlyRuns: Number.POSITIVE_INFINITY,
      apiAccess: true,
      rateLimitPerMin: 600,
    },
  ],

  faq: [
    {
      q: "Which growth standards does this use?",
      a: "WHO Child Growth Standards (2006) for 0-5 years and WHO Reference (2007) for 5-19 years. These are the globally recommended standards adopted by the Government of India and IAP (Indian Academy of Pediatrics).",
    },
    {
      q: "What is the LMS method?",
      a: "LMS stands for Lambda (skewness), Mu (median), Sigma (coefficient of variation). The WHO provides these parameters for every age in months by sex. The exact percentile is computed from the z-score: Z = ((measurement/M)^L - 1) / (L*S). This gives a precise percentile rather than a zone.",
    },
    {
      q: "Is 25th percentile a problem?",
      a: "Not by itself. A child consistently tracking along the 25th percentile from birth is growing normally for their genetic potential. What matters is the TREND: dropping from 50th to 25th is a red flag. Stable tracking at any percentile (3rd to 97th) is usually fine.",
    },
    {
      q: "When should I see a doctor?",
      a: "When the tool flags percentile crossing (dropping across two major percentile lines), very low growth velocity, or weight-for-height below 3rd percentile (acute wasting). These are prompts for evaluation, not diagnoses.",
    },
    {
      q: "Does this replace my paediatrician?",
      a: "Absolutely not. This is a measurement tracking tool that makes data visible. Your paediatrician considers feeding history, illness, family history, developmental milestones, and examination findings that no calculator can assess.",
    },
  ],

  inputs: [
    {
      name: "dateOfBirth",
      label: "Date of birth",
      type: "text",
      required: true,
      placeholder: "2022-06-15",
      help: "Child's date of birth in YYYY-MM-DD format.",
    },
    {
      name: "sex",
      label: "Sex",
      type: "select",
      required: true,
      options: ["Male", "Female"],
      help: "Biological sex. Growth standards differ between boys and girls.",
    },
    {
      name: "measurements",
      label: "Measurements (date,weight_kg,height_cm per line)",
      type: "textarea",
      required: true,
      placeholder: "2022-12-15,7.2,65.5\n2023-03-15,8.1,70.2\n2023-06-15,9.0,74.5\n2023-12-15,10.2,79.8\n2024-06-15,12.0,86.0",
      help: "One measurement per line: date,weight_kg,height_cm. At least 2 measurements for trend analysis. Head circumference optional as 4th value for infants.",
      rows: 5,
    },
  ],

  sample: {
    dateOfBirth: "2022-06-15",
    sex: "Male",
    measurements: "2022-12-15,7.2,65.5\n2023-03-15,8.1,70.2\n2023-06-15,9.0,74.5\n2023-12-15,10.2,79.8\n2024-06-15,12.0,86.0",
  },

  mcpTool: {
    name: "child_growth_chart",
    description:
      "Plot child's growth against WHO standards using LMS method to compute exact percentiles for weight-for-age, height-for-age, and weight-for-height. Detects percentile crossing, computes growth velocity, and flags patterns for paediatric review.",
  },
};
