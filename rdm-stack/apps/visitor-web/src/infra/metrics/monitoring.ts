/**
 * Tracks the start time of a process.
 */
export function trackStart(): number {
  return Date.now();
}

/**
 * Tracks the end time of a process and calculates latency.
 */
export function trackEnd(startTime: number): number {
  const endTime = Date.now();
  return endTime - startTime;
}
