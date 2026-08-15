export type Vector = number[];

export interface EmbeddingResult {
  vector: Vector;
  dimensions: number;
  provider?: string;
}

export interface SimilarityResult {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export function normalize(vector: Vector): Vector {
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  if (magnitude === 0) return vector;
  return vector.map((v) => v / magnitude);
}

export function cosineSimilarity(a: Vector, b: Vector): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export function dotProduct(a: Vector, b: Vector): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }
  return a.reduce((sum, v, i) => sum + v * b[i], 0);
}

export function magnitude(vector: Vector): number {
  return Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
}

export function add(a: Vector, b: Vector): Vector {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }
  return a.map((v, i) => v + b[i]);
}

export function subtract(a: Vector, b: Vector): Vector {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }
  return a.map((v, i) => v - b[i]);
}

export function scale(vector: Vector, scalar: number): Vector {
  return vector.map((v) => v * scalar);
}

export function average(vectors: Vector[]): Vector {
  if (vectors.length === 0) return [];
  const dims = vectors[0].length;
  const sum = Array(dims).fill(0);
  for (const vec of vectors) {
    for (let i = 0; i < dims; i++) sum[i] += vec[i];
  }
  return sum.map((s) => s / vectors.length);
}

export function rankResults(scores: Map<string, number>, topK = 10): SimilarityResult[] {
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([id, score]) => ({ id, score }));
}

export function normalizeEmbeddings(embeddings: Vector[]): Vector[] {
  return embeddings.map(normalize);
}
