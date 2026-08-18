export type TrafficSegment = {
  id: string;
  name: string;
  flowVehiclesPerHour: number;
  capacityVehiclesPerHour: number;
  avgSpeedKmh: number;
  freeFlowSpeedKmh: number;
};

export type MobilityAlert = {
  id: string;
  segmentId: string;
  message: string;
  level: 'info' | 'warning' | 'critical';
};

export type MobilityState = {
  timestamp: string;
  congestionIndex: number;
  segments: Array<TrafficSegment & { utilizationPercent: number; speedRatio: number }>;
  alerts: MobilityAlert[];
  vehiclesActive: number;
};

export function segmentUtilization(segment: TrafficSegment): number {
  if (segment.capacityVehiclesPerHour <= 0) return 0;
  return Math.min(100, Math.round((segment.flowVehiclesPerHour / segment.capacityVehiclesPerHour) * 100));
}

export function buildMobilityState(segments: TrafficSegment[]): MobilityState {
  const enriched = segments.map((segment) => {
    const utilizationPercent = segmentUtilization(segment);
    const speedRatio = segment.freeFlowSpeedKmh > 0 ? segment.avgSpeedKmh / segment.freeFlowSpeedKmh : 1;
    return { ...segment, utilizationPercent, speedRatio: Math.min(1, speedRatio) };
  });

  const congestionIndex =
    enriched.length > 0
      ? Math.round((enriched.reduce((sum, s) => sum + s.utilizationPercent, 0) / enriched.length / 100) * 100) / 100
      : 0;

  const alerts: MobilityAlert[] = enriched
    .filter((s) => s.utilizationPercent >= 75)
    .map((s) => ({
      id: `mob-${s.id}`,
      segmentId: s.id,
      message: `Congestión en ${s.name}`,
      level: s.utilizationPercent >= 90 ? 'critical' : 'warning',
    }));

  return {
    timestamp: new Date().toISOString(),
    congestionIndex,
    segments: enriched,
    alerts,
    vehiclesActive: 0,
  };
}

export function seedTrafficSegments(): TrafficSegment[] {
  return [
    { id: 'acc-norte', name: 'Acceso norte', flowVehiclesPerHour: 720, capacityVehiclesPerHour: 800, avgSpeedKmh: 18, freeFlowSpeedKmh: 40 },
    { id: 'av-mineria', name: 'Av. Minería', flowVehiclesPerHour: 540, capacityVehiclesPerHour: 750, avgSpeedKmh: 24, freeFlowSpeedKmh: 40 },
    { id: 'callej-real', name: 'Callejón del Real', flowVehiclesPerHour: 120, capacityVehiclesPerHour: 220, avgSpeedKmh: 10, freeFlowSpeedKmh: 20 },
    { id: 'plaza-nac', name: 'Plaza Nacional', flowVehiclesPerHour: 300, capacityVehiclesPerHour: 320, avgSpeedKmh: 12, freeFlowSpeedKmh: 25 },
    { id: 'bajada-ocampo', name: 'Bajada Ocampo', flowVehiclesPerHour: 260, capacityVehiclesPerHour: 500, avgSpeedKmh: 30, freeFlowSpeedKmh: 45 },
  ];
}
