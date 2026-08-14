BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

FILES := -f docker-compose.yml -f docker-compose.prod.yml
ENV_FILE := --env-file .env.production

.PHONY: up down build logs deploy-prod ssl-check dns-check logs-prod backup-prod

up:
	@docker compose up --build -d

down:
	@docker compose down

build:
	@docker compose build --parallel

logs:
	@docker compose logs -f --tail=100

deploy-prod:
	@chmod +x deploy-prod.sh
	@./deploy-prod.sh

ssl-check:
	@echo "$(BLUE)Verificando certificado SSL...$(NC)"
	@curl -I https://visitarealdelmonte.online | grep -E "(HTTP|SSL)"

dns-check:
	@echo "$(BLUE)Verificando DNS...$(NC)"
	@dig visitarealdelmonte.online +short
	@dig www.visitarealdelmonte.online +short

logs-prod:
	@docker compose $(FILES) $(ENV_FILE) logs -f --tail=100

backup-prod:
	@echo "$(BLUE)Creando backup de producción...$(NC)"
	@docker compose $(FILES) $(ENV_FILE) exec -T db mongodump --archive > backup-prod-$(shell date +%Y%m%d-%H%M%S).archive
	@echo "$(GREEN)Backup completado$(NC)"
