import { useMemo, useState } from "react";
import { Store, Star, ShieldCheck, Phone, Leaf, Package, Truck } from "lucide-react";
import { ModuleShell, SectionTitle, ElegantCard, Chip } from "@/components/ModuleShell";
import { ElegantPagination } from "@/components/ElegantPagination";
import { ARTISAN_SHOPS } from "@/data/rdm/realDelMonteData";
import { STORE_PRODUCTS, SAMPLE_SHIPMENT } from "@/data/rdm/modulesData";

const ALL_PRODUCTS = ARTISAN_SHOPS.flatMap((shop) => shop.products);
const PAGE_SIZE = 6;
const CATEGORIES = ["Todas", ...Array.from(new Set(ALL_PRODUCTS.map((p) => p.category)))];

export default function TradeNode() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [page, setPage] = useState(0);

  const filtered = useMemo(
    () =>
      ALL_PRODUCTS.filter((product) => {
        const text = `${product.name} ${product.description} ${product.shopName}`.toLowerCase();
        return (
          (category === "Todas" || product.category === category) &&
          (!query || text.includes(query.toLowerCase()))
        );
      }),
    [query, category],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <ModuleShell
      eyebrow="Pilar 3 · RDM TradeNode"
      title="Comercio"
      highlight="Soberano"
      subtitle="Padrón verificado de pastequerías, plateros y anfitriones locales. Cada compra aporta al Fondo de Patrimonio."
      seoTitle="TradeNode · Comercio verificado de Real del Monte"
      seoDescription="Directorio soberano de pastequerías, platería .925, hospedaje y experiencias de Real del Monte con fondo patrimonial por cada compra."
    >
      <div className="max-w-5xl mx-auto mb-8 grid gap-3 md:grid-cols-[1fr_240px_120px]">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="Buscar pastes, plata, tours…"
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
          {filtered.length} productos
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {paged.map((product, i) => (
          <ElegantCard key={product.id} index={i}>
            <div className="flex items-start justify-between mb-3">
              <Package className="w-5 h-5 text-accent" />
              <Chip>{product.category}</Chip>
            </div>
            <h3 className="font-display text-base font-semibold mb-1">{product.name}</h3>
            <p className="text-[11px] text-muted-foreground mb-2">{product.shopName}</p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{product.description}</p>
            <div className="flex items-center justify-between border-t border-border/40 pt-3">
              <span className="font-display text-lg font-semibold text-gold">
                ${product.price} <span className="text-[11px] text-muted-foreground">MXN · {product.unit}</span>
              </span>
              <span className="text-[10px] flex items-center gap-1 text-accent">
                <Leaf className="w-3.5 h-3.5" /> {product.heritageFundPercent}% patrimonio
              </span>
            </div>
          </ElegantCard>
        ))}
      </div>
      <div className="max-w-5xl mx-auto">
        <ElegantPagination page={page} totalPages={totalPages} onChange={setPage} variant="numeric" />
      </div>

      <SectionTitle hint={`${ARTISAN_SHOPS.length} negocios verificados`}>Padrón de Comercios</SectionTitle>
      <div className="grid gap-4 md:grid-cols-3 max-w-6xl mx-auto">
        {ARTISAN_SHOPS.map((shop, i) => (
          <ElegantCard key={shop.id} index={i}>
            <div className="flex items-start justify-between mb-3">
              <Store className="w-5 h-5 text-gold" />
              <Chip>{shop.category}</Chip>
            </div>
            <h3 className="font-display text-base font-semibold mb-2">{shop.name}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{shop.description}</p>
            <div className="text-[11px] text-muted-foreground space-y-1 border-t border-border/40 pt-3">
              <p className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-gold" /> {shop.rating} · {shop.ownerName}
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> {shop.phone}
              </p>
              <p>{shop.address}</p>
              {shop.verifiedBadge && (
                <p className="flex items-center gap-1.5 text-accent">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verificado por el padrón soberano
                </p>
              )}
            </div>
          </ElegantCard>
        ))}
      </div>

      <SectionTitle hint="Envíos desde la montaña">Tienda Nativa & Logística</SectionTitle>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {STORE_PRODUCTS.map((product, i) => (
          <ElegantCard key={product.id} index={i}>
            <div className="flex items-start justify-between mb-3">
              <Package className="w-5 h-5 text-accent" />
              <Chip>{product.category}</Chip>
            </div>
            <h3 className="font-display text-base font-semibold mb-1">{product.name}</h3>
            <p className="text-[11px] text-muted-foreground mb-2">{product.artisan}</p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{product.description}</p>
            <div className="text-[11px] text-muted-foreground border-t border-border/40 pt-3 flex items-center justify-between">
              <span className="font-display text-base text-gold">${product.priceMXN} MXN</span>
              <span>
                {product.stock} en stock · {product.shippingWeightKg} kg
              </span>
            </div>
          </ElegantCard>
        ))}
      </div>

      <div className="max-w-3xl mx-auto mt-8 rounded-2xl border border-border/40 bg-card/40 p-5">
        <h3 className="font-display text-base font-semibold mb-3 flex items-center gap-2">
          <Truck className="w-4 h-4 text-accent" /> Seguimiento de envío · {SAMPLE_SHIPMENT.trackingId}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          {SAMPLE_SHIPMENT.carrier} · {SAMPLE_SHIPMENT.status} · entrega estimada {SAMPLE_SHIPMENT.estimatedDelivery}
        </p>
        <ol className="space-y-2 border-l border-border/50 pl-4">
          {SAMPLE_SHIPMENT.updates.map((u) => (
            <li key={u.date} className="text-[11px] text-muted-foreground">
              <span className="text-foreground/80 font-mono mr-2">{u.date}</span>
              {u.message}
            </li>
          ))}
        </ol>
      </div>
    </ModuleShell>
  );
}
