# Data Flow

## Frontend → Backend
```
Client (React SPA)
  → api/_shared/ (CORS, Auth, Rate-limit)
  → api/* (Vercel Serverless)
  → supabase/functions/* (Supabase Edge Functions)
  → Supabase DB / External APIs
```

## AI Pipeline
```
User Message
  → isabella-chat (Vercel)
    → Primary Gateway (Claude)
    → Gemini Fallback
  → isa-ai (Vercel, local engine)
    → matrix classification
    → knowledge base retrieval
    → constitutional filter
  → Response
```

## Fusion Connection System
```
Client Request
  → api/connect/token.ts
    → FusionGateway.execute()
      → ConnectorRegistry / TokenVault
      → FederationBus event
  → Response
```

## Authentication Flow
```
Request with Bearer token
  → api/_shared/auth.ts (verifyAuth)
    → Supabase auth.getUser()
    → Return AuthResult {userId, role}
  → Endpoint handler
```

## Telemetry Flow
```
Application Events
  → api/_shared/telemetry.ts (emitTelemetry)
    → Batched POST to /api/telemetry
    → Supabase telemetry_logs table
```
