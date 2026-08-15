/* ------------------------------------------------------------------ */
/* GAMIFICATION YUN — Motor de partículas (pool, cero alojamiento)     */
/* ------------------------------------------------------------------ */
/* Capa de efectos 2D para la arena y el mapa: brasas, niebla, chispas,*/
/* ondas de choque, rayos de sellado y sellos giratorios. Usa un pool  */
/* de partículas recicladas (sin GC por fotograma), delta-time con cota */
/* superior y presupuesto dinámico según el tier de calidad.           */
/* ------------------------------------------------------------------ */

import { QualityConfig } from './quality';

export type FxKind = 'ember' | 'fog' | 'spark' | 'ring' | 'beam' | 'sigil';

export interface FxOptions {
  x: number;
  y: number;
  /** Si es true, x/y se interpretan en 0..1 respecto al lienzo. */
  normalize?: boolean;
  vx?: number;
  vy?: number;
  size?: number;
  color?: string;
  life?: number;
  growth?: number;
  /** Apertura angular de dispersión en burst (radianes). */
  spreadAngle?: number;
  /** Radio de dispersión espacial en burst. */
  spread?: number;
  /** Velocidad base en burst. */
  speed?: number;
}

export interface FxParticle {
  active: boolean;
  kind: FxKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  color: string;
  life: number;
  maxLife: number;
  growth: number;
  alpha: number;
  seed: number;
}

const KIND_COLORS: Record<FxKind, string> = {
  ember: '#fcd34d',
  fog: '#67e8f9',
  spark: '#ffffff',
  ring: '#f43f5e',
  beam: '#34d399',
  sigil: '#fbbf24',
};

function createParticle(kind: FxKind): FxParticle {
  return {
    active: false,
    kind,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    size: 0,
    baseSize: 0,
    color: '',
    life: 0,
    maxLife: 1,
    growth: 0,
    alpha: 1,
    seed: Math.random(),
  };
}

export class FxEngine {
  private pool: FxParticle[];
  private budget: number;

  constructor(budget = 200) {
    this.budget = budget;
    this.pool = Array.from({ length: budget }, () => createParticle('ember'));
  }

  get size(): number {
    return this.budget;
  }

  get activeCount(): number {
    let count = 0;
    for (const particle of this.pool) {
      if (particle.active) count += 1;
    }
    return count;
  }

  /** Ajusta el presupuesto sin invalidar las partículas vivas. */
  resize(budget: number): void {
    if (budget === this.budget) return;
    if (budget > this.pool.length) {
      const extra = budget - this.pool.length;
      this.pool.push(...Array.from({ length: extra }, () => createParticle('ember')));
    } else {
      for (let i = budget; i < this.pool.length; i += 1) {
        this.pool[i].active = false;
      }
      this.pool.length = budget;
    }
    this.budget = budget;
  }

  spawn(kind: FxKind, opts: FxOptions): boolean {
    const particle = this.pool.find(p => !p.active);
    if (!particle) return false;

    particle.active = true;
    particle.kind = kind;
    particle.x = opts.x;
    particle.y = opts.y;
    particle.vx = opts.vx ?? 0;
    particle.vy = opts.vy ?? 0;
    particle.size = opts.size ?? 3;
    particle.baseSize = particle.size;
    particle.color = opts.color ?? KIND_COLORS[kind];
    particle.life = 0;
    particle.maxLife = opts.life ?? 1;
    particle.growth = opts.growth ?? 0;
    particle.alpha = 1;
    particle.seed = Math.random();
    return true;
  }

