import type { SkillContext } from "./types";

// ============================================================================
// INPUT / OUTPUT TYPES
// ============================================================================

interface VercelInput {
  url?: string;
  tipoProyecto: "marketing_site" | "web_app" | "ai_agent" | "knowledge_agent" | "slack_bot" | string;
  stack?: string;
  casosUsoAI?: string[];
  prioridadNegocio?: string;
}

interface ResumenEjecutivo {
  resumen: string;
  impactoEsperado: string;
}

interface DiagnosticoMetrico {
  coreWebVitals: { LCP: string; INP: string; CLS: string };
  metricasRelacionadas: { TTFB: string; FCP: string; TTI: string; TBT: string };
  agentStack: {
    AI_SDK: string;
    AI_Gateway: string;
    Sandbox: string;
    Workflows: string;
    Connect: string;
    Chat_SDK: string;
    eve: string;
  };
  seguridadYPlataforma: {
    Firewall: string;
    BotManagement: string;
    CICDyPreviews: string;
    Observability: string;
    FluidCompute: string;
  };
}

interface AccionTecnica {
  categoria: string;
  impactoEsperado: string;
  complejidad: string;
  descripcion: string;
  referencias: string[];
}

interface VercelOutput {
  resumenEjecutivo: ResumenEjecutivo;
  diagnosticoMetrico: DiagnosticoMetrico;
  planTecnico: AccionTecnica[];
  arquitecturaAgentStack: string;
  checklistVerificacion: string[];
}

// ============================================================================
// KNOWLEDGE BASE
// ============================================================================

