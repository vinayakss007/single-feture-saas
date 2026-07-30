import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { dbAvailable, queryOne } from "@/lib/db";
import { log } from "@/lib/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Retention job. Point Vercel Cron (or any scheduler) at this daily.
 *
 * Deletes expired sessions, used or expired reset tokens, processed webhook
 * events older than 30 days, and usage events past the retention window. Usage
 * rows are kept longer than everything else — 400 days by default — because they
 * are the evidence behind an invoice.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer $CRON_SECRET` automatically when
 * CRON_SECRET is set. If it is unset the route refuses to run rather than
 * silently exposing a destructive endpoint.
 */
function authorised(req: Request): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) return false;
  const header = req.headers.get("authorization") ?? "";
  const presented = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  const a = Buffer.from(presented);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  if (!authorised(req)) {
    return NextResponse.json(
      {
        ok: false,
        error: process.env.CRON_SECRET
          ? "Invalid cron token."
          : "CRON_SECRET is not set on this deployment, so the purge job is disabled.",
      },
      { status: 401 },
    );
  }

  if (!dbAvailable()) {
    return NextResponse.json({ ok: true, data: { skipped: "no database configured" } });
  }

  const retentionDays = Number(process.env.USAGE_RETENTION_DAYS ?? 400);
  const ipRetentionDays = Number(process.env.IP_RETENTION_DAYS ?? 30);

  const result = await queryOne<{
    sessions: number;
    resets: number;
    webhooks: number;
    usage: number;
    ips_cleared: number;
  }>(`SELECT * FROM purge_expired($1, $2)`, [retentionDays, ipRetentionDays]);

  log("info", "cron.purge", "retention job complete", { ...result, retentionDays, ipRetentionDays });
  return NextResponse.json({ ok: true, data: { ...result, retentionDays, ipRetentionDays } });
}
