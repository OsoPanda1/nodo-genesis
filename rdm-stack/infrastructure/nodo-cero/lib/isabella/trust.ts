/* ------------------------------------------------------------------ */
/* BARRIL DE COMPATIBILIDAD — Trust Layer                              */
/* ------------------------------------------------------------------ */
/* La capa de trust es transversal (toda la superficie de entrada del  */
/* Nodo), no pertenece al dominio Isabella. La implementación canónica */
/* vive en lib/security/trust.ts. Este archivo re-exporta para no      */
/* romper los imports existentes.                                      */
/*                                                                     */
/* MIGRACIÓN GUIADA (Fase 2): sustituir en las rutas                  */
/*   import { assertServerOnly, rateLimit, verifyOrigin }              */
/*     from '@/lib/isabella/trust'                                     */
/* por el route-guard único:                                           */
/*   import { guardedRoute } from '@/app/api/_shared/route-guard'      */
/* ------------------------------------------------------------------ */

export * from '@/lib/security/trust';
