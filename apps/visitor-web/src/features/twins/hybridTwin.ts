import type { MapMarkerData } from "@/features/places/mapTypes";

export type TwinSource =
  | "eclipse-ditto"
  | "open-twins"
  | "forge-digital-twin"
  | "smart-hotel-iot"
  | "underrun-sim"
  | "awesome-digital-twins";

export interface TwinSignal {
  source: TwinSource;
  markerId: string;
  throughputPerMinute: number;
  latencyMs: number;
  health: "healthy" | "degraded" | "offline";
  confidence: number;
  mode: "historical" | "realtime" | "simulated";
}

export interface TwinOverlaySummary {
  source: TwinSource;
  displayName: string;
  healthScore: number;
  throughputPerMinute: number;
  avgLatencyMs: number;
  incidents: number;
  modeMix: Record<TwinSignal["mode"], number>;
}

const sourceNames: Record<TwinSource, string> = {
  "eclipse-ditto": "Eclipse Ditto",
  "open-twins": "OpenTwins",
  "forge-digital-twin": "Autodesk Forge",
  "smart-hotel-iot": "SmartHotel360 IoT",
  "underrun-sim": "Underrun Simulation",
  "awesome-digital-twins": "Awesome Digital Twins",
};

function seededValue(seed: string, min: number, max: number) {
  const hash = Array.from(seed).reduce(
    (acc, char, index) => acc + char.charCodeAt(0) * (index + 3),
    0,
  );
  const ratio = (Math.sin(hash) + 1) / 2;
  return min + ratio * (max - min);
}

export function synthesizeTwinSignals(markers: MapMarkerData[]): TwinSignal[] {
  const sources: TwinSource[] = [
    "eclipse-ditto",
    "open-twins",
    "forge-digital-twin",
    "smart-hotel-iot",
    "underrun-sim",
    "awesome-digital-twins",
  ];

  return markers.flatMap((marker) =>
    sources.map((source) => {
      const latencyMs = Math.round(seededValue(`${source}-${marker.id}-latency`, 45, 340));
      const throughputPerMinute = Math.round(
        seededValue(`${source}-${marker.id}-throughput`, 12, marker.isPremium ? 145 : 84),
      );
      const confidence = Number(
        seededValue(`${source}-${marker.id}-confidence`, 0.72, 0.98).toFixed(2),
      );
      const health: TwinSignal["health"] =
        latencyMs < 120 && confidence > 0.85 ? "healthy" : latencyMs < 240 ? "degraded" : "offline";

      const mode: TwinSignal["mode"] =
        source === "underrun-sim"
          ? "simulated"
          : source === "awesome-digital-twins"
            ? "historical"
            : "realtime";

      return {
        source,
        markerId: marker.id,
        latencyMs,
        throughputPerMinute,
        health,
        confidence,
        mode,
      };
    }),
  );
}

export function buildTwinOverlaySummary(signals: TwinSignal[]): TwinOverlaySummary[] {
  const grouped = new Map<TwinSource, TwinSignal[]>();

  for (const signal of signals) {
    if (!grouped.has(signal.source)) grouped.set(signal.source, []);
    grouped.get(signal.source)?.push(signal);
  }

  return Array.from(grouped.entries()).map(([source, items]) => {
    const throughputPerMinute = items.reduce((total, item) => total + item.throughputPerMinute, 0);
    const avgLatencyMs = Math.round(
      items.reduce((total, item) => total + item.latencyMs, 0) / Math.max(1, items.length),
    );
    const incidents = items.filter((item) => item.health !== "healthy").length;
    const healthScore = Math.max(0, 100 - incidents * 8 - Math.round(avgLatencyMs / 20));

    const modeMix: Record<TwinSignal["mode"], number> = {
      historical: items.filter((item) => item.mode === "historical").length,
      realtime: items.filter((item) => item.mode === "realtime").length,
      simulated: items.filter((item) => item.mode === "simulated").length,
    };

    return {
      source,
      displayName: sourceNames[source],
      healthScore,
      throughputPerMinute,
      avgLatencyMs,
      incidents,
      modeMix,
    };
  });
}

export function buildRecommendedActions(summaries: TwinOverlaySummary[]) {
  return summaries
    .filter((summary) => summary.healthScore < 80 || summary.avgLatencyMs > 180)
    .sort((a, b) => a.healthScore - b.healthScore)
    .slice(0, 4)
    .map((summary) => {
      if (summary.source === "eclipse-ditto") {
        return `Sincronizar twins de Eclipse Ditto con cola de eventos prioritaria (${summary.avgLatencyMs}ms).`;
      }
      if (summary.source === "forge-digital-twin") {
        return `Reducir tamaño de geometrías en Autodesk Forge para bajar latencia de render.`;
      }
      if (summary.source === "smart-hotel-iot") {
        return `Ajustar frecuencia de telemetría de SmartHotel360 IoT para estabilizar throughput.`;
      }
      if (summary.source === "open-twins") {
        return `Validar conectores semánticos de OpenTwins y reintentos para incidentes detectados.`;
      }
      if (summary.source === "underrun-sim") {
        return `Recalibrar capa de simulación Underrun para mantener coherencia con datos reales.`;
      }
      return `Actualizar catálogo de patrones desde Awesome Digital Twins para reforzar modelos híbridos.`;
    });
}
