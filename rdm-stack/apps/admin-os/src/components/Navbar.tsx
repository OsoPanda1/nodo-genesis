import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/nodo-cero", label: "Nodo Cero" },
  { to: "/explorar", label: "Explorar" },
  { to: "/dichos", label: "Dichos" },
  { to: "/mitos", label: "Mitos" },
  { to: "/comercios", label: "Comercios" },
  { to: "/paquetes", label: "Paquetes" },
  { to: "/comunidad", label: "Comunidad" },
  { to: "/transporte", label: "Transporte" },
  { to: "/geoexplorer", label: "GeoExplorer" },
  { to: "/noticias", label: "Noticias" },
  { to: "/tradenode", label: "Tienda" },
  { to: "/membresias", label: "Membresías" },
  { to: "/playlist", label: "Playlist" },
  { to: "/apoya", label: "Apoya" },
  { to: "/tamv-hub", label: "TAMV" },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActiveRoute = (route: string) => location.pathname === route;

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border/60 bg-background/90 shadow-[0_10px_35px_-24px_hsl(var(--primary)/0.35)] backdrop-blur-xl">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(115deg,hsl(var(--muted)/0.22),hsl(var(--primary)/0.08)_38%,hsl(var(--background)/0.36)_72%,hsl(var(--accent)/0.06))]" />

      <div className="container relative mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm tracking-[0.2em] uppercase text-foreground"
          onClick={() => setMobileOpen(false)}
        >
          <Sparkles className="h-4 w-4 text-primary" />
          RDM Digital
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm transition-colors",
                isActiveRoute(item.to)
                  ? "bg-gradient-to-r from-foreground via-foreground/90 to-primary text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/80 text-foreground hover:border-primary/40 transition-colors"
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {links.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm transition-colors",
                  isActiveRoute(item.to)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
