import type { TwinInstanceRecord, TwinStatus } from './twin-types';

export type TwinSimulationResult = {
  instanceId: string;
  score: number;
  status: TwinStatus;
  alerts: string[];
};

function numeric(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function simulateTwin(instance: TwinInstanceRecord): TwinSimulationResult {
  const telemetry = instance.telemetry as Record<string, unknown>;
  let score = 100;
  const alerts: string[] = [];

  const temperature = numeric(telemetry.temperature);
  const vibration = numeric(telemetry.vibration);
  const hasPressure = 'pressureBar' in telemetry;
  const pressureBar = numeric(telemetry.pressureBar);

  if (temperature > 60) {
    score -= 18;
    alerts.push('Temperatura elevada');
  } else if (temperature > 45) {
    score -= 6;
  }
  if (vibration > 1.5) {
    score -= 25;
    alerts.push('Vibración fuera de rango');
  } else if (vibration > 1.0) {
    score -= 8;
  }
  if (hasPressure && pressureBar < 1.2) {
    score -= 20;
    alerts.push('Presión anómala');
  }
  const load = numeric(telemetry.loadKw);
  const capacity = numeric(instance.properties.capacityKw);
  if (capacity > 0 && load / capacity > 0.9) {
    score -= 12;
    alerts.push('Carga cercana a la capacidad');
  }

  const status: TwinStatus = score >= 85 ? 'healthy' : score >= 70 ? 'warning' : score >= 45 ? 'critical' : 'offline';

  return { instanceId: instance.id, score: Math.max(0, score), status, alerts };
}
