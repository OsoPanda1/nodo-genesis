import { Link } from "react-router-dom";

interface GotaDeMercurioButtonProps {
  compact?: boolean;
}

export function GotaDeMercurioButton({ compact = false }: GotaDeMercurioButtonProps) {
  return (
    <Link
      to="/donar"
      className={`inline-flex items-center rounded-full border border-silver-light/60 bg-pearl-white/10 backdrop-blur-18 shadow-glass-silver text-silver-light uppercase tracking-[0.16em] transition-all duration-300 hover:border-crystal-glow/80 hover:bg-crystal-glow/10 hover:shadow-[0_0_25px_rgba(240,248,255,0.45)] ${
        compact ? "px-3 py-1.5 text-[10px]" : "px-4 py-2 text-xs"
      }`}
    >
      Asegura el brillo de nuestro legado
    </Link>
  );
}
