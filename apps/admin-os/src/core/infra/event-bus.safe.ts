import { eventsDroppedTotal } from "@/infra/metrics/prometheus";

export type Listener<T = unknown> = (payload: T) => void | Promise<void>;

interface QueuedEvent {
  event: string;
  payload: unknown;
}

export class SafeEventBus {
  private listeners = new Map<string, Set<Listener>>();
  private queue: QueuedEvent[] = [];
  private processing = false;
  private dropped = 0;
  private emitted = 0;

  constructor(
    private maxQueue = 1_000,
    private maxListeners = 100,
  ) {}

  on(event: string, fn: Listener) {
    const set = this.listeners.get(event) ?? new Set<Listener>();
    if (set.size >= this.maxListeners) return false;

    set.add(fn);
    this.listeners.set(event, set);
    return true;
  }

  off(event: string, fn: Listener) {
    this.listeners.get(event)?.delete(fn);
  }

  emit(event: string, payload: unknown) {
    if (this.queue.length >= this.maxQueue) {
      this.dropped += 1;
      eventsDroppedTotal.inc();
      return false;
    }

    this.emitted += 1;
    this.queue.push({ event, payload });
    queueMicrotask(() => void this.process());
    return true;
  }


  getDroppedCount() {
    return this.dropped;
  }

  getStats() {
    return {
      emitted: this.emitted,
      dropped: this.dropped,
      listeners: [...this.listeners.values()].reduce((acc, set) => acc + set.size, 0),
    };
  }

  private async process() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length) {
      const current = this.queue.shift();
      if (!current) continue;

      const set = this.listeners.get(current.event);
      if (!set) continue;

      for (const fn of set) {
        try {
          await fn(current.payload);
        } catch {
          // isolate listener failures
        }
      }
    }

    this.processing = false;
  }
}

export const safeBus = new SafeEventBus();
