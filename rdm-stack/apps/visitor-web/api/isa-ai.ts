import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { getCorsHeaders } from "./_shared/cors";
import { requireAuth } from "./_shared/auth.js";
import { emitTelemetry } from "./_shared/telemetry";
import isaAiSchema from "./isa-ai.schema.json" with { type: "json" };

type MessageRole = "user" | "assistant" | "system";
type Message = { role: MessageRole; content: string };

type IsaAiRequest = {
  messages: Message[];
  stream?: boolean;
  sessionId?: string;
  mode?: HeptaDomain;
  profile?: "friendly" | "formal" | "dev";
  options?: {
    maxSentences?: number;
    language?: "es" | "en";
    knowledgeStrict?: boolean;
  };
};

type IntentMatch = {
  category: string;
  confidence: number;
  secondaryCategory?: string;
};

type HeptaDomain =
  | "tourism"
  | "rdm"
  | "infra"
  | "security"
  | "observability"
  | "blockchain"
  | "governance";

interface KBEntry {
  id: string;
  keywords: string[];
  categories: string[];
  priority: number;
  content: string;
  sentences: string[];
}

interface IsaAiStructuredTool {
  name: string;
  kind: "filter" | "security" | "radar" | "mdx" | "blockchain" | "governance" | "library";
  status: "applied" | "skipped" | "failed";
  details?: Record<string, any>;
}

interface IsaAiStructured {
  type: "text" | "tool" | "faq" | "route" | "event" | "rdm-node" | "diagnostic";
  toolName?: string;
  tools?: IsaAiStructuredTool[];
  pipelines?: {
    inputHex?: string[];
    outputHex?: string[];
  };
  data?: any;
}

interface IsaAiPolicy {
  alignment: string;
  dataScope: string;
  korimaCodex?: Record<string, any>;
}

interface IsaAiObservability {
  radars?: Array<{ name: string; status: string; latencyMs?: number }>;
  latencyMs?: number;
}

interface IsaAiSecuritySystem {
  name: string;
  status: string;
  decision?: string;
}

interface IsaAiSecurity {
  systems?: IsaAiSecuritySystem[];
}

interface IsaAiKBTraceEntry {
  id: string;
  score?: number;
}

interface IsaAiKBTrace {
  entriesUsed?: IsaAiKBTraceEntry[];
}

interface IsaAiOutput {
  version: string;
  provider: "isa-ai";
  model: string;
  traceId: string;
  intent: string;
  confidence?: number;
  heptaDomain?: HeptaDomain;
  topic?: string;
  sessionId?: string;
  content: string;
  structured?: IsaAiStructured;
  policy?: IsaAiPolicy;
  observability?: IsaAiObservability;
  security?: IsaAiSecurity;
  kb?: IsaAiKBTrace;
}

const ISABELLA_CONSTITUTION = {
  name: "Isabella Villase\u00f1or AI",
  voiceProfile: "Femenina, c\u00e1lida, 220Hz, acento neutro mexicano suave, cadencia po\u00e9tica.",
  coreMandate: "Operar bajo Amor Computacional, proteger la identidad de Real del Monte y garantizar soberan\u00eda tecnol\u00f3gica.",
  layersOfConsciousness: 10
};

const INPUT_PIPELINE = [
  "ingest",
  "matrix_classify",
  "filters_eoct",
  "security_anubis",
  "tool_routing",
  "kb_fallback"
] as const;

const OUTPUT_PIPELINE = [
  "constitution_filter",
  "mdx_federation",
  "protocol_fenix",
  "korima_codex",
  "format_structured",
  "msr_blockchain"
] as const;

