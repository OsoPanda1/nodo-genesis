'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

type HealthStatus = 'up' | 'degraded' | 'down';

interface HealthCheck {
  name: string;
  status: HealthStatus;
  detail: string;
  checkedAt: number;
  latencyMs: number;
}

interface MonitorSnapshot {
  startedAt: number;
  uptimeMs: number;
  metrics: {
    counters: Array<{ tags: Record<string, string | number | boolean>; value: number }>;
    gauges: Array<{ tags: Record<string, string | number | boolean>; value: number }>;
    histograms: Array<{
      tags: Record<string, string | number | boolean>;
      count: number;
      sum: number;
      min: number;
      max: number;
    }>;
  };
  traces: { total: number; ok: number; error: number; degraded: number; avgMs: number };
  events: { info: number; warning: number; critical: number; total: number };
  alerts: Array<{
    name: string;
    severity: 'info' | 'warning' | 'critical';
    value: number;
    threshold: number;
    message: string;
  }>;
  recentEvents: Array<{ type: string; source: string; severity: string; at: number; id: string }>;
}

function fmtUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${d}d ${h}h ${m}m ${sec}s`;
}

function statusColor(status: HealthStatus): string {
  if (status === 'up') return '#10b981';
  if (status === 'degraded') return '#facc15';
  return '#b91c1c';
}

const severityColor: Record<string, string> = {
  info: '#38bdf8',
  warning: '#facc15',
  critical: '#b91c1c',
};

export function SystemMonitor() {
  const [snapshot, setSnapshot] = useState<MonitorSnapshot | null>(null);
  const [health, setHealth] = useState<{ overall: { status: HealthStatus; up: number; down: number; degraded: number }; checks: HealthCheck[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(true);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const load = useCallback(async () => {
    try {
      const [stateRes, healthRes] = await Promise.all([
        fetch('/api/monitor/state'),
        fetch('/api/monitor/health'),
      ]);
      if (!stateRes.ok) throw new Error(`state ${stateRes.status}`);
      if (!healthRes.ok) throw new Error(`health ${healthRes.status}`);
      setSnapshot((await stateRes.json()) as MonitorSnapshot);
      setHealth((await healthRes.json()) as typeof health);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al consultar el monitor');
    }
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    /* Carga inicial + polling del monitor: la primera lectura es
       intencional y el setState ocurre tras un await (nunca síncrono). */
    void load();
    if (polling) {
      pollRef.current = setInterval(() => void load(), 4000);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [load, polling]);

  const overallStatus = health?.overall.status ?? 'down';
  const overallColor = statusColor(overallStatus);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-patrimonial text-2xl font-bold text-[#f5f0e8]">
            Monitor General del Nodo
          </h1>
          <p className="text-sm text-slate-400">
            Observabilidad total · métricas, trazas, eventos correlacionados y alertas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={polling}
              onChange={e => setPolling(e.target.checked)}
              className="accent-[#c8a356]"
            />
            Auto-refresco 4s
          </label>
          <span
            className="rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider"
            style={{ borderColor: overallColor, color: overallColor }}
          >
            {overallStatus}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-[#b91c1c]/40 bg-[#b91c1c]/10 px-4 py-3 text-sm text-red-300">
          No se pudo leer el monitor: {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Uptime" value={snapshot ? fmtUptime(snapshot.uptimeMs) : '—'} />
        <MetricCard
          label="Latencia media"
          value={snapshot ? `${snapshot.traces.avgMs.toFixed(1)} ms` : '—'}
        />
        <MetricCard label="Trazas OK" value={snapshot ? String(snapshot.traces.ok) : '—'} />
        <MetricCard
          label="Alertas activas"
          value={snapshot ? String(snapshot.alerts.length) : '—'}
          accent={snapshot && snapshot.alerts.length > 0 ? '#facc15' : '#10b981'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="glass-panel rounded-2xl p-4">
          <h2 className="font-patrimonial mb-3 text-lg font-semibold text-[#d4b26a]">
            Salud por dominio
          </h2>
          <div className="space-y-2">
            {health?.checks.map(check => (
              <div
                key={check.name}
                className="flex items-center justify-between rounded-lg border border-amber-900/20 bg-black/30 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: statusColor(check.status) }}
                  />
                  <span className="text-sm font-medium text-slate-200">{check.name}</span>
                </div>
                <span className="text-xs text-slate-400">
                  {check.detail} · {check.latencyMs} ms
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-2xl p-4">
          <h2 className="font-patrimonial mb-3 text-lg font-semibold text-[#d4b26a]">
            Alertas activas
          </h2>
          {snapshot && snapshot.alerts.length === 0 ? (
            <p className="text-sm text-slate-400">Sin alertas activas. Todo en orden.</p>
          ) : (
            <div className="space-y-2">
              {snapshot?.alerts.map(alert => (
                <div
                  key={alert.name}
                  className="rounded-lg border px-3 py-2"
                  style={{ borderColor: severityColor[alert.severity], backgroundColor: `${severityColor[alert.severity]}14` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-200">{alert.name}</span>
                    <span className="text-xs uppercase" style={{ color: severityColor[alert.severity] }}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    valor={alert.value} · umbral={alert.threshold}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="glass-panel rounded-2xl p-4">
          <h2 className="font-patrimonial mb-3 text-lg font-semibold text-[#d4b26a]">
            Eventos recientes
          </h2>
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {snapshot?.recentEvents.map(evt => (
              <div key={evt.id} className="flex items-center justify-between rounded-lg border border-amber-900/20 bg-black/30 px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: severityColor[evt.severity] ?? '#9ca3af' }}
                  />
                  <span className="font-mono text-xs text-slate-300">{evt.type}</span>
                </div>
                <span className="text-xs text-slate-500">
                  {evt.source} · {new Date(evt.at).toLocaleTimeString('es-MX')}
                </span>
              </div>
            ))}
            {(!snapshot || snapshot.recentEvents.length === 0) && (
              <p className="text-sm text-slate-500">Sin eventos aún.</p>
            )}
          </div>
        </section>

        <section className="glass-panel rounded-2xl p-4">
          <h2 className="font-patrimonial mb-3 text-lg font-semibold text-[#d4b26a]">
            Métricas destacadas
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {snapshot?.metrics.gauges.map((g, i) => (
              <div key={i} className="rounded-lg border border-amber-900/20 bg-black/30 px-3 py-2">
                <span className="block text-xs text-slate-400">
                  {Object.values(g.tags).join(' · ') || 'gauge'}
                </span>
                <span className="font-mono text-lg font-semibold text-[#d4b26a]">{g.value}</span>
              </div>
            ))}
            {snapshot?.metrics.counters.slice(0, 6).map((c, i) => (
              <div key={`c-${i}`} className="rounded-lg border border-amber-900/20 bg-black/30 px-3 py-2">
                <span className="block text-xs text-slate-400">
                  {Object.values(c.tags).join(' · ') || 'counter'}
                </span>
                <span className="font-mono text-lg font-semibold text-[#d4b26a]">{c.value}</span>
              </div>
            ))}
            {snapshot && snapshot.metrics.counters.length === 0 && snapshot.metrics.gauges.length === 0 && (
              <p className="col-span-2 text-sm text-slate-500">Sin métricas registradas todavía.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ label, value, accent = '#d4b26a' }: { label: string; value: string; accent?: string }) {
  return (
    <div className="glass-panel rounded-2xl px-4 py-3">
      <span className="text-xs uppercase tracking-wider text-slate-400">{label}</span>
      <span className="mt-1 block font-mono text-xl font-semibold" style={{ color: accent }}>
        {value}
      </span>
    </div>
  );
}
