"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  ArrowRight,
  ChevronDown,
  Compass,
  MapPin,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";

export type AAACinematicIntroProps = {
  onComplete: () => void;
};

type Scene = {
  id: string;
  image: string;
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
};

const SCENES: Scene[] = [
  {
    id: "memoria",
    image: "/images/mina-acosta.jpg",
    eyebrow: "REAL DEL MONTE · HIDALGO",
    title: "Un territorio que conserva su memoria.",
    description:
      "Historia minera, cultura viva y experiencias locales reunidas en un solo lugar.",
    accent: "#d4b26a",
  },
  {
    id: "territorio",
    image: "/images/mirador-purisima.jpg",
    eyebrow: "COMARCA MINERA",
    title: "Una nueva forma de recorrerlo.",
    description:
      "Descubre lugares, rutas, sabores, historias y la vida cotidiana de la montaña.",
    accent: "#83c9d6",
  },
  {
    id: "nodo",
    image: "/images/intro-cinematic02.png",
    eyebrow: "NODO CERO",
    title: "Bienvenido a Real del Monte.",
    description:
      "Una plataforma viva para explorar, conectar y volver a mirar el territorio.",
    accent: "#d4b26a",
  },
];

const SCENE_DURATION = 4600;

export default function AAACinematicIntro({
  onComplete,
}: AAACinematicIntroProps) {
  const prefersReducedMotion = useReducedMotion();
  const audioRef = useRef<HTMLAudioElement>(null);
  const leaveTimerRef = useRef<number | null>(null);

  const [sceneIndex, setSceneIndex] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const currentScene = SCENES[sceneIndex];

  useEffect(() => {
    if (prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      setSceneIndex((current) => (current + 1) % SCENES.length);
    }, SCENE_DURATION);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion]);

  useEffect(() => {
    const audio = audioRef.current;

    return () => {
      if (leaveTimerRef.current) {
        window.clearTimeout(leaveTimerRef.current);
      }

      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  const toggleAudio = async () => {
    const audio = audioRef.current;

    if (!audio) return;

    try {
      if (audioEnabled) {
        audio.pause();
        setAudioEnabled(false);
        return;
      }

      audio.volume = 0.32;
      await audio.play();
      setAudioEnabled(true);
    } catch {
      setAudioEnabled(false);
    }
  };

  const enterNodo = () => {
    if (isLeaving) return;

    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    setAudioEnabled(false);
    setIsLeaving(true);

    leaveTimerRef.current = window.setTimeout(() => {
      onComplete();
    }, 600);
  };

  return (
    <AnimatePresence>
      {!isLeaving && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.015,
          }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="fixed inset-0 z-[99999] overflow-hidden bg-[#071116] text-white"
          aria-label="Bienvenida a Nodo Cero"
        >
          {/* Audio ambiental */}
          <audio
            ref={audioRef}
            src="/audio/trailerintro.mp3"
            preload="auto"
            loop
          />

          {/* Fondo dinámico */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene.id}
              initial={{
                opacity: 0,
                scale: prefersReducedMotion ? 1 : 1.04,
              }}
              animate={{
                opacity: 1,
                scale: prefersReducedMotion ? 1 : 1.09,
              }}
              exit={{
                opacity: 0,
                scale: prefersReducedMotion ? 1 : 1.015,
              }}
              transition={{
                opacity: {
                  duration: 1.15,
                  ease: "easeOut",
                },
                scale: {
                  duration: prefersReducedMotion
                    ? 0
                    : SCENE_DURATION / 1000 + 1,
                  ease: "linear",
                },
              }}
              className="absolute inset-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentScene.image}
                alt=""
                className="h-full w-full object-cover"
                style={{
                  filter:
                    "brightness(0.56) contrast(1.08) saturate(0.9)",
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Tratamiento cinematográfico */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#071116]/90 via-[#071116]/20 to-[#071116]/95" />

          <div className="absolute inset-0 bg-gradient-to-r from-[#071116]/90 via-[#071116]/35 to-transparent" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_32%,transparent_0%,rgba(7,17,22,0.18)_42%,rgba(7,17,22,0.72)_100%)]" />

          {/* Textura discreta */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-screen"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.8'/%3E%3C/svg%3E\")",
            }}
          />

          {/* Barra superior */}
          <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-6 sm:px-10 md:px-14">
            <button
              type="button"
              onClick={enterNodo}
              className="group flex items-center gap-3 text-left"
              aria-label="Entrar directamente a Nodo Cero"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d4b26a]/50 bg-[#071116]/60 shadow-lg backdrop-blur-md transition group-hover:border-[#d4b26a]">
                <ShieldCheck className="h-5 w-5 text-[#d4b26a]" />
              </span>

              <span className="leading-none">
                <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[#d4b26a]">
                  Nodo Cero
                </span>

                <span className="mt-1 block font-serif text-sm tracking-wide text-white/85">
                  Real del Monte
                </span>
              </span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleAudio}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white/75 backdrop-blur-md transition hover:border-[#d4b26a] hover:text-[#d4b26a]"
                aria-label={
                  audioEnabled
                    ? "Silenciar audio"
                    : "Activar audio ambiental"
                }
              >
                {audioEnabled ? (
                  <Volume2 className="h-4 w-4 text-[#d4b26a]" />
                ) : (
                  <VolumeX className="h-4 w-4 text-white/60" />
                )}

                <span className="hidden sm:inline">
                  {audioEnabled ? "Ambiente activo" : "Activar ambiente"}
                </span>
              </button>

              <button
                type="button"
                onClick={enterNodo}
                className="rounded-full px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Omitir
              </button>
            </div>
          </header>

          {/* Contenido principal */}
          <main className="relative z-20 flex h-full items-center px-6 sm:px-10 md:px-14">
            <div className="w-full max-w-4xl pt-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentScene.id}
                  initial={{
                    opacity: 0,
                    y: prefersReducedMotion ? 0 : 24,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: prefersReducedMotion ? 0 : -14,
                  }}
                  transition={{
                    duration: prefersReducedMotion ? 0.15 : 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div
                    className="mb-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-2 backdrop-blur-md"
                    style={{
                      borderColor: `${currentScene.accent}66`,
                      backgroundColor: `${currentScene.accent}14`,
                    }}
                  >
                    <MapPin
                      className="h-3.5 w-3.5"
                      style={{
                        color: currentScene.accent,
                      }}
                    />

                    <span
                      className="font-mono text-[10px] font-bold tracking-[0.2em]"
                      style={{
                        color: currentScene.accent,
                      }}
                    >
                      {currentScene.eyebrow}
                    </span>
                  </div>

                  <h1 className="max-w-4xl font-serif text-5xl font-semibold leading-[0.96] tracking-[-0.04em] text-white drop-shadow-[0_12px_35px_rgba(0,0,0,0.8)] sm:text-6xl md:text-7xl lg:text-8xl">
                    {currentScene.title}
                  </h1>

                  <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
                    {currentScene.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              <motion.div
                initial={{
                  opacity: 0,
                  y: prefersReducedMotion ? 0 : 16,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: prefersReducedMotion ? 0 : 0.45,
                  duration: 0.6,
                }}
                className="mt-9 flex flex-wrap items-center gap-4"
              >
                <button
                  type="button"
                  onClick={enterNodo}
                  className="group inline-flex items-center gap-3 rounded-xl bg-[#d4b26a] px-5 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-[#071116] shadow-[0_12px_36px_rgba(212,178,106,0.28)] transition hover:-translate-y-0.5 hover:bg-[#f0d48e] hover:shadow-[0_16px_44px_rgba(212,178,106,0.42)]"
                >
                  Explorar el territorio
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>

                <div className="flex items-center gap-2 text-xs text-white/60">
                  <Sparkles className="h-4 w-4 text-[#d4b26a]" />
                  <span>Patrimonio, rutas y comunidad.</span>
                </div>
              </motion.div>
            </div>
          </main>

          {/* Navegación inferior */}
          <footer className="absolute inset-x-0 bottom-0 z-30 px-6 pb-7 sm:px-10 md:px-14">
            <div className="flex items-end justify-between gap-4">
              <div className="flex gap-2">
                {SCENES.map((scene, index) => {
                  const active = index === sceneIndex;

                  return (
                    <button
                      key={scene.id}
                      type="button"
                      onClick={() => setSceneIndex(index)}
                      aria-label={`Mostrar escena ${index + 1}`}
                      aria-current={active ? "true" : undefined}
                      className="group py-3"
                    >
                      <span className="block h-1 w-10 overflow-hidden rounded-full bg-white/25 sm:w-16">
                        <motion.span
                          initial={{
                            width: index < sceneIndex ? "100%" : "0%",
                          }}
                          animate={{
                            width: active
                              ? "100%"
                              : index < sceneIndex
                                ? "100%"
                                : "0%",
                          }}
                          transition={{
                            duration: active
                              ? SCENE_DURATION / 1000
                              : 0.25,
                            ease: "linear",
                          }}
                          className="block h-full rounded-full"
                          style={{
                            backgroundColor: active
                              ? scene.accent
                              : "#ffffff",
                          }}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={enterNodo}
                className="hidden items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/60 transition hover:text-[#d4b26a] sm:inline-flex"
              >
                Entrar
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </footer>

          {/* Indicador inferior */}
          <div className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-white/35 lg:flex">
            <Compass className="h-4 w-4" />
            <span className="font-mono text-[9px] uppercase tracking-[0.22em]">
              Explora a tu ritmo
            </span>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
