import express from "express";
import crypto from "node:crypto";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const app = express();
app.use(express.json({ limit: "256kb" }));

const execAsync = promisify(exec);

const ALERTMANAGER_SECRET = process.env.ALERTMANAGER_SECRET ?? "";
const ROLLBACK_SCRIPT = process.env.ROLLBACK_SCRIPT ?? "/opt/rdmx/scripts/rollback_last_release.sh";

// Alertas que disparan rollback automático
const ROLLBACK_ALERTS = new Set<string>(["HighFallbackRate", "HighLatencyP95"]);

// Evita tormentas de rollbacks
let lastRollbackAt = 0;
const MIN_ROLLBACK_INTERVAL_MS = 5 * 60 * 1000; // 5 min

function verifySignature(req: express.Request): boolean {
  if (!ALERTMANAGER_SECRET) return false;

  const signature = req.header("X-RDMX-Signature") ?? "";
  if (!signature) return false;

  const payload = JSON.stringify(req.body ?? {});
  const hmac = crypto.createHmac("sha256", ALERTMANAGER_SECRET).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmac));
}

function extractAlertNames(body: unknown): string[] {
  if (
    !body ||
    typeof body !== "object" ||
    !Array.isArray((body as any).alerts)
  ) {
    return [];
  }

  return (body as any).alerts
    .map(
      (alert: any) =>
        alert?.labels?.alertname as string | undefined,
    )
    .filter((name: string | undefined): name is string => !!name);
}

async function runRollback(): Promise<{ ok: boolean; error?: string }> {
  const now = Date.now();
  const sinceLast = now - lastRollbackAt;
  if (sinceLast < MIN_ROLLBACK_INTERVAL_MS) {
    const msg = `Rollback throttled: last rollback ${Math.round(
      sinceLast / 1000,
    )}s ago`;
    console.warn(msg);
    return { ok: false, error: msg };
  }

  try {
    console.log(`[AutoRemediate] Executing rollback: ${ROLLBACK_SCRIPT}`);
    const { stdout, stderr } = await execAsync(ROLLBACK_SCRIPT, {
      timeout: 5 * 60 * 1000, // 5 min
      maxBuffer: 10 * 1024 * 1024, // 10 MB
    });

    if (stdout) console.log(`[AutoRemediate][rollback][stdout] ${stdout}`);
    if (stderr) console.warn(`[AutoRemediate][rollback][stderr] ${stderr}`);

    lastRollbackAt = Date.now();
    console.log("[AutoRemediate] Rollback completed successfully");

    return { ok: true };
  } catch (error: any) {
    console.error(
      "[AutoRemediate] Rollback failed",
      error?.stderr || error?.message || error,
    );
    return { ok: false, error: error?.message ?? "rollback_failed" };
  }
}

// Healthcheck para kube/systemd
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", lastRollbackAt });
});

// Webhook de Alertmanager
app.post("/alerts", async (req, res) => {
  const alertNames = extractAlertNames(req.body);
  const hasRollbackTrigger = alertNames.some((name) =>
    ROLLBACK_ALERTS.has(name),
  );

  const meta = {
    alerts: alertNames,
    hasRollbackTrigger,
    source: "alertmanager",
  };

  // Autenticación básica del webhook
  if (!verifySignature(req)) {
    console.warn("[AutoRemediate] Invalid signature", meta);
    return res.status(401).json({ status: "unauthorized" });
  }

  console.log("[AutoRemediate] Alert batch received", meta);

  if (!hasRollbackTrigger) {
    // Aún así respondemos 200 para que Alertmanager no reintente
    return res.status(200).json({ status: "ignored", ...meta });
  }

  const result = await runRollback();
  if (result.ok) {
    return res.status(200).json({ status: "rollback_executed", ...meta });
  }

  // Importante: responder 200 aunque falle rollback, para no entrar en bucles locos
  return res
    .status(200)
    .json({ status: "rollback_failed", error: result.error, ...meta });
});

const port = Number(process.env.PORT ?? 8081);

app.listen(port, () => {
  console.log(`AutoRemediate escuchando en :${port}`);
});
