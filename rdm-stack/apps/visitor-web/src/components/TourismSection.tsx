import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { MapPin, Clock, Zap } from "lucide-react";

import plazaImg from "@/assets/images/rdm-plaza.jpeg";
import calleImg from "@/assets/images/rdm-calle.jpeg";
import minaImg from "@/assets/images/rdm-mina.jpeg";
import iglesiaImg from "@/assets/images/rdm-iglesia.jpeg";
import gastroImg from "@/assets/images/gastronomia-pastes.jpg";
import heroImg from "@/assets/images/hero-realmont.jpg";

interface Place {
  name: string;
  category: string;
  time: string;
  energy: "Alta" | "Media" | "Baja";
  image: string;
  description: string;
}

const places: Place[] = [
  {
    name: "Mina de Acosta",
    category: "Historia",
    time: "2h",
    energy: "Alta",
    image: minaImg,
    description: "Desciende 400m al corazón de la montaña donde los ecos cornish aún resuenan.",
  },
  {
    name: "Plaza Principal",
    category: "Cultura",
    time: "1h",
    energy: "Baja",
    image: plazaImg,
    description:
      "Centro vibrante del pueblo con su icónica iglesia amarilla y jardines coloniales.",
  },
  {
    name: "Calles Coloniales",
    category: "Arquitectura",
    time: "1.5h",
    energy: "Media",
    image: calleImg,
    description: "Fachadas coloridas que narran cuatro siglos de historia mestiza.",
  },
  {
    name: "Parroquia de la Asunción",
    category: "Arquitectura",
    time: "45min",
    energy: "Baja",
    image: iglesiaImg,
    description: "Cantera labrada que desafía la niebla desde el siglo XVIII.",
  },
  {
    name: "Pasterías",
    category: "Gastronomía",
    time: "30min",
    energy: "Baja",
    image: gastroImg,
    description:
      "El paste original, herencia de los mineros ingleses, horneado con receta de 1850.",
  },
  {
    name: "Mirador Peña del Cuervo",
    category: "Naturaleza",
    time: "2.5h",
    energy: "Alta",
    image: heroImg,
    description: "Donde el bosque se abre y la vista abraza todo el valle.",
  },
];

const categories = ["Todos", "Historia", "Cultura", "Arquitectura", "Gastronomía", "Naturaleza"];

const energyColor = { Alta: "text-destructive", Media: "text-gold", Baja: "text-electric" };

const TourismSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeCategory, setActiveCategory] = useState("Todos");

  const filtered =
    activeCategory === "Todos" ? places : places.filter((p) => p.category === activeCategory);

  return (
    <section ref={ref} id="turismo" className="relative py-24 md:py-32">
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="text-center mb-12"
        >
          <span className="font-body text-[10px] tracking-[0.4em] uppercase text-gold/60">
            Descubre
          </span>
          <h2 className="font-display text-4xl md:text-6xl mt-4 tracking-tight">
            <span className="text-gradient-gold">Lugares Imperdibles</span>
          </h2>
          <p className="font-display text-lg text-platinum/50 italic mt-4 max-w-md mx-auto">
            Los atractivos más emblemáticos de Real del Monte
          </p>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center gap-2 mb-12 flex-wrap"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full font-body text-[11px] tracking-wider uppercase transition-all duration-300 ${
                activeCategory === cat
                  ? "btn-premium !px-5 !py-2"
                  : "glass text-muted-foreground hover:text-gold hover:border-gold/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Place cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((place, i) => (
            <motion.div
              key={place.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1 * i }}
              className="glass-card rounded-xl overflow-hidden glow-card group cursor-pointer"
            >
              <div className="img-zoom aspect-[4/3] relative">
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 glass rounded-full px-3 py-1">
                  <span className="font-body text-[9px] tracking-[0.2em] uppercase text-gold">
                    {place.category}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-display text-xl text-foreground mb-2 group-hover:text-gradient-gold transition-colors">
                  {place.name}
                </h3>
                <p className="font-body text-xs text-muted-foreground leading-relaxed mb-4">
                  {place.description}
                </p>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-gold/60" />
                    <span className="font-body text-[10px] text-muted-foreground">
                      {place.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className={`w-3 h-3 ${energyColor[place.energy]}`} />
                    <span className="font-body text-[10px] text-muted-foreground">
                      {place.energy}
                    </span>
                  </div>
                  <button className="ml-auto flex items-center gap-1 font-body text-[10px] tracking-wider uppercase text-gold/70 hover:text-gold transition-colors">
                    <MapPin className="w-3 h-3" />
                    Ver en Mapa
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TourismSection;
