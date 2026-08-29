# ═══════════════════════════════════════════════════════════════════════════════
# 🚀 Script de Déploiement Automatique sur Hugging Face Spaces
# ═══════════════════════════════════════════════════════════════════════════════
# 
# Ce script automatise le déploiement du backend Claraverse sur Hugging Face
# 
# Usage : .\deploy-huggingface.ps1
# 
# ═══════════════════════════════════════════════════════════════════════════════

param(
    [string]$SpaceName = "claraverse-backend",
    [string]$Username = "",
    [string]$Token = "",
    [switch]$Force
)

# Couleurs pour l'affichage
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput "`n═══════════════════════════════════════════════════════════════════════════════" "Cyan"
    Write-ColorOutput "   $Message" "Cyan"
    Write-ColorOutput "═══════════════════════════════════════════════════════════════════════════════" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✅ $Message" "Green"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "❌ $Message" "Red"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠️  $Message" "Yellow"
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "ℹ️  $Message" "Blue"
}

# ═══════════════════════════════════════════════════════════════════════════════
# Vérifications préliminaires
# ═══════════════════════════════════════════════════════════════════════════════

Write-Step "VÉRIFICATIONS PRÉLIMINAIRES"

# Vérifier que nous sommes dans le bon dossier
if (-not (Test-Path "main.py")) {
    Write-Error "Ce script doit être exécuté depuis le dossier py_backend"
    Write-Info "Changez de dossier avec : cd py_backend"
    exit 1
}
Write-Success "Dossier py_backend détecté"

# Vérifier Git
try {
    $gitVersion = git --version
    Write-Success "Git installé : $gitVersion"
} catch {
    Write-Error "Git n'est pas installé"
    Write-Info "Téléchargez Git depuis : https://git-scm.com/downloads"
    exit 1
}

# Vérifier les fichiers essentiels
$requiredFiles = @("Dockerfile", "requirements.txt", "main.py")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Success "Fichier trouvé : $file"
    } else {
        Write-Error "Fichier manquant : $file"
        exit 1
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
# Collecte des informations utilisateur
# ═══════════════════════════════════════════════════════════════════════════════

Write-Step "CONFIGURATION DU DÉPLOIEMENT"

if ([string]::IsNullOrEmpty($Username)) {
    $Username = Read-Host "Entrez votre nom d'utilisateur Hugging Face"
}

if ([string]::IsNullOrEmpty($Token)) {
    Write-Info "Obtenez votre token sur : https://huggingface.co/settings/tokens"
    $Token = Read-Host "Entrez votre token Hugging Face (Write access)" -AsSecureString
    $Token = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Token)
    )
}

$SpaceUrl = "https://huggingface.co/spaces/$Username/$SpaceName"
$GitUrl = "https://$Username`:$Token@huggingface.co/spaces/$Username/$SpaceName"

Write-Success "Configuration :"
Write-Info "  Username : $Username"
Write-Info "  Space    : $SpaceName"
Write-Info "  URL      : $SpaceUrl"

# ═══════════════════════════════════════════════════════════════════════════════
# Création/Mise à jour du README.md
# ═══════════════════════════════════════════════════════════════════════════════

Write-Step "PRÉPARATION DES FICHIERS"

$readmeContent = @"
---
title: Claraverse Backend
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
---

# Claraverse Backend API

Backend FastAPI pour l'application Claraverse - Assistant IA pour l'audit et la comptabilité.

## 🚀 Fonctionnalités

- API REST FastAPI
- Traitement de fichiers Excel (balances comptables)
- Génération d'états financiers SYSCOHADA
- Export de documents (Word, Excel)
- Analyse de données avec Pandas

## 📡 Endpoints Principaux

- ``/health`` - Vérification de l'état du service
- ``/docs`` - Documentation interactive Swagger
- ``/api/pandas/analyze`` - Analyse de données
- ``/api/etats-financiers/generer`` - Génération d'états financiers

## 🔧 Configuration

L'application écoute sur le port 7860 (standard Hugging Face Spaces).

## 📚 Documentation

Déployé automatiquement depuis le repository Claraverse.
"@

Set-Content -Path "README.md" -Value $readmeContent -Encoding UTF8
Write-Success "README.md créé/mis à jour"

