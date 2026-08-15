export type IntentCategory =
  | "saludo"
  | "historia"
  | "lugares"
  | "gastronomia"
  | "cultura"
  | "eventos"
  | "clima"
  | "como_llegar"
  | "pastes"
  | "mineria"
  | "arquitectura"
  | "fabricacion_pastes"
  | "economia"
  | "presentacion"
  | "identidad"
  | "despedida"
  | "general";

export interface IsaAiMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface IsaAiRequest {
  messages: IsaAiMessage[];
  sessionId?: string;
  stream?: boolean;
}

export interface IsaAiResponse {
  content: string;
  intent: IntentCategory;
  traceId: string;
  provider: "isa-ai";
  model: "mexa-ai-v1";
}

export interface IntentMatch {
  category: IntentCategory;
  confidence: number;
  keywords: string[];
}

export interface KnowledgeEntry {
  id: string;
  keywords: string[];
  content: string;
  category: IntentCategory[];
  priority: number;
  title: string;
}

export interface TemplateResponse {
  pattern: RegExp;
  category: IntentCategory;
  responses: string[];
  priority: number;
}
