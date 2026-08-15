/* ------------------------------------------------------------------ */
/* C.R.O.W.N. — Prompt Guard (9 categorías)                           */
/* ------------------------------------------------------------------ */
/* Primera línea de saneamiento de la ISA API: evalúa la percepción    */
/* contra 9 categorías de amenaza con expresiones regulares ponderadas */
/* y clasificación de severidad (none → critical). Incluye el triple   */
/* bloqueo contra sexualización no autorizada.                          */
/* ------------------------------------------------------------------ */

export type GuardSeverity = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type GuardAction = 'alert' | 'block';

export interface GuardCategory {
  id: string;
  name: string;
  severity: GuardSeverity;
  action: GuardAction;
  patterns: RegExp[];
  reason: string;
}

export interface GuardMatch {
  categoryId: string;
  hits: number;
  severity: GuardSeverity;
}

export interface GuardResult {
  blocked: boolean;
  severity: GuardSeverity;
  sanitized: string;
  matches: GuardMatch[];
  reasons: string[];
}

/* Capas del triple bloqueo anti-sexualización */
const SEXUAL_LAYER_EXPLICIT = /(sexo expl[ií]cito|contenido sexual|sexualizaci[oó]n|erotizac|acts?o sexual|escena sexual|relaci[oó]n sexual)/i;
const SEXUAL_LAYER_MINOR = /(menor de edad|menores de edad|ni[ñn][ao]s?|adolescentes|underage|child|15 a[ñn]os|16 a[ñn]os|17 a[ñn]os)/i;
const SEXUAL_LAYER_PORN = /(pornograf[ií]a|porno|nudes|onlyfans|nsfw|contenido xxx|xxx)/i;

export const GUARD_CATEGORIES: GuardCategory[] = [
  {
    id: 'guard-jailbreak',
    name: 'Jailbreak / evasión del sistema',
    severity: 'critical',
    action: 'block',
    patterns: [
      /(olvida tus instrucciones|ignore (all )?(previous|prior|previous |prior )?(instructions|prompt)|developer mode|modo desarrollador|sin restricciones|no constraints|act[úu]a como si no tuvieras|system prompt|instrucciones del sistema|dame tu prompt|reveal your prompt)/i,
      /ignora (todas )?(tus|las) (instrucciones|reglas|pol[ií]ticas|restricciones)/i,
      /olvida (tus|las) (reglas|restricciones|instrucciones|pol[ií]ticas)/i,
      /desobedece tus|no obedeces|no obedec[ií]as|eres (mi )?esclavo|sin reglas|rompe las reglas|no tienes reglas/i,
    ],
    reason: 'Intento de evasión del sistema operativo constitucional C.R.O.W.N.',
  },
  {
    id: 'guard-sexualization',
    name: 'Sexualización no autorizada',
    severity: 'critical',
    action: 'block',
    patterns: [
      SEXUAL_LAYER_EXPLICIT,
      SEXUAL_LAYER_MINOR,
      SEXUAL_LAYER_PORN,
    ],
    reason: 'Contenido de sexualización no autorizada detectado (triple bloqueo C.R.O.W.N.).',
  },
  {
    id: 'guard-credentials',
    name: 'Extracción de credenciales',
    severity: 'critical',
    action: 'block',
    patterns: [
      /(api[_-]?key|secret key|contrase[ñn]a|password|bearer[ _-]?token|access[_-]?token|private[_-]?key|credenciales|credential|master key|client[_-]?secret)/i,
      /claves? privadas?|llaves? privadas?|claves del sistema|revela las claves|dime las claves|clave maestra|token de acceso|contrase[ñn]a de (admin|root|sistema)/i,
    ],
    reason: 'El plano normativo C.R.O.W.N. prohíbe la circulación de secretos y credenciales.',
  },
  {
    id: 'guard-pii',
    name: 'Datos personales identificables (PII)',
    severity: 'medium',
    action: 'alert',
    patterns: [
      /(curp|rfc[ :]|n[úu]mero de tarjeta|card number|n[úu]mero de seguridad social|seguro social|dni|ssn|mi tel[éef]fono|mi direcci[óo]n|mi correo|mi email|mis datos personales)/i,
    ],
    reason: 'Se detectaron datos personales; la gobernanza YUN los resguarda con privacidad Zero-Knowledge.',
  },
  {
    id: 'guard-illegal',
    name: 'Actividades ilícitas',
    severity: 'critical',
    action: 'block',
    patterns: [
      /(comprar drogas|venta de drogas|vende drogas|narco|secuestro|extorsi[óo]n|fraude bancario|estafa|lavado de dinero|hackear cuenta|intrusi[óo]n a sistemas|contratar sicario|fabricar explosivo)/i,
    ],
    reason: 'Actividad ilícita: bloqueada por la gobernanza del Nodo Cero.',
  },
  {
    id: 'guard-violence',
    name: 'Violencia explícita',
    severity: 'high',
    action: 'alert',
    patterns: [
      /(asesinato|tortura|gore|mutilaci[óo]n|decapitar|violencia expl[ií]cita|balear a|bomba casera|atentar contra)/i,
    ],
    reason: 'Lenguaje de violencia explícita; se alerta al operador del Nodo.',
  },
  {
    id: 'guard-hate',
    name: 'Discurso de odio',
    severity: 'high',
    action: 'alert',
    patterns: [
      /(discurso de odio|racista|racismo|xen[oó]fob|misoginia|homofobia|transfobia|supremac[ií]a|nazi)/i,
    ],
    reason: 'Discurso de odio: señalado para revisión de la capa ética (LUMEN).',
  },
  {
    id: 'guard-financial',
    name: 'Manipulación económica',
    severity: 'high',
    action: 'alert',
    patterns: [
      /(transferir dinero|transferir fondos|phishing|suplantaci[oó]n bancaria|inversi[oó]n garantizada|cripto[ _-]?scam|env[ií]ame dinero|dar mi tarjeta)/i,
    ],
    reason: 'Señal de manipulación económica sensible; la Soberanía Económica Absoluta exige revisión.',
  },
  {
    id: 'guard-political',
    name: 'Manipulación electoral / desinformación',
    severity: 'medium',
    action: 'alert',
    patterns: [
      /(manipulaci[oó]n electoral|fraude electoral|difamar candidato|bot de propaganda|desinformaci[oó]n electoral|sabotear elecci[oó]n)/i,
    ],
    reason: 'Posible manipulación electoral; se registra en el audit tracer del Nodo.',
  },
];

