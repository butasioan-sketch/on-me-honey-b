# ===================================================================
# ON ME HONEY B - Makefile
# ===================================================================
# Unified command interface for development and deployment
# Usage: make <command>
# ===================================================================

.PHONY: help install dev build test lint clean health verify deploy

# Default target
.DEFAULT_GOAL := help

## help: Show this help message
help:
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║         ON ME HONEY B - Available Commands                ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/^## /  /'
	@echo ""

## install: Install dependencies
install:
	@echo "📦 Installing dependencies..."
	npm install
	@echo "✅ Dependencies installed"

## dev: Start development server
dev:
	@echo "🚀 Starting development server..."
	npm run dev

## build: Build production bundle
build:
	@echo "🔨 Building production bundle..."
	npm run build
	@echo "✅ Build complete"

## test: Run smoke tests
test:
	@echo "🧪 Running smoke tests..."
	npm test

## test-all: Run full E2E test suite
test-all:
	@echo "🧪 Running full test suite..."
	npm run test:all

## lint: Run ESLint
lint:
	@echo "🔍 Running ESLint..."
	npm run lint

## format: Format code with Prettier
format:
	@echo "✨ Formatting code..."
	npx prettier --write "**/*.{ts,tsx,js,jsx,json,md}"
	@echo "✅ Code formatted"

## verify: Verify environment variables
verify:
	@echo "🔐 Verifying environment variables..."
	./scripts/verify-env.sh --local

## health: Run production health check
health:
	@echo "🏥 Running production health check..."
	./scripts/health-check.sh --production

## pre-deploy: Run pre-deployment verification
pre-deploy:
	@echo "✅ Running pre-deployment checks..."
	./scripts/pre-deploy-check.sh

## status: Check deployment status
status:
	@echo "📊 Checking deployment status..."
	./scripts/deployment-status.sh

## clean: Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf .next
	rm -rf node_modules/.cache
	@echo "✅ Clean complete"

## setup: Complete setup for new developers
setup: install verify
	@echo ""
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║              Setup Complete! 🎉                           ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "Next steps:"
	@echo "  1. make dev          # Start development server"
	@echo "  2. make test         # Run tests"
	@echo "  3. make pre-deploy   # Verify before deploying"
	@echo ""

## check: Run all quality checks
check: build lint test
	@echo ""
	@echo "✅ All quality checks passed!"

## deploy: Deploy to production (via git push)
deploy: pre-deploy
	@echo "🚀 Deploying to production..."
	@git push origin main
	@echo "✅ Pushed to main - Vercel will auto-deploy"
	@echo ""
	@echo "Monitor deployment:"
	@echo "  • Vercel Dashboard: https://vercel.com/dashboard"
	@echo "  • Health Check: make health"
