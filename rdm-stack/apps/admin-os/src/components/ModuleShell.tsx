import { ReactNode } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageTransition, TextReveal } from "@/components/VisualEffects";
import SEOMeta from "@/components/SEOMeta";

interface ModuleShellProps {
  eyebrow: string;
  title: string;
  highlight?: string;
  subtitle: string;
  seoTitle: string;
  seoDescription: string;
  children: ReactNode;
}

/** Cáscara cinematográfica compartida por los módulos fusionados de RDM Digital. */
export function ModuleShell({
  eyebrow,
  title,
  highlight,
  subtitle,
  seoTitle,
  seoDescription,
  children,
}: ModuleShellProps) {
  return (
    <PageTransition>
      <SEOMeta title={seoTitle} description={seoDescription} />
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-20">
          <div className="container mx-auto px-6">
            <TextReveal>
              <header className="max-w-3xl mx-auto text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/40 bg-accent/5 mb-4">
                  <span className="text-[10px] tracking-[0.3em] uppercase text-accent font-body">{eyebrow}</span>
                </div>
                <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
                  {title} {highlight && <span className="text-gradient-gold">{highlight}</span>}
                </h1>
                <p className="text-lg text-muted-foreground font-body">{subtitle}</p>
              </header>
            </TextReveal>
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
}

export function SectionTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="max-w-6xl mx-auto mb-5 mt-14 flex items-end justify-between gap-4">
      <h2 className="font-display text-2xl font-semibold">{children}</h2>
      {hint && <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{hint}</span>}
    </div>
  );
}

export function ElegantCard({ children, index = 0 }: { children: ReactNode; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
      className="h-full rounded-2xl border border-border/40 bg-card/40 p-5 hover:border-accent/40 hover:bg-card/70 transition-all"
    >
      {children}
    </motion.article>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="text-[9px] px-2 py-0.5 rounded-full border border-border/60 text-muted-foreground tracking-[0.16em] uppercase">
      {children}
    </span>
  );
}

export default ModuleShell;
