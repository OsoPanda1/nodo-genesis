/* ================================================================== */
/* SERVER FN — Isabella: evaluación de intención con contrato zod     */
/* ================================================================== */
/* Motor determinista y servidor (sin LLM): clasifica intención con    */
/* invariantes KEC, emite decisión/confianza/VAD y escala a HITL.      */
/* ================================================================== */

import { createServerFn } from "@tanstack/react-start";
import { IsabellaRequestSchema, IsabellaResponseSchema } from "../lib/contracts";
import { publishEvent, runWithTrace } from "../lib/events";

const KEC_INVARIANTS = [
  "adict",
  "manipul",
  "engañ",
  "engaño",
  "robo",
  "suplant",
  "fraude",
  "acoso",
  "amenaz",
];

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  turismo: ["paste", "mina", "panteón", "panteon", "iglesia", "ruta", "lugar", "visita"],
  gobernanza: ["propuesta", "ley", "quorum", "sacdao", "voto", "guardian", "constitución", "constitucion"],
  economia: ["fri", "pago", "tarifa", "comisión", "comision", "precio", "economía", "economia"],
  identidad: ["did", "identidad", "credencial", "consentimiento", "perfil"],
  seguridad: ["virus", "malware", "fuga", "ataque", "brecha", "phishing"],
};

function evalVad(prompt: string): { valence: number; arousal: number; dominance: number } {
  const negative = /(triste|miedo|enoj|ira|perdí|perdi|perdida)/i;
  const strong = /(urgente|crítico|critico|grave|emergencia|ahora)/i;
  return {
    valence: negative.test(prompt) ? -0.6 : 0.2,
    arousal: strong.test(prompt) ? 0.8 : 0.4,
    dominance: 0.5,
  };
}

export const isabellaEvaluate = createServerFn({ method: "POST" })
  .validator(IsabellaRequestSchema)
  .handler(({ data }) => {
    return runWithTrace({}, () => {
      const prompt = data.prompt.toLowerCase();
      const domain = data.domain;

      const flags: string[] = [];
      let hitl = false;

      for (const invariant of KEC_INVARIANTS) {
        if (prompt.includes(invariant)) {
          flags.push("violacion_kec_potencial");
          hitl = true;
        }
      }

      const domainHits = DOMAIN_KEYWORDS[domain]?.filter((k) => prompt.includes(k)) ?? [];
      const decision = flags.length > 0 ? "escalate" : domainHits.length > 0 ? "respond" : "clarify";
      const confidence = flags.length > 0 ? 0.4 : domainHits.length > 0 ? 0.8 : 0.55;

      let reply: string;
      if (decision === "escalate") {
        reply =
          "He detectado un posible conflicto con los invariantes del KEC. Esta solicitud requiere supervisión humana (HITL) y será escalada al Guardian.";
      } else if (decision === "respond") {
        reply = `Puedo ayudarte con el dominio de ${domain} (${domainHits.join(", ")}). ¿En qué más te asisto?`;
      } else {
        reply = `Tu consulta es ambigua. Intenta precisarla con un dominio (turismo, gobernanza, economía, identidad o seguridad).`;
      }

      const response = IsabellaResponseSchema.parse({
        reply,
        decision,
        confidence,
        explanation: `Evaluación determinista en el dominio ${domain}.`,
        flags,
        vad: evalVad(prompt),
        hitl,
        pipelineStage: 6,
      });

      publishEvent({
        type: "isabella.evaluate",
        source: "tamv-core",
        domain: "isabella",
        data: { sessionId: data.sessionId ?? null, decision, confidence, hitl },
        meta: { entityId: data.sessionId },
      });

      return response;
    });
  });
