#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-.}"

echo "== YUN v1.0 Audit (baseline) =="

# 1. Archivos de docs basicos
declare -a FILES=(
  "docs/yun/00-manifesto.md"
  "docs/yun/01-constitution.md"
  "docs/yun/02-governance.md"
  "docs/yun/03-blueprint.md"
  "docs/yun/04-security-data-standards.md"
  "docs/yun/05-operations-manual.md"
  "docs/yun/06-event-standard.md"
  "docs/yun/07-adr-index.md"
  "docs/yun/08-isabella-layer.md"
  "docs/yun/09-isa-api-contracts.md"
  "docs/yun/rfc/RFC-0001-YUN-System-Constitutional-Spec.md"
  "docs/yun/audits/yun_audit_checklist.csv"
)

missing=0
for f in "${FILES[@]}"; do
  if [[ -f "$ROOT_DIR/$f" ]]; then
    echo "[OK] $f"
  else
    echo "[MISSING] $f"
    missing=$((missing+1))
  fi
done

# 2. ISA-API OpenAPI
if [[ -f "$ROOT_DIR/docs/isa-api/openapi-v1.0.yaml" ]]; then
  echo "[OK] ISA-API openapi-v1.0.yaml"
  if grep -q "x-yun-domain" "$ROOT_DIR/docs/isa-api/openapi-v1.0.yaml"; then
    echo "[OK] ISA-API incluye x-yun-domain"
  else
    echo "[WARN] ISA-API no incluye x-yun-domain"
  fi
else
  echo "[MISSING] docs/isa-api/openapi-v1.0.yaml"
  missing=$((missing+1))
fi

# 3. Checklist CSV contiene IDs criticos
if [[ -f "$ROOT_DIR/docs/yun/audits/yun_audit_checklist.csv" ]]; then
  if grep -q "C-01" "$ROOT_DIR/docs/yun/audits/yun_audit_checklist.csv"; then
    echo "[OK] Checklist contiene C-01"
  fi
  if grep -q "EV-01" "$ROOT_DIR/docs/yun/audits/yun_audit_checklist.csv"; then
    echo "[OK] Checklist contiene EV-01"
  fi
else
  echo "[MISSING] yun_audit_checklist.csv (ya reportado arriba)"
fi

echo "== Resumen =="
if [[ $missing -gt 0 ]]; then
  echo "Archivos faltantes: $missing"
  exit 1
else
  echo "Baseline YUN v1.0 OK (docs y especificaciones presentes)"
fi
