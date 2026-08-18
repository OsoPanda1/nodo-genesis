import type { CityDomain, CityIncident, CitySeverity } from './city-types';
import { severityRank } from './city-event-bus';

export type CityRole = 'observer' | 'operator' | 'supervisor' | 'admin';

export type CityPolicyDecision = {
  allowed: boolean;
  reason: string;
};

const DOMAIN_ROLES: Record<CityDomain, CityRole> = {
  police: 'operator',
  fire: 'operator',
  traffic: 'operator',
  utilities: 'operator',
  publicWorks: 'operator',
  health: 'operator',
  civilProtection: 'operator',
  mobility: 'operator',
  energy: 'operator',
  water: 'operator',
  environment: 'operator',
};

const ROLE_RANK: Record<CityRole, number> = { observer: 1, operator: 2, supervisor: 3, admin: 4 };

export function roleRank(role: CityRole): number {
  return ROLE_RANK[role];
}

export function canAssignDomain(role: CityRole, domain: CityDomain): boolean {
  if (role === 'admin') return true;
  const required = DOMAIN_ROLES[domain];
  return roleRank(role) >= roleRank(required);
}

export function canCloseIncident(role: CityRole, incident: CityIncident): CityPolicyDecision {
  if (role === 'admin' || role === 'supervisor') return { allowed: true, reason: 'rol con autoridad de cierre' };
  if (role === 'operator' && severityRank(incident.severity) <= 2) {
    return { allowed: true, reason: 'operador autorizado para severidades bajas' };
  }
  return { allowed: false, reason: 'cierre de incidentes críticos requiere supervisor o admin' };
}

export function canEscalate(role: CityRole, targetSeverity: CitySeverity): CityPolicyDecision {
  const targetRank = severityRank(targetSeverity);
  if (targetRank >= 4 && roleRank(role) < roleRank('supervisor')) {
    return { allowed: false, reason: 'la escalación crítica requiere supervisor o admin' };
  }
  if (targetRank >= 3 && role === 'observer') {
    return { allowed: false, reason: 'los observadores no escalan incidentes' };
  }
  return { allowed: true, reason: 'escalación permitida' };
}

export function slaTargetMinutes(severity: CitySeverity): number {
  switch (severity) {
    case 'critical':
      return 5;
    case 'high':
      return 15;
    case 'medium':
      return 30;
    default:
      return 60;
  }
}

export function triageRule(incident: CityIncident): { queue: string; slaMinutes: number } {
  const rank = severityRank(incident.severity);
  if (rank >= 4) return { queue: 'emergency', slaMinutes: slaTargetMinutes('critical') };
  if (rank === 3) return { queue: 'urgent', slaMinutes: slaTargetMinutes('high') };
  if (incident.domain === 'water' || incident.domain === 'energy') return { queue: 'utilities', slaMinutes: slaTargetMinutes('medium') };
  return { queue: 'standard', slaMinutes: slaTargetMinutes(incident.severity) };
}
