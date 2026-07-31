import { product } from "@/lib/product";
import { originOf } from "@/lib/http";
import { CORS_HEADERS } from "@/lib/api";

/**
 * Tool definitions for the agent runtimes people actually use.
 *
 * Every runtime wants the same information in a slightly different envelope, and
 * hand-maintaining four copies of a tool schema is how they drift. So one JSON
 * Schema is derived from `product.inputs` and then wrapped per runtime.
 *
 * This is not the same job as the MCP server. MCP is a live stdio connection an
 * agent speaks to; this endpoint is a paste-able definition for runtimes that take
 * tool schemas as configuration — OpenAI function calling, the Anthropic Messages
 * API, Gemini function declarations, and LangChain-style structured tools. Both
 * exist because both are how real deployments call a tool, and both derive from the
 * one config so they cannot disagree.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parameters() {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const field of product.inputs) {
    properties[field.name] = {
      type: "string",
      description: field.help ?? field.label,
      ...(field.options ? { enum: field.options } : {}),
    };
    if (field.required) required.push(field.name);
  }

  return { type: "object" as const, properties, required, additionalProperties: false };
}

export function GET(req: Request) {
  const base = originOf(req);
  const schema = parameters();
  const name = product.mcpTool.name;
  const description = `${product.mcpTool.description} Returns a structured result: headline, optional score, metrics, grouped findings, and a machine payload under \`json\`.`;

  const body = {
    product: { name: product.name, slug: product.slug, category: product.category, url: base },
    endpoint: { method: "POST", url: `${base}/api/v1/run`, auth: "Authorization: Bearer <api key>" },
    openapi: `${base}/api/v1/openapi`,

    /** OpenAI Chat Completions / Responses API. */
    openai: {
      type: "function",
      function: { name, description, parameters: schema, strict: false },
    },

    /** Anthropic Messages API. */
    anthropic: {
      name,
      description,
      input_schema: schema,
    },

    /** Google Gemini function declarations. */
    gemini: {
      functionDeclarations: [{ name, description, parameters: schema }],
    },

    /**
     * LangChain / LlamaIndex style. Not an official wire format — these frameworks
     * construct tools in code — so this is the shape their `StructuredTool`
     * constructors take, which is what someone copying this actually needs.
     */
    langchain: {
      name,
      description,
      schema,
      func: `async (input) => (await fetch("${base}/api/v1/run", { method: "POST", headers: { "Content-Type": "application/json", Authorization: \`Bearer \${process.env.${product.slug.toUpperCase().replace(/-/g, "_")}_KEY}\` }, body: JSON.stringify(input) })).json()`,
    },

    /** MCP, for runtimes that speak it directly. */
    mcp: {
      transport: "stdio",
      package: `@abetworks/${product.slug}-mcp`,
      config: {
        mcpServers: {
          [product.slug]: {
            command: "npx",
            args: ["-y", `@abetworks/${product.slug}-mcp`],
            env: { SFS_API_URL: base, SFS_API_KEY: "your_key" },
          },
        },
      },
      tools: [{ name, description, inputSchema: schema }],
    },

    example: { input: product.sample },
  };

  return Response.json(body, {
    headers: {
      ...CORS_HEADERS,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
