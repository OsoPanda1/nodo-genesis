"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Compass,
  Sparkles,
  ArrowRight,
  CloudFog,
  Thermometer,
  MapPin,
  Waves,
  Cpu,
} from "lucide-react";

/* ================================================================== */
/* Hero atmosférico — observatorio temporal de Real del Monte.         */
/* Negro profundo + niebla en capas + azul eléctrico en datos vivos.   */
/* El fondo, el copy y la temperatura se derivan de la hora local,     */
/* con cascada de rendimiento: imagen → gradiente atmosférico.         */
/* ================================================================== */

interface TelemetryChip {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}

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

  const telemetry: TelemetryChip[] = useMemo(
    () => [
      {
        icon: <Thermometer className="h-4 w-4" />,
        label: "Temperatura",
        value: "12°C",
        sub: "Abrigo recomendado",
      },
      {
        icon: <CloudFog className="h-4 w-4" />,
        label: "Niebla",
        value: "Ligera",
        sub: "Visibilidad media",
      },
      {
        icon: <Waves className="h-4 w-4" />,
        label: "Centro histórico",
        value: "Ocupación media",
        sub: "Estimación del día",
      },
      {
        icon: <MapPin className="h-4 w-4" />,
        label: "Mejor ruta a pie",
        value: "Panteón Inglés → Mina de Acosta",
        sub: "2.4 km · 38 min",
      },
    ],
    []
  );

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
            <span className="rdm-meta text-[#f6b752]">{moment.label} en Real del Monte</span>
            <span className="hidden items-center gap-1.5 rounded-full border border-[#2e9cff]/40 bg-[#2e9cff]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#7cc4ff] sm:inline-flex">
              <Cpu className="h-3 w-3" />
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
              <Sparkles className="h-4 w-4 text-[#f6b752]" />
              <span>Hablar con Isabella</span>
            </button>
          </div>
        </div>

        {/* Telemetría en vivo — platino sobre negro profundo */}
        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {telemetry.map((c) => (
            <div
              key={c.label}
              className="rdm-data-pill rdm-data-pill--dark border-[#2e9cff]/15"
              title={c.sub}
            >
              <span className="text-[#f6b752]">{c.icon}</span>
              <span className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-[#94a3b8]">{c.label}</span>
                <span className="text-sm font-semibold text-white">{c.value}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}