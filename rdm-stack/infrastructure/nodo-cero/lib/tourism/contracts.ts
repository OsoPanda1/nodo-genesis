/* ================================================================== */
/* TURISMO — Contratos del catálogo turístico vivo de Real del Monte  */
/* ================================================================== */
/* El catálogo es la fuente única de datos de /turismo/*. Cada entidad */
/* hereda los campos transversales de procedencia y verificación:      */
/*                                                                     */
/*   status            — publicado / archivado / borrador / expirado    */
/*   source_url        — URL de la fuente primaria (SIC, municipio…)   */
/*   source_type       — sic | ruta-plata | municipio | unesco |        */
/*                       prensa | archivo | campo | oral               */
/*   source_contact    — contacto editorial de la fuente               */
/*   verified_at       — fecha de la última verificación               */
/*   verified_by       — responsable editorial                         */
/*   expires_at        — caducidad de la verificación (dato vivo)      */
/*   confidence_level  — verified | pending | contradictory |          */
/*                       historical                                   */
/*   created_at / updated_at / published_at                            */
/*                                                                     */
/* Un dato "vivo" caduca: si expires_at < hoy, deja de mostrarse como  */
/* confirmado hasta re-verificación. Los eventos con fechas pasadas    */
/* pasan a confidence_level = historical.                              */
/* ================================================================== */

import { z } from 'zod';

export const tourismStatusSchema = z.enum(['published', 'draft', 'archived', 'expired']);
export type TourismStatus = z.infer<typeof tourismStatusSchema>;

export const confidenceLevelSchema = z.enum(['verified', 'pending', 'contradictory', 'historical']);
export type ConfidenceLevel = z.infer<typeof confidenceLevelSchema>;

export const sourceTypeSchema = z.enum([
  'sic',
  'ruta-plata',
  'municipio',
  'unesco',
  'prensa',
  'archivo',
  'campo',
  'oral',
]);
export type SourceType = z.infer<typeof sourceTypeSchema>;

/* ------------------------------------------------------------------ */
/* Campos transversales de procedencia y verificación                  */
/* ------------------------------------------------------------------ */

export const provenanceFieldsSchema = z.object({
  status: tourismStatusSchema.default('published'),
  sourceUrl: z.string().url().optional(),
  sourceType: sourceTypeSchema.default('campo'),
  sourceContact: z.string().trim().max(120).optional(),
  verifiedAt: z.string().optional(),
  verifiedBy: z.string().trim().max(120).optional(),
  expiresAt: z.string().optional(),
  confidenceLevel: confidenceLevelSchema.default('pending'),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().optional(),
});

export type ProvenanceFields = z.infer<typeof provenanceFieldsSchema>;

/* ------------------------------------------------------------------ */
/* tourism_places — atractivos y sitios de interés                     */
/* ------------------------------------------------------------------ */

export const tourismCategorySchema = z.enum([
  'mina',
  'museo',
  'patrimonio',
  'iglesia',
  'plaza',
  'mirador',
  'bosque',
  'panteon',
  'centro-historico',
  'gastronomia',
  'hospedaje',
  'otro',
]);
export type TourismCategory = z.infer<typeof tourismCategorySchema>;

export const tourismPlaceSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().trim().min(1).max(160),
    shortName: z.string().trim().max(60).optional(),
    category: tourismCategorySchema,
    description: z.string().trim().min(1).max(1000),
    address: z.string().trim().max(200).optional(),
    coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
    admissionFee: z.string().trim().max(80).optional(),
    accessibility: z.boolean().default(false),
    hours: z
      .array(
        z.object({
          days: z.string().trim().min(1),
          open: z.string().trim().optional(),
          close: z.string().trim().optional(),
          closed: z.boolean().default(false),
        }),
      )
      .default([]),
    image: z.string().max(200).optional(),
    tags: z.array(z.string()).max(12).default([]),
  })
  .merge(provenanceFieldsSchema);

export type TourismPlace = z.infer<typeof tourismPlaceSchema>;

