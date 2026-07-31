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
    "slug": "a11ygate",
    "name": "A11yGate",
    "tagline": "Paste your HTML, get every WCAG failure and the EAA statement",
    "category": "Accessibility compliance",
    "accent": "#b45309",
    "url": "https://a11ygate.abetworks.in"
  },
  {
    "slug": "einvoiceguard",
    "name": "eInvoiceGuard",
    "tagline": "Catch the e-invoice error before the portal rejects it",
    "category": "Finance automation",
    "accent": "#0369a1",
    "url": "https://einvoiceguard.abetworks.in"
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
    "slug": "subaudit",
    "name": "SubAudit",
    "tagline": "Upload a card statement, find the subscriptions you forgot",
    "category": "Finance operations",
    "accent": "#be123c",
    "url": "https://subaudit.abetworks.in"
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
    "slug": "policypack",
    "name": "PolicyPack",
    "tagline": "The SOC 2 policy set an auditor expects, from ten answers",
    "category": "Security compliance",
    "accent": "#1e40af",
    "url": "https://policypack.abetworks.in"
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
    "slug": "vendortrace",
    "name": "VendorTrace",
    "tagline": "Your vendor list becomes the subprocessor register buyers ask for",
    "category": "Privacy compliance",
    "accent": "#a21caf",
    "url": "https://vendortrace.abetworks.in"
  }
];
