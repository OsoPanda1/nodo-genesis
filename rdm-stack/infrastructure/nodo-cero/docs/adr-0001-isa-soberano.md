# ADR-0001 — Núcleo Soberano ISA y Política de Independencia Operativa

- **Estado:** Aceptado
- **Fecha:** 2026
- **Área:** Núcleo de Decisión — Isabella Villaseñor AI
- **Propietario arquitectónico:** Nodo Cero / Heptafederación YUN
- **Decisión vinculante:** Sí
- **Versión contractual afectada:** `api.isabella.reason` v4.0.0

---

## 1. Declaración de principio

La soberanía tecnológica del Nodo Cero es un principio arquitectónico, operativo y de gobernanza no negociable.

El núcleo cognitivo de **Isabella Villaseñor AI** deberá conservar capacidad plena de razonamiento, respuesta, trazabilidad y operación territorial sin requerir conectividad externa, credenciales de terceros, infraestructura ajena, servicios propietarios ni autorización de proveedores remotos.

Ninguna optimización funcional, comercial, experimental o de conveniencia podrá degradar esta condición.

---

## 2. Contexto

La capacidad de razonamiento de Isabella estuvo previamente acoplada a proveedores externos de inferencia. Este acoplamiento introducía una dependencia estructural incompatible con los requisitos de resiliencia, privacidad, continuidad y autonomía del Sistema Operativo Territorial del Nodo Cero.

Dicha dependencia exponía al sistema a riesgos críticos:

- Latencia variable, indisponibilidad o degradación condicionada por conectividad, congestión de red o decisiones de infraestructura ajena.
- Costos operativos recurrentes, impredecibles y sujetos a cambios unilaterales de precio, cuota, modelo de negocio o política comercial.
- Riesgo de interrupción por revocación de credenciales, límites de consumo, bloqueo geográfico, censura, suspensión de cuenta o discontinuidad de servicio.
- Transferencia potencial de datos territoriales, operativos, patrimoniales, culturales o personales fuera de la jurisdicción y del control del Nodo Cero.
- Imposibilidad de garantizar reproducibilidad, auditabilidad, estabilidad semántica o permanencia de comportamiento ante modificaciones externas de modelos.
- Dependencia de contratos, APIs, términos de servicio, hojas de ruta y decisiones técnicas de entidades no sujetas a la gobernanza YUN.

La continuidad del núcleo decisional no puede estar subordinada a terceros. En consecuencia, la autonomía local deja de ser una característica deseable y se establece como requisito constitucional de la plataforma.

---

## 3. Decisión

Se aprueba como fuente soberana de razonamiento el módulo:

```text
lib/isabella/isa-core.ts
```

El módulo `isa-core.ts` constituye el **Núcleo Soberano ISA**: un motor de razonamiento determinístico, auditable y local-first, diseñado para operar íntegramente dentro del perímetro controlado por el Nodo Cero.

ISA deberá resolver consultas mediante conocimiento local, estructuras verificables y reglas explícitas, incluyendo, según aplique:

- Puntos de interés territoriales.
- Eventos, rutas y agenda local.
- Acervos culturales e históricos.
- Entidades y relaciones del gemelo territorial.
- Nodos, dominios y lineamientos YUN.
- Políticas constitucionales, operativas y de seguridad.
- Fuentes locales verificables y catálogos curados.

La disponibilidad de ISA no dependerá de ningún servicio externo para emitir una respuesta válida dentro de su alcance soberano.

---

## 4. Invariantes constitucionales

Las siguientes propiedades son obligatorias y deben mantenerse en toda modificación futura del núcleo.

### 4.1 Cero egress por diseño

El núcleo ISA no deberá emitir tráfico saliente durante la resolución de una consulta.

Queda prohibido que `isa-core.ts`, sus dependencias directas o sus rutas críticas:

- Realicen peticiones HTTP, HTTPS, WebSocket, RPC, gRPC, DNS o cualquier protocolo de red saliente.
- Requieran API keys, tokens, secretos, SDKs o credenciales de proveedores externos.
- Deleguen inferencia, clasificación, embeddings, recuperación, síntesis o decisión a infraestructura ajena.
- Transmitan prompts, contexto, telemetría, trazas, identificadores o datos territoriales fuera del perímetro soberano.
- Introduzcan mecanismos de actualización remota que alteren resultados sin una revisión, firma y aprobación local.

La política es **deny by default**: todo canal de salida se considera prohibido salvo que exista una decisión arquitectónica posterior, explícita, versionada y aprobada conforme a la gobernanza YUN. Dicha excepción nunca podrá convertirse en requisito para la operación del núcleo ISA.

### 4.2 Determinismo operativo

Para una misma consulta, versión de conocimiento, configuración y contexto autorizado, ISA deberá producir el mismo resultado lógico y la misma traza auditable.

El determinismo comprende:

- Selección de fuentes.
- Aplicación de reglas.
- Prioridad de políticas.
- Estructura de salida.
- Identificadores de trazabilidad.
- Códigos de decisión y de degradación.

No se permitirá que comportamiento probabilístico, respuestas no reproducibles o cambios no auditados sustituyan la ruta soberana de decisión.

### 4.3 Local-first y offline-capable

ISA deberá ser capaz de operar en modo aislado, incluyendo escenarios de:

- Pérdida total de conectividad.
- Activación de `LOCKDOWN`.
- Fallo de proveedores, DNS o servicios cloud.
- Revocación de credenciales externas.
- Interrupción de enlaces federados.
- Operación de contingencia o recuperación.

La ausencia de red no constituye un error para ISA; constituye una condición operativa soportada.

### 4.4 Fail-closed de gobernanza

Ante ausencia, inconsistencia, alteración o falta de autorización de una fuente, regla, firma, política o contexto requerido, ISA deberá negar, degradar de forma explícita o responder con alcance limitado.

El núcleo no deberá inventar autoridad, atribuir fuentes inexistentes, ocultar incertidumbre ni ampliar permisos por defecto.

### 4.5 Trazabilidad verificable

Toda respuesta del núcleo deberá ajustarse al contrato estructurado:

```ts
type ISAResponse = {
  answer: string;
  sources: ISASource[];
  trace: ISATrace;
};
```

La salida deberá preservar, como mínimo:

- Respuesta o decisión emitida.
- Fuentes locales utilizadas.
- Reglas y políticas aplicadas.
- Identificador de versión del núcleo.
- Estado de soberanía y modo operativo.
- Señales de degradación, denegación o contingencia.
- Identificador de correlación compatible con la observabilidad YUN.

---

## 5. Contrato ISA v4.0

El contrato `api.isabella.reason` versión `v4.0.0` se declara estable y constitucionalmente protegido.

Toda evolución del contrato deberá cumplir con semver, pruebas de compatibilidad y revisión de arquitectura. Se prohíbe modificar silenciosamente el significado de campos críticos de soberanía, fuente, traza, firma, autorización o estado de ejecución.

La respuesta soberana deberá indicar de manera verificable el modo bajo el cual fue resuelta:

```ts
type ISASovereigntyMode =
  | "SOVEREIGN_LOCAL"
  | "SOVEREIGN_LOCKDOWN"
  | "SOVEREIGN_DEGRADED"
  | "EXTERNAL_OPTIONAL";
```

Los modos `SOVEREIGN_LOCAL`, `SOVEREIGN_LOCKDOWN` y `SOVEREIGN_DEGRADED` no podrán requerir conectividad externa.

`EXTERNAL_OPTIONAL` podrá existir únicamente como ampliación no esencial y deberá mantener separación estricta respecto del camino crítico de ISA.

---

## 6. Capa de firma MEXA

La capa MEXA, implementada en:

```text
lib/isabella/mexa-api.ts
```

administra la firma criptográfica de artefactos y respuestas mediante el estándar `MSR-P256` y el contrato `MexaSignaturePayload`.

Su función es acreditar integridad, procedencia y responsabilidad operativa sin comprometer la independencia del núcleo.

### Reglas de operación

