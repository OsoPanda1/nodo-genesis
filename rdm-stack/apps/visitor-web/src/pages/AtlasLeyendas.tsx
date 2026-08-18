import MainLayout from "@/components/layout/MainLayout";
import SEOMeta from "@/components/SEOMeta";
import { AtlasPageHeader } from "@/components/atlas/AtlasPageHeader";
import { legends } from "@/data/atlas-territory";

export default function AtlasLeyendas() {
  return (
    <MainLayout>
      <SEOMeta
        title="Leyendas — Real del Monte"
        description="Las leyendas de Real del Monte: la novia de la mina, la campana de Cornualles, el conde y la veta perdida."
      />
      <AtlasPageHeader
        kicker="Memoria oral"
        title="Hay cosas que el mapa no registra."
        intro="Las leyendas de Real del Monte no se enseñan en la escuela. Se cuentan al atardecer, cuando la niebla baja y los nombres antiguos vuelven a pesar."
      />

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="space-y-16">
          {legends.map((l, i) => (
            <article key={l.title} className="grid gap-8 md:grid-cols-12">
              <div className="md:col-span-3">
                <div className="font-mono text-xs text-muted-foreground">0{i + 1}</div>
                <div className="text-xs uppercase tracking-[0.3em] text-primary/80 mt-2">
                  {l.era}
                </div>
              </div>
              <div className="md:col-span-9">
                <h2 className="font-serif text-4xl font-bold text-balance">{l.title}</h2>
                <p className="mt-6 text-lg leading-relaxed text-foreground/85">{l.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