# Créer .dockerignore si nécessaire
if (-not (Test-Path ".dockerignore")) {
    $dockerignoreContent = @"
__pycache__/
*.py[cod]
*`$py.class
.Python
env/
venv/
.git/
.gitignore
.vscode/
.idea/
*.log
test_*.py
*_test.py
tests/
Doc*/
doc*/
*.md
!README.md
"@
    Set-Content -Path ".dockerignore" -Value $dockerignoreContent -Encoding UTF8
    Write-Success ".dockerignore créé"
}

# ═══════════════════════════════════════════════════════════════════════════════
# Vérification du Dockerfile
# ═══════════════════════════════════════════════════════════════════════════════

Write-Step "VÉRIFICATION DU DOCKERFILE"

$dockerfileContent = Get-Content "Dockerfile" -Raw

# Vérifier le port 7860
if ($dockerfileContent -match "EXPOSE\s+7860" -or $dockerfileContent -match "PORT.*7860") {
    Write-Success "Port 7860 configuré (requis pour Hugging Face)"
} else {
    Write-Warning "Le Dockerfile ne semble pas exposer le port 7860"
    Write-Info "Hugging Face Spaces nécessite le port 7860"
    
    $updateDockerfile = Read-Host "Voulez-vous que je mette à jour le Dockerfile ? (O/N)"
    if ($updateDockerfile -eq "O" -or $updateDockerfile -eq "o") {
        # Backup du Dockerfile original
        Copy-Item "Dockerfile" "Dockerfile.backup"
        Write-Success "Backup créé : Dockerfile.backup"
        
        # Mise à jour du Dockerfile
        $dockerfileContent = $dockerfileContent -replace "EXPOSE\s+\d+", "EXPOSE 7860"
        $dockerfileContent = $dockerfileContent -replace "PORT=\d+", "PORT=7860"
        $dockerfileContent = $dockerfileContent -replace "--port\s+\d+", "--port 7860"
        
        Set-Content -Path "Dockerfile" -Value $dockerfileContent -Encoding UTF8
        Write-Success "Dockerfile mis à jour pour le port 7860"
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
# Initialisation Git
# ═══════════════════════════════════════════════════════════════════════════════

Write-Step "INITIALISATION GIT"

# Vérifier si Git est déjà initialisé
if (-not (Test-Path ".git")) {
    git init
    Write-Success "Repository Git initialisé"
} else {
    Write-Info "Repository Git déjà initialisé"
}

# Configurer le remote Hugging Face
$existingRemote = git remote get-url hf 2>$null
if ($existingRemote) {
    if ($Force) {
        git remote remove hf
        git remote add hf $GitUrl
        Write-Success "Remote Hugging Face mis à jour"
    } else {
        Write-Info "Remote Hugging Face déjà configuré"
    }
} else {
    git remote add hf $GitUrl
    Write-Success "Remote Hugging Face ajouté"
}

# ═══════════════════════════════════════════════════════════════════════════════
# Préparation du commit
# ═══════════════════════════════════════════════════════════════════════════════

Write-Step "PRÉPARATION DU COMMIT"

# Afficher les fichiers qui seront ajoutés
Write-Info "Fichiers à déployer :"
git add .
$status = git status --short
$status | ForEach-Object { Write-Host "  $_" }

$fileCount = ($status | Measure-Object).Count
Write-Info "Total : $fileCount fichiers"

# Demander confirmation
Write-Warning "`nATTENTION : Vous êtes sur le point de déployer sur Hugging Face"
$confirm = Read-Host "Continuer ? (O/N)"

if ($confirm -ne "O" -and $confirm -ne "o") {
    Write-Info "Déploiement annulé"
    exit 0
}

# ═══════════════════════════════════════════════════════════════════════════════
# Commit et Push
# ═══════════════════════════════════════════════════════════════════════════════

Write-Step "DÉPLOIEMENT SUR HUGGING FACE"

try {
    # Créer le commit
    $commitMessage = "Deploy Claraverse backend - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git commit -m $commitMessage
    Write-Success "Commit créé : $commitMessage"
    
    # Push vers Hugging Face
    Write-Info "Push en cours vers Hugging Face..."
    Write-Warning "Cela peut prendre plusieurs minutes..."
    
    git push hf main --force
    
    Write-Success "Déploiement réussi !"
    
} catch {
    Write-Error "Erreur lors du déploiement : $_"
    Write-Info "Vérifiez vos credentials et réessayez"
    exit 1
}

# ═══════════════════════════════════════════════════════════════════════════════
# Résumé et prochaines étapes
# ═══════════════════════════════════════════════════════════════════════════════

Write-Step "DÉPLOIEMENT TERMINÉ !"

Write-Success "`n🎉 Votre backend est en cours de déploiement sur Hugging Face !`n"

Write-Info "📍 URL de votre Space :"
Write-Host "   $SpaceUrl" -ForegroundColor Yellow

Write-Info "`n📊 Suivre le build :"
Write-Host "   $SpaceUrl (onglet 'Logs')" -ForegroundColor Yellow

Write-Info "`n🔗 URL de l'API (une fois déployé) :"
Write-Host "   https://$Username-$SpaceName.hf.space" -ForegroundColor Yellow

Write-Info "`n📚 Documentation API :"
Write-Host "   https://$Username-$SpaceName.hf.space/docs" -ForegroundColor Yellow

Write-Info "`n⏱️  Temps estimé de build : 5-10 minutes"

Write-Info "`n📋 Prochaines étapes :"
Write-Host "   1. Ouvrir $SpaceUrl" -ForegroundColor White
Write-Host "   2. Vérifier les logs de build" -ForegroundColor White
Write-Host "   3. Attendre que le statut passe à 'Running'" -ForegroundColor White
Write-Host "   4. Tester l'endpoint /health" -ForegroundColor White
Write-Host "   5. Mettre à jour le frontend avec la nouvelle URL" -ForegroundColor White

Write-ColorOutput "`n═══════════════════════════════════════════════════════════════════════════════" "Cyan"
