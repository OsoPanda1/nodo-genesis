import { WikiPage } from "@/components/WikiPage";
import { Section, InfoCard } from "@/components/WikiElements";
import { Brain, Cpu, MessageSquare, Shield } from "lucide-react";

const IAAgentes = () => (
  <WikiPage
    title="IA & Agentes"
    subtitle="Isabella Villaseñor AI y el ecosistema de agentes inteligentes"
  >
    <Section title="Isabella AI™">
      <p className="text-muted-foreground leading-relaxed">
        <strong className="text-secondary">Isabella Villaseñor AI</strong> es la IA contextual y
        colaborativa del ecosistema TAMV. Actúa como orquestadora neural con propósito ético,
        integrando modelos avanzados para asistencia, tutorización, detección de amenazas y análisis
        civilizatorio.
      </p>
    </Section>

    <Section title="Capacidades">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard
          icon={Brain}
          title="IA Contextual"
          description="Comprensión del contexto civilizatorio y personal del usuario."
          variant="cyan"
        />
        <InfoCard
          icon={MessageSquare}
          title="Canal IA–IA"
          description="Comunicación entre agentes para coordinación de tareas complejas."
          variant="gold"
        />
        <InfoCard
          icon={Cpu}
          title="Onboarding Sensorial"
          description="Proceso de integración que adapta la experiencia al perfil del usuario."
          variant="cyan"
        />
        <InfoCard
          icon={Shield}
          title="Compliance Integrado"
          description="Alineación con AI Act, GDPR, ISO y NOM como parte del código."
          variant="gold"
        />
      </div>
    </Section>

    <Section title="Arquitectura de agentes">
      <p className="text-muted-foreground leading-relaxed">
        El ecosistema de agentes opera bajo un modelo jerárquico donde Isabella coordina agentes
        auxiliares especializados en dominios específicos: educación (UTAMV), seguridad (ANUBIS),
        economía (TAU) y experiencias inmersivas (DreamSpaces).
      </p>
    </Section>
  </WikiPage>
);

export default IAAgentes;
