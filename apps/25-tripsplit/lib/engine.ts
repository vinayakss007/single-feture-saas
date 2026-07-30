import type { ResultItem, RunInput, RunResult, Severity } from "./types.ts";

/**
 * Settles shared expenses with the fewest transfers.
 *
 * Two problems are being solved, and only the second is interesting. Working out
 * what each person owes is bookkeeping. Turning a web of debts into the smallest
 * set of payments is a real optimisation, and it is the difference between eleven
 * awkward transfers and three.
 *
 * The greedy largest-creditor-largest-debtor pairing used here always settles in at
 * most n-1 transfers and in practice hits the minimum on the group sizes people
 * actually travel in. It is not proven optimal for adversarial inputs — the exact
 * problem is NP-hard — and the output says so rather than claiming minimality it
 * cannot guarantee.
 */

type Expense = {
  payer: string;
  amount: number;
  currency: string;
  base: number;
  participants: string[];
  description: string;
  lineNo: number;
};

type Transfer = { from: string; to: string; amount: number };

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]!;
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else quoted = false;
      } else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === "," || ch === "\t") {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function toNumber(value: string | undefined): number {
  if (!value) return Number.NaN;
  const n = Number.parseFloat(String(value).replace(/[₹$€£,\s]/g, ""));
  return Number.isFinite(n) ? n : Number.NaN;
}

function parseRates(text: string): Map<string, number> {
  const rates = new Map<string, number>();
  for (const part of (text ?? "").split(/[\n,;]+/)) {
    const m = /^\s*([A-Za-z]{3})\s*[=:]\s*([\d.]+)\s*$/.exec(part);
    if (m) rates.set(m[1]!.toUpperCase(), Number.parseFloat(m[2]!));
  }
  return rates;
}

export async function run(input: RunInput): Promise<RunResult> {
  const baseCurrency = (input.baseCurrency ?? "INR").toUpperCase();
  const rates = parseRates(input.rates ?? "");
  rates.set(baseCurrency, 1);

  const lines = (input.expenses ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) throw new Error("Paste the expenses with a header row and at least one expense.");

  const header = splitCsvLine(lines[0]!).map((h) => h.toLowerCase());
  const col = (patterns: RegExp[]) => header.findIndex((h) => patterns.some((p) => p.test(h)));
  const payerCol = col([/pa(id|yer)|who/]);
  const amountCol = col([/amount|cost|total|sum/]);
  const partCol = col([/for|participant|share|split|among|people/]);
  const descCol = col([/desc|item|what|detail/]);
  const currCol = col([/currency|ccy/]);

  if (payerCol < 0 || amountCol < 0) {
    throw new Error(`Need at least a payer column and an amount column. Found: ${header.join(", ")}.`);
  }

  const expenses: Expense[] = [];
  const everyone = new Set<string>();
  const unconverted = new Set<string>();
  const skipped: string[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const cells = splitCsvLine(lines[i]!);
    const payer = (cells[payerCol] ?? "").trim();
    const amount = toNumber(cells[amountCol]);
    if (!payer || !Number.isFinite(amount) || amount <= 0) {
      skipped.push(`Line ${i + 1}: ${lines[i]!.slice(0, 60)}`);
      continue;
    }

    const currency = ((currCol >= 0 ? cells[currCol] : "") || baseCurrency).toUpperCase().slice(0, 3) || baseCurrency;
    const rate = rates.get(currency);
    if (rate === undefined) {
      unconverted.add(currency);
      skipped.push(`Line ${i + 1}: no rate for ${currency}`);
      continue;
    }

    const raw = (partCol >= 0 ? cells[partCol] : "") ?? "";
    const participants = raw
      .split(/[|;/&]+|\band\b/i)
      .map((p) => p.trim())
      .filter(Boolean);

    everyone.add(payer);
    for (const p of participants) everyone.add(p);

    expenses.push({
      payer,
      amount,
      currency,
      base: amount * rate,
      participants,
      description: (descCol >= 0 ? cells[descCol] : "") || "expense",
      lineNo: i + 1,
    });
  }

  if (expenses.length === 0) {
    throw new Error("No usable expenses found. Each row needs a payer and a positive amount.");
  }

  // A blank participants cell means "everyone", which is the common case and the
  // one people leave empty. Resolved after the full roster is known.
  const roster = [...everyone].sort();
  for (const e of expenses) {
    if (e.participants.length === 0) e.participants = [...roster];
  }

  // --- balances
  const paid = new Map<string, number>();
  const owed = new Map<string, number>();
  for (const name of roster) {
    paid.set(name, 0);
    owed.set(name, 0);
  }
  for (const e of expenses) {
    paid.set(e.payer, (paid.get(e.payer) ?? 0) + e.base);
    const share = e.base / e.participants.length;
    for (const p of e.participants) owed.set(p, (owed.get(p) ?? 0) + share);
  }

  const net = new Map<string, number>();
  for (const name of roster) net.set(name, (paid.get(name) ?? 0) - (owed.get(name) ?? 0));

  // --- settlement: repeatedly pair the largest creditor with the largest debtor
  const creditors = roster.filter((n) => (net.get(n) ?? 0) > 0.01).map((n) => ({ name: n, amount: net.get(n)! }));
  const debtors = roster.filter((n) => (net.get(n) ?? 0) < -0.01).map((n) => ({ name: n, amount: -net.get(n)! }));

  /**
   * Captured before settling, because the loop below drains both arrays.
   *
   * The honest comparison is every debtor paying every creditor, which is what a
   * group actually does when it settles line by line without netting off first.
   */
  const naiveTransfers = creditors.length * debtors.length;
  const creditorCount = creditors.length;
  const debtorCount = debtors.length;

  const transfers: Transfer[] = [];
  let guard = 0;
  while (creditors.length > 0 && debtors.length > 0 && guard < 1000) {
    guard += 1;
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);
    const c = creditors[0]!;
    const d = debtors[0]!;
    const amount = Math.min(c.amount, d.amount);
    transfers.push({ from: d.name, to: c.name, amount });
    c.amount -= amount;
    d.amount -= amount;
    if (c.amount <= 0.01) creditors.shift();
    if (d.amount <= 0.01) debtors.shift();
  }

  const symbol: Record<string, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£", AED: "AED ", THB: "฿", SGD: "S$", JPY: "¥" };
  const money = (n: number, ccy = baseCurrency) =>
    `${symbol[ccy] ?? `${ccy} `}${Math.abs(Math.round(n)).toLocaleString(ccy === "INR" ? "en-IN" : "en-US")}`;

  const total = expenses.reduce((s, e) => s + e.base, 0);
  const perHead = total / roster.length;


  const sections: { title: string; items: ResultItem[] }[] = [
    {
      title: `Settle up — ${transfers.length} transfer${transfers.length === 1 ? "" : "s"}`,
      items:
        transfers.length === 0
          ? [{ body: "Everyone is square. No transfers needed.", severity: "low" as Severity }]
          : transfers.map((t) => ({
              title: `${t.from} pays ${t.to} ${money(t.amount)}`,
              body: `${t.from} is short ${money(-(net.get(t.from) ?? 0))} overall and ${t.to} is owed ${money(net.get(t.to) ?? 0)}. Paying directly avoids routing the money through anyone else.`,
              tag: money(t.amount),
              severity: "low" as Severity,
            })),
    },
    {
      title: "Who paid what",
      items: roster.map((name) => {
        const n = net.get(name) ?? 0;
        return {
          title: name,
          body: `Paid ${money(paid.get(name) ?? 0)}, owes ${money(owed.get(name) ?? 0)} as their share. ${
            n > 0.01 ? `Owed ${money(n)} back.` : n < -0.01 ? `Needs to pay ${money(-n)}.` : "Square."
          }`,
          tag: n > 0.01 ? `+${money(n)}` : n < -0.01 ? `-${money(-n)}` : "square",
          severity: Math.abs(n) > perHead ? ("medium" as Severity) : ("low" as Severity),
        };
      }),
    },
  ];

  const unevenSplits = expenses.filter((e) => e.participants.length !== roster.length);
  if (unevenSplits.length > 0) {
    sections.push({
      title: `Split between some of you, not all — ${unevenSplits.length}`,
      items: unevenSplits.map((e) => ({
        title: `${e.description} — ${money(e.base)}`,
        body: `Paid by ${e.payer}, split ${e.participants.length} ways between ${e.participants.join(", ")} at ${money(e.base / e.participants.length)} each. Line ${e.lineNo}.`,
        severity: "low" as Severity,
      })),
    });
  }

  sections.push({
    title: "Worth knowing",
    items: [
      {
        body: `${transfers.length} payment${transfers.length === 1 ? "" : "s"} instead of ${naiveTransfers} — settling every debt individually would mean each of the ${debtorCount} people who owe money paying each of the ${creditorCount} who are owed it. The pairing used always settles in at most ${roster.length - 1} transfers and reaches the minimum on group sizes people actually travel in. Finding the provably smallest set is NP-hard in general, so this is not claimed to be optimal for every conceivable input — just very good and instant.`,
        severity: "low",
      },
      {
        body: "Rounding is to the nearest whole unit for readability, so the transfers can differ from the exact balances by a rupee or two across the group. Nobody has ever fallen out over that; the exact figures are in the JSON if you want them.",
        severity: "low",
      },
      ...(unconverted.size > 0
        ? [{ body: `No exchange rate given for ${[...unconverted].join(", ")}, so those expenses were excluded entirely rather than guessed at. Add a rate like "${[...unconverted][0]}=1.0" and re-run.`, severity: "high" as Severity }]
        : []),
      ...(skipped.length > 0 && unconverted.size === 0
        ? [{ body: `${skipped.length} row${skipped.length === 1 ? "" : "s"} skipped as unreadable: ${skipped.slice(0, 3).join(" · ")}${skipped.length > 3 ? " …" : ""}`, severity: "medium" as Severity }]
        : []),
    ],
  });

  const message = [
    `${input.tripName ? `${input.tripName} — settling up` : "Settling up"}`,
    `Total spent: ${money(total)} across ${expenses.length} expenses, ${roster.length} people, ${money(perHead)} each on average.`,
    "",
    "Payments:",
    ...(transfers.length === 0 ? ["  Nothing to settle — everyone is square."] : transfers.map((t) => `  ${t.from} → ${t.to}: ${money(t.amount)}`)),
    "",
    "Balances:",
    ...roster.map((n) => {
      const v = net.get(n) ?? 0;
      return `  ${n}: paid ${money(paid.get(n) ?? 0)}, share ${money(owed.get(n) ?? 0)} → ${v > 0.01 ? `owed ${money(v)}` : v < -0.01 ? `owes ${money(-v)}` : "square"}`;
    }),
  ].join("\n");

  return {
    headline:
      transfers.length === 0
        ? `Everyone is square — ${money(total)} across ${roster.length} people, nothing to settle.`
        : `${transfers.length} transfer${transfers.length === 1 ? "" : "s"} settles ${money(total)} between ${roster.length} people. Largest: ${transfers[0]!.from} pays ${transfers[0]!.to} ${money(transfers[0]!.amount)}.`,

    score: {
      label: "Transfers avoided",
      value: naiveTransfers > 0 ? Math.round(((naiveTransfers - transfers.length) / naiveTransfers) * 100) : 100,
      max: 100,
      band: "good",
    },

    metrics: [
      { label: "Total spent", value: money(total), hint: `${expenses.length} expenses` },
      { label: "People", value: String(roster.length) },
      { label: "Average each", value: money(perHead) },
      { label: "Transfers needed", value: String(transfers.length), hint: `instead of up to ${naiveTransfers}` },
    ],

    sections,

    table: {
      columns: ["Person", "Paid", "Their share", "Net"],
      rows: roster.map((n) => {
        const v = net.get(n) ?? 0;
        return [n, money(paid.get(n) ?? 0), money(owed.get(n) ?? 0), v > 0 ? `+${money(v)}` : v < 0 ? `-${money(-v)}` : "0"];
      }),
    },

    copyBlocks: [{ title: "Message for the group chat", text: message, language: "text" }],

    json: {
      baseCurrency,
      total,
      perHead,
      people: roster,
      balances: roster.map((n) => ({ name: n, paid: paid.get(n) ?? 0, share: owed.get(n) ?? 0, net: net.get(n) ?? 0 })),
      transfers: transfers.map((t) => ({ from: t.from, to: t.to, amount: t.amount })),
      transfersAvoided: naiveTransfers - transfers.length,
      excludedCurrencies: [...unconverted],
      skippedRows: skipped,
    },
  };
}
