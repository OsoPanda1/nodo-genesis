import { cn } from '@/lib/utils';
import { GradientDivider } from './GradientDivider';

/** Cabecera editorial de sección con metálico y divisor ornamental. */
export function SectionHeader({
  badge,
  title,
  description,
  align = 'center',
  className,
}: {
  badge?: string;
  title: React.ReactNode;
  description?: string;
  align?: 'center' | 'left';
  className?: string;
}) {
  return (
    <header
      className={cn(
        'space-y-3',
        align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl',
        className,
      )}
    >
      {badge && (
        <div className={cn('crystal-badge', align === 'center' && 'mx-auto')}>
          <span>{badge}</span>
        </div>
      )}
      <h2 className="font-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-[#082f3b]">
        {title}
      </h2>
      {description && <p className="text-sm leading-relaxed text-slate-600 font-light">{description}</p>}
      <GradientDivider />
    </header>
  );
}
