'use client';

import { Suspense, lazy } from 'react';
import { LiveSystems } from '@/components/monitoring/LiveSystems';
import { AdminMonitor } from '@/components/monitoring/AdminMonitor';

/* El SystemMonitor se carga en el plano 2 (lazy) para que el plano 1
   (los sistemas en vivo) se renderice al instante. */
const SystemMonitor = lazy(() =>
  import('@/components/monitoring/SystemMonitor').then(m => ({ default: m.SystemMonitor })),
);

export default function MonitorPage() {
  return (
    <div className="plano-tecnico p-4 md:p-8 min-h-[calc(100vh-4rem)] space-y-6">
      <LiveSystems />
      <AdminMonitor />
      <Suspense
        fallback={
          <div className="glass-panel animate-pulse rounded-2xl p-6">
            <div className="mb-2 h-4 w-1/3 rounded bg-[#c8a356]/20" />
            <div className="h-40 rounded bg-[#c8a356]/10" />
          </div>
        }
      >
        <SystemMonitor />
      </Suspense>
    </div>
  );
}
