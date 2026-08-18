"use client";

import React, { useState } from 'react';
import { Images, X, ZoomIn, User, ThumbsUp, PlayCircle } from 'lucide-react';
import { RDM_GALLERY } from '@/lib/rdm/rdm-content';

const categoryLabels: Record<string, string> = {
  Naturaleza: 'Naturaleza',
  Pueblo: 'Vida del Pueblo',
  Gastronomía: 'Gastronomía',
  Minas: 'Minas y Patrimonio',
  Cultura: 'Cultura',
};

export default function GallerySection() {
  const [filter, setFilter] = useState<string>('all');
  const [selected, setSelected] = useState<number | null>(null);

  const filtered = filter === 'all' ? RDM_GALLERY : RDM_GALLERY.filter(g => g.category === filter);
  const active = selected !== null ? RDM_GALLERY[selected] : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Images className="w-6 h-6 text-emerald-400" />
          Galería Compartida del Nodo
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Fotografías y videos donados por la comunidad con licencia libre RDM
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 p-1 rounded-2xl glass-panel border border-white/10 w-fit">
        {[['all', 'Todo'], ...Object.entries(categoryLabels)].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all ${
              filter === id ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map(photo => {
          const originalIndex = RDM_GALLERY.findIndex(p => p.id === photo.id);
          return (
            <button
              key={photo.id}
              onClick={() => setSelected(originalIndex)}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.image}
                alt={photo.caption}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <div className="text-left w-full">
                  <div className="text-xs font-bold text-white leading-tight line-clamp-2">{photo.caption}</div>
                  <div className="text-[10px] font-mono text-emerald-300 mt-0.5">{categoryLabels[photo.category]}</div>
                </div>
              </div>
              {photo.type === 'video' && (
                <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-slate-950/70 border border-white/20 text-white flex items-center justify-center">
                  <PlayCircle className="w-4 h-4" />
                </div>
              )}
              <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-950/70 backdrop-blur flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>

      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setSelected(null)}>
          <div className="w-full max-w-3xl space-y-3" onClick={e => e.stopPropagation()}>
            <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={active.image} alt={active.caption} className="w-full max-h-[70vh] object-contain bg-slate-950" />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-950/80 border border-white/20 text-white flex items-center justify-center hover:border-emerald-400 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 rounded-2xl glass-panel border border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white">{active.caption}</h3>
                <div className="text-xs font-mono text-emerald-300 mt-1">{categoryLabels[active.category]}</div>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-mono text-slate-300">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  {active.author}
                </span>
                <span className="flex items-center gap-1 text-amber-300">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {active.likes}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
