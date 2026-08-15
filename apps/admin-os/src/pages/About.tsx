import { motion } from "framer-motion";
import { Mountain, Cpu, Globe2, Shield, Sparkles, GitBranch, Building2, Users, ExternalLink, Calendar, Award, Github } from "lucide-react";


const PRINCIPLES = [
  { icon: Users, title: "Antropocentrismo técnico", text: "La tecnología es un medio al servicio de la comunidad, nunca un fin en sí misma." },
  { icon: Mountain, title: "Respeto al patrimonio", text: "El legado minero, histórico y cultural se integra orgánicamente en la capa digital." },
  { icon: Shield, title: "Soberanía y ética de datos", text: "Datos agregados y anonimizados. Rechazo a la vigilancia invasiva." },
  { icon: GitBranch, title: "Independencia del proveedor", text: "Diseño modular y desacoplado. Sin lock-in tecnológico." },
  { icon: Globe2, title: "Apertura y colaboración", text: "Trabajo con actores públicos, privados y sociales bajo cooperación abierta." },
  { icon: Sparkles, title: "Innovación con identidad", text: "Lujo minimalista y funcionalidad extrema, anclados en la cultura local." },
];

const LAYERS = [
  { n: "01", title: "Capa de datos urbanos y turísticos", text: "Ontología de lugares, rutas, POIs, comercios, servicios, eventos y atributos contextuales." },
  { n: "02", title: "Capa de servicios y APIs", text: "Motor del sistema. Lógica de negocio expuesta a apps externas y a Realito / Isabella AI mediante contratos documentados." },
  { n: "03", title: "Capa de experiencias", text: "Web, móvil, XR e instalaciones interactivas. Estética de lujo minimalista, complejidad oculta." },
  { n: "04", title: "Capa de analítica prescriptiva", text: "Métricas agregadas de impacto, comportamiento y uso del destino, siempre anonimizadas." },
];

const OBJECTIVES = [
  "Unificación de la capa de servicios en una única fuente de verdad lógica.",
  "Optimización del ciclo de vida del visitante: inspiración → planificación → visita → recuerdo.",
  "Dinamización económica conectando flujo turístico con el tejido empresarial local.",
  "Inteligencia de ciudad y destino con indicadores agregados anonimizados.",
  "Escalabilidad y replicabilidad a otros municipios sin reescribir el núcleo.",
];

