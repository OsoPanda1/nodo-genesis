import { NextRequest, NextResponse } from 'next/server';
import { processPerception } from './processPerception';
import { IsabellaPerception, PerceptionType, RiskLevel } from './contracts';
import { ISABELLA_POLICIES, YUN_CONSTITUTION_VERSION, YUN_FEDERATIONS } from './constitution';
import { ISABELLA_TOOLS } from './tools';
import { auditTrace } from './audit-tracer';
import { GUARD_CATEGORIES } from './prompt-guard';
import { CANONICAL_DOMAINS } from './intention-parser';
import { MEXA_PQC_TARGET, MEXA_SCHEME, mexaGetOperatorKeyPair, mexaKeyIdFromPublic, mexaSign, mexaVerify } from './mexa-crypto';
import { PRA_ENGINE } from './pra';
import { crownGatewayGenerate } from './crown-gateway';
import { buildStructuredEnvelope, validateStructuredEnvelope, ISA_AI_DEFAULT_MODEL } from './structured-output';
import { IsaAiEnvelope } from '@/lib/core/contracts/isa-ai';
import { CanonicalDomain } from './intention-parser';
import { uuid } from './utils';
import { assertServerOnly, constantTimeCompare, rateLimit, verifyOrigin } from './trust';
import { enforceZeroTrustHeaders } from '@/lib/security/zero-trust';
import { monitor } from '@/lib/monitoring/monitor';

