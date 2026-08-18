import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import diaMuertos from "@/assets/dia-muertos.jpg";
import artisanWorkshop from "@/assets/artisan-workshop.jpg";
import churchAsuncion from "@/assets/church-asuncion.jpg";
import plazaNight from "@/assets/plaza-night.jpg";
import streetsColonial from "@/assets/streets-colonial.jpg";
import rooftopsSunrise from "@/assets/rooftops-sunrise.jpg";

export function CultureSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  const GALLERY = [
    { src: churchAsuncion, alt: "Iglesia de la Asunción", span: "col-span-2 row-span-2" },
    { src: artisanWorkshop, alt: "Taller artesanal", span: "col-span-1 row-span-1" },
    { src: streetsColonial, alt: "Calles coloniales", span: "col-span-1 row-span-1" },
    { src: plazaNight, alt: "Plaza de noche", span: "col-span-1 row-span-1" },
    { src: rooftopsSunrise, alt: "Techos al amanecer", span: "col-span-1 row-span-1" },
    { src: diaMuertos, alt: "Día de Muertos", span: "col-span-2 row-span-1" },
  ];

  return (
    <section id="cultura" ref={ref} className="relative">
      <div className="relative h-[50vh] overflow-hidden">
        <motion.img style={{ y: imgY }} src={plazaNight} alt="Plaza" className="absolute inset-0 w-full h-[120%] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16 lg:p-24">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-sm tracking-[0.3em] uppercase text-accent font-body mb-4">🎭 Cultura Viva</p>
            <h2 className="text-4xl md:text-7xl font-display font-bold leading-[0.9]">
              Cada calle, una <span className="text-accent">obra de arte</span>
            </h2>
          </motion.div>
        </div>
      </div>

      <div className="px-6 md:px-16 lg:px-24 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[180px] md:auto-rows-[220px]">
          {GALLERY.map((img, i) => (
            <motion.div
              key={img.alt}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`${img.span} rounded-2xl overflow-hidden group cursor-pointer relative`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition-colors duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs font-body font-medium text-foreground">{img.alt}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center max-w-2xl mx-auto"
        >
          <p className="text-lg text-foreground/70 font-body leading-relaxed italic font-display mb-4">
            "Real del Monte es Pueblo Mágico por derecho propio. Su mezcla de herencia
            británica y raíces mexicanas crea algo irrepetible — cada calle empedrada,
            cada fachada colorida, cada tradición preservada es un acto de resistencia cultural."
          </p>
          <p className="text-sm text-foreground/70 font-body leading-relaxed">
            Desde el Panteón Inglés hasta los talleres locales, la experiencia cultural se vive
            en capas: arquitectura, memoria obrera, cocina migrante, relatos comunitarios y
            festividades que transforman al visitante en testigo de una identidad profundamente viva.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
