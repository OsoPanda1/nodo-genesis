"use client";

/* ------------------------------------------------------------------ */
/* MAPA SVG TERRITORIAL — Mapa Soberano del Nodo Cero                  */
/* Lectura territorial accesible del gemelo digital: federaciones,     */
/* nodos núcleo y satélite con navegación por teclado (roving tabindex) */
/* y ficha contextual de POI. Estética Dark Slate + oro minero.        */
/* ------------------------------------------------------------------ */

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { motion } from "motion/react";
import { RDM_POIS } from "@/lib/data/rdm-data";

type FederationId =
  | "gubernamental"
  | "cultural"
  | "economica"
  | "tecnologica"
  | "educativa"
  | "salud";

const FACET_TONES: Record<
  FederationId,
  { ring: string; glow: string; tag: string; color: string }
> = {
  gubernamental: {
    ring: "#c8a356",
    glow: "rgba(200,163,86,0.4)",
    tag: "Gubernamental",
    color: "#c8a356",
  },
  cultural: {
    ring: "#38bdf8",
    glow: "rgba(56,189,248,0.4)",
    tag: "Cultural",
    color: "#38bdf8",
  },
  economica: {
    ring: "#f59e0b",
    glow: "rgba(245,158,11,0.35)",
    tag: "Económica",
    color: "#f59e0b",
  },
  tecnologica: {
    ring: "#a78bfa",
    glow: "rgba(167,139,250,0.4)",
    tag: "Tecnológica",
    color: "#a78bfa",
  },
  educativa: {
    ring: "#34d399",
    glow: "rgba(52,211,153,0.35)",
    tag: "Educativa",
    color: "#34d399",
  },
  salud: {
    ring: "#f472b6",
    glow: "rgba(244,114,182,0.35)",
    tag: "Salud",
    color: "#f472b6",
  },
};

export interface TerritorialPoi {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  description: string;
  altitudeM?: number;
  significance?: string;
  municipality?: string;
  relevance?: "core-node" | "satellite";
}

export function federationForCategory(category: string): FederationId {
  switch (category) {
    case "mina":
      return "gubernamental";
    case "gastronomia":
    case "plateria":
    case "hotel":
      return "economica";
    case "naturaleza":
      return "educativa";
    default:
      return "cultural";
  }
}

const getFacetTone = (poi: TerritorialPoi) => FACET_TONES[federationForCategory(poi.category)];

const PAD = 0.012;

// ─── Zoom/Pan State ────────────────────────────────────────────────────────
interface ViewportState {
  scale: number;
  translateX: number;
  translateY: number;
}

const INITIAL_VIEWPORT: ViewportState = {
  scale: 1,
  translateX: 0,
  translateY: 0,
};

const MIN_SCALE = 0.5;
const MAX_SCALE = 8;

function useProjection(pois: TerritorialPoi[]) {
  return useMemo(() => {
    if (!pois.length) {
      const W = 1000;
      const H = 620;
      const project = () => ({ x: W / 2, y: H / 2 });
      return { W, H, project };
    }

    const lats = pois.map((p) => p.lat);
    const lngs = pois.map((p) => p.lng);
    const minLat = Math.min(...lats) - PAD;
    const maxLat = Math.max(...lats) + PAD;
    const minLng = Math.min(...lngs) - PAD;
    const maxLng = Math.max(...lngs) + PAD;
    const W = 1000;
    const H = 620;

    const latSpan = maxLat - minLat || 1e-6;
    const lngSpan = maxLng - minLng || 1e-6;

    // Spread points more aggressively for better visibility
    const spreadFactor = 1.5;
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    const project = (lat: number, lng: number) => {
      const nx = ((lng - centerLng) / (lngSpan / 2)) * spreadFactor;
      const ny = ((lat - centerLat) / (latSpan / 2)) * spreadFactor;
      const x = W / 2 + nx * (W / 2);
      const y = H / 2 - ny * (H / 2);
      return { x, y };
    };

    return { W, H, project };
  }, [pois]);
}

// ─── Marker Component ──────────────────────────────────────────────────────
interface MarkerProps {
  poi: TerritorialPoi;
  x: number;
  y: number;
  active: boolean;
  onActivate: (id: string) => void;
  onSelect: (id: string) => void;
}

