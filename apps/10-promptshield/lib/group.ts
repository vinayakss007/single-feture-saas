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
    "slug": "answerready",
    "name": "AnswerReady",
    "tagline": "Find out whether AI search can actually read your site",
    "category": "AI search optimisation",
    "accent": "#0d9488",
    "url": "https://answerready.abetworks.in"
  },
  {
    "slug": "aiactnotice",
    "name": "AIActNotice",
    "tagline": "The EU AI Act notice your product legally needs, in one minute",
    "category": "AI governance",
    "accent": "#6d28d9",
    "url": "https://aiactnotice.abetworks.in"
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
    "slug": "a11ygate",
    "name": "A11yGate",
    "tagline": "Paste your HTML, get every WCAG failure and the EAA statement",
    "category": "Accessibility compliance",
    "accent": "#b45309",
    "url": "https://a11ygate.abetworks.in"
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
    "slug": "gstmatch",
    "name": "GSTMatch",
    "tagline": "See the input tax credit you are about to lose, in rupees",
    "category": "Tax compliance",
    "accent": "#15803d",
    "url": "https://gstmatch.abetworks.in"
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
    "slug": "einvoiceguard",
    "name": "eInvoiceGuard",
    "tagline": "Catch the e-invoice error before the portal rejects it",
    "category": "Finance automation",
    "accent": "#0369a1",
    "url": "https://einvoiceguard.abetworks.in"
  }
];
