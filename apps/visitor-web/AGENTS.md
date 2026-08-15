# AGENTS.md - Configuration for AI Coding Assistants

## Project Commands
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint on src/
- `npm run typecheck` - Run TypeScript compiler check (tsc --noEmit)
- `npm run test:unit` - Run Vitest unit tests
- `npm run test:e2e` - Run Playwright e2e tests
- `npm run format` - Format with Prettier

## Architecture
- **Frontend**: React + Vite + TypeScript (src/)
- **API Layer**: Vercel Serverless Functions (api/) + Supabase Edge Functions (supabase/functions/)
- **Database**: Supabase (PostgreSQL with RLS)
- **AI**: Isabella AI engine with multi-model gateway (Claude, Gemini, local routing)
- **Security**: Post-Quantum Crypto (Kyber KEM + Dilithium via WebCrypto + WASM fallback)
- **Knowledge Cells**: Microservice architecture for 3D/4D rendering

## Important Conventions
- CORS: Use shared getCorsHeaders() from api/_shared/cors.ts (API) or supabase/functions/_shared/cors.ts (Edge). Keep allowlist, never use wildcard.
- Rate Limiting: Use checkRateLimit() from api/_shared/rate-limit.ts (Vercel) or supabase/functions/_shared/rate-limit.ts (Edge). Types in api/_shared/rate-limit-types.ts.
- Auth: Use verifyAuth/requireAuth from api/_shared/auth.ts (Vercel) or supabase/functions/_shared/auth.ts (Edge). Server Express JWT in server/src/lib/auth-core.ts.
- Telemetry: Use emitTelemetry() from api/_shared/telemetry.ts instead of console.log/warn/error.
- All API endpoints MUST add CORS headers and handle OPTIONS.
- Server-only code MUST be in *.server.ts files.
- Never import service-role clients from frontend code.
- Render Knowledge Cells: Use helpers from api/_shared/render-core.ts for 3D/4D operations.
- NEVER use Vercel Connect SDK — native RDM token layer via FederationBus.
- Gamification redemptions MUST be atomic via RPC (not read-then-write).
