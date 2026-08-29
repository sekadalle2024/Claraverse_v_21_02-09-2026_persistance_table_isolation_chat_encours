# Script de vérification pré-déploiement Koyeb (PowerShell)
# Vérifie que tout est prêt avant de déployer

$ErrorActionPreference = "Continue"

$Errors = 0
$Warnings = 0

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
    $script:Warnings++
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
    $script:Errors++
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║  Vérification Pré-Déploiement Koyeb - Clara Backend  ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

Write-Host "━━━ 1. Vérification de l'environnement ━━━" -ForegroundColor Blue
Write-Host ""

# Vérifier Koyeb CLI
try {
    $koyebVersion = (koyeb version 2>&1 | Select-Object -First 1)
    Write-Success "Koyeb CLI installé : $koyebVersion"
} catch {
    Write-Error-Custom "Koyeb CLI n'est pas installé"
    Write-Info "Installation : curl -fsSL https://raw.githubusercontent.com/koyeb/koyeb-cli/master/install.sh | sh"
}

# Vérifier l'authentification
try {
    $null = koyeb service list 2>&1
    Write-Success "Authentifié sur Koyeb"
} catch {
    Write-Error-Custom "Non authentifié sur Koyeb"
    Write-Info "Exécutez : koyeb login"
}

# Vérifier curl
try {
    $null = Get-Command curl -ErrorAction Stop
    Write-Success "curl installé"
} catch {
    Write-Warning-Custom "curl n'est pas installé (optionnel pour les tests)"
}

Write-Host ""
Write-Host "━━━ 2. Vérification des fichiers ━━━" -ForegroundColor Blue
Write-Host ""

# Vérifier le dossier backend
if (Test-Path "py_backend" -PathType Container) {
    Write-Success "Dossier py_backend trouvé"
} else {
    Write-Error-Custom "Dossier py_backend introuvable"
}

# Vérifier les fichiers requis
$RequiredFiles = @(
    "py_backend/main.py",
    "py_backend/Dockerfile",
    "py_backend/requirements.txt"
)

foreach ($file in $RequiredFiles) {
    if (Test-Path $file) {
        Write-Success "Fichier trouvé : $file"
    } else {
        Write-Error-Custom "Fichier manquant : $file"
    }
}

# Vérifier les scripts de déploiement
if (Test-Path "deploy-koyeb.sh") {
    Write-Success "Script deploy-koyeb.sh trouvé"
} else {
    Write-Warning-Custom "Script deploy-koyeb.sh introuvable"
}

if (Test-Path "deploy-koyeb.ps1") {
    Write-Success "Script deploy-koyeb.ps1 trouvé"
} else {
    Write-Warning-Custom "Script deploy-koyeb.ps1 introuvable"
}

Write-Host ""
Write-Host "━━━ 3. Vérification de la configuration ━━━" -ForegroundColor Blue
Write-Host ""

# Vérifier le fichier .env
if (Test-Path "py_backend/.env") {
    Write-Success "Fichier .env trouvé"
    
    $envContent = Get-Content "py_backend/.env" -Raw
    
    if ($envContent -match "OPENAI_API_KEY") {
        Write-Info "Variable OPENAI_API_KEY définie"
    } else {
        Write-Warning-Custom "Variable OPENAI_API_KEY non définie (optionnel)"
    }
    
    if ($envContent -match "NEO4J_URI") {
        Write-Info "Variable NEO4J_URI définie"
    } else {
        Write-Warning-Custom "Variable NEO4J_URI non définie (optionnel)"
    }
} else {
    Write-Warning-Custom "Fichier .env non trouvé (optionnel)"
    if (Test-Path "py_backend/.env.koyeb.example") {
        Write-Info "Template disponible : py_backend/.env.koyeb.example"
        Write-Info "Copiez-le : Copy-Item py_backend/.env.koyeb.example py_backend/.env"
    }
}

# Vérifier le Dockerfile
if (Test-Path "py_backend/Dockerfile") {
    $dockerfileContent = Get-Content "py_backend/Dockerfile" -Raw
    
    if ($dockerfileContent -match "FROM python") {
        Write-Success "Dockerfile valide (image Python)"
    } else {
        Write-Warning-Custom "Dockerfile ne semble pas utiliser Python"
    }
    
    if ($dockerfileContent -match "EXPOSE 5000") {
        Write-Success "Port 5000 exposé dans le Dockerfile"
    } else {
        Write-Warning-Custom "Port 5000 non exposé dans le Dockerfile"
    }
}

