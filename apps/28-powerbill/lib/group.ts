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
    "slug": "solarpayback",
    "name": "SolarPayback",
    "tagline": "Will rooftop solar actually pay for itself, and when",
    "category": "Energy & sustainability",
    "accent": "#16a34a",
    "url": "https://solarpayback.abetworks.in"
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
    "slug": "flightright",
    "name": "FlightRight",
    "tagline": "What the airline actually owes you, and the letter to claim it",
    "category": "Travel rights",
    "accent": "#0284c7",
    "url": "https://flightright.abetworks.in"
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
    "slug": "tripsplit",
    "name": "TripSplit",
    "tagline": "Settle a group trip in three transfers instead of eleven",
    "category": "Travel money",
    "accent": "#ca8a04",
    "url": "https://tripsplit.abetworks.in"
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
    "slug": "loantruth",
    "name": "LoanTruth",
    "tagline": "The real interest rate on your loan, not the one you were quoted",
    "category": "Personal finance",
    "accent": "#1d4ed8",
    "url": "https://loantruth.abetworks.in"
  },
  {
    "slug": "sleepdebt",
    "name": "SleepDebt",
    "tagline": "How much sleep you owe yourself, and when to repay it",
    "category": "Health & wellness",
    "accent": "#4c1d95",
    "url": "https://sleepdebt.abetworks.in"
  }
];
