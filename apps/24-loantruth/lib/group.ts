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
    "slug": "weddingbudget",
    "name": "WeddingBudget",
    "tagline": "What an Indian wedding actually costs, by category",
    "category": "Personal finance",
    "accent": "#9d174d",
    "url": "https://weddingbudget.abetworks.in"
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
    "slug": "carcost",
    "name": "CarCost",
    "tagline": "The real cost of owning this car, not just the EMI",
    "category": "Personal finance",
    "accent": "#1a2e05",
    "url": "https://carcost.abetworks.in"
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
    "slug": "tripsplit",
    "name": "TripSplit",
    "tagline": "Settle a group trip in three transfers instead of eleven",
    "category": "Travel money",
    "accent": "#ca8a04",
    "url": "https://tripsplit.abetworks.in"
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
    "slug": "flightright",
    "name": "FlightRight",
    "tagline": "What the airline actually owes you, and the letter to claim it",
    "category": "Travel rights",
    "accent": "#0284c7",
    "url": "https://flightright.abetworks.in"
  },
  {
    "slug": "medibillcheck",
    "name": "MediBillCheck",
    "tagline": "Find the errors in a hospital bill before you pay it",
    "category": "Health finance",
    "accent": "#0e7490",
    "url": "https://medibillcheck.abetworks.in"
  }
];
