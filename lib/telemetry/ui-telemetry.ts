import {
  recordTelemetry,
  setTelemetryTransport,
  type TelemetryTransport,
} from '@/lib/core/telemetry';
import type {
  TelemetryLevel,
  TelemetryScope,
} from '@/lib/core/contracts/telemetry';

export type UIErrorLevel = TelemetryLevel;

export interface UIErrorPayload {
  level: UIErrorLevel;
  source: string;
  message: string;
  event?: string;
  scope?: TelemetryScope;
  route?: string;
  traceId?: string;
  requestId?: string;
  sessionId?: string;
  userId?: string;
  details?: Record<string, unknown>;
  timestamp?: string;
}

type UITelemetryTransport = (payload: UIErrorPayload) => void;

export function setUITelemetryTransport(
  transport: UITelemetryTransport | null,
): void {
  if (!transport) {
    setTelemetryTransport(null);
    return;
  }

  const adapter: TelemetryTransport = (event) => {
    transport({
      level: event.level,
      source: event.source,
      message: event.message,
      event: event.event,
      scope: event.scope,
      route: event.route,
      traceId: event.traceId,
      requestId: event.requestId,
      sessionId: event.sessionId,
      userId: event.userId,
      details: event.details,
      timestamp: event.occurredAt,
    });
  };

  setTelemetryTransport(adapter);
}

export function logUIError(payload: UIErrorPayload): void {
  recordTelemetry({
    level: payload.level,
    scope: payload.scope ?? 'ui',
    source: payload.source,
    event: payload.event ?? 'ui.event',
    message: payload.message,
    route: payload.route,
    traceId: payload.traceId,
    requestId: payload.requestId,
    sessionId: payload.sessionId,
    userId: payload.userId,
    details: payload.details,
  });
}

export const uiTelemetry = {
  debug: (
    source: string,
    message: string,
    details?: Record<string, unknown>,
  ) => logUIError({ level: 'debug', source, message, details }),

  info: (
    source: string,
    message: string,
    details?: Record<string, unknown>,
  ) => logUIError({ level: 'info', source, message, details }),

  warn: (
    source: string,
    message: string,
    details?: Record<string, unknown>,
  ) => logUIError({ level: 'warn', source, message, details }),

  error: (
    source: string,
    message: string,
    details?: Record<string, unknown>,
  ) => logUIError({ level: 'error', source, message, details }),
};

export default uiTelemetry;
