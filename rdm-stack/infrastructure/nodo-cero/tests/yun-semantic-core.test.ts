import { describe, it, expect, beforeEach } from 'vitest';
import {
  createEnvelope,
  sealEnvelope,
  verifyEnvelope,
  validateSemanticPolicy,
  yunSemanticCoreStatus,
  resetYunCoreForTests,
  yunEnvelopeCreateSchema,
  yunEnvelopeVerifySchema,
  yunSemanticContextSchema,
  YUN_SEMANTIC_VERSION,
  YUN_CIPHER_SUITE,
  YUN_SIGNATURE_SUITE,
  CRYPTO_PROVIDER_NOT_CONFIGURED,
  getCryptoProvider,
  setCryptoProviderForTests,
  resetCryptoProviderForTests,
  assessYunPolicy,
  updateFederationHealth,
  federationHealth,
  allFederationHealth,
  resetFederationsForTests,
  yunReadyState,
  type YunCryptoProvider,
  type YunEnvelope,
  type YunSemanticContext,
  type ResearchBucket,
} from '@/lib/yun';
import { eventHistory, resetBusForTests } from '@/lib/core/events';

/* ------------------------------------------------------------------ */
/* Doble de prueba del proveedor híbrido. Ed25519 real (WebCrypto) +   */
/* ECDSA P-256 como SIMULACIÓN de ML-DSA-65 (igual precedente que      */
/* lib/isabella/mexa-crypto.ts). NUNCA es criptografía post-cuántica   */
/* real: solo valida la orquestación (regla AND) del núcleo.           */
/* ------------------------------------------------------------------ */

class TestHybridProvider implements YunCryptoProvider {
  readonly name = 'test-hybrid-webcrypto';
  readonly available = true;
  readonly description =
    'Doble de prueba: Ed25519 real + ECDSA P-256 como simulación de ML-DSA-65. No usar en producción.';

  private classicalKeys: CryptoKeyPair | null = null;
  private postQuantumKeys: CryptoKeyPair | null = null;
  private dataKey: CryptoKey | null = null;
  private dataKeyId = '';
  private counter = 0;

  private async ensureKeys(): Promise<void> {
    if (this.classicalKeys && this.postQuantumKeys) return;
    this.classicalKeys = (await crypto.subtle.generateKey(
      { name: 'Ed25519' },
      true,
      ['sign', 'verify'],
    )) as CryptoKeyPair;
    this.postQuantumKeys = (await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign', 'verify'],
    )) as CryptoKeyPair;
  }

  randomId(): string {
    this.counter += 1;
    return `test-id-${this.counter}-${Math.random().toString(36).slice(2, 10)}`;
  }

  async generateDataKey(): Promise<string> {
    this.dataKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
      'encrypt',
      'decrypt',
    ]);
    this.dataKeyId = this.randomId();
    return this.dataKeyId;
  }

  async encrypt(input: {
    plaintext: Uint8Array;
    keyId: string;
    aad: Uint8Array;
  }): Promise<Uint8Array> {
    if (!this.dataKey || input.keyId !== this.dataKeyId) throw new Error('data key desconocida');
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = new Uint8Array(
      await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv, additionalData: new Uint8Array(input.aad) },
        this.dataKey,
        new Uint8Array(input.plaintext),
      ),
    );
    const combined = new Uint8Array(iv.length + ciphertext.length);
    combined.set(iv, 0);
    combined.set(ciphertext, iv.length);
    return combined;
  }

  async decrypt(input: {
    ciphertext: Uint8Array;
    keyId: string;
    aad: Uint8Array;
  }): Promise<Uint8Array> {
    if (!this.dataKey || input.keyId !== this.dataKeyId) throw new Error('data key desconocida');
    const iv = new Uint8Array(input.ciphertext.slice(0, 12));
    const body = new Uint8Array(input.ciphertext.slice(12));
    const plaintext = new Uint8Array(
      await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv, additionalData: new Uint8Array(input.aad) },
        this.dataKey,
        body,
      ),
    );
    return plaintext;
  }

  async signClassical(input: { message: Uint8Array; keyId: string }): Promise<Uint8Array> {
    await this.ensureKeys();
    return new Uint8Array(
      await crypto.subtle.sign(
        { name: 'Ed25519' },
        this.classicalKeys!.privateKey,
        new Uint8Array(input.message),
      ),
    );
  }

  async verifyClassical(input: {
    message: Uint8Array;
    signature: Uint8Array;
    keyId: string;
  }): Promise<boolean> {
    await this.ensureKeys();
    return crypto.subtle.verify(
      { name: 'Ed25519' },
      this.classicalKeys!.publicKey,
      new Uint8Array(input.signature),
      new Uint8Array(input.message),
    );
  }

  async signPqc(input: { message: Uint8Array; keyId: string }): Promise<Uint8Array> {
    await this.ensureKeys();
    return new Uint8Array(
      await crypto.subtle.sign(
        { name: 'ECDSA', hash: 'SHA-256' },
        this.postQuantumKeys!.privateKey,
        new Uint8Array(input.message),
      ),
    );
  }

  async verifyPqc(input: {
    message: Uint8Array;
    signature: Uint8Array;
    keyId: string;
  }): Promise<boolean> {
    await this.ensureKeys();
    return crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      this.postQuantumKeys!.publicKey,
      new Uint8Array(input.signature),
      new Uint8Array(input.message),
    );
  }
}

