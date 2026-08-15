export interface Coordenadas {
  lat: number;
  lng: number;
}

export interface TuristaEstado {
  id: string;
  territory?: string;
  coords: Coordenadas;
  prevCoords?: Coordenadas;
  stayTimeHours: number;
  activityTimestamps: {
    lastInteractionAt: Date;
  };
}

export type DecisionLevel = "CRITICO" | "ALERTA";
export type RetentionIntent = "SAFE_EXIT" | "UPSELL" | "DISCOVERY";

export interface ScoreBreakdown {
  total: number;
  factors: Record<string, number>;
}


export interface ExplainabilityLog {
  ruleVersion: string;
  deterministicSeed: string;
  factors: Array<{
    name: string;
    value: number;
    weight?: number;
    rationale: string;
  }>;
  notes: string[];
}

export interface IsabellaDecision {
  traceId: string;
  territory: string;
  level: DecisionLevel;
  retentionIntent: RetentionIntent;
  score: ScoreBreakdown;
  pattern: "EXPLORING" | "EXITING" | "IDLE";
  distanceToExit: number;
  speedMps: number;
  coords: Coordenadas;
  payload: {
    titulo: string;
    mensaje: string;
    ruta_ar_activada: boolean;
  };
  explainability?: ExplainabilityLog;
}


// backward-compatible alias for existing imports
export type Decision = IsabellaDecision;
