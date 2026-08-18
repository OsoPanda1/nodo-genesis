import type { TuristaEstado } from "@/core/models";
import { ExperienceOrchestrator } from "@/orchestrator/experience.orchestrator";
import { decisionStore } from "@/orchestrator/decision.store";

const exits = [
  { lat: 20.14032, lng: -98.67156 },
  { lat: 20.13971, lng: -98.67411 },
];

export const isabellaOrchestrator = new ExperienceOrchestrator(exits);

export function registerTouristState(t: TuristaEstado) {
  const decision = isabellaOrchestrator.evaluar(t);
  if (decision) {
    decisionStore.save(decision);
  }
  return decision;
}

export function getLastDecision() {
  return decisionStore.getLastDecision();
}

// backward-compatible alias
export const evaluateTouristExperience = registerTouristState;