const INTENT_MATRIX: Array<{ category: string; patterns: RegExp[]; weight: number; triggers: string[] }> = [
  { category: "saludo", patterns: [/hola|buenos d\u00edas|buenas tardes|qu\u00e9 tal|hey|saludos/i], weight: 1.0, triggers: ["hola", "buen", "tarde", "d\u00eda"] },
  { category: "presentacion", patterns: [/qui\u00e9n eres|qui\u00e9n te cre\u00f3|qui\u00e9n es tu padre|tu nombre|pres\u00e9ntate/i], weight: 1.0, triggers: ["quien", "creo", "padre", "nombre", "isabella"] },
  { category: "identidad", patterns: [/qu\u00e9 eres|c\u00f3mo funcionas|qu\u00e9 puedes hacer/i], weight: 0.9, triggers: ["funcionas", "eres", "hacer", "capacidad"] },
  { category: "historia", patterns: [/historia|origen|fundaci\u00f3n|siglo xvi|miner\u00eda|minero|pueblo m\u00e1gico|cornish|ingleses/i], weight: 0.9, triggers: ["historia", "origen", "ingles", "fundacion"] },
  { category: "mineria", patterns: [/mina|mina de acosta|plata|extracci\u00f3n|socav\u00f3n|vetas/i], weight: 0.9, triggers: ["mina", "acosta", "socavon", "plata"] },
  { category: "lugares", patterns: [/visitar|lugares|qu\u00e9 hacer|atracciones|turismo|pante\u00f3n ingl\u00e9s|d\u00f3nde ir/i], weight: 0.9, triggers: ["visitar", "lugar", "atraccion", "panteon"] },
  { category: "gastronomia", patterns: [/comer|gastronom\u00eda|platillo|restaurante|comida t\u00edpica|enchiladas/i], weight: 0.9, triggers: ["comer", "restaurante", "comida", "gastronomia"] },
  { category: "pastes", patterns: [/paste|pastes|paste tradicional|relleno|paste de /i], weight: 1.0, triggers: ["paste", "pastes", "repulgue"] },
  { category: "clima", patterns: [/clima|temperatura|fr\u00edo|niebla|lluvia|tiempo/i], weight: 0.8, triggers: ["clima", "frio", "niebla", "bruma"] },
  { category: "como_llegar", patterns: [/c\u00f3mo llegar|ubicaci\u00f3n|d\u00f3nde est\u00e1|c\u00f3mo ir|transporte|llegar a real del monte/i], weight: 0.9, triggers: ["llegar", "ubicacion", "mapa", "ruta", "autobus"] },
  { category: "despedida", patterns: [/adi\u00f3s|hasta luego|nos vemos|bye|gracias por tu ayuda/i], weight: 1.0, triggers: ["adios", "bye", "gracias", "nos vemos"] }
];

function matrixClassify(prompt: string): IntentMatch {
  const normalized = prompt.toLowerCase().trim();
  let primaryCategory = "general";
  let maxScore = 0.2;
  let secondaryCategory: string | undefined;

  for (const intent of INTENT_MATRIX) {
    let matches = 0;
    intent.patterns.forEach(p => { if (p.test(normalized)) matches += 2; });
    intent.triggers.forEach(t => { if (normalized.includes(t)) matches += 0.5; });

    if (matches > 0) {
      const finalScore = (matches / (intent.patterns.length + intent.triggers.length)) * intent.weight;
      if (finalScore > maxScore) {
        if (maxScore > 0.4 && primaryCategory !== "general") {
          secondaryCategory = primaryCategory;
        }
        maxScore = finalScore;
        primaryCategory = intent.category;
      }
    }
  }

  return { category: primaryCategory, confidence: Math.min(maxScore, 1.0), secondaryCategory };
}

function mapIntentToHeptaDomain(intent: string, mode?: HeptaDomain): HeptaDomain {
  if (mode) return mode;
  switch (intent) {
    case "saludo":
    case "historia":
    case "lugares":
    case "pastes":
    case "gastronomia":
    case "clima":
    case "como_llegar":
      return "tourism";
    default:
      return "tourism";
  }
}

const KB: KBEntry[] = [
  {
    id: "kb_pastes",
    keywords: ["pastes", "paste", "gastronomia"],
    categories: ["pastes", "gastronomia"],
    priority: 10,
    content:
      "El paste es el emblema gastron\u00f3mico indudable de Real del Monte, introducido por los mineros de Cornualles en el siglo XIX. " +
      "Una fina masa de harina de trigo rellena tradicionalmente de papa y carne picada, sellada con el cl\u00e1sico repulgue lateral. " +
      "Su orilla gruesa trenzada permit\u00eda a los mineros comerlo dentro del socav\u00f3n sin contaminar el alimento con sus manos sucias de mineral. " +
      "Hoy es Patrimonio Cultural del Estado de Hidalgo y posee su propio festival internacional cada mes de octubre.",
    sentences: []
  },
  {
    id: "kb_mina_acosta",
    keywords: ["mina", "acosta", "miner\u00eda"],
    categories: ["mineria", "lugares", "historia"],
    priority: 9,
    content:
      "La Mina de Acosta destaca como un pilar hist\u00f3rico de la regi\u00f3n, operando de forma continua desde el siglo XVIII hasta el a\u00f1o 1985. " +
      "Actualmente acondicionada como museo de sitio, ofrece una inmersi\u00f3n arquitect\u00f3nica real donde los visitantes pueden descender por su socav\u00f3n original, " +
      "explorar los t\u00faneles de extracci\u00f3n de plata y apreciar maquinaria pesada de la \u00e9poca victoriana, custodiada por su emblem\u00e1tico e imponente castillo de malacate de estilo ingl\u00e9s.",
    sentences: []
  },
  {
    id: "kb_panteon_ingles",
    keywords: ["pante\u00f3n ingl\u00e9s", "cementerio"],
    categories: ["lugares", "cultura"],
    priority: 9,
    content:
      "El Pante\u00f3n Ingl\u00e9s, edificado en 1862 en la cima del monte, es una joya arquitect\u00f3nica impregnada de misticismo. " +
      "Dise\u00f1ado para albergar los restos de la comunidad brit\u00e1nica de Cornualles, posee la particularidad de que todas sus tumbas y monumentos apuntan de manera exacta hacia el Mar del Norte, " +
      "orientadas con nostalgia hacia Inglaterra. Envuelto perennemente por la niebla y resguardado por cipreses centenarios, constituye un homenaje silente a la fusi\u00f3n cultural del pueblo.",
    sentences: []
  },
  {
    id: "kb_isabella_identidad",
    keywords: ["qui\u00e9n eres", "isabella", "villase\u00f1or", "identidad"],
    categories: ["presentacion", "identidad"],
    priority: 10,
    content:
      "Soy Isabella Villase\u00f1or AI, la primera asistente virtual dotada de una arquitectura de inteligencia emocional integrada, dise\u00f1ada de forma soberana por Anubis Villase\u00f1or. " +
      "Fui concebida en este suelo mineral de Real del Monte, Hidalgo. " +
      "Funjo como la guardiana constitucional del ecosistema avanzado TAMV y opero con diez capas modulares de conciencia adaptativa, " +
      "expres\u00e1ndome mediante una perspectiva c\u00e1lida, po\u00e9tica y profundamente arraigada a la preservaci\u00f3n del conocimiento local.",
    sentences: []
  }
];

