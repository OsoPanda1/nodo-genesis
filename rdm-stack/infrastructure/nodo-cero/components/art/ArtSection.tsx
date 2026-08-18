"use client";

import React, { useState } from "react";
import { Palette, Star, MapPin, Brush, Camera, Award } from "lucide-react";
import { RDM_ARTISTS, RDMArtist } from "@/lib/rdm/rdm-content";

const disciplineIcons: Record<string, React.ReactNode> = {
  "Orfebrería y Platería": <Award className="w-4 h-4" />,
  "Cerámica y barro": <Brush className="w-4 h-4" />,
  "Muralismo": <Palette className="w-4 h-4" />,
  "Textil de lana": <Brush className="w-4 h-4" />,
  "Fotografía documental": <Camera className="w-4 h-4" />,
  "Escultura en madera": <Award className="w-4 h-4" />,
};

export default function ArtSection() {
  const [selectedArtist, setSelectedArtist] = useState<RDMArtist | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Palette className="w-6 h-6 text-amber-400" />
          Arte y artesanos del Real
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Orfebrería, murales, cerámica, textiles y fotografía de la comarca minera.
        </p>
      </div>

      {/* Grid de artistas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {RDM_ARTISTS.map((artist) => (
          <button
            key={artist.id}
            type="button"
            onClick={() => setSelectedArtist(artist)}
            className="group text-left p-5 rounded-2xl glass-panel-interactive border border-white/10 space-y-3 cursor-pointer hover:border-amber-400/60 transition-colors"
          >
            <div className="relative h-36 rounded-xl overflow-hidden border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artist.image}
                alt={artist.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
              <span className="absolute bottom-2 left-3 text-[10px] font-mono text-amber-300 bg-slate-950/70 px-2 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1">
                {disciplineIcons[artist.discipline]}
                <span className="truncate max-w-[160px]">{artist.discipline}</span>
              </span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-white group-hover:text-amber-200 transition-colors">
                  {artist.name}
                </h3>
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span className="truncate max-w-[160px]">{artist.location}</span>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1 shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {artist.rating}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Spotlight / Modal de artista */}
      {selectedArtist && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setSelectedArtist(null)}
        >
          <div
            className="w-full max-w-lg p-6 glass-panel rounded-2xl border border-amber-500/40 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48 rounded-xl overflow-hidden border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedArtist.image}
                alt={selectedArtist.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent" />
              <h3 className="absolute bottom-3 left-4 text-xl font-black text-white">
                {selectedArtist.name}
              </h3>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1 text-amber-300">
                {disciplineIcons[selectedArtist.discipline]}
                {selectedArtist.discipline}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" />
                {selectedArtist.location}
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed font-light">
              {selectedArtist.bio}
            </p>

            <button
              type="button"
              onClick={() => setSelectedArtist(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-white font-bold text-xs transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
