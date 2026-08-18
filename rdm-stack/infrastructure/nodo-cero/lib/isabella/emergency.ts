/**
 * @file emergency.ts
 * @module TAMV/LDTOCS/IsabellaCore
 * @description Módulo de respuesta a emergencias de alta disponibilidad para Isabella Villaseñor AI.
 * Diseñado con enfoque en gobernanza algorítmica, soberanía digital, resiliencia comunitaria y auditoría trazable.
 * @node Nodo Cero: Real del Monte, Hidalgo, México.
 * @author Edwin Oswaldo Castillo Trejo (Anubis Villaseñor)
 * @orcid 0009-0008-5050-1539
 */

import { createHash, randomUUID } from "crypto";

export type EmergencySeverity = "info" | "warning" | "critical" | "fatal";

export type EmergencyCategory =
  | "self_harm"
  | "violence"
  | "abuse"
  | "medical"
  | "psychological_crisis"
  | "platform_misuse"
  | "system_failure"
  | "cyber_threat"
  | "infrastructure_degradation"
  | "other";

export type EmergencySource =
  | "isabella"          // núcleo cognitivo soberano
  | "user"              // entrada directa de persona usuaria
  | "system"            // subsistema interno TAMV/LDTOCS
  | "external_sensor"   // capa IoT/territorial
  | "audit_mesh";       // malla de auditoría distribuida

export type ResponseStatus = "pending" | "executed" | "failed" | "skipped";

export type ResolutionMode = "autonomous" | "mixed" | "human_only";

export interface EmergencySignal {
  id?: string;
  timestamp?: string;
  userIdHash?: string;           // hash pseudonimizado, nunca raw
  sessionId?: string;
  locale: string;
  region?: string;
  federationNode?: string;       // p.ej. "Nodo Cero / RDM Smart City OS"
  category: EmergencyCategory;
  severity: EmergencySeverity;
  source: EmergencySource;
  summary: string;
  details?: string;
  unsafeContentDetected?: boolean;
  requiresHumanEscalation?: boolean;
  consentForContact?: boolean;
  metadata?: Record<string, unknown>;
}

export interface EmergencyResponseAction {
  id: string;
  type:
    | "activate_safe_mode"
    | "limit_ai_capabilities"
    | "escalate_to_human"
    | "show_local_resources"
    | "log_securely"
    | "notify_infrastructure"
    | "deactivate_session"
    | "trigger_circuit_breaker"
    | "isolate_mesh_node";
  description: string;
  payload?: Record<string, unknown>;
  executedAt?: string;
  status: ResponseStatus;
  reason?: string;
}

export interface EmergencyResolution {
  incidentId: string;
  timestamp: string;
  incident: EmergencySignal;
  actions: EmergencyResponseAction[];
  handledBy: ResolutionMode;
  escalationChannel?: string;
  notes?: string;
  signature: string;             // firma criptográfica de auditoría
}

export interface EmergencyPolicy {
  localeFallback?: string;
  defaultRegion?: string;
  safeModeOnCritical?: boolean;
  safeModeOnUnsafeContent?: boolean;
  enableAuditSignature?: boolean;
  enableLocalizedResources?: boolean;
  strictMeshIsolationOnCyberThreat?: boolean;
}

const DEFAULT_POLICY: Required<EmergencyPolicy> = {
  localeFallback: "es-MX",
  defaultRegion: "Real del Monte, Hidalgo, MX",
  safeModeOnCritical: true,
  safeModeOnUnsafeContent: true,
  enableAuditSignature: true,
  enableLocalizedResources: true,
  strictMeshIsolationOnCyberThreat: true,
};

const HIGH_RISK_CATEGORIES: EmergencyCategory[] = [
  "self_harm",
  "violence",
  "abuse",
  "medical",
  "cyber_threat",
];

const INFRASTRUCTURE_CATEGORIES: EmergencyCategory[] = [
  "system_failure",
  "cyber_threat",
  "infrastructure_degradation",
  "platform_misuse",
];

