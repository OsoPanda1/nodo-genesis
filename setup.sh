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
cp .env.example .env

echo -e "${GREEN}Proyecto estructurado exitosamente.${NC}"
echo ""
echo -e "Pasos siguientes:"
echo -e "  ${GREEN}1.${NC} Edita ${GREEN}rdm-stack/.env${NC} con tus credenciales de Supabase"
echo -e "  ${GREEN}2.${NC} docker compose up -d --build"
echo -e "  ${GREEN}3.${NC} Abre http://localhost (web), /admin (panel), /api (API)"