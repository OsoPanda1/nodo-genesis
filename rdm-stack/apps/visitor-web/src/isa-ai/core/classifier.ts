import type { IntentCategory, IntentMatch } from "../types";

const INTENT_PATTERNS: Array<{ category: IntentCategory; patterns: RegExp[]; weight: number }> = [
  {
    category: "saludo",
    patterns: [/hola|buenos días|buenas tardes|qué tal|hey isabella|saludos/i],
    weight: 1.0,
  },
  {
    category: "presentacion",
    patterns: [/quién eres|quién te creó|quién es tu padre|tu nombre|preséntate/i],
    weight: 1.0,
  },
  {
    category: "identidad",
    patterns: [/qué eres|cómo funcionas|qué puedes hacer|cómo sabes todo|tus capacidades/i],
    weight: 0.9,
  },
  {
    category: "historia",
    patterns: [/historia|origen|fundación|siglo xvi|minería|minero|pueblo mágico|cornish|ingleses/i],
    weight: 0.9,
  },
  {
    category: "mineria",
    patterns: [/mina|mina de acosta|plata|extracción|socavón|vetas|baritina|relaves|gambusino/i],
    weight: 0.9,
  },
  {
    category: "lugares",
    patterns: [/visitar|lugares|qué hacer|atracciones|turismo|panteón inglés|dónde ir|recorrer/i],
    weight: 0.9,
  },
  {
    category: "gastronomia",
    patterns: [/comer|gastronomía|platillo|restaurante|dónde comer|comida típica|enchiladas/i],
    weight: 0.9,
  },
  {
    category: "pastes",
    patterns: [/paste|pastes|paste tradicional|relleno|paste de /i],
    weight: 1.0,
  },
  {
    category: "fabricacion_pastes",
    patterns: [/cómo se hace|receta|preparación|amasar|relleno del paste|masa del paste/i],
    weight: 0.95,
  },
  {
    category: "cultura",
    patterns: [/cultura|tradición|costumbres|folclor|leyenda|mito|festividad|fiesta patronal/i],
    weight: 0.9,
  },
  {
    category: "arquitectura",
    patterns: [/arquitectura|cantera|casona|edificio histórico|construcción|calles empedradas/i],
    weight: 0.9,
  },
  {
    category: "eventos",
    patterns: [/eventos|feria|festival|qué hay|agenda|cultural|concierto|exposición/i],
    weight: 0.9,
  },
  {
    category: "clima",
    patterns: [/clima|temperatura|frío|niebla|lluvia|qué temperatura|clima hoy/i],
    weight: 0.8,
  },
  {
    category: "como_llegar",
    patterns: [/cómo llegar|ubicación|dónde está|cómo ir|transporte|llegar a real del monte|distancia/i],
    weight: 0.9,
  },
  {
    category: "economia",
    patterns: [/economía|negocio|comercio|emprender|precio|costo|cuánto cuesta|inversión/i],
    weight: 0.8,
  },
  {
    category: "despedida",
    patterns: [/adiós|hasta luego|nos vemos|bye|gracias por tu ayuda|nos vemos luego|chao/i],
    weight: 1.0,
  },
];

export function classifyIntent(text: string): IntentMatch {
  const matches: Array<{ category: IntentCategory; score: number; keywords: string[] }> = [];

  for (const intent of INTENT_PATTERNS) {
    let matchCount = 0;
    const matchedKeywords: string[] = [];
    for (const pattern of intent.patterns) {
      const match = text.match(pattern);
      if (match) {
        matchCount++;
        matchedKeywords.push(match[0]);
      }
    }
    if (matchCount > 0) {
      const score = (matchCount / intent.patterns.length) * intent.weight;
      matches.push({ category: intent.category, score, keywords: matchedKeywords });
    }
  }

  if (matches.length === 0) {
    return { category: "general", confidence: 0.3, keywords: [] };
  }

  matches.sort((a, b) => b.score - a.score);
  return {
    category: matches[0].category,
    confidence: matches[0].score,
    keywords: matches[0].keywords,
  };
}
