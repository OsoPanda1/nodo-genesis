import { cn } from '@/lib/utils';

type Variant = 'primary' | 'ghost' | 'gold';

/** Botón de cristal con barrido del gradiente core al pasar el cursor. */
export function CrystalButton({
  children,
  onClick,
  variant = 'primary',
  className,
  type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        'crystal-button',
        variant === 'ghost' && 'crystal-button-ghost',
        variant === 'gold' && 'crystal-button-gold',
        className,
      )}
    >
      {children}
    </button>
  );
}
