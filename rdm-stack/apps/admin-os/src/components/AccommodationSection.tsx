import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Star, Wifi, Flame, Mountain as MountainIcon } from "lucide-react";
import hotelColonial from "@/assets/hotel-colonial.jpg";
import courtyardColonial from "@/assets/courtyard-colonial.jpg";

const HOTELS = [
  {
    name: "Hacienda de la Sierra",
    type: "Hotel Boutique",
    rating: 4.9,
    price: "Desde $1,800/noche",
    features: ["Chimenea", "Vista montaña", "Spa"],
    image: hotelColonial,
  },
  {
    name: "Patio de las Flores",
    type: "Casa Colonial",
    rating: 4.7,
    price: "Desde $1,200/noche",
    features: ["Jardín interior", "Cocina", "Wi-Fi"],
    image: courtyardColonial,
  },
];

export function AccommodationSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <section id="hospedaje" ref={ref} className="relative">
      <div className="relative h-[50vh] overflow-hidden">
        <motion.img style={{ y: imgY }} src={hotelColonial} alt="Hotel" className="absolute inset-0 w-full h-[120%] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16 lg:p-24">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-sm tracking-[0.3em] uppercase text-accent font-body mb-4">🏨 Hospedaje</p>
            <h2 className="text-4xl md:text-7xl font-display font-bold leading-[0.9]">
              Refugios de <span className="text-accent">montaña</span>
            </h2>
          </motion.div>
        </div>
      </div>

      <div className="px-6 md:px-16 lg:px-24 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {HOTELS.map((hotel, i) => (
            <motion.div
              key={hotel.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="group rounded-2xl overflow-hidden bg-card border border-border hover:border-accent/30 transition-all"
            >
              <div className="h-[280px] overflow-hidden">
                <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-display font-bold text-xl group-hover:text-accent transition-colors">{hotel.name}</h4>
                    <p className="text-sm text-muted-foreground font-body">{hotel.type}</p>
                  </div>
                  <div className="flex items-center gap-1 text-accent">
                    <Star className="w-4 h-4 fill-accent" />
                    <span className="font-body font-semibold text-sm">{hotel.rating}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 my-3">
                  {hotel.features.map(f => (
                    <span key={f} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground font-body">{f}</span>
                  ))}
                </div>
                <p className="text-accent font-display font-semibold">{hotel.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
