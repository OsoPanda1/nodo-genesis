"use client";

import React, { useState } from 'react';
import { Award, Trophy, Medal, BadgeCheck, CalendarDays, Sparkles } from 'lucide-react';
import { RDM_HONOREES } from '@/lib/rdm/rdm-content';

type Tier = 'maximo' | 'reconocido' | 'comunidad';

const tierFor = (id: string): Tier => {
  const index = RDM_HONOREES.findIndex(h => h.id === id);
  if (index < 3) return 'maximo';
  if (index < 6) return 'reconocido';
  return 'comunidad';
};

const tierIcons: Record<Tier, React.ReactNode> = {
  maximo: <Trophy className="w-5 h-5" />,
  reconocido: <Medal className="w-5 h-5" />,
  comunidad: <BadgeCheck className="w-5 h-5" />,
};

const tierColors: Record<Tier, string> = {
  maximo: 'border-amber-500/50 bg-gradient-to-br from-amber-950/50 to-slate-950/80 text-amber-300',
  reconocido: 'border-cyan-500/40 bg-gradient-to-br from-cyan-950/40 to-slate-950/80 text-cyan-300',
  comunidad: 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 to-slate-950/80 text-emerald-300',
};

const tierOrder: Record<Tier, number> = { maximo: 0, reconocido: 1, comunidad: 2 };

export default function HonorWallSection() {
  const [filter, setFilter] = useState<string>('all');
  const sorted = [...RDM_HONOREES].sort((a, b) => tierOrder[tierFor(a.id)] - tierOrder[tierFor(b.id)]);
  const filtered = filter === 'all' ? sorted : sorted.filter(h => tierFor(h.id) === filter);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-400" />
          Muro de Honor del Real
        </h2>
        <p className="text-xs text-[#93a5ad] font-mono">
          Personas y colectivos que forjan el Nodo Cero con su trabajo
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 p-1 rounded-2xl glass-panel border border-white/10 w-fit">
        {[['all', 'Todos'], ['maximo', 'Máximo Honor'], ['reconocido', 'Reconocidos'], ['comunidad', 'Comunidad']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              filter === id ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-[#93a5ad] hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(honoree => {
          const tier = tierFor(honoree.id);
          return (
            <div key={honoree.id} className={`p-5 rounded-2xl glass-panel-interactive border space-y-3 ${tierColors[tier]}`}>
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/15">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={honoree.image} alt={honoree.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="w-11 h-11 rounded-full bg-slate-950/60 border border-white/15 flex items-center justify-center">
                  {tierIcons[tier]}
                </div>
              </div>

              <div>
                <h3 className="text-base font-black text-white">{honoree.name}</h3>
                <div className="text-[11px] font-mono opacity-80 mt-0.5">{honoree.title}</div>
              </div>

              <div className="text-xs leading-relaxed font-light opacity-90">{honoree.achievement}</div>

              <div className="flex items-center justify-between pt-2 border-t border-white/15 text-[11px] font-mono">
                <span className="flex items-center gap-1 opacity-90">
                  <Sparkles className="w-3 h-3" />
                  {tier === 'maximo' ? 'Máximo Honor' : tier === 'reconocido' ? 'Reconocimiento' : 'Voz Comunitaria'}
                </span>
                <span className="flex items-center gap-1 opacity-70">
                  <CalendarDays className="w-3 h-3" />
                  {honoree.year}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-5 rounded-2xl glass-panel border border-amber-500/20 bg-gradient-to-r from-amber-950/30 to-slate-950/60 text-center">
        <p className="text-sm text-amber-100/90 font-light leading-relaxed">
          El Muro de Honor se alimenta de propuestas comunitarias validadas por el consejo del Nodo Cero.
          Propón a alguien en el <span className="font-bold text-amber-300">Foro RDM</span>.
        </p>
      </div>
    </div>
  );
}
