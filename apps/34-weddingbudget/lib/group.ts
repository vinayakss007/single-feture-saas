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
    "slug": "schoolfee",
    "name": "SchoolFee",
    "tagline": "Compare school fees properly - total cost, not just tuition",
    "category": "Personal finance",
    "accent": "#155e75",
    "url": "https://schoolfee.abetworks.in"
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
    "slug": "loantruth",
    "name": "LoanTruth",
    "tagline": "The real interest rate on your loan, not the one you were quoted",
    "category": "Personal finance",
    "accent": "#1d4ed8",
    "url": "https://loantruth.abetworks.in"
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
    "slug": "sleepdebt",
    "name": "SleepDebt",
    "tagline": "How much sleep you owe yourself, and when to repay it",
    "category": "Health & wellness",
    "accent": "#4c1d95",
    "url": "https://sleepdebt.abetworks.in"
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
    "slug": "nutrilabel",
    "name": "NutriLabel",
    "tagline": "Read a food label and know what it actually means",
    "category": "Health & nutrition",
    "accent": "#065f46",
    "url": "https://nutrilabel.abetworks.in"
  },
  {
    "slug": "rtidraft",
    "name": "RTIDraft",
    "tagline": "The RTI application that gets answered, not ignored",
    "category": "Legal tools",
    "accent": "#854d0e",
    "url": "https://rtidraft.abetworks.in"
  }
];
