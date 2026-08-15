import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  Sparkles,
  GraduationCap,
  Music,
  Ticket,
  ShoppingBag,
  Shield,
  MessageCircle,
  Settings,
  Bell,
  Wallet,
  User,
  Menu,
  X,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type NavIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface NavItem {
  id: string;
  icon: NavIcon;
  label: string;
  path: string;
  badge?: number;
  highlight?: boolean;
}

const MAIN_ITEMS: NavItem[] = [
  { id: "home", icon: Home, label: "Inicio", path: "/" },
  { id: "community", icon: Users, label: "Comunidad", path: "/community" },
  {
    id: "dreamspaces",
    icon: Sparkles,
    label: "XR",
    path: "/dreamspaces",
    highlight: true,
  },
  { id: "university", icon: GraduationCap, label: "Universidad", path: "/university" },
  { id: "music", icon: Music, label: "Música", path: "/music" },
  { id: "lottery", icon: Ticket, label: "Lotería", path: "/lottery" },
  {
    id: "marketplace",
    icon: ShoppingBag,
    label: "Marketplace",
    path: "/marketplace",
  },
  { id: "governance", icon: Shield, label: "Governance", path: "/governance" },
];

const QUICK_ACTIONS: NavItem[] = [
  {
    id: "notifications",
    icon: Bell,
    label: "Notificaciones",
    path: "/notifications",
    badge: 5,
  },
  { id: "wallet", icon: Wallet, label: "Wallet", path: "/wallet" },
  { id: "chat", icon: MessageCircle, label: "Chat", path: "/chat" },
  { id: "profile", icon: User, label: "Perfil", path: "/profile" },
  { id: "settings", icon: Settings, label: "Ajustes", path: "/settings" },
];

const SCROLL_HIDE_THRESHOLD = 100;
const SCROLL_TOP_BUTTON_THRESHOLD = 500;

