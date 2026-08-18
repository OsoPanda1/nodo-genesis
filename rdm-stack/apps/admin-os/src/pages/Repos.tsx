import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Github, Star, Calendar, Code2, Search, ExternalLink } from "lucide-react";
import { ElegantPagination } from "@/components/ElegantPagination";

import repos from "@/data/osopanda-repos.json";

const PAGE_SIZE = 24;

interface Repo {
  name: string;
  description: string;
  language: string;
  stars: number;
  updated: string;
  url: string;
}

const LANG_COLOR: Record<string, string> = {
  TypeScript: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  JavaScript: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Python: "bg-green-500/20 text-green-300 border-green-500/30",
  HTML: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Shell: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  Rust: "bg-amber-700/20 text-amber-400 border-amber-700/30",
  Java: "bg-red-500/20 text-red-300 border-red-500/30",
  Fortran: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "N/A": "bg-muted/40 text-muted-foreground border-border",
};

export default function Repos() {
  const [q, setQ] = useState("");
  const [lang, setLang] = useState<string>("all");
  const [page, setPage] = useState(0);

  const list = repos as Repo[];
  const langs = useMemo(() => ["all", ...Array.from(new Set(list.map((r) => r.language)))], [list]);

  const filtered = useMemo(() => {
    return list.filter((r) => {
      const matchQ =
        !q ||
        r.name.toLowerCase().includes(q.toLowerCase()) ||
        r.description.toLowerCase().includes(q.toLowerCase());
      const matchL = lang === "all" || r.language === lang;
      return matchQ && matchL;
    });
  }, [list, q, lang]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => { if (page >= totalPages) setPage(0); }, [page, totalPages]);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    
      <div className="min-h-screen bg-background text-foreground">
        {/* Hero */}
        <section className="relative border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-primary/5" />
          <div className="relative max-w-7xl mx-auto px-6 py-20">
            <p className="text-xs uppercase tracking-[0.4em] text-accent mb-4">Federación viva</p>
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
              Cadena de Repositorios <span className="text-accent">OsoPanda1</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              {list.length} repositorios que componen el ecosistema TAMV Online y RDM Digital. Cada nodo aporta
              una pieza del Sistema Operativo Civilizatorio: kernel, IA, XR, economía, identidad, cartografía.
            </p>
          </div>
        </section>

        {/* Filtros */}
        <section className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border/40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(0); }}
                placeholder="Buscar por nombre o descripción..."
                className="w-full pl-10 pr-4 py-2.5 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <select
              value={lang}
              onChange={(e) => { setLang(e.target.value); setPage(0); }}
              className="px-4 py-2.5 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {langs.map((l) => (
                <option key={l} value={l}>
                  {l === "all" ? "Todos los lenguajes" : l}
                </option>
              ))}
            </select>
            <div className="flex items-center px-4 text-sm text-muted-foreground whitespace-nowrap">
              {filtered.length} de {list.length} · Pág. {page + 1}/{totalPages}
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paged.map((r, i) => (
              <motion.a
                key={r.name}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.015, 0.3) }}
                className="group block p-5 rounded-xl border border-border/40 bg-card/40 hover:bg-card/80 hover:border-accent/40 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Github className="w-4 h-4 text-accent shrink-0" />
                    <h3 className="font-display text-base font-semibold truncate group-hover:text-accent transition-colors">
                      {r.name}
                    </h3>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3 min-h-[3rem] mb-4">
                  {r.description || <span className="italic opacity-60">Sin descripción</span>}
                </p>
                <div className="flex items-center gap-2 flex-wrap text-[10px]">
                  <span className={`px-2 py-0.5 rounded border ${LANG_COLOR[r.language] || LANG_COLOR["N/A"]}`}>
                    <Code2 className="w-2.5 h-2.5 inline mr-1" />
                    {r.language}
                  </span>
                  {r.stars > 0 && (
                    <span className="px-2 py-0.5 rounded bg-muted/40 text-muted-foreground">
                      <Star className="w-2.5 h-2.5 inline mr-1" />
                      {r.stars}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-muted/40 text-muted-foreground ml-auto">
                    <Calendar className="w-2.5 h-2.5 inline mr-1" />
                    {r.updated}
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No se encontraron repositorios con esos criterios.
            </div>
          ) : (
            <ElegantPagination
              page={page}
              totalPages={totalPages}
              onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              variant="numeric"
            />
          )}
        </section>
      </div>
    
  );
}
