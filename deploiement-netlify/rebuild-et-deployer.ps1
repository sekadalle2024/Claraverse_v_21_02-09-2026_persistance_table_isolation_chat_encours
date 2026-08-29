# Script de rebuild et deploiement rapide
# Sans reinstallation des dependances

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  REBUILD ET DEPLOIEMENT RAPIDE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Obtenir le chemin du projet (parent du dossier deploiement-netlify)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectPath = Split-Path -Parent $scriptPath

Write-Host "Projet: $projectPath" -ForegroundColor Gray
Write-Host ""

# Etape 1: Nettoyage
Write-Host "[1/4] Nettoyage..." -ForegroundColor Yellow

if (Test-Path "$projectPath/dist") {
    Write-Host "  Suppression de dist/..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "$projectPath/dist"
}

if (Test-Path "$projectPath/.netlify") {
    Write-Host "  Suppression de .netlify/..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "$projectPath/.netlify"
}

if (Test-Path "$projectPath/node_modules/.vite") {
    Write-Host "  Suppression du cache Vite..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "$projectPath/node_modules/.vite"
}

Write-Host "  OK Nettoyage termine" -ForegroundColor Green

# Etape 2: Build
Write-Host ""
Write-Host "[2/4] Build complet..." -ForegroundColor Yellow
Write-Host "  Cela peut prendre 2-3 minutes..." -ForegroundColor Gray

Set-Location $projectPath
npm run build
$buildResult = $LASTEXITCODE

if ($buildResult -ne 0) {
    Write-Host "  ERREUR Echec du build" -ForegroundColor Red
    Set-Location $scriptPath
    exit 1
}

Write-Host "  OK Build termine" -ForegroundColor Green

# Etape 3: Verification
Write-Host ""
Write-Host "[3/4] Verification du contenu..." -ForegroundColor Yellow

$distSize = (Get-ChildItem -Path "$projectPath/dist" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
$fileCount = (Get-ChildItem -Path "$projectPath/dist" -Recurse -File -ErrorAction SilentlyContinue).Count

Write-Host "  Taille: $([math]::Round($distSize, 1)) MB" -ForegroundColor Green
Write-Host "  Fichiers: $fileCount" -ForegroundColor Green

if (-not (Test-Path "$projectPath/dist/index.html")) {
    Write-Host "  ERREUR index.html manquant" -ForegroundColor Red
    Set-Location $scriptPath
    exit 1
}

# Etape 4: Deploiement
Write-Host ""
Write-Host "[4/4] Deploiement sur Netlify..." -ForegroundColor Yellow
Write-Host "  Upload en cours 5-8 minutes..." -ForegroundColor Gray

$deployMessage = "Rebuild rapide - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
netlify deploy --prod --dir=dist --message=$deployMessage
$deployResult = $LASTEXITCODE

Set-Location $scriptPath

if ($deployResult -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  DEPLOIEMENT REUSSI !" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Site en ligne: https://prclaravi.netlify.app" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Tous les changements ont ete pris en compte" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ECHEC DU DEPLOIEMENT" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    exit 1
}
