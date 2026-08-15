"use client";

import React, { useState } from "react";
import {
  BookOpen, Landmark, Mountain, Pickaxe, Factory, Skull,
  Music, Route, Sparkles, ChefHat, Trophy, Crown,
  MapPin, Wind, Trees, Waves, ScrollText, Award, Compass,
} from "lucide-react";

/* ================================================================== */
/* Historia y Cultura — Dossier Integral de Real del Monte            */
/* Identidad, territorio e historia del Pueblo Mágico, organizado por */
/* capítulos temáticos. Cada capítulo porta imagen.                   */
/* ================================================================== */

interface HeritageChapter {
  id: string;
  chapter: string;
  title: string;
  summary: string;
  points: string[];
  image: string;
  icon: React.ReactNode;
  accent: string;
}

const CHAPTERS: HeritageChapter[] = [
  {
    id: "identidad",
    chapter: "Ficha de identidad",
    title: "El nombre y la identidad territorial",
    summary:
      "Mineral del Monte (nombre oficial), Real del Monte (uso turístico e histórico) y Magotsi (nombre prehispánico otomí, “paso de altura”). Pueblo Mágico desde 2004, en el Corredor de la Montaña de Hidalgo.",
    points: [
      "Altitud de cabecera: ~2,760 msnm — uno de los Pueblos Mágicos más altos de México.",
      "Entre 2,200 y 3,100 msnm; clima semifrío subhúmedo con lluvias en verano.",
      "Actividad histórica dominante: minería de plata.",
    ],
    image: "/images/real-1.jpg",
    icon: <MapPin className="w-5 h-5" />,
    accent: "#0d4652",
  },
  {
    id: "mineria-novohispana",
    chapter: "Minería novohispana",
    title: "La plata que construyó el Real",
    summary:
      "Desde el siglo XVI, las vetas de plata —destacando la Veta Vizcaína— organizaron un sistema territorial de minas, haciendas de beneficio, caminos de recuas y mano de obra especializada.",
    points: [
      "Red de minas, socavones, haciendas de beneficio y caminos de recuas.",
      "El agua subterránea fue el gran reto técnico: bombeo, desagüe y ventilación.",
      "El paisaje es un sistema minero territorial, no solo túneles.",
    ],
    image: "/images/mina-acosta.jpg",
    icon: <Pickaxe className="w-5 h-5" />,
    accent: "#b85c3c",
  },
  {
    id: "huelga-1766",
    chapter: "Memoria obrera",
    title: "La huelga de 1766",
    summary:
      "Considerado uno de los primeros movimientos obreros documentados del continente: los mineros se organizaron contra la reducción de salarios y la eliminación del “partido” bajo Pedro Romero de Terreros.",
    points: [
      "Ciclo de conflictos, negociación y represión entre 1766 y 1775.",
      "El “partido” era un principio de reciprocidad laboral, no un simple bono.",
      "Antecedente esencial de la historia laboral mexicana.",
    ],
    image: "/images/pedro-romero.jpg",
    icon: <Factory className="w-5 h-5" />,
    accent: "#b91c1c",
  },
  {
    id: "cornish",
    chapter: "Migración británica",
    title: "Los mineros de Cornualles (1824)",
    summary:
      "La llegada de ingenieros y mineros cornish trajo máquinas de vapor, bombeo, arquitectura industrial, fútbol, metodismo y el cornish pasty, que se transformó en el paste hidalguense.",
    points: [
      "Tecnología: máquinas de vapor y sistemas de bombeo.",
      "Cultura: fútbol, cementerio, iglesias, apellidos y comunidades.",
      "Se produjo una hibridación, no una sustitución arquitectónica.",
    ],
    image: "/images/real-2.jpg",
    icon: <Landmark className="w-5 h-5" />,
    accent: "#536b86",
  },
  {
    id: "panteon-ingles",
    chapter: "Patrimonio funerario",
    title: "El Panteón Inglés",
    summary:
      "Espacio funerario en bosque de oyamel, archivo genealógico y testimonio de la memoria migratoria británica. El INAH lo considera parte del patrimonio industrial regional.",
    points: [
      "Memoria migratoria, estratificación social y diversidad religiosa.",
      "La tumba de Richard Bell, el payaso inglés, es uno de sus relatos más conocidos.",
      "No es solo atractivo fotográfico: es memoria y archivo.",
    ],
    image: "/images/ladificultad.jpg",
    icon: <Skull className="w-5 h-5" />,
    accent: "#6b7280",
  },
  {
    id: "paste",
    chapter: "Gastronomía",
    title: "El paste: símbolo identitario",
    summary:
      "Adaptación mexicana del cornish pasty: alimento práctico de los mineros convertido en emblema, producto turístico y memoria migratoria. Festival Internacional del Paste desde 2009.",
    points: [
      "Familia de rellenos: papa con carne, frijol, mole, tinga, piña, arroz con leche.",
      "La orilla gruesa, para sujetarlo sin tocar el relleno (tradición oral).",
      "Patrimonio vivo: recetas familiares, técnicas y adaptación.",
    ],
    image: "/images/gastronomia-1.jpg",
    icon: <ChefHat className="w-5 h-5" />,
    accent: "#c89a45",
  },
  {
    id: "futbol",
    chapter: "Transferencia cultural",
    title: "El fútbol llega a México",
    summary:
      "Real del Monte se reconoce como uno de los lugares donde se introdujo el fútbol soccer a México, asociado a los mineros británicos: una transferencia cultural no institucional.",
    points: [
      "Trabajadores migrantes llevaron el deporte al espacio cotidiano.",
      "Más allá del “primer partido”, el valor está en la identidad local.",
      "De la actividad laboral a un deporte central en la identidad nacional.",
    ],
    image: "/images/plaza-principal.jpg",
    icon: <Trophy className="w-5 h-5" />,
    accent: "#1e3a5f",
  },
  {
    id: "plateria",
    chapter: "Arte y artesanías",
    title: "Platería y oficios del Real",
    summary:
      "La plata de la montaña se volvió oficio: anillos, aretes, dijés, reproducciones de monumentos y símbolos mineros. También lana, madera, palma y talabartería.",
    points: [
      "Joyas .925 con símbolos mineros y patrimoniales.",
      "Prendas de lana: artesanía que responde al clima frío.",
      "Sellos de origen y trazabilidad para proteger el oficio.",
    ],
    image: "/images/realito-platerias.png",
    icon: <Sparkles className="w-5 h-5" />,
    accent: "#d4b26a",
  },
  {
    id: "festividades",
    chapter: "Calendario cultural",
    title: "Festividades del año",
    summary:
      "Fiesta de fin de año, Feria del Dulce Nombre en enero, Festival de la Plata en junio y el Festival Internacional del Paste en octubre marcan el calendario del pueblo.",
    points: [
      "Festival de la Plata: reconoce la labor minera y platera.",
      "Festival Internacional del Paste: gastronomía + herencia cornish.",
      "Religiosidad popular, procesiones, cohetes y mayordomías.",
    ],
    image: "/images/plaza.jpg",
    icon: <Music className="w-5 h-5" />,
    accent: "#d97832",
  },
  {
    id: "leyendas",
    chapter: "Narrativas populares",
    title: "Mitos, niebla y aparecidos",
    summary:
      "Tres ambientes sostienen las leyendas: la mina (el “dueño del cerro”), el cementerio (Richard Bell) y la montaña (sombras, campanas y luces entre la neblina).",
    points: [
      "El espíritu de la mina: protector o castigador que exige respeto.",
      "Relatos orales que explican accidentes, ruidos y vetas ricas.",
      "La neblina convierte el paisaje en escenario de apariciones.",
    ],
    image: "/images/callejon.jpg",
    icon: <BookOpen className="w-5 h-5" />,
    accent: "#7c3aed",
  },
  {
    id: "ecoturismo",
    chapter: "Naturaleza",
    title: "Bosques, altura y ecoturismo",
    summary:
      "Oyamel, pino, encino, barrancas y neblina: el Corredor de la Montaña ofrece senderismo interpretativo, observación de aves y turismo responsable sin dañar el patrimonio.",
    points: [
      "Capacidad de carga, señalización de riesgos y guías capacitados.",
      "Prohibido entrar a minas no aseguradas o extraer piezas.",
      "Patrimonio minero y natural están conectados.",
    ],
    image: "/images/ecoturismo.jpg",
    icon: <Trees className="w-5 h-5" />,
    accent: "#10b981",
  },
  {
    id: "itinerario",
    chapter: "Turismo cultural",
    title: "Tres días en el Real",
    summary:
      "Día 1: centro histórico y memoria obrera. Día 2: minas, Cornualles y el paste. Día 3: Panteón Inglés y senderismo. Una experiencia de estancia interpretativa.",
    points: [
      "Museo de Medicina Laboral, Mina de Acosta y Museo del Paste.",
      "Talleres de repulgue y charlas sobre la comunidad británica.",
      "Pasar de “visitar y comer” a vivir dos o tres días.",
    ],
    image: "/images/centro.jpg",
    icon: <Route className="w-5 h-5" />,
    accent: "#0d9488",
  },
];

