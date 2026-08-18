import { corsJsonResponse, handleCors } from "../_shared/cors";
import { isPrivateIP } from "../_shared/network-utils";
import { fusionGateway } from "../../src/connect/fusion/FusionGateway";
import { listContracts } from "../../src/connect/fusion/contracts";
import { connectorRegistry } from "../../src/connect/ConnectorRegistry";
import { triggerRouter } from "../../src/connect/TriggerRouter";
import jwt from "jsonwebtoken";

export const config = { runtime: "edge" };

const ALLOWED_ORIGINS = [
  "https://www.visitarealdelmonte.online",
  "https://fed1.visitarealdelmonte.online",
  "https://fed2.visitarealdelmonte.online",
  "https://fed3.visitarealdelmonte.online",
  "https://fed4.visitarealdelmonte.online",
  "https://fed5.visitarealdelmonte.online",
  "https://fed6.visitarealdelmonte.online",
  "https://fed7.visitarealdelmonte.online",
];

function getCorsOrigin(origin: string | null): string {
  return origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
}

export default async function handler(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");
  const corsOrigin = getCorsOrigin(origin);

  const cors = handleCors(request);
  if (cors) return cors;

  // ── JWT token inspection path ──
  if (request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    if (body.action === "inspect-token") {
      const authHeader = request.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return corsJsonResponse(request, { active: false, error: "Invalid auth header format" }, 401);
      }
      const token = authHeader.slice(7).trim();
      if (!token) {
        return corsJsonResponse(request, { active: false, error: "Token missing" }, 401);
      }
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return corsJsonResponse(request, { active: false, error: "JWT_SECRET not configured" }, 500);
      }
      try {
        const decoded = jwt.verify(token, jwtSecret, {
          algorithms: ["HS256"],
          audience: "tamv-core",
          issuer: "tamv-auth-gateway",
        }) as jwt.JwtPayload;

        const fedId = decoded.federationId;
        if (typeof fedId !== "number" || fedId < 1 || fedId > 7) {
          return corsJsonResponse(request, { active: false, error: "Invalid federation ID in token" }, 403);
        }

        return corsJsonResponse(request, {
          active: true,
          scope: "tamv:agent:inspect",
          client_id: decoded.agentId,
          federation_id: fedId,
          expires_at: decoded.exp,
          issued_at: decoded.iat,
        });
      } catch (err: any) {
        const msg = err.name === "TokenExpiredError" ? "Token has expired" : "Invalid or corrupted token";
        return corsJsonResponse(request, { active: false, error: msg });
      }
    }
  }

  if (request.method !== "GET") {
    return corsJsonResponse(request, { error: "Method not allowed" }, 405);
  }

  const inspectKey = request.headers.get("x-tamv-inspect-key");
  const masterKey = process.env.TAMV_FEDERATION_SECRET;
  if (!masterKey || inspectKey !== masterKey) {
    return corsJsonResponse(request, { error: "Unauthorized" }, 403);
  }

  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const result = await fusionGateway.execute({ type: "inspect:stats" });

  const memory = process.memoryUsage?.();
  const safeData = result.ok && result.operation === "inspect:stats"
    ? {
        status: "healthy",
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        platform: process.platform,
        memory: memory ? {
          rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
        } : undefined,
        network: {
          isPrivateEnv: isPrivateIP(clientIp),
          clientIpFiltered: clientIp.replace(/\d+$/, "xxx"),
        },
        connectors: connectorRegistry.list().map((c) => ({
          uid: c.uid,
          type: c.type,
          name: c.name,
          installations: (c.installations ?? []).length,
        })),
        destinationCount: triggerRouter.list().length,
        contracts: listContracts().map((c) => ({
          version: c.version,
          supportedTypes: c.supportedTypes,
        })),
        activeFederationsConfigured: 7,
      }
    : { status: "error", message: "Failed to get stats" };

  return corsJsonResponse(request, { success: true, data: safeData }, 200);
}
