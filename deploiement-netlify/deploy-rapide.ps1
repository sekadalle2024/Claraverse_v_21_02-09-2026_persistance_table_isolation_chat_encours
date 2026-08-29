# Script de déploiement rapide Netlify - ClaraVerse
# Ce script déploie le dossier dist/ existant sans refaire le build

param(
    [string]$Message = "Deploiement rapide $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOIEMENT RAPIDE NETLIFY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Fonction pour afficher les erreurs
function Show-Error {
    param([string]$ErrorMessage)
    Write-Host "ERREUR: $ErrorMessage" -ForegroundColor Red
    Write-Host "Consultez MEMO_PROBLEMES_SOLUTIONS.md pour les solutions" -ForegroundColor Yellow
    exit 1
}

# Étape 1: Vérifications
Write-Host "[1/3] Verifications..." -ForegroundColor Yellow

# Vérifier Netlify CLI
netlify --version >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Show-Error "Netlify CLI non installe. Executez: npm install -g netlify-cli"
}

# Vérifier l'authentification
netlify status >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Show-Error "Non authentifie sur Netlify. Executez: netlify login"
}

# Vérifier que le dossier dist existe
if (-not (Test-Path "../dist")) {
    Show-Error "Dossier dist non trouve. Executez d'abord: npm run build"
}

# Vérifier que dist contient des fichiers
$distFiles = Get-ChildItem -Path "../dist" -Recurse
if ($distFiles.Count -eq 0) {
    Show-Error "Dossier dist vide. Executez d'abord: npm run build"
}

$distSize = (Get-ChildItem -Path "../dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "  Dossier dist trouve - Taille: $([math]::Round($distSize, 1)) MB" -ForegroundColor Green
Write-Host "  Authentification: OK" -ForegroundColor Green

# Étape 2: Vérifications du contenu
Write-Host ""
Write-Host "[2/3] Verification du contenu..." -ForegroundColor Yellow

# Vérifier les fichiers essentiels
$essentialFiles = @("../dist/index.html")
foreach ($file in $essentialFiles) {
    if (-not (Test-Path $file)) {
        Show-Error "Fichier essentiel manquant: $file"
    }
}

# Vérifier le dossier assets
if (-not (Test-Path "../dist/assets")) {
    Show-Error "Dossier assets manquant dans dist/"
}

Write-Host "  Fichiers essentiels: OK" -ForegroundColor Green

# Étape 3: Déploiement
Write-Host ""
Write-Host "[3/3] Deploiement sur Netlify..." -ForegroundColor Yellow
Write-Host "  Upload en cours (3-5 minutes)..." -ForegroundColor Gray

Set-Location ".."
netlify deploy --prod --dir=dist --message="$Message"
$deployResult = $LASTEXITCODE
Set-Location "deploiement-netlify"

if ($deployResult -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  DEPLOIEMENT RAPIDE REUSSI !" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Site en ligne: https://prclaravi.netlify.app" -ForegroundColor Cyan
    Write-Host "Dashboard: https://app.netlify.com/projects/prclaravi" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Temps gagne en utilisant le build existant !" -ForegroundColor Yellow
    
    # Enregistrer dans l'historique
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] Deploiement rapide reussi - $Message - Taille: $([math]::Round($distSize, 1)) MB"
    Add-Content -Path "HISTORIQUE_DEPLOIEMENTS.md" -Value $logEntry
    
} else {
    Show-Error "Echec du deploiement rapide. Verifiez les logs ci-dessus"
}