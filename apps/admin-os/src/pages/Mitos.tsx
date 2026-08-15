import { motion } from "framer-motion";
import { Ghost, Moon, Skull, Flame, BookOpen, Mountain } from "lucide-react";

const legends = [
  {
    id: "llorona-minera",
    title: "La Llorona de la Mina",
    epoch: "Siglo XVIII",
    icon: Ghost,
    color: "from-electric/30 to-transparent",
    excerpt:
      "Cuentan los viejos mineros que en los túneles abandonados de la mina de Acosta, cuando la lámpara se apaga, se escucha el llanto de una mujer que perdió a su hijo en un derrumbe. Quien la sigue, no vuelve a ver la luz del sol.",
    moral: "Respeta los socavones: la montaña guarda memoria.",
  },
  {
    id: "carruaje-ingles",
    title: "El Carruaje Inglés",
    epoch: "1875",
    icon: Moon,
    color: "from-gold/30 to-transparent",
    excerpt:
      "En las noches de niebla espesa, vecinos del Panteón Inglés juran haber visto un carruaje negro tirado por caballos sin jinete que cruza la calle principal. Adentro, la silueta de un capataz británico cuenta monedas que nunca se acaban.",
    moral: "La codicia no se entierra: viaja con uno hasta la última estación.",
  },
  {
    id: "duende-veta",
    title: "El Duende de la Veta",
    epoch: "Tradición oral",
    icon: Flame,
    color: "from-copper/30 to-transparent",
    excerpt:
      "Un pequeño ser de barba blanca aparece a los mineros que trabajan solos. Si le ofreces un trago de aguardiente, te muestra la veta más rica. Si te burlas de él, la mina se te traga.",
    moral: "Antes de extraer, hay que ofrendar.",
  },
  {
    id: "novia-mineral",
    title: "La Novia de Mineral",
    epoch: "1902",
    icon: Skull,
    color: "from-teal/30 to-transparent",
    excerpt:
      "Esperando a su prometido inglés que partió a Pachuca y nunca volvió, una joven realmontense subió al cerro del Judío con su vestido de novia. Hoy, las parejas que suben al mirador escuchan un suspiro entre el viento.",
    moral: "El amor mal correspondido se queda en el paisaje.",
  },
  {
    id: "paste-fantasma",
    title: "El Paste Fantasma",
    epoch: "Cocina viva",
    icon: Flame,
    color: "from-gold/30 to-transparent",
    excerpt:
      "En la pastería más antigua del pueblo, cada noche aparece un paste recién horneado que nadie cocinó. Dicen que es la abuela inglesa que enseñó la receta original y todavía vigila la masa.",
    moral: "La tradición no se hereda: se aparece.",
  },
  {
    id: "campana-muda",
    title: "La Campana Muda",
    epoch: "Templo de la Asunción",
    icon: BookOpen,
    color: "from-platinum/30 to-transparent",
    excerpt:
      "Una de las campanas del templo no suena desde 1920. Cuentan que enmudeció el día que un minero murió rezando. Repica sola, dicen, cuando alguien va a perder a alguien en la mina.",
    moral: "El silencio también avisa.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
};

export default function Mitos() {
  return (
    <div className="min-h-screen">
      {/* Hero cinematográfico */}
      <section className="relative pt-32 pb-20 px-6 lg:px-12 overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, hsl(var(--electric) / 0.15), transparent 60%), radial-gradient(ellipse 60% 40% at 30% 60%, hsl(var(--gold) / 0.08), transparent 70%)",
          }}
        />
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,hsl(var(--gold)/0.06),transparent_40%)]"
        />

        <div className="mx-auto max-w-5xl text-center">
          <motion.div {...fadeUp} className="inline-flex items-center gap-2 rounded-full glass-card border border-border/30 px-4 py-2 mb-8">
            <Ghost className="h-3.5 w-3.5 text-electric" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-electric">
              Federación de Cultura y Memoria
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-bold tracking-tight leading-[1.05]"
          >
            Mitos y <span className="text-gradient-gold">Leyendas</span>
            <br />
            del <em className="not-italic text-electric/90">Mineral</em>
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ delay: 0.2 }}
            className="mt-6 text-base md:text-lg font-body text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Real del Monte se cuenta a sí mismo en la voz de sus abuelos, en el crujir de
            sus minas y en el viento del Panteón Inglés. Estas son las historias que la
            montaña no deja morir.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ delay: 0.3 }}
            className="mt-10 flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground"
          >
            <Mountain className="h-3 w-3 text-gold" />
            <span>Archivo vivo · Curaduría TAMV Online</span>
          </motion.div>
        </div>
      </section>

      {/* Grid editorial */}
      <section className="px-6 lg:px-12 pb-24">
        <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-2">
          {legends.map((l, i) => {
            const Icon = l.icon;
            return (
              <motion.article
                key={l.id}
                {...fadeUp}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-3xl glass-card border border-border/20 p-7 transition-all hover:border-gold/30 hover:shadow-elevated"
              >
                <div
                  aria-hidden
                  className={`absolute -top-20 -right-20 h-60 w-60 rounded-full bg-gradient-to-br ${l.color} blur-3xl opacity-60 group-hover:opacity-100 transition-opacity`}
                />
                <div className="relative">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background/60 border border-border/30 group-hover:border-gold/40 transition-colors">
                      <Icon className="h-5 w-5 text-gold" />
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
                      {l.epoch}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold leading-tight">
                    {l.title}
                  </h2>
                  <p className="mt-4 text-sm font-body text-muted-foreground leading-relaxed">
                    {l.excerpt}
                  </p>
                  <div className="mt-6 pt-5 border-t border-border/20">
                    <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-gold/80 mb-1.5">
                      Lo que enseña
                    </p>
                    <p className="text-[13px] font-body italic text-foreground/80">
                      &laquo; {l.moral} &raquo;
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Cierre editorial */}
        <motion.div
          {...fadeUp}
          className="mx-auto max-w-3xl mt-20 text-center rounded-3xl glass-gold p-10"
        >
          <BookOpen className="mx-auto h-8 w-8 text-gold mb-4" />
          <h3 className="text-2xl md:text-3xl font-display font-bold">
            ¿Conoces una leyenda que aún no contamos?
          </h3>
          <p className="mt-3 text-sm font-body text-muted-foreground max-w-xl mx-auto">
            Esta sección crece con la voz de la comunidad. Comparte tu historia en el
            módulo de Comunidad y nuestro equipo editorial la integrará al archivo.
          </p>
          <a
            href="/comunidad"
            className="mt-6 inline-flex items-center gap-2 rounded-xl gradient-gold px-5 py-3 text-[12px] font-body font-semibold text-primary-foreground shadow-gold hover:shadow-elevated transition-all"
          >
            Compartir mi leyenda
          </a>
        </motion.div>
      </section>
    </div>
  );
}
