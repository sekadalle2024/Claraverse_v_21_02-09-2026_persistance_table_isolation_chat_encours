# ============================================
# Script: Test Docker Local
# Description: Teste le déploiement Docker Compose en local
# ============================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          TEST DOCKER COMPOSE LOCAL                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Fonction pour afficher les étapes
function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "▶ $Message" -ForegroundColor Yellow
    Write-Host ("─" * 60) -ForegroundColor DarkGray
}

# Fonction pour vérifier une commande
function Test-Command {
    param([string]$Command)
    try {
        & $Command --version | Out-Null
        return $true
    } catch {
        return $false
    }
}

# ============================================
# ÉTAPE 1: Vérification des prérequis
# ============================================
Write-Step "Vérification des prérequis"

$prerequisites = @{
    "Docker" = "docker"
    "Docker Compose" = "docker-compose"
}

$allOk = $true
foreach ($tool in $prerequisites.Keys) {
    $command = $prerequisites[$tool]
    if (Test-Command $command) {
        $version = & $command --version 2>&1 | Select-Object -First 1
        Write-Host "  ✓ $tool : $version" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $tool : Non installé" -ForegroundColor Red
        $allOk = $false
    }
}

if (-not $allOk) {
    Write-Host ""
    Write-Host "❌ Certains prérequis sont manquants" -ForegroundColor Red
    exit 1
}

# ============================================
# ÉTAPE 2: Vérification des fichiers
# ============================================
Write-Step "Vérification des fichiers de configuration"

$requiredFiles = @(
    "docker-compose.yml",
    "Dockerfile.frontend",
    "py_backend/Dockerfile",
    "public/backendConfig.js"
)

$filesOk = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file : Manquant" -ForegroundColor Red
        $filesOk = $false
    }
}

if (-not $filesOk) {
    Write-Host ""
    Write-Host "❌ Certains fichiers sont manquants" -ForegroundColor Red
    Write-Host "   Exécutez d'abord: .\Doc zeabur docker\Scripts\create-docker-compose.ps1" -ForegroundColor Yellow
    exit 1
}

# ============================================
# ÉTAPE 3: Arrêt des services existants
# ============================================
Write-Step "Arrêt des services existants"

try {
    docker-compose down 2>&1 | Out-Null
    Write-Host "  ✓ Services arrêtés" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ Aucun service à arrêter" -ForegroundColor Yellow
}

# ============================================
# ÉTAPE 4: Build des images
# ============================================
Write-Step "Build des images Docker"

Write-Host "  ⏳ Build en cours (cela peut prendre 5-10 minutes)..." -ForegroundColor Cyan

try {
    docker-compose build --no-cache 2>&1 | ForEach-Object {
        if ($_ -match "Successfully built|Successfully tagged") {
            Write-Host "  $_" -ForegroundColor Green
        }
    }
    Write-Host "  ✓ Images buildées avec succès" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Erreur lors du build: $_" -ForegroundColor Red
    exit 1
}

# ============================================
# ÉTAPE 5: Démarrage des services
# ============================================
Write-Step "Démarrage des services"

try {
    docker-compose up -d
    Write-Host "  ✓ Services démarrés" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Erreur lors du démarrage: $_" -ForegroundColor Red
    exit 1
}

# Attendre que les services soient prêts
Write-Host "  ⏳ Attente du démarrage des services (30 secondes)..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

# ============================================
# ÉTAPE 6: Vérification du statut
# ============================================
Write-Step "Vérification du statut des services"

$services = docker-compose ps --format json | ConvertFrom-Json

foreach ($service in $services) {
    $name = $service.Name
    $status = $service.State
    $health = $service.Health
    
    if ($status -eq "running") {
        if ($health -eq "healthy" -or $health -eq "") {
            Write-Host "  ✓ $name : Running" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ $name : Running (Health: $health)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ❌ $name : $status" -ForegroundColor Red
    }
}

# ============================================
# ÉTAPE 7: Tests de santé
# ============================================
Write-Step "Tests de santé des endpoints"

# Test Backend
Write-Host "  Testing Backend (http://localhost:5000/health)..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✓ Backend : OK (HTTP $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Backend : HTTP $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ Backend : Inaccessible" -ForegroundColor Red
    Write-Host "     Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Frontend
Write-Host "  Testing Frontend (http://localhost:3000/health)..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✓ Frontend : OK (HTTP $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Frontend : HTTP $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ Frontend : Inaccessible" -ForegroundColor Red
    Write-Host "     Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# ============================================
# ÉTAPE 8: Affichage des logs récents
# ============================================
Write-Step "Logs récents (dernières 20 lignes)"

Write-Host ""
Write-Host "  Backend:" -ForegroundColor Cyan
docker-compose logs --tail=10 backend | ForEach-Object {
    Write-Host "    $_" -ForegroundColor Gray
}

Write-Host ""
Write-Host "  Frontend:" -ForegroundColor Cyan
docker-compose logs --tail=10 frontend | ForEach-Object {
    Write-Host "    $_" -ForegroundColor Gray
}

# ============================================
# RÉSUMÉ
# ============================================
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    ✓ TESTS TERMINÉS                       ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Services disponibles:" -ForegroundColor Cyan
Write-Host "  • Frontend : http://localhost:3000" -ForegroundColor White
Write-Host "  • Backend  : http://localhost:5000" -ForegroundColor White
Write-Host "  • API Docs : http://localhost:5000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Commandes utiles:" -ForegroundColor Yellow
Write-Host "  • Voir les logs       : docker-compose logs -f" -ForegroundColor White
Write-Host "  • Arrêter les services: docker-compose stop" -ForegroundColor White
Write-Host "  • Redémarrer          : docker-compose restart" -ForegroundColor White
Write-Host "  • Tout supprimer      : docker-compose down -v" -ForegroundColor White
Write-Host ""
Write-Host "Ouvrir l'application dans le navigateur? (O/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "O" -or $response -eq "o") {
    Start-Process "http://localhost:3000"
    Write-Host "✓ Application ouverte dans le navigateur" -ForegroundColor Green
}

Write-Host ""
