import { Lock, Siren, Timer } from 'lucide-react';
import type { CityIncident } from '@/lib/city/city-types';
import { buildEscalation, emergencySummary, isEmergencyIncident } from '@/lib/city/city-emergency-engine';
import { getResponsePlaybook, playbookAutomationLevel, playbookTotalEta } from '@/lib/city/city-response-playbooks';

export type EmergencyCommandPanelProps = {
  incidents: CityIncident[];
};

const AUTOMATION_LABELS = {
  automated: 'Automático',
  'semi-automated': 'Semiautomático',
  manual: 'Manual',
} as const;

export function EmergencyCommandPanel({ incidents }: EmergencyCommandPanelProps) {
  const summary = emergencySummary(incidents);
  const emergencies = incidents.filter(isEmergencyIncident);
  const closed = incidents.filter((i) => i.status === 'closed').length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        <Siren className="h-3.5 w-3.5 text-red-400" />
        Comando de emergencias
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-center">
          <p className="text-xl font-semibold text-red-400">{summary.emergencyCount}</p>
          <p className="text-[10px] text-slate-500">Emergencias</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-center">
          <p className="text-xl font-semibold text-amber-400">{incidents.length}</p>
          <p className="text-[10px] text-slate-500">Total</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-center">
          <p className="text-xl font-semibold text-emerald-400">{closed}</p>
          <p className="text-[10px] text-slate-500">Cerrados</p>
        </div>
      </div>

      {summary.lockdown && (
        <div className="flex items-center gap-2 rounded-xl border border-red-900/50 bg-red-950/20 p-2.5 text-[10px] font-medium uppercase tracking-wider text-red-400">
          <Lock className="h-3.5 w-3.5" />
          Protocolo de confinamiento activo
        </div>
      )}

      {emergencies.length === 0 ? (
        <p className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-center text-xs text-slate-500">
          Sin emergencias activas.
        </p>
      ) : (
        <div className="space-y-2">
          {emergencies.map((incident) => {
            const escalation = buildEscalation(incident);
            const playbook = getResponsePlaybook(incident);
            return (
              <div key={incident.id} className="rounded-xl border border-red-900/50 bg-red-950/20 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{incident.id}</span>
                  <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase text-red-400">
                    Nivel {escalation.escalationLevel}
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium text-slate-200">{incident.title}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Timer className="h-3 w-3" />EAT {playbookTotalEta(playbook)} min
                  </span>
                  <span>{AUTOMATION_LABELS[playbookAutomationLevel(playbook)]}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