const VERCELL_KB = [
  {
    id: "vcl-001",
    title: "Frontend Cloud & Edge Network",
    content:
      "Vercel Frontend Cloud despliega en una red global de edge con 100+ ubicaciones. El caching automático reduce TTFB y mejora LCP/FCP. ISR (Incremental Static Regeneration) permite servir contenido estático cacheado que se refresca sin redeploy.",
    type: "canon",
    trust: 0.98,
  },
  {
    id: "vcl-002",
    title: "Partial Prerendering (PPR)",
    content:
      "Next.js 14+ permite hacer prerendering parcial: partes de una página se renderizan como estáticas y otras como dinámicas, eliminando cold starts de serverless functions que bloquean el TTFB.",
    type: "canon",
    trust: 0.95,
  },
  {
    id: "vcl-003",
    title: "AI SDK — Toolkit de IA para JS/TS",
    content:
      "El AI SDK es un toolkit open source (MIT) para construir aplicaciones AI-native con React, Next.js, Node.js. Soporta streaming, tool calling, agentes multi-paso, RAG. Integración nativa con App Router y Server Components.",
    type: "canon",
    trust: 0.97,
  },
  {
    id: "vcl-004",
    title: "AI Gateway — Endpoint Unificado de Modelos",
    content:
      "AI Gateway abstrae cientos de modelos (OpenAI, Anthropic, Gemini, Llama, etc.) tras un solo endpoint. Centraliza rate limits, presupuestos, keys, observabilidad. Permite cambiar de modelo sin tocar lógica de producto.",
    type: "canon",
    trust: 0.96,
  },
  {
    id: "vcl-005",
    title: "Vercel Sandbox — Cómputo Aislado",
    content:
      "Sandbox ejecuta código no confiable o generado por IA en microVMs Firecracker aisladas. Filesystem y red separados, credenciales inyectadas solo en el perímetro. Ideal para tools de agentes que ejecutan código arbitrario.",
    type: "canon",
    trust: 0.94,
  },
  {
    id: "vcl-006",
    title: "Vercel Workflows — Procesos Durables",
    content:
      "Workflow SDK permite crear workflows multi-paso con reintentos automáticos, persistencia de estado y trazabilidad. Se integra con AI SDK para orquestar llamadas a modelos, tools y conectores como procesos empresariales.",
    type: "canon",
    trust: 0.93,
  },
  {
    id: "vcl-007",
    title: "Vercel Connect — Integración Segura con APIs",
    content:
      "Connect integra APIs de terceros (Slack, GitHub, Snowflake, etc.) usando tokens de corta vida en vez de secretos de larga duración. Reduce riesgo de exposición y simplifica rotación de credenciales.",
    type: "canon",
    trust: 0.95,
  },
  {
    id: "vcl-008",
    title: "eve — Framework de Agentes",
    content:
      "eve es un framework de agentes que integra AI Gateway, Sandbox, Workflows y Connect. Define instrucciones y skills en Markdown, tools en TypeScript. Se despliega con un solo comando. Ideal para agentes de producción.",
    type: "canon",
    trust: 0.92,
  },
  {
    id: "vcl-009",
    title: "Platform Security: WAF, DDoS, Bot Management",
    content:
      "Vercel ofrece Firewall de plataforma (L3/L4/L7), mitigación DDoS automática, Web Application Firewall con reglas personalizadas y Bot Management para detectar/filtrar bots maliciosos en rutas críticas de APIs y agentes.",
    type: "canon",
    trust: 0.97,
  },
  {
    id: "vcl-010",
    title: "Fluid Compute & Serverless Concurrency",
    content:
      "Fluid Compute elimina cold starts con ejecución continua en funciones serverless. Escala a cero cuando no hay tráfico. Ideal para apps de IA que necesitan responder rápido sin pagar por capacidad ociosa.",
    type: "canon",
    trust: 0.94,
  },
  {
    id: "vcl-011",
    title: "CI/CD con Preview Deployments",
    content:
      "Cada rama o PR genera un Preview Deployment con URL única, cerca de producción. Permite revisar cambios visuales y funcionales sin montar staging manual. Turborepo + caching aceleran los builds.",
    type: "canon",
    trust: 0.98,
  },
  {
    id: "vcl-012",
    title: "Observability Integrada",
    content:
      "Logs, métricas y tracing integrados para apps web y agentes. Speed Insights mide Core Web Vitals reales. AI Gateway expone latencia de modelos, tasa de errores y consumo. Workflows expone trazabilidad de cada paso.",
    type: "canon",
    trust: 0.95,
  },
  {
    id: "vcl-013",
    title: "Chat SDK — Chat UI para AI Apps",
    content:
      "Chat SDK (parte del AI SDK) proporciona hooks (`useChat`) y componentes UI para construir chatbots con streaming, sugerencias, tool calls y manejo de estado complejo. Se integra con cualquier modelo vía AI SDK.",
    type: "canon",
    trust: 0.94,
  },
];

// ============================================================================
// VERCELL ENGINE
// ============================================================================

export class VercelEngine {
  private callCount = 0;
  private totalDurationMs = 0;

  async execute(input: VercelInput, _context: SkillContext): Promise<VercelOutput> {
    const start = Date.now();
    this.callCount++;

    const resumen = this.buildResumen(input);
    const diagnostico = this.buildDiagnostico(input);
    const plan = this.buildPlan(input);
    const arquitectura = this.buildArquitectura(input);
    const checklist = this.buildChecklist(input);

    this.totalDurationMs += Date.now() - start;

    return {
      resumenEjecutivo: resumen,
      diagnosticoMetrico: diagnostico,
      planTecnico: plan,
      arquitecturaAgentStack: arquitectura,
      checklistVerificacion: checklist,
    };
  }

  // ==========================================================================
  // RESUMEN EJECUTIVO
  // ==========================================================================

