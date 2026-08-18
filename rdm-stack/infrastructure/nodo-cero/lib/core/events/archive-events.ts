/* ================================================================== */
/* ARCHIVO HISTÓRICO — Eventos del dominio en el bus YUN              */
/* ================================================================== */
/* El Archivo emite eventos con el envelope canónico (traceId /       */
/* correlationId) vía publishEvent de lib/core/events. El payload      */
/* nunca transporta binarios, documentos ni datos privados.            */
/* ================================================================== */

import { publishEvent } from '@/lib/core/events';

export type ArchiveEventType =
  | 'archive.item.created'
  | 'archive.item.submitted'
  | 'archive.item.approved'
  | 'archive.item.published'
  | 'archive.item.withdrawn'
  | 'archive.item.downloaded'
  | 'archive.item.integrity_verified';

export type ArchiveEvent = {
  type: ArchiveEventType;
  traceId?: string;
  correlationId?: string;
  itemId: string;
  collectionId?: string;
  actorId?: string;
  metadata?: Record<string, unknown>;
};

const ARCHIVE_SOURCE = 'yun-archive';
const ARCHIVE_DOMAIN = 'archive';

/** Emite un evento de dominio al bus YUN unificado. */
export function publishArchiveEvent(event: ArchiveEvent): void {
  publishEvent({
    type: event.type,
    source: ARCHIVE_SOURCE,
    domain: ARCHIVE_DOMAIN,
    traceId: event.traceId,
    correlationId: event.correlationId,
    severity: 'info',
    data: {
      itemId: event.itemId,
      ...(event.collectionId ? { collectionId: event.collectionId } : {}),
      ...(event.actorId ? { actorId: event.actorId } : {}),
      ...(event.metadata ?? {}),
    },
    meta: { entityId: event.itemId },
  });
}