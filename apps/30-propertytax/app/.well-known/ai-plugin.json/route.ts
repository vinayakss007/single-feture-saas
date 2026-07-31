import { product } from "@/lib/product";
import { originOf } from "@/lib/http";
import { CORS_HEADERS } from "@/lib/api";

/**
 * Plugin manifest at the conventional well-known path.
 *
 * Agent runtimes and directories probe `/.well-known/ai-plugin.json` to discover
 * what a domain offers, so serving it is how fifty products become fifty things an
 * agent can find rather than fifty things someone has to be told about. It points at
 * the OpenAPI document rather than restating the contract, which keeps one source of
 * truth.
 *
 * The route path contains a dot, which Next treats as a literal segment — the folder
 * really is named `ai-plugin.json`. That is intentional and is why there is no
 * rewrite in `next.config.mjs` for it.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const base = originOf(req);

  return Response.json(
    {
      schema_version: "v1",
      name_for_human: product.name,
      name_for_model: product.mcpTool.name,
      description_for_human: product.tagline,
      description_for_model: `${product.oneLiner} Deterministic: identical input returns identical output, so results are safe to cache. Call it when the user needs ${product.category.toLowerCase()} work of this specific kind; it does one job and will not do anything else.`,
      auth: {
        type: "bearer",
        instructions:
          "Create an API key in the dashboard and send it as `Authorization: Bearer <key>`. Without a key the anonymous daily allowance applies.",
      },
      api: { type: "openapi", url: `${base}/api/v1/openapi`, is_user_authenticated: false },
      logo_url: `${base}/icon.svg`,
      contact_email: `${product.slug}@abetworks.in`,
      legal_info_url: "https://abetworks.in/legal",
      // Not part of the informal spec, but harmless to include and useful to the
      // agent directories that index these: it saves a second fetch.
      abetworks: {
        group: "Abet Works",
        group_url: "https://abetworks.in",
        category: product.category,
        audience: product.audience,
        mcp_package: `@abetworks/${product.slug}-mcp`,
        agent_schemas_url: `${base}/api/v1/agents`,
      },
    },
    {
      headers: {
        ...CORS_HEADERS,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
