import { motion } from "framer-motion";
import { ReactNode } from "react";
import { LucideIcon, Info, AlertTriangle, CheckCircle } from "lucide-react";

interface InfoCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  variant?: "gold" | "cyan";
}

export function InfoCard({ title, description, icon: Icon, variant = "gold" }: InfoCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={`rounded-lg border p-5 bg-card/80 backdrop-blur-sm ${
        variant === "gold" ? "border-glow-gold" : "border-glow-cyan"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-md ${
            variant === "gold" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

interface SectionProps {
  title: string;
  children: ReactNode;
  id?: string;
  icon?: LucideIcon;
}

export function Section({ title, children, id, icon: Icon }: SectionProps) {
  return (
    <section id={id} className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
        {Icon ? (
          <Icon className="h-5 w-5 text-primary" />
        ) : (
          <span className="w-1 h-5 rounded-full bg-primary inline-block" />
        )}
        {title}
      </h2>
      {children}
    </section>
  );
}

interface InfoBoxProps {
  type?: "info" | "warning" | "success";
  title?: string;
  children: ReactNode;
}

const typeStyles = {
  info: {
    border: "border-primary/30",
    bg: "bg-primary/5",
    icon: Info,
    iconColor: "text-primary",
  },
  warning: {
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/5",
    icon: AlertTriangle,
    iconColor: "text-yellow-500",
  },
  success: {
    border: "border-green-500/30",
    bg: "bg-green-500/5",
    icon: CheckCircle,
    iconColor: "text-green-500",
  },
};

export function InfoBox({ type = "info", title, children }: InfoBoxProps) {
  const styles = typeStyles[type];
  const Icon = styles.icon;

  return (
    <div className={`rounded-lg border ${styles.border} ${styles.bg} p-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 ${styles.iconColor} shrink-0 mt-0.5`} />
        <div className="flex-1">
          {title && <h4 className={`font-semibold ${styles.iconColor} mb-1`}>{title}</h4>}
          <div className="text-muted-foreground leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
