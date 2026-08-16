"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Sparkles,
  UtensilsCrossed,
  Palette,
  Ghost,
  BookMarked,
  Store,
  ShoppingBag,
  MessagesSquare,
  Users,
  Map,
  Cpu,
  Mountain,
  Landmark,
  Building2,
  Ticket,
  Heart,
  ExternalLink,
} from "lucide-react";
import DynamicTourismHero from "@/components/hero/DynamicTourismHero";
import TourismSection from "@/components/tourism/TourismSection";
import GastronomySection from "@/components/gastronomy/GastronomySection";
import ArtSection from "@/components/art/ArtSection";
import LegendsSection from "@/components/legends/LegendsSection";
import { ArchiveView } from "@/components/archive/ArchiveView";
import GallerySection from "@/components/gallery/GallerySection";
import BusinessPortal from "@/components/business/BusinessPortal";
import PhygitalMarketplace from "@/components/phygital/PhygitalMarketplace";
import ForumSection from "@/components/forum/ForumSection";
import HonorWallSection from "@/components/honor/HonorWallSection";
import RegisterSection from "@/components/register/RegisterSection";
import MapHub from "@/components/map/MapHub";
import IsabellaChat from "@/components/isabella/IsabellaChat";
import { StatPill } from "@/components/design-system/StatPill";
import { MetallicHeading } from "@/components/design-system/MetallicHeading";
import { CrystalButton } from "@/components/design-system/CrystalButton";
import { GradientDivider } from "@/components/design-system/GradientDivider";

/* ================================================================== */
/* Portada institucional del destino — modelo "destino turístico        */
/* inteligente" (Oficina Virtual, Inteligencia, Gobernanza).           */
/* El núcleo técnico de nodo-cero vive en /nodo y se enlaza aquí.      */
/* ================================================================== */

const NAV_ITEMS = [
  { href: "#virtual", label: "Oficina Virtual" },
  { href: "#rutas", label: "Rutas y Turismo" },
  { href: "#mapa", label: "Mapa Interactivo" },
  { href: "#gastronomia", label: "Gastronomía" },
  { href: "#cultura", label: "Cultura e Historia" },
  { href: "#economia", label: "Economía Local" },
  { href: "#comunidad", label: "Comunidad" },
];

const OFICINA_VIRTUAL = [
  {
    title: "Asistente IA Isabella",
    description: "Tu guía cognitiva del Pueblo Mágico: rutas, historia, pastes y servicios, 24/7.",
    icon: <Sparkles className="w-5 h-5" />,
    accent: "#c89a45",
  },
  {
    title: "Rutas turísticas",
    description: "Minas históricas, ecoturismo y senderos patrimoniales con cartografía interactiva.",
    icon: <Mountain className="w-5 h-5" />,
    accent: "#0d4652",
  },
  {
    title: "Mapa interactivo",
    description: "Gemelo digital 2D/3D del territorio: atractivos, servicios y nodos del pueblo.",
    icon: <Map className="w-5 h-5" />,
    accent: "#3f9b78",
  },
  {
    title: "Calendario del destino",
    description: "Feria del Paste, Semana Cornish y las fiestas del calendario anual del Real.",
    icon: <Ticket className="w-5 h-5" />,
    accent: "#d97832",
  },
];

