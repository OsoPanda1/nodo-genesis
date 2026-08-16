"use client";

import React, { useState } from "react";
import YUNLayout from "@/components/layout/YUNLayout";
import CrystalHero3D from "@/components/3d/CrystalHero3D";
import DigitalTwinMap from "@/components/map/DigitalTwinMap";
import MapHub from "@/components/map/MapHub";
import { TenochtitlanDashboard } from "@/components/monitoring/TenochtitlanDashboard";
import VisualEffectsDemo from "@/components/effects/VisualEffectsDemo";
import IsabellaChat from "@/components/isabella/IsabellaChat";
import TelemetryDashboard from "@/components/telemetry/TelemetryDashboard";
import PhygitalMarketplace from "@/components/phygital/PhygitalMarketplace";
import PostQuantumSecurity from "@/components/security/PostQuantumSecurity";
import NodeDetailView from "@/components/nodes/NodeDetailView";
import TourismSection from "@/components/tourism/TourismSection";
import ArtSection from "@/components/art/ArtSection";
import GastronomySection from "@/components/gastronomy/GastronomySection";
import BusinessPortal from "@/components/business/BusinessPortal";
import MediaSection from "@/components/media/MediaSection";
import GamificationSection from "@/components/gamification/GamificationSection";
import ZombiesInvasionSection from "@/components/gamification/ZombiesInvasionSection";
import LegendsSection from "@/components/legends/LegendsSection";
import HeritageSection from "@/components/heritage/HeritageSection";
import ForumSection from "@/components/forum/ForumSection";
import HonorWallSection from "@/components/honor/HonorWallSection";
import GallerySection from "@/components/gallery/GallerySection";
import AboutSection from "@/components/about/AboutSection";
import CrownGatewaySection from "@/components/gateway/CrownGatewaySection";
import { ArchiveView } from "@/components/archive/ArchiveView";
import { ArchiveAdminPanel } from "@/components/archive/ArchiveAdminPanel";
import { TwinsDashboard } from "@/components/twins/TwinsDashboard";
import { CityDashboard } from "@/components/city/CityDashboard";
import { AssetDashboard } from "@/components/assets/AssetDashboard";
import { GridDashboard } from "@/components/grid/GridDashboard";
import { MarketplaceDashboard } from "@/components/marketplace/MarketplaceDashboard";
import PaymentsSection from "@/components/payments/PaymentsSection";
import RegisterSection from "@/components/register/RegisterSection";
import { StatPill } from "@/components/design-system/StatPill";
import { MetallicHeading } from "@/components/design-system/MetallicHeading";
import { GradientDivider } from "@/components/design-system/GradientDivider";
import { CrystalButton } from "@/components/design-system/CrystalButton";
import { YUN_CORES, RDM_NODES_35, YUNNode } from "@/lib/data/rdm-data";
import {
  Activity, ArrowRight, Lock, Sparkles, Compass, Users, Landmark,
  Map, Box, Cpu, Zap, Radio, Key, Network, UtensilsCrossed,
  Palette, BookMarked,
} from "lucide-react";
import AAACinematicIntro from "@/components/intro/AAACinematicIntro";
import DynamicTourismHero from "@/components/hero/DynamicTourismHero";

