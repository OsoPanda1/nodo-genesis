/* ------------------------------------------------------------------ */
/* GAMIFICATION YUN — Eventos de juego → memoria MNEMOS + bus YUN      */
/* ------------------------------------------------------------------ */
/* Cada evento de juego aceptado se convierte en un evento territorial  */
/* más: se inserta en la memoria de Isabella (scope territorial, tags   */
/* de gamificación) y se publica en el bus YUN unificado (dominio      */
/* gameplay) para que ARGUS/LUMEN lo auditen. Así un "zombie kill" es   */
/* un evento del territorio, como visitar un POI o completar una ruta.  */
/* ------------------------------------------------------------------ */

import { publishEvent } from '@/lib/core/events';
import { addMemoryItem } from '@/lib/isabella/memory';
import { uuid } from '@/lib/core/utils';

export interface GameplayEventRecord {
  sessionId: string;
  actorId: string;
  eventType: string;
  payload: Record<string, unknown>;
}

export function recordGameplayEvent(record: GameplayEventRecord): void {
  const tags = ['gamificacion', 'zombies', record.eventType];

  publishEvent({
    type: `gameplay.${record.eventType}`,
    domain: 'gameplay',
    traceId: uuid(),
    source: 'yun-gamification',
    severity: 'info',
    data: { ...record.payload, sessionId: record.sessionId, actorId: record.actorId },
    meta: { entityId: record.sessionId },
  });

  try {
    addMemoryItem({
      scope: 'territorial',
      content: `evento-gamificacion:${record.eventType}:${JSON.stringify(record.payload).slice(0, 120)}`,
      tags,
      relevance: 0.55,
      actorId: record.actorId,
      sessionId: record.sessionId,
    });
  } catch {
    /* la memoria no debe bloquear el flujo de puntos */
  }
}
