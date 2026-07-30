import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "pingdeck",
  name: "PingDeck",
  tagline: "The three outages nobody monitors, checked in one place",
  oneLiner:
    "Paste your URLs and get live response times, plus the two things that take sites down without warning: an expiring TLS certificate and an expiring domain. Includes a public status page you can host anywhere.",
  category: "Monitoring",
  audience: "Small teams, agencies and solo operators",
  accent: "#2563eb",
  accentSoft: "#eff6ff",

  metrics: [
    { value: "3", label: "Failure classes checked per URL" },
    { value: "~40%", label: "Of small-site outages are an expired cert or domain" },
    { value: "1 file", label: "Self-hosted status page, no dependencies" },
  ],

  problem: [
    {
      title: "Certificates expire on a Saturday",
      body:
        "Auto-renewal works right up until the day it silently does not. Every browser then shows an interstitial warning and your traffic goes to zero until someone notices.",
    },
    {
      title: "Domains expire quietly",
      body:
        "The renewal notice went to an inbox nobody reads, on a card that expired. This kills the site and the email at the same time, which is why nobody finds out quickly.",
    },
    {
      title: "Enterprise monitoring is overkill",
      body:
        "You do not need distributed synthetic checks and an APM contract to know whether five URLs are up and whether your cert has 12 days left.",
    },
  ],

  features: [
    {
      title: "Live response timing",
      body:
        "Real request timing per URL with the full redirect chain, final status code and payload size — not a cached third-party opinion.",
    },
    {
      title: "TLS certificate expiry",
      body:
        "Opens a real TLS connection, reads the certificate, and reports the issuer, the subject, the days remaining and whether the hostname actually matches.",
    },
    {
      title: "Domain expiry via RDAP",
      body:
        "Queries the registry directly for the registration expiry date, so a lapsing domain shows up weeks before it takes everything down.",
    },
    {
      title: "Redirect chain exposed",
      body:
        "Shows every hop. Chained redirects and http links that never upgrade are the most common quiet performance and SEO bug.",
    },
    {
      title: "A status page you own",
      body:
        "Generates a single self-contained HTML file with no external dependencies. Host it on any static host, on a different provider to your app.",
    },
    {
      title: "Built to be cronned",
      body:
        "One REST call checks everything. Point FlowForge at it every five minutes and alert only on a state change.",
    },
  ],

  how: [
    "Paste up to ten URLs, one per line. Apex domains, subdomains and full paths all work.",
    "PingDeck fetches each one, opens a TLS connection to read the certificate, and queries the registry for the domain expiry date.",
    "Copy the generated status page, or call the REST endpoint on a schedule from FlowForge and alert Slack when something changes state.",
  ],

  integrations: ["FlowForge", "Agent Fleet", "Slack", "PagerDuty", "GitHub Actions", "Cloudflare Pages", "Zapier / n8n"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "Check things when you think about it.",
      features: ["10 URLs per run", "Response, TLS and domain checks", "Generated status page", "No signup"],
      cta: "Check my sites",
    },
    {
      name: "Always on",
      price: "$19",
      period: "/mo",
      blurb: "For anyone who would rather be told than notice.",
      features: [
        "REST API + MCP server access",
        "Checks every 60 seconds",
        "Cert and domain alerts at 30, 14 and 3 days",
        "Hosted status page on your domain",
        "Slack, email and webhook alerts",
      ],
      cta: "Start 14-day trial",
      highlight: true,
    },
    {
      name: "Agency",
      price: "$79",
      period: "/mo",
      blurb: "For agencies answering for client uptime.",
      features: [
        "Up to 250 monitors",
        "Self-hosted Docker image",
        "White-label status pages per client",
        "Monthly uptime report per client",
        "SLA and shared Slack channel",
      ],
      cta: "Talk to us",
    },
  ],

  faq: [
    {
      q: "Is this a full uptime monitoring service?",
      a: "The free tier is an on-demand check, not a scheduler — it tells you the truth right now. Continuous checking every 60 seconds with alerting is the paid tier. The certificate and domain expiry checks are the genuinely differentiated part, and they are free.",
    },
    {
      q: "How is the TLS check done?",
      a: "A real TLS handshake to port 443 with the correct SNI hostname, then the peer certificate is read for issuer, subject alternative names and the not-after date. It is not inferred from the HTTP response.",
    },
    {
      q: "Which domains support the expiry lookup?",
      a: "Any TLD with an RDAP service, which now covers all gTLDs and most ccTLDs including .in. Where a registry does not publish RDAP the check is reported as unavailable rather than guessed.",
    },
    {
      q: "Why does the response time differ from my own measurement?",
      a: "Because it is measured from this server, not from your laptop. Use it for relative comparison and for catching sudden changes rather than as an absolute number.",
    },
    {
      q: "Can I self-host it?",
      a: "Yes, there is a Dockerfile in the repo. Self-hosting also lets you check internal hosts that are not reachable from the public internet.",
    },
    {
      q: "Can an agent run these checks?",
      a: "Yes. The MCP server exposes the check as a tool, so an Agent Fleet worker can run it, compare with the last result and open an incident itself.",
    },
  ],

  inputs: [
    {
      name: "urls",
      label: "URLs to check",
      type: "textarea",
      rows: 6,
      required: true,
      placeholder: "https://abetworks.in\nhttps://github.com\nexample.com",
      help: "One per line, up to ten. The scheme is optional — https is assumed.",
    },
    {
      name: "serviceName",
      label: "Service name",
      type: "text",
      placeholder: "Abet Works",
      help: "Shown as the heading on the generated status page.",
    },
  ],

  sample: {
    serviceName: "Abet Works",
    urls: "https://abetworks.in\nhttps://github.com\nhttps://vercel.com",
  },

  mcpTool: {
    name: "pingdeck_check_endpoints",
    description:
      "Check a list of URLs for availability, response time and redirect chain, plus read the live TLS certificate expiry and query the registry for domain registration expiry. Returns per-URL status, days remaining on certificates and domains, an overall health score, and a self-contained HTML status page.",
  },

  /**
   * The one product in the suite that reaches the network, because measuring the
   * live internet is the entire feature. Response times, status codes and
   * certificate expiry cannot be computed offline.
   *
   * Consequences, all deliberate: results are not cacheable, the engine can fail
   * because someone else's server is down, and the shared determinism test is
   * replaced by a shape-stability test.
   */
  probesNetwork: true,
};
