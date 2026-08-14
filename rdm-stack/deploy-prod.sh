#!/bin/bash
set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  DEPLOY TO PRODUCTION                 ║${NC}"
echo -e "${BLUE}║  visitarealdelmonte.online            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"

cd "$(dirname "$0")"

# Usa docker compose o docker-compose, el que exista
COMPOSE="docker compose"
if ! docker compose version >/dev/null 2>&1; then
    COMPOSE="docker-compose"
fi

FILES="-f docker-compose.yml -f docker-compose.prod.yml"
ENV_FILE="--env-file .env.production"

# Verificar que el dominio está configurado
if ! grep -q "DOMAIN=visitarealdelmonte.online" .env.production; then
    echo -e "${RED}❌ Error: DOMAIN no está configurado en .env.production${NC}"
    exit 1
fi

# Detener servicios actuales
echo -e "${YELLOW}Deteniendo servicios actuales...${NC}"
$COMPOSE $FILES $ENV_FILE down

# Reconstruir todo
echo -e "${BLUE}Reconstruyendo imágenes...${NC}"
$COMPOSE $FILES $ENV_FILE build --parallel

# Iniciar servicios
echo -e "${GREEN}Iniciando servicios en producción...${NC}"
$COMPOSE $FILES $ENV_FILE up -d

# Esperar a que los servicios levanten
echo -e "${YELLOW}Esperando que los servicios estén saludables...${NC}"
sleep 15

# Verificar estado
echo -e "${BLUE}Verificando estado de servicios...${NC}"
$COMPOSE $FILES $ENV_FILE ps

# Test de conectividad
echo -e "${BLUE}Probando conectividad...${NC}"
if curl -s --head https://visitarealdelmonte.online | grep -q "HTTP/"; then
    echo -e "${GREEN}✅ Dominio principal accesible${NC}"
else
    echo -e "${RED}⚠️  Dominio principal NO responde (puede tardar en propagarse DNS)${NC}"
fi

if curl -s --head https://visitarealdelmonte.online/health | grep -q "HTTP/"; then
    echo -e "${GREEN}✅ Health check accesible${NC}"
else
    echo -e "${RED}⚠️  Health check NO responde${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ DEPLOYMENT COMPLETADO             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}URLs oficiales:${NC}"
echo -e "  🌐 Web: ${YELLOW}https://visitarealdelmonte.online${NC}"
echo -e "  🔧 Admin: ${YELLOW}https://visitarealdelmonte.online/admin${NC}"
echo -e "  🔌 API: ${YELLOW}https://visitarealdelmonte.online/api${NC}"
