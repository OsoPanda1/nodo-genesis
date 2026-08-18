import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { getIncident, listIncidents } from '@/lib/city/city-event-bus';
import { buildEscalation, emergencySummary, isEmergencyIncident } from '@/lib/city/city-emergency-engine';
import { getResponsePlaybook, playbookTotalEta, playbookAutomationLevel } from '@/lib/city/city-response-playbooks';

/* Ruta migrada al route-guard único (antes duplicaba enforceTrust
   con assertServerOnly + verifyOrigin + rateLimit). */

export const GET = guardedRoute(
  {
    route: 'api:city:response',
    methods: ['GET'],
    rateLimit: 50,
    json: false,
  },
  async ({ req }) => {
    const incidentId = req.nextUrl.searchParams.get('incidentId');
    if (incidentId) {
      const incident = getIncident(incidentId);
      if (!incident) return NextResponse.json({ ok: false, error: 'Incidente no encontrado.' }, { status: 404 });
      const playbook = getResponsePlaybook(incident);
      return NextResponse.json({
        ok: true,
        incident,
        playbook,
        totalEtaMinutes: playbookTotalEta(playbook),
        automation: playbookAutomationLevel(playbook),
        escalation: buildEscalation(incident),
      });
    }

    const incidents = listIncidents();
    return NextResponse.json({
      ok: true,
      summary: emergencySummary(incidents),
      emergencyIncidents: incidents.filter(isEmergencyIncident).map((i) => ({
        id: i.id,
        domain: i.domain,
        title: i.title,
        severity: i.severity,
        escalation: buildEscalation(i),
      })),
    });
  },
);