const NavigationBar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Control de visibilidad con scroll (oculta al bajar, muestra al subir)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < SCROLL_HIDE_THRESHOLD || currentScrollY < lastScrollY) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > SCROLL_HIDE_THRESHOLD) {
        setIsVisible(false);
        setIsExpanded(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Cerrar HUD al cambiar de ruta
  useEffect(() => {
    setIsExpanded(false);
  }, [location.pathname]);

  const handleNavigation = useCallback(
    (path: string) => {
      navigate(path);
      setIsExpanded(false);
    },
    [navigate],
  );

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2"
          role="navigation"
          aria-label="Navegación principal de Real del Monte Digital"
        >
          <div className="relative">
            {/* Barra principal: anillo cristal TAMV */}
            <motion.div
              layout
              className="tamv-nav-immersive relative flex items-center gap-1 px-2 py-1"
            >
              {/* Halo interno leve (conic) */}
              <div className="pointer-events-none absolute inset-[1px] rounded-[999px] border border-transparent bg-[conic-gradient(from_160deg,rgba(59,245,255,0.2),rgba(192,132,252,0.24),rgba(59,245,255,0.2))] opacity-40 mix-blend-soft-light" />

              {/* Items principales */}
              <div className="relative z-10 flex items-center gap-1">
                {MAIN_ITEMS.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(item.path);
                    }}
                    className={({ isActive }) => cnNavItem(isActive, item.highlight)}
                    aria-label={item.label}
                  >
                    {({ isActive }) => (
                      <>
                        <motion.span
                          whileHover={{ y: -1, scale: 1.05 }}
                          whileTap={{ scale: 0.96 }}
                          className="relative flex flex-col items-center justify-center"
                        >
                          <span className="relative flex items-center justify-center">
                            <item.icon className="h-4 w-4 md:h-5 md:w-5 drop-shadow-[0_0_8px_rgba(59,245,255,0.5)]" />
                            {/* Glow XR dedicado para DreamSpaces */}
                            {item.highlight && (
                              <span className="pointer-events-none absolute inset-0 rounded-xl bg-cyan-400/15 blur-sm animate-pulse" />
                            )}
                          </span>
                          <span className="relative mt-1 text-[10px] font-medium uppercase tracking-[0.16em]">
                            {item.label}
                          </span>
                        </motion.span>

                        {/* Indicador activo como “estrella” en la órbita */}
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="pointer-events-none absolute -bottom-[6px] h-[6px] w-[18px] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_12px_rgba(56,189,248,0.8)]"
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>

              {/* Separador */}
              <div className="relative z-10 mx-1 h-8 w-px bg-gradient-to-b from-cyan-400/40 via-slate-500/40 to-blue-500/40" />

              {/* Botón de expandir HUD */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleExpanded}
                aria-expanded={isExpanded}
                aria-label={
                  isExpanded
                    ? "Cerrar panel de acciones rápidas"
                    : "Abrir panel de acciones rápidas"
                }
                className="relative z-10 h-10 w-10 rounded-2xl border border-cyan-300/40 bg-slate-900/70 text-slate-100 shadow-[0_0_18px_rgba(15,23,42,0.9)] hover:bg-slate-800/80"
              >
                {isExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </motion.div>

            {/* Panel expandido: HUD superior */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.96 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2"
                >
                  <div className="relative rounded-2xl border border-slate-500/60 bg-slate-950/90 px-3 py-2 shadow-[0_18px_40px_rgba(15,23,42,0.98),0_0_45px_rgba(56,189,248,0.35)] backdrop-blur-2xl">
                    {/* halo interno */}
                    <div className="pointer-events-none absolute inset-[1px] rounded-[1rem] border border-transparent bg-[conic-gradient(from_140deg,rgba(59,245,255,0.25),rgba(192,132,252,0.25),rgba(59,245,255,0.25))] opacity-40 mix-blend-soft-light" />

                    {/* ruido sutil */}
                    <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20160%20160%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22n%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%221.6%22%20numOctaves=%223%22%20stitchTiles=%22noStitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23n)%22%20opacity=%220.28%22/%3E%3C/svg%3E')] opacity-35 mix-blend-soft-light" />

                    <div className="relative z-10 flex items-center gap-2">
                      {QUICK_ACTIONS.map((item) => (
                        <motion.button
                          key={item.id}
                          type="button"
                          whileHover={{ y: -1, scale: 1.05 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleNavigation(item.path)}
                          className="relative flex flex-col items-center justify-center rounded-xl px-3 py-2 text-[11px] text-slate-300 transition-colors hover:bg-slate-800/60 hover:text-slate-50"
                          aria-label={item.label}
                        >
                          <span className="relative flex items-center justify-center">
                            <item.icon className="h-4 w-4 md:h-5 md:w-5 drop-shadow-[0_0_8px_rgba(59,245,255,0.5)]" />
                          </span>
                          <span className="mt-1 text-[10px] uppercase tracking-[0.14em]">
                            {item.label}
                          </span>

                          {item.badge && item.badge > 0 && (
                            <Badge
                              variant="destructive"
                              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center p-0 text-[10px]"
                              aria-label={`${item.badge} notificaciones sin leer`}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </motion.button>
                      ))}
                    </div>

                    {/* Flecha HUD */}
                    <div className="pointer-events-none absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-slate-500/60 bg-slate-950/90" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Indicador de "subir" cuando hay mucho scroll */}
            <AnimatePresence>
              {lastScrollY > SCROLL_TOP_BUTTON_THRESHOLD && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-full border border-slate-500/60 bg-slate-950/85 p-2 text-slate-300 shadow-[0_0_24px_rgba(15,23,42,0.95)] backdrop-blur-md transition-colors hover:bg-slate-900/90 hover:text-slate-50"
                  aria-label="Volver al inicio de la página"
                >
                  <ChevronUp className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

function cnNavItem(isActive: boolean, highlight?: boolean): string {
  const base =
    "relative flex min-w-[3.1rem] flex-col items-center justify-center rounded-2xl px-2 py-1.5 text-[10px] transition-all duration-200";
  if (isActive) {
    return [
      base,
      "border border-cyan-300/50 bg-slate-900/80 text-cyan-300 shadow-[0_0_22px_rgba(34,211,238,0.7)]",
    ].join(" ");
  }
  if (highlight) {
    return [
      base,
      "border border-cyan-300/40 bg-slate-900/70 text-slate-200 hover:bg-slate-900/90",
    ].join(" ");
  }
  return [
    base,
    "border border-transparent text-slate-400 hover:bg-slate-900/60 hover:text-slate-50",
  ].join(" ");
}

export default NavigationBar;
