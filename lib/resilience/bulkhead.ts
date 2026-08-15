/* ================================================================== */
/* RESILIENCIA — Bulkhead (aislamiento de concurrencia)               */
/* ================================================================== */

export class Bulkhead {
  private active = 0;
  private waiting: Array<{ resolve: () => void }> = [];

  constructor(
    private maxConcurrent: number,
    private maxQueue = 0,
  ) {}

  /** ¿Hay cupo inmediato sin esperar cola? */
  hasCapacity(): boolean {
    return this.active < this.maxConcurrent;
  }

  queueLength(): number {
    return this.waiting.length;
  }

  activeCount(): number {
    return this.active;
  }

  /** Adquiere un cupo (espera en cola si es necesario). */
  private async acquire(): Promise<() => void> {
    if (this.active < this.maxConcurrent) {
      this.active += 1;
      return this.release.bind(this);
    }
    if (this.maxQueue > 0 && this.waiting.length >= this.maxQueue) {
      throw new Error(`Bulkhead: cola llena (${this.waiting.length} esperando).`);
    }
    await new Promise<void>(resolve => this.waiting.push({ resolve }));
    this.active += 1;
    return this.release.bind(this);
  }

  private release(): void {
    this.active -= 1;
    const next = this.waiting.shift();
    if (next) next.resolve();
  }

  /** Ejecuta fn bajo el semáforo del bulkhead. */
  async run<T>(fn: () => Promise<T>): Promise<T> {
    const release = await this.acquire();
    try {
      return await fn();
    } finally {
      release();
    }
  }

  reset(): void {
    while (this.waiting.length) this.waiting.shift()?.resolve();
    this.active = 0;
  }
}
