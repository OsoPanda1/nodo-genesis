import { motion } from "framer-motion";
import { Compass, Clock, ArrowRight } from "lucide-react";

const ROUTES = [
  {
    id: "1",
    name: "Ruta de la Plata",
    description: "Recorre las principales minas históricas y puntos patrimoniales del pueblo.",
    duration: "2h 30min",
    stops: 6,
    difficulty: "Moderada",
    highlights: ["Mina de Acosta", "Panteón Inglés", "Centro Histórico"],
  },
  {
    id: "2",
    name: "Ruta Gastronómica",
    description: "Explora los mejores pastes, cafés y restaurantes tradicionales.",
    duration: "1h 45min",
    stops: 5,
    difficulty: "Fácil",
    highlights: ["Pastes El Portal", "Café Triana", "Mercado Municipal"],
  },
  {
    id: "3",
    name: "Sendero de Montaña",
    description: "Aventura en la Sierra de Pachuca con vistas panorámicas.",
    duration: "4h",
    stops: 4,
    difficulty: "Alta",
    highlights: ["Peña del Cuervo", "Mirador del Valle", "Bosque de Oyamel"],
  },
  {
    id: "4",
    name: "Circuito Cultural",
    description: "Museos, galerías y espacios culturales del pueblo.",
    duration: "2h",
    stops: 5,
    difficulty: "Fácil",
    highlights: ["Museo de Medicina", "Centro Nicolás Zavala", "Iglesia de la Asunción"],
  },
];

export function RoutesView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold tracking-tight">Rutas Optimizadas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Circuitos inteligentes generados por el Cognitive Kernel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ROUTES.map((route, i) => (
          <motion.div
            key={route.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-5 hover:border-accent/30 transition-colors group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-display font-semibold text-base">{route.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{route.description}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {route.duration}
              </span>
              <span className="flex items-center gap-1">
                <Compass className="w-3 h-3" /> {route.stops} paradas
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                route.difficulty === "Alta" ? "bg-destructive/10 text-destructive" :
                route.difficulty === "Moderada" ? "bg-accent/10 text-accent" :
                "bg-success/10 text-success"
              }`}>
                {route.difficulty}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {route.highlights.map((h) => (
                <span key={h} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {h}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
