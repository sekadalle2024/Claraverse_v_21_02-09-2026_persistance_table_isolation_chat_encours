#!/usr/bin/env pwsh
# Script de Push en Commits Multiples pour ClaraVerse V14 - 22 Avril 2026
# Solution pour projets volumineux (> 100 MB)
# Repository: https://github.com/sekadalle2024/Claverse_windows__v_14_22-04-2026_V5_docker_zeabur_ok_switch_editeur.git

Write-Host "╔════════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                                                ║" -ForegroundColor Cyan
Write-Host "║      PUSH COMMITS MULTIPLES - CLARAVERSE V14 - 22-04-2026                     ║" -ForegroundColor Cyan
Write-Host "║                                                                                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration Git optimale
Write-Host "⚙️  Configuration Git optimale..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 2147483647
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
git config http.maxRequestBuffer 536870912
Write-Host "✓ Configuration appliquée" -ForegroundColor Green
Write-Host ""

# Changer le repository distant
Write-Host "🔄 Configuration du repository distant..." -ForegroundColor Yellow
$newRepo = "https://github.com/sekadalle2024/Claverse_windows__v_14_22-04-2026_V5_docker_zeabur_ok_switch_editeur.git"
git remote set-url origin $newRepo
Write-Host "✓ Repository configuré: $newRepo" -ForegroundColor Green
Write-Host ""

# Vérifier la branche
$branch = git branch --show-current
Write-Host "🌿 Branche: $branch" -ForegroundColor Cyan
Write-Host ""

# Fonction pour créer et pusher un commit
function Push-Commit {
    param(
        [string]$PartName,
        [string]$PartNumber,
        [string[]]$Paths
    )
    
    Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "Partie $PartNumber : $PartName" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    # Vérifier s'il y a des fichiers à commiter
    $hasChanges = $false
    foreach ($path in $Paths) {
        $status = git status --porcelain $path 2>$null
        if ($status) {
            $hasChanges = $true
            break
        }
    }
    
    if (-not $hasChanges) {
        Write-Host "  ℹ️  Aucun fichier à commiter dans cette partie" -ForegroundColor Gray
        Write-Host ""
        return $true
    }
    
    # Ajouter les fichiers
    Write-Host "  ➕ Ajout des fichiers..." -ForegroundColor Yellow
    foreach ($path in $Paths) {
        git add $path 2>$null
    }
    
    # Créer le commit
    Write-Host "  💾 Création du commit..." -ForegroundColor Yellow
    $commitMsg = "ClaraVerse V14 - Partie $PartNumber : $PartName"
    git commit -m $commitMsg 2>&1 | Out-Null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ℹ️  Aucun changement à commiter" -ForegroundColor Gray
        Write-Host ""
        return $true
    }
    
    Write-Host "  ✓ Commit créé" -ForegroundColor Green
    
    # Push avec retry
    $maxRetries = 3
    $retryCount = 0
    $success = $false
    
    while ($retryCount -lt $maxRetries -and -not $success) {
        $retryCount++
        Write-Host "  📤 Push tentative $retryCount/$maxRetries..." -ForegroundColor Yellow
        
        git push -u origin $branch 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Push réussi: $PartName" -ForegroundColor Green
            $success = $true
        } else {
            Write-Host "  ✗ Tentative $retryCount échouée" -ForegroundColor Red
            if ($retryCount -lt $maxRetries) {
                Write-Host "  ⏳ Attente de 10 secondes..." -ForegroundColor Yellow
                Start-Sleep -Seconds 10
            }
        }
    }
    
    Write-Host ""
    return $success
}

# Division du projet en 7 parties
Write-Host "📦 Division du projet en 7 parties..." -ForegroundColor Yellow
Write-Host ""

# Partie 1: Code Source React/TypeScript
$success = Push-Commit -PartName "Code Source React/TypeScript" -PartNumber "1/7" -Paths @("src/")
if (-not $success) { exit 1 }

# Partie 2: Backend Python
$success = Push-Commit -PartName "Backend Python" -PartNumber "2/7" -Paths @("py_backend/")
if (-not $success) { exit 1 }

# Partie 3: Fichiers Publics
$success = Push-Commit -PartName "Fichiers Publics" -PartNumber "3/7" -Paths @("public/")
if (-not $success) { exit 1 }

# Partie 4: Documentation Backend
$success = Push-Commit -PartName "Documentation Backend" -PartNumber "4/7" -Paths @(
    "Doc backend switch/",
    "Doc backend github/",
    "Doc backend huggings face/"
)
if (-not $success) { exit 1 }

# Partie 5: Documentation Déploiement
$success = Push-Commit -PartName "Documentation Déploiement" -PartNumber "5/7" -Paths @(
    "Doc zeabur docker/",
    "Doc render deploy/",
    "Doc Koyeb deploy/",
    "Doc Hugging Face deploy/",
    "deploiement-netlify/"
)
if (-not $success) { exit 1 }

# Partie 6: Autres Documentations
$success = Push-Commit -PartName "Autres Documentations" -PartNumber "6/7" -Paths @(
    "Doc menu demarrer/",
    "Doc export rapport/",
    "Doc_Etat_Fin/",
    "Doc_Lead_Balance/",
    "Doc_Github_Issue/",
    "Doc cross ref documentaire menu/",
    "Doc menu contextuel issues/",
    "Doc ClaraApiService response issues/",
    "Doc ClaraApiService.tsx timeout cors issue/",
    "Doc composant menu accordeon/",
    "Doc notification app/",
    "Doc prompt issues/",
    "Doc selecteur CSS Clara/",
    "Doc_AIONUI/",
    "doc extension chrome/",
    "Manuel E-audit/",
    "Extraction json DemarrerMenu.tsx/",
    "Microservice_Claraverse/",
    "Claraverse windows 11/"
)
if (-not $success) { exit 1 }

# Partie 7: Fichiers Restants (configuration, scripts, etc.)
$success = Push-Commit -PartName "Fichiers Restants" -PartNumber "7/7" -Paths @(
    "*.md",
    "*.txt",
    "*.json",
    "*.ps1",
    "*.py",
    "*.html",
    "*.css",
    "*.js",
    "*.ts",
    "*.toml",
    "*.sh",
    ".kiro/",
    ".github/",
    ".gitignore",
    ".dockerignore",
    ".env.example",
    ".env.google-oauth",
    "vite.config.ts",
    "index.html",
    "Dockerfile.frontend",
    "docker-compose.yml"
)
if (-not $success) { exit 1 }

Write-Host "╔════════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                                                ║" -ForegroundColor Green
Write-Host "║                    ✓ PUSH TERMINÉ AVEC SUCCÈS                                 ║" -ForegroundColor Green
Write-Host "║                                                                                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Vérification finale..." -ForegroundColor Yellow
git status
Write-Host ""

Write-Host "📝 Derniers commits:" -ForegroundColor Cyan
git log -5 --oneline
Write-Host ""

Write-Host "🔗 Repository GitHub:" -ForegroundColor Cyan
Write-Host "$newRepo" -ForegroundColor Green
Write-Host ""

Write-Host "✅ Votre projet ClaraVerse V14 est maintenant sauvegardé sur GitHub!" -ForegroundColor Green
Write-Host ""
