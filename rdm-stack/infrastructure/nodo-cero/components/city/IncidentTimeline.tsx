import { AlertCircle, CheckCircle2, CircleDot, Loader2, MapPin, Timer } from 'lucide-react';
import type { CityIncident } from '@/lib/city/city-types';
import { severityRank } from '@/lib/city/city-event-bus';

export type IncidentTimelineProps = {
  incidents: CityIncident[];
};

const STATUS_STYLES: Record<CityIncident['status'], { label: string; className: string }> = {
  open: { label: 'Abierto', className: 'bg-slate-500/10 text-slate-400' },
  triaged: { label: 'Triage', className: 'bg-sky-500/10 text-sky-400' },
  assigned: { label: 'Asignado', className: 'bg-indigo-500/10 text-indigo-400' },
  mitigated: { label: 'Mitigado', className: 'bg-amber-500/10 text-amber-400' },
  closed: { label: 'Cerrado', className: 'bg-emerald-500/10 text-emerald-400' },
};

export function IncidentTimeline({ incidents }: IncidentTimelineProps) {
  return (
    <div className="space-y-2">
      {incidents.length === 0 && (
        <p className="py-6 text-center text-xs text-slate-500">Sin incidentes registrados.</p>
      )}
      {incidents.map((incident) => {
        const style = STATUS_STYLES[incident.status];
        const Icon = incident.status === 'closed' ? CheckCircle2 : incident.status === 'mitigated' ? Loader2 : incident.status === 'triaged' ? CircleDot : AlertCircle;
        return (
          <div
            key={incident.id}
            className={`flex items-start gap-3 rounded-xl border p-3 ${
              severityRank(incident.severity) >= 4
                ? 'border-red-900/50 bg-red-950/20'
                : 'border-slate-800 bg-slate-950/70'
            }`}
          >
            <Icon
              className={`mt-0.5 h-4 w-4 shrink-0 ${
                incident.status === 'closed'
                  ? 'text-emerald-400'
                  : incident.status === 'mitigated'
                    ? 'text-amber-400'
                    : incident.status === 'triaged'
                      ? 'text-sky-400'
                      : 'text-red-400'
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{incident.id}</span>
                <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] capitalize text-slate-400">{incident.domain}</span>
                <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] uppercase text-slate-400">{incident.severity}</span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${style.className}`}>{style.label}</span>
              </div>
              <p className="mt-1 truncate text-xs font-medium text-slate-200">{incident.title}</p>
              {incident.description && (
                <p className="mt-0.5 line-clamp-2 text-[10px] text-slate-500">{incident.description}</p>
              )}
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  {new Date(incident.createdAt).toLocaleTimeString()}
                </span>
                {incident.relatedEntityIds.length > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {incident.relatedEntityIds.length} activos
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
