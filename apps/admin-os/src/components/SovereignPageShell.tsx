import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { ModuleCinematicIntro } from "@/components/ModuleCinematicIntro";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SovereignPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  children?: ReactNode;
}

export function SovereignPageShell({ eyebrow, title, description, bullets, children }: SovereignPageShellProps) {
  const [showTrailer, setShowTrailer] = useState(true);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <AnimatePresence>
          {showTrailer && (
            <ModuleCinematicIntro
              eyebrow={eyebrow}
              title={title}
              description={description}
              onComplete={() => setShowTrailer(false)}
            />
          )}
        </AnimatePresence>

        <Navbar />

        <main className="pt-28 pb-8">
          <section className="container mx-auto px-4 md:px-8 relative overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at top, hsl(var(--accent) / 0.35) 0%, transparent 58%)",
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative z-10 max-w-4xl"
            >
              <Badge variant="outline" className="mb-5 tracking-[0.22em] uppercase text-[10px] border-foreground/20 text-foreground/80">
                {eyebrow}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-display font-semibold leading-[0.95] text-foreground">{title}</h1>
              <p className="mt-5 text-lg text-foreground/70 max-w-2xl">{description}</p>
            </motion.div>
          </section>

          <section className="container mx-auto px-4 md:px-8 mt-10 grid lg:grid-cols-3 gap-4">
            {bullets.map((bullet, index) => (
              <motion.div
                key={bullet}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.08, duration: 0.5 }}
              >
                <Card className="glass border-border/60 h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm tracking-[0.14em] uppercase text-foreground/75">Módulo {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/75 leading-relaxed">{bullet}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </section>

          {children && <section className="container mx-auto px-4 md:px-8 mt-8">{children}</section>}
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
