#!/usr/bin/env node
/* ================================================================== */
/* CHECK CONTRACTS — seguimiento de adopción del route-guard          */
/* ================================================================== */
/* Uso: node scripts/check-contracts.mjs                              */
/* Reporta qué rutas de app/api ya usan el guard único + contratos     */
/* zod y cuáles aún conservan el enforceTrust duplicado (deuda).       */
/* Exit code 0 (informativo); la migración es guiada por fase.         */
/* ================================================================== */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');

function findRoutes(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === 'node_modules' || entry === '.next') continue;
    const st = statSync(full);
    if (st.isDirectory()) out.push(...findRoutes(full));
    else if (entry === 'route.ts' || entry === 'route.tsx') out.push(full);
  }
  return out;
}

const routes = findRoutes(join(root, 'app/api'));
const migrated = [];
const legacy = [];

/* Rutas soberanas de Isabella: aplican su propia cadena vía
   lib/isabella/http.ts (razonamiento/firma/exposición); NO deben
   adoptar el guard transversal. Listado explícito para que el
   reporte las clasifique y no queden sin contar. */
const SOVEREIGN = [
  'app/api/isabella/route.ts',
  'app/api/isabella/chat/route.ts',
  'app/api/isabella/isa/reason/route.ts',
  'app/api/isabella/crypto/sign/route.ts',
  'app/api/isabella/crypto/verify/route.ts',
];
const sovereign = [];

for (const route of routes) {
  const rel = relative(root, route).replace(/\\/g, '/');
  if (SOVEREIGN.includes(rel)) {
    sovereign.push(route);
    continue;
  }
  const src = readFileSync(route, 'utf8');
  if (/guardedRoute/.test(src) || /@\/app\/api\/_shared\/route-guard/.test(src)) {
    migrated.push(route);
  } else if (/function enforceTrust|const enforceTrust/.test(src)
    || /from ['"]@\/lib\/(?:isabella\/trust|security\/trust)['"]/.test(src)) {
    legacy.push(route);
  }
}

console.log(`\x1b[36mCONTRACTS\x1b[0m · ${routes.length} rutas en app/api`);
console.log(`\x1b[32m  ✓ ${migrated.length} migradas al route-guard\x1b[0m`);
for (const route of migrated) console.log(`    ${relative(root, route)}`);
console.log(`\x1b[34m  • ${sovereign.length} soberanas de Isabella (cadena propia)\x1b[0m`);
for (const route of sovereign) console.log(`    ${relative(root, route)}`);
console.log(`\x1b[33m  ✗ ${legacy.length} pendientes de migrar\x1b[0m`);
for (const route of legacy) console.log(`    ${relative(root, route)}`);

console.log('\nSiguiente paso guiado: migrar las rutas pendientes con el patrón de los ejemplares (marketplace/publish, assets/register, gamification/events).');
