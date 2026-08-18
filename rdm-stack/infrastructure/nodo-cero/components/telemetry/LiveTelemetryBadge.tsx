'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Radio,
  RefreshCw,
  WifiOff,
} from 'lucide-react';

type TelemetryStatus = 'online' | 'degraded' | 'offline' | 'planned';

type TelemetrySnapshot = {
  status: TelemetryStatus;
  online: number;
  total: number;
  latencyMs: number | null;
  source: 'demo' | 'live';
  updatedAt: Date;
};

const REFRESH_INTERVAL_MS = 30_000;

const DEMO_SNAPSHOT: Omit<TelemetrySnapshot, 'updatedAt'> = {
  status: 'planned',
  online: 0,
  total: 0,
  latencyMs: null,
  source: 'demo',
};

const STATUS_UI: Record<
  TelemetryStatus,
  {
    label: string;
    description: string;
    dotClass: string;
    pulseClass: string;
    textClass: string;
    borderClass: string;
    backgroundClass: string;
    Icon: typeof Activity;
  }
> = {
  online: {
    label: 'En línea',
    description: 'Federación operativa con señal validada.',
    dotClass: 'bg-emerald-400',
    pulseClass: 'bg-emerald-400/50',
    textClass: 'text-emerald-300',
    borderClass: 'border-emerald-400/25',
    backgroundClass: 'bg-emerald-400/[0.07]',
    Icon: CheckCircle2,
  },
  degraded: {
    label: 'Degradado',
    description: 'Servicio disponible con latencia o señal parcial.',
    dotClass: 'bg-amber-400',
    pulseClass: 'bg-amber-400/50',
    textClass: 'text-amber-300',
    borderClass: 'border-amber-400/25',
    backgroundClass: 'bg-amber-400/[0.07]',
    Icon: AlertTriangle,
  },
  offline: {
    label: 'Sin conexión',
    description: 'No hay una señal verificable disponible.',
    dotClass: 'bg-rose-400',
    pulseClass: 'bg-rose-400/50',
    textClass: 'text-rose-300',
    borderClass: 'border-rose-400/25',
    backgroundClass: 'bg-rose-400/[0.07]',
    Icon: WifiOff,
  },
  planned: {
    label: 'Etapa 2',
    description: 'Telemetría contemplada; integración aún no implementada.',
    dotClass: 'bg-slate-400',
    pulseClass: 'bg-slate-400/40',
    textClass: 'text-slate-300',
    borderClass: 'border-slate-400/25',
    backgroundClass: 'bg-slate-400/[0.06]',
    Icon: Radio,
  },
};

function formatClock(date: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

function createDemoSnapshot(): TelemetrySnapshot {
  return {
    ...DEMO_SNAPSHOT,
    updatedAt: new Date(),
  };
}

export default function LiveTelemetryBadge() {
  const [snapshot, setSnapshot] = useState<TelemetrySnapshot>(
    createDemoSnapshot,
  );
  const [time, setTime] = useState(() => new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const clockTimer = window.setInterval(() => {
      setTime(new Date());
    }, 1_000);

    return () => window.clearInterval(clockTimer);
  }, []);

  const refresh = () => {
    setIsRefreshing(true);

    window.setTimeout(() => {
      setSnapshot(createDemoSnapshot());
      setIsRefreshing(false);
    }, 350);
  };

  useEffect(() => {
    const refreshTimer = window.setInterval(refresh, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(refreshTimer);
  }, []);

  const ui = STATUS_UI[snapshot.status];
  const StatusIcon = ui.Icon;

  const tooltip = useMemo(() => {
    const availability =
      snapshot.total > 0
        ? `${snapshot.online}/${snapshot.total} federaciones operativas`
        : 'Sin fuentes operativas conectadas';

    const latency =
      snapshot.latencyMs !== null
        ? `${Math.round(snapshot.latencyMs)} ms de latencia promedio`
        : 'Latencia no disponible';

    return [
      `RDM·OS · ${ui.label}`,
      ui.description,
      availability,
      latency,
      `Vista actualizada: ${formatClock(snapshot.updatedAt)}`,
    ].join(' · ');
  }, [snapshot, ui.description, ui.label]);

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-label={tooltip}
      title={tooltip}
      className={`fixed bottom-4 left-4 z-40 hidden max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] shadow-2xl backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-cyan-950/30 md:flex ${ui.borderClass} ${ui.backgroundClass}`}
    >
      <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
        {snapshot.status === 'online' && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${ui.pulseClass}`}
          />
        )}
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${ui.dotClass}`}
        />
      </span>

      <span className="flex items-center gap-1.5 whitespace-nowrap text-slate-100">
        <Activity className="h-3 w-3 text-cyan-300" />
        RDM·OS
      </span>

      <span className="text-slate-500">·</span>

      <span className={`flex items-center gap-1 whitespace-nowrap ${ui.textClass}`}>
        <StatusIcon className="h-3 w-3" />
        {ui.label}
      </span>

      <span className="text-slate-500">·</span>

      <span className="flex items-center gap-1 whitespace-nowrap text-slate-400">
        <Clock3 className="h-3 w-3" />
        <time dateTime={time.toISOString()}>{formatClock(time)}</time>
      </span>

      <span className="text-slate-500">·</span>

      <span className="rounded-md border border-slate-500/25 bg-slate-950/35 px-1.5 py-0.5 text-[9px] text-slate-300">
        DEMO
      </span>

      <button
        type="button"
        onClick={refresh}
        aria-label="Actualizar estado de telemetría"
        title="Actualizar vista"
        className="ml-0.5 rounded-md p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
      >
        <RefreshCw
          className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`}
        />
      </button>
    </aside>
  );
}
