/* ================================================================== */
/* RESILIENCIA — Reintentos con backoff exponencial y jitter          */
/* ================================================================== */

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  /** Factor de multiplicación del delay por intento. */
  factor?: number;
  /** Jitter aleatorio 0..1 sobre el delay para des-sincronizar. */
  jitter?: number;
  /** Retorna true si el error es reintentable. */
  retryable?: (err: unknown) => boolean;
  /** Callback por cada reintento. */
  onRetry?: (attempt: number, delayMs: number, err: unknown) => void;
}

const DEFAULT_RETRYABLE = (err: unknown): boolean =>
  !(err instanceof Error && /(4\d\d|invalid|not found|forbidden)/i.test(err.message));

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Calcula el delay con backoff exponencial y jitter. */
export function backoffDelay(attempt: number, options: RetryOptions): number {
  const base = options.baseDelayMs ?? 100;
  const max = options.maxDelayMs ?? 5000;
  const factor = options.factor ?? 2;
  const jitterRatio = options.jitter ?? 0.25;
  const expo = Math.min(max, base * Math.pow(factor, attempt));
  const jitterMs = expo * jitterRatio * Math.random();
  return Math.round(expo + jitterMs);
}

/** Ejecuta fn reintentando según la política (backoff exponencial). */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxAttempts = Math.max(1, options.maxAttempts ?? 3);
  const retryable = options.retryable ?? DEFAULT_RETRYABLE;
  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!retryable(err) || attempt >= maxAttempts - 1) throw err;
      const wait = backoffDelay(attempt, options);
      options.onRetry?.(attempt + 1, wait, err);
      await delay(wait);
    }
  }
  throw lastErr;
}

/** Variante síncrona útil para cálculos puros. */
export function withRetrySync<T>(
  fn: () => T,
  options: { attempts?: number } = {},
): T {
  const attempts = Math.max(1, options.attempts ?? 1);
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return fn();
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}
