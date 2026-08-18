/* ================================================================== */
/* READY YUN — Prontitud operativa del Quantum Semantic Core           */
/* ================================================================== */
/* /api/yun/ready responde 200 solo cuando el núcleo puede operar       */
/* (proveedor criptográfico disponible) y las federaciones no están    */
/* todas caídas. En caso contrario 503 con el detalle.                 */
/* ================================================================== */

import { allFederationHealth } from './federations';
import { yunSemanticCoreStatus } from './semantic-core';

export interface YunReadyState {
  ok: boolean;
  ready: boolean;
  providerAvailable: boolean;
  federationsOperational: number;
  federationsTotal: number;
}

export function yunReadyState(): YunReadyState {
  const core = yunSemanticCoreStatus();
  const federations = allFederationHealth();
  const operational = federations.filter((h) => h.status !== 'DOWN').length;
  const providerAvailable = core.providerAvailable;
  const ready = providerAvailable && operational > 0;

  return {
    ok: ready,
    ready,
    providerAvailable,
    federationsOperational: operational,
    federationsTotal: federations.length,
  };
}
