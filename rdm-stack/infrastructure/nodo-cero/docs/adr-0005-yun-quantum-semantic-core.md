# ADR-0005 — YUN Quantum Semantic Core: Sobres Semánticos Híbridos

- **Estado:** Aceptado
- **Fecha:** 2026
- **Área:** Seguridad / Integridad / Post-Cuántica
- **Decisores:** Arquitectura Nodo Cero / Heptafederación YUN
- **Dominio:** YUN Quantum Semantic Core (QSC)
- **Implementación:** `lib/yun/` y `app/api/yun/*`

---

## Contexto

El RDM Digital Hub — Nodo Cero opera como una plataforma territorial soberana sobre la Arquitectura Heptafederada YUN. La plataforma transporta y procesa flujos de eventos distribuidos entre dominios territoriales, cognitivos, documentales, operativos y federados.

Estos dominios incluyen, entre otros:

- City IOC
- Twins
- Assets
- Grid
- Marketplace
- Gamification
- Isabella / ISA / CROWN
- Identity YUN
- CITEMESH
- GEMET
- Continuity
- Archive
- Monitor y Observability
- Turismo

Antes de esta decisión, los eventos podían portar trazabilidad operativa mediante `traceId` y `correlationId`, pero no existía un mecanismo uniforme que encapsulara y protegiera verificablemente:

- Nivel de sensibilidad.
- Dominio de origen y destino.
- Federación de procedencia.
- Identidad de entidad asociada.
- Ontología aplicable.
- Política de retención.
- Procedencia inmutable.
- Índice de confianza.
- Integridad canónica.
- Confidencialidad del contenido transaccional.
- Autenticidad criptográfica híbrida.
- Resistencia ante amenazas criptográficas post-cuánticas.

Esta ausencia generaba dos riesgos prioritarios.

### Amenaza de almacenamiento retrospectivo

La amenaza conocida como **harvest now, decrypt later** consiste en interceptar y almacenar tráfico cifrado contemporáneo para descifrarlo posteriormente cuando exista capacidad de computación cuántica suficiente.

Los datos territoriales, patrimoniales, operativos, de infraestructura, de identidad o de gobernanza pueden conservar valor durante décadas. Por ello, la seguridad debe considerar no solamente el riesgo presente, sino también la confidencialidad futura.

### Alteración semántica silenciosa

Un actor interno, externo o federado podría modificar silenciosamente metadatos críticos durante el tránsito entre nodos, por ejemplo:

- Reducir el nivel de sensibilidad de `critical` a `internal`.
- Cambiar el dominio de procedencia.
- Alterar el identificador de federación.
- Sustituir la ontología asociada.
- Modificar la política de retención.
- Insertar, eliminar o reordenar atributos.
- Suplantar productor, entidad o contexto.
- Reutilizar mensajes previamente válidos.
- Alterar la cadena de procedencia.

Una firma o hash aplicada solamente sobre el cuerpo de datos no protege por sí misma el contexto semántico. Para preservar soberanía, trazabilidad y confianza federada, el contexto debe ser parte criptográficamente vinculante del mensaje.

---

## Decisión

Se aprueba la implementación oficial del **YUN Quantum Semantic Core (QSC)** como un dominio soberano, independiente y transversal dentro del Nodo Cero.

El QSC será responsable de crear, validar, sellar, verificar y auditar sobres semánticos híbridos para eventos que crucen límites de dominio, confianza, persistencia, transporte federado o sensibilidad.

La implementación se alojará en:

```text
lib/yun/
```

La superficie pública del dominio se expondrá mediante:

```text
app/api/yun/*
```

El formato canónico del sobre será:

```text
yun.semantic-envelope.v1
```

El QSC no sustituye los demás dominios de seguridad y operación. Se integra con ellos preservando una separación de responsabilidades.

| Dominio | Responsabilidad |
|---|---|
| QSC | Integridad semántica, cifrado híbrido, firmas duales y validación de sobres |
| Zero Trust | Origen, autenticación, autorización, scopes, rate limits y fail-closed |
| IDENTITY YUN | Emisión, rotación, revocación e introspección de API keys soberanas |
| CITEMESH | Registro P2P, salud de nodos, enrutamiento y failover federado |
| GEMET | Ontologías, conocimiento federado, checksum, réplicas y caché firmada |
| Continuity | Journal, reconciliación, aislamiento y continuidad operacional |
| Archive | Preservación documental, checksum, curación y evidencia histórica |
| Isabella / ISA | Asistencia cognitiva y razonamiento, sin autoridad criptográfica sobre QSC |
| Observability | Métricas, telemetría, estados y alertamiento |
| Research Plane | Investigación agregada, no autoritativa y aislada |

---

## Alcance

El QSC aplica obligatoriamente cuando un evento:

- Cruza entre federaciones YUN.
- Se enruta mediante CITEMESH.
- Se replica, consulta o publica mediante GEMET.
- Se persiste como evidencia crítica en Continuity.
- Se incorpora al Archive con requisitos de procedencia.
- Contiene información `restricted` o `critical`.
- Representa una instrucción operacional de infraestructura, ciudad, agua, energía, activos o emergencias.
- Tiene efectos económicos, de identidad, de gobernanza, de seguridad o de confianza.
- Requiere evidencia verificable de autenticidad, integridad y clasificación.

El QSC puede utilizarse también para eventos de menor sensibilidad cuando el dominio necesite trazabilidad, integridad canónica o correlación federada.

---

## No objetivos

Esta ADR no define:

- La implementación manual de algoritmos post-cuánticos.
- La custodia local de claves privadas de producción.
- La sustitución de IDENTITY YUN.
- La sustitución del `route-guard` único.
- La sustitución de CITEMESH como mecanismo de ruteo.
- La sustitución de GEMET como grafo y catálogo ontológico.
- La sustitución del journal de Continuity.
- La sustitución del modelo de confianza canónico de `lib/security/trust.ts`.
- El uso del plano de investigación como fuente autoritativa.
- El descifrado, análisis o exposición de cargas sensibles por herramientas cognitivas.

---

## Arquitectura

El QSC opera como plano transversal de integridad semántica.

```text
Cliente / Sensor / Dominio productor
                │
                ▼
      route-guard Zero Trust
                │
                ├── IDENTITY YUN
                ├── Validación de scopes
                ├── Validación de origen
                ├── Rate limiting
                └── Política fail-closed
                │
                ▼
        YUN Quantum Semantic Core
                │
                ├── createEnvelope()
                ├── validateSemanticPolicy()
                ├── sealEnvelope()
                ├── verifyEnvelope()
                └── audit()
                │
                ▼
 ┌──────────────┼────────────────┬────────────────┐
 ▼              ▼                ▼                ▼
CITEMESH      GEMET         Continuity         Archive
Ruteo P2P     Ontologías    Journal            Preservación
Federado      Réplicas      Reconciliación     Evidencia
```

Todo consumidor de un sobre sellado debe verificarlo antes de confiar en:

- El contenido.
- La clasificación.
- El productor.
- La federación.
- La procedencia.
- El nivel de sensibilidad.
- La integridad.
- La política de uso o retención.

---

## Sobre semántico

### Formato

Cada evento protegido por el QSC se encapsula usando:

```text
yun.semantic-envelope.v1
```

La estructura se divide en:

1. Contexto semántico.
2. Cabecera pública de trazabilidad.
3. Cuerpo transaccional protegido.
4. Material de encapsulamiento híbrido de claves.
5. Firmas híbridas.
6. Integridad canónica.
7. Metadatos de auditoría y verificación.

### Estructura lógica

```ts
type YunSemanticEnvelopeV1 = {
  version: "yun.semantic-envelope.v1";

  publicHeader: {
    messageId: string;
    traceId: string;
    correlationId: string;
    createdAt: string;
    producer: string;
  };

  semanticContext: {
    sensitivity: "public" | "internal" | "confidential" | "restricted" | "critical";
    domain: string;
    federationId: string;
    entityType?: string;
    entityId?: string;
    ontology?: string;
    retentionPolicy?: string;
    provenance: {
      previousHash?: string;
      chainHash?: string;
      sourceNode?: string;
    };
    confidence: number;
  };

  payload: {
    mode: "plaintext" | "sealed";
    algorithm?: string;
    ciphertext?: string;
    iv?: string;
    authTag?: string;
    plaintext?: unknown;
  };

  keyEncapsulation?: {
    mode: "hybrid";
    classical: {
      algorithm: "X25519";
      recipientKeyId: string;
      encapsulatedKey: string;
    };
    postQuantum: {
      algorithm: "ML-KEM-768" | "ML-KEM-1024";
      recipientKeyId: string;
      encapsulatedKey: string;
    };
  };

  signatures?: {
    classical: {
      algorithm: "Ed25519" | "ECDSA-P256";
      keyId: string;
      signature: string;
    };
    postQuantum: {
      algorithm: "ML-DSA-65" | "ML-DSA-87";
      keyId: string;
      signature: string;
    };
  };

  integrity: {
    canonicalization: "stableJson";
    hashAlgorithm: "SHA-256";
    canonicalHash: string;
  };
};
```

La implementación concreta deberá usar contratos estrictos mediante Zod y rechazar atributos no declarados.

---

## Contexto semántico

El contexto semántico es parte protegida del sobre y debe incluirse en la serialización canónica, el hash y las firmas.

| Campo | Propósito |
|---|---|
| `sensitivity` | Clasificación de sensibilidad del evento |
| `domain` | Dominio funcional emisor |
| `federationId` | Federación YUN de procedencia o jurisdicción |
| `entityType` | Tipo de entidad relacionada |
| `entityId` | Identificador de entidad |
| `ontology` | Ontología, modelo o vocabulario aplicable |
| `retentionPolicy` | Política de retención, archivo o eliminación |
| `provenance` | Cadena de procedencia y nodo fuente |
| `confidence` | Índice de confianza calculado o declarado |

Los valores de `confidence` deben estar acotados al intervalo:

```text
0 <= confidence <= 1
```

La clasificación de sensibilidad se define así:

| Nivel | Significado |
|---|---|
| `public` | Información publicable sin restricción especial |
| `internal` | Información operativa de uso interno |
| `confidential` | Información con acceso controlado |
| `restricted` | Información sensible con protección híbrida obligatoria |
| `critical` | Información crítica para seguridad, continuidad, identidad, infraestructura o soberanía |

---

## Cabecera pública

La cabecera pública permite trazabilidad y correlación sin exponer el contenido transaccional.

| Campo | Regla |
|---|---|
| `messageId` | Identificador único del mensaje |
| `traceId` | Identificador de traza transversal |
| `correlationId` | Identificador de correlación de proceso |
| `createdAt` | Fecha ISO 8601 en UTC |
| `producer` | Identificador verificable del productor |

La cabecera pública no debe contener secretos, llaves privadas, datos personales innecesarios ni contenido transaccional sensible.

---

## Cifrado híbrido

### Objetivo

