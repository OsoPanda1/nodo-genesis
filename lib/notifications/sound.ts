/* ================================================================== */
/* SONIDO — Síntesis Web Audio (chimes y alertas del Nodo)            */
/* ================================================================== */
/* Sin archivos de audio: genera campanadas y tonos con el API Web     */
/* Audio. Seguro: solo se activa tras un gesto del usuario (política   */
/* de autoplay de los navegadores).                                    */
/* ================================================================== */

export type SoundKind = 'info' | 'success' | 'warning' | 'critical' | 'capture';

let audioCtx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(value: boolean): void {
  enabled = value;
}

export function isSoundEnabled(): boolean {
  return enabled;
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  if (audioCtx.state === 'suspended') void audioCtx.resume();
  return audioCtx;
}

function tone(
  ctx: AudioContext,
  freq: number,
  start: number,
  duration: number,
  gainValue: number,
  type: OscillatorType = 'sine',
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(gainValue, ctx.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration + 0.05);
}

const KINDS: Record<SoundKind, Array<[number, number, number]>> = {
  info: [[880, 0.12, 0.08]],
  success: [[659, 0, 0.12], [988, 0.1, 0.14]],
  warning: [[392, 0, 0.2], [311, 0.15, 0.22]],
  critical: [[196, 0, 0.3], [196, 0.3, 0.3], [196, 0.6, 0.4]],
  capture: [[523, 0, 0.1], [659, 0.09, 0.1], [784, 0.18, 0.16]],
};

/** Reproduce el sonido correspondiente al tipo (no-op si está apagado). */
export function playSound(kind: SoundKind = 'info'): void {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  const notes = KINDS[kind] ?? KINDS.info;
  for (const [freq, start, duration] of notes) {
    tone(ctx, freq, start, duration, 0.12, kind === 'warning' || kind === 'critical' ? 'triangle' : 'sine');
  }
}
