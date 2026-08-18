import { Car, Gauge, TriangleAlert } from 'lucide-react';
import type { MobilityState } from '@/lib/city/city-mobility-engine';

export type MobilityControlPanelProps = {
  mobility: MobilityState;
};

function SegmentStatus({ utilization }: { utilization: number }) {
  const status = utilization >= 90 ? 'congested' : utilization >= 75 ? 'dense' : 'fluid';
  const className =
    status === 'congested'
      ? 'bg-red-500/10 text-red-400'
      : status === 'dense'
        ? 'bg-amber-500/10 text-amber-400'
        : 'bg-emerald-500/10 text-emerald-400';
  return <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium uppercase ${className}`}>{status}</span>;
}

export function MobilityControlPanel({ mobility }: MobilityControlPanelProps) {
  const level =
    mobility.congestionIndex < 0.35 ? 'Fluido' : mobility.congestionIndex < 0.6 ? 'Moderado' : 'Congestionado';
  const levelColor =
    mobility.congestionIndex < 0.35
      ? 'text-emerald-400'
      : mobility.congestionIndex < 0.6
        ? 'text-amber-400'
        : 'text-red-400';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          <Gauge className="h-3.5 w-3.5 text-amber-400" />
          Panel de movilidad
        </div>
        <span className={`text-[10px] font-medium uppercase ${levelColor}`}>{level}</span>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Gauge className="h-3 w-3" />
            Índice de congestión
          </span>
          <span className="font-medium text-slate-200">{Math.round(mobility.congestionIndex * 100)}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-400"
            style={{ width: `${Math.round(mobility.congestionIndex * 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-center">
          <p className="text-lg font-semibold text-slate-100">{mobility.segments.length}</p>
          <p className="text-[10px] text-slate-500">Tramos</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-center">
          <p className="text-lg font-semibold text-amber-400">{mobility.alerts.length}</p>
          <p className="text-[10px] text-slate-500">Alertas</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-center">
          <p className="text-lg font-semibold text-emerald-400">
            {mobility.segments.filter((s) => s.utilizationPercent < 75).length}
          </p>
          <p className="text-[10px] text-slate-500">Fluidos</p>
        </div>
      </div>

      <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
        {mobility.segments.map((segment) => (
          <div key={segment.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-2.5 py-1.5">
            <div className="flex items-center gap-2">
              <Car className="h-3 w-3 text-slate-500" />
              <div>
                <p className="text-[10px] font-medium text-slate-300">{segment.name}</p>
                <p className="text-[9px] text-slate-500">
                  {segment.utilizationPercent}% · {segment.avgSpeedKmh} km/h
                </p>
              </div>
            </div>
            <SegmentStatus utilization={segment.utilizationPercent} />
          </div>
        ))}
      </div>

      {mobility.alerts.some((a) => a.level === 'critical') && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-900/50 bg-amber-950/20 p-2.5 text-[10px] font-medium text-amber-400">
          <TriangleAlert className="h-3.5 w-3.5" />
          Congestión crítica en uno o más tramos
        </div>
      )}
    </div>
  );
}
