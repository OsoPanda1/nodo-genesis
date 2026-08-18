/* ================================================================== */
/* IDENTIDAD YUN — Contratos zod del dominio                           */
/* ================================================================== */
/* Registro de vecinos y comercios del territorio. Los cuerpos de las  */
/* rutas /api/auth/* se validan con estos contratos (única fuente de   */
/* verdad); nunca validación manual duplicada.                         */
/* ================================================================== */

import { z } from 'zod';

export const IDENTITY_ROLES = ['vecino', 'artesano', 'comerciante', 'operador', 'turista'] as const;

/* ------------------------------------------------------------------ */
/* Planes de suscripción del territorio                                */
/* ------------------------------------------------------------------ */
/* Comercios: sin pago no hay alta ni publicación. Usuarios: el plan   */
/* premium desbloquea cupones, descuentos y monetización de la         */
/* gamificación. Los precios son la fuente de verdad para el gating.   */
/* ------------------------------------------------------------------ */
export const BUSINESS_PLANS = {
  mensual: { id: 'mensual', label: '1 mes', price: 250, months: 1 },
  semestral: { id: 'semestral', label: '6 meses', price: 1200, months: 6 },
} as const;

export type BusinessPlanId = keyof typeof BUSINESS_PLANS;
export const BUSINESS_PLAN_IDS = Object.keys(BUSINESS_PLANS) as [BusinessPlanId, ...BusinessPlanId[]];

export const PREMIUM_USER_PLAN = { id: 'premium', label: 'Premium', price: 129, months: 1 } as const;

export const WEEKDAYS = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const BUSINESS_CATEGORIES = [
  'Gastronomía',
  'Platería',
  'Artesanías',
  'Hospedaje',
  'Turismo',
  'Café / Bar',
  'Panadería',
  'Comercio',
  'Servicios',
  'Otro',
] as const;

/** Redes sociales del comercio (todas opcionales). */
export const socialsSchema = z
  .object({
    facebook: z.string().trim().max(160).optional(),
    instagram: z.string().trim().max(160).optional(),
    tiktok: z.string().trim().max(160).optional(),
    whatsapp: z.string().trim().max(40).optional(),
  })
  .optional();

/** Geolocalización del comercio (opcional pero recomendada para el mapa). */
export const geoSchema = z
  .object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  })
  .optional();

/** Comprobante de pago de suscripción validado por el motor de pagos. */
export const businessSubscriptionSchema = z.object({
  plan: z.enum(BUSINESS_PLAN_IDS),
  /** Referencia de pago (RDM-...) que el servidor verifica contra el ledger. */
  paymentRef: z.string().trim().min(4).max(64),
});

export type BusinessSubscription = z.infer<typeof businessSubscriptionSchema>;

/* ------------------------------------------------------------------ */
/* Registro de vecino (usuario)                                        */
/* ------------------------------------------------------------------ */
export const registerUserSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().max(120).refine(v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), 'email inválido'),
  role: z.enum(IDENTITY_ROLES).default('vecino'),
  occupation: z.string().trim().max(80).optional(),
  neighborhood: z.string().trim().max(80).optional(),
  interests: z.array(z.string().trim().min(1).max(40)).max(12).optional(),
  /** Si el usuario contrata Premium (129 MXN/mes) incluye el pago verificable. */
  premium: z
    .object({ paymentRef: z.string().trim().min(4).max(64) })
    .optional(),
  acceptTerms: z.boolean().refine(v => v === true, 'debe aceptar términos'),
});

/* ------------------------------------------------------------------ */
/* Registro de negocio (comercio del territorio)                       */
/* ------------------------------------------------------------------ */
export const registerBusinessSchema = z.object({
  /* Datos del propietario */
  ownerName: z.string().trim().min(2).max(80),
  ownerPhone: z.string().trim().min(7).max(24),
  email: z.string().trim().toLowerCase().max(120).refine(v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), 'email inválido'),

  /* Datos del comercio */
  businessName: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(60),
  services: z.string().trim().min(2).max(160),
  description: z.string().trim().max(250),
  address: z.string().trim().max(160).optional(),
  geo: geoSchema,
  hours: z.string().trim().min(2).max(120),
  serviceDays: z.array(z.enum(WEEKDAYS)).min(1).max(7),
  offers: z.string().trim().max(160).optional(),
  homeDelivery: z.boolean().default(false),
  /* Hasta 3 fotos de presentación (al menos una). Se guardan como URL o
     ruta de imagen (el cuerpo de la ruta está acotado a 16KB, por eso no
     se incrustan datos base64). */
  photos: z.array(z.string().trim().min(3).max(400)).min(1).max(3),
  contactPhone: z.string().trim().min(7).max(48),
  website: z.string().trim().max(200).optional(),
  socials: socialsSchema,

  /* Suscripción obligatoria: sin pago no hay alta ni publicación. */
  subscription: businessSubscriptionSchema,

  acceptTerms: z.boolean().refine(v => v === true, 'debe aceptar términos'),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type RegisterBusinessInput = z.infer<typeof registerBusinessSchema>;

/** Entrada unificada de la ruta (kind discrimina vecino/negocio). */
export const registerSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('user'), ...registerUserSchema.shape }),
  z.object({ kind: z.literal('business'), ...registerBusinessSchema.shape }),
]);

export type RegisterInput = z.infer<typeof registerSchema>;

/** Salida del registro (nunca expone datos sensibles). */
export interface RegisteredUser {
  id: string;
  kind: 'user' | 'business';
  name: string;
  email: string;
  createdAt: number;
}
