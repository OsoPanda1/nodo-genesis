import jwt, { type JwtPayload, type Secret, type SignOptions } from "jsonwebtoken";
import { config } from "../config.js";
import type { AuthUser } from "../types/auth.js";

export interface AuthToken extends JwtPayload {
  sub: string;
  role: AuthUser["role"];
}

export const JWT_VERIFY_OPTIONS: jwt.VerifyOptions = {
  algorithms: ["HS256"],
  issuer: config.jwtIssuer,
  audience: config.jwtAudience,
  clockTolerance: 5,
};

export const JWT_SIGN_OPTIONS: SignOptions = {
  algorithm: "HS256",
  issuer: config.jwtIssuer,
  audience: config.jwtAudience,
  expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
};

export function signToken(user: AuthUser): string {
  return jwt.sign({ role: user.role }, config.jwtSecret as Secret, {
    ...JWT_SIGN_OPTIONS,
    subject: user.id,
    jwtid: crypto.randomUUID(),
  });
}

export function isAuthToken(payload: string | JwtPayload): payload is AuthToken {
  return typeof payload !== "string" && typeof payload.sub === "string" && typeof payload.role === "string";
}

export function verifyToken(token: string): AuthToken {
  const payload = jwt.verify(token, config.jwtSecret, JWT_VERIFY_OPTIONS);
  if (!isAuthToken(payload)) {
    throw new Error("INVALID_TOKEN_PAYLOAD");
  }
  return payload;
}

export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}
