# ================================================================
# Script de Push ClaraVerse Backup V2 - 17 Avril 2026
# Repository: https://github.com/sekadalle2024/claraverse_back-up_V2.git
# Solution: Commits multiples pour projets volumineux
# ================================================================

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   PUSH CLARAVERSE BACKUP V2 - 17 AVRIL 2026" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration Git optimale pour gros projets
Write-Host "Configuration Git optimale..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 1048576000
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
Write-Host "Configuration terminee" -ForegroundColor Green
Write-Host ""

# Vérifier le repository distant
Write-Host "Verification du repository distant..." -ForegroundColor Yellow
$repoUrl = "https://github.com/sekadalle2024/Claverse_windows__v8_17-04-2026_V5-Export_CAC-V0-Public.git"

# Vérifier si origin existe
$remoteCheck = git remote -v 2>&1
if ($remoteCheck -match "origin") {
    Write-Host "Remote 'origin' existe deja" -ForegroundColor Yellow
    Write-Host "Mise a jour de l'URL..." -ForegroundColor Yellow
    git remote set-url origin $repoUrl
} else {
    Write-Host "Ajout du remote 'origin'..." -ForegroundColor Yellow
    git remote add origin $repoUrl
}

Write-Host "Repository distant configure: $repoUrl" -ForegroundColor Green
Write-Host ""

# Vérifier la branche actuelle
Write-Host "Verification de la branche..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
if ([string]::IsNullOrEmpty($currentBranch)) {
    $currentBranch = "main"
    Write-Host "Creation de la branche $currentBranch..." -ForegroundColor Yellow
    git checkout -b $currentBranch
}
Write-Host "Branche actuelle: $currentBranch" -ForegroundColor Green
Write-Host ""

# Fonction pour créer et pusher un commit
function Push-CommitWithRetry {
    param(
        [string]$CommitMessage,
        [string[]]$FilePaths,
        [int]$MaxRetries = 3
    )
    
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "  $CommitMessage" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
    
    # Ajouter les fichiers
    $filesAdded = $false
    foreach ($path in $FilePaths) {
        if (Test-Path $path) {
            git add $path
            $filesAdded = $true
            Write-Host "  Ajoute: $path" -ForegroundColor Gray
        }
    }
    
    if (-not $filesAdded) {
        Write-Host "  Aucun fichier a commiter dans cette partie" -ForegroundColor Yellow
        Write-Host ""
        return $true
    }
    
    # Créer le commit
    git commit -m $CommitMessage
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Aucun changement a commiter" -ForegroundColor Yellow
        Write-Host ""
        return $true
    }
    
    Write-Host "  Commit cree" -ForegroundColor Green
    
    # Pusher avec retry
    for ($i = 1; $i -le $MaxRetries; $i++) {
        Write-Host "  Push tentative $i/$MaxRetries..." -ForegroundColor Yellow
        
        git push -u origin $currentBranch 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Push reussi: $CommitMessage" -ForegroundColor Green
            Write-Host ""
            return $true
        }
        
        if ($i -lt $MaxRetries) {
            Write-Host "  Echec, nouvelle tentative dans 5 secondes..." -ForegroundColor Red
            Start-Sleep -Seconds 5
        }
    }
    
    Write-Host "  ERREUR: Push echoue apres $MaxRetries tentatives" -ForegroundColor Red
    Write-Host ""
    return $false
}

# ================================================================
# PARTIE 1: Code Source React/TypeScript
# ================================================================
$success = Push-CommitWithRetry -CommitMessage "Partie 1/6: Code Source React/TypeScript" -FilePaths @("src/")
if (-not $success) { exit 1 }

# ================================================================
# PARTIE 2: Backend Python
# ================================================================
$success = Push-CommitWithRetry -CommitMessage "Partie 2/6: Backend Python" -FilePaths @("py_backend/")
if (-not $success) { exit 1 }

# ================================================================
# PARTIE 3: Fichiers Publics
# ================================================================
$success = Push-CommitWithRetry -CommitMessage "Partie 3/6: Fichiers Publics" -FilePaths @("public/")
if (-not $success) { exit 1 }

# ================================================================
# PARTIE 4: Documentation Principale
# ================================================================
$docPaths = @(
    "Doc menu demarrer/",
    "Doc export rapport/",
    "Doc_Etat_Fin/",
    "Doc_Lead_Balance/",
    "Doc_Heatmap_Risque/",
    "Doc Koyeb deploy/",
    "Doc render deploy/"
)
$success = Push-CommitWithRetry -CommitMessage "Partie 4/6: Documentation principale" -FilePaths $docPaths
if (-not $success) { exit 1 }

# ================================================================
# PARTIE 5: Autres Documentations
# ================================================================
$otherDocPaths = @(
    "Doc_Github_Issue/",
    "Doc_AIONUI/",
    "Doc menu contextuel issues/",
    "Doc cross ref documentaire menu/",
    "Doc composant menu accordeon/",
    "Doc ClaraAPIService response issues/",
    "Doc ClaraApiService.tsx timeout cors issue/",
    "Doc notification app/",
    "Doc prompt issues/",
    "Doc selecteur CSS Clara/",
    "doc extension chrome/",
    "Extraction json DemarrerMenu.tsx/",
    "Manuel E-audit/",
    "Microservice_Claraverse/",
    "Claraverse windows 11/",
    "deploiement-netlify/",
    "*.md",
    "*.txt"
)
$success = Push-CommitWithRetry -CommitMessage "Partie 5/6: Autres documentations" -FilePaths $otherDocPaths
if (-not $success) { exit 1 }

# ================================================================
# PARTIE 6: Fichiers Restants (Configuration, etc.)
# ================================================================
$configPaths = @(
    ".",
    ".gitignore",
    ".dockerignore",
    ".env.example",
    "*.json",
    "*.js",
    "*.html",
    "*.css",
    "*.ps1",
    "*.sh",
    "*.py"
)
$success = Push-CommitWithRetry -CommitMessage "Partie 6/6: Fichiers Restants (Configuration)" -FilePaths $configPaths
if (-not $success) { exit 1 }

# ================================================================
# VERIFICATION FINALE
# ================================================================
Write-Host "================================================================" -ForegroundColor Green
Write-Host "           PUSH TERMINE AVEC SUCCES" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""

Write-Host "Verification finale..." -ForegroundColor Yellow
git status
Write-Host ""

Write-Host "Repository GitHub:" -ForegroundColor Cyan
Write-Host $repoUrl -ForegroundColor White
Write-Host ""

Write-Host "================================================================" -ForegroundColor Green
Write-Host "  SAUVEGARDE CLARAVERSE BACKUP V2 TERMINEE" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
