import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const src = 'presentacion';
const dest = 'dist';

await rm(dest, { recursive: true, force: true });
await mkdir(dest, { recursive: true });

if (!existsSync(src)) {
  console.error(`No existe ${src}/ — no hay nada que empaquetar.`);
  process.exit(1);
}

await cp(src, dest, { recursive: true });
console.log(`Portal estático empaquetado en ${dest}/ (${src}/).`);
