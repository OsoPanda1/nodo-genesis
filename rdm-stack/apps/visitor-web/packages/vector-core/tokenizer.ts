export interface TokenizerResult {
  tokens: string[];
  embeddings?: number[];
}

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "by", "with", "from", "as", "is", "was", "are", "were", "be",
  "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "shall", "can", "need",
  "dare", "ought", "used", "this", "that", "these", "those", "i", "me",
  "my", "myself", "we", "our", "ours", "ourselves", "you", "your",
  "yours", "yourself", "yourselves", "he", "him", "his", "himself",
  "she", "her", "hers", "herself", "it", "its", "itself", "they",
  "them", "their", "theirs", "themselves", "el", "la", "los", "las",
  "un", "una", "unos", "unas", "y", "o", "pero", "en", "de", "para",
  "por", "con", "es", "son", "fue", "era", "han", "ha", "he", "has",
]);

export function tokenize(text: string, locale?: "es" | "en"): TokenizerResult {
  const normalized = text.toLowerCase().replace(/[^\w\sáéíóúüñ]/g, " ").trim();
  const words = normalized.split(/\s+/).filter(Boolean);
  const tokens = words.filter((t) => t.length > 2 && !STOP_WORDS.has(t));
  return { tokens };
}

export function tokenizeWithNGrams(text: string, minN = 1, maxN = 3): string[] {
  const { tokens } = tokenize(text);
  const ngrams: string[] = [];
  for (let n = minN; n <= maxN; n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join("_"));
    }
  }
  return ngrams;
}

export function tokenCount(text: string): number {
  const normalized = text.toLowerCase().replace(/[^\w\s]/g, " ").trim();
  return normalized.split(/\s+/).filter(Boolean).length;
}