# Vérifier requirements.txt
if (Test-Path "py_backend/requirements.txt") {
    $lineCount = (Get-Content "py_backend/requirements.txt").Count
    Write-Success "requirements.txt contient $lineCount lignes"
    
    $requirementsContent = Get-Content "py_backend/requirements.txt" -Raw
    
    if ($requirementsContent -match "fastapi") {
        Write-Success "FastAPI présent dans requirements.txt"
    } else {
        Write-Error-Custom "FastAPI manquant dans requirements.txt"
    }
    
    if ($requirementsContent -match "uvicorn") {
        Write-Success "Uvicorn présent dans requirements.txt"
    } else {
        Write-Error-Custom "Uvicorn manquant dans requirements.txt"
    }
}

Write-Host ""
Write-Host "━━━ 4. Vérification de la documentation ━━━" -ForegroundColor Blue
Write-Host ""

$Docs = @(
    "GUIDE_DEPLOIEMENT_KOYEB.md",
    "DEMARRAGE_RAPIDE_KOYEB.md",
    "COMMANDES_KOYEB.txt",
    "SYNTHESE_DEPLOIEMENT_KOYEB.md",
    "INDEX_DEPLOIEMENT_KOYEB.md",
    "py_backend/README_KOYEB.md"
)

foreach ($doc in $Docs) {
    if (Test-Path $doc) {
        Write-Success "Documentation : $doc"
    } else {
        Write-Warning-Custom "Documentation manquante : $doc"
    }
}

Write-Host ""
Write-Host "━━━ 5. Estimation de la taille du déploiement ━━━" -ForegroundColor Blue
Write-Host ""

if (Test-Path "py_backend" -PathType Container) {
    $backendSize = (Get-ChildItem -Path "py_backend" -Recurse | Measure-Object -Property Length -Sum).Sum
    $backendSizeMB = [math]::Round($backendSize / 1MB, 2)
    Write-Info "Taille du dossier py_backend : $backendSizeMB MB"
    
    $fileCount = (Get-ChildItem -Path "py_backend" -Recurse -File).Count
    Write-Info "Nombre de fichiers : $fileCount"
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "                    RÉSUMÉ                              " -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

if ($Errors -eq 0 -and $Warnings -eq 0) {
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║  ✅ TOUT EST PRÊT POUR LE DÉPLOIEMENT !              ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "Vous pouvez déployer avec :" -ForegroundColor Green
    Write-Host "  .\deploy-koyeb.ps1 dev" -ForegroundColor Blue
    Write-Host ""
} elseif ($Errors -eq 0) {
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║  ⚠️  PRÊT AVEC $Warnings AVERTISSEMENT(S)                  ║" -ForegroundColor Yellow
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Les avertissements sont généralement optionnels." -ForegroundColor Yellow
    Write-Host "Vous pouvez déployer avec :" -ForegroundColor Green
    Write-Host "  .\deploy-koyeb.ps1 dev" -ForegroundColor Blue
    Write-Host ""
} else {
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║  ❌ $Errors ERREUR(S) DÉTECTÉE(S) - CORRECTION REQUISE    ║" -ForegroundColor Red
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host ""
    Write-Host "Corrigez les erreurs avant de déployer." -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host "━━━ Commandes utiles ━━━" -ForegroundColor Blue
Write-Host ""
Write-Host "Déployer en dev :" -ForegroundColor Yellow
Write-Host "  .\deploy-koyeb.ps1 dev"
Write-Host ""
Write-Host "Déployer en staging :" -ForegroundColor Yellow
Write-Host "  .\deploy-koyeb.ps1 staging"
Write-Host ""
Write-Host "Déployer en production :" -ForegroundColor Yellow
Write-Host "  .\deploy-koyeb.ps1 production"
Write-Host ""
Write-Host "Voir la documentation :" -ForegroundColor Yellow
Write-Host "  Get-Content DEMARRAGE_RAPIDE_KOYEB.md"
Write-Host "  Get-Content GUIDE_DEPLOIEMENT_KOYEB.md"
Write-Host ""

exit 0
