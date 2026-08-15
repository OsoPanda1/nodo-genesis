import { getCache } from "./cache";
import { normalize, cosineSimilarity, rankResults } from "../packages/vector-core/index";
import { tokenize } from "../packages/vector-core/tokenizer";

export interface IndexEntry {
  id: string;
  vector: number[];
  metadata?: Record<string, unknown>;
  text?: string;
}

const indexCache = getCache();
const INDEX_TTL = 30 * 60 * 1000;

export function buildIndex(entries: IndexEntry[]): void {
  const normalized = entries.map((e) => ({
    ...e,
    vector: normalize(e.vector),
  }));
  indexCache.set("vector_index", normalized, INDEX_TTL);
}

export function getIndex(): IndexEntry[] {
  return indexCache.get<IndexEntry[]>("vector_index") || [];
}

export function search(queryVector: number[], topK = 10): Array<{ id: string; score: number; metadata?: Record<string, unknown> }> {
  const index = getIndex();
  if (index.length === 0) return [];

  const normalizedQuery = normalize(queryVector);
  const scores = new Map<string, number>();

  for (const entry of index) {
    const score = cosineSimilarity(normalizedQuery, entry.vector);
    scores.set(entry.id, score);
  }

  return rankResults(scores, topK).map((r) => {
    const entry = index.find((e) => e.id === r.id);
    return { ...r, metadata: entry?.metadata };
  });
}

export function textSearch(query: string, topK = 10): Array<{ id: string; score: number }> {
  const { tokens: queryTokens } = tokenize(query);
  if (queryTokens.length === 0) return [];

  const index = getIndex();
  const scores = new Map<string, number>();

  for (const entry of index) {
    if (!entry.text) continue;
    const { tokens: entryTokens } = tokenize(entry.text);
    const matchCount = queryTokens.filter((t) => entryTokens.includes(t)).length;
    if (matchCount > 0) {
      scores.set(entry.id, matchCount / queryTokens.length);
    }
  }

  return rankResults(scores, topK);
}
