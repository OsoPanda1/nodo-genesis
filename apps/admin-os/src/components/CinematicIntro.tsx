import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import heroAerial from "@/assets/hero-aerial.jpg";
import rdmIntroAudio from "/src/assets/rdmintro.mp3";

interface CinematicIntroProps {
  onComplete: () => void;
}

export function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [phase, setPhase] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Inicialización de audio
    audioRef.current = new Audio(rdmIntroAudio);
    audioRef.current.volume = 0.6;
    audioRef.current.play().catch(e => console.log("Audio play deferred"));

    const timers = [
      setTimeout(() => setPhase(1), 800),   // Entrada sutil
      setTimeout(() => setPhase(2), 2200),  // Revelación de montaña
      setTimeout(() => setPhase(3), 4200),  // Título y Niebla
      setTimeout(() => setPhase(4), 6000),  // Sistema operativo
      setTimeout(() => onComplete(), 8500), // Cierre
    ];
    
    return () => {
      timers.forEach(clearTimeout);
      audioRef.current?.pause();
    };
  }, [onComplete]);

  return (
    <motion.div
      exit={{ opacity: 0, filter: "blur(20px)" }}
      transition={{ duration: 2.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-[#050505] flex items-center justify-center overflow-hidden"
    >
      {/* CAPA 1: IMAGEN CON EFECTO KEN BURNS PROFUNDO */}
      <motion.div
        initial={{ opacity: 0, scale: 1.4, filter: "grayscale(100%)" }}
        animate={{ 
          opacity: phase >= 1 ? 0.4 : 0, 
          scale: 1.1,
          filter: phase >= 2 ? "grayscale(30%)" : "grayscale(100%)"
        }}
        transition={{ duration: 8, ease: "linear" }}
        className="absolute inset-0"
      >
        <img src={heroAerial} alt="" className="w-full h-full object-cover shadow-2xl" />
        {/* Degradado Cinematográfico */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </motion.div>

      {/* CAPA 2: EFECTO DE NIEBLA EN MOVIMIENTO (Atmospheric Fog) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 2 ? 0.3 : 0 }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-20" />
        <motion.div 
          animate={{ x: [-100, 100] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "mirror" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-[120px]" 
        />
      </motion.div>

      {/* CONTENIDO TEXTUAL */}
      <div className="relative z-10 text-center px-6 max-w-5xl">
        
        {/* Línea 1: El Gancho Narrativo */}
        <motion.p
          initial={{ opacity: 0, letterSpacing: "1em" }}
          animate={{ opacity: phase >= 1 ? 1 : 0, letterSpacing: "0.5em" }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="text-[10px] md:text-xs uppercase text-platinum/70 mb-8 font-light"
        >
          Donde México toca el cielo con las manos
        </motion.p>

        {/* Línea 2: Título Principal con Brillo Obsidian */}
        <motion.div
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: phase >= 2 ? 1 : 0, filter: "blur(0px)" }}
          transition={{ duration: 1.5 }}
          className="relative"
        >
          <h1 className="text-6xl md:text-9xl font-display font-bold tracking-tighter mb-4 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            Real del Monte
          </h1>
          {/* Subrayado animado */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: phase >= 2 ? 1 : 0 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="h-[1px] bg-gradient-to-r from-transparent via-platinum to-transparent w-full mt-2"
          />
        </motion.div>

        {/* Línea 3: Narrativa de la Neblina */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: phase >= 3 ? 1 : 0, y: 0 }}
          transition={{ duration: 1.5 }}
          className="text-lg md:text-2xl text-platinum/90 font-display italic mt-6"
        >
          "Donde la neblina dicta el ritmo del tiempo."
        </motion.p>

        {/* Version & OS Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 4 ? 1 : 0 }}
          className="mt-16 flex flex-col items-center gap-3"
        >
          <div className="h-12 w-px bg-gradient-to-b from-transparent via-platinum/30 to-transparent" />
          <div className="flex items-center gap-4 text-[9px] tracking-[0.3em] text-muted-foreground uppercase">
            <span className="text-accent italic font-bold">RDM Digital OS v1.0</span>
            <span className="w-1 h-1 rounded-full bg-accent animate-pulse" />
            <span>Tecnología TAMV Online</span>
          </div>
        </motion.div>
      </div>

      {/* Cinematic Frame Bars (Letterbox) */}
      <motion.div 
        initial={{ height: "100vh" }}
        animate={{ height: "12vh" }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="absolute top-0 left-0 right-0 bg-black z-20" 
      />
      <motion.div 
        initial={{ height: "100vh" }}
        animate={{ height: "12vh" }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="absolute bottom-0 left-0 right-0 bg-black z-20" 
      />

      {/* Overlay de Grano de Película */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </motion.div>
  );
}
