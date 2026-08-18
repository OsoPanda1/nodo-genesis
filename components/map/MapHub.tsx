"use client";

/* ------------------------------------------------------------------ */
/* HUB DE MAPAS — gemelo digital 2D/3D unificado                       */
/* Tres lecturas del mismo territorio alimentadas por RDM_POIS. El     */
/* modo por defecto es 2D (Leaflet, fiable en cualquier entorno); el   */
/* 3D se carga de forma diferida para no bloquear el resto del hub.    */
/* ------------------------------------------------------------------ */

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { Box, Map as MapIcon, FileJson, Layers3 } from "lucide-react";
import { RDM_POIS } from "@/lib/data/rdm-data";
import { DEFAULT_MAP_VIEWPORT, type MapMarkerData, type MapViewportState } from "@/components/map/Map3DTwin";
import { TerritorialSVGMap, mapRdmPoisToTerritorial } from "@/components/map/TerritorialSVGMap";
import DigitalTwinMap from "@/components/map/DigitalTwinMap";
import { MapErrorBoundary } from "@/components/map/MapErrorBoundary";

const Map3DTwin = dynamic(
  () =>
    import("@/components/map/Map3DTwin").then((m) => m.Map3DTwin),
  { ssr: false, loading: () => <p className="p-8 text-sm text-[#93a5ad]">Cargando gemelo 3D…</p> }
);

type MapMode = "2d" | "svg" | "3d";

const MODES: { id: MapMode; label: string; icon: React.ReactNode }[] = [
  { id: "2d", label: "Mapa 2D", icon: <MapIcon className="h-4 w-4" /> },
  { id: "svg", label: "Mapa Soberano", icon: <Layers3 className="h-4 w-4" /> },
  { id: "3d", label: "Mapa 3D", icon: <Box className="h-4 w-4" /> },
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
  const [mode, setMode] = useState<MapMode>("2d");
  const [viewport, setViewport] = useState<MapViewportState>(DEFAULT_MAP_VIEWPORT);
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);

  const handleViewportChange = useCallback((next: Partial<MapViewportState>) => {
    setViewport((prev) => ({ ...prev, ...next }));
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-10">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-[#2e9cff]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2e9cff]" />
          <span className="text-[10px] font-mono uppercase tracking-[0.25em]">
            Núcleo de Experiencia Visual
          </span>
        </div>
        <h2 className="font-patrimonial text-3xl font-bold text-white md:text-4xl">
          Gemelo Digital 2D/3D
          <span className="text-[#2e9cff]"> · Cartografía Soberana</span>
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-[#93a5ad]">
          Tres lecturas del mismo territorio: cartografía en vivo, mapa soberano accesible y
          terreno 3D. Todos alimentados por los datos de RDM_POIS.
        </p>
      </header>

      {/* Selector de modo */}
      <div className="flex w-fit items-center gap-1 rounded-2xl border border-white/10 bg-[#0d1c26] p-1 shadow-[0_8px_30px_rgba(14,27,42,0.08)] backdrop-blur-md">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold transition-all ${
              mode === m.id
                ? "bg-[#2e9cff]/15 text-white shadow-md"
                : "text-[#93a5ad] hover:text-white"
            }`}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      {/* Contenido según modo */}
      <MapErrorBoundary label="El mapa encontró un error puntual. Tu sesión sigue activa.">
        {mode === "2d" && <DigitalTwinMap />}

        {mode === "svg" && (
          <TerritorialSVGMap pois={TERRITORIAL_POIS} selectedId={selectedPoiId} onSelect={setSelectedPoiId} />
        )}

        {mode === "3d" && (
          <Map3DTwin viewport={viewport} markers={MAP_MARKERS} onViewportChange={handleViewportChange} />
        )}
      </MapErrorBoundary>

      {/* Leyenda compartida */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-[#93a5ad]">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2e9cff]" /> Minas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#d97832]" /> Gastronomía
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#c9d0d4]" /> Cultura
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#0b5f6c]" /> Naturaleza
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#93a5ad]" /> Platería
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-[#93a5ad]">
          <FileJson className="h-3 w-3" /> {RDM_POIS.length} POIs · fuente: lib/data/rdm-data
        </span>
      </div>
    </div>
  );
}