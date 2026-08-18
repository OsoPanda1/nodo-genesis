import { describe, it, expect, beforeEach } from 'vitest';
import {
  notify,
  subscribeNotifications,
  recentNotifications,
  unreadCount,
  markAllRead,
  clearNotifications,
} from '@/lib/notifications/notifier';
import {
  sendMessage,
  subscribeTopic,
  inboxFor,
  unreadFor,
  markMessageRead,
  clearInbox,
} from '@/lib/messaging/bus';
import { distanceKm, distanceToCenter, RDM_CENTER, speedKmh } from '@/lib/geo/geolocation';

describe('notificaciones', () => {
  beforeEach(() => clearNotifications());

  it('emite notificaciones y las encola', () => {
    const n = notify('Título', 'Cuerpo', 'success', 'nodo', { sound: true });
    expect(n.id).toContain('ntf-');
    expect(n.severity).toBe('success');
    expect(recentNotifications()).toHaveLength(1);
  });

  it('notifica a suscriptores', () => {
    const received: string[] = [];
    const unsubscribe = subscribeNotifications(n => received.push(n.title));
    notify('A', 'x');
    notify('B', 'y');
    unsubscribe();
    notify('C', 'z');
    expect(received).toEqual(['A', 'B']);
  });

  it('cuenta y marca leídas', () => {
    notify('A', 'x');
    notify('B', 'y');
    expect(unreadCount()).toBe(2);
    markAllRead();
    expect(unreadCount()).toBe(0);
  });
});

describe('mensajería', () => {
  beforeEach(() => clearInbox());

  it('envía por tópico y notifica suscriptores del tópico', () => {
    const received: string[] = [];
    const unsubscribe = subscribeTopic('canal', m => received.push(m.text));
    sendMessage('isabella', 'hola', { topic: 'canal' });
    sendMessage('isabella', 'otro', { topic: 'distinto' });
    unsubscribe();
    expect(received).toEqual(['hola']);
  });

  it('entrega mensajes directos a un actor y cuenta no leídos', () => {
    sendMessage('isabella', 'para ti', { to: 'operador' });
    sendMessage('isabella', 'difusión');
    expect(inboxFor('operador')).toHaveLength(2);
    expect(unreadFor('operador')).toBe(2);
    const first = inboxFor('operador')[0];
    markMessageRead(first.id);
    expect(unreadFor('operador')).toBe(1);
  });
});

describe('geolocalización', () => {
  it('calcula distancias haversine (km)', () => {
    const km = distanceKm(RDM_CENTER, { latitude: 20.2, longitude: -98.6 });
    expect(km).toBeGreaterThan(0);
    expect(km).toBeLessThan(20);
    expect(distanceKm(RDM_CENTER, RDM_CENTER)).toBe(0);
  });

  it('distancia al centro desde el mismo punto es ~0', () => {
    expect(distanceToCenter(RDM_CENTER)).toBe(0);
  });

  it('convierte velocidad m/s a km/h', () => {
    expect(speedKmh(10)).toBe(36);
    expect(speedKmh(null)).toBeNull();
    expect(speedKmh(-1)).toBeNull();
  });
});
