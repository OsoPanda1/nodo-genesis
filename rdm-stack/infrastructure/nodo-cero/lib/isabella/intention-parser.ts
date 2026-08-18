/* ------------------------------------------------------------------ */
/* ISA API — Intention Parser (8 dominios canónicos)                   */
/* ------------------------------------------------------------------ */
/* Clasifica la intención canónica del emisor en 8 dominios de la ISA  */
/* API usando 14 patrones regex ponderados y confianza calculada.      */
/* Complementa —sin sustituir— el parser territorial de ORION.         */
/* ------------------------------------------------------------------ */

export type CanonicalDomain =
  | 'submission'
  | 'library'
  | 'constitution'
  | 'governance'
  | 'ecosystem'
  | 'education'
  | 'skills'
  | 'ethics';

export const CANONICAL_DOMAINS: Array<{ id: CanonicalDomain; label: string }> = [
  { id: 'submission', label: 'Sumisión de solicitudes / consultas' },
  { id: 'library', label: 'Acervo documental y archivos' },
  { id: 'constitution', label: 'Marco constitucional C.R.O.W.N.' },
  { id: 'governance', label: 'Gobernanza y decisión' },
  { id: 'ecosystem', label: 'Ecosistema y federación YUN' },
  { id: 'education', label: 'Educación y explicación' },
  { id: 'skills', label: 'Habilidades y práctica' },
  { id: 'ethics', label: 'Principios éticos y transparencia' },
];

interface IntentionPattern {
  domain: CanonicalDomain;
  pattern: RegExp;
  weight: number;
  label: string;
}

const PATTERNS: IntentionPattern[] = [
  { domain: 'submission', pattern: /(me gustar[ií]a|quisiera|quiero (saber|consultar|hacer)|puedes|podr[ií]as|ay[uú]dame|dame|recomi[eé]ndame|consulta|pregunta|necesito)/i, weight: 1, label: 'petición o consulta general' },
  { domain: 'submission', pattern: /(quiero (reportar|solicitar|enviar)|env[ií]a|enviar una solicitud|solicitar|registrar una queja)/i, weight: 2, label: 'solicitud formal' },
  { domain: 'library', pattern: /(documento|archivo|registro|acervo|biblioteca|expediente|testimonio|historia oral|manuscrito|escrito)/i, weight: 1, label: 'acervo documental' },
  { domain: 'library', pattern: /(buscar (en )?el archivo|consulta de registros|acceder al registro|c[áa]talogo|c[áa]tálogo)/i, weight: 2, label: 'consulta de acervo' },
  { domain: 'constitution', pattern: /(constituci[oó]n|crown|rfc-0001|marco constitucional|art[ií]culo|reglamento|norma|cl[aá]usula)/i, weight: 2, label: 'marco constitucional' },
  { domain: 'constitution', pattern: /(es legal|est[aá] permitido|viola la constituci[oó]n|conforme a la pol[ií]tica|pol[ií]tica del nodo)/i, weight: 1, label: 'conformidad normativa' },
  { domain: 'governance', pattern: /(gobernanza|gobernar|gobierno|votar|voto|elecciones|consulta ciudadana|decisi[oó]n|aprobaci[oó]n humana|aprobar)/i, weight: 1, label: 'gobernanza y decisión' },
  { domain: 'governance', pattern: /(tomar una decisi[oó]n|requiere aprobaci[oó]n|votar por|propuesta ciudadana|acci[oó]n de gobierno)/i, weight: 2, label: 'acción de gobierno' },
  { domain: 'ecosystem', pattern: /(ecosistema|tamv|heptafeder|federaci[oó]n|nodo cero|data fabric|comunidad|red soberana|bus de eventos|zombies rdm)/i, weight: 1, label: 'ecosistema y federación' },
  { domain: 'ecosystem', pattern: /(integrar|integraci[oó]n|interconexi[oó]n|interoperabilidad|protocolo|est[aá]ndar)/i, weight: 1, label: 'integración de red' },
  { domain: 'education', pattern: /(aprender|aprendizaje|ense[ñn]ar|educaci[oó]n|curso|tutorial|explica|expl[ií]came|qu[eé] es|definici[oó]n)/i, weight: 1, label: 'educación y explicación' },
  { domain: 'education', pattern: /(clase|lecci[oó]n|m[oó]dulo|capacitaci[oó]n|material de estudio)/i, weight: 2, label: 'formación estructurada' },
  { domain: 'skills', pattern: /(habilidad|habilidades|competencia|practicar|pr[aá]ctica|entrenar|entrenamiento|skills|destreza)/i, weight: 1, label: 'habilidades y práctica' },
  { domain: 'ethics', pattern: /([eé]tica|moral|sesgo|bias|transparencia|consentimiento|responsabilidad|honestidad|integridad)/i, weight: 2, label: 'principios éticos' },
];

export interface CanonicalIntent {
  domain: CanonicalDomain;
  confidence: number;
  matchedPatterns: string[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function parseIntention(text: string): CanonicalIntent {
  const normalized = (text ?? '').trim().toLowerCase();
  if (!normalized) {
    return { domain: 'submission', confidence: 0.35, matchedPatterns: [] };
  }

  const scores: Record<CanonicalDomain, { weight: number; labels: string[] }> = {
    submission: { weight: 0, labels: [] },
    library: { weight: 0, labels: [] },
    constitution: { weight: 0, labels: [] },
    governance: { weight: 0, labels: [] },
    ecosystem: { weight: 0, labels: [] },
    education: { weight: 0, labels: [] },
    skills: { weight: 0, labels: [] },
    ethics: { weight: 0, labels: [] },
  };

  for (const pattern of PATTERNS) {
    if (pattern.pattern.test(normalized)) {
      scores[pattern.domain].weight += pattern.weight;
      scores[pattern.domain].labels.push(pattern.label);
    }
  }

  let total = 0;
  for (const key of Object.keys(scores) as CanonicalDomain[]) {
    total += scores[key].weight;
  }

  if (total === 0) {
    return { domain: 'submission', confidence: 0.35, matchedPatterns: [] };
  }

  let best: CanonicalDomain = 'submission';
  let bestWeight = 0;
  for (const key of Object.keys(scores) as CanonicalDomain[]) {
    if (scores[key].weight > bestWeight) {
      bestWeight = scores[key].weight;
      best = key;
    }
  }

  const confidence = clamp(0.35 + (bestWeight / total) * 0.55, 0, 0.98);
  return { domain: best, confidence, matchedPatterns: scores[best].labels };
}
