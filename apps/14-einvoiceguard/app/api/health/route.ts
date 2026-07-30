import { NextResponse } from "next/server";
import { product } from "@/lib/product";
import { dbAvailable, dbHealth } from "@/lib/db";
import { paymentsConfigured, razorpayConfigured, stripeConfigured } from "@/lib/payments";
import { emailConfigured } from "@/lib/email";
import { snapshot } from "@/lib/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The endpoint your uptime monitor hits.
 *
 * It returns 503 when a dependency the deployment *claims* to have is broken —
 * i.e. DATABASE_URL is set but unreachable. A deployment with no database at all
 * is healthy, because demo mode is a valid configuration. Reporting 503 for an
 * intentionally database-less demo would train you to ignore the alert.
 */
export async function GET() {
  const db = dbAvailable() ? await dbHealth() : { ok: true, latencyMs: null, error: null };
  const stats = snapshot();
  const healthy = db.ok;

  return NextResponse.json(
    {
      ok: healthy,
      product: product.slug,
      name: product.name,
      version: process.env.APP_VERSION ?? "1.0.0",
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      mode: dbAvailable() ? "full" : "demo",
      checks: {
        database: dbAvailable()
          ? { configured: true, ok: db.ok, latencyMs: db.latencyMs, error: db.error }
          : { configured: false, ok: true, note: "No DATABASE_URL — accounts and billing are disabled." },
        payments: {
          configured: paymentsConfigured(),
          razorpay: razorpayConfigured(),
          stripe: stripeConfigured(),
        },
        email: { configured: emailConfigured() },
      },
      requests: stats.requests,
      runs: stats.runs,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
