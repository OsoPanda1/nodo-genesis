import { getCache } from "./cache";
import { cosineSimilarity, rankResults, normalize } from "../packages/vector-core/index";
import { tokenize } from "../packages/vector-core/tokenizer";
import { search as vectorSearch, buildIndex, type IndexEntry } from "./vector-search";

export interface SemanticEntry {
  id: string;
  text: string;
  embedding: number[];
  metadata?: Record<string, unknown>;
  language?: "es" | "en";
}

const semanticCache = getCache();
const SEMANTIC_TTL = 30 * 60 * 1000;

export function buildSemanticIndex(entries: SemanticEntry[]): void {
  const vectorEntries: IndexEntry[] = entries.map((e) => ({
    id: e.id,
    vector: e.embedding,
    metadata: { ...e.metadata, text: e.text, language: e.language },
    text: e.text,
  }));

  buildIndex(vectorEntries);
  semanticCache.set("semantic_entries", entries, SEMANTIC_TTL);
}

export function getSemanticEntries(): SemanticEntry[] {
  return semanticCache.get<SemanticEntry[]>("semantic_entries") || [];
}

export function semanticSearch(
  queryEmbedding: number[],
  topK = 10,
): Array<{ id: string; score: number; metadata?: Record<string, unknown> }> {
  return vectorSearch(queryEmbedding, topK);
}

export function hybridSearch(
  query: string,
  queryEmbedding: number[],
  topK = 10,
): Array<{ id: string; score: number; source: "vector" | "text" | "hybrid"; metadata?: Record<string, unknown> }> {
  const { tokens } = tokenize(query);

  const entries = getSemanticEntries();
  if (entries.length === 0) return [];

  const normalizedQuery = normalize(queryEmbedding);
  const scores = new Map<string, { vectorScore: number; textScore: number; metadata?: Record<string, unknown> }>();

  for (const entry of entries) {
    const vectorScore = cosineSimilarity(normalizedQuery, entry.embedding);
    const { tokens: entryTokens } = tokenize(entry.text);
    const textScore = tokens.length > 0
      ? tokens.filter((t) => entryTokens.includes(t)).length / Math.max(tokens.length, 1)
      : 0;

    scores.set(entry.id, { vectorScore, textScore, metadata: entry.metadata });
  }

  const results = [...scores.entries()]
    .map(([id, s]) => ({
      id,
      score: s.vectorScore * 0.7 + s.textScore * 0.3,
      source: (s.vectorScore > 0.7 ? "vector" : s.textScore > 0.5 ? "text" : "hybrid") as "vector" | "text" | "hybrid",
      metadata: s.metadata,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return results;
}