export default function DestinoPortada() {
  const [isabellaOpen, setIsabellaOpen] = useState(false);
  const [isabellaInitialPrompt, setIsabellaInitialPrompt] = useState("");

  const openIsabella = (prompt?: string) => {
    if (prompt) setIsabellaInitialPrompt(prompt);
    setIsabellaOpen(true);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen bg-[#f4f6f2] text-[#283038]">
      {/* ================= BARRA INSTITUCIONAL ================= */}
      <header className="sticky top-0 z-50 border-b border-[#d5d9d3] bg-[#f4f6f2]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0d4652] text-white">
              <Landmark className="h-5 w-5" />
            </span>
            <span className="hidden sm:block">
              <span className="block font-patrimonial text-base font-bold leading-tight text-[#082f3b]">
                Real del Monte
              </span>
              <span className="block font-rdm-mono text-[9px] uppercase tracking-[0.28em] text-[#536b86]">
                Destino Inteligente
              </span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-5">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(item.href.slice(1));
                }}
                className="text-xs font-semibold text-[#536b86] transition-colors hover:text-[#0d4652]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <CrystalButton
              variant="ghost"
              onClick={() => openIsabella()}
              className="px-4 py-2 text-xs font-bold"
            >
              <Sparkles className="h-4 w-4 text-[#c89a45]" />
              <span className="hidden sm:inline">Isabella</span>
            </CrystalButton>
            <Link href="/nodo">
              <CrystalButton className="px-4 py-2 text-xs font-bold">
                <Cpu className="h-4 w-4" />
                <span className="hidden sm:inline">Nodo Cero</span>
              </CrystalButton>
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO DEL DESTINO ================= */}
      <section className="mx-auto max-w-7xl px-4 pt-4">
        <DynamicTourismHero
          onOpenIsabella={() => openIsabella()}
          onReplayIntro={() => scrollTo("rutas")}
          onNavigate={(view) => {
            if (view === "tourism") scrollTo("rutas");
            else scrollTo(view);
          }}
        />
      </section>

      {/* ================= GUÍA RÁPIDA ================= */}
      <section className="mx-auto max-w-7xl px-6 -mt-8 relative z-20">
        <div className="rounded-[2rem] border border-white/70 bg-white/82 p-5 shadow-[0_24px_80px_rgba(13,70,82,0.14)] backdrop-blur-2xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
              <p className="font-rdm-mono text-[10px] uppercase tracking-[0.28em] text-[#c89a45]">Oficina Turística Virtual</p>
              <h2 className="font-patrimonial text-2xl font-bold text-[#082f3b]">¿Qué quieres vivir hoy en el Real?</h2>
              <p className="max-w-2xl text-sm leading-relaxed text-[#536b86]">
                Servicios, rutas, inteligencia del destino y gobernanza del Pueblo Mágico en una sola puerta de entrada.
              </p>
            </div>
            <CrystalButton variant="ghost" onClick={() => openIsabella("Necesito una guía personalizada del pueblo")} className="px-5 py-3 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-[#0d4652]" />
              <span>Necesito guía personalizada</span>
            </CrystalButton>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {OFICINA_VIRTUAL.map((card) => (
              <button
                key={card.title}
                onClick={() => openIsabella(card.description)}
                className="group rounded-2xl border border-[#c9d0d4]/70 bg-[#fbfcfa]/88 p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(13,70,82,0.12)]"
              >
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-sm" style={{ background: card.accent }}>
                  {card.icon}
                </span>
                <span className="block font-patrimonial text-base font-bold text-[#082f3b]">{card.title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-[#536b86]">{card.description}</span>
                <span className="mt-3 inline-flex items-center gap-1 font-rdm-mono text-[10px] font-bold uppercase tracking-widest" style={{ color: card.accent }}>
                  Preguntar a Isabella <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================= INDICADORES DEL DESTINO ================= */}
      <section className="mx-auto max-w-7xl px-6 -mt-14 relative z-10">
        <div className="crystal-card p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatPill value="500" label="Años de historia" sub="De la Real de Minas a 2026" color="#3f9b78" />
            <StatPill value="5" label="Rutas turísticas" sub="minas, gastronomía y ecoturismo" color="#0d4652" />
            <StatPill value="8" label="Fiestas y tradiciones" sub="del calendario anual del pueblo" color="#d97832" />
            <StatPill value="35" label="Nodos YUN activos" sub="infraestructura soberana del Nodo Cero" color="#c89a45" />
          </div>
        </div>
      </section>

      {/* ================= RUTAS Y TURISMO ================= */}
      <section id="rutas" className="mx-auto max-w-7xl scroll-mt-20 px-6 space-y-6 pt-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <MetallicHeading as="h3" className="text-2xl sm:text-3xl">
              Turismo, ecoturismo y rutas del Real
            </MetallicHeading>
            <p className="text-xs text-slate-600 font-mono">
              Feria del Paste, Semana Cornish, rutas mineras y de naturaleza, y los dichos que guardan la memoria del pueblo.
            </p>
          </div>
          <Link href="/nodo?view=tourism">
            <span className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-700 hover:text-[#082f3b] text-xs font-mono font-semibold transition-all flex items-center gap-2">
              <span>Explorar turismo</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
        <TourismSection />
      </section>

      {/* ================= MAPA INTERACTIVO ================= */}
      <section id="mapa" className="mx-auto max-w-7xl scroll-mt-20 px-6 space-y-6 pt-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <MetallicHeading as="h3" className="text-2xl sm:text-3xl">
              Mapa interactivo del destino
            </MetallicHeading>
            <p className="text-xs text-slate-600 font-mono">
              Gemelo digital 2D/3D del territorio: atractivos, servicios y nodos del pueblo.
            </p>
          </div>
          <Link href="/nodo?view=map">
            <span className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 hover:text-[#082f3b] text-xs font-mono font-semibold transition-all flex items-center gap-2">
              <span>Mapa 2D/3D</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
        <MapHub />
      </section>

      {/* ================= GASTRONOMÍA ================= */}
      <section id="gastronomia" className="mx-auto max-w-7xl scroll-mt-20 px-6 space-y-6 pt-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <MetallicHeading as="h3" className="text-2xl sm:text-3xl">
              Gastronomía del Monte
            </MetallicHeading>
            <p className="text-xs text-slate-600 font-mono">
              Pastes de papa y frijol, mixiotes, pan de pulque y café de altura: la cocina minera en la mesa.
            </p>
          </div>
          <Link href="/nodo?view=gastronomy">
            <span className="px-4 py-2 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-700 hover:text-[#082f3b] text-xs font-mono font-semibold transition-all flex items-center gap-2">
              <span>Ver gastronomía</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
        <GastronomySection />
      </section>

      {/* ================= CULTURA E HISTORIA ================= */}
      <section id="cultura" className="mx-auto max-w-7xl scroll-mt-20 px-6 space-y-6 pt-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <MetallicHeading as="h3" className="text-2xl sm:text-3xl">
              Cultura, historia y memoria
            </MetallicHeading>
            <p className="text-xs text-slate-600 font-mono">
              Arte y artesanos, leyendas, archivo histórico y galería compartida del pueblo.
            </p>
          </div>
        </div>

        <ArtSection />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-[#082f3b]">
              <Ghost className="h-4 w-4 text-indigo-600" />
              Historia, mitos y leyendas
            </h4>
            <LegendsSection />
            <Link href="/nodo?view=legends">
              <span className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-700 text-xs font-mono font-semibold">
                Ver leyendas <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-[#082f3b]">
              <BookMarked className="h-4 w-4 text-amber-700" />
              Archivo Histórico del Real
            </h4>
            <ArchiveView />
            <Link href="/nodo?view=archive">
              <span className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-700/20 border border-amber-700/40 text-amber-900 text-xs font-mono font-semibold">
                Ver archivo <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-[#082f3b]">
            <Palette className="h-4 w-4 text-emerald-600" />
            Galería compartida
          </h4>
          <GallerySection />
          <Link href="/nodo?view=gallery">
            <span className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 text-xs font-mono font-semibold">
              Ver galería <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </section>

      {/* ================= ECONOMÍA LOCAL ================= */}
      <section id="economia" className="mx-auto max-w-7xl scroll-mt-20 px-6 space-y-6 pt-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <MetallicHeading as="h3" className="text-2xl sm:text-3xl">
              Economía local con sello RDM
            </MetallicHeading>
            <p className="text-xs text-slate-600 font-mono">
              Negocios verificados del pueblo, pastes y platería ley .925 con experiencias territoriales.
            </p>
          </div>
          <Link href="/nodo?view=marketplace">
            <span className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-700 hover:text-[#082f3b] text-xs font-mono font-semibold transition-all flex items-center gap-2">
              <span>Ir al marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
        <BusinessPortal />
        <PhygitalMarketplace />
      </section>

      {/* ================= COMUNIDAD ================= */}
      <section id="comunidad" className="mx-auto max-w-7xl scroll-mt-20 px-6 space-y-6 pt-20">
        <div className="space-y-1">
          <MetallicHeading as="h3" className="text-2xl sm:text-3xl">
            Comunidad del Real
          </MetallicHeading>
          <p className="text-xs text-slate-600 font-mono">
            Foro, muro de honor y registro de vecinos, negocios y artesanos.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-[#082f3b]">
              <MessagesSquare className="h-4 w-4 text-sky-600" />
              Foro del Real
            </h4>
            <ForumSection />
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-[#082f3b]">
              <Heart className="h-4 w-4 text-yellow-600" />
              Muro de honor
            </h4>
            <HonorWallSection />
          </div>
        </div>
        <RegisterSection />
      </section>

      {/* ================= IDENTIDAD ================= */}
      <section className="mx-auto max-w-7xl px-6 pt-20">
        <div className="crystal-card p-8 md:p-12 text-center">
          <div className="crystal-badge mx-auto mb-5">
            <Sparkles className="w-3.5 h-3.5 text-[#d97832]" />
            <span>Autoría e identidad</span>
          </div>
          <p className="font-editorial text-2xl sm:text-3xl font-medium text-[#082f3b]">
            Una plataforma creada y arquitectada por
          </p>
          <p className="rdm-metallic-text font-editorial text-4xl sm:text-6xl font-semibold tracking-tight mt-3">
            Anubis Villaseñor
          </p>
          <p className="font-rdm-mono text-xs tracking-[0.28em] uppercase text-[#536b86] mt-4">
            Sistemas territoriales · Inteligencia cognitiva · Gobernanza digital · Experiencias inmersivas
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/nodo?view=about">
              <CrystalButton className="px-7 py-3.5 text-sm font-bold">
                <span>Conocer la plataforma</span>
                <ArrowRight className="w-4 h-4" />
              </CrystalButton>
            </Link>
            <CrystalButton variant="ghost" onClick={() => openIsabella()} className="px-7 py-3.5 text-sm font-semibold">
              <Sparkles className="w-4 h-4 text-[#0d4652]" />
              <span>Hablar con Isabella</span>
            </CrystalButton>
          </div>
          <GradientDivider className="mt-8" />
          <p className="font-rdm-mono text-[10px] tracking-widest text-[#536b86]">
            NODO CERO · RDM DIGITAL · REAL DEL MONTE, HIDALGO
          </p>
        </div>
      </section>

      {/* ================= PIE INSTITUCIONAL ================= */}
      <footer className="mt-20 border-t border-[#d5d9d3] bg-[#eef0ea]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0d4652] text-white">
                <Landmark className="h-4 w-4" />
              </span>
              <span className="font-patrimonial text-base font-bold text-[#082f3b]">Real del Monte</span>
            </div>
            <p className="text-xs leading-relaxed text-[#536b86]">
              Destino turístico inteligente del Pueblo Mágico de Hidalgo: patrimonio, cultura, economía phygital y gobernanza soberana.
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-rdm-mono text-[10px] uppercase tracking-[0.28em] text-[#536b86]">Oficina Virtual</p>
            {OFICINA_VIRTUAL.map((c) => (
              <a
                key={c.title}
                href="#virtual"
                onClick={(e) => {
                  e.preventDefault();
                  openIsabella(c.description);
                }}
                className="block text-xs text-[#536b86] transition-colors hover:text-[#0d4652]"
              >
                {c.title}
              </a>
            ))}
          </div>

          <div className="space-y-2">
            <p className="font-rdm-mono text-[10px] uppercase tracking-[0.28em] text-[#536b86]">Explora</p>
            {NAV_ITEMS.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(n.href.slice(1));
                }}
                className="block text-xs text-[#536b86] transition-colors hover:text-[#0d4652]"
              >
                {n.label}
              </a>
            ))}
          </div>

          <div className="space-y-2">
            <p className="font-rdm-mono text-[10px] uppercase tracking-[0.28em] text-[#536b86]">Gobernanza y tecnología</p>
            <Link href="/nodo?view=crown-gateway" className="block text-xs text-[#536b86] transition-colors hover:text-[#0d4652]">
              CROWN Gateway — IA federada
            </Link>
            <Link href="/nodo?view=city" className="block text-xs text-[#536b86] transition-colors hover:text-[#0d4652]">
              Ciudad IOC
            </Link>
            <Link href="/nodo?view=twins" className="block text-xs text-[#536b86] transition-colors hover:text-[#0d4652]">
              Gemelo territorial DTDL
            </Link>
            <Link href="/nodo" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0d4652] hover:underline">
              <Cpu className="h-3.5 w-3.5" />
              Núcleo tecnológico del Nodo Cero
            </Link>
          </div>
        </div>
        <div className="border-t border-[#d5d9d3]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-5">
            <p className="font-rdm-mono text-[10px] tracking-widest text-[#536b86]">
              RDM DIGITAL HUB · NODO CERO · TAMV ONLINE NETWORK
            </p>
            <p className="font-rdm-mono text-[10px] tracking-widest text-[#536b86]">
              REAL DEL MONTE, HIDALGO, MÉXICO
            </p>
          </div>
        </div>
      </footer>

      {/* Asistente Isabella AI flotante */}
      <IsabellaChat
        isOpen={isabellaOpen}
        onClose={() => setIsabellaOpen(false)}
        initialPrompt={isabellaInitialPrompt}
      />
    </main>
  );
}