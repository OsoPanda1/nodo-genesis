import { cn } from '@/lib/utils';

/** Título editorial metálico (platino → oro → azul eléctrico). */
export function MetallicHeading({
  as: Tag = 'h2',
  children,
  className,
}: {
  as?: 'h1' | 'h2' | 'h3';
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Tag className={cn('font-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-[#082f3b]', className)}>
      {children}
    </Tag>
  );
}

/** Fragmento de texto con degradado metálico animado. */
export function MetallicText({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('rdm-metallic-text', className)}>{children}</span>;
}
