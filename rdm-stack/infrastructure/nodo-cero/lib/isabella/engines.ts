import { YUN_CORES, RDM_NODES_35, RDM_POIS } from "@/lib/data/rdm-data";
import {
  IsabellaMemoryItem,
  IsabellaPerception,
  MemoryScope,
  PolicyStatus,
  RiskLevel,
} from "./contracts";
import { ISABELLA_POLICIES } from "./constitution";
import { getKnowledge, IsabellaIntent } from "./knowledge";
import { addMemoryItem, getMemoryStats, recallMemory } from "./memory";
import { getGamificationStatus } from "../gamification/status";
import { getWorldRuntimeStatus } from "../gamification/world/status";
import { CanonicalIntent } from "./intention-parser";
import { clamp } from "./utils";

/* ------------------------------------------------------------------ */
/* ORION v2 — Percepción e Intent Graph                               */
/* ------------------------------------------------------------------ */

export type IntentMode =
  | "informational"
  | "navigational"
  | "transitional"
  | "situational"
  | "constitutional";

export interface IntentDescriptor {
  intent: IsabellaIntent;
  mode: IntentMode;
  keywords: string[];
  weight?: number;
}

export interface OrionOutput {
  intent: IsabellaIntent;
  intentScores: Array<{
    intent: IsabellaIntent;
    score: number;
    mode: IntentMode;
  }>;
  entities: string[];
  sentiment:
    | "muy_negativo"
    | "negativo"
    | "neutral"
    | "positivo"
    | "muy_positivo";
  forbiddenTokens: string[];
  intentConfidence: number;
}

