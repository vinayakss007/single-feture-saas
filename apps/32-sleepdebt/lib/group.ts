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
    "slug": "nutrilabel",
    "name": "NutriLabel",
    "tagline": "Read a food label and know what it actually means",
    "category": "Health & nutrition",
    "accent": "#065f46",
    "url": "https://nutrilabel.abetworks.in"
  },
  {
    "slug": "racepace",
    "name": "RacePace",
    "tagline": "The pace plan that gets you to the finish, not the wall",
    "category": "Fitness & endurance",
    "accent": "#b91c1c",
    "url": "https://racepace.abetworks.in"
  },
  {
    "slug": "propertytax",
    "name": "PropertyTax",
    "tagline": "Calculate your property tax before the notice arrives",
    "category": "Real estate & compliance",
    "accent": "#1e3a5f",
    "url": "https://propertytax.abetworks.in"
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
    "slug": "rentcheck",
    "name": "RentCheck",
    "tagline": "Is this rent fair for this area, and what to negotiate",
    "category": "Real estate & housing",
    "accent": "#7c2d12",
    "url": "https://rentcheck.abetworks.in"
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
    "slug": "powerbill",
    "name": "PowerBill",
    "tagline": "What is wrong with this electricity bill, in rupees",
    "category": "Utilities & consumer rights",
    "accent": "#d97706",
    "url": "https://powerbill.abetworks.in"
  },
  {
    "slug": "resumeats",
    "name": "ResumeATS",
    "tagline": "What an ATS actually sees in your resume",
    "category": "Career tools",
    "accent": "#dc2626",
    "url": "https://resumeats.abetworks.in"
  }
];
