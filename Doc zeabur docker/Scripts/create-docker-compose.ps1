# ============================================
# Script: Créer docker-compose.yml
# Description: Génère le fichier docker-compose.yml pour Zeabur
# ============================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CRÉATION DOCKER-COMPOSE.YML POUR ZEABUR              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier qu'on est à la racine du projet
if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERREUR: Ce script doit être exécuté depuis la racine du projet" -ForegroundColor Red
    Write-Host "   Répertoire actuel: $PWD" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Répertoire racine détecté" -ForegroundColor Green

# Contenu du docker-compose.yml
$dockerComposeContent = @"
version: '3.8'

services:
  # ============================================
  # SERVICE FRONTEND (React + TypeScript)
  # ============================================
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
      args:
        - NODE_ENV=production
    container_name: claraverse-frontend
    ports:
      - "3000:80"  # Local: 3000, Zeabur: 80
    environment:
      # Variables d'environnement pour le build
      - VITE_APP_NAME=Claraverse
      - VITE_BACKEND_URL=`${BACKEND_URL:-http://backend:8080}
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - claraverse-network
    restart: unless-stopped
    labels:
      - "com.claraverse.service=frontend"
      - "com.claraverse.version=1.0.0"

  # ============================================
  # SERVICE BACKEND (Python + FastAPI)
  # ============================================
  backend:
    build:
      context: ./py_backend
      dockerfile: Dockerfile
    container_name: claraverse-backend
    ports:
      - "5000:8080"  # Local: 5000, Zeabur: 8080
    environment:
      # Configuration serveur
      - HOST=0.0.0.0
      - PORT=8080
      - PYTHONUNBUFFERED=1
      - PYTHONDONTWRITEBYTECODE=1
      
      # CORS Configuration
      - CORS_ORIGINS=https://prclaravi.zeabur.app,http://localhost:3000,http://localhost:5173
      - CORS_ALLOW_CREDENTIALS=true
      - CORS_ALLOW_METHODS=GET,POST,PUT,DELETE,OPTIONS
      - CORS_ALLOW_HEADERS=*
      - CORS_EXPOSE_HEADERS=Content-Disposition,Content-Type,Content-Length
      
      # Application
      - APP_ENV=`${APP_ENV:-production}
      - LOG_LEVEL=`${LOG_LEVEL:-info}
    volumes:
      # Persistance des données (optionnel)
      - backend-data:/app/data
    networks:
      - claraverse-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
    labels:
      - "com.claraverse.service=backend"
      - "com.claraverse.version=1.0.0"

# ============================================
# NETWORKS
# ============================================
networks:
  claraverse-network:
    driver: bridge
    name: claraverse-network

# ============================================
# VOLUMES
# ============================================
volumes:
  backend-data:
    driver: local
    name: claraverse-backend-data
"@

# Créer le fichier
try {
    $dockerComposeContent | Out-File -FilePath "docker-compose.yml" -Encoding UTF8 -Force
    Write-Host "✓ Fichier docker-compose.yml créé" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la création du fichier: $_" -ForegroundColor Red
    exit 1
}

# Vérifier le fichier
if (Test-Path "docker-compose.yml") {
    $fileSize = (Get-Item "docker-compose.yml").Length
    Write-Host "✓ Fichier créé avec succès ($fileSize octets)" -ForegroundColor Green
} else {
    Write-Host "❌ Le fichier n'a pas été créé" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    ✓ SUCCÈS                               ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Fichier créé: docker-compose.yml" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Yellow
Write-Host "  1. Créer Dockerfile.frontend (voir documentation)" -ForegroundColor White
Write-Host "  2. Adapter py_backend/Dockerfile si nécessaire" -ForegroundColor White
Write-Host "  3. Tester localement: docker-compose up -d" -ForegroundColor White
Write-Host "  4. Vérifier: docker-compose ps" -ForegroundColor White
Write-Host ""
