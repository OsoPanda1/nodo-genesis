import { cn } from '@/lib/utils';

/** Separador ornamental de gradiente en movimiento (platino→oro→azul). */
export function GradientDivider({ className }: { className?: string }) {
  return <hr className={cn('rdm-divider my-8', className)} />;
}
