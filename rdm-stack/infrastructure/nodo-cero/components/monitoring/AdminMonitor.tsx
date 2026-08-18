'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ShieldCheck, Activity, GitBranch, Lock } from 'lucide-react';

interface SloReport {
  name: string;
  target: number;
  availability: number;
  consumedPercent: number;
  burnRate: number;
  remainingMs: number;
  status: 'healthy' | 'at-risk' | 'exhausted';
  total: number;
  errors: number;
}

interface RouteRed {
  route: string;
  requests: number;
  errors: number;
  errorRate: number;
  requestsPerMinute: number;
  p50Ms: number | null;
  p95Ms: number | null;
  p99Ms: number | null;
}

interface GraphSummary {
  total: number;
  observed: number;
  correlated: number;
  suspected: number;
  confirmed: number;
  transactions: number;
}

interface GuardianStatus {
  emergencyLevel: number;
  autonomy: string;
  policies: number;
  decisionsCached: number;
  escalationsPending: number;
}

interface AdminStatus {
  ok: boolean;
  slos: SloReport[];
  red: RouteRed[];
  graph: GraphSummary;
  guardian: GuardianStatus;
  auditTail: Array<{ at: string; action: string; decisionId: string; effect: string; reason: string }>;
}

const sloColor: Record<string, string> = { healthy: '#10b981', 'at-risk': '#facc15', exhausted: '#b91c1c' };

function fmtMs(ms: number | null): string {
  return ms === null ? '—' : `${ms.toFixed(1)} ms`;
}

