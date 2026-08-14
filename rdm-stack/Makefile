BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

FILES := -f docker-compose.yml -f docker-compose.prod.yml
ENV_FILE := --env-file .env.production

.PHONY: up down build logs deploy-prod ssl-check dns-check logs-prod backup-prod health status

up:
	@docker compose up --build -d

down:
	@docker compose down

build:
	@docker compose build --parallel

logs:
	@docker compose logs -f --tail=100

status:
	@docker compose ps

health:
	@echo "$(BLUE)Health checks del stack:$(NC)"
	@docker compose ps --format "table {{.Name}}\t{{.Status}}"
	@echo ""
	@echo "$(BLUE)Gateway:$(NC)"
	@curl -s http://localhost/health || echo "$(RED)gateway no responde$(NC)"
	@echo ""
	@echo "$(BLUE)API territorial (nodo-cero):$(NC)"
	@curl -s http://localhost/api/yun/status || echo "$(RED)api no responde$(NC)"

deploy-prod:
	@chmod +x deploy-prod.sh
	@./deploy-prod.sh

ssl-check:
	@echo "$(BLUE)Verificando certificado SSL...$(NC)"
	@curl -I https://www.visitarealdelmonte.online | grep -E "(HTTP|SSL)"

dns-check:
	@echo "$(BLUE)Verificando DNS...$(NC)"
	@dig www.visitarealdelmonte.online +short
	@dig visitarealdelmonte.online +short

logs-prod:
	@docker compose $(FILES) $(ENV_FILE) logs -f --tail=100

backup-prod:
	@echo "$(BLUE)Creando backup de producción (PostgreSQL)...$(NC)"
	@docker compose $(FILES) $(ENV_FILE) exec -T db pg_dump -U rdm -d rdm_db > backup-prod-$(shell date +%Y%m%d-%H%M%S).sql
	@echo "$(GREEN)Backup completado$(NC)"

restore-prod:
	@echo "$(BLUE)Restaurando backup: $(filter-out $@,$(MAKECMDGOALS))$(NC)"
	@docker compose $(FILES) $(ENV_FILE) exec -T db psql -U rdm -d rdm_db < $(filter-out $@,$(MAKECMDGOALS))
	@echo "$(GREEN)Restauración completada$(NC)"