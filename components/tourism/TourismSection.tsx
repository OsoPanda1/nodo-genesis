"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Church,
  Clock,
  Footprints,
  Map,
  Mountain,
  Music,
  Quote,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  Trophy,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { RDM_TIMELINE } from "@/lib/data/rdm-tourism";
import type {
  TourismEvent,
  TourismPlace,
  TourismRoute,
  TourismStory,
} from "@/lib/tourism/contracts";

type TabId = "atractivos" | "eventos" | "rutas" | "dichos" | "historia";
type LoadingState = "loading" | "ready" | "error";

const FALLBACK_IMG = "/images/real-3.jpg";

const categoryIcons: Record<string, React.ReactNode> = {
  fiesta: <Trophy className="h-3.5 w-3.5" />,
  gastronomico: <UtensilsCrossed className="h-3.5 w-3.5" />,
  musical: <Music className="h-3.5 w-3.5" />,
  religioso: <Church className="h-3.5 w-3.5" />,
  deportivo: <Footprints className="h-3.5 w-3.5" />,
  feria: <CalendarDays className="h-3.5 w-3.5" />,
};

const placeCategoryLabels: Record<string, string> = {
  mina: "Mina",
  museo: "Museo",
  patrimonio: "Patrimonio",
  iglesia: "Iglesia",
  plaza: "Plaza",
  mirador: "Mirador",
  bosque: "Bosque",
  panteon: "Panteón",
  "centro-historico": "Centro Histórico",
  gastronomia: "Gastronomía",
  hospedaje: "Hospedaje",
  otro: "Otro",
};

const difficultyColor: Record<string, string> = {
  facil: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  moderada: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  exigente: "border-rose-400/30 bg-rose-500/10 text-rose-200",
};

const difficultyLabels: Record<string, string> = {
  facil: "Fácil",
  moderada: "Moderada",
  exigente: "Exigente",
};

const timelineIcons: Record<string, React.ReactNode> = {
  cross: <Church className="h-4 w-4" />,
  gear: <Clock className="h-4 w-4" />,
  pickaxe: <Mountain className="h-4 w-4" />,
  building: <Map className="h-4 w-4" />,
  star: <Star className="h-4 w-4" />,
  leaf: <Footprints className="h-4 w-4" />,
};

const tabs: Array<{
  id: TabId;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    id: "atractivos",
    label: "Atractivos",
    icon: <Map className="h-4 w-4" />,
    description: "Patrimonio, paisajes y lugares imprescindibles.",
  },
  {
    id: "eventos",
    label: "Agenda",
    icon: <CalendarDays className="h-4 w-4" />,
    description: "Fiestas, cultura y experiencias de temporada.",
  },
  {
    id: "rutas",
    label: "Rutas",
    icon: <Route className="h-4 w-4" />,
    description: "Recorridos diseñados para descubrir más.",
  },
  {
    id: "dichos",
    label: "Relatos",
    icon: <Quote className="h-4 w-4" />,
    description: "Dichos, leyendas y memoria oral del pueblo.",
  },
  {
    id: "historia",
    label: "Historia",
    icon: <BookOpen className="h-4 w-4" />,
    description: "Momentos que definieron a Real del Monte.",
  },
];