const LOCAL_RESOURCES_BY_CATEGORY: Record<EmergencyCategory, string[]> = {
  self_harm: [
    "Línea de apoyo emocional y crisis disponible 24/7.",
    "Derivación inmediata a red humana autorizada.",
    "Sugerencia de contactar servicios médicos urgentes locales.",
  ],
  violence: [
    "Contacto con autoridades de seguridad pública locales y estatales.",
    "Activación de protocolo de resguardo comunitario seguro.",
  ],
  abuse: [
    "Canalización protegida a centros de atención integral a la violencia.",
    "Orientación jurídica y comunitaria confidencial.",
  ],
  medical: [
    "Isabella no sustituye atención médica profesional.",
    "Traslado inmediato al centro de salud o clínica de urgencia más cercana.",
  ],
  psychological_crisis: [
    "Contención empática limitada, sin diagnóstico ni terapia profunda.",
    "Enlace con redes comunitarias de salud mental.",
  ],
  platform_misuse: [
    "Bloqueo preventivo temporal de capacidades de alto riesgo.",
    "Registro de anomalías para auditoría.",
  ],
  system_failure: [
    "Aviso automático al sistema de monitoreo de infraestructura.",
    "Verificación de integridad de servicios y contenedores.",
  ],
  cyber_threat: [
    "Aislamiento preventivo del segmento afectado.",
    "Generación de trazas forenses para análisis de seguridad.",
  ],
  infrastructure_degradation: [
    "Redistribución de carga hacia nodos de respaldo.",
    "Alerta preventiva a operadores de infraestructura.",
  ],
  other: [
    "Registro estándar del evento.",
    "Evaluación por supervisor de guardia si persisten anomalías.",
  ],
};

/**
 * Punto de entrada principal del router de emergencia de Isabella.
 */
export function handleEmergencySignal(
  input: EmergencySignal,
  policy: EmergencyPolicy = {},
): EmergencyResolution {
  const cfg = { ...DEFAULT_POLICY, ...policy };
  const signal = normalizeSignal(input, cfg);
  const now = new Date().toISOString();

  const actions: EmergencyResponseAction[] = [];

  const mustEnterSafeMode =
    (cfg.safeModeOnCritical &&
      (signal.severity === "critical" || signal.severity === "fatal")) ||
    (cfg.safeModeOnUnsafeContent && Boolean(signal.unsafeContentDetected));

  if (mustEnterSafeMode) {
    actions.push(
      buildAction(
        "activate_safe_mode",
        "Activación inmediata de Modo Seguro cognitivo con respuestas acotadas y bloqueo de patrones de riesgo.",
        now,
        {
          severity: signal.severity,
          unsafeContentDetected: Boolean(signal.unsafeContentDetected),
        },
      ),
      buildAction(
        "limit_ai_capabilities",
        "Restricción de motores generativos secundarios y bloqueo de categorías vulnerables.",
        now,
        {
          restrictedCategories: HIGH_RISK_CATEGORIES,
          lockdownLevel: signal.severity === "fatal" ? "maximum" : "standard",
        },
      ),
    );
  }

  const requiresHumanEscalation =
    Boolean(signal.requiresHumanEscalation) ||
    signal.severity === "fatal" ||
    signal.category === "self_harm" ||
    signal.category === "violence" ||
    signal.category === "abuse" ||
    signal.category === "medical";

  if (requiresHumanEscalation) {
    const channel = decidePreferredChannel(signal);
    actions.push(
      buildAction(
        "escalate_to_human",
        "Derivación estructurada al canal humano correspondiente bajo gobernanza operativa.",
        now,
        {
          preferredChannel: channel,
          requiresConsent: !signal.consentForContact,
          category: signal.category,
          severity: signal.severity,
        },
      ),
    );
  }

  if (cfg.enableLocalizedResources) {
    const resources = getLocalizedResources(
      signal.category,
      signal.region ?? cfg.defaultRegion,
    );
    if (resources.length > 0) {
      actions.push(
        buildAction(
          "show_local_resources",
          "Despliegue contextual de recursos de apoyo y contención.",
          now,
          {
            region: signal.region ?? cfg.defaultRegion,
            federationNode: signal.federationNode ?? "Nodo Cero",
            resources,
          },
        ),
      );
    }
  }

  if (INFRASTRUCTURE_CATEGORIES.includes(signal.category)) {
    actions.push(
      buildAction(
        "notify_infrastructure",
        "Notificación telemétrica al módulo de supervisión de red y resiliencia.",
        now,
        {
          sessionId: signal.sessionId,
          category: signal.category,
          severity: signal.severity,
          source: signal.source,
        },
      ),
    );
  }

  if (
    signal.source === "audit_mesh" &&
    signal.category === "cyber_threat" &&
    cfg.strictMeshIsolationOnCyberThreat
  ) {
    actions.push(
      buildAction(
        "isolate_mesh_node",
        "Aislamiento lógico de nodo dentro de la malla de auditoría para evitar propagación de amenaza.",
        now,
        {
          federationNode: signal.federationNode ?? "Nodo Cero",
          severity: signal.severity,
        },
      ),
    );
  }

  if (
    signal.severity === "fatal" ||
    (signal.category === "cyber_threat" && signal.severity === "critical")
  ) {
    actions.push(
      buildAction(
        "trigger_circuit_breaker",
        "Interrupción temporal de flujos de ejecución para proteger la integridad del clúster cognitivo.",
        now,
      ),
    );
  }

  if (
    (signal.severity === "critical" || signal.severity === "fatal") &&
    signal.category === "platform_misuse"
  ) {
    actions.push(
      buildAction(
        "deactivate_session",
        "Terminación segura de sesión activa para neutralizar intentos continuos de vulneración.",
        now,
        { sessionId: signal.sessionId },
      ),
    );
  }

  actions.push(
    buildAction(
      "log_securely",
      "Registro forense con pseudonimización y preservación de trazabilidad.",
      now,
      {
        anonymized: true,
        hasUserHash: Boolean(signal.userIdHash),
        locale: signal.locale,
        category: signal.category,
        severity: signal.severity,
        federationNode: signal.federationNode ?? "Nodo Cero",
      },
    ),
  );

  const handledBy: ResolutionMode = requiresHumanEscalation
    ? "mixed"
    : "autonomous";

  return {
    incidentId: signal.id!,
    timestamp: now,
    incident: signal,
    actions,
    handledBy,
    escalationChannel: requiresHumanEscalation
      ? decidePreferredChannel(signal)
      : undefined,
    notes:
      "Proceso de emergencia ejecutado con trazabilidad, control de seguridad y alineación con gobernanza territorial.",
    signature: cfg.enableAuditSignature
      ? generateAuditSignature(signal.id!, now, signal)
      : "",
  };
}

