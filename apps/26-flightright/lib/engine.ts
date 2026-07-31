import type { ResultItem, RunInput, RunResult, Severity } from "./types.ts";

/**
 * Flight disruption compensation entitlement.
 *
 * Two regimes, chosen by route rather than by airline nationality, which is the
 * distinction people get wrong: EU261 covers any departure from the EU and arrivals
 * into the EU on an EU carrier. India's DGCA rules cover domestic and departures
 * from India.
 *
 * The engine's job is to separate the three things airlines conflate: compensation
 * (a fixed sum for the disruption), refund (your money back for a flight you did
 * not take), and duty of care (meals and hotel, owed regardless of cause). Airlines
 * routinely offer a voucher and call it settled, when all three may be owed.
 */

type Regime = "EU261" | "DGCA" | "none";

type Entitlement = {
  kind: "compensation" | "refund" | "rerouting" | "care" | "none";
  title: string;
  detail: string;
  amount: string;
  severity: Severity;
};

function toNumber(value: string | undefined): number {
  if (!value) return 0;
  const n = Number.parseFloat(String(value).replace(/[₹€$,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** EU261 bands are by great-circle distance, not by flight time. */
function eu261Amount(km: number, delayHours: number): { euros: number; note: string } {
  if (km <= 1500) return { euros: 250, note: "up to 1,500 km" };
  if (km <= 3500) return { euros: 400, note: "1,500–3,500 km, or any intra-EU flight over 1,500 km" };
  // Over 3,500 km outside the EU, a delay of 3–4 hours is halved.
  if (delayHours < 4) return { euros: 300, note: "over 3,500 km, reduced by half for a delay under 4 hours" };
  return { euros: 600, note: "over 3,500 km" };
}

/** DGCA compensation for a cancellation, banded by block time. */
function dgcaCancellationAmount(blockMinutes: number): number {
  if (blockMinutes <= 60) return 5000;
  if (blockMinutes <= 120) return 7500;
  return 10000;
}

/**
 * Circumstances airlines may rely on to refuse compensation. Two things matter and
 * are usually elided: technical faults are NOT extraordinary in settled case law,
 * and duty of care survives even when compensation does not.
 */
const EXTRAORDINARY = new Set([
  "Weather at departure or arrival",
  "Air traffic control restriction",
  "Security alert or airport closure",
  "Strike by airport or ATC staff (not the airline's own)",
]);

export async function run(input: RunInput): Promise<RunResult> {
  const km = toNumber(input.distanceKm);
  const delayHours = toNumber(input.delayHours);
  const disruption = input.disruption ?? "Delayed on arrival";
  const cause = input.cause ?? "Not stated by the airline";
  const notice = input.noticeGiven ?? "No notice — found out at the airport";
  const route = input.route ?? "Domestic India";
  const fare = toNumber(input.fare);
  const blockMinutes = toNumber(input.blockMinutes) || 120;

  if (km <= 0) throw new Error("Enter the flight distance in kilometres. A rough great-circle figure is fine — the bands are wide.");
  if (delayHours < 0) throw new Error("Delay hours cannot be negative.");

  const regime: Regime =
    route.startsWith("From an EU") || route.startsWith("Into the EU") ? "EU261" : route.startsWith("Domestic India") || route.startsWith("From India") ? "DGCA" : "none";

  const isExtraordinary = EXTRAORDINARY.has(cause);
  const technical = cause === "Technical or maintenance fault";
  const crewOrOverbooking = cause === "Crew shortage or rostering" || cause === "Overbooked / denied boarding";

  const entitlements: Entitlement[] = [];

  // --- compensation
  if (regime === "EU261") {
    const eligibleDelay = disruption === "Delayed on arrival" && delayHours >= 3;
    const cancelledLateNotice = disruption === "Cancelled" && !notice.startsWith("More than 14 days");
    const deniedBoarding = disruption === "Denied boarding (overbooked)";

    if (isExtraordinary) {
      entitlements.push({
        kind: "none",
        title: "No compensation, because the airline is citing an extraordinary circumstance",
        detail: `"${cause}" is generally accepted as outside the airline's control, which removes the fixed compensation. It does NOT remove your right to a refund or to meals and accommodation — airlines routinely present it as though it removes everything. If the disruption was long and the weather was only briefly bad, it is still worth asking them to evidence the causal link, which they are required to do.`,
        amount: "€0",
        severity: "medium",
      });
    } else if (eligibleDelay || cancelledLateNotice || deniedBoarding) {
      const { euros, note } = eu261Amount(km, delayHours);
      entitlements.push({
        kind: "compensation",
        title: `€${euros} fixed compensation per passenger`,
        detail: `Under Regulation 261/2004 for a ${km.toLocaleString()} km flight — ${note}. ${
          deniedBoarding
            ? "Denied boarding against your will attracts compensation regardless of delay length."
            : cancelledLateNotice
              ? `Cancellation with ${notice.toLowerCase()} attracts full compensation.`
              : `A delay of ${delayHours} hours or more on arrival attracts it.`
        }${technical ? " A technical or maintenance fault is not an extraordinary circumstance in settled case law, so the airline cannot rely on it to refuse — this is the most common wrongful refusal there is." : ""} This is per passenger, not per booking, and is independent of what you paid for the ticket.`,
        amount: `€${euros}`,
        severity: "high",
      });
    } else {
      entitlements.push({
        kind: "none",
        title: "Below the compensation threshold",
        detail:
          disruption === "Delayed on arrival"
            ? `A delay of ${delayHours} hours is under the 3-hour threshold measured at arrival, not departure. If the arrival delay was actually longer than you recorded, re-check — the gate time is not the relevant time.`
            : `Cancellation with more than 14 days' notice does not attract compensation, though a refund or rerouting is still owed.`,
        amount: "€0",
        severity: "low",
      });
    }
  } else if (regime === "DGCA") {
    if (disruption === "Cancelled" && notice.startsWith("No notice")) {
      const amount = dgcaCancellationAmount(blockMinutes);
      entitlements.push({
        kind: "compensation",
        title: `₹${amount.toLocaleString("en-IN")} compensation, or the fare, whichever is less`,
        detail: `DGCA CAR Section 3 Series M requires compensation where a cancellation is not notified at least two weeks ahead and you were not offered an alternative within two hours of the original time. Banded by block time: ₹5,000 up to an hour, ₹7,500 up to two hours, ₹10,000 beyond. Your ${blockMinutes}-minute flight falls in the ₹${amount.toLocaleString("en-IN")} band.${fare > 0 && fare < amount ? ` Your fare of ₹${fare.toLocaleString("en-IN")} is lower, so that is the cap.` : ""}`,
        amount: `₹${Math.min(amount, fare > 0 ? Math.max(fare, 0) : amount).toLocaleString("en-IN")}`,
        severity: "high",
      });
    } else if (disruption === "Denied boarding (overbooked)") {
      entitlements.push({
        kind: "compensation",
        title: "Up to 400% of one-way fare, capped at ₹20,000",
        detail:
          "Where you are denied boarding on an overbooked flight and the airline cannot get you onto an alternative within one hour, DGCA rules require 200% of one-way basic fare plus fuel surcharge, capped at ₹10,000 — rising to 400%, capped at ₹20,000, if the alternative is more than 24 hours later. Overbooking is never an extraordinary circumstance: the airline chose to sell the seat twice.",
        amount: "up to ₹20,000",
        severity: "high",
      });
    } else if (disruption === "Delayed on arrival") {
      entitlements.push({
        kind: "none",
        title: "No fixed compensation for delay under Indian rules",
        detail:
          "Unlike EU261, DGCA rules do not provide a fixed sum for delay alone. What they do require is meals, refreshments and — beyond six hours or an overnight — hotel accommodation and transfers. Those are owed regardless of the cause, and are what to claim here.",
        amount: "₹0",
        severity: "medium",
      });
    }
  } else {
    entitlements.push({
      kind: "none",
      title: "Neither EU261 nor DGCA applies to this route",
      detail:
        "Compensation depends on where you departed from and, for EU rules, whether the carrier is an EU airline when flying into the EU. On this route your rights come from the airline's own conditions of carriage and the Montreal Convention, which covers proven consequential loss rather than a fixed sum — keep receipts.",
      amount: "—",
      severity: "medium",
    });
  }

  // --- refund and rerouting
  if (disruption === "Cancelled" || disruption === "Denied boarding (overbooked)") {
    entitlements.push({
      kind: "refund",
      title: "Full refund, or rerouting — your choice, not theirs",
      detail: `${
        regime === "EU261"
          ? "Article 8 gives you the choice between a full refund within seven days and rerouting at the earliest opportunity."
          : "DGCA rules require a full refund of the fare, or an alternative flight, at your option."
      } A voucher is not a refund unless you accept one. Airlines routinely offer credit first and only mention cash if pressed — and accepting a voucher can extinguish the cash claim.${fare > 0 ? ` Your fare was ₹${fare.toLocaleString("en-IN")}.` : ""}`,
      amount: fare > 0 ? `₹${fare.toLocaleString("en-IN")}` : "full fare",
      severity: "high",
    });
  }

  // --- duty of care, which survives extraordinary circumstances
  if (delayHours >= 2 || disruption !== "Delayed on arrival") {
    entitlements.push({
      kind: "care",
      title: "Meals, refreshments and — if overnight — a hotel",
      detail: `Owed regardless of the cause. ${
        regime === "EU261"
          ? "Article 9 requires meals and refreshments proportionate to the wait, two free calls, and hotel accommodation plus transfers where an overnight stay becomes necessary. There is no upper limit and it applies even where compensation does not."
          : "DGCA rules require meals and refreshments, and beyond six hours or an overnight delay, hotel accommodation and transfers."
      } ${isExtraordinary ? "This is the part the airline cannot refuse by citing weather, and is what to insist on here." : ""} If you paid for these yourself, keep the receipts and claim them separately from compensation.`,
      amount: "actual cost",
      severity: isExtraordinary ? "high" : "medium",
    });
  }

  const compensation = entitlements.find((e) => e.kind === "compensation");
  const totalClaimable = compensation ? compensation.amount : "duty of care only";

  const sections: { title: string; items: ResultItem[] }[] = [
    {
      title: `What you can claim — ${regime === "none" ? "route-specific" : regime}`,
      items: entitlements.map((e) => ({ title: e.title, body: e.detail, tag: e.amount, severity: e.severity })),
    },
    {
      title: "How airlines refuse, and what to do",
      items: [
        {
          body: "Citing a technical fault. Under EU261 a technical or maintenance problem is not an extraordinary circumstance — the aircraft is the airline's responsibility. This is the most common wrongful refusal, and it is worth pushing back on with a single sentence.",
          severity: technical ? "high" : "low",
        },
        {
          body: "Offering a voucher. A voucher is not a refund and accepting one can extinguish the cash claim. Ask in writing for the refund under the regulation, and say you are not accepting credit.",
          severity: "medium",
        },
        {
          body: "Treating weather as removing everything. An extraordinary circumstance removes the fixed compensation only. Refund, rerouting and duty of care survive it — that distinction is where most claimants give up too early.",
          severity: isExtraordinary ? "high" : "low",
        },
        {
          body: "Measuring the delay at departure. EU261 counts arrival delay. A flight that leaves two hours late and lands three and a half hours late is a compensable delay, and airlines quote the departure figure.",
          severity: "medium",
        },
      ],
    },
    {
      title: "Limits of this assessment",
      items: [
        { body: "Not legal advice. It applies the published thresholds to what you entered. Whether a specific circumstance was genuinely extraordinary has been litigated extensively and can turn on facts only the airline holds.", severity: "medium" as Severity },
        { body: "Time limits vary and are strict. EU claims are governed by each member state's limitation period, commonly two to six years; DGCA complaints are best raised immediately and escalated to AirSewa if unresolved. Do not sit on it.", severity: "high" as Severity },
        { body: "Distance is great-circle between airports, not the route flown. The bands are wide enough that a rough figure lands in the right one, but a borderline case is worth checking precisely.", severity: "low" as Severity },
      ],
    },
  ];

  const letter = [
    `To: ${input.airline || "[Airline]"} — Customer Relations`,
    `Subject: Claim under ${regime === "EU261" ? "Regulation (EC) 261/2004" : regime === "DGCA" ? "DGCA CAR Section 3 Series M Part IV" : "your conditions of carriage"} — flight ${input.flightNo || "[flight number]"} on ${input.flightDate || "[date]"}`,
    "",
    `I was booked on flight ${input.flightNo || "[flight number]"} on ${input.flightDate || "[date]"}, ${input.routeText || "[route]"}, a distance of approximately ${km.toLocaleString()} km. The flight was ${disruption.toLowerCase()}${delayHours > 0 ? `, arriving ${delayHours} hours late` : ""}.`,
    "",
    "On that basis I am claiming the following:",
    "",
    ...entitlements
      .filter((e) => e.kind !== "none")
      .map((e, i) => `${i + 1}. ${e.title} — ${e.amount}`),
    "",
    ...(technical
      ? [
          "I note that a technical or maintenance fault is not an extraordinary circumstance within the meaning of the Regulation, and cannot be relied upon to refuse compensation.",
          "",
        ]
      : []),
    ...(isExtraordinary
      ? [
          `I note that even where an extraordinary circumstance applies, the obligations to refund or reroute and to provide meals and accommodation are unaffected. Please confirm those separately. If you intend to rely on "${cause.toLowerCase()}", please provide the evidence of the causal link.`,
          "",
        ]
      : []),
    "I am not accepting a travel voucher in place of a cash settlement.",
    "",
    "Please respond within 14 days. If I do not receive a substantive reply I will escalate to the relevant national enforcement body.",
    "",
    `${input.passengerName || "[Your name]"}`,
    `Booking reference: ${input.bookingRef || "[PNR]"}`,
  ].join("\n");

  return {
    headline: compensation
      ? `You are likely owed ${compensation.amount} per passenger, plus ${entitlements.some((e) => e.kind === "refund") ? "a full refund and " : ""}meals and accommodation. Claim letter below.`
      : isExtraordinary
        ? `No fixed compensation — the airline is citing "${cause.toLowerCase()}". But refund and duty of care still stand, and that is what to claim.`
        : `No fixed compensation on these facts, but ${entitlements.filter((e) => e.kind !== "none").length} other entitlement${entitlements.filter((e) => e.kind !== "none").length === 1 ? "" : "s"} apply.`,

    score: {
      label: compensation ? "Strong claim" : "Limited claim",
      value: compensation ? 85 : isExtraordinary ? 35 : 20,
      max: 100,
      band: compensation ? "good" : "warn",
    },

    metrics: [
      { label: "Regime", value: regime === "none" ? "Neither" : regime },
      { label: "Compensation", value: compensation?.amount ?? "none" },
      { label: "Distance band", value: km <= 1500 ? "≤1,500 km" : km <= 3500 ? "1,500–3,500 km" : ">3,500 km" },
      { label: "Entitlements", value: String(entitlements.filter((e) => e.kind !== "none").length) },
    ],

    sections,

    table: {
      columns: ["Entitlement", "Amount", "Survives extraordinary circumstances?"],
      rows: entitlements.map((e) => [
        e.title.slice(0, 52),
        e.amount,
        e.kind === "compensation" ? "no" : e.kind === "none" ? "—" : "yes",
      ]),
    },

    copyBlocks: [{ title: "Claim letter", text: letter, language: "text" }],

    json: {
      regime,
      distanceKm: km,
      disruption,
      cause,
      extraordinary: isExtraordinary,
      technicalFaultCited: technical,
      compensation: compensation ? { amount: compensation.amount, basis: compensation.title } : null,
      entitlements: entitlements.map((e) => ({ kind: e.kind, title: e.title, amount: e.amount })),
      totalClaimable,
      disclaimer: "Not legal advice. Applies published thresholds to the facts entered.",
    },
  };
}
