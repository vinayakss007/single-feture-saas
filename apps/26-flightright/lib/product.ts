import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "flightright",
  name: "FlightRight",
  tagline: "What the airline actually owes you, and the letter to claim it",
  oneLiner:
    "Describe a delayed or cancelled flight and get the compensation, refund and duty-of-care you are entitled to under EU261 or DGCA rules, which of them survive a weather excuse, and a claim letter ready to send.",
  category: "Travel rights",
  audience: "Anyone whose flight was delayed, cancelled or overbooked, and who was offered a voucher",
  accent: "#0284c7",
  accentSoft: "#f0f9ff",

  metrics: [
    { value: "€600", label: "Maximum EU261 compensation per passenger" },
    { value: "3", label: "Separate entitlements airlines conflate into one" },
    { value: "0", label: "Percentage taken — claim companies take 25–35%" },
  ],

  problem: [
    {
      title: "The airline offers a voucher and calls it settled",
      body:
        "Compensation, refund and duty of care are three separate entitlements. Airlines routinely offer credit against one of them and let you believe the matter is closed. Accepting a voucher can extinguish the cash claim entirely.",
    },
    {
      title: "'Technical fault' is used to refuse claims it does not cover",
      body:
        "Under EU261 a maintenance problem is the airline's responsibility, not an extraordinary circumstance. It is nonetheless the most common reason given for refusal, and most passengers accept it.",
    },
    {
      title: "Claim companies take a third",
      body:
        "They send a letter you could have sent. For a €600 entitlement that is €200 for filling in a template — and they only take the easy cases anyway.",
    },
  ],

  features: [
    {
      title: "The right regime, chosen by route",
      body:
        "EU261 covers any departure from the EU, and arrivals into the EU on an EU carrier. DGCA rules cover domestic India and departures from India. Nationality of the airline alone does not decide it, which is where people go wrong.",
    },
    {
      title: "Compensation, refund and care separated",
      body:
        "Three distinct entitlements with three different tests. Seeing them apart is what stops a voucher looking like a settlement.",
    },
    {
      title: "What survives a weather excuse",
      body:
        "An extraordinary circumstance removes the fixed compensation only. Refund, rerouting and duty of care are unaffected — and that is exactly where most claimants give up.",
    },
    {
      title: "The distance band, computed",
      body:
        "EU261 pays by great-circle distance, with a halving rule for long-haul delays under four hours that airlines rarely volunteer.",
    },
    {
      title: "Four standard refusals, pre-answered",
      body:
        "Technical fault, voucher instead of refund, weather removing everything, and measuring delay at departure rather than arrival. Each with the sentence that answers it.",
    },
    {
      title: "A claim letter that pre-empts the reply",
      body:
        "Cites the regulation, itemises each entitlement, refuses a voucher in advance, and asks for evidence of causation where an extraordinary circumstance is claimed.",
    },
  ],

  how: [
    "Describe the disruption: delayed, cancelled or denied boarding, and how late you actually arrived.",
    "Give the route and rough distance — the bands are wide, so an approximate figure lands correctly.",
    "Say what reason the airline gave, if any.",
    "Read what is owed, then send the letter. Escalate if there is no substantive reply in fourteen days.",
  ],

  integrations: [
    "Claim letter as plain text for email or post",
    "JSON entitlements for a travel or expense tool",
    "REST API for a corporate travel desk handling disruptions at volume",
    "MCP server so an assistant can assess a disruption from a booking email",
    "Self-hosted Docker for a travel management company",
  ],

  pricing: [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      blurb: "For the flight that just went wrong.",
      features: [
        "25 assessments a month",
        "EU261 and DGCA entitlements",
        "Extraordinary-circumstance analysis",
        "Claim letter export",
      ],
      cta: "Check a flight",
      monthlyRuns: 25,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Traveller",
      price: "₹399",
      period: "/month",
      blurb: "For someone who flies enough for this to keep happening.",
      features: [
        "5,000 assessments a month",
        "REST API and MCP server access",
        "Multiple passengers per claim",
        "Escalation templates by jurisdiction",
        "Email support",
      ],
      cta: "Start on Traveller",
      highlight: true,
      monthlyRuns: 5_000,
      apiAccess: true,
      rateLimitPerMin: 120,
    },
    {
      name: "Travel desk",
      price: "Custom",
      period: "",
      blurb: "For a corporate travel desk or TMC.",
      features: [
        "Unlimited assessments",
        "Self-hosted Docker image",
        "Bulk disruption processing",
        "Custom carrier policies",
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
      q: "Is this legal advice?",
      a: "No. It applies the published thresholds in EU261 and the DGCA rules to the facts you enter. Whether a particular circumstance was genuinely extraordinary has been litigated extensively and can turn on facts only the airline holds — the output says so rather than implying certainty.",
    },
    {
      q: "The airline said it was a technical fault. Is that the end of it?",
      a: "Usually not, under EU261. Settled case law treats a technical or maintenance problem as inherent in the airline's activity rather than extraordinary, because the aircraft is their responsibility. It remains the most common reason given for refusal, which is why the claim letter answers it in a single sentence before they raise it.",
    },
    {
      q: "It was genuinely bad weather. Do I get nothing?",
      a: "You lose the fixed compensation, not everything else. The obligation to refund or reroute, and to provide meals and — if you are stranded overnight — a hotel, is unaffected by the cause. That distinction is the single most valuable thing on the page, because it is where most people stop claiming.",
    },
    {
      q: "Why not use a claim company?",
      a: "They take 25–35% for sending a letter, and they decline the marginal cases where the letter is most needed. If they succeed on a €600 claim you have paid around €200 for a template. Send it yourself, and use them only if the airline stonewalls and you would rather not litigate.",
    },
    {
      q: "How exact does the distance need to be?",
      a: "Rough is fine. The bands are 1,500 km and 3,500 km wide, so an approximate great-circle figure lands in the right one. Only a genuinely borderline case is worth measuring precisely, and the output tells you when you are near an edge.",
    },
    {
      q: "How long do I have to claim?",
      a: "Longer than you think, but do not rely on it. EU claims are governed by each member state's limitation period — commonly two to six years, and it varies by where you sue. DGCA complaints should be raised immediately and escalated to AirSewa if unresolved. The output flags this as a hard limit rather than a footnote.",
    },
  ],

  inputs: [
    {
      name: "route",
      label: "Where did the flight depart from and arrive?",
      type: "select",
      required: true,
      options: [
        "Domestic India",
        "From India to abroad",
        "From an EU or UK airport",
        "Into the EU on an EU or UK airline",
        "Neither — e.g. US to Asia",
      ],
      help: "This decides which rules apply. Departure point matters more than the airline's nationality.",
    },
    {
      name: "disruption",
      label: "What happened?",
      type: "select",
      required: true,
      options: ["Delayed on arrival", "Cancelled", "Denied boarding (overbooked)"],
    },
    {
      name: "delayHours",
      label: "How many hours late did you actually arrive?",
      type: "text",
      required: true,
      placeholder: "4",
      help: "Arrival, not departure. EU261 counts arrival delay and airlines quote the departure figure.",
    },
    {
      name: "distanceKm",
      label: "Flight distance in kilometres",
      type: "text",
      required: true,
      placeholder: "6200",
      help: "Rough great-circle distance. The compensation bands are wide.",
    },
    {
      name: "cause",
      label: "What reason did the airline give?",
      type: "select",
      required: true,
      options: [
        "Not stated by the airline",
        "Technical or maintenance fault",
        "Crew shortage or rostering",
        "Overbooked / denied boarding",
        "Weather at departure or arrival",
        "Air traffic control restriction",
        "Security alert or airport closure",
        "Strike by airport or ATC staff (not the airline's own)",
        "Strike by the airline's own staff",
      ],
    },
    {
      name: "noticeGiven",
      label: "How much notice were you given?",
      type: "select",
      required: true,
      options: ["No notice — found out at the airport", "Less than 7 days", "7 to 14 days", "More than 14 days"],
    },
    { name: "blockMinutes", label: "Scheduled flight time in minutes", type: "text", placeholder: "150", help: "Used for the DGCA cancellation bands." },
    { name: "fare", label: "Fare paid (₹)", type: "text", placeholder: "18400", help: "Some caps are the lower of a fixed sum and your fare." },
    { name: "airline", label: "Airline", type: "text", placeholder: "Lufthansa" },
    { name: "flightNo", label: "Flight number", type: "text", placeholder: "LH761" },
    { name: "flightDate", label: "Flight date", type: "text", placeholder: "2026-07-12" },
    { name: "routeText", label: "Route", type: "text", placeholder: "Bengaluru to Frankfurt" },
    { name: "passengerName", label: "Your name", type: "text", placeholder: "R. Iyer" },
    { name: "bookingRef", label: "Booking reference", type: "text", placeholder: "X7K2QP" },
  ],

  sample: {
    route: "Into the EU on an EU or UK airline",
    disruption: "Delayed on arrival",
    delayHours: "5",
    distanceKm: "7100",
    cause: "Technical or maintenance fault",
    noticeGiven: "No notice — found out at the airport",
    blockMinutes: "560",
    fare: "48200",
    airline: "Lufthansa",
    flightNo: "LH761",
    flightDate: "2026-07-12",
    routeText: "Bengaluru to Frankfurt",
    passengerName: "R. Iyer",
    bookingRef: "X7K2QP",
  },

  mcpTool: {
    name: "flightright_assess_claim",
    description:
      "Assess what an airline owes for a delayed, cancelled or overbooked flight under EU261 or India's DGCA rules. Takes the route, disruption type, arrival delay, great-circle distance, the reason the airline gave and the notice period. Returns the fixed compensation with its distance band including the long-haul halving rule, the separate rights to a refund or rerouting and to meals and accommodation, which of those survive an extraordinary-circumstance defence, the four standard airline refusals with the sentence that answers each, and a claim letter that pre-empts them.",
  },
};
