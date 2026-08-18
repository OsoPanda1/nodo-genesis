import { Car, Users, Phone, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TransportProvider {
  id: string;
  type: string;
  name: string;
  plate?: string | null;
  capacity?: number | null;
  service_area?: string | null;
  phone?: string | null;
}

export function TransportCard({ provider }: { provider: TransportProvider }) {
  return (
    <Card className="rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Car className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-base text-foreground">{provider.name}</h3>
              {provider.plate && <p className="text-xs text-muted-foreground font-mono">{provider.plate}</p>}
            </div>
          </div>
          <Badge variant="secondary" className="capitalize">{provider.type}</Badge>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {provider.capacity && (
            <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{provider.capacity} pasajeros</span>
          )}
          {provider.service_area && (
            <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{provider.service_area}</span>
          )}
          {provider.phone && (
            <a href={`tel:${provider.phone}`} className="inline-flex items-center gap-1 hover:text-accent transition-colors">
              <Phone className="h-3 w-3" />{provider.phone}
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
