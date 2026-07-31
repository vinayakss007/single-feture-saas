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
    "slug": "repurpose10",
    "name": "Repurpose10",
    "tagline": "One thing you wrote becomes ten platform-native posts",
    "category": "Content marketing",
    "accent": "#db2777",
    "url": "https://repurpose10.abetworks.in"
  },
  {
    "slug": "answerready",
    "name": "AnswerReady",
    "tagline": "Find out whether AI search can actually read your site",
    "category": "AI search optimisation",
    "accent": "#0d9488",
    "url": "https://answerready.abetworks.in"
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
    "slug": "promptshield",
    "name": "PromptShield",
    "tagline": "One API call between untrusted text and your agent",
    "category": "AI security",
    "accent": "#4338ca",
    "url": "https://promptshield.abetworks.in"
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
    "slug": "aiactnotice",
    "name": "AIActNotice",
    "tagline": "The EU AI Act notice your product legally needs, in one minute",
    "category": "AI governance",
    "accent": "#6d28d9",
    "url": "https://aiactnotice.abetworks.in"
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
    "slug": "a11ygate",
    "name": "A11yGate",
    "tagline": "Paste your HTML, get every WCAG failure and the EAA statement",
    "category": "Accessibility compliance",
    "accent": "#b45309",
    "url": "https://a11ygate.abetworks.in"
  }
];
