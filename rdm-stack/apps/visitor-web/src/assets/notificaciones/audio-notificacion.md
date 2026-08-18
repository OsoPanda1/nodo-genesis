# Recursos de Audio: Sistema de Notificaciones
## Plataforma: RDM Digital Hub (Real del Monte Digital Hub)

---

##  Descripción del Directorio

Este directorio contiene los activos de audio oficiales y normalizados que se implementarán como los **sonidos de notificación** dentro de la plataforma **RDM Digital Hub**. 

Cada archivo ha sido seleccionado y optimizado para enriquecer la experiencia de usuario (UX), proporcionando una retroalimentación auditiva clara, sofisticada y no intrusiva. El objetivo es mantener una identidad digital armónica y profesional que guíe y apoye al usuario de forma fluida a lo largo de sus interacciones en el ecosistema.

---

## Estructura y Categorización de Sonidos

Para mantener el orden y facilitar la integración en el código base, los sonidos se clasifican en las siguientes categorías según la acción del sistema:

### 1. Éxito y Confirmación (`success_...`)
* **Propósito:** Notificar la finalización exitosa de una acción (ej. carga de archivos, transacciones completadas, configuraciones guardadas).
* **Tono:** Ascendente, limpio, genera una sensación de logro y fluidez.

### 2. Alertas y Recordatorios Generales (`alert_...` / `info_...`)
* **Propósito:** Informar sobre eventos estándar del sistema, actualizaciones de estado o avisos importantes que no requieren una acción correctiva inmediata.
* **Tono:** Neutro, equilibrado y diseñado para captar la atención sin causar sobresaltos.

### 3. Errores y Advertencias (`warning_...` / `error_...`)
* **Propósito:** Indicar fallos en los procesos, problemas de validación o interrupciones que requieren atención del usuario.
* **Tono:** Distintivo pero bajo un enfoque institucional de guía y soporte. **Se prohíben estrictamente los tonos estridentes, agresivos o alarmistas.** La retroalimentación debe ser clara, amorosa y profesional, invitando a la solución del problema sin generar estrés.

### 4. Mensajería y Comunicación en Tiempo Real (`message_...`)
* **Propósito:** Notificar la llegada de nuevos mensajes, interacciones en directo o comentarios dentro del Hub.
* **Tono:** Corto, sutil y optimizado para una alta frecuencia de uso sin causar fatiga auditiva.

---

##  Especificaciones Técnicas

Para garantizar un rendimiento óptimo, una carga rápida y una compatibilidad universal entre navegadores y dispositivos, todos los recursos de audio deben cumplir con los siguientes estándares antes de su despliegue:

| Parámetro | Especificación | Observaciones |
| :--- | :--- | :--- |
| **Formatos** | `.mp3` / `.ogg` / `.wav` | Doble formato de respaldo para compatibilidad web total (HTML5 Audio). |
| **Frecuencia de Muestreo** | 44.1 kHz | Estándar de calidad profesional. |
| **Profundidad de Bits** | 16-bit | Balance óptimo entre fidelidad y peso del archivo. |
| **Canales** | Mono / Estéreo | Preferentemente Mono para sonidos de interfaz cortos para reducir peso. |
| **Normalización de Audio** | -14 LUFS | Asegura que todos los sonidos mantengan el mismo nivel de volumen relativo. |

---

## Buenas Prácticas para Desarrolladores (Políticas de Git)

Si eres parte del equipo de desarrollo y necesitas integrar, modificar o añadir un nuevo sonido a esta carpeta, asegúrate de cumplir rigurosamente con el siguiente flujo de trabajo:

1.  **Optimización Previa:** Pasa el archivo de audio por un proceso de compresión web para evitar archivos innecesariamente pesados que ralenticen la carga del Hub.
2.  **Validación en Entorno Local:** Verifica minuciosamente el comportamiento del disparador del sonido en tu entorno de desarrollo.
3.  **Control de Calidad (Regla de Oro):** > *"Fix everything before committing. Make sure everything is working smoothly without any errors, and then commit to main."*
    
    *(Corrige absolutamente todo antes de hacer el commit. Asegúrate de que el sistema de audio y las alertas funcionen de manera fluida, suave y completamente libre de errores en tu rama local antes de fusionar o subir los cambios a la rama principal `main`).*
