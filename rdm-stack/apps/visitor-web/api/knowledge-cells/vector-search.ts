import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export interface VectorSearchParams {
  queryEmbedding: number[];
  matchThreshold: number;
  matchCount: number;
  filterMetadata?: Record<string, any>;
}

export interface VectorSearchResult {
  id: string;
  content: string;
  similarity: number;
  metadata: Record<string, any>;
}

export async function performVectorSearch(params: VectorSearchParams): Promise<VectorSearchResult[]> {
  const { queryEmbedding, matchThreshold = 0.7, matchCount = 5, filterMetadata = {} } = params;

  if (!queryEmbedding || !Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
    throw new Error("Invalid or empty query embedding vector");
  }
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables not configured");
  }

  try {
    const formattedVector = `[${queryEmbedding.join(",")}]`;

    const { data, error } = await supabase.rpc("match_knowledge_cells", {
      query_embedding: formattedVector,
      match_threshold: matchThreshold,
      match_count: matchCount,
      filter_metadata: filterMetadata,
    });

    if (error) throw new Error(`Supabase RPC error: ${error.message}`);

    if (!data || !Array.isArray(data)) return [];

    return data.map((row: any) => ({
      id: String(row.id),
      content: typeof row.content === "string" ? row.content : "",
      similarity: typeof row.similarity === "number" ? row.similarity : 0,
      metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
    }));
  } catch (error: any) {
    console.error("CRITICAL: vector-search.ts ->", error.message);
    return [];
  }
}
