import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface ChapterDividerProps {
  quote: string;
  author?: string;
}

const ChapterDivider = ({ quote, author }: ChapterDividerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="py-20 md:py-28 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsla(43,80%,55%,0.03),transparent_60%)]" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 1.5 }}
        className="container mx-auto px-6 md:px-12 text-center max-w-3xl relative"
      >
        <div className="separator-gradient mb-12 opacity-40" />
        <blockquote className="font-display text-2xl md:text-3xl text-foreground/70 italic leading-relaxed">
          "{quote}"
        </blockquote>
        {author && (
          <cite className="block font-body text-[10px] tracking-[0.3em] uppercase text-gold/50 mt-6 not-italic">
            — {author}
          </cite>
        )}
        <div className="separator-gradient mt-12 opacity-40" />
      </motion.div>
    </div>
  );
};

export default ChapterDivider;
