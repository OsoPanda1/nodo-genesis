import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const RealitoChat = lazy(() => import("@/components/RealitoChat"));

/* Canvas orb animado — esfera 3D pulsante con anillos de partículas y glow */
function OrbButton({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 64;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let t = 0;
    let isVisible = document.visibilityState === "visible";
    let isIntersecting = true;

    const stop = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };

    const draw = () => {
      if (!isVisible || !isIntersecting) {
        rafRef.current = 0;
        return;
      }

      rafRef.current = requestAnimationFrame(draw);
      t += 0.02;
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const openPulse = isOpen ? 1.15 : 1;
      const pulse = openPulse + Math.sin(t * 1.5) * 0.04;
      const radius = 22 * pulse;

      // Outer glow with shadowBlur
      ctx.save();
      ctx.shadowColor = "rgba(245, 158, 11, 0.6)";
      ctx.shadowBlur = 25;
      const glowRadius = radius + 10 + Math.sin(t * 0.8) * 4;
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, glowRadius);
      grad.addColorStop(0, "rgba(255,255,255,0.06)");
      grad.addColorStop(0.5, "rgba(245, 158, 11, 0.12)");
      grad.addColorStop(1, "rgba(245, 158, 11, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Orb body — amber/gold gradient
      ctx.save();
      ctx.shadowColor = "rgba(245, 158, 11, 0.5)";
      ctx.shadowBlur = 20;
      const bodyGrad = ctx.createRadialGradient(cx - 8, cy - 8, 2, cx, cy, radius);
      bodyGrad.addColorStop(0, "rgba(253, 230, 138, 1)");
      bodyGrad.addColorStop(0.3, "rgba(245, 158, 11, 0.95)");
      bodyGrad.addColorStop(0.7, "rgba(217, 119, 6, 0.85)");
      bodyGrad.addColorStop(1, "rgba(146, 64, 14, 0.8)");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Specular highlight
      ctx.beginPath();
      ctx.ellipse(cx - 8, cy - 10, 8, 5, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fill();

      // Inner energy ring
      ctx.strokeStyle = `rgba(253, 230, 138, ${0.2 + Math.sin(t * 2) * 0.1})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.25, t * 0.5, t * 0.5 + Math.PI * 1.5);
      ctx.stroke();

      // Ring 1: 4 particles, fast orbit
      for (let i = 0; i < 4; i++) {
        const angle = t * 0.8 + i * 1.57;
        const dist = radius * 1.5 + Math.sin(t * 1.2 + i) * 2;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        ctx.beginPath();
        ctx.arc(px, py, 1.8 + Math.sin(t * 2.5 + i) * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(253, 230, 138, ${0.5 + Math.sin(t * 3 + i) * 0.2})`;
        ctx.fill();
      }

      // Ring 2: 3 particles, slower counter-rotation
      for (let i = 0; i < 3; i++) {
        const angle = -t * 0.4 + i * 2.09;
        const dist = radius * 1.9 + Math.sin(t * 0.7 + i) * 3;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        ctx.beginPath();
        ctx.arc(px, py, 2 + Math.sin(t * 1.8 + i) * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${0.4 + Math.sin(t * 2 + i) * 0.15})`;
        ctx.fill();
      }

      // Ring 3: 6 tiny dots, outer slow drift
      for (let i = 0; i < 6; i++) {
        const angle = t * 0.2 + i * 1.05;
        const dist = radius * 2.3 + Math.sin(t * 0.5 + i * 0.5) * 2;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        ctx.beginPath();
        ctx.arc(px, py, 1.2 + Math.sin(t * 1.5 + i * 0.3) * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 146, 60, ${0.3 + Math.sin(t * 1.2 + i) * 0.1})`;
        ctx.fill();
      }
    };

    const start = () => {
      if (!rafRef.current && isVisible && isIntersecting) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
      if (isVisible) start();
      else stop();
    };

    const observer = new IntersectionObserver(([entry]) => {
      isIntersecting = entry?.isIntersecting ?? true;
      if (isIntersecting) start();
      else stop();
    });

    observer.observe(canvas);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    start();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stop();
    };
  }, [isOpen]);

  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center"
      aria-label="Abrir Realito AI"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ filter: "drop-shadow(0 0 16px rgba(245,158,11,0.35))" }}
      />
      <div className="absolute inset-0 rounded-full animate-ping bg-amber-400/15 pointer-events-none" />
    </motion.button>
  );
}

export default function RealitoChatLauncher() {
  const [enabled, setEnabled] = useState(false);

  if (!enabled) {
    return <OrbButton onClick={() => setEnabled(true)} isOpen={false} />;
  }

  return (
    <Suspense
      fallback={
        <div className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl shadow-amber-500/30">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      }
    >
      <RealitoChat initialOpen />
    </Suspense>
  );
}
