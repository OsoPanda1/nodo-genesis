import { Activity, AlertTriangle, Cpu, HardHat, Radio, Timer } from 'lucide-react';
import type { CityIocState } from '@/lib/city/city-types';

export type CityIOCOverviewProps = {
  state: CityIocState;
};

const KPIS: Array<{ key: keyof CityIocState; label: string; icon: typeof Activity; formatter?: (value: number) => string }> = [
  { key: 'activeIncidents', label: 'Incidentes', icon: AlertTriangle },
  { key: 'criticalIncidents', label: 'Críticos', icon: Radio },
  { key: 'averageResponseMinutes', label: 'Respuesta (min)', icon: Timer, formatter: (v) => v.toFixed(1) },
  { key: 'openWorkOrders', label: 'Work orders', icon: HardHat },
  { key: 'energyLoadPercent', label: 'Carga energía', icon: Cpu, formatter: (v) => `${Math.round(v)}%` },
  { key: 'waterPressureAlerts', label: 'Alertas agua', icon: Activity },
];

export function CityIOCOverview({ state }: CityIOCOverviewProps) {
  const status = state.criticalIncidents > 0 ? 'critical' : state.energyLoadPercent > 85 ? 'warning' : 'healthy';
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-slate-700/60 bg-slate-900/70 p-2">
            <Cpu className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Ciudad IOC
            </h3>
            <p className="text-[10px] text-slate-500">
              Estado agregado · {new Date(state.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <span
          className={`rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-wider ${
            status === 'healthy'
              ? 'bg-emerald-500/10 text-emerald-400'
              : status === 'warning'
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-red-500/10 text-red-400'
          }`}
        >
          {status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {KPIS.map(({ key, label, icon: Icon, formatter }) => (
          <div key={key} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <Icon className="h-3 w-3" />
              {label}
            </div>
            <p className="mt-1 text-xl font-semibold text-slate-100">
              {formatter ? formatter(Number(state[key])) : Math.round(Number(state[key]))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
