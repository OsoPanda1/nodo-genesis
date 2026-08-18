/* ================================================================== */
/* RESEARCH PLANE YUN — Plano de investigación cuántica (PennyLane)   */
/* ================================================================== */
/* Aislamiento estricto del plano de investigación. PennyLane solo     */
/* recibe buckets agregados de métricas; NUNCA claves, payloads, PII   */
/* ni contenido semántico. No firma, no autoriza y no modifica el      */
/* Nodo Cero: su resultado es observación estadística local.           */
/*                                                                     */
/* El bucket es la única forma de entrada al plano y se valida en       */
/* contra de campos prohibidos (fail-closed por forma).                */
/* ================================================================== */

import { emitYunAudit } from './audit';

export const RESEARCH_PLANE = 'pennylane';
export const RESEARCH_PORT = 8090;
export const RESEARCH_BUCKET_DENIED = 'RESEARCH_BUCKET_DENIED';

/** Bucket agregado: única entrada permitida al plano de investigación. */
export interface ResearchBucket {
  metric: string;
  value: number;
  unit?: string;
  samples?: number;
  windowMs?: number;
}

/* Campos que jamás pueden entrar a un bucket (claves, payloads, PII). */
const FORBIDDEN_FIELDS = [
  'key',
  'secret',
  'token',
  'credential',
  'password',
  'payload',
  'content',
  'text',
  'prompt',
  'message',
  'pii',
  'privatekey',
  'apikey',
  'signature',
  'header',
  'authorization',
];

export interface ResearchBucketRecord {
  bucket: ResearchBucket;
  at: string;
}

const MAX_BUCKETS = 500;

let buckets: ResearchBucketRecord[] = [];

/** Valida que el bucket solo contenga métricas agregadas y anónimas. */
export function isResearchSafe(bucket: ResearchBucket): { ok: true } | { ok: false; forbidden: string[] } {
  if (!Number.isFinite(bucket.value)) {
    return { ok: false, forbidden: ['value'] };
  }
  const forbidden = Object.keys(bucket)
    .map(key => key.toLowerCase())
    .filter(key => FORBIDDEN_FIELDS.some(field => key.includes(field)));
  if (forbidden.length > 0) {
    return { ok: false, forbidden };
  }
  return { ok: true };
}

/** Ingiere un bucket agregado en el plano de investigación (aislado). */
export function ingestResearchBucket(
  bucket: ResearchBucket,
  options?: { traceId?: string },
):
  | { ok: true; bucket: ResearchBucket }
  | { ok: false; error: string; code: string } {
  const safe = isResearchSafe(bucket);
  if (!safe.ok) {
    const detail = `bucket_contains_forbidden_field:${safe.forbidden.join(',')}`;
    emitYunAudit(
      'yun.research.bucket.refused',
      { metric: bucket.metric, detail, allowed: false },
      { traceId: options?.traceId, severity: 'warning' },
    );
    return { ok: false, error: detail, code: RESEARCH_BUCKET_DENIED };
  }

  buckets.push({ bucket, at: new Date().toISOString() });
  if (buckets.length > MAX_BUCKETS) buckets = buckets.slice(-MAX_BUCKETS);

  emitYunAudit(
    'yun.research.bucket.ingested',
    { metric: bucket.metric, value: bucket.value, samples: bucket.samples },
    { traceId: options?.traceId },
  );
  return { ok: true, bucket };
}

export function researchPlaneStatus(): {
  provider: string;
  isolated: boolean;
  port: number;
  buckets: number;
} {
  return {
    provider: RESEARCH_PLANE,
    isolated: true,
    port: RESEARCH_PORT,
    buckets: buckets.length,
  };
}

/** Limpia el almacén del plano (uso en pruebas). */
export function resetResearchPlaneForTests(): void {
  buckets = [];
}
