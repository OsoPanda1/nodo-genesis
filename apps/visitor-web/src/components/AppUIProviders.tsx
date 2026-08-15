import { type ReactNode, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

const AppUIProviders = ({ children, analyticsReady }: { children: ReactNode; analyticsReady: boolean }) => (
  <TooltipProvider>
    {children}
    <Toaster />
    <Sonner />
    {analyticsReady && (
      <Suspense fallback={null}>
        <SpeedInsights />
        <Analytics debug={import.meta.env.DEV} />
      </Suspense>
    )}
  </TooltipProvider>
);

export default AppUIProviders;
