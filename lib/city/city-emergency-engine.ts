import type { CityIncident, CityIncidentStatus, CitySeverity } from './city-types';
import { getResponsePlaybook, playbookTotalEta, playbookAutomationLevel } from './city-response-playbooks';

export type EmergencyEscalation = {
  incidentId: string;
  escalationLevel: 1 | 2 | 3 | 4;
  lockdown: boolean;
  trigger: string;
  estimatedResponseMinutes: number;
};

export function escalationLevelForSeverity(severity: CitySeverity): 1 | 2 | 3 | 4 {
  switch (severity) {
    case 'critical':
      return 4;
    case 'high':
      return 3;
    case 'medium':
      return 2;
    default:
      return 1;
  }
}

export function buildEscalation(incident: CityIncident): EmergencyEscalation {
  const level = escalationLevelForSeverity(incident.severity);
  const playbook = getResponsePlaybook(incident);
  const lockdown = level >= 4 || incident.domain === 'civilProtection';
  return {
    incidentId: incident.id,
    escalationLevel: level,
    lockdown,
    trigger: level >= 4 ? 'severidad crítica' : level >= 3 ? 'prioridad alta' : 'seguimiento',
    estimatedResponseMinutes: playbookTotalEta(playbook),
  };
}

export function isEmergencyIncident(incident: CityIncident): boolean {
  return escalationLevelForSeverity(incident.severity) >= 3 || incident.domain === 'civilProtection' || incident.domain === 'fire';
}

export function advanceIncidentStatus(current: CityIncidentStatus, action: 'accept' | 'mitigate' | 'close'): CityIncidentStatus {
  if (action === 'close') return 'closed';
  if (action === 'mitigate') return 'mitigated';
  if (action === 'accept') {
    if (current === 'open') return 'triaged';
    if (current === 'triaged') return 'assigned';
  }
  return current;
}

export function emergencySummary(incidents: CityIncident[]) {
  const emergencies = incidents.filter(isEmergencyIncident);
  return {
    emergencyCount: emergencies.length,
    lockdown: emergencies.some((i) => escalationLevelForSeverity(i.severity) === 4),
    byAutomation: {
      automated: incidents.filter((i) => playbookAutomationLevel(getResponsePlaybook(i)) === 'automated').length,
      semiAutomated: incidents.filter((i) => playbookAutomationLevel(getResponsePlaybook(i)) === 'semi-automated').length,
      manual: incidents.filter((i) => playbookAutomationLevel(getResponsePlaybook(i)) === 'manual').length,
    },
  };
}
