/* ================================================================== */
/* UTILS — Utilidades compartidas del core TAMV                       */
/* ================================================================== */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clases Tailwind (shadcn/ui). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Genera un UUID v4. Compatible con Node 18+ (crypto.randomUUID). */
export function uuid(): string {
  const crypto = globalThis.crypto;
  if (crypto && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const rnd = (globalThis as unknown as { crypto?: { getRandomValues?: (arr: Uint8Array) => Uint8Array } })
    .crypto;
  if (rnd?.getRandomValues) {
    const bytes = new Uint8Array(16);
    rnd.getRandomValues(bytes);
    bytes[6] = (bytes[6]! & 0x0f) | 0x40;
    bytes[8] = (bytes[8]! & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Marca ISO 8601 en UTC. */
export function nowIso(): string {
  return new Date().toISOString();
}
