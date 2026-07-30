import { NextResponse } from "next/server";
import { revokeApiKey } from "@/lib/api-keys";
import { currentUser } from "@/lib/auth";
import { instrument } from "@/lib/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** In Next 15 dynamic route params arrive as a Promise. */
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  return instrument("/api/keys/[id]", async () => {
    const user = await currentUser();
    if (!user) return NextResponse.json({ ok: false, error: "Sign in first." }, { status: 401 });

    const { id } = await ctx.params;
    // Scoped to the signed-in user inside the UPDATE, so guessing an id gets you
    // nothing.
    const revoked = await revokeApiKey(user.id, id);
    if (!revoked) {
      return NextResponse.json({ ok: false, error: "No active key with that id." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, data: { revoked: id } });
  });
}
