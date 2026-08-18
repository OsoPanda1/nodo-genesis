export type MarkerType = "place" | "business";

export interface MapMarkerData {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  description: string;
  image: string;
  type: MarkerType;
  isPremium?: boolean;
  rating?: number;
  phone?: string;
  status: "Activo" | "En alta demanda" | "Verificado";
}

export interface MapViewportState {
  lat: number;
  lng: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

export const DEFAULT_MAP_VIEWPORT: MapViewportState = {
  lat: 20.1374,
  lng: -98.6732,
  zoom: 14,
  bearing: 0,
  pitch: 40,
};
