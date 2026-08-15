# API Contracts

## Vercel Serverless Functions (`api/`)

| Endpoint | Method | Auth | Rate Limit | Description |
|----------|--------|------|------------|-------------|
| `/api/health` | GET | None | 60/min | Public health check |
| `/api/telemetry` | GET/POST | None | 30/min | Infrastructure telemetry |
| `/api/model-router` | POST | JWT | 10/min | AI model routing |
| `/api/isa-ai` | POST | JWT | 10/min | Isabella AI engine |
| `/api/isabella-chat` | POST | JWT | 20/min | Chat gateway |
| `/api/tts-isabella` | POST | None | 30/min | Text-to-speech |
| `/api/cron/stripe-webhook` | POST | Stripe sig | None | Stripe events |
| `/api/cron/health-check` | GET | CRON_SECRET | None | Cron health probe |
| `/api/connect/token` | POST | None | N/A | Fusion token |
| `/api/connect/inspect` | GET | Bearer | N/A | Fusion inspect |

## Supabase Edge Functions (`supabase/functions/`)

| Function | Method | Auth | Description |
|----------|--------|------|-------------|
| `isabella-ai` | POST | JWT | AI gateway (primary) |
| `isabella-ontology` | POST | JWT | Ontology queries |
| `rdm-redeem` | POST | JWT | Point redemption |
| `rdm-membership-activate` | POST | JWT | Membership activation |
| `stripe-webhook` | POST | Stripe sig | Stripe events |
| `tts-isabella` | POST | JWT | Google Cloud TTS |
| `metrics-aggregates` | GET | JWT | Platform metrics |
| `federation-health` | GET | None | Federation health |
