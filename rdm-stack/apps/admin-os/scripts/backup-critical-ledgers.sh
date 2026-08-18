#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL is required}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$BACKUP_DIR"

pg_dump "$DATABASE_URL" \
  --format=custom \
  --file "$BACKUP_DIR/tamv-critical-ledgers-$STAMP.dump" \
  --table tamv_event_store \
  --table tamv_event_dead_letter \
  --table tamv_stream_snapshot \
  --table cattleya_payment_ledger

echo "backup ready: $BACKUP_DIR/tamv-critical-ledgers-$STAMP.dump"
