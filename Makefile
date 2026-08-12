.DEFAULT_GOAL := help
.PHONY: help install dev dev-backend dev-frontend test test-backend test-frontend \
        lint build ci clean flow-linear flow-loop

# --- Проект -----------------------------------------------------------------

help: ## Показать список целей
	@grep -hE '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

install: ## Установить зависимости всех воркспейсов (npm ci)
	npm ci

dev: ## Поднять backend (:3001) и frontend (:5173) одновременно
	npm run dev

dev-backend: ## Поднять только backend
	npm run dev --workspace backend

dev-frontend: ## Поднять только frontend
	npm run dev --workspace frontend

test: ## Прогнать тесты во всех воркспейсах
	npm test

test-backend: ## Тесты только backend
	npm test --workspace backend

test-frontend: ## Тесты только frontend
	npm test --workspace frontend

lint: ## Линт всех воркспейсов
	npm run lint

build: ## Type-check + сборка всех воркспейсов
	npm run build

ci: lint test build ## То же, что гоняет CI: lint + test + build

clean: ## Удалить артефакты сборки и node_modules
	rm -rf node_modules backend/node_modules frontend/node_modules \
	       backend/dist frontend/dist coverage

# --- Агентные пайплайны -----------------------------------------------------
# Требуют установленный Claude Code CLI и файлы .claude/agents + .claude/commands.
# Задача передаётся через TASK, например:
#   make flow-loop TASK="добавить эндпоинт DELETE /api/tasks/:id"

TASK ?=

define require_task
	@if [ -z '$(TASK)' ]; then \
		echo 'Нужен TASK. Пример: make $@ TASK="описание задачи"'; \
		exit 1; \
	fi
endef

flow-linear: ## Один проход Writer → Tests → Reviewer (TASK="...")
	$(require_task)
	claude -p '/flow-linear $(TASK)'

flow-loop: ## Итеративный прогон с возвратом на доработку (TASK="...")
	$(require_task)
	claude -p '/flow-loop $(TASK)'
