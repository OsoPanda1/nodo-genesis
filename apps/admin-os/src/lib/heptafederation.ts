import type { IsabellaDecision } from "@/core/models";

export type FederationId =
  | "DEKATEOTL"
  | "ANUBIS"
  | "BOOKPI_DATAGIT"
  | "PHOENIX"
  | "MDD_TAMV"
  | "KAOS_HYPERRENDER"
  | "CHRONOS";

export type FederationModule = {
  id: FederationId;
  name: string;
  specialty: string;
  stack: string[];
  role: string;
  status: "ACTIVE" | "IDLE" | "DEGRADED";
  health: number;
  operationalScore: number;
};

export const HEPTAFEDERATION: FederationModule[] = [
  {
    id: "DEKATEOTL",
    name: "Dekateotl™",
    specialty: "Ética y Lógica Narrativa",
    stack: ["LangGraph", "SHAP", "RLHF"],
    role: "Orquestador de axiología, veto ético y memoria de valores.",
    status: "ACTIVE",
    health: 0.98,
    operationalScore: 0.97,
  },
  {
    id: "ANUBIS",
    name: "Anubis Sentinel™",
    specialty: "Seguridad PQC",
    stack: ["Dilithium-5", "Kyber-1024", "zk-SNARKs"],
    role: "Blindaje criptográfico poscuántico y túnel de soberanía.",
    status: "ACTIVE",
    health: 1,
    operationalScore: 0.99,
  },
  {
    id: "BOOKPI_DATAGIT",
    name: "BookPI™ / DataGit™",
    specialty: "Inmutabilidad y Auditoría",
    stack: ["IPFS Pinning", "Merkle Trees", "MSR Blockchain"],
    role: "Caja negra y trazabilidad granular de decisiones.",
    status: "ACTIVE",
    health: 0.94,
    operationalScore: 0.95,
  },
  {
    id: "PHOENIX",
    name: "Phoenix Protocol™",
    specialty: "Resiliencia y P2P",
    stack: ["libp2p", "Swarm Quorum"],
    role: "Topología de resiliencia sin SPOF y auto-reparación.",
    status: "ACTIVE",
    health: 0.96,
    operationalScore: 0.92,
  },
  {
    id: "MDD_TAMV",
    name: "MDD / TAMV Credits™",
    specialty: "Economía Creativa",
    stack: ["Web3 Identity", "Quadratic Funding"],
    role: "Motor de valor y financiamiento comunitario.",
    status: "ACTIVE",
    health: 0.93,
    operationalScore: 0.91,
  },
  {
    id: "KAOS_HYPERRENDER",
    name: "KAOS / HyperRender™",
    specialty: "Sensorialidad y XR",
    stack: ["Three.js", "WebNN", "Haptics API"],
    role: "Capa multisensorial y sinestesia digital Crystal Glow.",
    status: "IDLE",
    health: 0.89,
    operationalScore: 0.88,
  },
  {
    id: "CHRONOS",
    name: "Chronos Planning™",
    specialty: "Gestión de Tiempo y Guía",
    stack: ["Genetic Algorithms", "Mapbox GL", "Turf.js"],
    role: "Planificador multiobjetivo territorial.",
    status: "ACTIVE",
    health: 0.97,
    operationalScore: 0.96,
  },
];

export function applyDecisionToHeptafederation(decision?: IsabellaDecision) {
  if (!decision) return HEPTAFEDERATION;

  return HEPTAFEDERATION.map((module) => {
    const stress = decision.retentionIntent === "SAFE_EXIT" ? 0.04 : decision.retentionIntent === "UPSELL" ? 0.02 : 0;
    const operationalScore = Math.max(0.65, Math.min(1, module.health - stress));

    return {
      ...module,
      operationalScore,
      status: operationalScore < 0.8 ? "DEGRADED" : module.status,
    };
  });
}

export function getGlobalHealth(modules = HEPTAFEDERATION): number {
  return modules.reduce((acc, m) => acc + m.operationalScore, 0) / modules.length;
}

export function getTelemetry(modules = HEPTAFEDERATION) {
  return modules.map((m) => ({
    id: m.id.slice(0, 3),
    label: m.name,
    status: Math.round(m.operationalScore * 100),
    specialty: m.specialty,
    statusLabel: m.status,
  }));
}
