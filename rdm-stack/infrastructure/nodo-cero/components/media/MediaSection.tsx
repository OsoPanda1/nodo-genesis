"use client";

import React, { useState } from 'react';
import { Music, Mic2, Play, Pause, Headphones, Radio, Clock, CalendarDays, BadgeCheck, Podcast } from 'lucide-react';
import { RDM_TRACKS, RDM_PODCAST } from '@/lib/rdm/rdm-content';
import SpotifySection from './SpotifySection';

/* Reproductor del podcast oficial: Ecos de Real del Monte (Spotify).
   Visible tanto en la pestaña Música como en la pestaña Podcast. */
function PodcastEmbed() {
  return (
    <div className="rounded-2xl glass-panel border border-white/10 p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-base font-bold text-white">Ecos de Real del Monte</h3>
            <p className="text-[11px] font-mono text-slate-400">Podcast oficial de la comarca · Transmisión en vivo y episodios</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-1 rounded-md border border-emerald-500/40 bg-emerald-950/60 text-emerald-300">
          Spotify · Destacado
        </span>
      </div>
      <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-slate-950 aspect-video">
        <iframe
          src="https://open.spotify.com/embed/show/033VQlzxActi39WO45lHwM/video?utm_source=generator&t=0"
          title="Ecos de Real del Monte — Spotify"
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </div>
    </div>
  );
}

export default function MediaSection() {
  const [activeTab, setActiveTab] = useState<'musica' | 'podcast' | 'spotify'>('musica');
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Radio className="w-6 h-6 text-purple-400" />
          Música y Podcast del Real
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Bandas de viento, corridos, jazz de la niebla e historias sonoras de la comarca
        </p>
      </div>

      <div className="flex items-center gap-2 p-1 rounded-2xl glass-panel border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab('musica')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeTab === 'musica' ? 'bg-purple-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Music className="w-4 h-4" />
          Música Local
        </button>
        <button
          onClick={() => setActiveTab('podcast')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeTab === 'podcast' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Mic2 className="w-4 h-4" />
          Podcast RDM
        </button>
        <button
          onClick={() => setActiveTab('spotify')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeTab === 'spotify' ? 'bg-green-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Podcast className="w-4 h-4" />
          Mi Spotify
        </button>
      </div>

      {activeTab === 'spotify' && <SpotifySection />}

      {activeTab === 'musica' && (
        <div className="space-y-3">
          <PodcastEmbed />
          {RDM_TRACKS.map(track => (
            <div
              key={track.id}
              className={`p-3 rounded-2xl glass-panel-interactive border transition-all flex items-center gap-4 ${
                playing === track.id ? 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'border-white/10'
              }`}
            >
              <button
                onClick={() => setPlaying(playing === track.id ? null : track.id)}
                className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg hover:scale-105 transition-transform"
              >
                {playing === track.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0 hidden sm:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={track.image} alt={track.title} className="w-full h-full object-cover" loading="lazy" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{track.title}</h4>
                <div className="text-[11px] font-mono text-slate-400 truncate">
                  {track.artist} · {track.genre}
                </div>
              </div>

              <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1 shrink-0">
                <Clock className="w-3 h-3" />
                {track.duration}
              </span>

              {playing === track.id && (
                <div className="hidden md:flex items-end gap-0.5 h-5 shrink-0">
                  {[6, 9, 5, 11, 8, 4, 10, 7].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 rounded-full bg-purple-400 animate-shimmer"
                      style={{ height: `${h}px`, animation: 'pulseGlow 1s ease-in-out infinite', animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'podcast' && (
        <div className="space-y-5">
          {/* Featured podcast: Ecos de Real del Monte (Spotify) */}
          <PodcastEmbed />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {RDM_PODCAST.map(episode => (
            <div key={episode.id} className="group p-5 rounded-2xl glass-panel-interactive border border-white/10 space-y-3">
              <div className="relative h-40 rounded-xl overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={episode.image}
                  alt={episode.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent" />
                <button
                  onClick={() => setPlaying(playing === episode.id ? null : episode.id)}
                  className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.7)] hover:scale-105 transition-transform"
                >
                  {playing === episode.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <span className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-slate-950/80 text-[10px] font-mono text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <Headphones className="w-3 h-3" />
                  Episodio {episode.id.split('-')[1]}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white">{episode.title}</h4>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">{episode.subtitle}</p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-light">{episode.description}</p>

              <div className="flex flex-wrap items-center gap-2">
                {episode.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  {episode.duration}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3 text-amber-400" />
                  {episode.date}
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <BadgeCheck className="w-3 h-3" />
                  RDM Audio
                </span>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}
