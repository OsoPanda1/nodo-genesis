import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LTOS_COORDINATES, RDM_CENTER } from "@/data/ltos-coordinates";
import platformsJson from "@/data/ltos-platforms.json";

interface Platform { slug: string; name: string; federation: string; role: string }

interface Props { highlightSlug?: string; height?: number }

/**
 * Mapa Leaflet con pines verificados para cada sub-plataforma LTOS.
 */
export default function LtosMap({ highlightSlug, height = 360 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false })
      .setView(RDM_CENTER, 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    const platforms = (platformsJson.platforms as Platform[]) ?? [];
    platforms.forEach((p) => {
      const coord = LTOS_COORDINATES[p.slug];
      if (!coord) return;
      const isHighlight = p.slug === highlightSlug;
      const marker = L.circleMarker([coord.lat, coord.lng], {
        radius: isHighlight ? 11 : 7,
        color: isHighlight ? "#e07a2a" : "#2d4f7f",
        weight: 2,
        fillColor: isHighlight ? "#e07a2a" : "#3d6fb3",
        fillOpacity: 0.85,
      }).addTo(map);
      marker.bindPopup(
        `<strong>${p.name}</strong><br/><span style="font-size:11px;opacity:.75">${coord.anchor} · ${p.federation}</span><br/><a href="/ltos/${p.slug}">Ver detalle →</a>`,
      );
      if (isHighlight) marker.openPopup();
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [highlightSlug]);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className="w-full rounded-2xl overflow-hidden border border-border/40 shadow-sm z-0"
    />
  );
}
