import React from "react";
import { motion } from "framer-motion";
import { Users, MessageCircle, Star, Sparkles, Zap, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  stats?: {
    label: string;
    value: string;
  }[];
  isLive?: boolean;
  onClick?: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  description,
  icon,
  gradient,
  stats,
  isLive,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative group cursor-pointer rounded-2xl overflow-hidden",
        "bg-card/50 backdrop-blur-sm border border-border/30",
        "transition-all duration-500",
      )}
    >
      {/* Background Gradient */}
      <div
        className={cn(
          "absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500",
          gradient,
        )}
      />

      {/* Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className={cn("absolute inset-0 blur-2xl", gradient, "opacity-30")} />
      </div>

      {/* Content */}
      <div className="relative p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            className={cn("w-14 h-14 rounded-xl flex items-center justify-center", gradient)}
          >
            {icon}
          </motion.div>

          {isLive && (
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-400">LIVE</span>
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground flex-1">{description}</p>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/30 flex items-center gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-lg font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Hover Arrow */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="absolute bottom-6 right-6"
        >
          <svg
            className="w-6 h-6 text-accent"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
};

const ModulesGrid: React.FC = () => {
  const modules = [
    {
      title: "Dream Spaces",
      description:
        "Espacios virtuales inmersivos para crear, explorar y conectar en mundos personalizados",
      icon: <Sparkles className="w-7 h-7 text-white" />,
      gradient: "bg-gradient-to-br from-purple-600 to-pink-600",
      stats: [
        { label: "Espacios", value: "2.5K" },
        { label: "Activos", value: "892" },
      ],
    },
    {
      title: "Conciertos Sensoriales",
      description:
        "Experiencias musicales con audio 3D y visuales envolventes que estimulan todos los sentidos",
      icon: <Music className="w-7 h-7 text-white" />,
      gradient: "bg-gradient-to-br from-cyan-600 to-blue-600",
      stats: [
        { label: "Eventos", value: "156" },
        { label: "En vivo", value: "12" },
      ],
      isLive: true,
    },
    {
      title: "Canales & Grupos",
      description:
        "Comunidades vibrantes donde los creadores comparten contenido exclusivo y conectan con fans",
      icon: <Users className="w-7 h-7 text-white" />,
      gradient: "bg-gradient-to-br from-green-600 to-emerald-600",
      stats: [
        { label: "Grupos", value: "15K" },
        { label: "Miembros", value: "2.1M" },
      ],
    },
    {
      title: "Puentes Oníricos",
      description:
        "Portales de conexión entre diferentes Dream Spaces para experiencias colaborativas únicas",
      icon: <Zap className="w-7 h-7 text-white" />,
      gradient: "bg-gradient-to-br from-orange-600 to-red-600",
      stats: [
        { label: "Puentes", value: "428" },
        { label: "Viajeros", value: "5.2K" },
      ],
    },
  ];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 bg-gradient-to-b from-accent to-primary rounded-full" />
        <h2 className="text-2xl font-bold text-foreground">Explora el Metaverso</h2>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map((module, index) => (
          <motion.div
            key={module.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ModuleCard {...module} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ModulesGrid;