const MILESTONES = [
  { year: "s. XVI", title: "Explotación de vetas de plata", image: "/images/mina-acosta.jpg" },
  { year: "1766", title: "Huelga minera del Real", image: "/images/pedro-romero.jpg" },
  { year: "1824", title: "Llegan los mineros de Cornualles", image: "/images/real-2.jpg" },
  { year: "2004", title: "Pueblo Mágico", image: "/images/plaza-principal.jpg" },
  { year: "2009", title: "Festival Internacional del Paste", image: "/images/gastronomia-3.jpg" },
];

export default function HeritageSection() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-10">
      {/* Cabecera del expediente */}
      <div className="relative rounded-3xl overflow-hidden border border-[#c89a45]/25">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/realito-historia.png"
          alt="Real del Monte: historia y cultura"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/95 via-[#020617]/70 to-transparent" />
        <div className="relative z-10 p-8 md:p-12 max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#f2cc76]">
            Dossier integral · Identidad, territorio e historia
          </p>
          <h2 className="mt-3 font-patrimonial text-3xl md:text-5xl font-bold text-white leading-tight">
            Real del Monte
            <span className="block text-[#f2cc76]">cultura y esencia</span>
          </h2>
          <p className="mt-4 text-sm text-slate-300 leading-relaxed max-w-xl">
            De Magotsi a la Real de Minas: cinco capas de identidad — indígena, novohispana,
            británica, obrera y turística — que convierten al Pueblo Mágico en un paisaje cultural
            minero único en México.
          </p>
        </div>
      </div>

      {/* Línea de hitos con imagen */}
      <div>
        <h3 className="font-patrimonial text-xl font-bold text-white flex items-center gap-2 mb-4">
          <Crown className="w-5 h-5 text-[#f2cc76]" />
          Línea histórica general
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {MILESTONES.map((m, i) => (
            <div key={i} className="relative rounded-2xl overflow-hidden border border-white/10 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.image}
                alt={m.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/95 via-[#020617]/40 to-transparent" />
              <div className="relative z-10 p-4 flex flex-col justify-end h-40">
                <span className="font-mono text-[10px] text-[#f2cc76] font-bold">{m.year}</span>
                <span className="text-xs font-semibold text-white leading-snug">{m.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Capítulos temáticos con imagen */}
      <div>
        <h3 className="font-patrimonial text-xl font-bold text-white flex items-center gap-2 mb-1">
          <ScrollText className="w-5 h-5 text-[#f2cc76]" />
          Capítulos del expediente
        </h3>
        <p className="text-xs text-slate-400 font-mono mb-4">
          Selecciona un capítulo para abrir su dossier
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {CHAPTERS.map((chapter) => {
            const isOpen = selected === chapter.id;
            return (
              <div
                key={chapter.id}
                className={`rounded-2xl overflow-hidden border transition-all duration-300 ${
                  isOpen
                    ? "border-[#f2cc76]/50 shadow-[0_0_40px_rgba(200,163,86,0.18)]"
                    : "border-white/10 hover:border-white/25"
                }`}
              >
                <button
                  onClick={() => setSelected(isOpen ? null : chapter.id)}
                  className="relative w-full text-left group"
                  aria-expanded={isOpen}
                >
                  <div className="relative h-40 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={chapter.image}
                      alt={chapter.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/30 to-transparent" />
                    <span
                      className="absolute top-3 left-3 flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-lg"
                      style={{ background: chapter.accent }}
                    >
                      {chapter.icon}
                    </span>
                    <span className="absolute bottom-3 left-3 font-mono text-[9px] uppercase tracking-widest text-[#f2cc76] bg-[#020617]/60 px-2 py-0.5 rounded-full border border-[#c89a45]/30">
                      {chapter.chapter}
                    </span>
                  </div>
                  <div className="p-4 bg-[#0a0b0e]">
                    <h4 className="font-patrimonial text-base font-bold text-white leading-snug">
                      {chapter.title}
                    </h4>
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {chapter.summary}
                    </p>
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 pt-0 pb-4 bg-[#0a0b0e] border-t border-[#c89a45]/20 space-y-2">
                    {chapter.points.map((point, i) => (
                      <p key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                        <Compass className="w-3.5 h-3.5 text-[#f2cc76] mt-0.5 shrink-0" />
                        {point}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Datos rápidos con imagen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: <Mountain className="w-5 h-5 text-[#f2cc76]" />,
            label: "Altitud",
            value: "~2,760 msnm",
            detail: "Uno de los Pueblos Mágicos más altos de México",
            image: "/images/mirador-purisima.jpg",
          },
          {
            icon: <Wind className="w-5 h-5 text-[#38bdf8]" />,
            label: "Clima",
            value: "Semifrío subhúmedo",
            detail: "10–14 °C · lluvias en verano · neblina y heladas",
            image: "/images/hiloche.jpg",
          },
          {
            icon: <Waves className="w-5 h-5 text-[#10b981]" />,
            label: "Ecosistema",
            value: "Sierra de Pachuca",
            detail: "Bosques de oyamel y pino del Corredor de la Montaña",
            image: "/images/zelotla.jpg",
          },
        ].map((card, i) => (
          <div key={i} className="relative rounded-2xl overflow-hidden border border-white/10 min-h-44">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={card.image} alt={card.label} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/95 via-[#020617]/55 to-transparent" />
            <div className="relative z-10 p-4 flex flex-col justify-end h-44">
              <div className="flex items-center gap-2 mb-1">
                {card.icon}
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/80">{card.label}</span>
              </div>
              <p className="font-patrimonial text-lg font-bold text-white leading-tight">{card.value}</p>
              <p className="text-[11px] text-slate-300 mt-1">{card.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sello final */}
      <div className="rounded-2xl border border-[#c89a45]/25 bg-gradient-to-r from-[#0a0b0e] via-[#0d4652]/30 to-[#0a0b0e] p-6 text-center">
        <div className="inline-flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-[#f2cc76]" />
          <p className="font-patrimonial text-lg font-bold text-white">
            Paisaje cultural minero
          </p>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Real del Monte no es solo un destino gastronómico o una postal colonial: es la conexión
          entre territorio, trabajo, migración, memoria, cocina, religión y paisaje. Una comunidad
          que transformó una economía extractiva histórica en una economía de servicios culturales.
        </p>
      </div>
    </div>
  );
}
