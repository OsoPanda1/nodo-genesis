/* ==== ==== */
/* Lint programático (workaround Windows: la CLI se cuelga). */
import { ESLint } from "eslint";

const eslint = new ESLint({ fix: false });

const files = ["app", "lib", "components", "hooks", "types"];
const results = await eslint.lintFiles(files);

const formatter = await eslint.loadFormatter("stylish");
const output = formatter.format(results);

if (output) process.stdout.write(output + "\n");

const errors = results.reduce((acc, r) => acc + r.errorCount, 0);
const warnings = results.reduce((acc, r) => acc + r.warningCount, 0);

console.log(`lint-prog: ${results.length} archivos · ${errors} errores · ${warnings} avisos`);
process.exit(errors > 0 ? 1 : 0);