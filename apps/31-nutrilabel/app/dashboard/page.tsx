import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Dashboard, type KeyRow } from "@/components/dashboard";
import { Nav, Footer } from "@/components/site";
import { product } from "@/lib/product";
import { currentUser } from "@/lib/auth";
import { listApiKeys } from "@/lib/api-keys";
import { usageSummary } from "@/lib/usage";
import { planByCode, purchasablePlans } from "@/lib/plans";
import { getSubscription, planLabel } from "@/lib/payments";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * Everything is fetched server-side so the page has no empty first paint. The
 * middleware already turned away visitors with no cookie; this is the real check,
 * because a cookie can be present and invalid.
 */
export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const [summary, keys, subscription] = await Promise.all([
    usageSummary(user.id, user.planCode),
    listApiKeys(user.id),
    getSubscription(user.id),
  ]);

  const plan = planByCode(user.planCode);
  const upgradable = purchasablePlans();

  return (
    <>
      <Nav p={product} />
      <main id="main-content">
        <Dashboard
          user={{ email: user.email, name: user.name }}
          usage={{
            used: summary.used,
            // JSON has no Infinity, so an uncapped plan crosses as null.
            limit: Number.isFinite(summary.limit) ? summary.limit : null,
            remaining: Number.isFinite(summary.limit) ? summary.remaining : null,
            percent: summary.percent,
            periodEnd: summary.periodEnd,
            byDay: summary.byDay,
            recent: summary.recent.map((r) => ({
              endpoint: r.endpoint,
              status: r.status,
              duration_ms: r.duration_ms,
              created_at: r.created_at.toISOString(),
            })),
          }}
          plan={{
            code: plan.code,
            name: plan.name,
            price: plan.price,
            period: plan.period,
            apiAccess: plan.apiAccess,
            rateLimitPerMin: plan.rateLimitPerMin,
          }}
          subscription={
            subscription
              ? {
                  status: subscription.status,
                  label: planLabel(subscription),
                  cancelAtPeriodEnd: subscription.cancel_at_period_end,
                  currentPeriodEnd: subscription.current_period_end
                    ? new Date(subscription.current_period_end).toISOString().slice(0, 10)
                    : null,
                }
              : null
          }
          keys={keys.map(
            (k): KeyRow => ({
              id: k.id,
              name: k.name,
              key_prefix: k.key_prefix,
              created_at: k.created_at.toISOString(),
              last_used_at: k.last_used_at ? k.last_used_at.toISOString() : null,
              revoked_at: k.revoked_at ? k.revoked_at.toISOString() : null,
            }),
          )}
          upgrade={{
            available: upgradable.length > 0,
            plans: upgradable.map((p) => ({ code: p.code, name: p.name, price: p.price, period: p.period })),
          }}
          accent={product.accent}
          productName={product.name}
          runPath="/api/v1/run"
        />
      </main>
      <Footer p={product} />
    </>
  );
}
