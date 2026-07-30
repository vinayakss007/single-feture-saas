import { NextResponse } from "next/server";
import { product } from "@/lib/product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    product: product.slug,
    name: product.name,
    version: "1.0.0",
    authRequired: Boolean(process.env.API_KEYS),
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
}
