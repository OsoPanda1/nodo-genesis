/* ------------------------------------------------------------------ */
/* GAMIFICATION YUN — Pulso territorial (datos reales de la plataforma) */
/* ------------------------------------------------------------------ */
/* Conecta la gamificación a los dominios del Nodo Cero en lugar de     */
/* valores hardcodeados: lee el estado real de city (incidentes), twins */
/* (gemelos), marketplace (listados) y payments (ledger) y lo expone    */
/* como un "pulso territorial". Con ese pulso se calcula el progreso    */
/* real de los retos de la Comarca y la presión de spawns del juego.    */
/*                                                                      */
/* SOLO SERVIDOR: los stores que lee pueden depender de Postgres/Redis. */
/* Los clientes consumen este pulso vía /api/gamification/status.       */
/* ------------------------------------------------------------------ */

import { listIncidents, incidentCountByStatus } from '@/lib/city/city-event-bus';
import { getTwinInstances } from '@/lib/twins/twin-store';
import { listListings, listSubscriptions } from '@/lib/marketplace/marketplace-store';
import { ledgerSummary } from '@/lib/payments/engine';
import { getGamificationStats } from './store';
import { RDM_CHALLENGES } from '@/lib/rdm/rdm-content';
import { RDM_POIS } from '@/lib/data/rdm-data';
import type { SpawnZone } from './contracts';

export interface TerritoryIncidentSummary {
  open: number;
  critical: number;
  resolved: number;
  total: number;
  byDomain: Record<string, number>;
}

export interface TerritoryPulse {
  timestamp: number;
  incidents: TerritoryIncidentSummary;
  twins: { total: number; healthy: number };
  marketplace: { published: number; subscriptions: number };
  payments: { confirmed: number; confirmedAmount: number };
  pressureByPoi: Record<string, number>;
  pressureByZone: Record<SpawnZone, number>;
}

const SEVERITY_WEIGHT: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
const STATUS_WEIGHT: Record<string, number> = { open: 1, triaged: 0.8, assigned: 0.6, mitigated: 0.2, closed: 0 };

function zoneForCategory(category: string): SpawnZone {
  if (category === 'mina') return 'mina';
  if (category === 'gastronomia' || category === 'plateria') return 'gastronomia';
  if (category === 'naturaleza') return 'naturaleza';
  if (category === 'cultura') return 'cultura';
  return 'calles';
}

function poiIdFromEntityId(entityId: string): string | undefined {
  if (entityId.startsWith('twin-')) return entityId.slice(5);
  if (entityId.startsWith('asst-poi-')) return entityId.slice(9);
  return undefined;
}

export function getTerritoryPulse(): TerritoryPulse {
  const incidents = listIncidents();
  const byStatus = incidentCountByStatus(incidents);
  const resolved = byStatus.mitigated + byStatus.closed;
  const critical = incidents.filter(i => i.severity === 'critical').length;
  const byDomain: Record<string, number> = {};
  for (const inc of incidents) byDomain[inc.domain] = (byDomain[inc.domain] ?? 0) + 1;

  const twins = getTwinInstances();
  const healthyTwins = twins.filter(t => t.status === 'healthy').length;

  const listings = listListings();
  const published = listings.filter(l => l.status === 'published').length;
  const subscriptions = listSubscriptions().length;

  const ledger = ledgerSummary();

  /* Presión por POI: incidentes abiertos/triaged/assigned sobre el POI,
     ponderados por severidad y estado, normalizados a 0..1. */
  const pressureByPoi: Record<string, number> = {};
  for (const inc of incidents) {
    const sev = SEVERITY_WEIGHT[inc.severity] ?? 1;
    const status = STATUS_WEIGHT[inc.status] ?? 0;
    if (status <= 0) continue;
    for (const entityId of inc.relatedEntityIds) {
      const poiId = poiIdFromEntityId(entityId);
      if (!poiId) continue;
      pressureByPoi[poiId] = Math.max(pressureByPoi[poiId] ?? 0, (sev / 4) * status);
    }
  }

  const pressureByZone: Record<SpawnZone, number> = { mina: 0, cultura: 0, naturaleza: 0, gastronomia: 0, calles: 0 };
  const zoneCount: Record<SpawnZone, number> = { mina: 0, cultura: 0, naturaleza: 0, gastronomia: 0, calles: 0 };
  for (const poi of RDM_POIS) {
    const zone = zoneForCategory(poi.category);
    zoneCount[zone] += 1;
    pressureByZone[zone] += pressureByPoi[poi.id] ?? 0;
  }
  for (const zone of Object.keys(pressureByZone) as SpawnZone[]) {
    pressureByZone[zone] = zoneCount[zone] > 0 ? pressureByZone[zone] / zoneCount[zone] : 0;
  }

  return {
    timestamp: Date.now(),
    incidents: { open: byStatus.open, critical, resolved, total: incidents.length, byDomain },
    twins: { total: twins.length, healthy: healthyTwins },
    marketplace: { published, subscriptions },
    payments: { confirmed: ledger.confirmedPayments, confirmedAmount: ledger.totalConfirmedAmount },
    pressureByPoi,
    pressureByZone,
  };
}

