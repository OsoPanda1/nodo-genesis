'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { CityIOCOverview } from '@/components/city/CityIOCOverview';
import { CityScorecardPanel } from '@/components/city/CityScorecardPanel';
import { EmergencyCommandPanel } from '@/components/city/EmergencyCommandPanel';
import { IncidentTimeline } from '@/components/city/IncidentTimeline';
import { InfrastructureHealthGrid } from '@/components/city/InfrastructureHealthGrid';
import { MobilityControlPanel } from '@/components/city/MobilityControlPanel';
import { UrbanBrainMap } from '@/components/city/UrbanBrainMap';
import type { CityIocState, CityIncident } from '@/lib/city/city-types';
import type { MobilityState } from '@/lib/city/city-mobility-engine';
import type { InfrastructureHealth } from '@/lib/city/city-infrastructure-engine';
import type { CityScorecard } from '@/lib/city/city-scorecard';

export function CityDashboard() {
  const [ioc, setIoc] = useState<CityIocState | null>(null);
  const [incidents, setIncidents] = useState<CityIncident[]>([]);
  const [mobility, setMobility] = useState<MobilityState | null>(null);
  const [health, setHealth] = useState<InfrastructureHealth | null>(null);
  const [scorecard, setScorecard] = useState<CityScorecard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/city/ioc').then((r) => r.json()),
      fetch('/api/city/incidents').then((r) => r.json()),
      fetch('/api/city/mobility').then((r) => r.json()),
      fetch('/api/city/infrastructure').then((r) => r.json()),
      fetch('/api/city/scorecard').then((r) => r.json()),
    ])
      .then(([iocData, incidentsData, mobilityData, infraData, scorecardData]) => {
        setIoc(iocData.state ?? null);
        setIncidents(incidentsData.incidents ?? []);
        setMobility(mobilityData.mobility ?? null);
        setHealth(infraData.health ?? null);
        setScorecard(scorecardData.scorecard ?? null);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-xs text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando estado de la ciudad...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-50">Ciudad IOC</h1>
        <p className="mt-1 text-sm text-slate-400">
          Centro de operaciones: incidentes, movilidad, infraestructura, emergencias y scorecard de la ciudad en tiempo real.
        </p>
      </header>

      {ioc && <CityIOCOverview state={ioc} />}

      <div className="grid gap-4 lg:grid-cols-3">
        <UrbanBrainMap incidents={incidents} activeEntityIds={incidents.flatMap((i) => i.relatedEntityIds)} />
        <EmergencyCommandPanel incidents={incidents} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {health && <InfrastructureHealthGrid health={health} />}
        {mobility && <MobilityControlPanel mobility={mobility} />}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <IncidentTimeline incidents={incidents} />
        {scorecard && <CityScorecardPanel scorecard={scorecard} />}
      </div>
    </div>
  );
}
