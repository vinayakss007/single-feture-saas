"use client";

import { useState } from "react";
import type { ProductConfig, RunResult } from "@/lib/types";
import { ResultView } from "./result-view";

type ApiResponse = { ok: true; data: RunResult } | { ok: false; error: string; details?: unknown };

export function Runner({ p }: { p: ProductConfig }) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of p.inputs) initial[field.name] = "";
    return initial;
  });
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function set(name: string, v: string) {
    setValues((prev) => ({ ...prev, [name]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = (await res.json()) as ApiResponse;
      if (!payload.ok) {
        setError(payload.error);
        setResult(null);
      } else {
        setResult(payload.data);
      }
    } catch {
      setError("Could not reach the API. Check that the server is running and try again.");
      setResult(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-start">
      <form onSubmit={submit} className="rounded-2xl border p-6 lg:sticky lg:top-24">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Input</h2>
          <button
            type="button"
            onClick={() => {
              setValues({ ...values, ...p.sample });
              setError(null);
            }}
            className="rounded-md border px-2.5 py-1 text-xs font-medium transition hover:bg-[#fafbfd]"
          >
            Load example
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {p.inputs.map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name} className="block text-sm font-medium">
                {field.label}
                {field.required ? <span style={{ color: "var(--accent)" }}> *</span> : null}
              </label>
              {field.help ? <p className="mt-1 text-xs text-muted">{field.help}</p> : null}

              {field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  rows={field.rows ?? 8}
                  required={field.required}
                  placeholder={field.placeholder}
                  value={values[field.name] ?? ""}
                  onChange={(e) => set(field.name, e.target.value)}
                  className="mt-2 w-full resize-y rounded-lg border px-3 py-2.5 font-mono text-[13px] leading-relaxed outline-none focus:border-[var(--accent)]"
                />
              ) : field.type === "select" ? (
                <select
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  value={values[field.name] ?? ""}
                  onChange={(e) => set(field.name, e.target.value)}
                  className="mt-2 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
                >
                  <option value="">Select…</option>
                  {field.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type === "url" ? "text" : "text"}
                  required={field.required}
                  placeholder={field.placeholder}
                  value={values[field.name] ?? ""}
                  onChange={(e) => set(field.name, e.target.value)}
                  className="mt-2 w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
                />
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={busy}
          className="mt-7 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--accent)" }}
        >
          {busy ? "Running…" : `Run ${p.name}`}
        </button>
        <p className="mt-3 text-center text-xs text-muted">
          Runs on the same <code className="font-mono">/api/v1/run</code> endpoint your backend would call.
        </p>
      </form>

      <div>
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>
        ) : null}

        {!error && !result ? (
          <div className="rounded-2xl border border-dashed p-10 text-center">
            <p className="text-sm font-medium">No result yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              Hit <span className="font-medium">Load example</span> then <span className="font-medium">Run</span> to see
              exactly what {p.name} returns.
            </p>
          </div>
        ) : null}

        {result ? <ResultView result={result} /> : null}
      </div>
    </div>
  );
}
