/* ------------------------------------------------------------------ */
/* PRA Score Engine — Olvido Activo y relevancia de memoria            */
/* ------------------------------------------------------------------ */
/* Motor de persistencia de MNEMOS: aplica decaimiento temporal, peso  */
/* por scope (FAIR & POSI) y bono por etiquetas para decidir qué       */
/* recuerdos se conservan y cuáles se olvidan activamente.             */
/* ------------------------------------------------------------------ */

import { IsabellaMemoryItem } from './contracts';
import { getAllMemoryItems, setAllMemoryItems } from './memory';

export const PRA_ENGINE = {
  name: 'PRA Score Engine',
  version: '1.0.0',
  principle: 'Algoritmo de Olvido Activo (Active Forgetting) y relevancia de memoria',
  standard: 'Fair Data Principles (FAIR & POSI)',
  halfLifeDays: 30,
};

const SCOPE_WEIGHT: Record<string, number> = {
  immediate: 1,
  session: 1.1,
  project: 1.3,
  territorial: 1.5,
  historical: 2,
};

export function praScore(item: IsabellaMemoryItem, now: number = Date.now()): number {
  const ageMs = Math.max(0, now - new Date(item.createdAt).getTime());
  const halfLifeMs = PRA_ENGINE.halfLifeDays * 24 * 60 * 60 * 1000;
  const decay = Math.pow(0.5, ageMs / halfLifeMs);

  let score = item.relevance * (0.4 + 0.6 * decay);
  score *= SCOPE_WEIGHT[item.scope] ?? 1;
  score += Math.min(0.2, item.tags.length * 0.05);
  return Math.min(2, Math.max(0, score));
}

export interface PraPruneResult {
  engine: string;
  removed: number;
  remaining: number;
  removedItems: string[];
}

export function praPrune(now: number = Date.now()): PraPruneResult {
  const items = getAllMemoryItems();
  const kept: IsabellaMemoryItem[] = [];
  const removedItems: string[] = [];

  for (const item of items) {
    const expired = item.expiresAt ? new Date(item.expiresAt).getTime() < now : false;
    const score = praScore(item, now);
    if (expired || score < 0.25) {
      removedItems.push(item.id);
    } else {
      kept.push(item);
    }
  }

  setAllMemoryItems(kept);
  return { engine: PRA_ENGINE.name, removed: removedItems.length, remaining: kept.length, removedItems };
}

export function praSummary(now: number = Date.now()): {
  engine: string;
  items: number;
  topScore: number;
  bottomScore: number;
} {
  const items = getAllMemoryItems();
  if (items.length === 0) return { engine: PRA_ENGINE.name, items: 0, topScore: 0, bottomScore: 0 };
  const scores = items.map(i => praScore(i, now)).sort((a, b) => a - b);
  return {
    engine: PRA_ENGINE.name,
    items: items.length,
    topScore: scores[scores.length - 1],
    bottomScore: scores[0],
  };
}
