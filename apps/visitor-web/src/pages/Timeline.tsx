import { WikiPage } from "@/components/WikiPage";
import { Section } from "@/components/WikiElements";

const Timeline = () => {
  const events = [
    {
      year: "2019–2020",
      title: "Conceptualización",
      desc: "Primeras ideas y autoestudio intensivo. Nace la visión de un ecosistema digital soberano.",
    },
    {
      year: "2021",
      title: "Diseño arquitectónico",
      desc: "Se define la estructura modular de dominios y guardianías. Se crea el Códice Maestro v0.1.",
    },
    {
      year: "2022",
      title: "Primeros prototipos",
      desc: "Implementación de demos funcionales: UTAMV, interfaces XR iniciales y módulos de identidad.",
    },
    {
      year: "2023",
      title: "Isabella AI & Seguridad",
      desc: "Integración de la IA contextual Isabella y los módulos de seguridad ANUBIS y HORUS.",
    },
    {
      year: "2024",
      title: "MD‑X4 & Federación",
      desc: "Lanzamiento del framework MD‑X4. Consolidación de 177 repositorios en el Digital Nexus.",
    },
    {
      year: "2025",
      title: "Expansión CITEMESH",
      desc: "Apertura de nodos federados, economía TAMV y guardianía TENOCHTITLAN.",
    },
    {
      year: "2026+",
      title: "Soberanía plena",
      desc: "Infraestructura pública, gobernanza ciudadana y escalamiento latinoamericano.",
    },
  ];

  return (
    <WikiPage title="Línea de Tiempo" subtitle="La evolución del ecosistema TAMV desde su origen">
      <Section title="Hitos principales">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/60 via-secondary/40 to-primary/20" />
          <div className="space-y-6">
            {events.map((e, i) => (
              <div key={e.year} className="flex gap-5 items-start">
                <div className="relative shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border ${
                      i % 2 === 0
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-secondary/50 bg-secondary/10 text-secondary"
                    }`}
                  >
                    {e.year.slice(0, 4)}
                  </div>
                </div>
                <div className="pt-1.5">
                  <div className="text-xs text-muted-foreground mb-0.5">{e.year}</div>
                  <h3 className="font-semibold text-foreground">{e.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </WikiPage>
  );
};

export default Timeline;
