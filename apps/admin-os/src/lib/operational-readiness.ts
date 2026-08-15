export type ReadinessStatus = "backlog" | "in_progress" | "done";

export interface ReadinessTask {
  id: string;
  title: string;
  status: ReadinessStatus;
  owner: "security" | "platform" | "product" | "ops" | "governance";
  milestone: "stage" | "production";
}

export interface ReadinessDomain {
  id: string;
  label: string;
  description: string;
  tasks: ReadinessTask[];
}

export const readinessDomains: ReadinessDomain[] = [
  {
    id: "infra-security",
    label: "Infraestructura y seguridad",
    description: "RLS, secretos, observabilidad y topologia multi-entorno.",
    tasks: [
      { id: "rls-audit", title: "Auditoria externa de RLS por tabla", status: "backlog", owner: "security", milestone: "production" },
      { id: "secrets-rotation", title: "Vault + rotacion de tokens (GitHub/Supabase/IA)", status: "in_progress", owner: "security", milestone: "production" },
      { id: "edge-observability", title: "Logs + metricas + alertas en edge functions", status: "in_progress", owner: "platform", milestone: "stage" },
      { id: "topology", title: "Topologia final dev/stage/prod con TLS", status: "backlog", owner: "platform", milestone: "stage" },
    ],
  },
  {
    id: "product-ux",
    label: "Producto TAMV OS",
    description: "Onboarding de ciudadania, Atlas y Guardian listos para operacion.",
    tasks: [
      { id: "onboarding", title: "Onboarding ciudadano (registro/verificacion/roles)", status: "in_progress", owner: "product", milestone: "stage" },
      { id: "atlas-ui", title: "Atlas con estados vacios y paneles operativos", status: "done", owner: "product", milestone: "stage" },
      { id: "guardian-ui", title: "Guardian con cola, historial y filtros", status: "done", owner: "product", milestone: "stage" },
      { id: "dmx7-v1", title: "Subset publico DM-X7 version 1.0", status: "backlog", owner: "platform", milestone: "production" },
    ],
  },
  {
    id: "xr-rdm",
    label: "XR + RDM Digital",
    description: "Performance visual, fallback 2D y limites de Realito AI.",
    tasks: [
      { id: "xr-stress", title: "Stress tests de TAMVScene/Phoenix en moviles", status: "backlog", owner: "platform", milestone: "production" },
      { id: "fallback-2d", title: "Fallback 2D sin WebGL/WebGPU", status: "backlog", owner: "platform", milestone: "stage" },
      { id: "realito-guardrails", title: "Guardrails de Realito AI (disclaimers y limites)", status: "in_progress", owner: "product", milestone: "stage" },
      { id: "territory-kpis", title: "KPIs territoriales para cabildo/ayuntamiento", status: "backlog", owner: "ops", milestone: "production" },
    ],
  },
  {
    id: "ops-governance",
    label: "Operacion y gobernanza",
    description: "Runbooks, incidentes y trazabilidad economica Fenix 75/25.",
    tasks: [
      { id: "runbooks", title: "Runbooks de operacion diaria e incidentes", status: "in_progress", owner: "ops", milestone: "stage" },
      { id: "fenix-7525", title: "Automatizacion de distribucion Fenix 75/25", status: "backlog", owner: "governance", milestone: "production" },
      { id: "legal-operational", title: "Politicas ejecutables (legal/economia/seguridad)", status: "backlog", owner: "governance", milestone: "production" },
      { id: "release-protocol", title: "Protocolo de actualizacion de versiones MD-X4", status: "in_progress", owner: "ops", milestone: "stage" },
    ],
  },
];

export const statusWeight: Record<ReadinessStatus, number> = {
  backlog: 0,
  in_progress: 0.5,
  done: 1,
};

export function getReadinessProgress(domains: ReadinessDomain[]): number {
  const tasks = domains.flatMap((domain) => domain.tasks);
  if (tasks.length === 0) {
    return 0;
  }

  const score = tasks.reduce((acc, task) => acc + statusWeight[task.status], 0);
  return Math.round((score / tasks.length) * 100);
}

export function getMilestoneProgress(domains: ReadinessDomain[], milestone: "stage" | "production"): number {
  const tasks = domains.flatMap((domain) => domain.tasks).filter((task) => task.milestone === milestone);
  if (tasks.length === 0) {
    return 0;
  }

  const score = tasks.reduce((acc, task) => acc + statusWeight[task.status], 0);
  return Math.round((score / tasks.length) * 100);
}
