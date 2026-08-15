import { HeartPulse, Wrench, Zap } from 'lucide-react';
import type { InfrastructureDimension, InfrastructureHealth } from '@/lib/city/city-infrastructure-engine';

export type InfrastructureHealthGridProps = {
  health: InfrastructureHealth;
};

const DIMENSIONS: Array<{ key: InfrastructureDimension; label: string; icon: typeof Zap }> = [
  { key: 'energy', label: 'Energía', icon: Zap },
  { key: 'water', label: 'Agua', icon: HeartPulse },
  { key: 'transport', label: 'Transporte', icon: HeartPulse },
  { key: 'communications', label: 'Comunicaciones', icon: HeartPulse },
  { key: 'publicWorks', label: 'Obras públicas', icon: Wrench },
];

function DimensionBar({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Zap }) {
  const color = value >= 80 ? 'text-emerald-400' : value >= 55 ? 'text-amber-400' : 'text-red-400';
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
      <div className="flex items-center justify-between text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <Icon className="h-3 w-3" />
          {label}
        </span>
        <span className={`font-medium ${color}`}>{Math.round(value)}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${
            value >= 80 ? 'bg-emerald-400' : value >= 55 ? 'bg-amber-400' : 'bg-red-400'
          }`}
          style={{ width: `${Math.round(value)}%` }}
        />
      </div>
    </div>
  );
}

export function InfrastructureHealthGrid({ health }: InfrastructureHealthGridProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          <HeartPulse className="h-3.5 w-3.5 text-emerald-400" />
          Salud de infraestructura
        </div>
        <span className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium uppercase text-slate-200">
          {health.status} · {Math.round(health.overall)}%
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {DIMENSIONS.map(({ key, label, icon }) => (
          <DimensionBar key={key} label={label} value={health.dimensions[key].score} icon={icon} />
        ))}
      </div>
    </div>
  );
}
