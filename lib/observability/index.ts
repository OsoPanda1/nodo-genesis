/* ================================================================== */
/* OBSERVABILIDAD YUN — Núcleo del fabric                              */
/* ================================================================== */
/* Singletons del tejido cognitivo: SLO, métricas RED y grafo causal.  */
/* Consumen el bus YUN unificado vía bridge (solo servidor).           */
/* ================================================================== */

import { MetricsRegistry } from '@/lib/monitoring/metrics';
import { SloManager } from './slo';
import { RedMetrics } from './red-metrics';
import { EventGraph } from './event-graph';

const registry = new MetricsRegistry();

/** Presupuestos de error por objetivo de servicio. */
export const sloManager = new SloManager();
/** Métricas RED por ruta de API. */
export const redMetrics = new RedMetrics(registry);
/** Grafo causal de eventos (observed -> confirmed). */
export const eventGraph = new EventGraph();
/** Registro compartido de métricas del fabric. */
export const observabilityRegistry = registry;

/** Registra los SLO por defecto del Nodo (disponibilidad de API). */
export function registerDefaultSlo(): void {
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  sloManager.register({ name: 'api.core.availability', target: 0.99, windowMs: thirtyDays });
  sloManager.register({ name: 'api.telemetry.health', target: 0.999, windowMs: thirtyDays });
}

export * from './slo';
export * from './red-metrics';
export * from './event-graph';