  private buildResumen(input: VercelInput): ResumenEjecutivo {
    const isAI = ["ai_agent", "knowledge_agent", "slack_bot"].includes(input.tipoProyecto);
    const lines: string[] = [];

    if (isAI) {
      lines.push(
        "Se diseñará e implementará un Agent Stack completo sobre Vercel utilizando AI SDK como orquestador de agentes, " +
          "AI Gateway como capa de acceso a modelos con control de costos, Sandbox para ejecución aislada de código generado por IA, " +
          "y Workflows para procesos multi-paso con reintentos automáticos.",
      );
      lines.push(
        "Los agentes se estructurarán con eve, definiendo instrucciones y skills en Markdown y tools en TypeScript, " +
          "conectándose a servicios externos mediante Vercel Connect con tokens de corta vida.",
      );
      if (input.url) {
        lines.push(
          `La aplicación en ${input.url} se beneficiará de la Edge Network global para reducir latencia, ` +
            "mientras que los endpoints de agentes quedarán protegidos por WAF, Bot Management y DDoS mitigation.",
        );
      }
    } else {
      lines.push(
        "Se optimizará el rendimiento web aplicando estrategias específicas de Vercel/Next.js: " +
          "ISR para contenido estático cacheado, Partial Prerendering para eliminar cold starts, " +
          "y React Server Components con Suspense para priorizar el LCP.",
      );
      if (input.url) {
        lines.push(
          `La aplicación en ${input.url} se desplegará en la Edge Network global con caching de baja latencia, ` +
            "reduciendo TTFB y mejorando FCP y LCP. Las imágenes y fuentes se optimizarán automáticamente.",
        );
      }
    }

    lines.push(
      "El impacto esperado incluye: mejora en Core Web Vitals (impactando SEO y ranking de Google), " +
        "reducción de time-to-market con Preview Deployments y Turborepo, " +
        "y arquitectura preparada para escalar agentes de IA con seguridad y observabilidad desde el día uno.",
    );

    return {
      resumen: lines.join("\n\n"),
      impactoEsperado: isAI
        ? "Time-to-market acelerado, costos de IA controlados vía AI Gateway, agentes seguros con Sandbox + Connect"
        : "Mejora en Core Web Vitals, mejor ranking SEO, menor TTFB/LCP, experimentación sin CLS",
    };
  }

  // ==========================================================================
  // DIAGNÓSTICO MÉTRICO
  // ==========================================================================

