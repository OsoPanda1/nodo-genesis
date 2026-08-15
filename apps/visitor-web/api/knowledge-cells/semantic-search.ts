import { safeFetch } from "../_shared/network-utils";
import { performVectorSearch, VectorSearchResult } from "./vector-search";

const EMBEDDING_URL = process.env.VERCEL_AI_GATEWAY_EMBEDDING_URL || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const CACHE_LIMIT = 100;
const cache = new Map<string, { embedding: number[]; expiresAt: number }>();

async function getEmbedding(text: string, timeoutMs = 3000): Promise<number[]> {
  const key = text.trim().toLowerCase();
  const now = Date.now();

  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) return cached.embedding;

  if (!EMBEDDING_URL || !OPENAI_API_KEY) {
    throw new Error("Embedding credentials not configured");
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await safeFetch(EMBEDDING_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ input: text, model: "text-embedding-3-small" }),
    });

    if (!res.ok) throw new Error(`Embedding API error: ${res.status}`);

    const json = await res.json();
    const emb = json?.data?.[0]?.embedding;
    if (!emb || !Array.isArray(emb)) throw new Error("Corrupt embedding response");

    if (cache.size >= CACHE_LIMIT) {
      const oldest = cache.keys().next().value;
      if (oldest) cache.delete(oldest);
    }
    cache.set(key, { embedding: emb, expiresAt: now + 10 * 60 * 1000 });

    return emb;
  } finally {
    clearTimeout(id);
  }
}

export async function executeSemanticSearch(
  query: string,
  threshold = 0.65,
  limit = 5,
): Promise<VectorSearchResult[]> {
  if (!query || query.trim() === "") return [];

  try {
    const embedding = await getEmbedding(query);
    return await performVectorSearch({
      queryEmbedding: embedding,
      matchThreshold: threshold,
      matchCount: limit,
    });
  } catch (error: any) {
    console.error("CRITICAL: semantic-search.ts ->", error.message);
    return [];
  }
}
