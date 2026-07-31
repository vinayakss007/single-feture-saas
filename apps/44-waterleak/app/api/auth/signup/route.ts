import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions, signUp } from "@/lib/auth";
import { sendWelcome } from "@/lib/email";
import { callerIp, rateLimit } from "@/lib/api";
import { instrument, log } from "@/lib/observability";
import { originOf } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return instrument("/api/auth/signup", async () => {
    const ip = callerIp(req);

    // Account creation is limited hard by IP. Ten new accounts a minute from one
    // address is never a real person.
    const burst = rateLimit({ kind: "anonymous", ip }, 10, "signup");
    if (burst) return NextResponse.json({ ok: false, error: burst.error }, { status: 429 });

    let body: { email?: string; password?: string; name?: string };
    try {
      body = (await req.json()) as typeof body;
    } catch {
      return NextResponse.json({ ok: false, error: "Request body must be valid JSON." }, { status: 400 });
    }

    const result = await signUp(body.email ?? "", body.password ?? "", body.name ?? null, {
      ip,
      userAgent: req.headers.get("user-agent"),
    });
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
    }

    const jar = await cookies();
    jar.set(SESSION_COOKIE, result.token, sessionCookieOptions(result.expiresAt));

    // Welcome mail must not delay or fail the signup response.
    sendWelcome(result.user.email, result.user.name, originOf(req)).catch((err) =>
      log("warn", "signup", "welcome email failed", { message: err instanceof Error ? err.message : "unknown" }),
    );

    log("info", "signup", "account created", { userId: result.user.id });
    return NextResponse.json({
      ok: true,
      data: { id: result.user.id, email: result.user.email, name: result.user.name },
    });
  });
}