export function AdminMonitor() {
  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/observability/status', { cache: 'no-store' });
      if (!res.ok) throw new Error(`observability ${res.status}`);
      setStatus((await res.json()) as AdminStatus);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al leer el fabric cognitivo');
    }
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    void load();
    pollRef.current = setInterval(() => void load(), 5000);
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-patrimonial text-2xl font-bold text-[#f5f0e8]">
            Monitor de Administración
          </h1>
          <p className="text-sm text-slate-400">
            Fabric cognitivo YUN · SLO, métricas RED, grafo causal y Guardian Kernel
          </p>
        </div>
        <span className="rounded-full border border-cyan-500/40 bg-cyan-950/50 px-3 py-1 font-mono text-xs text-cyan-300">
          auto-refresco 5s
        </span>
      </div>

      {error && (
        <div className="rounded-xl border border-[#b91c1c]/40 bg-[#b91c1c]/10 px-4 py-3 text-sm text-red-300">
          No se pudo leer el fabric: {error}
        </div>
      )}

      {/* SLO / presupuestos de error */}
      <section className="glass-panel rounded-2xl p-4">
        <h2 className="font-patrimonial mb-3 flex items-center gap-2 text-lg font-semibold text-[#d4b26a]">
          <Activity className="h-5 w-5 text-cyan-400" />
          SLO · presupuestos de error
        </h2>
        {!status || status.slos.length === 0 ? (
          <p className="text-sm text-slate-500">Sin SLO registrados todavía.</p>
        ) : (
          <div className="space-y-3">
            {status.slos.map(slo => (
              <div key={slo.name} className="rounded-lg border border-amber-900/20 bg-black/30 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-200">{slo.name}</span>
                  <span
                    className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase"
                    style={{ color: sloColor[slo.status], borderColor: sloColor[slo.status] }}
                  >
                    {slo.status}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(slo.consumedPercent * 100, 100)}%`, background: sloColor[slo.status] }}
                  />
                </div>
                <div className="mt-1.5 flex flex-wrap justify-between gap-2 font-mono text-[11px] text-slate-400">
                  <span>Disponibilidad {Math.round(slo.availability * 10000) / 100}% (meta {slo.target * 100}%)</span>
                  <span>Consumo {(slo.consumedPercent * 100).toFixed(1)}% · burn {slo.burnRate.toFixed(2)}</span>
                  <span>Presupuesto restante {Math.round(slo.remainingMs / 60000)} min</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Métricas RED por ruta */}
      <section className="glass-panel rounded-2xl p-4">
        <h2 className="font-patrimonial mb-3 flex items-center gap-2 text-lg font-semibold text-[#d4b26a]">
          <GitBranch className="h-5 w-5 text-emerald-400" />
          Métricas RED por ruta
        </h2>
        {!status || status.red.length === 0 ? (
          <p className="text-sm text-slate-500">Sin tráfico registrado todavía.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-2 py-1">Ruta</th>
                  <th className="px-2 py-1">Peticiones</th>
                  <th className="px-2 py-1">r/m</th>
                  <th className="px-2 py-1">Error</th>
                  <th className="px-2 py-1">p50</th>
                  <th className="px-2 py-1">p95</th>
                  <th className="px-2 py-1">p99</th>
                </tr>
              </thead>
              <tbody>
                {status.red.map(route => (
                  <tr key={route.route} className="border-t border-white/5 font-mono text-slate-300">
                    <td className="px-2 py-1.5 text-slate-200">{route.route}</td>
                    <td className="px-2 py-1.5">{route.requests}</td>
                    <td className="px-2 py-1.5">{route.requestsPerMinute.toFixed(1)}</td>
                    <td className="px-2 py-1.5" style={{ color: route.errorRate > 0.01 ? '#b91c1c' : '#10b981' }}>
                      {(route.errorRate * 100).toFixed(2)}%
                    </td>
                    <td className="px-2 py-1.5">{fmtMs(route.p50Ms)}</td>
                    <td className="px-2 py-1.5">{fmtMs(route.p95Ms)}</td>
                    <td className="px-2 py-1.5">{fmtMs(route.p99Ms)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Grafo causal */}
        <section className="glass-panel rounded-2xl p-4">
          <h2 className="font-patrimonial mb-3 flex items-center gap-2 text-lg font-semibold text-[#d4b26a]">
            <Activity className="h-5 w-5 text-purple-400" />
            Grafo causal de eventos
          </h2>
          {!status ? (
            <p className="text-sm text-slate-500">Cargando…</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <MiniStat label="Nodos" value={status.graph.total} />
              <MiniStat label="Transacciones" value={status.graph.transactions} />
              <MiniStat label="Observados" value={status.graph.observed} color="#9ca3af" />
              <MiniStat label="Correlacionados" value={status.graph.correlated} color="#38bdf8" />
              <MiniStat label="Sospechosos" value={status.graph.suspected} color="#facc15" />
              <MiniStat label="Confirmados" value={status.graph.confirmed} color="#10b981" />
            </div>
          )}
        </section>

        {/* Guardian Kernel */}
        <section className="glass-panel rounded-2xl p-4">
          <h2 className="font-patrimonial mb-3 flex items-center gap-2 text-lg font-semibold text-[#d4b26a]">
            <ShieldCheck className="h-5 w-5 text-amber-400" />
            Guardian Kernel
          </h2>
          {!status ? (
            <p className="text-sm text-slate-500">Cargando…</p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-amber-900/20 bg-black/30 px-3 py-2">
                <span className="text-xs text-slate-300">Nivel de emergencia</span>
                <span className="font-mono text-sm font-semibold text-[#d4b26a]">{status.guardian.emergencyLevel}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-amber-900/20 bg-black/30 px-3 py-2">
                <span className="text-xs text-slate-300">Autonomía</span>
                <span className="font-mono text-sm font-semibold text-[#d4b26a]">{status.guardian.autonomy}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-amber-900/20 bg-black/30 px-3 py-2">
                <span className="text-xs text-slate-300">Políticas · decisiones</span>
                <span className="font-mono text-sm font-semibold text-[#d4b26a]">
                  {status.guardian.policies} · {status.guardian.decisionsCached}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-amber-900/20 bg-black/30 px-3 py-2">
                <span className="text-xs text-slate-300">Escalaciones pendientes</span>
                <span className="font-mono text-sm font-semibold" style={{ color: status.guardian.escalationsPending > 0 ? '#facc15' : '#10b981' }}>
                  {status.guardian.escalationsPending}
                </span>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Cola de auditoría */}
      <section className="glass-panel rounded-2xl p-4">
        <h2 className="font-patrimonial mb-3 flex items-center gap-2 text-lg font-semibold text-[#d4b26a]">
          <Lock className="h-5 w-5 text-rose-400" />
          Auditoría del Guardian (10 últimos)
        </h2>
        {!status || status.auditTail.length === 0 ? (
          <p className="text-sm text-slate-500">Sin decisiones auditadas todavía.</p>
        ) : (
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {status.auditTail.map(entry => (
              <div key={entry.decisionId} className="flex items-center justify-between rounded-lg border border-amber-900/20 bg-black/30 px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-xs ${entry.effect === 'allow' ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {entry.effect.toUpperCase()}
                  </span>
                  <span className="font-mono text-xs text-slate-300">{entry.action}</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {new Date(entry.at).toLocaleTimeString('es-MX')} · {entry.reason.slice(0, 40)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MiniStat({ label, value, color = '#d4b26a' }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-lg border border-amber-900/20 bg-black/30 px-3 py-2">
      <span className="block text-[10px] uppercase tracking-wider text-slate-400">{label}</span>
      <span className="font-mono text-xl font-semibold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
