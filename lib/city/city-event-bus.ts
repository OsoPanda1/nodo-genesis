import type { CityDomain, CityEvent, CityIncident, CityIncidentStatus, CitySeverity } from './city-types';
import { RDM_POIS } from '@/lib/data/rdm-data';

const MAX_EVENTS = 200;

interface CityEventBusShape {
  events: CityEvent[];
  incidents: CityIncident[];
  handlers: Array<(event: CityEvent) => void>;
}

const g = globalThis as unknown as { __rdmCityBus?: CityEventBusShape };

function getBus(): CityEventBusShape {
  if (!g.__rdmCityBus) {
    g.__rdmCityBus = { events: [], incidents: seedIncidents(), handlers: [] };
  }
  return g.__rdmCityBus;
}

function now(): string {
  return new Date().toISOString();
}

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

export function seedIncidents(): CityIncident[] {
  return [
    {
      id: 'inc-001',
      domain: 'traffic',
      title: 'Congestión en acceso norte',
      description: 'Aumento sostenido de flujo vehicular en la entrada principal del pueblo mágico.',
      severity: 'high',
      status: 'open',
      location: { lat: 20.1412, lng: -98.6745, label: 'Acceso norte' },
      source: 'sensor',
      createdAt: minutesAgo(25),
      updatedAt: minutesAgo(25),
      tags: ['traffic', 'rush-hour'],
      relatedEntityIds: ['sub-rdm'],
    },
    {
      id: 'inc-002',
      domain: 'civilProtection',
      title: 'Riesgo por caída de ramas',
      description: 'Viento fuerte en zona arbolada del jardín del Mirador.',
      severity: 'critical',
      status: 'assigned',
      location: { lat: 20.1386, lng: -98.6751, label: 'Mirador' },
      source: 'citizen',
      createdAt: minutesAgo(7),
      updatedAt: minutesAgo(3),
      tags: ['weather', 'risk'],
      relatedEntityIds: ['plaza-nacional'],
    },
    {
      id: 'inc-003',
      domain: 'water',
      title: 'Baja presión en El Crestón',
      description: 'Sectores altos reportan presión por debajo del umbral operativo.',
      severity: 'medium',
      status: 'triaged',
      location: { lat: 20.1412, lng: -98.6719, label: 'Tanque El Crestón' },
      source: 'integration',
      createdAt: minutesAgo(48),
      updatedAt: minutesAgo(40),
      tags: ['water', 'pressure'],
      relatedEntityIds: ['tanque-1'],
    },
    {
      id: 'inc-004',
      domain: 'energy',
      title: 'Carga alta en subestación',
      description: 'La subestación opera al 78% de capacidad durante el pico vespertino.',
      severity: 'low',
      status: 'open',
      location: { lat: 20.1398, lng: -98.6738, label: 'Subestación central' },
      source: 'sensor',
      createdAt: minutesAgo(90),
      updatedAt: minutesAgo(90),
      tags: ['energy', 'load'],
      relatedEntityIds: ['sub-rdm'],
    },
    {
      id: 'inc-005',
      domain: 'mobility',
      title: 'Turibús con desviación',
      description: 'La unidad de la ruta norte se desvió del itinerario por bloqueo parcial.',
      severity: 'medium',
      status: 'assigned',
      location: { lat: 20.1389, lng: -98.6741, label: 'Ruta norte' },
      source: 'integration',
      createdAt: minutesAgo(15),
      updatedAt: minutesAgo(12),
      tags: ['mobility', 'vehicle'],
      relatedEntityIds: ['bus-turistico-01'],
    },
    ...poisToIncidents(),
  ];
}

