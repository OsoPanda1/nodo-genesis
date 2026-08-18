"use client";

import React, { useState } from 'react';
import { Music, Mic2, Headphones, Radio, Clock, CalendarDays, BadgeCheck, Podcast } from 'lucide-react';
import { RDM_TRACKS, RDM_PODCAST } from '@/lib/rdm/rdm-content';
import SpotifySection from './SpotifySection';

/* ================================================================== */
/* Música y Podcast del Real. El reproductor real es el embed de       */
/* Spotify del podcast "Ecos de Real del Monte". Los episodios y       */
/* canciones son catálogo editorial; la reproducción se hace en        */
/* Spotify (sin botones de play falsos).                               */
/* ================================================================== */

function PodcastEmbed() {
  return (
    <div id="rdm-podcast-embed" className="space-y-3 rounded-2xl border border-white/10 glass-panel p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Headphones className="h-5 w-5 text-[#2e9cff]" />
          <div>
            <h3 className="text-base font-bold text-white">Ecos de Real del Monte</h3>
            <p className="text-[11px] font-mono text-[#93a5ad]">
              Podcast oficial de la comarca · episodios y transmisión en Spotify
            </p>
          </div>
        </div>
        <span className="rounded-md border border-[#2e9cff]/40 bg-[#2e9cff]/10 px-2 py-1 text-[10px] font-mono text-[#7cc4ff]">
          Spotify · Destacado
        </span>
      </div>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-[#050c12]">
        <iframe
          src="https://open.spotify.com/embed/show/033VQlzxActi39WO45lHwM/video?utm_source=generator&t=0"
          title="Ecos de Real del Monte — Spotify"
          className="absolute inset-0 h-full w-full"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </div>
    </div>
  );
}

export default function MediaSection() {
  const [activeTab, setActiveTab] = useState<'musica' | 'podcast' | 'spotify'>('podcast');

  const goListen = (tab: 'musica' | 'podcast') => {
    setActiveTab(tab);
    requestAnimationFrame(() => {
      document.getElementById('rdm-podcast-embed')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-black text-white">
          <Radio className="h-6 w-6 text-[#2e9cff]" />
          Música y Podcast del Real
        </h2>
        <p className="text-xs font-mono text-[#93a5ad]">
          Bandas de viento, corridos, jazz de la niebla e historias sonoras de la comarca
        </p>
      </div>

      <div className="flex w-fit items-center gap-2 rounded-2xl border border-white/10 glass-panel p-1">
        <button
          onClick={() => setActiveTab('podcast')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold transition-all ${
            activeTab === 'podcast' ? 'bg-[#2e9cff] text-white shadow-md' : 'text-[#93a5ad] hover:text-white'
          }`}
        >
          <Mic2 className="h-4 w-4" />
          Podcast RDM
        </button>
        <button
          onClick={() => setActiveTab('musica')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold transition-all ${
            activeTab === 'musica' ? 'bg-[#0d4652] text-white shadow-md' : 'text-[#93a5ad] hover:text-white'
          }`}
        >
          <Music className="h-4 w-4" />
          Música Local
        </button>
        <button
          onClick={() => setActiveTab('spotify')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold transition-all ${
            activeTab === 'spotify' ? 'bg-[#d97832] text-white shadow-md' : 'text-[#93a5ad] hover:text-white'
          }`}
        >
          <Podcast className="h-4 w-4" />
          Mi Spotify
        </button>
      </div>

      {activeTab === 'spotify' && <SpotifySection />}

      {activeTab === 'podcast' && (
        <div className="space-y-5">
          <PodcastEmbed />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {RDM_PODCAST.map((episode) => (
              <div key={episode.id} className="space-y-3 rounded-2xl border border-white/10 glass-panel-interactive p-5">
                <div className="relative h-40 overflow-hidden rounded-xl border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={episode.image}
                    alt={episode.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050c12]/90 to-transparent" />
                  <span className="absolute left-2 top-2 flex items-center gap-1 rounded-lg border border-[#2e9cff]/30 bg-[#050c12]/80 px-2 py-1 text-[10px] font-mono text-[#7cc4ff]">
                    <Headphones className="h-3 w-3" />
                    Episodio {episode.id.split('-')[1]}
                  </span>
                  <button
                    onClick={() => goListen('podcast')}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full border border-[#2e9cff]/40 bg-[#0d4652]/80 px-3 py-1.5 text-[11px] font-mono font-bold text-white backdrop-blur transition-transform hover:scale-105"
                  >
                    <Mic2 className="h-3.5 w-3.5" />
                    En Spotify
                  </button>
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{episode.title}</h4>
                  <p className="mt-0.5 text-[11px] font-mono text-[#93a5ad]">{episode.subtitle}</p>
                </div>
                <p className="text-xs font-light leading-relaxed text-[#c9d0d4]">{episode.description}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {episode.tags.map((tag) => (
                    <span key={tag} className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-[#93a5ad]">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[11px] font-mono text-[#93a5ad]">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-[#2e9cff]" />
                    {episode.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3 text-[#d97832]" />
                    {episode.date}
                  </span>
                  <span className="flex items-center gap-1 text-[#2e9cff]">
                    <BadgeCheck className="h-3 w-3" />
                    RDM Audio
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'musica' && (
        <div className="space-y-3">
          <PodcastEmbed />
          {RDM_TRACKS.map((track) => (
            <div
              key={track.id}
              className="flex items-center gap-4 rounded-2xl border border-white/10 glass-panel-interactive p-3 transition-all"
            >
              <div className="flex h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={track.image} alt={track.title} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-bold text-white">{track.title}</h4>
                <div className="truncate text-[11px] font-mono text-[#93a5ad]">
                  {track.artist} · {track.genre}
                </div>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-[11px] font-mono text-[#647a84]">
                <Clock className="h-3 w-3" />
                {track.duration}
              </span>
              <button
                onClick={() => goListen('musica')}
                className="shrink-0 rounded-full border border-[#0d4652]/60 bg-[#0d4652]/30 px-3 py-1.5 text-[11px] font-mono font-bold text-white transition-colors hover:bg-[#0d4652]"
              >
                Escuchar en Spotify
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}