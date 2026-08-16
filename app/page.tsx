"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Ticket,
  Compass,
  UtensilsCrossed,
  Palette,
  Ghost,
  BookMarked,
  MessagesSquare,
  Heart,
  Store,
  Map,
  Building2,
  ShieldCheck,
  Accessibility,
  Globe,
  Landmark,
} from "lucide-react";
import AtmosphericHero from "@/components/rdm/atmosphere/AtmosphericHero";
import FloatingNav from "@/components/rdm/navigation/FloatingNav";
import IntentMenu from "@/components/rdm/navigation/IntentMenu";
import TerritoryStatusBar from "@/components/rdm/telemetry/TerritoryStatusBar";
import ExperienceCard, { ExperienceItem } from "@/components/rdm/discovery/ExperienceCard";
import DigitalPassport from "@/components/rdm/passport/DigitalPassport";
import SectionHeader from "@/components/rdm/layout/SectionHeader";
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

/* ================================================================== */
/* Portada cinematográfica — tema único de manto petrolero profundo.   */
/* Fondo negro-petróleo en todo el sitio, texto platino perla, datos   */
/* vivos en azul eléctrico y CTA en naranja. Sin discontinuidad.       */
/* Núcleo técnico vive en /nodo con deep-links.                        */
/* ================================================================== */

