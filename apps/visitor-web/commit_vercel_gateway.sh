#!/bin/bash

# =================================================================
# SCRIPT DE COMMIT ROBUSTO — Vercel AI Gateway en YUN
# =================================================================

# 1. Configuración de seguridad:
# -e: Salir inmediatamente si un comando falla
# -u: Salir si se intenta usar una variable no definida
# -o pipefail: Captura errores dentro de tuberías (pipes)
set -euo pipefail

# Colores para feedback visual
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Iniciando proceso de commit robusto ===${NC}"

# 2. Validación: Verificar que estamos en un repo Git
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo -e "${RED}Error: No estás en un repositorio Git válido.${NC}"
    exit 1
fi

# 3. Definición de archivos (gestión más limpia mediante array)
FILES_TO_ADD=(
  "supabase/functions/_shared/vercel-ai-gateway.ts"
  "supabase/functions/isabella-ai/index.ts"
  "supabase/functions/realito-chat/index.ts"
  "api/model-router.ts"
  "server/src/services/protocol/sovereign.engine.ts"
  "ai-text-demo/index.ts"
  ".env.example"
)

# 4. Staging
echo -e "${GREEN}Realizando staging de archivos...${NC}"
git add "${FILES_TO_ADD[@]}"

# 5. Verificación de cambios (evita commits vacíos innecesarios)
if git diff --cached --quiet; then
    echo -e "${YELLOW}Aviso: No hay cambios nuevos en los archivos especificados. Nada que commitear.${NC}"
    exit 0
fi

# 6. Commit
echo -e "${GREEN}Creando commit...${NC}"
git commit -m "feat: Implement Vercel AI Gateway en todas las capas

- Nuevo shared client vercel-ai-gateway.ts con callGatewayChat y callGatewayMessages
- isabella-ai: Vercel AI Gateway → Model Router → Gemini → builtin
- realito-chat: Vercel AI Gateway → Model Router → Gemini → builtin
- api/model-router: Vercel AI Gateway → HuggingFace → OpenLLM
- server/sovereign.engine: Vercel AI Gateway → Encrypted Gateway
- ai-text-demo: soporta Vercel AI Gateway + OpenAI
- .env.example: seccion VERCEL_AI_GATEWAY_*

Fallback chain: VERCEL_AI_GATEWAY_URL > MODEL_ROUTER_URL > GEMINI_API_KEY > builtin"

# 7. Push dinámico (detecta la rama automáticamente)
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${GREEN}Pushing a remote (origin/${CURRENT_BRANCH})...${NC}"
git push origin "$CURRENT_BRANCH"

echo -e "${GREEN}=== Proceso finalizado exitosamente ===${NC}"
