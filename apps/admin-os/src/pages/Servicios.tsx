import { useMemo, useState } from "react";
import { Wrench, Star, Phone, ShieldCheck, Car, Bus, UtensilsCrossed } from "lucide-react";
import { ModuleShell, SectionTitle, ElegantCard, Chip } from "@/components/ModuleShell";
import { ElegantPagination } from "@/components/ElegantPagination";
import { SERVICES_CATALOG, TOURIST_PARKINGS, GUIDED_TOURS, GASTRONOMY_SPOTS } from "@/data/rdm/modulesData";

const PAGE_SIZE = 6;
const CATEGORIES = ["Todas", ...Array.from(new Set(SERVICES_CATALOG.map((s) => s.category)))];

export default function Servicios() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [page, setPage] = useState(0);

  const filtered = useMemo(
    () =>
      SERVICES_CATALOG.filter((service) => {
        const text = `${service.title} ${service.description} ${service.providerName}`.toLowerCase();
        return (
          (category === "Todas" || service.category === category) &&
          (!query || text.includes(query.toLowerCase()))
        );
      }),
    [query, category],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <ModuleShell
      eyebrow="Servicios Prácticos · RDM"
      title="Oficios y"
      highlight="Anfitriones"
      subtitle="Guías de montaña, transporte, oficios verificados, estacionamientos en tiempo real y recorridos guiados."
      seoTitle="Servicios de Real del Monte · Guías, transporte y recorridos"
      seoDescription="Contrata guías de montaña, transporte, oficios verificados y recorridos guiados en Real del Monte. Consulta disponibilidad de estacionamientos."
    >
      <div className="max-w-5xl mx-auto mb-8 grid gap-3 md:grid-cols-[1fr_240px_120px]">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="Buscar guías, oficios, transporte…"
          className="rounded-xl border border-border/50 bg-card/50 px-4 py-3 text-sm outline-none focus:border-accent/60"
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(0);
          }}
          className="rounded-xl border border-border/50 bg-card/50 px-4 py-3 text-sm outline-none focus:border-accent/60"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="rounded-xl border border-border/50 bg-card/50 px-4 py-3 text-center text-xs text-muted-foreground">
          {filtered.length} servicios
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {paged.map((service, i) => (
          <ElegantCard key={service.id} index={i}>
            <div className="flex items-start justify-between mb-3">
              <Wrench className="w-5 h-5 text-accent" />
              <Chip>{service.category}</Chip>
            </div>
            <h3 className="font-display text-base font-semibold mb-1">{service.title}</h3>
            <p className="text-[11px] text-muted-foreground mb-2">{service.providerName}</p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{service.description}</p>
            <div className="text-[11px] text-muted-foreground border-t border-border/40 pt-3 space-y-1">
              <p className="flex items-center justify-between">
                <span className="font-display text-base text-gold">${service.hourlyRateMXN} MXN/h</span>
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-gold" /> {service.rating}
                </span>
              </p>
              <p>{service.completedJobs} trabajos · {service.availability}</p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> {service.phone}
              </p>
              {service.verifiedIdentity && (
                <p className="flex items-center gap-1.5 text-accent">
                  <ShieldCheck className="w-3.5 h-3.5" /> Identidad verificada
                </p>
              )}
            </div>
          </ElegantCard>
        ))}
      </div>
      <div className="max-w-5xl mx-auto">
        <ElegantPagination page={page} totalPages={totalPages} onChange={setPage} variant="numeric" />
      </div>

      <SectionTitle hint="Ocupación estimada">Estacionamientos</SectionTitle>
      <div className="grid gap-4 md:grid-cols-3 max-w-6xl mx-auto">
        {TOURIST_PARKINGS.map((parking, i) => (
          <ElegantCard key={parking.id} index={i}>
            <div className="flex items-start justify-between mb-3">
              <Car className="w-5 h-5 text-accent" />
              <Chip>{parking.occupancyStatus}</Chip>
            </div>
            <h3 className="font-display text-base font-semibold mb-2">{parking.name}</h3>
            <p className="text-xs text-muted-foreground mb-3">{parking.address}</p>
            <div className="h-1.5 rounded-full bg-border/50 overflow-hidden mb-2">
              <div
                className="h-full bg-accent"
                style={{ width: `${100 - Math.round((parking.spacesAvailable / parking.totalCapacity) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {parking.spacesAvailable} / {parking.totalCapacity} lugares libres · ${parking.hourlyRateMXN} MXN/h
            </p>
          </ElegantCard>
        ))}
      </div>

      <SectionTitle hint="Salidas diarias">Recorridos Guiados</SectionTitle>
      <div className="grid gap-4 md:grid-cols-3 max-w-6xl mx-auto">
        {GUIDED_TOURS.map((tour, i) => (
          <ElegantCard key={tour.id} index={i}>
            <div className="flex items-start justify-between mb-3">
              <Bus className="w-5 h-5 text-gold" />
              <Chip>{tour.duration}</Chip>
            </div>
            <h3 className="font-display text-base font-semibold mb-2">{tour.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{tour.description}</p>
            <p className="text-[11px] text-muted-foreground border-t border-border/40 pt-3">
              <span className="font-display text-base text-gold">${tour.priceMXN} MXN</span> · {tour.schedule}
            </p>
          </ElegantCard>
        ))}
      </div>

      <SectionTitle hint="Certificado de Paste Auténtico">Cocinas de la Comarca</SectionTitle>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {GASTRONOMY_SPOTS.map((spot, i) => (
          <ElegantCard key={spot.id} index={i}>
            <div className="flex items-start justify-between mb-3">
              <UtensilsCrossed className="w-5 h-5 text-accent" />
              <Chip>{spot.type}</Chip>
            </div>
            <h3 className="font-display text-base font-semibold mb-1">{spot.name}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{spot.specialty}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {spot.recommendedDishes.map((dish) => (
                <Chip key={dish}>{dish}</Chip>
              ))}
            </div>
            <div className="text-[11px] text-muted-foreground border-t border-border/40 pt-3 space-y-1">
              <p className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-gold" /> {spot.rating}
                </span>
                <span>{spot.priceRange}</span>
                {spot.deliveryAvailable && <span className="text-accent">Entrega a domicilio</span>}
              </p>
              <p>{spot.hours}</p>
              <p>{spot.address}</p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> {spot.phone}
              </p>
              {spot.hasPasteCertificate && (
                <p className="flex items-center gap-1.5 text-accent">
                  <ShieldCheck className="w-3.5 h-3.5" /> Paste Auténtico certificado
                </p>
              )}
            </div>
          </ElegantCard>
        ))}
      </div>
    </ModuleShell>
  );
}
