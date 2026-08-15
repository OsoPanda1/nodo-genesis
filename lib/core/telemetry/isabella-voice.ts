import type { TelemetryScope } from '@/lib/core/contracts/telemetry';
import {
  createTelemetryLogger,
  type RecordTelemetryInput,
} from './index';

export const ISABELLA_VOICE_TELEMETRY_EVENTS = [
  'isabella.voice.requested',
  'isabella.voice.cache_hit',
  'isabella.voice.generated',
  'isabella.voice.playback_started',
  'isabella.voice.playback_completed',
  'isabella.voice.cancelled',
  'isabella.voice.fallback',
  'isabella.voice.rate_limited',
  'isabella.voice.failed',
] as const;

export type IsabellaVoiceTelemetryEvent =
  (typeof ISABELLA_VOICE_TELEMETRY_EVENTS)[number];

export type IsabellaVoiceTelemetryMode = 'cloud' | 'local' | 'text';

export interface IsabellaVoiceTelemetryDetails {
  profile?: string;
  mode?: IsabellaVoiceTelemetryMode;
  provider?: string;
  providerVoiceId?: string;
  voiceVersion?: string;
  federationId?: string;
  cacheKey?: string;
  cacheHit?: boolean;
  latencyMs?: number;
  durationMs?: number;
  queueDepth?: number;
  failureCode?: string;
  reason?: string;
  [key: string]: unknown;
}

export interface RecordIsabellaVoiceTelemetryInput {
  event: IsabellaVoiceTelemetryEvent;
  level?: RecordTelemetryInput['level'];
  message: string;
  route?: string;
  traceId?: string;
  requestId?: string;
  sessionId?: string;
  userId?: string;
  scope?: TelemetryScope;
  details?: IsabellaVoiceTelemetryDetails;
}

const defaultVoiceLogger = createTelemetryLogger('isabella.voice', 'isabella');

function resolveLevel(
  event: IsabellaVoiceTelemetryEvent,
  providedLevel?: RecordTelemetryInput['level'],
): RecordTelemetryInput['level'] {
  if (providedLevel) {
    return providedLevel;
  }

  if (event === 'isabella.voice.failed') {
    return 'error';
  }

  if (
    event === 'isabella.voice.fallback' ||
    event === 'isabella.voice.rate_limited'
  ) {
    return 'warn';
  }

  return 'info';
}

/**
 * Registra eventos propios de la voz de Isabella dentro del contrato
 * general de telemetría del Nodo Cero.
 */
export function recordIsabellaVoiceTelemetry(
  input: RecordIsabellaVoiceTelemetryInput,
) {
  const log =
    input.scope
      ? createTelemetryLogger('isabella.voice', input.scope)
      : defaultVoiceLogger;

  return log({
    level: resolveLevel(input.event, input.level),
    event: input.event,
    message: input.message,
    route: input.route,
    traceId: input.traceId,
    requestId: input.requestId,
    sessionId: input.sessionId,
    userId: input.userId,
    details: input.details,
  });
}

/**
 * Eventos convenientes para el ciclo completo de generación de voz.
 */
export const isabellaVoiceTelemetry = {
  requested(input: Omit<RecordIsabellaVoiceTelemetryInput, 'event' | 'message'> & {
    message?: string;
  }) {
    return recordIsabellaVoiceTelemetry({
      ...input,
      event: 'isabella.voice.requested',
      message: input.message ?? 'Solicitud de voz de Isabella recibida.',
    });
  },

  cacheHit(input: Omit<RecordIsabellaVoiceTelemetryInput, 'event' | 'message'> & {
    message?: string;
  }) {
    return recordIsabellaVoiceTelemetry({
      ...input,
      event: 'isabella.voice.cache_hit',
      message: input.message ?? 'Audio de Isabella servido desde caché.',
    });
  },

  generated(input: Omit<RecordIsabellaVoiceTelemetryInput, 'event' | 'message'> & {
    message?: string;
  }) {
    return recordIsabellaVoiceTelemetry({
      ...input,
      event: 'isabella.voice.generated',
      message: input.message ?? 'Audio de Isabella generado correctamente.',
    });
  },

  playbackStarted(
    input: Omit<RecordIsabellaVoiceTelemetryInput, 'event' | 'message'> & {
      message?: string;
    },
  ) {
    return recordIsabellaVoiceTelemetry({
      ...input,
      event: 'isabella.voice.playback_started',
      message: input.message ?? 'Reproducción de Isabella iniciada.',
    });
  },

  playbackCompleted(
    input: Omit<RecordIsabellaVoiceTelemetryInput, 'event' | 'message'> & {
      message?: string;
    },
  ) {
    return recordIsabellaVoiceTelemetry({
      ...input,
      event: 'isabella.voice.playback_completed',
      message: input.message ?? 'Reproducción de Isabella completada.',
    });
  },

  cancelled(input: Omit<RecordIsabellaVoiceTelemetryInput, 'event' | 'message'> & {
    message?: string;
  }) {
    return recordIsabellaVoiceTelemetry({
      ...input,
      event: 'isabella.voice.cancelled',
      message: input.message ?? 'Reproducción de Isabella cancelada.',
    });
  },

  fallback(input: Omit<RecordIsabellaVoiceTelemetryInput, 'event' | 'message'> & {
    message?: string;
  }) {
    return recordIsabellaVoiceTelemetry({
      ...input,
      event: 'isabella.voice.fallback',
      message:
        input.message ??
        'Isabella degradó a un modo de voz alternativo.',
    });
  },

  rateLimited(
    input: Omit<RecordIsabellaVoiceTelemetryInput, 'event' | 'message'> & {
      message?: string;
    },
  ) {
    return recordIsabellaVoiceTelemetry({
      ...input,
      event: 'isabella.voice.rate_limited',
      message:
        input.message ??
        'La solicitud de voz de Isabella superó el límite temporal.',
    });
  },

  failed(input: Omit<RecordIsabellaVoiceTelemetryInput, 'event' | 'message'> & {
    message?: string;
  }) {
    return recordIsabellaVoiceTelemetry({
      ...input,
      event: 'isabella.voice.failed',
      message: input.message ?? 'La síntesis o reproducción de Isabella falló.',
    });
  },
};
