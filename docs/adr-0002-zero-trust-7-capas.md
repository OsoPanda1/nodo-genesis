# ADR-0002 — Arquitectura Zero Trust Heptafederada en Siete Capas

- **Estado:** Aceptado
- **Fecha:** 2026
- **Área:** Seguridad, Gobernanza y Heptafederación YUN
- **Propietario arquitectónico:** Nodo Cero / Heptafederación YUN
- **Decisión vinculante:** Sí
- **Implementación canónica:** `lib/security/zero-trust.ts`
- **Punto único de aplicación:** `@/app/api/_shared/route-guard`
- **Clasificación:** Control constitucional de acceso, ejecución, identidad y egress

---

## 1. Declaración de principio

El Nodo Cero no concede confianza implícita a ninguna red, cliente, sesión, origen, proceso, servicio, integración, proveedor, nodo federado ni componente interno.

Toda petición deberá ser tratada como potencialmente hostil hasta demostrar, de forma verificable, contextual y auditable, que posee autorización para invocar una capacidad determinada.

La confianza no se hereda por dirección IP, pertenencia a una red privada, posesión de una cookie, dominio de origen, uso previo exitoso, identidad declarada, condición de administrador ni procedencia interna. La confianza se prueba en cada solicitud, se limita al alcance estrictamente autorizado y se revoca ante cualquier inconsistencia.

> **En el Nodo Cero, ninguna petición es confiable por defecto. Toda confianza debe ser demostrada.**

---

## 2. Contexto

El Nodo Cero opera capacidades territoriales críticas: inteligencia cognitiva, gemelo digital, centro de operaciones urbano, infraestructura, identidad soberana, archivo histórico, continuidad operativa, pagos, marketplace, telemetría, gamificación, malla federada CITEMESH, conocimiento federado GEMET y sobre semántico YUN QSC.

Estas capacidades son consumidas por clientes públicos, operadores administrativos, servicios internos, automatizaciones, aplicaciones móviles, nodos federados y mecanismos de contingencia. En este entorno, una autenticación aislada, un control de red perimetral o una única API key no son suficientes para establecer seguridad institucional.

Las amenazas contempladas incluyen:

- Suplantación de identidad, abuso de credenciales, robo de tokens y replay de solicitudes.
- Ataques CSRF, manipulación de `Origin`, abuso de sesión y solicitudes intersitio.
- Alteración de payloads, firmas, parámetros críticos y mensajes federados.
- Saturación de rutas, fuerza bruta, automatización abusiva y denegación de servicio.
- Escalamiento lateral desde servicios, rutas o redes consideradas erróneamente internas.
- Exfiltración de datos territoriales, PII, secretos, trazas o material criptográfico.
- Uso indebido de claves de servicio, credenciales administrativas o scopes privilegiados.
- Egress no autorizado hacia proveedores, nodos, APIs, gateways o destinos no aprobados.
- Fallos de configuración, indisponibilidad de verificadores o degradación de infraestructura.
- Ejecución de operaciones sensibles sin evidencia suficiente de autorización.

Por tanto, la seguridad se establece como un proceso continuo de verificación y no como un estado concedido por pertenencia a un perímetro.

---

## 3. Decisión

Se aprueba la arquitectura **Zero Trust Heptafederada**, compuesta por siete capas secuenciales de verificación, una por cada federación soberana YUN.

La implementación centralizada reside en:

```text
lib/security/zero-trust.ts
```

Las interfaces canónicas son:

```ts
enforceZeroTrustHeaders();
enforceZeroTrust();
assertZeroTrust();
```

La aplicación obligatoria de esta cadena se realiza exclusivamente mediante:

```text
@/app/api/_shared/route-guard
```

Todas las rutas API deberán utilizar el `route-guard` único. Queda prohibido crear rutas que ejecuten lógica de dominio sin pasar por este punto de control, así como duplicar, fragmentar o sustituir localmente los controles canónicos de confianza.

La función `enforceTrust` en `lib/isabella/http.ts` deberá mantener únicamente compatibilidad o integración con el mecanismo centralizado. No deberá convertirse en una cadena paralela o divergente.

La evaluación seguirá este flujo:

```text
Petición no confiable
  → L1 Política y autorización
  → L2 Origen y trazabilidad
  → L3 Integridad del payload
  → L4 Resiliencia y antiabuso
  → L5 Protección de datos operativos
  → L6 Identidad soberana
  → L7 Interconexión y egress
  → Handler autorizado
```

La cadena es estrictamente **fail-closed**: si una capa falla, está ausente, expira, no puede verificarse o produce un resultado ambiguo, la petición será denegada de inmediato y el handler no deberá ejecutarse.

---

## 4. Invariantes constitucionales

### 4.1 Denegación por defecto

Toda petición será denegada salvo que satisfaga explícitamente las validaciones exigibles para su tipo de actor, ruta, método, sensibilidad y alcance.

La ausencia de evidencia no constituye autorización. La ausencia de configuración no habilita acceso. La indisponibilidad de una dependencia de seguridad no podrá ampliar permisos.

### 4.2 Verificación antes de ejecución

Ninguna lógica de negocio podrá ejecutarse antes de la decisión Zero Trust aplicable.

Esto incluye, sin limitarse a:

- Persistencia o modificación de datos.
- Firma criptográfica.
- Emisión, rotación o revocación de credenciales.
- Ejecución de pagos, publicaciones o suscripciones.
- Activación de procesos de infraestructura o continuidad.
- Enrutamiento federado.
- Uso de recursos costosos de cómputo, IA o almacenamiento.
- Egress hacia otros nodos, redes o proveedores.

### 4.3 Mínimo privilegio

Toda identidad, API key, servicio, operador o nodo federado deberá recibir únicamente los scopes, permisos y duración necesarios para la acción autorizada.

Una identidad válida no implica acceso universal. Una API key válida no implica privilegios administrativos. Una firma válida no sustituye la autorización contextual.

### 4.4 Separación de controles

Cada capa representa una responsabilidad distinta:

- La autenticación determina quién o qué presenta la solicitud.
- La autorización determina qué acción puede ejecutar.
- La integridad determina si el contenido puede ser confiado.
- La resiliencia determina si la solicitud representa abuso.
- La privacidad determina qué información puede ser observada.
- La interconexión determina si una salida está permitida.

Ninguna capa sustituye a otra.

### 4.5 No filtración de secretos

Ninguna clave, token, firma completa, secreto, payload sensible, encabezado de autenticación, PII, dato territorial protegido o material criptográfico deberá registrarse en logs, métricas, trazas públicas, respuestas de error ni eventos externos.

### 4.6 Trazabilidad mínima suficiente

Toda decisión deberá quedar registrada con evidencia sanitizada, correlacionable y proporcional al riesgo. La trazabilidad deberá permitir auditoría sin exponer secretos ni ampliar la superficie de ataque.

---

## 5. Cadena de siete capas

| Capa | Federación YUN | Dominio de control | Verificación obligatoria | Resultado de fallo |
|---|---|---|---|---|
| L1 | Decisión | Política y autorización | Política de ruta, método, scopes, permisos y firma HMAC cuando aplique | Denegación de política |
| L2 | Trazabilidad | Origen y procedencia | `Origin`, anti-CSRF, anti-replay, contexto de petición y correlación | Denegación de origen |
| L3 | Experiencia | Integridad semántica | Esquema, tipos, tamaño, estructura, hash o checksum cuando aplique | Rechazo de payload |
| L4 | Resiliencia | Abuso y disponibilidad | Rate limit, token bucket, cuotas, ventanas, nonces e idempotencia | Limitación o denegación |
| L5 | Operación | Protección de datos | Sanitización de PII, redacción de secretos y política de observabilidad | Denegación de política de datos |
| L6 | Identidad | Autenticación soberana | API key, credencial interna, scopes y comparación en tiempo constante | Denegación de identidad |
| L7 | Interconexión | Egress y federación | Destino permitido, protocolo, propósito, auditoría y frontera de red | Denegación de egress |

La secuencia establecida es obligatoria. Se pueden añadir controles específicos por dominio, pero no se podrán eliminar, reordenar, omitir ni debilitar las capas canónicas.

---

## 6. L1 — Política y autorización

