import React, { useEffect, useRef } from "react";

interface TAMVTrixEffectProps {
  baseColor?: string;
  minFontSize?: number;
  maxFontSize?: number;
  speed?: number;
  density?: number;
  className?: string;
  words?: string[];
}

type Column = {
  y: number;
  depth: number; // 0 = muy cerca, 1 = muy lejos
  scale: number; // escala de fuente
  drift: number; // deriva horizontal
  opacity: number; // intensidad general de la columna
  wordIndex: number;
  charIndex: number;
};

const CORE_LETTERS = "TAMVONLINE".split("");
const DEFAULT_WORDS = ["TAMV", "ONLINE", "TAMVONLINE", "GENESIS", "DIGYTAMV", "NETWORK"];

const TAMVTrixEffect: React.FC<TAMVTrixEffectProps> = ({
  baseColor = "#3bf5ff",
  minFontSize = 11,
  maxFontSize = 40,
  speed = 1,
  density = 0.94,
  className = "",
  words = DEFAULT_WORDS,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let columns: Column[] = [];
    let columnWidth = 0;
    let baseFont = 18;

    const initColumns = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      baseFont = (minFontSize + maxFontSize) / 2;
      columnWidth = baseFont * 0.8;
      const columnCount = Math.floor(canvas.width / columnWidth);

      columns = Array.from({ length: columnCount }).map((_, i): Column => {
        const depth = Math.random(); // 0 cercano, 1 lejano
        const scale = 0.7 + Math.random() * 1.1;
        const drift = (Math.random() - 0.5) * 1.2;
        const opacity = 0.3 + 0.7 * (1 - depth); // columnas cercanas = más intensas

        return {
          y: Math.floor(Math.random() * canvas.height),
          depth,
          scale,
          drift,
          opacity,
          wordIndex: Math.floor(Math.random() * words.length),
          charIndex: Math.floor(Math.random() * CORE_LETTERS.length),
        };
      });
    };

    initColumns();
    window.addEventListener("resize", initColumns);

    const bgFade = "rgba(1, 4, 16, 0.13)";

    const animate = () => {
      if (!canvas) return;
      const { width, height } = canvas;

      // capa de fundido sutil para la estela
      ctx.fillStyle = bgFade;
      ctx.fillRect(0, 0, width, height);

      columns.forEach((col, i) => {
        if (col.y <= 0 && Math.random() > density) return;

        const depth = col.depth;
        const z = 1 - depth; // 1 cerca, 0 lejos

        const fontSize = minFontSize + (maxFontSize - minFontSize) * col.scale * (0.4 + 0.6 * z);

        const velocity = speed * (0.3 + 0.9 * z); // más cerca = más rápido

        const baseX = i * columnWidth + columnWidth / 2;
        const x = baseX + col.drift * 24 * z;
        const y = col.y;

        const word = words[col.wordIndex] || "TAMVONLINE";
        const coreLetter = CORE_LETTERS[Math.floor(Math.random() * CORE_LETTERS.length)];
        const wordLetter = word[col.charIndex % word.length];

        // profundo → más algoritmo (letras sueltas), cerca → más palabra legible
        const letter = depth > 0.5 ? coreLetter : wordLetter;

        // gradiente vertical con cabeza brillante y cola suave
        const gradient = ctx.createLinearGradient(x, y - fontSize * 5, x, y + fontSize);

        const headColor = baseColor;
        const haloColor = `rgba(59, 245, 255, ${0.35 * col.opacity + 0.25 * z})`;
        const tailColor = `rgba(0, 160, 255, ${0.15 * col.opacity + 0.1 * z})`;

        gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(0.35, tailColor);
        gradient.addColorStop(0.8, haloColor);
        gradient.addColorStop(1, headColor);

        ctx.fillStyle = gradient;
        ctx.font = `${fontSize}px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace`;
        ctx.textAlign = "center";

        // “desenfoque” por profundidad
        ctx.shadowColor = `rgba(59, 245, 255, ${0.25 + 0.4 * z})`;
        ctx.shadowBlur = 4 + 20 * z;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.globalAlpha = col.opacity;
        ctx.fillText(letter, x, y);
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        // actualizar posición de la columna (respiración del espacio)
        col.y += velocity * (fontSize / 9);

        // reset cuando sale del canvas
        if (col.y > height + fontSize * 2) {
          col.y = -fontSize * (2 + Math.random() * 6);
          col.depth = Math.random();
          const z2 = 1 - col.depth;
          col.scale = 0.7 + Math.random() * 1.1;
          col.drift = (Math.random() - 0.5) * 1.2;
          col.opacity = 0.3 + 0.7 * z2;
          col.wordIndex = Math.floor(Math.random() * words.length);
          col.charIndex = Math.floor(Math.random() * CORE_LETTERS.length);
        } else {
          if (Math.random() < 0.5) {
            col.charIndex = (col.charIndex + 1) % word.length;
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", initColumns);
      cancelAnimationFrame(animationFrameId);
    };
  }, [baseColor, minFontSize, maxFontSize, speed, density, words]);

  return <canvas ref={canvasRef} className={`matrix-canvas ${className ?? ""}`} />;
};

export default TAMVTrixEffect;
