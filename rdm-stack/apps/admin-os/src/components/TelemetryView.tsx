import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Wifi, Cpu, HardDrive, BarChart3 } from "lucide-react";

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function TelemetryView() {
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTicks((t) => t + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  const data = {
    requests: randomBetween(80, 200),
    avgLatency: randomBetween(60, 150),
    meshNodes: 12,
    meshOnline: randomBetween(9, 12),
    cpuUsage: randomBetween(15, 45),
    memoryUsage: randomBetween(30, 65),
    bandwidth: randomBetween(12, 48),
  };

  const card = "bg-card border border-border rounded-xl p-4";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold tracking-tight">Telemetría</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitoreo de infraestructura y red territorial mesh
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Requests/min", value: data.requests, icon: BarChart3, color: "text-accent" },
          { label: "Latencia Avg", value: `${data.avgLatency}ms`, icon: Activity, color: "text-success" },
          { label: "CPU", value: `${data.cpuUsage}%`, icon: Cpu, color: "text-secondary" },
          { label: "Memoria", value: `${data.memoryUsage}%`, icon: HardDrive, color: "text-accent" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={card}
          >
            <item.icon className={`w-4 h-4 ${item.color} mb-2`} />
            <p className="text-xl font-semibold font-body">{item.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Mesh Network */}
      <div className={card}>
        <div className="flex items-center gap-2 mb-4">
          <Wifi className="w-4 h-4 text-accent" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Red Mesh Territorial — {data.meshOnline}/{data.meshNodes} nodos online
          </p>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
          {Array.from({ length: data.meshNodes }).map((_, i) => {
            const isOnline = i < data.meshOnline;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-lg border ${
                  isOnline ? "bg-success/10 border-success/30" : "bg-muted border-border"
                } flex items-center justify-center`}>
                  <Wifi className={`w-4 h-4 ${isOnline ? "text-success" : "text-muted-foreground"}`} />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">N-{String(i + 1).padStart(2, "0")}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Log */}
      <div className={card}>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Log en Tiempo Real
        </p>
        <div className="bg-primary rounded-lg p-3 font-mono text-xs text-primary-foreground/80 space-y-1 max-h-48 overflow-y-auto">
          {[
            `[${new Date().toISOString()}] kernel.intent → gastronomia (conf: 0.94)`,
            `[${new Date().toISOString()}] mesh.node.N-03 → heartbeat OK`,
            `[${new Date().toISOString()}] api.places.query → 10 results (${data.avgLatency}ms)`,
            `[${new Date().toISOString()}] kernel.intent → historia (conf: 0.91)`,
            `[${new Date().toISOString()}] mesh.bandwidth → ${data.bandwidth}MB/s`,
            `[${new Date().toISOString()}] cache.hit → places_index (TTL: 300s)`,
            `[${new Date().toISOString()}] kernel.narrative → generated (cultura)`,
          ].map((log, i) => (
            <p key={i} className="opacity-80">{log}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