export default function About() {
  return (
    
      <div className="min-h-screen bg-background text-foreground">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
          <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-xs uppercase tracking-[0.4em] text-accent mb-6">RDM Digital OS · Nodo Cero</p>
              <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] mb-6">
                Sistema Operativo Urbano<br />
                <span className="text-accent">para un Pueblo Mágico</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
                RDM Digital es un Smart City OS diseñado para articular el territorio de Real del Monte como
                Destino Turístico Inteligente y ciudad conectada. No es una app: es la capa de abstracción
                que convierte el entorno físico en infraestructura digital interoperable.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Misión / Visión */}
        <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="border border-border/50 rounded-2xl p-8 bg-card/40 backdrop-blur"
          >
            <Building2 className="w-8 h-8 text-accent mb-4" />
            <h2 className="font-display text-3xl mb-4">Misión</h2>
            <p className="text-muted-foreground leading-relaxed">
              Impulsar la evolución de Real del Monte hacia un modelo de ciudad y destino digitalmente soberano,
              donde la tecnología esté subordinada a la identidad cultural y a la economía local. Co-creamos
              experiencias inclusivas, accesibles y sostenibles sobre arquitecturas modulares y estándares abiertos.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="border border-border/50 rounded-2xl p-8 bg-card/40 backdrop-blur"
          >
            <Globe2 className="w-8 h-8 text-accent mb-4" />
            <h2 className="font-display text-3xl mb-4">Visión</h2>
            <p className="text-muted-foreground leading-relaxed">
              Posicionar a Real del Monte como gemelo digital de referencia en innovación turística regional,
              alineado con los ejes DTI: gobernanza, innovación, tecnología, accesibilidad y sostenibilidad.
              Un territorio donde rutas inmersivas, narrativa histórica y servicios urbanos convergen en una experiencia fluida.
            </p>
          </motion.div>
        </section>

        {/* Principios */}
        <section className="bg-muted/20 border-y border-border/40">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <p className="text-xs uppercase tracking-[0.4em] text-accent mb-3">Valores rectores</p>
            <h2 className="font-display text-4xl md:text-5xl mb-12">Principios soberanos</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRINCIPLES.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="p-6 rounded-xl border border-border/40 bg-background/60"
                >
                  <p.icon className="w-6 h-6 text-accent mb-3" />
                  <h3 className="font-display text-xl mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Objetivos */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <p className="text-xs uppercase tracking-[0.4em] text-accent mb-3">Estrategia ejecutiva</p>
          <h2 className="font-display text-4xl md:text-5xl mb-10">Cinco objetivos estratégicos</h2>
          <div className="space-y-3">
            {OBJECTIVES.map((o, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <span className="font-display text-2xl text-accent shrink-0 w-12">0{i + 1}</span>
                <p className="text-base md:text-lg text-foreground/90 leading-relaxed pt-0.5">{o}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Arquitectura 4 capas */}
        <section className="bg-muted/20 border-y border-border/40">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <p className="text-xs uppercase tracking-[0.4em] text-accent mb-3">Arquitectura funcional</p>
            <h2 className="font-display text-4xl md:text-5xl mb-12">Cuatro capas operativas</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {LAYERS.map((l, i) => (
                <motion.div
                  key={l.n}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="p-8 rounded-2xl border border-border/40 bg-background/60"
                >
                  <div className="flex items-baseline gap-4 mb-3">
                    <span className="font-display text-5xl text-accent/30">{l.n}</span>
                    <h3 className="font-display text-2xl">{l.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{l.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Sinergia TAMV */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <p className="text-xs uppercase tracking-[0.4em] text-accent mb-3">Sinergia con TAMV Online</p>
          <h2 className="font-display text-4xl md:text-5xl mb-6">Realito · Isabella Villaseñor AI</h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl mb-6">
            RDM Digital se integra con TAMV Online Network para dotar al destino de una interfaz de Lenguaje Natural (NUI)
            avanzada. Realito / Isabella Villaseñor AI actúa como front-end conversacional que consulta de forma segura las
            APIs de RDM Digital para entregar recomendaciones contextuales: qué ver según el tiempo disponible, por dónde
            caminar evitando saturación, qué experiencias culturales y gastronómicas están activas en ese momento.
          </p>
          <p className="text-sm text-muted-foreground/80 italic">
            Todo ello sin exponer detalles internos de la infraestructura, manteniendo separadas las capas de experiencia,
            lógica de negocio y seguridad.
          </p>
        </section>

        {/* Liderazgo */}
        <section className="bg-gradient-to-b from-background to-muted/30 border-t border-border/40">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <p className="text-xs uppercase tracking-[0.4em] text-accent mb-3">Liderazgo y capital intelectual</p>
            <h2 className="font-display text-4xl md:text-5xl mb-8">El legado del fundador</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="p-6 rounded-xl border border-border/40 bg-card/40">
                <p className="font-display text-5xl text-accent mb-2">21,600+</p>
                <p className="text-sm text-muted-foreground">horas de I+D autodidacta · ~2.5 años de dedicación intensiva</p>
              </div>
              <div className="p-6 rounded-xl border border-border/40 bg-card/40">
                <p className="font-display text-5xl text-accent mb-2">104</p>
                <p className="text-sm text-muted-foreground">repositorios federados que componen el ecosistema TAMV</p>
              </div>
              <div className="p-6 rounded-xl border border-border/40 bg-card/40">
                <p className="font-display text-5xl text-accent mb-2">7</p>
                <p className="text-sm text-muted-foreground">capas de la arquitectura federada civilizatoria</p>
              </div>
            </div>
            <div className="prose prose-invert max-w-none text-muted-foreground">
              <p className="text-base leading-relaxed">
                <strong className="text-foreground">Edwin Oswaldo Castillo Trejo</strong> (Anubis Villaseñor),
                CEO y fundador de TAMV Online Network, es el arquitecto de las líneas TAMV MD-X4, MD-X5 e
                Isabella Villaseñor AI. Registro <strong className="text-foreground">ORCID 0009-0008-5050-1539</strong>.
                Su objetivo declarado es que el conocimiento acumulado se convierta en la base de una nueva
                academia tecnológica digital en México.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-6xl mx-auto px-6 py-24 text-center">
          <Cpu className="w-12 h-12 text-accent mx-auto mb-6" />
          <h2 className="font-display text-4xl md:text-5xl mb-4">Punto de inflexión</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            RDM Digital no es solo un proyecto tecnológico: es la manera en que Real del Monte
            se piensa, se gestiona y se presenta al mundo en la era digital.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/" className="px-6 py-3 rounded-lg bg-accent text-accent-foreground font-medium hover:opacity-90 transition">
              Explorar el portal
            </a>
            <a href="/repos" className="px-6 py-3 rounded-lg border border-border hover:bg-muted/30 transition">
              Ver federación de repositorios
            </a>
          </div>
        </section>
      </div>
    
  );
}
