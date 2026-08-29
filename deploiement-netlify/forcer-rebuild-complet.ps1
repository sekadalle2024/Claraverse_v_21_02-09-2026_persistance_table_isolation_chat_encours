# Script de rebuild complet pour forcer la prise en compte de tous les changements
# Ce script nettoie tout et reconstruit depuis zero

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  REBUILD COMPLET - FORCE REFRESH" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Etape 1: Nettoyage complet
Write-Host "[1/6] Nettoyage complet..." -ForegroundColor Yellow

# Supprimer dist/
if (Test-Path "../dist") {
    Write-Host "  Suppression de dist/..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "../dist"
}

# Supprimer .netlify/
if (Test-Path "../.netlify") {
    Write-Host "  Suppression de .netlify/..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "../.netlify"
}

# Supprimer node_modules/.vite/
if (Test-Path "../node_modules/.vite") {
    Write-Host "  Suppression du cache Vite..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "../node_modules/.vite"
}

Write-Host "  OK Nettoyage termine" -ForegroundColor Green

# Etape 2: Verifier Node.js
Write-Host ""
Write-Host "[2/6] Verification de Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  ERREUR Node.js non installe" -ForegroundColor Red
    exit 1
}

# Etape 3: Reinstaller les dependances
Write-Host ""
Write-Host "[3/6] Reinstallation des dependances..." -ForegroundColor Yellow
Write-Host "  Cela peut prendre 2-3 minutes..." -ForegroundColor Gray

Push-Location ".."
npm install --legacy-peer-deps
$installResult = $LASTEXITCODE
Pop-Location

if ($installResult -ne 0) {
    Write-Host "  ERREUR Echec de l'installation des dependances" -ForegroundColor Red
    exit 1
}

Write-Host "  OK Dependances installees" -ForegroundColor Green

# Etape 4: Build complet
Write-Host ""
Write-Host "[4/6] Build complet..." -ForegroundColor Yellow
Write-Host "  Cela peut prendre 2-3 minutes..." -ForegroundColor Gray

Push-Location ".."
npm run build
$buildResult = $LASTEXITCODE
Pop-Location

if ($buildResult -ne 0) {
    Write-Host "  ERREUR Echec du build" -ForegroundColor Red
    exit 1
}

Write-Host "  OK Build termine" -ForegroundColor Green

# Etape 5: Verifier le contenu de dist/
Write-Host ""
Write-Host "[5/6] Verification du contenu de dist/..." -ForegroundColor Yellow

$distSize = (Get-ChildItem -Path "../dist" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
$fileCount = (Get-ChildItem -Path "../dist" -Recurse -File -ErrorAction SilentlyContinue).Count

Write-Host "  Taille: $([math]::Round($distSize, 1)) MB" -ForegroundColor Green
Write-Host "  Fichiers: $fileCount" -ForegroundColor Green

# Verifier les fichiers essentiels
$essentialFiles = @(
    "../dist/index.html",
    "../dist/assets"
)

$allOk = $true
foreach ($file in $essentialFiles) {
    if (Test-Path $file) {
        Write-Host "  OK $file" -ForegroundColor Green
    } else {
        Write-Host "  ERREUR $file manquant" -ForegroundColor Red
        $allOk = $false
    }
}

if (-not $allOk) {
    Write-Host ""
    Write-Host "  ERREUR Fichiers essentiels manquants" -ForegroundColor Red
    exit 1
}

# Etape 6: Deploiement
Write-Host ""
Write-Host "[6/6] Deploiement sur Netlify..." -ForegroundColor Yellow
Write-Host "  Upload en cours 5-8 minutes..." -ForegroundColor Gray

Push-Location ".."
$deployMessage = "Rebuild complet - Force refresh $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
netlify deploy --prod --dir=dist --message=$deployMessage
$deployResult = $LASTEXITCODE
Pop-Location

if ($deployResult -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  REBUILD ET DEPLOIEMENT REUSSIS !" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Site en ligne: https://prclaravi.netlify.app" -ForegroundColor Cyan
    Write-Host "Dashboard: https://app.netlify.com/projects/prclaravi" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Tous les changements ont ete pris en compte" -ForegroundColor Yellow
    Write-Host ""
    
    # Enregistrer dans l'historique
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] Rebuild complet - Force refresh - Taille: $([math]::Round($distSize, 1)) MB"
    Add-Content -Path "HISTORIQUE_DEPLOIEMENTS.md" -Value $logEntry
    
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ECHEC DU DEPLOIEMENT" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Consultez MEMO_PROBLEMES_SOLUTIONS.md" -ForegroundColor Yellow
    exit 1
}
