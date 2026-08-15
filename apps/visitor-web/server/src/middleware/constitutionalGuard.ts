import type { NextFunction, Request, Response } from "express";
import { emitMsrEvent } from "../services/audit.service.js";

/**
 * Métodos considerados “no mutantes” desde la perspectiva de dominio.
 * Todo lo demás se trata como potencial mutación y pasa por el guard.
 */
const SAFE_METHODS = new Set<Uppercase<string>>(["GET", "HEAD", "OPTIONS"]);

/**
 * Dominio lógico de la API extraído de la ruta.
 */
export type ApiDomain =
  | "auth"
  | "profiles"
  | "users"
  | "donations"
  | "merchants"
  | "businesses"
  | "social"
  | "economy"
  | "protocols"
  | "experience"
  | "realito"
  | "ai"
  | "geolocation"
  | "tamv"
  | "tenochtitlan"
  | "audit";

/**
 * Política de mutación: por tenant + dominio + método.
 * Esto permite que la “constitución” evolucione sin tocar el middleware.
 */
export interface ConstitutionalPolicy {
  version: string;
  allowFullLedgerRead: boolean; // por si quieres linkear con DecisionStore
  allowedDomains: ReadonlySet<ApiDomain>;
  allowedMethodsPerDomain?: Partial<Record<ApiDomain, ReadonlySet<string>>>;
}

/**
 * Política por defecto: allowlist fuerte por dominio;
 * todos los métodos mutantes permitidos salvo override explícito.
 */
const DEFAULT_POLICY: ConstitutionalPolicy = {
  version: "domain-allowlist@v1",
  allowFullLedgerRead: false,
  allowedDomains: new Set<ApiDomain>([
    "auth",
    "profiles",
    "users",
    "donations",
    "merchants",
    "businesses",
    "social",
    "economy",
    "protocols",
    "experience",
    "realito",
    "ai",
    "geolocation",
    "tamv",
    "tenochtitlan",
    "audit",
  ]),
  allowedMethodsPerDomain: {
    // Ejemplo: dominio audit solo permite POST para registrar, no DELETE
    audit: new Set<Uppercase<string>>(["POST"]),
  },
};

function isSafeMethod(method: string): boolean {
  return SAFE_METHODS.has(method.toUpperCase() as Uppercase<string>);
}

function extractDomain(req: Request): string {
  // Asumimos /api/<domain>/... o /<domain>/...
  const segments = req.path.split("/").filter(Boolean);
  return segments[0] ?? "unknown";
}

function resolveTenantId(req: Request): string {
  // Punto único para multitenancy (header, JWT, etc.)
  // Puedes refinarlo luego (ej. req.auth.tenantId)
  return (req.headers["x-tenant-id"] as string | undefined) ?? "public";
}

function methodAllowedForDomain(
  method: string,
  domain: ApiDomain,
  policy: ConstitutionalPolicy,
): boolean {
  const upper = method.toUpperCase();
  const perDomain = policy.allowedMethodsPerDomain?.[domain];
  if (!perDomain) return true; // por defecto, si el dominio está permitido, todos los métodos mutantes lo están
  return perDomain.has(upper);
}

/**
 * Factory de middleware: inyectas política (y más adelante, quizá un DecisionStore).
 */
export function createConstitutionalGuard(
  policy: ConstitutionalPolicy = DEFAULT_POLICY,
) {
  return function constitutionalGuard(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    if (isSafeMethod(req.method)) return next();

    const rawDomain = extractDomain(req);
    const domain = rawDomain as ApiDomain;
    const tenantId = resolveTenantId(req);
    const method = req.method.toUpperCase();

    const domainAllowed = policy.allowedDomains.has(domain);
    const methodAllowed =
      domainAllowed && methodAllowedForDomain(method, domain, policy);

    if (!domainAllowed || !methodAllowed) {
      const violationKind = !domainAllowed
        ? "domain"
        : "method";

      emitMsrEvent({
        layer: "L5",
        category: "constitutional.denied",
        summary: `Mutación bloqueada (${violationKind}) en dominio: ${rawDomain}`,
        payload: {
          method,
          path: req.path,
          tenantId,
          policyVersion: policy.version,
          violationKind,
        },
      });

      return res.status(403).json({
        code: "CONSTITUTIONAL_VIOLATION",
        message: `Domain '${rawDomain}' is not authorized for ${method} operations`,
        policy: policy.version,
        tenantId,
      });
    }

    emitMsrEvent({
      layer: "L5",
      category: "constitutional.allowed",
      summary: `Mutación permitida en dominio: ${rawDomain}`,
      payload: {
        method,
        path: req.path,
        tenantId,
        policyVersion: policy.version,
      },
    });

    return next();
  };
}

// Singleton que puedes usar en tus rutas actuales sin refactor agresivo.
export const constitutionalGuard = createConstitutionalGuard();
