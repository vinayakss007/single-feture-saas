import { authenticate, fail, ok, parseInput, rateLimit, CORS_HEADERS } from "@/lib/api";
import { product } from "@/lib/product";
import { run } from "@/lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Self-describing schema so agents can discover how to call this tool. */
export async function GET() {
  return ok({
    product: product.name,
    slug: product.slug,
    description: product.oneLiner,
    method: "POST",
    path: "/api/v1/run",
    auth: "Bearer token or x-api-key header. Open when API_KEYS is unset.",
    inputSchema: product.inputs.map((f) => ({
      name: f.name,
      type: f.type,
      required: Boolean(f.required),
      description: f.help ?? f.label,
      ...(f.options ? { options: f.options } : {}),
    })),
    example: product.sample,
    mcpTool: product.mcpTool,
  });
}

export async function POST(req: Request) {
  const authFailure = authenticate(req);
  if (authFailure) return fail(authFailure);

  const limitFailure = rateLimit(req);
  if (limitFailure) return fail(limitFailure);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail({ ok: false, status: 400, error: "Request body must be valid JSON." });
  }

  const parsed = parseInput(body, product.inputs);
  if (!parsed.ok) return fail(parsed.failure);

  const startedAt = Date.now();
  try {
    const result = await run(parsed.value);
    return ok(result, { product: product.slug, tookMs: Date.now() - startedAt });
  } catch (err) {
    return fail({
      ok: false,
      status: 422,
      error: err instanceof Error ? err.message : "Could not process this input.",
    });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
