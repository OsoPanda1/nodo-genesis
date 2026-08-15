import { getSupabaseClient } from './bootstrap';
import { trackTelemetryEvent } from '../_shared/telemetry';

let isSyncing = false;
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function executeAutonomousSync(): Promise<boolean> {
  if (isSyncing) {
    console.log('[AUTONOMA] Sincronización en curso omitida para evitar colisión de estados.');
    return false;
  }

  isSyncing = true;
  const startTime = Date.now();
  console.log('[AUTONOMA] Iniciando ciclo de sincronización inter-federada...');

  try {
    const supabase = getSupabaseClient();

    const { data: cells, error } = await supabase
      .from('territorial_cells')
      .select('id, federation_id, metadata')
      .eq('sync_status', 'pending')
      .limit(10);

    if (error) throw error;

    if (!cells || cells.length === 0) {
      console.log('[AUTONOMA] Todas las celdas de las 7 federaciones están sincronizadas y estables.');
      isSyncing = false;
      return true;
    }

    for (const cell of cells) {
      let attempt = 0;
      let success = false;
      let currentBackoff = INITIAL_BACKOFF_MS;

      while (attempt < MAX_RETRIES && !success) {
        try {
          console.log(`[AUTONOMA] Sincronizando celda ${cell.id} (Federación ${cell.federation_id}) - Intento ${attempt + 1}`);

          const { error: updateError } = await supabase
            .from('territorial_cells')
            .update({
              sync_status: 'synchronized',
              updated_at: new Date().toISOString()
            })
            .eq('id', cell.id);

          if (updateError) throw updateError;

          success = true;
        } catch (retryError: any) {
          attempt++;
          console.warn(`[AUTONOMA WARNING] Error en celda ${cell.id}. Reintentando en ${currentBackoff}ms...`);
          await delay(currentBackoff);
          currentBackoff *= 2;
        }
      }

      if (!success) {
        trackTelemetryEvent(
          'error',
          'AUTONOMA_SYNC',
          `No se pudo sincronizar la celda ${cell.id} tras ${MAX_RETRIES} intentos.`,
          undefined,
          { cellId: cell.id, federationId: cell.federation_id }
        );
      }
    }

    const duration = Date.now() - startTime;
    trackTelemetryEvent('info', 'AUTONOMA_SYNC', 'Sincronización autónoma completada con éxito.', duration);
    return true;

  } catch (error: any) {
    console.error('CRITICAL: Fallo catastrófico en el hilo autónomo de sincronización ->', error.message);
    trackTelemetryEvent('error', 'AUTONOMA_CRITICAL', error.message);
    return false;
  } finally {
    isSyncing = false;
  }
}
