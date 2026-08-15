"use client";

/* ------------------------------------------------------------------ */
/* GALERÍA DE EFECTOS AMBIENTALES — portada de visitarealdelmonte      */
/* Demostración de la librería VisualEffects para el Nodo Cero.        */
/* ------------------------------------------------------------------ */

import { useMemo } from "react";
import { Sparkles, Wind, MousePointer2, Image as ImageIcon, Layers, Film, List, Waves, Orbit, Gauge, Grid3x3 } from "lucide-react";
import {
  FloatingParticles,
  FogLayer,
  ParallaxImage,
  TextReveal,
  MagneticButton,
  ShimmerBorder,
  KenBurnsBackground,
  VideoBackground,
  StaggerContainer,
  StaggerItem,
  GlowCard,
  MeshGradient,
  AuroraBackground,
  FloatingOrbs,
  ImmersiveSection,
  AnimatedCounter,
  GradientBorderCard,
} from "@/components/effects/VisualEffects";

const HERO_IMAGE = "/images/mina-acosta.jpg";
const VIDEO_SRC = "";

export default function VisualEffectsDemo() {
  const orbs = useMemo(() => <FloatingOrbs count={6} />, []);
  void orbs;

  return (
    <div className="relative overflow-hidden">
      {/* Fondo ambiente global de la demo */}
      <div className="absolute inset-0 -z-10">
        <AuroraBackground />
        <MeshGradient />
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-16">
        {/* Hero */}
        <section className="text-center space-y-4 pt-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#c89a45]">
            Librería VisualEffects · portada del gemelo
          </p>
          <TextReveal>
            <h2 className="font-patrimonial text-3xl md:text-5xl font-bold text-[#082f3b]">
              Efectos ambientales del Nodo Cero
            </h2>
          </TextReveal>
          <TextReveal>
            <p className="max-w-2xl mx-auto text-sm text-[#536b86] leading-relaxed">
              Aurora, niebla, partículas de oro, orbes flotantes, parallax, contadores animados y
              tarjetas con brillo. Todo autocontenido en canvas 2D + motion.
            </p>
          </TextReveal>
        </section>

        {/* Contadores animados */}
        <StaggerContainer>
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { target: 48, suffix: "", label: "Nodos funcionales" },
              { target: 15, suffix: "", label: "POIs reales" },
              { target: 2710, suffix: " m", label: "Altitud del Real" },
              { target: 500, suffix: "", label: "Años de historia" },
            ].map((s) => (
              <StaggerItem key={s.label}>
                <div className="rounded-2xl glass-panel border border-white/10 p-5 text-center">
                  <div className="text-3xl font-black text-[#0d4652]">
                    <AnimatedCounter target={s.target} suffix={s.suffix} />
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    {s.label}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </section>
        </StaggerContainer>

        {/* Tarjetas con efectos */}
        <StaggerContainer>
          <section className="space-y-8">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c89a45]" />
              <h3 className="font-patrimonial text-2xl text-[#082f3b]">Superficies vivas</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StaggerItem>
                <GradientBorderCard>
                  <div className="p-6 rounded-2xl bg-white/80">
                    <Layers className="w-6 h-6 text-[#0d4652] mb-3" />
                    <h4 className="font-patrimonial text-lg font-bold text-[#082f3b]">Borde degradado</h4>
                    <p className="mt-1 text-xs text-[#536b86]">
                      El borde se ilumina al pasar el cursor sobre la tarjeta.
                    </p>
                  </div>
                </GradientBorderCard>
              </StaggerItem>
              <StaggerItem>
                <GlowCard>
                  <div className="p-6 rounded-2xl bg-white/80">
                    <Waves className="w-6 h-6 text-[#0d4652] mb-3" />
                    <h4 className="font-patrimonial text-lg font-bold text-[#082f3b]">Resplandor al hover</h4>
                    <p className="mt-1 text-xs text-[#536b86]">
                      Escala suave y halo dorado bajo el contenido.
                    </p>
                  </div>
                </GlowCard>
              </StaggerItem>
              <StaggerItem>
                <ShimmerBorder>
                  <div className="p-6 rounded-2xl bg-white/80">
                    <Grid3x3 className="w-6 h-6 text-[#0d4652] mb-3" />
                    <h4 className="font-patrimonial text-lg font-bold text-[#082f3b]">Borde brillante</h4>
                    <p className="mt-1 text-xs text-[#536b86]">
                      Pulso de luz dorada recorriendo el perímetro.
                    </p>
                  </div>
                </ShimmerBorder>
              </StaggerItem>
            </div>
          </section>
        </StaggerContainer>

        {/* Efectos de capa: parallax, niebla, orbes */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#c89a45]" />
              <h3 className="font-patrimonial text-2xl text-[#082f3b]">Parallax</h3>
            </div>
            <ParallaxImage src={HERO_IMAGE} alt="Mina de Acosta" className="h-72 rounded-2xl border border-white/10" />
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-[#c89a45]" />
              <h3 className="font-patrimonial text-2xl text-[#082f3b]">Niebla y capas</h3>
            </div>
            <div className="relative h-72 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#0a1222] via-[#101a2f] to-[#0a0f1f]">
              <FogLayer />
              <FloatingOrbs count={4} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Efecto combinado</div>
                  <div className="mt-1 font-patrimonial text-2xl text-white">Neblina minera</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ken Burns + video */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-[#c89a45]" />
              <h3 className="font-patrimonial text-2xl text-[#082f3b]">Ken Burns</h3>
            </div>
            <div className="relative h-72 rounded-2xl overflow-hidden border border-white/10">
              <KenBurnsBackground src={HERO_IMAGE} />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
              <div className="absolute bottom-4 left-4 font-patrimonial text-xl text-white">
                Minas de Acosta en movimiento
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <VideoBackgroundDemo />
            </div>
          </div>
        </section>

        {/* Botón magnético y más */}
        <section className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2 w-full">
            <MousePointer2 className="w-4 h-4 text-[#c89a45]" />
            <h3 className="font-patrimonial text-2xl text-[#082f3b]">Interacciones</h3>
          </div>
          <MagneticButton className="rounded-xl bg-gradient-to-r from-[#0d4652] to-[#1e6f7d] text-white px-6 py-3 text-sm font-bold shadow-lg">
            Botón magnético
          </MagneticButton>
          <MagneticButton className="rounded-xl bg-[#c89a45] text-white px-6 py-3 text-sm font-bold shadow-lg">
            Sigue al cursor
          </MagneticButton>
          <div className="flex items-center gap-2">
            <List className="w-4 h-4 text-[#536b86]" />
            <span className="text-xs text-[#536b86]">Mueve el ratón sobre ellos</span>
          </div>
        </section>

        {/* Partículas de oro globales */}
        <section className="text-center text-xs text-[#536b86] font-mono">
          Activas en esta vista: <FloatingParticlesLabel />
        </section>
      </div>
    </div>
  );
}

function FloatingParticlesLabel() {
  return (
    <span className="text-[#c89a45]">
      partículas de oro en todo el viewport <Orbit className="w-3 h-3 inline" />
    </span>
  );
}

function VideoBackgroundDemo() {
  const src = VIDEO_SRC;
  if (!src) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
        <Gauge className="w-4 h-4 text-[#c89a45]" />
        <span className="font-patrimonial text-2xl text-[#082f3b]">Video ambient</span>
        <span className="text-[#536b86]">— sin fuente configurada, se omite</span>
      </div>
    );
  }
  return (
    <div className="relative h-72 rounded-2xl overflow-hidden border border-white/10">
      <VideoBackground src={src} />
    </div>
  );
}
