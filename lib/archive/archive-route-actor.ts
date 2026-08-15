/* ================================================================== */
/* ARCHIVO HISTÓRICO — Resolución del actor en rutas admin             */
/* ================================================================== */
/* En modo demo el rol se declara con la cabecera `x-archive-role`.    */
/* En producción se derivaría de la sesión autenticada; la matriz de   */
/* permisos se evalúa igual en ambos casos (fail-closed).              */
/* ================================================================== */

import { readRoleHeader } from './archive-permissions';
import type { ArchiveRole } from './archive-types';

export interface ArchiveActor {
  userId: string;
  role: ArchiveRole;
}

/** Resuelve un actor con rol garantizado; null si no hay rol declarado. */
export function actorFromRequest(headers: Headers): ArchiveActor | null {
  const role = readRoleHeader(headers);
  if (!role) return null;
  return { userId: role, role };
}