function poisToIncidents(): CityIncident[] {
  const incidents: CityIncident[] = [];
  for (const poi of RDM_POIS) {
    const occupancy = Number.parseInt(poi.sensors.occupancy ?? '0', 10) || 0;
    if (poi.status === 'En mantenimiento') {
      incidents.push({
        id: `inc-poi-${poi.id}`,
        domain: 'publicWorks',
        title: `Mantenimiento en ${poi.name}`,
        description: 'Punto de interés en mantenimiento: coordinación de horarios de atención y restricciones de acceso.',
        severity: 'low',
        status: 'open',
        location: { lat: poi.lat, lng: poi.lng, label: poi.name },
        source: 'operator',
        createdAt: minutesAgo(120),
        updatedAt: minutesAgo(120),
        tags: ['mantenimiento', poi.category],
        relatedEntityIds: [`twin-${poi.id}`, `asst-poi-${poi.id}`],
      });
    } else if (occupancy >= 80) {
      incidents.push({
        id: `inc-poi-${poi.id}`,
        domain: 'traffic',
        title: `Aforo alto en ${poi.name}`,
        description: `Ocupación del ${occupancy}% detectada por sensores. Se recomienda desviar flujos peatonales.`,
        severity: 'medium',
        status: 'triaged',
        location: { lat: poi.lat, lng: poi.lng, label: poi.name },
        source: 'sensor',
        createdAt: minutesAgo(90),
        updatedAt: minutesAgo(60),
        tags: ['aforo', 'sensor', poi.category],
        relatedEntityIds: [`twin-${poi.id}`],
      });
    } else if (poi.sensors.traffic === 'Alto') {
      incidents.push({
        id: `inc-poi-${poi.id}`,
        domain: 'traffic',
        title: `Tráfico alto en ${poi.name}`,
        description: 'Flujo vehicular elevado en la zona. Activación de protocolo de desvío.',
        severity: 'medium',
        status: 'triaged',
        location: { lat: poi.lat, lng: poi.lng, label: poi.name },
        source: 'sensor',
        createdAt: minutesAgo(75),
        updatedAt: minutesAgo(50),
        tags: ['traffic', poi.category],
        relatedEntityIds: [`twin-${poi.id}`],
      });
    }
  }
  return incidents;
}

export function publishCityEvent(event: Omit<CityEvent, 'id' | 'timestamp'>): CityEvent {
  const bus = getBus();
  const full: CityEvent = { ...event, id: `evt-${Math.random().toString(36).slice(2, 10)}`, timestamp: now() };
  bus.events.push(full);
  if (bus.events.length > MAX_EVENTS) bus.events = bus.events.slice(-MAX_EVENTS);
  for (const handler of bus.handlers) {
    try {
      handler(full);
    } catch {
      /* handler defectuoso: nunca rompe el bus */
    }
  }
  mirrorToUnifiedBus(full);
  return full;
}

/* Publica además en el bus YUN unificado (solo servidor). El import es
   dinámico para no arrastrar node:async_hooks al bundle de cliente. */
function mirrorToUnifiedBus(event: CityEvent): void {
  if (typeof window !== 'undefined') return;
  void import('@/lib/core/events')
    .then(({ publishEvent }) => {
      publishEvent({
        type: `city.${event.type}`,
        source: 'city-event-bus',
        domain: event.domain,
        severity: mapCitySeverity(event.severity),
        data: { ...event.payload, eventId: event.id },
        meta: { entityId: event.id },
      });
    })
    .catch(() => {
      /* el bus nunca debe bloquear la emisión original */
    });
}

function mapCitySeverity(severity: CitySeverity): 'info' | 'warning' | 'critical' {
  if (severity === 'critical') return 'critical';
  if (severity === 'high') return 'warning';
  return 'info';
}

export function subscribeCityEvents(handler: (event: CityEvent) => void): () => void {
  const bus = getBus();
  bus.handlers.push(handler);
  return () => {
    bus.handlers = bus.handlers.filter((h) => h !== handler);
  };
}

export function recentCityEvents(limit = 25): CityEvent[] {
  const bus = getBus();
  return [...bus.events].reverse().slice(0, limit);
}

export function listIncidents(): CityIncident[] {
  return getBus().incidents;
}

export function getIncident(id: string): CityIncident | undefined {
  return getBus().incidents.find((i) => i.id === id);
}

export function addIncident(incident: Omit<CityIncident, 'createdAt' | 'updatedAt'>): CityIncident {
  const bus = getBus();
  const full: CityIncident = { ...incident, createdAt: now(), updatedAt: now() };
  bus.incidents.push(full);
  return full;
}

export function updateIncident(
  id: string,
  patch: Partial<Pick<CityIncident, 'status' | 'severity' | 'description' | 'tags'>>,
): CityIncident | undefined {
  const bus = getBus();
  const index = bus.incidents.findIndex((i) => i.id === id);
  if (index === -1) return undefined;
  const next = { ...bus.incidents[index], ...patch, updatedAt: now() };
  bus.incidents[index] = next;
  return next;
}

export function incidentCountByStatus(incidents: CityIncident[]): Record<CityIncidentStatus, number> {
  const counts: Record<CityIncidentStatus, number> = { open: 0, triaged: 0, assigned: 0, mitigated: 0, closed: 0 };
  for (const incident of incidents) counts[incident.status] += 1;
  return counts;
}

export function incidentCountByDomain(incidents: CityIncident[]): Record<CityDomain, number> {
  const counts = {} as Record<CityDomain, number>;
  for (const incident of incidents) counts[incident.domain] = (counts[incident.domain] ?? 0) + 1;
  return counts;
}

export function severityRank(severity: CitySeverity): number {
  return { low: 1, medium: 2, high: 3, critical: 4 }[severity];
}
