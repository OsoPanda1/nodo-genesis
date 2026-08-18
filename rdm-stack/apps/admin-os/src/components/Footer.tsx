import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import DedicationBanner from "@/components/DedicationBanner";

const Footer = () => {
  return (
    <footer className="border-t border-border/60 mt-20 bg-foreground/[0.03]">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm tracking-[0.2em] uppercase text-foreground font-medium">RDM Digital</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sistema Soberano de Inteligencia Turística Territorial · Real del Monte, Hidalgo
            </p>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-foreground mb-3">Explorar</h4>
            <div className="flex flex-col gap-1.5">
              <Link to="/explorar" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Mapa</Link>
              <Link to="/paquetes" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Paquetes</Link>
              <Link to="/dichos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dichos</Link>
              <Link to="/historia" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Historia</Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-foreground mb-3">Servicios</h4>
            <div className="flex flex-col gap-1.5">
              <Link to="/comercios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Comercios</Link>
              <Link to="/shuttle-cdmx-rdm" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Shuttle CDMX</Link>
              <Link to="/transporte-local" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Transporte Local</Link>
              <Link to="/comunidad" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Comunidad</Link>
              <Link to="/servicios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Servicios</Link>
              <Link to="/foro" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Foro Cívico</Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-foreground mb-3">Legal</h4>
            <div className="flex flex-col gap-1.5">
              <Link to="/reglamento" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Reglamento</Link>
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Acceso</Link>
              <Link to="/kernel" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Kernel TAMV</Link>
              <Link to="/hub-unificado" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Hub Unificado</Link>
              <Link to="/programa-operativo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Programa Operativo</Link>
              <Link to="/manual" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Manual de Diseño</Link>
              <Link to="/media" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Podcast</Link>
            </div>
          </div>
        </div>
        <DedicationBanner />
        <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row gap-2 justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} RDM Digital OS · Sovereign-Crystal v5.2 · TAMV Online México</p>
          <p>Creado por Edwin Oswaldo Castillo Trejo</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
