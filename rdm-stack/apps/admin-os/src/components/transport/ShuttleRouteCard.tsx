import { Bus, Clock, Calendar, Users, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ShuttleRoute {
  id: string;
  origin: string;
  destination: string;
  departure_time?: string | null;
  return_time?: string | null;
  price_per_person?: number | null;
  capacity?: number | null;
  days_of_week?: string[];
  company_name?: string;
}

export function ShuttleRouteCard({ route, onBook }: { route: ShuttleRoute; onBook?: () => void }) {
  return (
    <Card className="rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Bus className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-base text-foreground">{route.origin} → {route.destination}</h3>
            {route.company_name && <p className="text-xs text-muted-foreground">{route.company_name}</p>}
          </div>
          {route.price_per_person != null && (
            <Badge className="bg-accent/10 text-accent text-sm font-semibold">
              ${route.price_per_person} /persona
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {route.departure_time && (
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />Sale: {route.departure_time}</span>
          )}
          {route.return_time && (
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />Regresa: {route.return_time}</span>
          )}
          {route.capacity && (
            <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{route.capacity} lugares</span>
          )}
        </div>

        {route.days_of_week && route.days_of_week.length > 0 && (
          <div className="flex gap-1">
            {["lun","mar","mie","jue","vie","sab","dom"].map(day => (
              <span key={day} className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                route.days_of_week?.includes(day)
                  ? "bg-primary/10 text-primary font-medium"
                  : "bg-muted/50 text-muted-foreground/40"
              }`}>{day}</span>
            ))}
          </div>
        )}

        {onBook && (
          <Button onClick={onBook} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl">
            Reservar Lugar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
