'use client';

import dynamic from 'next/dynamic';
import { Suspense, type ComponentType } from 'react';

/* ================================================================== */
/* LAZY PLANE — carga diferida de componentes pesados                 */
/* ================================================================== */
/* Carga un componente en el plano 2 (segundo plano) con fallback      */
/* esqueleto en el plano 1, y un Suspense para el plano 3.             */
/* ================================================================== */

export function LazyPlane<T extends ComponentType<Record<string, never>>>(
  loader: () => Promise<{ default: T }>,
  fallback?: React.ReactNode,
): ComponentType {
  const LazyComponent = dynamic(loader, { ssr: false });

  return function LazyPlaneComponent() {
    return (
      <Suspense
        fallback={
          fallback ?? (
            <div className="glass-panel animate-pulse rounded-2xl p-6">
              <div className="mb-2 h-4 w-1/3 rounded bg-[#c8a356]/20" />
              <div className="h-24 rounded bg-[#c8a356]/10" />
            </div>
          )
        }
      >
        <LazyComponent />
      </Suspense>
    );
  };
}