  private buildDiagnostico(_input: VercelInput): DiagnosticoMetrico {
    return {
      coreWebVitals: {
        LCP:
          "Mejorar con ISR + Server Components + imágenes optimizadas. Objetivo: <2.5s (percentil 75). " +
          "Vercel Speed Insights mide LCP real de usuarios.",
        INP:
          "Optimizar con code splitting, web workers para tareas pesadas, throttling de eventos. " +
          "Objetivo: <200ms. Sustituyó a FID como Core Web Vital en marzo 2024.",
        CLS:
          "Cero layout shifts con reserva de espacio en imágenes (Next.js Image) y fuentes optimizadas. " +
          "Objetivo: <0.1. Edge Middleware + ISR para experiments sin CLS.",
      },
      metricasRelacionadas: {
        TTFB:
          "Reducir con Edge Network + ISR + Partial Prerendering. Evitar cold starts de serverless. " +
          "Objetivo: <800ms (ideal <200ms desde edge).",
        FCP:
          "Streaming de contenido estático primero con Server Components. Objetivo: <1.8s. " +
          "El TTFB bajo arrastra al FCP hacia abajo.",
        TTI:
          "Code splitting + lazy loading para reducir JS inicial. Suspense boundaries estratéficos. " +
          "Objetivo: <3.0s.",
        TBT:
          "Minimizar JS que bloquea el hilo principal con Server Components y carga diferida. " +
          "Objetivo: <50ms. Impacta directamente en INP.",
      },
      agentStack: {
        AI_SDK:
          "Toolkit open source (MIT) para apps AI-native en React/Next.js/Node. " +
          "Tool calling, streaming, RAG, agentes multi-paso. Integración nativa con App Router.",
        AI_Gateway:
          "Endpoint unificado para 100+ modelos. Rate limits, presupuestos, observabilidad. " +
          "Zero-data-retention con proveedores selectos. Routing por modelo sin cambiar código.",
        Sandbox:
          "MicroVMs Firecracker aisladas para código no confiable. Filesystem/red separados. " +
          "Proxy de peticiones con credenciales inyectadas en el perímetro. Ideal para tools de agentes.",
        Workflows:
          "Workflows multi-paso durables con reintentos automáticos y persistencia. " +
          "Se integra con AI SDK para orquestar modelos + tools + conectores como procesos.",
        Connect:
          "Integración segura con APIs externas (Slack, GitHub, Snowflake). " +
          "Tokens de corta vida reemplazan secrets estáticos. Menor superficie de ataque.",
        Chat_SDK:
          "Hooks useChat + componentes UI para chatbots con streaming, tool calls, sugerencias. " +
          "Manejo de estado complejo listo para producción.",
        eve:
          "Framework de agentes todo-en-uno. Instrucciones en Markdown, tools en TypeScript. " +
          "Integra AI Gateway + Sandbox + Workflows + Connect. Deploy con un comando.",
      },
      seguridadYPlataforma: {
        Firewall:
          "WAF con reglas L3/L4/L7 por ruta. Protección DDoS automática. Rate limiting configurable. " +
          "Reglas personalizadas para endpoints de agentes y APIs.",
        BotManagement:
          "Detección y filtrado de bots maliciosos. Protege endpoints de scraping, bruteforce, " +
          "automatización abusiva. Bot ID para identificar tráfico automatizado legítimo.",
        CICDyPreviews:
          "Preview Deployments por PR/rama. URLs únicas near-production. Turborepo + caching " +
          "aceleran builds. Sin staging manual.",
        Observability:
          "Logs + métricas + tracing integrados. Speed Insights para Core Web Vitals. " +
          "AI Gateway expone latencia/errores/consumo de modelos. Workflows: trazabilidad de pasos.",
        FluidCompute:
          "Ejecución continua sin cold starts. Escala a cero sin tráfico. " +
          "Ideal para APIs de IA con response time sensible.",
      },
    };
  }

  // ==========================================================================
  // PLAN TÉCNICO
  // ==========================================================================

