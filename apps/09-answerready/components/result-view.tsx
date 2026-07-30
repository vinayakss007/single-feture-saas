"use client";

import { useState } from "react";
import type { RunResult, Severity } from "@/lib/types";

const SEVERITY_STYLE: Record<Severity, { bg: string; fg: string; label: string }> = {
  high: { bg: "#fee2e2", fg: "#b42318", label: "High" },
  medium: { bg: "#fef3c7", fg: "#b54708", label: "Medium" },
  low: { bg: "#dcfce7", fg: "#027a48", label: "Low" },
};

const BAND_COLOR = { good: "#12b76a", warn: "#f79009", bad: "#f04438" } as const;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          setCopied(false);
        }
      }}
      className="rounded-md border px-2.5 py-1 text-xs font-medium transition hover:bg-white"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function ScoreDial({ score }: { score: NonNullable<RunResult["score"]> }) {
  const pct = Math.max(0, Math.min(100, (score.value / score.max) * 100));
  const color = BAND_COLOR[score.band];
  return (
    <div className="flex items-center gap-5 rounded-2xl border bg-white p-5">
      <div
        className="grid size-24 shrink-0 place-items-center rounded-full"
        style={{ background: `conic-gradient(${color} ${pct}%, #eef0f5 ${pct}% 100%)` }}
      >
        <div className="grid size-[76px] place-items-center rounded-full bg-white">
          <span className="text-2xl font-semibold tracking-tight">{score.value}</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold">{score.label}</p>
        <p className="mt-1 text-sm text-muted">
          {score.value} out of {score.max}
        </p>
        <span
          className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
          style={{ background: `${color}1a`, color }}
        >
          {score.band === "good" ? "Healthy" : score.band === "warn" ? "Needs attention" : "Critical"}
        </span>
      </div>
    </div>
  );
}

export function ResultView({ result }: { result: RunResult }) {
  const [showJson, setShowJson] = useState(false);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border p-5" style={{ background: "var(--accent-soft)" }}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--accent)" }}>
          Result
        </p>
        <p className="mt-2 text-[17px] font-medium leading-relaxed">{result.headline}</p>
      </div>

      {result.score ? <ScoreDial score={result.score} /> : null}

      {result.metrics && result.metrics.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {result.metrics.map((m) => (
            <div key={m.label} className="rounded-xl border p-4">
              <p className="text-xs uppercase tracking-wide text-muted">{m.label}</p>
              <p className="mt-1.5 text-xl font-semibold tracking-tight">{m.value}</p>
              {m.hint ? <p className="mt-1 text-xs text-muted">{m.hint}</p> : null}
            </div>
          ))}
        </div>
      ) : null}

      {result.sections?.map((section) => (
        <div key={section.title} className="overflow-hidden rounded-2xl border">
          <div className="border-b bg-[#fafbfd] px-5 py-3">
            <h3 className="text-sm font-semibold">{section.title}</h3>
          </div>
          <ul className="divide-y">
            {section.items.length === 0 ? (
              <li className="px-5 py-4 text-sm text-muted">Nothing flagged here.</li>
            ) : (
              section.items.map((item, i) => {
                const sev = item.severity ? SEVERITY_STYLE[item.severity] : null;
                return (
                  <li key={`${section.title}-${i}`} className="px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      {item.title ? <p className="text-sm font-semibold">{item.title}</p> : null}
                      <div className="flex shrink-0 gap-2">
                        {item.tag ? (
                          <span className="rounded-full border px-2 py-0.5 text-[11px] font-medium text-muted">
                            {item.tag}
                          </span>
                        ) : null}
                        {sev ? (
                          <span
                            className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                            style={{ background: sev.bg, color: sev.fg }}
                          >
                            {sev.label}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <p className={`text-sm leading-relaxed text-muted ${item.title ? "mt-1.5" : ""}`}>{item.body}</p>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ))}

      {result.table ? (
        <div className="overflow-hidden rounded-2xl border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#fafbfd] text-left">
                <tr>
                  {result.table.columns.map((c) => (
                    <th key={c} className="whitespace-nowrap border-b px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {result.table.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-4 py-3 align-top">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {result.copyBlocks?.map((block) => (
        <div key={block.title} className="overflow-hidden rounded-2xl border">
          <div className="flex items-center justify-between border-b bg-[#fafbfd] px-5 py-3">
            <h3 className="text-sm font-semibold">{block.title}</h3>
            <CopyButton text={block.text} />
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap p-5 text-[13px] leading-relaxed">
            <code className={block.language === "json" || block.language === "csv" ? "font-mono" : undefined}>
              {block.text}
            </code>
          </pre>
        </div>
      ))}

      {result.json !== undefined ? (
        <div className="overflow-hidden rounded-2xl border">
          <div className="flex items-center justify-between border-b bg-[#fafbfd] px-5 py-3">
            <h3 className="text-sm font-semibold">Raw API response</h3>
            <div className="flex gap-2">
              <CopyButton text={JSON.stringify(result.json, null, 2)} />
              <button
                type="button"
                onClick={() => setShowJson((v) => !v)}
                className="rounded-md border px-2.5 py-1 text-xs font-medium transition hover:bg-white"
              >
                {showJson ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {showJson ? (
            <pre className="max-h-96 overflow-auto p-5 text-[12.5px] leading-relaxed">
              <code className="font-mono">{JSON.stringify(result.json, null, 2)}</code>
            </pre>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