El cuerpo transaccional debe protegerse frente a actores que puedan almacenar tráfico actual y descifrarlo en el futuro.

El QSC aplica un modelo híbrido: la confidencialidad depende simultáneamente de mecanismos clásicos y post-cuánticos.

### Encapsulamiento de claves

El encapsulamiento de claves combinará:

| Categoría | Algoritmos permitidos |
|---|---|
| Clásico | `X25519` |
| Post-cuántico | `ML-KEM-768` o `ML-KEM-1024` |

El secreto de sesión debe derivarse de ambos componentes mediante una función de derivación de claves autorizada por el proveedor criptográfico.

No se permitirá usar solamente un componente clásico o solamente un componente post-cuántico cuando la política requiera protección híbrida.

### Cifrado autenticado

El cuerpo cifrado utilizará algoritmos AEAD autorizados:

| Algoritmo | Uso |
|---|---|
| `AES-256-GCM` | Cifrado autenticado con aceleración ampliamente disponible |
| `ChaCha20-Poly1305` | Cifrado autenticado eficiente en entornos sin aceleración AES |

El `semanticContext`, la cabecera pública y los identificadores de versión deben usarse como datos autenticados adicionales cuando el proveedor lo soporte.

---

## Firma híbrida

### Objetivo

Cada sobre sensible debe conservar autenticidad verificable frente a amenazas clásicas y post-cuánticas.

La firma híbrida exige una firma clásica y una post-cuántica sobre la misma representación canónica del sobre.

### Algoritmos

| Categoría | Algoritmos permitidos |
|---|---|
| Firma clásica | `Ed25519` o `ECDSA-P256` |
| Firma post-cuántica | `ML-DSA-65` o `ML-DSA-87` |

Los algoritmos, identificadores de llave y firmas deben estar presentes en el sobre sellado.

Una firma post-cuántica simulada solo podrá existir en entornos de prueba. Ninguna simulación se considera una capacidad criptográfica válida para producción.

---

## Integridad canónica

Antes de firmar y después de construir el sobre, el QSC debe producir una representación canónica mediante:

```text
stableJson
```

La representación debe:

- Tener orden estable de claves.
- Evitar ambigüedades de serialización.
- Excluir campos no firmables definidos explícitamente.
- Incluir versión, contexto, cabecera, payload protegido y metadatos criptográficos aplicables.
- Ser idéntica para productores y verificadores interoperables.

La integridad canónica se calcula mediante:

```text
SHA-256(stableJson(envelope))
```

El resultado se almacena en:

```text
integrity.canonicalHash
```

Cualquier cambio en el contenido firmado debe invalidar el hash y las firmas.

---

## Política de verificación

La validez de un sobre sellado se determina por una regla estricta de conjunción lógica.

```text
valid =
  classicalSignatureValid
  AND postQuantumSignatureValid
  AND semanticPolicyValid
  AND canonicalHashValid
```

Ninguna verificación parcial es suficiente.

| Condición | Resultado |
|---|---|
| Firma clásica válida, firma PQ inválida | Rechazar |
| Firma PQ válida, firma clásica inválida | Rechazar |
| Firmas válidas, política semántica inválida | Rechazar |
| Firmas válidas, hash canónico inválido | Rechazar |
| Hash válido, firmas ausentes | Rechazar cuando el sellado sea requerido |
| Verificación completa válida | Aceptar |

La respuesta de verificación debe informar el resultado sin filtrar secretos, material de claves ni detalles innecesarios sobre la configuración criptográfica.

---

## Políticas de sensibilidad

### Eventos `public`

Los eventos públicos pueden circular sin cifrado de payload cuando la política del dominio lo permita.

Aun así, pueden requerir hash canónico, trazabilidad o firma para preservar procedencia y no repudio operativo.

### Eventos `internal` y `confidential`

Estos eventos deben validarse según política del dominio, ruta, productor, federación y retención.

El sellado híbrido es recomendado cuando exista tránsito federado, persistencia prolongada o impacto operacional.

### Eventos `restricted` y `critical`

Los eventos con sensibilidad `restricted` o `critical` deben cumplir obligatoriamente:

- Cifrado AEAD del cuerpo.
- Encapsulamiento híbrido de claves.
- Firma clásica.
- Firma post-cuántica.
- Hash canónico.
- Validación semántica.
- Auditoría durable.
- Rechazo fail-closed ante cualquier error criptográfico.

No se permite degradación silenciosa desde protección híbrida a protección clásica.

---

## Proveedor criptográfico

### Abstracción obligatoria

El QSC no implementará manualmente primitivas post-cuánticas, incluidos:

- ML-KEM.
- ML-DSA.
- Generación de claves post-cuánticas.
- Encapsulamiento post-cuántico.
- Decapsulamiento post-cuántico.
- Firma post-cuántica.
- Verificación post-cuántica.

Toda operación criptográfica real deberá delegarse a un proveedor externo auditado, por ejemplo:

- KMS.
- HSM.
- Servicio criptográfico soberano certificado.
- Infraestructura criptográfica administrada compatible con políticas YUN.

El proveedor debe demostrar:

- Soporte del algoritmo autorizado.
- Validación con vectores KAT.
- Interoperabilidad documentada.
- Rotación de claves.
- Gestión de identificadores de llave.
- Protección de llaves privadas.
- Registro de operaciones.
- Control de acceso.
- Respuesta determinista ante errores.
- Separación entre desarrollo, pruebas y producción.

### Contrato del proveedor

La interfaz de proveedor debe soportar, como mínimo:

```ts
type YunCryptoProvider = {
  readonly id: string;
  readonly configured: boolean;

  randomId(): Promise<string>;

  generateDataKey(input: {
    algorithm: "AES-256-GCM" | "ChaCha20-Poly1305";
    context: Record<string, string>;
  }): Promise<{
    keyId: string;
    plaintextKey: Uint8Array;
    encryptedKeyReference?: string;
  }>;

  encrypt(input: {
    algorithm: "AES-256-GCM" | "ChaCha20-Poly1305";
    plaintext: Uint8Array;
    additionalAuthenticatedData?: Uint8Array;
  }): Promise<{
    ciphertext: Uint8Array;
    iv: Uint8Array;
    authTag: Uint8Array;
  }>;

  decrypt(input: {
    algorithm: "AES-256-GCM" | "ChaCha20-Poly1305";
    ciphertext: Uint8Array;
    iv: Uint8Array;
    authTag: Uint8Array;
    additionalAuthenticatedData?: Uint8Array;
  }): Promise<Uint8Array>;

  encapsulateHybridKey(input: {
    classicalAlgorithm: "X25519";
    postQuantumAlgorithm: "ML-KEM-768" | "ML-KEM-1024";
    recipientClassicalKeyId: string;
    recipientPostQuantumKeyId: string;
  }): Promise<{
    classicalEncapsulatedKey: Uint8Array;
    postQuantumEncapsulatedKey: Uint8Array;
    sharedSecret: Uint8Array;
  }>;

  signClassical(input: {
    algorithm: "Ed25519" | "ECDSA-P256";
    keyId: string;
    data: Uint8Array;
  }): Promise<Uint8Array>;

  verifyClassical(input: {
    algorithm: "Ed25519" | "ECDSA-P256";
    keyId: string;
    data: Uint8Array;
    signature: Uint8Array;
  }): Promise<boolean>;

  signPostQuantum(input: {
    algorithm: "ML-DSA-65" | "ML-DSA-87";
    keyId: string;
    data: Uint8Array;
  }): Promise<Uint8Array>;

  verifyPostQuantum(input: {
    algorithm: "ML-DSA-65" | "ML-DSA-87";
    keyId: string;
    data: Uint8Array;
    signature: Uint8Array;
  }): Promise<boolean>;
};
```

### Proveedor no configurado

El proveedor por defecto será:

```text
UnconfiguredCryptoProvider
```

Este proveedor puede generar identificadores sintéticos para operaciones no criptográficas, pero debe bloquear cualquier operación que implique:

- Generación de llaves.
- Cifrado.
- Descifrado.
- Encapsulamiento.
- Firma clásica.
- Verificación clásica.
- Firma post-cuántica.
- Verificación post-cuántica.

El error obligatorio será:

```text
CRYPTO_PROVIDER_NOT_CONFIGURED
```

Este comportamiento es intencional y aplica una política **fail-closed**.

---

## Estados operativos

El QSC tendrá los siguientes estados:

| Estado | Significado |
|---|---|
| `STARTING` | Inicialización del dominio |
| `READY` | Proveedor válido y operaciones criptográficas disponibles |
| `DEGRADED` | Creación y validación no criptográfica disponibles; sellado o verificación avanzada no disponibles |
| `UNAVAILABLE` | El dominio no puede garantizar sus funciones mínimas |
| `ERROR` | Fallo operativo que requiere atención |

La disponibilidad de `createEnvelope()` no implica que el sobre esté sellado o sea criptográficamente verificable.

| Operación | `READY` | `DEGRADED` |
|---|---:|---:|
| Crear sobre | Permitida | Permitida |
| Validar contexto semántico | Permitida | Permitida |
| Generar hash canónico | Permitida | Permitida |
| Sellar sobre híbrido | Permitida | Rechazada |
| Verificar firmas híbridas | Permitida | Rechazada |
| Procesar `restricted` o `critical` | Permitida | Rechazada |

---

## Integración con Zero Trust

Todas las rutas `/api/yun/*` deben utilizar el `route-guard` único del proyecto.

El QSC no duplicará lógica de:

- Verificación de origen.
- API keys.
- Scopes.
- Rate limiting.
- Comparación en tiempo constante.
- Política de gateway.
- Rechazo fail-closed.

La cadena de operación será:

```text
Solicitud
  → route-guard
  → autenticación IDENTITY YUN
  → autorización por scopes
  → validación de contrato
  → validación semántica QSC
  → operación QSC
  → auditoría
  → respuesta
```

La confianza canónica seguirá residiendo en:

```text
lib/security/trust.ts
```

`lib/isabella/trust.ts` debe mantenerse como barril de compatibilidad y no debe recibir lógica de confianza nueva.

---

## Integración con IDENTITY YUN

El QSC consumirá el resultado autenticado del `route-guard` y de IDENTITY YUN.

Las API keys autorizadas deberán poseer scopes compatibles con la operación solicitada, por ejemplo:

```text
yun:envelope:create
yun:envelope:seal
yun:envelope:verify
yun:status:read
yun:federations:read
yun:admin
```

Si los scopes YUN aún no están declarados en el catálogo global, deberán añadirse explícitamente sin reutilizar indebidamente scopes de dominios no relacionados.

Las claves de identidad de API no sustituyen las claves criptográficas de firma o encapsulamiento del QSC.

---

## Integración con CITEMESH

CITEMESH conserva la responsabilidad de ruteo P2P, topología, heartbeat y failover.

El QSC impone las siguientes condiciones:

- CITEMESH no debe alterar un sobre sellado.
- La ruta no debe modificar `semanticContext`.
- La ruta no debe modificar `publicHeader`.
- La ruta no debe modificar `payload`.
- La ruta no debe modificar `keyEncapsulation`.
- La ruta no debe modificar `signatures`.
- La ruta no debe modificar `integrity.canonicalHash`.
- Cualquier modificación obliga a crear un nuevo sobre o una nueva versión del mensaje según política.
- Los saltos de red pueden generar eventos de auditoría externos sin alterar el sobre original.

Los sobres de sensibilidad `restricted` o `critical` no deben enviarse por rutas cuyo estado de confianza, salud o política sea insuficiente.

---

## Integración con GEMET

GEMET conserva su responsabilidad sobre:

- Registro ontológico.
- Conocimiento federado.
- Réplicas remotas.
- Caché firmada.
- Checksum de registros.

El QSC añade protección al transporte y a la procedencia semántica de operaciones GEMET.

Cuando un sobre incluya `ontology`, esta debe corresponder a un identificador conocido, permitido o verificable según las políticas del dominio.

La publicación de conocimiento federado deberá validar:

- Federación autorizada.
- Ontología permitida.
- Productor autorizado.
- Integridad canónica.
- Firma híbrida cuando aplique.
- Política de retención.
- Sensibilidad compatible con la réplica solicitada.

---

## Integración con Continuity

Continuity conserva la responsabilidad de:

- Journal inmutable.
- Reconciliación primario/réplica.
- Aislamiento.
- Activación de continuidad.
- Matriz RTO/RPO.

El QSC provee evidencia semántica y criptográfica para eventos críticos.

Las operaciones de Continuity que afecten:

- Infraestructura crítica.
- Cambio de primario.
- Activación de contingencia.
- Reconciliación de datos.
- Aislamiento de nodo.
- Recuperación de servicio.

deben producir sobres `restricted` o `critical` según la clasificación definida por política.

El journal puede registrar el hash canónico, el resultado de verificación y el enlace de procedencia sin almacenar innecesariamente el payload sensible en claro.

---

## Integración con Archive

Archive conserva la responsabilidad de curación, preservación, búsqueda y administración documental.

El QSC permite que un objeto archivado incluya evidencia de:

- Productor.
- Fecha de creación.
- Federación.
- Clasificación.
- Ontología.
- Retención.
- Hash canónico.
- Cadena de procedencia.
- Resultado de verificación.
- Identificadores de llave, sin material de llave.

La conservación histórica no implica que el Archive pueda descifrar todo contenido. El acceso a payloads cifrados debe seguir la política de identidad, autorización, retención y custodia de claves.

---

## Plano de investigación

El plano de investigación opera aislado y no tiene autoridad operativa ni criptográfica.

Su ejecución puede utilizar herramientas analíticas, incluyendo PennyLane, en el puerto:

```text
8090
```

El plano solo puede ingerir cubos agregados, métricas autorizadas y representaciones no sensibles.

Se prohíbe estructuralmente el ingreso de campos como:

```text
key
payload
text
privateKey
secret
ciphertext
plaintext
signatureMaterial
```

Ante la presencia de campos prohibidos se devolverá:

```text
RESEARCH_BUCKET_DENIED
```

Toda respuesta del plano de investigación debe declarar:

```json
{
  "authoritative": false
}
```

Los resultados del plano de investigación no pueden:

- Autorizar operaciones.
- Modificar clasificación semántica.
- Validar firmas.
- Generar llaves.
- Decidir confianza.
- Sustituir auditorías.
- Escribir directamente en dominios soberanos.
- Alterar sobres QSC.

---

## Módulos

La implementación se organiza en `lib/yun/`.

| Módulo | Responsabilidad |
|---|---|
| `contracts.ts` | Esquemas Zod estrictos para sobres, firmas, políticas, estados y pruebas |
| `crypto-provider.ts` | Interfaz KMS/HSM y `UnconfiguredCryptoProvider` |
| `semantic-core.ts` | Orquestación de creación, sellado, verificación y contadores |
| `federations.ts` | Salud de Fed1 a Fed7 y eventos de cambio |
| `ready.ts` | Evaluación de prontitud del QSC |
| `policy.ts` | Traducción de reglas declarativas y evaluación semántica |
| `research-plane.ts` | Filtro e ingesta agregada no autoritativa |
| `audit.ts` | Eventos de auditoría YUN y persistencia durable |
| `errors.ts` | Catálogo de errores del dominio |
| `index.ts` | Superficie pública del módulo YUN |

Los contratos de sobre deben usar Zod con `.strict()` para rechazar atributos no previstos.

---

## Funciones principales

### `createEnvelope()`

Responsabilidades:

- Validar contrato de entrada.
- Generar `messageId`.
- Propagar o crear `traceId`.
- Propagar o crear `correlationId`.
- Asignar `createdAt`.
- Validar sensibilidad, dominio y federación.
- Validar valores de confianza.
- Inicializar procedencia.
- Construir el hash canónico.
- Emitir auditoría de creación.

Esta función no afirma sellado ni autenticidad híbrida.

### `validateSemanticPolicy()`

Responsabilidades:

- Verificar valores permitidos.
- Validar sensibilidad.
- Validar dominio.
- Validar federación.
- Validar ontología.
- Validar política de retención.
- Validar compatibilidad productor-entidad.
- Validar requisitos de cifrado.
- Validar requisitos de firma.
- Validar destino, ruta o persistencia permitidos.

### `sealEnvelope()`

Responsabilidades:

