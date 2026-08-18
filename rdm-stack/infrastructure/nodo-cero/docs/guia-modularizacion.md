# Guía de Modularización — Cómo Añadir un Dominio

## Visión General

Cada dominio del Nodo Cero es independiente pero integrado en la cadena Zero Trust, el bus de eventos y la observabilidad. Este documento describe el patrón para añadir un nuevo dominio (ej. `turismo`, `city`, `assets`) sin duplicar lógica ni quebrantar la arquitectura.

## Estructura de Carpetas para un Nuevo Dominio

```
lib/<dominio>/
├── index.ts                    # Barril: exports públicas del dominio
├── <dominio>-store.ts          # Estado síncrono (sin efectos de lado)
├── <dominio>-contracts.ts      # Esquemas Zod (petición/respuesta)
├── <dominio>-service.ts        # Lógica de negocio (persistencia, cálculos)
├── <dominio>-events.ts         # Tipos de eventos del dominio
└── <dominio>-cache.ts          # (Opcional) Caché de segundo nivel

app/api/<dominio>/
├── route.ts                    # GET/POST genérico
├── [id]/route.ts               # GET/PATCH/DELETE por ID
├── search/route.ts             # (Opcional) Búsqueda especializada
└── admin/
    └── route.ts                # (Opcional) Operaciones administrativas (scope requerido)

tests/
└── <dominio>.test.ts           # Suite de tests de Vitest
```

## Paso 1: Crear el Contrato Zod

**Archivo:** `lib/<dominio>/<dominio>-contracts.ts`

```typescript
/* ==================================================================
   <Dominio> — Contrato de validación
   ================================================================== */

import { z } from 'zod';

export const Create<Dominio>Input = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  // ... campos específicos del dominio
});

export const <Dominio>Output = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Create<Dominio>Input = z.infer<typeof Create<Dominio>Input>;
export type <Dominio>Output = z.infer<typeof <Dominio>Output>;
```

**Registrar en `lib/core/contracts/index.ts`:**

```typescript
export { Create<Dominio>Input, <Dominio>Output } from '@/lib/<dominio>/<dominio>-contracts';
```

## Paso 2: Crear el Store (Estado Síncrono)

**Archivo:** `lib/<dominio>/<dominio>-store.ts`

```typescript
/* ==================================================================
   <Dominio> Store — Estado sin efectos de lado
   ================================================================== */

import type { <Dominio>Output } from './<dominio>-contracts';

interface <Dominio>Store {
  cache: Map<string, <Dominio>Output>;
  metadata: {
    lastSync: Date | null;
    version: string;
  };
}

const store: <Dominio>Store = {
  cache: new Map(),
  metadata: {
    lastSync: null,
    version: '1.0.0',
  },
};

export function get<Dominio>FromCache(id: string): <Dominio>Output | null {
  return store.cache.get(id) ?? null;
}

export function set<Dominio>InCache(item: <Dominio>Output): void {
  store.cache.set(item.id, item);
  store.metadata.lastSync = new Date();
}

export function clear<Dominio>Cache(): void {
  store.cache.clear();
}
```

## Paso 3: Crear la Lógica de Negocio

**Archivo:** `lib/<dominio>/<dominio>-service.ts`

```typescript
/* ==================================================================
   <Dominio> Service — Lógica de negocio
   ================================================================== */

import { getDb } from '@/lib/core/persistence';
import { publishEvent } from '@/lib/core/events';
import type { Create<Dominio>Input, <Dominio>Output } from './<dominio>-contracts';
import { set<Dominio>InCache, get<Dominio>FromCache } from './<dominio>-store';

export async function create<Dominio>(
  input: Create<Dominio>Input,
  context: { userId: string; traceId: string }
): Promise<<Dominio>Output> {
  const db = getDb();
  const now = new Date();

  const item: <Dominio>Output = {
    id: crypto.randomUUID(),
    name: input.name,
    description: input.description ?? null,
    createdAt: now,
    updatedAt: now,
  };

  // Persistencia
  await db.query(
    'INSERT INTO <dominio> (id, name, description, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)',
    [item.id, item.name, item.description, item.createdAt, item.updatedAt]
  );

  // Caché
  set<Dominio>InCache(item);

  // Evento
  publishEvent('<dominio>.created', {
    id: item.id,
    name: item.name,
    userId: context.userId,
    traceId: context.traceId,
  });

  return item;
}

export async function get<Dominio>(id: string): Promise<<Dominio>Output | null> {
  // Intenta caché primero
  let item = get<Dominio>FromCache(id);
  if (item) return item;

  // Si no está en caché, consulta BD
  const db = getDb();
  const result = await db.query(
    'SELECT id, name, description, created_at, updated_at FROM <dominio> WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  item = {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };

  set<Dominio>InCache(item);
  return item;
}
```

