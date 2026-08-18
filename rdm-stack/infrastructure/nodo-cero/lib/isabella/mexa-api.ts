/* ================================================================== */
/* MEXA API — Capa interna de firma MSR del Nodo Cero                 */
/* ================================================================== */
/* La Mexa API es la interfaz interna que firma (MSR-P256) los        */
/* artefactos generados por el núcleo soberano ISA. Sin operador       */
/* configurado, responde en modo 'open' (sin firma) pero siempre       */
/* opera offline: jamás depende de servicios externos.                 */
/* ================================================================== */

import { isaReason, isaCoreStatus } from '@/lib/isabella/isa-core';
import {
  MEXA_SCHEME,
  MEXA_PQC_TARGET,
  mexaGetOperatorKeyPair,
  mexaSign,
  mexaKeyIdFromPublic,
  type MexaSignaturePayload,
} from '@/lib/isabella/mexa-crypto';

export interface MexaResponse {
  ok: boolean;
  answer: string;
  sources: ReturnType<typeof isaReason>['sources'];
  trace: ReturnType<typeof isaReason>['trace'];
  signature?: MexaSignaturePayload;
  keyId?: string;
  scheme: string;
  signed: boolean;
}

/** Razonamiento ISA firmado con MEXA (si el operador está configurado). */
export async function mexaReason(
  query: string,
  options: { sign?: boolean } = {},
): Promise<MexaResponse> {
  const result = isaReason(query);

  if (options.sign === false || !process.env.MEXA_OPERATOR_KEY) {
    return {
      ok: true,
      answer: result.answer,
      sources: result.sources,
      trace: result.trace,
      scheme: MEXA_SCHEME,
      signed: false,
    };
  }

  try {
    const keyPair = await mexaGetOperatorKeyPair();
    const payload = { query, answer: result.answer, traceId: result.trace.engineVersion };
    const signature = await mexaSign(keyPair.privateJwk, payload);
    const keyId = await mexaKeyIdFromPublic(keyPair.publicJwk);
    return {
      ok: true,
      answer: result.answer,
      sources: result.sources,
      trace: result.trace,
      signature,
      keyId,
      scheme: MEXA_SCHEME,
      signed: true,
    };
  } catch {
    return {
      ok: true,
      answer: result.answer,
      sources: result.sources,
      trace: result.trace,
      scheme: MEXA_SCHEME,
      signed: false,
    };
  }
}

/** Estado de la capa MEXA + núcleo ISA (para el monitor). */
export function mexaStatus(): {
  scheme: string;
  pqTarget: string;
  operatorConfigured: boolean;
  isa: ReturnType<typeof isaCoreStatus>;
} {
  return {
    scheme: MEXA_SCHEME,
    pqTarget: MEXA_PQC_TARGET,
    operatorConfigured: Boolean(process.env.MEXA_OPERATOR_KEY),
    isa: isaCoreStatus(),
  };
}
