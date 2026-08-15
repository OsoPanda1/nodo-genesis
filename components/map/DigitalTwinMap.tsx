"use client";

import React, { useEffect, useState } from 'react';
import { RDM_POIS, POI } from '@/lib/data/rdm-data';
import { MapPin, Navigation, Info, Compass, ShieldCheck, Thermometer, Users, Sparkles, Filter } from 'lucide-react';

interface DigitalTwinMapProps {
  onSelectPOI?: (poi: POI) => void;
}

export default function DigitalTwinMap({ onSelectPOI }: DigitalTwinMapProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(RDM_POIS[0]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showRoutes, setShowRoutes] = useState(true);

  useEffect(() => {
    // Dynamic load of Leaflet to avoid SSR issues
    if (typeof window === 'undefined') return;

    let mapInstance: any = null;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      const container = document.getElementById('rdm-leaflet-map');
      if (!container) return;

      // Clean existing instance
      if ((container as any)._leaflet_id) {
        (container as any)._leaflet_id = null;
        container.innerHTML = '';
      }

      // Center on Real del Monte (20.1398, -98.6738)
      mapInstance = L.map('rdm-leaflet-map', {
        center: [20.1398, -98.6738],
        zoom: 15,
        zoomControl: false,
      });

      // Dark Matter Carto Tile Layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO &copy; RDM Digital Hub',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(mapInstance);

      // Add Markers
      const filteredPOIs = selectedCategory === 'all' 
        ? RDM_POIS 
        : RDM_POIS.filter(p => p.category === selectedCategory);

      filteredPOIs.forEach(poi => {
        // Custom Icon SVG
        const categoryColors: Record<string, string> = {
          mina: '#06b6d4',
          gastronomia: '#f59e0b',
          cultura: '#a855f7',
          naturaleza: '#10b981',
          plateria: '#e2e8f0',
        };

        const color = categoryColors[poi.category] || '#38bdf8';

        const customIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div style="
              background: ${color};
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 0 15px ${color};
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: transform 0.2s;
            ">
              <div style="width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
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

      // Draw Phygital Heritage Route Line between Mina Acosta -> Portal -> Panteón
      if (showRoutes) {
        const routePoints: [number, number][] = [
          [20.1415, -98.6722], // Mina Acosta
          [20.1405, -98.6732], // Platería
          [20.1398, -98.6738], // Pastes Portal
          [20.1395, -98.6742], // Parroquia
          [20.1397, -98.6769], // Panteón Inglés
        ];

        L.polyline(routePoints, {
          color: '#00f0ff',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 12',
        }).addTo(mapInstance);
      }

      setMapLoaded(true);
    };

    initMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [selectedCategory, showRoutes, onSelectPOI]);

  return (
    <div className="relative w-full h-[650px] rounded-2xl overflow-hidden glass-panel border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col md:flex-row">
      
      {/* Map Control Sidebar Panel */}
      <div className="w-full md:w-80 p-5 glass-panel border-r border-white/10 flex flex-col justify-between z-20 space-y-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-1">
            <Compass className="w-4 h-4 animate-spin" />
            <span>GEMELO DIGITAL 2D/3D LEAFLET</span>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">Cartografía Real del Monte</h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Explora puntos de interés geolocalizados, rutas phygitales de minería, gastronomía y sensores en vivo.
          </p>

          {/* Category Filter */}
          <div className="mb-4">
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
              <Filter className="w-3 h-3 text-cyan-400" />
              Filtro por Categoría
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'mina', label: 'Minas' },
                { id: 'gastronomia', label: 'Pastes' },
                { id: 'cultura', label: 'Cultura' },
                { id: 'naturaleza', label: 'Naturaleza' },
                { id: 'plateria', label: 'Platería' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                      : 'bg-slate-900/80 text-slate-300 border border-slate-700 hover:border-cyan-500'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Route Overlay */}
          <button
            onClick={() => setShowRoutes(!showRoutes)}
            className={`w-full py-2 px-3 rounded-xl border text-xs font-mono flex items-center justify-between transition-all ${
              showRoutes
                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
          >
            <span className="flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5" />
              Trazado Ruta Minera Phygital
            </span>
            <span className="font-bold">{showRoutes ? 'ACTIVO' : 'OCULTO'}</span>
          </button>
        </div>

        {/* POI Selected Info Box */}
        {selectedPOI && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/40 shadow-inner space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-cyan-900/60 text-cyan-300 border border-cyan-500/30">
                {selectedPOI.category.toUpperCase()}
              </span>
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                ★ {selectedPOI.rating}
              </span>
            </div>

            <h4 className="text-base font-bold text-white">{selectedPOI.name}</h4>
            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{selectedPOI.description}</p>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-cyan-300 font-mono">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                {selectedPOI.phygitalBadge}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Interactive Leaflet Canvas Container */}
      <div className="flex-1 relative h-full w-full bg-slate-950">
        <div id="rdm-leaflet-map" className="w-full h-full" />

        {/* Floating Top Map HUD Overlay */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 pointer-events-auto">
          <div className="px-3 py-1.5 rounded-xl glass-panel border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-2 shadow-lg">
            <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Temp. Mina Acosta: 14°C</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl glass-panel border border-purple-500/30 text-xs font-mono text-purple-300 flex items-center gap-2 shadow-lg">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>Aforo Centro: 62%</span>
          </div>
        </div>

        {/* Map Watermark Legend */}
        <div className="absolute bottom-4 left-4 z-10 px-3 py-1.5 rounded-lg glass-panel text-[10px] font-mono text-slate-400 border border-white/10 pointer-events-none">
          Coordenadas: 20.1398° N, 98.6738° W // Altitud: 2,710m
        </div>
      </div>
    </div>
  );
}
