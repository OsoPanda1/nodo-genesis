/* ================================================================== */
/* LATENCIA — Planos de ejecución (1º, 2º, 3º)                        */
/* ================================================================== */
/* Estrategia de "latencia casi cero":                                 */
/*   · PLANO 1 (hot): responde al instante con datos calientes         */
/*     (caché / estado en memoria), sin I/O.                           */
/*   · PLANO 2 (warm): refresca datos fríos en segundo plano sin       */
/*     bloquear la respuesta del plano 1.                              */
/*   · PLANO 3 (cold): mantenimiento pesado (poda, recomputo,          */
/*     agregados) en intervalos programados de bajo costo.             */
/* ================================================================== */

export const PLANES = ['first', 'second', 'third'] as const;
export type Plane = (typeof PLANES)[number];

export interface PlaneTask<T> {
  id: string;
  plane: Plane;
  run: () => Promise<T> | T;
  /** Para el tercer plano: intervalo en ms. */
  intervalMs?: number;
}

const thirdPlaneTasks = new Map<string, PlaneTask<unknown>>();
const timers = new Map<string, NodeJS.Timeout>();

/** Agenda una tarea de tercer plano (mantenimiento periódico). */
export function scheduleThirdPlane<T>(task: PlaneTask<T>): void {
  const existing = thirdPlaneTasks.get(task.id);
  if (existing) {
    stopThirdPlane(task.id);
  }
  thirdPlaneTasks.set(task.id, task as PlaneTask<unknown>);
  const interval = task.intervalMs ?? 60_000;
  const timer = setInterval(() => {
    void Promise.resolve().then(task.run).catch(() => undefined);
  }, interval);
  timers.set(task.id, timer);
  /* Ejecución inicial en el arranque. */
  void Promise.resolve().then(task.run).catch(() => undefined);
}

export function stopThirdPlane(id: string): void {
  const timer = timers.get(id);
  if (timer) clearInterval(timer);
  timers.delete(id);
  thirdPlaneTasks.delete(id);
}

export function thirdPlaneStatus(): Array<{ id: string; intervalMs: number }> {
  return [...thirdPlaneTasks.entries()].map(([id, task]) => ({
    id,
    intervalMs: task.intervalMs ?? 60_000,
  }));
}

/** Planos registrados por el Nodo. */
export const lazyPlanesStatus = (): { planes: Plane[]; third: Array<{ id: string; intervalMs: number }> } => ({
  planes: [...PLANES],
  third: thirdPlaneStatus(),
});
