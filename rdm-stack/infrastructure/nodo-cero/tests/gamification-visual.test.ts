import { describe, it, expect } from 'vitest';
import { AdaptiveQuality, QUALITY_CONFIGS } from '@/lib/gamification/visual/quality';
import { FxEngine } from '@/lib/gamification/visual/fx-engine';

/* La calidad adaptativa garantiza latencia casi cero: degrada efectos
   cuando el FPS cae y los recupera cuando hay holgura. El motor de
   partículas recicla un pool fijo para no generar GC por fotograma. */

describe('calidad adaptativa', () => {
  it('arranca en alta y degrada cuando los fotogramas se alargan', () => {
    const q = new AdaptiveQuality();
    expect(q.tier).toBe('high');

    for (let i = 0; i < 80; i += 1) q.measure(30);
    expect(q.tier).toBe('medium');

    for (let i = 0; i < 80; i += 1) q.measure(30);
    expect(q.tier).toBe('low');
  });

  it('recupera calidad cuando vuelve la holgura de FPS', () => {
    const q = new AdaptiveQuality();
    for (let i = 0; i < 200; i += 1) q.measure(30);
    expect(q.tier).toBe('low');

    for (let i = 0; i < 90; i += 1) q.measure(10);
    expect(q.tier).toBe('medium');

    for (let i = 0; i < 80; i += 1) q.measure(10);
    expect(q.tier).toBe('high');
  });

  it('cada tier tiene un presupuesto de partículas decreciente', () => {
    expect(QUALITY_CONFIGS.high.particleBudget).toBeGreaterThan(QUALITY_CONFIGS.medium.particleBudget);
    expect(QUALITY_CONFIGS.medium.particleBudget).toBeGreaterThan(QUALITY_CONFIGS.low.particleBudget);
    expect(QUALITY_CONFIGS.low.particleBudget).toBeGreaterThan(0);
  });

  it('reset devuelve el medidor a alta', () => {
    const q = new AdaptiveQuality();
    for (let i = 0; i < 130; i += 1) q.measure(30);
    expect(q.tier).toBe('low');
    q.reset();
    expect(q.tier).toBe('high');
  });
});

describe('motor de partículas', () => {
  it('respeta el presupuesto del pool', () => {
    const engine = new FxEngine(10);
    let spawned = 0;
    for (let i = 0; i < 40; i += 1) {
      if (engine.spawn('ember', { x: 0, y: 0 })) spawned += 1;
    }
    expect(spawned).toBe(10);
    expect(engine.activeCount).toBe(10);
    expect(engine.size).toBe(10);
  });

  it('reutiliza las partículas vencidas', () => {
    const engine = new FxEngine(4);
    engine.spawn('ember', { x: 0, y: 0, life: 1 });
    engine.update(1.2);
    expect(engine.activeCount).toBe(0);

    engine.spawn('ember', { x: 5, y: 5 });
    expect(engine.activeCount).toBe(1);
  });

  it('resize crece y recorta el pool conservando las vivas', () => {
    const engine = new FxEngine(4);
    engine.spawn('ember', { x: 0, y: 0 });

    engine.resize(8);
    expect(engine.size).toBe(8);
    expect(engine.activeCount).toBe(1);

    engine.resize(2);
    expect(engine.size).toBe(2);
    expect(engine.activeCount).toBe(1);
  });

  it('burst dispersa sin superar el presupuesto', () => {
    const engine = new FxEngine(6);
    const n = engine.burst('spark', 20, { x: 0, y: 0, spread: 10, speed: 50 });
    expect(n).toBe(6);
    expect(engine.activeCount).toBe(6);
  });

  it('clear apaga todas las partículas', () => {
    const engine = new FxEngine(5);
    engine.burst('spark', 5, { x: 0, y: 0 });
    engine.clear();
    expect(engine.activeCount).toBe(0);
  });

  it('render dibuja sin lanzar errores con un contexto stub', () => {
    const ctx = new Proxy(
      {},
      {
        get: (_target, prop) => {
          if (prop === 'createLinearGradient' || prop === 'createRadialGradient') {
            return () => ({ addColorStop: () => undefined });
          }
          return () => undefined;
        },
      },
    ) as unknown as CanvasRenderingContext2D;

    const engine = new FxEngine(8);
    engine.burst('ember', 4, { x: 10, y: 10 });
    engine.burst('spark', 4, { x: 20, y: 20 });
    engine.spawn('ring', { x: 15, y: 15, growth: 20 });
    engine.spawn('beam', { x: 25, y: 5, vy: 10 });
    engine.spawn('fog', { x: 30, y: 30 });
    engine.spawn('sigil', { x: 40, y: 40 });

    expect(() => engine.render(ctx, 320, 240, QUALITY_CONFIGS.high)).not.toThrow();
    expect(() => engine.render(ctx, 320, 240, QUALITY_CONFIGS.low)).not.toThrow();
  });
});
