/* ================================================================== */
/* SEMANTIC CORE YUN — Núcleo del sobre semántico                      */
/* ================================================================== */
/* Espejo del blueprint `yun-quantum-semantic-core`:                   */
/*                                                                     */
/*   - createEnvelope: contexto semántico + payload + integridad.      */
/*   - sealEnvelope: sellado híbrido (cifra KEM/AEAD + firma clásica   */
/*     y post-cuántica). Regla de verificación AND estricta.           */
/*   - verifyEnvelope: clásica AND post-cuántica AND política AND hash */
/*     (rechaza si una sola firma falla).                              */
/*   - validateSemanticPolicy: sensibilidad 'restricted'/'critical'    */
/*     exigen sellado y cuerpo firmado.                                */
/*   - Estado del core para observabilidad (/api/yun/status).          */
/* ================================================================== */

import { sha256, stableJson } from '@/lib/continuity/hash-chain';
import { randomUUID } from 'node:crypto';
import { emitYunAudit } from './audit';
import {
  YUN_CIPHER_SUITE,
  YUN_INTEGRITY_ALGORITHM,
  YUN_SEMANTIC_VERSION,
  YUN_SIGNATURE_SUITE,
  type YunEnvelope,
  type YunEnvelopeCreateInput,
  type YunSemanticContext,
  yunEnvelopeSchema,
} from './contracts';
import {
  CryptoProviderError,
  getCryptoProvider,
  providerError,
  type YunCryptoProvider,
} from './crypto-provider';

export const SEAL_REQUIRED = 'SEAL_REQUIRED';
export const PUBLIC_KEYS_REQUIRED = 'PUBLIC_KEYS_REQUIRED';
export const SEALED = 'SEALED';
export const VALID = 'VALID';
export const INVALID = 'INVALID';

export interface YunCoreStatus {
  ok: boolean;
  version: string;
  provider: string;
  providerAvailable: boolean;
  cipherSuite: typeof YUN_CIPHER_SUITE;
  signatureSuite: typeof YUN_SIGNATURE_SUITE;
  counters: {
    created: number;
    sealed: number;
    verified: number;
    invalid: number;
    denied: number;
  };
}

const coreCounters = {
  created: 0,
  sealed: 0,
  verified: 0,
  invalid: 0,
  denied: 0,
};

function canonicalContent(input: YunEnvelopeCreateInput): string {
  return stableJson({
    version: YUN_SEMANTIC_VERSION,
    semantic: input.semantic,
    payload: input.payload,
  });
}

function computeIntegrity(input: YunEnvelopeCreateInput): string {
  return sha256(canonicalContent(input));
}

function defaultProviderName(provider: YunCryptoProvider): string {
  return provider?.name ?? 'unconfigured';
}

function buildEnvelope(
  input: YunEnvelopeCreateInput,
  providerName: string,
  integrityHash: string,
): YunEnvelope {
  return {
    version: YUN_SEMANTIC_VERSION,
    messageId: randomUUID(),
    traceId: randomUUID(),
    correlationId: input.correlationId,
    createdAt: new Date().toISOString(),
    producer: input.producer,
    semantic: input.semantic,
    cipherSuite: YUN_CIPHER_SUITE,
    signatureSuite: YUN_SIGNATURE_SUITE,
    integrity: {
      hash: integrityHash,
      algorithm: YUN_INTEGRITY_ALGORITHM,
    },
    security: {
      provider: providerName,
      sealed: false,
    },
    payload: input.payload,
  };
}

/** Crea un sobre semántico (sin sellar). */
export async function createEnvelope(input: YunEnvelopeCreateInput): Promise<YunEnvelope> {
  const provider = getCryptoProvider();
  const envelope = buildEnvelope(input, defaultProviderName(provider), computeIntegrity(input));
  coreCounters.created += 1;
  emitYunAudit(
    'yun.envelope.created',
    {
      messageId: envelope.messageId,
      sensitivity: input.semantic.sensitivity,
      domain: input.semantic.domain,
      federationId: input.semantic.federationId,
      sealed: false,
    },
    { traceId: envelope.traceId, federation: input.semantic.federationId },
  );
  return envelope;
}

