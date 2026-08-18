/* ================================================================== */
/* IDENTITY YUN — Contratos del registro soberano de API keys         */
/* ================================================================== */
/* El Nodo Cero gestiona sus propias credenciales de acceso (API keys */
/* nativas): creación, rotación, revocación e introspección sin depender */
/* de un proveedor externo. Cada clave:                                */
/*                                                                     */
/*   - Se almacena SIEMPRE como hash (scrypt) — jamás en claro.        */
/*   - Porta scopes explícitos (recorte de privilegios).               */
/*   - Admite expiración, rotación y revocación inmediata.             */
/*   - Emite telemetría al bus YUN (identidad.key.created / revoked /  */
/*     rotated / introspected) con traceId/correlationId.              */
/*                                                                     */
/* Este contrato es la ÚNICA fuente de verdad de formas válidas para   */
/* el registro de identidad.                                           */
/* ================================================================== */

import { z } from 'zod';

export const identityScopeSchema = z.enum([
  'turismo:read',
  'turismo:write',
  'archivo:read',
  'archivo:write',
  'gemelos:read',
  'gemelos:write',
  'ciudad:read',
  'ciudad:write',
  'gamificacion:read',
  'gamificacion:write',
  'mercado:read',
  'mercado:write',
  'pagos:read',
  'pagos:write',
  'citemesh:read',
  'citemesh:write',
  'gemet:read',
  'gemet:write',
  'yun:read',
  'yun:write',
  'hepta:read',
  'hepta:write',
  'isa:read',
  'isa:write',
  'mexa:sign',
  'mexa:verify',
  'isabella:chat',
  'isabella:gateway',
  'monitor:read',
  'admin:keys',
  'admin:all',
]);

export type IdentityScope = z.infer<typeof identityScopeSchema>;

export const IDENTITY_SCOPES: IdentityScope[] = identityScopeSchema.options;

/* ------------------------------------------------------------------ */
/* Creación de clave                                                   */
/* ------------------------------------------------------------------ */

export const createApiKeySchema = z.object({
  name: z.string().trim().min(1, 'name es requerido').max(80),
  description: z.string().trim().max(300).optional().default(''),
  scopes: z.array(identityScopeSchema).min(1, 'al menos un scope es requerido').max(8),
  expiresInDays: z.number().int().min(1).max(365).optional(),
  owner: z.string().trim().max(120).optional().default('operador'),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;

/* ------------------------------------------------------------------ */
/* Rotación / revocación                                               */
/* ------------------------------------------------------------------ */

export const rotateApiKeySchema = z.object({
  reason: z.string().trim().max(200).optional().default('rotación programada'),
});

export type RotateApiKeyInput = z.infer<typeof rotateApiKeySchema>;

export const revokeApiKeySchema = z.object({
  reason: z.string().trim().max(200).optional().default('revocación administrativa'),
});

export type RevokeApiKeyInput = z.infer<typeof revokeApiKeySchema>;

/* ------------------------------------------------------------------ */
/* Introspección (autenticación de una clave presentada)               */
/* ------------------------------------------------------------------ */

export const introspectApiKeySchema = z.object({
  apiKey: z.string().trim().min(16, 'apiKey con longitud inválida').max(256),
});

export type IntrospectApiKeyInput = z.infer<typeof introspectApiKeySchema>;
