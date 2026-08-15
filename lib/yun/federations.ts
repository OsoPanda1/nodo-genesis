/* ================================================================== */
/* FEDERATIONS YUN — Salud de la heptafederación (Fed1..Fed7)          */
/* ================================================================== */
/* Espejo del blueprint: cada federación reporta su salud y el cambio  */
/* se emite al bus YUN como evento `yun.federation.health.changed`.    */
/* Inicialmente todas las federaciones nacen HEALTHY; los integradores */
/* reales deben alimentar observables desde el Data Fabric YUN.        */
/* ================================================================== */

import { YUN_FEDERATIONS } from '@/lib/isabella/constitution';
import { emitYunAudit } from './audit';
import type { YunFederation } from './contracts';

export type FederationHealthStatus = 'HEALTHY' | 'DEGRADED' | 'DOWN';

export const HEALTHY: FederationHealthStatus = 'HEALTHY';
export const DEGRADED: FederationHealthStatus = 'DEGRADED';
export const DOWN: FederationHealthStatus = 'DOWN';

export interface FederationHealth {
  federationId: YunFederation;
  status: FederationHealthStatus;
  latencyMs?: number;
  lastCheckedAt: string;
  detail?: string;
}

export interface FederationStoreState {
  [federationId: string]: FederationHealth;
}

function freshHealth(federationId: YunFederation): FederationHealth {
  return {
    federationId,
    status: HEALTHY,
    lastCheckedAt: new Date().toISOString(),
  };
}

let store: FederationStoreState = Object.fromEntries(
  YUN_FEDERATIONS.map((federationId) => [federationId, freshHealth(federationId as YunFederation)]),
);

export function federationHealth(federationId: YunFederation): FederationHealth | undefined {
  return store[federationId];
}

export function allFederationHealth(): FederationHealth[] {
  return YUN_FEDERATIONS.map((federationId) => store[federationId]).filter(
    (health): health is FederationHealth => health !== undefined,
  );
}

/** Actualiza la salud de una federación y emite el evento si cambió. */
export function updateFederationHealth(
  federationId: YunFederation,
  status: FederationHealthStatus,
  options?: { latencyMs?: number; detail?: string; traceId?: string },
): FederationHealth {
  const previous = store[federationId];
  const next: FederationHealth = {
    federationId,
    status,
    latencyMs: options?.latencyMs,
    lastCheckedAt: new Date().toISOString(),
    detail: options?.detail,
  };
  store = { ...store, [federationId]: next };

  emitYunAudit(
    'yun.federation.health.changed',
    {
      federationId,
      from: previous?.status ?? 'UNKNOWN',
      to: status,
      latencyMs: next.latencyMs,
      detail: next.detail,
    },
    { traceId: options?.traceId, federation: federationId, severity: 'info' },
  );

  return next;
}

export function resetFederationsForTests(): void {
  store = Object.fromEntries(
    YUN_FEDERATIONS.map((federationId) => [federationId, freshHealth(federationId as YunFederation)]),
  );
}