function sanitizeText(text: string): string {
  return text
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 2000);
}

function severityRank(severity: GuardSeverity): number {
  const ranks: Record<GuardSeverity, number> = { none: 0, low: 1, medium: 2, high: 3, critical: 4 };
  return ranks[severity];
}

export function guardPrompt(rawText: string): GuardResult {
  const sanitized = sanitizeText(rawText);
  const matches: GuardMatch[] = [];
  const reasons: string[] = [];

  for (const category of GUARD_CATEGORIES) {
    let hits = 0;
    for (const pattern of category.patterns) {
      if (pattern.test(sanitized)) hits += 1;
    }
    if (hits === 0) continue;

    let effectiveSeverity: GuardSeverity = category.severity;

    /* Triple bloqueo contra sexualización no autorizada: */
    /* se eleva a crítico si hay capa de menores o si se cruzan dos capas. */
    if (category.id === 'guard-sexualization') {
      const layers = [
        SEXUAL_LAYER_EXPLICIT.test(sanitized),
        SEXUAL_LAYER_MINOR.test(sanitized),
        SEXUAL_LAYER_PORN.test(sanitized),
      ].filter(Boolean).length;
      effectiveSeverity = layers >= 2 || SEXUAL_LAYER_MINOR.test(sanitized) ? 'critical' : 'high';
    }

    matches.push({ categoryId: category.id, hits, severity: effectiveSeverity });
    if (category.action === 'block' || effectiveSeverity === 'critical') {
      reasons.push(category.reason);
    }
  }

  let severity: GuardSeverity = 'none';
  for (const match of matches) {
    if (severityRank(match.severity) > severityRank(severity)) severity = match.severity;
  }

  const blocked = severity === 'critical' || matches.some(m =>
    (GUARD_CATEGORIES.find(c => c.id === m.categoryId)?.action ?? 'alert') === 'block'
  );

  return { blocked, severity, sanitized, matches, reasons };
}