/** Sella el sobre: cifra el cuerpo y firma de forma híbrida. */
export async function sealEnvelope(input: YunEnvelopeCreateInput): Promise<YunEnvelope> {
  const provider = getCryptoProvider();
  if (!provider.available) {
    coreCounters.denied += 1;
    emitYunAudit(
      'yun.envelope.seal.denied',
      { sensitivity: input.semantic.sensitivity, domain: input.semantic.domain },
      { traceId: undefined, federation: input.semantic.federationId, severity: 'warning' },
    );
    throw providerError('CRYPTO_PROVIDER_NOT_CONFIGURED');
  }

  const envelope = await createEnvelope(input);
  const message = sha256(canonicalContent(input));

  const encryptionKeyId = await provider.generateDataKey();
  const classicalSigningKeyId = await provider.randomId();
  const postQuantumSigningKeyId = await provider.randomId();

  const plaintext = new TextEncoder().encode(JSON.stringify(input.payload));
  const semanticBytes = new TextEncoder().encode(JSON.stringify(input.semantic));
  const encrypted = await provider.encrypt({
    plaintext,
    keyId: encryptionKeyId,
    aad: new TextEncoder().encode(message),
  });
  const protectedHeader = await provider.encrypt({
    plaintext: semanticBytes,
    keyId: encryptionKeyId,
    aad: new TextEncoder().encode(message),
  });

  const classical = await provider.signClassical({
    message: new TextEncoder().encode(message),
    keyId: classicalSigningKeyId,
  });
  const postQuantum = await provider.signPqc({
    message: new TextEncoder().encode(message),
    keyId: postQuantumSigningKeyId,
  });

  const base64Url = (bytes: Uint8Array): string =>
    Buffer.from(bytes).toString('base64url');

  coreCounters.sealed += 1;
  const sealed = {
    ...envelope,
    security: {
      provider: provider.name,
      sealed: true,
      protectedSemanticHeader: base64Url(protectedHeader),
      encryptedPayload: base64Url(encrypted),
      signatures: {
        classical: {
          scheme: YUN_SIGNATURE_SUITE.classical,
          keyId: classicalSigningKeyId,
          signature: base64Url(classical),
        },
        postQuantum: {
          scheme: YUN_SIGNATURE_SUITE.postQuantum,
          keyId: postQuantumSigningKeyId,
          signature: base64Url(postQuantum),
        },
      },
      keyReferences: {
        encryptionKeyId,
        classicalSigningKeyId,
        postQuantumSigningKeyId,
      },
    },
    payload: input.payload,
  };
  emitYunAudit(
    'yun.envelope.sealed',
    {
      messageId: sealed.messageId,
      sensitivity: input.semantic.sensitivity,
      domain: input.semantic.domain,
      federationId: input.semantic.federationId,
      sealed: true,
      cipherSuite: YUN_CIPHER_SUITE,
    },
    { traceId: sealed.traceId, federation: input.semantic.federationId },
  );
  return sealed;
}

