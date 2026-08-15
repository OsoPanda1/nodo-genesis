import { corsJsonResponse, handleCors } from "../_shared/cors";
import { fusionGateway } from "../../src/connect/fusion/FusionGateway";
import jwt from "jsonwebtoken";

export const config = { runtime: "edge" };

const NONCE_STORE = new Set<string>();
const NONCE_TTL = 5 * 60 * 1000;
const REQUIRED_AUDIENCES = [
  "tamv-federation-core",
  "tamv-cell-node-1", "tamv-cell-node-2", "tamv-cell-node-3",
  "tamv-cell-node-4", "tamv-cell-node-5", "tamv-cell-node-6", "tamv-cell-node-7",
];
const JWT_SECRET = process.env.JWT_SECRET;

interface TokenPayload {
  agentId: string;
  federationId: number;
  role: "agent" | "admin" | "viewer";
}

export function generateAgentToken(payload: TokenPayload): string {
  if (!JWT_SECRET) throw new Error("JWT_SECRET not configured");
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "2h",
    audience: "tamv-core",
    issuer: "tamv-auth-gateway",
  });
}

function sanitizeLog(msg: string): string {
  return msg.replace(/(bearer\s+|secret=|key=)[a-zA-Z0-9\-_.]+/gi, "$1[MASKED]");
}

function isExpired(timestamp: number): boolean {
  return Date.now() - timestamp > 30_000;
}

export default async function handler(request: Request): Promise<Response> {
  const cors = handleCors(request);
  if (cors) return cors;

  if (request.method !== "POST") {
    return corsJsonResponse(request, { error: "Method not allowed" }, 405);
  }

  try {
    const body = await request.json();
    const { nonce, timestamp, clientId, clientSecret, targetAudience, action, agentId, federationId, ...operation } = body;

    if (action === "exchange") {
      if (!agentId || typeof agentId !== "string") {
        return corsJsonResponse(request, { error: { code: "MISSING_AGENT_ID" } }, 400);
      }
      const fedId = parseInt(federationId, 10);
      if (isNaN(fedId) || fedId < 1 || fedId > 7) {
        return corsJsonResponse(request, { error: { code: "INVALID_FEDERATION_ID" } }, 400);
      }
      const expectedSecret = process.env.TAMV_FEDERATION_SECRET;
      if (!expectedSecret || clientSecret !== expectedSecret) {
        return corsJsonResponse(request, { error: { code: "UNAUTHORIZED" } }, 401);
      }
      const token = generateAgentToken({ agentId, federationId: fedId, role: "agent" });
      return corsJsonResponse(request, { access_token: token, token_type: "Bearer", expires_in: 7200 });
    }

    if (!nonce || typeof nonce !== "string") {
      return corsJsonResponse(request, { error: { code: "MISSING_NONCE" } }, 400);
    }
    if (!timestamp || typeof timestamp !== "number") {
      return corsJsonResponse(request, { error: { code: "MISSING_TIMESTAMP" } }, 400);
    }

    if (NONCE_STORE.has(nonce)) {
      return corsJsonResponse(request, { error: { code: "REPLAY_DETECTED" } }, 409);
    }
    NONCE_STORE.add(nonce);
    setTimeout(() => NONCE_STORE.delete(nonce), NONCE_TTL);

    if (isExpired(timestamp)) {
      return corsJsonResponse(request, { error: { code: "EXPIRED_REQUEST" } }, 400);
    }

    if (clientId && clientSecret && targetAudience) {
      const fedSecret = process.env.TAMV_FEDERATION_SECRET;
      if (!fedSecret) {
        console.error("CRITICAL: TAMV_FEDERATION_SECRET not configured");
        return corsJsonResponse(request, { error: { code: "CONFIG_ERROR" } }, 500);
      }
      if (!REQUIRED_AUDIENCES.includes(targetAudience)) {
        return corsJsonResponse(request, { error: { code: "INVALID_AUDIENCE" } }, 403);
      }
      if (clientId !== "tamv-gateway" || clientSecret !== fedSecret) {
        return corsJsonResponse(request, { error: { code: "UNAUTHORIZED" } }, 401);
      }
    }

    const result = await fusionGateway.execute(operation);
    if (!result.ok) {
      return corsJsonResponse(request, { error: { code: result.error.code, message: result.error.message } }, result.error.statusCode);
    }

    return corsJsonResponse(request, { success: true, data: result.data });
  } catch (err) {
    const msg = err instanceof Error ? sanitizeLog(err.message) : "Invalid request";
    return corsJsonResponse(request, { error: { code: "BAD_REQUEST", message: msg } }, 400);
  }
}
