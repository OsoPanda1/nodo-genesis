import MainLayout from "@/components/layout/MainLayout";
import SEOMeta from "@/components/SEOMeta";
import { AtlasPageHeader } from "@/components/atlas/AtlasPageHeader";
import { mines } from "@/data/atlas-territory";
import img from "@/assets/images/chapter-minas.jpg";

export default function AtlasMinas() {
  return (
    <MainLayout>
      <SEOMeta
        title="Las minas — Real del Monte"
        description="Las minas que sostienen el suelo de Real del Monte: Acosta, Dolores, Santa Inés, San Juan Pachuca. Memoria viva del ciclo de la plata."
      />
      <AtlasPageHeader
        kicker="Capa I · Subsuelo"
        title="Bajo el pueblo respira una segunda geografía."
        intro="Galerías que sostuvieron la plata del mundo y dieron forma a todo lo que está arriba: el idioma, la cocina, los apellidos, el silencio que cae al atardecer."
        image={img}
      />

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="text-xs uppercase tracking-[0.3em] text-primary/80">
              Memoria operacional
            </div>
          </div>
          <div className="md:col-span-8">
            <p className="text-lg leading-relaxed text-foreground/85">
              Real del Monte fue, durante más de dos siglos, uno de los distritos mineros más
              importantes del mundo. La huelga de 1766 — la primera de América — comenzó aquí, entre
              estos túneles. Hoy las minas siguen siendo el corazón silencioso del pueblo: algunas
              son patrimonio, otras se recorren, otras se recuerdan.
            </p>
          </div>
        </div>

        <div className="mt-16 space-y-12">
          {mines.map((m, i) => (
            <article key={m.id} className="grid gap-6 border-t border-border pt-12 md:grid-cols-12">
              <div className="md:col-span-4">
                <div className="font-mono text-xs text-muted-foreground">
                  0{i + 1} · {m.founded}
                </div>
                <h2 className="font-serif mt-2 text-3xl font-bold">{m.name}</h2>
                <span className="mt-3 inline-flex rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground capitalize">
                  {m.status}
                </span>
              </div>
              <div className="md:col-span-8">
                <p className="text-foreground/85 leading-relaxed">{m.description}</p>
                <div className="mt-6">
                  <div className="text-xs uppercase tracking-[0.3em] text-primary/80">
                    Conexiones
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {m.connections.map((c) => (
                      <span
                        key={c}
                        className="rounded-md border border-border bg-card px-3 py-1 text-xs"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
