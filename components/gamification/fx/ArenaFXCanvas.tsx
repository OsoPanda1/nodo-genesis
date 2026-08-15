'use client';

/* ------------------------------------------------------------------ */
/* ARENA FX — Lienzo atmosférico con bucle rAF y calidad adaptativa    */
/* ------------------------------------------------------------------ */
/* Capa de efectos GPU para la arena de combate y el mapa. Rendea con  */
/* un único bucle requestAnimationFrame, presupuesto de partículas con */
/* pooling, DPR con tope y pausa automática cuando la pestaña queda    */
/* oculta o el usuario pide menos movimiento.                          */
/* ------------------------------------------------------------------ */

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { AdaptiveQuality, QualityTier } from '@/lib/gamification/visual/quality';
import { FxEngine, FxKind, FxOptions } from '@/lib/gamification/visual/fx-engine';

export interface ArenaFXHandle {
  emit: (kind: FxKind, opts: FxOptions) => boolean;
  burst: (kind: FxKind, count: number, opts: FxOptions) => number;
  clear: () => void;
}

export interface ArenaFXProps {
  className?: string;
  /** Brasas ambientales por segundo (0 desactiva). */
  ambientRate?: number;
  initialBudget?: number;
  onTierChange?: (tier: QualityTier) => void;
}

export default forwardRef<ArenaFXHandle, ArenaFXProps>(function ArenaFXCanvas(
  { className, ambientRate = 2, initialBudget = 200, onTierChange }: ArenaFXProps,
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FxEngine | null>(null);
  const qualityRef = useRef<AdaptiveQuality>(new AdaptiveQuality());
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const runningRef = useRef(true);
  const widthRef = useRef(320);
  const heightRef = useRef(240);
  const tierRef = useRef<QualityTier>(qualityRef.current.tier);

  useImperativeHandle(
    ref,
    () => ({
      emit: (kind, opts) => {
        const engine = engineRef.current;
        if (!engine) return false;
        if (opts.normalize) {
          return engine.spawn(kind, { ...opts, x: opts.x * widthRef.current, y: opts.y * heightRef.current });
        }
        return engine.spawn(kind, opts);
      },
      burst: (kind, count, opts) => {
        const engine = engineRef.current;
        if (!engine) return 0;
        if (opts.normalize) {
          return engine.burst(kind, count, { ...opts, x: opts.x * widthRef.current, y: opts.y * heightRef.current });
        }
        return engine.burst(kind, count, opts);
      },
      clear: () => engineRef.current?.clear(),
    }),
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const engine = new FxEngine(initialBudget);
    engineRef.current = engine;
    const quality = qualityRef.current;
    const reducedMotion =
      typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const parent = canvas.parentElement ?? canvas;
    const applySize = () => {
      const w = parent.clientWidth || 320;
      const h = parent.clientHeight || 240;
      if (w === widthRef.current && h === heightRef.current) return;
      widthRef.current = w;
      heightRef.current = h;
      const dpr = Math.min(window.devicePixelRatio || 1, quality.config.dprCap);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    applySize();

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(applySize) : null;
    observer?.observe(parent);

    const loop = (now: number) => {
      if (!runningRef.current) return;
      const last = lastRef.current || now;
      const dt = Math.min((now - last) / 1000, 0.05);
      lastRef.current = now;

      const tier = quality.measure(dt * 1000);
      if (tier !== tierRef.current) {
        tierRef.current = tier;
        engine.resize(quality.config.particleBudget);
        applySize();
        onTierChange?.(tier);
      }

      if (!reducedMotion && quality.config.ambient && ambientRate > 0) {
        const spawnProbability = ambientRate * dt;
        if (Math.random() < spawnProbability) {
          engine.spawn('ember', {
            x: Math.random() * widthRef.current,
            y: heightRef.current + 6,
            vy: -(18 + Math.random() * 40),
            size: 1.2 + Math.random() * 2.4,
            color: '#fcd34d',
            life: 3 + Math.random() * 3,
          });
        }
        engine.update(dt);
      }

      ctx.clearRect(0, 0, widthRef.current, heightRef.current);
      engine.render(ctx, widthRef.current, heightRef.current, quality.config);
      rafRef.current = requestAnimationFrame(loop);
    };

    const onVisibilityChange = () => {
      const shouldPause = document.hidden || reducedMotion;
      if (shouldPause) {
        runningRef.current = false;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      } else {
        runningRef.current = true;
        lastRef.current = 0;
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    runningRef.current = true;
    rafRef.current = requestAnimationFrame(loop);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      runningRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      observer?.disconnect();
      engineRef.current = null;
    };
  }, [ambientRate, initialBudget, onTierChange]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
});
