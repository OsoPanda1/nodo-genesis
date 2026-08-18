/* ================================================================== */
/* ARCHIVO HISTÓRICO — Permisos y roles editoriales                    */
/* ================================================================== */
/* Matriz de acciones por rol interno del Archivo. En producción el    */
/* rol se deriva de la sesión autenticada (archive_staff_roles + RLS); */
/* en modo demo/CI se acepta la cabecera `x-archive-role` para poder   */
/* ejercitar el flujo editorial sin Auth. La verificación es           */
/* fail-closed: ausencia de rol equivale a denegación.                 */
/* ================================================================== */

import type { ArchiveRole } from './archive-types';

export type ArchiveAction =
  | 'create_item'
  | 'upload_file'
  | 'submit_item'
  | 'approve_item'
  | 'publish_item'
  | 'withdraw_item'
  | 'read_audit'
  | 'manage_collections'
  | 'grant_roles';

/** Matriz canónica de acciones por rol. */
const MATRIX: Record<ArchiveRole, ArchiveAction[]> = {
  contributor: [],
  archivist: ['create_item', 'upload_file', 'submit_item'],
  reviewer: ['submit_item', 'approve_item', 'publish_item', 'withdraw_item'],
  archive_admin: [
    'create_item',
    'upload_file',
    'submit_item',
    'approve_item',
    'publish_item',
    'withdraw_item',
    'read_audit',
    'manage_collections',
    'grant_roles',
  ],
};

const ROLES: ArchiveRole[] = ['contributor', 'archivist', 'reviewer', 'archive_admin'];

export function can(role: ArchiveRole | null | undefined, action: ArchiveAction): boolean {
  if (!role) return false;
  return MATRIX[role].includes(action);
}

export function isArchiveRole(value: string | null | undefined): value is ArchiveRole {
  return Boolean(value && (ROLES as string[]).includes(value));
}

/** Deriva el rol declarado de una petición. En producción debería
 *  resolverse desde la sesión; aquí se documenta el modo demo. */
export function resolveRole(header: string | null | undefined): ArchiveRole | null {
  if (!isArchiveRole(header)) return null;
  return header;
}

export function readRoleHeader(headers: Headers): ArchiveRole | null {
  return resolveRole(headers.get('x-archive-role'));
}

/** Exige una acción; devuelve razón de denegación o null si procede. */
export function assertArchiveAction(
  role: ArchiveRole | null | undefined,
  action: ArchiveAction,
): { ok: true } | { ok: false; reason: string } {
  if (can(role, action)) return { ok: true };
  return {
    ok: false,
    reason: `Acción '${action}' no permitida para el rol ${role ?? 'no asignado'}.`,
  };
}
