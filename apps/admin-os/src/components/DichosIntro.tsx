import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface DichosIntroProps {
  onComplete: () => void;
}

// Mining dwarf SVG component
function MiningDwarf({ position, delay }: { position: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: -15 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ delay, duration: 0.6, type: "spring", stiffness: 200 }}
      className={`absolute z-30 ${position}`}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 2, delay: delay * 0.5 }}
        className="text-4xl md:text-5xl"
      >
        ⛏️
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.3 }}
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-accent/20 rounded-full blur-sm"
      />
    </motion.div>
  );
}

function GlowParticle({ delay, x, y }: { delay: number; x: string; y: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
      transition={{ delay, duration: 3, repeat: Infinity, repeatDelay: 2 }}
      className="absolute w-1.5 h-1.5 rounded-full bg-accent/60"
      style={{ left: x, top: y }}
    />
  );
}

export function DichosIntro({ onComplete }: DichosIntroProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1800),
      setTimeout(() => setPhase(3), 3500),
      setTimeout(() => setPhase(4), 5200),
      setTimeout(() => setPhase(5), 6500),
      setTimeout(() => onComplete(), 8000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden"
    >
      {/* Animated radial glow background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 1 ? 0.6 : 0 }}
        transition={{ duration: 2 }}
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, hsl(var(--accent) / 0.35) 0%, transparent 60%)",
        }}
      />

      {/* Gold dust particles */}
      {phase >= 1 && (
        <>
          {Array.from({ length: 20 }).map((_, i) => (
            <GlowParticle
              key={i}
              delay={i * 0.2}
              x={`${10 + Math.random() * 80}%`}
              y={`${10 + Math.random() * 80}%`}
            />
          ))}
        </>
      )}

      {/* Mining dwarves appearing from corners */}
      <AnimatePresence>
        {phase >= 2 && (
          <>
            <MiningDwarf position="top-16 left-8 md:left-16" delay={0} />
            <MiningDwarf position="top-20 right-10 md:right-20" delay={0.3} />
            <MiningDwarf position="bottom-24 left-12 md:left-24" delay={0.6} />
            <MiningDwarf position="bottom-16 right-8 md:right-16" delay={0.9} />
            <MiningDwarf position="top-1/3 left-4 md:left-8" delay={1.2} />
            <MiningDwarf position="bottom-1/3 right-4 md:right-10" delay={1.5} />
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 text-center px-8 max-w-3xl">
        {/* Welcome text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 30 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="mb-6"
        >
          <p className="text-xs md:text-sm tracking-[0.5em] uppercase text-accent font-body font-medium">
            Bienvenidos al
          </p>
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{
            opacity: phase >= 2 ? 1 : 0,
            scale: phase >= 2 ? 1 : 0.9,
            y: phase >= 2 ? 0 : 40,
          }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="text-4xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight leading-[0.9] mb-4"
        >
          <span className="shimmer-text">Callejón del</span>
          <br />
          <span className="shimmer-text">Dicho Virtual</span>
        </motion.h1>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: phase >= 3 ? 1 : 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-48 h-px mx-auto my-6"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(var(--foreground) / 0.75), transparent)",
          }}
        />

        {/* Subtitle: Real del Monte */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: phase >= 3 ? 1 : 0, y: phase >= 3 ? 0 : 20 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-2xl md:text-4xl font-display font-semibold text-accent mb-4"
        >
          Real del Monte
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: phase >= 4 ? 1 : 0, y: phase >= 4 ? 0 : 15 }}
          transition={{ duration: 1 }}
          className="text-sm md:text-lg text-muted-foreground font-body max-w-xl mx-auto leading-relaxed"
        >
          Archivo Digital de Tradición y Cultura Popular Realmontense
        </motion.p>

        {/* Sparkle badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 5 ? 1 : 0 }}
          transition={{ duration: 0.8 }}
          className="mt-8 inline-flex items-center gap-2 text-xs tracking-wider text-muted-foreground font-body"
        >
          <Sparkles className="w-3 h-3 text-accent" />
          47 DICHOS CATALOGADOS
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        </motion.div>
      </div>

      {/* Cinematic letterbox bars */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-background" />
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-background" />

      {/* Corner vignettes */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, transparent 50%, hsl(var(--foreground) / 0.18) 100%)",
      }} />
    </motion.div>
  );
}
