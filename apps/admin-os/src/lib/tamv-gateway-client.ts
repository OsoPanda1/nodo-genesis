import type { FederatedNodeData } from "@/hooks/useFederatedNodes";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export interface GatewayResponse<T> {
  status: "success" | "error";
  operation: string;
  domain: string;
  result: T;
  meta: {
    traceId: string;
    processingMs: number;
    mode: "peace" | "alert" | "lockdown";
    version: string;
    userId: string | null;
    roles: string[];
  };
}

interface OperationMap {
  method: "GET" | "POST";
  path: string;
  transform: (data: Record<string, unknown>) => unknown;
}

const OP_UNSUPPORTED = (operation: string): never => {
  throw new Error(`Operación sin equivalente en la API territorial de nodo-cero: ${operation}`);
};

/* Mapeo de operaciones TAMV → endpoints reales del Nodo Cero.
   Las rutas del Nodo Cero requieren autenticación soberana (x-rdm-api-key)
   y origen canónico; si el backend no está disponible o rechaza la llamada,
   `callGateway` lanza y los hooks conservan su fallback de demostración. */
const OPERATIONS: Record<string, OperationMap> = {
  "ops.nodes.list": {
    method: "GET",
    path: "/gemet/nodes",
    transform: (data) => {
      const records = Array.isArray(data.records) ? data.records : [];
      const nodes: FederatedNodeData[] = records.map((r) => {
        const rec = r as Record<string, unknown>;
        return {
          id: String(rec.id ?? "unknown"),
          node_name: String(rec.id ?? "unknown"),
          node_type: "gemet",
          status: "active",
          ast_state: "NORMAL",
          region: null,
          health_score: null,
          latency_ms: null,
          last_heartbeat: new Date().toISOString(),
          metrics: {
            ontologyUri: rec.ontologyUri ?? null,
            checksum: rec.checksum ?? null,
            version: rec.version ?? null,
          },
        };
      });
      return { nodes };
    },
  },
  "security.sentinel.status": {
    method: "GET",
    path: "/monitor/health",
    transform: (data) => {
      const overall = (data.overall ?? {}) as Record<string, unknown>;
      const checks = Array.isArray(data.checks) ? data.checks : [];
      const degraded = (overall.degraded as number) ?? 0;
      const down = (overall.down as number) ?? 0;
      const threatLevel = down > 0 ? "HIGH" : degraded > 0 ? "ELEVATED" : "LOW";
      return {
        status: down > 0 ? "DEGRADED" : "OPERATIONAL",
        threat_level: threatLevel,
        mode: down > 0 ? "lockdown" : "peace",
        recent_threats: checks
          .filter((c) => (c as Record<string, unknown>).status === "down")
          .map((c) => ({ name: (c as Record<string, unknown>).name })),
      };
    },
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function callGateway<T>(
  operation: string,
  payload: Record<string, unknown> = {},
): Promise<T> {
  const spec = OPERATIONS[operation];
  if (!spec) return OP_UNSUPPORTED(operation);

  const url = `${API_BASE}${spec.path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const apiKey = import.meta.env.VITE_RDM_API_KEY;
  if (apiKey) headers["x-rdm-api-key"] = apiKey;

  const res = await fetch(url, {
    method: spec.method,
    headers,
    ...(spec.method === "POST" ? { body: JSON.stringify(payload) } : {}),
  });

  const raw: unknown = await res.json().catch(() => ({}));
  if (!res.ok || !isRecord(raw) || raw.ok === false) {
    const errorMessage =
      isRecord(raw) && typeof raw.error === "string"
        ? raw.error
        : `La API territorial respondió ${res.status}`;
    throw new Error(errorMessage);
  }

  const result = spec.transform(raw);
  return result as T;
}
