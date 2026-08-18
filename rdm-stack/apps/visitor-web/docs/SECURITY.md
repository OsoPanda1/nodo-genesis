# Seguridad — RDM Digital Hub

## Criptografía Post-Cuántica

`src/quantum/pqc.ts` — Implementación dual:

- **Kyber KEM** — encapsulamiento/desencapsulamiento de llave compartida
- **Dilithium** — firmas digitales post-cuánticas
- **AES-256-GCM** — cifrado simétrico con IV + auth tag
- **WebCrypto API** — fallback nativo del navegador
- **liboqs WASM** — implementación PQC completa

## Seguridad en API

- **Autenticación**: Supabase Auth + JWT verify en Vercel Functions (`api/_shared/auth.ts`)
- **Rate Limiting**: In-memory + database-backed rate limiters (`api/_shared/rate-limit.ts`, `supabase/functions/_shared/rate-limit.ts`)
- **CORS**: Orígenes restringidos vía `api/_shared/cors.ts` y `supabase/functions/_shared/cors.ts`
- **Row Level Security (RLS)**: 30+ migraciones SQL con políticas por federación

## CI/CD Security

- **Gitleaks + TruffleHog**: Escaneo de secretos en doble capa
- **CodeQL**: Análisis SAST en cada PR
- **npm audit**: Verificación de dependencias con nivel high+
- **RLS Gate**: Validación automatizada de políticas RLS
