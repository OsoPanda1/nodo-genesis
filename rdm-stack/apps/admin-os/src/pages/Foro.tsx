import { useMemo, useState } from "react";
import { MessagesSquare, ArrowBigUp, CheckCircle2, MessageCircle } from "lucide-react";
import { ModuleShell, SectionTitle, ElegantCard, Chip } from "@/components/ModuleShell";
import { ElegantPagination } from "@/components/ElegantPagination";
import { FORUM_THREADS, FORUM_POSTS } from "@/data/rdm/modulesData";

const PAGE_SIZE = 4;
const CATEGORIES = ["Todas", ...Array.from(new Set(FORUM_THREADS.map((t) => t.category)))];

export default function Foro() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [page, setPage] = useState(0);
  const [openThread, setOpenThread] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      FORUM_THREADS.filter((thread) => {
        const text = `${thread.title} ${thread.content} ${thread.tags.join(" ")}`.toLowerCase();
        return (
          (category === "Todas" || thread.category === category) &&
          (!query || text.includes(query.toLowerCase()))
        );
      }),
    [query, category],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <ModuleShell
      eyebrow="Foro Cívico · RDM"
      title="Deliberación"
      highlight="Comunitaria"
      subtitle="Propuestas urbanas, conservación del patrimonio y turismo responsable discutidos por quienes habitan la montaña."
      seoTitle="Foro Cívico de Real del Monte · Propuestas y patrimonio"
      seoDescription="Espacio de deliberación comunitaria de Real del Monte: propuestas urbanas, conservación del patrimonio, turismo responsable y anuncios vecinales."
    >
      <div className="max-w-5xl mx-auto mb-8 grid gap-3 md:grid-cols-[1fr_240px_120px]">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="Buscar temas del foro…"
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
          {filtered.length} hilos
        </div>
      </div>

      <div className="grid gap-4 max-w-5xl mx-auto">
        {paged.map((thread, i) => {
          const replies = FORUM_POSTS.filter((p) => p.threadId === thread.id);
          const isOpen = openThread === thread.id;
          return (
            <ElegantCard key={thread.id} index={i}>
              <div className="flex items-start justify-between mb-3">
                <MessagesSquare className="w-5 h-5 text-accent" />
                <div className="flex items-center gap-2">
                  {thread.solved && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full border border-accent/50 text-accent uppercase tracking-[0.16em]">
                      Resuelto
                    </span>
                  )}
                  <Chip>{thread.category}</Chip>
                </div>
              </div>
              <h3 className="font-display text-base font-semibold mb-2">{thread.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{thread.content}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {thread.tags.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
              <div className="text-[11px] text-muted-foreground border-t border-border/40 pt-3 flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1">
                  <ArrowBigUp className="w-3.5 h-3.5 text-accent" /> {thread.upvotes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" /> {thread.repliesCount}
                </span>
                <span>
                  {thread.author} · {thread.authorRole}
                </span>
                <span>{thread.createdAt}</span>
                {replies.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setOpenThread(isOpen ? null : thread.id)}
                    className="ml-auto text-accent hover:underline"
                  >
                    {isOpen ? "Ocultar respuestas" : `Ver ${replies.length} respuestas`}
                  </button>
                )}
              </div>
              {isOpen && (
                <ul className="mt-4 space-y-3 border-l border-border/50 pl-4">
                  {replies.map((post) => (
                    <li key={post.id} className="text-xs text-muted-foreground">
                      <p className="text-foreground/85 mb-1">{post.content}</p>
                      <p className="text-[10px] flex items-center gap-2">
                        {post.author} · {post.authorRole} · {post.createdAt} · ▲ {post.upvotes}
                        {post.isSolution && (
                          <span className="text-accent flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> solución
                          </span>
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </ElegantCard>
          );
        })}
      </div>
      <div className="max-w-5xl mx-auto">
        <ElegantPagination page={page} totalPages={totalPages} onChange={setPage} variant="numeric" />
      </div>

      <SectionTitle hint="Reglas de convivencia">Gobernanza del Foro</SectionTitle>
      <div className="max-w-3xl mx-auto rounded-2xl border border-border/40 bg-card/40 p-5 text-xs text-muted-foreground space-y-2">
        <p>· Toda propuesta debe indicar barrio, calle o paraje al que se refiere.</p>
        <p>· Las publicaciones que afecten patrimonio pasan por revisión del Comité de Conservación.</p>
        <p>· Los comercios se identifican con su folio del padrón soberano RDM TradeNode.</p>
      </div>
    </ModuleShell>
  );
}
