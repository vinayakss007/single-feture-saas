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
    "slug": "consentscan",
    "name": "ConsentScan",
    "tagline": "Scan any website for India DPDP and GDPR consent compliance",
    "category": "Privacy compliance",
    "accent": "#059669",
    "url": "https://consentscan.abetworks.in"
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
    "slug": "payslipin",
    "name": "PaySlipIN",
    "tagline": "One CTC figure becomes a compliant Indian payslip",
    "category": "Payroll compliance",
    "accent": "#047857",
    "url": "https://payslipin.abetworks.in"
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
    "slug": "dmarcfix",
    "name": "DMARCFix",
    "tagline": "Paste your SPF, DKIM and DMARC — get the corrected records",
    "category": "Email deliverability",
    "accent": "#c2410c",
    "url": "https://dmarcfix.abetworks.in"
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
    "slug": "contractclock",
    "name": "ContractClock",
    "tagline": "Paste a contract, find the auto-renewal you were about to miss",
    "category": "Contract operations",
    "accent": "#7e22ce",
    "url": "https://contractclock.abetworks.in"
  },
  {
    "slug": "gstmatch",
    "name": "GSTMatch",
    "tagline": "See the input tax credit you are about to lose, in rupees",
    "category": "Tax compliance",
    "accent": "#15803d",
    "url": "https://gstmatch.abetworks.in"
  }
];
