type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  level: LogLevel;
  message: string;
  traceId?: string;
  data?: Record<string, unknown>;
  error?: Error | unknown;
}

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ||
  (process.env.NODE_ENV === "development" ? "debug" : "info");

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[currentLevel];
}

function formatPayload(p: LogPayload): Record<string, unknown> {
  return {
    level: p.level,
    message: p.message,
    timestamp: new Date().toISOString(),
    traceId: p.traceId,
    ...(p.data ? { data: p.data } : {}),
    ...(p.error
      ? {
          error:
            p.error instanceof Error
              ? { message: p.error.message, stack: p.error.stack, name: p.error.name }
              : String(p.error),
        }
      : {}),
  };
}

export const logger = {
  debug(message: string, data?: Record<string, unknown>): void {
    if (!shouldLog("debug")) return;
    const payload = formatPayload({ level: "debug", message, data });
    if (typeof process?.stdout?.write === "function") {
      process.stdout.write(JSON.stringify(payload) + "\n");
    }
  },

  info(message: string, data?: Record<string, unknown>): void {
    if (!shouldLog("info")) return;
    const payload = formatPayload({ level: "info", message, data });
    if (typeof process?.stdout?.write === "function") {
      process.stdout.write(JSON.stringify(payload) + "\n");
    }
  },

  warn(message: string, data?: Record<string, unknown>): void {
    if (!shouldLog("warn")) return;
    const payload = formatPayload({ level: "warn", message, data });
    if (typeof process?.stderr?.write === "function") {
      process.stderr.write(JSON.stringify(payload) + "\n");
    }
  },

  error(message: string, error?: unknown, data?: Record<string, unknown>): void {
    if (!shouldLog("error")) return;
    const payload = formatPayload({ level: "error", message, error, data });
    if (typeof process?.stderr?.write === "function") {
      process.stderr.write(JSON.stringify(payload) + "\n");
    }
  },

  child(context: Record<string, unknown>): typeof logger {
    const childLogger = { ...logger };
    const originalInfo = childLogger.info;
    const originalWarn = childLogger.warn;
    const originalError = childLogger.error;
    const originalDebug = childLogger.debug;

    childLogger.debug = (message: string, data?: Record<string, unknown>) =>
      originalDebug(message, { ...context, ...data });
    childLogger.info = (message: string, data?: Record<string, unknown>) =>
      originalInfo(message, { ...context, ...data });
    childLogger.warn = (message: string, data?: Record<string, unknown>) =>
      originalWarn(message, { ...context, ...data });
    childLogger.error = (message: string, error?: unknown, data?: Record<string, unknown>) =>
      originalError(message, error, { ...context, ...data });

    return childLogger;
  },
};

export type Logger = typeof logger;