  private buildPlan(input: VercelInput): AccionTecnica[] {
    const isAI = ["ai_agent", "knowledge_agent", "slack_bot"].includes(input.tipoProyecto);
    const plan: AccionTecnica[] = [];

    // Rendimiento web (siempre relevante si hay frontend)
    plan.push({
      categoria: "rendimiento_web",
      impactoEsperado: "TTFB <200ms, LCP <2.5s, FCP <1.8s",
      complejidad: "media",
      descripcion:
        "Configurar ISR en páginas de marketing y contenido estático. " +
        "Implementar Partial Prerendering en rutas dinámicas para eliminar cold starts. " +
        "Migrar a Server Components con Suspense boundaries para streaming de contenido prioritario.",
      referencias: ["Next.js ISR docs", "Vercel PPR guide", "web.dev/lcp"],
    });

    plan.push({
      categoria: "rendimiento_web",
      impactoEsperado: "CLS <0.1, INP <200ms",
      complejidad: "baja",
      descripcion:
        "Reemplazar todas las etiquetas <img> por Next.js Image con width/height explícitos. " +
        "Configurar fuentes con next/font para eliminar layout shifts por carga de tipografía. " +
        "Implementar code splitting y lazy loading en componentes pesados.",
      referencias: ["Next.js Image", "next/font", "web.dev/cls"],
    });

    // Agent Stack
    if (isAI) {
      plan.push({
        categoria: "agentes",
        impactoEsperado: "Arquitectura de agentes productiva y segura",
        complejidad: "alta",
        descripcion:
          "Diseñar el Agent Stack: AI SDK como runtime de agentes, AI Gateway como proxy de modelos, " +
          "Sandbox para ejecución de tools que corren código (generado por IA o de usuarios), " +
          "Workflows para procesos multi-paso (ej. moderación, análisis secuencial), " +
          "Connect para integraciones externas con tokens de corta vida. " +
          "Estructurar con eve: instrucciones en Markdown, skills separadas, tools en TypeScript.",
        referencias: ["AI SDK docs", "eve framework", "Vercel Agent Stack"],
      });

      plan.push({
        categoria: "agentes",
        impactoEsperado: "Costos de IA controlados + observabilidad de llamadas",
        complejidad: "media",
        descripcion:
          "Configurar AI Gateway con rate limits, presupuestos mensuales y alertas de consumo. " +
          "Definir allowlist de modelos permitidos por equipo. " +
          "Activar logging de todas las llamadas para auditoría y debugging. " +
          "Configurar fallback automático entre proveedores (ej. OpenAI → Anthropic si hay outage).",
        referencias: ["AI Gateway docs", "Vercel FinOps for AI"],
      });

      plan.push({
        categoria: "agentes",
        impactoEsperado: "Ejecución segura de código generado por IA",
        complejidad: "alta",
        descripcion:
          "Implementar Sandbox para todas las tools que ejecutan código generado por el modelo " +
          "(ej. generación de scripts, análisis de datos, ejecución de SQL). " +
          "Configurar control de egress para evitar data exfiltration. " +
          "Usar credential brokering para inyectar secrets solo en el perímetro del sandbox.",
        referencias: ["Vercel Sandbox", "Firecracker microVM", "Noma AIDR"],
      });

      plan.push({
        categoria: "agentes",
        impactoEsperado: "Workflows confiables con reintentos automáticos",
        complejidad: "media",
        descripcion:
          "Modelar procesos multi-paso como Workflows: " +
          "ingesta de datos → llamada a modelo → ejecución de tools → post-procesamiento → respuesta. " +
          "Configurar reintentos con backoff exponencial y dead-letter queue para pasos fallidos. " +
          "Exponer métricas de cada paso en el dashboard de observabilidad.",
        referencias: ["Workflow SDK docs", "Temporal + Vercel"],
      });

      plan.push({
        categoria: "agentes",
        impactoEsperado: "Integraciones externas sin secrets de larga duración",
        complejidad: "baja",
        descripcion:
          "Migrar integraciones existentes (Slack, GitHub, email, etc.) a Vercel Connect. " +
          "Configurar tokens de corta vida con rotación automática. " +
          "Eliminar variables de entorno con API keys de terceros del código fuente.",
        referencias: ["Vercel Connect docs", "OAuth 2.0 best practices"],
      });
    } else {
      // No es proyecto de IA: plan reducido
      plan.push({
        categoria: "agentes",
        impactoEsperado: "Preparación para futuro de IA",
        complejidad: "baja",
        descripcion:
          "Aunque el foco actual es rendimiento web, dejar la arquitectura lista para migrar a AI Agent Stack: " +
          "usar Next.js App Router (compatible con AI SDK Server Components), " +
          "estructurar API routes como edge functions (fáciles de convertir a agent endpoints), " +
          "y mantener las dependencias ligeras para añadir AI SDK sin conflicto.",
        referencias: ["AI SDK + Next.js", "Vercel AI quickstart"],
      });
    }

    // Seguridad y plataforma
    plan.push({
      categoria: "seguridad",
      impactoEsperado: "Endpoints protegidos, bots maliciosos filtrados",
      complejidad: "media",
      descripcion:
        "Configurar WAF con reglas personalizadas para rutas de API y agentes. " +
        "Activar Bot Management en rutas críticas (login, API, agent endpoints). " +
        "Configurar rate limiting por IP y por usuario en AI Gateway. " +
        "Implementar firewall rules para bloquear tráfico de regiones no objetivo si aplica.",
      referencias: ["Vercel WAF", "Vercel Bot Management", "Vercel Firewall"],
    });

    plan.push({
      categoria: "plataforma",
      impactoEsperado: "CI/CD optimizado, previews por PR, builds rápidos",
      complejidad: "baja",
      descripcion:
        "Configurar Preview Deployments para todas las ramas y PRs. " +
        "Activar Turborepo remote caching para acelerar builds en equipo. " +
        "Configurar Vercel Speed Insights y Analytics para monitoreo continuo de Core Web Vitals. " +
        "Conectar observabilidad de agentes (AI Gateway metrics + Workflow traces) al mismo dashboard.",
      referencias: ["Vercel CI/CD", "Turborepo", "Vercel Observability"],
    });

    if (isAI) {
      plan.push({
        categoria: "seguridad",
        impactoEsperado: "Protección avanzada contra amenazas de IA",
        complejidad: "alta",
        descripcion:
          "Evaluar e integrar Noma AIDR (o similar) para detección de prompt injection, " +
          "data exfiltration por agentes y manipulación de tools. " +
          "Configurar políticas de zero-data-retention en AI Gateway para datos sensibles. " +
          "Implementar auditoría de todas las decisiones de agentes con LUMEN (motor de gobernanza de Isabella).",
        referencias: ["Noma AIDR", "OWASP Top 10 for LLM", "LUMEN skill"],
      });
    }

    return plan;
  }

