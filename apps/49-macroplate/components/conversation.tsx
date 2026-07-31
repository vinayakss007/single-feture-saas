"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { InputField } from "@/lib/types";

/**
 * Conversational form: one question per screen.
 *
 * Worth being clear about why this exists, because a stepped form is not
 * automatically better. Asking ten questions on one screen makes a visitor read all
 * ten before answering any, and a product like AIActNotice or PaySlipIN loses people
 * at that moment. Asking one at a time removes that, keeps the keyboard on the
 * home row, and lets each question carry the help text it deserves.
 *
 * It is genuinely worse for a single large paste — nobody wants a full-screen
 * ceremony around "paste your HTML here". That is why the mode is chosen from the
 * shape of the inputs rather than applied everywhere, and why the classic view
 * remains one click away.
 *
 * Keyboard contract, which is the part that makes it feel fast:
 *   Enter          advance (Cmd/Ctrl+Enter in a textarea, since Enter is a newline)
 *   Shift+Enter    newline in a textarea
 *   1-9            pick that option on a choice question
 *   ArrowUp/Down   move between options
 *   Escape         back one question
 */

export type ConversationProps = {
  fields: InputField[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onSubmit: () => void;
  onLoadExample: () => void;
  busy: boolean;
  accent: string;
  productName: string;
  /** surfaced from the API so a validation failure lands on the right question */
  fieldErrors?: string[];
};

type Step = { kind: "question"; field: InputField; index: number } | { kind: "review" };

function isBlank(value: string | undefined): boolean {
  return value === undefined || value.trim() === "";
}

export function Conversation({
  fields,
  values,
  onChange,
  onSubmit,
  onLoadExample,
  busy,
  accent,
  productName,
  fieldErrors = [],
}: ConversationProps) {
  const steps: Step[] = useMemo(
    () => [...fields.map((field, index) => ({ kind: "question" as const, field, index })), { kind: "review" as const }],
    [fields],
  );

  const [at, setAt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const step = steps[at]!;
  const answered = fields.filter((f) => !isBlank(values[f.name])).length;

  // Focus follows the step, which is what makes the keyboard flow work at all.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (step.kind === "question" && step.field.type === "select") optionRefs.current[0]?.focus();
      else inputRef.current?.focus();
    }, 60);
    return () => clearTimeout(timer);
  }, [at, step]);

  // If the server rejects a field, jump to it rather than showing a banner the
  // visitor has to map back onto a question they can no longer see.
  useEffect(() => {
    if (fieldErrors.length === 0) return;
    const index = fields.findIndex((f) => f.name === fieldErrors[0]);
    if (index >= 0) {
      setAt(index);
      setError("The server could not accept this answer. Check it and continue.");
    }
  }, [fieldErrors, fields]);

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(steps.length - 1, next));
      setAt(clamped);
      setVisited((prev) => new Set(prev).add(clamped));
      setError(null);
    },
    [steps.length],
  );

  const advance = useCallback(() => {
    if (step.kind === "review") {
      onSubmit();
      return;
    }
    const { field } = step;
    if (field.required && isBlank(values[field.name])) {
      setError("This one is needed to run.");
      return;
    }
    if (field.type === "select" && !isBlank(values[field.name]) && field.options && !field.options.includes(values[field.name]!)) {
      setError("Pick one of the options.");
      return;
    }
    go(at + 1);
  }, [step, values, at, go, onSubmit]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      go(at - 1);
      return;
    }
    if (e.key === "Enter") {
      const inTextarea = step.kind === "question" && step.field.type === "textarea";
      // In a textarea Enter must insert a newline; advancing needs a modifier.
      if (inTextarea && !e.metaKey && !e.ctrlKey) return;
      e.preventDefault();
      advance();
    }
  }

  const progress = Math.round((Math.min(at, fields.length) / fields.length) * 100);

  return (
    <div className="rounded-2xl border bg-white" onKeyDown={onKeyDown}>
      {/* Progress */}
      <div className="border-b px-6 py-3.5">
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="font-medium text-muted">
            {step.kind === "review" ? "Review your answers" : `Question ${at + 1} of ${fields.length}`}
          </span>
          <button
            type="button"
            onClick={() => {
              onLoadExample();
              go(steps.length - 1);
            }}
            className="rounded-md border px-2.5 py-1 font-medium transition hover:bg-[#fafbfd]"
          >
            Fill with an example
          </button>
        </div>
        <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-[var(--accent-soft)]">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: accent }} />
        </div>
      </div>

      <div className="px-6 py-8 sm:px-8 sm:py-10">
        {step.kind === "question" ? (
          <QuestionStep
            field={step.field}
            value={values[step.field.name] ?? ""}
            onChange={(v) => {
              onChange(step.field.name, v);
              setError(null);
            }}
            onPick={(v) => {
              onChange(step.field.name, v);
              setError(null);
              // Choosing an option is an answer and an intent to move on.
              setTimeout(() => go(at + 1), 140);
            }}
            error={error}
            accent={accent}
            inputRef={inputRef}
            optionRefs={optionRefs}
          />
        ) : (
          <ReviewStep fields={fields} values={values} accent={accent} onEdit={(i) => go(i)} />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 border-t px-6 py-4">
        <button
          type="button"
          onClick={() => go(at - 1)}
          disabled={at === 0}
          className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:text-ink disabled:opacity-40"
        >
          ← Back
        </button>

        <div className="flex items-center gap-3">
          {step.kind === "question" && !step.field.required && isBlank(values[step.field.name]) ? (
            <button type="button" onClick={() => go(at + 1)} className="text-sm font-medium text-muted transition hover:text-ink">
              Skip
            </button>
          ) : null}

          <button
            type="button"
            onClick={advance}
            disabled={busy}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            style={{ background: accent }}
          >
            {step.kind === "review" ? (busy ? "Running…" : `Run ${productName}`) : "Continue"}
          </button>
        </div>
      </div>

      <p className="border-t px-6 py-3 text-center text-[11px] text-muted">
        <kbd className="rounded border px-1.5 py-0.5 font-sans">Enter</kbd> to continue ·{" "}
        <kbd className="rounded border px-1.5 py-0.5 font-sans">Esc</kbd> to go back
        {step.kind === "question" && step.field.type === "select" ? (
          <>
            {" "}
            · <kbd className="rounded border px-1.5 py-0.5 font-sans">1–9</kbd> to choose
          </>
        ) : null}
        {step.kind === "question" && step.field.type === "textarea" ? (
          <>
            {" "}
            · <kbd className="rounded border px-1.5 py-0.5 font-sans">⌘↵</kbd> to continue
          </>
        ) : null}
        {answered > 0 ? <> · {answered} answered</> : null}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------

function QuestionStep({
  field,
  value,
  onChange,
  onPick,
  error,
  accent,
  inputRef,
  optionRefs,
}: {
  field: InputField;
  value: string;
  onChange: (v: string) => void;
  onPick: (v: string) => void;
  error: string | null;
  accent: string;
  inputRef: React.MutableRefObject<HTMLTextAreaElement | HTMLInputElement | null>;
  optionRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
}) {
  const options = field.options ?? [];

  // Number keys select an option, which is how a keyboard user expects this to work.
  useEffect(() => {
    if (field.type !== "select") return;
    function handler(e: KeyboardEvent) {
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > options.length) return;
      e.preventDefault();
      onPick(options[n - 1]!);
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [field.type, options, onPick]);

  function onOptionKey(e: React.KeyboardEvent, index: number) {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      optionRefs.current[Math.min(options.length - 1, index + 1)]?.focus();
    }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      optionRefs.current[Math.max(0, index - 1)]?.focus();
    }
  }

  return (
    <div>
      <label htmlFor={field.name} className="block text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
        {field.label}
        {field.required ? <span style={{ color: accent }}> *</span> : null}
      </label>

      {field.help ? <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">{field.help}</p> : null}

      <div className="mt-7">
        {field.type === "select" ? (
          <div className="grid gap-2.5" role="group" aria-label={field.label}>
            {options.map((option, i) => {
              const selected = value === option;
              return (
                <button
                  key={option}
                  ref={(el) => {
                    optionRefs.current[i] = el;
                  }}
                  type="button"
                  onClick={() => onPick(option)}
                  onKeyDown={(e) => onOptionKey(e, i)}
                  aria-pressed={selected}
                  className="flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-[15px] transition hover:bg-[var(--accent-soft)] focus:outline-none focus-visible:ring-2"
                  style={selected ? { borderColor: accent, background: "var(--accent-soft)" } : undefined}
                >
                  <span
                    aria-hidden
                    className="grid size-6 shrink-0 place-items-center rounded-md border text-[11px] font-semibold"
                    style={selected ? { background: accent, color: "#fff", borderColor: accent } : undefined}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0">{option}</span>
                </button>
              );
            })}
          </div>
        ) : field.type === "textarea" ? (
          <textarea
            id={field.name}
            ref={inputRef as React.Ref<HTMLTextAreaElement>}
            rows={Math.min(field.rows ?? 8, 14)}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full resize-y rounded-xl border px-4 py-3.5 font-mono text-[13px] leading-relaxed outline-none focus:border-[var(--accent)]"
          />
        ) : (
          <input
            id={field.name}
            ref={inputRef as React.Ref<HTMLInputElement>}
            type="text"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-xl border px-4 py-3.5 text-lg outline-none focus:border-[var(--accent)]"
          />
        )}
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------

function ReviewStep({
  fields,
  values,
  accent,
  onEdit,
}: {
  fields: InputField[];
  values: Record<string, string>;
  accent: string;
  onEdit: (index: number) => void;
}) {
  const missing = fields.filter((f) => f.required && isBlank(values[f.name]));

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Ready to run</h2>
      <p className="mt-3 text-[15px] text-muted">
        {missing.length > 0
          ? `${missing.length} required answer${missing.length === 1 ? " is" : "s are"} still missing.`
          : "Check anything you want to change, then run it."}
      </p>

      <dl className="mt-7 divide-y">
        {fields.map((field, index) => {
          const value = values[field.name] ?? "";
          const blank = isBlank(value);
          const required = Boolean(field.required);
          return (
            <div key={field.name} className="flex items-start gap-4 py-3.5">
              <dt className="w-40 shrink-0 text-sm font-medium text-muted">{field.label}</dt>
              <dd className="min-w-0 flex-1 text-sm">
                {blank ? (
                  <span className={required ? "font-medium text-red-600" : "text-muted"}>
                    {required ? "Still needed" : "Skipped"}
                  </span>
                ) : (
                  <span className="block truncate whitespace-pre-wrap break-words font-mono text-[13px]">
                    {value.length > 160 ? `${value.slice(0, 160)}…` : value}
                  </span>
                )}
              </dd>
              <button
                type="button"
                onClick={() => onEdit(index)}
                className="shrink-0 text-xs font-semibold"
                style={{ color: accent }}
              >
                Edit
              </button>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
