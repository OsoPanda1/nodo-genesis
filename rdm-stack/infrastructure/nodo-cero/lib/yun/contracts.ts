/* ================================================================== */
/* CONTRACT YUN QSC — Contratos zod del sobre semántico               */
/* ================================================================== */
/* Espejo ejecutable del blueprint `yun-quantum-semantic-core`:        */
/*                                                                     */
/*   - Contexto semántico: sensitivity, dominio, federación, entidad,  */
/*     ontología, retención, procedencia (hash-chain) y confianza.     */
/*   - Cabecera pública: messageId, traceId, correlationId, createdAt, */
/*     producer.                                                       */
/*   - Suites declaradas: KEM (X25519 | ML-KEM) + AEAD (AES-256-GCM),  */
/*     firma híbrida (Ed25519 clásica + ML-DSA post-cuántica).         */
/*   - Integridad: hash SHA-256 del contenido canónico.                */
/*                                                                     */
/* Todos los contratos son `.strict()`: cualquier clave extra invalida */
/* el documento (fail-closed en la capa HTTP).                         */
/* ================================================================== */

import { z } from 'zod';

export const YUN_SEMANTIC_VERSION = 'yun.semantic-envelope.v1';
export const YUN_PROVIDER = 'yun';
export const YUN_INTEGRITY_ALGORITHM = 'sha256-canonical';
export const YUN_PQ_TARGET = 'ML-DSA-65';

/* Suite criptográfica declarada del sobre (negociación cerrada). */
export const YUN_CIPHER_SUITE = { kem: 'ML-KEM-768', aead: 'AES-256-GCM' } as const;
export const YUN_SIGNATURE_SUITE = { classical: 'Ed25519', postQuantum: 'ML-DSA-65' } as const;

/* Heptafederación YUN (espejo de lib/isabella/constitution). */
export const yunFederationSchema = z.enum([
  'Fed1',
  'Fed2',
  'Fed3',
  'Fed4',
  'Fed5',
  'Fed6',
  'Fed7',
]);

/* Dominios canónicos YUN (espejo de lib/isabella/events). */
export const yunDomainSchema = z.enum([
  'identity',
  'commerce',
  'knowledge',
  'telemetry',
  'gameplay',
  'security',
  'federations',
]);

/* Sensibilidad del contenido (blueprint SemanticClassification). */
export const yunSensitivityLevelSchema = z.enum([
  'public',
  'internal',
  'confidential',
  'restricted',
  'critical',
]);

export const yunProvenanceEntrySchema = z
  .object({
    type: z.string().trim().min(1).max(120),
    origin: z.string().trim().min(1).max(300),
    hash: z.string().trim().min(8).max(128),
  })
  .strict();

export const yunSemanticContextSchema = z
  .object({
    sensitivity: yunSensitivityLevelSchema,
    domain: yunDomainSchema,
    federationId: yunFederationSchema.optional(),
    entityType: z.string().trim().min(1).max(80).optional(),
    entityId: z.string().trim().min(1).max(160).optional(),
    ontology: z.string().trim().min(1).max(256).optional(),
    retentionPolicy: z.string().trim().min(1).max(200).optional(),
    provenance: z.array(yunProvenanceEntrySchema).default([]),
    confidence: z.number().min(0).max(1).optional(),
  })
  .strict();

export const yunHybridSignatureSchema = z
  .object({
    classical: z
      .object({
        scheme: z.string().min(1),
        keyId: z.string().min(1),
        signature: z.string().min(1),
      })
      .strict(),
    postQuantum: z
      .object({
        scheme: z.string().min(1),
        keyId: z.string().min(1),
        signature: z.string().min(1),
      })
      .strict(),
  })
  .strict();

export const yunEnvelopeSchema = z
  .object({
    version: z.literal(YUN_SEMANTIC_VERSION),
    messageId: z.string().min(1),
    traceId: z.string().min(1),
    correlationId: z.string().optional(),
    createdAt: z.string().min(1),
    producer: z.string().trim().min(1).max(120),
    semantic: yunSemanticContextSchema,
    cipherSuite: z
      .object({
        kem: z.enum(['X25519', 'ML-KEM-768', 'ML-KEM-1024']),
        aead: z.enum(['AES-256-GCM', 'ChaCha20-Poly1305']),
      })
      .strict(),
    signatureSuite: z
      .object({
        classical: z.enum(['Ed25519', 'ECDSA-P256']),
        postQuantum: z.enum(['ML-DSA-65', 'ML-DSA-87']),
      })
      .strict(),
    integrity: z
      .object({
        hash: z.string().min(1),
        algorithm: z.literal(YUN_INTEGRITY_ALGORITHM),
      })
      .strict(),
    security: z
      .object({
        provider: z.string().min(1),
        sealed: z.boolean(),
        deniedReason: z.string().optional(),
        protectedSemanticHeader: z.string().optional(),
        encryptedPayload: z.string().optional(),
        signatures: yunHybridSignatureSchema.optional(),
        keyReferences: z
          .object({
            encryptionKeyId: z.string().min(1),
            classicalSigningKeyId: z.string().min(1),
            postQuantumSigningKeyId: z.string().min(1),
          })
          .strict()
          .optional(),
      })
      .strict(),
    payload: z.unknown().optional(),
  })
  .strict();

export const yunEnvelopeCreateSchema = z
  .object({
    semantic: yunSemanticContextSchema,
    payload: z.unknown(),
    producer: z.string().trim().min(1).max(120),
    correlationId: z.string().optional(),
  })
  .strict();

export const yunEnvelopeSealSchema = z
  .object({
    semantic: yunSemanticContextSchema,
    payload: z.unknown(),
    producer: z.string().trim().min(1).max(120),
    correlationId: z.string().optional(),
  })
  .strict();

export const yunEnvelopeVerifySchema = z
  .object({
    envelope: yunEnvelopeSchema,
  })
  .strict();

export type YunFederation = z.infer<typeof yunFederationSchema>;
export type YunDomain = z.infer<typeof yunDomainSchema>;
export type YunSensitivityLevel = z.infer<typeof yunSensitivityLevelSchema>;
export type YunProvenanceEntry = z.infer<typeof yunProvenanceEntrySchema>;
export type YunSemanticContext = z.infer<typeof yunSemanticContextSchema>;
export type YunHybridSignature = z.infer<typeof yunHybridSignatureSchema>;
export type YunEnvelope = z.infer<typeof yunEnvelopeSchema>;
export type YunEnvelopeCreateInput = z.infer<typeof yunEnvelopeCreateSchema>;
export type YunEnvelopeSealInput = z.infer<typeof yunEnvelopeSealSchema>;
export type YunEnvelopeVerifyInput = z.infer<typeof yunEnvelopeVerifySchema>;
