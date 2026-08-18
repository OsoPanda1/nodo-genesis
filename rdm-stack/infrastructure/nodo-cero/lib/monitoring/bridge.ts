/* ================================================================== */
/* MONITORING · Puente bus YUN → correlator                           */
/* ================================================================== */
/* Conecta el bus unificado al correlator del monitor (unidireccional):
/*   bus YUN (api.route.*, city.*, isabella, gameplay...) → monitor.   */
/*                                                                     */
/* Los eventos propios del monitor (monitor.*) NO se reinyectan para    */
/* evitar un lazo infinito (el correlator ya refleja sus emisiones al   */
/* bus vía lib/monitoring/events.ts).                                  */
/* ================================================================== */

import { subscribe } from '@/lib/core/events';
import { monitor } from './monitor';

let unsub: (() => void) | null = null;

/** Activa la suscripción global (idempotente). Solo desde código de
 *  servidor: importa node:async_hooks vía @/lib/core/events. */
export function wireMonitorToUnifiedBus(): void {
  if (unsub) return;
  unsub = subscribe(event => {
    if (event.type.startsWith('monitor.')) return;
    monitor.events.emit(event.type, event.source, event.severity, event.data);
  });
}

/** Reinicia el puente (para tests: resetBusForTests limpia los
 *  listeners del bus, dejando obsoleto el unsubscribe guardado). */
export function resetMonitorBridgeForTests(): void {
  unsub = null;
}
