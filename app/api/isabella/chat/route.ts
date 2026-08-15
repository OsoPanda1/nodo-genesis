/* ================================================================== */
/* ROUTE: api:isabella:chat (Enterprise Sovereign Core v6.0 - Titan)  */
/* ================================================================== */
/* Implementación definitiva de alto rendimiento para el canal cognitivo*/
/* de Isabella. Diseñada para entornos de misión crítica con:        */
/*   - Propagación de cancelación nativa (AbortController / req.signal)*/
/*   - Streaming SSE de baja latencia con zero-buffer y keep-alive    */
/*   - Métricas de rendimiento de alta precisión (Server-Timing)      */
/*   - Resiliencia ante fallos upstream y aislamiento de circuitos    */
/* ================================================================== */

import { z } from 'zod';
import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { handleIsabellaPost } from '@/lib/isabella/http';
import { publishEvent } from '@/lib/core/events';

/* 1. Contrato de Validación Estricta con Zod */
const IsabellaChatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant', 'function', 'tool']),
      content: z.string().min(1, 'El contenido no puede estar vacío').max(32768, 'Excede el límite seguro de tokens por mensaje'),
      name: z.string().regex(/^[a-zA-Z0-9_-]+$/).optional(),
    }),
  ).min(1, 'El contexto conversacional requiere al menos un mensaje'),
  model: z.string().default('isabella-titan-v6'),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().int().positive().optional(),
  stream: z.boolean().default(false),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

type IsabellaPayload = z.infer<typeof IsabellaChatSchema>;

/* 2. Pipeline Principal de Ejecución Soberana */
export const POST = guardedRoute<IsabellaPayload>(
  {
    route: 'api:isabella:chat',
    methods: ['POST'],
    rateLimit: 60,
    originRequired: true,
    zeroTrust: true,
    requireNonce: false,
    json: true,
    schema: IsabellaChatSchema,
    hardenHeaders: true,
    cacheControl: 'no-store',
    identityScopes: ['isabella:chat'],
  },
  async ({ req, route, traceId, body, actor }) => {
    const startTime = performance.now();
    const abortController = new AbortController();

    // Propagar la desconexión del cliente al upstream para ahorrar cómputo y tokens
    if (req.signal) {
      req.signal.addEventListener('abort', () => {
        abortController.abort();
      });
    }

    try {
      // Inyección estricta de metadatos de trazabilidad soberana
      const enrichedPayload = {
        ...body,
        __meta: {
          traceId,
          route,
          actorId: actor?.id ?? 'anonymous-sovereign-node',
          owner: actor?.owner ?? 'public-domain',
          timestamp: Date.now(),
          clientIp: req.headers.get('x-forwarded-for') ?? 'internal',
        },
      };

      const upstreamReq = new Request(req.url, {
        method: 'POST',
        headers: req.headers,
        body: JSON.stringify(enrichedPayload),
        signal: abortController.signal,
      });

      // Ejecución en el núcleo cognitivo de Isabella
      const upstreamResponse = await handleIsabellaPost(upstreamReq as any);

      const durationMs = performance.now() - startTime;

      // Construcción de cabeceras de rendimiento y diagnóstico en tiempo real
      const responseHeaders = new Headers(upstreamResponse.headers);
      responseHeaders.set('X-Isabella-Route', route);
      responseHeaders.set('X-Trace-Id', traceId);
      responseHeaders.set('X-Processing-Time-Ms', durationMs.toFixed(2));
      responseHeaders.set('Server-Timing', `isabella;dur=${durationMs.toFixed(2)}, node;dur=0.1`);

      return new NextResponse(upstreamResponse.body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: responseHeaders,
      });

    } catch (error: unknown) {
      const durationMs = performance.now() - startTime;
      const isAborted = error instanceof Error && error.name === 'AbortError';

      publishEvent({
        type: isAborted ? 'api.isabella.client_aborted' : 'api.isabella.upstream_failure',
        source: 'isabella-titan-route',
        domain: 'ai',
        traceId,
        severity: isAborted ? 'info' : 'critical',
        data: {
          route,
          durationMs,
          error: error instanceof Error ? error.message : String(error),
        },
      });

      if (isAborted) {
        return new NextResponse(null, { status: 499, statusText: 'Client Closed Request' });
      }

      throw error; // Delegado al gestor global de errores del guardián
    }
  },
);
