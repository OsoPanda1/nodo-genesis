/* ================================================================== */
/* CONTRACTS — Respuestas de error uniformes                          */
/* ================================================================== */
/* Formato de error único para toda la API del Nodo. Sustituye los     */
/* mensajes libres por una forma estable: { ok:false, error, ... }.    */
/* ================================================================== */

import { NextResponse } from 'next/server';
import type { ZodError } from 'zod';

/** Respuesta de error uniforme con forma estable. */
export function apiErrorJson(
  message: string,
  status = 400,
  extra: Record<string, unknown> = {},
): NextResponse {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

/** 429 con Retry-After (RFC 6585). */
export function rateLimitedJson(retryAfterMs: number, message = 'Límite de peticiones alcanzado. Reintenta en un momento.'): NextResponse {
  return NextResponse.json(
    { ok: false, error: message },
    {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
    },
  );
}

/** 400 a partir de un error de validación de contrato (zod). */
export function zodErrorJson(error: ZodError): NextResponse {
  return NextResponse.json(
    {
      ok: false,
      error: 'BODY_INVALID',
      details: error.issues.map(i => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    },
    { status: 400 },
  );
}

/** 500 seguro: en producción no filtra el mensaje interno. */
export function internalErrorJson(message: string): NextResponse {
  const exposed = process.env.NODE_ENV === 'development' ? message : 'Error interno del servidor.';
  return apiErrorJson(exposed, 500);
}