const INTENT_GRAPH: IntentDescriptor[] = [
  {
    intent: "greeting",
    mode: "situational",
    keywords: [
      "hola",
      "buenas",
      "saludos",
      "hey",
      "que tal",
      "bienvenida",
      "hello",
      "hi",
    ],
    weight: 1.0,
  },
  {
    intent: "yun",
    mode: "constitutional",
    keywords: [
      "yun",
      "heptafederad",
      "nucleo",
      "nodo cero",
      "federacion",
      "arquitectura",
      "35 nodos",
      "7 nucleos",
      "data fabric",
    ],
    weight: 1.2,
  },
  {
    intent: "gastronomia",
    mode: "informational",
    keywords: [
      "paste",
      "gastronomia",
      "comida",
      "pan de pulque",
      "esquimo",
      "cafe",
      "repulgue",
      "restaurante",
      "comer",
    ],
    weight: 1.0,
  },
  {
    intent: "minas",
    mode: "informational",
    keywords: [
      "mina",
      "acosta",
      "dificultad",
      "dolores",
      "socavon",
      "socavón",
      "minero",
      "subterraneo",
    ],
    weight: 1.1,
  },
  {
    intent: "cultura",
    mode: "informational",
    keywords: [
      "cultura",
      "panteon",
      "panteón",
      "ingles",
      "iglesia",
      "rosario",
      "asuncion",
      "museo",
      "leyenda",
      "callejon",
      "callejón",
      "patrimonio",
    ],
    weight: 1.0,
  },
  {
    intent: "naturaleza",
    mode: "informational",
    keywords: [
      "naturaleza",
      "mirador",
      "purisima",
      "purísima",
      "hiloche",
      "penas",
      "peñas",
      "sender",
      "bosque",
      "zelontla",
      "geoparque",
      "atardecer",
    ],
    weight: 1.0,
  },
  {
    intent: "eventos",
    mode: "navigational",
    keywords: [
      "evento",
      "feria",
      "festival",
      "semana cornish",
      "fiesta",
      "calendario",
      "cuando",
      "fecha",
      "huelga 1766",
      "dia de muertos",
    ],
    weight: 1.1,
  },
  {
    intent: "seguridad",
    mode: "constitutional",
    keywords: [
      "seguridad",
      "criptografia",
      "post-cuantica",
      "postcuantica",
      "dilithium",
      "falcon",
      "quantica",
      "cuántica",
      "hash",
      "firma",
    ],
    weight: 1.3,
  },
  {
    intent: "historia",
    mode: "informational",
    keywords: [
      "historia",
      "1824",
      "cornualles",
      "1766",
      "huelga",
      "conde",
      "regla",
      "1552",
      "real de minas",
      "tradicion",
      "tradición",
    ],
    weight: 1.0,
  },
  {
    intent: "ruta",
    mode: "navigational",
    keywords: [
      "ruta",
      "recorrido",
      "itinerario",
      "tour",
      "camino",
      "visitar",
      "recomienda",
    ],
    weight: 1.1,
  },
  {
    intent: "comercio",
    mode: "transitional",
    keywords: [
      "comercio",
      "tienda",
      "compra",
      "marketplace",
      "plateria",
      "platería",
      "artesano",
      "negocio",
      "directorio",
    ],
    weight: 1.2,
  },
  {
    intent: "dicho",
    mode: "informational",
    keywords: [
      "dicho",
      "refran",
      "refrán",
      "proverbio",
      "frase minera",
      "dichos",
    ],
    weight: 1.0,
  },
  {
    intent: "tecnologia",
    mode: "constitutional",
    keywords: [
      "tecnologia",
      "gemelo",
      "sensor",
      "telemetria",
      "inteligencia",
      "ia",
      "app",
      "plataforma",
      "digital",
    ],
    weight: 1.1,
  },
  {
    intent: "pois",
    mode: "navigational",
    keywords: [
      "poi",
      "punto de interes",
      "puntos de interes",
      "lugares",
      "georreferenci",
    ],
    weight: 1.0,
  },
  {
    intent: "memoria",
    mode: "informational",
    keywords: [
      "recuerda",
      "memoria",
      "recordar",
      "conversacion",
      "conversación",
      "anterior",
    ],
    weight: 1.0,
  },
  {
    intent: "gamificacion",
    mode: "situational",
    keywords: [
      "zombie",
      "zombies",
      "juego",
      "gamificacion",
      "gamificación",
      "invasión",
      "invasion",
      "oleada",
      "oleadas",
      "captura",
      "guardian",
      "guardián",
      "puntos del juego",
      "ranking",
      "score",
      "puntaje",
      "wave",
      "level up",
      "nivel",
      "mundo territorial",
      "world runtime",
      "manifiesto",
      "prefab",
      "entidad del mundo",
      "propuesta de mundo",
    ],
    weight: 1.2,
  },
  {
    intent: "ayuda",
    mode: "situational",
    keywords: [
      "ayuda",
      "ayudame",
      "qué puedes",
      "que puedes",
      "funciones",
      "capacidades",
      "opciones",
    ],
    weight: 1.0,
  },
];

const KNOWN_ENTITIES: string[] = [
  "paste",
  "repulgue",
  "pan de pulque",
  "esquimo",
  "café de altura",
  "mina de acosta",
  "la dificultad",
  "mina de dolores",
  "socavón",
  "panteón inglés",
  "rosario",
  "asunción",
  "zelontla",
  "hiloche",
  "peñas cargadas",
  "mirador purísima",
];

const POSITIVE_WORDS = [
  "gracias",
  "genial",
  "excelente",
  "me encanta",
  "increíble",
  "perfecto",
  "bien",
  "maravilloso",
];
const NEGATIVE_WORDS = [
  "mal",
  "no funciona",
  "error",
  "problema",
  "falla",
  "queja",
  "horrible",
  "terrible",
];
const URGENCY_WORDS = ["urgente", "emergencia", "ya", "inmediato"];