- Requerir un proveedor configurado.
- Revalidar política semántica.
- Bloquear si el sobre ya está sellado salvo operación explícita de reemisión.
- Generar o solicitar clave de datos.
- Cifrar payload mediante AEAD.
- Encapsular clave usando combinación clásica y post-cuántica.
- Construir representación canónica.
- Calcular hash canónico.
- Firmar con firma clásica.
- Firmar con firma post-cuántica.
- Persistir evento de auditoría.
- Retornar sobre sellado.

### `verifyEnvelope()`

Responsabilidades:

- Validar estructura estricta.
- Recalcular hash canónico.
- Verificar política semántica.
- Verificar firma clásica.
- Verificar firma post-cuántica.
- Aplicar regla AND.
- Emitir auditoría de éxito o rechazo.
- Retornar resultado estructurado sin secretos.

---

## Superficie API

| Ruta | Método | Descripción |
|---|---|---|
| `/api/yun/status` | `GET` | Estado global del core, versión, proveedor y contadores |
| `/api/yun/ready` | `GET` | Prontitud operativa; devuelve `200` o `503` según capacidad |
| `/api/yun/federations/health` | `GET` | Salud operativa de Fed1 a Fed7 |
| `/api/yun/envelope/create` | `POST` | Inicializa un sobre semántico sin sellar |
| `/api/yun/envelope/seal` | `POST` | Cifra y firma un sobre de manera híbrida |
| `/api/yun/envelope/verify` | `POST` | Verifica política, hash y firmas mediante regla AND |

### `GET /api/yun/status`

Respuesta esperada:

```json
{
  "domain": "yun-qsc",
  "version": "yun.semantic-envelope.v1",
  "status": "READY",
  "cryptoProvider": {
    "id": "configured-kms",
    "configured": true
  },
  "counters": {
    "created": 0,
    "sealed": 0,
    "verified": 0,
    "rejected": 0
  }
}
```

### `GET /api/yun/ready`

Cuando el proveedor criptográfico requerido esté configurado:

```http
HTTP/1.1 200 OK
```

Cuando el proveedor no esté configurado y el dominio no pueda cumplir operaciones requeridas:

```http
HTTP/1.1 503 Service Unavailable
```

Ejemplo:

```json
{
  "ready": false,
  "status": "DEGRADED",
  "reason": "CRYPTO_PROVIDER_NOT_CONFIGURED"
}
```

### `POST /api/yun/envelope/create`

La creación de sobre debe permanecer disponible en modo degradado para niveles que no requieran sellado inmediato, siempre que la respuesta indique explícitamente el estado.

### `POST /api/yun/envelope/seal`

Cuando no exista proveedor criptográfico configurado:

```http
HTTP/1.1 503 Service Unavailable
```

```json
{
  "error": {
    "code": "CRYPTO_PROVIDER_NOT_CONFIGURED",
    "message": "No existe un proveedor criptográfico híbrido configurado."
  }
}
```

### `POST /api/yun/envelope/verify`

La verificación de un sobre sellado debe devolver:

```json
{
  "valid": true,
  "checks": {
    "canonicalHash": true,
    "semanticPolicy": true,
    "classicalSignature": true,
    "postQuantumSignature": true
  }
}
```

Un resultado parcialmente válido debe devolver:

```json
{
  "valid": false,
  "checks": {
    "canonicalHash": true,
    "semanticPolicy": true,
    "classicalSignature": true,
    "postQuantumSignature": false
  },
  "error": {
    "code": "POST_QUANTUM_SIGNATURE_INVALID"
  }
}
```

---

## Salud federada

El módulo `federations.ts` mantiene la salud de las siete federaciones:

```text
Fed1
Fed2
Fed3
Fed4
Fed5
Fed6
Fed7
```

Cada federación tendrá uno de los estados:

| Estado | Significado |
|---|---|
| `HEALTHY` | Disponible y dentro de parámetros operativos |
| `DEGRADED` | Disponible con capacidad reducida o alertas |
| `DOWN` | No disponible o no confiable para operaciones requeridas |

Los cambios deben emitir:

```text
yun.federation.health.changed
```

Un sobre `restricted` o `critical` no debe ser enviado a una federación `DOWN`. La política puede impedir tránsito hacia federaciones `DEGRADED` según tipo de operación, sensibilidad y continuidad.

---

## Auditoría

Toda operación relevante debe producir un evento de auditoría bajo el dominio:

```text
yun
```

La auditoría debe heredar:

- `messageId`.
- `traceId`.
- `correlationId`.
- Dominio.
- Federación.
- Productor.
- Sensibilidad.
- Resultado de política.
- Resultado de hash.
- Resultado de firma clásica.
- Resultado de firma post-cuántica.
- Identificador del proveedor.
- Identificador de llave, cuando corresponda.
- Marca temporal.
- Operación realizada.
- Código de error, cuando corresponda.

La persistencia de auditoría se realizará en:

```text
yun.yun_semantic_audit
```

La tabla debe evitar almacenar:

- Llaves privadas.
- Secretos.
- Claves de datos sin protección.
- Payloads sensibles en claro.
- Material criptográfico no necesario para la verificación.

Se recomienda una cadena de hash de auditoría mediante:

```text
previousAuditHash
auditHash
```

---

## Persistencia

La implantación de producción debe incluir, como mínimo:

```text
yun.yun_semantic_audit
yun.federation_health
yun.envelope_events
yun.crypto_operations
yun.provenance_links
```

Campos mínimos sugeridos para `yun.yun_semantic_audit`:

