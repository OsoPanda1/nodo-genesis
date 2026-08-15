/**
 * Dedicatoria global · aparece en todas las páginas a través del Footer.
 * Texto manuscrito elegante dedicado a Reina Trejo Serrano.
 */
export default function DedicationBanner() {
  return (
    <div
      className="w-full border-t border-border/40 bg-gradient-to-b from-transparent via-accent/[0.04] to-transparent py-8 px-4 text-center"
      aria-label="Dedicatoria"
    >
      <p
        style={{ fontFamily: "'Dancing Script', 'Great Vibes', cursive" }}
        className="text-2xl md:text-3xl text-foreground/90 leading-snug"
      >
        Proyecto dedicado a mi madre Reina Trejo Serrano — Sonríe y siente orgullo — Tu Oveja Negra lo logró
      </p>
      <p
        style={{ fontFamily: "'Dancing Script', cursive" }}
        className="mt-2 text-lg md:text-xl text-accent"
      >
        Orgullosamente Realmontenses
      </p>
    </div>
  );
}
