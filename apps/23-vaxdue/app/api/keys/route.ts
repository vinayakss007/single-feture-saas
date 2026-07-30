import { NextResponse } from "next/server";
import { createApiKey, listApiKeys } from "@/lib/api-keys";
import { currentUser } from "@/lib/auth";
import { planByCode } from "@/lib/plans";
import { instrument } from "@/lib/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ACTIVE_KEYS = 10;

async function requireUser() {
  const user = await currentUser();
  if (!user) return { ok: false as const, res: NextResponse.json({ ok: false, error: "Sign in first." }, { status: 401 }) };
  return { ok: true as const, user };
}

export async function GET() {
  return instrument("/api/keys", async () => {
    const auth = await requireUser();
    if (!auth.ok) return auth.res;
    const keys = await listApiKeys(auth.user.id);
    return NextResponse.json({ ok: true, data: { keys } });
  });
}

export async function POST(req: Request) {
  return instrument("/api/keys", async () => {
    const auth = await requireUser();
    if (!auth.ok) return auth.res;

    const plan = planByCode(auth.user.planCode);
    if (!plan.apiAccess) {
      return NextResponse.json(
        {
          ok: false,
          error: `API keys are not included in the ${plan.name} plan. Upgrade to create keys and use the MCP server.`,
        },
        { status: 402 },
      );
    }

    const existing = await listApiKeys(auth.user.id);
    if (existing.filter((k) => !k.revoked_at).length >= MAX_ACTIVE_KEYS) {
      return NextResponse.json(
        { ok: false, error: `You already have ${MAX_ACTIVE_KEYS} active keys. Revoke one before creating another.` },
        { status: 409 },
      );
    }

    let name = "default";
    try {
      const body = (await req.json()) as { name?: string };
      if (typeof body.name === "string" && body.name.trim()) name = body.name.trim();
    } catch {
      /* an unnamed key is fine */
    }

    const created = await createApiKey(auth.user.id, name);
    return NextResponse.json(
      {
        ok: true,
        data: {
          id: created.id,
          name,
          key: created.key,
          keyPrefix: created.keyPrefix,
          // Said plainly because it is genuinely true — only the hash is stored.
          warning: "Copy this key now. It is shown once and cannot be recovered.",
        },
      },
      { status: 201 },
    );
  });
}
