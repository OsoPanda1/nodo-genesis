# Security Architecture

## Post-Quantum Cryptography
- Kyber KEM + Dilithium via WebCrypto with WASM fallback
- Implements `PostQuantumCrypto` in `src/security/PostQuantumCrypto.ts`
- PQC v2 available at `src/quantum/pqc.ts`

## Authentication
- **API (Vercel)**: JWT Bearer via `api/_shared/auth.ts` (Supabase `auth.getUser()`)
- **Server (Express)**: HS256 JWT via `server/src/lib/auth-core.ts`
- **Supabase Functions**: Supabase Auth via `_shared/auth.ts`
- **Cron**: `CRON_SECRET` shared secret check

## Authorization
- Row Level Security (RLS) on all Supabase tables
- Role-based access: `VISITOR`, `MERCHANT`, `ADMIN`
- Service role key for edge function internal operations

## Data Protection
- TLS/HTTPS enforced in production
- P0 data encrypted at rest
- Input validation via `src/lib/validation/`
- CORS allowlist enforced at all entry points
