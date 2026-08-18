/* ================================================================== */
/* CRYPTO PROVIDER YUN — Motor criptográfico híbrido fail-closed      */
/* ================================================================== */
/* Espejo del blueprint `yun-quantum-semantic-core` (contracts.ts):    */
/*                                                                     */
/*   - Data keys resolubles por keyId (estilo KMS/HSM).                */
/*   - AEAD: AES-256-GCM / ChaCha20-Poly1305.                          */
/*   - Firma clásica: Ed25519 / ECDSA-P256.                            */
/*   - Firma post-cuántica: ML-DSA-65 / ML-DSA-87.                     */
/*                                                                     */
/* Regla de seguridad del blueprint: NO se implementa ML-KEM ni        */
/* ML-DSA manualmente. Solo se acepta un proveedor externo auditado    */
/* (KMS/HSM, KAT vectors, interoperabilidad). Sin proveedor            */
/* configurado, toda operación criptográfica falla cerrado con         */
/* CRYPTO_PROVIDER_NOT_CONFIGURED.                                     */
/* ================================================================== */

import { randomUUID } from 'node:crypto';
import { getEnv } from '@/lib/core/env';

export const CRYPTO_PROVIDER_NOT_CONFIGURED = 'CRYPTO_PROVIDER_NOT_CONFIGURED';

export interface EncryptInput {
  plaintext: Uint8Array;
  keyId: string;
  aad: Uint8Array;
}

export interface DecryptInput {
  ciphertext: Uint8Array;
  keyId: string;
  aad: Uint8Array;
}

export interface SignInput {
  message: Uint8Array;
  keyId: string;
}

export interface VerifyInput {
  message: Uint8Array;
  signature: Uint8Array;
  keyId: string;
}

/** Contrato del proveedor criptográfico híbrido (estilo KMS: las claves
 *  se resuelven por keyId dentro del proveedor, nunca se exponen). */
export interface YunCryptoProvider {
  readonly name: string;
  /** true solo si el motor está configurado, auditado y es usable. */
  readonly available: boolean;
  readonly description: string;
  randomId(): string;
  /** Genera una data key y devuelve su keyId para cifrar/descifrar. */
  generateDataKey(): Promise<string>;
  encrypt(input: EncryptInput): Promise<Uint8Array>;
  decrypt(input: DecryptInput): Promise<Uint8Array>;
  signClassical(input: SignInput): Promise<Uint8Array>;
  signPqc(input: SignInput): Promise<Uint8Array>;
  verifyClassical(input: VerifyInput): Promise<boolean>;
  verifyPqc(input: VerifyInput): Promise<boolean>;
}

export class CryptoProviderError extends Error {
  readonly code: string;

  constructor(code: string, message?: string) {
    super(message ?? code);
    this.name = 'CryptoProviderError';
    this.code = code;
  }
}

export function providerError(code: string, message?: string): CryptoProviderError {
  return new CryptoProviderError(code, message);
}

/** Proveedor por defecto: sin motor auditado, todo falla cerrado. */
export class UnconfiguredCryptoProvider implements YunCryptoProvider {
  readonly name: string = 'unconfigured';
  readonly available = false;
  readonly description =
    'Sin proveedor criptográfico auditado configurado. El sellado híbrido ' +
    `falla cerrado con ${CRYPTO_PROVIDER_NOT_CONFIGURED}.`;

  randomId(): string {
    return randomUUID();
  }

  async generateDataKey(): Promise<string> {
    throw providerError(CRYPTO_PROVIDER_NOT_CONFIGURED);
  }

  async encrypt(): Promise<Uint8Array> {
    throw providerError(CRYPTO_PROVIDER_NOT_CONFIGURED);
  }

  async decrypt(): Promise<Uint8Array> {
    throw providerError(CRYPTO_PROVIDER_NOT_CONFIGURED);
  }

  async signClassical(): Promise<Uint8Array> {
    throw providerError(CRYPTO_PROVIDER_NOT_CONFIGURED);
  }

  async signPqc(): Promise<Uint8Array> {
    throw providerError(CRYPTO_PROVIDER_NOT_CONFIGURED);
  }

  async verifyClassical(): Promise<boolean> {
    throw providerError(CRYPTO_PROVIDER_NOT_CONFIGURED);
  }

  async verifyPqc(): Promise<boolean> {
    throw providerError(CRYPTO_PROVIDER_NOT_CONFIGURED);
  }
}

/** Proveedor solicitado pero no registrado: se trata como no configurado. */
class UnregisteredProvider extends UnconfiguredCryptoProvider {
  override readonly name: string;
  override readonly description: string;

  constructor(requested: string) {
    super();
    this.name = `unregistered:${requested}`;
    this.description =
      `Proveedor '${requested}' no registrado. Solo se acepta un motor externo ` +
      'auditado; hasta entonces el sellado híbrido falla cerrado con ' +
      `${CRYPTO_PROVIDER_NOT_CONFIGURED}.`;
  }
}

let cachedProvider: YunCryptoProvider | null = null;

/** Resuelve el proveedor actual desde el contrato de entorno.
 *  Hoy solo 'unconfigured' está registrado; cualquier otro valor se
 *  trata como proveedor no registrado y mantiene el fail-closed. */
export function resolveProvider(): YunCryptoProvider {
  const requested = (getEnv().YUN_CRYPTO_PROVIDER ?? 'unconfigured').trim().toLowerCase();
  if (requested === '' || requested === 'unconfigured') {
    return new UnconfiguredCryptoProvider();
  }
  return new UnregisteredProvider(requested);
}

/** Proveedor en uso (caché por proceso). */
export function getCryptoProvider(): YunCryptoProvider {
  if (!cachedProvider) cachedProvider = resolveProvider();
  return cachedProvider;
}

/** Invalida la caché del proveedor (uso en pruebas). */
export function resetCryptoProviderForTests(): void {
  cachedProvider = null;
}

/** Fija el proveedor activo (solo para pruebas de orquestación). */
export function setCryptoProviderForTests(provider: YunCryptoProvider): void {
  cachedProvider = provider;
}
