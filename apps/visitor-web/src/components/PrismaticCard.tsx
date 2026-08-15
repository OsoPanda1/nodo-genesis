import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PrismaticCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "quantum" | "crystal" | "nebula";
  glow?: boolean;
  className?: string;
}

const PrismaticCard = ({
  children,
  variant = "default",
  glow = false,
  className,
  ...props
}: PrismaticCardProps) => {
  const baseClasses =
    "rounded-lg backdrop-blur-md border p-4 transition-all duration-300 celestial-card";

  const variantClasses = {
    default: "bg-card/70 border-white/5 text-card-foreground shadow-quantum/20",
    quantum: "bg-quantum-600/70 border-quantum-300/20 text-quantum-100 shadow-quantum",
    crystal: "bg-card/50 border-crystal-300/20 text-crystal-100 shadow-crystal",
    nebula: "bg-card/50 border-nebula-300/20 text-nebula-100 shadow-nebula",
  };

  const glowClasses = glow ? "crystal-glow" : "";

  return (
    <div className={cn(baseClasses, variantClasses[variant], glowClasses, className)} {...props}>
      {children}
    </div>
  );
};

export default PrismaticCard;
