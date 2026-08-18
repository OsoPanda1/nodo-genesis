"use client";

import React, { useEffect, useRef, useState } from 'react';
import { YUN_CORES, RDM_NODES_35, YUNNode } from '@/lib/data/rdm-data';
import {
  Cpu, ShieldCheck, Box, Activity, Store,
  ChevronDown, Search, Radio, Sparkles,
  Map, Database, Key, ShoppingBag, Zap,
  Palette, UtensilsCrossed, Trophy, Ghost, MessagesSquare, Award, Images, Users, Skull, Network, BookMarked,
  HandCoins, Compass, CreditCard, SlidersHorizontal, Landmark, Mountain, Music, UserPlus, Home,
  Layers, X, PanelsTopLeft, Globe, ChevronRight, MessageCircle, ArrowRight,
  BookOpen,
} from 'lucide-react';
import ModeSwitch from './ModeSwitch';

interface YUNLayoutProps {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
  selectedNode: YUNNode | null;
  onSelectNode: (node: YUNNode) => void;
  onOpenIsabella: () => void;
  isabellaOpen: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface Plano {
  key: string;
  order: string;
  name: string;
  tagline: string;
  accent: string;
  icon: React.ReactNode;
  items: NavItem[];
}

/* ================================================================== */
/* Los 4 Planos — reorganización institucional del ecosistema RDM      */
/* Nada se elimina: cada destino histórico vive dentro de un plano.    */
/* ================================================================== */
const PLANOS: Plano[] = [
  {
    key: 'descubre',
    order: 'I',
    name: 'Descubre',
    tagline: 'Turismo, cultura y patrimonio',
    accent: '#0d4652',
    icon: <Compass className="w-4 h-4" />,
    items: [
      { id: 'home', label: 'Inicio · Pueblo Mágico', icon: <Home className="w-4 h-4" /> },
      { id: 'tourism', label: 'Turismo, ecoturismo y rutas', icon: <Mountain className="w-4 h-4" /> },
      { id: 'gastronomy', label: 'Gastronomía del Monte', icon: <UtensilsCrossed className="w-4 h-4" /> },
      { id: 'art', label: 'Arte y artesanos', icon: <Palette className="w-4 h-4" /> },
      { id: 'legends', label: 'Historia, mitos y leyendas', icon: <Ghost className="w-4 h-4" /> },
      { id: 'heritage', label: 'Historia y Cultura · Dossier', icon: <BookOpen className="w-4 h-4" /> },
      { id: 'archive', label: 'Archivo Histórico', icon: <BookMarked className="w-4 h-4" /> },
      { id: 'media', label: 'Música y podcast', icon: <Music className="w-4 h-4" /> },
      { id: 'gallery', label: 'Galería compartida', icon: <Images className="w-4 h-4" /> },
      { id: 'map', label: 'Mapa interactivo 2D/3D', icon: <Map className="w-4 h-4" /> },
      { id: 'visual-effects', label: 'Efectos visuales', icon: <Sparkles className="w-4 h-4" /> },
      { id: 'about', label: 'Quiénes somos', icon: <Users className="w-4 h-4" /> },
    ],
  },
  {
    key: 'comercia',
    order: 'II',
    name: 'Comercia',
    tagline: 'Negocios, pagos y suscripciones',
    accent: '#c89a45',
    icon: <CreditCard className="w-4 h-4" />,
    items: [
      { id: 'business', label: 'Catálogo de negocios', icon: <Store className="w-4 h-4" /> },
      { id: 'marketplace', label: 'Marketplace pastes & plata', icon: <ShoppingBag className="w-4 h-4" /> },
      { id: 'payments', label: 'Pagos, donaciones y suscripciones', icon: <HandCoins className="w-4 h-4" /> },
      { id: 'digital-marketplace', label: 'Marketplace de datos', icon: <Database className="w-4 h-4" /> },
    ],
  },
  {
    key: 'personaliza',
    order: 'III',
    name: 'Personaliza',
    tagline: 'Comunidad, cuenta y gamificación',
    accent: '#d97832',
    icon: <SlidersHorizontal className="w-4 h-4" />,
    items: [
      { id: 'register', label: 'Registro de usuarios y negocios', icon: <UserPlus className="w-4 h-4" /> },
      { id: 'forum', label: 'Foro RDM', icon: <MessagesSquare className="w-4 h-4" /> },
      { id: 'gamification', label: 'Gamificación del Nodo', icon: <Trophy className="w-4 h-4" /> },
      { id: 'zombies', label: 'Zombies RDM Invasion', icon: <Skull className="w-4 h-4" /> },
      { id: 'honor', label: 'Muro de honor', icon: <Award className="w-4 h-4" /> },
    ],
  },
  {
    key: 'gobierna',
    order: 'IV',
    name: 'Gobierna',
    tagline: 'Gemelo digital y Smart City',
    accent: '#536b86',
    icon: <Landmark className="w-4 h-4" />,
    items: [
      { id: 'twins', label: 'Gemelo territorial DTDL', icon: <Box className="w-4 h-4" /> },
      { id: 'city', label: 'Ciudad IOC', icon: <Activity className="w-4 h-4" /> },
      { id: 'tenochtitlan', label: 'Dashboard Tenochtitlan', icon: <Landmark className="w-4 h-4" /> },
      { id: 'grid', label: 'Smart Grid / Agua', icon: <Zap className="w-4 h-4" /> },
      { id: 'eam', label: 'EAM / APM activos', icon: <Cpu className="w-4 h-4" /> },
      { id: 'telemetry', label: 'Telemetría y sensores', icon: <Radio className="w-4 h-4" /> },
      { id: 'security', label: 'Criptografía post-cuántica', icon: <Key className="w-4 h-4" /> },
      { id: 'crown-gateway', label: 'CROWN Gateway · IA federada', icon: <Network className="w-4 h-4" /> },
      { id: 'archive-admin', label: 'Gestión del Archivo', icon: <BookMarked className="w-4 h-4" /> },
    ],
  },
];

/* ================================================================== */
/* Contexto inteligente por sección — navbar izquierda flotante        */
/* Muestra información y acciones solo relevantes a la sección actual. */
/* ================================================================== */
interface SectionContext {
  eyebrow: string;
  title: string;
  blurb: string;
  quick: NavItem[];
}

const SECTION_CONTEXT: Record<string, SectionContext> = {
  home: {
    eyebrow: 'Vitrina del Real',
    title: 'Bienvenida al pueblo mágico',
    blurb: 'Patrimonio, arte, cocina, historia y comunidad en un solo lugar.',
    quick: [
      { id: 'tourism', label: 'Ver turismo', icon: <Mountain className="w-4 h-4" /> },
      { id: 'legends', label: 'Historia y leyendas', icon: <Ghost className="w-4 h-4" /> },
      { id: 'map', label: 'Mapa 2D/3D', icon: <Map className="w-4 h-4" /> },
    ],
  },
  tourism: {
    eyebrow: 'Plano I · Descubre',
    title: 'Turismo y rutas',
    blurb: 'Atractivos, agenda, rutas, relatos y la línea histórica del pueblo.',
    quick: [
      { id: 'legends', label: 'Leyendas', icon: <Ghost className="w-4 h-4" /> },
      { id: 'gastronomy', label: 'Gastronomía', icon: <UtensilsCrossed className="w-4 h-4" /> },
      { id: 'map', label: 'Mapa interactivo', icon: <Map className="w-4 h-4" /> },
      { id: 'archive', label: 'Archivo Histórico', icon: <BookMarked className="w-4 h-4" /> },
    ],
  },
  gastronomy: {
    eyebrow: 'Plano I · Descubre',
    title: 'Gastronomía del Monte',
    blurb: 'Pastes, pan de pulque, mixiotes y café de altura de las pasteadoras históricas.',
    quick: [
      { id: 'business', label: 'Negocios con sello', icon: <Store className="w-4 h-4" /> },
      { id: 'marketplace', label: 'Marketplace', icon: <ShoppingBag className="w-4 h-4" /> },
      { id: 'tourism', label: 'Turismo', icon: <Mountain className="w-4 h-4" /> },
    ],
  },
  art: {
    eyebrow: 'Plano I · Descubre',
    title: 'Arte y artesanos',
    blurb: 'Platería .925, textiles, alebrijes y la tradición viva del Real.',
    quick: [
      { id: 'business', label: 'Talleres y tiendas', icon: <Store className="w-4 h-4" /> },
      { id: 'gallery', label: 'Galería', icon: <Images className="w-4 h-4" /> },
      { id: 'honor', label: 'Muro de honor', icon: <Award className="w-4 h-4" /> },
    ],
  },
  legends: {
    eyebrow: 'Plano I · Descubre',
    title: 'Historia, mitos y leyendas',
    blurb: 'De la huelga de 1766 a la niebla del Panteón Inglés: la memoria viva del pueblo.',
    quick: [
      { id: 'tourism', label: 'Turismo', icon: <Mountain className="w-4 h-4" /> },
      { id: 'heritage', label: 'Dossier de identidad', icon: <BookOpen className="w-4 h-4" /> },
      { id: 'archive', label: 'Archivo Histórico', icon: <BookMarked className="w-4 h-4" /> },
      { id: 'media', label: 'Podcast', icon: <Music className="w-4 h-4" /> },
    ],
  },
  heritage: {
    eyebrow: 'Plano I · Descubre',
    title: 'Historia y Cultura del Monte',
    blurb: 'El expediente integral: identidad, minería, Cornualles, el paste, leyendas y patrimonio en 12 capítulos ilustrados.',
    quick: [
      { id: 'legends', label: 'Leyendas', icon: <Ghost className="w-4 h-4" /> },
      { id: 'gastronomy', label: 'El paste', icon: <UtensilsCrossed className="w-4 h-4" /> },
      { id: 'tourism', label: 'Rutas', icon: <Mountain className="w-4 h-4" /> },
      { id: 'archive', label: 'Archivo', icon: <BookMarked className="w-4 h-4" /> },
    ],
  },
  archive: {
    eyebrow: 'Plano I · Descubre',
    title: 'Archivo Histórico',
    blurb: 'Documentos, mapas, fotografías y memoria oral de la Real de Minas.',
    quick: [
      { id: 'legends', label: 'Leyendas', icon: <Ghost className="w-4 h-4" /> },
      { id: 'about', label: 'Quiénes somos', icon: <Users className="w-4 h-4" /> },
    ],
  },
  media: {
    eyebrow: 'Plano I · Descubre',
    title: 'Música y podcast',
    blurb: 'Sonidos, cantos mineros y el podcast Ecos de Real del Monte.',
    quick: [
      { id: 'tourism', label: 'Turismo', icon: <Mountain className="w-4 h-4" /> },
      { id: 'gallery', label: 'Galería', icon: <Images className="w-4 h-4" /> },
    ],
  },
  gallery: {
    eyebrow: 'Plano I · Descubre',
    title: 'Galería compartida',
    blurb: 'Fotografías y miradas de quienes viven y visitan el pueblo.',
    quick: [
      { id: 'media', label: 'Música y podcast', icon: <Music className="w-4 h-4" /> },
      { id: 'forum', label: 'Foro', icon: <MessagesSquare className="w-4 h-4" /> },
    ],
  },
  map: {
    eyebrow: 'Plano I · Descubre',
    title: 'Mapa interactivo',
    blurb: 'El gemelo phygital del territorio en 2D y 3D con los 35 nodos YUN.',
    quick: [
      { id: 'twins', label: 'Gemelo DTDL', icon: <Box className="w-4 h-4" /> },
      { id: 'tourism', label: 'Turismo', icon: <Mountain className="w-4 h-4" /> },
    ],
  },
  business: {
    eyebrow: 'Plano II · Comercia',
    title: 'Catálogo de negocios',
    blurb: 'Negocios verificados del pueblo: pastes, platería, café y artesanías.',
    quick: [
      { id: 'marketplace', label: 'Marketplace', icon: <ShoppingBag className="w-4 h-4" /> },
      { id: 'payments', label: 'Pagos y donaciones', icon: <HandCoins className="w-4 h-4" /> },
      { id: 'register', label: 'Registrar negocio', icon: <UserPlus className="w-4 h-4" /> },
    ],
  },
  marketplace: {
    eyebrow: 'Plano II · Comercia',
    title: 'Marketplace',
    blurb: 'Experiencias, pastes y platería .925 verificados del territorio.',
    quick: [
      { id: 'business', label: 'Catálogo de negocios', icon: <Store className="w-4 h-4" /> },
      { id: 'payments', label: 'Pagos', icon: <HandCoins className="w-4 h-4" /> },
    ],
  },
  payments: {
    eyebrow: 'Plano II · Comercia',
    title: 'Pagos y donaciones',
    blurb: 'Soporta al Nodo y a la comunidad con donaciones y suscripciones.',
    quick: [
      { id: 'business', label: 'Negocios', icon: <Store className="w-4 h-4" /> },
      { id: 'honor', label: 'Muro de honor', icon: <Award className="w-4 h-4" /> },
    ],
  },
  register: {
    eyebrow: 'Plano III · Personaliza',
    title: 'Registro',
    blurb: 'Da de alta tu cuenta de vecino, negocio o artesano en el Nodo.',
    quick: [
      { id: 'forum', label: 'Foro', icon: <MessagesSquare className="w-4 h-4" /> },
      { id: 'honor', label: 'Muro de honor', icon: <Award className="w-4 h-4" /> },
    ],
  },
  forum: {
    eyebrow: 'Plano III · Personaliza',
    title: 'Foro del Real',
    blurb: 'La conversación del pueblo: avisos, historia y vida cotidiana.',
    quick: [
      { id: 'honor', label: 'Muro de honor', icon: <Award className="w-4 h-4" /> },
      { id: 'register', label: 'Unirme', icon: <UserPlus className="w-4 h-4" /> },
    ],
  },
  honor: {
    eyebrow: 'Plano III · Personaliza',
    title: 'Muro de honor',
    blurb: 'Reconocimientos a vecinos, artesanos y guardianes del Nodo.',
    quick: [
      { id: 'forum', label: 'Foro', icon: <MessagesSquare className="w-4 h-4" /> },
      { id: 'gallery', label: 'Galería', icon: <Images className="w-4 h-4" /> },
    ],
  },
  about: {
    eyebrow: 'Identidad',
    title: 'Quiénes somos',
    blurb: 'La plataforma, su arquitectura y la visión del Nodo Cero.',
    quick: [
      { id: 'home', label: 'Inicio', icon: <Home className="w-4 h-4" /> },
      { id: 'archive', label: 'Archivo', icon: <BookMarked className="w-4 h-4" /> },
    ],
  },
};

const FALLBACK_CONTEXT: SectionContext = {
  eyebrow: 'Nodo Cero',
  title: 'Ecosistema RDM',
  blurb: 'Explora los cuatro planos de la plataforma territorial.',
  quick: [
    { id: 'home', label: 'Inicio', icon: <Home className="w-4 h-4" /> },
    { id: 'map', label: 'Mapa', icon: <Map className="w-4 h-4" /> },
  ],
};

export default function YUNLayout({
  children,
  activeView,
  setActiveView,
  selectedNode,
  onSelectNode,
  onOpenIsabella,
}: YUNLayoutProps) {
  const [planosOpen, setPlanosOpen] = useState(false);
  const [openPlano, setOpenPlano] = useState<string>('');
  const [contextOpen, setContextOpen] = useState(true);
  const [coresOpen, setCoresOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const explorarBtnRef = useRef<HTMLButtonElement>(null);

  const filteredNodes = searchQuery.trim()
    ? RDM_NODES_35.filter(
        n =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const activePlano = PLANOS.find(p => p.items.some(i => i.id === activeView));
  const context = SECTION_CONTEXT[activeView] ?? FALLBACK_CONTEXT;
  const accentColor = activePlano?.accent ?? '#0d4652';

  /* Cierra el dropdown al hacer clic fuera o al pulsar Escape. */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (explorarBtnRef.current?.contains(target)) return;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setPlanosOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setPlanosOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const navigateTo = (id: string) => {
    setActiveView(id);
    setPlanosOpen(false);
  };

  const expandedPlanoKey = planosOpen
    ? (activePlano?.key ?? openPlano ?? 'descubre')
    : openPlano;

  const renderDropdownColumns = () =>
    PLANOS.map(plano => {
      const isExpanded = expandedPlanoKey === plano.key;
      const hasActive = plano.items.some(i => i.id === activeView);
      return (
        <div
          key={plano.key}
          className="rounded-2xl border border-[#c9d0d4]/60 bg-white/60 overflow-hidden flex flex-col"
          style={hasActive ? { borderColor: plano.accent, boxShadow: `0 14px 40px ${plano.accent}1f` } : undefined}
        >
          <button
            onClick={() => setOpenPlano(isExpanded ? '' : plano.key)}
            className="w-full p-3.5 flex items-center justify-between text-left transition-all hover:bg-white/80"
            aria-expanded={isExpanded}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                style={{ background: plano.accent }}
              >
                {plano.icon}
              </span>
              <span className="min-w-0">
                <span className="font-rdm-mono text-[9px] tracking-widest" style={{ color: plano.accent }}>
                  PLANO {plano.order}
                </span>
                <span className="block font-patrimonial text-sm font-bold text-[#082f3b] leading-tight">
                  {plano.name}
                </span>
                <span className="block text-[10px] text-[#536b86] truncate">{plano.tagline}</span>
              </span>
            </div>
            <ChevronDown
              className="w-4 h-4 shrink-0 transition-transform"
              style={{ color: plano.accent, transform: isExpanded ? 'rotate(180deg)' : 'none' }}
            />
          </button>

          {isExpanded && (
            <div className="px-2 pb-2 space-y-1 border-t border-[#c9d0d4]/50 pt-2">
              {plano.items.map(item => {
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className="w-full p-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all text-left"
                    style={
                      active
                        ? { background: `${plano.accent}14`, color: plano.accent, border: `1px solid ${plano.accent}55` }
                        : { color: '#3c4750' }
                    }
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#eef1ec'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ color: active ? plano.accent : '#7c8894' }}>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    });

  return (
    <div className="min-h-screen text-[#283038] font-sans flex flex-col">

      {/* ============ HEADER FLOTANTE GLASS (Spatial Heritage Engine) ============ */}
      <header className="fixed top-4 inset-x-0 z-50 px-4 sm:px-6">
        <nav className="glass-panel rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.1)_inset]">
          <button onClick={() => setActiveView('home')} className="flex items-center gap-3 group text-left min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C5A059] to-[#1E4633] p-0.5 shadow-lg group-hover:scale-105 transition-transform shrink-0">
              <div className="w-full h-full bg-[#0B0D0E] rounded-full flex items-center justify-center font-black text-xs text-[#F8FAFC] tracking-wider">
                RDM
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="font-serif text-sm font-bold tracking-wider text-[#F8FAFC] flex items-center gap-1.5 truncate">
                NODO CERO
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[#1E4633]/60 text-emerald-300 border border-emerald-500/30 shrink-0">
                  RDM
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block truncate">
                Real del Monte · Hidalgo
              </p>
            </div>
          </button>

          {/* Estado de red en vivo */}
          <div className="hidden xl:flex items-center gap-2 text-[11px] text-slate-300 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Red YUN · 35 Nodos Activos</span>
          </div>

          {/* Acciones principales */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveView('register')}
              className="hidden sm:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs px-3.5 py-2 rounded-full border border-slate-700 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Únete</span>
            </button>
            <button
              onClick={onOpenIsabella}
              className="flex items-center gap-2 bg-gradient-to-r from-[#C5A059] to-[#b08a3f] hover:from-[#cfa96b] hover:to-[#C5A059] text-slate-950 font-semibold text-xs px-4 py-2 rounded-full shadow-lg transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Isabella AI</span>
            </button>

            {/* Botón de navegación por planos */}
            <button
              ref={explorarBtnRef}
              onClick={() => setPlanosOpen(open => !open)}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition-all ${
                planosOpen
                  ? 'border-[#C5A059]/60 bg-[#C5A059] text-slate-950 shadow-[0_10px_30px_rgba(197,160,89,0.35)]'
                  : 'border-slate-700 bg-slate-900/70 text-slate-200 hover:border-[#C5A059]/50 hover:text-[#C5A059]'
              }`}
              aria-expanded={planosOpen}
              aria-haspopup="dialog"
            >
              <PanelsTopLeft className="w-4 h-4" />
              <span className="hidden md:inline">Explorar</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${planosOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </nav>
      </header>

      {/* ============ DROPDOWN DE LOS 4 PLANOS (acordeón en 4 columnas) ============ */}
      {planosOpen && (
        <div
          ref={dropdownRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navegación por planos"
          className="fixed inset-0 z-40 flex items-start justify-end p-3 sm:p-5"
        >
          <div
            className="absolute inset-0 bg-[#082f3b]/25 backdrop-blur-sm"
            onClick={() => setPlanosOpen(false)}
          />
          <div className="relative w-full max-w-5xl mt-20 rounded-[2rem] border border-[#c9d0d4]/70 bg-[rgba(251,252,250,0.92)] backdrop-blur-2xl shadow-[0_40px_120px_rgba(8,47,59,0.35)] overflow-hidden">
            {/* Cabecera del dropdown */}
            <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4 border-b border-[#c9d0d4]/60">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#c9d0d4] via-[#f2cc76] to-[#2e9cff] p-px shadow-sm shrink-0">
                  <span className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#082f3b] text-white">
                    <Layers className="w-4 h-4" />
                  </span>
                </span>
                <div className="min-w-0">
                  <p className="font-rdm-mono text-[10px] uppercase tracking-[0.28em] text-[#c89a45]">
                    Mapa del ecosistema
                  </p>
                  <h2 className="font-patrimonial text-lg font-bold text-[#082f3b] truncate">
                    Los 4 planos de RDM Digital
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono text-[#536b86]">
                  <Search className="w-3.5 h-3.5" />
                  35 nodos YUN
                </span>
                <button
                  onClick={() => setPlanosOpen(false)}
                  className="p-2 rounded-xl border border-[#c9d0d4]/70 bg-white/80 text-[#536b86] hover:text-[#082f3b] hover:border-[#0d4652]/40 transition-all"
                  aria-label="Cerrar navegación"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 4 columnas acordeón */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 p-4 max-h-[58vh] overflow-y-auto custom-scrollbar">
              {renderDropdownColumns()}
            </div>

            {/* Arquitectura YUN + buscador */}
            <div className="px-5 pb-5 pt-2 border-t border-[#c9d0d4]/60">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#536b86] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar en los 35 nodos YUN…"
                    className="w-full bg-white/80 border border-[#c9d0d4] focus:border-[#2e9cff] rounded-xl pl-9 pr-3 py-2 text-xs text-[#283038] placeholder-[#8a97a4] focus:outline-none transition-all font-mono"
                  />
                </div>
                <button
                  onClick={() => setCoresOpen(!coresOpen)}
                  className="flex items-center justify-between gap-2 px-4 py-2 rounded-xl border border-[#c9d0d4]/70 bg-white/70 text-xs font-bold text-[#0d4652] hover:bg-white transition-all"
                  aria-expanded={coresOpen}
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#536b86]" />
                    7 Núcleos heptafederados
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${coresOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {searchQuery.trim().length > 0 && (
                <div className="mt-2 p-2 rounded-xl bg-white/90 border border-[#2e9cff]/40 space-y-1 max-h-52 overflow-y-auto shadow-sm">
                  <div className="text-[10px] font-mono text-[#0d4652] px-2 py-1 uppercase">
                    Nodos encontrados ({filteredNodes.length})
                  </div>
                  {filteredNodes.map(node => (
                    <button
                      key={node.id}
                      onClick={() => { onSelectNode(node); setSearchQuery(''); setPlanosOpen(false); }}
                      className="w-full p-2 rounded-lg hover:bg-[#eef1ec] text-left text-xs transition-all flex items-center justify-between"
                    >
                      <span className="font-medium text-[#082f3b] truncate">{node.title}</span>
                      <span className="text-[9px] font-mono text-[#2e9cff]">{node.code}</span>
                    </button>
                  ))}
                </div>
              )}

              {coresOpen && (
                <div className="mt-2 p-2 rounded-xl border border-[#c9d0d4]/60 bg-white/60 max-h-56 overflow-y-auto custom-scrollbar space-y-1">
                  {YUN_CORES.map(core => {
                    const coreNodes = RDM_NODES_35.filter(n => n.coreId === core.id);
                    return (
                      <details key={core.id} className="rounded-lg bg-[#f7f8f5]/70">
                        <summary className="cursor-pointer p-2 text-[11px] font-bold text-[#0d4652] flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#c89a45]" />
                          <span className="truncate">{core.name}</span>
                          <span className="ml-auto text-[9px] font-mono text-[#8a97a4] shrink-0">{coreNodes.length}</span>
                        </summary>
                        <div className="p-1 space-y-1">
                          {coreNodes.map(node => (
                            <button
                              key={node.id}
                              onClick={() => { onSelectNode(node); setPlanosOpen(false); }}
                              className={`w-full p-2 rounded-lg text-left text-[11px] font-mono transition-all flex items-center justify-between ${
                                selectedNode?.id === node.id
                                  ? 'bg-[#e6eef1] text-[#0d4652] border border-[#2e9cff]/40 font-bold'
                                  : 'text-[#536b86] hover:text-[#082f3b] hover:bg-white'
                              }`}
                            >
                              <span className="truncate pr-2">{node.title}</span>
                              <span className="text-[9px] text-[#2e9cff] shrink-0">{node.code}</span>
                            </button>
                          ))}
                        </div>
                      </details>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============ CUERPO ============ */}
      <div className="flex pt-24 relative">

        {/* ============ NAVBAR IZQUIERDA FLOTANTE INTELIGENTE (contextual) ============ */}
        <aside
          className={`fixed left-0 top-16 bottom-0 z-30 flex flex-col transition-all duration-300 ${
            contextOpen ? 'w-72' : 'w-14'
          }`}
          aria-label="Navegación contextual"
        >
          {/* Pestaña / rail colapsado */}
          <div
            className="flex-1 my-3 ml-3 rounded-2xl border border-[#c9d0d4]/70 bg-[rgba(251,252,250,0.85)] backdrop-blur-xl shadow-[0_18px_50px_rgba(13,70,82,0.14)] flex flex-col overflow-hidden transition-all"
          >
            {contextOpen ? (
              <>
                {/* Cabecera contextual */}
                <div className="p-4 border-b border-[#c9d0d4]/60 flex items-start justify-between gap-2" style={{ background: `linear-gradient(135deg, ${accentColor}14, transparent 60%)` }}>
                  <div className="min-w-0">
                    <p className="font-rdm-mono text-[9px] uppercase tracking-[0.24em]" style={{ color: accentColor }}>
                      {context.eyebrow}
                    </p>
                    <h2 className="mt-1 font-patrimonial text-base font-bold text-[#082f3b] leading-tight">
                      {context.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setContextOpen(false)}
                    className="p-1.5 rounded-lg text-[#536b86] hover:text-[#082f3b] hover:bg-white/70 transition-all shrink-0"
                    aria-label="Contraer navegación contextual"
                    title="Contraer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Descripción + acciones */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                  <p className="text-[11px] leading-relaxed text-[#536b86]">{context.blurb}</p>

                  <div className="space-y-1">
                    <p className="font-rdm-mono text-[9px] uppercase tracking-widest text-[#c89a45] px-1">
                      Ir a…
                    </p>
                    {context.quick.map(action => (
                      <button
                        key={action.id}
                        onClick={() => setActiveView(action.id)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-[#3c4750] hover:text-[#082f3b] hover:bg-white/80 transition-all text-left"
                      >
                        <span className="text-[#7c8894]">{action.icon}</span>
                        <span className="truncate flex-1">{action.label}</span>
                        <ArrowRight className="w-3 h-3 text-[#c9d0d4]" />
                      </button>
                    ))}
                  </div>

                  {/* Plano activo — mini acordeón */}
                  {activePlano && (
                    <div className="rounded-xl border border-[#c9d0d4]/60 bg-white/60 overflow-hidden">
                      <button
                        onClick={() => setCoresOpen(!coresOpen)}
                        className="w-full p-2.5 flex items-center justify-between text-left hover:bg-white/80 transition-all"
                        aria-expanded={coresOpen}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-white text-[10px] font-bold"
                            style={{ background: activePlano.accent }}
                          >
                            {activePlano.order}
                          </span>
                          <span className="text-[11px] font-bold text-[#082f3b] truncate">
                            {activePlano.name}
                          </span>
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 text-[#536b86] transition-transform ${coresOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {coresOpen && (
                        <div className="px-2 pb-2 space-y-1 border-t border-[#c9d0d4]/50 pt-2">
                          {activePlano.items.map(item => {
                            const active = activeView === item.id;
                            return (
                              <button
                                key={item.id}
                                onClick={() => setActiveView(item.id)}
                                className="w-full p-2 rounded-lg text-[11px] font-semibold flex items-center gap-2.5 transition-all text-left"
                                style={
                                  active
                                    ? { background: `${activePlano.accent}14`, color: activePlano.accent }
                                    : { color: '#3c4750' }
                                }
                              >
                                <span className="text-[#7c8894]">{item.icon}</span>
                                <span className="truncate">{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Acción Isabella */}
                  <button
                    onClick={onOpenIsabella}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#0d4652] to-[#082f3b] hover:opacity-90 transition-all shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4 text-[#f2cc76]" />
                    Preguntar a Isabella AI
                  </button>
                </div>
              </>
            ) : (
              /* Rail colapsado — botones verticales */
              <div className="flex-1 flex flex-col items-center gap-1 py-3">
                <button
                  onClick={() => setContextOpen(true)}
                  className="p-2 rounded-xl hover:bg-white/80 text-[#0d4652] transition-all"
                  aria-label="Expandir navegación contextual"
                  title="Expandir contexto"
                >
                  <ChevronRight className="w-4 h-4 -scale-x-100" />
                </button>
                {activePlano && (
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-white text-xs font-black shadow-sm"
                    style={{ background: activePlano.accent }}
                    title={`Plano ${activePlano.order} · ${activePlano.name}`}
                  >
                    {activePlano.order}
                  </span>
                )}
                <div className="mt-2 flex flex-col items-center gap-1">
                  {context.quick.slice(0, 4).map(action => (
                    <button
                      key={action.id}
                      onClick={() => setActiveView(action.id)}
                      className="p-2 rounded-xl text-[#7c8894] hover:text-[#0d4652] hover:bg-white/80 transition-all"
                      title={action.label}
                    >
                      {action.icon}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* VISTA PRINCIPAL */}
        <main className={`flex-1 overflow-y-auto relative custom-scrollbar transition-[padding] duration-300 ${contextOpen ? 'lg:pl-72' : 'lg:pl-14'}`}>
          {/* Barra de contexto: plano activo */}
          {activePlano && activeView !== 'home' && (
            <div className="sticky top-0 z-20 px-6 md:px-10 py-2.5 border-b border-[#c9d0d4]/60 bg-[rgba(251,252,250,0.85)] backdrop-blur-md">
              <div className="max-w-7xl mx-auto flex items-center gap-2 text-[11px] font-mono">
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-md text-white text-[9px] font-bold"
                  style={{ background: activePlano.accent }}
                >
                  {activePlano.order}
                </span>
                <span className="font-semibold" style={{ color: activePlano.accent }}>
                  Plano {activePlano.order} · {activePlano.name}
                </span>
                <ChevronRight className="w-3 h-3 text-[#8a97a4]" />
                <span className="text-[#536b86]">
                  {activePlano.items.find(i => i.id === activeView)?.label}
                </span>
              </div>
            </div>
          )}

          {children}

          {/* Footer institucional perlado */}
          <footer className="mt-16 border-t border-[#c9d0d4]/70 bg-white/55 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-6 md:px-10 py-12">
              <div className="grid gap-10 md:grid-cols-3">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#c9d0d4] via-[#f2cc76] to-[#2e9cff] p-px">
                      <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#082f3b] font-black text-xs text-white">
                        RDM
                      </div>
                    </div>
                    <div>
                      <p className="font-patrimonial text-sm font-bold tracking-wide text-[#082f3b]">
                        RDM Digital Hub — Nodo Cero
                      </p>
                      <p className="font-rdm-mono text-[10px] tracking-widest text-[#8a97a4]">
                        REAL DEL MONTE · HIDALGO · MÉXICO
                      </p>
                    </div>
                  </div>
                  <p className="max-w-xs text-xs leading-relaxed text-[#536b86]">
                    Plataforma territorial del Pueblo Mágico: turismo, cultura, comercio, comunidad y
                    gemelo digital, unidos en cuatro planos de una misma identidad.
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="font-rdm-mono text-[10px] uppercase tracking-widest text-[#c89a45]">
                    Los 4 planos
                  </p>
                  <ul className="space-y-1.5 text-[#536b86]">
                    <li>I · Descubre — turismo y patrimonio</li>
                    <li>II · Comercia — pagos y suscripciones</li>
                    <li>III · Personaliza — comunidad y cuenta</li>
                    <li>IV · Gobierna — gemelo digital y ciudad</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <p className="font-rdm-mono text-[10px] uppercase tracking-widest text-[#c89a45]">
                    Autoría
                  </p>
                  <p className="font-editorial text-2xl font-medium leading-tight text-[#082f3b]">
                    Anubis Villaseñor
                  </p>
                  <p className="text-xs leading-relaxed text-[#536b86]">
                    Founder · Architect · Cognitive Systems
                    <br />
                    Sistemas territoriales · Inteligencia cognitiva
                    <br />
                    Gobernanza digital · Experiencias inmersivas
                  </p>
                  <p className="font-rdm-mono text-[10px] text-[#8a97a4]">
                    TAMV Online Network / OsoPanda1 · RDM Digital Hub
                  </p>
                </div>
              </div>

              <hr className="rdm-divider my-8" />

              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <span className="text-xs text-[#8a97a4]">
                  © {new Date().getFullYear()} TAMV Online Network · RDM Digital Hub — Nodo Cero
                </span>
                <span className="font-rdm-mono text-xs text-[#8a97a4]">
                  Comarca Minera · Real del Monte · Hidalgo · México
                </span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
