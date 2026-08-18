/* ================================================================== */
/* UTILS — Matemática y hashing (canónico)                            */
/* ================================================================== */

/** FNV-1a de 32 bits + longitud de entrada. Estable para igualdad de
 *  contenido y barrido en buckets (no criptográfico). */
export function fnv1aChecksum(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `${(h >>> 0).toString(16).padStart(8, '0')}-${input.length.toString(16)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
