'use client';

import { useEffect, useState } from 'react';
import { Link2, Loader2 } from 'lucide-react';

interface Edge {
  id: string;
  from: string;
  to: string;
  kind: string;
  weight?: number;
}

export function TwinRelationDrawer() {
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/twins/graph')
      .then((r) => r.json())
      .then((data) => {
        setEdges(data.graph?.edges ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const kinds = [...new Set(edges.map((e) => e.kind))];
  const visible = filter === 'all' ? edges : edges.filter((e) => e.kind === filter);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
        <Link2 className="w-4 h-4 text-violet-400" />
        Relaciones NGSI/DTDL
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-xs text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando relaciones...
        </div>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilter('all')}
              className={`text-[10px] px-2 py-1 rounded-full border ${
                filter === 'all' ? 'bg-violet-500/20 border-violet-500/40 text-violet-200' : 'border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              todas
            </button>
            {kinds.map((kind) => (
              <button
                key={kind}
                onClick={() => setFilter(kind)}
                className={`text-[10px] px-2 py-1 rounded-full border ${
                  filter === kind ? 'bg-violet-500/20 border-violet-500/40 text-violet-200' : 'border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {kind}
              </button>
            ))}
          </div>
          <div className="mt-3 space-y-1.5 max-h-64 overflow-y-auto">
            {visible.length === 0 && <div className="text-xs text-slate-500">Sin relaciones.</div>}
            {visible.map((edge) => (
              <div key={edge.id} className="text-xs text-slate-300 flex items-center justify-between gap-2 rounded-lg bg-slate-900/60 border border-slate-800 px-2.5 py-1.5">
                <span className="truncate">
                  {edge.from} <span className="text-violet-400">→ {edge.kind}</span> {edge.to}
                </span>
                {edge.weight !== undefined && <span className="text-slate-500 shrink-0">{edge.weight}</span>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
