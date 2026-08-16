"use client";

import React, { useEffect, useState } from "react";
import { Compass, Sparkles, ArrowRight, Radio } from "lucide-react";

/* ================================================================== */
/* Hero atmosférico — observatorio temporal de Real del Monte.         */
/* Negro profundo + niebla en capas + azul eléctrico. El fondo y el    */
/* copy se derivan de la hora local. Sin datos inventados: la          */
/* telemetría del destino se anuncia en integración.                   */
/* ================================================================== */

const DAY_MOMENTS = [
  { start: 5, end: 11, key: "amanecer", label: "Amanecer", copy: "La montaña despierta entre historias.", tint: "from-[#1c3a55] via-[#0a1a2e] to-[#071525]", halo: "#2e9cff" },
  { start: 11, end: 18, key: "mediodia", label: "Mediodía", copy: "Camina despacio: cada calle guarda una veta.", tint: "from-[#0b5f6c] via-[#0a2238] to-[#071525]", halo: "#2e9cff" },
  { start: 18, end: 22, key: "atardecer", label: "Atardecer", copy: "La luz baja sobre las casas que aprendieron a resistir.", tint: "from-[#8a4b2a] via-[#3a2233] to-[#071525]", halo: "#d97832" },
  { start: 22, end: 5, key: "noche", label: "Noche", copy: "La memoria del pueblo sigue encendida.", tint: "from-[#10243d] via-[#071525] to-[#020813]", halo: "#2e9cff" },
];

function currentMoment() {
  const h = new Date().getHours();
  return DAY_MOMENTS.find((m) => {
    if (m.start > m.end) return h >= m.start || h < m.end;
    return h >= m.start && h < m.end;
  }) ?? DAY_MOMENTS[0];
}

const FUTURE_SIGNALS = ["Clima", "Aforo", "Movilidad", "Accesibilidad"] as const;

export default function AtmosphericHero({
  onOpenIsabella,
  onExplore,
}: {
  onOpenIsabella: () => void;
  onExplore: () => void;
}) {
  const [moment, setMoment] = useState(() => currentMoment());
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setMoment(currentMoment()), 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="rdm-hero bg-[#071525] text-white" aria-label="Real del Monte, ahora">
      {/* Fondo atmosférico por momento del día */}
      <div className={`absolute inset-0 bg-gradient-to-b ${moment.tint} transition-[background] duration-[1200ms]`} />
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
          imageReady ? "opacity-85" : "opacity-0"
        }`}
        style={{ backgroundImage: "url(/images/hidalgo-hero1.png)" }}
        onLoad={() => setImageReady(true)}
        role="img"
        aria-label="Real del Monte entre la niebla de la montaña"
      />

      {/* Capas de niebla en profundidad */}
      <div className="rdm-hero-fog" />
      <div className="rdm-hero-fog pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(70%_45%_at_75%_18%,rgba(46,156,255,0.1),transparent_60%)]" />
      <div className="rdm-hero-vignette" />

      {/* Halo eléctrico superior */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full opacity-25 blur-[120px] transition-colors duration-[1200ms]"
        style={{ background: moment.halo }}
      />

      {/* Contenido */}
      <div className="relative z-10 rdm-shell px-6 pb-16 pt-44">
        <div className="max-w-3xl space-y-7">
          <div className="flex items-center gap-3">
            <span className="rdm-meta text-[#c9d0d4]">{moment.label} en Real del Monte</span>
            <span className="hidden items-center gap-1.5 rounded-full border border-[#2e9cff]/40 bg-[#2e9cff]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#7cc4ff] sm:inline-flex">
              <Radio className="h-3 w-3" />
              Inteligencia territorial
            </span>
          </div>
          <h1 className="rdm-display-xl font-display text-white drop-shadow-[0_5px_30px_rgba(2,8,19,0.85)]">
            Donde la montaña guarda historias bajo la niebla
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-[#e2e8f0]/90 md:text-lg">
            {moment.copy}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button onClick={onExplore} className="rdm-button-primary">
              <Compass className="h-4 w-4" />
              <span>Explorar el pueblo</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onOpenIsabella}
              className="rdm-button-secondary !bg-[#10243d]/70 !text-white !border-[#2e9cff]/30 backdrop-blur-xl hover:!border-[#2e9cff]/70"
            >
              <Sparkles className="h-4 w-4 text-[#d97832]" />
              <span>Hablar con Isabella</span>
            </button>
          </div>
        </div>

        {/* Telemetría del destino — instrumentación en integración, sin datos inventados */}
        <div className="mt-14 rounded-2xl border border-[#2e9cff]/20 bg-[#071525]/70 px-5 py-4 backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[#c9d0d4]">
              <Radio className="h-3.5 w-3.5 text-[#2e9cff]" />
              Telemetría del destino
            </span>
            <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {FUTURE_SIGNALS.map((n) => (
                <span key={n} className="flex items-center gap-1.5 text-xs text-[#cbd5e1]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2e9cff]/50" />
                  {n}
                  <span className="text-[#64748b]">—</span>
                </span>
              ))}
            </span>
            <span className="ml-auto text-[11px] text-[#94a3b8]">
              Instrumentación en integración · datos reales próximamente
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}