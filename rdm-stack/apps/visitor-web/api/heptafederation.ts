import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getCorsHeaders } from "./_shared/cors";

export const FEDERATIONS = [
  { id: "F1", name: "Gobernanza", status: "operational" },
  { id: "F2", name: "Identidad y Acceso", status: "operational" },
  { id: "F3", name: "Datos Territoriales", status: "operational" },
  { id: "F4", name: "Comercio y Monetización", status: "operational" },
  { id: "F5", name: "IA Cognitiva", status: "operational" },
  { id: "F6", name: "Comunidad y Contenido", status: "operational" },
  { id: "F7", name: "Observabilidad y Seguridad", status: "operational" },
] as const;

export type FederationId = (typeof FEDERATIONS)[number]["id"];
export type FederationName = (typeof FEDERATIONS)[number]["name"];

export interface FederationNode {
  nodeId: string;
  federation: FederationId;
  useCase: string;
  environment: "dev" | "staging" | "prod";
  userId?: string | null;
}

export interface FederationStatus {
  federation: FederationId;
  name: FederationName;
  status: "operational" | "degraded" | "critical";
  latencyMs?: number;
  lastChecked?: string;
}

export interface FederationCommand {
  type: string;
  federation: FederationId;
  payload: Record<string, unknown>;
  userId?: string;
}

export interface FederationResult {
  ok: boolean;
  federation: FederationId;
  data?: unknown;
  error?: { code: string; message: string };
}

export function buildNode(ctx?: { federation?: string; useCase?: string; userId?: string | null }): FederationNode {
  return {
    nodeId: process.env.NODE_ID || "nodo-cero-heptafederation",
    federation: (ctx?.federation as FederationId) || "F5",
    useCase: ctx?.useCase || "heptafederation",
    environment: (process.env.NODE_ENV as "dev" | "staging" | "prod") || "dev",
    userId: ctx?.userId ?? null,
  };
}

export function getFederationStatuses(): FederationStatus[] {
  return FEDERATIONS.map((f) => ({
    federation: f.id as FederationId,
    name: f.name as FederationName,
    status: "operational" as const,
  }));
}

export async function executeFederationCommand(command: FederationCommand): Promise<FederationResult> {
  return {
    ok: true,
    federation: command.federation,
    data: { received: true, type: command.type },
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = (req.headers.origin as string | undefined) ?? null;
  const cors = getCorsHeaders(origin);
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method === "GET") {
    return res.status(200).json({
      success: true,
      data: {
        federations: getFederationStatuses(),
        node: buildNode(),
      },
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const command = req.body as FederationCommand;
    const result = await executeFederationCommand(command);
    return res.status(result.ok ? 200 : 400).json(result);
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: { code: "FEDERATION_ERROR", message: err instanceof Error ? err.message : "Unknown" },
    });
  }
}
