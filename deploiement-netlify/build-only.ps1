# Script de build uniquement - ClaraVerse
# Ce script effectue seulement le build sans déploiement

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BUILD UNIQUEMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Fonction pour afficher les erreurs
function Show-Error {
    param([string]$ErrorMessage)
    Write-Host "ERREUR: $ErrorMessage" -ForegroundColor Red
    exit 1
}

# Étape 1: Vérifications
Write-Host "[1/3] Verifications..." -ForegroundColor Yellow

# Vérifier Node.js
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Show-Error "Node.js non installe"
}
Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green

# Vérifier que package.json existe
if (-not (Test-Path "../package.json")) {
    Show-Error "package.json non trouve dans le repertoire parent"
}
Write-Host "  package.json: OK" -ForegroundColor Green

# Étape 2: Nettoyage
Write-Host ""
Write-Host "[2/3] Nettoyage..." -ForegroundColor Yellow
if (Test-Path "../dist") {
    Remove-Item -Recurse -Force "../dist"
    Write-Host "  Ancien dossier dist supprime" -ForegroundColor Green
} else {
    Write-Host "  Aucun ancien build a nettoyer" -ForegroundColor Gray
}

# Étape 3: Build
Write-Host ""
Write-Host "[3/3] Build de production..." -ForegroundColor Yellow
Write-Host "  Cela peut prendre 2-3 minutes..." -ForegroundColor Gray

$startTime = Get-Date
Set-Location ".."
npm run build
$buildResult = $LASTEXITCODE
Set-Location "deploiement-netlify"
$endTime = Get-Date
$buildDuration = $endTime - $startTime

if ($buildResult -eq 0) {
    # Vérifier que le dossier dist a été créé
    if (-not (Test-Path "../dist")) {
        Show-Error "Dossier dist non cree apres le build"
    }
    
    $distSize = (Get-ChildItem -Path "../dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    $fileCount = (Get-ChildItem -Path "../dist" -Recurse -File).Count
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  BUILD REUSSI !" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Statistiques du build:" -ForegroundColor Cyan
    Write-Host "  Duree: $($buildDuration.Minutes)m $($buildDuration.Seconds)s" -ForegroundColor White
    Write-Host "  Taille: $([math]::Round($distSize, 1)) MB" -ForegroundColor White
    Write-Host "  Fichiers: $fileCount" -ForegroundColor White
    Write-Host "  Dossier: ../dist/" -ForegroundColor White
    Write-Host ""
    Write-Host "Prochaines etapes:" -ForegroundColor Yellow
    Write-Host "1. Tester localement: npm run preview" -ForegroundColor White
    Write-Host "2. Deployer: .\deploy-rapide.ps1" -ForegroundColor White
    
    # Enregistrer dans l'historique
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] Build reussi - Duree: $($buildDuration.Minutes)m $($buildDuration.Seconds)s - Taille: $([math]::Round($distSize, 1)) MB"
    Add-Content -Path "HISTORIQUE_DEPLOIEMENTS.md" -Value $logEntry
    
} else {
    Show-Error "Echec du build. Verifiez les erreurs ci-dessus"
}