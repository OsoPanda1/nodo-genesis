import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageTransition, TextReveal } from "@/components/VisualEffects";
import { Bus, Car, MapPin, Clock } from "lucide-react";

const transporte = [
  { icon: Bus, title: "Shuttle CDMX → Real del Monte", desc: "Servicio directo desde Ciudad de México. Salidas desde Terminal Norte.", horario: "6:00, 10:00, 14:00, 18:00", precio: "$180 MXN" },
  { icon: Bus, title: "Autobuses Pachuca → RDM", desc: "Combis y autobuses desde la Terminal de Pachuca cada 30 minutos.", horario: "5:30 - 22:00", precio: "$25 MXN" },
  { icon: Car, title: "Transporte Local", desc: "Taxis y mototaxis para moverse dentro del pueblo y alrededores.", horario: "24 hrs", precio: "$30-80 MXN" },
];

export default function Transporte() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-28 pb-24 px-6">
          <div className="container max-w-4xl">
            <TextReveal>
              <div className="text-center mb-16">
                <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">Transporte</h1>
                <p className="text-muted-foreground font-body max-w-xl mx-auto">Cómo llegar y moverse en Real del Monte.</p>
              </div>
            </TextReveal>
            <div className="space-y-6">
              {transporte.map((t) => (
                <div key={t.title} className="p-6 rounded-2xl border border-border bg-card card-glow-hover">
                  <div className="flex items-center gap-3 mb-3">
                    <t.icon className="w-6 h-6 text-accent" />
                    <h3 className="font-display text-lg font-semibold text-foreground">{t.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground font-body mb-3">{t.desc}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-body">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-gold" />{t.horario}</span>
                    <span className="flex items-center gap-1 text-accent font-semibold">{t.precio}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </PageTransition>
  );
}