La capa de Decisión determina si una operación puede aspirar a ser ejecutada.

Deberá validar:

- Ruta, método HTTP y criticidad de la operación.
- Política de acceso aplicable.
- Scope requerido.
- Rol, capacidad o atribución del actor.
- Restricciones de dominio.
- Firma HMAC cuando el contrato requiera integridad autenticada.
- Fecha de expiración, nonce o mecanismo anti-replay para operaciones firmadas.
- Idempotencia en operaciones irreversibles, económicas, administrativas o federadas.

Las funciones:

```ts
signBody();
verifySignature();
```

deberán utilizar secretos gestionados fuera del código fuente y nunca deberán registrar la firma, el cuerpo completo ni el secreto utilizado.

Una firma HMAC válida prueba integridad autenticada del mensaje, pero no reemplaza la validación de scopes, permisos, políticas, roles ni contexto de operación.

---

## 7. L2 — Trazabilidad y origen

La capa de Trazabilidad verifica que la petición proviene de un contexto permitido y conserva una cadena mínima de evidencia.

Deberá aplicar, cuando corresponda:

- Allowlist de `Origin`.
- Validación de `Referer` para flujos basados en navegador.
- Protección anti-CSRF en solicitudes mutables que utilicen cookies o sesión.
- Detección de solicitudes repetidas o fuera de ventana temporal.
- Generación o propagación controlada de `traceId`.
- Generación o propagación controlada de `correlationId`.
- Rechazo de orígenes ausentes, ambiguos o no autorizados en rutas sensibles.

Las integraciones máquina a máquina podrán estar exentas de semántica de navegador, pero deberán declarar explícitamente su tipo de actor y satisfacer controles equivalentes de procedencia, firma, identidad y anti-replay.

Una ruta interna no queda exenta de esta capa por su ubicación dentro de la misma infraestructura.

---

## 8. L3 — Integridad del payload

La capa de Experiencia protege la integridad estructural y semántica de toda entrada antes de alcanzar la lógica de dominio.

Deberá verificar:

- Esquemas tipados y contratos de entrada.
- Tipos, formatos, rangos, enumeraciones y campos requeridos.
- Tamaño máximo de body, cadenas, arreglos y objetos anidados.
- Rechazo de propiedades no permitidas cuando la operación sea sensible.
- Canonicalización de contenido antes de firmar, verificar hash o calcular checksum.
- Coherencia entre método HTTP, ruta, intención declarada y payload.
- Protección frente a payloads ambiguos, malformados, excesivos o recursivos.

La validación de L3 no es únicamente una medida de calidad. Es una frontera de seguridad contra manipulación de entradas, comportamiento indefinido y consumo anómalo de recursos.

---

## 9. L4 — Resiliencia y antiabuso

La capa de Resiliencia protege la disponibilidad del Nodo Cero frente a automatización hostil, saturación, fuerza bruta, replay y agotamiento de recursos.

La implementación mínima utiliza el algoritmo de token bucket y deberá considerar:

- Ruta y método HTTP.
- Identidad autenticada, cuando exista.
- API key o servicio solicitante.
- Origen, con tratamiento seguro de proxies.
- Tipo de operación y criticidad.
- Ventana temporal y cuota específica.
- Nonce y timestamp en solicitudes firmadas.
- Idempotency key para operaciones de efectos persistentes.

El límite deberá evaluarse antes de cualquier operación costosa: consultas pesadas, acceso a almacenamiento, cifrado, firma, generación, inferencia, procesamiento de archivos o enrutamiento federado.

La limitación actual por instancia es aceptada como control mínimo local. En despliegues multiinstancia, con balanceador, edge runtime o alta disponibilidad, el rate limit deberá migrar a una capa consistente y compartida, como Redis o Edge KV controlado por la plataforma.

Mientras exista una configuración distribuida incompleta o no disponible, las rutas de alto riesgo deberán usar límites conservadores o denegar operaciones mutables no esenciales.

---

## 10. L5 — Operación y protección de datos

La capa de Operación evita que los mecanismos de monitoreo, soporte y depuración se conviertan en canales de fuga de información.

Deberá aplicar las rutinas:

```ts
sanitizeForLog();
redact();
```

La sanitización deberá eliminar, resumir, enmascarar o reemplazar:

- API keys, tokens, secretos, contraseñas y firmas.
- Encabezados de autorización.
- Material criptográfico.
- Datos personales identificables.
- Identificadores de pago.
- Datos territoriales protegidos.
- Cuerpos completos de petición o respuesta que no sean estrictamente necesarios.
- Contextos internos de razonamiento o información operativa no autorizada.

La observabilidad deberá producir evidencia útil sin reproducir datos sensibles.

Cuando no pueda garantizarse sanitización suficiente, el evento deberá reducirse a metadatos no sensibles o no emitirse.

---

## 11. L6 — Identidad soberana

La capa de Identidad verifica la identidad técnica del solicitante y aplica los límites de autoridad asignados.

La identidad soberana YUN se integra con:

```text
lib/security/identity/
```

Las API keys deberán ser emitidas, rotadas, revocadas e introspectadas bajo control del Nodo Cero. Las claves nativas deberán almacenarse exclusivamente como hash fuerte —por ejemplo, `scrypt`— y jamás como texto en claro.

Para credenciales internas, la implementación deberá utilizar:

```ts
verifyInternalKey();
```

Toda comparación de secretos deberá realizarse en tiempo constante.

Las claves internas definidas en:

```text
lib/security/keys.ts
```

deberán cumplir las siguientes condiciones:

- Permanecer fuera del código fuente y de los artefactos del cliente.
- No registrarse en logs, métricas, errores, eventos ni trazas.
- Permitir rotación mediante versiones controladas, por ejemplo `_V2` y `_V3`.
- Permitir revocación inmediata.
- Tener vigencia y propósito explícitos.
- Estar sujetas al principio de mínimo privilegio.
- Ser verificadas contra scopes y políticas de ruta.
- Ser denegadas cuando estén ausentes, revocadas, expiradas, malformadas o fuera de alcance.

La posesión de una credencial válida autoriza únicamente las capacidades expresamente asignadas.

---

## 12. L7 — Interconexión y egress

La capa de Interconexión regula toda salida hacia nodos federados, redes, gateways, servicios de infraestructura, proveedores o destinos remotos.

El egress está denegado por defecto.

Ningún componente podrá iniciar una salida sin una política explícita que defina:

- Destino lógico y destino físico autorizado.
- Protocolo, puerto, método y tipo de operación permitido.
- Actor responsable y scope requerido.
- Finalidad de la interconexión.
- Clasificación del destino: local, interno, federado, permitido o prohibido.
- Límites de volumen, frecuencia y tamaño.
- Requisitos de firma, cifrado o integridad.
- Evidencia de auditoría sanitizada.

La capa deberá bloquear:

- Destinos no incluidos en allowlists.
- Egress activado por SDKs, telemetría, fallbacks o dependencias transitivas no aprobadas.
- Salidas desde componentes declarados `zero-egress`.
- Exfiltración de secretos, trazas, PII o conocimiento territorial protegido.
- Reintentos no controlados que puedan producir abuso, coste o fuga de datos.

Las operaciones CITEMESH, GEMET y YUN QSC deberán tratarse como egress sensible, con autorización, trazabilidad, integridad y límites propios.

Los módulos soberanos que establezcan ejecución local aislada, incluido el núcleo ISA en su camino crítico, no podrán activar egress por conveniencia, contingencia, observabilidad ni fallback.

---

## 13. Reporte de auditoría

Toda evaluación Zero Trust deberá producir un reporte interno estructurado.

```ts
type ZeroTrustReport = {
  ok: boolean;
  layers: ZeroTrustLayerResult[];
  deniedBy?: ZeroTrustLayer;
  traceId?: string;
  correlationId?: string;
  policyVersion: string;
  evaluatedAt: string;
};
```

El reporte deberá incluir:

- `layers[]`: estado de evaluación de cada capa.
- `ok`: resultado integral de la cadena.
- `deniedBy`: capa que produjo la denegación, si aplica.
- `traceId`: identificador de trazabilidad.
- `correlationId`: identificador de correlación operativa.
- `policyVersion`: versión de política aplicada.
- `evaluatedAt`: momento de evaluación.