export function ORION_perceive(
  perception: IsabellaPerception,
): OrionOutput {
  const text = (perception.payload.text ?? "").toLowerCase().trim();
  const lengthFactor = clamp(text.length / 280, 0.2, 1.0);

  const intentScores: Array<{
    intent: IsabellaIntent;
    score: number;
    mode: IntentMode;
  }> = INTENT_GRAPH
    .map((entry) => {
      const hits = entry.keywords.filter((k) => text.includes(k)).length;
      const baseScore = hits * (entry.weight ?? 1.0);
      const normalized = baseScore * lengthFactor;
      return {
        intent: entry.intent,
        score: normalized,
        mode: entry.mode,
      };
    })
    .filter((s) => s.score > 0);

  intentScores.sort((a, b) => b.score - a.score);

  const best =
    intentScores.length > 0
      ? intentScores[0].intent
      : ("fallback" as IsabellaIntent);
  const bestScore = intentScores.length > 0 ? intentScores[0].score : 0;

  const entities = KNOWN_ENTITIES.filter((e) =>
    text.includes(e.toLowerCase()),
  );

  const posHits = POSITIVE_WORDS.filter((w) => text.includes(w)).length;
  const negHits = NEGATIVE_WORDS.filter((w) => text.includes(w)).length;
  const urgHits = URGENCY_WORDS.filter((w) => text.includes(w)).length;

  let sentiment: OrionOutput["sentiment"] = "neutral";
  if (negHits >= 2 || (negHits === 1 && urgHits >= 1)) sentiment = "muy_negativo";
  else if (negHits === 1) sentiment = "negativo";
  else if (posHits >= 2) sentiment = "muy_positivo";
  else if (posHits === 1) sentiment = "positivo";

  const forbiddenTokens = ISABELLA_POLICIES
    .filter((p) => p.match && p.match.test(text))
    .map((p) => p.id);

  const intentConfidence = clamp(0.3 + bestScore * 0.12, 0, 0.98);

  return {
    intent: best,
    intentScores,
    entities,
    sentiment,
    forbiddenTokens,
    intentConfidence,
  };
}

/* ------------------------------------------------------------------ */
/* ARGUS v2 — Evaluación de riesgo y budgets                          */
/* ------------------------------------------------------------------ */

export interface RiskBudget {
  timeBudgetMs: number;
  costBudgetUnits: number;
  loopBudget: number;
  killSwitchEnabled: boolean;
  requiresHumanApproval: boolean;
}

export interface ArgusOutput {
  level: RiskLevel;
  score: number;
  factors: string[];
  budget: RiskBudget;
}

function deriveBudget(level: RiskLevel): RiskBudget {
  switch (level) {
    case "high":
      return {
        timeBudgetMs: 3000,
        costBudgetUnits: 10,
        loopBudget: 3,
        killSwitchEnabled: true,
        requiresHumanApproval: true,
      };
    case "medium":
      return {
        timeBudgetMs: 7000,
        costBudgetUnits: 25,
        loopBudget: 8,
        killSwitchEnabled: true,
        requiresHumanApproval: false,
      };
    case "low":
    default:
      return {
        timeBudgetMs: 15000,
        costBudgetUnits: 50,
        loopBudget: 16,
        killSwitchEnabled: false,
        requiresHumanApproval: false,
      };
  }
}

