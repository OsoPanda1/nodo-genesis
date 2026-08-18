import { useMemo, useState } from "react";
import { MapPin, Mountain, Star, Clock, Ticket, Headphones, Route, CalendarDays } from "lucide-react";
import { ModuleShell, SectionTitle, ElegantCard, Chip } from "@/components/ModuleShell";
import { ElegantPagination } from "@/components/ElegantPagination";
import {
  POINTS_OF_INTEREST,
  SELF_GUIDED_ROUTES,
  TRADITIONAL_EVENTS,
} from "@/data/rdm/realDelMonteData";

const PAGE_SIZE = 6;
const CATEGORIES = ["Todas", ...Array.from(new Set(POINTS_OF_INTEREST.map((p) => p.category)))];

export default function GeoExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [page, setPage] = useState(0);

  const filtered = useMemo(
    () =>
      POINTS_OF_INTEREST.filter((poi) => {
        const text = `${poi.name} ${poi.shortDesc} ${poi.category}`.toLowerCase();
        return (
          (category === "Todas" || poi.category === category) &&
          (!query || text.includes(query.toLowerCase()))
        );
      }),
    [query, category],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <ModuleShell
      eyebrow="Pilar 2 · RDM GeoExplorer"
      title="Territorio"
      highlight="Georreferenciado"
      subtitle="Puntos de interés verificados con altitud, audioguía, tarifas y rutas autoguiadas por la comarca minera."
      seoTitle="GeoExplorer · Puntos de interés y rutas de Real del Monte"
      seoDescription="Explora minas, museos, templos y miradores de Real del Monte con coordenadas verificadas, rutas autoguiadas y calendario de fiestas tradicionales."
    >
      <div className="max-w-5xl mx-auto mb-8 grid gap-3 md:grid-cols-[1fr_240px_120px]">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="Buscar minas, museos, miradores…"
          className="rounded-xl border border-border/50 bg-card/50 px-4 py-3 text-sm outline-none focus:border-accent/60"
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(0);
          }}
          className="rounded-xl border border-border/50 bg-card/50 px-4 py-3 text-sm outline-none focus:border-accent/60"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="rounded-xl border border-border/50 bg-card/50 px-4 py-3 text-center text-xs text-muted-foreground">
          {filtered.length} sitios
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {paged.map((poi, i) => (
          <ElegantCard key={poi.id} index={i}>
            <div className="flex items-start justify-between mb-3">
              <MapPin className="w-5 h-5 text-accent" />
              <Chip>{poi.category}</Chip>
            </div>
            <h3 className="font-display text-base font-semibold mb-1">{poi.name}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{poi.shortDesc}</p>
            <p className="text-xs text-foreground/80 leading-relaxed mb-3">{poi.fullDesc}</p>
            <ul className="mb-3 space-y-1">
              {poi.highlights.map((h) => (
                <li key={h} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-accent" /> {h}
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground border-t border-border/40 pt-3">
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-gold" /> {poi.rating}
              </span>
              <span className="flex items-center gap-1">
                <Mountain className="w-3.5 h-3.5" /> {poi.altitudeMeters} msnm
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {poi.durationMinutes} min
              </span>
              <span className="flex items-center gap-1">
                <Ticket className="w-3.5 h-3.5" /> {poi.entranceFee}
              </span>
              <span className="col-span-2">{poi.openHours}</span>
              <span className="col-span-2">{poi.address}</span>
              {poi.audioGuideTitle && (
                <span className="col-span-2 flex items-center gap-1.5 text-accent">
                  <Headphones className="w-3.5 h-3.5" /> {poi.audioGuideTitle}
                </span>
              )}
              <a
                className="col-span-2 font-mono text-[10px] hover:text-accent transition-colors"
                href={`https://www.google.com/maps?q=${poi.coords.lat},${poi.coords.lng}`}
                target="_blank"
                rel="noreferrer"
              >
                {poi.coords.lat.toFixed(4)}, {poi.coords.lng.toFixed(4)} · abrir mapa
              </a>
            </div>
          </ElegantCard>
        ))}
      </div>
      <div className="max-w-5xl mx-auto">
        <ElegantPagination page={page} totalPages={totalPages} onChange={setPage} variant="numeric" />
      </div>

      <SectionTitle hint={`${SELF_GUIDED_ROUTES.length} rutas`}>Rutas Autoguiadas</SectionTitle>
      <div className="grid gap-4 md:grid-cols-3 max-w-6xl mx-auto">
        {SELF_GUIDED_ROUTES.map((route, i) => (
          <ElegantCard key={route.id} index={i}>
            <div className="flex items-start justify-between mb-3">
              <Route className="w-5 h-5 text-gold" />
              <Chip>{route.difficulty}</Chip>
            </div>
            <h3 className="font-display text-base font-semibold mb-2">{route.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{route.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {route.tags.map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground border-t border-border/40 pt-3">
              {route.duration} · {route.distanceKm} km · {route.poiIds.length} paradas
            </p>
          </ElegantCard>
        ))}
      </div>

      <SectionTitle hint="Calendario oficial">Fiestas y Tradiciones</SectionTitle>
      <div className="grid gap-4 md:grid-cols-3 max-w-6xl mx-auto">
        {TRADITIONAL_EVENTS.map((event, i) => (
          <ElegantCard key={event.id} index={i}>
            <div className="flex items-start justify-between mb-3">
              <CalendarDays className="w-5 h-5 text-accent" />
              <Chip>{event.category}</Chip>
            </div>
            <h3 className="font-display text-base font-semibold mb-2">{event.name}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{event.description}</p>
            <p className="text-[11px] text-muted-foreground border-t border-border/40 pt-3">
              {event.dateStr} · {event.locationName}
            </p>
          </ElegantCard>
        ))}
      </div>
    </ModuleShell>
  );
}
