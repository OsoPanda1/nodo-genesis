/**
 * Globe Search - Buscador global con globo 3D interactivo
 * Se transforma de globo a barra de búsqueda
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, X, Sparkles, Users, Music, Calendar, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GlobeSearchProps {
  onSearch?: (query: string, location?: string) => void;
}

const GlobeSearch: React.FC<GlobeSearchProps> = ({ onSearch }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dibujar globo 3D simplificado
  useEffect(() => {
    if (isExpanded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 300;

    let rotation = 0;
    let animationId: number;

    const drawGlobe = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 100;

      // Gradiente del globo
      const gradient = ctx.createRadialGradient(
        centerX - 30,
        centerY - 30,
        10,
        centerX,
        centerY,
        radius,
      );
      gradient.addColorStop(0, "rgba(0, 240, 255, 0.3)");
      gradient.addColorStop(0.5, "rgba(0, 100, 200, 0.2)");
      gradient.addColorStop(1, "rgba(20, 20, 50, 0.5)");

      // Dibujar esfera
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Líneas de longitud
      ctx.strokeStyle = "rgba(0, 240, 255, 0.3)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 12; i++) {
        const angle = ((i * 30 + rotation) * Math.PI) / 180;
        ctx.beginPath();
        ctx.ellipse(
          centerX,
          centerY,
          Math.abs(Math.cos(angle)) * radius,
          radius,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }

      // Líneas de latitud
      for (let i = 1; i < 6; i++) {
        const y = centerY - radius + (i * radius * 2) / 6;
        const latRadius = Math.sqrt(radius * radius - Math.pow(y - centerY, 2));
        ctx.beginPath();
        ctx.ellipse(centerX, y, latRadius, latRadius * 0.2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Puntos brillantes (ciudades)
      const cities = [
        { x: 0.3, y: 0.4 },
        { x: 0.7, y: 0.35 },
        { x: 0.5, y: 0.6 },
        { x: 0.2, y: 0.55 },
        { x: 0.8, y: 0.5 },
      ];

      cities.forEach((city) => {
        const cx = centerX + (city.x - 0.5) * radius * 2 * Math.cos(rotation * 0.02);
        const cy = centerY + (city.y - 0.5) * radius * 1.5;

        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 240, 255, 0.8)";
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 240, 255, 0.2)";
        ctx.fill();
      });

      // Borde brillante
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 240, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();

      rotation += 0.5;
      animationId = requestAnimationFrame(drawGlobe);
    };

    drawGlobe();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isExpanded]);

  // Focus input cuando se expande
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleGlobeClick = () => {
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
    setQuery("");
    setSelectedLocation(null);
  };

  const handleSearch = () => {
    onSearch?.(query, selectedLocation || undefined);
  };

  const quickFilters = [
    { icon: Users, label: "Grupos", color: "text-cyan-400" },
    { icon: Music, label: "Música", color: "text-green-400" },
    { icon: Calendar, label: "Eventos", color: "text-purple-400" },
    { icon: ShoppingBag, label: "Marketplace", color: "text-amber-400" },
  ];

  return (
    <section className="py-12 flex flex-col items-center">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          // Globo 3D
          <motion.div
            key="globe"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="relative cursor-pointer group"
            onClick={handleGlobeClick}
          >
            <canvas ref={canvasRef} className="w-[300px] h-[300px]" />

            {/* Hover effect */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-400" />
                <span className="text-sm">Buscar en el mundo</span>
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-xl animate-pulse pointer-events-none" />
          </motion.div>
        ) : (
          // Barra de búsqueda expandida
          <motion.div
            key="searchbar"
            initial={{ opacity: 0, width: 300 }}
            animate={{ opacity: 1, width: "100%" }}
            exit={{ opacity: 0, width: 300 }}
            className="w-full max-w-4xl"
          >
            {/* Barra principal */}
            <div className="relative">
              <div className="flex items-center gap-2 p-2 bg-card/80 backdrop-blur-md rounded-2xl border border-border/50 shadow-xl shadow-cyan-500/10">
                <div className="flex items-center gap-2 px-3 py-2 bg-background/50 rounded-xl flex-1">
                  <Search className="w-5 h-5 text-cyan-400" />
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      selectedLocation
                        ? `Buscar en ${selectedLocation}...`
                        : "Buscar temas, grupos, eventos o locaciones..."
                    }
                    className="border-0 bg-transparent focus-visible:ring-0 text-lg"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>

                {selectedLocation && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {selectedLocation}
                    <button onClick={() => setSelectedLocation(null)}>
                      <X className="w-3 h-3 ml-1" />
                    </button>
                  </Badge>
                )}

                <Button
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Buscar
                </Button>

                <Button variant="ghost" size="icon" onClick={handleClose} className="shrink-0">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Filtros rápidos */}
              <div className="flex items-center gap-2 mt-4 justify-center">
                {quickFilters.map((filter) => (
                  <Button
                    key={filter.label}
                    variant="outline"
                    size="sm"
                    className="rounded-full border-border/50"
                  >
                    <filter.icon className={`w-4 h-4 mr-2 ${filter.color}`} />
                    {filter.label}
                  </Button>
                ))}
              </div>

              {/* Ubicaciones sugeridas */}
              <div className="flex items-center gap-2 mt-3 justify-center flex-wrap">
                {["CDMX", "New York", "Tokyo", "Londres", "São Paulo"].map((city) => (
                  <Badge
                    key={city}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => setSelectedLocation(city)}
                  >
                    <MapPin className="w-3 h-3 mr-1" />
                    {city}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Título */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-muted-foreground mt-4"
      >
        {isExpanded
          ? "Encuentra cualquier cosa en el metaverso TAMV"
          : "Haz clic en el globo para explorar el mundo"}
      </motion.p>
    </section>
  );
};

export default GlobeSearch;
