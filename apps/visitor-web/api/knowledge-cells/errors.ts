import { trackTelemetryEvent } from "../_shared/telemetry";

export enum TamvErrorCode {
  UNAUTHORIZED = "TAMV_ERR_UNAUTHORIZED",
  CELL_NOT_FOUND = "TAMV_ERR_CELL_NOT_FOUND",
  FEDERATION_TIMEOUT = "TAMV_ERR_FEDERATION_TIMEOUT",
  DB_QUERY_FAILED = "TAMV_ERR_DATABASE_FAILED",
  AI_GATEWAY_ERROR = "TAMV_ERR_AI_GATEWAY_FAILED",
  INTERNAL_FATAL = "TAMV_ERR_INTERNAL_FATAL",
}

export class TamvBaseError extends Error {
  public readonly code: TamvErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(code: TamvErrorCode, message: string, statusCode = 500, isOperational = true) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function handleTamvError(error: Error | TamvBaseError): Response {
  const isProd = process.env.NODE_ENV === "production";
  let statusCode = 500;
  let code = TamvErrorCode.INTERNAL_FATAL;
  let message = "Unexpected error in knowledge cell processing";

  if (error instanceof TamvBaseError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
  }

  trackTelemetryEvent(
    error instanceof TamvBaseError && error.isOperational ? "warn" : "error",
    "KNOWLEDGE_CELL_ERR",
    `${code}: ${message}`,
    undefined,
    { stack: isProd ? "[HIDDEN]" : error.stack, isOperational: error instanceof TamvBaseError ? error.isOperational : false },
  );

  return new Response(
    JSON.stringify({
      status: "error",
      error: {
        code,
        message: isProd && statusCode === 500 ? "Internal infrastructure error" : message,
        timestamp: new Date().toISOString(),
      },
    }),
    {
      status: statusCode,
      headers: { "Content-Type": "application/json", "X-Content-Type-Options": "nosniff" },
    },
  );
}
