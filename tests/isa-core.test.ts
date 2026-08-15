import { describe, it, expect } from 'vitest';
import { isaReason, isaAnswer, isaCoreStatus } from '@/lib/isabella/isa-core';
import { mexaStatus } from '@/lib/isabella/mexa-api';

describe('ISA Core · núcleo soberano sin dependencias externas', () => {
  it('razona sobre gastronomía citando fuentes locales', () => {
    const result = isaReason('¿dónde como pastes en Real del Monte?');
    expect(result.trace.sovereign).toBe(true);
    expect(result.sources.length).toBeGreaterThan(0);
    expect(result.answer).toContain('Isa');
  });

  it('es determinístico: misma pregunta → misma respuesta', () => {
    const a = isaReason('cuéntame sobre la historia de las minas');
    const b = isaReason('cuéntame sobre la historia de las minas');
    expect(a.answer).toBe(b.answer);
  });

  it('detecta intención de arquitectura (núcleos YUN)', () => {
    const result = isaReason('¿cómo está organizada la arquitectura heptafederada YUN?');
    expect(result.trace.intent.domain).toBe('arquitectura');
    expect(result.sources.some(s => s.kind === 'nucleo')).toBe(true);
  });

  it('responde educadamente sin fuentes para consultas fuera de conocimiento', () => {
    const result = isaReason('¿qué opinas de las elecciones de 2032 en Marte?');
    expect(result.sources.length).toBe(0);
    expect(result.answer).toContain('no encontré registros locales');
  });

  it('isaAnswer devuelve solo el texto', () => {
    expect(typeof isaAnswer('hola')).toBe('string');
    expect(isaAnswer('hola').length).toBeGreaterThan(0);
  });

  it('expone el estado del núcleo con la base de conocimiento', () => {
    const status = isaCoreStatus();
    expect(status.sovereign).toBe(true);
    expect(status.engine).toContain('isa-core');
    expect(status.knowledgeBase.pois).toBeGreaterThan(0);
    expect(status.knowledgeBase.nodes).toBeGreaterThan(0);
  });

  it('la capa MEXA reporta esquema MSR y estado del operador', () => {
    const status = mexaStatus();
    expect(status.scheme).toContain('MSR');
    expect(status.pqTarget).toBeTruthy();
    expect(typeof status.operatorConfigured).toBe('boolean');
  });
});
