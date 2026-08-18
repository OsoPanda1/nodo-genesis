/* ------------------------------------------------------------------ */
/* Aplica las migraciones SQL de supabase/migrations a los targets      */
/* configurados (Supabase primario y/o Neon réplica).                   */
/* Uso: node --env-file=... scripts/apply-migrations.mjs                 */
/* ------------------------------------------------------------------ */
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, '..', 'supabase', 'migrations');

/* Neon (integración Vercel): prefiere la URL directa (unpooled) para DDL,
   porque las migraciones no deben pasar por PgBouncer. Si solo hay URL
   pooled (POSTGRES_PRISMA_URL / DATABASE_URL), la usa igualmente. */
function neonUrl() {
  return (
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.NEON_POSTGRES_URL_NON_POOLING ||
    process.env.NEON_DATABASE_URL ||
    process.env.NEON_POSTGRES_URL ||
    process.env.NEON_POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    ''
  );
}

const TARGETS = [
  { name: 'supabase', url: process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING || '' },
  { name: 'neon', url: neonUrl() },
];

async function applyTo(target) {
  if (!target.url) {
    console.log(`[migrate] ${target.name}: sin URL, se omite`);
    return;
  }
  const sql = postgres(target.url, { prepare: false, max: 1, ssl: 'require', onnotice: () => {} });
  try {
    const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort();
    for (const file of files) {
      const content = await readFile(join(MIGRATIONS_DIR, file), 'utf8');
      process.stdout.write(`[migrate] ${target.name}: ${file} ... `);
      await sql.unsafe(content);
      console.log('ok');
    }
  } catch (err) {
    console.error(`[migrate] ${target.name}: ERROR`, err.message);
    process.exitCode = 1;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

for (const target of TARGETS) {
  await applyTo(target);
}
console.log('[migrate] completado');
