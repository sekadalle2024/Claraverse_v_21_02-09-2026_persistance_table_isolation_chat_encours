# Script de déploiement complet Netlify - ClaraVerse
# Ce script effectue le build et le déploiement sur Netlify
# Déploiement automatique vers le projet: prclaravi

param(
    [string]$Message = "Mise a jour $(Get-Date -Format 'yyyy-MM-dd HH:mm')",
    [string]$SiteId = "0cafe68b-1d02-42c0-a757-5ce59fb99d42"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOIEMENT COMPLET NETLIFY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Fonction pour afficher les erreurs
function Show-Error {
    param([string]$ErrorMessage)
    Write-Host "ERREUR: $ErrorMessage" -ForegroundColor Red
    Write-Host "Consultez MEMO_PROBLEMES_SOLUTIONS.md pour les solutions" -ForegroundColor Yellow
    exit 1
}

# Étape 1: Vérifications préliminaires
Write-Host "[1/5] Verifications preliminaires..." -ForegroundColor Yellow

# Vérifier Node.js
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Show-Error "Node.js non installe"
}
Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green

# Vérifier Netlify CLI
$netlifyVersion = netlify --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Show-Error "Netlify CLI non installe. Executez: npm install -g netlify-cli"
}
Write-Host "  Netlify CLI: $netlifyVersion" -ForegroundColor Green

# Vérifier l'authentification
netlify status >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Show-Error "Non authentifie sur Netlify. Executez: netlify login"
}
Write-Host "  Authentification: OK" -ForegroundColor Green

# Étape 2: Nettoyage
Write-Host ""
Write-Host "[2/5] Nettoyage..." -ForegroundColor Yellow
if (Test-Path "../dist") {
    Remove-Item -Recurse -Force "../dist"
    Write-Host "  Ancien dossier dist supprime" -ForegroundColor Green
}

# Étape 3: Build
Write-Host ""
Write-Host "[3/5] Build de production..." -ForegroundColor Yellow
Write-Host "  Cela peut prendre 2-3 minutes..." -ForegroundColor Gray

Set-Location ".."
npm run build
$buildResult = $LASTEXITCODE
Set-Location "deploiement-netlify"

if ($buildResult -ne 0) {
    Show-Error "Echec du build. Verifiez les erreurs ci-dessus"
}

# Vérifier que le dossier dist a été créé
if (-not (Test-Path "../dist")) {
    Show-Error "Dossier dist non cree apres le build"
}

$distSize = (Get-ChildItem -Path "../dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "  Build reussi - Taille: $([math]::Round($distSize, 1)) MB" -ForegroundColor Green

# Étape 4: Vérifications post-build
Write-Host ""
Write-Host "[4/5] Verifications post-build..." -ForegroundColor Yellow

# Vérifier les fichiers essentiels
$essentialFiles = @("../dist/index.html", "../dist/assets")
foreach ($file in $essentialFiles) {
    if (-not (Test-Path $file)) {
        Show-Error "Fichier essentiel manquant: $file"
    }
}
Write-Host "  Fichiers essentiels: OK" -ForegroundColor Green

# Étape 5: Déploiement
Write-Host ""
Write-Host "[5/5] Deploiement sur Netlify..." -ForegroundColor Yellow
Write-Host "  Projet cible: $SiteId" -ForegroundColor Cyan
Write-Host "  Upload en cours (5-8 minutes)..." -ForegroundColor Gray

# Déploiement avec le site ID explicite (pas d'interaction requise)
Set-Location ".."
netlify deploy --prod --dir=dist --site=$SiteId --message="$Message"
$deployResult = $LASTEXITCODE
Set-Location "deploiement-netlify"

if ($deployResult -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  DEPLOIEMENT REUSSI !" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Site en ligne: https://prclaravi.netlify.app" -ForegroundColor Cyan
    Write-Host "Dashboard: https://app.netlify.com/projects/prclaravi" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Prochaines etapes:" -ForegroundColor Yellow
    Write-Host "1. Tester le site en production" -ForegroundColor White
    Write-Host "2. Verifier les nouvelles fonctionnalites" -ForegroundColor White
    Write-Host "3. Mettre a jour HISTORIQUE_DEPLOIEMENTS.md" -ForegroundColor White
    
    # Enregistrer dans l'historique
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] Deploiement reussi - $Message - Taille: $([math]::Round($distSize, 1)) MB"
    Add-Content -Path "HISTORIQUE_DEPLOIEMENTS.md" -Value $logEntry
    
} else {
    Show-Error "Echec du deploiement. Verifiez les logs ci-dessus"
}