export function ARGUS_assess(
  perception: IsabellaPerception,
  orion: OrionOutput,
): ArgusOutput {
  const text = (perception.payload.text ?? "").toLowerCase();
  const factors: string[] = [];
  let score = 5;

  if (orion.forbiddenTokens.length > 0) {
    score += 60;
    factors.push("señal de política constitucional detectada");
  }

  if (perception.payload.riskLevel === "high") {
    score += 40;
    factors.push("riesgo alto declarado en la percepción");
  } else if (perception.payload.riskLevel === "medium") {
    score += 20;
    factors.push("riesgo medio declarado en la percepción");
  }

  const action = (perception.payload.action ?? "").toLowerCase();
  if (
    action &&
    !/get|consult|list|read|search|recommend|suggest/.test(action)
  ) {
    score += 25;
    factors.push(`acción mutante (${action})`);
  }

  if (
    /delete|borrar|eliminar|bloquear|banear|cerrar|desactivar/i.test(text)
  ) {
    score += 20;
    factors.push("verbos destructivos presentes");
  }

  if (
    /dinero|pagar|transferir|billetera|wallet|token/i.test(text)
  ) {
    score += 10;
    factors.push("referencia económica sensible");
  }

  if (orion.sentiment === "muy_negativo") {
    score += 15;
    factors.push("sentimiento muy negativo detectado");
  }

  const level: RiskLevel =
    score >= 60 ? "high" : score >= 30 ? "medium" : "low";

  const finalScore = clamp(score, 0, 100);
  const budget = deriveBudget(level);

  return { level, score: finalScore, factors, budget };
}

/* ------------------------------------------------------------------ */
/* LUMEN v2 — Evaluador constitucional modular                         */
/* ------------------------------------------------------------------ */

export interface LumenOutput {
  status: PolicyStatus;
  appliedPolicies: string[];
  reason: string;
  domainAudit: Array<{
    policyId: string;
    domain: string;
    priority: number;
  }>;
}

export function LUMEN_evaluate(
  perception: IsabellaPerception,
  argus: ArgusOutput,
): LumenOutput {
  const text = (perception.payload.text ?? "").toLowerCase();
  const appliedPolicies: string[] = [];
  const domainAudit: LumenOutput["domainAudit"] = [];

  for (const policy of ISABELLA_POLICIES) {
    if (policy.match && policy.match.test(text)) {
      appliedPolicies.push(policy.id);
      domainAudit.push({
        policyId: policy.id,
        domain: (policy.domain ?? "general") as string,
        priority: policy.priority ?? 0,
      });
    }
  }

  const action = (perception.payload.action ?? "").toLowerCase();
  if (
    action &&
    /financial_lock|apply_economic_freeze|freeze_assets|economic_sanction/.test(
      action,
    )
  ) {
    const policy = ISABELLA_POLICIES.find(
      (p) => p.id === "pol-economic-sovereignty",
    );
    if (policy) {
      appliedPolicies.push(policy.id);
      domainAudit.push({
        policyId: policy.id,
        domain: (policy.domain ?? "economic") as string,
        priority: policy.priority ?? 100,
      });
    }

    return {
      status: "denied",
      appliedPolicies,
      domainAudit,
      reason:
        "LUMEN bloquea la acción: la Soberanía Económica Absoluta prohíbe el congelamiento o bloqueo financiero del territorio.",
    };
  }

  if (argus.level === "high") {
    appliedPolicies.push("pol-high-risk-approval");
    domainAudit.push({
      policyId: "pol-high-risk-approval",
      domain: "governance",
      priority: 90,
    });

    return {
      status: "requires_approval",
      appliedPolicies,
      domainAudit,
      reason:
        "La percepción presenta riesgo alto y, conforme a la Constitución YUN, requiere aprobación humana antes de ejecutar acciones.",
    };
  }

  const hasDeny = appliedPolicies.some((id) => {
    const p = ISABELLA_POLICIES.find((pol) => pol.id === id);
    return p?.action === "deny";
  });

  if (hasDeny) {
    const blockingPolicy = appliedPolicies.find((id) => {
      const p = ISABELLA_POLICIES.find((pol) => pol.id === id);
      return p?.action === "deny";
    });
    const rule = ISABELLA_POLICIES.find((p) => p.id === blockingPolicy)?.rule;
    return {
      status: "denied",
      appliedPolicies,
      domainAudit,
      reason: rule ?? "Acción bloqueada por política constitucional.",
    };
  }

  return {
    status: "allowed",
    appliedPolicies,
    domainAudit,
    reason: "Percepción conforme a la Constitución YUN.",
  };
}

