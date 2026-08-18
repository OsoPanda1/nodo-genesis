"use client";

import React, { useState, useEffect } from 'react';
import { Search, Compass, Calendar, MapPin, Sparkles, Play, ArrowRight, ShieldCheck, Award, Star, UtensilsCrossed, Mountain, Boxes } from 'lucide-react';

export type DynamicTourismHeroProps = {
  onOpenIsabella: () => void;
  onReplayIntro: () => void;
  onNavigate: (view: string) => void;
};

const HERO_SLIDES = [
  {
    id: 'heritage',
    title: "PUEBLO MÁGICO MINERO",
    headline: "500 años de historia Cornwall y plata entre la neblina",
    description: "Recorre las minas históricas, la arquitectura británica y los senderos patrimoniales de Real del Monte con cartografía interactiva.",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2000&q=85",
    badge: "PATRIMONIO DE HIDALGO",
    tagColor: "#c89a45",
  },
  {
    id: 'gastronomy',
    title: "SABOR Cornish & MEXICANO",
    headline: "El Paste auténtico: del socavón minero a tu mesa",
    description: "Descubre las recetas tradicionales con sello de origen, los festivales gastronómicos y la mejor platería ley .925.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=2000&q=85",
    badge: "GASTRONOMÍA CERTIFICADA",
    tagColor: "#d97832",
  },
  {
    id: 'phygital',
    title: "GEMELOS DIGITALES 2D/3D",
    headline: "Infraestructura soberana y telemetría territorial en vivo",
    description: "Visualiza nodos YUN, sensores urbanos, redes hídricas y gemelos holográficos del territorio en tiempo real.",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=2000&q=85",
    badge: "TECNOLOGÍA PHYGITAL",
    tagColor: "#0d4652",
  },
];

export default function DynamicTourismHero({ onOpenIsabella, onReplayIntro, onNavigate }: DynamicTourismHeroProps) {
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[activeSlide];

  return (
    <div className="relative min-h-[85vh] flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-white/20 bg-slate-950 text-white shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
      {/* Background Image Carousel with Smooth Crossfade */}
      <div className="absolute inset-0 z-0">
        {HERO_SLIDES.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === activeSlide ? "opacity-100 scale-105 transition-transform duration-[7000ms]" : "opacity-0 scale-100"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.image}
              alt={s.title}
              className="h-full w-full object-cover filter brightness-[0.65] contrast-[1.1]"
            />
            {/* Elegant Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent" />
          </div>
        ))}
      </div>

      {/* TOP FLOATING BADGES — AAA Platform Quality */}
      <div className="relative z-10 p-6 md:p-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-900/80 px-4 py-1.5 text-xs font-mono font-bold tracking-widest text-[#c89a45] backdrop-blur-md">
            <Award className="w-4 h-4 text-[#c89a45]" />
            <span>PUEBLO MÁGICO CERTIFICADO</span>
          </span>

          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/70 px-4 py-1.5 text-xs font-mono font-semibold text-emerald-400 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4" />
            <span>NODO CERO SOBERANO</span>
          </span>
        </div>

        <button
          onClick={onReplayIntro}
          className="group inline-flex items-center gap-2 rounded-full border border-[#c89a45]/50 bg-slate-950/80 px-5 py-2 text-xs font-mono font-bold text-[#c89a45] backdrop-blur-md transition-all hover:bg-[#c89a45] hover:text-slate-950 hover:shadow-[0_0_25px_rgba(200,154,69,0.4)]"
        >
          <Play className="w-3.5 h-3.5 fill-current transition-transform group-hover:scale-110" />
          <span>REPRODUCIR TRAILER AAA</span>
        </button>
      </div>

      {/* MAIN HERO CONTENT — Ultra Sophisticated Typography */}
      <div className="relative z-10 max-w-5xl px-6 md:px-12 py-8 space-y-6 my-auto">
        <div className="inline-flex items-center gap-2 rounded-lg bg-slate-900/80 border border-white/10 px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-[0.25em]" style={{ color: slide.tagColor }}>
          <Sparkles className="w-3.5 h-3.5" />
          <span>{slide.badge}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-serif tracking-tight text-white leading-none drop-shadow-[0_5px_20px_rgba(0,0,0,0.8)]">
          {slide.headline}
        </h1>

        <p className="max-w-2xl text-sm md:text-base text-slate-200 leading-relaxed font-light drop-shadow-md">
          {slide.description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={() => onNavigate("tourism")}
            className="group rounded-2xl bg-gradient-to-r from-[#c89a45] to-[#d97832] px-7 py-4 text-xs font-mono font-bold text-slate-950 shadow-[0_10px_30px_rgba(200,154,69,0.3)] transition-all hover:scale-105 hover:shadow-[0_15px_40px_rgba(200,154,69,0.5)] flex items-center gap-3"
          >
            <Compass className="w-4 h-4" />
            <span>EXPLORAR GUÍA TURÍSTICA</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={onOpenIsabella}
            className="rounded-2xl border border-white/20 bg-slate-900/80 px-7 py-4 text-xs font-mono font-semibold text-white backdrop-blur-md transition-all hover:border-[#c89a45] hover:text-[#c89a45] flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#c89a45]" />
            <span>ASISTENTE IA ISABELLA</span>
          </button>
        </div>
      </div>

      {/* BOTTOM SEARCH & SLIDE NAVIGATION BAR — Inspired by Top 20 Platforms */}
      <div className="relative z-10 p-6 md:p-10 border-t border-white/10 bg-slate-950/60 backdrop-blur-xl space-y-6">
        {/* Integrated Search & Filter Widget */}
        <div className="rounded-2xl border border-white/15 bg-white/10 p-2 shadow-2xl backdrop-blur-2xl flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 flex items-center gap-3 px-4 py-2 text-slate-200 w-full">
            <Search className="w-5 h-5 text-[#c89a45] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="¿Qué deseas descubrir en Real del Monte? (ej. Pastes, Minas, Rutas, Gemelo Digital...)"
              className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none font-sans"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => onNavigate("tourism")}
              className="flex-1 md:flex-none rounded-xl bg-[#c89a45] px-6 py-3 text-xs font-mono font-bold text-slate-950 transition hover:bg-[#e2b257]"
            >
              BUSCAR
            </button>
          </div>
        </div>

        {/* Slide Indicators & Stats Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            {HERO_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setActiveSlide(idx)}
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-mono transition-all ${
                  idx === activeSlide
                    ? "bg-[#c89a45] text-slate-950 font-bold"
                    : "bg-slate-900/80 text-slate-400 hover:text-white border border-white/10"
                }`}
              >
                <span>0{idx + 1}</span>
                <span className="hidden sm:inline">{s.title}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <strong className="text-white">4.9</strong> Rating Turístico
            </span>
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <strong className="text-white">35</strong> Nodos YUN
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
