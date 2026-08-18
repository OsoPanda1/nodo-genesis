export const VEHICLE_MODEL = {
  '@context': 'dtmi:dtdl:context;3',
  '@id': 'dtmi:rdm:twin:Vehicle;1',
  '@type': 'Interface',
  displayName: 'Vehículo Urbano',
  description: 'Autobús turístico o vehículo municipal de servicio.',
  contents: [
    { '@type': 'Property', name: 'routeId', schema: 'string' },
    { '@type': 'Property', name: 'capacity', schema: 'integer' },
    { '@type': 'Telemetry', name: 'speedKmh', schema: 'double' },
    { '@type': 'Telemetry', name: 'fuelPercent', schema: 'double' },
    { '@type': 'Telemetry', name: 'gpsLat', schema: 'double' },
    { '@type': 'Telemetry', name: 'gpsLng', schema: 'double' },
    {
      '@type': 'Relationship',
      name: 'serves',
      target: 'dtmi:rdm:twin:CityService;1',
    },
  ],
} as const;
