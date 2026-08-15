import { describe, it, expect, beforeEach } from 'vitest';
import {
  listPlaces,
  getPlace,
  listEvents,
  getEvent,
  listRoutes,
  getRoute,
  listStories,
  getStory,
  listFoodItems,
  tourismStats,
  resetTourismForTests,
} from '@/lib/tourism';

describe('tourism · catálogo vivo de Real del Monte', () => {
  beforeEach(() => {
    resetTourismForTests();
  });

  it('siembra el catálogo con atractivos verificados', () => {
    const places = listPlaces();
    expect(places.length).toBeGreaterThanOrEqual(8);
    expect(places.some(p => p.id === 'mina-acosta')).toBe(true);
    expect(places.some(p => p.id === 'museo-medicina')).toBe(true);
    expect(places.some(p => p.id === 'panteon-ingles')).toBe(true);
    expect(places.some(p => p.id === 'plaza-principal')).toBe(true);
  });

  it('cada registro porta procedencia y verificación', () => {
    const acosta = getPlace('mina-acosta');
    expect(acosta).not.toBeNull();
    if (acosta) {
      expect(acosta.sourceType).toBe('sic');
      expect(acosta.confidenceLevel).toBe('contradictory');
      expect(acosta.verifiedAt).toBeDefined();
      expect(acosta.expiresAt).toBeDefined();
      expect(acosta.admissionFee).toBe('$80 MXN');
      expect(acosta.hours[0].days).toBe('Martes a domingo');
    }
  });

  it('filtra atractivos por categoría y por texto', () => {
    const museos = listPlaces({ category: 'museo' });
    expect(museos.every(p => p.category === 'museo')).toBe(true);
    expect(museos.length).toBeGreaterThanOrEqual(3);

    const busca = listPlaces({ q: 'cornualles' });
    expect(busca.length).toBeGreaterThan(0);
  });

  it('devuelve null para un atractivo inexistente', () => {
    expect(getPlace('no-existe')).toBeNull();
  });

  it('lista eventos con el Festival del Paste 2026 confirmado', () => {
    const events = listEvents();
    expect(events.length).toBeGreaterThanOrEqual(5);
    const paste = getEvent('feria-paste-2026');
    expect(paste).not.toBeNull();
    if (paste) {
      expect(paste.confidenceLevel).toBe('verified');
      expect(paste.sourceContact).toContain('771 797 11216');
      expect(paste.sessions[0].startsAt).toBe('2026-10-09');
      expect(paste.sessions[0].endsAt).toBe('2026-10-11');
    }
  });

  it('marca el Festival de la Plata como histórico tras su edición', () => {
    const plata = getEvent('festival-plata-2026');
    expect(plata).not.toBeNull();
    if (plata) expect(plata.confidenceLevel).toBe('historical');
  });

  it('filtra eventos próximos (upcoming)', () => {
    const upcoming = listEvents({ upcoming: true });
    const hoy = new Date().toISOString().slice(0, 10);
    for (const event of upcoming) {
      const latest = event.sessions.map(s => s.endsAt ?? s.startsAt ?? '').filter(Boolean).sort().at(-1);
      expect(latest).toBeDefined();
      if (latest) expect(latest >= hoy).toBe(true);
    }
  });

  it('lista rutas con paradas ordenadas', () => {
    const routes = listRoutes();
    expect(routes.length).toBeGreaterThanOrEqual(4);
    const minera = getRoute('ruta-minera');
    expect(minera).not.toBeNull();
    if (minera) {
      expect(minera.stops[0].order).toBe(1);
      expect(minera.stops[0].placeId).toBe('mina-acosta');
      expect(minera.difficulty).toBe('moderada');
    }
  });

  it('filtra rutas por dificultad', () => {
    const faciles = listRoutes({ difficulty: 'facil' });
    expect(faciles.every(r => r.difficulty === 'facil')).toBe(true);
    expect(faciles.length).toBeGreaterThanOrEqual(2);
  });

  it('lista dichos, leyendas e historias orales', () => {
    const stories = listStories();
    expect(stories.length).toBeGreaterThanOrEqual(4);
    const dichos = listStories({ kind: 'dicho' });
    expect(dichos.every(s => s.kind === 'dicho')).toBe(true);
    expect(getStory('leyenda-tunel')).not.toBeNull();
  });

  it('lista la gastronomía del paste', () => {
    const items = listFoodItems();
    expect(items.some(i => i.id === 'paste-papa-carne')).toBe(true);
  });

  it('reporta estadísticas del catálogo', () => {
    const stats = tourismStats();
    expect(stats.places).toBeGreaterThanOrEqual(8);
    expect(stats.events).toBeGreaterThanOrEqual(5);
    expect(stats.routes).toBeGreaterThanOrEqual(4);
    expect(stats.verified).toBeGreaterThan(0);
    expect(stats.contradictory).toBeGreaterThanOrEqual(1);
    expect(stats.historical).toBeGreaterThanOrEqual(1);
  });
});
