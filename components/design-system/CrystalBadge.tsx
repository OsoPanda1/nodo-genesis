import { cn } from '@/lib/utils';

/** Sello translúcido de cristal. */
export function CrystalBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('crystal-badge', className)}>{children}</div>;
}
