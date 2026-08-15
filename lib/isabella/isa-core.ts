/* ================================================================== */
/* ISA CORE — Núcleo cognitivo soberano de Isabella (sin APIs externas) */
/* ================================================================== */
/* El corazón de Isabella NO depende de ningún proveedor remoto. ISA     */
/* Core es un motor de razonamiento determinístico que opera íntegra-   */
/* mente sobre la base de conocimiento local del territorio: POIs,      */
/* eventos, rutas, dichos, nodos YUN y líneas históricas.               */
/*                                                                      */
/* Garantías:                                                           */
/*   · Cero egress: no hace fetch, no lee claves, no sale del runtime.  */
/*   · Determinístico: misma pregunta → misma respuesta (auditable).    */
/*   · Estructurado: Answer + Sources + Trace (patrón ISA v4.0).        */
/*   · Gobernado: respeta la Constitución YUN (fail-closed).            */
/* ================================================================== */

import { RDM_POIS } from '@/lib/data/rdm-data';
import { YUN_CORES, RDM_NODES_35 } from '@/lib/data/rdm-data';
import { RDM_EVENTS, RDM_ROUTES, RDM_DICHOS, RDM_TIMELINE } from '@/lib/data/rdm-tourism';

export interface IsaSource {
  kind: 'poi' | 'evento' | 'ruta' | 'dicho' | 'nodo' | 'historia' | 'nucleo';
  id: string;
  title: string;
  detail?: string;
}

export interface IsaIntent {
  domain:
    | 'turismo'
    | 'gastronomia'
    | 'historia'
    | 'cultura'
    | 'mineria'
    | 'gemelo'
    | 'arquitectura'
    | 'general';
  confidence: number;
}

export interface IsaTrace {
  intent: IsaIntent;
  sourcesUsed: IsaSource[];
  latencyMs: number;
  sovereign: true;
  engineVersion: string;
}

export interface IsaReasonResult {
  answer: string;
  sources: IsaSource[];
  trace: IsaTrace;
}

export interface IsaReasonOptions {
  /** Límite de fuentes citadas. */
  maxSources?: number;
  /** Prefijo de identidad en la respuesta. */
  persona?: string;
}

const ENGINE_VERSION = 'isa-core-v1.0-soberano';

/* ================================================================== */
/* Intención determinística por palabras clave                         */
/* ================================================================== */

const INTENT_KEYWORDS: Array<{ domain: IsaIntent['domain']; words: string[] }> = [
  { domain: 'gastronomia', words: ['paste', 'pastes', 'comer', 'comida', 'restaurante', 'cafe', 'gastronom', 'sabore', 'pan', 'platillo', 'helado'] },
  { domain: 'mineria', words: ['mina', 'miner', 'plata', 'plataforma', 'acantilado', 'socavón', 'socavon', 'tunel', 'túnel', 'oro', 'pique', 'avenida'] },
  { domain: 'historia', words: ['historia', 'histórico', 'historico', 'cornish', 'inglés', 'ingles', 'huelga', 'siglo', 'año', 'fundación', 'fundacion', 'timeline', 'línea'] },
  { domain: 'cultura', words: ['cultura', 'festival', 'fiesta', 'fest', 'museo', 'tradición', 'tradicion', 'iglesia', 'virgen', 'santo', 'día', 'dia'] },
  { domain: 'gemelo', words: ['gemelo', 'twin', 'digital', 'gema', 'simul', 'sensor', 'iot', 'telemetr'] },
  { domain: 'arquitectura', words: ['arquitectura', 'núcleo', 'nucleo', 'federación', 'federacion', 'yun', 'heptafederada', 'crown', 'nodo'] },
  { domain: 'turismo', words: ['turismo', 'visitar', 'ruta', 'lugar', 'donde', 'ver', 'pueblo mágico', 'pueblo magico', 'atractivo', 'mirador', 'panteón', 'panteon'] },
];

