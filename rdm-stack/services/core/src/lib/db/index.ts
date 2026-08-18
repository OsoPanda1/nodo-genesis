/* ================================================================== */
/* DB — Cliente Prisma perezoso                                       */
/* ================================================================== */
/* Crea el cliente solo cuando DATABASE_URL existe; en caso contrario  */
/* devuelve null para que el stack funcione sin base de datos.        */
/* ================================================================== */

import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __rdmTamvPrisma: PrismaClient | undefined;
}

export function getDbUrl(): string | null {
  return process.env["DATABASE_URL"] ?? null;
}

export function hasDatabase(): boolean {
  return Boolean(getDbUrl());
}

export function getPrisma(): PrismaClient | null {
  if (!hasDatabase()) return null;
  if (globalThis.__rdmTamvPrisma) return globalThis.__rdmTamvPrisma;
  const client = new PrismaClient({ datasources: { db: { url: getDbUrl()! } } });
  globalThis.__rdmTamvPrisma = client;
  return client;
}
