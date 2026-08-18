import { WikiPage } from "@/components/WikiPage";
import { Section, InfoBox } from "@/components/WikiElements";
import { Globe, Award, MapPin, TrendingUp } from "lucide-react";

const regiones = [
  { region: "América del Norte", paises: "USA, Canadá, México" },
  { region: "Europa", paises: "Alemania, Francia, España, Italia, Reino Unido" },
  { region: "Asia-Pacífico", paises: "Japón, Corea del Sur, Australia, Singapur" },
  { region: "América Latina", paises: "Brasil, Argentina, Chile, Colombia, Perú" },
];

const expansion = [
  { region: "India y Sudeste Asiático", emoji: "🇮🇳" },
  { region: "África (Sudáfrica, Nigeria, Kenia)", emoji: "🇿🇦" },
  { region: "Medio Oriente (UAE, Arabia Saudí)", emoji: "🇦🇪" },
  { region: "Europa Nórdica (Noruega, Suecia, Dinamarca)", emoji: "🇳🇴" },
];

const premios = [
  "Most Innovative Platform 2026 — Tech Innovation Awards",
  "Best AI Ethics Implementation — AI Ethics Council",
  "Blockchain Excellence Award — Crypto Innovation Summit",
  "XR Platform of the Year — Virtual Reality Awards",
];

const ImpactoCivilizatorio = () => (
  <WikiPage
    title="Impacto Civilizatorio & Expansión"
    subtitle="25 Países Activos — Métricas Globales — Reconocimientos Internacionales"
  >
    <InfoBox type="success" title="Primer Sistema Antifrágil Federado Transgeneracional">
      TAMV busca inscripción histórica, elevación de dignidad, redistribución de riqueza y construir
      el primer legado digital antifrágil que trascienda generaciones.
    </InfoBox>

    <Section title="Objetivos Civilizatorios" icon={Globe}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            title: "Inscripción Histórica",
            desc: "Registro vivo de comunidades olvidadas con memoria defensiva",
          },
          {
            title: "Elevación de Dignidad",
            desc: "Transformar vulnerabilidad en liderazgo tecnológico",
          },
          {
            title: "Redistribución de Riqueza",
            desc: "Elevar millonarios del 0.75% al 10% mundial",
          },
          {
            title: "Legado Transgeneracional",
            desc: "Primer sistema antifrágil federado que hereden las generaciones futuras",
          },
        ].map((obj) => (
          <div key={obj.title} className="rounded-md border border-border/50 bg-primary/5 p-4">
            <div className="font-semibold text-foreground text-sm mb-1">{obj.title}</div>
            <div className="text-xs text-muted-foreground">{obj.desc}</div>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Presencia Global (25 países)" icon={MapPin}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {regiones.map((r) => (
          <div key={r.region} className="rounded-md border border-border/50 bg-muted/20 p-3">
            <div className="font-semibold text-foreground text-sm">{r.region}</div>
            <div className="text-xs text-muted-foreground mt-1">{r.paises}</div>
          </div>
        ))}
      </div>
      <h4 className="font-semibold text-foreground mt-4">Próxima Expansión (Q1 2026)</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
        {expansion.map((e) => (
          <div
            key={e.region}
            className="rounded-md border border-border/50 bg-card/30 p-3 text-center"
          >
            <div className="text-2xl mb-1">{e.emoji}</div>
            <div className="text-xs text-muted-foreground">{e.region}</div>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Reconocimientos" icon={Award}>
      <div className="space-y-2">
        {premios.map((p) => (
          <div
            key={p}
            className="flex items-center gap-3 rounded-md border border-border/50 bg-muted/20 px-3 py-2"
          >
            <span className="text-primary">🏆</span>
            <span className="text-sm text-muted-foreground">{p}</span>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Hitos Alcanzados" icon={TrendingUp}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          "Primer millón de usuarios (Enero 2026)",
          "$50M en volumen de transacciones",
          "25 países con operaciones activas",
          "500+ proveedores de salud integrados",
          "150+ cursos UTAMV disponibles",
        ].map((h) => (
          <div key={h} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-primary">✓</span>
            {h}
          </div>
        ))}
      </div>
    </Section>

    <Section title="Licenciamiento">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-md border border-border/50 bg-muted/20 p-4">
          <div className="font-semibold text-foreground text-sm">Núcleo Filosófico-Político</div>
          <div className="text-xs text-muted-foreground mt-1">Creative Commons BY-NC-SA 4.0</div>
        </div>
        <div className="rounded-md border border-border/50 bg-muted/20 p-4">
          <div className="font-semibold text-foreground text-sm">Especificaciones Técnicas</div>
          <div className="text-xs text-muted-foreground mt-1">
            Open Specification License + Apache 2.0
          </div>
        </div>
      </div>
    </Section>
  </WikiPage>
);

export default ImpactoCivilizatorio;