export const tourismPlaceQuerySchema = z.object({
  category: tourismCategorySchema.optional(),
  confidence: confidenceLevelSchema.optional(),
  q: z.string().trim().max(80).optional(),
});

export type TourismPlaceQuery = z.infer<typeof tourismPlaceQuerySchema>;

/* ------------------------------------------------------------------ */
/* tourism_events — festividades y eventos (con sesiones)              */
/* ------------------------------------------------------------------ */

export const tourismEventSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().trim().min(1).max(160),
    category: z.enum(['fiesta', 'gastronomico', 'musical', 'religioso', 'deportivo', 'feria']),
    place: z.string().trim().max(200),
    description: z.string().trim().min(1).max(1000),
    recurring: z.boolean().default(false),
    image: z.string().max(200).optional(),
    sessions: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().trim().max(120),
          startsAt: z.string().optional(),
          endsAt: z.string().optional(),
          admission: z.string().trim().max(80).optional(),
        }),
      )
      .default([]),
    tags: z.array(z.string()).max(12).default([]),
  })
  .merge(provenanceFieldsSchema);

export type TourismEvent = z.infer<typeof tourismEventSchema>;

export const tourismEventQuerySchema = z.object({
  category: tourismEventSchema.shape.category.optional(),
  confidence: confidenceLevelSchema.optional(),
  upcoming: z.boolean().optional(),
  q: z.string().trim().max(80).optional(),
});

export type TourismEventQuery = z.infer<typeof tourismEventQuerySchema>;

/* ------------------------------------------------------------------ */
/* tourism_routes — rutas con paradas (tourism_route_stops)            */
/* ------------------------------------------------------------------ */

export const tourismRouteSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().trim().min(1).max(160),
    duration: z.string().trim().max(80),
    distance: z.string().trim().max(40),
    difficulty: z.enum(['facil', 'moderada', 'exigente']),
    description: z.string().trim().min(1).max(1000),
    image: z.string().max(200).optional(),
    stops: z
      .array(
        z.object({
          order: z.number().int().nonnegative(),
          name: z.string().trim().min(1).max(160),
          placeId: z.string().optional(),
          note: z.string().trim().max(200).optional(),
        }),
      )
      .default([]),
    tags: z.array(z.string()).max(12).default([]),
  })
  .merge(provenanceFieldsSchema);

export type TourismRoute = z.infer<typeof tourismRouteSchema>;

export const tourismRouteQuerySchema = z.object({
  difficulty: tourismRouteSchema.shape.difficulty.optional(),
  confidence: confidenceLevelSchema.optional(),
  q: z.string().trim().max(80).optional(),
});

export type TourismRouteQuery = z.infer<typeof tourismRouteQuerySchema>;

/* ------------------------------------------------------------------ */
/* tourism_stories / tourism_legends — memoria oral y cultural         */
/* ------------------------------------------------------------------ */

export const tourismStorySchema = z
  .object({
    id: z.string().min(1),
    title: z.string().trim().min(1).max(160),
    kind: z.enum(['dicho', 'leyenda', 'oral', 'historia']),
    text: z.string().trim().min(1).max(1500),
    meaning: z.string().trim().max(400).optional(),
    origin: z.string().trim().max(200).optional(),
    tags: z.array(z.string()).max(12).default([]),
  })
  .merge(provenanceFieldsSchema);

export type TourismStory = z.infer<typeof tourismStorySchema>;

export const tourismStoryQuerySchema = z.object({
  kind: tourismStorySchema.shape.kind.optional(),
  confidence: confidenceLevelSchema.optional(),
  q: z.string().trim().max(80).optional(),
});

export type TourismStoryQuery = z.infer<typeof tourismStoryQuerySchema>;

/* ------------------------------------------------------------------ */
/* tourism_food_items — oferta gastronómica                           */
/* ------------------------------------------------------------------ */

export const tourismFoodItemSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(600),
    image: z.string().max(200).optional(),
    tags: z.array(z.string()).max(12).default([]),
  })
  .merge(provenanceFieldsSchema);

export type TourismFoodItem = z.infer<typeof tourismFoodItemSchema>;
