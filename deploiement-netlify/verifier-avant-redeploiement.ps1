# Script de verification avant redeploiement - Netlify

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERIFICATION AVANT REDEPLOIEMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allOK = $true

# 1. Verifier Node.js
Write-Host "[1/6] Verification Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK Node.js: $nodeVersion" -ForegroundColor Green
}
else {
    Write-Host "  ERREUR: Node.js non installe" -ForegroundColor Red
    $allOK = $false
}

# 2. Verifier npm
Write-Host ""
Write-Host "[2/6] Verification npm..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK npm: $npmVersion" -ForegroundColor Green
}
else {
    Write-Host "  ERREUR: npm non installe" -ForegroundColor Red
    $allOK = $false
}

# 3. Verifier Netlify CLI
Write-Host ""
Write-Host "[3/6] Verification Netlify CLI..." -ForegroundColor Yellow
$netlifyVersion = netlify --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK Netlify CLI: $netlifyVersion" -ForegroundColor Green
}
else {
    Write-Host "  ERREUR: Netlify CLI non installe" -ForegroundColor Red
    Write-Host "  Installer avec: npm install -g netlify-cli" -ForegroundColor Yellow
    $allOK = $false
}

# 4. Verifier l'authentification Netlify
Write-Host ""
Write-Host "[4/6] Verification authentification Netlify..." -ForegroundColor Yellow
netlify status >$null 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK Authentification: OK" -ForegroundColor Green
}
else {
    Write-Host "  ERREUR: Non authentifie sur Netlify" -ForegroundColor Red
    Write-Host "  Executer: netlify login" -ForegroundColor Yellow
    $allOK = $false
}

# 5. Verifier les fichiers essentiels
Write-Host ""
Write-Host "[5/6] Verification fichiers essentiels..." -ForegroundColor Yellow
$essentialFiles = @("../package.json", "../netlify.toml", "../vite.config.ts", "../src/main.tsx")

foreach ($file in $essentialFiles) {
    if (Test-Path $file) {
        Write-Host "  OK $file" -ForegroundColor Green
    }
    else {
        Write-Host "  ERREUR: $file manquant" -ForegroundColor Red
        $allOK = $false
    }
}

# 6. Verifier l'espace disque
Write-Host ""
Write-Host "[6/6] Verification espace disque..." -ForegroundColor Yellow
$drive = Get-PSDrive -Name H
if ($drive.Free -gt 5GB) {
    $freeGB = [math]::Round($drive.Free / 1GB, 1)
    Write-Host "  OK Espace disque: $freeGB GB disponible" -ForegroundColor Green
}
else {
    Write-Host "  ATTENTION: Espace disque faible" -ForegroundColor Yellow
    $allOK = $false
}

# Resume
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($allOK) {
    Write-Host "  OK TOUT EST PRET POUR LE REDEPLOIEMENT" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaine etape:" -ForegroundColor Yellow
    Write-Host "  .\deploy.ps1 -Message 'Mise a jour - 27 Mars 2026'" -ForegroundColor Cyan
}
else {
    Write-Host "  ERREUR: PROBLEMES DETECTES" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Veuillez corriger les problemes ci-dessus avant de continuer" -ForegroundColor Yellow
    exit 1
}
