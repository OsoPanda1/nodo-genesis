/* ================================================================== */
/* DB — Adaptador de persistencia de voz de Isabella (perezoso)       */
/* ================================================================== */
/* El stack canónico del Nodo usa `postgres` (Postgres.js), no Prisma. */
/* El proveedor de voz intenta cargar `@prisma/client` SOLO si está    */
/* disponible; si no, degrada de forma segura (mismo patrón que        */
/* lib/cache/redis.ts). No añade dependencias ni rompe el runtime.     */
/* ================================================================== */

export type IsabellaVoiceStatus =
  | 'SUCCESS'
  | 'FALLBACK'
  | 'BLOCKED'
  | 'ERROR'
  | 'CANCELLED';

export type IsabellaVoiceMode = 'CLOUD' | 'LOCAL' | 'TEXT';

export interface IsabellaVoiceAssetRow {
  id: string;
  cacheKey: string;
  storagePath: string;
  profileId: string;
  voiceVersion: string;
  provider: string;
  providerVoiceId: string;
  locale: string;
  format: string;
  textHash: string;
  durationMs: number | null;
  byteSize: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IsabellaVoiceMetricRow {
  id: string;
  requestId: string;
  textHash: string;
  profileId: string;
  voiceVersion: string;
  provider: string;
  providerVoiceId: string | null;
  mode: IsabellaVoiceMode;
  status: IsabellaVoiceStatus;
  cacheHit: boolean;
  latencyMs: number | null;
  durationMs: number | null;
  failureCode: string | null;
  federationId: string | null;
  userId: string | null;
  createdAt: Date;
}

export interface VoicePersistence {
  isabellaVoiceAsset: {
    findUnique(args: { where: { cacheKey: string } }): Promise<IsabellaVoiceAssetRow | null>;
    create(args: {
      data: Omit<IsabellaVoiceAssetRow, 'id' | 'createdAt' | 'updatedAt' | 'locale' | 'format'> & Partial<Pick<IsabellaVoiceAssetRow, 'locale' | 'format'>>;
    }): Promise<IsabellaVoiceAssetRow>;
  };
  isabellaVoiceMetric: {
    create(args: {
      data: Omit<IsabellaVoiceMetricRow, 'id' | 'createdAt'>;
    }): Promise<IsabellaVoiceMetricRow>;
  };
}

let cached: VoicePersistence | null = null;

async function loadPersistence(): Promise<VoicePersistence> {
  if (cached) return cached;
  const moduleId = '@prisma/client';
  const mod = (await import(moduleId)) as unknown as {
    PrismaClient: new (opts?: { log?: string[] }) => VoicePersistence;
  };
  cached = new mod.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
  return cached;
}

/** Cliente de persistencia perezoso. Lanza solo si el paquete no está
 *  disponible; el consumidor (voz) degrada a modo local en ese caso. */
export async function getVoicePersistence(): Promise<VoicePersistence> {
  return loadPersistence();
}

export async function isVoicePersistenceAvailable(): Promise<boolean> {
  try {
    await loadPersistence();
    return true;
  } catch {
    return false;
  }
}
