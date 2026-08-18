/**
 * Hero Section - Video/Canvas 3D principal
 * TAMV ONLINE - El Metaverso Destructor
 */

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.7;

    // Partículas fluidas
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
    }> = [];

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: `hsl(${190 + Math.random() * 60}, 70%, 60%)`,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.fillStyle = "rgba(10, 10, 30, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Conexiones entre partículas cercanas
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.1 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 0.7;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Canvas de fondo */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(180deg, rgba(10,10,30,1) 0%, rgba(20,10,40,1) 100%)",
        }}
      />

      {/* Overlay con gradiente */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-background/30 to-background" />

      {/* Contenido */}
      <div className="relative z-20 text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo TAMV */}
          <h1
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-wider mb-4"
            style={{
              background:
                "linear-gradient(180deg, #fff 0%, #00f0ff 40%, #0066ff 70%, #9b87f5 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              textShadow: "0 0 60px rgba(0, 240, 255, 0.4)",
              letterSpacing: "0.15em",
            }}
          >
            T A M V
          </h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl md:text-2xl text-red-400 font-bold tracking-[0.3em] mb-6"
          >
            EL METAVERSO DESTRUCTOR
          </motion.p>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8"
          >
            Civilización Digital Quantum XR-IA — Social, Ética, Autosuficiente y Auditable
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-8 py-6 text-lg rounded-full shadow-lg shadow-cyan-500/30"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Entrar al Núcleo
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10 px-8 py-6 text-lg rounded-full"
            >
              Ver DreamSpaces
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Indicador de scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 1, duration: 1.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-cyan-400/50 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-cyan-400 rounded-full animate-bounce" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
