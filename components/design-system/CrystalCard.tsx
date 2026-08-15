import { cn } from '@/lib/utils';

/** Pieza de cristal translúcido sobre superficie perlada. */
export function CrystalCard({
  children,
  className,
  petroleum = false,
}: {
  children: React.ReactNode;
  className?: string;
  petroleum?: boolean;
}) {
  return <div className={cn(petroleum ? 'crystal-card crystal-card-petroleum' : 'crystal-card', className)}>{children}</div>;
}
