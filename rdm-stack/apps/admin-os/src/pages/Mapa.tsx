import { useEffect, useState } from "react";
import { InteractiveMap } from "@/components/InteractiveMap";
import { FloatingNav } from "@/components/FloatingNav";
import { RealitoOrb } from "@/components/RealitoOrb";
import { Map3D } from "@/components/Map3D";
import { fetchAIRecommendations, gammaPrompt } from "@/lib/gamma";

const moods = ["aventura", "romantico", "familiar", "tranquilo"] as const;

type Mood = (typeof moods)[number];

const Mapa = () => {
  const [selectedMood, setSelectedMood] = useState<Mood>("tranquilo");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetchAIRecommendations(selectedMood)
      .then((data) => {
        if (mounted) {
          setRecommendations(data);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [selectedMood]);

  return (
    <div className="min-h-screen bg-black text-white">
      <FloatingNav />

      <section className="mx-auto w-full max-w-6xl px-4 pt-28 md:px-6">
        <h1 className="text-2xl font-semibold md:text-4xl">Mapa RDM Digital + IA</h1>
        <p className="mt-2 text-sm text-white/70 md:text-base">
          Exploración en capas: terreno 3D, mapa interactivo y recomendaciones dinámicas por estado de ánimo.
        </p>

        <div className="mt-6 h-[500px] overflow-hidden rounded-2xl border border-white/20 bg-slate-900">
          <Map3D />
        </div>

        <div className="mt-6 rounded-2xl border border-cyan-400/30 bg-cyan-950/20 p-4">
          <p className="text-xs uppercase tracking-widest text-cyan-200/90">Prompt cinematográfico Gamma</p>
          <p className="mt-2 max-h-28 overflow-hidden whitespace-pre-line text-sm text-cyan-50/90">{gammaPrompt}</p>
        </div>

        <div className="mt-6 rounded-2xl border border-white/20 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Recomendaciones IA (simulado)</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {moods.map((mood) => (
              <button
                key={mood}
                type="button"
                onClick={() => setSelectedMood(mood)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  selectedMood === mood
                    ? "bg-cyan-400 text-black"
                    : "border border-white/30 bg-black/30 text-white hover:bg-white/10"
                }`}
              >
                {mood}
              </button>
            ))}
          </div>

          <div className="mt-4 min-h-12 text-sm text-white/90">
            {loading ? (
              <span className="text-white/60">Consultando IA…</span>
            ) : (
              <ul className="list-disc pl-5">
                {recommendations.map((place) => (
                  <li key={place}>{place}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <div className="pt-8">
        <InteractiveMap />
      </div>

      <RealitoOrb />
    </div>
  );
};

export default Mapa;