## Paso 4: Crear la Ruta API con Route-Guard

**Archivo:** `app/api/<dominio>/route.ts`

```typescript
/* ==================================================================
   POST /api/<dominio> — Crear un <dominio>
   ================================================================== */

import { NextRequest, NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { Create<Dominio>Input } from '@/lib/<dominio>/<dominio>-contracts';
import { create<Dominio> } from '@/lib/<dominio>/<dominio>-service';

export const POST = guardedRoute(
  async (req: NextRequest, context) => {
    // El route-guard garantiza:
    // - Origen verificado
    // - Rate limit
    // - Validación de contrato (automática si se define en contracts)
    // - Autorización (scope verificado)
    // - Contexto seguro (userId, traceId, apiKey)

    let input: Create<Dominio>Input;
    try {
      input = Create<Dominio>Input.parse(await req.json());
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid request body', cause: String(err) },
        { status: 400 }
      );
    }

    const result = await create<Dominio>(input, {
      userId: context.userId,
      traceId: context.traceId,
    });

    return NextResponse.json(result, { status: 201 });
  },
  {
    method: 'POST',
    requiresSignature: false, // Cambiar a true si se requiere HMAC
    scopes: ['<dominio>:write'], // Scopes requeridos de la API key
  }
);
```

**Archivo:** `app/api/<dominio>/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { get<Dominio> } from '@/lib/<dominio>/<dominio>-service';

export const GET = guardedRoute(
  async (_req: NextRequest, context, params: { id: string }) => {
    const item = await get<Dominio>(params.id);

    if (!item) {
      return NextResponse.json(
        { error: '<Dominio> not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  },
  {
    method: 'GET',
    scopes: ['<dominio>:read'],
  }
);
```

## Paso 5: Registrar Health Check

**Actualizar:** `app/api/monitor/health/route.ts`

```typescript
// En el handler de health:
import { get<Dominio> } from '@/lib/<dominio>/<dominio>-service';

const healthChecks = {
  // ... otros dominios
  '<dominio>': async () => {
    try {
      // Test de lectura simple (no requiere acceso a BD si hay caché)
      const result = await get<Dominio>('test-id-that-likely-does-not-exist');
      return { status: 'up', message: 'Service accessible' };
    } catch (err) {
      return { status: 'down', message: String(err) };
    }
  },
};
```

## Paso 6: Registrar Contrato en Governance

**Actualizar:** `lib/governance/contracts.ts`

```typescript
export const DOMAIN_CONTRACTS = {
  // ... otros dominios
  '<dominio>': {
    semver: '1.0.0',
    routes: {
      'POST /api/<dominio>': {
        input: 'Create<Dominio>Input',
        output: '<Dominio>Output',
        scopes: ['<dominio>:write'],
        lifecycle: 'stable',
      },
      'GET /api/<dominio>/[id]': {
        input: 'id: string (path param)',
        output: '<Dominio>Output | null',
        scopes: ['<dominio>:read'],
        lifecycle: 'stable',
      },
    },
  },
};
```

## Paso 7: Crear Tabla en Base de Datos

**Archivo:** `supabase/migrations/00X_create_<dominio>_table.sql`

```sql
/* ==================================================================
   Creación de tabla <dominio> con RLS
   ================================================================== */

CREATE TABLE IF NOT EXISTS <dominio> (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX idx_<dominio>_created_by ON <dominio>(created_by);

-- RLS: Solo el creador puede ver/editar su <dominio>
ALTER TABLE <dominio> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "<dominio>_read_own"
  ON <dominio> FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "<dominio>_write_own"
  ON <dominio> FOR INSERT, UPDATE, DELETE
  USING (auth.uid() = created_by);

-- Trigger: actualizar updated_at automáticamente
CREATE TRIGGER update_<dominio>_updated_at
  BEFORE UPDATE ON <dominio>
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Aplicar la migración:**

```bash
supabase db push
# o
psql "$DATABASE_URL" -f supabase/migrations/00X_create_<dominio>_table.sql
```

## Paso 8: Escribir Tests

**Archivo:** `tests/<dominio>.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { create<Dominio>, get<Dominio> } from '@/lib/<dominio>/<dominio>-service';
import { clear<Dominio>Cache } from '@/lib/<dominio>/<dominio>-store';
import type { Create<Dominio>Input } from '@/lib/<dominio>/<dominio>-contracts';

