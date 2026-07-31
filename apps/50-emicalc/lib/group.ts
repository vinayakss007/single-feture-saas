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
    "slug": "freelancerate",
    "name": "FreelanceRate",
    "tagline": "What to charge per hour, based on what you actually need to earn",
    "category": "Finance tools",
    "accent": "#581c87",
    "url": "https://freelancerate.abetworks.in"
  },
  {
    "slug": "macroplate",
    "name": "MacroPlate",
    "tagline": "Hit your protein target from Indian food you actually eat",
    "category": "Nutrition tools",
    "accent": "#052e16",
    "url": "https://macroplate.abetworks.in"
  },
  {
    "slug": "visadocs",
    "name": "VisaDocs",
    "tagline": "Every document this visa needs, with what is missing",
    "category": "Travel tools",
    "accent": "#422006",
    "url": "https://visadocs.abetworks.in"
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
    "slug": "examplan",
    "name": "ExamPlan",
    "tagline": "How many hours per subject, and when to start",
    "category": "Education tools",
    "accent": "#134e4a",
    "url": "https://examplan.abetworks.in"
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
    "slug": "waterleak",
    "name": "WaterLeak",
    "tagline": "Find the leak from your water meter readings",
    "category": "Utility tools",
    "accent": "#164e63",
    "url": "https://waterleak.abetworks.in"
  },
  {
    "slug": "cropcal",
    "name": "CropCal",
    "tagline": "What to sow this week, for this soil, in this climate",
    "category": "Agriculture tools",
    "accent": "#365314",
    "url": "https://cropcal.abetworks.in"
  }
];
