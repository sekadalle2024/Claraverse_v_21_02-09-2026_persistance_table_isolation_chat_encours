# Script simple pour pousser la correction Rust Render
# Date: 17 Avril 2026

Write-Host "=== PUSH CORRECTION RUST RENDER ===" -ForegroundColor Cyan
Write-Host ""

# Se positionner dans py_backend
Write-Host "Changement vers py_backend..." -ForegroundColor Yellow
Set-Location ../py_backend

# Verifier les fichiers
Write-Host ""
Write-Host "Verification des fichiers..." -ForegroundColor Yellow
if (Test-Path runtime.txt) {
    Write-Host "  OK: runtime.txt existe" -ForegroundColor Green
    Get-Content runtime.txt
} else {
    Write-Host "  ERREUR: runtime.txt manquant!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""
if (Test-Path requirements_render.txt) {
    Write-Host "  OK: requirements_render.txt existe" -ForegroundColor Green
    Get-Content requirements_render.txt | Select-String "pydantic"
} else {
    Write-Host "  ERREUR: requirements_render.txt manquant!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Demander confirmation
$confirmation = Read-Host "Pousser ces modifications sur GitHub? (O/N)"

if ($confirmation -ne "O" -and $confirmation -ne "o") {
    Write-Host ""
    Write-Host "Operation annulee." -ForegroundColor Red
    Set-Location ..
    exit 0
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Git add
Write-Host "Git add..." -ForegroundColor Yellow
git add runtime.txt requirements_render.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR lors de git add" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "  OK" -ForegroundColor Green

# Git commit
Write-Host ""
Write-Host "Git commit..." -ForegroundColor Yellow
git commit -m "Fix: Force Python 3.11 and use pre-compiled pydantic wheels for Render"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR lors de git commit" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "  OK" -ForegroundColor Green

# Git push
Write-Host ""
Write-Host "Git push..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERREUR lors de git push" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "SUCCES!" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Yellow
Write-Host "1. Verifier sur GitHub" -ForegroundColor White
Write-Host "2. Render va redeployer automatiquement (5-10 min)" -ForegroundColor White
Write-Host "3. Verifier les logs Render" -ForegroundColor White
Write-Host ""

# Retour au dossier parent
Set-Location ..

Write-Host "Script termine!" -ForegroundColor Green
