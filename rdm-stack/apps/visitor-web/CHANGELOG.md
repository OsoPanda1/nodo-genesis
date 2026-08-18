# Changelog

## [Unreleased]
### Added
- Post-Quantum Crypto (Kyber KEM + Dilithium)
- Fusion Connection system (token issuance, verification, revocation)
- Heptafederation monitoring dashboard
- Shared telemetry module (`api/_shared/telemetry.ts`)
- Shared render core (`api/_shared/render-core.ts`)
- Auth core extraction (`server/src/lib/auth-core.ts`)
- Rate limit type definitions (`api/_shared/rate-limit-types.ts`)

### Fixed
- Model router: timeout, circuit breaker, retry logic
- Token endpoint: replay protection, clock skew, nonce validation
- Stripe webhook: idempotency (event dedup with TTL)
- rdm-redeem: atomic point redemption (RPC function)
- rdm-membership-activate: payment verification
- CORS: consolidated allowlist pattern across all endpoints
- 28 placeholder images identified for replacement
- Removed dead code: ShutdownProtocol.ts, duplicate pages, src/app/api/

### Security
- RLS enabled on ai_prompts_log table
- Auth required on metrics-aggregates endpoint
- CORS wildcard replaced with allowlist in supabase functions
- FOREIGN KEY constraints added to all table relationships
