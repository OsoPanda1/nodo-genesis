export const WATER_NETWORK_MODEL = {
  '@context': 'dtmi:dtdl:context;3',
  '@id': 'dtmi:rdm:twin:WaterNetwork;1',
  '@type': 'Interface',
  displayName: 'Red de Agua RDM',
  description: 'Tanque, bomba y válvulas de la red hidráulica del territorio.',
  contents: [
    { '@type': 'Property', name: 'capacityLiters', schema: 'double' },
    { '@type': 'Property', name: 'sourceName', schema: 'string' },
    { '@type': 'Telemetry', name: 'pressureBar', schema: 'double' },
    { '@type': 'Telemetry', name: 'flowLps', schema: 'double' },
    { '@type': 'Telemetry', name: 'levelPercent', schema: 'double' },
    {
      '@type': 'Relationship',
      name: 'feeds',
      target: 'dtmi:rdm:twin:Building;1',
    },
  ],
} as const;
