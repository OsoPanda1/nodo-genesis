import type { CityDomain, CityIncident } from './city-types';

export type AutomationLevel = 'manual' | 'semi-automated' | 'automated';

export type ResponseAction = {
  id: string;
  name: string;
  owner: string;
  etaMinutes: number;
  automationLevel: AutomationLevel;
};

export function getResponsePlaybook(incident: CityIncident): ResponseAction[] {
  switch (incident.domain) {
    case 'civilProtection':
      return [
        { id: 'pc-1', name: 'Abrir centro de comando', owner: 'Protección Civil', etaMinutes: 5, automationLevel: 'automated' },
        { id: 'pc-2', name: 'Emitir alerta ciudadana', owner: 'Canal municipal', etaMinutes: 2, automationLevel: 'automated' },
        { id: 'pc-3', name: 'Asignar brigada de campo', owner: 'Operaciones', etaMinutes: 10, automationLevel: 'semi-automated' },
      ];
    case 'traffic':
      return [
        { id: 'tra-1', name: 'Recalcular semáforos', owner: 'Movilidad', etaMinutes: 1, automationLevel: 'automated' },
        { id: 'tra-2', name: 'Desviar flujos vehiculares', owner: 'Centro IOC', etaMinutes: 3, automationLevel: 'automated' },
        { id: 'tra-3', name: 'Notificar a la policía vial', owner: 'Policía', etaMinutes: 6, automationLevel: 'semi-automated' },
      ];
    case 'fire':
      return [
        { id: 'fir-1', name: 'Despachar unidad de bomberos', owner: 'Bomberos', etaMinutes: 7, automationLevel: 'semi-automated' },
        { id: 'fir-2', name: 'Cortar suministro de energía', owner: 'Energía', etaMinutes: 4, automationLevel: 'automated' },
      ];
    case 'police':
      return [
        { id: 'pol-1', name: 'Despachar patrulla', owner: 'Policía', etaMinutes: 8, automationLevel: 'semi-automated' },
        { id: 'pol-2', name: 'Abrir expediente', owner: 'IOC', etaMinutes: 12, automationLevel: 'manual' },
      ];
    case 'energy':
      return [
        { id: 'ene-1', name: 'Rebalancear cargas', owner: 'Energía', etaMinutes: 3, automationLevel: 'automated' },
        { id: 'ene-2', name: 'Revisar subestación', owner: 'Operaciones', etaMinutes: 15, automationLevel: 'semi-automated' },
      ];
    case 'water':
      return [
        { id: 'wat-1', name: 'Cerrar válvula de sector', owner: 'Agua', etaMinutes: 2, automationLevel: 'automated' },
        { id: 'wat-2', name: 'Enviar cuadrilla hidráulica', owner: 'Operaciones', etaMinutes: 20, automationLevel: 'semi-automated' },
      ];
    case 'health':
      return [
        { id: 'hea-1', name: 'Activar protocolo médico', owner: 'Salud', etaMinutes: 5, automationLevel: 'semi-automated' },
        { id: 'hea-2', name: 'Movilizar ambulancia', owner: 'Salud', etaMinutes: 9, automationLevel: 'semi-automated' },
      ];
    default:
      return [
        { id: 'gen-1', name: 'Clasificar incidente', owner: 'IOC', etaMinutes: 2, automationLevel: 'automated' },
        { id: 'gen-2', name: 'Asignar responsable', owner: 'IOC', etaMinutes: 8, automationLevel: 'semi-automated' },
      ];
  }
}

export function playbookTotalEta(actions: ResponseAction[]): number {
  return actions.reduce((sum, action) => sum + action.etaMinutes, 0);
}

export function playbookAutomationLevel(actions: ResponseAction[]): AutomationLevel {
  if (actions.every((a) => a.automationLevel === 'automated')) return 'automated';
  if (actions.some((a) => a.automationLevel === 'automated')) return 'semi-automated';
  return 'manual';
}

export function playbookByDomain(domain: CityDomain): ResponseAction[] {
  const fallback: CityIncident = {
    id: 'template',
    domain,
    title: domain,
    description: '',
    severity: 'medium',
    status: 'open',
    source: 'ai',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
    relatedEntityIds: [],
  };
  return getResponsePlaybook(fallback);
}