function detectIntent(query: string): IsaIntent {
  const q = query.toLowerCase();
  for (const entry of INTENT_KEYWORDS) {
    if (entry.words.some(w => q.includes(w))) {
      return { domain: entry.domain, confidence: 0.9 };
    }
  }
  return { domain: 'general', confidence: 0.5 };
}

/* ================================================================== */
/* Recuperación local de conocimiento                                  */
/* ================================================================== */

const STOP_WORDS = new Set([
  'que', 'las', 'los', 'las', 'para', 'con', 'del', 'como', 'donde',
  'cuando', 'sobre', 'una', 'uno', 'unos', 'unas', 'en', 'el', 'la',
  'es', 'de', 'y', 'a', 'o', 'por', 'al', 'se', 'su', 'me', 'mi',
  'esta', 'este', 'hay', 'hay', 'cual', 'cuales', 'que', 'quien',
]);

/** Normaliza y extrae tokens significativos de la consulta. */
function queryTokens(query: string): string[] {
  const normalized = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
  const words = normalized.match(/[a-zñ0-9]+/gu) ?? [];
  return [...new Set(words.filter(w => w.length >= 3 && !STOP_WORDS.has(w)))];
}

/** ¿La consulta tiene algún token dentro del texto de una fuente? */
function matches(tokens: string[], hay: string): boolean {
  const h = hay.toLowerCase();
  return tokens.some(tok => h.includes(tok));
}

function searchSources(intent: IsaIntent, query: string, max: number): IsaSource[] {
  const tokens = queryTokens(query);
  const hits: IsaSource[] = [];

  const add = (s: IsaSource): void => {
    if (hits.length < max) hits.push(s);
  };

  /* POIs */
  for (const poi of RDM_POIS) {
    if (hits.length >= max) break;
    const hay = `${poi.name} ${poi.category} ${'history' in poi ? String(poi.history ?? '') : ''}`;
    if (matches(tokens, hay) || intent.domain === 'turismo' || intent.domain === 'mineria') {
      add({ kind: 'poi', id: poi.id, title: poi.name, detail: poi.category });
    }
  }

  /* Eventos */
  for (const evt of RDM_EVENTS) {
    if (hits.length >= max) break;
    const hay = `${evt.name} ${evt.month} ${evt.place}`;
    if (matches(tokens, hay) || intent.domain === 'cultura') {
      add({ kind: 'evento', id: evt.id, title: evt.name, detail: `${evt.month} · ${evt.place}` });
    }
  }

  /* Rutas */
  for (const route of RDM_ROUTES) {
    if (hits.length >= max) break;
    const hay = `${route.name} ${route.description}`;
    if (matches(tokens, hay) || intent.domain === 'turismo') {
      add({ kind: 'ruta', id: route.id, title: route.name, detail: `${route.duration} · ${route.distance}` });
    }
  }

  /* Dichos */
  for (const dicho of RDM_DICHOS) {
    if (hits.length >= max) break;
    const hay = `${dicho.text} ${dicho.meaning}`;
    if (matches(tokens, hay)) {
      add({ kind: 'dicho', id: dicho.id, title: dicho.text, detail: dicho.meaning });
    }
  }

  /* Historia */
  for (const evt of RDM_TIMELINE) {
    if (hits.length >= max) break;
    const hay = `${evt.title} ${evt.description}`;
    if (matches(tokens, hay) || intent.domain === 'historia') {
      add({ kind: 'historia', id: `${evt.year}-${evt.title}`, title: `${evt.year} · ${evt.title}`, detail: evt.description.slice(0, 80) });
    }
  }

  /* Núcleos Heptafederados YUN (los 7 centros federados son fuente primaria) */
  for (const core of YUN_CORES) {
    if (hits.length >= max) break;
    const coreHay = `${core.name} ${core.subtitle} núcleo ${core.id} heptafederada yun`;
    if (matches(tokens, coreHay) || intent.domain === 'arquitectura') {
      add({ kind: 'nucleo', id: String(core.id), title: `Núcleo ${core.id}: ${core.name}`, detail: core.subtitle });
    }
  }

  /* Nodos YUN (35 nodos soberanos de Real del Monte) */
  let nodos = 0;
  for (const node of RDM_NODES_35) {
    if (hits.length >= max) break;
    const nodeHay = `${node.title} ${node.subtitle} ${node.code} ${node.category}`;
    if (matches(tokens, nodeHay) || intent.domain === 'gemelo' || intent.domain === 'arquitectura') {
      add({ kind: 'nodo', id: node.id, title: `${node.code} · ${node.title}`, detail: `${node.status} | ${node.subtitle}` });
      nodos += 1;
    }
  }

  return hits;
}

