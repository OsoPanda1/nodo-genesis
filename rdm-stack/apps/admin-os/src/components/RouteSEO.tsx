import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import SEOMeta from "@/components/SEOMeta";
import { getRouteSEO, organizationJsonLd, SITE_URL } from "@/lib/seo";
import { trackNavigation } from "@/lib/telemetry";

/**
 * Aplica metadatos SEO dinámicos por ruta y registra métricas de navegación.
 * Debe montarse dentro del <BrowserRouter/>.
 */
export default function RouteSEO() {
  const { pathname } = useLocation();
  const meta = getRouteSEO(pathname);
  const prev = useRef<{ path: string; at: number } | null>(null);

  useEffect(() => {
    const now = Date.now();
    trackNavigation(pathname, prev.current?.path, prev.current ? now - prev.current.at : undefined);
    prev.current = { path: pathname, at: now };
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    <SEOMeta
      title={meta.title}
      description={meta.description}
      canonical={`${SITE_URL}${pathname}`}
      noindex={meta.noindex}
      jsonLd={organizationJsonLd()}
    />
  );
}
