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
    "slug": "tripsplit",
    "name": "TripSplit",
    "tagline": "Settle a group trip in three transfers instead of eleven",
    "category": "Travel money",
    "accent": "#ca8a04",
    "url": "https://tripsplit.abetworks.in"
  },
  {
    "slug": "solarpayback",
    "name": "SolarPayback",
    "tagline": "Will rooftop solar actually pay for itself, and when",
    "category": "Energy & sustainability",
    "accent": "#16a34a",
    "url": "https://solarpayback.abetworks.in"
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
    "slug": "powerbill",
    "name": "PowerBill",
    "tagline": "What is wrong with this electricity bill, in rupees",
    "category": "Utilities & consumer rights",
    "accent": "#d97706",
    "url": "https://powerbill.abetworks.in"
  },
  {
    "slug": "vaxdue",
    "name": "VaxDue",
    "tagline": "Which childhood vaccines are overdue, due now and next",
    "category": "Child health",
    "accent": "#c026d3",
    "url": "https://vaxdue.abetworks.in"
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
    "slug": "labtrack",
    "name": "LabTrack",
    "tagline": "See which lab values are outside range, and which are moving",
    "category": "Health records",
    "accent": "#0f766e",
    "url": "https://labtrack.abetworks.in"
  },
  {
    "slug": "propertytax",
    "name": "PropertyTax",
    "tagline": "Calculate your property tax before the notice arrives",
    "category": "Real estate & compliance",
    "accent": "#1e3a5f",
    "url": "https://propertytax.abetworks.in"
  }
];
