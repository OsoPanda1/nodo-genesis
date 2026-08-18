import MainLayout from "@/components/layout/MainLayout";
import SEOMeta from "@/components/SEOMeta";
import { AtlasPageHeader } from "@/components/atlas/AtlasPageHeader";
import img from "@/assets/images/chapter-cementerio.jpg";

export default function AtlasCementerio() {
  return (
    <MainLayout>
      <SEOMeta
        title="El cementerio inglés — Real del Monte"
        description="El Panteón Inglés de Real del Monte: las cruces que miran hacia Cornualles."
      />
      <AtlasPageHeader
        kicker="Capa III · Memoria silenciosa"
        title="Las cruces miran hacia Cornualles."
        intro="A finales del siglo XIX, los mineros cornish pidieron que sus tumbas se orientaran hacia su tierra natal. Solo una mira en sentido contrario: la del payaso Richard Bell."
        image={img}
      />

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="text-lg leading-relaxed text-foreground/85">
              El Panteón Inglés es uno de los pocos cementerios británicos fuera del Reino Unido y
              uno de los lugares más quietos de México. Aquí descansan mineros, ingenieros, esposas,
              niños — toda una comunidad que vino a fundar otra patria sin proponérselo.
            </p>
            <p className="mt-6 text-lg leading-relaxed text-foreground/85">
              Caminarlo al amanecer no es visitar un cementerio. Es atravesar una conversación
              suspendida entre dos países que aprendieron a mirarse.
            </p>
          </div>
          <aside className="md:col-span-5">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-primary/80">Datos</div>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between border-b border-border pb-2">
                  <dt className="text-muted-foreground">Fundado</dt>
                  <dd>~ 1851</dd>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <dt className="text-muted-foreground">Tumbas</dt>
                  <dd>≈ 755</dd>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <dt className="text-muted-foreground">Orientación</dt>
                  <dd>Hacia Cornualles</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Acceso</dt>
                  <dd>Diario</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>

        <blockquote className="mt-20 border-l-2 border-primary pl-8">
          <p className="font-serif text-3xl italic leading-snug text-balance">
            "No vinieron a quedarse, pero el subsuelo los retuvo.
            <span className="block text-muted-foreground">
              Y con ellos, una manera distinta de inclinar el tejado contra la lluvia."
            </span>
          </p>
        </blockquote>
      </section>
    </MainLayout>
  );
}
