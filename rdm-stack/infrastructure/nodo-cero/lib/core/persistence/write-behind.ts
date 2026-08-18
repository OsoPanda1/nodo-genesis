/* ================================================================== */
/* PERSISTENCIA — Write-behind + registro de hidratación               */
/* ================================================================== */
/* El corazón del patrón durable: los stores mantienen su API SÍNCRONA  */
/* (latencia hiper baja, sin round-trips) y las escrituras a Postgres/  */
/* Redis se programan en segundo plano. Así se persiste "sin tocar el   */
/* resto de la capa".                                                   */
/*                                                                     */
/* - schedulePersist(): encola una escritura diferida. Usa after() de   */
/*   Next.js cuando existe (no bloquea la respuesta y se ejecuta tras    */
/*   enviarla); si no, hace fire-and-forget con captura de errores.      */
/* - registerHydrator(): registra una función de carga inicial que      */
/*   instrumentation.ts ejecuta al arrancar el server.                  */
/* ================================================================== */

import 'server-only';
import { after as nextAfter } from 'next/server';

type PersistTask = () => Promise<unknown>;

interface WriteBehindState {
  inFlight: number;
  scheduled: number;
  failed: number;
  lastError: string | null;
  hydrators: Map<string, () => Promise<void>>;
  hydrated: Set<string>;
}

const g = globalThis as unknown as { __rdmWriteBehind?: WriteBehindState };

function state(): WriteBehindState {
  if (!g.__rdmWriteBehind) {
    g.__rdmWriteBehind = {
      inFlight: 0,
      scheduled: 0,
      failed: 0,
      lastError: null,
      hydrators: new Map(),
      hydrated: new Set(),
    };
  }
  return g.__rdmWriteBehind;
}

/** Referencia estática a `after` de Next.js: evita `require()` dinámico y
 *  mantiene el patrón write-behind compatible con el auditor del repo. */
function getAfter(): (task: () => void) => void {
  return nextAfter;
}

async function run(label: string, task: PersistTask): Promise<void> {
  const s = state();
  s.inFlight += 1;
  try {
    await task();
  } catch (error) {
    s.failed += 1;
    s.lastError = `${label}: ${error instanceof Error ? error.message : 'unknown'}`;
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[v0] write-behind fallo (${label}):`, s.lastError);
    }
  } finally {
    s.inFlight -= 1;
  }
}

/**
 * Programa una escritura diferida a la capa durable. Nunca lanza hacia el
 * llamador: la fuente de verdad en caliente sigue siendo la memoria.
 */
export function schedulePersist(label: string, task: PersistTask): void {
  const s = state();
  s.scheduled += 1;
  const after = getAfter();
  if (after) {
    try {
      after(() => {
        void run(label, task);
      });
      return;
    } catch {
      /* fuera de un scope de request: cae a fire-and-forget */
    }
  }
  void run(label, task);
}

/** Registra un cargador de estado inicial (idempotente por clave). */
export function registerHydrator(key: string, hydrate: () => Promise<void>): void {
  state().hydrators.set(key, hydrate);
}

/** Ejecuta todos los hidratadores pendientes (llamado desde instrumentation). */
export async function hydrateAll(): Promise<{ hydrated: string[]; skipped: string[]; errors: Record<string, string> }> {
  const s = state();
  const hydrated: string[] = [];
  const skipped: string[] = [];
  const errors: Record<string, string> = {};
  for (const [key, fn] of s.hydrators) {
    if (s.hydrated.has(key)) {
      skipped.push(key);
      continue;
    }
    try {
      await fn();
      s.hydrated.add(key);
      hydrated.push(key);
    } catch (error) {
      errors[key] = error instanceof Error ? error.message : 'unknown';
    }
  }
  return { hydrated, skipped, errors };
}

export function writeBehindStats(): {
  scheduled: number;
  inFlight: number;
  failed: number;
  lastError: string | null;
  hydrators: number;
  hydrated: number;
} {
  const s = state();
  return {
    scheduled: s.scheduled,
    inFlight: s.inFlight,
    failed: s.failed,
    lastError: s.lastError,
    hydrators: s.hydrators.size,
    hydrated: s.hydrated.size,
  };
}
