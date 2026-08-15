import { useMemo } from "react";
import { useVisual } from "@/contexts/VisualContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { visualState } = useVisual();

  const className = useMemo(() => {
    if (visualState.includes("night")) {
      return "bg-bg-night text-slate-100";
    }

    if (visualState.includes("evening")) {
      return "bg-gradient-to-b from-bg-evening-start to-bg-evening-end text-slate-900";
    }

    return "bg-bg-day text-slate-900";
  }, [visualState]);

  return (
    <div className={`${className} min-h-screen transition-colors duration-700`}>{children}</div>
  );
}
