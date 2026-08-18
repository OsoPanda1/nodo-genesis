import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mountain, Menu, X, BookOpen } from "lucide-react";

const NAV_ITEMS = [
  { id: "inicio", label: "Inicio" },
  { id: "experiencias", label: "Experiencias" },
  { id: "historia", label: "Historia" },
  { id: "gastronomia", label: "Gastronomía" },
  { id: "aventura", label: "Aventura" },
  { id: "hospedaje", label: "Hospedaje" },
  { id: "cultura", label: "Cultura" },
  { id: "innovacion", label: "Innovación" },
];

interface FloatingNavProps {
  onDichosClick?: () => void;
}

export function FloatingNav({ onDichosClick }: FloatingNavProps) {
  const [visible, setVisible] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass rounded-2xl px-2 py-2"
        >
          {/* Desktop */}
          <div className="hidden md:flex items-center gap-1">
            <a href="#inicio" className="flex items-center gap-2 px-3 py-2">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                <Mountain className="w-3.5 h-3.5 text-accent-foreground" />
              </div>
              <span className="text-xs font-display font-bold text-foreground">RDM</span>
            </a>
            {NAV_ITEMS.slice(1).map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="px-3 py-2 text-xs font-body text-muted-foreground hover:text-accent transition-colors rounded-lg hover:bg-muted/50"
              >
                {item.label}
              </a>
            ))}
            {onDichosClick && (
              <button
                onClick={onDichosClick}
                className="px-3 py-2 text-xs font-body text-accent hover:text-accent/80 transition-colors rounded-lg hover:bg-muted/50 flex items-center gap-1.5 font-medium"
              >
                <BookOpen className="w-3 h-3" />
                Dichos
              </button>
            )}
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <a href="#inicio" className="flex items-center gap-2 px-2 py-1.5">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                <Mountain className="w-3.5 h-3.5 text-accent-foreground" />
              </div>
            </a>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-foreground">
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </motion.nav>
      )}

      {mobileOpen && visible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-16 left-4 right-4 z-50 glass rounded-xl p-3 md:hidden"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm font-body text-muted-foreground hover:text-accent transition-colors rounded-lg"
            >
              {item.label}
            </a>
          ))}
          {onDichosClick && (
            <button
              onClick={() => {
                setMobileOpen(false);
                onDichosClick();
              }}
              className="block w-full text-left px-3 py-2.5 text-sm font-body text-accent hover:text-accent/80 transition-colors rounded-lg font-medium"
            >
              📜 Callejón de los Dichos
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
