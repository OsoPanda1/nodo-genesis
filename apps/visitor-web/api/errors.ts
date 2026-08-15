export class ApplicationError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly retryable: boolean;
  public readonly ref: string;

  constructor(code: string, message: string, statusCode = 500, retryable = false) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.retryable = retryable;
    this.ref = `err_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }

  toJSON() {
    return {
      error: { code: this.code, message: this.message, ref: this.ref },
    };
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string) {
    super("VALIDATION_ERROR", message, 400);
  }
}

export class AuthenticationError extends ApplicationError {
  constructor(message = "Authentication required") {
    super("AUTHENTICATION_ERROR", message, 401);
  }
}

export class AuthorizationError extends ApplicationError {
  constructor(message = "Insufficient permissions") {
    super("AUTHORIZATION_ERROR", message, 403);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message = "Resource not found") {
    super("NOT_FOUND", message, 404);
  }
}

export class NetworkError extends ApplicationError {
  constructor(message: string, retryable = true) {
    super("NETWORK_ERROR", message, 502, retryable);
  }
}

export class ProviderError extends ApplicationError {
  constructor(provider: string, message: string, retryable = true) {
    super(`PROVIDER_ERROR:${provider}`, message, 502, retryable);
  }
}

export class AIError extends ApplicationError {
  constructor(message: string, retryable = false) {
    super("AI_ERROR", message, 500, retryable);
  }
}

export class RateLimitError extends ApplicationError {
  public readonly retryAfter: number;

  constructor(retryAfter: number) {
    super("RATE_LIMIT_EXCEEDED", "Too many requests", 429);
    this.retryAfter = retryAfter;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
    };
  }
}