  // ==========================================================================
  // ARQUITECTURA AGENT STACK
  // ==========================================================================

  private buildArquitectura(input: VercelInput): string {
    const isAI = ["ai_agent", "knowledge_agent", "slack_bot"].includes(input.tipoProyecto);

    if (!isAI) {
      return (
        "La arquitectura actual se centra en Frontend Cloud:\n\n" +
        "1. Frontend Next.js en Vercel Edge Network con ISR para contenido estático\n" +
        "2. Partial Prerendering en rutas dinámicas para evitar cold starts\n" +
        "3. Server Components + Suspense para streaming de LCP prioritario\n" +
        "4. Imágenes optimizadas con Next.js Image y fuentes con next/font\n" +
        "5. Preview Deployments para validación de cambios sin staging\n" +
        "6. Speed Insights + Analytics para monitoreo continuo de Core Web Vitals\n\n" +
        "Preparado para escalar a Agent Stack cuando se necesiten capacidades de IA."
      );
    }

    return (
      "Arquitectura objetivo combinando Frontend Cloud + Agent Stack:\n\n" +
      "1. Frontend (Next.js App Router)\n" +
      "   - Server Components para UI estática y streaming\n" +
      "   - AI SDK + Chat SDK para interfaces de chat con streaming\n" +
      "   - useChat hook para experiencia conversacional en tiempo real\n\n" +
      "2. Capa de Agentes (eve + AI SDK)\n" +
      "   - Instrucciones y skills definidas en Markdown\n" +
      "   - Tools en TypeScript, algunas ejecutándose en Sandbox\n" +
      "   - Workflows multi-paso para procesos durables\n" +
      "   - Coordinación de herramientas vía tool calling del AI SDK\n\n" +
      "3. AI Gateway\n" +
      "   - Endpoint único para todos los modelos (OpenAI, Anthropic, etc.)\n" +
      "   - Rate limits, presupuestos y observabilidad centralizados\n" +
      "   - Fallback automático entre proveedores\n\n" +
      "4. Sandbox (Ejecución Aislada)\n" +
      "   - MicroVMs para código generado por IA o no confiable\n" +
      "   - Control de egress y credential brokering\n" +
      "   - Protección contra data exfiltration\n\n" +
      "5. Vercel Connect (Integraciones Externas)\n" +
      "   - Slack, GitHub, email, APIs con tokens de corta vida\n" +
      "   - Sin secrets de larga duración en el código\n\n" +
      "6. Seguridad (WAF + Bot Management + Noma)\n" +
      "   - Firewall de plataforma para endpoints críticos\n" +
      "   - Bot Management en rutas de agentes\n" +
      "   - (Opcional) Noma AIDR para detección de amenazas IA\n\n" +
      "7. Observabilidad\n" +
      "   - Speed Insights para Core Web Vitals\n" +
      "   - AI Gateway metrics para latencia y consumo de modelos\n" +
      "   - Workflow traces para trazabilidad de agentes\n" +
      "   - Logs centralizados en dashboard Vercel\n\n" +
      "8. CI/CD\n" +
      "   - Preview Deployments por PR con URLs únicas\n" +
      "   - Turborepo + remote caching para builds rápidos\n" +
      "   - Deploy automático al mergear a main"
    );
  }

