import { useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import { ModuleShell, ElegantCard, Chip } from "@/components/ModuleShell";
import { ElegantPagination } from "@/components/ElegantPagination";
import { MANUAL_CHAPTERS } from "@/data/rdm/manualData";

const PAGE_SIZE = 4;
const CATEGORIES = ["Todas", ...Array.from(new Set(MANUAL_CHAPTERS.map((c) => c.category)))];

export default function Manual() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [page, setPage] = useState(0);

  const filtered = useMemo(
    () =>
      MANUAL_CHAPTERS.filter((chapter) => {
        const text = `${chapter.title} ${chapter.summary} ${chapter.guidelines.join(" ")}`.toLowerCase();
        return (
          (category === "Todas" || chapter.category === category) &&
          (!query || text.includes(query.toLowerCase()))
        );
      }),
    [query, category],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <ModuleShell
      eyebrow="Manual de Diseño Soberano"
      title="Sistema de"
      highlight="Diseño"
      subtitle="Fundamentos, tokens, componentes y patrones que sostienen la identidad visual de RDM Digital."
      seoTitle="Manual de diseño de RDM Digital · Tokens y componentes"
      seoDescription="Manual del sistema de diseño soberano de RDM Digital: fundamentos, tokens Tailwind, componentes UI, visualización de datos, motion y accesibilidad."
    >
      <div className="max-w-5xl mx-auto mb-8 grid gap-3 md:grid-cols-[1fr_260px_130px]">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="Buscar capítulos, tokens o patrones…"
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
          {filtered.length} capítulos
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 max-w-6xl mx-auto">
        {paged.map((chapter, i) => (
          <ElegantCard key={chapter.id} index={i}>
            <div className="flex items-start justify-between mb-3">
              <BookOpen className="w-5 h-5 text-accent" />
              <Chip>{chapter.category}</Chip>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Capítulo {chapter.chapterNum}
            </p>
            <h3 className="font-display text-base font-semibold mb-2">{chapter.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{chapter.summary}</p>
            <ul className="space-y-1 mb-3">
              {chapter.guidelines.map((g) => (
                <li key={g} className="text-[11px] text-muted-foreground flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-accent mt-1.5 shrink-0" /> {g}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {chapter.tailwindTokens.map((token) => (
                <Chip key={token}>{token}</Chip>
              ))}
            </div>
            <pre className="text-[10px] leading-relaxed bg-background/60 border border-border/40 rounded-xl p-3 overflow-x-auto text-muted-foreground">
              <code>{chapter.codeSnippet}</code>
            </pre>
          </ElegantCard>
        ))}
      </div>
      <div className="max-w-5xl mx-auto">
        <ElegantPagination page={page} totalPages={totalPages} onChange={setPage} variant="numeric" />
      </div>
    </ModuleShell>
  );
}