function VerificationBadge({
  level,
}: {
  level: TourismPlace["confidenceLevel"];
}) {
  const states: Record<
    string,
    { label: string; className: string; icon: React.ReactNode }
  > = {
    verified: {
      label: "Información confirmada",
      className:
        "border-emerald-400/30 bg-emerald-500/15 text-emerald-100",
      icon: <ShieldCheck className="h-3 w-3" />,
    },
    pending: {
      label: "En actualización",
      className: "border-amber-400/30 bg-amber-500/15 text-amber-100",
      icon: <Clock className="h-3 w-3" />,
    },
    contradictory: {
      label: "Requiere verificación",
      className: "border-rose-400/30 bg-rose-500/15 text-rose-100",
      icon: <AlertTriangle className="h-3 w-3" />,
    },
    historical: {
      label: "Referencia histórica",
      className: "border-slate-400/30 bg-slate-500/15 text-slate-100",
      icon: <BookOpen className="h-3 w-3" />,
    },
  };

  const state = states[level] ?? states.pending;

  return (
    <span
      title={state.label}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-semibold tracking-wide ${state.className}`}
    >
      {state.icon}
      {state.label}
    </span>
  );
}

function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="col-span-full rounded-3xl border border-dashed border-white/15 bg-slate-950/30 px-6 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-500/10 text-rose-300">
        {icon}
      </div>
      <h3 className="mt-5 text-base font-bold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#93a5ad]">
        {description}
      </p>
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <>
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="animate-pulse overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]"
        >
          <div className="h-44 bg-white/[0.07]" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-20 rounded bg-white/[0.08]" />
            <div className="h-5 w-3/4 rounded bg-white/[0.1]" />
            <div className="h-3 w-full rounded bg-white/[0.06]" />
            <div className="h-3 w-5/6 rounded bg-white/[0.06]" />
          </div>
        </div>
      ))}
    </>
  );
}

function ImageWithFallback({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const [imageSrc, setImageSrc] = useState(src || FALLBACK_IMG);
  const [prevSrc, setPrevSrc] = useState(src);

  if (prevSrc !== src) {
    setPrevSrc(src);
    setImageSrc(src || FALLBACK_IMG);
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageSrc}
      alt={alt}
      loading="lazy"
      onError={() => setImageSrc(FALLBACK_IMG)}
      className={className}
    />
  );
}

export default function TourismSection() {
  const [activeTab, setActiveTab] = useState<TabId>("atractivos");
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<TourismPlace | null>(null);
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<TourismPlace[]>([]);
  const [events, setEvents] = useState<TourismEvent[]>([]);
  const [stories, setStories] = useState<TourismStory[]>([]);
  const [routes, setRoutes] = useState<TourismRoute[]>([]);
  const [status, setStatus] = useState<LoadingState>("loading");

  useEffect(() => {
    const controller = new AbortController();

    async function loadCatalog() {
      setStatus("loading");

      try {
        const [placesResponse, eventsResponse, culturaResponse, routesResponse] =
          await Promise.all([
            fetch("/api/turismo/places", { signal: controller.signal }),
            fetch("/api/turismo/events", { signal: controller.signal }),
            fetch("/api/turismo/cultura", { signal: controller.signal }),
            fetch("/api/turismo/routes", { signal: controller.signal }),
          ]);

        const [placesData, eventsData, culturaData, routesData] =
          await Promise.all([
            placesResponse.json(),
            eventsResponse.json(),
            culturaResponse.json(),
            routesResponse.json(),
          ]);

        if (controller.signal.aborted) return;

        setPlaces(placesData.ok ? placesData.places ?? [] : []);
        setEvents(eventsData.ok ? eventsData.events ?? [] : []);
        setStories(culturaData.ok ? culturaData.stories ?? [] : []);
        setRoutes(routesData.ok ? routesData.routes ?? [] : []);
        setStatus("ready");
      } catch (error) {
        if (controller.signal.aborted) return;
        setStatus("error");
      }
    }

    void loadCatalog();

    return () => controller.abort();
  }, []);

  const dichos = useMemo(
    () => stories.filter((story) => story.kind === "dicho"),
    [stories],
  );

  const leyendas = useMemo(
    () => stories.filter((story) => story.kind !== "dicho"),
    [stories],
  );

  const normalizedQuery = query.trim().toLocaleLowerCase("es-MX");

  const filteredPlaces = useMemo(() => {
    if (!normalizedQuery) return places;

    return places.filter((place) =>
      `${place.name} ${place.description} ${place.category}`
        .toLocaleLowerCase("es-MX")
        .includes(normalizedQuery),
    );
  }, [normalizedQuery, places]);

  const filteredEvents = useMemo(() => {
    if (!normalizedQuery) return events;

    return events.filter((event) =>
      `${event.name} ${event.description} ${event.place} ${event.category}`
        .toLocaleLowerCase("es-MX")
        .includes(normalizedQuery),
    );
  }, [events, normalizedQuery]);

  const filteredRoutes = useMemo(() => {
    if (!normalizedQuery) return routes;

    return routes.filter((route) =>
      `${route.name} ${route.description} ${route.difficulty}`
        .toLocaleLowerCase("es-MX")
        .includes(normalizedQuery),
    );
  }, [normalizedQuery, routes]);

  const filteredStories = useMemo(() => {
    if (!normalizedQuery) return { dichos, leyendas };

    const includesQuery = (story: TourismStory) =>
      `${story.title ?? ""} ${story.text} ${story.meaning ?? ""} ${story.origin}`
        .toLocaleLowerCase("es-MX")
        .includes(normalizedQuery);

    return {
      dichos: dichos.filter(includesQuery),
      leyendas: leyendas.filter(includesQuery),
    };
  }, [dichos, leyendas, normalizedQuery]);

  const currentTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-[#07111f] p-4 shadow-2xl shadow-black/30 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.13),transparent_30%)]" />

      <header className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-400/25 bg-rose-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-200">
            <Sparkles className="h-3.5 w-3.5" />
            Descubre Real del Monte
          </div>

          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Todo el pueblo,
            <span className="block bg-gradient-to-r from-rose-300 via-amber-200 to-cyan-200 bg-clip-text text-transparent">
              en una sola experiencia.
            </span>
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
            Explora lugares, rutas, cultura y momentos que hacen único a Real
            del Monte.
          </p>
        </div>

        <div className="w-full lg:w-80">
          <label className="sr-only" htmlFor="tourism-search">
            Buscar en el catálogo turístico
          </label>

          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2.5 transition focus-within:border-cyan-400/50 focus-within:ring-4 focus-within:ring-cyan-400/10">
            <Search className="h-4 w-4 shrink-0 text-[#93a5ad]" />

            <input
              id="tourism-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar una experiencia..."
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#93a5ad]"
            />

            {query && (
              <button
                type="button"
                aria-label="Limpiar búsqueda"
                onClick={() => setQuery("")}
                className="rounded-lg p-1 text-[#93a5ad] transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div
        role="tablist"
        aria-label="Secciones de turismo"
        className="mt-6 flex gap-2 overflow-x-auto pb-1"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              id={`tourism-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tourism-panel-${tab.id}`}
              onClick={() => {
                setActiveTab(tab.id);
                setQuery("");
              }}
              className={`group relative flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-bold transition-all ${
                isActive
                  ? "border-rose-400/50 bg-gradient-to-br from-rose-400 to-rose-500 text-slate-950 shadow-lg shadow-rose-950/40"
                  : "border-white/10 bg-white/[0.035] text-[#93a5ad] hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        id={`tourism-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tourism-tab-${activeTab}`}
        className="mt-7"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
              {currentTab.label}
            </p>
            <p className="mt-1 text-sm text-[#93a5ad]">
              {currentTab.description}
            </p>
          </div>

          {query && (
            <p className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-[#93a5ad]">
              Resultados para{" "}
              <span className="font-semibold text-white">“{query}”</span>
            </p>
          )}
        </div>

        {status === "error" && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            <p>
              No fue posible actualizar el catálogo en este momento. Intenta
              recargar la página.
            </p>
          </div>
        )}

        {activeTab === "atractivos" && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {status === "loading" && <CatalogSkeleton />}

            {status !== "loading" &&
              filteredPlaces.map((place) => (
                <article
                  key={place.id}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-950/45 transition duration-300 hover:-translate-y-1 hover:border-rose-400/35 hover:shadow-2xl hover:shadow-black/25"
                >
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src={place.image}
                      alt={place.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#07111f] via-[#07111f]/25 to-transparent" />

                    <div className="absolute left-4 top-4">
                      <span className="rounded-full border border-cyan-300/25 bg-slate-950/65 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-100 backdrop-blur-md">
                        {placeCategoryLabels[place.category] ?? place.category}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4">
                      <VerificationBadge level={place.confidenceLevel} />
                    </div>
                  </div>

                  <div className="flex min-h-56 flex-col p-5">
                    <h3 className="text-lg font-bold tracking-tight text-white">
                      {place.name}
                    </h3>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#93a5ad]">
                      {place.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {place.admissionFee && (
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/15 bg-amber-400/5 px-2.5 py-1.5 text-[11px] text-amber-100">
                          <Star className="h-3.5 w-3.5 text-amber-300" />
                          {place.admissionFee}
                        </span>
                      )}

                      {place.hours?.[0]?.open && (
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/15 bg-cyan-400/5 px-2.5 py-1.5 text-[11px] text-cyan-100">
                          <Clock className="h-3.5 w-3.5 text-cyan-300" />
                          {place.hours[0].open}–{place.hours[0].close}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedPlace(place)}
                      className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-rose-300 transition hover:text-rose-100"
                    >
                      Ver información
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </article>
              ))}

            {status !== "loading" && filteredPlaces.length === 0 && (
              <EmptyState
                icon={<Map className="h-6 w-6" />}
                title="No encontramos atractivos"
                description="Prueba con otro término o elimina la búsqueda para explorar todo el catálogo."
              />
            )}
          </div>
        )}

        {activeTab === "eventos" && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {status === "loading" && <CatalogSkeleton />}

            {status !== "loading" &&
              filteredEvents.map((event) => (
                <article
                  key={event.id}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-950/45 transition duration-300 hover:-translate-y-1 hover:border-rose-400/35"
                >
                  <div className="relative h-44 overflow-hidden">
                    <ImageWithFallback
                      src={event.image}
                      alt={event.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#07111f] via-[#07111f]/20 to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-slate-950/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">
                        {categoryIcons[event.category] ?? (
                          <CalendarDays className="h-3.5 w-3.5" />
                        )}
                        {event.category}
                      </span>

                      <VerificationBadge level={event.confidenceLevel} />
                    </div>
                  </div>

                  <div className="flex min-h-60 flex-col p-5">
                    <h3 className="text-lg font-bold text-white">{event.name}</h3>

                    {event.sessions?.[0]?.startsAt && (
                      <p className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-cyan-200">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {event.sessions[0].startsAt}
                        {event.sessions[0].endsAt &&
                        event.sessions[0].endsAt !== event.sessions[0].startsAt
                          ? ` – ${event.sessions[0].endsAt}`
                          : ""}
                      </p>
                    )}

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#93a5ad]">
                      {event.description}
                    </p>

                    <div className="mt-auto space-y-3 pt-5">
                      <p className="flex items-center gap-2 text-xs text-slate-300">
                        <Map className="h-3.5 w-3.5 shrink-0 text-rose-300" />
                        <span className="truncate">{event.place}</span>
                      </p>

                      {event.sessions?.[0]?.admission && (
                        <p className="text-xs font-semibold text-amber-200">
                          Entrada: {event.sessions[0].admission}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}

            {status !== "loading" && filteredEvents.length === 0 && (
              <EmptyState
                icon={<CalendarDays className="h-6 w-6" />}
                title="No hay eventos disponibles"
                description="La agenda se actualiza de forma editorial. Regresa pronto para nuevas experiencias."
              />
            )}
          </div>
        )}

        {activeTab === "rutas" && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {status === "loading" && <CatalogSkeleton />}

            {status !== "loading" &&
              filteredRoutes.map((route) => {
                const isExpanded = expandedRoute === route.id;

                return (
                  <article
                    key={route.id}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/45 transition hover:border-cyan-400/30"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <ImageWithFallback
                        src={route.image}
                        alt={route.name}
                        className="h-full w-full object-cover transition duration-700 hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-[#07111f] via-[#07111f]/20 to-transparent" />

                      <span
                        className={`absolute right-4 top-4 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide ${
                          difficultyColor[route.difficulty] ??
                          "border-white/15 bg-slate-950/70 text-white"
                        }`}
                      >
                        {difficultyLabels[route.difficulty] ?? route.difficulty}
                      </span>

                      <div className="absolute bottom-5 left-5 right-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                          Ruta sugerida
                        </p>
                        <h3 className="mt-1 text-2xl font-black tracking-tight text-white">
                          {route.name}
                        </h3>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/15 bg-cyan-400/5 px-3 py-1.5 text-xs text-cyan-100">
                          <Timer className="h-3.5 w-3.5 text-cyan-300" />
                          {route.duration}
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/15 bg-amber-400/5 px-3 py-1.5 text-xs text-amber-100">
                          <Map className="h-3.5 w-3.5 text-amber-300" />
                          {route.distance}
                        </span>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-[#93a5ad]">
                        {route.description}
                      </p>

                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() =>
                          setExpandedRoute(isExpanded ? null : route.id)
                        }
                        className="mt-5 flex w-full items-center justify-between border-t border-white/10 pt-4 text-sm font-bold text-cyan-200 transition hover:text-white"
                      >
                        <span>
                          {isExpanded
                            ? "Ocultar recorrido"
                            : `Ver recorrido · ${route.stops.length} paradas`}
                        </span>

                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isExpanded && (
                        <ol className="relative mt-5 space-y-4 border-l border-cyan-400/25 pl-5">
                          {route.stops.map((stop) => (
                            <li key={stop.order} className="relative">
                              <span className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full border border-cyan-400/40 bg-[#07111f] text-[10px] font-bold text-cyan-200">
                                {stop.order}
                              </span>
                              <p className="text-sm font-semibold text-white">
                                {stop.name}
                              </p>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  </article>
                );
              })}

            {status !== "loading" && filteredRoutes.length === 0 && (
              <EmptyState
                icon={<Route className="h-6 w-6" />}
                title="No hay rutas para esta búsqueda"
                description="Elimina los filtros para conocer todos los recorridos disponibles."
              />
            )}
          </div>
        )}

        {activeTab === "dichos" && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {status === "loading" && <CatalogSkeleton />}

            {status !== "loading" &&
              filteredStories.dichos.map((story) => (
                <article
                  key={story.id}
                  className="relative overflow-hidden rounded-3xl border border-rose-400/15 bg-gradient-to-br from-rose-500/[0.08] to-slate-950/40 p-7"
                >
                  <Quote className="h-9 w-9 text-rose-300/80" />
                  <blockquote className="mt-5 text-xl font-bold leading-8 tracking-tight text-white">
                    “{story.text}”
                  </blockquote>

                  <p className="mt-5 text-sm leading-6 text-slate-300">
                    {story.meaning}
                  </p>

                  <footer className="mt-6 border-t border-white/10 pt-4 text-xs text-[#93a5ad]">
                    Tradición oral: {story.origin}
                  </footer>
                </article>
              ))}

            {status !== "loading" &&
              filteredStories.leyendas.map((story) => (
                <article
                  key={story.id}
                  className="rounded-3xl border border-cyan-400/15 bg-gradient-to-br from-cyan-500/[0.07] to-slate-950/40 p-7"
                >
                  <BookOpen className="h-8 w-8 text-cyan-200" />

                  <h3 className="mt-5 text-xl font-bold text-white">
                    {story.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {story.text}
                  </p>

                  {story.meaning && (
                    <p className="mt-4 border-l-2 border-cyan-300/40 pl-4 text-sm italic leading-6 text-[#93a5ad]">
                      {story.meaning}
                    </p>
                  )}

                  <footer className="mt-6 border-t border-white/10 pt-4 text-xs text-[#93a5ad]">
                    Origen: {story.origin}
                  </footer>
                </article>
              ))}

            {status !== "loading" &&
              filteredStories.dichos.length === 0 &&
              filteredStories.leyendas.length === 0 && (
                <EmptyState
                  icon={<Quote className="h-6 w-6" />}
                  title="No encontramos relatos"
                  description="Prueba con otra palabra para explorar la memoria oral de Real del Monte."
                />
              )}
          </div>
        )}

        {activeTab === "historia" && (
          <div className="relative ml-3 border-l border-cyan-400/25 pl-7 sm:ml-5 sm:pl-10">
            {RDM_TIMELINE.map((event) => (
              <article key={event.year} className="relative pb-8 last:pb-0">
                <div className="absolute -left-[43px] top-0 flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/40 bg-[#07111f] text-cyan-200 shadow-lg shadow-cyan-950/40 sm:-left-[57px]">
                  {timelineIcons[event.icon] ?? (
                    <Star className="h-4 w-4" />
                  )}
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-cyan-400/25 hover:bg-white/[0.055]">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-bold text-cyan-100">
                      {event.year}
                    </span>

                    <h3 className="text-base font-bold text-white">
                      {event.title}
                    </h3>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-[#93a5ad]">
                    {event.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {selectedPlace && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/75 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="place-dialog-title"
          onMouseDown={() => setSelectedPlace(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] border border-white/15 bg-[#07111f] shadow-2xl shadow-black/50"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="relative h-60 overflow-hidden">
              <ImageWithFallback
                src={selectedPlace.image}
                alt={selectedPlace.name}
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#07111f] via-[#07111f]/15 to-transparent" />

              <button
                type="button"
                aria-label="Cerrar detalle"
                onClick={() => setSelectedPlace(null)}
                className="absolute right-4 top-4 rounded-full border border-white/20 bg-slate-950/60 p-2 text-white backdrop-blur transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="absolute bottom-5 left-6 right-6">
                <span className="rounded-full border border-cyan-300/20 bg-slate-950/65 px-2.5 py-1 text-[10px] font-semibold text-cyan-100 backdrop-blur">
                  {placeCategoryLabels[selectedPlace.category] ??
                    selectedPlace.category}
                </span>

                <h3
                  id="place-dialog-title"
                  className="mt-3 text-3xl font-black text-white"
                >
                  {selectedPlace.name}
                </h3>
              </div>
            </div>

            <div className="p-6">
              <VerificationBadge level={selectedPlace.confidenceLevel} />

              <p className="mt-5 text-sm leading-7 text-slate-300">
                {selectedPlace.description}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {selectedPlace.admissionFee && (
                  <div className="rounded-2xl border border-amber-400/15 bg-amber-400/5 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      Acceso
                    </p>
                    <p className="mt-1 text-sm text-amber-50">
                      {selectedPlace.admissionFee}
                    </p>
                  </div>
                )}

                {selectedPlace.hours?.[0]?.open && (
                  <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                      Horario
                    </p>
                    <p className="mt-1 text-sm text-cyan-50">
                      {selectedPlace.hours[0].open}–{selectedPlace.hours[0].close}
                      {selectedPlace.hours[0].days
                        ? ` · ${selectedPlace.hours[0].days}`
                        : ""}
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedPlace(null)}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-rose-300"
              >
                <CheckCircle2 className="h-4 w-4" />
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
