import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import mineEntrance from "@/assets/mine-entrance.jpg";
import panteonIngles from "@/assets/panteon-ingles.jpg";
import miningEquipment from "@/assets/mining-equipment.jpg";
import mineTunnel from "@/assets/mine-tunnel.jpg";
import { ElegantPagination } from "@/components/ElegantPagination";

const TIMELINE = [
  { year: "Siglo XVI", event: "Comienza la explotación de vetas argentíferas en la región de Pachuca-Real del Monte." },
  { year: "1766", event: "Se registra una de las huelgas mineras más tempranas del continente en Real del Monte." },
  { year: "1824", event: "Llegan mineros de Cornwall y se consolida el intercambio tecnológico y cultural con Hidalgo." },
  { year: "S. XIX", event: "Se populariza el paste como alimento minero práctico y luego como identidad gastronómica local." },
  { year: "1906", event: "Declive de ciclos mineros tradicionales y transición paulatina hacia nueva economía regional." },
  { year: "2004", event: "Mineral del Monte es reconocido como Pueblo Mágico por su patrimonio histórico y turístico." },
  { year: "2017", event: "La Comarca Minera se integra al programa de Geoparques Mundiales de UNESCO." },
  { year: "Hoy", event: "El destino fusiona patrimonio industrial, turismo cultural, aventura de montaña y escapadas románticas." },
];

const PAGE_SIZE = 4;

export function HistorySection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const containerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  const totalPages = Math.ceil(TIMELINE.length / PAGE_SIZE);
  const pageItems = useMemo(
    () => TIMELINE.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [page],
  );

  return (
    <section id="historia" ref={containerRef} className="relative">
      <div className="relative h-[70vh] overflow-hidden">
        <motion.img
          style={{ y: imgY }}
          src={mineEntrance}
          alt="Mina de Acosta"
          className="absolute inset-0 h-[120%] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16 lg:p-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            ref={ref}
          >
            <p className="mb-4 font-body text-sm uppercase tracking-[0.3em] text-accent">⛏️ Patrimonio Minero</p>
            <h2 className="font-display text-4xl font-bold leading-[0.9] md:text-7xl">
              Bajo estas montañas,
              <br />
              <span className="text-accent">imperios</span> nacieron
            </h2>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-20 md:px-16 lg:px-24">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="col-span-2 h-[280px] overflow-hidden rounded-2xl"
            >
              <img src={mineTunnel} alt="Túnel de mina" className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="h-[200px] overflow-hidden rounded-2xl"
            >
              <img src={panteonIngles} alt="Panteón Inglés" className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="h-[200px] overflow-hidden rounded-2xl"
            >
              <img src={miningEquipment} alt="Equipo minero" className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
            </motion.div>
          </div>

          <div className="flex flex-col justify-center">
            <p className="mb-5 font-body text-lg leading-relaxed text-foreground/70">
              La historia de Real del Monte no es solo una línea de tiempo: es una red de oficios, migraciones,
              luchas laborales y tecnología extractiva que transformó a Hidalgo durante siglos.
            </p>
            <p className="mb-10 font-body text-base leading-relaxed text-foreground/70">
              Esta narrativa conecta el origen minero, la huella cornish, la dimensión obrera y la reconversión
              turística contemporánea para que el visitante entienda por qué el pueblo emociona más cuando se recorre
              con contexto histórico.
            </p>

            <div className="space-y-6">
              {pageItems.map((item, i) => (
                <motion.div
                  key={`${item.year}-${item.event}`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <span className="font-display text-lg font-bold text-accent">{item.year}</span>
                    <div className="mt-2 w-px flex-1 bg-border" />
                  </div>
                  <p className="pt-1 font-body text-sm leading-relaxed text-foreground/70 transition-colors group-hover:text-foreground">
                    {item.event}
                  </p>
                </motion.div>
              ))}
            </div>

            <ElegantPagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </div>
      </div>
    </section>
  );
}
