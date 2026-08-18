/* ================================================================== */
/* PAGOS YUN — Contratos zod del dominio                               */
/* ================================================================== */
/* Única fuente de verdad sobre qué forma tienen las peticiones de     */
/* pago de usuarios (donación/compra) y de retiro de comercios.        */
/* ================================================================== */

import { z } from 'zod';

export const PAYMENT_METHODS = ['card', 'paypal', 'crypto', 'spei'] as const;
export const PAYMENT_TYPES = ['donation', 'purchase', 'subscription'] as const;
export const PAYOUT_METHODS = ['spei', 'paypal'] as const;
export const CURRENCIES = ['MXN', 'USD'] as const;

/** Pago de usuario: donación, compra o suscripción (montos enteros). */
export const userPaymentSchema = z.object({
  type: z.enum(PAYMENT_TYPES).default('donation'),
  amount: z.number().int().min(1).max(100000),
  currency: z.enum(CURRENCIES).default('MXN'),
  method: z.enum(PAYMENT_METHODS),
  concept: z.string().trim().max(80).optional(),
  merchantId: z.string().trim().max(64).optional(),
  /** Clave de idempotencia: reenvíos con la misma clave no duplican el
   *  cargo (protege contra doble clic y reintentos de red). */
  idempotencyKey: z.string().trim().min(8).max(64).optional(),
});

/** Solicitud de retiro de un comercio del territorio. */
export const merchantPayoutSchema = z.object({
  merchantId: z.string().trim().min(3).max(64),
  amount: z.number().int().min(1).max(1_000_000),
  method: z.enum(PAYOUT_METHODS).default('spei'),
  concept: z.string().trim().max(80).optional(),
});

export type UserPayment = z.infer<typeof userPaymentSchema>;
export type MerchantPayout = z.infer<typeof merchantPayoutSchema>;
