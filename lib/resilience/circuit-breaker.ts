/* ================================================================== */
/* RESILIENCIA — Circuit Breaker (closed → open → half-open)          */
/* ================================================================== */

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerOptions {
  /** Fallos consecutivos que abren el circuito. */
  failureThreshold?: number;
  /** Milisegundos que el circuito permanece abierto antes de probar. */
  resetTimeoutMs?: number;
  /** Tasa mínima de éxito (0..1) para mantener cerrado el circuito. */
  successThreshold?: number;
  /** Tamaño de la ventana de observación. */
  windowSize?: number;
  /** Valor de retorno cuando el circuito está abierto (degradación). */
  fallback?: <T>(reason: string) => T;
  onStateChange?: (from: CircuitState, to: CircuitState, reason: string) => void;
}

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private consecutiveFailures = 0;
  private consecutiveSuccesses = 0;
  private openedAt = 0;
  private recentResults: boolean[] = [];

  constructor(private options: CircuitBreakerOptions = {}) {}

  getState(): CircuitState {
    this.maybeTransitionHalfOpen();
    return this.state;
  }

  /** ¿Está permitido ejecutar la operación protegida? */
  allow(): boolean {
    const state = this.getState();
    if (state === 'open') return false;
    if (state === 'half-open') {
      /* Solo un intento de prueba a la vez. */
      return this.consecutiveSuccesses < 1;
    }
    return true;
  }

  /** Registra un resultado exitoso. */
  recordSuccess(): void {
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses += 1;
    this.recentResults.push(true);
    this.trim();
    if (this.state === 'half-open' && this.consecutiveSuccesses >= this.requiredSuccesses()) {
      this.transition('closed', 'recuperación confirmada');
    }
  }

  /** Registra un fallo. */
  recordFailure(reason = 'error'): void {
    this.consecutiveFailures += 1;
    this.consecutiveSuccesses = 0;
    this.recentResults.push(false);
    this.trim();
    if (this.state === 'closed' && this.consecutiveFailures >= this.failureThreshold()) {
      this.transition('open', reason);
    }
    if (this.state === 'half-open') {
      this.transition('open', `reintento fallido: ${reason}`);
    }
  }

  /** Ejecuta fn protegida por el circuito con degradación controlada. */
  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.allow()) {
      const reason = `circuito abierto (reset en ${this.resetMsLeft()} ms)`;
      if (this.options.fallback) {
        const result = this.options.fallback<T>(reason);
        if (result !== undefined) return result;
      }
      throw new CircuitOpenError(reason);
    }
    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (err) {
      this.recordFailure(err instanceof Error ? err.message : String(err));
      throw err;
    }
  }

  private requiredSuccesses(): number {
    return 1;
  }

  private failureThreshold(): number {
    return this.options.failureThreshold ?? 5;
  }

  private successRate(): number {
    if (this.recentResults.length === 0) return 1;
    const ok = this.recentResults.filter(Boolean).length;
    return ok / this.recentResults.length;
  }

  private trim(): void {
    const size = this.options.windowSize ?? 20;
    if (this.recentResults.length > size) {
      this.recentResults = this.recentResults.slice(-size);
    }
  }

  private resetMsLeft(): number {
    const timeout = this.options.resetTimeoutMs ?? 30_000;
    return Math.max(0, this.openedAt + timeout - Date.now());
  }

  private maybeTransitionHalfOpen(): void {
    if (this.state === 'open') {
      const timeout = this.options.resetTimeoutMs ?? 30_000;
      if (Date.now() - this.openedAt >= timeout) {
        this.transition('half-open', 'ventana de reset cumplida');
      }
    }
  }

  private transition(to: CircuitState, reason: string): void {
    const from = this.state;
    this.state = to;
    if (to === 'open') this.openedAt = Date.now();
    if (to === 'half-open') this.consecutiveSuccesses = 0;
    this.options.onStateChange?.(from, to, reason);
  }

  reset(): void {
    this.state = 'closed';
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses = 0;
    this.openedAt = 0;
    this.recentResults = [];
  }
}

export class CircuitOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitOpenError';
  }
}
