import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ChevronDown, MapPin, Mountain } from "lucide-react";
import heroAerial from "@/assets/hero-aerial.jpg";
import cinematicHero from "@/assets/rdm-hero-cinematic.png";
import bandcampHeader from "@/assets/rdm-header-bandcamp.jpg";

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section ref={ref} id="inicio" className="relative h-[100vh] overflow-hidden">
      {/* Parallax background */}
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img
          src={heroAerial}
          alt="Vista aérea de Real del Monte"
          className="h-full w-full object-cover"
          loading="eager"
        />
        <img
          src={cinematicHero}
          alt="Composición visual de Real del Monte"
          className="absolute inset-0 h-full w-full object-cover opacity-45 mix-blend-screen"
          loading="eager"
        />
        <img
          src={bandcampHeader}
          alt="Textura territorial de Real del Monte"
          className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-soft-light"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/35 via-background/20 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/65 via-transparent to-background/35" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 h-full flex flex-col justify-end pb-24 px-6 md:px-16 lg:px-24"
      >
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-10 h-10 rounded-full bg-accent/20 backdrop-blur-sm flex items-center justify-center border border-accent/30">
              <Mountain className="w-5 h-5 text-accent" />
            </div>
            <span className="text-sm tracking-[0.3em] uppercase text-accent font-body font-medium">
              Pueblo Mágico • Hidalgo, México
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-[0.9] mb-6"
          >
            Descubre la
            <br />
            <span className="text-accent">magia</span> que
            <br />
            vive en la sierra
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-lg md:text-xl text-foreground/70 max-w-xl font-body leading-relaxed mb-8"
          >
            A 2,700 metros sobre el nivel del mar, donde la historia minera británica
            se fusiona con la calidez mexicana. Una experiencia que no existe en
            ningún otro lugar del mundo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="flex flex-wrap gap-4"
          >
            <a
              href="#experiencias"
              className="group inline-flex items-center gap-3 bg-accent text-accent-foreground px-8 py-4 rounded-full font-body font-semibold text-sm tracking-wide hover:bg-accent/90 transition-all hover:scale-105"
            >
              Explorar Experiencias
              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </a>
            <a
              href="#historia"
              className="inline-flex items-center gap-3 glass-light px-8 py-4 rounded-full font-body font-medium text-sm tracking-wide text-foreground/80 hover:text-foreground transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Nuestra Historia
            </a>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute bottom-8 right-6 md:right-16 lg:right-24 flex gap-8"
        >
          {[
            { value: "500+", label: "Años de historia" },
            { value: "2,700m", label: "Altitud" },
            { value: "14°C", label: "Temperatura media" },
          ].map((stat) => (
            <div key={stat.label} className="text-right">
              <p className="text-2xl md:text-3xl font-display font-bold text-accent">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <ChevronDown className="w-6 h-6 text-accent/50" />
      </motion.div>
    </section>
  );
}