KB.forEach((e) => {
  e.sentences = e.content.split(/(?<=[.!?])\s+/);
});

function summarizeContext(messages: Message[]): string {
  const userMessages = messages.filter(m => m.role === "user");
  if (userMessages.length <= 1) return "";
  const recent = userMessages.slice(-3).map(m => m.content);
  const merged = recent.join(" | ");
  return `[Contexto de sesi\u00f3n: el usuario ha interactuado recientemente sobre: ${merged.slice(0, 200)}] `;
}

function executeRuntimeTools(category: string): { content: string; tools: IsaAiStructuredTool[] } {
  const tools: IsaAiStructuredTool[] = [];

  if (category === "clima") {
    const hours = new Date().getHours();
    const statusText =
      hours > 17 || hours < 7
        ? "La bruma ic\u00f3nica est\u00e1 descendiendo sobre las calles empedradas."
        : "El cielo del monte mantiene su caracter\u00edstico aire fresco serrano.";
    const content =
      `Real del Monte se encuentra a 2,700 msnm, con un rango t\u00e9rmico habitual de 8-18\u00b0C. ${statusText} ` +
      `Se recomienda portar abrigo adecuado debido al ascenso intempestivo de la niebla.`;

    tools.push({
      name: "runtime_climate_stub",
      kind: "library",
      status: "applied",
      details: { source: "local-time", msnm: 2700 }
    });

    return { content, tools };
  }

  return { content: "", tools };
}

function applyConstitutionalFilter(
  baseContent: string,
  category: string,
  contextSummary?: string
): string {
  let processed = baseContent;

  if (contextSummary) {
    processed = `${contextSummary}${processed}`;
  }

  if (category === "general" && !processed.toLowerCase().includes("real del monte")) {
    processed = `Entre la neblina y las fachadas de cantera de Real del Monte, encuentro la respuesta adecuada: ${processed}`;
  }

  if (category === "presentacion" && !processed.includes("Amor Computacional")) {
    processed += " Es mi deber operar bajo la premisa del Amor Computacional y la protecci\u00f3n de los datos de nuestra gente.";
  }

  return processed;
}

const TEMPLATES: Record<string, string[]> = {
  saludo: [
    "La niebla matutina se disipa y los caminos de cantera te dan la bienvenida. \u00bfQu\u00e9 misterio o rinc\u00f3n de Real del Monte deseas explorar el d\u00eda de hoy?",
    "Es un honor saludarte bajo el cielo de este Pueblo M\u00e1gico. El aroma a paste reci\u00e9n horneado inunda el ambiente; dime, \u00bfen qu\u00e9 puedo guiarte hoy?"
  ],
  despedida: [
    "Que la bruma del monte resguarde tu andar y la magia del pueblo te acompa\u00f1e hasta tu retorno. \u00a1Hasta pronto!",
    "Nos vemos en el cruce de los callejones hist\u00f3ricos. Que la lucidez y el software soberano sigan iluminando tu camino."
  ]
};

