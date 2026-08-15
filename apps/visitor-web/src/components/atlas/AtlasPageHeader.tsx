type Props = {
  kicker: string;
  title: string;
  intro?: string;
  image?: string;
};

export function AtlasPageHeader({ kicker, title, intro, image }: Props) {
  return (
    <section className="relative isolate overflow-hidden">
      {image && (
        <div className="absolute inset-0 -z-10">
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover opacity-40"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>
      )}
      <div className="mx-auto max-w-4xl px-6 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="text-xs uppercase tracking-[0.3em] text-primary/80">{kicker}</div>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl md:text-6xl font-bold text-foreground text-balance">
          {title}
        </h1>
        {intro && (
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">{intro}</p>
        )}
      </div>
    </section>
  );
}
