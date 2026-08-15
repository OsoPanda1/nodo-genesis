import { WikiPage } from "@/components/WikiPage";
import { Section } from "@/components/WikiElements";
import { useParams } from "react-router-dom";
import { Check, X } from "lucide-react";

const domainData: Record<
  string,
  { title: string; tipo: string; proposito: string; funciones: string[]; integraciones: string[] }
> = {
  "id-nvida": {
    title: "ID‑NVIDA",
    tipo: "Dominio de Identidad",
    proposito:
      "Identidad civilizatoria soberana con control total del usuario sobre su huella digital.",
    funciones: [
      "Gestión de identidad descentralizada (DID)",
      "Control de datos personales por el usuario",
      "Verificación sin exposición (Zero‑Knowledge Proofs)",
      "Onboarding sensorial seguro",
    ],
    integraciones: [
      "ANUBIS (seguridad)",
      "Economía TAMV (trazabilidad)",
      "Isabella AI (contextualización)",
    ],
  },
  utamv: {
    title: "UTAMV",
    tipo: "Dominio Educativo",
    proposito:
      "Universidad/escuela inmersiva para formación profunda en tecnología y competencias clave.",
    funciones: [
      "Cursos inmersivos en entornos XR",
      "Evaluación adaptativa con IA",
      "Certificaciones trazables en blockchain",
      "Laboratorios virtuales y gemelos digitales",
    ],
    integraciones: [
      "Metaverso MD‑X4 (entornos)",
      "Isabella AI (tutorización)",
      "ID‑NVIDA (certificación)",
    ],
  },
  metaverso: {
    title: "Metaverso MD‑X4",
    tipo: "Dominio de Experiencias",
    proposito: "Capas de espacios XR, gemelos digitales y experiencias AV inmersivas conscientes.",
    funciones: [
      "DreamSpaces: entornos sensoriales inmersivos",
      "Gemelos digitales de infraestructura",
      "Interacción 4D con realidad aumentada",
      "Espacios colaborativos multiusuario",
    ],
    integraciones: [
      "UTAMV (educación)",
      "Economía TAMV (intercambio)",
      "ANUBIS (seguridad perimetral)",
    ],
  },
  economia: {
    title: "Economía TAMV",
    tipo: "Dominio Económico",
    proposito: "Modelos de intercambio y valor con enfoque ético, trazabilidad y reciprocidad.",
    funciones: [
      "Tokens de valor ético (TAU/TCEP)",
      "Trazabilidad de transacciones",
      "Modelos de reciprocidad Kórima",
      "Compliance multinorma integrado",
    ],
    integraciones: ["EOCT Blockchain (ledger)", "ID‑NVIDA (identidad)", "Isabella AI (análisis)"],
  },
  seguridad: {
    title: "Seguridad — Guardianías",
    tipo: "Guardianía",
    proposito: "Protección integral mediante ANUBIS, HORUS, TENOCHTITLAN y módulos Zero‑Trust.",
    funciones: [
      "ANUBIS: honeypots y defensa proactiva",
      "HORUS: monitoreo multi-sensorial",
      "TENOCHTITLAN: resiliencia de infraestructura",
      "Zero‑Trust cultural integrado al código",
    ],
    integraciones: [
      "Todos los dominios (protección transversal)",
      "Isabella AI (detección de amenazas)",
    ],
  },
};

const membershipLevels = [
  { name: "Free", price: "0 MXN/mes", focus: "Exploradores, estudiantes, curiosos" },
  { name: "Premium", price: "~7–15 USD/mes", focus: "Profesionales individuales, microempresas" },
  { name: "Devs", price: "~25–50 USD/mes", focus: "Desarrolladores, equipos de TI, labs" },
  { name: "Advance", price: "~250–500 USD/mes", focus: "Instituciones medianas, universidades" },
  { name: "Enterprise", price: "Contrato anual", focus: "Gobiernos, grandes empresas, alianzas" },
];

const accessMatrix = [
  {
    feature: "Lectura completa de la wiki",
    free: true,
    premium: true,
    devs: true,
    advance: true,
    enterprise: true,
  },
  {
    feature: "Isabella IA básica",
    free: true,
    premium: true,
    devs: true,
    advance: true,
    enterprise: true,
  },
  {
    feature: "Dashboard general (solo lectura)",
    free: false,
    premium: true,
    devs: true,
    advance: true,
    enterprise: true,
  },
  {
    feature: "Casos de uso completos",
    free: false,
    premium: true,
    devs: true,
    advance: true,
    enterprise: true,
  },
  {
    feature: "Kit APIs (read-only docs)",
    free: false,
    premium: true,
    devs: true,
    advance: true,
    enterprise: true,
  },
  {
    feature: "Kit APIs (sandbox técnico)",
    free: false,
    premium: false,
    devs: true,
    advance: true,
    enterprise: true,
  },
  {
    feature: "Acceso a NOA‑TAMV (lectura)",
    free: false,
    premium: false,
    devs: true,
    advance: true,
    enterprise: true,
  },
  {
    feature: "Acceso a NOA‑TAMV (operación)",
    free: false,
    premium: false,
    devs: false,
    advance: true,
    enterprise: true,
  },
  {
    feature: "Social Core (comunidad/gov)",
    free: false,
    premium: false,
    devs: true,
    advance: true,
    enterprise: true,
  },
  {
    feature: "Despliegues federados guiados",
    free: false,
    premium: false,
    devs: false,
    advance: true,
    enterprise: true,
  },
  {
    feature: "Despliegues federados llave en mano",
    free: false,
    premium: false,
    devs: false,
    advance: false,
    enterprise: true,
  },
];

