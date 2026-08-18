import { motion } from "framer-motion";
import { ReactNode } from "react";

interface WikiPageProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function WikiPage({ title, subtitle, children }: WikiPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-4xl mx-auto px-6 py-10"
    >
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gradient-gold mb-2">{title}</h1>
        {subtitle && <p className="text-muted-foreground text-lg">{subtitle}</p>}
        <div className="h-px bg-gradient-to-r from-primary/50 to-transparent mt-4" />
      </div>
      <div className="prose-invert space-y-6">{children}</div>
    </motion.div>
  );
}
