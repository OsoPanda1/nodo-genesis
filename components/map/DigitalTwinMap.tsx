"use client";

import React, { useEffect, useState } from 'react';
import { RDM_POIS, POI } from '@/lib/data/rdm-data';
import { MapPin, Navigation, Compass, ShieldCheck, Radio, Filter } from 'lucide-react';

/* ================================================================== */
/* Gemelo 2D Leaflet — cartografía soberana de Real del Monte.         */
/* Robustez: import dinámico con token anti-carrera (StrictMode),      */
/* try/catch, invalidateSize tras montar. Sin datos falsos en el HUD.  */
/* ================================================================== */

interface DigitalTwinMapProps {
  onSelectPOI?: (poi: POI) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  mina: '#2e9cff',
  gastronomia: '#d97832',
  cultura: '#c9d0d4',
  naturaleza: '#0b5f6c',
  plateria: '#93a5ad',
};

export default function DigitalTwinMap({ onSelectPOI }: DigitalTwinMapProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(RDM_POIS[0]);
  const [showRoutes, setShowRoutes] = useState(true);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let mapInstance: any = null;
    let cancelled = false;

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;
        if (cancelled) return;

        const container = document.getElementById('rdm-leaflet-map');
        if (!container) return;

        // Limpiar cualquier instancia previa pegada al contenedor
        if ((container as any)._leaflet_id) {
          (container as any)._leaflet_id = null;
          container.innerHTML = '';
        }

        mapInstance = L.map('rdm-leaflet-map', {
          center: [20.1398, -98.6738],
          zoom: 15,
          zoomControl: false,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap &copy; CARTO &copy; RDM Digital Hub',
          subdomains: 'abcd',
          maxZoom: 19,
        }).addTo(mapInstance);

        const filteredPOIs =
          selectedCategory === 'all'
            ? RDM_POIS
            : RDM_POIS.filter((p) => p.category === selectedCategory);

        filteredPOIs.forEach((poi) => {
          const color = CATEGORY_COLORS[poi.category] ?? '#2e9cff';
          const customIcon = L.divIcon({
            className: 'custom-map-pin',
            html: `
              <div style="
                background: ${color};
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 2px solid #fff;
                box-shadow: 0 0 15px ${color};
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: transform 0.2s;
              ">
                <div style="width: 10px; height: 10px; background: #fff; border-radius: 50%;"></div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const marker = L.marker([poi.lat, poi.lng], { icon: customIcon }).addTo(mapInstance);
          marker.on('click', () => {
            setSelectedPOI(poi);
            if (onSelectPOI) onSelectPOI(poi);
          });
        });

        if (showRoutes) {
          const routePoints: [number, number][] = [
            [20.1415, -98.6722], // Mina Acosta
            [20.1405, -98.6732], // Platería
            [20.1398, -98.6738], // Pastes Portal
            [20.1395, -98.6742], // Parroquia
            [20.1397, -98.6769], // Panteón Inglés
          ];
          L.polyline(routePoints, {
            color: '#2e9cff',
            weight: 4,
            opacity: 0.8,
            dashArray: '8, 12',
          }).addTo(mapInstance);
        }

        // Corregir el tamaño tras resolver el layout (evita mapa gris/0px)
        requestAnimationFrame(() => {
          if (mapInstance && !cancelled) mapInstance.invalidateSize();
        });

        setMapError(false);
      } catch {
        if (!cancelled) setMapError(true);
      }
    };

    initMap();

    return () => {
      cancelled = true;
      if (mapInstance) {
        try {
          mapInstance.remove();
        } catch {
          /* sin operación */
        }
        mapInstance = null;
      }
    };
  }, [selectedCategory, showRoutes, onSelectPOI]);

  return (
    <div className="relative flex h-[650px] w-full flex-col overflow-hidden rounded-2xl border border-white/10 glass-panel md:flex-row">
      {/* Panel de control */}
      <div className="z-20 flex w-full flex-col justify-between space-y-4 border-b border-white/10 p-5 glass-panel md:w-80 md:border-b-0 md:border-r">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[#2e9cff] font-mono text-xs uppercase tracking-widest">
            <Compass className="h-4 w-4" />
            <span>Gemelo digital 2D — cartografía</span>
          </div>
          <h3 className="mb-2 text-xl font-bold text-white">Cartografía Real del Monte</h3>
          <p className="mb-4 text-xs leading-relaxed text-[#93a5ad]">
            Puntos de interés geolocalizados, rutas phygitales de minería y gastronomía.
          </p>

          <div className="mb-4">
            <label className="mb-2 flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-[#93a5ad]">
              <Filter className="h-3 w-3 text-[#2e9cff]" />
              Filtro por categoría
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'mina', label: 'Minas' },
                { id: 'gastronomia', label: 'Pastes' },
                { id: 'cultura', label: 'Cultura' },
                { id: 'naturaleza', label: 'Naturaleza' },
                { id: 'plateria', label: 'Platería' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[#2e9cff] font-bold text-white shadow-[0_0_12px_rgba(46,156,255,0.5)]'
                      : 'border border-white/10 bg-white/[0.04] text-[#93a5ad] hover:border-[#2e9cff] hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowRoutes(!showRoutes)}
            className={`w-full flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-mono transition-all ${
              showRoutes
                ? 'border-[#2e9cff]/50 bg-[#2e9cff]/10 text-[#7cc4ff]'
                : 'border-white/10 bg-white/[0.03] text-[#93a5ad]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Navigation className="h-3.5 w-3.5" />
              Trazado ruta minera
            </span>
            <span className="font-bold">{showRoutes ? 'ACTIVO' : 'OCULTO'}</span>
          </button>
        </div>

        {selectedPOI && (
          <div className="space-y-2 rounded-xl border border-[#2e9cff]/40 bg-[#0d1c26]/80 p-4">
            <div className="flex items-center justify-between">
              <span className="rounded border border-[#2e9cff]/30 bg-[#2e9cff]/10 px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-[#7cc4ff]">
                {selectedPOI.category}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-[#f6d38a]">
                ★ {selectedPOI.rating}
              </span>
            </div>
            <h4 className="text-base font-bold text-white">{selectedPOI.name}</h4>
            <p className="line-clamp-2 text-xs leading-relaxed text-[#93a5ad]">
              {selectedPOI.description}
            </p>
            <div className="flex items-center gap-1 border-t border-white/10 pt-2 text-[11px] font-mono text-[#7cc4ff]">
              <MapPin className="h-3 w-3" />
              {selectedPOI.phygitalBadge}
            </div>
          </div>
        )}
      </div>

      {/* Lienzo Leaflet */}
      <div className="relative h-full w-full bg-[#050c12]">
        <div id="rdm-leaflet-map" className="h-full w-full" />

        {mapError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#050c12]/90 p-6">
            <p className="max-w-sm text-center text-sm text-[#93a5ad]">
              No se pudo cargar la cartografía en este entorno. Verifica la conexión o
              cambia al modo SVG del mapa.
            </p>
          </div>
        )}

        {/* HUD honesto */}
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-[#2e9cff]/30 px-3 py-1.5 text-xs font-mono text-[#7cc4ff] glass-panel">
            <ShieldCheck className="h-3.5 w-3.5" />
            Cartografía soberana
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-mono text-[#93a5ad] glass-panel">
            <Radio className="h-3.5 w-3.5 text-[#2e9cff]" />
            Telemetría en integración
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-lg border border-white/10 px-3 py-1.5 text-[10px] font-mono text-[#647a84] glass-panel">
          Coordenadas: 20.1398° N, 98.6738° W
        </div>
      </div>
    </div>
  );
}