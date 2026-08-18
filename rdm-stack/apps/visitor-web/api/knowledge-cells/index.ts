import { corsJsonResponse, handleCors } from "../_shared/cors";
import { bootstrapKnowledgeCells } from "./bootstrap";
import { handleTamvError, TamvBaseError, TamvErrorCode } from "./errors";

export interface KnowledgeCell {
  id: string;
  type: string;
  description: string;
  version: string;
  endpoint: string;
  status: "active" | "maintenance" | "deprecated";
}

const CELLS: Record<string, KnowledgeCell> = {
  "render-3d-holocube-v1": {
    id: "render-3d-holocube-v1",
    type: "Render3D",
    description: "Renderizado holográfico de cubos volumétricos con efectos de luz e integración de audio XR",
    version: "1.0.0",
    endpoint: "/api/knowledge-cells/render-3d",
    status: "active",
  },
  "render-4d-hypercube-v1": {
    id: "render-4d-hypercube-v1",
    type: "Render4D",
    description: "Renderiza y manipula hipercubos 4D con proyecciones Schlegel interactivas",
    version: "1.0.0",
    endpoint: "/api/knowledge-cells/render-4d",
    status: "active",
  },
  "ia-immersivefx-v1": {
    id: "ia-immersivefx-v1",
    type: "IA-ImmersiveFX",
    description: "Efectos inmersivos generados por IA con mapeo multisensorial",
    version: "1.0.0",
    endpoint: "/api/knowledge-cells/ia-fx",
    status: "active",
  },
};

export function getCell(id: string): KnowledgeCell | undefined {
  return CELLS[id];
}

export function listCells(): KnowledgeCell[] {
  return Object.values(CELLS);
}

export function getActiveCells(): KnowledgeCell[] {
  return Object.values(CELLS).filter((c) => c.status === "active");
}

export { render3dHandler } from "./render-3d";
export { render4dHandler } from "./render-4d";

// ── Unified Edge Function handler ──

export default async function handler(request: Request): Promise<Response> {
  const cors = handleCors(request);
  if (cors) return cors;

  try {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "");
    const body = request.method === "POST" ? await request.json().catch(() => ({})) : {};

    // POST /api/knowledge-cells/bootstrap
    if (request.method === "POST" && path.endsWith("/bootstrap")) {
      const success = await bootstrapKnowledgeCells({
        supabaseUrl: body.supabaseUrl,
        supabaseKey: body.supabaseKey,
        federationSecret: body.federationSecret,
      });
      return corsJsonResponse(request, { status: "success", active: success });
    }

    // POST /api/knowledge-cells/query
    if (request.method === "POST" && (path.endsWith("/query") || path.endsWith("/chat"))) {
      const { prompt } = body;
      if (!prompt || typeof prompt !== "string") {
        throw new TamvBaseError(TamvErrorCode.INTERNAL_FATAL, "Prompt is required", 400);
      }
      const { queryIsabellaAI } = await import("./isa-ai");
      const gatewayUrl = process.env.VERCEL_AI_GATEWAY_URL || "";
      const apiKey = process.env.OPENAI_API_KEY || "";
      const result = await queryIsabellaAI(prompt, gatewayUrl, apiKey);
      return corsJsonResponse(request, result);
    }

    // POST /api/knowledge-cells/chat-stream
    if (request.method === "POST" && path.endsWith("/chat-stream")) {
      const { default: chatHandler } = await import("./isabella-chat");
      return chatHandler(request);
    }

    // GET /api/knowledge-cells — list all cells
    if (request.method === "GET") {
      return corsJsonResponse(request, { cells: listCells(), active: getActiveCells().length });
    }

    return corsJsonResponse(request, { error: "Not found" }, 404);
  } catch (err: any) {
    if (err instanceof TamvBaseError) {
      return handleTamvError(err);
    }
    return handleTamvError(new TamvBaseError(TamvErrorCode.INTERNAL_FATAL, err.message || "Unknown error", 500));
  }
}
