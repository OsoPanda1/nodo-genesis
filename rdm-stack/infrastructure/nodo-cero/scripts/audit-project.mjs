#!/usr/bin/env node
/* ================================================================== */
/* AUDIT PROJECT — chequeos de consistencia del código                */
/* ================================================================== */
/* Uso: node scripts/audit-project.mjs                                */
/* Sin dependencias. Recorre lib/ y app/ y aplica reglas de calidad    */
/* definidas en la guía de modularización. Exit code 1 si hay          */
/* errores (escapes de tipos, imports prohibidos).                    */
/* ================================================================== */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === 'node_modules' || entry === '.next' || entry === '.git') continue;
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

const libFiles = walk(join(root, 'lib')).filter(f => !f.includes('lib/core'));
const apiFiles = walk(join(root, 'app/api'));

const errors = [];
const warnings = [];
const info = [];

/* R1 — Inversión de dependencia: nada fuera de lib/core o lib/security
   debe depender de la capa de trust a través de lib/isabella (solo el
   barril de compatibilidad, y solo en rutas legacy). */
const securityIsabella = libFiles
  .filter(f => f.includes('lib/security'))
  .filter(f => /from ['"]@\/lib\/isabella\/trust['"]/.test(readFileSync(f, 'utf8')));
if (securityIsabella.length) {
  errors.push(`[R1] lib/security importa la capa de trust desde lib/isabella: ${securityIsabella.map(f => relative(root, f)).join(', ')}`);
} else {
  info.push('[R1] sin imports de lib/security -> lib/isabella/trust (OK)');
}

/* R2 — Escapes de tipos prohibidos. */
const asNever = [...libFiles, ...apiFiles].filter(f =>
  /\bas\s+never\b/.test(readFileSync(f, 'utf8')));
if (asNever.length) {
  errors.push(`[R2] uso de 'as never' (escape de tipos): ${asNever.map(f => relative(root, f)).join(', ')}`);
} else {
  info.push('[R2] sin escapes de tipo "as never" (OK)');
}

/* R3 — require() dinámico en lib y rutas (usa imports estáticos). */
const dynamicRequire = [...libFiles, ...apiFiles].filter(f =>
  /\brequire\(['"]/.test(readFileSync(f, 'utf8')));
if (dynamicRequire.length) {
  warnings.push(`[R3] require() dinámico: ${dynamicRequire.map(f => relative(root, f)).join(', ')}`);
} else {
  info.push('[R3] sin require() dinámico (OK)');
}

/* R4 — console.log en lib (solo se permite bajo guard de entorno). */
const consoleLog = libFiles.filter(f =>
  /console\.(log|warn)\(/.test(readFileSync(f, 'utf8')));
if (consoleLog.length) {
  warnings.push(`[R4] console.log/warn en lib/ (revisar que estén bajo guard): ${consoleLog.map(f => relative(root, f)).join(', ')}`);
} else {
  info.push('[R4] sin console.log en lib/ (OK)');
}

/* R5 — Deuda marcada en código. */
let todos = 0;
for (const f of [...libFiles, ...apiFiles]) {
  const m = readFileSync(f, 'utf8').match(/TODO|FIXME|HACK|XXX/g);
  todos += m ? m.length : 0;
}
info.push(`[R5] marcadores TODO/FIXME/HACK: ${todos}`);

/* R6 — Barriles: cada directorio de lib/ con 2+ módulos debe tener index. */
const libDirs = new Set(libFiles.map(f => join(f, '..')));
const missingBarrels = [];
for (const dir of libDirs) {
  const files = readdirSync(dir).filter(f => /\.ts$/.test(f) && !f.startsWith('index.'));
  if (files.length >= 2 && !existsSync(join(dir, 'index.ts'))) {
    missingBarrels.push(relative(root, dir));
  }
}
if (missingBarrels.length) {
  warnings.push(`[R6] directorios sin barril index.ts: ${missingBarrels.join(', ')}`);
} else {
  info.push('[R6] barriles presentes en lib/ (OK)');
}

/* R7 — Convención de nombres de archivos (kebab-case). */
const snakeCase = [...libFiles, ...apiFiles].filter(f => /[a-z]_[a-z]/.test(join(f).split(/[\\/]/).pop() ?? ''));
if (snakeCase.length) {
  warnings.push(`[R7] archivos con snake_case (estándar: kebab-case): ${snakeCase.map(f => relative(root, f)).join(', ')}`);
} else {
  info.push('[R7] nomenclatura kebab-case en lib/ y app/ (OK)');
}

const color = {
  red: '\x1b[31m', yellow: '\x1b[33m', green: '\x1b[32m', cyan: '\x1b[36m', reset: '\x1b[0m',
};

for (const line of info) console.log(`${color.green}[INFO]${color.reset} ${line}`);
for (const line of warnings) console.log(`${color.yellow}[WARN]${color.reset} ${line}`);
for (const line of errors) console.log(`${color.red}[ERROR]${color.reset} ${line}`);

console.log(`\n${color.cyan}AUDIT${color.reset}: ${errors.length} errores · ${warnings.length} avisos · ${info.length} ok`);
if (errors.length) process.exit(1);
