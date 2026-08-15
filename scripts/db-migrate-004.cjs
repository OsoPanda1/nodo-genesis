// Re-aplica SOLO la migración 004 del archivo histórico.
const fs = require('node:fs');
const path = require('node:path');
const postgres = require('postgres');

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL, {
  ssl: 'require',
  prepare: false,
  max: 2,
  connect_timeout: 15,
});

(async () => {
  const raw = fs.readFileSync(path.join(process.cwd(), 'supabase', 'migrations', '004_create_historical_archive.sql'), 'utf8');
  try {
    await sql.unsafe(raw);
    console.log('MIGRACIÓN 004 OK');
  } catch (e) {
    console.error('ERROR 004:', e.message);
  } finally {
    await sql.end({ timeout: 5 }).catch(() => {});
  }
})();
