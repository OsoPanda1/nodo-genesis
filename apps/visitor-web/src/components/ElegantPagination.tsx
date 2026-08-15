import { ChevronLeft, ChevronRight } from "lucide-react";

interface ElegantPaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function ElegantPagination({ page, totalPages, onChange }: ElegantPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-between rounded-2xl border border-border/70 bg-card/60 p-2 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </button>

      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Ir a página ${index + 1}`}
            onClick={() => onChange(index)}
            className={`h-2.5 rounded-full transition-all ${
              index === page ? "w-8 bg-accent" : "w-2.5 bg-muted-foreground/40 hover:bg-accent/50"
            }`}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
        disabled={page === totalPages - 1}
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        Siguiente
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
