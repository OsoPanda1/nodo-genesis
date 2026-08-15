"use client";

import React, { useState } from 'react';
import { Ghost, Quote, BookOpen, ChevronLeft, ChevronRight, ScrollText, MessageCircleWarning } from 'lucide-react';
import { RDM_LEGENDS, RDM_DICHOS_MINEROS } from '@/lib/rdm/rdm-content';

const typeLabels: Record<string, string> = {
  Minería: 'Leyenda de Mina',
  Leyenda: 'Relato Sobrenatural',
  Callejones: 'Mito del Callejón',
  Naturaleza: 'Tradición Oral',
  Fe: 'Milagro de la Sierra',
};

const typeColors: Record<string, string> = {
  Minería: 'text-purple-300 border-purple-500/40 bg-purple-950/60',
  Leyenda: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/60',
  Callejones: 'text-amber-300 border-amber-500/40 bg-amber-950/60',
  Naturaleza: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/60',
  Fe: 'text-rose-300 border-rose-500/40 bg-rose-950/60',
};

export default function LegendsSection() {
  const [selected, setSelected] = useState(0);
  const legend = RDM_LEGENDS[selected];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Ghost className="w-6 h-6 text-purple-400" />
          Mitos y Leyendas del Monte
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          La niebla del Real guarda historias de minas, aparecidos y tesoros perdidos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storyteller Carousel */}
        <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.15)]">
          <div className="relative h-72">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={legend.image} alt={legend.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute top-3 left-3">
              <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-md border ${typeColors[legend.category]}`}>
                {typeLabels[legend.category]}
              </span>
            </div>
            <div className="absolute bottom-0 inset-x-0 p-5 space-y-2">
              <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">
                Relato {selected + 1} de {RDM_LEGENDS.length}
              </div>
              <h3 className="text-xl font-black text-white">{legend.title}</h3>
              <div className="text-[11px] font-mono text-slate-400">{legend.moral}</div>
            </div>
          </div>

          <button
            onClick={() => setSelected((selected + 1) % RDM_LEGENDS.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/80 border border-white/20 text-white flex items-center justify-center hover:border-purple-400 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelected((selected - 1 + RDM_LEGENDS.length) % RDM_LEGENDS.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/80 border border-white/20 text-white flex items-center justify-center hover:border-purple-400 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Story Detail */}
        <div className="p-6 rounded-2xl glass-panel border border-white/10 flex flex-col">
          <div className="flex items-center gap-2 text-amber-400 mb-3">
            <BookOpen className="w-4 h-4" />
            <span className="text-[10px] font-mono uppercase tracking-widest">El cuentacuentos del Real</span>
          </div>
          <div className="text-xs text-slate-400 font-mono mb-3">Categoría: {legend.category}</div>
          <div className="text-sm text-slate-200 leading-relaxed font-light flex-1 relative">
            <Quote className="w-5 h-5 text-purple-500/50 mb-2" />
            {legend.story}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500">Transmisión oral · Nodo Cero</span>
            <span className="text-[10px] font-mono text-purple-400">3.2 min de lectura</span>
          </div>
        </div>
      </div>

      {/* Dichos Mineros */}
      <div className="rounded-2xl glass-panel border border-white/10 p-6">
        <div className="flex items-center gap-2 mb-4">
          <ScrollText className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Dichos y Refranes de la Raza Minera</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {RDM_DICHOS_MINEROS.map((dicho, i) => (
            <div key={i} className="rounded-xl overflow-hidden bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/40 transition-colors">
              <div className="relative h-28">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={['/images/callejon.jpg', '/images/ladificultad.jpg', '/images/mina-acosta.jpg', '/images/real-3.jpg'][i % 4]}
                  alt="Dicho minero del Real"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              </div>
              <div className="p-4 space-y-2">
                <p className="text-sm text-amber-200 font-medium italic leading-snug">{dicho.text}</p>
                <p className="text-xs text-slate-400 font-mono leading-relaxed">{dicho.meaning}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-start gap-2 text-xs text-purple-200/90">
          <MessageCircleWarning className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            Cada leyenda y dicho fue registrado con colaboradores del Real del Monte para preservar la memoria oral de la comarca.
          </span>
        </div>
      </div>
    </div>
  );
}
