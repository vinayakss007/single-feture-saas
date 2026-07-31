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
    "slug": "rtidraft",
    "name": "RTIDraft",
    "tagline": "The RTI application that gets answered, not ignored",
    "category": "Legal tools",
    "accent": "#854d0e",
    "url": "https://rtidraft.abetworks.in"
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
    "slug": "packlist",
    "name": "PackList",
    "tagline": "The packing list for this trip, this weather, this many days",
    "category": "Travel tools",
    "accent": "#3f6212",
    "url": "https://packlist.abetworks.in"
  },
  {
    "slug": "cropcal",
    "name": "CropCal",
    "tagline": "What to sow this week, for this soil, in this climate",
    "category": "Agriculture tools",
    "accent": "#365314",
    "url": "https://cropcal.abetworks.in"
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
    "slug": "freelancerate",
    "name": "FreelanceRate",
    "tagline": "What to charge per hour, based on what you actually need to earn",
    "category": "Finance tools",
    "accent": "#581c87",
    "url": "https://freelancerate.abetworks.in"
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
    "slug": "waterleak",
    "name": "WaterLeak",
    "tagline": "Find the leak from your water meter readings",
    "category": "Utility tools",
    "accent": "#164e63",
    "url": "https://waterleak.abetworks.in"
  }
];
