#!/usr/bin/env node
/**
 * MCP stdio server for this product.
 *
 * It is a thin, dependency-light bridge: the tool schema is fetched from the
 * product's own `GET /api/v1/run` endpoint at startup, and tool calls are
 * proxied to `POST /api/v1/run`. That means the agent-facing contract can never
 * drift from the REST contract.
 *
 *   SFS_API_URL   base url of the deployed product (default http://localhost:3000)
 *   SFS_API_KEY   optional, sent as Authorization: Bearer
 *
 * Usage in a client config:
 *   { "command": "node", "args": ["./mcp/server.mjs"], "env": { "SFS_API_URL": "..." } }
 */

import { createInterface } from "node:readline";

const API_URL = (process.env.SFS_API_URL ?? "http://localhost:3000").replace(/\/$/, "");
const API_KEY = process.env.SFS_API_KEY ?? "";
const PROTOCOL_VERSION = "2024-11-05";

function headers() {
  const h = { "Content-Type": "application/json" };
  if (API_KEY) h.Authorization = `Bearer ${API_KEY}`;
  return h;
}

async function describe() {
  const res = await fetch(`${API_URL}/api/v1/run`, { headers: headers() });
  if (!res.ok) throw new Error(`Schema fetch failed with HTTP ${res.status}`);
  const payload = await res.json();
  return payload.data;
}

function toJsonSchema(inputSchema) {
  const properties = {};
  const required = [];
  for (const field of inputSchema ?? []) {
    properties[field.name] = {
      type: "string",
      description: field.description ?? field.name,
      ...(field.options ? { enum: field.options } : {}),
    };
    if (field.required) required.push(field.name);
  }
  return { type: "object", properties, required, additionalProperties: false };
}

async function callTool(args) {
  const res = await fetch(`${API_URL}/api/v1/run`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(args ?? {}),
  });
  const payload = await res.json().catch(() => ({ ok: false, error: `HTTP ${res.status}` }));
  if (!payload.ok) throw new Error(payload.error ?? `HTTP ${res.status}`);
  return payload.data;
}

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function reply(id, result) {
  send({ jsonrpc: "2.0", id, result });
}

function replyError(id, code, message) {
  send({ jsonrpc: "2.0", id, error: { code, message } });
}

let spec = null;

async function ensureSpec() {
  if (!spec) spec = await describe();
  return spec;
}

async function handle(message) {
  const { id, method, params } = message;

  switch (method) {
    case "initialize": {
      const s = await ensureSpec().catch(() => null);
      reply(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: { name: s?.slug ?? "abetworks-single-feature-saas", version: "1.0.0" },
      });
      return;
    }

    case "notifications/initialized":
    case "initialized":
      return;

    case "ping":
      reply(id, {});
      return;

    case "tools/list": {
      const s = await ensureSpec();
      reply(id, {
        tools: [
          {
            name: s.mcpTool.name,
            description: s.mcpTool.description,
            inputSchema: toJsonSchema(s.inputSchema),
          },
        ],
      });
      return;
    }

    case "tools/call": {
      const s = await ensureSpec();
      if (params?.name !== s.mcpTool.name) {
        replyError(id, -32602, `Unknown tool: ${params?.name}`);
        return;
      }
      try {
        const data = await callTool(params.arguments);
        reply(id, {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
          isError: false,
        });
      } catch (err) {
        reply(id, {
          content: [{ type: "text", text: `Error: ${err.message}` }],
          isError: true,
        });
      }
      return;
    }

    default:
      if (id !== undefined) replyError(id, -32601, `Method not found: ${method}`);
  }
}

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });

/**
 * Requests are handled asynchronously, so stdin closing does not mean the work
 * is done. Without this the process would exit before its replies were written —
 * which a long-lived client never notices, but piping input to it always does.
 */
let pending = 0;
let stdinClosed = false;

function maybeExit() {
  if (stdinClosed && pending === 0) process.exit(0);
}

rl.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  let message;
  try {
    message = JSON.parse(trimmed);
  } catch {
    return;
  }
  pending += 1;
  handle(message)
    .catch((err) => {
      if (message?.id !== undefined) replyError(message.id, -32603, err.message);
    })
    .finally(() => {
      pending -= 1;
      maybeExit();
    });
});

rl.on("close", () => {
  stdinClosed = true;
  maybeExit();
});