```text
id
event_id
message_id
trace_id
correlation_id
envelope_version
domain
federation_id
sensitivity
producer
operation
policy_decision
canonical_hash
classical_signature_valid
post_quantum_signature_valid
verification_result
crypto_provider_id
key_reference
created_at
previous_audit_hash
audit_hash
```

La definición final debe aplicar:

- Row Level Security cuando corresponda.
- Principio de mínimo privilegio.
- Retención diferenciada por sensibilidad.
- Índices para `message_id`, `trace_id`, `correlation_id`, `federation_id` y `created_at`.
- Protección de registros inmutables o append-only cuando aplique.

---

## Errores

El QSC define al menos los siguientes errores:

| Código | Significado |
|---|---|
| `CRYPTO_PROVIDER_NOT_CONFIGURED` | No existe proveedor criptográfico válido |
| `CRYPTO_PROVIDER_OPERATION_FAILED` | El proveedor falló durante una operación |
| `ENVELOPE_SCHEMA_INVALID` | El sobre incumple el contrato estricto |
| `ENVELOPE_VERSION_UNSUPPORTED` | La versión del sobre no está soportada |
| `SEMANTIC_POLICY_DENIED` | La política semántica rechazó el sobre |
| `SENSITIVITY_REQUIRES_HYBRID_SEAL` | La sensibilidad exige sellado híbrido |
| `CANONICAL_HASH_INVALID` | El hash canónico no coincide |
| `CLASSICAL_SIGNATURE_INVALID` | La firma clásica es inválida |
| `POST_QUANTUM_SIGNATURE_INVALID` | La firma post-cuántica es inválida |
| `HYBRID_VERIFICATION_FAILED` | Una o más verificaciones requeridas fallaron |
| `FEDERATION_UNAVAILABLE` | La federación no está disponible |
| `FEDERATION_POLICY_DENIED` | La política prohíbe la federación solicitada |
| `RESEARCH_BUCKET_DENIED` | El plano de investigación recibió datos prohibidos |
| `ENVELOPE_ALREADY_SEALED` | Se intentó sellar un sobre previamente sellado |
| `UNSUPPORTED_CRYPTO_ALGORITHM` | Algoritmo no autorizado por política |
| `KEY_REFERENCE_INVALID` | Referencia de llave inválida o no permitida |

---

## Requisitos de producción

La producción del QSC requiere:

1. Un KMS, HSM o proveedor criptográfico auditado y configurado.
2. Soporte verificable para los algoritmos híbridos autorizados.
3. Pruebas de interoperabilidad mediante vectores KAT.
4. Gestión de claves con rotación, revocación y referencias auditables.
5. Persistencia durable de auditoría en `yun.yun_semantic_audit`.
6. Telemetría dinámica de Fed1 a Fed7 en `federation_health`.
7. Alertamiento ante degradación, fallos de verificación y operación del proveedor.
8. Separación de entornos de desarrollo, pruebas, staging y producción.
9. Prohibición de llaves privadas en variables públicas, logs, payloads o repositorios.
10. Pruebas automatizadas de contratos, integración, regresión, fallos y recuperación.
11. Revisión de seguridad antes de habilitar sellado híbrido en producción.
12. Aplicación obligatoria del `route-guard` a todas las rutas API del dominio.

---

## Pruebas requeridas

Las pruebas del QSC deben cubrir como mínimo:

- Creación de sobre válido.
- Rechazo de campos desconocidos.
- Propagación de `traceId` y `correlationId`.
- Generación estable de hash canónico.
- Rechazo por modificación de contexto semántico.
- Rechazo por modificación de payload.
- Rechazo por modificación de firma clásica.
- Rechazo por modificación de firma post-cuántica.
- Rechazo por sensibilidad `restricted` sin sellado híbrido.
- Rechazo por sensibilidad `critical` sin doble firma.
- Operación fail-closed del proveedor no configurado.
- Operación correcta con proveedor de pruebas autorizado.
- Rechazo de algoritmos no permitidos.
- Verificación AND.
- Integración con `route-guard`.
- Integración con IDENTITY YUN y scopes.
- Integración con CITEMESH.
- Integración con GEMET.
- Integración con Continuity.
- Persistencia de auditoría.
- Rechazo de datos sensibles en el plano de investigación.
- Estados `READY`, `DEGRADED`, `UNAVAILABLE` y `ERROR`.
- Cambios de salud Fed1 a Fed7.
- Prevención de replay cuando la política lo requiera.
- Rotación de claves y continuidad de verificación histórica.
- Interoperabilidad entre nodos federados.

---

## Consecuencias

### Consecuencias positivas

- Se establece un formato uniforme para eventos sensibles y federados.
- La clasificación semántica queda criptográficamente vinculada al contenido.
- Se mejora la trazabilidad entre dominios y federaciones.
- Se crea resistencia gradual ante amenazas post-cuánticas.
- Se evita la degradación silenciosa de seguridad.
- Se preserva la modularidad de los dominios existentes.
- La auditoría adquiere evidencia de política, integridad y autenticidad.
- El sistema puede rechazar mensajes parcialmente verificables.
- Los dominios pueden aplicar políticas homogéneas de sensibilidad y retención.
- El plano de investigación queda separado de la autoridad operacional.

### Consecuencias negativas

