import { PageShell } from "@/components/PageShell";
import { AuroraBackground } from "@/components/VisualEffects";
import FloatingParticles from "@/components/FloatingParticles";
import BrumaHeader from "@/components/BrumaHeader";

const VisualEffects = () => (
  <PageShell title="Visual Effects">
    <BrumaHeader />
    <FloatingParticles />
    <section className="relative min-h-screen pt-24">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <span className="font-body text-[10px] tracking-[0.4em] uppercase text-gold/60">
            Motor Visual
          </span>
          <h1 className="font-display text-4xl md:text-6xl text-foreground mt-4 tracking-tight">
            <span className="text-gradient-gold">Efectos Visuales</span>
          </h1>
          <p className="font-body text-lg text-muted-foreground mt-4 max-w-lg mx-auto">
            Capas de renderizado, partículas y atmósferas procedurales del gemelo digital
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="glass rounded-2xl p-6 space-y-4">
            <h3 className="font-display text-xl text-foreground">Aurora Background</h3>
            <div className="h-40 rounded-xl overflow-hidden">
              <AuroraBackground />
            </div>
          </div>
          <div className="glass rounded-2xl p-6 space-y-4">
            <h3 className="font-display text-xl text-foreground">Fondo Neblina</h3>
            <div className="h-40 rounded-xl bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Capa de niebla activa</p>
            </div>
          </div>
          <div className="glass rounded-2xl p-6 space-y-4">
            <h3 className="font-display text-xl text-foreground">Partículas Activas</h3>
            <div className="h-40 rounded-xl bg-slate-950 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_70%)]" />
              <p className="relative z-10 text-sm text-muted-foreground flex items-center justify-center h-full">
                FloatingParticles activo en segundo plano
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </PageShell>
);
export default VisualEffects;
