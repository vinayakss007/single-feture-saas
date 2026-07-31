import { product } from "@/lib/product";
import { originOf } from "@/lib/http";
import { CORS_HEADERS } from "@/lib/api";

/**
 * OpenAPI 3.1 document for this product's REST surface.
 *
 * Generated from `product.inputs` at request time rather than written by hand, for
 * the same reason the MCP server fetches its schema from the API: a spec that is
 * maintained separately from the thing it describes is wrong within a month. Add a
 * field to the product config and this document, the MCP tool schema, the demo form
 * and the validator all change together.
 *
 * 3.1 specifically, because it is the version that is a strict JSON Schema superset —
 * which means the `requestBody` schema below can be handed straight to an agent
 * runtime as a tool parameter schema with no translation step.
 *
 * Served dynamically and CORS-open. The `servers` entry has to be the origin the
 * caller actually reached — the same build serves localhost, a preview URL and the
 * custom domain, and a spec that hardcodes one of those sends generated clients to
 * the wrong host.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requestSchema() {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const field of product.inputs) {
    properties[field.name] = {
      type: "string",
      title: field.label,
      description: field.help ?? field.label,
      ...(field.options ? { enum: field.options } : {}),
      ...(field.placeholder ? { examples: [field.placeholder] } : {}),
    };
    if (field.required) required.push(field.name);
  }

  return {
    type: "object",
    additionalProperties: false,
    properties,
    required,
  };
}

const resultSchema = {
  type: "object",
  required: ["headline"],
  properties: {
    headline: { type: "string", description: "One-line summary of the run." },
    score: {
      type: "object",
      description: "Optional headline score.",
      required: ["label", "value", "max", "band"],
      properties: {
        label: { type: "string" },
        value: { type: "number" },
        max: { type: "number" },
        band: { type: "string", enum: ["good", "warn", "bad"] },
      },
    },
    metrics: {
      type: "array",
      items: {
        type: "object",
        required: ["label", "value"],
        properties: { label: { type: "string" }, value: { type: "string" }, hint: { type: "string" } },
      },
    },
    sections: {
      type: "array",
      items: {
        type: "object",
        required: ["title", "items"],
        properties: {
          title: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              required: ["body"],
              properties: {
                title: { type: "string" },
                body: { type: "string" },
                tag: { type: "string" },
                severity: { type: "string", enum: ["high", "medium", "low"] },
              },
            },
          },
        },
      },
    },
    table: {
      type: "object",
      required: ["columns", "rows"],
      properties: {
        columns: { type: "array", items: { type: "string" } },
        rows: { type: "array", items: { type: "array", items: { type: "string" } } },
      },
    },
    copyBlocks: {
      type: "array",
      items: {
        type: "object",
        required: ["title", "text"],
        properties: { title: { type: "string" }, text: { type: "string" }, language: { type: "string" } },
      },
    },
    json: { description: "Machine payload. Shape is product-specific." },
  },
} as const;

export function GET(req: Request) {
  const base = originOf(req);

  const spec = {
    openapi: "3.1.0",
    info: {
      title: `${product.name} API`,
      summary: product.tagline,
      description: `${product.oneLiner}\n\nDeterministic${
        product.probesNetwork ? " apart from documented network probes" : ""
      }: the same input returns the same output. Authenticate with an API key from your dashboard as \`Authorization: Bearer <key>\`.`,
      version: "1.0.0",
      contact: { name: "Abet Works", url: "https://abetworks.in", email: `${product.slug}@abetworks.in` },
      license: { name: "Proprietary", identifier: "LicenseRef-Proprietary" },
    },
    servers: [{ url: base, description: "Production" }],
    tags: [{ name: product.category, description: product.oneLiner }],
    paths: {
      "/api/v1/run": {
        get: {
          operationId: "describe",
          summary: "Describe the input contract",
          description:
            "Returns the field list this product accepts, the sample payload, and the MCP tool name. Used by the MCP server at startup so the agent-facing schema cannot drift from this one.",
          tags: [product.category],
          security: [],
          responses: {
            "200": {
              description: "Input contract.",
              content: { "application/json": { schema: { type: "object" } } },
            },
          },
        },
        post: {
          operationId: product.mcpTool.name,
          summary: product.mcpTool.description,
          description: product.oneLiner,
          tags: [product.category],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: requestSchema(),
                examples: { sample: { summary: "Worked example", value: product.sample } },
              },
            },
          },
          responses: {
            "200": {
              description: "Run completed.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["ok", "data"],
                    properties: { ok: { const: true }, data: resultSchema },
                  },
                },
              },
            },
            "400": { $ref: "#/components/responses/BadRequest" },
            "401": { $ref: "#/components/responses/Unauthorised" },
            "402": { $ref: "#/components/responses/QuotaExceeded" },
            "429": { $ref: "#/components/responses/RateLimited" },
          },
        },
      },
      "/api/health": {
        get: {
          operationId: "health",
          summary: "Liveness and dependency check",
          tags: ["Operations"],
          security: [],
          responses: { "200": { description: "Service is up." }, "503": { description: "A dependency is down." } },
        },
      },
    },
    components: {
      securitySchemes: {
        apiKey: {
          type: "http",
          scheme: "bearer",
          description: "An API key created in the dashboard. Requires a plan with API access.",
        },
      },
      responses: {
        BadRequest: {
          description: "The payload failed validation. `details` names the offending fields.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["ok", "error"],
                properties: {
                  ok: { const: false },
                  error: { type: "string" },
                  details: {
                    type: "object",
                    properties: {
                      missingRequiredFields: { type: "array", items: { type: "string" } },
                      fieldsThatMustBeStrings: { type: "array", items: { type: "string" } },
                    },
                  },
                },
              },
            },
          },
        },
        Unauthorised: { description: "Missing, unknown or revoked API key." },
        QuotaExceeded: { description: "Monthly run allowance for the current plan is used up." },
        RateLimited: {
          description: "Per-minute rate limit for the current plan exceeded. Retry after the `Retry-After` header.",
          headers: { "Retry-After": { schema: { type: "integer" }, description: "Seconds to wait." } },
        },
      },
    },
    security: [{ apiKey: [] }],
    externalDocs: { url: `${base}/#api`, description: "Human documentation" },
  };

  return Response.json(spec, {
    headers: {
      ...CORS_HEADERS,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
