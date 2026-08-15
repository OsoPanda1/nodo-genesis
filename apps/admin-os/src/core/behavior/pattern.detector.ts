export type MovementPattern = "EXPLORING" | "EXITING" | "IDLE";

interface PatternInput {
  speedMps: number;
  distanceToExit: number;
}

export function detectMovementPattern(input: PatternInput): MovementPattern {
  if (input.speedMps < 0.2) return "IDLE";
  if (input.distanceToExit < 120 && input.speedMps >= 1.1) return "EXITING";
  return "EXPLORING";
}