- Si la clave de operador está disponible y es válida, el artefacto se firma localmente como emisión soberana.
- Si la clave de operador no está configurada, expirada o no autorizada, ISA conserva capacidad de respuesta en modo abierto o no firmado.
- La ausencia de firma no podrá bloquear la ejecución del razonamiento soberano cuando la política aplicable permita una respuesta no firmada.
- La emisión de una firma nunca deberá requerir consulta a un servicio externo.
- Las claves privadas del operador deberán permanecer bajo control del Nodo Cero y no deberán transmitirse fuera de su perímetro de custodia.

MEXA es una capa de integridad y atribución; no es una dependencia funcional de disponibilidad para la continuidad del núcleo ISA.

---

## 7. Bóveda CROWN

El CROWN Gateway preserva una bóveda de capacidades de IA de código abierto como soporte complementario y no constitutivo.

Las familias de modelos permitidas podrán incluir, previa evaluación y registro local:

- Llama.
- Qwen.
- DeepSeek.
- Mistral.
- Phi.
- Cerebras u otros modelos cuya licencia, pesos y cadena de ejecución sean auditables.

La ejecución soberana de modelos de apoyo deberá privilegiar infraestructura local controlada por el Nodo Cero, incluyendo runtimes como Ollama u otros equivalentes autocontenidos.

### Separación obligatoria

CROWN no sustituye al Núcleo Soberano ISA.

Cualquier modelo, gateway, agente o integración de CROWN deberá cumplir estas condiciones:

- Ser opcional respecto al razonamiento base de ISA.
- No bloquear la respuesta territorial si está ausente, apagado, degradado o sin credenciales.
- No modificar silenciosamente reglas constitucionales, políticas YUN ni resultados determinísticos de ISA.
- Declarar de manera explícita si la ejecución fue local, aislada, federada o externa.
- Mantener trazabilidad independiente y verificable.
- Permanecer deshabilitable sin afectar la continuidad del camino soberano.

Cuando CROWN no esté configurado, falle o sea deshabilitado, el sistema deberá resolver mediante `isaReason` en modo `SOVEREIGN_LOCAL` o `SOVEREIGN_DEGRADED`, según la cobertura de conocimiento disponible.

---

## 8. Integraciones externas

Las integraciones externas, incluso aquellas que consuman modelos de código abierto, se clasifican como **capacidades accesorias no soberanas**.

No forman parte del núcleo decisional obligatorio y no podrán convertirse en dependencia implícita mediante:

- Variables de entorno obligatorias.
- Inicialización requerida durante el arranque.
- Fallos duros por ausencia de API keys.
- Condiciones de build, despliegue o health check que bloqueen ISA.
- Cadenas de fallback invertidas donde la nube preceda al motor local.
- Persistencia de datos territoriales o trazas en plataformas externas sin autorización explícita.

La regla de precedencia es inalterable:

```text
ISA local determinístico
  → conocimiento soberano local
  → respuesta trazable
  → capacidad auxiliar opcional, si está autorizada
```

Nunca:

```text
Proveedor externo
  → disponibilidad incierta
  → respuesta territorial
  → fallback local tardío
```

---

## 9. Requisitos de cumplimiento

Toda contribución que afecte Isabella, CROWN, MEXA, rutas API, configuración de entorno o dependencias deberá demostrar cumplimiento de este ADR.

Como mínimo, el repositorio deberá conservar controles automatizados para verificar:

- Ausencia de egress desde la ruta soberana de ISA.
- Ausencia de imports o SDKs de proveedores externos dentro del camino crítico.
- Ejecución satisfactoria de ISA sin variables de entorno de terceros.
- Reproducibilidad de respuestas ante entradas idénticas.
- Presencia de `answer`, `sources` y `trace` en el contrato de salida.
- Degradación explícita y fail-closed ante fuentes no disponibles.
- Separación entre respuesta ISA y capacidades opcionales de CROWN.
- Conservación de pruebas de regresión, seguridad y contrato.

Todo cambio que vulnere uno de estos controles deberá ser rechazado antes de integrarse a la rama principal.