/* ------------------------------------------------------------------ */
/* HARDENING ZERO TRUST — aplicado a toda la superficie de entrada     */
/* ------------------------------------------------------------------ */
function enforceTrust(req: NextRequest, key: string, limit: number): NextResponse | null {
  const server = assertServerOnly('ISA API');
  if (!server.ok) {
    monitor.metrics.inc('trust.denied', { reason: 'client-side' });
    return NextResponse.json({ ok: false, error: server.error }, { status: 403 });
  }

  /* CAPA Nº 2: origin canónico (anti-CSRF). */
  const origin = verifyOrigin(req);
  if (!origin.ok) {
    monitor.metrics.inc('trust.denied', { reason: 'origin' });
    return NextResponse.json({ ok: false, error: origin.reason }, { status: 403 });
  }

  /* CAPA Nº 4: rate limit del Nodo. */
  const rl = rateLimit(req, key, limit);
  if (!rl.ok) {
    monitor.metrics.inc('trust.denied', { reason: 'rate-limit' });
    return NextResponse.json(
      { ok: false, error: 'Límite de peticiones del Nodo alcanzado. Reintenta en un momento.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  /* CADENA COMPLETA: 7 capas de Zero Trust (una por federación YUN). */
  const zt = enforceZeroTrustHeaders(req.headers, { route: key, limit });
  if (!zt.ok) {
    monitor.metrics.inc('trust.denied', { reason: zt.deniedBy ?? 'zero-trust' });
    monitor.events.emit('trust.denied', 'zero-trust', 'warning', {
      route: key,
      layer: zt.deniedBy,
      federation: zt.federation,
    });
    return NextResponse.json(
      { ok: false, error: `Zero Trust: ${zt.deniedBy} (federación ${zt.federation})` },
      { status: 403 },
    );
  }

  monitor.metrics.inc('api.requests', { route: key });
  return null;
}

function validRisk(value: unknown): RiskLevel {
  return value === 'high' || value === 'medium' || value === 'low' ? value : 'low';
}

function validType(value: unknown): PerceptionType {
  return value === 'chat' || value === 'event' || value === 'signal' || value === 'api' || value === 'ui'
    ? value
    : 'chat';
}

function strField(body: Record<string, unknown>, key: string): string | undefined {
  const value = body[key];
  return typeof value === 'string' ? value : undefined;
}

export function buildPerception(body: unknown): { perception: IsabellaPerception; error?: string } {
  if (typeof body !== 'object' || body === null) {
    return { perception: null as unknown as IsabellaPerception, error: 'Cuerpo de petición inválido' };
  }

  const record = body as Record<string, unknown>;
  const prompt = typeof record.prompt === 'string' ? record.prompt.trim() : '';

  if (!prompt && typeof record.payload !== 'object') {
    return { perception: null as unknown as IsabellaPerception, error: 'Campo prompt o payload requerido' };
  }

  const context = record.context as Record<string, unknown> | undefined;
  const sessionId = typeof record.sessionId === 'string' ? record.sessionId : '';

  const center = Array.isArray(context?.center) ? context.center as unknown[] : [];
  const latitude = typeof center[0] === 'number' ? center[0] : 20.1398;
  const longitude = typeof center[1] === 'number' ? center[1] : -98.6738;
  const altitude = typeof context?.altitude === 'number' ? context.altitude : 2710;

  return {
    perception: {
      id: uuid(),
      type: validType(record.type),
      actorId: 'ciudadano-yun',
      sessionId,
      payload: {
        text: prompt,
        intent: strField(record, 'intent'),
        riskLevel: validRisk(strField(record, 'riskLevel')),
        action: strField(record, 'action'),
        targetDomain: strField(record, 'targetDomain'),
      },
      timestamp: new Date().toISOString(),
      metadata: { source: 'rdm-hub/isa-api' },
      territory: {
        federationId: strField(context ?? {}, 'federationId') ?? 'Fed1',
        domain: strField(context ?? {}, 'domain') ?? 'knowledge',
        place: strField(context ?? {}, 'place') ?? 'Real del Monte, Hidalgo, México',
        latitude,
        longitude,
        altitude,
        geosite: strField(context ?? {}, 'geosite') ?? 'Geoparque Mundial UNESCO Comarca Minera',
        status: strField(context ?? {}, 'status') ?? 'Optimal',
      },
    },
  };
}

/* ------------------------------------------------------------------ */
/* POST /api/isabella  ·  POST /api/isabella/chat (pipeline completo)  */
/* ------------------------------------------------------------------ */
export async function handleIsabellaPost(req: NextRequest) {
  const denied = enforceTrust(req, 'isabella-chat', 60);
  if (denied) return denied;
  const startedAt = Date.now();
  try {
    const body = await req.json().catch(() => null);
    const { perception, error } = buildPerception(body);

    if (error || !perception) {
      return NextResponse.json({ ok: false, error: error ?? 'Percepción inválida' }, { status: 400 });
    }

    const result = await processPerception(perception);

    let text = result.decision.summary;
    let gateway = null;

    if (result.decision.policyStatus === 'allowed' && perception.payload.text) {
      try {
        const canonical = (result.decision.details.canonicalIntent as CanonicalDomain | undefined) ?? 'submission';
        const routed = await crownGatewayGenerate({
          prompt: perception.payload.text,
          canonicalDomain: canonical,
          intent: String(result.decision.details.intent ?? ''),
          riskLevel: result.decision.riskLevel,
          confidence: result.decision.confidence,
          traceId: result.traceId,
          fallbackText: result.decision.summary,
          territory: perception.territory?.place,
          sessionId: result.sessionId,
        });
        text = routed.text;
        gateway = {
          provider: routed.provider,
          model: routed.model,
          latencyMs: routed.latencyMs,
          trustZone: routed.trustZone,
          simulation: routed.simulation,
          emergency: routed.emergency,
          fallbacksTried: routed.fallbacksTried,
        };
      } catch {
        /* el fallback soberano (SOPHIA) ya está en `text` */
      }
    }

    /* ENVELOPE ISA-AI — structured output conforme al schema de referencia.
       Se valida con el contrato antes de responder: si no conforma, se omite
       `structured` (fail-closed) y se deja constancia en audit + métricas. */
    const envelope = buildStructuredEnvelope(result, {
      text,
      prompt: perception.payload.text ?? '',
      latencyMs: Date.now() - startedAt,
      provider: gateway?.provider ?? 'isa-ai',
      model: gateway?.model ?? ISA_AI_DEFAULT_MODEL,
    });

    const validation = validateStructuredEnvelope(envelope);
    let structured: IsaAiEnvelope | null = null;
    let structuredError: string | undefined;
    if (validation.ok) {
      structured = validation.envelope;
    } else {
      structuredError = validation.reason;
      auditTrace('structured.envelope_invalid', {
        reason: validation.reason,
      }, {
        traceId: result.traceId,
        actorId: 'ciudadano-yun',
        sessionId: result.sessionId,
      });
      monitor.metrics.inc('structured.invalid', { route: 'isabella-chat' });
    }

    return NextResponse.json({
      ok: true,
      text,
      decision: result.decision,
      structured,
      structuredError,
      traceId: result.traceId,
      sessionId: result.sessionId,
      auditEvents: result.auditEvents,
      events: result.events,
      gateway,
    });
  } catch (err) {
    const traceId = uuid();
    auditTrace('api.error', {
      error: err instanceof Error ? err.message : 'Error desconocido',
    }, {
      traceId,
      actorId: 'ciudadano-yun',
      sessionId: '',
    });
    return NextResponse.json({
      ok: false,
      error: 'Isabella AI: error interno del Nodo Cero',
      traceId,
    }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/* GET /api/isabella — información de la capa cognitiva C.R.O.W.N.     */
/* ------------------------------------------------------------------ */
export async function handleIsabellaGet() {
  return NextResponse.json({
    ok: true,
    name: 'ISA-API — Isabella Cognitive Layer',
    version: 'v4.0-enterprise',
    node: 'Nodo Cero',
    principle: 'Always by your side',
    crown: {
      kernel: 'C.R.O.W.N. (Constitution of the Reality Ontological Web Native)',
      manifesto: 'RFC-0001',
      constitutionVersion: YUN_CONSTITUTION_VERSION,
      policies: ISABELLA_POLICIES.map(p => ({ id: p.id, name: p.name, action: p.action, riskLevel: p.riskLevel })),
    },
    pipeline: [
      'Prompt Guard (9 categorías)',
      'Intention Parser (8 dominios)',
      'Structured Reasoning (Answer, Sources, Trace)',
      'Mexa API (Firma MSR)',
    ],
    engines: ['ORION', 'SOPHIA', 'ARGUS', 'MNEMOS', 'LUMEN', 'KERNEL', 'TOPOLOGY'],
    promptGuardCategories: GUARD_CATEGORIES.map(c => ({ id: c.id, name: c.name, severity: c.severity, action: c.action })),
    canonicalDomains: CANONICAL_DOMAINS,
    federations: YUN_FEDERATIONS,
    crypto: { scheme: MEXA_SCHEME, pqTarget: MEXA_PQC_TARGET },
    pra: PRA_ENGINE,
    tools: ISABELLA_TOOLS.map(t => ({ name: t.name, description: t.description })),
    endpoints: {
      'POST /api/isabella': 'envía una percepción y recibe una decisión gobernada',
      'GET /api/isabella': 'información de la capa cognitiva y del manifiesto C.R.O.W.N.',
      'POST /api/isabella/chat': 'pipeline completo (Prompt Guard → Intention Parser → Reasoning → Audit YUN)',
      'POST /api/isabella/isa/reason': 'motor de razonamiento estructurado con Answer, Sources y Trace',
      'POST /api/isabella/crypto/sign': 'emisión de firmas criptográficas MSR (operador)',
      'POST /api/isabella/crypto/verify': 'verificación pública de procedencia e integridad de artefactos',
    },
  });
}

/* ------------------------------------------------------------------ */
/* POST /api/isabella/isa/reason — Structured Reasoning Engine         */
/* ------------------------------------------------------------------ */
export async function handleIsabellaReason(req: NextRequest) {
  const denied = enforceTrust(req, 'isabella-reason', 60);
  if (denied) return denied;
  const startedAt = Date.now();
  try {
    const body = await req.json().catch(() => null);
    const { perception, error } = buildPerception(body);

    if (error || !perception) {
      return NextResponse.json({ ok: false, error: error ?? 'Percepción inválida' }, { status: 400 });
    }

    const result = await processPerception(perception);

    const envelope = buildStructuredEnvelope(result, {
      text: result.decision.summary,
      prompt: perception.payload.text ?? '',
      latencyMs: Date.now() - startedAt,
      provider: 'isa-ai',
      model: ISA_AI_DEFAULT_MODEL,
    });

    const validation = validateStructuredEnvelope(envelope);
    let structured: IsaAiEnvelope | null = null;
    let structuredError: string | undefined;
    if (validation.ok) {
      structured = validation.envelope;
    } else {
      structuredError = validation.reason;
      auditTrace('structured.envelope_invalid', {
        reason: validation.reason,
        endpoint: 'isa/reason',
      }, {
        traceId: result.traceId,
        actorId: 'ciudadano-yun',
        sessionId: result.sessionId,
      });
      monitor.metrics.inc('structured.invalid', { route: 'isabella-reason' });
    }

    return NextResponse.json({
      ok: true,
      answer: result.decision.summary,
      sources: result.decision.sources ?? [],
      trace: {
        traceId: result.traceId,
        sessionId: result.sessionId,
        decisionId: result.decision.id,
        policyStatus: result.decision.policyStatus,
        engines: result.decision.engines,
      },
      structured,
      structuredError,
      decision: result.decision,
      auditEvents: result.auditEvents,
      events: result.events,
    });
  } catch (err) {
    const traceId = uuid();
    auditTrace('api.error', {
      error: err instanceof Error ? err.message : 'Error desconocido',
      endpoint: 'isa/reason',
    }, {
      traceId,
      actorId: 'ciudadano-yun',
      sessionId: '',
    });
    return NextResponse.json({
      ok: false,
      error: 'Isabella AI: error interno del motor de razonamiento',
      traceId,
    }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/* POST /api/isabella/crypto/sign — Mexa API (operador)                */
/* ------------------------------------------------------------------ */
export async function handleIsabellaCryptoSign(req: NextRequest) {
  const denied = enforceTrust(req, 'isabella-crypto-sign', 20);
  if (denied) return denied;
  try {
    const operatorKey = process.env.MEXA_OPERATOR_KEY;
    if (!operatorKey) {
      return NextResponse.json({
        ok: false,
        error: 'Endpoints de firma restringidos al operador. Define MEXA_OPERATOR_KEY en los secretos del Nodo.',
      }, { status: 503 });
    }

    const body = await req.json().catch(() => null);
    const record = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;
    const payload = record.payload;
    const operatorId = typeof record.operatorId === 'string' ? record.operatorId.trim() : '';
    const candidateOperatorKey = typeof record.operatorKey === 'string' ? record.operatorKey : '';

    if (payload === undefined || payload === null) {
      return NextResponse.json({ ok: false, error: 'Campo payload requerido para firmar.' }, { status: 400 });
    }
    if (!operatorId) {
      return NextResponse.json({ ok: false, error: 'Campo operatorId requerido para firmar.' }, { status: 400 });
    }

    /* Autenticación del operador: prueba de posesión de MEXA_OPERATOR_KEY
       comparada en tiempo constante (rechaza 403 sin revelar la clave). */
    const operatorSecret = process.env.MEXA_OPERATOR_KEY;
    if (!operatorSecret || !constantTimeCompare(candidateOperatorKey, operatorSecret)) {
      return NextResponse.json({
        ok: false,
        error: 'Operador no autenticado: credencial inválida o inexistente.',
      }, { status: 403 });
    }

    const keyPair = await mexaGetOperatorKeyPair();
    const signature = await mexaSign(keyPair.privateJwk, payload);
    const keyId = await mexaKeyIdFromPublic(keyPair.publicJwk);

    return NextResponse.json({
      ok: true,
      signedBy: 'Nodo Cero · Mexa API (operador)',
      operatorId,
      scheme: MEXA_SCHEME,
      pqTarget: MEXA_PQC_TARGET,
      signature,
      publicKey: keyPair.publicJwk,
      keyId,
      payload,
    });
  } catch {
    return NextResponse.json({
      ok: false,
      error: 'Mexa API: error al emitir la firma MSR.',
    }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/* POST /api/isabella/crypto/verify — Mexa API (público)               */
/* ------------------------------------------------------------------ */
export async function handleIsabellaCryptoVerify(req: NextRequest) {
  const denied = enforceTrust(req, 'isabella-crypto-verify', 60);
  if (denied) return denied;
  try {
    const body = await req.json().catch(() => null);
    const record = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;

    const payload = record.payload;
    const signature = typeof record.signature === 'string' ? record.signature : '';
    const publicKey = record.publicKey as JsonWebKey | undefined;

    if (payload === undefined || payload === null || !signature) {
      return NextResponse.json({
        ok: false,
        error: 'Se requieren payload y signature para verificar.',
      }, { status: 400 });
    }

    /* Provenance real: en producción solo se verifica contra la clave pública
       del operador (MEXA_OPERATOR_PUBLIC_KEY). Una clave arbitraria aportada
       por la petición solo demuestra autoconsistencia, no procedencia, así que
       fuera de development se ignora y se falla cerrado si no está configurada. */
    let verificationKey: JsonWebKey | undefined;
    if (process.env.NODE_ENV !== 'development') {
      if (typeof process.env.MEXA_OPERATOR_PUBLIC_KEY === 'string' && process.env.MEXA_OPERATOR_PUBLIC_KEY) {
        try {
          verificationKey = JSON.parse(process.env.MEXA_OPERATOR_PUBLIC_KEY) as JsonWebKey;
        } catch {
          verificationKey = undefined;
        }
      }
      if (!verificationKey) {
        return NextResponse.json({
          ok: false,
          error: 'Verificación no disponible: define MEXA_OPERATOR_PUBLIC_KEY (JWK del operador).',
        }, { status: 503 });
      }
    } else {
      verificationKey = publicKey;
    }

    if (!verificationKey) {
      return NextResponse.json({
        ok: false,
        error: 'Se requieren payload, signature y publicKey para verificar.',
      }, { status: 400 });
    }

    const result = await mexaVerify(verificationKey, payload, signature);

    return NextResponse.json({
      ok: true,
      valid: result.valid,
      keyId: result.keyId,
      verifiedBy: 'Nodo Cero · Mexa API',
      scheme: MEXA_SCHEME,
    });
  } catch {
    return NextResponse.json({
      ok: false,
      error: 'Mexa API: verificación rechazada por integridad o formato.',
    }, { status: 400 });
  }
}
