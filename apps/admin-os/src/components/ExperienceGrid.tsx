import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Pickaxe, Utensils, Mountain, Bed, Palette } from "lucide-react";
import mineEntrance from "@/assets/mine-entrance.jpg";
import pastesFood from "@/assets/pastes-food.jpg";
import sierraAdventure from "@/assets/sierra-adventure.jpg";
import hotelColonial from "@/assets/hotel-colonial.jpg";
import diaMuertos from "@/assets/dia-muertos.jpg";

const EXPERIENCES = [
  {
    id: "historia",
    title: "Historia Minera",
    subtitle: "500 años de plata",
    image: mineEntrance,
    icon: Pickaxe,
    href: "#historia",
    span: "col-span-2 row-span-2",
  },
  {
    id: "gastronomia",
    title: "Gastronomía",
    subtitle: "Pastes & tradición",
    image: pastesFood,
    icon: Utensils,
    href: "#gastronomia",
    span: "col-span-1 row-span-1",
  },
  {
    id: "aventura",
    title: "Aventura",
    subtitle: "Sierra salvaje",
    image: sierraAdventure,
    icon: Mountain,
    href: "#aventura",
    span: "col-span-1 row-span-1",
  },
  {
    id: "hospedaje",
    title: "Hospedaje",
    subtitle: "Refugios coloniales",
    image: hotelColonial,
    icon: Bed,
    href: "#hospedaje",
    span: "col-span-1 row-span-1",
  },
  {
    id: "cultura",
    title: "Cultura Viva",
    subtitle: "Tradiciones ancestrales",
    image: diaMuertos,
    icon: Palette,
    href: "#cultura",
    span: "col-span-1 row-span-1",
  },
];

interface ExperienceGridProps {
  onDichosClick?: () => void;
}

export function ExperienceGrid({ onDichosClick }: ExperienceGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="experiencias" ref={ref} className="py-24 px-6 md:px-16 lg:px-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <p className="text-sm tracking-[0.3em] uppercase text-accent font-body mb-4">
          Experiencias Inmersivas
        </p>
        <h2 className="text-4xl md:text-6xl font-display font-bold">
          Cinco mundos,
          <br />
          <span className="text-accent">una sierra</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-7xl mx-auto auto-rows-[200px] md:auto-rows-[240px]">
        {EXPERIENCES.map((exp, i) => (
          <motion.a
            key={exp.id}
            href={exp.href}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className={`${exp.span} relative rounded-2xl overflow-hidden group cursor-pointer`}
          >
            <img
              src={exp.image}
              alt={exp.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
            <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors duration-500" />

            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full glass-light flex items-center justify-center">
                  <exp.icon className="w-4 h-4 text-accent" />
                </div>
                <span className="text-xs text-accent font-body font-medium tracking-wider uppercase">
                  {exp.subtitle}
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-display font-bold group-hover:text-accent transition-colors">
                {exp.title}
              </h3>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