Ejemplo de denegación interna:

```ts
{
  ok: false,
  deniedBy: "L6_IDENTITY",
  layers: [
    { layer: "L1_POLICY", ok: true, code: "POLICY_ALLOWED" },
    { layer: "L2_TRACEABILITY", ok: true, code: "ORIGIN_ALLOWED" },
    { layer: "L3_EXPERIENCE", ok: true, code: "PAYLOAD_VALID" },
    { layer: "L4_RESILIENCE", ok: true, code: "RATE_ALLOWED" },
    { layer: "L5_OPERATION", ok: true, code: "LOG_SANITIZED" },
    { layer: "L6_IDENTITY", ok: false, code: "KEY_INVALID" }
  ],
  policyVersion: "zero-trust-v1",
  evaluatedAt: "2026-01-01T00:00:00.000Z"
}
```

El reporte completo será un artefacto interno. La respuesta pública deberá comunicar únicamente el código de error mínimo necesario, sin exponer detalles de política, scopes, secretos, reglas de detección ni información que facilite evasión.

---

## 14. Monitor General

El `route-guard` canónico y las integraciones compatibles, incluyendo `enforceTrust` cuando aplique, deberán emitir eventos y métricas sanitizadas hacia el Monitor General.

Como mínimo, se observarán:

- Solicitudes por ruta, método y clasificación de riesgo.
- Tasa de aprobación y denegación.
- Distribución de denegaciones por capa.
- Activaciones de rate limit.
- Intentos de autenticación fallida.
- Scopes insuficientes o credenciales revocadas.
- Rechazos por origen no autorizado.
- Rechazos por payload inválido.
- Eventos de egress permitido, denegado o anómalo.
- Latencia de evaluación Zero Trust.
- Estado del backend distribuido de rate limit.
- Rotación, expiración y revocación de credenciales.

El Monitor General nunca deberá recibir secretos, tokens, firmas completas, PII, cuerpos íntegros de petición o respuesta, ni contenido sensible no necesario para la auditoría.

---

## 15. Obligaciones de implementación

Toda nueva ruta API deberá:

1. Adoptar el `route-guard` único antes de ejecutar cualquier lógica de dominio.
2. Declarar clasificación de riesgo, scopes requeridos y política de egress.
3. Validar su contrato de entrada antes de procesar datos.
4. Aplicar controles de origen cuando sea una ruta mutable de navegador.
5. Exigir autenticación y autorización proporcionales a su criticidad.
6. Aplicar límites de tasa, anti-replay e idempotencia cuando produzca efectos persistentes.
7. Emitir trazabilidad sanitizada al Monitor General.
8. Definir si puede efectuar egress y bajo qué condiciones.
9. Incluir pruebas de aprobación, rechazo, expiración, revocación y degradación segura.
10. Mantener separación entre la lógica de dominio y la infraestructura de seguridad.

Toda dependencia nueva que pueda generar tráfico de red, telemetría, identificación externa, almacenamiento de secretos o llamadas a proveedores deberá ser revisada como cambio de seguridad y egress.

---

## 16. Controles verificables

El cumplimiento de este ADR deberá validarse de forma automatizada y recurrente.

Como mínimo, las pruebas deberán demostrar que:

- Ninguna ruta API evita el `route-guard` canónico.
- La denegación de una sola capa impide ejecutar el handler.
- Las rutas sensibles exigen scopes explícitos.
- Las comparaciones de secretos se realizan en tiempo constante.
- API keys, tokens y secretos no aparecen en logs ni eventos.
- Los payloads inválidos no alcanzan la lógica de dominio.
- El rate limit se aplica antes de operaciones costosas.
- Las rutas mutables basadas en navegador rechazan orígenes no permitidos.
- La ausencia de configuración produce comportamiento fail-closed.
- Los destinos de egress no autorizados son bloqueados.
- El reporte contiene `layers`, `ok` y `deniedBy` cuando corresponda.
- La rotación y revocación de claves invalida credenciales conforme a política.
- Los despliegues distribuidos utilizan o exigen una estrategia consistente para rate limits compartidos.
- Los módulos `zero-egress` no emiten tráfico saliente por dependencias directas o indirectas.

