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
    "slug": "estateadmin",
    "name": "EstateAdmin",
    "tagline": "What has to happen after someone dies, in what order",
    "category": "Legal tools",
    "accent": "#450a0a",
    "url": "https://estateadmin.abetworks.in"
  },
  {
    "slug": "resumeats",
    "name": "ResumeATS",
    "tagline": "What an ATS actually sees in your resume",
    "category": "Career tools",
    "accent": "#dc2626",
    "url": "https://resumeats.abetworks.in"
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
    "slug": "schoolfee",
    "name": "SchoolFee",
    "tagline": "Compare school fees properly - total cost, not just tuition",
    "category": "Personal finance",
    "accent": "#155e75",
    "url": "https://schoolfee.abetworks.in"
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
    "slug": "weddingbudget",
    "name": "WeddingBudget",
    "tagline": "What an Indian wedding actually costs, by category",
    "category": "Personal finance",
    "accent": "#9d174d",
    "url": "https://weddingbudget.abetworks.in"
  },
  {
    "slug": "packlist",
    "name": "PackList",
    "tagline": "The packing list for this trip, this weather, this many days",
    "category": "Travel tools",
    "accent": "#3f6212",
    "url": "https://packlist.abetworks.in"
  }
];
