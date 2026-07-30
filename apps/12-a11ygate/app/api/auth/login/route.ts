import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions, signIn } from "@/lib/auth";
import { callerIp, rateLimit } from "@/lib/api";
import { instrument, log } from "@/lib/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return instrument("/api/auth/login", async () => {
    const ip = callerIp(req);

    // Twenty attempts a minute per IP. Enough for a human who forgot which
    // password they used, far too slow to be worth stuffing credentials through.
    const burst = rateLimit({ kind: "anonymous", ip }, 20, "login");
    if (burst) return NextResponse.json({ ok: false, error: burst.error }, { status: 429 });

    let body: { email?: string; password?: string };
    try {
      body = (await req.json()) as typeof body;
    } catch {
      return NextResponse.json({ ok: false, error: "Request body must be valid JSON." }, { status: 400 });
    }

    const result = await signIn(body.email ?? "", body.password ?? "", {
      ip,
      userAgent: req.headers.get("user-agent"),
    });
    if (!result.ok) {
      log("warn", "login", "failed sign in", { ip });
      return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
    }

    const jar = await cookies();
    jar.set(SESSION_COOKIE, result.token, sessionCookieOptions(result.expiresAt));

    return NextResponse.json({
      ok: true,
      data: { id: result.user.id, email: result.user.email, name: result.user.name },
    });
  });
}
