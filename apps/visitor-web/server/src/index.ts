import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import express, { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import apiRouter from "./routes/index.js";
import { config } from "./config.js";
import { errorHandler, notFoundHandler } from "./middleware/http.js";
import { constitutionalGuard } from "./middleware/constitutionalGuard.js";
import { createHardenedRateLimiter } from "./middleware/rateLimit.js";
import { logger } from "./lib/logger.js";

// Errores no capturados globales
process.on("unhandledRejection", (err) => { logger.error(err, "unhandled_rejection"); });
process.on("uncaughtException", (err) => { logger.fatal(err, "uncaught_exception"); process.exit(1); });

declare module "express-serve-static-core" {
  interface Request {
    id?: string;
    startedAt?: number;
    rawBody?: string;
  }
}

export const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

// Compresión
app.use(compression());

// Helmet (CSP desactivado para API; se gestiona en proxy)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

// Timeout global
app.use((_req, _res, next) => {
  _req.setTimeout(30000);
  _res.setTimeout(30000);
  next();
});

// Telemetría + logging centralizado
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = randomUUID();
  req.id = requestId;
  req.startedAt = Date.now();
  res.setHeader("X-Request-ID", requestId);

  res.on("finish", () => {
    const durationMs =
      typeof req.startedAt === "number" ? Date.now() - req.startedAt : undefined;
    logger.info({ requestId, method: req.method, path: req.originalUrl, statusCode: res.statusCode, durationMs, ip: req.ip, userAgent: req.get("user-agent") ?? undefined }, "http_request");
  });

  next();
});

// CORS
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (config.corsAllowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "X-Request-ID", "X-Real-IP", "X-Forwarded-For"],
    exposedHeaders: ["X-Request-ID"],
  }),
);

// Body parsers con límites estrictos
app.use(
  express.json({
    limit: "256kb",
    strict: true,
    verify: (req, _res, buf) => { req.rawBody = buf.toString("utf8"); },
  }),
);
app.use(express.urlencoded({ extended: false, limit: "256kb" }));

// Healthchecks
app.get("/healthz", (_req, res) => { res.json({ ok: true, service: "rdmx-api", uptime: process.uptime(), version: process.env.npm_package_version, node: process.version, timestamp: new Date().toISOString() }); });
app.get("/readyz", (_req, res) => { res.sendStatus(200); });
app.get("/livez", (_req, res) => { res.sendStatus(200); });

// Rate limit + guardas
app.use(
  "/api",
  createHardenedRateLimiter({ maxRequests: config.rateLimitMaxRequests, windowMs: config.rateLimitWindowMs, keyPrefix: "global-api" }),
  constitutionalGuard,
  apiRouter,
);

// 404 + error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Arranque y shutdown ordenado
export function startServer(port = config.port) {
  const server = app.listen(port, () => {
    logger.info({ port }, "rdm_backend_started");
  });

  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

  const shutdown = (signal: NodeJS.Signals) => {
    logger.warn({ signal }, "shutdown_signal_received");
    server.close((error) => {
      if (error) {
        logger.error({ error: String(error) }, "graceful_shutdown_error");
        process.exit(1);
      }
      logger.info("rdm_backend_stopped");
      process.exit(0);
    });
  };

  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);

  return server;
}

const isEntrypoint = process.argv[1] && process.argv[1].endsWith("index.js");
if (isEntrypoint) {
  startServer();
}
