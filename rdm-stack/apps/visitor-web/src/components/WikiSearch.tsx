import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

const searchIndex = [
  { title: "Inicio", url: "/", keywords: "home principal tamv md-x4 citemesh" },
  {
    title: "Introducción",
    url: "/introduccion",
    keywords: "qué es tamv origen historia ecosistema civilizatorio membresías segmentos",
  },
  {
    title: "Filosofía y Códice",
    url: "/filosofia",
    keywords: "códice kórima principios ética gobernanza valores",
  },
  {
    title: "Arquitectura TAMV MD‑X4",
    url: "/arquitectura",
    keywords: "capas módulos citemesh stack isabella eoct anubis",
  },
  {
    title: "ID‑NVIDA",
    url: "/dominios/id-nvida",
    keywords: "identidad soberana digital huella did verificable",
  },
  {
    title: "UTAMV",
    url: "/dominios/utamv",
    keywords: "universidad educación inmersiva formación escuela",
  },
  {
    title: "Metaverso MD‑X4",
    url: "/dominios/metaverso",
    keywords: "xr gemelos digitales dreamspaces realidad virtual",
  },
  {
    title: "Economía TAMV",
    url: "/dominios/economia",
    keywords:
      "tau token intercambio valor ético trazabilidad blockchain membresías niveles accesos precios free premium devs advance enterprise",
  },
  {
    title: "Seguridad",
    url: "/dominios/seguridad",
    keywords: "anubis horus tenochtitlan honeypots zero-trust guardianías",
  },
  {
    title: "IA & Agentes",
    url: "/ia-agentes",
    keywords: "isabella ai agentes ia neural compliance gdpr",
  },
  {
    title: "Línea de Tiempo",
    url: "/timeline",
    keywords: "historia hitos cronología 2020 2024 2025 2026",
  },
  { title: "Documentación", url: "/documentacion", keywords: "api docs técnica guías tutoriales" },
  {
    title: "Gobernanza y Políticas",
    url: "/gobernanza",
    keywords:
      "roles contribución plantillas revisión compliance estándares membresías participación certificación federada nodo guardián observador",
  },
  {
    title: "Dashboard de Monitoreo",
    url: "/dashboard",
    keywords: "nodos estado grafana métricas latencia cpu alertas monitoreo visibilidad membresía",
  },
  {
    title: "Sistemas Avanzados",
    url: "/sistemas-avanzados",
    keywords:
      "hexagonal pipeline eoct quantum filtración caliente frío social core comunidad reputación votación",
  },
  {
    title: "Manuales de Usuario",
    url: "/manuales",
    keywords:
      "guía manual inicio rápido faq redundancia desarrollo seguridad membresía instituciones piloto",
  },
  {
    title: "Despliegue Universal",
    url: "/despliegue",
    keywords:
      "deploy cloud on-premise federada certificación docker terraform prerequisitos checklist local kubernetes nodo observador colaborador operador guardián",
  },
  {
    title: "Biografía CEO",
    url: "/biografia-ceo",
    keywords: "edwin anubis villaseñor fundador ceo castillo trejo real del monte",
  },
  {
    title: "Casos de Uso",
    url: "/casos-de-uso",
    keywords: "universidad gobierno empresa comunidad fintech ejemplos implementación",
  },
  {
    title: "Kit de APIs",
    url: "/kit-apis",
    keywords:
      "api rest endpoints sdk integración conectores external rate limit acceso membresía sandbox",
  },
  {
    title: "Estrategia Comercial",
    url: "/estrategia",
    keywords:
      "marketing venta posicionamiento segmentos negocio plantilla replicable rutas adopción membresía free premium devs advance enterprise",
  },
  // NextGen Ecosystem pages
  {
    title: "Red Social Avanzada",
    url: "/red-social",
    keywords:
      "red social videos 4k 8k reels chats cifrado cgifts regalos dream spaces referidos tiktok instagram muro global publicidad ética",
  },
  {
    title: "Seguridad TENOCHTITLAN",
    url: "/seguridad-tenochtitlan",
    keywords:
      "tenochtitlan anubis centinel horus dekateotl aztek gods quetzalcoatl ojo de ra mos gemelos guardianía seguridad capas encriptación",
  },
  {
    title: "Blockchain MSR",
    url: "/blockchain-msr",
    keywords:
      "blockchain merkle state root antifraude ethereum polygon solana smart contract inmutable trazabilidad",
  },
  {
    title: "Tecnología XR/VR/3D/4D",
    url: "/xr-tecnologia",
    keywords:
      "xr vr ar 3d 4d render ray tracing three.js unity unreal webxr openxr haptic motor hiperrealista",
  },
  {
    title: "Economía Federada",
    url: "/economia-federada",
    keywords:
      "economia federada 30 monetización fairsplit creadores banco digital trading remesas nft marketplace",
  },
  {
    title: "Quantum Computing",
    url: "/quantum-computing",
    keywords: "quantum cuántico qiskit cirq q# híbrido post-cuántico kyber dilithium qaoa vqe",
  },
  {
    title: "Enciclopedia Universal",
    url: "/enciclopedia",
    keywords:
      "enciclopedia github sourcegraph wikipedia neowiki kiro conocimiento grafo búsqueda semántica",
  },
  {
    title: "Isabella AI Universal",
    url: "/isabella-ai",
    keywords:
      "isabella ai ética xai explicable supervisión humana aprendizaje continuo tutoría moderación",
  },
  {
    title: "Impacto Civilizatorio",
    url: "/impacto-civilizatorio",
    keywords:
      "impacto civilizatorio expansión global 25 países premios hitos licencia creative commons apache",
  },
];

export function WikiSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback(
    (url: string) => {
      setOpen(false);
      navigate(url);
    },
    [navigate],
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border/50 bg-muted/30 text-muted-foreground text-sm hover:bg-muted/50 transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Buscar…</span>
        <kbd className="hidden md:inline-flex h-5 items-center gap-0.5 rounded border border-border/50 bg-muted px-1.5 text-[10px] font-mono text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar en la wiki TAMV…" />
        <CommandList>
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>
          <CommandGroup heading="Páginas">
            {searchIndex.map((page) => (
              <CommandItem
                key={page.url}
                value={`${page.title} ${page.keywords}`}
                onSelect={() => handleSelect(page.url)}
              >
                {page.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