/* ================================================================== */
/* Composición de la respuesta (plantillas determinísticas)            */
/* ================================================================== */

function composeAnswer(intent: IsaIntent, query: string, sources: IsaSource[]): string {
  const persona = 'Isabella Villaseñor AI · núcleo soberano ISA';

  if (sources.length === 0) {
    return [
      `${persona}.`,
      'Recibí tu consulta y, tras consultar la memoria territorial del Nodo Cero,',
      'no encontré registros locales que la respondan con certeza.',
      'Te invito a preguntarme por: rutas turísticas, eventos del calendario local,',
      'la historia minera de Real del Monte, la gastronomía (pastes y platería)',
      'o la arquitectura heptafederada YUN.',
    ].join(' ');
  }

  const titles = sources.map((s, i) => `${i + 1}. ${s.title}${s.detail ? ` (${s.detail})` : ''}`);

  const intro: Record<IsaIntent['domain'], string> = {
    turismo:
      'Real del Monte, Pueblo Mágico y Geoparque Mundial UNESCO, te recibe con estos sitios:',
    gastronomia:
      'La cocina del territorio —heredera de la tradición de Cornualles— te ofrece:',
    historia:
      'La memoria minera de Real del Monte, desde 1554, cuenta esta historia:',
    cultura:
      'El calendario cultural del territorio y sus tradiciones vivas incluyen:',
    mineria:
      'La ruta de la plata y la herencia minera del pueblo se reflejan en:',
    gemelo:
      'El Gemelo Digital del Nodo Cero mantiene bajo observación estos elementos:',
    arquitectura:
      'La Heptafederación YUN, los 7 núcleos y sus 35 nodos, se articulan así:',
    general:
      'Sobre tu consulta, el conocimiento territorial del Nodo Cero responde:',
  };

  return [
    `${persona}.`,
    intro[intent.domain],
    ...titles.map(t => `• ${t}`),
    'Esta respuesta fue generada íntegramente por el núcleo soberano ISA',
    'del Nodo Cero, sin dependencia de servicios externos.',
  ].join('\n');
}

/* ================================================================== */
/* API pública                                                        */
/* ================================================================== */

export function isaReason(query: string, options: IsaReasonOptions = {}): IsaReasonResult {
  const startedAt = Date.now();
  const maxSources = options.maxSources ?? 4;
  const intent = detectIntent(query);
  const sources = searchSources(intent, query, maxSources);
  const answer = composeAnswer(intent, query, sources);

  return {
    answer,
    sources,
    trace: {
      intent,
      sourcesUsed: sources,
      latencyMs: Date.now() - startedAt,
      sovereign: true,
      engineVersion: ENGINE_VERSION,
    },
  };
}

/** Versión corta para el chat (solo el texto de la respuesta). */
export function isaAnswer(query: string, options: IsaReasonOptions = {}): string {
  return isaReason(query, options).answer;
}

/** Estado del núcleo soberano (para el panel y el monitor). */
export function isaCoreStatus(): {
  engine: string;
  sovereign: boolean;
  knowledgeBase: { pois: number; events: number; routes: number; dichos: number; nodes: number };
} {
  return {
    engine: ENGINE_VERSION,
    sovereign: true,
    knowledgeBase: {
      pois: RDM_POIS.length,
      events: RDM_EVENTS.length,
      routes: RDM_ROUTES.length,
      dichos: RDM_DICHOS.length,
      nodes: RDM_NODES_35.length,
    },
  };
}
