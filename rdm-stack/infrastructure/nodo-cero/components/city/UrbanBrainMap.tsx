import { AlertTriangle, Crosshair, Radio } from 'lucide-react';
import type { CityIncident } from '@/lib/city/city-types';
import { severityRank } from '@/lib/city/city-event-bus';

export type UrbanBrainMapProps = {
  incidents: CityIncident[];
  activeEntityIds?: string[];
};

const MARKERS: Record<number, { className: string; label: string }> = {
  4: { className: 'border-red-400/70 bg-red-500/80 text-red-950', label: 'Crítico' },
  3: { className: 'border-amber-300/70 bg-amber-400/80 text-amber-950', label: 'Alto' },
  2: { className: 'border-sky-300/70 bg-sky-400/80 text-sky-950', label: 'Medio' },
  1: { className: 'border-slate-300/70 bg-slate-400/80 text-slate-950', label: 'Bajo' },
};

export function UrbanBrainMap({ incidents, activeEntityIds = [] }: UrbanBrainMapProps) {
  const hotspots = incidents.filter((i) => i.status !== 'closed' && i.status !== 'mitigated');
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        <Crosshair className="h-3.5 w-3.5 text-emerald-400" />
        Mapa del cerebro urbano
      </div>

      <div className="relative mt-3 aspect-square w-full rounded-lg border border-slate-800 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08),transparent_70%)] bg-slate-900/40">
        <div className="absolute inset-0 opacity-[0.15] [background-image:linear-gradient(rgba(100,116,139,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(100,116,139,0.2)_1px,transparent_1px)] [background-size:24px_24px]" />
        {hotspots.map((incident, index) => {
          const x = 18 + ((index * 37) % 60);
          const y = 16 + ((index * 53) % 64);
          const marker = MARKERS[severityRank(incident.severity)] ?? MARKERS[1];
          return (
            <div
              key={incident.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
              title={`${incident.id} · ${incident.title}`}
            >
              <div
                className={`flex h-5 w-5 animate-pulse items-center justify-center rounded-full border ${marker.className}`}
              >
                <AlertTriangle className="h-3 w-3" />
              </div>
              <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-950/90 px-1 py-px text-[8px] text-slate-300">
                {incident.id}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <Radio className="h-3 w-3 text-emerald-400" />
          {activeEntityIds.length} activos vinculados
        </span>
        <span className="inline-flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3 text-red-400" />
          {hotspots.length} hotspots activos
        </span>
      </div>
    </div>
  );
}