/* ------------------------------------------------------------------ */
/* KERNEL v2 — Identidad, rol y federación                            */
/* ------------------------------------------------------------------ */

export interface KernelOutput {
  actorId: string;
  sessionId: string;
  role: string;
  sessionState: "nuevo" | "existente";
  tenantId: string;
  federationId: string;
  coreId: number | null;
  nodeId: number | null;
  trustLevel: "bajo" | "medio" | "alto";
}

export function KERNEL_verify(
  perception: IsabellaPerception,
): KernelOutput {
  const actorId = perception.actorId || "actor-anonimo";
  const sessionId = perception.sessionId || "sesion-efimera";
  const role = (perception.payload.role as string) || "ciudadano-yun";
  const sessionState: KernelOutput["sessionState"] = perception.sessionId
    ? "existente"
    : "nuevo";

  const federationId = (perception.payload.federationId as string) || "Fed1";
  const tenantId = (perception.payload.tenantId as string) || "real-del-monte";

  const coreId =
    typeof perception.payload.coreId === "number"
      ? perception.payload.coreId
      : null;
  const nodeId =
    typeof perception.payload.nodeId === "number"
      ? perception.payload.nodeId
      : null;

  let trustLevel: KernelOutput["trustLevel"] = "medio";
  if (role === "operador" || role === "agente-sistema") trustLevel = "alto";
  if (role === "visitante") trustLevel = "bajo";

  return {
    actorId,
    sessionId,
    role,
    sessionState,
    tenantId,
    federationId,
    coreId,
    nodeId,
    trustLevel,
  };
}

/* ------------------------------------------------------------------ */
/* TOPOLOGY v2 — Contexto territorial activo                          */
/* ------------------------------------------------------------------ */

export interface TopologySnapshot {
  place: string;
  federation: string;
  coordinates: [number, number];
  altitudeMeters: number;
  geosite: string;
  cores: number;
  nodes: number;
  pois: number;
  activeNodes: number;
  syncPercent: number;
  temperatureC: number;
  weather: string;
  status: "Optimal" | "Degradado" | "Crítico";
  congestionLevel: "bajo" | "medio" | "alto";
  eventDensity: number;
  economicActivityIndex: number;
  sensorHealthIndex: number;
  nodesByCore: Array<{ coreId: number; name: string; count: number }>;
}

export function TOPOLOGY_snapshot(): TopologySnapshot {
  const nodesByCore = YUN_CORES.map((core) => ({
    coreId: core.id,
    name: core.name,
    count: RDM_NODES_35.filter((n) => n.coreId === core.id).length,
  }));

  return {
    place: "Real del Monte, Hidalgo, México",
    federation: "Fed1",
    coordinates: [20.1398, -98.6738],
    altitudeMeters: 2710,
    geosite: "Geoparque Mundial UNESCO Comarca Minera",
    cores: YUN_CORES.length,
    nodes: RDM_NODES_35.length,
    pois: RDM_POIS.length,
    activeNodes: RDM_NODES_35.length,
    syncPercent: 99.9,
    temperatureC: 13.8,
    weather: "Niebla ligera con cielo despejado por la tarde",
    status: "Optimal",
    congestionLevel: "bajo",
    eventDensity: 0.2,
    economicActivityIndex: 0.75,
    sensorHealthIndex: 0.92,
    nodesByCore,
  };
}

/* ------------------------------------------------------------------ */
/* MNEMOS v2 — Memoria y consolidación                                */
/* ------------------------------------------------------------------ */

export interface MnemosOutput {
  recalled: IsabellaMemoryItem[];
  stored: IsabellaMemoryItem[];
  stats: { total: number; byScope: Record<string, number> };
}

