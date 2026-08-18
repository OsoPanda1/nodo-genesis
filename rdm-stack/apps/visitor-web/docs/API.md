# API — RDM Digital Hub

## Vercel Serverless Functions

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/api/health` | GET | Health check del sistema |
| `/api/isa-ai` | POST | ISA-AI autónomo (cero dependencias externas) |
| `/api/isabella-chat` | POST | Isabella AI chat (Gemini/Claude) |
| `/api/tts-isabella` | POST | Síntesis de voz |
| `/api/model-router` | POST | Ruteo de modelos AI |
| `/api/autonoma` | POST | Agente Autonoma AI |
| `/api/telemetry` | POST | Ingesta de telemetría |
| `/api/connect/token` | POST | Emisión de token de conexión |
| `/api/connect/inspect` | GET | Inspección de tokens |
| `/api/cron/health-check` | POST | Monitoreo periódico |
| `/api/cron/stripe-webhook` | POST | Webhook de Stripe |
| `/api/knowledge-cells/*` | POST | Render 3D/4D de celdas de conocimiento |

## Supabase Edge Functions

21 Edge Functions para gamificación, pagos, IA, telemetría y más.

Ver `supabase/functions/` para documentación detallada de cada función.