- La operación criptográfica híbrida incrementa tamaño de mensajes, latencia y complejidad.
- Los algoritmos post-cuánticos requieren gestión cuidadosa de compatibilidad e interoperabilidad.
- La producción queda condicionada a un proveedor KMS/HSM auditado.
- La rotación y archivado de claves requieren procedimientos operativos formales.
- Los consumidores de eventos deberán adoptar el contrato del sobre.
- Los errores de política o proveedor pueden bloquear operaciones críticas por diseño.
- La observabilidad y auditoría requieren infraestructura de persistencia adicional.

### Riesgo aceptado

Mientras `YUN_CRYPTO_PROVIDER` permanezca configurado como:

```text
unconfigured
```

la creación de sobres y el hash canónico pueden operar, pero el sellado y la verificación híbridos deberán permanecer deshabilitados o rechazar solicitudes en modo fail-closed.

El sistema no debe declarar protección post-cuántica activa hasta que exista proveedor auditado y pruebas de interoperabilidad satisfactorias.

---

## Alternativas descartadas

### Cifrado clásico solamente

Descartado porque no mitiga adecuadamente el riesgo de almacenamiento retrospectivo frente a actores con capacidad cuántica futura.

### Firmas clásicas solamente

Descartado porque una firma clásica no ofrece resiliencia suficiente ante un escenario post-cuántico de largo plazo.

### Implementar ML-KEM y ML-DSA manualmente

Descartado por alto riesgo de errores criptográficos, incompatibilidades, vulnerabilidades de implementación y falta de auditoría.

### Permitir modo degradado silencioso

Descartado porque permitiría que datos `restricted` o `critical` circulen con protección inferior sin que operadores o consumidores lo detecten.

### Delegar todo el modelo de confianza a Isabella

Descartado porque Isabella es un dominio cognitivo y no debe convertirse en fuente de autoridad criptográfica ni de confianza semántica.

### Usar el plano de investigación como fuente operativa

Descartado porque el plano de investigación no es autoritativo, trabaja con agregados y debe permanecer aislado de secretos y payloads sensibles.

---

## Despliegue gradual

### Fase 1 — Contratos y creación

- Implementar esquemas Zod estrictos.
- Implementar `createEnvelope()`.
- Implementar validación semántica.
- Implementar hash canónico.
- Implementar auditoría inicial.
- Exponer `/api/yun/status`.
- Exponer `/api/yun/ready`.
- Exponer `/api/yun/envelope/create`.

### Fase 2 — Integración de dominios

- Integrar route-guard.
- Integrar IDENTITY YUN.
- Integrar CITEMESH.
- Integrar GEMET.
- Integrar Continuity.
- Integrar Archive.
- Incorporar telemetría de federaciones.
- Habilitar pruebas de contratos entre dominios.

### Fase 3 — Proveedor criptográfico

- Seleccionar KMS/HSM auditado.
- Implementar adaptador de proveedor.
- Verificar KAT e interoperabilidad.
- Implementar rotación y referencias de llaves.
- Habilitar entorno de staging.
- Realizar pruebas de carga y fallos.

### Fase 4 — Sellado híbrido productivo

- Habilitar `sealEnvelope()`.
- Habilitar `verifyEnvelope()`.
- Exigir protección híbrida para `restricted` y `critical`.
- Persistir auditoría durable.
- Habilitar alertamiento operativo.
- Revisar controles y autorización antes de producción general.

---

## Variables de entorno

La configuración inicial deberá incluir:

```text
YUN_CRYPTO_PROVIDER=unconfigured
```

Valores posibles:

```text
unconfigured
kms
hsm
sovereign-provider
```

El valor concreto debe seleccionarse por el resolvedor de entorno tipado y nunca debe habilitar una capacidad criptográfica simulada en producción.

Variables adicionales se definirán conforme al proveedor seleccionado, por ejemplo:

```text
YUN_KMS_ENDPOINT=
YUN_KMS_KEYRING=
YUN_KMS_TENANT=
YUN_HSM_SLOT=
YUN_HSM_KEY_LABEL=
YUN_CRYPTO_AUDIT_ENABLED=true
```

Las variables no deben contener llaves privadas en claro cuando exista una alternativa de referencia administrada.

---

## Referencias internas

- `docs/adr-0001-isa-soberano.md`
- `docs/adr-0002-zero-trust-7-capas.md`
- `docs/adr-0003-observabilidad.md`
- `docs/adr-0004-yun-be-continuidad.md`
- `docs/catalogo-apis.md`
- `docs/mapa-dominios.md`
- `docs/guia-desarrollador.md`
- `docs/guia-modularizacion.md`
- `docs/continuity-plan.md`
- `docs/reconciliation-protocol.md`
- `docs/rto-rpo-matrix.md`
- `docs/openapi-yun.yaml`
- `policy/constitution.rego`
- `lib/security/trust.ts`
- `lib/security/identity/`
- `lib/core/events`
- `app/api/_shared/route-guard`
- `lib/citemesh/`
- `lib/gemet/`
- `lib/continuity/`
- `lib/archive/`
- `lib/yun/`

---

## Estado de implementación

El dominio YUN QSC queda aceptado como componente arquitectónico oficial.

Hasta disponer de un proveedor KMS/HSM auditado:

- La creación de sobres puede operar.
- La validación semántica puede operar.
- El hash canónico puede operar.
- La auditoría puede operar.
- La salud federada puede operar.
- El sellado híbrido real debe rechazar solicitudes.
- La verificación criptográfica híbrida real debe rechazar solicitudes.
- Los eventos `restricted` y `critical` no deben procesarse como válidos si requieren protección híbrida.

La habilitación de criptografía híbrida en producción requerirá una decisión operativa explícita, evidencia de interoperabilidad y aprobación de seguridad.
