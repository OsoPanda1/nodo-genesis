import { cn } from '@/lib/utils';

/** Cápsula translúcida de métrica con indicador animado. */
export function StatPill({
  value,
  label,
  sub,
  color = '#3f9b78',
  className,
}: {
  value: string;
  label: string;
  sub?: string;
  color?: string;
  className?: string;
}) {
  return (
    <div className={cn('stat-pill', className)}>
      <span className="stat-pill-dot" style={{ background: color, color }} />
      <div className="min-w-0">
        <div className="truncate text-[9px] uppercase tracking-widest text-[#536b86] font-rdm-mono">
          {label}
        </div>
        <div className="font-patrimonial text-xl font-bold text-[#082f3b] leading-tight">{value}</div>
        {sub && <div className="truncate text-[10px] text-[#536b86]">{sub}</div>}
      </div>
    </div>
  );
}
