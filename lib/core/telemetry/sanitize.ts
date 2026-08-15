const REDACTED_KEY_PARTS = [
  'authorization',
  'api_key',
  'apikey',
  'token',
  'cookie',
  'password',
  'secret',
  'private_key',
  'access_key',
  'refresh_key',
  'credential',
];

const MAX_DEPTH = 5;
const MAX_ARRAY_ITEMS = 30;
const MAX_OBJECT_KEYS = 40;
const MAX_STRING_LENGTH = 1_000;

function isSensitiveKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[-\s]/g, '_');

  return REDACTED_KEY_PARTS.some((part) => normalized.includes(part));
}

function truncate(value: string): string {
  return value.length > MAX_STRING_LENGTH
    ? `${value.slice(0, MAX_STRING_LENGTH)}…[truncated]`
    : value;
}

export function sanitizeTelemetryValue(
  value: unknown,
  depth = 0,
  seen = new WeakSet<object>(),
): unknown {
  if (depth > MAX_DEPTH) {
    return '[max-depth]';
  }

  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'string'
  ) {
    return typeof value === 'string' ? truncate(value) : value;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : '[non-finite-number]';
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (typeof value === 'undefined') {
    return '[undefined]';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: truncate(value.message),
      ...(process.env.NODE_ENV === 'development' && value.stack
        ? { stack: truncate(value.stack) }
        : {}),
    };
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_ARRAY_ITEMS)
      .map((item) => sanitizeTelemetryValue(item, depth + 1, seen));
  }

  if (typeof value !== 'object') {
    return truncate(String(value));
  }

  if (seen.has(value)) {
    return '[circular]';
  }

  seen.add(value);

  const output: Record<string, unknown> = {};

  for (const [key, item] of Object.entries(value).slice(0, MAX_OBJECT_KEYS)) {
    output[key] = isSensitiveKey(key)
      ? '[redacted]'
      : sanitizeTelemetryValue(item, depth + 1, seen);
  }

  return output;
}

export function sanitizeTelemetryDetails(
  details?: Record<string, unknown>,
): Record<string, unknown> {
  if (!details) return {};

  const sanitized = sanitizeTelemetryValue(details);

  return sanitized &&
    typeof sanitized === 'object' &&
    !Array.isArray(sanitized)
    ? (sanitized as Record<string, unknown>)
    : {};
}
