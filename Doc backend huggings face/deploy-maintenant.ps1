# Script de deploiement sur Hugging Face Spaces
# Date : 18 Avril 2026

# Configuration
$Token = "[VOTRE_TOKEN_HUGGING_FACE]"
$SpaceName = "claraverse-backend"

# Couleurs
function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput "`n========================================================================" "Cyan"
    Write-ColorOutput "   $Message" "Cyan"
    Write-ColorOutput "========================================================================" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "[OK] $Message" "Green"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "[ERREUR] $Message" "Red"
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "[INFO] $Message" "Blue"
}

# Demander le username
Write-Step "CONFIGURATION DU DEPLOIEMENT"

$Username = Read-Host "Entrez votre nom d'utilisateur Hugging Face"

$SpaceUrl = "https://huggingface.co/spaces/$Username/$SpaceName"
$GitUrl = "https://$Username`:$Token@huggingface.co/spaces/$Username/$SpaceName"

Write-Success "Configuration :"
Write-Info "  Username : $Username"
Write-Info "  Space    : $SpaceName"
Write-Info "  URL      : $SpaceUrl"

# Verifications
Write-Step "VERIFICATIONS"

# Verifier qu'on est dans py_backend
if (-not (Test-Path "main.py")) {
    Write-Error "Ce script doit etre execute depuis le dossier py_backend"
    Write-Info "Changez de dossier avec : cd py_backend"
    exit 1
}
Write-Success "Dossier py_backend detecte"

# Verifier Git
try {
    $gitVersion = git --version
    Write-Success "Git installe : $gitVersion"
} catch {
    Write-Error "Git n'est pas installe"
    exit 1
}

# Initialisation Git
Write-Step "INITIALISATION GIT"

if (-not (Test-Path ".git")) {
    git init
    Write-Success "Repository Git initialise"
} else {
    Write-Info "Repository Git deja initialise"
}

# Configurer le remote
$existingRemote = git remote get-url hf 2>$null
if ($existingRemote) {
    git remote remove hf
}
git remote add hf $GitUrl
Write-Success "Remote Hugging Face configure"

# Commit et Push
Write-Step "DEPLOIEMENT"

Write-Info "Ajout des fichiers..."
git add .

$commitMessage = "Deploy Claraverse backend - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git commit -m $commitMessage
Write-Success "Commit cree"

Write-Info "Push vers Hugging Face en cours..."
Write-Info "Cela peut prendre plusieurs minutes..."

# Detecter la branche actuelle
$currentBranch = git branch --show-current
if (-not $currentBranch) {
    $currentBranch = "master"
}
Write-Info "Branche detectee : $currentBranch"

try {
    git push hf ${currentBranch}:main --force
    Write-Success "Deploiement reussi !"
} catch {
    Write-Error "Erreur lors du push : $_"
    Write-Info "Verifiez que le Space existe sur Hugging Face"
    exit 1
}

# Resume
Write-Step "DEPLOIEMENT TERMINE !"

Write-Success "`nVotre backend est en cours de deploiement !`n"

Write-Info "URL de votre Space :"
Write-Host "   $SpaceUrl" -ForegroundColor Yellow

Write-Info "`nURL de l'API (une fois deploye) :"
Write-Host "   https://$Username-$SpaceName.hf.space" -ForegroundColor Yellow

Write-Info "`nDocumentation API :"
Write-Host "   https://$Username-$SpaceName.hf.space/docs" -ForegroundColor Yellow

Write-Info "`nTemps estime de build : 5-10 minutes"

Write-ColorOutput "`n========================================================================" "Cyan"
