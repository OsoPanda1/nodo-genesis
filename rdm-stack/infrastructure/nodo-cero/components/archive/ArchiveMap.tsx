'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import type { Map as LeafletMap } from 'leaflet';

interface ArchiveMapProps {
  latitude: number;
  longitude: number;
  locationName?: string | null;
}

export function ArchiveMap({ latitude, longitude, locationName }: ArchiveMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let disposed = false;
    (async () => {
      if (!containerRef.current) return;
      const leaflet = await import('leaflet');
      if (disposed) return;
      const map = leaflet.map(containerRef.current, {
        center: [latitude, longitude],
        zoom: 14,
        scrollWheelZoom: false,
      });
      leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);
      leaflet.marker([latitude, longitude]).addTo(map).bindPopup(locationName ?? 'Punto del Archivo').openPopup();
      mapRef.current = map;
    })();
    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude, locationName]);

  return (
    <div
      ref={containerRef}
      className="h-64 w-full rounded-2xl border border-[#c9d0d4]/70 z-0"
      aria-label={`Mapa: ${locationName ?? 'ubicación'}`}
    />
  );
}
