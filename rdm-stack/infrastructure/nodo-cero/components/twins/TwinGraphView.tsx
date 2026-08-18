'use client';

import { useEffect, useState } from 'react';
import { Share2, Navigation, Loader2 } from 'lucide-react';

interface TwinNode {
  id: string;
  type: string;
  name: string;
  status?: string;
}

interface TwinEdge {
  id: string;
  from: string;
  to: string;
  kind: string;
}

export function TwinGraphView() {
  const [nodes, setNodes] = useState<TwinNode[]>([]);
  const [edges, setEdges] = useState<TwinEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/twins/graph')
      .then((r) => r.json())
      .then((data) => {
        setNodes(data.graph?.nodes ?? []);
        setEdges(data.graph?.edges ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const related = selected
    ? edges.filter((e) => e.from === selected || e.to === selected)
    : [];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
        <Share2 className="w-4 h-4 text-cyan-400" />
        Grafo de gemelos
      </div>
      <p className="mt-1 text-xs text-slate-400">{nodes.length} entidades · {edges.length} relaciones</p>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-xs text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando grafo...
        </div>
      ) : (
        <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
          {nodes.map((node) => (
            <button
              key={node.id}
              onClick={() => setSelected(selected === node.id ? null : node.id)}
              className={`w-full text-left p-2.5 rounded-lg text-xs transition-all ${
                selected === node.id
                  ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-200'
                  : 'bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold truncate">{node.name}</span>
                <span
                  className={`shrink-0 w-2 h-2 rounded-full ${
                    node.status === 'warning'
                      ? 'bg-amber-400'
                      : node.status === 'critical'
                        ? 'bg-rose-500'
                        : node.status === 'offline'
                          ? 'bg-slate-500'
                          : 'bg-emerald-400'
                  }`}
                />
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{node.type}</div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="mt-3 rounded-lg bg-slate-900/60 border border-slate-800 p-3">
          <div className="text-[11px] font-semibold text-slate-200">Relaciones</div>
          {related.length === 0 ? (
            <div className="mt-1 text-xs text-slate-500">Sin relaciones.</div>
          ) : (
            related.map((edge) => (
              <div key={edge.id} className="mt-1 text-xs text-slate-400 flex items-center gap-1.5">
                <Navigation className="w-3 h-3 text-cyan-400" />
                {nodes.find((n) => n.id === edge.from)?.name ?? edge.from}
                <span className="text-cyan-500">{edge.kind}</span>
                {nodes.find((n) => n.id === edge.to)?.name ?? edge.to}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