/** Marcador memoizado: solo el POI activo y el previo re-renderizan. */
const POIMarker = memo(function POIMarker({
  poi,
  x,
  y,
  active,
  onActivate,
  onSelect,
}: MarkerProps) {
  const tone = getFacetTone(poi);
  const r = poi.relevance === "core-node" ? 13 : 9;

  return (
    <g
      id={`poi-${poi.id}`}
      transform={`translate(${x} ${y})`}
      onMouseEnter={() => onActivate(poi.id)}
      onFocus={() => onActivate(poi.id)}
      onClick={() => onSelect(poi.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(poi.id);
        }
      }}
      tabIndex={active ? 0 : -1}
      role="button"
      aria-label={`${poi.name} — ${poi.description}`}
      aria-pressed={active}
      className="cursor-pointer focus:outline-none"
    >
      {/* Halo de activación */}
      <circle r={r * 2.6} fill={tone.glow} opacity={active ? 0.95 : 0.4} pointerEvents="none" />
      <circle
        r={r + 7}
        fill="none"
        stroke={tone.ring}
        strokeWidth={active ? 1.6 : 1}
        strokeDasharray="2 4"
        opacity={active ? 0.95 : 0.5}
        pointerEvents="none"
      >
        {active && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0"
            to="360"
            dur="24s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      {/* Núcleo */}
      <circle r={r} fill="rgba(248,250,252,0.92)" stroke={tone.ring} strokeWidth={1.6} />
      <circle r={r * 0.45} fill={tone.ring} opacity={0.95} />
      <text
        y={r + 15}
        textAnchor="middle"
        fontSize={11}
        fontWeight={active ? 700 : 500}
        fill="#dbe4ee"
        style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
        pointerEvents="none"
      >
        {poi.name.length > 22 ? poi.name.slice(0, 21) + "…" : poi.name}
      </text>
    </g>
  );
});

export interface TerritorialSVGMapProps {
  pois?: TerritorialPoi[];
  /** POI a destacar (ej. ?poi=...). */
  highlightId?: string;
  /** POI seleccionado actual (modo controlado). */
  selectedId?: string | null;
  /** Callback al elegir un POI (click / Enter). */
  onSelect?: (id: string) => void;
}

export function mapRdmPoisToTerritorial(
  pois: typeof RDM_POIS = RDM_POIS,
): TerritorialPoi[] {
  return pois.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    lat: p.lat,
    lng: p.lng,
    description: p.description,
    altitudeM: 2710,
    significance: p.phygitalBadge,
    municipality: "Real del Monte",
    relevance: p.rating >= 4.7 ? "core-node" : "satellite",
  }));
}

