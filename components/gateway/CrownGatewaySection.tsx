"use client";

import React, { useCallback, useEffect, useState } from 'react';
import {
  Activity, AlertTriangle, ArrowRight, Boxes, CheckCircle2, Cpu,
  Fingerprint, Gauge, Globe, HeartPulse, KeyRound, Lock, Network,
  Radar, Radio, RefreshCw, Siren, ShieldCheck, Split, XCircle,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Tipos reflejados de la ISA API (crown-gateway.ts / emergency.ts)    */
/* ------------------------------------------------------------------ */
type TrustZone = 'green' | 'amber' | 'red';
type CircuitState = 'closed' | 'open' | 'half-open';

interface ProviderStatus {
  id: string;
  name: string;
  model: string;
  configured: boolean;
  healthy: boolean;
  circuit: CircuitState;
  latencyMs: number;
  lastError: string | null;
  egress: 'allowed' | 'restricted' | 'blocked';
  free: boolean;
  badge: string;
}

interface RoutingRule {
  domain: string;
  trustZone: TrustZone;
  chain: string[];
  rationale: string;
}

interface GatewayStatus {
  ok: boolean;
  name: string;
  version: string;
  node: string;
  mode: string;
  providers: ProviderStatus[];
  routing: RoutingRule[];
  security: {
    outputReGuard: boolean;
    circuitBreaker: boolean;
    zeroEgressDomains: string[];
    secretsNeverExposed: boolean;
    keysLoaded: number;
    providersConfigured: string[];
    trustZones: Record<string, string>;
  };
}

interface EmergencyStatus {
  mode: 'armed' | 'disarmed';
  trigger: string | null;
  reason: string | null;
  activatedAt: string | null;
  deactivatedAt: string | null;
  heartbeat: {
    lastHeartbeatAt: number;
    ageMs: number;
    ttlMs: number;
    deadManSwitchActive: boolean;
  };
  plans: Array<{ id: string; name: string; description: string; actions: string[]; severity: string }>;
  hardening: { zeroEgressInLockdown: boolean; requiresOperatorKey: boolean };
}

/* ------------------------------------------------------------------ */
/* Helpers de estilo                                                   */
/* ------------------------------------------------------------------ */
const zoneStyles: Record<TrustZone, { dot: string; text: string; chip: string; label: string }> = {
  green: { dot: 'bg-emerald-400', text: 'text-emerald-400', chip: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400', label: 'ZONA VERDE' },
  amber: { dot: 'bg-amber-400', text: 'text-amber-400', chip: 'bg-amber-950/60 border-amber-500/40 text-amber-400', label: 'ZONA ÁMBAR' },
  red: { dot: 'bg-rose-400', text: 'text-rose-400', chip: 'bg-rose-950/60 border-rose-500/40 text-rose-400', label: 'ZONA ROJA' },
};

const PIPELINE = [
  { icon: ShieldCheck, name: 'Prompt Guard', sub: '9 categorías · block crítico' },
  { icon: Split, name: 'Intention Parser', sub: '8 dominios canónicos' },
  { icon: Network, name: 'CROWN Router', sub: 'política por dominio' },
  { icon: Boxes, name: 'Flota federada', sub: 'proveedor + fallbacks' },
  { icon: Radar, name: 'Re-guard de salida', sub: 'egress soberano' },
  { icon: Fingerprint, name: 'Mexa Sign + Audit', sub: 'hash · hash · hash' },
];

function fmtAge(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */
export default function CrownGatewaySection() {
  const [status, setStatus] = useState<GatewayStatus | null>(null);
  const [emergency, setEmergency] = useState<EmergencyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [opKey, setOpKey] = useState('');
  const [opMsg, setOpMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [s, e] = await Promise.all([
        fetch('/api/isabella/gateway').then(r => r.json()),
        fetch('/api/isabella/gateway/emergency').then(r => r.json()),
      ]);
      if (s.ok) setStatus(s);
      if (e && typeof e.ok === 'boolean' && e.emergency) setEmergency(e.emergency);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo contactar al Nodo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t0 = setTimeout(() => { void refresh(); }, 0);
    const t = setInterval(refresh, 10000);
    return () => { clearTimeout(t0); clearInterval(t); };
  }, [refresh]);

  const act = async (action: 'heartbeat' | 'arm' | 'disarm', reason?: string) => {
    setBusy(true);
    setOpMsg(null);
    try {
      const res = await fetch('/api/isabella/gateway/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          action === 'arm' ? { action, reason, key: opKey }
          : action === 'disarm' ? { action, key: opKey }
          : { action }
        ),
      });
      const json = await res.json();
      if (json.ok) {
        if (json.emergency) setEmergency(json.emergency);
        setOpMsg({ ok: true, text: action === 'heartbeat' ? 'Latido renovado.' : `LOCKDOWN ${action === 'arm' ? 'armado' : 'desarmado'}.` });
        if (action !== 'heartbeat') setOpKey('');
        refresh();
      } else {
        setOpMsg({ ok: false, text: json.error ?? 'Operación rechazada.' });
      }
    } catch (err) {
      setOpMsg({ ok: false, text: err instanceof Error ? err.message : 'Error de red.' });
    } finally {
      setBusy(false);
    }
  };

  if (loading && !status) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 animate-pulse flex items-center justify-center">
          <Activity className="w-5 h-5 text-cyan-400 animate-spin" />
        </div>
        <p className="text-xs font-mono text-slate-400">Estableciendo enlace con el CROWN Gateway…</p>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="p-8 rounded-2xl glass-panel border border-rose-500/40 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
        <p className="text-sm font-mono text-rose-300">El Nodo no respondió: {error ?? 'estado desconocido'}</p>
        <button onClick={refresh} className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold inline-flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> REINTENTAR
        </button>
      </div>
    );
  }

  const lockdown = status.mode === 'EMERGENCIA (LOCKDOWN)';
  const hb = emergency?.heartbeat;
  const hbProgress = hb && hb.ttlMs > 0 ? Math.min(100, Math.round((hb.ageMs / hb.ttlMs) * 100)) : 0;
  const hbRemaining = hb ? Math.max(0, hb.ttlMs - hb.ageMs) : 0;
  const hbDanger = hbRemaining < 15000;

  return (
    <div className="space-y-8">
      {/* ===================== CABECERA ===================== */}
      <div className="rounded-3xl glass-panel border border-white/10 p-8 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-emerald-400 to-purple-400" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.2)]">
                <Cpu className="w-6 h-6 text-cyan-300" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  CROWN <span className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-purple-300 bg-clip-text text-transparent">GATEWAY</span>
                </h2>
                <p className="text-xs font-mono text-slate-400">{status.name}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-[10px] font-mono">
              <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">v{status.version}</span>
              <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">{status.node}</span>
              <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">
                {status.security.keysLoaded}/{status.providers.length} LLAVES CARGADAS
              </span>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono font-bold ${
              lockdown
                ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.35)] animate-pulse'
                : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
            }`}>
              <span className={`w-2 h-2 rounded-full ${lockdown ? 'bg-rose-400' : 'bg-emerald-400'} animate-pulse-glow`} />
              {status.mode}
            </div>
            <p className="text-[10px] font-mono text-slate-500">Flota federada · 8 proveedores · egress por dominio canónico</p>
          </div>
        </div>
      </div>

      {/* ===================== PIPELINE ===================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {PIPELINE.map((stage, i) => (
          <div key={stage.name} className="relative group">
            <div className="h-full p-4 rounded-2xl glass-panel-interactive border border-white/10 space-y-2">
              <stage.icon className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-xs font-mono font-bold text-white">{stage.name}</p>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">{stage.sub}</p>
              </div>
            </div>
            {i < PIPELINE.length - 1 && (
              <ArrowRight className="hidden lg:block w-4 h-4 text-cyan-500/50 absolute -right-2.5 top-1/2 -translate-y-1/2 z-10" />
            )}
          </div>
        ))}
      </div>

      {/* ===================== FLOTA DE PROVEEDORES ===================== */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Boxes className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-mono font-bold text-white tracking-widest">FLOTA FEDERADA</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/30 to-transparent" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {status.providers.map(p => {
            const configured = p.configured;
            const healthy = p.healthy;
            const zone = p.egress === 'blocked' ? 'red' : p.egress === 'restricted' ? 'amber' : 'green';
            const z = zoneStyles[zone];
            return (
              <div key={p.id} className="p-5 rounded-2xl glass-panel border border-white/10 space-y-3 relative overflow-hidden group">
                <div className={`absolute inset-x-0 top-0 h-0.5 ${configured ? (healthy ? 'bg-emerald-400' : 'bg-rose-500') : 'bg-slate-700'}`} />
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-mono font-bold text-white truncate">{p.name}</p>
                    <p className="text-[10px] font-mono text-slate-500 mt-0.5 truncate">{p.model}</p>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-white/5 border border-white/10 text-slate-400 shrink-0">{p.badge}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    !configured ? 'bg-slate-600' : healthy ? 'bg-emerald-400 animate-pulse-glow' : 'bg-rose-500 animate-pulse'
                  }`} />
                  <span className={`text-[10px] font-mono font-bold ${
                    !configured ? 'text-slate-500' : healthy ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {!configured ? 'NO CONFIGURADO' : healthy ? 'OPERATIVO' : 'CIRCUITO ABIERTO'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span className="inline-flex items-center gap-1"><Gauge className="w-3 h-3" /> {p.latencyMs > 0 ? fmtAge(p.latencyMs) : '—'}</span>
                  <span className={`px-1.5 py-0.5 rounded border ${z.chip}`}>{z.label}</span>
                  <span>{p.free ? 'FREE' : 'PAID'}</span>
                </div>
                {p.lastError && (
                  <p className="text-[10px] font-mono text-rose-400/80 truncate" title={p.lastError}>{p.lastError}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===================== POLÍTICA DE RUTEO ===================== */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Network className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-mono font-bold text-white tracking-widest">POLÍTICA DE RUTEO POR DOMINIO</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/30 to-transparent" />
        </div>
        <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-[10px] text-slate-500">
                  <th className="px-4 py-3">DOMINIO</th>
                  <th className="px-4 py-3">ZONA</th>
                  <th className="px-4 py-3">CADENA DE PROVEEDORES</th>
                  <th className="px-4 py-3 hidden lg:table-cell">RAZÓN</th>
                </tr>
              </thead>
              <tbody>
                {status.routing.map(r => {
                  const z = zoneStyles[r.trustZone];
                  return (
                    <tr key={r.domain} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <span className="font-bold text-white uppercase">{r.domain}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${z.chip}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${z.dot}`} /> {z.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1">
                          {r.chain.map((step, i) => (
                            <span key={step} className="inline-flex items-center gap-1">
                              <span className={`px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 ${
                                r.trustZone === 'red' && i === 0 ? 'border-rose-500/40 text-rose-300' : ''
                              }`}>{step}</span>
                              {i < r.chain.length - 1 && <span className="text-slate-600">→</span>}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-slate-500">{r.rationale}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===================== CAPAS DE SEGURIDAD ===================== */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-mono font-bold text-white tracking-widest">ZERO TRUST</h3>
          </div>
          {[
            { ok: status.security.outputReGuard, label: 'Re-guard de salida activo', sub: 'toda respuesta se normaliza antes de emitirse' },
            { ok: status.security.circuitBreaker, label: 'Circuit breaker por proveedor', sub: '3 fallos seguidos → apertura 30 s' },
            { ok: status.security.secretsNeverExposed, label: 'Secretos nunca expuestos', sub: 'las API keys viven solo en el servidor' },
            { ok: status.security.keysLoaded > 0, label: `${status.security.keysLoaded} proveedor(es) con credencial`, sub: `configurados: ${status.security.providersConfigured.join(', ') || 'ninguno (modo simulación)'}` },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              {item.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />}
              <div>
                <p className={`text-xs font-mono font-bold ${item.ok ? 'text-white' : 'text-slate-500'}`}>{item.label}</p>
                <p className="text-[10px] font-mono text-slate-500">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-mono font-bold text-white tracking-widest">EGRESS POR ZONA</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(status.security.trustZones).map(([zone, desc]) => {
              const z = zoneStyles[zone as TrustZone];
              return (
                <div key={zone} className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-md border text-[10px] font-mono font-bold ${z.chip}`}>{z.label}</span>
                  <p className="text-xs font-mono text-slate-400">{desc}</p>
                </div>
              );
            })}
          </div>
          <div className="pt-2 border-t border-white/10">
            <p className="text-[10px] font-mono text-slate-500">
              Dominios de cero salida de datos: <span className="text-rose-400 font-bold">{status.security.zeroEgressDomains.map(d => d.toUpperCase()).join(' · ') || 'ninguno'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ===================== PLAN DE EMERGENCIA ===================== */}
      <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Siren className={`w-5 h-5 ${lockdown ? 'text-rose-400' : 'text-slate-400'}`} />
            <div>
              <h3 className="text-sm font-mono font-bold text-white tracking-widest">DEAD MAN&apos;S SWITCH</h3>
              <p className="text-[10px] font-mono text-slate-500">
                {hb
                  ? lockdown
                    ? `LOCKDOWN activo${emergency?.reason ? ` · ${emergency.reason}` : ''}`
                    : `Último latido hace ${fmtAge(hb.ageMs)} · ventana ${fmtAge(hb.ttlMs)}`
                  : 'Sin telemetría del latido.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hb && (
              <div className="w-40">
                <div className={`h-1.5 rounded-full bg-white/10 overflow-hidden ${hbDanger ? 'animate-pulse' : ''}`}>
                  <div
                    className={`h-full rounded-full ${hbDanger ? 'bg-rose-500' : lockdown ? 'bg-amber-400' : 'bg-emerald-400'}`}
                    style={{ width: `${Math.max(4, 100 - hbProgress)}%` }}
                  />
                </div>
                <p className={`text-[10px] font-mono mt-1 ${hbDanger ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>
                  {hbDanger ? '¡RENUEVA EL LATIDO!' : `${fmtAge(hbRemaining)} restantes`}
                </p>
              </div>
            )}
            <button
              onClick={() => act('heartbeat')}
              disabled={busy}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold inline-flex items-center gap-2 hover:bg-cyan-500/30 disabled:opacity-40 transition-colors"
            >
              <HeartPulse className="w-3.5 h-3.5" /> LATIDO
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-px bg-white/5">
          <div className="p-6 space-y-3 bg-[#04060a]">
            <p className="text-[10px] font-mono text-slate-500 tracking-widest">PLANES DE CONTINGENCIA</p>
            {emergency?.plans.map(p => (
              <div key={p.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono font-bold text-white">{p.name}</p>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                    p.severity === 'critical' ? 'bg-rose-950/70 text-rose-300 border border-rose-500/40' : 'bg-amber-950/70 text-amber-300 border border-amber-500/40'
                  }`}>{p.severity}</span>
                </div>
                <p className="text-[10px] font-mono text-slate-500">{p.description}</p>
              </div>
            ))}
          </div>
          <div className="p-6 bg-[#04060a]">
            <p className="text-[10px] font-mono text-slate-500 tracking-widest mb-3">PANEL DE OPERADOR</p>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <input
                  type="password"
                  value={opKey}
                  onChange={e => setOpKey(e.target.value)}
                  placeholder="CROWN_EMERGENCY_KEY"
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => act('arm', 'Activado desde el panel del Nodo.')}
                  disabled={busy || !opKey}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold inline-flex items-center gap-2 hover:bg-rose-500/30 disabled:opacity-40 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" /> ARMAR LOCKDOWN
                </button>
                <button
                  onClick={() => act('disarm')}
                  disabled={busy || !opKey}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold inline-flex items-center gap-2 hover:bg-emerald-500/30 disabled:opacity-40 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" /> DESARMAR
                </button>
              </div>
              {opMsg && (
                <p className={`text-[11px] font-mono ${opMsg.ok ? 'text-emerald-400' : 'text-rose-400'}`}>{opMsg.text}</p>
              )}
              <p className="text-[10px] font-mono text-slate-600">
                Hardening: {emergency?.hardening.zeroEgressInLockdown ? 'cero salida de datos en LOCKDOWN' : '—'} ·{' '}
                {emergency?.hardening.requiresOperatorKey ? 'clave de operador requerida' : 'sin clave configurada (solo heartbeat)'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[10px] font-mono text-slate-600 text-center">
        C.R.O.W.N. v{status.version} · {status.node} · tolerante a fallos · sin datos de entrenamiento exfiltrados · egress soberano verificado por Mexa Sign
      </p>
    </div>
  );
}
