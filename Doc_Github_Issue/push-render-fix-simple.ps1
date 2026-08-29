# Script simple pour push du fix Render
# Date: 17 Avril 2026

Write-Host ""
Write-Host "=== CORRECTION SECRETS ET PUSH RENDER ===" -ForegroundColor Cyan
Write-Host ""

# Supprimer les fichiers sensibles du staging
Write-Host "1. Suppression des fichiers sensibles..." -ForegroundColor Yellow
git rm --cached "Doc cross ref documentaire menu/00_CREDENTIALS_OAUTH_GOOGLE.txt" 2>$null
git rm --cached "Doc cross ref documentaire menu/GUIDE_CONFIGURATION_OAUTH2_GOOGLE_DRIVE.md" 2>$null
git rm --cached "Doc cross ref documentaire menu/GUIDE_IMPORT_WORKFLOW_V2.md" 2>$null

# Amender le commit
Write-Host "2. Amendement du commit..." -ForegroundColor Yellow
git commit --amend --no-edit

# Push forcé
Write-Host "3. Push vers GitHub..." -ForegroundColor Yellow
git push -f origin master

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS! Push reussi!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verifier sur GitHub:" -ForegroundColor Cyan
    Write-Host "https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026" -ForegroundColor White
    Write-Host ""
    Write-Host "Fichiers a verifier:" -ForegroundColor Cyan
    Write-Host "- py_backend/runtime.txt (python-3.11.9)" -ForegroundColor White
    Write-Host "- py_backend/requirements_render.txt (pydantic==2.6.4)" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERREUR lors du push" -ForegroundColor Red
    Write-Host ""
}
