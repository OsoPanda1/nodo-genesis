#!/bin/bash

# Colores para la terminal
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}Iniciando unificación de RDM Sovereign Stack...${NC}"

# 1. Crear estructura de directorios
mkdir -p rdm-stack/{apps,services,infrastructure,gateway}
cd rdm-stack

# 2. Clonar los repositorios en sus capas correspondientes
echo -e "${GREEN}Clonando componentes...${NC}"
git clone https://github.com/TAMV-ONLINE-NET/tamv-core.git services/core
git clone https://github.com/OsoPanda1/visitarealdelmonte.git apps/visitor-web
git clone https://github.com/OsoPanda1/rdm-smart-city-os.git apps/admin-os
git clone https://github.com/OsoPanda1/nodo-cero.git infrastructure/nodo-cero

# 3. Crear archivo de variables de entorno unificado
echo -e "${GREEN}Configurando variables de entorno...${NC}"
cat <<EOF > .env
# Global Config
PROJECT_NAME=RDM_SOVEREIGN
DOMAIN=rdm.local

# API Core
CORE_PORT=8000
DATABASE_URL=mongodb://mongo:27017/tamv_db

# Apps
VISITOR_PORT=8080
ADMIN_OS_PORT=3000

# Infrastructure
NODO_ID=RDM-N0-ALPHA
EOF

echo -e "${GREEN}Proyecto estructurado exitosamente.${NC}"
