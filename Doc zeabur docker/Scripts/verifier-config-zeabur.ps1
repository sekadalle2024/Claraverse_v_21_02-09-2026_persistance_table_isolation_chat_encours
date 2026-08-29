# ═══════════════════════════════════════════════════════════════════
# 🔍 SCRIPT DE VÉRIFICATION - CONFIGURATION ZEABUR
# ═══════════════════════════════════════════════════════════════════
# Date: 20 avril 2026
# Objectif: Vérifier que les fichiers Docker sont corrects avant déploiement

Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔍 VÉRIFICATION CONFIGURATION ZEABUR" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$erreurs = 0
$avertissements = 0

# ═══════════════════════════════════════════════════════════════════
# 1. VÉRIFIER DOCKER-COMPOSE.YML
# ═══════════════════════════════════════════════════════════════════

Write-Host "📋 Vérification docker-compose.yml..." -ForegroundColor Yellow

if (Test-Path "docker-compose.yml") {
    Write-Host "  ✅ docker-compose.yml existe" -ForegroundColor Green
    
    $dockerCompose = Get-Content "docker-compose.yml" -Raw
    
    # Vérifier service backend
    if ($dockerCompose -match "backend:") {
        Write-Host "  ✅ Service 'backend' défini" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Service 'backend' manquant" -ForegroundColor Red
        $erreurs++
    }
    
    # Vérifier service frontend
    if ($dockerCompose -match "frontend:") {
        Write-Host "  ✅ Service 'frontend' défini" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Service 'frontend' manquant" -ForegroundColor Red
        $erreurs++
    }
    
    # Vérifier port backend
    if ($dockerCompose -match '"8080:8080"') {
        Write-Host "  ✅ Port backend 8080 configuré" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Port backend 8080 non trouvé" -ForegroundColor Yellow
        $avertissements++
    }
    
    # Vérifier port frontend
    if ($dockerCompose -match '"80:80"') {
        Write-Host "  ✅ Port frontend 80 configuré" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Port frontend 80 non trouvé" -ForegroundColor Yellow
        $avertissements++
    }
    
} else {
    Write-Host "  ❌ docker-compose.yml manquant !" -ForegroundColor Red
    $erreurs++
}

Write-Host ""

# ═══════════════════════════════════════════════════════════════════
# 2. VÉRIFIER DOCKERFILE BACKEND
# ═══════════════════════════════════════════════════════════════════

Write-Host "🐍 Vérification Dockerfile backend..." -ForegroundColor Yellow

if (Test-Path "py_backend/Dockerfile") {
    Write-Host "  ✅ py_backend/Dockerfile existe" -ForegroundColor Green
    
    $dockerfileBackend = Get-Content "py_backend/Dockerfile" -Raw
    
    # Vérifier port 8080
    if ($dockerfileBackend -match "PORT=8080" -or $dockerfileBackend -match "EXPOSE 8080") {
        Write-Host "  ✅ Port 8080 configuré" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Port 8080 non configuré" -ForegroundColor Red
        $erreurs++
    }
    
    # Vérifier uvicorn
    if ($dockerfileBackend -match "uvicorn") {
        Write-Host "  ✅ Uvicorn configuré" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Uvicorn non trouvé dans CMD" -ForegroundColor Yellow
        $avertissements++
    }
    
} else {
    Write-Host "  ❌ py_backend/Dockerfile manquant !" -ForegroundColor Red
    $erreurs++
}

Write-Host ""

# ═══════════════════════════════════════════════════════════════════
# 3. VÉRIFIER DOCKERFILE FRONTEND
# ═══════════════════════════════════════════════════════════════════

Write-Host "⚛️  Vérification Dockerfile frontend..." -ForegroundColor Yellow

if (Test-Path "Dockerfile.frontend") {
    Write-Host "  ✅ Dockerfile.frontend existe" -ForegroundColor Green
    
    $dockerfileFrontend = Get-Content "Dockerfile.frontend" -Raw
    
    # Vérifier multi-stage build
    if ($dockerfileFrontend -match "FROM node.*AS builder") {
        Write-Host "  ✅ Multi-stage build configuré" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Multi-stage build non détecté" -ForegroundColor Yellow
        $avertissements++
    }
    
    # Vérifier nginx
    if ($dockerfileFrontend -match "FROM nginx") {
        Write-Host "  ✅ Nginx configuré" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Nginx manquant" -ForegroundColor Red
        $erreurs++
    }
    
    # Vérifier port 80
    if ($dockerfileFrontend -match "EXPOSE 80") {
        Write-Host "  ✅ Port 80 exposé" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Port 80 non exposé explicitement" -ForegroundColor Yellow
        $avertissements++
    }
    
} else {
    Write-Host "  ❌ Dockerfile.frontend manquant !" -ForegroundColor Red
    $erreurs++
}

