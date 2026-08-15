#!/usr/bin/env node
/* ================================================================== */
/* CHECK ENV — valida el entorno contra el contrato canónico          */
/* ================================================================== */
/* Uso: node scripts/check-env.mjs                                    */
/* Compara .env.local con el manifiesto de variables (espejo del       */
/* esquema lib/core/env) y reporta qué claves faltan por grupo.        */
/* Exit code 1 si falta una clave marcada como requerida.              */
/* ================================================================== */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');

/* Espejo del manifiesto de lib/core/env (mantener en sincronía). */
const REQUIRED_GROUPS = {
  core: ['APP_URL'],
  'claves internas': ['ISA_API_KEY', 'MEXA_API_KEY', 'GAMIFICATION_API_KEY', 'MONITOR_API_KEY', 'CROWN_API_KEY'],
  operator: ['MEXA_OPERATOR_KEY'],
  emergency: ['CROWN_EMERGENCY_KEY'],
  gamification: ['GAMIFICATION_HMAC_SECRET'],
};

function parseEnvFile(path) {
  const out = {};
  if (!existsSync(path)) return out;
  for (const raw of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    out[key] = value;
  }
  return out;
}

const local = parseEnvFile(join(root, '.env.local'));
const example = parseEnvFile(join(root, '.env.example'));

const missing = [];
for (const [group, keys] of Object.entries(REQUIRED_GROUPS)) {
  const absent = keys.filter(k => !local[k]);
  if (absent.length) missing.push(`${group}: ${absent.join(', ')}`);
}

const configured = Object.keys(local).filter(k => local[k]).length;
console.log(`[CHECK-ENV] .env.local: ${configured} variables configuradas`);
if (missing.length) {
  console.log(`\x1b[33m[WARN]\x1b[0m Faltan claves requeridas (operación en modo demo):\n  ${missing.join('\n  ')}`);
} else {
  console.log('\x1b[32m[OK]\x1b[0m Claves requeridas presentes');
}

/* Claves presentes en .env.local que el contrato no documenta.
   Se comprueba la presencia de la clave (no su valor): una clave
   documentada puede dejarse vacía en .env.example. */
const undocumented = Object.keys(local).filter(k => !(k in example));
if (undocumented.length) {
  console.log(`\x1b[33m[WARN]\x1b[0m Variables presentes pero no documentadas en .env.example:\n  ${undocumented.join(', ')}`);
}

process.exit(missing.length ? 1 : 0);
