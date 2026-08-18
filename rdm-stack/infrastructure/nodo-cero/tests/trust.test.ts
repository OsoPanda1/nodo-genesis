import { describe, it, expect } from 'vitest';
import { constantTimeCompare, redact, redactRecord, sanitizeForLog } from '@/lib/isabella/trust';

describe('trust · redact (PII y secretos)', () => {
  it('redacta correos', () => {
    expect(redact('contáctame en persona@ejemplo.com hoy')).toContain('[EMAIL]');
    expect(redact('contáctame en persona@ejemplo.com hoy')).not.toContain('persona@ejemplo.com');
  });

  it('redacta teléfonos MX de 10 dígitos', () => {
    expect(redact('llama al 7711234567')).toContain('[TEL]');
    expect(redact('llama al 7711234567')).not.toContain('7711234567');
  });

  it('redacta CURP', () => {
    const curp = 'GARM850614HTSRRL00';
    expect(redact(`curp ${curp}`)).toContain('[CURP]');
    expect(redact(`curp ${curp}`)).not.toContain(curp);
  });

  it('redacta tarjetas de 16 dígitos', () => {
    expect(redact('tarjeta 4111111111111111')).toContain('[TARJETA]');
  });

  it('redacta claves de proveedores de IA', () => {
    expect(redact('key AIzaSyA1b2C3d4E5F6G7H8I9J0K')).toContain('[GEMINI_KEY]');
    expect(redact('sk-ant-abcdefghijklmnopqrstuvwxyz123456')).toContain('[SK_KEY]');
  });

  it('redacta secretos con formato clave: valor', () => {
    expect(redact('api_key=supersecreto123456')).toContain('[KEY]');
  });

  it('no redacta años históricos ni cifras cortas (falsos positivos)', () => {
    const text = 'El mineral extraído en 2026 sumó 500 toneladas.';
    expect(redact(text)).toBe(text);
  });

  it('redactRecord y sanitizeForLog recorren estructuras anidadas', () => {
    const record = {
      user: 'tester@correo.mx',
      contact: { phone: '7711234567' },
      keys: ['gsk_abcdefghijklmnopqrstuvwxyz'],
      count: 3,
    };
    const sanitized = redactRecord(record) as {
      user: string;
      contact: { phone: string };
      keys: string[];
      count: number;
    };
    expect(sanitized.user).toContain('[EMAIL]');
    expect(sanitized.contact.phone).toContain('[TEL]');
    expect(sanitized.keys[0]).toContain('[GATEWAY_KEY]');
    expect(sanitized.count).toBe(3);

    const deep = sanitizeForLog({ nested: { email: 'a@b.mx' }, list: ['c@d.mx'] }) as {
      nested: { email: string };
      list: string[];
    };
    expect(deep.nested.email).toContain('[EMAIL]');
    expect(deep.list[0]).toContain('[EMAIL]');
  });
});

describe('trust · constantTimeCompare', () => {
  it('cadenas iguales → true', () => {
    expect(constantTimeCompare('abc123', 'abc123')).toBe(true);
  });
  it('cadenas distintas → false', () => {
    expect(constantTimeCompare('abc123', 'abc124')).toBe(false);
  });
  it('longitudes distintas → false', () => {
    expect(constantTimeCompare('abc', 'abcdef')).toBe(false);
  });
  it('cadena vacía vs no vacía → false', () => {
    expect(constantTimeCompare('', 'x')).toBe(false);
  });
});