Write-Host ""

# ═══════════════════════════════════════════════════════════════════
# 4. VÉRIFIER FICHIERS CONFLICTUELS
# ═══════════════════════════════════════════════════════════════════

Write-Host "🔍 Vérification fichiers conflictuels..." -ForegroundColor Yellow

# Vérifier nginx.conf à la racine (ne doit PAS exister)
if (Test-Path "nginx.conf") {
    Write-Host "  ❌ nginx.conf existe à la racine (CONFLIT !)" -ForegroundColor Red
    Write-Host "     Ce fichier doit être supprimé" -ForegroundColor Red
    $erreurs++
} else {
    Write-Host "  ✅ Pas de nginx.conf à la racine" -ForegroundColor Green
}

# Vérifier .dockerignore
if (Test-Path ".dockerignore") {
    Write-Host "  ✅ .dockerignore existe" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  .dockerignore manquant (recommandé)" -ForegroundColor Yellow
    $avertissements++
}

Write-Host ""

# ═══════════════════════════════════════════════════════════════════
# 5. VÉRIFIER REQUIREMENTS.TXT
# ═══════════════════════════════════════════════════════════════════

Write-Host "📦 Vérification requirements.txt..." -ForegroundColor Yellow

if (Test-Path "py_backend/requirements.txt") {
    Write-Host "  ✅ py_backend/requirements.txt existe" -ForegroundColor Green
    
    $requirements = Get-Content "py_backend/requirements.txt" -Raw
    
    # Vérifier dépendances essentielles
    $dependances = @("fastapi", "uvicorn", "pydantic")
    foreach ($dep in $dependances) {
        if ($requirements -match $dep) {
            Write-Host "  ✅ $dep présent" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  $dep manquant" -ForegroundColor Yellow
            $avertissements++
        }
    }
    
} else {
    Write-Host "  ❌ py_backend/requirements.txt manquant !" -ForegroundColor Red
    $erreurs++
}

Write-Host ""

# ═══════════════════════════════════════════════════════════════════
# 6. VÉRIFIER PACKAGE.JSON
# ═══════════════════════════════════════════════════════════════════

Write-Host "📦 Vérification package.json..." -ForegroundColor Yellow

if (Test-Path "package.json") {
    Write-Host "  ✅ package.json existe" -ForegroundColor Green
    
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    
    # Vérifier script build
    if ($packageJson.scripts.build) {
        Write-Host "  ✅ Script 'build' défini" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Script 'build' manquant" -ForegroundColor Red
        $erreurs++
    }
    
} else {
    Write-Host "  ❌ package.json manquant !" -ForegroundColor Red
    $erreurs++
}

Write-Host ""

# ═══════════════════════════════════════════════════════════════════
# RÉSUMÉ
# ═══════════════════════════════════════════════════════════════════

Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 RÉSUMÉ DE LA VÉRIFICATION" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($erreurs -eq 0 -and $avertissements -eq 0) {
    Write-Host "✅ TOUT EST CORRECT !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Vous pouvez déployer sur Zeabur en toute confiance." -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "1. Push vers GitHub" -ForegroundColor White
    Write-Host "2. Configurer les services dans Zeabur" -ForegroundColor White
    Write-Host "3. Vérifier que Service Name = 'backend' pour le backend" -ForegroundColor White
    Write-Host "4. Vérifier que Service Name = 'frontend' pour le frontend" -ForegroundColor White
    
} elseif ($erreurs -eq 0) {
    Write-Host "⚠️  CONFIGURATION ACCEPTABLE" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Erreurs:         $erreurs" -ForegroundColor Green
    Write-Host "Avertissements:  $avertissements" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Vous pouvez déployer, mais certains éléments pourraient être améliorés." -ForegroundColor Yellow
    
} else {
    Write-Host "❌ ERREURS DÉTECTÉES !" -ForegroundColor Red
    Write-Host ""
    Write-Host "Erreurs:         $erreurs" -ForegroundColor Red
    Write-Host "Avertissements:  $avertissements" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Veuillez corriger les erreurs avant de déployer." -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Retourner le code d'erreur
if ($erreurs -gt 0) {
    exit 1
} else {
    exit 0
}
