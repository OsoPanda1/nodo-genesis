import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_MAP_VIEWPORT, type MapViewportState } from "@/features/places/mapTypes";

interface MapSyncContextValue {
  viewport: MapViewportState;
  syncFrom2D: (next: Partial<MapViewportState>) => void;
  syncFrom3D: (next: Partial<MapViewportState>) => void;
  setViewport: React.Dispatch<React.SetStateAction<MapViewportState>>;
}

const MapSyncContext = createContext<MapSyncContextValue | null>(null);

export function MapSyncProvider({
  children,
  initial = DEFAULT_MAP_VIEWPORT,
}: {
  children: ReactNode;
  initial?: MapViewportState;
}) {
  const [viewport, setViewport] = useState<MapViewportState>(initial);

  const syncFrom2D = useCallback((next: Partial<MapViewportState>) => {
    setViewport((prev) => ({ ...prev, ...next }));
  }, []);

  const syncFrom3D = useCallback((next: Partial<MapViewportState>) => {
    setViewport((prev) => ({ ...prev, ...next }));
  }, []);

  const value = useMemo(
    () => ({ viewport, syncFrom2D, syncFrom3D, setViewport }),
    [viewport, syncFrom2D, syncFrom3D],
  );

  return <MapSyncContext.Provider value={value}>{children}</MapSyncContext.Provider>;
}

export function useMapSync() {
  const context = useContext(MapSyncContext);
  if (!context) {
    throw new Error("useMapSync must be used within MapSyncProvider");
  }

  return context;
}