/** Verifica el sobre con la regla AND del blueprint. */
export async function verifyEnvelope(envelope: YunEnvelope): Promise<boolean> {
  const provider = getCryptoProvider();
  if (!provider.available) {
    coreCounters.invalid += 1;
    throw providerError('CRYPTO_PROVIDER_NOT_CONFIGURED');
  }
  if (envelope.integrity.algorithm !== YUN_INTEGRITY_ALGORITHM) {
    coreCounters.invalid += 1;
    return false;
  }

  const policy = validateSemanticPolicy(envelope.semantic, envelope);
  if (policy.status !== 'ok') {
    coreCounters.denied += 1;
    return false;
  }

  const message = sha256(
    stableJson({
      version: envelope.version,
      semantic: envelope.semantic,
      payload: envelope.payload,
    }),
  );

  if (message !== envelope.integrity.hash) {
    coreCounters.invalid += 1;
    emitYunAudit(
      'yun.envelope.verify.invalid',
      {
        messageId: envelope.messageId,
        sensitivity: envelope.semantic.sensitivity,
        domain: envelope.semantic.domain,
        federationId: envelope.semantic.federationId,
        reason: 'hash_mismatch',
      },
      { traceId: envelope.traceId, federation: envelope.semantic.federationId, severity: 'warning' },
    );
    return false;
  }

  const sigs = envelope.security.signatures;
  if (!sigs) {
    coreCounters.invalid += 1;
    emitYunAudit(
      'yun.envelope.verify.invalid',
      {
        messageId: envelope.messageId,
        sensitivity: envelope.semantic.sensitivity,
        domain: envelope.semantic.domain,
        federationId: envelope.semantic.federationId,
        reason: 'missing_signatures',
      },
      { traceId: envelope.traceId, federation: envelope.semantic.federationId, severity: 'warning' },
    );
    return false;
  }

  const classical = await provider.verifyClassical({
    message: new TextEncoder().encode(message),
    signature: Uint8Array.from(Buffer.from(sigs.classical.signature, 'base64url')),
    keyId: sigs.classical.keyId,
  });
  const postQuantum = await provider.verifyPqc({
    message: new TextEncoder().encode(message),
    signature: Uint8Array.from(Buffer.from(sigs.postQuantum.signature, 'base64url')),
    keyId: sigs.postQuantum.keyId,
  });

  const ok = classical && postQuantum;
  if (!ok) coreCounters.invalid += 1;
  else coreCounters.verified += 1;
  emitYunAudit(
    ok ? 'yun.envelope.verified' : 'yun.envelope.verify.invalid',
    {
      messageId: envelope.messageId,
      sensitivity: envelope.semantic.sensitivity,
      domain: envelope.semantic.domain,
      federationId: envelope.semantic.federationId,
      classical: Boolean(classical),
      postQuantum: Boolean(postQuantum),
    },
    { traceId: envelope.traceId, federation: envelope.semantic.federationId, severity: ok ? 'info' : 'warning' },
  );
  return ok;
}

/** Validación de política semántica: sensibilidad exige sellado. */
export function validateSemanticPolicy(
  semantic: YunSemanticContext,
  envelope?: Pick<YunEnvelope, 'security'>,
): { status: 'ok' } | { status: string; reason: string } {
  if (semantic.sensitivity === 'restricted' || semantic.sensitivity === 'critical') {
    const sealed = envelope?.security?.sealed ?? false;
    if (!sealed) return { status: SEAL_REQUIRED, reason: 'sensibilidad exige sellado híbrido' };
    if (!envelope?.security?.signatures) {
      return { status: PUBLIC_KEYS_REQUIRED, reason: 'falta firma híbrida' };
    }
  }
  return { status: 'ok' };
}

/** Estado del core para observabilidad. */
export function yunSemanticCoreStatus(): YunCoreStatus {
  const provider = getCryptoProvider();
  return {
    ok: provider.available,
    version: YUN_SEMANTIC_VERSION,
    provider: provider.name,
    providerAvailable: provider.available,
    cipherSuite: YUN_CIPHER_SUITE,
    signatureSuite: YUN_SIGNATURE_SUITE,
    counters: { ...coreCounters },
  };
}

export function isCryptoProviderError(error: unknown): error is CryptoProviderError {
  return error instanceof CryptoProviderError;
}

export function resetYunCoreForTests(): void {
  coreCounters.created = 0;
  coreCounters.sealed = 0;
  coreCounters.verified = 0;
  coreCounters.invalid = 0;
  coreCounters.denied = 0;
}

/** Parsing estricto del sobre (fail-closed en la capa HTTP). */
export function parseEnvelope(input: unknown): YunEnvelope {
  return yunEnvelopeSchema.parse(input);
}
