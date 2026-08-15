import { motion } from "framer-motion";
import { Sparkles, Target, MapPinned, ShieldCheck } from "lucide-react";
import { SovereignPageShell } from "@/components/SovereignPageShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  BUSINESS_CAPACITY_TARGET,
  INITIAL_COMMERCIAL_BUSINESSES,
  MAP_INTEGRATION_PHASES,
  RDM_BUSINESS_CATEGORIES,
} from "@/lib/business-catalog";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const activeBusinesses = INITIAL_COMMERCIAL_BUSINESSES.filter((business) => business.status === "active").length;
const plannedBusinesses = BUSINESS_CAPACITY_TARGET - INITIAL_COMMERCIAL_BUSINESSES.length;
const coveragePercent = Math.round((INITIAL_COMMERCIAL_BUSINESSES.length / BUSINESS_CAPACITY_TARGET) * 100);

const CATALOG_PRIORITY_SEGMENTS = [
  {
    id: "segment-1",
    title: "Curaduría de categorías",
    subtitle: "Estructura visual de alto contexto",
    icon: Sparkles,
    description:
      "Cada rubro comercial está normalizado para simplificar onboarding, filtros futuros y expansión de taxonomías sin romper la experiencia del usuario.",
    points: [
      "Identificador técnico por categoría para integraciones API.",
      "Descripciones pensadas para UX editorial y SEO semántico.",
      "Iconografía diferenciada para reconocimiento inmediato.",
    ],
  },
  {
    id: "segment-2",
    title: "Cobertura territorial",
    subtitle: "Lectura operativa para despliegue comercial",
    icon: MapPinned,
    description:
      "La capa de catálogo está preparada para vincularse con mapa dinámico, densidad por cuadrantes y asignación de campañas geolocalizadas.",
    points: [
      "Base actual conectada a coordenadas por comercio.",
      "Escalable a filtros por zona, estado y demanda.",
      "Lista para sincronización con rutas turísticas inteligentes.",
    ],
  },
  {
    id: "segment-3",
    title: "Gobierno y calidad de datos",
    subtitle: "Confiabilidad para operación pública-privada",
    icon: ShieldCheck,
    description:
      "El diseño modular permite incorporar validaciones de cumplimiento, estados de revisión y trazabilidad de cambios para gobernanza digital.",
    points: [
      "Estructura lista para score de calidad por negocio.",
      "Versionamiento funcional para futuras auditorías.",
      "Preparado para flujos de aprobación multi-actor.",
    ],
  },
] as const;

const Catalogo = () => {
  return (
    <SovereignPageShell
      eyebrow="RDM Digital Commerce"
      title="Catálogo de Comercios RDM Digital"
      description="Directorio inteligente por categorías con experiencia inmersiva, visualización estructurada y base técnica para analítica de crecimiento comercial."
      bullets={[
        "Arquitectura modular para crecimiento por fases y nuevas categorías.",
        "Navegación avanzada con bloques desplegables tipo acordeón.",
        "Interfaz elegante con microanimaciones para percepción premium.",
      ]}
    >
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-background via-primary/5 to-background p-6 md:p-8 mb-6">
        <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-60 w-60 rounded-full bg-accent/20 blur-3xl" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative grid gap-4 md:grid-cols-4"
        >
          <motion.div variants={staggerItem}>
            <Card className="glass border-primary/25 h-full">
              <CardContent className="p-5">
                <p className="text-xs text-foreground/65 uppercase tracking-wider">Categorías</p>
                <p className="mt-2 text-3xl font-semibold">{RDM_BUSINESS_CATEGORIES.length}</p>
                <p className="text-xs text-foreground/65 mt-1">Segmentación activa</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="glass border-primary/25 h-full">
              <CardContent className="p-5">
                <p className="text-xs text-foreground/65 uppercase tracking-wider">Comercios base</p>
                <p className="mt-2 text-3xl font-semibold">{INITIAL_COMMERCIAL_BUSINESSES.length}</p>
                <p className="text-xs text-foreground/65 mt-1">Dataset inicial</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="glass border-primary/25 h-full">
              <CardContent className="p-5">
                <p className="text-xs text-foreground/65 uppercase tracking-wider">Activos</p>
                <p className="mt-2 text-3xl font-semibold">{activeBusinesses}</p>
                <p className="text-xs text-foreground/65 mt-1">Listos para difusión</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="glass border-primary/25 h-full">
              <CardContent className="p-5">
                <p className="text-xs text-foreground/65 uppercase tracking-wider">Meta fase</p>
                <p className="mt-2 text-3xl font-semibold">{BUSINESS_CAPACITY_TARGET}</p>
                <p className="text-xs text-foreground/65 mt-1">{plannedBusinesses} pendientes</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <div className="relative mt-5 rounded-xl border border-border/50 bg-background/50 px-4 py-3">
          <div className="flex items-center justify-between gap-3 text-xs md:text-sm">
            <span className="text-foreground/70">Cobertura actual del catálogo</span>
            <span className="font-semibold">{coveragePercent}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${coveragePercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-accent"
            />
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-5 mb-6">
        <Card className="glass border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl md:text-2xl">Catálogo por categorías</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {RDM_BUSINESS_CATEGORIES.map((category) => (
                <AccordionItem key={category.id} value={category.id} className="border-border/40">
                  <AccordionTrigger className="text-left hover:no-underline py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="border-primary/35 text-primary">{category.id}</Badge>
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-semibold">{category.name}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-border/40 bg-background/70 p-4"
                    >
                      <p className="text-sm text-foreground/80 leading-relaxed">{category.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-secondary/70">Preparada para onboarding</Badge>
                        <Badge variant="secondary" className="bg-secondary/70">Filtro inteligente</Badge>
                        <Badge variant="secondary" className="bg-secondary/70">Escalable por zona</Badge>
                      </div>
                    </motion.div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card className="glass border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Hoja de ruta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MAP_INTEGRATION_PHASES.map((phase, index) => (
              <motion.div
                key={phase}
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-xl border border-border/50 bg-background/50 p-3"
              >
                <p className="text-sm text-foreground/85">{phase}</p>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        {CATALOG_PRIORITY_SEGMENTS.map((segment, index) => {
          const Icon = segment.icon;
          return (
            <motion.div
              key={segment.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass border-border/60 h-full hover:border-primary/40 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-foreground/60">{segment.subtitle}</p>
                      <CardTitle className="text-lg mt-1">{segment.title}</CardTitle>
                    </div>
                    <div className="rounded-lg border border-primary/30 bg-primary/10 p-2">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/75 leading-relaxed">{segment.description}</p>
                  <ul className="mt-3 space-y-1.5 text-xs text-foreground/70">
                    {segment.points.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/80" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </section>
    </SovereignPageShell>
  );
};

export default Catalogo;
