'use client';

import { useEffect, useState } from 'react';
import { Box, Loader2 } from 'lucide-react';

interface TwinModel {
  id: string;
  dtmi: string;
  name: string;
  version: number;
  domain: string;
}

export function TwinModelEditor() {
  const [models, setModels] = useState<TwinModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TwinModel | null>(null);

  useEffect(() => {
    fetch('/api/twins/models')
      .then((r) => r.json())
      .then((data) => {
        setModels(data.models ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
        <Box className="w-4 h-4 text-amber-400" />
        Catálogo de modelos DTDL
      </div>
      <p className="mt-1 text-xs text-slate-400">Ontologías versionadas al estilo Azure Digital Twins / FIWARE.</p>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-xs text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando modelos...
        </div>
      ) : (
        <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => setSelected(selected?.id === model.id ? null : model)}
              className={`w-full text-left p-2.5 rounded-lg text-xs transition-all ${
                selected?.id === model.id
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200'
                  : 'bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 text-slate-300'
              }`}
            >
              <div className="font-semibold truncate">{model.name}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {model.dtmi} · v{model.version}
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="mt-3 rounded-lg bg-slate-900/60 border border-slate-800 p-3">
          <div className="text-[11px] font-semibold text-slate-200">Schema DTDL</div>
          <pre className="mt-1 text-[10px] text-slate-400 whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
            {JSON.stringify({ dtmi: selected.dtmi, version: selected.version, domain: selected.domain }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
