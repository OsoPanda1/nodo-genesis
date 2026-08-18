/* ================================================================== */
/* OBSERVABILIDAD — Trazas distribuidas (spans en memoria)            */
/* ================================================================== */

export type SpanStatus = 'ok' | 'error' | 'degraded';

export interface Span {
  id: string;
  traceId: string;
  parentId: string | null;
  name: string;
  startedAt: number;
  endedAt: number | null;
  durationMs: number | null;
  status: SpanStatus;
  tags: Record<string, string | number | boolean>;
}

const MAX_SPANS = 2000;
let spanSeq = 0;

function nextId(): string {
  spanSeq = (spanSeq + 1) % 0xffff;
  return `span-${Date.now().toString(36)}-${spanSeq.toString(36)}`;
}

export class Tracer {
  private spans: Span[] = [];
  private stack: Array<{ id: string; traceId: string }> = [];

  /** Crea un span abierto; devuelve el id para cerrarlo con end(). */
  start(
    name: string,
    tags: Record<string, string | number | boolean> = {},
  ): { id: string; traceId: string } {
    const parent = this.stack[this.stack.length - 1];
    const span: Span = {
      id: nextId(),
      traceId: parent?.traceId ?? nextId(),
      parentId: parent?.id ?? null,
      name,
      startedAt: Date.now(),
      endedAt: null,
      durationMs: null,
      status: 'ok',
      tags,
    };
    this.spans.push(span);
    if (this.spans.length > MAX_SPANS) this.spans.shift();
    this.stack.push({ id: span.id, traceId: span.traceId });
    return { id: span.id, traceId: span.traceId };
  }

  end(id: string, status: SpanStatus = 'ok', extraTags: Record<string, string | number | boolean> = {}): Span | null {
    const idx = this.stack.findIndex(s => s.id === id);
    if (idx >= 0) this.stack.splice(idx, 1);
    const span = this.spans.find(s => s.id === id);
    if (!span) return null;
    span.endedAt = Date.now();
    span.durationMs = span.endedAt - span.startedAt;
    span.status = status;
    span.tags = { ...span.tags, ...extraTags };
    return span;
  }

  /** Ejecuta fn bajo una traza y devuelve su resultado. */
  async trace<T>(
    name: string,
    fn: () => Promise<T> | T,
    tags: Record<string, string | number | boolean> = {},
  ): Promise<T> {
    const { id } = this.start(name, tags);
    try {
      const result = await fn();
      this.end(id, 'ok');
      return result;
    } catch (err) {
      this.end(id, 'error', {
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }

  recent(limit = 100): Span[] {
    return this.spans.slice(-limit).reverse();
  }

  /** Métricas resumidas por estado. */
  summary(): { total: number; ok: number; error: number; degraded: number; avgMs: number } {
    const done = this.spans.filter(s => s.durationMs !== null);
    const total = done.length;
    const ok = done.filter(s => s.status === 'ok').length;
    const error = done.filter(s => s.status === 'error').length;
    const degraded = done.filter(s => s.status === 'degraded').length;
    const avgMs =
      total > 0
        ? done.reduce((acc, s) => acc + (s.durationMs ?? 0), 0) / total
        : 0;
    return { total, ok, error, degraded, avgMs };
  }

  clear(): void {
    this.spans = [];
    this.stack = [];
  }
}