const EXPERIENCIAS: ExperienceItem[] = [
  {
    id: "acosta",
    title: "Mina de Acosta",
    category: "Patrimonio minero",
    description: "Desciende a la memoria subterránea de la Real de Minas.",
    image: "/images/mina-acosta.jpg",
    tone: "#d97832",
  },
  {
    id: "panteon",
    title: "Panteón Inglés",
    category: "Patrimonio",
    description: "La calma de una historia que llegó desde Cornwall.",
    image: "/images/pedro-romero.jpg",
    tone: "#0d4652",
  },
  {
    id: "penas",
    title: "Peñas Cargadas",
    category: "Naturaleza",
    description: "El sendero que se abre a la montaña y a la niebla.",
    image: "/images/penas-cargadas.jpg",
    tone: "#2e9cff",
  },
  {
    id: "mirador",
    title: "Mirador Purísima",
    category: "Mirador",
    description: "La luz baja sobre las casas que aprendieron a resistir.",
    image: "/images/mirador-purisima.jpg",
    tone: "#93a5ad",
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
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen bg-[#081119] text-[#e8edef]">
      <FloatingNav onOpenIsabella={() => openIsabella()} onSearch={() => scrollTo("explora")} />

      {/* 01 · HERO TEMPORAL — observatorio del destino */}
      <AtmosphericHero
        onOpenIsabella={() => openIsabella()}
        onExplore={() => scrollTo("explora")}
      />

      {/* 02 · TELEMETRÍA ÚTIL — sobre el hero */}
      <div className="rdm-shell relative z-20 -mt-16 px-6">
        <TerritoryStatusBar />
      </div>

      {/* 03 · EXPLORA SEGÚN TU DESEO */}
      <section id="explora" className="rdm-section rdm-shell scroll-mt-24 px-6">
        <SectionHeader
          meta="Explora según tu deseo"
          title="¿Qué quieres vivir hoy?"
          description="Elige por intención: historia, caminata, comida, naturaleza o memoria sonora."
        />
        <IntentMenu
          onNavigate={(view) => {
            if (view === "map") scrollTo("mapa");
            else openIsabella(`Quiero explorar: ${view}`);
          }}
        />
      </section>

      {/* 04 · MAPA VIVO */}
      <section id="mapa" className="rdm-section rdm-shell scroll-mt-24 px-6">
        <SectionHeader
          meta="Mapa vivo del territorio"
          title="Capas, rutas y descubrimiento"
          description="Patrimonio, gastronomía, naturaleza y accesibilidad sobre la cartografía soberana del pueblo."
          action={
            <Link href="/nodo?view=map">
              <span className="rdm-button-secondary">
                <Map className="h-4 w-4" />
                Mapa 2D/3D <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          }
        />
        <MapHub />
      </section>

      {/* 05 · EXPERIENCIAS DESTACADAS */}
      <section className="rdm-section rdm-shell scroll-mt-24 px-6">
        <SectionHeader
          meta="Experiencias del territorio"
          title="Lugares que se interpretan"
          action={
            <Link href="/nodo?view=tourism">
              <span className="rdm-button-secondary">
                Ver todas <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          }
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {EXPERIENCIAS.map((item) => (
            <ExperienceCard
              key={item.id}
              item={item}
              onExplore={(it) => openIsabella(`Cuéntame sobre ${it.title}`)}
            />
          ))}
        </div>
      </section>

      {/* 06 · RUTAS DE MEMORIA */}
      <section id="rutas" className="rdm-section rdm-shell scroll-mt-24 px-6">
        <SectionHeader
          meta="Rutas de memoria"
          title="Recorridos del territorio"
          action={
            <Link href="/nodo?view=tourism">
              <span className="rdm-button-secondary">
                <Compass className="h-4 w-4" />
                Explorar rutas <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          }
        />
        <TourismSection />
      </section>

      {/* 07 · SABORES Y OFICIOS */}
      <section id="sabores" className="rdm-section rdm-shell scroll-mt-24 px-6">
        <SectionHeader
          meta="Sabores y oficios locales"
          title="Comercios con identidad"
          action={
            <Link href="/nodo?view=marketplace">
              <span className="rdm-button-secondary">
                <UtensilsCrossed className="h-4 w-4" />
                Marketplace <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          }
        />
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#d97832]">
              <UtensilsCrossed className="h-4 w-4" /> Gastronomía del Monte
            </h3>
            <GastronomySection />
          </div>
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#2e9cff]">
              <Store className="h-4 w-4" /> Negocios con sello RDM
            </h3>
            <BusinessPortal />
          </div>
        </div>
      </section>

      {/* 08 · ARCHIVO VIVO */}
      <section id="archivo" className="rdm-section rdm-shell scroll-mt-24 px-6">
        <SectionHeader
          meta="Archivo vivo del Real"
          title="La memoria no está detrás de un vidrio"
          description="Arte y artesanos, leyendas, archivo histórico y galería compartida del pueblo."
        />
        <ArtSection />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-[#eef2f2]">
              <Ghost className="h-4 w-4 text-[#2e9cff]" />
              Historia, mitos y leyendas
            </h4>
            <LegendsSection />
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-[#eef2f2]">
              <BookMarked className="h-4 w-4 text-[#d97832]" />
              Archivo Histórico del Real
            </h4>
            <ArchiveView />
          </div>
        </div>
        <div className="mt-8 space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-[#eef2f2]">
            <Palette className="h-4 w-4 text-[#93a5ad]" />
            Galería compartida
          </h4>
          <GallerySection />
        </div>
      </section>

      {/* 09 · PASAPORTE RDM */}
      <section id="pasaporte" className="rdm-section rdm-shell scroll-mt-24 px-6">
        <SectionHeader
          meta="Pasaporte RDM"
          title="Tu visita como bitácora minera"
          description="Sellos, fragmentos de mapa y audios que reúnes al recorrer el pueblo."
        />
        <DigitalPassport
          onNavigate={(view) => {
            if (view === "pasaporte") openIsabella("Muéstrame mi pasaporte RDM");
          }}
        />
      </section>

      {/* 10 · AGENDA */}
      <section id="agenda" className="rdm-section rdm-shell scroll-mt-24 px-6">
        <SectionHeader
          meta="Agenda del destino"
          title="Qué ocurre hoy"
          action={
            <Link href="/nodo?view=tourism">
              <span className="rdm-button-secondary">
                <Ticket className="h-4 w-4" />
                Ver agenda <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          }
        />
        <PhygitalMarketplace />
      </section>

      {/* 11 · COMUNIDAD */}
      <section id="comunidad" className="rdm-section rdm-shell scroll-mt-24 px-6">
        <SectionHeader
          meta="Comunidad del Real"
          title="El pueblo que se cuenta"
          description="Foro, muro de honor y registro de vecinos, negocios y artesanos."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-[#eef2f2]">
              <MessagesSquare className="h-4 w-4 text-[#2e9cff]" />
              Foro del Real
            </h4>
            <ForumSection />
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-[#eef2f2]">
              <Heart className="h-4 w-4 text-[#d97832]" />
              Muro de honor
            </h4>
            <HonorWallSection />
          </div>
        </div>
        <div className="mt-8">
          <RegisterSection />
        </div>
      </section>

      {/* 12 · COMPROMISO TERRITORIAL */}
      <section className="rdm-section rdm-shell px-6">
        <div className="rdm-glass overflow-hidden rounded-[2rem]">
          <div className="grid gap-8 p-8 md:grid-cols-2 md:p-12">
            <div className="space-y-4">
              <p className="rdm-meta text-[#2e9cff]">Compromiso territorial</p>
              <h2 className="rdm-display-md font-display text-white">
                Soberanía de los datos del pueblo
              </h2>
              <p className="text-sm leading-relaxed text-[#93a5ad]">
                Los datos son locales, trazables y con consentimiento. La instrumentación del
                territorio (clima, aforo, movilidad) está en integración y se publicará con
                estimaciones responsables y declaradas.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="rdm-chip">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#2e9cff]" /> Datos soberanos
                </span>
                <span className="rdm-chip">
                  <Accessibility className="h-3.5 w-3.5 text-[#2e9cff]" /> Accesibilidad integrada
                </span>
                <span className="rdm-chip">
                  <Globe className="h-3.5 w-3.5 text-[#d97832]" /> ES · EN
                </span>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-4">
              <Link href="/nodo?view=crown-gateway">
                <span className="rdm-button-secondary w-full justify-start">
                  <Building2 className="h-4 w-4" />
                  CROWN Gateway — IA federada <ArrowRight className="ml-auto h-4 w-4" />
                </span>
              </Link>
              <Link href="/nodo?view=city">
                <span className="rdm-button-secondary w-full justify-start">
                  <Store className="h-4 w-4" />
                  Centro de operaciones del destino <ArrowRight className="ml-auto h-4 w-4" />
                </span>
              </Link>
              <Link href="/nodo">
                <span className="rdm-button-primary w-full justify-start">
                  Núcleo tecnológico del Nodo Cero <ArrowRight className="ml-auto h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 13 · IDENTIDAD */}
      <section className="rdm-section rdm-shell px-6">
        <div className="text-center">
          <p className="rdm-meta text-[#d97832]">Autoría e identidad</p>
          <p className="rdm-display-lg font-display text-[#eef2f2] mt-3">
            Anubis Villaseñor
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.28em] text-[#647a84]">
            Sistemas territoriales · Inteligencia cognitiva · Gobernanza digital · Experiencias inmersivas
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <button onClick={() => openIsabella()} className="rdm-button-primary">
              <Sparkles className="h-4 w-4" />
              Hablar con Isabella
            </button>
            <Link href="/nodo?view=about">
              <span className="rdm-button-secondary">Conocer la plataforma</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Pie institucional */}
      <footer className="border-t border-white/10 bg-[#050c12]">
        <div className="rdm-shell grid gap-10 px-6 py-14 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0d4652] text-white">
                <Landmark className="h-4 w-4" />
              </span>
              <span className="font-display text-base font-bold text-[#eef2f2]">Real del Monte</span>
            </div>
            <p className="text-xs leading-relaxed text-[#93a5ad]">
              Destino turístico inteligente del Pueblo Mágico de Hidalgo: patrimonio,
              cultura, economía phygital y gobernanza soberana.
            </p>
          </div>
          <div className="space-y-2">
            <p className="rdm-meta text-[#d97832]">Oficina Virtual</p>
            <button onClick={() => openIsabella()} className="block text-xs text-[#c9d0d4] transition-colors hover:text-white">
              Asistente IA Isabella
            </button>
            <a href="#rutas" onClick={(e) => { e.preventDefault(); scrollTo("rutas"); }} className="block text-xs text-[#c9d0d4] transition-colors hover:text-white">
              Rutas y turismo
            </a>
            <a href="#mapa" onClick={(e) => { e.preventDefault(); scrollTo("mapa"); }} className="block text-xs text-[#c9d0d4] transition-colors hover:text-white">
              Mapa interactivo
            </a>
            <a href="#pasaporte" onClick={(e) => { e.preventDefault(); scrollTo("pasaporte"); }} className="block text-xs text-[#c9d0d4] transition-colors hover:text-white">
              Pasaporte RDM
            </a>
          </div>
          <div className="space-y-2">
            <p className="rdm-meta text-[#d97832]">Explora</p>
            <a href="#sabores" onClick={(e) => { e.preventDefault(); scrollTo("sabores"); }} className="block text-xs text-[#c9d0d4] transition-colors hover:text-white">
              Sabores y oficios
            </a>
            <a href="#archivo" onClick={(e) => { e.preventDefault(); scrollTo("archivo"); }} className="block text-xs text-[#c9d0d4] transition-colors hover:text-white">
              Archivo vivo
            </a>
            <a href="#agenda" onClick={(e) => { e.preventDefault(); scrollTo("agenda"); }} className="block text-xs text-[#c9d0d4] transition-colors hover:text-white">
              Agenda
            </a>
            <a href="#comunidad" onClick={(e) => { e.preventDefault(); scrollTo("comunidad"); }} className="block text-xs text-[#c9d0d4] transition-colors hover:text-white">
              Comunidad
            </a>
          </div>
          <div className="space-y-2">
            <p className="rdm-meta text-[#d97832]">Gobernanza y tecnología</p>
            <Link href="/nodo?view=crown-gateway" className="block text-xs text-[#c9d0d4] transition-colors hover:text-white">
              CROWN Gateway — IA federada
            </Link>
            <Link href="/nodo?view=city" className="block text-xs text-[#c9d0d4] transition-colors hover:text-white">
              Ciudad IOC
            </Link>
            <Link href="/nodo?view=twins" className="block text-xs text-[#c9d0d4] transition-colors hover:text-white">
              Gemelo territorial DTDL
            </Link>
            <Link href="/nodo" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#d97832] hover:underline">
              Núcleo tecnológico <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="rdm-shell flex flex-wrap items-center justify-between gap-3 px-6 py-5">
            <p className="rdm-meta text-[#647a84]">
              RDM Digital Hub · Nodo Cero · TAMV Online Network
            </p>
            <p className="rdm-meta text-[#647a84]">
              Real del Monte, Hidalgo, México
            </p>
          </div>
        </div>
      </footer>

      {/* Isabella AI flotante */}
      <IsabellaChat
        isOpen={isabellaOpen}
        onClose={() => setIsabellaOpen(false)}
        initialPrompt={isabellaInitialPrompt}
      />
    </main>
  );
}