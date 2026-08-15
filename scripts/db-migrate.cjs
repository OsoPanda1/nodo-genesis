// Aplica las migraciones SQL a Supabase y verifica la persistencia real.
const fs = require('node:fs');
const path = require('node:path');
const postgres = require('postgres');

const MIGRATIONS_DIR = path.join(process.cwd(), 'supabase', 'migrations');
const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

(async () => {
  if (!url) {
    console.error('NO_URL: POSTGRES_URL_NON_POOLING no está configurado.');
    process.exit(1);
  }
  const sql = postgres(url, {
    ssl: 'require',
    prepare: false,
    max: 2,
    connect_timeout: 15,
  });
  try {
    const ping = await sql`select 1 as ok`;
    console.log('CONECTADO ✓ ping:', ping[0].ok);

    const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
    for (const file of files) {
      const raw = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      try {
        await sql.unsafe(raw);
        console.log(`MIGRACIÓN OK  ${file}`);
      } catch (e) {
        console.log(`MIGRACIÓN WARN ${file} -> ${e.message.slice(0, 200)}`);
      }
    }

    const tables = await sql`select table_name from information_schema.tables where table_schema = 'public' order by table_name`;
    console.log('\nTABLAS EN PUBLIC (' + tables.length + '):');
    for (const r of tables) console.log('  - ' + r.table_name);
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  } finally {
    await sql.end({ timeout: 5 }).catch(() => {});
  }
})();
