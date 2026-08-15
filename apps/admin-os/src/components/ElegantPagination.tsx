import { ChevronLeft, ChevronRight } from "lucide-react";

interface ElegantPaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** Use numeric pills (better for >8 pages). Default: auto (numeric if >6). */
  variant?: "auto" | "dots" | "numeric";
}

/** Build a compact numeric range like: 1 … 4 5 [6] 7 8 … 14 */
function buildRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const out: (number | "…")[] = [];
  const window = 1;
  const left = Math.max(1, current - window);
  const right = Math.min(total - 2, current + window);
  out.push(0);
  if (left > 1) out.push("…");
  for (let i = left; i <= right; i++) out.push(i);
  if (right < total - 2) out.push("…");
  out.push(total - 1);
  return out;
}

export function ElegantPagination({ page, totalPages, onChange, variant = "auto" }: ElegantPaginationProps) {
  if (totalPages <= 1) return null;

  const useNumeric = variant === "numeric" || (variant === "auto" && totalPages > 6);
  const items = useNumeric ? buildRange(page, totalPages) : null;

  return (
    <nav
      aria-label="Paginación"
      className="mt-6 flex items-center justify-between gap-2 rounded-2xl border border-border/70 bg-card/60 p-2 backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      {useNumeric ? (
        <ol className="flex items-center gap-1">
          {items!.map((it, idx) =>
            it === "…" ? (
              <li key={`gap-${idx}`} className="px-1.5 text-xs text-muted-foreground/60 select-none">…</li>
            ) : (
              <li key={it}>
                <button
                  type="button"
                  onClick={() => onChange(it)}
                  aria-current={it === page ? "page" : undefined}
                  aria-label={`Ir a página ${it + 1}`}
                  className={`min-w-8 h-8 px-2 rounded-lg text-xs font-medium transition ${
                    it === page
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  {it + 1}
                </button>
              </li>
            ),
          )}
        </ol>
      ) : (
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Ir a página ${index + 1}`}
              aria-current={index === page ? "page" : undefined}
              onClick={() => onChange(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === page ? "w-8 bg-accent" : "w-2.5 bg-muted-foreground/40 hover:bg-accent/50"
              }`}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
        disabled={page === totalPages - 1}
        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Página siguiente"
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