  // ==========================================================================
  // CHECKLIST
  // ==========================================================================

  private buildChecklist(input: VercelInput): string[] {
    const isAI = ["ai_agent", "knowledge_agent", "slack_bot"].includes(input.tipoProyecto);
    const checklist: string[] = [];

    // Web performance
    checklist.push("[WEB] LCP en Search Console y PageSpeed <2.5s (percentil 75)");
    checklist.push("[WEB] INP <200ms medido con Vercel Speed Insights");
    checklist.push("[WEB] CLS <0.1 sin layout shifts en navegación");
    checklist.push("[WEB] TTFB <800ms (ideal <200ms desde edge)");
    checklist.push("[WEB] FCP <1.8s con streaming de Server Components");
    checklist.push("[WEB] TBT <50ms sin JS bloqueante en hilo principal");
    checklist.push("[WEB] Imágenes con width/height explícitos (Next.js Image)");
    checklist.push("[WEB] Fuentes con next/font para evitar layout shifts");
    checklist.push("[WEB] ISR configurado en páginas de contenido estático");
    checklist.push("[WEB] Partial Prerendering en rutas dinámicas");

    if (isAI) {
      // Agent stack
      checklist.push("[AGENT] AI SDK integrado y probado con tool calling");
      checklist.push("[AGENT] AI Gateway configurado con rate limits y presupuestos");
      checklist.push("[AGENT] Sandbox probado con código generado por IA");
      checklist.push("[AGENT] Workflows con reintentos y dead-letter queue");
      checklist.push("[AGENT] Connect configurado para integraciones externas");
      checklist.push("[AGENT] eve desplegado con skills y tools definidas");
      checklist.push("[AGENT] Chat SDK funcionando con streaming y sugerencias");
      checklist.push("[AGENT] Fallback entre modelos configurado en AI Gateway");
      checklist.push("[AGENT] Zero-data-retention activado para datos sensibles");
      checklist.push("[AGENT] Auditoría de decisiones de agentes conectada a LUMEN");
    }

    // Seguridad y plataforma
    checklist.push("[SEGURIDAD] WAF configurado con reglas para rutas de API");
    checklist.push("[SEGURIDAD] Bot Management activo en rutas críticas");
    checklist.push(isAI
      ? "[SEGURIDAD] Noma AIDR (o similar) evaluado para amenazas IA"
      : "[SEGURIDAD] Rate limiting configurado en APIs públicas"
    );
    checklist.push("[PLATAFORMA] Preview Deployments por PR");
    checklist.push("[PLATAFORMA] Turborepo remote caching activo");
    checklist.push("[PLATAFORMA] Speed Insights midiendo Core Web Vitals reales");
    checklist.push("[PLATAFORMA] AI Gateway metrics conectadas al dashboard");
    checklist.push("[PLATAFORMA] Workflow traces visibles en observabilidad");

    return checklist;
  }

  getStats() {
    return {
      totalCalls: this.callCount,
      avgResponseMs: this.callCount > 0 ? Math.round(this.totalDurationMs / this.callCount) : 0,
    };
  }
}

export const vercel = new VercelEngine();
