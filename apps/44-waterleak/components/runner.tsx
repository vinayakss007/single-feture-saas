"use client";

import { useState } from "react";
import type { ProductConfig, RunResult } from "@/lib/types";
import { ResultView } from "./result-view";
import { Conversation } from "./conversation";

type ApiResponse =
  | { ok: true; data: RunResult }
  | { ok: false; error: string; details?: { missingRequiredFields?: string[]; fieldsThatMustBeStrings?: string[] } };

/**
 * Decides which form to show first.
 *
 * A stepped, one-question-at-a-time form materially helps a product that asks
 * several short questions — nobody reads ten fields before answering the first. It
 * actively hurts a product whose input is one large paste, where a full-screen
 * ceremony around "paste your HTML" is just friction.
 *
 * So the default is derived from the shape of the inputs rather than applied
 * everywhere, and either way the visitor can switch. A product can override this
 * explicitly with `formMode` in its config when the heuristic reads it wrongly.
 */
function defaultMode(p: ProductConfig): "guided" | "classic" {
  if (p.formMode === "guided") return "guided";
  if (p.formMode === "classic") return "classic";

  const bigPaste = p.inputs.filter((f) => f.type === "textarea" && (f.rows ?? 0) >= 10).length;
  // One dominant paste field with little else around it: the classic form is better.
  if (bigPaste >= 1 && p.inputs.length <= 4) return "classic";
  return p.inputs.length >= 3 ? "guided" : "classic";
}

export function Runner({ p }: { p: ProductConfig }) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of p.inputs) initial[field.name] = "";
    return initial;
  });
  const [mode, setMode] = useState<"guided" | "classic">(() => defaultMode(p));
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  function set(name: string, v: string) {
    setValues((prev) => ({ ...prev, [name]: v }));
  }

  function loadExample() {
    setValues((prev) => ({ ...prev, ...p.sample }));
    setError(null);
    setFieldErrors([]);
  }

  async function submit() {
    setBusy(true);
    setError(null);
    setFieldErrors([]);
    try {
      const res = await fetch("/api/v1/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = (await res.json()) as ApiResponse;
      if (!payload.ok) {
        setError(payload.error);
        // Surfaced so the guided form can jump to the offending question instead
        // of showing a banner the visitor has to map back onto a hidden field.
        setFieldErrors([
          ...(payload.details?.missingRequiredFields ?? []),
          ...(payload.details?.fieldsThatMustBeStrings ?? []),
        ]);
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
    <div className="grid gap-8 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] lg:items-start">
      <div className="lg:sticky lg:top-24">
        {/* Mode switch. Offered rather than imposed, because which form is better
            genuinely depends on the question being asked. */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Try it</h2>
          <div className="flex rounded-lg border p-0.5 text-xs font-medium">
            {(["guided", "classic"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className="rounded-md px-2.5 py-1 transition"
                style={mode === m ? { background: p.accent, color: "var(--on-accent)" } : undefined}
              >
                {m === "guided" ? "One at a time" : "All fields"}
              </button>
            ))}
          </div>
        </div>

        {mode === "guided" ? (
          <Conversation
            fields={p.inputs}
            values={values}
            onChange={set}
            onSubmit={submit}
            onLoadExample={loadExample}
            busy={busy}
            accent={p.accent}
            productName={p.name}
            fieldErrors={fieldErrors}
          />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="rounded-2xl border bg-white p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-muted">All {p.inputs.length} fields</p>
              <button
                type="button"
                onClick={loadExample}
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
                      autoComplete={field.autocomplete}
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
                      autoComplete={field.autocomplete}
                      id={field.name}
                      name={field.name}
                      type="text"
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
              className="mt-7 w-full rounded-xl px-4 py-3 text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
              style={{ background: "var(--accent)", color: "var(--on-accent)" }}
            >
              {busy ? "Running…" : `Run ${p.name}`}
            </button>
          </form>
        )}

        <p className="mt-3 text-center text-xs text-muted">
          Runs on the same <code className="font-mono">/api/v1/run</code> endpoint your backend would call.
        </p>
      </div>

      <div>
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>
        ) : null}

        {!error && !result ? (
          <div className="rounded-2xl border border-dashed p-10 text-center">
            <p className="text-sm font-medium">No result yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              Hit <span className="font-medium">Fill with an example</span> then{" "}
              <span className="font-medium">Run</span> to see exactly what {p.name} returns.
            </p>
          </div>
        ) : null}

        {result ? <ResultView result={result} /> : null}
      </div>
    </div>
  );
}
