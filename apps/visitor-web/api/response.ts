let requestCounter = 0;

function nextRequestId(): string {
  requestCounter++;
  return `req_${Date.now().toString(36)}_${requestCounter}`;
}

function nextTraceId(): string {
  return `trace_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export interface ResponseMeta {
  requestId: string;
  traceId: string;
  timestamp: string;
  [key: string]: unknown;
}

function buildMeta(extra?: Record<string, unknown>): ResponseMeta {
  return {
    requestId: nextRequestId(),
    traceId: nextTraceId(),
    timestamp: new Date().toISOString(),
    ...extra,
  };
}

export function success<T>(data: T, meta?: Record<string, unknown>) {
  return {
    success: true,
    data,
    meta: buildMeta(meta),
  };
}

export function error(code: string, message: string, meta?: Record<string, unknown>) {
  return {
    success: false,
    error: { code, message },
    meta: buildMeta(meta),
  };
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
  meta?: Record<string, unknown>,
) {
  return {
    success: true,
    data,
    pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    meta: buildMeta(meta),
  };
}

export function jsonResponse(data: unknown, status = 200, headers?: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

export function jsonError(
  err: { code: string; message: string; statusCode?: number },
  meta?: Record<string, unknown>,
) {
  return jsonResponse(error(err.code, err.message, meta), err.statusCode || 500);
}
