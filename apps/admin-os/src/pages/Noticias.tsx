import { useMemo, useState } from "react";
import { Newspaper, Eye, Clock, ShieldCheck, ScrollText, MapPin } from "lucide-react";
import { ModuleShell, SectionTitle, ElegantCard, Chip } from "@/components/ModuleShell";
import { ElegantPagination } from "@/components/ElegantPagination";
import { NEWS_ARTICLES, HISTORICAL_DOCUMENTS } from "@/data/rdm/realDelMonteData";

const PAGE_SIZE = 3;
const CATEGORIES = ["Todas", ...Array.from(new Set(NEWS_ARTICLES.map((n) => n.category)))];

export default function Noticias() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [page, setPage] = useState(0);

  const filtered = useMemo(
    () =>
      NEWS_ARTICLES.filter((article) => {
        const text = `${article.title} ${article.summary} ${article.tags.join(" ")}`.toLowerCase();
        return (
          (category === "Todas" || article.category === category) &&
          (!query || text.includes(query.toLowerCase()))
        );
      }),
    [query, category],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <ModuleShell
      eyebrow="Pilar 1 · RDM InfoMesh"
      title="Información"
      highlight="Verificada"
      subtitle="Avisos cívicos, crónicas históricas y archivo documental de la comarca minera, firmados por su fuente."
      seoTitle="InfoMesh · Noticias y Archivo Histórico de Real del Monte"
      seoDescription="Noticias comunitarias verificadas, avisos municipales y documentos históricos digitalizados de Real del Monte, Hidalgo."
    >
      <div className="max-w-5xl mx-auto mb-8 grid gap-3 md:grid-cols-[1fr_240px_120px]">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="Buscar noticias, crónicas o avisos…"
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
          {filtered.length} notas
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {paged.map((article, i) => (
          <ElegantCard key={article.id} index={i}>
            <div className="flex items-start justify-between mb-3">
              <Newspaper className="w-5 h-5 text-accent" />
              <Chip>{article.category}</Chip>
            </div>
            <h3 className="font-display text-base font-semibold mb-2 leading-snug">{article.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{article.summary}</p>
            <p className="text-xs text-foreground/80 leading-relaxed mb-4">{article.content}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {article.tags.map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>
            <div className="text-[11px] text-muted-foreground space-y-1 border-t border-border/40 pt-3">
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" /> {article.verifiedBy}
              </p>
              <p className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {article.readTime}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> {article.views.toLocaleString("es-MX")}
                </span>
                <span>{article.date}</span>
              </p>
              <p>Por {article.author}</p>
            </div>
          </ElegantCard>
        ))}
      </div>
      <div className="max-w-5xl mx-auto">
        <ElegantPagination page={page} totalPages={totalPages} onChange={setPage} variant="numeric" />
      </div>

      <SectionTitle hint={`${HISTORICAL_DOCUMENTS.length} documentos`}>Archivo Histórico Digitalizado</SectionTitle>
      <div className="grid gap-4 md:grid-cols-3 max-w-6xl mx-auto">
        {HISTORICAL_DOCUMENTS.map((doc, i) => (
          <ElegantCard key={doc.id} index={i}>
            <div className="flex items-start justify-between mb-3">
              <ScrollText className="w-5 h-5 text-gold" />
              <Chip>{doc.era}</Chip>
            </div>
            <h3 className="font-display text-base font-semibold mb-2 leading-snug">{doc.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{doc.description}</p>
            <p className="text-xs text-foreground/80 leading-relaxed mb-3">{doc.historicalContext}</p>
            <div className="text-[11px] text-muted-foreground border-t border-border/40 pt-3 space-y-1">
              <p className="font-mono">{doc.archivalRef}</p>
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> {doc.archiveLocation}
              </p>
            </div>
          </ElegantCard>
        ))}
      </div>
    </ModuleShell>
  );
}
