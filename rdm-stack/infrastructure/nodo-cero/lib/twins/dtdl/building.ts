export const BUILDING_MODEL = {
  '@context': 'dtmi:dtdl:context;3',
  '@id': 'dtmi:rdm:twin:Building;1',
  '@type': 'Interface',
  displayName: 'Edificio RDM',
  description: 'Modelo de edificio del territorio (museo, palenque, casa de minería).',
  contents: [
    { '@type': 'Property', name: 'floorAreaM2', schema: 'double' },
    { '@type': 'Property', name: 'occupancy', schema: 'integer' },
    { '@type': 'Property', name: 'heritageGrade', schema: 'string' },
    { '@type': 'Telemetry', name: 'temperature', schema: 'double' },
    { '@type': 'Telemetry', name: 'humidity', schema: 'double' },
    { '@type': 'Telemetry', name: 'powerKw', schema: 'double' },
    {
      '@type': 'Relationship',
      name: 'locatedIn',
      target: 'dtmi:rdm:twin:PublicSpace;1',
    },
    {
      '@type': 'Relationship',
      name: 'serves',
      target: 'dtmi:rdm:twin:CityService;1',
    },
  ],
} as const;
