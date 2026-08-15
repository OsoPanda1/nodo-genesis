import type { CityDomain, CityIncident, CityIncidentStatus, CitySeverity } from './city-types';
import { severityRank } from './city-event-bus';

export function rankIncidents(incidents: CityIncident[]): CityIncident[] {
  return [...incidents].sort((a, b) => {
    const severityDiff = severityRank(b.severity) - severityRank(a.severity);
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function autoTriageIncident(incident: CityIncident): CityIncident {
  const status: CityIncidentStatus =
    incident.severity === 'critical' ? 'assigned' : incident.severity === 'high' ? 'triaged' : 'open';
  return { ...incident, status, updatedAt: new Date().toISOString() };
}

export function incidentsByDomainRank(incidents: CityIncident[]): Array<{ domain: CityDomain; count: number; critical: number }> {
  const map = new Map<CityDomain, { count: number; critical: number }>();
  for (const incident of incidents) {
    const entry = map.get(incident.domain) ?? { count: 0, critical: 0 };
    entry.count += 1;
    if (incident.severity === 'critical') entry.critical += 1;
    map.set(incident.domain, entry);
  }
  return [...map.entries()].map(([domain, stats]) => ({ domain, ...stats })).sort((a, b) => b.critical - a.critical || b.count - a.count);
}

export function escalationState(incident: CityIncident): CitySeverity {
  if (incident.domain === 'civilProtection' || incident.domain === 'fire') {
    return severityRank(incident.severity) >= 3 ? 'critical' : incident.severity;
  }
  return incident.severity;
}
