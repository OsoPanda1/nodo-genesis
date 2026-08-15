export const ENERGY_GRID_MODEL = {
  '@context': 'dtmi:dtdl:context;3',
  '@id': 'dtmi:rdm:twin:EnergyGrid;1',
  '@type': 'Interface',
  displayName: 'Red Eléctrica RDM',
  description: 'Subestación, alimentadores y cargas del territorio.',
  contents: [
    { '@type': 'Property', name: 'capacityKw', schema: 'double' },
    { '@type': 'Property', name: 'feederCount', schema: 'integer' },
    { '@type': 'Telemetry', name: 'loadKw', schema: 'double' },
    { '@type': 'Telemetry', name: 'frequencyHz', schema: 'double' },
    { '@type': 'Telemetry', name: 'voltageV', schema: 'double' },
    {
      '@type': 'Relationship',
      name: 'feeds',
      target: 'dtmi:rdm:twin:Building;1',
    },
  ],
} as const;
