import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, destroySession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The cookie is cleared even if deleting the session row fails, so the browser is
 * always signed out from the user's point of view.
 */
export async function POST() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  jar.delete(SESSION_COOKIE);
  if (token) {
    try {
      await destroySession(token);
    } catch {
      /* cookie is already gone; the row expires on its own */
    }
  }
  return NextResponse.json({ ok: true, data: { signedOut: true } });
}
