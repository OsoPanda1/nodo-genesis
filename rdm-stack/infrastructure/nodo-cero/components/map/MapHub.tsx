"use client";

/* ------------------------------------------------------------------ */
/* HUB DE MAPAS — gemelo digital 2D/3D unificado                       */
/* Tres lecturas del mismo territorio alimentadas por RDM_POIS,        */
/* envueltas en la barrera de errores para que jamás expulsen al       */
/* usuario de la plataforma.                                           */
/* ------------------------------------------------------------------ */

import { useCallback, useState } from "react";
import { Box, Map as MapIcon, FileJson, Layers3 } from "lucide-react";
import { RDM_POIS } from "@/lib/data/rdm-data";
import { Map3DTwin, DEFAULT_MAP_VIEWPORT, type MapMarkerData, type MapViewportState } from "@/components/map/Map3DTwin";
import { TerritorialSVGMap, mapRdmPoisToTerritorial } from "@/components/map/TerritorialSVGMap";
import DigitalTwinMap from "@/components/map/DigitalTwinMap";
import { MapErrorBoundary } from "@/components/map/MapErrorBoundary";

type MapMode = "3d" | "svg" | "2d";

const MODES: { id: MapMode; label: string; icon: React.ReactNode }[] = [
  { id: "3d", label: "Mapa 3D", icon: <Box className="w-4 h-4" /> },
  { id: "svg", label: "Mapa Soberano", icon: <Layers3 className="w-4 h-4" /> },
  { id: "2d", label: "Mapa 2D Leaflet", icon: <MapIcon className="w-4 h-4" /> },
];

function markersFromPois(): MapMarkerData[] {
  return RDM_POIS.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    lat: p.lat,
    lng: p.lng,
    description: p.description,
    type: p.category === "gastronomia" || p.category === "plateria" ? "business" : "place",
    isPremium: p.rating >= 4.7,
  }));
}

const MAP_MARKERS = markersFromPois();
const TERRITORIAL_POIS = mapRdmPoisToTerritorial();

export default function MapHub() {
  const [mode, setMode] = useState<MapMode>("3d");
  const [viewport, setViewport] = useState<MapViewportState>(DEFAULT_MAP_VIEWPORT);
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);

  const handleViewportChange = useCallback((next: Partial<MapViewportState>) => {
    setViewport((prev) => ({ ...prev, ...next }));
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-10">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-[#c8a356]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#c8a356]" />
          <span className="text-[10px] font-mono uppercase tracking-[0.25em]">
            Núcleo de Experiencia Visual
          </span>
        </div>
        <h2 className="font-patrimonial text-3xl font-bold text-[#0e1b2a] md:text-4xl">
          Gemelo Digital 2D/3D
          <span className="text-[#c8a356]"> · Cartografía Phygital</span>
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500">
          Tres lecturas del mismo territorio: terreno 3D con iluminación espacial, mapa soberano
          accesible y cartografía en vivo. Todos con los datos reales de RDM_POIS.
        </p>
      </header>

      {/* Selector de modo */}
      <div className="flex w-fit items-center gap-1 rounded-2xl border border-[rgba(14,27,42,0.1)] bg-white/70 p-1 shadow-[0_8px_30px_rgba(14,27,42,0.08)] backdrop-blur-md">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold transition-all ${
              mode === m.id
                ? "bg-[#0e1b2a] text-[#f5efe0] shadow-md"
                : "text-slate-500 hover:text-[#0e1b2a]"
            }`}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      {/* Contenido según modo */}
      <MapErrorBoundary label="El mapa encontró un error puntual. Tu sesión sigue activa.">
        {mode === "3d" && (
          <Map3DTwin viewport={viewport} markers={MAP_MARKERS} onViewportChange={handleViewportChange} />
        )}

        {mode === "svg" && (
          <TerritorialSVGMap pois={TERRITORIAL_POIS} selectedId={selectedPoiId} onSelect={setSelectedPoiId} />
        )}

        {mode === "2d" && <DigitalTwinMap />}
      </MapErrorBoundary>

      {/* Leyenda compartida */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#c8a356]" /> Minas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" /> Gastronomía
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#38bdf8]" /> Cultura
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#34d399]" /> Naturaleza
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Platería
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-slate-400">
          <FileJson className="h-3 w-3" /> {RDM_POIS.length} POIs · fuente: lib/data/rdm-data
        </span>
      </div>
    </div>
  );
}
