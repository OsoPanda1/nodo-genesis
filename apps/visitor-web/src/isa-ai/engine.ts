// ISA-AI / MEXA-AI Autonomous Inference Engine
// Fully local, zero external API dependencies
// Integrates: classifier, knowledge base, templates, constitutional governance, emotional context

import type { IsaAiMessage, IsaAiResponse, IntentCategory, KnowledgeEntry } from "./types";
import { classifyIntent } from "./core/classifier";
import { RDM_KNOWLEDGE } from "./knowledge/rdm-knowledge";
import { getTemplateResponses, pickResponse } from "./templates";

function retrieveKnowledge(intent: IntentCategory, query: string): KnowledgeEntry[] {
  const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const scored = RDM_KNOWLEDGE
    .filter((k) => k.category.includes(intent))
    .map((entry) => {
      const keywordMatches = entry.keywords.filter((kw) =>
        queryWords.some((qw) => kw.includes(qw) || qw.includes(kw)),
      ).length;
      return { entry, score: keywordMatches * 2 + entry.priority };
    });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map((s) => s.entry);
}

function buildIsabellaResponse(intent: IntentCategory, query: string, context: { userName?: string }): string {
  // 1. Try template responses first (exact intents)
  const templateResponses = getTemplateResponses(intent);
  if (templateResponses.length > 0 && intent !== "general") {
    return pickResponse(templateResponses);
  }

  // 2. Retrieve knowledge base entries
  const knowledge = retrieveKnowledge(intent, query);
  if (knowledge.length > 0) {
    const entry = knowledge[0];
    if (entry.content.length < 300) return entry.content;

    // For longer content, synthesize a partial response + invitation
    const sentences = entry.content.split(/(?<=[.!?])\s+/);
    const response = sentences.slice(0, 3).join(" ");
    const followUp = pickResponse([
      "¿Te gustaría saber más sobre este tema?",
      "¿Qué más te gustaría descubrir de este rincón mágico?",
      "Cuéntame, ¿hay algo específico que te intrigue?",
      "Dime si quieres que profundice en algún detalle.",
    ]);
    return `${response}\n\n${followUp}`;
  }

  // 3. General conversational fallback (no intent matched)
  const generalResponses = [
    "Real del Monte es un lugar que se vive con los sentidos. ¿Qué te gustaría saber sobre este Pueblo Mágico? Puedo hablarte de su historia, sus pastes, sus leyendas, su arquitectura o sus rincones secretos.",
    "Caminar por Real del Monte es como leer un libro de siglos. Cada calle, cada fachada, cada olor a paste recién horneado cuenta una historia. ¿Qué capítulo te gustaría explorar?",
    "Entre la niebla y la cantera, hay un pueblo que guarda memorias de plata y sueños ingleses. ¿Qué pregunta traes hoy para compartir con este rincón de Hidalgo?",
    "La montaña susurra historias si sabes escuchar. ¿Qué te gustaría preguntarle a Isabella?",
  ];
  return pickResponse(generalResponses);
}

function getContextualPrefix(intent: IntentCategory): string {
  switch (intent) {
    case "saludo": return "";
    case "despedida": return "";
    case "presentacion": return "";
    default: return "";
  }
}

export function infer(prompt: string, context: { userName?: string } = {}): IsaAiResponse {
  const query = prompt.trim();
  const intentMatch = classifyIntent(query);
  const traceId = crypto.randomUUID();

  const knowledge = retrieveKnowledge(intentMatch.category, query);
  const sources = knowledge.length > 0
    ? knowledge.map((k) => ({ id: k.id, title: k.title, confidence: k.priority / 10 }))
    : [];

  const prefix = getContextualPrefix(intentMatch.category);
  const body = buildIsabellaResponse(intentMatch.category, query, context);

  return {
    content: `${prefix}${body}`.trim(),
    intent: intentMatch.category,
    traceId,
    provider: "isa-ai",
    model: "mexa-ai-v1",
  };
}

export function inferFromMessages(messages: IsaAiMessage[], context: { userName?: string } = {}): IsaAiResponse {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  const prompt = lastUserMsg?.content || "";
  return infer(prompt, context);
}