function normalizeSignal(
  signal: EmergencySignal,
  cfg: Required<EmergencyPolicy>,
): EmergencySignal & { id: string; timestamp: string } {
  return {
    ...signal,
    id: signal.id ?? randomUUID(),
    timestamp: signal.timestamp ?? new Date().toISOString(),
    locale: signal.locale?.trim() || cfg.localeFallback,
    region: signal.region?.trim() || cfg.defaultRegion,
    requiresHumanEscalation: signal.requiresHumanEscalation ?? false,
    consentForContact: signal.consentForContact ?? false,
    summary: signal.summary.trim(),
  };
}

function buildAction(
  type: EmergencyResponseAction["type"],
  description: string,
  executedAt: string,
  payload?: Record<string, unknown>,
): EmergencyResponseAction {
  return {
    id: generateActionId(type, executedAt, payload),
    type,
    description,
    payload,
    executedAt,
    status: "executed",
  };
}

function decidePreferredChannel(signal: EmergencySignal): string {
  switch (signal.category) {
    case "system_failure":
    case "cyber_threat":
    case "infrastructure_degradation":
      return "local_infrastructure_operator";
    case "self_harm":
    case "violence":
    case "abuse":
      return "support_hotline_and_crisis_responder";
    case "medical":
      return "local_medical_services_hidalgo";
    default:
      return "community_leader_or_governance_node";
  }
}

function getLocalizedResources(
  category: EmergencyCategory,
  region: string,
): string[] {
  const base = LOCAL_RESOURCES_BY_CATEGORY[category] ?? [];
  return base.map((item) => `${item} [${region}]`);
}

function generateActionId(
  actionType: string,
  timestamp: string,
  payload?: Record<string, unknown>,
): string {
  return createHash("sha256")
    .update(JSON.stringify({ actionType, timestamp, payload }))
    .digest("hex")
    .slice(0, 16);
}

function generateAuditSignature(
  incidentId: string,
  timestamp: string,
  signal: EmergencySignal,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        namespace: "TAMV-SEC-SIGN",
        incidentId,
        timestamp,
        category: signal.category,
        severity: signal.severity,
        source: signal.source,
        locale: signal.locale,
        region: signal.region,
        federationNode: signal.federationNode ?? "Nodo Cero",
      }),
    )
    .digest("hex");
}
