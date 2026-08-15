/* ================================================================== */
/* INTEGRACIONES — Gamificación + notificaciones + geo + mensajería   */
/* ================================================================== */
/* Une los sistemas en segundo plano del Nodo Cero: cada evento de     */
/* juego, incidente o geolocalización genera una notificación con      */
/* sonido y un mensaje en el bus interno.                              */
/* ================================================================== */

import { notify, type NotificationSeverity } from '@/lib/notifications/notifier';
import { sendMessage } from '@/lib/messaging/bus';

const GAMEPLAY_MESSAGES: Record<string, { title: string; body: string; severity: NotificationSeverity }> = {
  capture: { title: 'Sello RDM aplicado', body: 'Has capturado un zombi del territorio. +Puntos YUN.', severity: 'success' },
  kill: { title: 'Combate resuelto', body: 'Zombi derrotado en combate. Puntos otorgados.', severity: 'success' },
  mission: { title: 'Misión completada', body: 'Misión de la invasión completada. Recompensa entregada.', severity: 'success' },
  level: { title: '¡Subida de nivel!', body: 'Nuevo rango de jugador alcanzado en la Invasión RDM.', severity: 'warning' },
  prize: { title: 'Premio desbloqueado', body: 'Has obtenido un premio de la tienda del Nodo.', severity: 'success' },
  spawn: { title: 'Invasión detectada', body: 'Una horda se concentra cerca de tu posición.', severity: 'warning' },
};

/** Convierte un evento de juego en notificación + mensaje del bus. */
export function gamificationToNotification(
  eventType: string,
  sessionId: string,
  actorId: string,
  payload: Record<string, unknown> = {},
): void {
  const template = GAMEPLAY_MESSAGES[eventType];
  if (!template) return;

  notify(template.title, template.body, template.severity, 'gamification', {
    sound: true,
    data: { sessionId, actorId, eventType, ...payload },
  });

  sendMessage('isabella', `${template.title}: ${template.body}`, {
    topic: 'gamification',
    to: actorId,
  });
}

/** Registra el mapeo de eventos del juego hacia el sistema de alertas. */
export function gamificationNotifierFor(record: {
  eventType: string;
  sessionId: string;
  actorId: string;
  payload?: Record<string, unknown>;
}): void {
  gamificationToNotification(record.eventType, record.sessionId, record.actorId, record.payload);
}
