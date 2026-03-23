.PHONY: help build dev prod clean logs stop

# Default target
help:
	@echo "Available commands:"
	@echo "  make build     - Build all Docker images"
	@echo "  make dev       - Start development environment"
	@echo "  make prod      - Start production environment"
	@echo "  make logs      - Show logs from all services"
	@echo "  make stop      - Stop all services"
	@echo "  make clean     - Remove all containers and images"
	@echo "  make test      - Run tests"

# Build Docker images
build:
	@echo "Building frontend image..."
	docker build -t hakeem-frontend:latest ./frontend
	@echo "Building backend image..."
	docker build -t hakeem-backend:latest ./backend
	@echo "All images built successfully!"

# Development environment
dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up --build

# Production environment
prod:
	@echo "Starting production environment..."
	cp .env.example .env 2>/dev/null || true
	docker-compose -f docker-compose.prod.yml up --build -d

# Show logs
logs:
	docker-compose -f docker-compose.prod.yml logs -f

# Stop all services
stop:
	@echo "Stopping all services..."
	docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
	docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Clean up
clean:
	@echo "Removing all containers and images..."
	docker-compose -f docker-compose.dev.yml down -v 2>/dev/null || true
	docker-compose -f docker-compose.prod.yml down -v 2>/dev/null || true
	docker system prune -f
	docker volume prune -f

# Run tests
test:
	@echo "Running tests..."
	cd frontend && npm test
	cd backend && npm test

# Database backup
backup:
	@echo "Creating database backup..."
	docker exec hakeem_database mongodump --out /backup/$(shell date +%Y%m%d_%H%M%S)

# Update dependencies
update:
	@echo "Updating frontend dependencies..."
	cd frontend && npm update
	@echo "Updating backend dependencies..."
	cd backend && npm update
	@echo "Dependencies updated!"