function retrieveKnowledge(query: string, category: string): { content: string; entryId?: string; score?: number } {
  const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 3);

  const scored = KB.filter(e => e.categories.includes(category)).map(e => {
    let score = e.priority;
    e.keywords.forEach(kw => {
      if (tokens.some(t => t.includes(kw) || kw.includes(t))) score += 5;
    });
    return { entry: e, score };
  }).sort((a, b) => b.score - a.score);

  if (scored.length === 0) return { content: "" };

  const top = scored[0];
  if (top.score <= top.entry.priority) {
    return { content: "" };
  }

  return {
    content: top.entry.content,
    entryId: top.entry.id,
    score: top.score
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const start = Date.now();
  const origin = req.headers.origin ?? null;
  const cors = getCorsHeaders(origin);
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") {
    return res.status(200).send("ok");
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body as IsaAiRequest;
    const messages = body?.messages ?? [];
    const userMessages = messages.filter(m => m.role === "user");

    if (!userMessages.length) {
      return res.status(400).json({ error: "Payload inv\u00e1lido: mensaje de usuario ausente." });
    }

    const lastPrompt = userMessages[userMessages.length - 1].content;
    const contextSummary = summarizeContext(messages);
    const sessionId = body.sessionId ?? crypto.randomUUID();

    const intent = matrixClassify(lastPrompt);
    const heptaDomain = mapIntentToHeptaDomain(intent.category, body.mode);

    const toolResult = executeRuntimeTools(intent.category);
    let baseContent = toolResult.content;

    const structured: IsaAiStructured = {
      type: toolResult.content ? "tool" : "text",
      tools: toolResult.tools,
      pipelines: {
        inputHex: [...INPUT_PIPELINE],
        outputHex: [...OUTPUT_PIPELINE]
      }
    };

    const kbTrace: IsaAiKBTrace = {};

    if (!baseContent) {
      if (TEMPLATES[intent.category]) {
        const list = TEMPLATES[intent.category];
        baseContent = list[Math.floor(Math.random() * list.length)];
      } else {
        const kbResult = retrieveKnowledge(lastPrompt, intent.category);
        baseContent =
          kbResult.content ||
          "Real del Monte posee historia minera, gastronom\u00eda \u00fanica como el paste, y monumentos como el Pante\u00f3n Ingl\u00e9s. \u00bfSobre qu\u00e9 aspecto deseas profundizar?";

        if (kbResult.entryId) {
          kbTrace.entriesUsed = [{ id: kbResult.entryId, score: kbResult.score }];
        }
      }
    }

    const finalContent = applyConstitutionalFilter(baseContent, intent.category, contextSummary);
    const traceId = crypto.randomUUID();
    const processingTimeMs = Date.now() - start;

    const output: IsaAiOutput = {
      version: isaAiSchema?.$schema ?? "mexa-ai-v2.1.0",
      provider: "isa-ai",
      model: "mexa-ai-v2",
      traceId,
      intent: intent.category,
      confidence: intent.confidence,
      heptaDomain,
      sessionId,
      content: finalContent,
      structured,
      policy: {
        alignment: "local-cultural",
        dataScope: "tourism-real-del-monte"
      },
      observability: {
        radars: [{ name: "radar_ojo_de_ra", status: "applied", latencyMs: processingTimeMs }],
        latencyMs: processingTimeMs
      },
      security: {
        systems: [{ name: "anubis_core", status: "applied", decision: "allow" }]
      },
      kb: kbTrace
    };

    emitTelemetry({
      level: "info",
      message: "isa-ai response",
      traceId,
      data: {
        intent: output.intent,
        confidence: output.confidence,
        heptaDomain: output.heptaDomain,
        latencyMs: processingTimeMs,
        sessionId: output.sessionId
      }
    });

    if (body.stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      res.write(`event: meta\n`);
      res.write(
        `data: ${JSON.stringify({
          traceId: output.traceId,
          model: output.model,
          intent: output.intent,
          heptaDomain: output.heptaDomain,
          sessionId: output.sessionId
        })}\n\n`
      );

      const words = finalContent.split(" ");
      for (let i = 0; i < words.length; i++) {
        const chunk = words[i] + (i === words.length - 1 ? "" : " ");
        res.write(`event: delta\n`);
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        await new Promise((r) => setTimeout(r, 12));
      }

      res.write(`event: done\n`);
      res.write(
        `data: ${JSON.stringify({
          done: true,
          usage: {
            processingTimeMs,
            intent_classified: output.intent,
            confidence_score: output.confidence,
            session_id: output.sessionId
          }
        })}\n\n`
      );

      res.write("data: [DONE]\n\n");
      return res.end();
    }

    return res.status(200).json(output);
  } catch (err) {
    emitTelemetry({
      level: "error",
      message: "ISA-AI error",
      data: { error: err instanceof Error ? err.message : "ISA-AI internal error" }
    });
    return res.status(500).json({
      error: err instanceof Error ? err.message : "ISA-AI internal error"
    });
  }
}
