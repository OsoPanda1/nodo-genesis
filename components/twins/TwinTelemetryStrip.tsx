'use client';

import { useEffect, useState } from 'react';
import { Gauge, Loader2 } from 'lucide-react';

interface SimulatedTwin {
  result: {
    instanceId: string;
    score: number;
    status: string;
    alerts: string[];
  };
}

export function TwinTelemetryStrip() {
  const [sims, setSims] = useState<SimulatedTwin['result'][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(
      ['sub-rdm', 'tanque-1', 'museo-mineria', 'bus-turistico-01', 'plaza-nacional'].map((id) =>
        fetch('/api/twins/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        })
          .then((r) => r.json())
          .then((d) => d.result),
      ),
    )
      .then((results) => {
        setSims(results);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const barColor = (score: number) =>
    score >= 85 ? 'bg-emerald-400' : score >= 70 ? 'bg-amber-400' : score >= 45 ? 'bg-rose-400' : 'bg-slate-500';

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
        <Gauge className="w-4 h-4 text-cyan-400" />
        Simulación de salud
      </div>
      <p className="mt-1 text-xs text-slate-400">Score de gemelos en tiempo real.</p>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-xs text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" /> Simulando...
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {sims.map((sim) => (
            <div key={sim.instanceId} className="rounded-lg bg-slate-900/60 border border-slate-800 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-semibold truncate">{sim.instanceId}</span>
                <span className="text-slate-400">{sim.score}/100</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className={`h-full ${barColor(sim.score)}`} style={{ width: `${sim.score}%` }} />
              </div>
              {sim.alerts.length > 0 && (
                <div className="mt-2 space-y-1">
                  {sim.alerts.map((alert) => (
                    <div key={alert} className="text-[10px] text-amber-300">
                      • {alert}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