export function MNEMOS_cycle(
  perception: IsabellaPerception,
  orion: OrionOutput,
): MnemosOutput {
  const query = perception.payload.text ?? "";
  const scopeForStore: MemoryScope =
    perception.type === "event" || perception.type === "signal"
      ? "immediate"
      : "session";

  const stored: IsabellaMemoryItem[] = [];

  const trimmed = query.trim();
  if (trimmed.length >= 8) {
    stored.push(
      addMemoryItem({
        scope: scopeForStore,
        content: trimmed.slice(0, 280),
        tags: [orion.intent, ...orion.entities.slice(0, 3)],
        relevance: 0.6,
        actorId: perception.actorId,
        sessionId: perception.sessionId,
      }),
    );

    stored.push(
      addMemoryItem({
        scope: "territorial",
        content: `${orion.intent}: ${trimmed.slice(0, 140)}`,
        tags: ["territorio", orion.intent],
        relevance: 0.45,
        actorId: "isabella",
        sessionId: perception.sessionId,
      }),
    );
  }

  const recalled = recallMemory(query, undefined, 4);
  const stats = getMemoryStats();

  const intentsCount: Record<string, number> = {};
  for (const m of recalled) {
    for (const t of m.tags || []) {
      intentsCount[t] = (intentsCount[t] || 0) + 1;
    }
  }

  const popularIntents = Object.entries(intentsCount)
    .filter(([_, count]) => count >= 3)
    .map(([intent]) => intent);

  for (const intent of popularIntents) {
    stored.push(
      addMemoryItem({
        scope: "territorial",
        content: `consolidado:${intent}`,
        tags: ["territorio", "consolidado", intent],
        relevance: 0.8,
        actorId: "isabella",
        sessionId: perception.sessionId,
      }),
    );
  }

  return { recalled, stored, stats };
}

/* ------------------------------------------------------------------ */
/* SOPHIA v2 — Razonamiento y plan de herramientas                     */
/* ------------------------------------------------------------------ */

export interface PlannedStep {
  step: number;
  tool: string;
  args?: Record<string, unknown>;
  description: string;
}

export interface SophiaOutput {
  response: string;
  supportingFacts: string[];
  suggestedTools: string[];
  plan: PlannedStep[];
}

function pick(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)];
}

function buildPlan(orion: OrionOutput): PlannedStep[] {
  const plan: PlannedStep[] = [];

  if (orion.intent === "eventos") {
    plan.push({
      step: 1,
      tool: "get_upcoming_events",
      args: {},
      description:
        "Consultar calendario de eventos y festivales en Real del Monte.",
    });
  } else if (orion.intent === "ruta") {
    plan.push({
      step: 1,
      tool: "get_tourism_routes",
      args: {},
      description:
        "Obtener rutas recomendadas según intereses declarados.",
    });
  } else if (orion.intent === "dicho") {
    plan.push({
      step: 1,
      tool: "get_rdm_dicho",
      args: {},
      description:
        "Recuperar un dicho o refrán minero asociado al territorio.",
    });
  } else if (
    orion.intent === "pois" ||
    orion.intent === "minas" ||
    orion.intent === "naturaleza"
  ) {
    plan.push({
      step: 1,
      tool: "get_poi_info",
      args: {},
      description:
        "Consultar información detallada de POIs georreferenciados.",
    });
  } else if (orion.intent === "comercio") {
    plan.push({
      step: 1,
      tool: "get_business_directory",
      args: {},
      description:
        "Listar comercios, artesanos y negocios locales.",
    });
  } else if (orion.intent === "yun" || orion.intent === "tecnologia") {
    plan.push({
      step: 1,
      tool: "get_yun_overview",
      args: {},
      description:
        "Desplegar overview arquitectónico de la heptafederación YUN.",
    });
  } else if (orion.intent === "gamificacion") {
    plan.push({
      step: 1,
      tool: "get_gamification_status",
      args: {},
      description:
        "Consultar el estado de la gamificación territorial: puntos, capturas y ranking de guardianes.",
    });
    plan.push({
      step: 2,
      tool: "get_world_status",
      args: {},
      description:
        "Consultar el World Runtime: revisión publicada, entidades del manifiesto y propuestas pendientes.",
    });
  } else {
    plan.push({
      step: 1,
      tool: "get_territory_status",
      args: {},
      description:
        "Consultar estado operativo actual del territorio.",
    });
  }

  return plan;
}

