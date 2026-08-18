import { useState } from "react";
import { Mic, Image as ImageIcon, Video, Heart, Leaf } from "lucide-react";
import { ModuleShell, SectionTitle, ElegantCard, Chip } from "@/components/ModuleShell";
import { PODCAST_EPISODES, MEDIA_GALLERY, ECOTOURISM_SPOTS, MYTHS_AND_LEGENDS } from "@/data/rdm/modulesData";

export default function Media() {
  const [filter, setFilter] = useState<"todos" | "foto" | "video">("todos");
  const gallery = MEDIA_GALLERY.filter((m) => filter === "todos" || m.type === filter);

  return (
    <ModuleShell
      eyebrow="Media & Podcast · RDM"
      title="Memoria"
      highlight="Sonora"
      subtitle="Podcast del cronista, galería cívica, ecoturismo y leyendas narradas desde la neblina de la comarca minera."
      seoTitle="Podcast y galería de Real del Monte · RDM Digital"
      seoDescription="Escucha el podcast histórico de Real del Monte, explora la galería cívica, los parajes ecoturísticos y las leyendas de la comarca minera."
    >
      <div className="grid gap-4 md:grid-cols-2 max-w-6xl mx-auto">
        {PODCAST_EPISODES.map((ep, i) => (
          <ElegantCard key={ep.id} index={i}>
            <div className="flex items-start justify-between mb-3">
              <Mic className="w-5 h-5 text-accent" />
              <Chip>{ep.category}</Chip>
            </div>
            <h3 className="font-display text-base font-semibold mb-2">{ep.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{ep.description}</p>
            <p className="text-[11px] text-muted-foreground border-t border-border/40 pt-3">
              {ep.duration} · {ep.host}
            </p>
          </ElegantCard>
        ))}
      </div>

      <SectionTitle hint={`${MEDIA_GALLERY.length} piezas`}>Galería Cívica</SectionTitle>
      <div className="max-w-6xl mx-auto mb-5 flex gap-2">
        {(["todos", "foto", "video"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-xs rounded-full border transition-colors ${
              filter === f ? "border-accent/60 text-accent bg-accent/10" : "border-border/50 text-muted-foreground"
            }`}
          >
            {f === "todos" ? "Todos" : f === "foto" ? "Fotografía" : "Video"}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
        {gallery.map((item, i) => (
          <ElegantCard key={item.id} index={i}>
            <div className="flex items-start justify-between mb-3">
              {item.type === "video" ? (
                <Video className="w-5 h-5 text-gold" />
              ) : (
                <ImageIcon className="w-5 h-5 text-accent" />
              )}
              <Chip>{item.category}</Chip>
            </div>
            <h3 className="font-display text-sm font-semibold mb-2 leading-snug">{item.title}</h3>
            <p className="text-[11px] text-muted-foreground border-t border-border/40 pt-3 flex items-center justify-between">
              <span>{item.author}</span>
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-accent" /> {item.likes}
              </span>
            </p>
          </ElegantCard>
        ))}
      </div>

      <SectionTitle hint="Parajes de montaña">Ecoturismo</SectionTitle>
      <div className="grid gap-4 md:grid-cols-3 max-w-6xl mx-auto">
        {ECOTOURISM_SPOTS.map((spot, i) => (
          <ElegantCard key={spot.id} index={i}>
            <div className="flex items-start justify-between mb-3">
              <Leaf className="w-5 h-5 text-accent" />
              <Chip>{spot.difficulty}</Chip>
            </div>
            <h3 className="font-display text-base font-semibold mb-2">{spot.name}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{spot.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {spot.activities.map((a) => (
                <Chip key={a}>{a}</Chip>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground border-t border-border/40 pt-3">
              {spot.feeMXN === 0 ? "Entrada libre" : `$${spot.feeMXN} MXN por persona`}
            </p>
          </ElegantCard>
        ))}
      </div>

      <SectionTitle hint="Tradición oral">Mitos Documentados</SectionTitle>
      <div className="grid gap-4 md:grid-cols-3 max-w-6xl mx-auto">
        {MYTHS_AND_LEGENDS.map((myth, i) => (
          <ElegantCard key={myth.id} index={i}>
            <div className="flex items-start justify-between mb-3">
              <Chip>{myth.era}</Chip>
              <Chip>{myth.location}</Chip>
            </div>
            <h3 className="font-display text-base font-semibold mb-2">{myth.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{myth.story}</p>
          </ElegantCard>
        ))}
      </div>
    </ModuleShell>
  );
}
