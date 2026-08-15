import type { NextFunction, Response } from "express";
import { verifyToken, extractBearerToken } from "../lib/auth-core.js";
import type { AuthenticatedRequest } from "../types/auth.js";

export { signToken } from "../lib/auth-core.js";

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ error: "TOKEN_REQUIRED" });
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: "INVALID_TOKEN" });
  }
}

export function requireRole(role: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: "INSUFFICIENT_ROLE" });
    }
    return next();
  };
}
