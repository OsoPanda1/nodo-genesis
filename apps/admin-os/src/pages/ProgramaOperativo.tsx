import { useMemo, useState } from "react";
import { Activity, Layers, MapPin, Search, Gauge } from "lucide-react";
import { ModuleShell, SectionTitle } from "@/components/ModuleShell";
import { ElegantPagination } from "@/components/ElegantPagination";
import { YUN_CORES, RDM_NODES_35, RDM_POIS } from "@/data/nodo-cero/rdm-data";
import { RDM_EVENTS, RDM_ROUTES } from "@/data/nodo-cero/rdm-tourism";

const PER_PAGE = 6;

const statusTone: Record<string, string> = {
  Optimo: "text-emerald-500 border-emerald-500/30 bg-emerald-500/5",
  Sincronizado: "text-sky-500 border-sky-500/30 bg-sky-500/5",
};

export default function ProgramaOperativo() {
  const [query, setQuery] = useState("");
  const [core, setCore] = useState<number | "all">("all");
  const [page, setPage] = useState(1);

  const nodes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RDM_NODES_35.filter((n) => {
      const matchCore = core === "all" || n.coreId === core;
      const matchQuery =
        !q ||
        [n.title, n.subtitle, n.category, n.code, n.description].some((f) =>
          String(f ?? "").toLowerCase().includes(q),
        );
      return matchCore && matchQuery;
    });
  }, [query, core]);

  const totalPages = Math.max(1, Math.ceil(nodes.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const visible = nodes.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <ModuleShell
      eyebrow="Nodo Cero · Programa operativo"
      title="Programa General y"
      highlight="Operativo"
      subtitle="Los 7 núcleos YUN, sus 35 nodos operativos y los datos territoriales verificados que sostienen la operación diaria de Real del Monte."
      seoTitle="Programa General y Operativo — Nodo Cero RDM Digital"
      seoDescription="Programa general y operativo del Nodo Cero: 7 núcleos YUN, 35 nodos operativos, POIs verificados, rutas y calendario territorial de Real del Monte."
    >
      {/* Indicadores generales */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Layers, label: "Núcleos YUN", value: YUN_CORES.length },
          { icon: Activity, label: "Nodos operativos", value: RDM_NODES_35.length },
          { icon: MapPin, label: "POIs verificados", value: RDM_POIS.length },
          { icon: Gauge, label: "Rutas y eventos", value: RDM_ROUTES.length + RDM_EVENTS.length },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl border border-border bg-card/60 p-5">
            <Icon className="w-4 h-4 text-accent mb-3" />
            <p className="font-display text-3xl font-bold">{value}</p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Núcleos */}
      <SectionTitle hint={`${YUN_CORES.length} núcleos`}>Núcleos YUN</SectionTitle>
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {YUN_CORES.map((c) => {
          const count = RDM_NODES_35.filter((n) => n.coreId === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => {
                setCore(core === c.id ? "all" : c.id);
                setPage(1);
              }}
              className={`text-left rounded-2xl border p-5 transition-colors ${
                core === c.id ? "border-accent bg-accent/5" : "border-border bg-card/60 hover:border-accent/40"
              }`}
            >
              <p className="text-[10px] uppercase tracking-[0.25em] text-accent mb-2">Núcleo {c.id}</p>
              <h3 className="font-display text-lg font-semibold">{c.name}</h3>
              <p className="text-sm text-muted-foreground font-body mt-1">{c.subtitle}</p>
              <p className="text-[11px] text-muted-foreground mt-3">{count} nodos operativos</p>
            </button>
          );
        })}
      </div>

      {/* Nodos con búsqueda + paginación */}
      <SectionTitle hint={`${nodes.length} resultados`}>Nodos operativos</SectionTitle>
      <div className="max-w-6xl mx-auto mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar nodo, categoría o código YUN…"
            className="w-full pl-9 pr-4 py-2.5 rounded-full border border-border bg-card/60 text-sm font-body outline-none focus:border-accent"
          />
        </div>
        {core !== "all" && (
          <button
            onClick={() => {
              setCore("all");
              setPage(1);
            }}
            className="px-4 py-2.5 rounded-full border border-border text-sm text-muted-foreground"
          >
            Limpiar núcleo
          </button>
        )}
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-4">
        {visible.map((n) => (
          <article key={n.id} className="rounded-2xl border border-border bg-card/60 p-6">
            <div className="flex items-start justify-between gap-3 mb-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-accent">{n.code}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  statusTone[n.status] ?? "text-muted-foreground border-border"
                }`}
              >
                {n.status} · {n.latency}
              </span>
            </div>
            <h3 className="font-display text-xl font-semibold">{n.title}</h3>
            <p className="text-sm text-accent/80 font-body">{n.subtitle}</p>
            <p className="text-sm text-muted-foreground font-body mt-3">{n.description}</p>
            <ul className="mt-4 space-y-1">
              {n.details?.map((d) => (
                <li key={d} className="text-xs text-muted-foreground flex gap-2">
                  <span className="text-accent">·</span>
                  {d}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              {n.metrics?.map((m) => (
                <span key={m.label} className="text-[11px] px-2.5 py-1 rounded-full border border-border">
                  {m.label}: <strong className="font-semibold">{m.value}</strong>{" "}
                  <span className="text-muted-foreground">{m.change}</span>
                </span>
              ))}
            </div>
          </article>
        ))}
        {visible.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full text-center py-10">
            No hay nodos que coincidan con la búsqueda.
          </p>
        )}
      </div>

      <div className="max-w-6xl mx-auto mt-8">
        <ElegantPagination page={current} totalPages={totalPages} onChange={setPage} />
      </div>
    </ModuleShell>
  );
}
