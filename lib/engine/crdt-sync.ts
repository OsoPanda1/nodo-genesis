/* ============================================================================
 * RDM DIGITAL — NODO CERO 3D ENGINE
 * Conflict-Free Replicated Data Types (CRDTs) & Lock-Free Ring Buffer (MPSC)
 * Offline-First Deterministic Eventual Consistency Engine
 * ============================================================================ */

/**
 * Vector Clock for causal order tracking across distributed edge nodes
 */
export class VectorClock {
  public readonly clockMap: Map<string, number>;

  constructor(initial?: Record<string, number>) {
    this.clockMap = new Map<string, number>();
    if (initial) {
      for (const [nodeId, time] of Object.entries(initial)) {
        this.clockMap.set(nodeId, time);
      }
    }
  }

  public increment(nodeId: string): void {
    const current = this.clockMap.get(nodeId) ?? 0;
    this.clockMap.set(nodeId, current + 1);
  }

  public merge(other: VectorClock): void {
    for (const [nodeId, otherTime] of other.clockMap.entries()) {
      const localTime = this.clockMap.get(nodeId) ?? 0;
      this.clockMap.set(nodeId, Math.max(localTime, otherTime));
    }
  }

  public toJSON(): Record<string, number> {
    const res: Record<string, number> = {};
    for (const [k, v] of this.clockMap.entries()) {
      res[k] = v;
    }
    return res;
  }
}

/**
 * PN-Counter CRDT (Positive-Negative Counter for Points & Economic Telemetry)
 */
export class PNCounterCRDT {
  private pMap: Map<string, number> = new Map();
  private nMap: Map<string, number> = new Map();

  public increment(nodeId: string, amount: number = 1): void {
    const current = this.pMap.get(nodeId) ?? 0;
    this.pMap.set(nodeId, current + amount);
  }

  public decrement(nodeId: string, amount: number = 1): void {
    const current = this.nMap.get(nodeId) ?? 0;
    this.nMap.set(nodeId, current + amount);
  }

  public value(): number {
    let pSum = 0;
    let nSum = 0;
    for (const v of this.pMap.values()) pSum += v;
    for (const v of this.nMap.values()) nSum += v;
    return pSum - nSum;
  }

  public merge(other: PNCounterCRDT): void {
    for (const [nodeId, v] of other.pMap.entries()) {
      this.pMap.set(nodeId, Math.max(this.pMap.get(nodeId) ?? 0, v));
    }
    for (const [nodeId, v] of other.nMap.entries()) {
      this.nMap.set(nodeId, Math.max(this.nMap.get(nodeId) ?? 0, v));
    }
  }
}

/**
 * Last-Write-Wins Element Set (LWW-Element-Set) CRDT for Quest & Inventory state
 */
export type LWWElement<T> = {
  element: T;
  timestamp: number;
  nodeId: string;
};

export class LWWSetCRDT<T> {
  private addSet: Map<string, LWWElement<T>> = new Map();
  private removeSet: Map<string, LWWElement<T>> = new Map();

  public add(key: string, element: T, nodeId: string, timestamp: number = Date.now()): void {
    const existing = this.addSet.get(key);
    if (!existing || timestamp > existing.timestamp) {
      this.addSet.set(key, { element, timestamp, nodeId });
    }
  }

  public remove(key: string, element: T, nodeId: string, timestamp: number = Date.now()): void {
    const existing = this.removeSet.get(key);
    if (!existing || timestamp > existing.timestamp) {
      this.removeSet.set(key, { element, timestamp, nodeId });
    }
  }

  public has(key: string): boolean {
    const addElem = this.addSet.get(key);
    if (!addElem) return false;
    const remElem = this.removeSet.get(key);
    if (!remElem) return true;
    return addElem.timestamp >= remElem.timestamp;
  }

  public getElements(): T[] {
    const result: T[] = [];
    for (const [key, addElem] of this.addSet.entries()) {
      const remElem = this.removeSet.get(key);
      if (!remElem || addElem.timestamp >= remElem.timestamp) {
        result.push(addElem.element);
      }
    }
    return result;
  }
}

/**
 * Lock-Free Multi-Producer Single-Consumer (MPSC) Ring Buffer
 */
export class MPSCRingBuffer<T> {
  private buffer: Array<T | null>;
  private capacity: number;
  private head: number = 0;
  private tail: number = 0;

  constructor(capacity: number = 1024) {
    this.capacity = capacity;
    this.buffer = new Array<T | null>(capacity).fill(null);
  }

  public enqueue(item: T): boolean {
    const nextTail = (this.tail + 1) % this.capacity;
    if (nextTail === this.head) {
      return false; // Buffer full
    }
    this.buffer[this.tail] = item;
    this.tail = nextTail;
    return true;
  }

  public dequeue(): T | null {
    if (this.head === this.tail) {
      return null; // Buffer empty
    }
    const item = this.buffer[this.head];
    this.buffer[this.head] = null;
    this.head = (this.head + 1) % this.capacity;
    return item;
  }

  public size(): number {
    return (this.tail - this.head + this.capacity) % this.capacity;
  }
}
