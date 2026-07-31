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
    "slug": "contractclock",
    "name": "ContractClock",
    "tagline": "Paste a contract, find the auto-renewal you were about to miss",
    "category": "Contract operations",
    "accent": "#7e22ce",
    "url": "https://contractclock.abetworks.in"
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
    "slug": "dmarcfix",
    "name": "DMARCFix",
    "tagline": "Paste your SPF, DKIM and DMARC — get the corrected records",
    "category": "Email deliverability",
    "accent": "#c2410c",
    "url": "https://dmarcfix.abetworks.in"
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
    "slug": "payslipin",
    "name": "PaySlipIN",
    "tagline": "One CTC figure becomes a compliant Indian payslip",
    "category": "Payroll compliance",
    "accent": "#047857",
    "url": "https://payslipin.abetworks.in"
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
    "slug": "vendortrace",
    "name": "VendorTrace",
    "tagline": "Your vendor list becomes the subprocessor register buyers ask for",
    "category": "Privacy compliance",
    "accent": "#a21caf",
    "url": "https://vendortrace.abetworks.in"
  },
  {
    "slug": "tripsplit",
    "name": "TripSplit",
    "tagline": "Settle a group trip in three transfers instead of eleven",
    "category": "Travel money",
    "accent": "#ca8a04",
    "url": "https://tripsplit.abetworks.in"
  }
];
