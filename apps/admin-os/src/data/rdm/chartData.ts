export interface VisitorFlowPoint {
  month: string;
  turistas: number;
  ciudadanos: number;
  pastesVendidos: number;
  fondoPatrimonioMXN: number;
  neblinaDias: number;
}

export const VISITOR_FLOW_DATA: VisitorFlowPoint[] = [
  { month: 'Ene', turistas: 12400, ciudadanos: 8900, pastesVendidos: 34200, fondoPatrimonioMXN: 14300, neblinaDias: 18 },
  { month: 'Feb', turistas: 11100, ciudadanos: 8600, pastesVendidos: 31000, fondoPatrimonioMXN: 12900, neblinaDias: 14 },
  { month: 'Mar', turistas: 15800, ciudadanos: 9100, pastesVendidos: 41500, fondoPatrimonioMXN: 18200, neblinaDias: 10 },
  { month: 'Abr', turistas: 18900, ciudadanos: 9400, pastesVendidos: 49800, fondoPatrimonioMXN: 21500, neblinaDias: 8 },
  { month: 'May', turistas: 14200, ciudadanos: 9000, pastesVendidos: 38100, fondoPatrimonioMXN: 16400, neblinaDias: 12 },
  { month: 'Jun', turistas: 13500, ciudadanos: 9200, pastesVendidos: 35900, fondoPatrimonioMXN: 15100, neblinaDias: 16 },
  { month: 'Jul', turistas: 19800, ciudadanos: 9800, pastesVendidos: 52000, fondoPatrimonioMXN: 23400, neblinaDias: 20 },
  { month: 'Ago', turistas: 17600, ciudadanos: 9600, pastesVendidos: 46200, fondoPatrimonioMXN: 20100, neblinaDias: 22 },
  { month: 'Sep', turistas: 16200, ciudadanos: 9300, pastesVendidos: 42900, fondoPatrimonioMXN: 18800, neblinaDias: 19 },
  { month: 'Oct', turistas: 28500, ciudadanos: 10200, pastesVendidos: 78000, fondoPatrimonioMXN: 35600, neblinaDias: 15 }, // Festival del Paste Peak
  { month: 'Nov', turistas: 22100, ciudadanos: 9900, pastesVendidos: 58400, fondoPatrimonioMXN: 26800, neblinaDias: 17 },
  { month: 'Dic', turistas: 26400, ciudadanos: 10500, pastesVendidos: 69200, fondoPatrimonioMXN: 31200, neblinaDias: 21 }
];

export interface ElevationPoint {
  km: number;
  locationName: string;
  altitudeMsnm: number;
  poiType: 'MINA' | 'PANTEON' | 'PLAZA' | 'BOSQUE';
}

export const ROUTE_ELEVATION_DATA: Record<string, ElevationPoint[]> = {
  'ruta-plata-minas': [
    { km: 0.0, locationName: 'Plaza Juárez / Centro (Inicio)', altitudeMsnm: 2760, poiType: 'PLAZA' },
    { km: 0.8, locationName: 'Mina de Acosta (Socavón)', altitudeMsnm: 2760, poiType: 'MINA' },
    { km: 1.6, locationName: 'Barrio de San Nicolás', altitudeMsnm: 2772, poiType: 'PLAZA' },
    { km: 2.4, locationName: 'Mina La Dificultad (Chimenea)', altitudeMsnm: 2780, poiType: 'MINA' },
    { km: 3.2, locationName: 'Mirador del Socavón (Fin)', altitudeMsnm: 2795, poiType: 'BOSQUE' }
  ],
  'ruta-gastronomic-paste': [
    { km: 0.0, locationName: 'Museo del Paste (Inicio)', altitudeMsnm: 2750, poiType: 'PLAZA' },
    { km: 0.5, locationName: 'Calle Real de Minas', altitudeMsnm: 2755, poiType: 'PLAZA' },
    { km: 1.2, locationName: 'Pastes El Portal / Centro', altitudeMsnm: 2760, poiType: 'PLAZA' },
    { km: 1.8, locationName: 'Plaza Principal Juárez (Fin)', altitudeMsnm: 2762, poiType: 'PLAZA' }
  ],
  'ruta-leyendas-neblina': [
    { km: 0.0, locationName: 'Plaza Juárez (Inicio)', altitudeMsnm: 2760, poiType: 'PLAZA' },
    { km: 1.2, locationName: 'Ascenso Cerro del Judío', altitudeMsnm: 2788, poiType: 'BOSQUE' },
    { km: 2.0, locationName: 'Panteón Inglés (Tumbas)', altitudeMsnm: 2800, poiType: 'PANTEON' },
    { km: 3.2, locationName: 'Sendero de Oyameles', altitudeMsnm: 2835, poiType: 'BOSQUE' },
    { km: 4.5, locationName: 'Presa El Cedral (Fin)', altitudeMsnm: 2850, poiType: 'BOSQUE' }
  ]
};

export interface RouteHeatmapPoint {
  hour: string;
  peatonesCentro: number;
  peatonesMinas: number;
  peatonesCedral: number;
}

export const HOURLY_HEATMAP_DATA: RouteHeatmapPoint[] = [
  { hour: '08:00', peatonesCentro: 120, peatonesMinas: 45, peatonesCedral: 60 },
  { hour: '10:00', peatonesCentro: 480, peatonesMinas: 210, peatonesCedral: 180 },
  { hour: '12:00', peatonesCentro: 950, peatonesMinas: 520, peatonesCedral: 410 },
  { hour: '14:00', peatonesCentro: 1420, peatonesMinas: 680, peatonesCedral: 580 },
  { hour: '16:00', peatonesCentro: 1680, peatonesMinas: 740, peatonesCedral: 690 },
  { hour: '18:00', peatonesCentro: 1290, peatonesMinas: 380, peatonesCedral: 310 },
  { hour: '20:00', peatonesCentro: 850, peatonesMinas: 120, peatonesCedral: 80 }
];

export interface HeritageCategoryDistribution {
  category: string;
  monto: number;
  porcentaje: number;
  color: string;
}

export const HERITAGE_DISTRIBUTION_DATA: HeritageCategoryDistribution[] = [
  { category: 'Pastes Tradicionales', monto: 7410, porcentaje: 50, color: '#facc15' },
  { category: 'Joyería & Plata .925', monto: 4446, porcentaje: 30, color: '#38bdf8' },
  { category: 'Tours & Experiencias', monto: 2223, porcentaje: 15, color: '#10b981' },
  { category: 'Hospedaje & Cabañas', monto: 741, porcentaje: 5, color: '#a855f7' }
];
