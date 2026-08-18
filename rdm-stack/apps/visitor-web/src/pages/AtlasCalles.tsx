import MainLayout from "@/components/layout/MainLayout";
import SEOMeta from "@/components/SEOMeta";
import { AtlasPageHeader } from "@/components/atlas/AtlasPageHeader";
import { streets } from "@/data/atlas-territory";
import img from "@/assets/images/chapter-calles.jpg";

export default function AtlasCalles() {
  return (
    <MainLayout>
      <SEOMeta
        title="Las calles — Real del Monte"
        description="Las calles de Real del Monte: nombres, esquinas y memoria."
      />
      <AtlasPageHeader
        kicker="Capa IV · Superficie"
        title="La ciudad se inclina contra la sierra."
        intro="Real del Monte es un pueblo que se aprendió a sí mismo en pendiente. Las calles bajan donde la roca lo permitió y guardan, en sus nombres, un siglo de personas."
        image={img}
      />

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="overflow-hidden rounded-xl border border-border">
          {streets.map((s, i) => (
            <div
              key={s.name}
              className={`grid grid-cols-12 gap-6 p-6 md:p-8 ${
                i < streets.length - 1 ? "border-b border-border" : ""
              } hover:bg-muted/40 transition-colors`}
            >
              <div className="col-span-12 md:col-span-3">
                <div className="font-mono text-xs text-muted-foreground">{s.era}</div>
                <h2 className="font-serif mt-1 text-2xl font-bold">{s.name}</h2>
              </div>
              <p className="col-span-12 text-foreground/80 leading-relaxed md:col-span-9">
                {s.story}
              </p>
            </div>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
