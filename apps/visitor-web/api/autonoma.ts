// Autonoma AI — Agent endpoint handler
// Integra agentes autónomos de Autonoma para testing, generación de datos y escenarios

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getCorsHeaders } from "./_shared/cors";

const AUTONOMA_CLIENT_ID = process.env.AUTONOMA_CLIENT_ID ?? "";
const AUTONOMA_SECRET_ID = process.env.AUTONOMA_SECRET_ID ?? "";

type AutonomaAction = "discover" | "up" | "down";
type AutonomaPayload = {
  action: AutonomaAction;
  scope?: string;
  factories?: Record<string, unknown>;
  refs?: string[];
};

function verifyAuth(req: VercelRequest): boolean {
  const auth = req.headers.authorization;
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  if (token === AUTONOMA_SECRET_ID) return true;
  try {
    const sig = Buffer.from(token, "base64").toString();
    return sig === `${AUTONOMA_CLIENT_ID}:${AUTONOMA_SECRET_ID}`;
  } catch {
    return false;
  }
}

const DISCOVER_SCHEMA = {
  models: {
    IsabellaDecision: {
      fields: {
        traceId: { type: "string", required: true },
        query: { type: "string", required: true },
        response: { type: "string", required: false },
        territory: { type: "string", required: false },
        timestamp: { type: "string", required: false },
      },
    },
    Business: {
      fields: {
        name: { type: "string", required: true },
        category: { type: "string", required: true },
        description: { type: "string", required: false },
        address: { type: "string", required: false },
        phone: { type: "string", required: false },
      },
    },
    EventRDM: {
      fields: {
        title: { type: "string", required: true },
        date: { type: "string", required: true },
        category: { type: "string", required: true },
        location: { type: "string", required: false },
      },
    },
  },
};

const FACTORIES = {
  IsabellaDecision: {
    create: async (data: Record<string, unknown>) => {
      return { id: crypto.randomUUID(), ...data, created_at: new Date().toISOString() };
    },
    teardown: async (record: Record<string, unknown>) => {
      return { deleted: true, id: record.id };
    },
  },
  Business: {
    create: async (data: Record<string, unknown>) => {
      return { id: crypto.randomUUID(), ...data, created_at: new Date().toISOString() };
    },
    teardown: async (record: Record<string, unknown>) => {
      return { deleted: true, id: record.id };
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = (req.headers.origin as string | undefined) ?? null;
  const cors = getCorsHeaders(origin);
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!verifyAuth(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const body = req.body as AutonomaPayload;

    switch (body.action) {
      case "discover":
        return res.status(200).json({
          version: "1.0",
          scope: body.scope ?? "default",
          schema: DISCOVER_SCHEMA,
        });

      case "up": {
        const results: Record<string, unknown> = {};
        if (body.factories) {
          for (const [model, data] of Object.entries(body.factories)) {
            const factory = FACTORIES[model as keyof typeof FACTORIES];
            if (factory) {
              results[model] = await factory.create(data as Record<string, unknown>);
            }
          }
        }
        return res.status(200).json({
          status: "created",
          refsToken: Buffer.from(JSON.stringify(body.refs ?? [])).toString("base64"),
          records: results,
        });
      }

      case "down":
        return res.status(200).json({ status: "destroyed" });

      default:
        return res.status(400).json({ error: `Unknown action: ${body.action}` });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Autonoma handler error";
    return res.status(500).json({ error: message });
  }
}
