import { IsabellaMemoryItem, MemoryScope } from './contracts';
import { fnv1aChecksum, nowIso, uuid } from './utils';

const MEMORY_KEY = 'yun:isabella:memory:v1';
const MAX_ITEMS = 200;

function isClient(): boolean {
  return typeof window !== 'undefined';
}

let serverStore: IsabellaMemoryItem[] = [];

function readAll(): IsabellaMemoryItem[] {
  if (isClient()) {
    try {
      const raw = window.localStorage.getItem(MEMORY_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as IsabellaMemoryItem[];
    } catch {
      return [];
    }
  }
  return serverStore;
}

function writeAll(items: IsabellaMemoryItem[]): void {
  if (isClient()) {
    try {
      window.localStorage.setItem(MEMORY_KEY, JSON.stringify(items.slice(-MAX_ITEMS)));
    } catch {
      /* almacenamiento no disponible */
    }
  } else {
    serverStore = items.slice(-MAX_ITEMS);
  }
}

export function addMemoryItem(input: {
  scope: MemoryScope;
  content: string;
  tags?: string[];
  relevance?: number;
  expiresAt?: string;
  actorId: string;
  sessionId: string;
}): IsabellaMemoryItem {
  const item: IsabellaMemoryItem = {
    id: uuid(),
    scope: input.scope,
    content: input.content,
    tags: input.tags ?? [],
    relevance: Math.min(1, Math.max(0, input.relevance ?? 0.5)),
    checksum: fnv1aChecksum(input.content),
    expiresAt: input.expiresAt,
    createdAt: nowIso(),
    actorId: input.actorId,
    sessionId: input.sessionId,
  };
  const items = readAll().filter(i => i.checksum !== item.checksum || i.scope !== item.scope);
  items.push(item);
  writeAll(items);
  return item;
}

export function recallMemory(query: string, scope?: MemoryScope, maxItems = 4): IsabellaMemoryItem[] {
  const q = query.toLowerCase().trim();
  const items = readAll();
  const scored = items
    .filter(i => (scope ? i.scope === scope : true))
    .map(item => {
      const haystack = `${item.content} ${item.tags.join(' ')}`.toLowerCase();
      let score = item.relevance;
      if (q) {
        const terms = q.split(/\s+/).filter(t => t.length > 2);
        const hits = terms.filter(t => haystack.includes(t)).length;
        if (terms.length > 0) score += hits / terms.length;
      }
      return { item, score };
    })
    .filter(x => x.score > 0.1)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, maxItems).map(x => x.item);
}

export function getMemoryStats(): { total: number; byScope: Record<string, number> } {
  const items = readAll();
  const byScope: Record<string, number> = {};
  for (const item of items) {
    byScope[item.scope] = (byScope[item.scope] ?? 0) + 1;
  }
  return { total: items.length, byScope };
}

export function clearSessionMemory(sessionId: string): number {
  const items = readAll().filter(i => i.sessionId !== sessionId);
  writeAll(items);
  return readAll().length;
}

export function getMemoryCount(): number {
  return readAll().length;
}

export function getAllMemoryItems(): IsabellaMemoryItem[] {
  return readAll();
}

export function setAllMemoryItems(items: IsabellaMemoryItem[]): void {
  writeAll(items);
}
