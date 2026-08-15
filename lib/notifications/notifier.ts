/* ================================================================== */
/* NOTIFICACIONES — Bus pub/sub con sonido                            */
/* ================================================================== */
/* Sistema interno de notificaciones del Nodo Cero:                    */
/*   · canal de mensajes con severidad y prioridad                    */
/*   · emisión con sonido opcional (Web Audio, sin archivos)          */
/*   · cola reciente en memoria para el centro de notificaciones      */
/* ================================================================== */

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'critical';

export interface RdmNotification {
  id: string;
  title: string;
  body: string;
  severity: NotificationSeverity;
  source: string;
  at: number;
  sound: boolean;
  read: boolean;
  data?: Record<string, unknown>;
}

export interface NotifyOptions {
  sound?: boolean;
  data?: Record<string, unknown>;
}

type Listener = (notification: RdmNotification) => void;

let seq = 0;
const listeners = new Set<Listener>();
const queue: RdmNotification[] = [];
const MAX_QUEUE = 200;

export function notify(
  title: string,
  body: string,
  severity: NotificationSeverity = 'info',
  source = 'nodo',
  options: NotifyOptions = {},
): RdmNotification {
  seq += 1;
  const notification: RdmNotification = {
    id: `ntf-${Date.now().toString(36)}-${seq.toString(36)}`,
    title,
    body,
    severity,
    source,
    at: Date.now(),
    sound: options.sound ?? severity !== 'info',
    read: false,
    data: options.data,
  };
  queue.push(notification);
  if (queue.length > MAX_QUEUE) queue.shift();
  for (const listener of listeners) listener(notification);
  return notification;
}

export function subscribeNotifications(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function recentNotifications(limit = 50): RdmNotification[] {
  return queue.slice(-limit).reverse();
}

export function unreadCount(): number {
  return queue.filter(n => !n.read).length;
}

export function markAllRead(): void {
  for (const n of queue) n.read = true;
}

export function clearNotifications(): void {
  queue.length = 0;
}
