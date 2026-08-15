import { motion } from "framer-motion";
import { Store, Star, ExternalLink } from "lucide-react";

const BUSINESSES = [
  { id: "1", name: "Pastes El Portal", type: "Restaurante", rating: 4.7, status: "Abierto", revenue: "+12%" },
  { id: "2", name: "Hotel Mina Real", type: "Hospedaje", rating: 4.5, status: "Abierto", revenue: "+8%" },
  { id: "3", name: "Artesanías del Monte", type: "Tienda", rating: 4.3, status: "Abierto", revenue: "+15%" },
  { id: "4", name: "Café La Bruma", type: "Café", rating: 4.6, status: "Abierto", revenue: "+22%" },
  { id: "5", name: "Tours Mineros RDM", type: "Turismo", rating: 4.8, status: "Abierto", revenue: "+18%" },
  { id: "6", name: "Pulquería El Chato", type: "Bar", rating: 4.2, status: "Cerrado", revenue: "+5%" },
];

export function CommerceView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold tracking-tight">Economía Local</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Red de comercios integrados al ecosistema digital
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Comercios Activos", value: "6" },
          { label: "Flujo Mensual", value: "+14%" },
          { label: "Redistribución", value: "Equitativa" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4 text-center"
          >
            <p className="text-xl font-semibold">{item.value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Businesses List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Negocio</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Tipo</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Rating</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Estado</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Tendencia</th>
            </tr>
          </thead>
          <tbody>
            {BUSINESSES.map((biz, i) => (
              <motion.tr
                key={biz.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 font-medium flex items-center gap-2">
                  <Store className="w-3.5 h-3.5 text-secondary" />
                  {biz.name}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{biz.type}</td>
                <td className="px-4 py-3 text-accent">★ {biz.rating}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    biz.status === "Abierto" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                  }`}>
                    {biz.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-success text-xs font-medium">{biz.revenue}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
