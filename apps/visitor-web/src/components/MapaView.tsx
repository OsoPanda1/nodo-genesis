import { useMemo, useState } from "react";
import { Map as MapIcon, Activity, Layers, Hexagon } from "lucide-react";
import { motion } from "framer-motion";
import { Map2DPanel } from "@/components/map/Map2DPanel";
import { Map3DTwin } from "@/components/map/Map3DTwin";
import {
  DEFAULT_MAP_VIEWPORT,
  type MapMarkerData,
  type MapViewportState,
} from "@/features/places/mapTypes";

const DEFAULT_MARKERS: MapMarkerData[] = [
  {
    id: "mina-acosta",
    name: "Museo de Sitio Mina Acosta",
    category: "Historia",
    lat: 20.1377,
    lng: -98.6759,
    description: "Patrimonio minero con recorrido guiado por túneles históricos.",
    image: "/placeholder.svg",
    type: "place",
    isPremium: true,
    status: "Verificado",
  },
  {
    id: "paste-leyenda",
    name: "Pastes de la Leyenda",
    category: "Gastronomía",
    lat: 20.1394,
    lng: -98.6724,
    description: "Cocina local con receta tradicional de paste hidalguense.",
    image: "/placeholder.svg",
    type: "business",
    status: "Activo",
  },
  {
    id: "panteon-ingles",
    name: "Panteón Inglés",
    category: "Turismo",
    lat: 20.1421,
    lng: -98.6768,
    description: "Sitio emblemático y mirador panorámico de Real del Monte.",
    image: "/placeholder.svg",
    type: "place",
    status: "En alta demanda",
  },
];

export default function MapaView() {
  const [viewMode, setViewMode] = useState<"2d" | "3d">("3d");
  const [viewport, setViewport] = useState<MapViewportState>(DEFAULT_MAP_VIEWPORT);
  const [selected, setSelected] = useState<MapMarkerData | null>(null);

  const markers = useMemo(() => DEFAULT_MARKERS, []);

  return (
    <div className="flex flex-col gap-6 p-2">
      <header className="flex flex-col gap-4 justify-between md:flex-row md:items-end">
        <div>
          <h2 className="text-4xl font-light tracking-tighter text-white">
            Gemelo Digital <span className="italic text-slate-400">RDM</span>
          </h2>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-slate-500">
            <Hexagon className="w-3 h-3 text-blue-400" />
            <span>Sincronización LSM v4.2 - Activa</span>
          </div>
        </div>

        <nav className="flex rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
          {(["2d", "3d"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-6 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${
                viewMode === mode
                  ? "bg-white text-black shadow-lg"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {mode} View
            </button>
          ))}
        </nav>
      </header>

      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl">
        {viewMode === "2d" ? (
          <Map2DPanel
            markers={markers}
            selected={selected}
            viewport={viewport}
            onSelect={setSelected}
            onViewportChange={(next) => setViewport((prev) => ({ ...prev, ...next }))}
          />
        ) : (
          <Map3DTwin
            viewport={viewport}
            markers={markers}
            onViewportChange={(next) => setViewport((prev) => ({ ...prev, ...next }))}
          />
        )}

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="h-[40rem] w-[40rem] rounded-full border border-white/10 shadow-[inset_0_0_100px_rgba(255,255,255,0.05)]"
          />
        </div>
      </section>

      <footer className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "Active Federated Nodes", value: "124", icon: Layers, color: "text-blue-400" },
          {
            label: "Kernel Frequency",
            value: "1.2 GHz",
            icon: Activity,
            color: "text-emerald-400",
          },
          { label: "LSM Sync Matrix", value: "98.2%", icon: MapIcon, color: "text-slate-100" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="group overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:bg-white/[0.05]"
          >
            <div className="flex items-center gap-5">
              <div className="rounded-2xl bg-white/5 p-4 text-slate-400 transition-transform group-hover:scale-110">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">{stat.label}</p>
                <p className="text-2xl font-light text-slate-100">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </footer>
    </div>
  );
}