const AccessIcon = ({ allowed }: { allowed: boolean }) =>
  allowed ? (
    <Check className="h-4 w-4 text-green-500 mx-auto" />
  ) : (
    <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
  );

const DomainPage = () => {
  const { slug } = useParams();
  const data = domainData[slug || ""];

  if (!data) {
    return (
      <WikiPage title="Dominio no encontrado">
        <p className="text-muted-foreground">Este dominio aún no está documentado.</p>
      </WikiPage>
    );
  }

  return (
    <WikiPage title={data.title} subtitle={data.tipo}>
      <Section title="Propósito">
        <p className="text-muted-foreground leading-relaxed">{data.proposito}</p>
      </Section>

      <Section title="Funciones clave">
        <ul className="space-y-2">
          {data.funciones.map((f) => (
            <li key={f} className="flex gap-3 items-start">
              <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
              <span className="text-muted-foreground">{f}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Integraciones">
        <div className="flex flex-wrap gap-2">
          {data.integraciones.map((i) => (
            <span
              key={i}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted/30 text-muted-foreground"
            >
              {i}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Estado">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          <span className="text-sm text-primary font-medium">En desarrollo activo</span>
        </div>
      </Section>

      {/* Membership section only for Economía */}
      {slug === "economia" && (
        <>
          <Section title="Modelos de membresía y niveles de acceso">
            <p className="text-muted-foreground leading-relaxed mb-4">
              TAMV opera con un modelo de membresías escalonado que permite desde la exploración
              libre hasta despliegues federados completos. Cada nivel desbloquea acceso progresivo a
              dominios, APIs, herramientas y gobernanza del ecosistema.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
              {membershipLevels.map((level) => (
                <div
                  key={level.name}
                  className="rounded-lg border border-border/50 bg-card/60 p-4 text-center"
                >
                  <h4 className="font-bold text-foreground text-lg">{level.name}</h4>
                  <p className="text-primary text-sm font-semibold mt-1">{level.price}</p>
                  <p className="text-xs text-muted-foreground mt-2">{level.focus}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Tabla de accesos por nivel">
            <div className="rounded-lg border border-border/50 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b border-border/50">
                    <th className="text-left px-3 py-2.5 text-foreground font-medium text-xs">
                      Dominio / Función
                    </th>
                    {membershipLevels.map((l) => (
                      <th
                        key={l.name}
                        className="text-center px-2 py-2.5 text-foreground font-medium text-xs"
                      >
                        {l.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {accessMatrix.map((row) => (
                    <tr key={row.feature} className="border-b border-border/30 hover:bg-muted/10">
                      <td className="px-3 py-2 text-muted-foreground text-xs">{row.feature}</td>
                      <td className="px-2 py-2">
                        <AccessIcon allowed={row.free} />
                      </td>
                      <td className="px-2 py-2">
                        <AccessIcon allowed={row.premium} />
                      </td>
                      <td className="px-2 py-2">
                        <AccessIcon allowed={row.devs} />
                      </td>
                      <td className="px-2 py-2">
                        <AccessIcon allowed={row.advance} />
                      </td>
                      <td className="px-2 py-2">
                        <AccessIcon allowed={row.enterprise} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Modelo económico">
            <div className="space-y-3">
              {[
                {
                  tier: "Free — 0 MXN/mes",
                  desc: "Acceso pedagógico y exploratorio. Lectura completa de la wiki, Isabella básica, casos de uso públicos. Puerta de entrada educativa.",
                },
                {
                  tier: "Premium — ~7–15 USD/mes",
                  desc: "Usuarios individuales y microempresas. Dashboards básicos, contenidos ampliados, módulos introductorios de UTAMV, reportes.",
                },
                {
                  tier: "Devs — ~25–50 USD/mes",
                  desc: "Acceso técnico intensivo. Kit de APIs completo con sandbox, documentación avanzada, ejemplos NOA‑TAMV, Social Core.",
                },
                {
                  tier: "Advance — ~250–500 USD/mes",
                  desc: "Instituciones medianas y universidades. Monitoreo avanzado, integración parcial con NOA y Social Core, configuración de nodos, soporte prioritario.",
                },
                {
                  tier: "Enterprise — Contrato anual (a negociar)",
                  desc: "Ecosistemas multi-nodo, despliegues federados llave en mano, gobernanza compartida, integración con infra propia, SLA dedicado.",
                },
              ].map((t) => (
                <div key={t.tier} className="rounded-lg border border-border/50 bg-card/50 p-4">
                  <h4 className="font-semibold text-foreground text-sm">{t.tier}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}
    </WikiPage>
  );
};

export default DomainPage;
