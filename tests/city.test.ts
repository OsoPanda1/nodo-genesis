import { describe, it, expect } from 'vitest';
import { buildCityScorecard } from '@/lib/city/city-scorecard';
import { buildCityIocState } from '@/lib/city/city-ioc-state';
import { seedIncidents } from '@/lib/city/city-event-bus';
import { rankIncidents, autoTriageIncident } from '@/lib/city/city-incident-engine';
import { escalationLevelForSeverity, isEmergencyIncident, emergencySummary } from '@/lib/city/city-emergency-engine';
import { canCloseIncident, canEscalate, slaTargetMinutes, triageRule } from '@/lib/city/city-policy';

describe('city-scorecard · índice global de ciudad', () => {
  it('calcula overall dentro de 0-100 y asigna calificación', () => {
    const incidents = seedIncidents();
    const scorecard = buildCityScorecard({ incidents, iocState: buildCityIocState(incidents) });
    expect(scorecard.overall).toBeGreaterThanOrEqual(0);
    expect(scorecard.overall).toBeLessThanOrEqual(100);
    expect(['A', 'B', 'C', 'D', 'F']).toContain(scorecard.grade);
    expect(scorecard.dimensions.length).toBeGreaterThanOrEqual(5);
  });

  it('sin incidentes la ciudad queda cerca del máximo', () => {
    const scorecard = buildCityScorecard({ incidents: [], iocState: buildCityIocState([]) });
    expect(scorecard.overall).toBeGreaterThanOrEqual(80);
  });
});

describe('city-incident-engine · ranking y triage', () => {
  it('ordena por severidad desc y fecha desc', () => {
    const ranked = rankIncidents(seedIncidents());
    expect(ranked[0].id).toBe('inc-002');
    expect(ranked[0].severity).toBe('critical');
  });

  it('autoTriage asigna estado según severidad', () => {
    const critical = { severity: 'critical' as const };
    const high = { severity: 'high' as const };
    const low = { severity: 'low' as const };
    const base = {
      id: 'x',
      domain: 'traffic' as const,
      title: 't',
      description: '',
      status: 'open' as const,
      source: 'sensor' as const,
      tags: [],
      relatedEntityIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(autoTriageIncident({ ...base, ...critical }).status).toBe('assigned');
    expect(autoTriageIncident({ ...base, ...high }).status).toBe('triaged');
    expect(autoTriageIncident({ ...base, ...low }).status).toBe('open');
  });
});

describe('city-emergency-engine · escalación', () => {
  it('mapea severidad a nivel de escalación', () => {
    expect(escalationLevelForSeverity('critical')).toBe(4);
    expect(escalationLevelForSeverity('low')).toBe(1);
  });

  it('emergencias incluyen civilProtection y severidad alta', () => {
    const incidents = seedIncidents();
    expect(incidents.some(isEmergencyIncident)).toBe(true);
    const summary = emergencySummary(incidents);
    expect(summary.emergencyCount).toBeGreaterThanOrEqual(1);
  });
});

describe('city-policy · control de acceso por rol', () => {
  it('cierre de críticos requiere supervisor/admin', () => {
    const incident = seedIncidents().find((i) => i.severity === 'critical');
    expect(incident).toBeDefined();
    expect(canCloseIncident('operator', incident!).allowed).toBe(false);
    expect(canCloseIncident('supervisor', incident!).allowed).toBe(true);
  });

  it('escalación a crítico exige supervisor o admin', () => {
    expect(canEscalate('operator', 'critical').allowed).toBe(false);
    expect(canEscalate('admin', 'critical').allowed).toBe(true);
  });

  it('SLA más corto cuanto más crítica la severidad', () => {
    expect(slaTargetMinutes('critical')).toBeLessThan(slaTargetMinutes('high'));
    expect(slaTargetMinutes('medium')).toBeLessThan(slaTargetMinutes('low'));
  });

  it('triage enruta críticos a la cola de emergencia', () => {
    const incident = seedIncidents().find((i) => i.severity === 'critical')!;
    expect(triageRule(incident).queue).toBe('emergency');
  });
});