/* ------------------------------------------------------------------ */
/* Progreso real de los retos de la Comarca                            */
/* ------------------------------------------------------------------ */
/* Cada reto de RDM_CHALLENGES mide un indicador territorial real en    */
/* lugar de un porcentaje fijo: minas sin incidentes, gastronomía con   */
/* listados publicados, naturaleza/cultura saludable, comunidad con     */
/* incidentes resueltos y economía con pagos confirmados.               */
/* ------------------------------------------------------------------ */

function healthyRatio(pulse: TerritoryPulse, category: string): number {
  const pois = RDM_POIS.filter(p => p.category === category);
  if (pois.length === 0) return 0;
  const blocked = pois.filter(p => (pulse.pressureByPoi[p.id] ?? 0) > 0).length;
  return ((pois.length - blocked) / pois.length) * 100;
}

function clamp100(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeChallengeProgress(challengeId: string, pulse: TerritoryPulse): number {
  switch (challengeId) {
    case 'c-1': /* La Ruta de la Plata — minas despejadas */
      return clamp100(healthyRatio(pulse, 'mina'));
    case 'c-2': /* Cata de Pastes — gastronomía con listados publicados */
      return clamp100((pulse.marketplace.published / 6) * 100);
    case 'c-3': /* Atardecer Soberano — naturaleza saludable */
      return clamp100(healthyRatio(pulse, 'naturaleza'));
    case 'c-4': /* Legado Cornish — cultura saludable */
      return clamp100(healthyRatio(pulse, 'cultura'));
    case 'c-5': /* Embajador Verde — comunidad resolviendo incidentes */
      return pulse.incidents.total > 0 ? clamp100((pulse.incidents.resolved / pulse.incidents.total) * 100) : 0;
    case 'c-6': /* Cronista del Foro — economía con pagos confirmados */
      return clamp100((pulse.payments.confirmed / 12) * 100);
    default:
      return 0;
  }
}

export interface ResolvedChallenge {
  id: string;
  title: string;
  category: string;
  points: number;
  progress: number;
}

export function computeAllChallenges(pulse: TerritoryPulse): ResolvedChallenge[] {
  return RDM_CHALLENGES.map(c => ({
    id: c.id,
    title: c.title,
    category: c.category,
    points: c.points,
    progress: computeChallengeProgress(c.id, pulse),
  }));
}

export function getGamificationTerritoryStatus(): {
  territory: TerritoryPulse;
  challenges: ResolvedChallenge[];
  stats: ReturnType<typeof getGamificationStats>;
} {
  const pulse = getTerritoryPulse();
  return { territory: pulse, challenges: computeAllChallenges(pulse), stats: getGamificationStats() };
}
