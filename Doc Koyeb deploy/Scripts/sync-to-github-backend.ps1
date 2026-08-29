# Script de synchronisation py_backend → Repository Github Backend
# Usage: .\sync-to-github-backend.ps1 [-Message "Commit message"] [-Push]

param(
    [string]$Message = "Sync from local py_backend - $(Get-Date -Format 'yyyy-MM-dd HH:mm')",
    [switch]$Push = $false,
    [string]$GithubRepoPath = ""
)

# Couleurs pour l'affichage
function Write-Success { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Error-Custom { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }
function Write-Info { param($msg) Write-Host "ℹ️  $msg" -ForegroundColor Cyan }
function Write-Warning-Custom { param($msg) Write-Host "⚠️  $msg" -ForegroundColor Yellow }

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║  Synchronisation py_backend → Github Backend Repo    ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# Configuration
$SOURCE_DIR = "py_backend"
$DEFAULT_DEST = "C:\Users\LEADER\Documents\Github\Back-end-python-V0_03_03_2026"

# Demander le chemin du repository Github si non fourni
if ([string]::IsNullOrEmpty($GithubRepoPath)) {
    Write-Info "Chemin par défaut: $DEFAULT_DEST"
    $response = Read-Host "Utiliser ce chemin? (O/n)"
    
    if ($response -eq "n" -or $response -eq "N") {
        $GithubRepoPath = Read-Host "Entrez le chemin du repository Github"
    } else {
        $GithubRepoPath = $DEFAULT_DEST
    }
}

$DEST_DIR = $GithubRepoPath

# Vérifications
Write-Host ""
Write-Host "🔍 Vérifications préliminaires..." -ForegroundColor Blue
Write-Host ""

# Vérifier que le dossier source existe
if (-not (Test-Path $SOURCE_DIR)) {
    Write-Error-Custom "Le dossier source '$SOURCE_DIR' n'existe pas"
    exit 1
}
Write-Success "Dossier source trouvé: $SOURCE_DIR"

# Vérifier que le dossier destination existe
if (-not (Test-Path $DEST_DIR)) {
    Write-Error-Custom "Le dossier destination '$DEST_DIR' n'existe pas"
    Write-Info "Créez d'abord le repository Github et clonez-le localement"
    exit 1
}
Write-Success "Dossier destination trouvé: $DEST_DIR"

# Vérifier que c'est un repository Git
if (-not (Test-Path "$DEST_DIR\.git")) {
    Write-Error-Custom "Le dossier destination n'est pas un repository Git"
    exit 1
}
Write-Success "Repository Git valide"

# Afficher les informations
Write-Host ""
Write-Host "📋 Informations de synchronisation" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "Source      : $SOURCE_DIR"
Write-Host "Destination : $DEST_DIR"
Write-Host "Message     : $Message"
Write-Host "Push auto   : $Push"
Write-Host ""

# Demander confirmation
$confirm = Read-Host "Continuer? (O/n)"
if ($confirm -eq "n" -or $confirm -eq "N") {
    Write-Warning-Custom "Synchronisation annulée"
    exit 0
}

# Synchronisation
Write-Host ""
Write-Host "🔄 Synchronisation en cours..." -ForegroundColor Blue
Write-Host ""

try {
    # Exclure certains fichiers/dossiers
    $EXCLUDE = @(
        "__pycache__",
        "*.pyc",
        ".pytest_cache",
        "venv",
        ".env",
        ".venv",
        "*.log"
    )

    # Copier les fichiers
    Write-Info "Copie des fichiers..."
    
    # Obtenir tous les fichiers du source
    $sourceFiles = Get-ChildItem -Path $SOURCE_DIR -Recurse -File
    
    $copiedCount = 0
    $skippedCount = 0
    
    foreach ($file in $sourceFiles) {
        $relativePath = $file.FullName.Substring($SOURCE_DIR.Length + 1)
        
        # Vérifier si le fichier doit être exclu
        $shouldExclude = $false
        foreach ($pattern in $EXCLUDE) {
            if ($relativePath -like $pattern) {
                $shouldExclude = $true
                break
            }
        }
        
        if ($shouldExclude) {
            $skippedCount++
            continue
        }
        
        # Créer le dossier de destination si nécessaire
        $destFile = Join-Path $DEST_DIR $relativePath
        $destFolder = Split-Path $destFile -Parent
        
        if (-not (Test-Path $destFolder)) {
            New-Item -ItemType Directory -Path $destFolder -Force | Out-Null
        }
        
        # Copier le fichier
        Copy-Item -Path $file.FullName -Destination $destFile -Force
        $copiedCount++
    }
    
    Write-Success "Fichiers copiés: $copiedCount"
    Write-Info "Fichiers ignorés: $skippedCount"
    
    # Git operations
    Write-Host ""
    Write-Info "Opérations Git..."
    
    Push-Location $DEST_DIR
    
    # Vérifier le statut
    $status = git status --porcelain
    
    if ([string]::IsNullOrEmpty($status)) {
        Write-Warning-Custom "Aucune modification détectée"
        Pop-Location
        exit 0
    }
    
    Write-Info "Modifications détectées:"
    git status --short
    
    # Add
    Write-Info "git add ."
    git add .
    
    # Commit
    Write-Info "git commit -m `"$Message`""
    git commit -m $Message
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Erreur lors du commit"
        Pop-Location
        exit 1
    }
    
    Write-Success "Commit créé avec succès"
    
    # Push si demandé
    if ($Push) {
        Write-Host ""
        Write-Info "Push vers Github..."
        
        git push origin main
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error-Custom "Erreur lors du push"
            Write-Info "Vous pouvez push manuellement avec: git push origin main"
            Pop-Location
            exit 1
        }
        
        Write-Success "Push réussi vers Github"
        Write-Success "Déploiement Koyeb en cours..."
    } else {
        Write-Host ""
        Write-Warning-Custom "Push non effectué (utilisez -Push pour push automatique)"
        Write-Info "Pour push manuellement:"
        Write-Host "  cd $DEST_DIR" -ForegroundColor Yellow
        Write-Host "  git push origin main" -ForegroundColor Yellow
    }
    
    Pop-Location
    
} catch {
    Write-Error-Custom "Erreur lors de la synchronisation: $_"
    if (Get-Location | Select-Object -ExpandProperty Path | Where-Object { $_ -eq $DEST_DIR }) {
        Pop-Location
    }
    exit 1
}

# Résumé
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              ✅ Synchronisation terminée              ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

if ($Push) {
    Write-Host "🚀 Déploiement Koyeb en cours..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Surveillez le déploiement:" -ForegroundColor Yellow
    Write-Host "  Dashboard: https://app.koyeb.com/services/back-end-python-v0-03-03-2026" -ForegroundColor Blue
    Write-Host "  Logs: koyeb service logs back-end-python-v0-03-03-2026 --follow" -ForegroundColor Blue
    Write-Host ""
    Write-Host "URL de l'API:" -ForegroundColor Yellow
    Write-Host "  https://proud-del-saasauditnterne-9f15de46.koyeb.app/" -ForegroundColor Blue
} else {
    Write-Host "📝 Prochaines étapes:" -ForegroundColor Yellow
    Write-Host "  1. Vérifier les modifications: cd $DEST_DIR && git status" -ForegroundColor Cyan
    Write-Host "  2. Push vers Github: git push origin main" -ForegroundColor Cyan
    Write-Host "  3. Surveiller le déploiement Koyeb" -ForegroundColor Cyan
}

Write-Host ""
