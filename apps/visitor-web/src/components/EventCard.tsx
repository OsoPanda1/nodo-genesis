import { motion } from "framer-motion";
import { Calendar, MapPin, Clock } from "lucide-react";

interface EventCardProps {
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image?: string;
  index?: number;
}

const EventCard = ({
  name,
  date,
  time,
  location,
  description,
  image,
  index = 0,
}: EventCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group relative overflow-hidden rounded-2xl glass shadow-card hover:shadow-elevated transition-all duration-400 cursor-pointer card-glow-hover"
    >
      {/* Background Image */}
      {image && (
        <div className="relative h-40 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          {/* Date badge overlaid on image */}
          <div className="absolute bottom-3 left-3 w-14 h-14 rounded-xl bg-gradient-warm flex flex-col items-center justify-center text-primary-foreground shadow-warm">
            <span className="text-base font-bold font-serif leading-none">
              {date.split(" ")[0]}
            </span>
            <span className="text-[9px] uppercase tracking-wide leading-tight mt-0.5">
              {date.split(" ")[1]}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {!image && (
          <div className="flex gap-3 mb-3">
            <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-warm flex flex-col items-center justify-center text-primary-foreground shadow-warm">
              <span className="text-base font-bold font-serif leading-none">
                {date.split(" ")[0]}
              </span>
              <span className="text-[9px] uppercase tracking-wide leading-tight mt-0.5">
                {date.split(" ")[1]}
              </span>
            </div>
          </div>
        )}
        <h3 className="font-serif text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-300">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted/60">
            <Clock className="w-3 h-3" />
            {time}
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted/60">
            <MapPin className="w-3 h-3" />
            {location}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
