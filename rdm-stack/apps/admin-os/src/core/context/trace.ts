export function createTraceId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  const fallback = Math.random().toString(16).slice(2);
  return `trace-${Date.now()}-${fallback}`;
}
