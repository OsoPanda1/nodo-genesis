'use client';

import { useEffect, useState } from 'react';
import { Activity, Loader2 } from 'lucide-react';

export interface TwinInstance {
  id: string;
  modelId: string;
  name: string;
  lat?: number;
  lng?: number;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  properties: Record<string, unknown>;
  telemetry: Record<string, unknown>;
}

const STATUS_STYLE: Record<TwinInstance['status'], string> = {
  healthy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  warning: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  critical: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  offline: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
};

export function TwinInspectorPanel({ instanceId }: { instanceId?: string }) {
  const [instances, setInstances] = useState<TwinInstance[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(instanceId ?? null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/twins/instances')
      .then((r) => r.json())
      .then((data) => {
        setInstances(data.instances ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const selected = instances.find((i) => i.id === selectedId) ?? instances[0];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
        <Activity className="w-4 h-4 text-emerald-400" />
        Inspector de instancias
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-xs text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando gemelos...
        </div>
      ) : (
        <>
          <select
            value={selected?.id ?? ''}
            onChange={(e) => setSelectedId(e.target.value)}
            className="mt-3 w-full rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-2 text-xs text-slate-200"
          >
            {instances.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>

          {selected && (
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-100">{selected.name}</div>
                  <div className="text-[10px] text-slate-500">{selected.modelId}</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_STYLE[selected.status]}`}>
                  {selected.status}
                </span>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-300">Propiedades</div>
                <pre className="mt-1 text-[10px] text-slate-400 whitespace-pre-wrap break-all">
                  {JSON.stringify(selected.properties, null, 2)}
                </pre>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-300">Telemetría</div>
                <pre className="mt-1 text-[10px] text-slate-400 whitespace-pre-wrap break-all">
                  {JSON.stringify(selected.telemetry, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
