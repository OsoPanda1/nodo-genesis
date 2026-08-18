/* ------------------------------------------------------------------ */
/* GAMIFICATION YUN — Calidad adaptativa (latencia casi cero)          */
/* ------------------------------------------------------------------ */
/* Fórmula de equilibrio AAA: calidad visual alta + latencia mínima.   */
/* El motor mide el tiempo de fotograma (EMA) con requestAnimationFrame */
/* y degrada la calidad de forma automática cuando el dispositivo se   */
/* queda por debajo de 60 FPS, recuperándola al volver la holgura.     */
/* Así el renderizado prioriza siempre el input del jugador y la       */
/* respuesta del turno por delante de los efectos.                     */
/* ------------------------------------------------------------------ */

export type QualityTier = 'high' | 'medium' | 'low';

export interface QualityConfig {
  /** Presupuesto total de partículas activas. */
  readonly particleBudget: number;
  /** Límite de devicePixelRatio para no rasterizar de más. */
  readonly dprCap: number;
  /** Sombra difusa (shadowBlur): cara, solo en dispositivos potentes. */
  readonly shadows: boolean;
  /** Efectos ambientales (brasa/niebla de fondo). */
  readonly ambient: boolean;
}

export const QUALITY_CONFIGS: Record<QualityTier, QualityConfig> = {
  high: { particleBudget: 200, dprCap: 1.75, shadows: true, ambient: true },
  medium: { particleBudget: 110, dprCap: 1.5, shadows: false, ambient: true },
  low: { particleBudget: 40, dprCap: 1, shadows: false, ambient: false },
};

/** ~21ms por fotograma (≈47 FPS): momento de degradar. */
const DOWNGRADE_FRAME_MS = 21;
/** ~14ms por fotograma (≈71 FPS): holgura suficiente para mejorar. */
const UPGRADE_FRAME_MS = 14;
/** Fotogramas consecutivos necesarios antes de cambiar de tier. */
const STABILITY_FRAMES = 60;

export class AdaptiveQuality {
  private ema = 16.7;
  private lowStreak = 0;
  private highStreak = 0;
  private currentTier: QualityTier = 'high';

  get tier(): QualityTier {
    return this.currentTier;
  }

  get config(): QualityConfig {
    return QUALITY_CONFIGS[this.currentTier];
  }

  /** Alimenta el medidor con la duración real del fotograma y devuelve el tier activo. */
  measure(frameMs: number): QualityTier {
    const clamped = Math.min(Math.max(frameMs, 0), 250);
    this.ema = this.ema * 0.9 + clamped * 0.1;

    if (this.ema > DOWNGRADE_FRAME_MS) {
      this.lowStreak += 1;
      this.highStreak = 0;
      if (this.lowStreak >= STABILITY_FRAMES && this.currentTier !== 'low') {
        this.currentTier = this.currentTier === 'high' ? 'medium' : 'low';
        this.lowStreak = 0;
      }
    } else if (this.ema < UPGRADE_FRAME_MS) {
      this.highStreak += 1;
      this.lowStreak = 0;
      if (this.highStreak >= STABILITY_FRAMES && this.currentTier !== 'high') {
        this.currentTier = this.currentTier === 'low' ? 'medium' : 'high';
        this.highStreak = 0;
      }
    }

    return this.currentTier;
  }

  reset(): void {
    this.ema = 16.7;
    this.lowStreak = 0;
    this.highStreak = 0;
    this.currentTier = 'high';
  }
}
