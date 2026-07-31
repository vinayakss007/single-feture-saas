"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * The signed-in surface: usage against quota, API keys, plan and upgrade.
 *
 * All data is passed in from the server component so there is no loading spinner
 * on first paint. Mutations go through the same public JSON endpoints an external
 * client would use, which means the dashboard is a working reference for the API.
 */

export type KeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

export type DashboardProps = {
  user: { email: string; name: string | null };
  usage: {
    used: number;
    limit: number | null;
    remaining: number | null;
    percent: number;
    periodEnd: string;
    byDay: { day: string; units: number }[];
    recent: { endpoint: string; status: number; duration_ms: number | null; created_at: string }[];
  };
  plan: { code: string; name: string; price: string; period: string; apiAccess: boolean; rateLimitPerMin: number };
  subscription: { status: string; label: string; cancelAtPeriodEnd: boolean; currentPeriodEnd: string | null } | null;
  keys: KeyRow[];
  upgrade: { available: boolean; plans: { code: string; name: string; price: string; period: string }[] };
  accent: string;
  productName: string;
  runPath: string;
};

export function Dashboard(props: DashboardProps) {
  const router = useRouter();
  const { usage, plan, keys, upgrade } = props;

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [freshKey, setFreshKey] = useState<{ key: string; name: string } | null>(null);
  const [keyName, setKeyName] = useState("");

  async function post(path: string, body?: unknown) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return (await res.json()) as { ok: boolean; error?: string; data?: Record<string, unknown> };
  }

  async function createKey(e: React.FormEvent) {
    e.preventDefault();
    setBusy("key");
    setError(null);
    setFreshKey(null);
    const payload = await post("/api/keys", { name: keyName || "default" });
    setBusy(null);
    if (!payload.ok) {
      setError(payload.error ?? "Could not create the key.");
      return;
    }
    setFreshKey({ key: String(payload.data?.key ?? ""), name: String(payload.data?.name ?? "default") });
    setKeyName("");
    router.refresh();
  }

  async function revoke(id: string, label: string) {
    if (!confirm(`Revoke ${label}? Any client using it will start getting 401s immediately.`)) return;
    setBusy(id);
    setError(null);
    const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
    const payload = (await res.json()) as { ok: boolean; error?: string };
    setBusy(null);
    if (!payload.ok) {
      setError(payload.error ?? "Could not revoke the key.");
      return;
    }
    router.refresh();
  }

  async function startCheckout(planCode: string) {
    setBusy(`upgrade:${planCode}`);
    setError(null);
    const payload = await post("/api/billing/checkout", { plan: planCode });
    setBusy(null);
    if (!payload.ok || !payload.data?.url) {
      setError(payload.error ?? "Could not start the checkout.");
      return;
    }
    window.location.href = String(payload.data.url);
  }

  async function manage() {
    setBusy("portal");
    setError(null);
    const payload = await post("/api/billing/portal");
    setBusy(null);
    if (!payload.ok) {
      setError(payload.error ?? "Could not open billing.");
      return;
    }
    const url = payload.data?.url ?? payload.data?.mailto;
    if (url) window.location.href = String(url);
  }

  async function signOut() {
    setBusy("signout");
    await post("/api/auth/logout");
    router.refresh();
    router.push("/");
  }

  const unlimited = usage.limit === null;
  const near = !unlimited && usage.percent >= 80;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-5 py-12">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {props.user.name ? `Hello, ${props.user.name.split(" ")[0]}` : "Your dashboard"}
          </h1>
          <p className="mt-1 text-sm text-muted">{props.user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/app" className="text-sm font-semibold" style={{ color: props.accent }}>
            Open {props.productName} →
          </Link>
          <button
            onClick={signOut}
            disabled={busy === "signout"}
            className="rounded-lg border px-3.5 py-2 text-sm font-medium transition hover:bg-[var(--accent-soft)] disabled:opacity-60"
          >
            Sign out
          </button>
        </div>
      </div>

      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {/* Usage + plan */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 md:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">This month</h2>
            <span className="text-xs text-muted">Resets {usage.periodEnd}</span>
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {usage.used.toLocaleString()}
            <span className="text-base font-normal text-muted">
              {unlimited ? " runs" : ` / ${usage.limit?.toLocaleString()} runs`}
            </span>
          </p>

          {!unlimited ? (
            <>
              <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--accent-soft)]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.max(2, usage.percent)}%`,
                    background: near ? "#dc2626" : props.accent,
                  }}
                />
              </div>
              <p className="mt-2.5 text-sm text-muted">
                {near
                  ? `${usage.remaining?.toLocaleString()} runs left — you are at ${usage.percent}% of the ${plan.name} plan.`
                  : `${usage.remaining?.toLocaleString()} runs remaining.`}
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted">Your plan has no monthly cap.</p>
          )}

          {usage.byDay.length > 0 ? (
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Daily</p>
              <div className="flex h-16 items-end gap-1">
                {usage.byDay.map((d) => {
                  const peak = Math.max(...usage.byDay.map((x) => x.units), 1);
                  return (
                    <div
                      key={d.day}
                      title={`${d.day}: ${d.units} runs`}
                      className="flex-1 rounded-t"
                      style={{
                        height: `${Math.max(6, (d.units / peak) * 100)}%`,
                        background: props.accent,
                        opacity: 0.75,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Plan</h2>
          <p className="mt-3 text-xl font-semibold">{plan.name}</p>
          <p className="text-sm text-muted">
            {plan.price}
            {plan.period ? ` ${plan.period}` : ""}
          </p>

          {props.subscription && props.subscription.status !== "active" ? (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Status: {props.subscription.status}
              {props.subscription.status === "past_due"
                ? " — update your payment method to restore access."
                : ""}
            </p>
          ) : null}

          {props.subscription?.cancelAtPeriodEnd && props.subscription.currentPeriodEnd ? (
            <p className="mt-3 text-xs text-muted">
              Cancels on {props.subscription.currentPeriodEnd}. You keep access until then.
            </p>
          ) : null}

          <ul className="mt-4 space-y-1.5 text-sm text-muted">
            <li>{plan.apiAccess ? "API keys and MCP included" : "API keys need a paid plan"}</li>
            <li>{plan.rateLimitPerMin} requests/minute</li>
          </ul>

          <div className="mt-5 space-y-2">
            {upgrade.available && plan.code === "free"
              ? upgrade.plans.map((u) => (
                  <button
                    key={u.code}
                    onClick={() => startCheckout(u.code)}
                    disabled={busy === `upgrade:${u.code}`}
                    className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
                    style={{ background: "var(--accent)", color: "var(--on-accent)" }}
                  >
                    {busy === `upgrade:${u.code}` ? "Opening checkout…" : `Upgrade to ${u.name} — ${u.price}`}
                  </button>
                ))
              : null}

            {plan.code !== "free" ? (
              <button
                onClick={manage}
                disabled={busy === "portal"}
                className="w-full rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:bg-[var(--accent-soft)] disabled:opacity-60"
              >
                {busy === "portal" ? "Opening…" : "Manage billing"}
              </button>
            ) : null}

            {!upgrade.available && plan.code === "free" ? (
              <p className="text-xs leading-relaxed text-muted">
                Paid plans are not configured on this deployment yet. Set the Razorpay or Stripe keys and the plan id for
                this product to switch checkout on.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* API keys */}
      <div className="rounded-2xl border bg-white p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">API keys</h2>
          <code className="rounded bg-[var(--accent-soft)] px-2 py-1 font-mono text-xs">POST {props.runPath}</code>
        </div>

        {!plan.apiAccess ? (
          <p className="mt-4 text-sm leading-relaxed text-muted">
            API keys and the MCP server are part of the paid plan. Upgrade above and this section becomes usable
            immediately — no waiting and no sales call.
          </p>
        ) : (
          <>
            <form onSubmit={createKey} className="mt-4 flex flex-wrap gap-2">
              <input
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="Key name, e.g. production"
                className="input flex-1 min-w-[200px]"
                maxLength={60}
              />
              <button
                type="submit"
                disabled={busy === "key"}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
                style={{ background: "var(--accent)", color: "var(--on-accent)" }}
              >
                {busy === "key" ? "Creating…" : "Create key"}
              </button>
            </form>

            {freshKey ? (
              <div className="mt-4 rounded-xl border-2 p-4" style={{ borderColor: props.accent }}>
                <p className="text-sm font-semibold">Copy “{freshKey.name}” now — it is shown once.</p>
                <p className="mt-1 text-xs text-muted">
                  Only a hash is stored, so this value genuinely cannot be recovered. If you lose it, revoke the key and
                  make another.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <code className="flex-1 min-w-[260px] break-all rounded-lg bg-[var(--accent-soft)] px-3 py-2 font-mono text-[13px]">
                    {freshKey.key}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(freshKey.key)}
                    className="rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-[var(--accent-soft)]"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ) : null}

            {keys.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No keys yet.</p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase tracking-wide text-muted">
                      <th className="pb-2 pr-4 font-semibold">Name</th>
                      <th className="pb-2 pr-4 font-semibold">Key</th>
                      <th className="pb-2 pr-4 font-semibold">Last used</th>
                      <th className="pb-2 pr-4 font-semibold">Status</th>
                      <th className="pb-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {keys.map((k) => (
                      <tr key={k.id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-medium">{k.name}</td>
                        <td className="py-3 pr-4 font-mono text-xs text-muted">{k.key_prefix}…</td>
                        <td className="py-3 pr-4 text-muted">
                          {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : "never"}
                        </td>
                        <td className="py-3 pr-4">
                          {k.revoked_at ? (
                            <span className="text-muted">revoked</span>
                          ) : (
                            <span style={{ color: props.accent }}>active</span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          {k.revoked_at ? null : (
                            <button
                              onClick={() => revoke(k.id, k.name)}
                              disabled={busy === k.id}
                              className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-60"
                            >
                              {busy === k.id ? "Revoking…" : "Revoke"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Recent activity */}
      {usage.recent.length > 0 ? (
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Recent requests</h2>
          <div className="mt-4 space-y-2">
            {usage.recent.map((r, i) => (
              <div key={i} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <code className="font-mono text-xs text-muted">{r.endpoint}</code>
                <span className="flex items-center gap-3 text-muted">
                  <span style={{ color: r.status < 400 ? props.accent : "#dc2626" }}>{r.status}</span>
                  <span>{r.duration_ms ?? 0}ms</span>
                  <span>{new Date(r.created_at).toLocaleString()}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