---

## 17. Consecuencias

### Consecuencias positivas

- **Uniformidad operativa:** todas las APIs consumen una cadena común y verificable, sin duplicar lógica de seguridad.
- **Seguridad por capas:** una solicitud debe superar fronteras independientes antes de alcanzar lógica de negocio.
- **Fail-closed institucional:** cualquier error, ambigüedad o ausencia de validación resulta en denegación.
- **Trazabilidad centralizada:** el Monitor General identifica qué capa permitió o bloqueó una operación.
- **Identidad soberana:** las credenciales se emiten, almacenan, rotan y revocan bajo gobierno YUN.
- **Protección de datos:** logs, métricas y eventos reducen el riesgo de exposición de secretos o PII.
- **Control de interconexión:** el egress deja de ser implícito y se convierte en una capacidad autorizada.
- **Resiliencia operativa:** las rutas pueden degradar con seguridad frente a fallos de red, configuración o dependencias.

### Costos aceptados

- Cada ruta nueva requiere clasificación, configuración, contratos y pruebas adicionales.
- Las validaciones secuenciales agregan una latencia controlada.
- Los equipos de dominio deben utilizar interfaces compartidas en lugar de soluciones locales.
- El rate limit distribuido exige infraestructura compartida para despliegues multiinstancia.
- La gestión de claves requiere disciplina de custodia, rotación, expiración y revocación.
- La observabilidad debe diseñarse con minimización de datos, no con logging indiscriminado.

Estos costos son aceptados porque el riesgo de confiar en perímetros, redes internas o controles aislados es incompatible con un sistema operativo territorial soberano.

---

## 18. Prohibiciones inquebrantables

Queda prohibido:

- Crear rutas API que eviten el `route-guard` único.
- Ejecutar lógica de dominio antes de completar controles aplicables.
- Omitir, reordenar, suavizar o desactivar una capa sin un ADR posterior aprobado.
- Confiar exclusivamente en IP, red privada, dominio, cookie, frontend o proveedor.
- Tratar una firma válida como sustituto de autorización.
- Usar comparaciones directas para secretos o credenciales.
- Registrar API keys, tokens, firmas, encabezados de autenticación, PII o payloads sensibles.
- Permitir egress implícito, no auditado o no declarado.
- Usar controles de rate limit por instancia como única defensa permanente en un despliegue distribuido de alto riesgo.
- Permitir que el fallo de una dependencia de seguridad amplíe acceso.
- Exponer al cliente detalles internos que faciliten reconocimiento, enumeración o evasión.
- Considerar a un proceso interno como confiable sin autenticación, autorización, trazabilidad y política de egress aplicables.
- Introducir claves externas no auditadas como condición obligatoria para operaciones soberanas.

---

## 19. Criterio de aceptación

Esta decisión se considera cumplida cuando toda ruta protegida demuestre que:

1. La petición atraviesa las siete capas aplicables.
2. Cualquier fallo interrumpe la ejecución antes del handler.
3. La identidad, autorización, payload y origen se verifican según la política declarada.
4. Las decisiones se registran con trazabilidad sanitizada.
5. Los secretos permanecen fuera de logs, métricas, respuestas y eventos.
6. El egress se bloquea por defecto y solo se permite mediante política explícita.
7. La rotación, revocación y expiración de claves producen el comportamiento previsto.
8. Las pruebas cubren éxito, rechazo y degradación fail-closed por cada frontera.
9. El Monitor General recibe evidencia operativa sin comprometer privacidad ni soberanía.

---

## 20. Mandato final

La Heptafederación YUN no protege al Nodo Cero mediante una frontera única ni mediante confianza heredada de la infraestructura.

Lo protege mediante siete capas coordinadas de decisión, trazabilidad, integridad, resiliencia, operación, identidad e interconexión.

Ninguna red obtiene privilegio automático. Ninguna identidad conserva confianza permanente. Ningún servicio evita auditoría. Ninguna falla habilita acceso.

> **La seguridad no es un estado concedido: es una verificación continua, limitada, trazable y revocable.**
