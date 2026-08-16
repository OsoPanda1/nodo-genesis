import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  {
    extends: [...next],
    ignores: [
      // artefactos de build y dependencias
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/.output/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/playwright-report/**",
      "**/tmp/**",
      "**/supabase/.temp/**",
      // apps y submódulos se lintan con su propia configuración
      "apps/**",
      "rdm-stack/**",
      // assets binarios y generados
      "public/**",
      "presentacion/**",
      "unity/**",
      "scripts/**",
    ],
  },
]);