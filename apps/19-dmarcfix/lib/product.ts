import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "dmarcfix",
  name: "DMARCFix",
  tagline: "Paste your SPF, DKIM and DMARC — get the corrected records",
  oneLiner:
    "Paste your email authentication records and get every syntax error, the SPF lookup count against the hard limit of ten, whether you meet Gmail and Yahoo bulk-sender rules, and the exact corrected records to put in DNS.",
  category: "Email deliverability",
  audience: "Founders whose email lands in spam, ops and platform engineers, agencies running client domains",
  accent: "#c2410c",
  accentSoft: "#fff7ed",

  metrics: [
    { value: "10", label: "SPF DNS lookups, a hard limit that breaks silently" },
    { value: "Feb 2024", label: "When Gmail and Yahoo started rejecting" },
    { value: "0", label: "DNS queries — records are pasted in" },
  ],

  problem: [
    {
      title: "Gmail and Yahoo now reject, they do not just filter",
      body:
        "Bulk senders need authenticated mail with aligned domains and a DMARC record. Without them the message does not reach the spam folder — it is refused. Transactional email fails the same way.",
    },
    {
      title: "SPF breaks silently at ten lookups",
      body:
        "Every include adds DNS lookups, and every SaaS tool you send through adds includes. Past ten the record returns permerror and authentication fails — with no error anywhere you would think to look.",
    },
    {
      title: "p=none feels safe and does nothing",
      body:
        "Most domains publish a DMARC record in monitoring mode and stop. It satisfies a checkbox, provides no protection against spoofing, and increasingly fails to satisfy the receivers it was published for.",
    },
  ],

  features: [
    {
      title: "SPF lookups counted, not estimated",
      body:
        "Each include, a, mx, ptr and exists mechanism counted against the limit of ten, with the known lookup cost of the common providers, so you can see how close to the edge you are before it breaks.",
    },
    {
      title: "Every syntax trap checked",
      body:
        "Multiple SPF records on one domain — an automatic permerror. A trailing ~all after a redirect. The +all that authorises the entire internet. ptr mechanisms that receivers ignore.",
    },
    {
      title: "Alignment explained properly",
      body:
        "DMARC passes on aligned SPF or aligned DKIM. Relaxed versus strict, and why your subdomain sender might pass SPF and still fail DMARC — the failure that confuses everybody.",
    },
    {
      title: "Gmail and Yahoo bulk-sender checklist",
      body:
        "Their published requirements, checked one by one: authentication, alignment, a DMARC record, one-click unsubscribe on marketing mail, and the spam rate threshold.",
    },
    {
      title: "A safe path to enforcement",
      body:
        "Not just 'set p=reject'. A staged plan from none to quarantine with pct, with what to watch at each step, because moving straight to reject is how a company loses a week of invoices.",
    },
    {
      title: "The corrected records, ready to paste",
      body:
        "Fixed SPF with lookups reduced where possible, a proper DMARC record with reporting addresses, and the DKIM and BIMI records you are missing.",
    },
  ],

  how: [
    "Look up your records — `dig TXT yourdomain.com` or any DNS lookup page — and paste them in.",
    "Name the services you send from, so include coverage can be checked.",
    "Read the failures: syntax, lookup count, alignment, policy strength.",
    "Paste the corrected records into DNS and follow the staged plan to enforcement.",
  ],

  integrations: [
    "Any DNS provider — Cloudflare, Route 53, GoDaddy, Google Domains",
    "REST API to check a whole portfolio of domains",
    "MCP server so an agent can audit and fix DNS records",
    "JSON output for a monitoring dashboard",
    "Self-hosted Docker for internal domains",
  ],

  pricing: [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      blurb: "For the domain whose email keeps bouncing.",
      features: [
        "25 checks a month",
        "Full SPF, DKIM and DMARC analysis",
        "Lookup counting and alignment",
        "Corrected records and staged rollout plan",
      ],
      cta: "Check a domain",
      monthlyRuns: 25,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Deliverability",
      price: "₹1,499",
      period: "/month",
      blurb: "For a team that depends on email arriving.",
      features: [
        "5,000 checks a month",
        "REST API and MCP server access",
        "Monitor several domains from CI",
        "Alerts when a record changes",
        "Email support",
      ],
      cta: "Start on Deliverability",
      highlight: true,
      monthlyRuns: 5_000,
      apiAccess: true,
      rateLimitPerMin: 120,
    },
    {
      name: "Agency",
      price: "Custom",
      period: "",
      blurb: "For agencies managing many client domains.",
      features: [
        "Unlimited checks",
        "Self-hosted Docker image",
        "Bulk domain portfolio checks",
        "White-labelled client reports",
        "SLA and a shared Slack channel",
      ],
      cta: "Talk to us",
      monthlyRuns: Number.POSITIVE_INFINITY,
      apiAccess: true,
      rateLimitPerMin: 600,
    },
  ],

  faq: [
    {
      q: "Why do I paste the records instead of you looking them up?",
      a: "Three reasons. It stays deterministic, so the same records always produce the same verdict. It works on records you have not published yet, which is how you should test a change. And it works on internal domains that are not publicly resolvable.",
    },
    {
      q: "How can you count SPF lookups without DNS?",
      a: "Mechanisms that cost a lookup are countable from the record itself, and the common providers' nested include costs are well known and bundled — Google Workspace, Microsoft 365, SendGrid, Mailchimp and so on. For an unrecognised include it says the cost is unknown rather than assuming one, because a wrong count on the mechanism that matters most would be worse than admitting uncertainty.",
    },
    {
      q: "Should I go straight to p=reject?",
      a: "No. Publish p=none with reporting, read the reports for two to four weeks until you can account for every legitimate sender, then move to quarantine with a percentage, then reject. Jumping to reject is how a company discovers its invoicing system was sending unauthenticated mail — by losing a week of invoices.",
    },
    {
      q: "Do I need BIMI?",
      a: "No, it is optional. It shows your logo in supported clients and requires a Verified Mark Certificate, which costs over a thousand dollars a year. It is reported as an opportunity, not a failure, and it only works at p=quarantine or stricter anyway.",
    },
    {
      q: "What is the difference between SPF and DKIM alignment?",
      a: "SPF authenticates the envelope sender, which your email provider often controls, so it frequently does not match your visible From domain. DKIM signs with a key on a domain you choose, so it aligns more reliably. DMARC needs only one of them aligned — which is why DKIM alignment is usually the fix.",
    },
    {
      q: "Will fixing this get me out of the spam folder?",
      a: "It removes authentication as a reason for rejection, which is the hard blocker. Reputation, content, list hygiene and complaint rates still decide placement after that. The output says which category each problem falls into rather than promising the inbox.",
    },
  ],

  inputs: [
    { name: "domain", label: "Domain", type: "text", required: true, placeholder: "abetworks.in", help: "The domain in your From address." },
    {
      name: "spf",
      label: "SPF record",
      type: "textarea",
      rows: 3,
      required: true,
      placeholder: "v=spf1 include:_spf.google.com include:sendgrid.net ~all",
      help: "The TXT record at your domain root starting v=spf1. Paste all of them if there is more than one.",
    },
    {
      name: "dmarc",
      label: "DMARC record",
      type: "textarea",
      rows: 3,
      placeholder: "v=DMARC1; p=none; rua=mailto:dmarc@abetworks.in",
      help: "The TXT record at _dmarc.yourdomain.com. Leave blank if you have none.",
    },
    {
      name: "dkim",
      label: "DKIM selectors published",
      type: "text",
      placeholder: "google, sendgrid, s1",
      help: "Comma-separated selector names. Leave blank if you do not know them.",
    },
    {
      name: "senders",
      label: "Services you send email from",
      type: "textarea",
      rows: 3,
      placeholder: "Google Workspace, SendGrid, HubSpot, our own app server",
      help: "Used to check whether your SPF actually covers everything that sends as you.",
    },
    {
      name: "volume",
      label: "Daily email volume",
      type: "select",
      required: true,
      options: ["Under 500", "500 to 5,000", "Over 5,000 (bulk sender rules apply)"],
      help: "Gmail and Yahoo apply stricter rules above 5,000 messages a day to their users.",
    },
  ],

  sample: {
    domain: "abetworks.in",
    spf: "v=spf1 include:_spf.google.com include:sendgrid.net include:servers.mcsv.net include:mail.zendesk.com include:_spf.intercom.io a:mail.abetworks.in mx ptr ~all",
    dmarc: "v=DMARC1; p=none; rua=mailto:dmarc@abetworks.in; sp=none",
    dkim: "google, s1",
    senders: "Google Workspace for staff email, SendGrid for transactional, Mailchimp for the newsletter, Zendesk for support replies, Intercom for product messages, and our own app server at mail.abetworks.in",
    volume: "Over 5,000 (bulk sender rules apply)",
  },

  mcpTool: {
    name: "dmarcfix_audit_records",
    description:
      "Audit SPF, DKIM and DMARC email authentication records without any DNS queries. Takes the records as text plus the sending services and daily volume. Counts SPF DNS lookups against the hard limit of ten using known provider costs, finds syntax errors including multiple SPF records and unsafe all qualifiers, analyses DMARC policy strength and alignment mode, checks the Gmail and Yahoo bulk-sender requirements, and returns corrected records ready to paste into DNS plus a staged plan for moving safely to enforcement.",
  },
};