const semantic: YunSemanticContext = {
  sensitivity: 'public',
  domain: 'knowledge',
  federationId: 'Fed1',
  ontology: 'urn:rdm:real-del-monte:conocimiento',
  provenance: [],
};

const payload = { saludo: 'hola', n: 42 };

beforeEach(() => {
  resetBusForTests();
  resetYunCoreForTests();
  resetCryptoProviderForTests();
  resetFederationsForTests();
});

describe('contrato · sobre semántico YUN', () => {
  it('acepta una creación válida y aplica provenance por defecto', () => {
    const parsed = yunEnvelopeCreateSchema.parse({ semantic, payload, producer: 'tests' });
    expect(parsed.semantic.provenance).toEqual([]);
    expect(parsed.payload).toEqual(payload);
  });

  it('rechaza claves extra (strict, fail-closed)', () => {
    const result = yunEnvelopeCreateSchema.safeParse({
      semantic,
      payload,
      producer: 'tests',
      extra: 1,
    });
    expect(result.success).toBe(false);
  });

  it('rechaza una federación desconocida', () => {
    const result = yunEnvelopeCreateSchema.safeParse({
      semantic: { ...semantic, federationId: 'Fed9' },
      payload,
      producer: 'tests',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza un dominio fuera del catálogo YUN', () => {
    const result = yunSemanticContextSchema.safeParse({ ...semantic, domain: 'mineria' });
    expect(result.success).toBe(false);
  });

  it('rechaza una sensibilidad fuera de la escala', () => {
    const result = yunSemanticContextSchema.safeParse({ ...semantic, sensitivity: 'ultra' });
    expect(result.success).toBe(false);
  });

  it('rechaza un sobre de verificación sin integridad', () => {
    const result = yunEnvelopeVerifySchema.safeParse({ envelope: { semantic, payload } });
    expect(result.success).toBe(false);
  });
});

describe('política semántica · fail-closed', () => {
  it('restricted/critical exigen sellado (SEAL_REQUIRED)', () => {
    const result = validateSemanticPolicy({ ...semantic, sensitivity: 'critical' });
    expect(result.status).toBe('SEAL_REQUIRED');
  });

  it('un sobre sellado con firma satisface la política crítica', () => {
    const sealed = {
      security: { sealed: true, signatures: { classical: {}, postQuantum: {} } },
    } as unknown as Pick<YunEnvelope, 'security'>;
    const result = validateSemanticPolicy({ ...semantic, sensitivity: 'restricted' }, sealed);
    expect(result.status).toBe('ok');
  });

  it('política de negocio: critical exige confianza declarada', () => {
    const assessment = assessYunPolicy({ ...semantic, sensitivity: 'critical' });
    expect(assessment.ok).toBe(false);
    expect(assessment.checks.some((check) => check.rule === 'critical-precision' && !check.ok)).toBe(
      true,
    );
  });
});

describe('núcleo semántico · sin proveedor (fail-closed)', () => {
  it('el proveedor por defecto no está disponible', () => {
    expect(getCryptoProvider().available).toBe(false);
  });

  it('crea un sobre sin sellar con integridad canónica', async () => {
    const envelope = await createEnvelope({ semantic, payload, producer: 'tests' });
    expect(envelope.version).toBe(YUN_SEMANTIC_VERSION);
    expect(envelope.security.sealed).toBe(false);
    expect(envelope.integrity.algorithm).toBe('sha256-canonical');
    expect(envelope.integrity.hash.length).toBe(64);
    expect(envelope.cipherSuite).toEqual(YUN_CIPHER_SUITE);
    expect(envelope.signatureSuite).toEqual(YUN_SIGNATURE_SUITE);
  });

  it('el sellado falla cerrado sin proveedor', async () => {
    await expect(sealEnvelope({ semantic, payload, producer: 'tests' })).rejects.toThrow(
      CRYPTO_PROVIDER_NOT_CONFIGURED,
    );
  });

  it('la verificación falla cerrada sin proveedor', async () => {
    const envelope = await createEnvelope({ semantic, payload, producer: 'tests' });
    await expect(verifyEnvelope(envelope)).rejects.toThrow(CRYPTO_PROVIDER_NOT_CONFIGURED);
  });
});

describe('núcleo semántico · firma híbrida (regla AND)', () => {
  it('sella con cifrado y firma híbrida completa', async () => {
    setCryptoProviderForTests(new TestHybridProvider());
    const envelope = await sealEnvelope({ semantic, payload, producer: 'tests' });
    expect(envelope.security.sealed).toBe(true);
    expect(envelope.security.encryptedPayload).toBeTruthy();
    expect(envelope.security.protectedSemanticHeader).toBeTruthy();
    expect(envelope.security.signatures?.classical.scheme).toBe('Ed25519');
    expect(envelope.security.signatures?.postQuantum.scheme).toBe('ML-DSA-65');
    expect(envelope.security.keyReferences?.encryptionKeyId).toBeTruthy();
  });

  it('verifica un sobre sellado íntegro (las cuatro comprobaciones)', async () => {
    setCryptoProviderForTests(new TestHybridProvider());
    const envelope = await sealEnvelope({ semantic, payload, producer: 'tests' });
    expect(await verifyEnvelope(envelope)).toBe(true);
    expect(yunSemanticCoreStatus().counters.verified).toBe(1);
  });

  it('rechaza un payload manipulado (hash inválido)', async () => {
    setCryptoProviderForTests(new TestHybridProvider());
    const envelope = await sealEnvelope({ semantic, payload, producer: 'tests' });
    const tampered = JSON.parse(JSON.stringify(envelope)) as YunEnvelope;
    tampered.payload = { ...payload, saludo: 'manipulado' };
    expect(await verifyEnvelope(tampered)).toBe(false);
    expect(yunSemanticCoreStatus().counters.invalid).toBe(1);
  });

  it('la firma clásica válida NO basta: post-cuántica inválida invalida todo', async () => {
    setCryptoProviderForTests(new TestHybridProvider());
    const envelope = await sealEnvelope({ semantic, payload, producer: 'tests' });
    const tampered = JSON.parse(JSON.stringify(envelope)) as YunEnvelope;
    tampered.security.signatures!.postQuantum.signature = 'AAAA';
    expect(await verifyEnvelope(tampered)).toBe(false);
  });

  it('rechaza un sobre sin sellar (SEAL_REQUIRED) para sensibilidad alta', async () => {
    setCryptoProviderForTests(new TestHybridProvider());
    const envelope = await createEnvelope(
      { semantic: { ...semantic, sensitivity: 'critical' }, payload, producer: 'tests' },
    );
    const policy = validateSemanticPolicy(envelope.semantic, envelope);
    expect(policy.status).toBe('SEAL_REQUIRED');
  });
});

describe('auditoría YUN · bus unificado', () => {
  it('publica yun.envelope.created al crear', async () => {
    await createEnvelope({ semantic, payload, producer: 'tests' });
    const events = eventHistory(50, { type: 'yun.envelope.created' });
    expect(events.length).toBe(1);
    expect(events[0].domain).toBe('yun');
    expect(events[0].data.federationId).toBe('Fed1');
  });

  it('publica yun.envelope.sealed y verified con proveedor', async () => {
    setCryptoProviderForTests(new TestHybridProvider());
    const envelope = await sealEnvelope({ semantic, payload, producer: 'tests' });
    await verifyEnvelope(envelope);
    const sealed = eventHistory(50, { type: 'yun.envelope.sealed' });
    const verified = eventHistory(50, { type: 'yun.envelope.verified' });
    expect(sealed.length).toBe(1);
    expect(verified.length).toBe(1);
  });

  it('publica yun.envelope.verify.invalid ante un sobre manipulado', async () => {
    setCryptoProviderForTests(new TestHybridProvider());
    const envelope = await sealEnvelope({ semantic, payload, producer: 'tests' });
    const tampered = JSON.parse(JSON.stringify(envelope)) as YunEnvelope;
    tampered.payload = { ...payload, saludo: 'manipulado' };
    await verifyEnvelope(tampered);
    const invalid = eventHistory(50, { type: 'yun.envelope.verify.invalid' });
    expect(invalid.length).toBe(1);
  });
});

describe('federaciones · heptafederación Fed1..Fed7', () => {
  it('todas las federaciones nacen HEALTHY', () => {
    const federations = allFederationHealth();
    expect(federations).toHaveLength(7);
    for (const health of federations) expect(health.status).toBe('HEALTHY');
  });

  it('actualiza salud y emite evento de cambio', () => {
    updateFederationHealth('Fed3', 'DEGRADED', { latencyMs: 820 });
    expect(federationHealth('Fed3')?.status).toBe('DEGRADED');
    const events = eventHistory(50, { type: 'yun.federation.health.changed' });
    expect(events.length).toBe(1);
    expect(events[0].data.to).toBe('DEGRADED');
    expect(events[0].data.federationId).toBe('Fed3');
  });
});

describe('prontitud operativa', () => {
  it('no listo sin proveedor criptográfico', () => {
    const state = yunReadyState();
    expect(state.ready).toBe(false);
    expect(state.providerAvailable).toBe(false);
  });

  it('listo con proveedor disponible y federaciones operativas', () => {
    setCryptoProviderForTests(new TestHybridProvider());
    const state = yunReadyState();
    expect(state.ready).toBe(true);
    expect(state.federationsOperational).toBe(7);
  });
});

describe('plano de investigación · aislamiento PennyLane', () => {
  it('ingiere solo buckets agregados de métricas', async () => {
    const { ingestResearchBucket, researchPlaneStatus } = await import('@/lib/yun');
    const result = ingestResearchBucket({ metric: 'entanglement_rate', value: 0.42, samples: 1024 });
    expect(result.ok).toBe(true);
    expect(researchPlaneStatus().isolated).toBe(true);
  });

  it('refusa buckets con payloads o claves (fail-closed por forma)', async () => {
    const { ingestResearchBucket } = await import('@/lib/yun');
    const withPayload = ingestResearchBucket({
      metric: 'fidelidad',
      value: 0.9,
      payload: { texto: 'secreto' },
    } as ResearchBucket);
    expect(withPayload.ok).toBe(false);
    if (!withPayload.ok) expect(withPayload.code).toBe('RESEARCH_BUCKET_DENIED');

    const withKey = ingestResearchBucket({
      metric: 'ruido',
      value: 0.1,
      apiKey: 'sk-1234',
    } as ResearchBucket);
    expect(withKey.ok).toBe(false);
  });

  it('refusa valores no numéricos', async () => {
    const { ingestResearchBucket } = await import('@/lib/yun');
    const result = ingestResearchBucket({ metric: 'phase', value: Number.NaN });
    expect(result.ok).toBe(false);
  });
});

describe('estado del núcleo', () => {
  it('reporta versión, proveedor fail-closed y suites declaradas', () => {
    const status = yunSemanticCoreStatus();
    expect(status.version).toBe(YUN_SEMANTIC_VERSION);
    expect(status.providerAvailable).toBe(false);
    expect(status.cipherSuite.kem).toBe('ML-KEM-768');
    expect(status.signatureSuite.postQuantum).toBe('ML-DSA-65');
  });
});
