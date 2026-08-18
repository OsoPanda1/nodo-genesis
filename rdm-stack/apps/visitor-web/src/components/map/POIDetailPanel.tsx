import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { X, MapPin, BookOpen, Compass, ExternalLink, Quote } from "lucide-react";
import { RDM_TERRITORY_POIS, chapters, type TerritoryPOI } from "@/data/atlas/territory-pois";

export interface POIDetailPanelProps {
  poiId: string | null;
  onClose: () => void;
}

/**
 * POIDetailPanel — panel lateral accesible con ficha completa del POI.
 * - Se abre cuando hay un id (vía clic en mapa o resultado del SearchOverlay).
 * - Focus trap suave: enfoca el botón cerrar al abrir y restaura el foco previo al cerrar.
 * - ESC cierra; el resto del foco fluye natural (Radix-style, sin sobreingeniería).
 */
export default function POIDetailPanel({ poiId, onClose }: POIDetailPanelProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  const poi = useMemo<TerritoryPOI | null>(
    () => (poiId ? (RDM_TERRITORY_POIS.find((p) => p.id === poiId) ?? null) : null),
    [poiId],
  );

  const relatedChapter = useMemo(
    () =>
      poi
        ? (chapters.find(
            (c) =>
              c.federationLayer ===
              (poi as unknown as { federationLayer?: string }).federationLayer,
          ) ?? chapters[0])
        : null,
    [poi],
  );

  // Capturar foco previo al abrir
  useEffect(() => {
    if (!poi) return;
    lastFocusRef.current = (document.activeElement as HTMLElement) ?? null;
    requestAnimationFrame(() => closeBtnRef.current?.focus());
    return () => {
      lastFocusRef.current?.focus?.();
    };
  }, [poi]);

  // ESC para cerrar
  useEffect(() => {
    if (!poi) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [poi, onClose]);

  return (
    <AnimatePresence>
      {poi && (
        <motion.aside
          key={poi.id}
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="fixed right-0 top-0 z-[110] h-dvh w-full sm:w-[420px] max-w-full bg-[hsl(var(--navy-dark)/0.96)] backdrop-blur-2xl border-l border-[hsl(var(--gold)/0.25)] shadow-premium overflow-y-auto"
          role="dialog"
          aria-modal="false"
          aria-labelledby={`poi-title-${poi.id}`}
        >
          <header className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-[hsl(var(--navy-dark)/0.85)] backdrop-blur-xl border-b border-[hsl(var(--gold)/0.15)]">
            <span className="text-[10px] uppercase tracking-[0.28em] text-[hsl(var(--gold))]">
              Ficha territorial
            </span>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              aria-label="Cerrar ficha"
              className="p-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--electric))]"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="p-5 space-y-4">
            <div className="space-y-1">
              <h2
                id={`poi-title-${poi.id}`}
                className="font-display text-2xl leading-tight text-[hsl(var(--foreground))]"
              >
                {poi.name}
              </h2>
              <p className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {poi.municipality} · {poi.altitudeM} m · {poi.lat.toFixed(4)}, {poi.lng.toFixed(4)}
              </p>
            </div>

            <p className="text-sm leading-relaxed text-[hsl(var(--foreground)/0.85)]">
              {poi.description}
            </p>

            <blockquote className="relative rounded-xl border-l-2 border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.06)] px-4 py-3 text-sm italic text-[hsl(var(--foreground)/0.8)]">
              <Quote
                className="absolute -top-2 -left-2 h-4 w-4 text-[hsl(var(--gold))]"
                aria-hidden
              />
              {poi.significance}
            </blockquote>

            {relatedChapter && (
              <section
                aria-labelledby="poi-chapter"
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] p-4"
              >
                <span className="text-[10px] uppercase tracking-widest text-[hsl(var(--electric))]">
                  Capítulo asociado
                </span>
                <h3 id="poi-chapter" className="mt-1 font-display text-base">
                  {relatedChapter.title}
                </h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  {relatedChapter.kicker}
                </p>
                <p className="text-sm mt-2 line-clamp-3 text-[hsl(var(--foreground)/0.8)]">
                  {relatedChapter.blurb}
                </p>
                <Link
                  to={`/capitulos${relatedChapter.href}`.replace(
                    "/capitulos/capitulos",
                    "/capitulos",
                  )}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[hsl(var(--gold))] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--electric))] rounded"
                >
                  <BookOpen className="h-3.5 w-3.5" /> Profundizar en la guía
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </section>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                to="/rutas"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[hsl(var(--gold)/0.4)] px-3 py-2 text-xs uppercase tracking-widest text-[hsl(var(--gold))] hover:bg-[hsl(var(--gold)/0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--electric))]"
              >
                <Compass className="h-3.5 w-3.5" /> Rutas cercanas
              </Link>
              <Link
                to="/lugares"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[hsl(var(--electric)/0.4)] px-3 py-2 text-xs uppercase tracking-widest text-[hsl(var(--electric))] hover:bg-[hsl(var(--electric)/0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--electric))]"
              >
                <MapPin className="h-3.5 w-3.5" /> Lugares
              </Link>
            </div>

            <p className="text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))] pt-3">
              Federación ·{" "}
              {String((poi as unknown as { federationId?: string }).federationId ?? "—")}
            </p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
