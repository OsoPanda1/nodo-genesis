/* ================================================================== */
/* SERVER FN — Health check del core TAMV                             */
/* ================================================================== */

import { createServerFn } from "@tanstack/react-start";
import { busStats } from "../lib/events";

export const healthCheck = createServerFn({ method: "GET" }).handler(() => {
  const stats = busStats();
  return {
    status: "ok",
    service: "tamv-core",
    time: new Date().toISOString(),
    events: stats,
  };
});