export default function RDMDigitalHubHome() {
  const [activeView, setActiveView] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const v = new URLSearchParams(window.location.search).get("view");
      if (v) return v;
    }
    return "home";
  });
  const [selectedNode, setSelectedNode] = useState<YUNNode | null>(null);
  const [isabellaOpen, setIsabellaOpen] = useState<boolean>(false);
  const [isabellaInitialPrompt, setIsabellaInitialPrompt] = useState<string>("");
  const [showIntro, setShowIntro] = useState<boolean>(true);


  const quickJourneys = [
    {
      id: "tourism",
      title: "Turismo, rutas y ecoturismo",
      description: "Rutas mineras y de naturaleza, eventos, leyendas y la vida del pueblo mágico.",
      icon: <Compass className="w-5 h-5" />,
      accent: "#0d4652",
    },
    {
      id: "gastronomy",
      title: "Gastronomía del Monte",
      description: "Pastes, mixiotes, pan de pulque y café de altura de las pasteadoras históricas.",
      icon: <UtensilsCrossed className="w-5 h-5" />,
      accent: "#c89a45",
    },
    {
      id: "art",
      title: "Arte, historia y archivo",
      description: "Artesanos, leyendas, música y el Archivo Histórico de la Real de Minas.",
      icon: <Palette className="w-5 h-5" />,
      accent: "#d97832",
    },
    {
      id: "register",
      title: "Unirme a la comunidad",
      description: "Foro, muro de honor y registro de vecinos y negocios del Real.",
      icon: <Users className="w-5 h-5" />,
      accent: "#3f9b78",
    },
  ];

  const techAccess = [
    { id: "map", label: "Mapa 2D/3D", description: "Gemelo phygital del pueblo", icon: <Map className="w-4 h-4" />, accent: "#0d4652" },
    { id: "twins", label: "Gemelo DTDL", description: "Objetos digitales del territorio", icon: <Box className="w-4 h-4" />, accent: "#2e9cff" },
    { id: "city", label: "Ciudad IOC", description: "Centro de operaciones urbano", icon: <Activity className="w-4 h-4" />, accent: "#536b86" },
    { id: "tenochtitlan", label: "Tenochtitlan", description: "Dashboard territorial", icon: <Landmark className="w-4 h-4" />, accent: "#8a6d3b" },
    { id: "grid", label: "Smart Grid / Agua", description: "Energía y agua de la comarca", icon: <Zap className="w-4 h-4" />, accent: "#c89a45" },
    { id: "eam", label: "EAM / APM", description: "Activos y mantenimiento", icon: <Cpu className="w-4 h-4" />, accent: "#3f9b78" },
    { id: "telemetry", label: "Telemetría", description: "Sensores y señales en vivo", icon: <Radio className="w-4 h-4" />, accent: "#d97832" },
    { id: "security", label: "Criptografía PQC", description: "Seguridad post-cuántica", icon: <Key className="w-4 h-4" />, accent: "#b23a48" },
    { id: "crown-gateway", label: "CROWN Gateway", description: "IA federada del Nodo", icon: <Network className="w-4 h-4" />, accent: "#6b4a8f" },
    { id: "archive-admin", label: "Gestión del Archivo", description: "Administración de piezas", icon: <BookMarked className="w-4 h-4" />, accent: "#0d4652" },
  ];

  const handleOpenIsabellaWithPrompt = (prompt: string) => {
    setIsabellaInitialPrompt(prompt);
    setIsabellaOpen(true);
  };

  const handleSelectNode = (node: YUNNode) => {
    setSelectedNode(node);
    setActiveView("node-detail");
  };

  return (
    <>
      {showIntro && <AAACinematicIntro onComplete={() => setShowIntro(false)} />}
      <YUNLayout
        activeView={activeView}
        setActiveView={(view) => {
          setActiveView(view);
          if (view !== "node-detail") setSelectedNode(null);
        }}
        selectedNode={selectedNode}
        onSelectNode={handleSelectNode}
        onOpenIsabella={() => setIsabellaOpen(true)}
        isabellaOpen={isabellaOpen}
      >
        {/* 1. NODE DETAIL VIEW */}
      {activeView === "node-detail" && selectedNode && (
        <NodeDetailView
          node={selectedNode}
          onBack={() => setActiveView("home")}
          onOpenIsabella={() => setIsabellaOpen(true)}
        />
      )}

      {/* 2. MAP VIEW — hub 3D / SVG / 2D */}
      {activeView === "map" && (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
          <MapHub />
        </div>
      )}

      {/* 2b. DASHBOARD TENOCHTITLAN VIEW */}
      {activeView === "tenochtitlan" && (
        <TenochtitlanDashboard onBack={() => setActiveView("home")} />
      )}

      {/* 2c. GALERÍA DE EFECTOS VISUALES VIEW */}
      {activeView === "visual-effects" && (
        <div className="min-h-[calc(100vh-4rem)]">
          <VisualEffectsDemo />
        </div>
      )}

      {/* 3. TOURISM VIEW */}
      {activeView === "tourism" && (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
          <TourismSection />
        </div>
      )}

      {/* 4. MARKETPLACE VIEW */}
      {activeView === "marketplace" && (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
          <PhygitalMarketplace />
        </div>
      )}

      {/* 5. TELEMETRY VIEW */}
      {activeView === "telemetry" && (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
          <TelemetryDashboard />
        </div>
      )}

      {/* 6. SECURITY VIEW */}
      {activeView === "security" && (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
          <PostQuantumSecurity />
        </div>
      )}

      {/* 7. ART VIEW */}
      {activeView === "art" && (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
          <ArtSection />
        </div>
      )}

      {/* 8. GASTRONOMY VIEW */}
      {activeView === "gastronomy" && (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
          <GastronomySection />
        </div>
      )}

      {/* 9. BUSINESS VIEW */}
      {activeView === "business" && (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
          <BusinessPortal />
        </div>
      )}

      {/* 10. MEDIA VIEW */}
      {activeView === "media" && (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
          <MediaSection />
        </div>
      )}

      {/* 11. GAMIFICATION VIEW */}
      {activeView === "gamification" && (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
          <GamificationSection />
        </div>
      )}

      {/* 11b. ZOMBIES RDM INVASION VIEW */}
      {activeView === "zombies" && (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
          <ZombiesInvasionSection onAskIsabella={handleOpenIsabellaWithPrompt} />
        </div>
      )}

      {/* 12. LEGENDS VIEW */}
      {activeView === "legends" && (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
          <LegendsSection />
        </div>
      )}

      {/* 12c. HERITAGE VIEW — dossier de historia y cultura */}
      {activeView === "heritage" && (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
          <HeritageSection />
        </div>
      )}

      {/* 12b. ARCHIVO HISTÓRICO VIEW */}
      {activeView === "archive" && (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
          <ArchiveView />
        </div>
      )}

      {/* 12c. GESTIÓN DEL ARCHIVO VIEW */}
      {activeView === "archive-admin" && (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
          <ArchiveAdminPanel />
        </div>
      )}

      {/* 13. FORUM VIEW */}
      {activeView === "forum" && (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
          <ForumSection />
        </div>
      )}

      {/* 14. HONOR VIEW */}
      {activeView === "honor" && (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
          <HonorWallSection />
        </div>
      )}

      {/* 15. GALLERY VIEW */}
      {activeView === "gallery" && (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
          <GallerySection />
        </div>
      )}

      {/* 15b. CROWN GATEWAY VIEW */}
      {activeView === 'crown-gateway' && (
        <div className="p-6 md:p-10 space-y-6 max-w-7xl mx-auto">
          <CrownGatewaySection />
        </div>
      )}

      {/* 15c. GEMELO TERRITORIAL (TWINS) VIEW */}
      {activeView === "twins" && (
        <div className="plano-tecnico min-h-[calc(100vh-4rem)]">
          <TwinsDashboard />
        </div>
      )}

      {/* 15d. CIUDAD IOC VIEW */}
      {activeView === "city" && (
        <div className="plano-tecnico min-h-[calc(100vh-4rem)]">
          <CityDashboard />
        </div>
      )}

      {/* 15e. EAM / APM VIEW */}
      {activeView === "eam" && (
        <div className="plano-tecnico min-h-[calc(100vh-4rem)]">
          <AssetDashboard />
        </div>
      )}

      {/* 15f. SMART GRID / AGUA VIEW */}
      {activeView === "grid" && (
        <div className="plano-tecnico min-h-[calc(100vh-4rem)]">
          <GridDashboard />
        </div>
      )}

      {/* 15g. MARKETPLACE DIGITAL VIEW */}
      {activeView === "digital-marketplace" && (
        <div className="plano-tecnico min-h-[calc(100vh-4rem)]">
          <MarketplaceDashboard />
        </div>
      )}

      {/* 15h. PAGOS Y DONACIONES VIEW */}
      {activeView === "payments" && (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
          <PaymentsSection />
        </div>
      )}

      {/* 15i. REGISTRO DE VECINOS Y NEGOCIOS VIEW */}
      {activeView === "register" && (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
          <RegisterSection />
        </div>
      )}

      {/* 16. ABOUT VIEW */}
      {activeView === "about" && (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
          <AboutSection />
        </div>
      )}

      {/* 17. MAIN HOME VIEW — vitrina turística y cultural; lo tecnológico en segundo plano */}
      {activeView === "home" && (
        <div className="space-y-16 pb-20">
          {/* Hero Turístico Dinámico de Ultra-Lujo */}
          <section className="max-w-7xl mx-auto px-4 pt-4">
            <DynamicTourismHero
              onOpenIsabella={() => setIsabellaOpen(true)}
              onReplayIntro={() => setShowIntro(true)}
              onNavigate={(view) => setActiveView(view)}
            />
          </section>

          {/* Guía rápida: turismo, cultura, gastronomía, comercio y comunidad */}
          <section className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
            <div className="rounded-[2rem] border border-white/70 bg-white/82 p-5 shadow-[0_24px_80px_rgba(13,70,82,0.14)] backdrop-blur-2xl">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="space-y-1">
                  <p className="font-rdm-mono text-[10px] uppercase tracking-[0.28em] text-[#c89a45]">Entrada inteligente</p>
                  <h2 className="font-patrimonial text-2xl font-bold text-[#082f3b]">¿Qué quieres vivir hoy en el Real?</h2>
                  <p className="max-w-2xl text-sm leading-relaxed text-[#536b86]">
                    Turismo, ecoturismo, gastronomía, arte, comercio local y comunidad van primero. La operación tecnológica del territorio queda en segundo plano, abajo.
                  </p>
                </div>
                <CrystalButton variant="ghost" onClick={() => setIsabellaOpen(true)} className="px-5 py-3 text-xs font-bold">
                  <Sparkles className="w-4 h-4 text-[#0d4652]" />
                  <span>Necesito guía personalizada</span>
                </CrystalButton>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {quickJourneys.map((journey) => (
                  <button
                    key={journey.id}
                    onClick={() => setActiveView(journey.id)}
                    className="group rounded-2xl border border-[#c9d0d4]/70 bg-[#fbfcfa]/88 p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(13,70,82,0.12)]"
                  >
                    <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-sm" style={{ background: journey.accent }}>
                      {journey.icon}
                    </span>
                    <span className="block font-patrimonial text-base font-bold text-[#082f3b]">{journey.title}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-[#536b86]">{journey.description}</span>
                    <span className="mt-3 inline-flex items-center gap-1 font-rdm-mono text-[10px] font-bold uppercase tracking-widest" style={{ color: journey.accent }}>
                      Entrar <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Banda de indicadores del pueblo — cápsulas de cristal */}
          <section className="max-w-7xl mx-auto px-6 -mt-14 relative z-10">
            <div className="crystal-card p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatPill value="8" label="Fiestas y tradiciones" sub="del calendario anual del pueblo" color="#d97832" />
                <StatPill value="5" label="Rutas turísticas" sub="minas, gastronomía y ecoturismo" color="#0d4652" />
                <StatPill value="10" label="Negocios con sello RDM" sub="pastes, plata .925 y café de altura" color="#c89a45" />
                <StatPill value="500" label="Años de historia" sub="De la Real de Minas a 2026" color="#3f9b78" />
              </div>
            </div>
          </section>

          {/* Turismo, ecoturismo y rutas */}
          <section className="max-w-7xl mx-auto px-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <MetallicHeading as="h3" className="text-2xl sm:text-3xl">
                  Turismo, ecoturismo y rutas del Real
                </MetallicHeading>
                <p className="text-xs text-slate-600 font-mono">
                  Feria del Paste, Semana Cornish, rutas mineras y de naturaleza, y los dichos que guardan la memoria del pueblo.
                </p>
              </div>
              <button
                onClick={() => setActiveView("tourism")}
                className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-700 hover:text-[#082f3b] text-xs font-mono font-semibold transition-all flex items-center gap-2"
              >
                <span>Explorar turismo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <TourismSection />
          </section>

          {/* Gastronomía del Monte */}
          <section className="max-w-7xl mx-auto px-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <MetallicHeading as="h3" className="text-2xl sm:text-3xl">
                  Gastronomía del Monte
                </MetallicHeading>
                <p className="text-xs text-slate-600 font-mono">
                  Pastes de papa y frijol, mixiotes, pan de pulque y café de altura: la cocina minera en la mesa.
                </p>
              </div>
              <button
                onClick={() => setActiveView("gastronomy")}
                className="px-4 py-2 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-700 hover:text-[#082f3b] text-xs font-mono font-semibold transition-all flex items-center gap-2"
              >
                <span>Ver gastronomía</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <GastronomySection />
          </section>

          {/* Arte y artesanos */}
          <section className="max-w-7xl mx-auto px-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <MetallicHeading as="h3" className="text-2xl sm:text-3xl">
                  Arte y artesanos del pueblo
                </MetallicHeading>
                <p className="text-xs text-slate-600 font-mono">
                  Platería .925, textiles, alebrijes mineros y el taller de la tradición viva del Real.
                </p>
              </div>
              <button
                onClick={() => setActiveView("art")}
                className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-700 hover:text-[#082f3b] text-xs font-mono font-semibold transition-all flex items-center gap-2"
              >
                <span>Ver arte</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <ArtSection />
          </section>

          {/* Historia, mitos y leyendas */}
          <section className="max-w-7xl mx-auto px-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <MetallicHeading as="h3" className="text-2xl sm:text-3xl">
                  Historia, mitos y leyendas
                </MetallicHeading>
                <p className="text-xs text-slate-600 font-mono">
                  Del Mineral del Monte a la Semana Cornish: la memoria viva que hace único al pueblo.
                </p>
              </div>
              <button
                onClick={() => setActiveView("legends")}
                className="px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-700 hover:text-[#082f3b] text-xs font-mono font-semibold transition-all flex items-center gap-2"
              >
                <span>Ver leyendas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <LegendsSection />
          </section>

          {/* Archivo Histórico */}
          <section className="max-w-7xl mx-auto px-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <MetallicHeading as="h3" className="text-2xl sm:text-3xl">
                  Archivo Histórico del Real
                </MetallicHeading>
                <p className="text-xs text-slate-600 font-mono">
                  Documentos, mapas, fotografías y memoria oral de la Real de Minas, preservados para el pueblo.
                </p>
              </div>
              <button
                onClick={() => setActiveView("archive")}
                className="px-4 py-2 rounded-xl bg-amber-700/20 border border-amber-700/40 text-amber-900 hover:text-[#082f3b] text-xs font-mono font-semibold transition-all flex items-center gap-2"
              >
                <span>Ver archivo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <ArchiveView />
          </section>

          {/* Música y podcast */}
          <section className="max-w-7xl mx-auto px-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <MetallicHeading as="h3" className="text-2xl sm:text-3xl">
                  Música y podcast
                </MetallicHeading>
                <p className="text-xs text-slate-600 font-mono">
                  Sonidos, cantos mineros y relatos sonoros de la comarca.
                </p>
              </div>
              <button
                onClick={() => setActiveView("media")}
                className="px-4 py-2 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-700 hover:text-[#082f3b] text-xs font-mono font-semibold transition-all flex items-center gap-2"
              >
                <span>Escuchar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <MediaSection />
          </section>

          {/* Galería */}
          <section className="max-w-7xl mx-auto px-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <MetallicHeading as="h3" className="text-2xl sm:text-3xl">
                  Galería compartida
                </MetallicHeading>
                <p className="text-xs text-slate-600 font-mono">
                  Fotografías y miradas de quienes viven y visitan el pueblo.
                </p>
              </div>
              <button
                onClick={() => setActiveView("gallery")}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 hover:text-[#082f3b] text-xs font-mono font-semibold transition-all flex items-center gap-2"
              >
                <span>Ver galería</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <GallerySection />
          </section>

          {/* Economía local — negocios */}
          <section className="max-w-7xl mx-auto px-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <MetallicHeading as="h3" className="text-2xl sm:text-3xl">
                  Comercio local con sello RDM
                </MetallicHeading>
                <p className="text-xs text-slate-600 font-mono">
                  Negocios verificados del pueblo: pastes, platería, café, panaderías, hospedaje y artesanías.
                </p>
              </div>
              <button
                onClick={() => setActiveView("business")}
                className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-700 hover:text-[#082f3b] text-xs font-mono font-semibold transition-all flex items-center gap-2"
              >
                <span>Ver catálogo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <BusinessPortal />
          </section>

          {/* Marketplace de pastes y plata */}
          <section className="max-w-7xl mx-auto px-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <MetallicHeading as="h3" className="text-2xl sm:text-3xl">
                  Pastes y platería ley .925
                </MetallicHeading>
                <p className="text-xs text-slate-600 font-mono">
                  Experiencias y productos territoriales verificados, listos para disfrutar.
                </p>
              </div>
              <button
                onClick={() => setActiveView("marketplace")}
                className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-700 hover:text-[#082f3b] text-xs font-mono font-semibold transition-all flex items-center gap-2"
              >
                <span>Ir al marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <PhygitalMarketplace />
          </section>

          {/* Comunidad — foro */}
          <section className="max-w-7xl mx-auto px-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <MetallicHeading as="h3" className="text-2xl sm:text-3xl">
                  Foro del Real
                </MetallicHeading>
                <p className="text-xs text-slate-600 font-mono">
                  La conversación del pueblo: avisos, historia, gastronomía y vida cotidiana.
                </p>
              </div>
              <button
                onClick={() => setActiveView("forum")}
                className="px-4 py-2 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-700 hover:text-[#082f3b] text-xs font-mono font-semibold transition-all flex items-center gap-2"
              >
                <span>Entrar al foro</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <ForumSection />
          </section>

          {/* Comunidad — muro de honor */}
          <section className="max-w-7xl mx-auto px-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <MetallicHeading as="h3" className="text-2xl sm:text-3xl">
                  Muro de honor
                </MetallicHeading>
                <p className="text-xs text-slate-600 font-mono">
                  Reconocimientos a vecinas, vecinos, artesanos y guardianes del Nodo.
                </p>
              </div>
              <button
                onClick={() => setActiveView("honor")}
                className="px-4 py-2 rounded-xl bg-yellow-600/20 border border-yellow-600/40 text-yellow-800 hover:text-[#082f3b] text-xs font-mono font-semibold transition-all flex items-center gap-2"
              >
                <span>Ver muro</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <HonorWallSection />
          </section>

          {/* Registro de vecinos y negocios */}
          <section className="max-w-7xl mx-auto px-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <MetallicHeading as="h3" className="text-2xl sm:text-3xl">
                  Únete al pueblo digital
                </MetallicHeading>
                <p className="text-xs text-slate-600 font-mono">
                  Regístrate como vecino, negocio o artesano para activar tu presencia en el Nodo.
                </p>
              </div>
              <button
                onClick={() => setActiveView("register")}
                className="px-4 py-2 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-700 hover:text-[#082f3b] text-xs font-mono font-semibold transition-all flex items-center gap-2"
              >
                <span>Registrarme</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <RegisterSection />
          </section>

          {/* Experiencias del territorio */}
          <section className="max-w-7xl mx-auto px-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <MetallicHeading as="h3" className="text-2xl sm:text-3xl">
                  Experiencias y retos del territorio
                </MetallicHeading>
                <p className="text-xs text-slate-600 font-mono">
                  Juegos y dinámicas territoriales que combinan historia, puntos del pueblo y gamificación.
                </p>
              </div>
              <button
                onClick={() => setActiveView("zombies")}
                className="px-4 py-2 rounded-xl bg-lime-600/20 border border-lime-600/40 text-lime-800 hover:text-[#082f3b] text-xs font-mono font-semibold transition-all flex items-center gap-2"
              >
                <span>Jugar ahora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <ZombiesInvasionSection onAskIsabella={handleOpenIsabellaWithPrompt} />
          </section>

          {/* Panel de identidad — Anubis Villaseñor */}
          <section className="max-w-7xl mx-auto px-6">
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
                <CrystalButton onClick={() => setActiveView("about")} className="px-7 py-3.5 text-sm font-bold">
                  <span>Conocer la plataforma</span>
                  <ArrowRight className="w-4 h-4" />
                </CrystalButton>
                <CrystalButton variant="ghost" onClick={() => setIsabellaOpen(true)} className="px-7 py-3.5 text-sm font-semibold">
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

          {/* ZONA TÉCNICA EN SEGUNDO PLANO — Smart City, gemelos y monitoreo */}
          <section className="max-w-7xl mx-auto px-6">
            <div className="rounded-[2rem] border border-[#536b86]/25 bg-[#f4f7f8]/85 p-6 md:p-8 space-y-8">
              <div className="space-y-1">
                <p className="font-rdm-mono text-[10px] uppercase tracking-[0.28em] text-[#536b86]">En segundo plano · Núcleo tecnológico</p>
                <h3 className="font-patrimonial text-2xl font-bold text-[#082f3b]">
                  Centro de operaciones: Smart City, gemelos digitales y monitoreo
                </h3>
                <p className="max-w-3xl text-sm leading-relaxed text-[#536b86]">
                  Lo que hace funcionar al pueblo mágico por dentro: la arquitectura YUN, la telemetría y la seguridad. Para quien visita, la vitrina turística de arriba es lo esencial.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {techAccess.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className="group rounded-xl border border-[#c9d0d4]/70 bg-white/80 p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(13,70,82,0.10)]"
                  >
                    <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: item.accent }}>
                      {item.icon}
                    </span>
                    <span className="block text-xs font-semibold text-[#082f3b]">{item.label}</span>
                    <span className="mt-1 block text-[10px] leading-relaxed text-[#536b86]">{item.description}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <p className="font-rdm-mono text-[10px] uppercase tracking-[0.28em] text-[#536b86]">Arquitectura heptafederada YUN</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {YUN_CORES.map((core) => {
                    const coreNodesCount = RDM_NODES_35.filter(
                      (n) => n.coreId === core.id,
                    ).length;

                    return (
                      <article
                        key={core.id}
                        className="group p-5 rounded-2xl glass-panel-interactive border border-white/10 flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-500/30">
                              Núcleo {core.id}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {coreNodesCount} nodos activos
                            </span>
                          </div>

                          <h3 className="text-xl font-semibold text-white group-hover:text-cyan-300 transition-colors">
                            {core.name}
                          </h3>

                          <p className="text-xs text-slate-300 leading-relaxed font-light">
                            {core.subtitle}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            const firstCoreNode = RDM_NODES_35.find(
                              (n) => n.coreId === core.id,
                            );
                            if (firstCoreNode) handleSelectNode(firstCoreNode);
                          }}
                          className="pt-3 border-t border-white/10 text-xs font-mono font-semibold text-cyan-400 hover:text-white flex items-center justify-between transition-colors"
                        >
                          <span>Explorar nodos del núcleo</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </article>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-rdm-mono text-[10px] uppercase tracking-[0.28em] text-[#536b86]">Gemelo digital phygital 2D/3D</p>
                <DigitalTwinMap />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-[#082f3b] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#3f9b78]" />
                    Telemetría urbana
                  </h4>
                  <TelemetryDashboard />
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-[#082f3b] flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#536b86]" />
                    Seguridad post‑cuántica
                  </h4>
                  <PostQuantumSecurity />
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-rdm-mono text-[10px] uppercase tracking-[0.28em] text-[#536b86]">Visualización del gemelo territorial</p>
                <CrystalHero3D
                  onOpenIsabella={() => setIsabellaOpen(true)}
                  onSelectNode={(nodeId) => {
                    const found = RDM_NODES_35.find((n) => n.id === nodeId);
                    if (found) handleSelectNode(found);
                  }}
                />
              </div>
            </div>
          </section>

        </div>
      )}
      {/* Asistente Isabella AI flotante */}
      <IsabellaChat
        isOpen={isabellaOpen}
        onClose={() => setIsabellaOpen(false)}
        initialPrompt={isabellaInitialPrompt}
      />
      </YUNLayout>
    </>
  );
}