  /** Dispersa `count` partículas alrededor de un punto. Devuelve las emitidas. */
  burst(kind: FxKind, count: number, opts: FxOptions): number {
    let spawned = 0;
    const spread = opts.spread ?? 20;
    const spreadAngle = opts.spreadAngle ?? 1.4;
    const speed = opts.speed ?? 90;
    const baseAngle = opts.vx === undefined && opts.vy === undefined ? Math.PI / 2 : Math.atan2(opts.vy ?? 0, opts.vx ?? 0);

    for (let i = 0; i < count; i += 1) {
      const angle = baseAngle + (Math.random() - 0.5) * spreadAngle;
      const magnitude = speed * (0.5 + Math.random());
      if (
        this.spawn(kind, {
          x: opts.x + (Math.random() - 0.5) * spread,
          y: opts.y + (Math.random() - 0.5) * spread,
          vx: Math.cos(angle) * magnitude,
          vy: Math.sin(angle) * magnitude,
          size: (opts.size ?? 2.6) * (0.7 + Math.random() * 0.8),
          color: opts.color,
          life: (opts.life ?? 0.7) * (0.7 + Math.random() * 0.6),
          growth: opts.growth,
        })
      ) {
        spawned += 1;
      }
    }
    return spawned;
  }

  clear(): void {
    for (const particle of this.pool) {
      particle.active = false;
    }
  }

  update(dt: number): void {
    for (const particle of this.pool) {
      if (!particle.active) continue;

      particle.life += dt;
      if (particle.life >= particle.maxLife) {
        particle.active = false;
        continue;
      }

      const t = particle.life / particle.maxLife;
      switch (particle.kind) {
        case 'ember':
          particle.y += particle.vy * dt;
          particle.x += particle.vx * dt + Math.sin(particle.life * 2 + particle.seed * 6.28) * 8 * dt;
          particle.size = Math.max(0.4, particle.baseSize * (1 - t * 0.6));
          particle.alpha = t < 0.15 ? (t / 0.15) * 0.85 : t > 0.6 ? ((1 - t) / 0.4) * 0.85 : 0.85;
          break;
        case 'fog':
          particle.x += particle.vx * dt;
          particle.y += particle.vy * dt;
          particle.alpha = 0.16 * (1 - t);
          break;
        case 'spark':
          particle.vy += 340 * dt;
          particle.x += particle.vx * dt;
          particle.y += particle.vy * dt;
          particle.size = Math.max(0.2, particle.baseSize * (1 - t));
          particle.alpha = 1 - t;
          break;
        case 'ring':
          particle.size = particle.baseSize + particle.growth * particle.life;
          particle.alpha = Math.max(0, 1 - t);
          break;
        case 'sigil':
          particle.size = particle.baseSize + particle.growth * particle.life;
          particle.alpha = t < 0.7 ? 0.9 : ((1 - t) / 0.3) * 0.9;
          break;
        case 'beam':
          particle.y -= particle.vy * dt;
          particle.size = particle.baseSize * (1 - t * 0.5);
          particle.alpha = 0.55 + Math.sin(particle.life * 10 + particle.seed * 6.28) * 0.25;
          break;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, width: number, height: number, config: QualityConfig): void {
    const useShadows = config.shadows;
    for (const particle of this.pool) {
      if (!particle.active) continue;

      switch (particle.kind) {
        case 'fog':
          ctx.save();
          ctx.globalAlpha = particle.alpha;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.ellipse(particle.x, particle.y, particle.size, particle.size * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        case 'ring':
        case 'sigil':
          ctx.save();
          ctx.globalAlpha = particle.alpha;
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = Math.max(1, particle.size * 0.08);
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          break;
        case 'beam':
          ctx.save();
          ctx.globalAlpha = particle.alpha;
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = Math.max(1, particle.size * 0.2);
          ctx.beginPath();
          ctx.moveTo(particle.x, height);
          ctx.lineTo(particle.x, particle.y);
          ctx.stroke();
          ctx.restore();
          break;
        default: {
          ctx.save();
          ctx.globalAlpha = particle.alpha;
          ctx.fillStyle = particle.color;
          if (useShadows) {
            ctx.shadowColor = particle.color;
            ctx.shadowBlur = particle.size * 2;
          }
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        }
      }
    }
  }
}