export function SOPHIA_reason(
  perception: IsabellaPerception,
  orion: OrionOutput,
  recalled: IsabellaMemoryItem[],
  territory: TopologySnapshot,
  canonical?: CanonicalIntent,
): SophiaOutput {
  const knowledge = getKnowledge(orion.intent);
  const opening = pick(knowledge.facts);
  const supportingFacts = knowledge.facts.slice(0, 3);

  const territoryLine = `El territorio se encuentra en estado ${territory.status}: ${territory.cores} núcleos y ${territory.nodes} nodos sincronizados al ${territory.syncPercent}%, ${territory.pois} POIs georreferenciados y ${territory.temperatureC}°C en el monte.`;

  const memoryLine =
    recalled.length > 0
      ? `Recuerdo de tu sesión: ${recalled
          .slice(0, 2)
          .map((m) => `"${m.content.slice(0, 80)}..."`)
          .join(" · ")}`
      : "Sigo construyendo la memoria de esta sesión para estar siempre a tu lado.";

  const canonicalLine =
    canonical &&
    ["governance", "constitution", "ethics"].includes(canonical.domain)
      ? `\n\nHe clasificado tu consulta en el dominio canónico «${canonical.domain}» de la ISA API (confianza ${Math.round(
          canonical.confidence * 100,
        )}%). La evalúo conforme a la Constitución C.R.O.W.N. y al Runtime YUN.`
      : "";

  const prompt = (perception.payload.text ?? "").trim();
  const userIntent =
    orion.intent !== "fallback"
      ? ` (te he identificado el tema: ${orion.intent})`
      : "";

  let response: string;

  if (orion.intent === "greeting") {
    response = `${opening}\n\n${territoryLine}`;
  } else if (orion.intent === "gamificacion") {
    const game = getGamificationStatus();
    const world = getWorldRuntimeStatus();
    const guardianLine =
      game.topGuardians.length > 0
        ? `\n\nEn el ranking de guardianes del Nodo lidera «${game.topGuardians[0].name}» con ${game.topGuardians[0].points.toLocaleString('es-MX')} pts. Se han registrado ${game.totalKills.toLocaleString('es-MX')} zombies capturados en la comarca.`
        : "\n\nAún no hay guardianes en el ranking del Nodo: sé el primero en salir a la patrulla.";
    const worldLine = `\n\nWorld Runtime: revisión publicada ${world.publishedRevision ?? 'n/d'} con ${world.entityCount} entidades; ${world.pendingProposals} propuestas pendientes de aprobación humana (Isabella solo propone, nunca publica).`;
    response = `${opening}\n\n${game.topGuardians
      .slice(1, 3)
      .map(g => `«${g.name}»: ${g.points.toLocaleString('es-MX')} pts (${g.captures} capturas)`)
      .join(" · ")}${guardianLine}${worldLine}\n\n${memoryLine}`;
  } else if (orion.intent === "dicho") {
    response = `${opening}\n\n${territoryLine}\n\n${memoryLine}`;
  } else {
    const hint = prompt
      ? `Sobre «${prompt.slice(0, 90)}»${userIntent}: `
      : "";
    response = `${hint}${opening}\n\n${supportingFacts
      .slice(1)
      .join(" ")}\n\n${territoryLine}\n\n${memoryLine}`;
  }

  response += canonicalLine;

  const plan = buildPlan(orion);
  const suggestedTools = plan.map((p) => p.tool);

  return { response, supportingFacts, suggestedTools, plan };
}
