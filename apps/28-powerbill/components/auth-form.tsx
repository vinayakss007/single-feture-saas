"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * One component for all four credential screens.
 *
 * They differ only in which fields are shown and which endpoint they post to, and
 * keeping them together is what stops "signup looks nothing like login" drift.
 */
export type AuthMode = "signup" | "login" | "forgot" | "reset";

const COPY: Record<AuthMode, { title: string; subtitle: string; submit: string; busy: string }> = {
  signup: {
    title: "Create your account",
    subtitle: "Free plan, no card. Takes about twenty seconds.",
    submit: "Create account",
    busy: "Creating account…",
  },
  login: {
    title: "Sign in",
    subtitle: "Welcome back.",
    submit: "Sign in",
    busy: "Signing in…",
  },
  forgot: {
    title: "Reset your password",
    subtitle: "We will email you a link. It is valid for one hour.",
    submit: "Send reset link",
    busy: "Sending…",
  },
  reset: {
    title: "Choose a new password",
    subtitle: "At least 10 characters, with a letter and a number.",
    submit: "Save new password",
    busy: "Saving…",
  },
};

export function AuthForm({
  mode,
  token,
  accountsEnabled = true,
}: {
  mode: AuthMode;
  token?: string;
  accountsEnabled?: boolean;
}) {
  const router = useRouter();
  const copy = COPY[mode];

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const showName = mode === "signup";
  const showEmail = mode === "signup" || mode === "login" || mode === "forgot";
  const showPassword = mode === "signup" || mode === "login" || mode === "reset";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setDone(null);

    const endpoint =
      mode === "signup"
        ? "/api/auth/signup"
        : mode === "login"
          ? "/api/auth/login"
          : "/api/auth/reset";

    const body =
      mode === "signup"
        ? { email, password, name }
        : mode === "login"
          ? { email, password }
          : mode === "forgot"
            ? { email }
            : { token, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await res.json()) as { ok: boolean; error?: string; data?: { note?: string } };

      if (!payload.ok) {
        setError(payload.error ?? "Something went wrong. Try again.");
        setBusy(false);
        return;
      }

      if (mode === "signup" || mode === "login") {
        // Server components read the cookie, so refresh before navigating.
        router.refresh();
        router.push("/dashboard");
        return;
      }

      setDone(
        mode === "forgot"
          ? (payload.data?.note ?? "Check your inbox for the reset link.")
          : "Password updated. You can sign in with it now.",
      );
      setBusy(false);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setBusy(false);
    }
  }

  if (!accountsEnabled) {
    return (
      <Card title="Accounts are not enabled here" subtitle="">
        <p className="text-sm leading-relaxed text-muted">
          This deployment has no <code className="rounded bg-[var(--accent-soft)] px-1.5 py-0.5 font-mono text-[13px]">DATABASE_URL</code>{" "}
          set, so it is running in demo mode: the live demo works, but there are no accounts, keys or billing.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Add a free Postgres database (Neon or Supabase both work) and redeploy. See{" "}
          <span className="font-mono text-[13px]">FRAMEWORK.md</span> for the five-minute version.
        </p>
        <Link href="/app" className="mt-6 inline-block text-sm font-semibold" style={{ color: "var(--accent)" }}>
          Use the live demo instead →
        </Link>
      </Card>
    );
  }

  return (
    <Card title={copy.title} subtitle={copy.subtitle}>
      {done ? (
        <div className="rounded-xl border p-4 text-sm leading-relaxed" style={{ background: "var(--accent-soft)" }}>
          {done}
          <div className="mt-3">
            <Link href="/login" className="font-semibold" style={{ color: "var(--accent)" }}>
              Go to sign in →
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {showName ? (
            <Field label="Name" hint="Optional">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="input"
                placeholder="Ada Lovelace"
              />
            </Field>
          ) : null}

          {showEmail ? (
            <Field label="Email">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="input"
                placeholder="you@company.com"
              />
            </Field>
          ) : null}

          {showPassword ? (
            <Field
              label="Password"
              hint={mode === "login" ? undefined : "At least 10 characters, with a letter and a number"}
            >
              <input
                type="password"
                required
                minLength={mode === "login" ? undefined : 10}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="input"
                placeholder="••••••••••"
              />
            </Field>
          ) : null}

          {error ? (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
            style={{ background: "var(--accent)", color: "var(--on-accent)" }}
          >
            {busy ? copy.busy : copy.submit}
          </button>
        </form>
      )}

      <div className="mt-6 space-y-2 text-sm text-muted">
        {mode === "login" ? (
          <>
            <p>
              No account yet?{" "}
              <Link href="/signup" className="font-semibold" style={{ color: "var(--accent)" }}>
                Create one free
              </Link>
            </p>
            <p>
              <Link href="/forgot-password" className="hover:text-ink">
                Forgotten your password?
              </Link>
            </p>
          </>
        ) : null}
        {mode === "signup" ? (
          <p>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "var(--accent)" }}>
              Sign in
            </Link>
          </p>
        ) : null}
        {mode === "forgot" || mode === "reset" ? (
          <p>
            <Link href="/login" className="hover:text-ink">
              Back to sign in
            </Link>
          </p>
        ) : null}
      </div>
    </Card>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {subtitle ? <p className="mt-2 text-sm text-muted">{subtitle}</p> : null}
      <div className="mt-7">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between">
        <span className="text-sm font-medium">{label}</span>
        {hint ? <span className="text-xs text-muted">{hint}</span> : null}
      </span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}
