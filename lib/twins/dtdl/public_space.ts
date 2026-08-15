export const PUBLIC_SPACE_MODEL = {
  '@context': 'dtmi:dtdl:context;3',
  '@id': 'dtmi:rdm:twin:PublicSpace;1',
  '@type': 'Interface',
  displayName: 'Espacio Público RDM',
  description: 'Plaza, mirador, atrio o jardín del territorio.',
  contents: [
    { '@type': 'Property', name: 'surfaceM2', schema: 'double' },
    { '@type': 'Property', name: 'capacity', schema: 'integer' },
    { '@type': 'Property', name: 'accessible', schema: 'boolean' },
    { '@type': 'Telemetry', name: 'visitorsNow', schema: 'integer' },
    { '@type': 'Telemetry', name: 'noiseDb', schema: 'double' },
    {
      '@type': 'Relationship',
      name: 'contains',
      target: 'dtmi:rdm:twin:Building;1',
    },
  ],
} as const;
