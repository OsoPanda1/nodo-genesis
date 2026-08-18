# Despliegue — RDM Digital Hub

## Plataforma

- **Hosting**: Vercel (framework: vite, `--legacy-peer-deps`)
- **Base de datos**: Supabase (PostgreSQL 15)
- **Edge Functions**: Supabase (21 funciones)
- **Dominio**: https://visitarealdelmonte.online

## Variables de Entorno

```env
# === Requerido ===
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=

# === Isabella AI (defaults locales) ===
VITE_ISABELLA_ENDPOINT=/api/isa-ai
VITE_TTS_ENDPOINT=/api/tts-isabella

# === Opcional — AI Cloud ===
GEMINI_API_KEY=
GOOGLE_TTS_API_KEY=
VERCEL_AI_GATEWAY_URL=
VERCEL_AI_GATEWAY_TOKEN=

# === Opcional — Observabilidad ===
VITE_SENTRY_DSN=
VITE_POSTHOG_KEY=
VITE_POSTHOG_HOST=

# === Interno ===
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
```

## Comandos

```bash
npm install --legacy-peer-deps   # Instalar dependencias
npm run dev                       # Servidor local :5173
npm run build                     # Typecheck + build producción
npm run typecheck                 # TypeScript estricto
npm run lint                      # ESLint
npm run test:unit                 # Vitest
npm run test:e2e                  # Playwright
```

## CI/CD

5 workflows GitHub Actions:
- **CI**: Lint, typecheck, build, tests unitarios + e2e, deploy a Vercel
- **Security**: Gitleaks + TruffleHog, npm audit, policy-as-code
- **CodeQL**: Análisis SAST semanal
- **Edge Deploy**: Despliegue de Supabase Edge Functions
- **RLS Gate**: Validación de políticas RLS en migraciones