export function TerritorialSVGMap({
  pois = mapRdmPoisToTerritorial(),
  highlightId,
  selectedId,
  onSelect,
}: TerritorialSVGMapProps) {
  const { W, H, project } = useProjection(pois);
  const [hover, setHover] = useState<string | null>(highlightId ?? selectedId ?? null);
  const [viewport, setViewport] = useState<ViewportState>(INITIAL_VIEWPORT);
  const rafRef = useRef<number | null>(null);
  const nextHoverRef = useRef<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const lastPropIdRef = useRef<string | null>(null);

  // Sincronización con la prop externa vía efecto (evita setState en render).
  useEffect(() => {
    const next = highlightId ?? selectedId ?? null;
    if (next && next !== lastPropIdRef.current) {
      lastPropIdRef.current = next;
      setHover(next);
    }
  }, [highlightId, selectedId]);

  // Throttle de hover con requestAnimationFrame
  const activate = useCallback((id: string) => {
    nextHoverRef.current = id;
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      setHover(nextHoverRef.current);
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const select = useCallback(
    (id: string) => {
      setHover(id);
      onSelect?.(id);
    },
    [onSelect],
  );

  const projected = useMemo(
    () => pois.map((p) => ({ poi: p, ...project(p.lat, p.lng) })),
    [pois, project],
  );

  const active = useMemo(() => pois.find((p) => p.id === hover) ?? null, [pois, hover]);

  // Roving tabindex con flechas (vecino más cercano euclidiano)
  const handleKey = useCallback(
    (e: KeyboardEvent<SVGSVGElement>) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
      e.preventDefault();

      if (!projected.length) return;

      const current = projected.find((p) => p.poi.id === hover) ?? projected[0];
      if (!current) return;

      const dirX = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      const dirY = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;

      let best: { id: string; score: number } | null = null;

      for (const p of projected) {
        if (p.poi.id === current.poi.id) continue;
        const dx = p.x - current.x;
        const dy = p.y - current.y;
        const aligned = dirX * dx + dirY * dy;
        if (aligned <= 0) continue;

        const lateral = Math.abs(dirX ? dy : dx);
        const score = aligned - lateral * 0.5;
        if (!best || score > best.score) {
          best = { id: p.poi.id, score };
        }
      }

      if (best) {
        setHover(best.id);
        const el = svgRef.current?.querySelector<SVGGElement>(`#poi-${best.id}`);
        el?.focus();
      }
    },
    [hover, projected],
  );

  const zoom = (factor: number) => {
    setViewport((v) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor));
      return { ...v, scale: next };
    });
  };

  const transformed = `translate(${viewport.translateX} ${viewport.translateY}) scale(${viewport.scale})`;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-[rgba(200,163,86,0.22)] bg-[radial-gradient(circle_at_30%_20%,rgba(200,163,86,0.12),transparent_55%),linear-gradient(180deg,#0f1b28,#0a1320)] shadow-[inset_0_0_80px_rgba(0,0,0,0.5)]">
      <div className="pointer-events-none absolute inset-0 z-10 opacity-60 bg-[radial-gradient(circle_at_25%_15%,rgba(200,163,86,0.14),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(56,189,248,0.1),transparent_45%)]" />

      {/* HUD superior */}
      <div className="pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#c8a356]" />
        <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#c8a356]">
          Mapa Soberano · 35 Nodos YUN
        </span>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="relative block h-auto w-full focus:outline-none"
        role="application"
        aria-label="Mapa territorial inmersivo del Nodo Cero Real del Monte. Use las flechas para navegar entre puntos y Enter para abrir su ficha."
        aria-activedescendant={hover ? `poi-${hover}` : undefined}
        tabIndex={0}
        onKeyDown={handleKey}
      >
        <defs>
          <radialGradient id="terrain" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#142436" />
            <stop offset="55%" stopColor="#0e1b2a" />
            <stop offset="100%" stopColor="#0a1320" />
          </radialGradient>
          <radialGradient id="halo-gold" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(200,163,86,0.28)" />
            <stop offset="100%" stopColor="rgba(200,163,86,0)" />
          </radialGradient>
          <pattern id="grid-fine" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148,163,184,0.06)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect x="0" y="0" width={W} height={H} fill="url(#terrain)" />
        <rect x="0" y="0" width={W} height={H} fill="url(#grid-fine)" />
        <ellipse cx={W * 0.5} cy={H * 0.55} rx={W * 0.52} ry={H * 0.52} fill="url(#halo-gold)" />

        {[0.25, 0.45, 0.65, 0.85].map((r, i) => (
          <ellipse
            key={i}
            cx={W * 0.5}
            cy={H * 0.55}
            rx={W * r * 0.55}
            ry={H * r * 0.55}
            fill="none"
            stroke="rgba(200,163,86,0.1)"
            strokeWidth={1}
            strokeDasharray="2 6"
          />
        ))}

        <g transform={transformed}>
          {projected
            .filter(({ poi }) => poi.relevance === "core-node")
            .map(({ poi, x, y }, i, arr) => {
              const next = arr[(i + 1) % arr.length];
              return (
                <line
                  key={`${poi.id}-edge`}
                  x1={x}
                  y1={y}
                  x2={next.x}
                  y2={next.y}
                  stroke="rgba(200,163,86,0.35)"
                  strokeWidth={1.2}
                  strokeDasharray="3 5"
                />
              );
            })}

          {projected.map(({ poi, x, y }) => (
            <POIMarker
              key={poi.id}
              poi={poi}
              x={x}
              y={y}
              active={hover === poi.id}
              onActivate={activate}
              onSelect={select}
            />
          ))}
        </g>
      </svg>

      {/* Controles de zoom */}
      <div className="absolute right-4 top-4 z-20 flex flex-col gap-1.5">
        <button
          type="button"
          aria-label="Acercar"
          onClick={() => zoom(1.3)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-950/70 text-sm text-slate-300 backdrop-blur-md transition-colors hover:border-[#c8a356]/50 hover:text-[#c8a356]"
        >
          +
        </button>
        <button
          type="button"
          aria-label="Alejar"
          onClick={() => zoom(1 / 1.3)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-950/70 text-sm text-slate-300 backdrop-blur-md transition-colors hover:border-[#c8a356]/50 hover:text-[#c8a356]"
        >
          −
        </button>
      </div>

      {active && (
        <motion.aside
          key={active.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-4 left-4 right-4 z-20 rounded-2xl border border-[rgba(200,163,86,0.3)] bg-slate-950/80 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-sm"
          role="status"
          aria-live="polite"
        >
          <div className="mb-1.5 flex items-center justify-between">
            {(() => {
              const tone = getFacetTone(active);
              return (
                <>
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.22em]"
                    style={{
                      background: tone.glow,
                      color: tone.ring,
                    }}
                  >
                    {tone.tag}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {active.lat.toFixed(4)}, {active.lng.toFixed(4)}
                  </span>
                </>
              );
            })()}
          </div>

          <h3 className="font-patrimonial text-xl leading-tight text-[#eef2f7]">{active.name}</h3>
          <p className="mt-0.5 text-xs text-slate-400">
            {active.municipality ?? "Real del Monte"}
            {active.altitudeM ? ` · ${active.altitudeM} m` : ""}
          </p>

          <p className="mt-2 text-sm leading-relaxed text-slate-300/85">{active.description}</p>
          {active.significance && (
            <p className="mt-2 text-xs italic text-slate-300/70">«{active.significance}»</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onSelect?.(active.id)}
              className="rounded-full border border-[#38bdf8]/40 px-3 py-1.5 text-[11px] uppercase tracking-widest text-[#38bdf8] transition-colors hover:bg-[rgba(56,189,248,0.12)] focus:outline-none focus-visible:ring-2"
            >
              Ver ficha completa
            </button>
          </div>
        </motion.aside>
      )}

      <div className="pointer-events-none absolute bottom-3 right-4 z-20 text-[10px] font-mono text-slate-500">
        Altitud 2,710 m · Comarca Minera UNESCO
      </div>
    </div>
  );
}
