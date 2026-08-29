# Script de vérification rapide avant déploiement
# Vérifie que tout est prêt pour le déploiement rapide

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERIFICATION AVANT DEPLOIEMENT RAPIDE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allOk = $true

# 1. Vérifier Netlify CLI
Write-Host "[1/5] Netlify CLI..." -ForegroundColor Yellow
netlify --version >$null 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Netlify CLI installé" -ForegroundColor Green
} else {
    Write-Host "  ✗ Netlify CLI non installé" -ForegroundColor Red
    Write-Host "    Installez avec: npm install -g netlify-cli" -ForegroundColor Yellow
    $allOk = $false
}

# 2. Vérifier l'authentification
Write-Host ""
Write-Host "[2/5] Authentification Netlify..." -ForegroundColor Yellow
netlify status >$null 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Authentification OK" -ForegroundColor Green
} else {
    Write-Host "  ✗ Non authentifié" -ForegroundColor Red
    Write-Host "    Authentifiez avec: netlify login" -ForegroundColor Yellow
    $allOk = $false
}

# 3. Vérifier le dossier dist
Write-Host ""
Write-Host "[3/5] Dossier dist..." -ForegroundColor Yellow
if (Test-Path "../dist") {
    $distSize = (Get-ChildItem -Path "../dist" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
    if ($distSize -gt 0) {
        Write-Host "  ✓ Dossier dist trouvé - Taille: $([math]::Round($distSize, 1)) MB" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Dossier dist vide" -ForegroundColor Red
        Write-Host "    Exécutez: npm run build" -ForegroundColor Yellow
        $allOk = $false
    }
} else {
    Write-Host "  ✗ Dossier dist non trouvé" -ForegroundColor Red
    Write-Host "    Exécutez: npm run build" -ForegroundColor Yellow
    $allOk = $false
}

# 4. Vérifier les fichiers essentiels
Write-Host ""
Write-Host "[4/5] Fichiers essentiels..." -ForegroundColor Yellow
$essentialOk = $true
if (-not (Test-Path "../dist/index.html")) {
    Write-Host "  ✗ index.html manquant" -ForegroundColor Red
    $essentialOk = $false
}
if (-not (Test-Path "../dist/assets")) {
    Write-Host "  ✗ Dossier assets manquant" -ForegroundColor Red
    $essentialOk = $false
}
if ($essentialOk) {
    Write-Host "  ✓ Tous les fichiers essentiels présents" -ForegroundColor Green
} else {
    $allOk = $false
}

# 5. Vérifier la configuration Netlify
Write-Host ""
Write-Host "[5/5] Configuration Netlify..." -ForegroundColor Yellow
if (Test-Path "../netlify.toml") {
    Write-Host "  ✓ netlify.toml trouvé" -ForegroundColor Green
} else {
    Write-Host "  ✗ netlify.toml manquant" -ForegroundColor Red
    $allOk = $false
}

# Résumé
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($allOk) {
    Write-Host "  ✓ TOUT EST PRET POUR LE DEPLOIEMENT" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Vous pouvez maintenant exécuter:" -ForegroundColor Yellow
    Write-Host "  .\deploy-rapide.ps1" -ForegroundColor Cyan
    Write-Host ""
    exit 0
} else {
    Write-Host "  ✗ PROBLEMES DETECTES" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Veuillez corriger les problèmes ci-dessus avant de déployer" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
