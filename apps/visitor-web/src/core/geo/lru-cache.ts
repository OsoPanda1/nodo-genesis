type Node<K, V> = {
  key: K;
  value: V;
  prev?: Node<K, V>;
  next?: Node<K, V>;
  expiresAt: number;
};

export class LRUCache<K, V> {
  private map = new Map<K, Node<K, V>>();
  private head?: Node<K, V>;
  private tail?: Node<K, V>;

  constructor(
    private capacity: number,
    private ttlMs = 30_000,
    private now = () => Date.now(),
  ) {}

  get(key: K): V | undefined {
    const n = this.map.get(key);
    if (!n) return;

    if (n.expiresAt <= this.now()) {
      this.deleteNode(n);
      return;
    }

    this.moveToFront(n);
    return n.value;
  }

  set(key: K, value: V) {
    let n = this.map.get(key);
    const expiresAt = this.now() + this.ttlMs;

    if (n) {
      n.value = value;
      n.expiresAt = expiresAt;
      this.moveToFront(n);
      return;
    }

    n = { key, value, expiresAt };
    this.map.set(key, n);
    this.addToFront(n);

    if (this.map.size > this.capacity) {
      this.evict();
    }
  }

  size() {
    return this.map.size;
  }

  private moveToFront(n: Node<K, V>) {
    if (n !== this.head) {
      this.remove(n);
      this.addToFront(n);
    }
  }

  private addToFront(n: Node<K, V>) {
    n.prev = undefined;
    n.next = this.head;
    if (this.head) this.head.prev = n;
    this.head = n;
    if (!this.tail) this.tail = n;
  }

  private remove(n: Node<K, V>) {
    if (n.prev) n.prev.next = n.next;
    if (n.next) n.next.prev = n.prev;
    if (n === this.head) this.head = n.next;
    if (n === this.tail) this.tail = n.prev;
    n.next = undefined;
    n.prev = undefined;
  }

  private deleteNode(n: Node<K, V>) {
    this.map.delete(n.key);
    this.remove(n);
  }

  private evict() {
    if (!this.tail) return;
    this.deleteNode(this.tail);
  }
}
