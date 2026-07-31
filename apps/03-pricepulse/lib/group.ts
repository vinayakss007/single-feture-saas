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
    "slug": "churnsignal",
    "name": "ChurnSignal",
    "tagline": "Paste a CSV, find out which customers are about to leave",
    "category": "Customer success",
    "accent": "#e11d48",
    "url": "https://churnsignal.abetworks.in"
  },
  {
    "slug": "consentscan",
    "name": "ConsentScan",
    "tagline": "Scan any website for India DPDP and GDPR consent compliance",
    "category": "Privacy compliance",
    "accent": "#059669",
    "url": "https://consentscan.abetworks.in"
  },
  {
    "slug": "dealbrief",
    "name": "DealBrief",
    "tagline": "Turn any sales call transcript into a CRM-ready deal brief",
    "category": "Revenue operations",
    "accent": "#4f46e5",
    "url": "https://dealbrief.abetworks.in"
  },
  {
    "slug": "invoiceparse",
    "name": "InvoiceParse",
    "tagline": "Turn any invoice into clean data — and catch the GST errors",
    "category": "Finance automation",
    "accent": "#7c3aed",
    "url": "https://invoiceparse.abetworks.in"
  },
  {
    "slug": "coldangle",
    "name": "ColdAngle",
    "tagline": "Cold email openers that prove you actually did the research",
    "category": "Outbound sales",
    "accent": "#ea580c",
    "url": "https://coldangle.abetworks.in"
  },
  {
    "slug": "repurpose10",
    "name": "Repurpose10",
    "tagline": "One thing you wrote becomes ten platform-native posts",
    "category": "Content marketing",
    "accent": "#db2777",
    "url": "https://repurpose10.abetworks.in"
  },
  {
    "slug": "pingdeck",
    "name": "PingDeck",
    "tagline": "The three outages nobody monitors, checked in one place",
    "category": "Monitoring",
    "accent": "#2563eb",
    "url": "https://pingdeck.abetworks.in"
  },
  {
    "slug": "answerready",
    "name": "AnswerReady",
    "tagline": "Find out whether AI search can actually read your site",
    "category": "AI search optimisation",
    "accent": "#0d9488",
    "url": "https://answerready.abetworks.in"
  }
];