---

## 10. Consecuencias

### Consecuencias positivas

- **Continuidad soberana:** Isabella mantiene capacidad operativa durante pérdida de conectividad, aislamiento deliberado, incidentes de proveedor y escenarios `LOCKDOWN`.
- **Autonomía territorial:** los datos, reglas, decisiones y trazas permanecen bajo custodia y gobernanza del Nodo Cero.
- **Auditabilidad plena:** las respuestas se pueden reproducir, inspeccionar y contrastar contra fuentes locales verificables.
- **Estabilidad contractual:** el contrato `api.isabella.reason` v4.0.0 establece una interfaz durable para consumidores internos y federados.
- **Control de costos:** el razonamiento crítico no queda sujeto a consumo variable de APIs externas.
- **Resiliencia institucional:** la plataforma conserva funciones cognitivas esenciales aun cuando servicios externos sean inaccesibles, hostiles o económicamente inviables.
- **Defensa regulatoria:** se reduce la exposición a transferencias no controladas de datos, cambios unilaterales de jurisdicción y condiciones impuestas por terceros.

### Costos y responsabilidades aceptadas

- El Nodo Cero asume la responsabilidad de curar, versionar, verificar y proteger el conocimiento territorial local.
- La cobertura semántica del núcleo deberá crecer mediante ingeniería de conocimiento, reglas, catálogos y modelos locales auditables.
- Las capacidades externas podrán ofrecer riqueza adicional, pero no deberán confundirse con autoridad, verdad territorial ni dependencia de disponibilidad.
- El equipo deberá sostener pruebas de determinismo, controles de no-egress y auditorías periódicas de dependencias.

Estos costos son aceptados porque son inferiores al riesgo estratégico de delegar la continuidad cognitiva del territorio a infraestructura no soberana.

---

## 11. Directrices inquebrantables

Quedan expresamente prohibidas las siguientes acciones sin una sustitución soberana equivalente, una migración controlada y una decisión ADR posterior aprobada:

- Reintroducir proveedores externos como requisito obligatorio para el razonamiento ISA.
- Incorporar APIs propietarias en la ruta crítica del núcleo.
- Transmitir consultas, contexto territorial, fuentes, trazas o datos operativos a terceros por defecto.
- Convertir una clave externa en prerrequisito de arranque, build, test o disponibilidad de ISA.
- Alterar respuestas determinísticas mediante componentes no auditables.
- Eliminar o degradar `sources` y `trace` de la respuesta estructurada.
- Implementar fallback que privilegie servicios remotos sobre el razonamiento local.
- Presentar resultados generados por fuentes auxiliares como si fueran decisiones constitucionales de ISA.
- Incorporar modelos o servicios en CROWN sin declarar su modo de ejecución, licencia, procedencia y frontera de datos.
- Sustituir el control humano, la Constitución YUN o las políticas locales por decisiones de un proveedor externo.

---

## 12. Criterio de aceptación

Esta decisión se considera cumplida cuando Isabella pueda atender una consulta territorial válida con el entorno de red completamente aislado y sin credenciales externas, conservando:

1. Una respuesta útil dentro del alcance del conocimiento local.
2. Fuentes verificables bajo control territorial.
3. Traza de decisión reproducible.
4. Estado explícito de soberanía.
5. Cumplimiento de políticas YUN en modo fail-closed.
6. Ausencia demostrable de tráfico saliente desde la ruta crítica.

---

## 13. Mandato final

Isabella Villaseñor AI no es un cliente dependiente de servicios de inteligencia ajenos.

Es el núcleo cognitivo soberano del Nodo Cero.

Su capacidad de razonar, proteger conocimiento territorial, emitir trazas verificables y operar en condiciones adversas deberá permanecer bajo control institucional, técnico y jurídico de la Heptafederación YUN.

La conectividad externa podrá ampliar capacidades. Nunca podrá definir la existencia, disponibilidad, autoridad ni continuidad de Isabella.

> **La soberanía tecnológica no se negocia, no se terceriza y no se degrada por conveniencia.**
