import MainLayout from "@/components/layout/MainLayout";
import SEOMeta from "@/components/SEOMeta";
import { AtlasPageHeader } from "@/components/atlas/AtlasPageHeader";
import { pastes } from "@/data/atlas-territory";
import img from "@/assets/images/chapter-pastes.jpg";

const tags: Record<string, string> = {
  tradicional: "Tradicional",
  mestizo: "Mestizo",
  contemporáneo: "Contemporáneo",
};

export default function AtlasPastes() {
  return (
    <MainLayout>
      <SEOMeta
        title="Los pastes — Memoria comestible"
        description="Los pastes de Real del Monte: la negociación cotidiana entre Cornualles y la sierra de Hidalgo."
      />
      <AtlasPageHeader
        kicker="Capa II · Memoria comestible"
        title="Una receta es también un tratado."
        intro="El paste cruzó el Atlántico en el bolsillo de un minero cornish, se cocinó al carbón en la sierra, recibió el chile y el mole, y aprendió a quedarse."
        image={img}
      />

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pastes.map((p) => (
            <div
              key={p.name}
              className="rounded-xl border border-border bg-card p-6 shadow-sm transition hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-serif text-2xl font-bold">{p.name}</h3>
                <span className="shrink-0 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                  {tags[p.origin]}
                </span>
              </div>
              <div className="text-xs uppercase tracking-[0.3em] text-primary/80 mt-3">Relleno</div>
              <p className="mt-1 text-sm text-foreground/85">{p.filling}</p>
              <p className="mt-5 border-t border-border pt-4 text-sm italic text-muted-foreground">
                {p.note}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 rounded-2xl bg-gradient-to-br from-amber-700 to-orange-900 p-10 text-white md:p-16">
          <div className="text-xs uppercase tracking-[0.3em] text-white/70">Festival</div>
          <h2 className="mt-3 text-balance font-serif text-4xl font-bold md:text-5xl">
            Cada octubre el pueblo huele a horno.
          </h2>
          <p className="mt-4 max-w-2xl text-white/85">
            El Festival Internacional del Paste reúne a cocineros, panaderos y a delegaciones de
            Cornualles. Es la conversación culinaria más antigua entre Inglaterra y México, servida
            en una sola pieza hojaldrada.
          </p>
        </div>
      </section>
    </MainLayout>
  );
}
