#!/usr/bin/env bash
set -euo pipefail

# Config: lista de nodos por federacion (URL de health)
declare -A FED_NODES

FED_NODES["F1"]="http://f1-commerce.local/health http://f1-node2.local/health"
FED_NODES["F2"]="http://f2-tourism.local/health"
FED_NODES["F3"]="http://f3-academia.local/health"
FED_NODES["F4"]="http://f4-governance.local/health"
FED_NODES["F5"]="http://f5-infra.local/health"
FED_NODES["F6"]="http://f6-community.local/health"
FED_NODES["F7"]="http://f7-metaverse.local/health"

echo "== YUN Heptafederation Nodes Validation =="

overall_fail=0

for fed in "${!FED_NODES[@]}"; do
  echo "Federacion $fed"
  for url in ${FED_NODES[$fed]}; do
    echo "  Checking $url ..."
    if curl -s --max-time 5 "$url" | grep -qi "ok"; then
      echo "  [OK] $url"
    else
      echo "  [FAIL] $url"
      overall_fail=$((overall_fail+1))
    fi
  done
done

echo "== Resumen =="
if [[ $overall_fail -gt 0 ]]; then
  echo "Nodos con fallo: $overall_fail"
  exit 1
else
  echo "Todos los nodos respondieron OK"
fi
