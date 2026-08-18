/* ================================================================== */
/* OBSERVABILIDAD YUN — SLO y presupuestos de error                    */
/* ================================================================== */
/* Define objetivos de nivel de servicio (disponibilidad objetivo) y   */
/* calcula el presupuesto de error consumido y su ritmo de quema.      */
/* Estados: healthy -> at-risk -> exhausted. La quema de presupuesto   */
/* alimenta al Guardian Kernel para escalar autonomía o elevar nivel.  */
/* ================================================================== */

export type BudgetStatus = 'healthy' | 'at-risk' | 'exhausted';

export interface SloDefinition {
  /** Identificador del SLO (p.ej. `api.core.availability`). */
  name: string;
  /** Disponibilidad objetivo en 0..1 (p.ej. 0.99 = 99%). */
  target: number;
  /** Ventana del presupuesto en ms (p.ej. 30 días). */
  windowMs: number;
}

export interface SloOutcome {
  ok: boolean;
}

export interface SloRecord extends SloDefinition {
  total: number;
  errors: number;
  windowStartedAt: number;
}

export interface BudgetReport extends SloRecord {
  availability: number;
  allowedErrorRate: number;
  currentErrorRate: number;
  consumedPercent: number;
  burnRate: number;
  remainingMs: number;
  status: BudgetStatus;
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

export class SloManager {
  private records = new Map<string, SloRecord>();

  register(definition: SloDefinition): void {
    const existing = this.records.get(definition.name);
    this.records.set(definition.name, {
      ...definition,
      total: existing?.total ?? 0,
      errors: existing?.errors ?? 0,
      windowStartedAt: existing?.windowStartedAt ?? Date.now(),
    });
  }

  recordOutcome(name: string, outcome: SloOutcome): void {
    const record = this.records.get(name);
    if (!record) return;
    record.total += 1;
    if (!outcome.ok) record.errors += 1;
  }

  report(name: string): BudgetReport | null {
    const record = this.records.get(name);
    if (!record) return null;
    const { target, windowMs, total, errors } = record;
    const allowedErrorRate = 1 - target;
    const availability = total === 0 ? 1 : 1 - errors / total;
    const currentErrorRate = total === 0 ? 0 : errors / total;
    const consumedPercent = clamp01(currentErrorRate / Math.max(allowedErrorRate, 0.0001));
    const burnRate = currentErrorRate / Math.max(allowedErrorRate, 0.0001);
    const remainingMs = Math.round(windowMs * (1 - consumedPercent));
    const status: BudgetStatus =
      consumedPercent >= 1 ? 'exhausted' : consumedPercent >= 0.8 ? 'at-risk' : 'healthy';
    return {
      ...record,
      availability,
      allowedErrorRate,
      currentErrorRate,
      consumedPercent,
      burnRate,
      remainingMs,
      status,
    };
  }

  reports(): BudgetReport[] {
    return [...this.records.keys()].map(name => this.report(name)).filter((r): r is BudgetReport => r !== null);
  }

  clear(): void {
    this.records.clear();
  }
}
