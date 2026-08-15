import { TwinGraphView } from '@/components/twins/TwinGraphView';
import { TwinModelEditor } from '@/components/twins/TwinModelEditor';
import { TwinInspectorPanel } from '@/components/twins/TwinInspectorPanel';
import { TwinTelemetryStrip } from '@/components/twins/TwinTelemetryStrip';
import { TwinRelationDrawer } from '@/components/twins/TwinRelationDrawer';

export default function TwinsPage() {
  return (
    <div className="plano-tecnico p-6 md:p-10 min-h-[calc(100vh-4rem)] space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-50">Gemelo Territorial</h1>
        <p className="mt-1 text-sm text-slate-400">
          Modelos DTDL, entidades NGSI-LD, grafo de relaciones y simulación ligera en tiempo real del territorio.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        <TwinTelemetryStrip />
        <TwinInspectorPanel />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <TwinGraphView />
        <TwinModelEditor />
      </div>
      <TwinRelationDrawer />
    </div>
  );
}
