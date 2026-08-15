"use client";

import React, { useState } from 'react';
import { UtensilsCrossed, Star, MapPin, Wallet } from 'lucide-react';
import { RDM_GASTRONOMY, RDMGastronomy } from '@/lib/rdm/rdm-content';

const typeLabels: Record<string, string> = {
  paste: 'Pastes',
  restaurante: 'Restaurantes',
  panaderia: 'Panaderías',
  heladeria: 'Heladerías',
  cafe: 'Café de Altura',
};

const typeColors: Record<string, string> = {
  paste: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/60',
  restaurante: 'text-rose-300 border-rose-500/40 bg-rose-950/60',
  panaderia: 'text-amber-300 border-amber-500/40 bg-amber-950/60',
  heladeria: 'text-purple-300 border-purple-500/40 bg-purple-950/60',
  cafe: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/60',
};

export default function GastronomySection() {
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? RDM_GASTRONOMY : RDM_GASTRONOMY.filter(g => g.type === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-rose-400" />
            Gastronomía del Monte
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Pastes, cocina de montaña, pan de pulque y café de altura
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
          {[['all', 'Todo'], ['paste', 'Pastes'], ['restaurante', 'Restaurantes'], ['panaderia', 'Panaderías'], ['heladeria', 'Heladerías'], ['cafe', 'Café']].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                filter === id ? 'bg-rose-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item: RDMGastronomy) => (
          <div key={item.id} className="group p-5 rounded-2xl glass-panel-interactive border border-white/10 space-y-3">
            <div className="relative h-36 rounded-xl overflow-hidden border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
              <div className="absolute top-2 left-2">
                <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-md border ${typeColors[item.type]}`}>
                  {typeLabels[item.type]}
                </span>
              </div>
              <span className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-slate-950/80 text-xs font-bold text-amber-400">
                ★ {item.rating}
              </span>
            </div>

            <h3 className="text-base font-bold text-white">{item.name}</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-light">{item.description}</p>

            <div className="pt-3 border-t border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-300">
                <Star className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">{item.specialty}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-400" />
                  {item.location}
                </span>
                <span className="flex items-center gap-1">
                  <Wallet className="w-3 h-3 text-emerald-400" />
                  {item.priceRange}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
