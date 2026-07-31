import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "petdose",
  name: "PetDose",
  tagline: "What your pet weighs and when each dose is due",
  oneLiner:
    "Enter species, breed, weight, and last treatment dates to compute next vaccine due dates, deworming schedule, flea/tick prevention timing, and weight-based dosing for common preventatives.",
  category: "Pet care",
  audience: "Pet owners in India, veterinarians, pet boarding facilities, animal shelters",
  accent: "#92400e",
  accentSoft: "#fffbeb",

  metrics: [
    { value: "6+", label: "Vaccine schedules tracked" },
    { value: "5", label: "Weight-based dose calculations" },
    { value: "12mo", label: "Complete calendar generated" },
  ],

  problem: [
    {
      title: "Nobody remembers when the next vaccine is due",
      body:
        "Core vaccines have different intervals: DHPP every 3 years for adults but annually for some vets, rabies annually or triennially, and boosters at specific ages. Pet owners lose track and either over-vaccinate or miss critical shots.",
    },
    {
      title: "Deworming and flea prevention have different schedules",
      body:
        "Puppies need deworming every 2 weeks until 12 weeks, then monthly until 6 months, then every 3 months for life. Flea/tick prevention is monthly. Heartworm prevention is monthly. These overlap but are not the same schedule.",
    },
    {
      title: "Dosing depends on weight and changes with growth",
      body:
        "A 12kg dog and a 25kg dog need different doses of the same preventative. Weight bands for ivermectin, milbemycin, and fipronil are specific and getting them wrong means under-dosing (ineffective) or over-dosing (toxic).",
    },
  ],

  features: [
    {
      title: "Vaccine schedule with next due dates",
      body:
        "Computes next due dates for core vaccines (DHPP and rabies for dogs, FVRCP and rabies for cats) based on last vaccination date and correct booster intervals.",
    },
    {
      title: "Deworming schedule by age",
      body:
        "Different frequency for puppies/kittens (every 2 weeks) vs juveniles (monthly) vs adults (every 3 months). Computes next dose date based on pet age and last deworming.",
    },
    {
      title: "Flea/tick and heartworm reminders",
      body:
        "Monthly prevention schedules with next application date. Flags overdue treatments that leave your pet exposed.",
    },
    {
      title: "Weight-based dosing",
      body:
        "Correct dose for common preventatives (ivermectin, milbemycin, fipronil, praziquantel) based on current weight. Shows which weight band product to buy.",
    },
    {
      title: "Overdue alerts",
      body:
        "Clearly flags which treatments are overdue with how many days past due, and what action to take (restart series, give immediately, consult vet).",
    },
    {
      title: "Vet visit card",
      body:
        "Produces a summary of what is due now vs what can wait, formatted for showing your vet. Includes weight, age, and current protection status.",
    },
  ],

  how: [
    "Enter species (dog/cat), breed, weight in kg, and last dates for vaccination, deworming, and flea/tick treatment.",
    "PetDose computes next due dates for all preventatives, calculates weight-based dosing, and flags anything overdue.",
    "Get a vet-visit card showing what is due now vs what can wait, with exact doses for your pet's weight.",
  ],

  integrations: ["FlowForge", "Calendar export", "Vet clinic systems"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "For pet parents who want to stay on top of preventative care.",
      features: ["Full schedule computation", "Weight-based dosing", "Overdue alerts", "Vet visit card", "Multi-pet support"],
      cta: "Check my pet's schedule",
      monthlyRuns: 50,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Clinic",
      price: "$19",
      period: "/mo",
      blurb: "For veterinary clinics managing multiple patients.",
      features: [
        "REST API + MCP server access",
        "Bulk patient scheduling",
        "SMS/email reminder integration",
        "Custom vaccine protocols",
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
      blurb: "For pet care platforms and insurance providers.",
      features: [
        "Volume pricing",
        "Self-hosted Docker image",
        "Breed database integration",
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
      q: "Are these vaccine schedules India-specific?",
      a: "Yes. The schedules follow Indian veterinary practice guidelines (IVMA recommendations). Core vaccines for dogs are DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza) and Rabies. For cats: FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia) and Rabies. Intervals match Indian protocols.",
    },
    {
      q: "My vet recommends annual DHPP boosters. You say every 3 years?",
      a: "Both are valid protocols. Research supports 3-year intervals for core vaccines in adult dogs after the initial series. However, some Indian vets recommend annual boosters due to higher disease pressure. The tool shows the standard 3-year interval but notes where annual may be preferred. Follow your vet's advice.",
    },
    {
      q: "Is weight-based dosing a substitute for veterinary advice?",
      a: "No. This shows standard dosing for healthy animals based on manufacturer weight bands. Always confirm with your vet, especially for pregnant animals, those with liver/kidney issues, or breeds with known drug sensitivities (e.g., Collies and ivermectin).",
    },
    {
      q: "My puppy is 3 months old. What is the vaccination schedule?",
      a: "Puppies start DHPP at 6-8 weeks with boosters every 3-4 weeks until 16 weeks. Rabies at 12-16 weeks. The tool computes remaining doses based on what has been given and when.",
    },
    {
      q: "What about non-core vaccines like kennel cough or leptospirosis?",
      a: "Non-core vaccines depend on lifestyle and geographic risk. The tool focuses on core vaccines that every pet needs. Kennel cough (Bordetella) is recommended if your dog goes to boarding, parks, or shows. Discuss non-core vaccines with your vet based on your pet's exposure.",
    },
  ],

  inputs: [
    {
      name: "species",
      label: "Species",
      type: "select",
      required: true,
      options: ["Dog", "Cat"],
      help: "Vaccine protocols differ between dogs and cats.",
    },
    {
      name: "breed",
      label: "Breed",
      type: "text",
      required: false,
      placeholder: "Labrador Retriever",
      help: "Optional. Some breeds have drug sensitivities (e.g., Collies with ivermectin).",
    },
    {
      name: "weight",
      label: "Current weight (kg)",
      type: "text",
      required: true,
      placeholder: "18",
      help: "Current weight in kg. Used for dose calculations. Weigh at the vet for accuracy.",
    },
    {
      name: "ageMonths",
      label: "Age in months",
      type: "text",
      required: true,
      placeholder: "36",
      help: "Approximate age in months. Determines if puppy/kitten schedule applies.",
    },
    {
      name: "lastVaccineDate",
      label: "Last core vaccine date (YYYY-MM-DD)",
      type: "text",
      required: true,
      placeholder: "2024-01-15",
      help: "Date of last DHPP (dogs) or FVRCP (cats) vaccination.",
    },
    {
      name: "lastRabiesDate",
      label: "Last rabies vaccine date (YYYY-MM-DD)",
      type: "text",
      required: false,
      placeholder: "2024-01-15",
      help: "Date of last rabies vaccination. Leave blank if never vaccinated.",
    },
    {
      name: "lastDewormDate",
      label: "Last deworming date (YYYY-MM-DD)",
      type: "text",
      required: true,
      placeholder: "2024-10-01",
      help: "Date of last deworming dose.",
    },
    {
      name: "lastFleaTickDate",
      label: "Last flea/tick treatment date (YYYY-MM-DD)",
      type: "text",
      required: false,
      placeholder: "2024-11-01",
      help: "Date of last flea/tick preventative application. Leave blank if not on prevention.",
    },
  ],

  sample: {
    species: "Dog",
    breed: "Labrador Retriever",
    weight: "28",
    ageMonths: "36",
    lastVaccineDate: "2024-01-15",
    lastRabiesDate: "2024-01-15",
    lastDewormDate: "2024-10-01",
    lastFleaTickDate: "2024-11-01",
  },

  mcpTool: {
    name: "pet_dose_schedule",
    description:
      "Compute next due dates for pet vaccines (DHPP/rabies for dogs, FVRCP/rabies for cats), deworming schedule, flea/tick prevention, heartworm prevention, and weight-based dosing for common preventatives. Flags overdue items.",
  },
};