describe('<Dominio> Domain', () => {
  beforeEach(() => {
    clear<Dominio>Cache();
  });

  it('debería crear un <dominio> válido', async () => {
    const input: Create<Dominio>Input = {
      name: 'Test <Dominio>',
      description: 'Una prueba',
    };

    const result = await create<Dominio>(input, {
      userId: 'test-user-1',
      traceId: 'trace-123',
    });

    expect(result.id).toBeDefined();
    expect(result.name).toBe('Test <Dominio>');
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it('debería recuperar un <dominio> de la caché', async () => {
    const input: Create<Dominio>Input = {
      name: 'Caché Test',
    };

    const created = await create<Dominio>(input, {
      userId: 'test-user-2',
      traceId: 'trace-456',
    });

    const retrieved = await get<Dominio>(created.id);

    expect(retrieved).toEqual(created);
  });

  it('debería devolver null para un <dominio> inexistente', async () => {
    const result = await get<Dominio>('nonexistent-id');
    expect(result).toBeNull();
  });
});
```

**Ejecutar tests:**

```bash
npm test  # Vitest
```

## Paso 9: Integrar Eventos

**Crear:** `lib/<dominio>/<dominio>-events.ts`

```typescript
/* ==================================================================
   <Dominio> Events — Tipos de eventos emitidos
   ================================================================== */

export type <Dominio>Event =
  | { type: '<dominio>.created'; id: string; name: string; userId: string; traceId: string }
  | { type: '<dominio>.updated'; id: string; userId: string; traceId: string }
  | { type: '<dominio>.deleted'; id: string; userId: string; traceId: string };
```

**Registrar en `lib/core/events/subscribers.ts`:**

```typescript
import type { <Dominio>Event } from '@/lib/<dominio>/<dominio>-events';

const subscribers: Record<string, (event: any) => void> = {
  // ... otros suscriptores
  '<dominio>.created': (event: <Dominio>Event) => {
    if (event.type === '<dominio>.created') {
      console.log(`[<Dominio>] Creado: ${event.name} (${event.id})`);
      // Logging, análisis, notificaciones, etc.
    }
  },
};
```

## Paso 10: Documentación

**Crear:** `docs/dominio-<dominio>.md`

Describir:
- Propósito del dominio
- Tabla de rutas API
- Ejemplos de request/response
- Requisitos de scope
- Casos de uso
- Limitaciones/notas

## Validación

Antes de hacer commit:

```bash
# 1. Verificación de tipos
npx tsc --noEmit

# 2. Linter
npm run lint

# 3. Tests
npm test

# 4. Auditor (sin `as never` ni `require()`)
npm run audit

# 5. Entorno (variables tipadas)
npm run check:env

# 6. Adopción del route-guard
npm run check:contracts

# 7. Todo en cadena
npm run quality
```

## Checklist Final

- ✅ Contrato Zod en `lib/<dominio>/<dominio>-contracts.ts`
- ✅ Store en `lib/<dominio>/<dominio>-store.ts`
- ✅ Service en `lib/<dominio>/<dominio>-service.ts`
- ✅ Rutas API con route-guard en `app/api/<dominio>/`
- ✅ Health check registrado en `app/api/monitor/health/route.ts`
- ✅ Contrato en `lib/governance/contracts.ts`
- ✅ Tabla en `supabase/migrations/`
- ✅ Tests en `tests/<dominio>.test.ts`
- ✅ Eventos en `lib/<dominio>/<dominio>-events.ts` + subscribers
- ✅ Documentación en `docs/`
- ✅ `npm run quality` sin errores
- ✅ README actualizado con rutas y referencias

---

**Nota:** Este patrón garantiza:
- **Modularidad:** cada dominio es independiente
- **Seguridad:** 7 capas del route-guard automáticas
- **Observabilidad:** eventos, logging, métricas
- **Testabilidad:** store + service desacoplados
- **Versionado:** semver y lifecycle en contracts
- **Sostenibilidad:** convenciones claras y documentadas
