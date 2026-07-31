// GENERATED FILE — DO NOT EDIT.
// Source: scripts/catalog.json   Regenerate: pnpm sync
//
// See generateGroupModules() in scripts/sync-template.mjs for why this is generated
// per app rather than fetched at runtime.

export const GROUP = {
  name: "Abet Works",
  site: "https://abetworks.in",
  productCount: 50,
} as const;

export type Sibling = {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  accent: string;
  url: string;
};

/** Nearest first: same category, then catalogue adjacency. */
export const siblings: Sibling[] = [
  {
    "slug": "legalnotice",
    "name": "LegalNotice",
    "tagline": "The legal notice that gets a reply, not a dustbin",
    "category": "Legal tools",
    "accent": "#831843",
    "url": "https://legalnotice.abetworks.in"
  },
  {
    "slug": "freelancerate",
    "name": "FreelanceRate",
    "tagline": "What to charge per hour, based on what you actually need to earn",
    "category": "Finance tools",
    "accent": "#581c87",
    "url": "https://freelancerate.abetworks.in"
  },
  {
    "slug": "packlist",
    "name": "PackList",
    "tagline": "The packing list for this trip, this weather, this many days",
    "category": "Travel tools",
    "accent": "#3f6212",
    "url": "https://packlist.abetworks.in"
  },
  {
    "slug": "waterleak",
    "name": "WaterLeak",
    "tagline": "Find the leak from your water meter readings",
    "category": "Utility tools",
    "accent": "#164e63",
    "url": "https://waterleak.abetworks.in"
  },
  {
    "slug": "petdose",
    "name": "PetDose",
    "tagline": "What your pet weighs and when each dose is due",
    "category": "Pet care",
    "accent": "#92400e",
    "url": "https://petdose.abetworks.in"
  },
  {
    "slug": "growthchart",
    "name": "GrowthChart",
    "tagline": "Is your child growing on track - percentiles, not guesses",
    "category": "Health tools",
    "accent": "#701a75",
    "url": "https://growthchart.abetworks.in"
  },
  {
    "slug": "carcost",
    "name": "CarCost",
    "tagline": "The real cost of owning this car, not just the EMI",
    "category": "Personal finance",
    "accent": "#1a2e05",
    "url": "https://carcost.abetworks.in"
  },
  {
    "slug": "examplan",
    "name": "ExamPlan",
    "tagline": "How many hours per subject, and when to start",
    "category": "Education tools",
    "accent": "#134e4a",
    "url": "https://examplan.abetworks.in"
  }
];
